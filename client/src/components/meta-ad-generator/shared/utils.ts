// Shared utilities for meta-ad-generator components
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_PERSONA_KEY, DEFAULT_USE_JONES_BRAND_GUIDE, DEFAULT_CONTENT_TYPE, DEFAULT_SOCIAL_PLATFORM, DEFAULT_SOCIAL_GOAL, DEFAULT_TONE, DEFAULT_VARIATIONS, DEFAULT_SEQUENCE_TYPE, DEFAULT_STORY_LENGTH, DEFAULT_RETENTION_PLATFORM, DEFAULT_RETENTION_EMAIL_TYPE } from '@shared/constants';

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
    setPersona: handleInputChange('persona'),
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
  persona: formState?.persona || DEFAULT_PERSONA_KEY,
    selectedProduct: formState?.selectedProduct || '',
    selectedProducts: formState?.selectedProducts || [],
    brandDrBalance: formState?.brandDrBalance || [DEFAULT_BRAND_DR_BALANCE],
    useJonesBrandGuide: formState?.useJonesBrandGuide ?? DEFAULT_USE_JONES_BRAND_GUIDE,
    transcription: formState?.transcription || '',
    customBrief: formState?.customBrief || '',
    targetAudience: formState?.targetAudience || '',
    uploadedImage: formState?.uploadedImage || '',
    airLink: formState?.airLink || '',
    landingPageUrl: formState?.landingPageUrl || '',
    contentType: formState?.contentType || DEFAULT_CONTENT_TYPE,
    
    // Influencer mode values
    enableInfluencerMode: formState?.enableInfluencerMode || false,
    influencerHandle: formState?.influencerHandle || '',
    voiceAnalysisMethod: formState?.voiceAnalysisMethod || 'combined',
    influencerBrandBalance: formState?.influencerBrandBalance || [DEFAULT_BRAND_DR_BALANCE],
    
    // Landing page specific values
    landingPageType: formState?.landingPageType || 'listicle',
    useAdsForLanding: formState?.useAdsForLanding || false,
    productBrief: formState?.productBrief || '',
    mainAngle: formState?.mainAngle || '',
    
    // Custom copy values
    customRequest: formState?.customRequest || '',
    
    // Retention values
    retentionKeyMessage: formState?.retentionKeyMessage || '',
    retentionPlatform: formState?.retentionPlatform || DEFAULT_RETENTION_PLATFORM,
    retentionEmailType: formState?.retentionEmailType || DEFAULT_RETENTION_EMAIL_TYPE,
    retentionSelectedProducts: formState?.retentionSelectedProducts || [],
    retentionAudience: formState?.retentionAudience || 'General audience',
    retentionGoal: formState?.retentionGoal || 'Drive Sales',
    retentionKeywordsToInclude: formState?.retentionKeywordsToInclude || [],
    retentionWordsToAvoid: formState?.retentionWordsToAvoid || [],
    
    // Organic social values
    organicContentType: formState?.organicContentType || DEFAULT_CONTENT_TYPE,
    organicPlatform: formState?.organicPlatform || DEFAULT_SOCIAL_PLATFORM,
    organicGoal: formState?.organicGoal || DEFAULT_SOCIAL_GOAL,
    organicTone: formState?.organicTone || DEFAULT_TONE,
    captionVariations: formState?.captionVariations || DEFAULT_VARIATIONS,
    organicVideoTranscription: formState?.organicVideoTranscription || '',
    organicImagePreview: formState?.organicImagePreview || '',
    organicSelectedProducts: formState?.organicSelectedProducts || [],
    generatedCaptions: formState?.generatedCaptions || [],
    storyContentType: formState?.storyContentType || DEFAULT_CONTENT_TYPE,
    storySequenceType: formState?.storySequenceType || DEFAULT_SEQUENCE_TYPE,
    storyLength: formState?.storyLength || DEFAULT_STORY_LENGTH,
    storyTone: formState?.storyTone || DEFAULT_TONE,
    storyVideoTranscription: formState?.storyVideoTranscription || '',
    storyImagePreview: formState?.storyImagePreview || '',
    storySelectedProducts: formState?.storySelectedProducts || [],
    generatedStorySequence: formState?.generatedStorySequence || [],
    
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