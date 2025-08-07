// Shared utilities for meta-ad-generator components

/**
 * Creates prop setters from handleInputChange function
 * This reduces boilerplate in tab wrapper components
 */
export function createPropSetters(handleInputChange: any) {
  if (!handleInputChange) {
    return {};
  }
  
  return {
    // Common form setters
    setConcept: handleInputChange('concept'),
    setSelectedProduct: handleInputChange('selectedProduct'),
    setSelectedProducts: handleInputChange('selectedProducts'),
    setBrandDrBalance: handleInputChange('brandDrBalance'),
    setUseJonesBrandGuide: handleInputChange('useJonesBrandGuide'),
    setTranscription: handleInputChange('transcription'),
    setCustomBrief: handleInputChange('customBrief'),
    setTargetAudience: handleInputChange('targetAudience'),
    setUploadedImage: handleInputChange('uploadedImage'),
    setAirLink: handleInputChange('airLink'),
    setLandingPageUrl: handleInputChange('landingPageUrl'),
    setContentType: handleInputChange('contentType'),
    
    // Influencer mode setters
    setEnableInfluencerMode: handleInputChange('enableInfluencerMode'),
    setInfluencerHandle: handleInputChange('influencerHandle'),
    setVoiceAnalysisMethod: handleInputChange('voiceAnalysisMethod'),
    setInfluencerBrandBalance: handleInputChange('influencerBrandBalance'),
    
    // Landing page specific setters
    setLandingPageType: handleInputChange('landingPageType'),
    setUseAdsForLanding: handleInputChange('useAdsForLanding'),
    setProductBrief: handleInputChange('productBrief'),
    setMainAngle: handleInputChange('mainAngle'),
    
    // Custom copy setters
    setCustomRequest: handleInputChange('customRequest'),
    
    // Retention setters
    setRetentionKeyMessage: handleInputChange('retentionKeyMessage'),
    setRetentionPlatform: handleInputChange('retentionPlatform'),
    setRetentionEmailType: handleInputChange('retentionEmailType'),
    setRetentionSelectedProducts: handleInputChange('retentionSelectedProducts'),
    setRetentionAudience: handleInputChange('retentionAudience'),
    setRetentionGoal: handleInputChange('retentionGoal'),
    setRetentionKeywordsToInclude: handleInputChange('retentionKeywordsToInclude'),
    setRetentionWordsToAvoid: handleInputChange('retentionWordsToAvoid'),
    
    // Organic social setters
    setOrganicContentType: handleInputChange('organicContentType'),
    setOrganicPlatform: handleInputChange('organicPlatform'),
    setOrganicGoal: handleInputChange('organicGoal'),
    setOrganicTone: handleInputChange('organicTone'),
    setCaptionVariations: handleInputChange('captionVariations'),
    setStoryContentType: handleInputChange('storyContentType'),
    setStorySequenceType: handleInputChange('storySequenceType'),
    setStoryLength: handleInputChange('storyLength'),
    setStoryTone: handleInputChange('storyTone'),
    
    // Static ad setters
    setStaticAdImage: handleInputChange('staticAdImage'),
    setStaticAdImagePreview: handleInputChange('staticAdImagePreview'),
    setStaticAdAnalysis: handleInputChange('staticAdAnalysis'),
  };
}

/**
 * Extracts common form state values with defaults
 */
export function extractFormState(formState: any) {
  return {
    // Core form values
    concept: formState?.concept || 'lifeJuggler',
    selectedProduct: formState?.selectedProduct || '',
    selectedProducts: formState?.selectedProducts || [],
    brandDrBalance: formState?.brandDrBalance || [50],
    useJonesBrandGuide: formState?.useJonesBrandGuide ?? true,
    transcription: formState?.transcription || '',
    customBrief: formState?.customBrief || '',
    targetAudience: formState?.targetAudience || '',
    uploadedImage: formState?.uploadedImage || '',
    airLink: formState?.airLink || '',
    landingPageUrl: formState?.landingPageUrl || '',
    contentType: formState?.contentType || 'video',
    
    // Influencer mode values
    enableInfluencerMode: formState?.enableInfluencerMode || false,
    influencerHandle: formState?.influencerHandle || '',
    voiceAnalysisMethod: formState?.voiceAnalysisMethod || 'combined',
    influencerBrandBalance: formState?.influencerBrandBalance || [50],
    
    // Landing page specific values
    landingPageType: formState?.landingPageType || 'listicle',
    useAdsForLanding: formState?.useAdsForLanding || false,
    productBrief: formState?.productBrief || '',
    mainAngle: formState?.mainAngle || '',
    
    // Custom copy values
    customRequest: formState?.customRequest || '',
    
    // Retention values
    retentionKeyMessage: formState?.retentionKeyMessage || '',
    retentionPlatform: formState?.retentionPlatform || 'Email',
    retentionEmailType: formState?.retentionEmailType || 'Product Spotlight / Hero Product',
    retentionSelectedProducts: formState?.retentionSelectedProducts || [],
    retentionAudience: formState?.retentionAudience || 'General audience',
    retentionGoal: formState?.retentionGoal || 'Drive Sales',
    retentionKeywordsToInclude: formState?.retentionKeywordsToInclude || [],
    retentionWordsToAvoid: formState?.retentionWordsToAvoid || [],
    
    // Organic social values
    organicContentType: formState?.organicContentType || 'video',
    organicPlatform: formState?.organicPlatform || 'instagram',
    organicGoal: formState?.organicGoal || 'product-education',
    organicTone: formState?.organicTone || 'authentic-personal',
    captionVariations: formState?.captionVariations || 3,
    storyContentType: formState?.storyContentType || 'video',
    storySequenceType: formState?.storySequenceType || 'product-showcase',
    storyLength: formState?.storyLength || 5,
    storyTone: formState?.storyTone || 'authentic-personal',
    
    // Static ad values
    staticAdImage: formState?.staticAdImage || '',
    staticAdImagePreview: formState?.staticAdImagePreview || '',
    staticAdAnalysis: formState?.staticAdAnalysis || '',
  };
}

/**
 * Creates default mutation object for components that expect it
 */
export function createDefaultMutation() {
  return {
    mutate: () => {},
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null
  };
}

/**
 * Combines form state and setters for tab components
 * This reduces boilerplate in all Tabs wrapper components
 */
export function createTabProps(formState: any, handleInputChange: any, additionalProps: any = {}) {
  const formValues = extractFormState(formState);
  const setters = createPropSetters(handleInputChange);
  
  return {
    ...formValues,
    ...setters,
    ...additionalProps,
    // Default functions if not provided
    copyToClipboard: additionalProps.copyToClipboard || (() => Promise.resolve()),
  };
}