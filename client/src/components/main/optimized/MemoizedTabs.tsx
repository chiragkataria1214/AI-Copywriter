import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { 
  PaidSocialTabs, 
  OrganicSocialTab, 
  LandingPageTabs, 
  CustomCopyTabs, 
  RetentionTabs, 
  ProductLaunchTabs, 
  AISettingsComponent 
} from '@/components/main';

// Memoized tab content components to prevent unnecessary re-renders
export const MemoizedPaidSocialTab = React.memo(({ 
  isActive,
  staticAdDebugInfo,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="paid-social">
      <PaidSocialTabs {...props} staticAdDebugInfo={staticAdDebugInfo} />
    </TabsContent>
  );
});

export const MemoizedOrganicSocialTab = React.memo(({ 
  isActive,
  organicSocialType,
  setOrganicSocialType,
  organicContentType,
  setOrganicContentType,
  organicVideoFile,
  setOrganicVideoFile,
  organicVideoTranscription,
  setOrganicVideoTranscription,
  organicImageFile,
  setOrganicImageFile,
  organicImagePreview,
  setOrganicImagePreview,
  organicPlatform,
  setOrganicPlatform,
  organicGoal,
  setOrganicGoal,
  organicTone,
  setOrganicTone,
  generatedCaptions,
  setGeneratedCaptions,
  captionVariations,
  setCaptionVariations,
  storyContentType,
  setStoryContentType,
  storyVideoTranscription,
  setStoryVideoTranscription,
  storyVideoFile,
  setStoryVideoFile,
  storyImageFile,
  setStoryImageFile,
  storyImagePreview,
  setStoryImagePreview,
  storySequenceType,
  setStorySequenceType,
  storyLength,
  setStoryLength,
  storyTone,
  setStoryTone,
  generatedStorySequence,
  setGeneratedStorySequence,
  selectedProduct,
  organicSelectedProducts,
  setOrganicSelectedProducts,
  storySelectedProducts,
  setStorySelectedProducts,
  persona,
  setPersona,
  products,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  modelSettings,
  stationPrompts,
  brandGuidelines,
  copyFrameworks,
  debugInfo,
  socialCaptionsDebugInfo,
  storySequenceDebugInfo,
  setSocialCaptionsDebugInfo,
  setStorySequenceDebugInfo,
  strategicInsights,
  setStrategicInsights,
  isGeneratingCaptions,
  setIsGeneratingCaptions,
  isGeneratingStory,
  setIsGeneratingStory,
  ...rest
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="organic-social">
      <OrganicSocialTab
        organicSocialType={organicSocialType}
        setOrganicSocialType={setOrganicSocialType}
        organicContentType={organicContentType}
        setOrganicContentType={setOrganicContentType}
        organicVideoFile={organicVideoFile}
        setOrganicVideoFile={setOrganicVideoFile}
        organicVideoTranscription={organicVideoTranscription}
        setOrganicVideoTranscription={setOrganicVideoTranscription}
        organicImageFile={organicImageFile}
        setOrganicImageFile={setOrganicImageFile}
        organicImagePreview={organicImagePreview}
        setOrganicImagePreview={setOrganicImagePreview}
        organicPlatform={organicPlatform}
        setOrganicPlatform={setOrganicPlatform}
        organicGoal={organicGoal}
        setOrganicGoal={setOrganicGoal}
        organicTone={organicTone}
        setOrganicTone={setOrganicTone}
        generatedCaptions={generatedCaptions}
        setGeneratedCaptions={setGeneratedCaptions}
        captionVariations={captionVariations}
        setCaptionVariations={setCaptionVariations}
        storyContentType={storyContentType}
        setStoryContentType={setStoryContentType}
        storyVideoTranscription={storyVideoTranscription}
        setStoryVideoTranscription={setStoryVideoTranscription}
        storyVideoFile={storyVideoFile}
        setStoryVideoFile={setStoryVideoFile}
        storyImageFile={storyImageFile}
        setStoryImageFile={setStoryImageFile}
        storyImagePreview={storyImagePreview}
        setStoryImagePreview={setStoryImagePreview}
        storySequenceType={storySequenceType}
        setStorySequenceType={setStorySequenceType}
        storyLength={storyLength}
        setStoryLength={setStoryLength}
        storyTone={storyTone}
        setStoryTone={setStoryTone}
        generatedStorySequence={generatedStorySequence}
        setGeneratedStorySequence={setGeneratedStorySequence}
        selectedProduct={selectedProduct}
        organicSelectedProducts={organicSelectedProducts}
        setOrganicSelectedProducts={setOrganicSelectedProducts}
        storySelectedProducts={storySelectedProducts}
        setStorySelectedProducts={setStorySelectedProducts}
        persona={persona}
        setPersona={setPersona}
        products={products}
        setCurrentGenerationMetadata={setCurrentGenerationMetadata}
        setShowGenerationDetails={setShowGenerationDetails}
        modelSettings={modelSettings}
        stationPrompts={stationPrompts}
        brandGuidelines={brandGuidelines}
        copyFrameworks={copyFrameworks}
        debugInfo={debugInfo}
        socialCaptionsDebugInfo={socialCaptionsDebugInfo}
        storySequenceDebugInfo={storySequenceDebugInfo}
        setSocialCaptionsDebugInfo={setSocialCaptionsDebugInfo}
        setStorySequenceDebugInfo={setStorySequenceDebugInfo}
        strategicInsights={strategicInsights}
        setStrategicInsights={setStrategicInsights}
        isGeneratingCaptions={isGeneratingCaptions}
        setIsGeneratingCaptions={setIsGeneratingCaptions}
        isGeneratingStory={isGeneratingStory}
        setIsGeneratingStory={setIsGeneratingStory}
        {...rest}
      />
    </TabsContent>
  );
});

export const MemoizedLandingPageTab = React.memo(({ 
  isActive, 
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="landing">
      <LandingPageTabs {...props} />
    </TabsContent>
  );
});

export const MemoizedCustomCopyTab = React.memo(({ 
  isActive, 
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="custom">
      <CustomCopyTabs {...props} />
    </TabsContent>
  );
});

export const MemoizedRetentionTab = React.memo(({ 
  isActive, 
  retentionDebugInfo,
  setRetentionDebugInfo,
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="retention">
      <RetentionTabs {...props} retentionDebugInfo={retentionDebugInfo} setRetentionDebugInfo={setRetentionDebugInfo} />
    </TabsContent>
  );
});

export const MemoizedProductLaunchTab = React.memo(({ 
  isActive, 
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="product-launch">
      <ProductLaunchTabs {...props} />
    </TabsContent>
  );
});

export const MemoizedAISettingsTab = React.memo(({ 
  isActive, 
  ...props 
}: any) => {
  if (!isActive) return null;
  
  return (
    <TabsContent value="settings">
      <AISettingsComponent {...props} />
    </TabsContent>
  );
});