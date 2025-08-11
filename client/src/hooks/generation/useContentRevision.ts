import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/utils/useToast';

interface RevisionItem {
  type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention' | 'staticAd' | 'socialCaption';
  index?: number;
  field?: string;
}

interface UseContentRevisionProps {
  generatedHeadlines: Array<{ framework: string; copy: string }>;
  generatedPrimaryText: string;
  generatedLandingCopy: any;
  generatedCustomResponse: string;
  generatedRetentionCopy: string;
  transcription: string;
  customBrief: string;
  persona: string;
  targetAudience: string;
  brandDrBalance: number[];
  selectedProduct: string;
  retentionSelectedProducts: string[];
  customRequest: string;
  personas: Record<string, any>;
  currentCopyId: string | null;
  setGeneratedHeadlines: (headlines: Array<{ framework: string; copy: string }>) => void;
  setGeneratedPrimaryText: (text: string) => void;
  setGeneratedLandingCopy: (copy: any) => void;
  setGeneratedCustomResponse: (response: string) => void;
  setGeneratedRetentionCopy: (copy: string) => void;
  staticAdAnalysis?: string;
  setStaticAdAnalysis?: (analysis: string) => void;
  generatedCaptions?: string[];
  setGeneratedCaptions?: (captions: string[]) => void;
}

