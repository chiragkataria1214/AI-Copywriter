import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/utils/useToast';
import { useCopyToClipboard } from '@/hooks/utils/useCopyToClipboard';
import { useState, useCallback } from 'react';
import { ERROR_MESSAGES, logError } from '@/utils/errorMessages';
import { useDebugInfo, STATION_KEYS, StationKey } from './useDebugInfo';
import { createDebugInfoSetter } from '@/utils/debugHelpers';

interface UseGenerationStandardizedProps {
  // Form state props needed for mutations
  staticAdImage?: string;
  persona: string;
  brandDrBalance: number[];
  selectedProduct: string;
  selectedProducts: string[];
  useJonesBrandGuide: boolean;
  customRequest: string;
  landingPageType: string;
  productBrief: string;
  useAdsForLanding: boolean;
  mainAngle: string;
  transcription: string;
  personas: Record<string, any>;
  targetAudience: string;
  landingPageUrl: string;
  airLink: string;
  
  // Ad copy specific props
  customBrief?: string;
  uploadedImage?: string;
  contentType?: string;
  
  // Retention copy props
  retentionKeyMessage?: string;
  retentionPlatform?: string;
  retentionEmailType?: string;
  retentionSelectedProducts?: string[];
  retentionAudience?: string;
  retentionGoal?: string;
  retentionContentLength?: string;
  retentionKeywordsToInclude?: string[];
  retentionWordsToAvoid?: string[];
  
  // State setters for updating results
  setStaticAdAnalysis?: (analysis: string) => void;
  setGeneratedCustomResponse?: (response: string) => void;
  setGeneratedLandingCopy?: (copy: any) => void;
  setLandingPageAnalysis?: (analysis: any) => void;
  setGeneratedRetentionCopy?: (copy: any) => void;
  
  // Model settings for debug info
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  
  // Debug info manager for consistent state
  debugInfoManager?: {
    getDebugInfo: (stationKey: string) => any;
    setDebugInfo: (stationKey: string, debugInfo: any) => void;
  };
}

/**
 * Standardized generation hook with consistent debug info handling
 */
