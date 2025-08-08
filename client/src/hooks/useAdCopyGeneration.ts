import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/useToast';

interface UseAdCopyGenerationProps {
  transcription: string;
  customBrief: string;
  persona: string;
  targetAudience: string;
  landingPageUrl: string;
  brandDrBalance: number[];
  useJonesBrandGuide: boolean;
  airLink: string;
  uploadedImage: string;
  selectedProduct: string;
  selectedProducts: string[];
  personas: Record<string, any>;
}

export const useAdCopyGeneration = (props: UseAdCopyGenerationProps) => {
  // Generated content states
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number>(0);
  
  // Feedback states for analytics
  const [currentCopyId, setCurrentCopyId] = useState<string | null>(null);
  const [copyRating, setCopyRating] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Debug info
  const [debugInfo, setDebugInfo] = useState<{
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null>(null);

  // Copy states
  const [copiedHeadlines, setCopiedHeadlines] = useState(false);
  const [copiedPrimaryText, setCopiedPrimaryText] = useState(false);

  // API mutation for generating ad copy
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        transcription: props.transcription,
        customBrief: props.customBrief,
        persona: props.persona,
        targetAudience: props.targetAudience || props.personas[props.persona]?.label || props.persona,
        landingPageUrl: props.landingPageUrl,
        brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
        useJonesBrandGuide: props.useJonesBrandGuide,
        airLink: props.airLink,
        uploadedImage: props.uploadedImage,
        selectedProduct: props.selectedProduct,
        selectedProducts: props.selectedProducts
      };

      const result = await apiRequest('/api/generate-ad-copy', {
        method: 'POST',
        body: payload
      });

      // Store debug information
      if (result.debugInfo) {
        setDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }

      return result;
    },
    onSuccess: (data) => {
      setGeneratedHeadlines(data.headlines || []);
      setGeneratedPrimaryText(data.primaryText || '');
      setCurrentCopyId(data.copyId || null);
      setSelectedHeadlineIndex(0);
      // Reset feedback state for new generation
      setCopyRating(null);
      setFeedbackText('');
      toast({
        title: "Ad Copy Generated Successfully",
        description: "Your ad copy has been generated using Claude AI.",
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
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
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save copy changes mutation
  const saveCopyMutation = useMutation({
    mutationFn: async () => {
      if (!currentCopyId) {
        throw new Error('No copy ID available for saving');
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

  // Copy to clipboard utility
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'headlines') setCopiedHeadlines(true);
      if (type === 'primary') setCopiedPrimaryText(true);

      setTimeout(() => {
        setCopiedHeadlines(false);
        setCopiedPrimaryText(false);
      }, 2000);

      toast({
        title: "Copied to Clipboard",
        description: "Content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  }, []);

  return {
    // State
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
    
    // Mutations
    generateAdCopyMutation,
    submitFeedbackMutation,
    saveCopyMutation,
    
    // Utilities
    copyToClipboard
  };
};