export const useContentRevision = (props: UseContentRevisionProps) => {
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [selectedItemForRevision, setSelectedItemForRevision] = useState<RevisionItem | null>(null);

  // Revision mutation for copy improvements
  const reviseContentMutation = useMutation({
    mutationFn: async ({ instructions, type, index, field }: {
      instructions: string;
      type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention' | 'staticAd' | 'socialCaption';
      index?: number;
      field?: string;
    }) => {
      const payload = {
        originalContent: type === 'headline' ? props.generatedHeadlines[index || 0].copy :
          type === 'primaryText' ? props.generatedPrimaryText :
            type === 'landingCopy' && field ? (props.generatedLandingCopy as any)[field] :
              type === 'custom' ? props.generatedCustomResponse :
                type === 'retention' ? props.generatedRetentionCopy :
                  type === 'staticAd' ? props.staticAdAnalysis :
                    type === 'socialCaption' ? props.generatedCaptions?.[index || 0] : '',
        revisionInstructions: instructions,
        contentType: type,
        context: {
          transcription: props.transcription,
          customBrief: props.customBrief,
          persona: props.persona,
          targetAudience: props.targetAudience || props.personas[props.persona]?.label || props.persona,
          brandDrBalance: props.brandDrBalance && props.brandDrBalance.length > 0 ? props.brandDrBalance[0] : 50,
          selectedProduct: props.selectedProduct,
          selectedProducts: props.retentionSelectedProducts,
          field: field || undefined,
          customRequest: type === 'custom' ? props.customRequest : undefined
        }
      };

      return await apiRequest('/api/revise-content', {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: async (data) => {
      // Update the appropriate content with revised version
      if (selectedItemForRevision) {
        const { type, index, field } = selectedItemForRevision;

        // Check if the AI returned a complete ad copy structure for ad copy revisions
        const isAdCopyRevision = type === 'headline' || type === 'primaryText';
        let parsedAdCopy = null;
        
        if (isAdCopyRevision) {
          try {
            // Try to parse the revised content as JSON (complete ad copy structure)
            const jsonMatch = data.revisedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedAdCopy = JSON.parse(jsonMatch[0]);
              
              // Validate it has the expected ad copy structure
              if (parsedAdCopy.headlines && Array.isArray(parsedAdCopy.headlines) && parsedAdCopy.primaryText) {
                console.log('Detected complete ad copy structure in revision response');
              } else {
                parsedAdCopy = null;
              }
            }
          } catch (error) {
            // Not a JSON structure, treat as regular text revision
            parsedAdCopy = null;
          }
        }

        if (parsedAdCopy) {
          // Update both headlines and primary text with the complete structure
          const cleanedHeadlines = parsedAdCopy.headlines.slice(0, 5).map((item: any) => ({
            framework: item.framework || 'GENERAL',
            copy: (item.copy || '').replace(/^\*\*(.+)\*\*$/, '$1').replace(/^"(.+)"$/, '$1').trim()
          })).filter((item: any) => item.copy.length > 0);
          
          const cleanedPrimaryText = parsedAdCopy.primaryText.replace(/^\*\*(.+)\*\*$/, '$1').replace(/^"(.+)"$/, '$1').trim();
          
          props.setGeneratedHeadlines(cleanedHeadlines);
          props.setGeneratedPrimaryText(cleanedPrimaryText);
          
          // Save both to database if we have a copyId
          if (props.currentCopyId) {
            try {
              await apiRequest(`/api/generated-copy/${props.currentCopyId}`, {
                method: 'PUT',
                body: { 
                  headlines: cleanedHeadlines,
                  primaryText: cleanedPrimaryText
                }
              });
            } catch (error) {
              console.warn('Failed to save complete ad copy updates to database:', error);
            }
          }
        } else {
          // Handle individual field updates (original behavior)
          if (selectedItemForRevision.type === 'staticAd' && typeof data.revisedContent === 'string') {
            const currentAnalysis = JSON.parse(props.staticAdAnalysis || '{}');
            if (currentAnalysis.variations && currentAnalysis.variations[selectedItemForRevision.index || 0]) {
              const updatedVariations = [...currentAnalysis.variations];
              updatedVariations[selectedItemForRevision.index || 0] = {
                ...updatedVariations[selectedItemForRevision.index || 0],
                ...JSON.parse(data.revisedContent)
              };
              props.setStaticAdAnalysis?.(JSON.stringify({ ...currentAnalysis, variations: updatedVariations }));
            }
          } else if (selectedItemForRevision.type === 'socialCaption' && typeof data.revisedContent === 'string') {
            if (props.generatedCaptions) {
              const updatedCaptions = [...props.generatedCaptions];
              updatedCaptions[selectedItemForRevision.index || 0] = data.revisedContent;
              props.setGeneratedCaptions?.(updatedCaptions);
            }
          } else {
            // Fallback for existing types
            switch (selectedItemForRevision.type) {
              case 'headline':
                if (props.generatedHeadlines) {
                  const updatedHeadlines = [...props.generatedHeadlines];
                  updatedHeadlines[selectedItemForRevision.index || 0] = { ...updatedHeadlines[selectedItemForRevision.index || 0], copy: data.revisedContent };
                  props.setGeneratedHeadlines(updatedHeadlines);
                }
                break;
              case 'primaryText':
                props.setGeneratedPrimaryText(data.revisedContent);
                break;
              case 'landingCopy':
                if (selectedItemForRevision.field) {
                  props.setGeneratedLandingCopy({ ...props.generatedLandingCopy, [selectedItemForRevision.field]: data.revisedContent });
                }
                break;
              case 'custom':
                props.setGeneratedCustomResponse(data.revisedContent);
                break;
              case 'retention':
                props.setGeneratedRetentionCopy(data.revisedContent);
                break;
              case 'staticAd':
                // This case is handled above, but we include it here for exhaustiveness
                break;
              case 'socialCaption':
                // This case is handled above, but we include it here for exhaustiveness
                break;
            }
          }
        }

        // Close revision panel
        setShowRevisionPanel(false);
        setRevisionInstructions('');
        setSelectedItemForRevision(null);

        toast({
          title: "Content Revised Successfully",
          description: "Your content has been improved and saved.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Revision Failed",
        description: "Failed to revise content. Please try again.",
        variant: "destructive"
      });
    }
  });

  const startRevision = useCallback((item: RevisionItem) => {
    setSelectedItemForRevision(item);
    setShowRevisionPanel(true);
  }, []);

  const cancelRevision = useCallback(() => {
    setShowRevisionPanel(false);
    setRevisionInstructions('');
    setSelectedItemForRevision(null);
  }, []);

  const applyRevision = useCallback(() => {
    if (selectedItemForRevision && revisionInstructions.trim()) {
      reviseContentMutation.mutate({
        instructions: revisionInstructions,
        type: selectedItemForRevision.type,
        index: selectedItemForRevision.index,
        field: selectedItemForRevision.field
      });
    }
  }, [selectedItemForRevision, revisionInstructions, reviseContentMutation]);

  return {
    // State
    showRevisionPanel,
    revisionInstructions,
    setRevisionInstructions,
    selectedItemForRevision,
    
    // Actions
    startRevision,
    cancelRevision,
    applyRevision,
    setSelectedItemForRevision,
    setShowRevisionPanel,
    
    // Mutation
    reviseContentMutation
  };
};