export const useGenerationStandardized = (props: UseGenerationStandardizedProps) => {
  // Use passed debugInfoManager if available, otherwise fallback to hook
  const fallbackDebugInfo = useDebugInfo();
  const setDebugInfo = props.debugInfoManager?.setDebugInfo || fallbackDebugInfo.setDebugInfo;
  const getDebugInfo = props.debugInfoManager?.getDebugInfo || fallbackDebugInfo.getDebugInfo;
  
  // Ad copy generation states
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number>(0);
  const [testingFocus, setTestingFocus] = useState<string | null>(null);
  const [strategicInsights, setStrategicInsights] = useState<Record<string, any> | null>(null);
  const [currentCopyId, setCurrentCopyId] = useState<string | null>(null);
  const [copyRating, setCopyRating] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const { isCopied: copiedHeadlines, copyToClipboard: copyHeadlinesToClipboard } = useCopyToClipboard();
  const { isCopied: copiedPrimaryText, copyToClipboard: copyPrimaryTextToClipboard } = useCopyToClipboard();

  // Create standardized debug info setters
  const setStaticAdDebugInfo = useCallback(
    createDebugInfoSetter(setDebugInfo, STATION_KEYS.STATIC_AD, 'Static Ad Analysis', props.modelSettings),
    [setDebugInfo, props.modelSettings, props.debugInfoManager]
  );

  const setCustomRequestDebugInfo = useCallback(
    createDebugInfoSetter(setDebugInfo, STATION_KEYS.CUSTOM_REQUEST, 'Custom Request', props.modelSettings),
    [setDebugInfo, props.modelSettings, props.debugInfoManager]
  );

  const setLandingPageDebugInfo = useCallback(
    createDebugInfoSetter(setDebugInfo, STATION_KEYS.LANDING_PAGE, 'Landing Page', props.modelSettings),
    [setDebugInfo, props.modelSettings, props.debugInfoManager]
  );

  const setRetentionEmailDebugInfo = useCallback(
    createDebugInfoSetter(setDebugInfo, STATION_KEYS.RETENTION_EMAIL, 'Retention Email', props.modelSettings),
    [setDebugInfo, props.modelSettings, props.debugInfoManager]
  );

  const setRetentionSmsDebugInfo = useCallback(
    createDebugInfoSetter(setDebugInfo, STATION_KEYS.RETENTION_SMS, 'Retention SMS', props.modelSettings),
    [setDebugInfo, props.modelSettings, props.debugInfoManager]
  );

  const setAdCopyDebugInfo = useCallback(
    createDebugInfoSetter(setDebugInfo, STATION_KEYS.AD_COPY, 'Ad Copy', props.modelSettings),
    [setDebugInfo, props.modelSettings, props.debugInfoManager]
  );

  // Static Ad Analysis Mutation
  const analyzeStaticAdMutation = useMutation({
    mutationFn: async ({ analysisFocus, outputFormat, selectedProducts }: {
      analysisFocus?: string;
      outputFormat?: string;
      selectedProducts?: string[];
    }) => {
      if (!props.staticAdImage) {
        throw new Error(ERROR_MESSAGES.GENERATION.NO_IMAGE);
      }
      const payload = {
        staticAdImage: props.staticAdImage,
        persona: props.persona,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        selectedProducts: selectedProducts || props.selectedProducts,
        useJonesBrandGuide: props.useJonesBrandGuide,
        analysisFocus: analysisFocus || 'comprehensive',
        outputFormat: outputFormat || 'analysis-variations'
      };
      const result = await apiRequest('/api/analyze-static-ad', {
        method: 'POST',
        body: payload
      });
      
      // Standardized debug info processing
      setStaticAdDebugInfo(result, payload);
      
      return result;
    },
    onSuccess: (data) => {
      let analysisText;
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsedData.analysis || parsedData.variations) {
          analysisText = JSON.stringify(parsedData);
        } else {
          analysisText = data.analysis || data.rawResponse || JSON.stringify(data);
        }
      } catch (error) {
        analysisText = data.analysis || data.rawResponse || JSON.stringify(data);
      }
      props.setStaticAdAnalysis?.(analysisText);
      toast({
        title: "Ad Analysis Complete",
        description: "Your ad has been analyzed successfully.",
      });
    },
    onError: (error) => {
      logError('Static ad analysis', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze ad. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Custom Copy Generation Mutation
  const generateCustomCopyMutation = useMutation({
    mutationFn: async () => {
      if (!props.customRequest.trim()) {
        throw new Error(ERROR_MESSAGES.GENERATION.NO_CONTENT);
      }
      const payload = {
        customRequest: props.customRequest,
        persona: props.persona,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        selectedProducts: props.selectedProducts,
        useJonesBrandGuide: props.useJonesBrandGuide,
        targetAudience: props.personas[props.persona]?.label || props.persona
      };
      const result = await apiRequest('/api/generate-custom-copy', {
        method: 'POST',
        body: payload
      });
      
      // Standardized debug info processing
      setCustomRequestDebugInfo(result, payload);
      
      return result;
    },
    onSuccess: (data) => {
      props.setGeneratedCustomResponse?.(data.customResponse || data.response || '');
      toast({
        title: "Custom Copy Generated",
        description: "Your custom copy has been generated successfully.",
      });
    },
    onError: (error) => {
      logError('Custom copy generation', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate custom copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Landing Page Copy Generation Mutation
  const generateLandingCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        landingPageType: props.landingPageType,
        productBrief: props.productBrief,
        persona: props.persona,
        useAdsContent: props.useAdsForLanding,
        adsContent: props.useAdsForLanding ? {
          transcription: props.transcription,
        } : undefined,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        selectedProducts: props.selectedProducts,
        mainAngle: props.mainAngle,
        transcription: props.transcription
      };
      const result = await apiRequest('/api/generate-landing-copy', {
        method: 'POST',
        body: payload
      });
      
      // Standardized debug info processing
      setLandingPageDebugInfo(result, payload);
      
      return result;
    },
    onSuccess: (data) => {
      props.setGeneratedLandingCopy?.(data.landingCopy || data);
      props.setLandingPageAnalysis?.(data.analysis);
      toast({
        title: "Landing Page Copy Generated",
        description: "Your landing page copy has been generated successfully.",
      });
    },
    onError: (error) => {
      logError('Landing page copy generation', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate landing page copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Retention Email Generation Mutation
  const generateRetentionEmailMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        keyMessage: props.retentionKeyMessage,
        emailType: props.retentionEmailType,
        selectedProducts: props.retentionSelectedProducts,
        audience: props.retentionAudience,
        goal: props.retentionGoal,
        contentLength: props.retentionContentLength,
        keywordsToInclude: props.retentionKeywordsToInclude,
        wordsToAvoid: props.retentionWordsToAvoid,
        persona: props.persona,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        useJonesBrandGuide: props.useJonesBrandGuide
      };
      const result = await apiRequest('/api/generate-retention-email', {
        method: 'POST',
        body: payload
      });
      
      // Standardized debug info processing
      setRetentionEmailDebugInfo(result, payload);
      
      return result;
    },
    onSuccess: (data) => {
      props.setGeneratedRetentionCopy?.(data.response || data);
      toast({
        title: "Email Retention Copy Generated",
        description: "Your email retention copy has been generated successfully.",
      });
    },
    onError: (error) => {
      logError('Email retention copy generation', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate email retention copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Retention SMS Generation Mutation
  const generateRetentionSmsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        keyMessage: props.retentionKeyMessage,
        selectedProducts: props.retentionSelectedProducts,
        audience: props.retentionAudience,
        goal: props.retentionGoal,
        contentLength: props.retentionContentLength,
        keywordsToInclude: props.retentionKeywordsToInclude,
        wordsToAvoid: props.retentionWordsToAvoid,
        persona: props.persona,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        useJonesBrandGuide: props.useJonesBrandGuide
      };
      const result = await apiRequest('/api/generate-retention-sms', {
        method: 'POST',
        body: payload
      });
      
      // Standardized debug info processing
      setRetentionSmsDebugInfo(result, payload);
      
      return result;
    },
    onSuccess: (data) => {
      props.setGeneratedRetentionCopy?.(data.response || data);
      toast({
        title: "SMS Retention Copy Generated",
        description: "Your SMS retention copy has been generated successfully.",
      });
    },
    onError: (error) => {
      logError('SMS retention copy generation', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate SMS retention copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Ad Copy Generation Mutation
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/generate-ad-copy', {
        method: 'POST',
        body: {
          transcription: props.transcription,
          customBrief: props.customBrief || '',
          persona: props.persona,
          targetAudience: props.targetAudience,
          landingPageUrl: props.landingPageUrl,
          brandDrBalance: props.brandDrBalance,
          useJonesBrandGuide: props.useJonesBrandGuide,
          airLink: props.airLink,
          uploadedImage: props.uploadedImage || '',
          selectedProduct: props.selectedProduct,
          selectedProducts: props.selectedProducts
        }
      });

      if (response.debugInfo) {
        setDebugInfo(STATION_KEYS.AD_COPY, {
          systemPrompt: response.debugInfo.systemPrompt,
          userPrompt: response.debugInfo.userPrompt,
          requestPayload: response.debugInfo.requestPayload,
          rawResponse: response.debugInfo.rawResponse,
          stationName: 'Ad Copy Generation',
          timestamp: new Date().toISOString()
        });
      }

      // Update states with the response
      setGeneratedHeadlines(response.headlines || []);
      setGeneratedPrimaryText(response.primaryText || '');
      setTestingFocus(response.testingFocus || null);
      setStrategicInsights(response.strategicInsights || null);
      setCurrentCopyId(response.copyId || null);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Ad Copy Generated",
        description: "Your ad copy has been generated successfully!"
      });
    },
    onError: (error: any) => {
      logError('Ad copy generation failed', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit Feedback Mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ copyId, rating, feedback }: { copyId: string; rating: string; feedback?: string }) => {
      const response = await apiRequest('/api/submit-feedback', {
        method: 'POST',
        body: {
          copyId,
          rating,
          feedback
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!"
      });
      // Reset feedback state
      setCopyRating(null);
      setFeedbackText('');
    },
    onError: (error: any) => {
      logError('Feedback submission failed', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save Copy Mutation (placeholder for now)
  const saveCopyMutation = useMutation({
    mutationFn: async () => {
      // Implementation would depend on requirements
      throw new Error('Save copy not implemented yet');
    }
  });

  // Unified copy function that handles different content types
  const copyToClipboard = (text: string, type: string) => {
    if (type === 'headlines' || type === 'headline') {
      copyHeadlinesToClipboard(text);
    } else if (type === 'primary' || type === 'primaryText') {
      copyPrimaryTextToClipboard(text);
    } else {
      copyPrimaryTextToClipboard(text);
    }
  };

  // Helper function to get debug info for any station
  const getStationDebugInfo = (stationKey: StationKey) => getDebugInfo(stationKey);

  return {
    // Mutations
    analyzeStaticAdMutation,
    generateCustomCopyMutation,
    generateLandingCopyMutation,
    generateRetentionEmailMutation,
    generateRetentionSmsMutation,
    generateAdCopyMutation,
    submitFeedbackMutation,
    saveCopyMutation,
    
    // Ad copy states
    generatedHeadlines,
    setGeneratedHeadlines,
    generatedPrimaryText,
    setGeneratedPrimaryText,
    selectedHeadlineIndex,
    setSelectedHeadlineIndex,
    currentCopyId,
    copyRating,
    setCopyRating,
    feedbackText,
    setFeedbackText,
    copiedHeadlines,
    copiedPrimaryText,
    testingFocus,
    strategicInsights,
    
    // Utility functions
    copyToClipboard,
    copyHeadlinesToClipboard,
    copyPrimaryTextToClipboard,
    
    // Debug info access
    getStationDebugInfo,
    
    // Station keys for consistency
    STATION_KEYS
  };
};