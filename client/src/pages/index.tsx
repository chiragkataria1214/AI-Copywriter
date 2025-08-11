import React, { useEffect, useMemo } from 'react';
import { toast } from '@/hooks/utils/useToast';
import { useAuth } from '@/hooks/auth/useAuth';
import { Tabs } from '@/components/ui/tabs';
import { GenerationDetailsModal } from '@/components/common';
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_PERSONA_KEY, DEFAULT_USE_JONES_BRAND_GUIDE, DEFAULT_CONTENT_TYPE, DEFAULT_SOCIAL_PLATFORM, DEFAULT_SOCIAL_GOAL, DEFAULT_TONE, DEFAULT_VARIATIONS, DEFAULT_SEQUENCE_TYPE, DEFAULT_STORY_LENGTH, DEFAULT_RETENTION_PLATFORM, DEFAULT_RETENTION_EMAIL_TYPE } from '@shared/constants';
import { Header, MainTabs } from '@/components/main';
import { GenerationMetadata } from "@/components/main/shared/types";

// Import optimized components and hooks
import { MetaAdGeneratorProvider, useAppContext } from '@/contexts/AppContext';
import { useUIState } from '@/hooks/state/useUIState';
import { useFormState } from '@/hooks/state/useFormState';
import { useContentRevision } from '@/hooks/generation/useContentRevision';
import { useGeneration } from '@/hooks/generation/useGeneration';
import { 
  MemoizedPaidSocialTab,
  MemoizedOrganicSocialTab,
  MemoizedLandingPageTab,
  MemoizedCustomCopyTab,
  MemoizedRetentionTab,
  MemoizedProductLaunchTab,
  MemoizedAISettingsTab
} from '@/components/main/optimized/MemoizedTabs';

// Separate component for the revision panel to reduce re-renders
const RevisionPanel = React.memo(({ 
  showRevisionPanel, 
  revisionInstructions, 
  setRevisionInstructions,
  cancelRevision,
  applyRevision,
  reviseContentMutation 
}: any) => {
  // Component implementation from previous version
  return null; // Placeholder - would include the full implementation
});

