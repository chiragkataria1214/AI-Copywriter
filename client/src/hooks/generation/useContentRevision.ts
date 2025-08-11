import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/utils/useToast';

interface RevisionItem {
  type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention' | 'staticAd' | 'socialCaption' | 'storySequence';
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
  generatedStorySequence?: Array<{
    slide: number;
    type: string;
    title: string;
    content: string;
    visualDirection: string;
  }>;
  setGeneratedStorySequence?: (sequence: Array<{
    slide: number;
    type: string;
    title: string;
    content: string;
    visualDirection: string;
  }>) => void;
  setRevisionDebugInfo?: (debugInfo: any) => void;
  setCurrentGenerationMetadata?: (metadata: any) => void;
  setShowGenerationDetails?: (show: boolean) => void;
  modelSettings?: any;
  stationPrompts?: any;
  brandGuidelines?: any;
  copyFrameworks?: any;
}

export const useContentRevision = (props: UseContentRevisionProps) => {
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [selectedItemForRevision, setSelectedItemForRevision] = useState<RevisionItem | null>(null);

  // Revision mutation for copy improvements
  const reviseContentMutation = useMutation({
    mutationFn: async ({ instructions, type, index, field }: {
      instructions: string;
      type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention' | 'staticAd' | 'socialCaption' | 'storySequence';
      index?: number;
      field?: string;
    }) => {
      // 🔍 DEBUG: Log mutation inputs
      console.group('🔄 REVISION MUTATION STARTED');
      console.log('📝 Revision Instructions:', instructions);
      console.log('🎯 Content Type:', type);
      console.log('📍 Index:', index);
      console.log('🏷️ Field:', field);
      
      // Extract original content with detailed logging
      let originalContent = '';
      switch (type) {
        case 'headline':
          originalContent = props.generatedHeadlines[index || 0]?.copy || '';
          console.log('📰 Original Headline:', originalContent);
          console.log('📊 All Headlines:', props.generatedHeadlines);
          break;
        case 'primaryText':
          originalContent = props.generatedPrimaryText;
          console.log('📄 Original Primary Text:', originalContent);
          break;
        case 'landingCopy':
          originalContent = field ? (props.generatedLandingCopy as any)[field] : JSON.stringify(props.generatedLandingCopy);
          console.log('🏠 Full Landing Copy Object:', props.generatedLandingCopy);
          break;
        case 'custom':
          originalContent = props.generatedCustomResponse;
          console.log('🎨 Original Custom Response:', originalContent);
          break;
        case 'retention':
          originalContent = props.generatedRetentionCopy;
          console.log('📧 Original Retention Copy:', originalContent);
          break;
        case 'staticAd':
          originalContent = props.staticAdAnalysis || '';
          console.log('🖼️ Original Static Ad Analysis:', originalContent);
          break;
        case 'socialCaption':
          originalContent = props.generatedCaptions?.[index || 0] || '';
          console.log('📱 Original Social Caption:', originalContent);
          console.log('📱 All Captions:', props.generatedCaptions);
          break;
        case 'storySequence':
          originalContent = JSON.stringify(props.generatedStorySequence?.[index || 0] || {});
          console.log('📚 Original Story Sequence:', originalContent);
          console.log('📚 All Story Sequences:', props.generatedStorySequence);
          break;
      }

      const payload = {
        originalContent,
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

      // 🔍 DEBUG: Log complete payload
      console.log('📦 Full API Payload:', payload);
      console.log('🎯 Context Details:', {
        persona: payload.context.persona,
        targetAudience: payload.context.targetAudience,
        brandDrBalance: payload.context.brandDrBalance,
        selectedProduct: payload.context.selectedProduct,
        hasTranscription: !!payload.context.transcription,
        hasCustomBrief: !!payload.context.customBrief
      });

      const startTime = Date.now();
      console.log('⏱️ API Request Started at:', new Date().toISOString());

      try {
        const response = await apiRequest('/api/revise-content', {
          method: 'POST',
          body: payload
        });
        
        const endTime = Date.now();
        console.log('✅ API Request Completed in:', (endTime - startTime) + 'ms');
        console.log('🤖 AI Response:', response);
        console.groupEnd();
        
        return response;
      } catch (error) {
        const endTime = Date.now();
        console.error('❌ API Request Failed after:', (endTime - startTime) + 'ms');
        console.error('💥 Error Details:', error);
        console.groupEnd();
        throw error;
      }
    },
    onSuccess: async (data) => {
      // 🔍 DEBUG: Log success handler start
      
      // Store debug info if available
      if (data.debugInfo && props.setRevisionDebugInfo) {
        props.setRevisionDebugInfo(data.debugInfo);
        
        // Also set as current generation metadata for the details view
        if (props.setCurrentGenerationMetadata) {
          props.setCurrentGenerationMetadata({
            stationName: `Content Revision - ${selectedItemForRevision?.type || 'Unknown'}`,
            timestamp: new Date().toISOString(),
            modelUsed: props.modelSettings?.model || 'Claude Sonnet 4.0',
            temperature: props.modelSettings?.temperature || 0.7,
            maxTokens: props.modelSettings?.maxTokens || 1024,
            systemPrompt: data.debugInfo.systemPrompt,
            userPrompt: data.debugInfo.userPrompt,
            requestPayload: data.debugInfo.requestPayload,
            rawResponse: data.debugInfo.rawResponse
          });
        }
      }
      
      // Update the appropriate content with revised version
      if (selectedItemForRevision) {
        const { type, index, field } = selectedItemForRevision;
        
        console.log('🔧 Processing revision for:', { type, index, field });

        // Check if the AI returned a complete ad copy structure for ad copy revisions
        const isAdCopyRevision = type === 'headline' || type === 'primaryText';
        let parsedAdCopy = null;
        
        console.log('🤖 Is Ad Copy Revision:', isAdCopyRevision);
        
        if (isAdCopyRevision) {
          try {
            console.log('🔍 Attempting to parse as complete ad copy structure...');
            // Try to parse the revised content as JSON (complete ad copy structure)
            const jsonMatch = data.revisedContent.match(/\{[\s\S]*\}/);
            console.log('📄 JSON Match Found:', !!jsonMatch);
            
            if (jsonMatch) {
              console.log('📝 Raw JSON String:', jsonMatch[0]);
              parsedAdCopy = JSON.parse(jsonMatch[0]);
              console.log('📊 Parsed Ad Copy Structure:', parsedAdCopy);
              
              // Validate it has the expected ad copy structure
              const hasValidStructure = parsedAdCopy.headlines && Array.isArray(parsedAdCopy.headlines) && parsedAdCopy.primaryText;
              console.log('✅ Valid Ad Copy Structure:', hasValidStructure);
              
              if (hasValidStructure) {
                console.log('🎯 Detected complete ad copy structure in revision response');
                console.log('📰 Headlines Count:', parsedAdCopy.headlines.length);
                console.log('📄 Primary Text Length:', parsedAdCopy.primaryText.length);
              } else {
                console.log('❌ Invalid structure, treating as regular text revision');
                parsedAdCopy = null;
              }
            }
          } catch (error) {
            // Not a JSON structure, treat as regular text revision
            console.log('❌ JSON Parse Error:', error);
            console.log('📝 Treating as regular text revision');
            parsedAdCopy = null;
          }
        }

        if (parsedAdCopy) {
          console.log('🔄 Processing complete ad copy structure update...');
          
          // Update both headlines and primary text with the complete structure
          const rawHeadlines = parsedAdCopy.headlines.slice(0, 5);
          console.log('📰 Raw Headlines from AI:', rawHeadlines);
          
          const cleanedHeadlines = rawHeadlines.map((item: any) => ({
            framework: item.framework || 'GENERAL',
            copy: (item.copy || '').replace(/^\*\*(.+)\*\*$/, '$1').replace(/^"(.+)"$/, '$1').trim()
          })).filter((item: any) => item.copy.length > 0);
          
          console.log('✨ Cleaned Headlines:', cleanedHeadlines);
          
          const rawPrimaryText = parsedAdCopy.primaryText;
          console.log('📄 Raw Primary Text from AI:', rawPrimaryText);
          
          const cleanedPrimaryText = rawPrimaryText.replace(/^\*\*(.+)\*\*$/, '$1').replace(/^"(.+)"$/, '$1').trim();
          console.log('✨ Cleaned Primary Text:', cleanedPrimaryText);
          
          console.log('💾 Updating state with cleaned content...');
          props.setGeneratedHeadlines(cleanedHeadlines);
          props.setGeneratedPrimaryText(cleanedPrimaryText);
          
          // Save both to database if we have a copyId
          if (props.currentCopyId) {
            console.log('💾 Saving to database with copyId:', props.currentCopyId);
            try {
              const dbPayload = { 
                headlines: cleanedHeadlines,
                primaryText: cleanedPrimaryText
              };
              console.log('📦 Database Payload:', dbPayload);
              
              await apiRequest(`/api/generated-copy/${props.currentCopyId}`, {
                method: 'PUT',
                body: dbPayload
              });
              console.log('✅ Successfully saved to database');
            } catch (error) {
              console.error('❌ Failed to save complete ad copy updates to database:', error);
            }
          } else {
            console.log('⚠️ No copyId available, skipping database save');
          }
        } else {
          // Handle individual field updates (original behavior)
          if (selectedItemForRevision.type === 'staticAd' && typeof data.revisedContent === 'string') {
            console.log('📄 Revised Content:', data.revisedContent);
            
            const currentAnalysis = JSON.parse(props.staticAdAnalysis || '{}');
            console.log('📊 Current Analysis:', currentAnalysis);
            
            // Check if we're updating a specific variation (has index) or the main analysis
            if (selectedItemForRevision.index !== undefined && currentAnalysis.variations && currentAnalysis.variations[selectedItemForRevision.index]) {
              // Update specific variation
              const updatedVariations = [...currentAnalysis.variations];
              console.log('🔄 Updating variation at index:', selectedItemForRevision.index);
              
              updatedVariations[selectedItemForRevision.index] = {
                ...updatedVariations[selectedItemForRevision.index],
                ...JSON.parse(data.revisedContent)
              };
              
              console.log('✅ Updated Variations:', updatedVariations);
              props.setStaticAdAnalysis?.(JSON.stringify({ ...currentAnalysis, variations: updatedVariations }));
            } else {
              // Update main analysis
              console.log('🔄 Updating main analysis');
              const updatedAnalysis = {
                ...currentAnalysis,
                analysis: data.revisedContent
              };
              
              console.log('✅ Updated Analysis:', updatedAnalysis);
              props.setStaticAdAnalysis?.(JSON.stringify(updatedAnalysis));
            }
          } else if (selectedItemForRevision.type === 'socialCaption' && typeof data.revisedContent === 'string') {
            console.log('📱 Processing Social Caption revision...');
            console.log('📄 Revised Content:', data.revisedContent);
            console.log('📍 Caption Index:', selectedItemForRevision.index || 0);
            
            if (props.generatedCaptions) {
              const updatedCaptions = [...props.generatedCaptions];
              updatedCaptions[selectedItemForRevision.index || 0] = data.revisedContent;
              console.log('✅ Updated Captions:', updatedCaptions);
              props.setGeneratedCaptions?.(updatedCaptions);
            }
          } else if (selectedItemForRevision.type === 'storySequence' && typeof data.revisedContent === 'string') {
            console.log('📚 Processing Story Sequence revision...');
            console.log('📄 Revised Content:', data.revisedContent);
            console.log('📍 Sequence Index:', selectedItemForRevision.index || 0);
            
            if (props.generatedStorySequence) {
              try {
                const revisedSlide = JSON.parse(data.revisedContent);
                console.log('📋 Parsed Revised Slide:', revisedSlide);
                
                const updatedSequence = [...props.generatedStorySequence];
                updatedSequence[selectedItemForRevision.index || 0] = revisedSlide;
                console.log('✅ Updated Story Sequence:', updatedSequence);
                props.setGeneratedStorySequence?.(updatedSequence);
              } catch (error) {
                console.error('❌ Failed to parse revised story sequence:', error);
              }
            }
          } else {
            console.log('🔄 Processing fallback content type update...');
            console.log('🎯 Content Type:', selectedItemForRevision.type);
            console.log('📄 Revised Content:', data.revisedContent);
            
            // Fallback for existing types
            switch (selectedItemForRevision.type) {
              case 'headline':
                console.log('📰 Updating individual headline...');
                if (props.generatedHeadlines) {
                  const updatedHeadlines = [...props.generatedHeadlines];
                  updatedHeadlines[selectedItemForRevision.index || 0] = { 
                    ...updatedHeadlines[selectedItemForRevision.index || 0], 
                    copy: data.revisedContent 
                  };
                  console.log('✅ Updated Headlines:', updatedHeadlines);
                  props.setGeneratedHeadlines(updatedHeadlines);
                }
                break;
              case 'primaryText':
                console.log('📄 Updating primary text...');
                props.setGeneratedPrimaryText(data.revisedContent);
                break;
              case 'landingCopy':
                console.log('🏠 Updating landing copy field:', selectedItemForRevision.field);
                if (selectedItemForRevision.field) {
                  // Update specific field
                  const updatedLandingCopy = { 
                    ...props.generatedLandingCopy, 
                    [selectedItemForRevision.field]: data.revisedContent 
                  };
                  console.log('✅ Updated Landing Copy (field):', updatedLandingCopy);
                  props.setGeneratedLandingCopy(updatedLandingCopy);
                } else {
                  // Update entire landing copy object when no specific field is targeted
                  console.log('🏠 Updating entire landing copy object');
                  
                  let parsedContent;
                  try {
                    // Try to parse as JSON if it's a string
                    if (typeof data.revisedContent === 'string') {
                      let jsonToParse = data.revisedContent;
                      
                      // Extract JSON from markdown code blocks (```json ... ```)
                      const codeBlockMatch = jsonToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                      if (codeBlockMatch && codeBlockMatch[1]) {
                        console.log('🔍 Extracted JSON from code block');
                        jsonToParse = codeBlockMatch[1];
                      }
                      
                      // If no code block found, try to find raw JSON object
                      const firstBrace = jsonToParse.indexOf('{');
                      const lastBrace = jsonToParse.lastIndexOf('}');
                      if (firstBrace !== -1 && lastBrace > firstBrace) {
                        jsonToParse = jsonToParse.substring(firstBrace, lastBrace + 1);
                      }
                      
                      parsedContent = JSON.parse(jsonToParse);
                    } else {
                      parsedContent = data.revisedContent;
                    }
                    
                    if (typeof parsedContent === 'object' && parsedContent !== null) {
                      props.setGeneratedLandingCopy(parsedContent);
                    } else {
                      throw new Error('Parsed content is not an object');
                    }
                  } catch (error) {
                    // If parsing fails, assume it's the entire content as a single field
                    const updatedLandingCopy = { 
                      ...props.generatedLandingCopy, 
                      content: data.revisedContent 
                    };
                    console.log('✅ Updated Landing Copy (fallback):', updatedLandingCopy);
                    props.setGeneratedLandingCopy(updatedLandingCopy);
                  }
                }
                break;
              case 'custom':
                console.log('🎨 Updating custom response...');
                props.setGeneratedCustomResponse(data.revisedContent);
                break;
              case 'retention':
                console.log('📧 Updating retention copy...');
                props.setGeneratedRetentionCopy(data.revisedContent);
                break;
              case 'staticAd':
                console.log('🖼️ Static Ad handled above');
                break;
              case 'socialCaption':
                console.log('📱 Social Caption handled above');
                break;
            }
          }
        }

        console.log('🎯 Content update completed successfully');
        
        // Close revision panel
        console.log('🔒 Closing revision panel and cleaning up...');
        setShowRevisionPanel(false);
        setRevisionInstructions('');
        setSelectedItemForRevision(null);

        toast({
          title: "Content Revised Successfully",
          description: "Your content has been improved and saved.",
        });
        
        console.log('✅ Success toast displayed');
        console.groupEnd();
      } else {
        console.log('⚠️ No selected item for revision');
        console.groupEnd();
      }
    },
    onError: (error) => {
      console.group('❌ REVISION ERROR HANDLER');
      console.error('💥 Revision Error:', error);
      console.error('📋 Selected Item:', selectedItemForRevision);
      console.error('📝 Instructions:', revisionInstructions);
      console.error('🕐 Error Timestamp:', new Date().toISOString());
      
      // Log additional error details if available
      if (error instanceof Error) {
        console.error('📄 Error Message:', error.message);
        console.error('📚 Error Stack:', error.stack);
      }
      
      // Log any response data if it's a network error
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const errorWithResponse = error as any;
        if (errorWithResponse.response) {
          console.error('🌐 Response Status:', errorWithResponse.response.status);
          console.error('📄 Response Data:', errorWithResponse.response.data);
        }
      }
      
      toast({
        title: "Revision Failed",
        description: "Failed to revise content. Please try again.",
        variant: "destructive"
      });
      
      console.groupEnd();
    }
  });

  const startRevision = useCallback((item: RevisionItem) => {
    console.group('🚀 START REVISION');
    console.log('📋 Revision Item:', item);
    console.log('🎯 Content Type:', item.type);
    console.log('📍 Index:', item.index);
    console.log('🏷️ Field:', item.field);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    setSelectedItemForRevision(item);
    setShowRevisionPanel(true);
    
    console.log('✅ Revision panel opened');
    console.groupEnd();
  }, []);

  const cancelRevision = useCallback(() => {
    console.group('❌ CANCEL REVISION');
    console.log('📋 Cancelled Item:', selectedItemForRevision);
    console.log('📝 Cancelled Instructions:', revisionInstructions);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    setShowRevisionPanel(false);
    setRevisionInstructions('');
    setSelectedItemForRevision(null);
    
    console.log('✅ Revision cancelled and panel closed');
    console.groupEnd();
  }, [selectedItemForRevision, revisionInstructions]);

  const applyRevision = useCallback(() => {
    console.group('⚡ APPLY REVISION');
    console.log('📋 Selected Item:', selectedItemForRevision);
    console.log('📝 Instructions:', revisionInstructions);
    console.log('✅ Instructions Valid:', !!(selectedItemForRevision && revisionInstructions.trim()));
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    if (selectedItemForRevision && revisionInstructions.trim()) {
      const mutationParams = {
        instructions: revisionInstructions,
        type: selectedItemForRevision.type,
        index: selectedItemForRevision.index,
        field: selectedItemForRevision.field
      };
      
      console.log('🚀 Triggering mutation with params:', mutationParams);
      console.log('🔄 Mutation Status:', {
        isPending: reviseContentMutation.isPending,
        isError: reviseContentMutation.isError,
        isSuccess: reviseContentMutation.isSuccess
      });
      
      reviseContentMutation.mutate(mutationParams);
      console.log('✅ Mutation triggered');
    } else {
      console.warn('⚠️ Cannot apply revision - missing item or instructions');
      console.log('📋 Has Selected Item:', !!selectedItemForRevision);
      console.log('📝 Has Instructions:', !!revisionInstructions.trim());
    }
    
    console.groupEnd();
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
}