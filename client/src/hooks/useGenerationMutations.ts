import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/useToast';

interface UseGenerationMutationsProps {
  // Form state props needed for mutations
  staticAdImage?: string;
  concept: string;
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
  setGeneratedRetentionCopy?: (copy: any) => void;
  
  // Debug info setters
  setStaticAdDebugInfo?: (info: any) => void;
  setCustomRequestDebugInfo?: (info: any) => void;
  setLandingPageDebugInfo?: (info: any) => void;
  setRetentionDebugInfo?: (info: any) => void;
}

export const useGenerationMutations = (props: UseGenerationMutationsProps) => {
  // Static Ad Analysis Mutation
  const analyzeStaticAdMutation = useMutation({
    mutationFn: async ({ analysisFocus, outputFormat, selectedProducts }: {
      analysisFocus?: string;
      outputFormat?: string;
      selectedProducts?: string[];
    }) => {
      if (!props.staticAdImage) {
        throw new Error('No image uploaded for analysis');
      }

      const payload = {
        staticAdImage: props.staticAdImage,
        concept: props.concept,
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

      // Store debug information
      if (result.debugInfo && props.setStaticAdDebugInfo) {
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
      // Try to parse as JSON first, fallback to raw text
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
      console.error('Static ad analysis error:', error);
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
        throw new Error('Please enter a custom request');
      }

      const payload = {
        customRequest: props.customRequest,
        concept: props.concept,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        selectedProducts: props.selectedProducts,
        useJonesBrandGuide: props.useJonesBrandGuide,
        targetAudience: props.personas[props.concept]?.label || props.concept
      };

      const result = await apiRequest('/api/generate-custom-copy', {
        method: 'POST',
        body: payload
      });

      // Store debug information
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
      console.error('Custom copy generation error:', error);
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
        concept: props.concept,
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

      // Store debug information
      if (result.debugInfo && props.setLandingPageDebugInfo) {
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
      props.setGeneratedLandingCopy?.(data);
      
      toast({
        title: "Landing Page Copy Generated",
        description: "Your landing page copy has been generated successfully.",
      });
    },
    onError: (error) => {
      console.error('Landing page copy generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate landing page copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Retention Copy Generation Mutation
  const generateRetentionCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        keyMessage: props.retentionKeyMessage,
        platform: props.retentionPlatform,
        emailType: props.retentionEmailType,
        selectedProducts: props.retentionSelectedProducts,
        audience: props.retentionAudience,
        goal: props.retentionGoal,
        contentLength: props.retentionContentLength,
        keywordsToInclude: props.retentionKeywordsToInclude,
        wordsToAvoid: props.retentionWordsToAvoid,
        concept: props.concept,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        selectedProduct: props.selectedProduct,
        useJonesBrandGuide: props.useJonesBrandGuide
      };

      const result = await apiRequest('/api/generate-retention-copy', {
        method: 'POST',
        body: payload
      });

      // Store debug information
      if (result.debugInfo && props.setRetentionDebugInfo) {
        props.setRetentionDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }

      return result;
    },
    onSuccess: (data) => {
      props.setGeneratedRetentionCopy?.(data);
      
      toast({
        title: "Retention Copy Generated",
        description: "Your retention copy has been generated successfully.",
      });
    },
    onError: (error) => {
      console.error('Retention copy generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate retention copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    analyzeStaticAdMutation,
    generateCustomCopyMutation,
    generateLandingCopyMutation,
    generateRetentionCopyMutation
  };
};