// Separate component for admin key dialog
const AdminKeyDialog = React.memo(({ 
  showAdminKeyPrompt, 
  adminKeyInput, 
  setAdminKeyInput, 
  verifyAdminKey, 
  closeAdminKeyPrompt,
  onSuccessCallback
}: any) => {
  if (!showAdminKeyPrompt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput.trim()) {
      await verifyAdminKey(adminKeyInput, onSuccessCallback);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeAdminKeyPrompt();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Access Required</h2>
          <button
            onClick={closeAdminKeyPrompt}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Please enter the admin key to access AI training settings.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Key
            </label>
            <input
              id="adminKey"
              type="password"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter admin key..."
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAdminKeyPrompt}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!adminKeyInput.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Main component logic extracted into a separate component
const MetaAdGeneratorContent: React.FC = () => {
  // Use context to avoid prop drilling
  const { 
    configData, 
    adminAccess, 
    validation, 
    trainingConfig,
    getBrandDrLabel,
    getWordCount
  } = useAppContext();

  // Use optimized UI state management
  const {
    uiState,
    setActiveTab,
    setPaidSocialSubTab,
    setProductLaunchSubTab,
    setOrganicSocialType,
    setShowGenerationDetails,
    setCopiedWithTimeout
  } = useUIState();

  // File upload states (can't be in form state as File objects aren't serializable)
  const [organicVideoFile, setOrganicVideoFile] = React.useState<File | null>(null);
  const [organicImageFile, setOrganicImageFile] = React.useState<File | null>(null);
  const [storyVideoFile, setStoryVideoFile] = React.useState<File | null>(null);
  const [storyImageFile, setStoryImageFile] = React.useState<File | null>(null);

  // Use optimized form state management
  const initialFormState = {
    transcription: '',
    airLink: '',
    uploadedImage: '',
    customBrief: '',
    persona: DEFAULT_PERSONA_KEY, 
    targetAudience: '',
    landingPageUrl: '',
    selectedProduct: '',
    selectedProducts: [] as string[],
    useJonesBrandGuide: DEFAULT_USE_JONES_BRAND_GUIDE,
    brandDrBalance: [DEFAULT_BRAND_DR_BALANCE],
    enableInfluencerMode: false,
    influencerHandle: '',
    voiceAnalysisMethod: 'combined',
    influencerBrandBalance: [DEFAULT_BRAND_DR_BALANCE],
    contentType: 'video',
    organicContentType: DEFAULT_CONTENT_TYPE,
    organicPlatform: DEFAULT_SOCIAL_PLATFORM,
    organicGoal: DEFAULT_SOCIAL_GOAL,
    organicTone: DEFAULT_TONE,
    captionVariations: DEFAULT_VARIATIONS,
    // Add missing organic social fields
    organicVideoTranscription: '',
    organicImagePreview: '',
    organicSelectedProducts: [] as string[],
    generatedCaptions: [] as string[],
    storyContentType: DEFAULT_CONTENT_TYPE,
    storySequenceType: DEFAULT_SEQUENCE_TYPE,
    storyLength: DEFAULT_STORY_LENGTH,
    storyTone: DEFAULT_TONE,
    // Add missing story fields
    storyVideoTranscription: '',
    storyImagePreview: '',
    storySelectedProducts: [] as string[],
    generatedStorySequence: [] as Array<{
      slide: number;
      type: string;
      title: string;
      content: string;
      visualDirection: string;
    }>,
    landingPageType: 'listicle',
    useAdsForLanding: false,
    productBrief: '',
    mainAngle: '',
    customRequest: '',
    retentionKeyMessage: '',
    retentionPlatform: DEFAULT_RETENTION_PLATFORM,
    retentionEmailType: DEFAULT_RETENTION_EMAIL_TYPE,
    retentionSelectedProducts: [] as string[],
    retentionAudience: 'General audience',
    retentionGoal: 'Drive Sales',
    retentionContentLength: 'Short',
    retentionKeywordsToInclude: [] as string[],
    retentionWordsToAvoid: [] as string[],
    // Static ad specific properties
    staticAdImage: '',
    staticAdImagePreview: '',
    staticAdAnalysis: ''
  };

  const { formState, handleInputChange, handleFormChange } = useFormState(initialFormState);

  // Memoized callbacks for Organic Social Tab to prevent re-renders
  const setOrganicContentType = React.useCallback(handleInputChange('organicContentType'), [handleInputChange]);
  const setOrganicVideoTranscription = React.useCallback(handleInputChange('organicVideoTranscription'), [handleInputChange]);
  const setOrganicImagePreview = React.useCallback(handleInputChange('organicImagePreview'), [handleInputChange]);
  const setOrganicPlatform = React.useCallback(handleInputChange('organicPlatform'), [handleInputChange]);
  const setOrganicGoal = React.useCallback(handleInputChange('organicGoal'), [handleInputChange]);
  const setOrganicTone = React.useCallback(handleInputChange('organicTone'), [handleInputChange]);
  const setGeneratedCaptions = React.useCallback(handleInputChange('generatedCaptions'), [handleInputChange]);
  const setCaptionVariations = React.useCallback(handleInputChange('captionVariations'), [handleInputChange]);
  const setStoryContentType = React.useCallback(handleInputChange('storyContentType'), [handleInputChange]);
  const setStoryVideoTranscription = React.useCallback(handleInputChange('storyVideoTranscription'), [handleInputChange]);
  const setStoryImagePreview = React.useCallback(handleInputChange('storyImagePreview'), [handleInputChange]);
  const setStorySequenceType = React.useCallback(handleInputChange('storySequenceType'), [handleInputChange]);
  const setStoryLength = React.useCallback(handleInputChange('storyLength'), [handleInputChange]);
  const setStoryTone = React.useCallback(handleInputChange('storyTone'), [handleInputChange]);
  const setGeneratedStorySequence = React.useCallback(handleInputChange('generatedStorySequence'), [handleInputChange]);
  const setOrganicSelectedProducts = React.useCallback(handleInputChange('organicSelectedProducts'), [handleInputChange]);
  const setStorySelectedProducts = React.useCallback(handleInputChange('storySelectedProducts'), [handleInputChange]);
  const setPersona = React.useCallback(handleInputChange('persona'), [handleInputChange]);

  // Generation Details Modal state
  const [currentGenerationMetadata, setCurrentGenerationMetadata] = React.useState<GenerationMetadata | null>(null);

  // Generated content states
  const [generatedCustomResponse, setGeneratedCustomResponse] = React.useState('');
  const [generatedLandingCopy, setGeneratedLandingCopy] = React.useState<any>({});
  const [landingPageAnalysis, setLandingPageAnalysis] = React.useState<any>(null);
  const [generatedRetentionCopy, setGeneratedRetentionCopy] = React.useState<any>('');
  const [strategicInsights, setStrategicInsights] = React.useState<Record<string, any> | null>(null);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = React.useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = React.useState(false);
  
  // Debug info states
  const [staticAdDebugInfo, setStaticAdDebugInfo] = React.useState<any>(null);
  const [customRequestDebugInfo, setCustomRequestDebugInfo] = React.useState<any>(null);
  const [landingPageDebugInfo, setLandingPageDebugInfo] = React.useState<any>(null);
  const [retentionDebugInfo, setRetentionDebugInfo] = React.useState<any>(null);
  const [socialCaptionsDebugInfo, setSocialCaptionsDebugInfo] = React.useState<any>(null);
  const [storySequenceDebugInfo, setStorySequenceDebugInfo] = React.useState<any>(null);

  const setAdCopyDebugInfo = React.useCallback(() => {}, []);
  const setStaticAdAnalysis = React.useCallback((analysis: string) => {
    handleInputChange('staticAdAnalysis')(analysis);
  }, [handleInputChange]);
  const setMemoizedIsGeneratingCaptions = React.useCallback((value: boolean) => {
    setIsGeneratingCaptions(value);
  }, []);
  
  const setMemoizedIsGeneratingStory = React.useCallback((value: boolean) => {
    setIsGeneratingStory(value);
  }, []);

  // Generation mutations hook
  const generationMutations = useGeneration({
    staticAdImage: formState.staticAdImage,
    persona: formState.persona,
    brandDrBalance: formState.brandDrBalance,
    selectedProduct: formState.selectedProduct,
    selectedProducts: formState.selectedProducts,
    useJonesBrandGuide: formState.useJonesBrandGuide,
    customRequest: formState.customRequest,
    landingPageType: formState.landingPageType,
    productBrief: formState.productBrief,
    useAdsForLanding: formState.useAdsForLanding,
    mainAngle: formState.mainAngle,
    transcription: formState.transcription,
    personas: configData.personas,
    targetAudience: formState.targetAudience,
    landingPageUrl: formState.landingPageUrl,
    airLink: formState.airLink,
    // Retention copy props
    retentionKeyMessage: formState.retentionKeyMessage,
    retentionPlatform: formState.retentionPlatform,
    retentionEmailType: formState.retentionEmailType,
    retentionSelectedProducts: formState.retentionSelectedProducts,
    retentionAudience: formState.retentionAudience,
    retentionGoal: formState.retentionGoal,
    retentionContentLength: formState.retentionContentLength,
    retentionKeywordsToInclude: formState.retentionKeywordsToInclude,
    retentionWordsToAvoid: formState.retentionWordsToAvoid,
    // State setters
    setStaticAdAnalysis: setStaticAdAnalysis,
    setGeneratedCustomResponse: setGeneratedCustomResponse,
    setGeneratedLandingCopy: setGeneratedLandingCopy,
    setLandingPageAnalysis: setLandingPageAnalysis,
    setGeneratedRetentionCopy: setGeneratedRetentionCopy,
    setStaticAdDebugInfo: setStaticAdDebugInfo,
    setCustomRequestDebugInfo: setCustomRequestDebugInfo,
    setLandingPageDebugInfo: setLandingPageDebugInfo,
    setRetentionDebugInfo: setRetentionDebugInfo,
    setAdCopyDebugInfo: setAdCopyDebugInfo
  });

  // Content revision hook
  const contentRevision = useContentRevision({
    generatedHeadlines: generationMutations.generatedHeadlines,
    generatedPrimaryText: generationMutations.generatedPrimaryText,
    generatedLandingCopy: generatedLandingCopy,
    generatedCustomResponse: generatedCustomResponse,
    generatedRetentionCopy: '',
    transcription: formState.transcription,
    customBrief: formState.customBrief,
    persona: formState.persona,
    targetAudience: formState.targetAudience,
    brandDrBalance: formState.brandDrBalance,
    selectedProduct: formState.selectedProduct,
    retentionSelectedProducts: formState.retentionSelectedProducts,
    customRequest: formState.customRequest,
    personas: configData.personas,
    currentCopyId: generationMutations.currentCopyId,
    setGeneratedHeadlines: generationMutations.setGeneratedHeadlines,
    setGeneratedPrimaryText: generationMutations.setGeneratedPrimaryText,
    setGeneratedLandingCopy: setGeneratedLandingCopy,
    setGeneratedCustomResponse: setGeneratedCustomResponse,
    setGeneratedRetentionCopy: () => {}
  });

  // AUTHENTICATION
  const { user: currentUser, logout, isLoggingOut } = useAuth();
  
  const effectiveUser = useMemo(() => currentUser ? {
    username: (currentUser as any).username,
    role: (currentUser as any).role,
    isAdmin: (currentUser as any).role === 'admin'
  } : null, [currentUser]);

  // Set default persona when personas load
  useEffect(() => {
    if (!formState.persona && Object.keys(configData.personas).length > 0) {
      const firstPersona = Object.keys(configData.personas)[0];
      handleInputChange('persona')(firstPersona);
    }
  }, [configData.personas, formState.persona, handleInputChange]);

  // Handle AI Settings tab click with admin access
  const handleAISettingsClick = React.useCallback(() => {
    adminAccess.handleAISettingsClick(() => {
      // If already has access, just switch to settings tab
      // Configuration loading will be handled by the admin key success callback
      setActiveTab('settings');
    });
  }, [adminAccess, setActiveTab]);

  // Memoized common props to prevent unnecessary re-renders
  const commonTabProps = useMemo(() => ({
    modelSettings: configData.modelSettings,
    stationPrompts: configData.stationPrompts,
    brandGuidelines: configData.brandGuidelines,
    copyFrameworks: configData.copyFrameworks,
    products: configData.products,
    personas: configData.personas,
    getGenerationDisabledState: validation.getGenerationDisabledState,
    getBrandDrLabel,
    getWordCount,
    setCurrentGenerationMetadata,
    setShowGenerationDetails
  }), [
    configData,
    validation.getGenerationDisabledState,
    getBrandDrLabel,
    getWordCount,
    setCurrentGenerationMetadata,
    setShowGenerationDetails
  ]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Header 
          effectiveUser={effectiveUser}
          logout={logout}
          isLoggingOut={isLoggingOut}
          brandLogo={trainingConfig.editingConfig?.brandGuidelines?.brandLogo}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <Tabs value={uiState.activeTab} onValueChange={setActiveTab} className="w-full">
            <MainTabs 
              activeTab={uiState.activeTab}
              handleAISettingsClick={handleAISettingsClick}
              hasAdminAccess={adminAccess.hasAdminAccess}
            />

            {/* Memoized tab contents that only render when active */}
            <MemoizedPaidSocialTab 
              isActive={uiState.activeTab === 'paid-social'}
              paidSocialSubTab={uiState.paidSocialSubTab}
              setPaidSocialSubTab={setPaidSocialSubTab}
              formState={formState}
              handleInputChange={handleInputChange}
              handleFormChange={handleFormChange}
              adCopyGeneration={generationMutations}
              contentRevision={contentRevision}
              generationMutations={generationMutations}
              staticAdDebugInfo={staticAdDebugInfo}
              {...commonTabProps}
            />

            <MemoizedOrganicSocialTab 
              isActive={uiState.activeTab === 'organic-social'}
              organicSocialType={uiState.organicSocialType}
              setOrganicSocialType={setOrganicSocialType}
              organicContentType={formState.organicContentType}
              setOrganicContentType={setOrganicContentType}
              organicVideoFile={organicVideoFile}
              setOrganicVideoFile={setOrganicVideoFile}
              organicVideoTranscription={formState.organicVideoTranscription}
              setOrganicVideoTranscription={setOrganicVideoTranscription}
              organicImageFile={organicImageFile}
              setOrganicImageFile={setOrganicImageFile}
              organicImagePreview={formState.organicImagePreview}
              setOrganicImagePreview={setOrganicImagePreview}
              organicPlatform={formState.organicPlatform}
              setOrganicPlatform={setOrganicPlatform}
              organicGoal={formState.organicGoal}
              setOrganicGoal={setOrganicGoal}
              organicTone={formState.organicTone}
              setOrganicTone={setOrganicTone}
              generatedCaptions={formState.generatedCaptions}
              setGeneratedCaptions={setGeneratedCaptions}
              captionVariations={formState.captionVariations}
              setCaptionVariations={setCaptionVariations}
              storyContentType={formState.storyContentType}
              setStoryContentType={setStoryContentType}
              storyVideoTranscription={formState.storyVideoTranscription}
              setStoryVideoTranscription={setStoryVideoTranscription}
              storyVideoFile={storyVideoFile}
              setStoryVideoFile={setStoryVideoFile}
              storyImageFile={storyImageFile}
              setStoryImageFile={setStoryImageFile}
              storyImagePreview={formState.storyImagePreview}
              setStoryImagePreview={setStoryImagePreview}
              storySequenceType={formState.storySequenceType}
              setStorySequenceType={setStorySequenceType}
              storyLength={formState.storyLength}
              setStoryLength={setStoryLength}
              storyTone={formState.storyTone}
              setStoryTone={setStoryTone}
              generatedStorySequence={formState.generatedStorySequence}
              setGeneratedStorySequence={setGeneratedStorySequence}
              selectedProduct={formState.selectedProduct}
              organicSelectedProducts={formState.organicSelectedProducts}
              setOrganicSelectedProducts={setOrganicSelectedProducts}
              storySelectedProducts={formState.storySelectedProducts}
              setStorySelectedProducts={setStorySelectedProducts}
              persona={formState.persona}
              setPersona={setPersona}
              strategicInsights={strategicInsights}
              setStrategicInsights={setStrategicInsights}
              debugInfo={null}
              socialCaptionsDebugInfo={socialCaptionsDebugInfo}
              storySequenceDebugInfo={storySequenceDebugInfo}
              setSocialCaptionsDebugInfo={setSocialCaptionsDebugInfo}
              setStorySequenceDebugInfo={setStorySequenceDebugInfo}
              isGeneratingCaptions={isGeneratingCaptions}
              setIsGeneratingCaptions={setMemoizedIsGeneratingCaptions}
              isGeneratingStory={isGeneratingStory}
              setIsGeneratingStory={setMemoizedIsGeneratingStory}
              {...commonTabProps}
            />

            <MemoizedLandingPageTab 
              isActive={uiState.activeTab === 'landing'}
              formState={formState}
              handleInputChange={handleInputChange}
              adCopyGeneration={generationMutations}
              contentRevision={contentRevision}
              generationMutations={generationMutations}
              generatedLandingCopy={generatedLandingCopy}
              landingPageAnalysis={landingPageAnalysis}
              setGeneratedLandingCopy={setGeneratedLandingCopy}
              landingPageDebugInfo={landingPageDebugInfo}
              uiState={uiState}
              setCopiedWithTimeout={setCopiedWithTimeout}
              {...commonTabProps}
            />

            <MemoizedCustomCopyTab 
              isActive={uiState.activeTab === 'custom'}
              formState={formState}
              handleInputChange={handleInputChange}
              contentRevision={contentRevision}
              generationMutations={generationMutations}
              generatedCustomResponse={generatedCustomResponse}
              customRequestDebugInfo={customRequestDebugInfo}
              {...commonTabProps}
            />

            <MemoizedRetentionTab 
              isActive={uiState.activeTab === 'retention'}
              formState={formState}
              handleInputChange={handleInputChange}
              contentRevision={contentRevision}
              generationMutations={generationMutations}
              generatedRetentionCopy={generatedRetentionCopy}
              retentionDebugInfo={retentionDebugInfo}
              setRetentionDebugInfo={setRetentionDebugInfo}
              uiState={uiState}
              setCopiedWithTimeout={setCopiedWithTimeout}
              {...commonTabProps}
            />

            <MemoizedProductLaunchTab 
              isActive={uiState.activeTab === 'product-launch'}
              productLaunchSubTab={uiState.productLaunchSubTab}
              setProductLaunchSubTab={setProductLaunchSubTab}
              formState={formState}
              handleInputChange={handleInputChange}
              {...commonTabProps}
            />

            <MemoizedAISettingsTab 
              isActive={uiState.activeTab === 'settings'}
              {...trainingConfig}
              productClaims={configData.productClaims}
              setProductClaims={() => {}} // Placeholder - would need proper setter
              debugInfo={null}
              effectiveUser={effectiveUser}
              {...commonTabProps}
            />
          </Tabs>
        </div>
      </div>

      {/* Memoized dialogs and modals */}
      <RevisionPanel 
        showRevisionPanel={contentRevision.showRevisionPanel}
        revisionInstructions={contentRevision.revisionInstructions}
        setRevisionInstructions={contentRevision.setRevisionInstructions}
        cancelRevision={contentRevision.cancelRevision}
        applyRevision={contentRevision.applyRevision}
        reviseContentMutation={contentRevision.reviseContentMutation}
      />

      <AdminKeyDialog 
        showAdminKeyPrompt={adminAccess.showAdminKeyPrompt}
        adminKeyInput={adminAccess.adminKeyInput}
        setAdminKeyInput={adminAccess.setAdminKeyInput}
        verifyAdminKey={adminAccess.verifyAdminKey}
        closeAdminKeyPrompt={adminAccess.closeAdminKeyPrompt}
        onSuccessCallback={() => {
          // Switch to AI Settings tab and load configuration automatically
          setActiveTab('settings');
          trainingConfig.loadTrainingConfigMutation.mutate();
        }}
      />

      <GenerationDetailsModal
        isOpen={uiState.showGenerationDetails}
        onClose={() => setShowGenerationDetails(false)}
        metadata={currentGenerationMetadata}
        onEditSettings={() => {
          if (adminAccess.hasAdminAccess) {
            setActiveTab('settings');
          } else {
            toast({
              title: "Access Required",
              description: "Admin access required to edit AI Settings",
              variant: "destructive"
            });
          }
        }}
        userRole={effectiveUser?.role}
      />
    </>
  );
};

// Main exported component with provider
export default function MetaAdGeneratorFinal() {
  return (
    <MetaAdGeneratorProvider>
      <MetaAdGeneratorContent />
    </MetaAdGeneratorProvider>
  );
}