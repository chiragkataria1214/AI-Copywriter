import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export const useAdCopyGeneration = () => {
  // Ad Copy States
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number>(0);
  
  // Feedback states for analytics
  const [currentCopyId, setCurrentCopyId] = useState<string | null>(null);
  const [copyRating, setCopyRating] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Revision states
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [selectedItemForRevision, setSelectedItemForRevision] = useState<{
    type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention';
    index?: number;
    field?: string;
  } | null>(null);
  
  // Debug States
  const [debugInfo, setDebugInfo] = useState<{
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null>(null);

  // API mutation for generating ad copy
  const generateAdCopyMutation = useMutation({
    mutationFn: async (payload: {
      transcription: string;
      customBrief: string;
      concept: string;
      subPersona: string;
      targetAudience: string;
      landingPageUrl: string;
      brandDrBalance: number;
      useJonesBrandGuide: boolean;
      airLink: string;
      uploadedImage: string;
      selectedProduct: string;
    }) => {
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

  // Revision mutation for copy improvements
  const reviseContentMutation = useMutation({
    mutationFn: async ({ 
      instructions, 
      type, 
      index, 
      field,
      context 
    }: {
      instructions: string;
      type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention';
      index?: number;
      field?: string;
      context: any;
    }) => {
      const payload = {
        originalContent: type === 'headline' ? generatedHeadlines[index || 0].copy :
                        type === 'primaryText' ? generatedPrimaryText : '',
        revisionInstructions: instructions,
        contentType: type,
        context,
        field: field || undefined
      };
      
      return await apiRequest('/api/revise-content', {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: (data) => {
      // Update the appropriate content with revised version
      if (selectedItemForRevision) {
        const { type, index } = selectedItemForRevision;
        
        if (type === 'headline' && index !== undefined) {
          const newHeadlines = [...generatedHeadlines];
          newHeadlines[index] = { ...newHeadlines[index], copy: data.revisedContent };
          setGeneratedHeadlines(newHeadlines);
        } else if (type === 'primaryText') {
          setGeneratedPrimaryText(data.revisedContent);
        }
      }
      
      // Close revision panel
      setShowRevisionPanel(false);
      setRevisionInstructions('');
      setSelectedItemForRevision(null);
      
      toast({
        title: "Content Revised Successfully",
        description: "Your content has been improved based on your feedback.",
      });
    },
    onError: (error) => {
      toast({
        title: "Revision Failed",
        description: "Failed to revise content. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit feedback mutation for analytics
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

  return {
    // State
    generatedHeadlines,
    setGeneratedHeadlines,
    generatedPrimaryText,
    setGeneratedPrimaryText,
    selectedHeadlineIndex,
    setSelectedHeadlineIndex,
    currentCopyId,
    setCurrentCopyId,
    copyRating,
    setCopyRating,
    feedbackText,
    setFeedbackText,
    showRevisionPanel,
    setShowRevisionPanel,
    revisionInstructions,
    setRevisionInstructions,
    selectedItemForRevision,
    setSelectedItemForRevision,
    debugInfo,
    setDebugInfo,
    
    // Mutations
    generateAdCopyMutation,
    reviseContentMutation,
    submitFeedbackMutation,
  };
}; 