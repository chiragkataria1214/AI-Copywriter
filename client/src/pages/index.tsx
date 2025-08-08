import React, { useEffect, useMemo } from 'react';
import { toast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Tabs } from '@/components/ui/tabs';
import { GenerationDetailsModal, GenerationMetadata } from '@/components/common';
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_PERSONA_KEY, DEFAULT_USE_JONES_BRAND_GUIDE, DEFAULT_CONTENT_TYPE, DEFAULT_SOCIAL_PLATFORM, DEFAULT_SOCIAL_GOAL, DEFAULT_TONE, DEFAULT_VARIATIONS, DEFAULT_SEQUENCE_TYPE, DEFAULT_STORY_LENGTH, DEFAULT_RETENTION_PLATFORM, DEFAULT_RETENTION_EMAIL_TYPE } from '@shared/constants';
import { Header, MainTabs } from '@/components/meta-ad-generator';

// Import optimized components and hooks
import { MetaAdGeneratorProvider, useMetaAdGeneratorContext } from '@/contexts/MetaAdGeneratorContext';
import { useUIState, useFormState } from '@/hooks/useOptimizedState';
import { useAdCopyGeneration } from '@/hooks/useAdCopyGeneration';
import { useContentRevision } from '@/hooks/useContentRevision';
import { useGenerationMutations } from '@/hooks/useGenerationMutations';
import { 
  MemoizedPaidSocialTab,
  MemoizedOrganicSocialTab,
  MemoizedLandingPageTab,
  MemoizedCustomCopyTab,
  MemoizedRetentionTab,
  MemoizedProductLaunchTab,
  MemoizedAISettingsTab
} from '@/components/meta-ad-generator/optimized/MemoizedTabs';

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
  } = useMetaAdGeneratorContext();

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

  // Generation Details Modal state
  const [currentGenerationMetadata, setCurrentGenerationMetadata] = React.useState<GenerationMetadata | null>(null);

  // Generated content states
  const [generatedCustomResponse, setGeneratedCustomResponse] = React.useState('');
  const [generatedLandingCopy, setGeneratedLandingCopy] = React.useState<any>({});
  const [landingPageAnalysis, setLandingPageAnalysis] = React.useState<any>(null);
  const [generatedRetentionCopy, setGeneratedRetentionCopy] = React.useState<any>('');
  
  // Debug info states
  const [staticAdDebugInfo, setStaticAdDebugInfo] = React.useState<any>(null);
  const [customRequestDebugInfo, setCustomRequestDebugInfo] = React.useState<any>(null);
  const [landingPageDebugInfo, setLandingPageDebugInfo] = React.useState<any>(null);
  const [retentionDebugInfo, setRetentionDebugInfo] = React.useState<any>(null);

  // Ad copy generation hook with optimized props
  const adCopyProps = useMemo(() => ({
    transcription: formState.transcription,
    customBrief: formState.customBrief,
    persona: formState.persona,
    targetAudience: formState.targetAudience,
    landingPageUrl: formState.landingPageUrl,
    brandDrBalance: formState.brandDrBalance,
    useJonesBrandGuide: formState.useJonesBrandGuide,
    airLink: formState.airLink,
    uploadedImage: formState.uploadedImage,
    selectedProduct: formState.selectedProduct,
    selectedProducts: formState.selectedProducts,
    personas: configData.personas
  }), [formState, configData.personas]);

  const adCopyGeneration = useAdCopyGeneration(adCopyProps);

  // Content revision hook
  const contentRevision = useContentRevision({
    generatedHeadlines: adCopyGeneration.generatedHeadlines,
    generatedPrimaryText: adCopyGeneration.generatedPrimaryText,
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
    currentCopyId: adCopyGeneration.currentCopyId,
    setGeneratedHeadlines: adCopyGeneration.setGeneratedHeadlines,
    setGeneratedPrimaryText: adCopyGeneration.setGeneratedPrimaryText,
    setGeneratedLandingCopy: setGeneratedLandingCopy,
    setGeneratedCustomResponse: setGeneratedCustomResponse,
    setGeneratedRetentionCopy: () => {}
  });

  // Generation mutations hook
  const generationMutations = useGenerationMutations({
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
    setStaticAdAnalysis: (analysis: string) => handleInputChange('staticAdAnalysis')(analysis),
    setGeneratedCustomResponse: setGeneratedCustomResponse,
    setGeneratedLandingCopy: setGeneratedLandingCopy,
    setLandingPageAnalysis: setLandingPageAnalysis,
    setGeneratedRetentionCopy: setGeneratedRetentionCopy,
    setStaticAdDebugInfo: setStaticAdDebugInfo,
    setCustomRequestDebugInfo: setCustomRequestDebugInfo,
    setLandingPageDebugInfo: setLandingPageDebugInfo,
    setRetentionDebugInfo: setRetentionDebugInfo
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
              adCopyGeneration={adCopyGeneration}
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
              setOrganicContentType={handleInputChange('organicContentType')}
              organicVideoFile={organicVideoFile}
              setOrganicVideoFile={setOrganicVideoFile}
              organicVideoTranscription={formState.organicVideoTranscription}
              setOrganicVideoTranscription={handleInputChange('organicVideoTranscription')}
              organicImageFile={organicImageFile}
              setOrganicImageFile={setOrganicImageFile}
              organicImagePreview={formState.organicImagePreview}
              setOrganicImagePreview={handleInputChange('organicImagePreview')}
              organicPlatform={formState.organicPlatform}
              setOrganicPlatform={handleInputChange('organicPlatform')}
              organicGoal={formState.organicGoal}
              setOrganicGoal={handleInputChange('organicGoal')}
              organicTone={formState.organicTone}
              setOrganicTone={handleInputChange('organicTone')}
              generatedCaptions={formState.generatedCaptions}
              setGeneratedCaptions={handleInputChange('generatedCaptions')}
              captionVariations={formState.captionVariations}
              setCaptionVariations={handleInputChange('captionVariations')}
              storyContentType={formState.storyContentType}
              setStoryContentType={handleInputChange('storyContentType')}
              storyVideoTranscription={formState.storyVideoTranscription}
              setStoryVideoTranscription={handleInputChange('storyVideoTranscription')}
              storyVideoFile={storyVideoFile}
              setStoryVideoFile={setStoryVideoFile}
              storyImageFile={storyImageFile}
              setStoryImageFile={setStoryImageFile}
              storyImagePreview={formState.storyImagePreview}
              setStoryImagePreview={handleInputChange('storyImagePreview')}
              storySequenceType={formState.storySequenceType}
              setStorySequenceType={handleInputChange('storySequenceType')}
              storyLength={formState.storyLength}
              setStoryLength={handleInputChange('storyLength')}
              storyTone={formState.storyTone}
              setStoryTone={handleInputChange('storyTone')}
              generatedStorySequence={formState.generatedStorySequence}
              setGeneratedStorySequence={handleInputChange('generatedStorySequence')}
              selectedProduct={formState.selectedProduct}
              organicSelectedProducts={formState.organicSelectedProducts}
              setOrganicSelectedProducts={handleInputChange('organicSelectedProducts')}
              storySelectedProducts={formState.storySelectedProducts}
              setStorySelectedProducts={handleInputChange('storySelectedProducts')}
              persona={formState.persona}
              setPersona={handleInputChange('persona')}
              debugInfo={null}
              socialCaptionsDebugInfo={null}
              storySequenceDebugInfo={null}
              setSocialCaptionsDebugInfo={() => {}}
              setStorySequenceDebugInfo={() => {}}
              {...commonTabProps}
            />

            <MemoizedLandingPageTab 
              isActive={uiState.activeTab === 'landing'}
              formState={formState}
              handleInputChange={handleInputChange}
              adCopyGeneration={adCopyGeneration}
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