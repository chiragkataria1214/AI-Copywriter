import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/utils/useToast';
import { useCopyToClipboard } from '@/hooks/utils/useCopyToClipboard';
import { useState, useCallback } from 'react';
import { ERROR_MESSAGES, logError } from '@/utils/errorMessages';

interface UseGenerationProps {
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
  
  // Debug info setters
  setStaticAdDebugInfo?: (info: any) => void;
  setCustomRequestDebugInfo?: (info: any) => void;
  setLandingPageDebugInfo?: (info: any) => void;
  setRetentionDebugInfo?: (info: any) => void;
  setRetentionEmailDebugInfo?: (info: any) => void;
  setRetentionSmsDebugInfo?: (info: any) => void;
  setAdCopyDebugInfo?: (info: any) => void;
}

const useAnalyzeStaticAd = (props: UseGenerationProps) => {
  return useMutation({
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
      if (result.debugInfo && props.setStaticAdDebugInfo) {
        console.log('!!!!!!!!!!!result.debugInfo', result.debugInfo);
        props.setStaticAdDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }
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
};

const useGenerateCustomCopy = (props: UseGenerationProps) => {
  return useMutation({
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
      if (result.debugInfo && props.setCustomRequestDebugInfo) {
        props.setCustomRequestDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }
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
};

const useGenerateLandingCopy = (props: UseGenerationProps) => {
  return useMutation({
    mutationFn: async () => {
      const payload = {
        landingPageType: props.landingPageType,
        productBrief: props.productBrief,
        persona: props.persona,
        useAdsContent: props.useAdsForLanding,
        adsContent: props.useAdsForLanding ? {
          transcription: props.transcription,
          // Could include generated headlines/primary text if available
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
      if (result.debugInfo && props.setLandingPageDebugInfo) {
        // console.log('!!!!!!!!!!!result.debugInfo', result.debugInfo);
        props.setLandingPageDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }
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
};

const useGenerateRetentionEmail = (props: UseGenerationProps) => {
  return useMutation({
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
      if (result.debugInfo && props.setRetentionEmailDebugInfo) {
        console.log('!!!!!!!!!!!result.debugInfo', result.debugInfo);
        props.setRetentionEmailDebugInfo(result.debugInfo);
      }
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
};

const useGenerateRetentionSms = (props: UseGenerationProps) => {
  return useMutation({
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
      if (result.debugInfo && props.setRetentionSmsDebugInfo) {
        console.log('!!!!!!!!!!!result.debugInfo', result.debugInfo);
        props.setRetentionSmsDebugInfo(result.debugInfo);
      }
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
};

const useGenerateAdCopy = (
  props: UseGenerationProps,
  stateSetters: {
    setGeneratedHeadlines: (headlines: Array<{ framework: string; copy: string }>) => void;
    setGeneratedPrimaryText: (text: string) => void;
    setCurrentCopyId: (id: string | null) => void;
    setTestingFocus: (focus: string | null) => void;
    setStrategicInsights: (insights: Record<string, any> | null) => void;
    setSelectedHeadlineIndex: (index: number) => void;
    setCopyRating: (rating: string | null) => void;
    setFeedbackText: (text: string) => void;
  }
) => {
  return useMutation({
    mutationFn: async () => {
      const payload = {
        transcription: props.transcription,
        customBrief: props.customRequest,
        persona: props.persona,
        targetAudience: props.targetAudience || props.personas[props.persona]?.label || props.persona,
        landingPageUrl: props.landingPageUrl,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        useJonesBrandGuide: props.useJonesBrandGuide,
        airLink: props.airLink,
        uploadedImage: props.staticAdImage,
        selectedProduct: props.selectedProduct,
        selectedProducts: props.selectedProducts
      };
      const result = await apiRequest('/api/generate-ad-copy', {
        method: 'POST',
        body: payload
      });
      if (result.debugInfo && props.setAdCopyDebugInfo) {
        props.setAdCopyDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }
      return result;
    },
    onSuccess: (data) => {
      stateSetters.setGeneratedHeadlines(data.headlines || []);
      stateSetters.setGeneratedPrimaryText(data.primaryText || '');
      stateSetters.setCurrentCopyId(data.copyId || null);
      stateSetters.setTestingFocus(data.testingFocus || null);
      stateSetters.setStrategicInsights(data.strategicInsights || null);
      stateSetters.setSelectedHeadlineIndex(0);
      // Reset feedback state for new generation
      stateSetters.setCopyRating(null);
      stateSetters.setFeedbackText('');
      toast({
        title: "Ad Copy Generated Successfully",
        description: "Your ad copy has been generated using Claude AI.",
      });
    },
    onError: (error) => {
      logError('Ad copy generation', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
    }
  });
};

const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (data: { copyId: string; rating: string; feedback?: string }) => {
      return await apiRequest('/api/copy-feedback', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback helps improve the AI copywriter.",
      });
    },
    onError: (error) => {
      logError('Feedback submission', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });
};

const useSaveCopy = (currentCopyId: string | null, generatedHeadlines: Array<{ framework: string; copy: string }>, generatedPrimaryText: string) => {
  return useMutation({
    mutationFn: async () => {
      if (!currentCopyId) {
        throw new Error(ERROR_MESSAGES.GENERIC.OPERATION_FAILED('Save copy - no ID available'));
      }
      return await apiRequest(`/api/generated-copy/${currentCopyId}`, {
        method: 'PUT',
        body: {
          headlines: generatedHeadlines,
          primaryText: generatedPrimaryText
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Changes Saved",
        description: "Your ad copy changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useGeneration = (props: UseGenerationProps) => {
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number>(0);
  const [testingFocus, setTestingFocus] = useState<string | null>(null);
  const [strategicInsights, setStrategicInsights] = useState<Record<string, any> | null>(null);
  const [currentCopyId, setCurrentCopyId] = useState<string | null>(null);
  const [copyRating, setCopyRating] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [debugInfo, setDebugInfo] = useState<{
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null>(null);

  const { isCopied: copiedHeadlines, copyToClipboard: copyHeadlinesToClipboard } = useCopyToClipboard();
  const { isCopied: copiedPrimaryText, copyToClipboard: copyPrimaryTextToClipboard } = useCopyToClipboard();

  const analyzeStaticAdMutation = useAnalyzeStaticAd({ ...props, setStaticAdDebugInfo: setDebugInfo });
  const generateCustomCopyMutation = useGenerateCustomCopy(props);
  const generateLandingCopyMutation = useGenerateLandingCopy(props);
  const generateRetentionEmailMutation = useGenerateRetentionEmail(props);
  const generateRetentionSmsMutation = useGenerateRetentionSms(props);
  const generateAdCopyMutation = useGenerateAdCopy(props, {
    setGeneratedHeadlines,
    setGeneratedPrimaryText,
    setCurrentCopyId,
    setTestingFocus,
    setStrategicInsights,
    setSelectedHeadlineIndex,
    setCopyRating,
    setFeedbackText
  });
  const submitFeedbackMutation = useSubmitFeedback();
  const saveCopyMutation = useSaveCopy(currentCopyId, generatedHeadlines, generatedPrimaryText);

  return {
    analyzeStaticAdMutation,
    generateCustomCopyMutation,
    generateLandingCopyMutation,
    generateRetentionEmailMutation,
    generateRetentionSmsMutation,
    generateAdCopyMutation,
    submitFeedbackMutation,
    saveCopyMutation,
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
    debugInfo,
    copiedHeadlines,
    copiedPrimaryText,
    testingFocus,
    strategicInsights,
    copyHeadlinesToClipboard,
    copyPrimaryTextToClipboard,
  };
};