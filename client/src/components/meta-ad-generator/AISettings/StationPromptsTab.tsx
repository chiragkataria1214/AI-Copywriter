import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, Target, FileText, Image, Mail, Sparkles, Lock, Eye, Upload, X, Check } from 'lucide-react';
import { GenerationDetailsModal, GenerationMetadata } from '@/components/GenerationDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface StationPromptsTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
}

export const StationPromptsTab: React.FC<StationPromptsTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser
}) => {
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set());
  const [showGenerationDetails, setShowGenerationDetails] = useState(false);
  const [currentGenerationMetadata, setCurrentGenerationMetadata] = useState<GenerationMetadata | null>(null);

  const [emailFrameworks, setEmailFrameworks] = useState<any[]>([]);
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());
  const { toast } = useToast();



  // Load email frameworks on component mount
  useEffect(() => {
    const loadEmailFrameworks = async () => {
      try {
        const data = await apiRequest('/api/email-frameworks');
        if (data && Array.isArray(data)) {
          setEmailFrameworks(data);
        }
      } catch (error) {
        console.error('Failed to load email frameworks:', error);
      }
    };

    loadEmailFrameworks();
  }, []);



  // Helper function to extract and protect output structure from prompts
  const extractOutputStructure = (prompt: string) => {
    const outputRequirementMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*})/i);
    if (outputRequirementMatch) {
      return outputRequirementMatch[1];
    }
    
    // For array structures
    const arrayStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*\])/i);
    if (arrayStructureMatch) {
      return arrayStructureMatch[1];
    }
    
    // For simple text structures
    const textStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?You MUST return your response as[^.]*\.)/i);
    if (textStructureMatch) {
      return textStructureMatch[1];
    }
    
    return null;
  };

  // Helper function to get editable portion of prompt (everything except output structure)
  const getEditablePrompt = (prompt: string) => {
    const structure = extractOutputStructure(prompt);
    if (structure) {
      return prompt.replace(structure, '').trim();
    }
    return prompt;
  };

  // Helper function to reconstruct full prompt with protected structure
  const reconstructPrompt = (editableContent: string, originalPrompt: string) => {
    const structure = extractOutputStructure(originalPrompt);
    if (structure) {
      // Insert the structure after the first paragraph
      const lines = editableContent.split('\n');
      const insertIndex = lines.findIndex(line => line.trim() === '') || 1;
      const beforeStructure = lines.slice(0, insertIndex).join('\n');
      const afterStructure = lines.slice(insertIndex).join('\n');
      
      return `${beforeStructure}\n\n${structure}\n\n${afterStructure}`.trim();
    }
    return editableContent;
  };

  const toggleStation = (stationId: string) => {
    const newExpanded = new Set(expandedStations);
    if (expandedStations.has(stationId)) {
      newExpanded.delete(stationId);
    } else {
      newExpanded.add(stationId);
    }
    setExpandedStations(newExpanded);
  }

  const toggleFramework = (frameworkName: string) => {
    const newExpanded = new Set(expandedFrameworks);
    if (newExpanded.has(frameworkName)) {
      newExpanded.delete(frameworkName);
    } else {
      newExpanded.add(frameworkName);
    }
    setExpandedFrameworks(newExpanded);
  };

  const updateEmailFramework = async (frameworkName: string, data: any) => {
    try {
      await apiRequest(`/api/email-frameworks/${frameworkName}`, {
        method: 'PUT',
        body: data,
      });
      
      // Update local state
      setEmailFrameworks(prev => prev.map(fw => 
        fw.name === frameworkName ? { ...fw, ...data } : fw
      ));
      
      toast({
        title: "Framework Updated",
        description: `${data.displayName || frameworkName} framework has been updated.`,
      });
    } catch (error) {
      console.error('Failed to update email framework:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update framework. Please try again.",
        variant: "destructive"
      });
    }
  };;

  // Email framework image upload handler
  const handleEmailFrameworkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, selectedFramework: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPG, PNG, or GIF).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        try {
          const base64Data = result.split(',')[1];
          
          // Analyze the image with AI and store in database
          const analysisData = await apiRequest('/api/email-image-analysis', {
            method: 'POST',
            body: {
              imageData: base64Data,
              frameworkType: selectedFramework,
              originalFilename: file.name
            }
          });

          toast({
            title: "Email Example Analyzed",
            description: `Image tagged with ${emailFrameworks.find(f => f.name === selectedFramework)?.displayName} framework and analyzed by AI.`,
          });

          // Refresh frameworks to show the new analysis
          const updatedFrameworks = await apiRequest('/api/email-frameworks');
          setEmailFrameworks(updatedFrameworks);

        } catch (error) {
          console.error('Failed to analyze email image:', error);
          toast({
            title: "Analysis Failed",
            description: "Failed to analyze the email image. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    reader.readAsDataURL(file);

    // Reset the input
    event.target.value = '';
  };

  // Update framework field locally
  const updateFrameworkField = (frameworkName: string, field: string, value: string) => {
    setEmailFrameworks(prev => prev.map(framework => 
      framework.name === frameworkName 
        ? { ...framework, [field]: value }
        : framework
    ));
  };

  // Save framework changes to database
  const saveFrameworkChanges = async (frameworkName: string) => {
    const framework = emailFrameworks.find(f => f.name === frameworkName);
    if (!framework) return;

    try {
      const updateData = {
        structure: framework.structure,
        keyElements: framework.keyElements,
        frameworkContent: framework.frameworkContent,
        systemPrompt: framework.systemPrompt,
      };

      await apiRequest(`/api/email-frameworks/${framework.id}`, {
        method: 'PUT',
        body: updateData,
      });

      toast({
        title: "Framework Updated",
        description: `${framework.displayName} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Failed to save framework changes:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save framework changes. Please try again.",
        variant: "destructive"
      });
    }
  };



  const showStationDetails = (stationId: string, stationName: string) => {
    const stationConfig = editingConfig?.stationPrompts?.[stationId];
    if (!stationConfig) return;

    // Create a comprehensive request payload similar to what would be sent to the API
    const requestPayload = {
      model: editingConfig?.modelParameters?.model || 'claude-sonnet-4-20250514',
      max_tokens: editingConfig?.modelParameters?.maxTokens || 2000,
      temperature: editingConfig?.modelParameters?.temperature || 0.7,
      system: stationConfig.systemPrompt || `No system prompt configured for ${stationName}`,
      messages: [
        {
          role: 'user',
          content: stationConfig.userPromptTemplate || `No user prompt template configured for ${stationName}`
        }
      ],
      metadata: {
        station: stationId,
        stationName: stationName,
        brandGuidelines: editingConfig?.brandGuidelines ? {
          corePositioning: editingConfig.brandGuidelines.corePositioning,
          brandVoice: editingConfig.brandGuidelines.brandVoice || [],
          keyTerminology: editingConfig.brandGuidelines.keyTerminology || [],
          approvedLanguage: editingConfig.brandGuidelines.approvedLanguage || [],
          avoidedLanguage: editingConfig.brandGuidelines.avoidedLanguage || []
        } : {},
        copyFrameworks: editingConfig?.copyFrameworks || {},
        personaPillars: editingConfig?.personaPillars || {},
        productClaims: editingConfig?.productClaims || {}
      }
    };

    const metadata: GenerationMetadata = {
      stationName: stationName,
      timestamp: new Date().toISOString(),
      modelUsed: editingConfig?.modelParameters?.model || 'claude-sonnet-4-20250514',
      temperature: editingConfig?.modelParameters?.temperature || 0.7,
      maxTokens: editingConfig?.modelParameters?.maxTokens || 2000,
      systemPrompt: stationConfig.systemPrompt || `No system prompt configured for ${stationName}`,
      userPrompt: stationConfig.userPromptTemplate || `No user prompt template configured for ${stationName}`,
      requestPayload: requestPayload,
      rawResponse: `This is a preview of the ${stationName} configuration. The actual AI response would appear here after content generation.

Example response format for ${stationName}:
- Structured output based on station requirements
- Formatted according to brand guidelines
- Optimized for the specific use case

To see actual AI responses, generate content using this station.`,
      brandGuidelines: editingConfig?.brandGuidelines ? [
        editingConfig.brandGuidelines.corePositioning,
        ...(editingConfig.brandGuidelines.brandVoice || []),
        ...(editingConfig.brandGuidelines.keyTerminology || []),
        ...(editingConfig.brandGuidelines.approvedLanguage || [])
      ].filter(Boolean) : [],
      frameworks: editingConfig?.copyFrameworks?.headlineFrameworks?.map(f => f.name).filter(Boolean) || [],
      settingsVersion: 'Current Configuration'
    };

    setCurrentGenerationMetadata(metadata);
    setShowGenerationDetails(true);
  };

  const StationToggleButton = ({ 
    isOpen, 
    onClick, 
    title, 
    icon, 
    iconColor,
    description,
    stationId 
  }: { 
    isOpen: boolean; 
    onClick: () => void; 
    title: string; 
    icon: React.ReactNode; 
    iconColor: string;
    description: string;
    stationId: string;
  }) => (
    <div className="bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-4"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className={iconColor}>{icon}</span>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {!isOpen && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              showStationDetails(stationId, title);
            }}
            className="flex items-center space-x-1 text-xs"
          >
            <Eye size={12} />
            <span>View Details</span>
          </Button>
          <span className="text-xs text-gray-500 font-medium">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
        </div>
      </button>
    </div>
  );

  // Component for displaying system prompts with protected output structure
  const ProtectedPromptEditor = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rows = 8,
    disabled = false 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
    disabled?: boolean;
  }) => {
    const outputStructure = extractOutputStructure(value);
    const editableContent = getEditablePrompt(value);

    const handleChange = (newEditableContent: string) => {
      const reconstructedPrompt = reconstructPrompt(newEditableContent, value);
      onChange(reconstructedPrompt);
    };

    return (
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">{label}</Label>
        
        {/* Editable Content */}
        <Textarea
          value={editableContent}
          onChange={(e) => handleChange(e.target.value)}
          className="text-gray-900 mb-4"
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Protected Output Structure */}
        {outputStructure && (
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <Label className="text-sm font-medium text-amber-800">Protected Output Structure</Label>
            </div>
            <div className="bg-white border border-amber-200 rounded p-3">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {outputStructure}
              </pre>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              This section is protected to ensure frontend compatibility.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium">🎯 Station Prompts Configuration</p>
        <p className="text-sm text-blue-700 mt-1">
          Configure specialized AI prompts and guidelines for each content generation station.
        </p>
      </div>



      {/* Ad Copy Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('adCopy')}
          onClick={() => toggleStation('adCopy')}
          title="Ad Copy Station"
          icon={<Target className="w-5 h-5" />}
          iconColor="text-blue-500"
          description="Meta advertising copywriter for short-form direct response ads"
          stationId="adCopy"
        />
        
        {expandedStations.has('adCopy') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.adCopy?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  adCopy: {
                    ...editingConfig?.stationPrompts?.adCopy,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are an expert Meta advertising copywriter specializing in short-form direct response ads..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.adCopy?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    adCopy: {
                      ...editingConfig?.stationPrompts?.adCopy,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Generate Meta advertising copy for: [PRODUCT] targeting [AUDIENCE]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Headline Framework</Label>
              <Select
                value={editingConfig?.stationPrompts?.adCopy?.selectedHeadlineFramework || ''}
                onValueChange={(value) => {
                  if (effectiveUser?.role !== 'admin') return;
                  setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      adCopy: {
                        ...editingConfig?.stationPrompts?.adCopy,
                        selectedHeadlineFramework: value
                      }
                    }
                  });
                }}
                disabled={effectiveUser?.role !== 'admin'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select headline framework from Copy Frameworks" />
                </SelectTrigger>
                <SelectContent>
                  {editingConfig?.copyFrameworks?.headlineFrameworks?.map((framework: any, index: number) => (
                    <SelectItem key={index} value={framework.name || `framework-${index}`}>
                      {framework.name || `Framework ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Configure headline frameworks in Copy Frameworks tab above
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Copy Writing Rules</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.adCopy?.copyWritingRules)
                  ? editingConfig.stationPrompts.adCopy.copyWritingRules.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    adCopy: {
                      ...editingConfig?.stationPrompts?.adCopy,
                      copyWritingRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Headlines: Maximum 5 words, must fit in 1 line on mobile&#10;Primary text: 15-25 words optimal for Meta ads&#10;Keep sentences to 8-12 words for mobile comprehension"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">📋 Brand & DR Guidelines</p>
              <p className="text-sm text-blue-700 mt-1">
                Brand-First and Direct Response guidelines are configured in the Copy Frameworks tab above.
                The system automatically uses those settings based on your Brand/DR balance slider.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Landing Page Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('landingPage')}
          onClick={() => toggleStation('landingPage')}
          title="Landing Page Station"
          icon={<FileText className="w-5 h-5" />}
          iconColor="text-green-500"
          description="Conversion-optimized landing page copywriter"
          stationId="landingPage"
        />
        
        {expandedStations.has('landingPage') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.landingPage?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  landingPage: {
                    ...editingConfig?.stationPrompts?.landingPage,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are an expert landing page copywriter specializing in conversion-optimized pages..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.landingPage?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    landingPage: {
                      ...editingConfig?.stationPrompts?.landingPage,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Create a high-converting landing page for [PRODUCT] with focus on [BENEFITS]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Content Structure Rules</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.landingPage?.contentStructureRules)
                  ? editingConfig.stationPrompts.landingPage.contentStructureRules.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    landingPage: {
                      ...editingConfig?.stationPrompts?.landingPage,
                      contentStructureRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Hero section: Compelling headline + subheading + CTA&#10;Benefits section: 3-5 key benefits with icons&#10;Social proof: Customer testimonials and reviews"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Conversion Guidelines</Label>
              <div className="space-y-2">
                {(editingConfig?.stationPrompts?.landingPage?.conversionGuidelines || ['', '', '']).map((guideline: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Switch
                      checked={editingConfig?.stationPrompts?.landingPage?.enabledConversionGuidelines?.[index] !== false}
                      onCheckedChange={(checked) => {
                        if (effectiveUser?.role !== 'admin') return;
                        const enabled = [...(editingConfig?.stationPrompts?.landingPage?.enabledConversionGuidelines || [])];
                        enabled[index] = checked;
                        setEditingConfig({
                          ...editingConfig,
                          stationPrompts: {
                            ...editingConfig?.stationPrompts,
                            landingPage: {
                              ...editingConfig?.stationPrompts?.landingPage,
                              enabledConversionGuidelines: enabled
                            }
                          }
                        });
                      }}
                      disabled={effectiveUser?.role !== 'admin'}
                    />
                    <Input
                      value={guideline}
                      onChange={(e) => {
                        if (effectiveUser?.role !== 'admin') return;
                        const updated = [...(editingConfig?.stationPrompts?.landingPage?.conversionGuidelines || [])];
                        updated[index] = e.target.value;
                        setEditingConfig({
                          ...editingConfig,
                          stationPrompts: {
                            ...editingConfig?.stationPrompts,
                            landingPage: {
                              ...editingConfig?.stationPrompts?.landingPage,
                              conversionGuidelines: updated
                            }
                          }
                        });
                      }}
                      placeholder="Use multiple CTAs throughout the page"
                      disabled={effectiveUser?.role !== 'admin'}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">CTA Guidelines</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.landingPage?.ctaGuidelines)
                  ? editingConfig.stationPrompts.landingPage.ctaGuidelines.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    landingPage: {
                      ...editingConfig?.stationPrompts?.landingPage,
                      ctaGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Primary CTA: Action-oriented and benefit-focused&#10;Secondary CTA: Lower commitment alternative&#10;Button text: 2-4 words maximum"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Static Ad Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('staticAd')}
          onClick={() => toggleStation('staticAd')}
          title="Static Ad Station"
          icon={<Image className="w-5 h-5" />}
          iconColor="text-purple-500"
          description="Visual-first advertising formats with image-text balance"
          stationId="staticAd"
        />
        
        {expandedStations.has('staticAd') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.staticAd?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  staticAd: {
                    ...editingConfig?.stationPrompts?.staticAd,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are a static ad copywriter specializing in visual-first advertising formats..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    staticAd: {
                      ...editingConfig?.stationPrompts?.staticAd,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Image-Text Balance Rules</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.staticAd?.imageTextBalanceRules)
                  ? editingConfig.stationPrompts.staticAd.imageTextBalanceRules.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    staticAd: {
                      ...editingConfig?.stationPrompts?.staticAd,
                      imageTextBalanceRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Keep text minimal - let visuals tell the story&#10;Text should complement, not compete with imagery&#10;Focus on one key message per visual"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Platform-Specific Guidelines</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.staticAd?.platformGuidelines)
                  ? editingConfig.stationPrompts.staticAd.platformGuidelines.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    staticAd: {
                      ...editingConfig?.stationPrompts?.staticAd,
                      platformGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Instagram: Square format, lifestyle focused&#10;Facebook: More text-friendly, broader demographics&#10;Pinterest: Vertical format, aspirational content"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Email Frameworks Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('emailFrameworks')}
          onClick={() => toggleStation('emailFrameworks')}
          title="Email Frameworks Station"
          icon={<Mail className="w-5 h-5" />}
          iconColor="text-green-500"
          description="Editable email copywriting frameworks for different campaign types"
          stationId="emailFrameworks"
        />
        
        {expandedStations.has('emailFrameworks') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">📧 Email Framework Management</p>
              <p className="text-sm text-green-700 mt-1">
                Configure and customize email copywriting frameworks for different campaign types. Each framework includes specific guidelines, structure templates, and best practices.
              </p>
            </div>

            {emailFrameworks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Loading email frameworks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emailFrameworks.map((framework) => (
                  <div key={framework.name} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFramework(framework.name)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {expandedFrameworks.has(framework.name) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <Mail className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{framework.displayName}</h4>
                          {!expandedFrameworks.has(framework.name) && (
                            <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          framework.isActive === 'true' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {framework.isActive === 'true' ? 'Active' : 'Inactive'}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {expandedFrameworks.has(framework.name) ? 'Collapse' : 'Expand'}
                        </span>
                      </div>
                    </button>
                    
                    {expandedFrameworks.has(framework.name) && (
                      <div className="border-t border-gray-200 p-6 space-y-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-900 mb-3 block">Framework Description</Label>
                          <Textarea
                            value={framework.description || ''}
                            onChange={(e) => updateEmailFramework(framework.name, { description: e.target.value })}
                            className="text-gray-900"
                            rows={2}
                            placeholder="Brief description of this email framework..."
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-900 mb-3 block">Key Guidelines</Label>
                          <Textarea
                            value={framework.keyGuidelines || ''}
                            onChange={(e) => updateEmailFramework(framework.name, { keyGuidelines: e.target.value })}
                            className="text-gray-900"
                            rows={6}
                            placeholder="Key guidelines and best practices for this framework..."
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-900 mb-3 block">Structure Template</Label>
                          <Textarea
                            value={framework.structureTemplate || ''}
                            onChange={(e) => updateEmailFramework(framework.name, { structureTemplate: e.target.value })}
                            className="text-gray-900"
                            rows={8}
                            placeholder="Email structure template with placeholders..."
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-900 mb-3 block">Example Copy</Label>
                          <Textarea
                            value={framework.exampleCopy || ''}
                            onChange={(e) => updateEmailFramework(framework.name, { exampleCopy: e.target.value })}
                            className="text-gray-900"
                            rows={6}
                            placeholder="Example email copy using this framework..."
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={framework.isActive === 'true'}
                              onCheckedChange={(checked) => updateEmailFramework(framework.name, { isActive: checked ? 'true' : 'false' })}
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                            <Label className="text-sm font-medium text-gray-900">Active Framework</Label>
                          </div>
                          <div className="text-xs text-gray-500">
                            Sort Order: {framework.sortOrder}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social Captions Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('socialCaptions')}
          onClick={() => toggleStation('socialCaptions')}
          title="Social Captions Station"
          icon={<Target className="w-5 h-5" />}
          iconColor="text-blue-400"
          description="Platform-optimized social media captions and hashtag strategies"
          stationId="socialCaptions"
        />
        
        {expandedStations.has('socialCaptions') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.socialCaptions?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  socialCaptions: {
                    ...editingConfig?.stationPrompts?.socialCaptions,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are a social media copywriter specializing in platform-optimized captions and engagement..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.socialCaptions?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    socialCaptions: {
                      ...editingConfig?.stationPrompts?.socialCaptions,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Create [PLATFORM] caption for [CONTENT_TYPE] about [TOPIC] targeting [AUDIENCE]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Platform Guidelines</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.socialCaptions?.platformGuidelines)
                  ? editingConfig.stationPrompts.socialCaptions.platformGuidelines.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    socialCaptions: {
                      ...editingConfig?.stationPrompts?.socialCaptions,
                      platformGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Instagram: 125 characters optimal, use emojis, include CTA&#10;Facebook: Longer form OK, ask questions for engagement&#10;Twitter: 280 characters max, use trending hashtags"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Hashtag Strategy</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.socialCaptions?.hashtagStrategy)
                  ? editingConfig.stationPrompts.socialCaptions.hashtagStrategy.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    socialCaptions: {
                      ...editingConfig?.stationPrompts?.socialCaptions,
                      hashtagStrategy: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Mix of branded, niche, and trending hashtags&#10;Instagram: 5-10 hashtags optimal&#10;LinkedIn: 3-5 hashtags maximum"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Engagement Tactics</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.socialCaptions?.engagementTactics)
                  ? editingConfig.stationPrompts.socialCaptions.engagementTactics.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    socialCaptions: {
                      ...editingConfig?.stationPrompts?.socialCaptions,
                      engagementTactics: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Ask questions to encourage comments&#10;Use polls and interactive features&#10;Include clear call-to-action"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Story Sequences Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('storySequences')}
          onClick={() => toggleStation('storySequences')}
          title="Story Sequences Station"
          icon={<FileText className="w-5 h-5" />}
          iconColor="text-indigo-500"
          description="Multi-part storytelling sequences for sustained engagement"
          stationId="storySequences"
        />
        
        {expandedStations.has('storySequences') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.storySequences?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  storySequences: {
                    ...editingConfig?.stationPrompts?.storySequences,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are a story sequence specialist creating multi-part narratives for sustained audience engagement..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.storySequences?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    storySequences: {
                      ...editingConfig?.stationPrompts?.storySequences,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Create a [X]-part story sequence about [TOPIC] for [PLATFORM] with [NARRATIVE_STYLE]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Story Structure Guidelines</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.storySequences?.storyStructureGuidelines)
                  ? editingConfig.stationPrompts.storySequences.storyStructureGuidelines.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    storySequences: {
                      ...editingConfig?.stationPrompts?.storySequences,
                      storyStructureGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Hook: Start with compelling opening that creates curiosity&#10;Build: Develop tension and emotional investment&#10;Climax: Deliver key message or revelation&#10;Resolution: Clear call-to-action or next steps"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Sequence Timing</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.storySequences?.sequenceTiming)
                  ? editingConfig.stationPrompts.storySequences.sequenceTiming.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    storySequences: {
                      ...editingConfig?.stationPrompts?.storySequences,
                      sequenceTiming: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Instagram Stories: 15-second segments&#10;Email sequences: 24-48 hour intervals&#10;Social posts: Daily or every other day"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Narrative Techniques</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.storySequences?.narrativeTechniques)
                  ? editingConfig.stationPrompts.storySequences.narrativeTechniques.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    storySequences: {
                      ...editingConfig?.stationPrompts?.storySequences,
                      narrativeTechniques: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Cliffhangers: End each part with suspense&#10;Character development: Relatable protagonists&#10;Emotional arcs: Journey from problem to solution&#10;Visual storytelling: Describe scenes vividly"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Email & SMS Retention Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('emailSmsRetention')}
          onClick={() => toggleStation('emailSmsRetention')}
          title="Email & SMS Retention Station"
          icon={<Mail className="w-5 h-5" />}
          iconColor="text-orange-500"
          description="Customer retention and engagement specialist"
          stationId="emailSmsRetention"
        />
        
        {expandedStations.has('emailSmsRetention') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.emailSmsRetention?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  emailSmsRetention: {
                    ...editingConfig?.stationPrompts?.emailSmsRetention,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are an email and SMS marketing specialist focused on customer retention and engagement..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.emailSmsRetention?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    emailSmsRetention: {
                      ...editingConfig?.stationPrompts?.emailSmsRetention,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Create [EMAIL/SMS] retention copy for [CAMPAIGN_TYPE] targeting [AUDIENCE_SEGMENT]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Email Framework Management</Label>
              <p className="text-sm text-gray-600 mb-4">
                Configure framework content and upload examples to train the AI for better email generation.
              </p>
              
              {/* Framework Configuration Sections */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {emailFrameworks.map((framework) => (
                  <div key={framework.name} className="border border-gray-200 rounded-lg">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{framework.displayName}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newExpanded = new Set(expandedFrameworks);
                                if (expandedFrameworks.has(framework.name)) {
                                  newExpanded.delete(framework.name);
                                } else {
                                  newExpanded.add(framework.name);
                                }
                                setExpandedFrameworks(newExpanded);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
                            >
                              {expandedFrameworks.has(framework.name) ? (
                                <>
                                  <ChevronDown size={14} className="mr-1" />
                                  Collapse
                                </>
                              ) : (
                                <>
                                  <ChevronRight size={14} className="mr-1" />
                                  Expand & Edit
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{framework.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`framework-upload-${framework.name}`}
                            onChange={(e) => handleEmailFrameworkImageUpload(e, framework.name)}
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                          <label 
                            htmlFor={`framework-upload-${framework.name}`}
                            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                              effectiveUser?.role !== 'admin' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            <Upload size={12} className="mr-1.5" />
                            Add Example
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Framework Editor */}
                    {expandedFrameworks.has(framework.name) && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Framework Structure */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Framework Structure</Label>
                            <Textarea
                              value={framework.structure || ''}
                              onChange={(e) => updateFrameworkField(framework.name, 'structure', e.target.value)}
                              placeholder="e.g., Hero → Intro Module → Look Breakdown → Footer"
                              className="text-sm"
                              rows={2}
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>

                          {/* Key Elements */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Key Elements</Label>
                            <Textarea
                              value={framework.keyElements || ''}
                              onChange={(e) => updateFrameworkField(framework.name, 'keyElements', e.target.value)}
                              placeholder="e.g., Step-by-step product application, seasonal inspiration, pro tips"
                              className="text-sm"
                              rows={2}
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>

                          {/* Framework Content */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Framework Content & Examples</Label>
                            <Textarea
                              value={framework.frameworkContent || ''}
                              onChange={(e) => updateFrameworkField(framework.name, 'frameworkContent', e.target.value)}
                              placeholder="Detailed framework structure, examples, best practices..."
                              className="text-sm font-mono"
                              rows={12}
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Add detailed framework guidelines, structure examples, and best practices here.
                            </p>
                          </div>

                          {/* System Prompt */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">AI System Prompt</Label>
                            <Textarea
                              value={framework.systemPrompt || ''}
                              onChange={(e) => updateFrameworkField(framework.name, 'systemPrompt', e.target.value)}
                              placeholder="Instructions for AI to generate this framework type..."
                              className="text-sm"
                              rows={4}
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end pt-2">
                            <Button
                              onClick={() => saveFrameworkChanges(framework.name)}
                              disabled={effectiveUser?.role !== 'admin'}
                              className="text-sm"
                            >
                              <Check size={14} className="mr-1.5" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Subject Line Frameworks</Label>
              <div className="space-y-2">
                {(editingConfig?.stationPrompts?.emailSmsRetention?.subjectLineFrameworks || ['', '', '']).map((framework: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Switch
                      checked={editingConfig?.stationPrompts?.emailSmsRetention?.enabledSubjectLineFrameworks?.[index] !== false}
                      onCheckedChange={(checked) => {
                        if (effectiveUser?.role !== 'admin') return;
                        const enabled = [...(editingConfig?.stationPrompts?.emailSmsRetention?.enabledSubjectLineFrameworks || [])];
                        enabled[index] = checked;
                        setEditingConfig({
                          ...editingConfig,
                          stationPrompts: {
                            ...editingConfig?.stationPrompts,
                            emailSmsRetention: {
                              ...editingConfig?.stationPrompts?.emailSmsRetention,
                              enabledSubjectLineFrameworks: enabled
                            }
                          }
                        });
                      }}
                      disabled={effectiveUser?.role !== 'admin'}
                    />
                    <Input
                      value={framework}
                      onChange={(e) => {
                        if (effectiveUser?.role !== 'admin') return;
                        const updated = [...(editingConfig?.stationPrompts?.emailSmsRetention?.subjectLineFrameworks || [])];
                        updated[index] = e.target.value;
                        setEditingConfig({
                          ...editingConfig,
                          stationPrompts: {
                            ...editingConfig?.stationPrompts,
                            emailSmsRetention: {
                              ...editingConfig?.stationPrompts?.emailSmsRetention,
                              subjectLineFrameworks: updated
                            }
                          }
                        });
                      }}
                      placeholder="Curiosity-driven: 'The secret to...' or 'Why [benefit]?'"
                      disabled={effectiveUser?.role !== 'admin'}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Retention Best Practices</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.emailSmsRetention?.retentionBestPractices)
                  ? editingConfig.stationPrompts.emailSmsRetention.retentionBestPractices.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    emailSmsRetention: {
                      ...editingConfig?.stationPrompts?.emailSmsRetention,
                      retentionBestPractices: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Send times: Email 10-11am EST, SMS 2-4pm EST&#10;Frequency: Email 2-3x/week max, SMS 1-2x/week max&#10;Personalization: Use first name and purchase history"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom Request Station */}
      <div className="border border-gray-200 rounded-lg">
        <StationToggleButton
          isOpen={expandedStations.has('customRequest')}
          onClick={() => toggleStation('customRequest')}
          title="Custom Request Station"
          icon={<Sparkles className="w-5 h-5" />}
          iconColor="text-pink-500"
          description="Versatile copywriter for any custom marketing request"
          stationId="customRequest"
        />
        
        {expandedStations.has('customRequest') && (
          <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
            <ProtectedPromptEditor
              label="System Prompt"
              value={editingConfig?.stationPrompts?.customRequest?.systemPrompt || ''}
              onChange={(value) => setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  customRequest: {
                    ...editingConfig?.stationPrompts?.customRequest,
                    systemPrompt: value
                  }
                }
              })}
              placeholder="You are a versatile copywriter capable of handling any custom marketing request..."
              rows={6}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
              <Textarea
                value={editingConfig?.stationPrompts?.customRequest?.userPromptTemplate || ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    customRequest: {
                      ...editingConfig?.stationPrompts?.customRequest,
                      userPromptTemplate: e.target.value
                    }
                  }
                })}
                className="text-gray-900"
                rows={3}
                placeholder="Handle this custom request: [USER_REQUEST] for [BRAND/PRODUCT] with [SPECIFIC_REQUIREMENTS]..."
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Request Type Guidelines</Label>
              <Textarea
                value={Array.isArray(editingConfig?.stationPrompts?.customRequest?.requestTypeGuidelines)
                  ? editingConfig.stationPrompts.customRequest.requestTypeGuidelines.join('\n')
                  : ''}
                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig?.stationPrompts,
                    customRequest: {
                      ...editingConfig?.stationPrompts?.customRequest,
                      requestTypeGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                    }
                  }
                })}
                className="text-gray-900"
                rows={4}
                placeholder="Product descriptions: Focus on benefits and use cases&#10;Social media captions: Platform-appropriate length and tone&#10;Blog posts: SEO-optimized with clear structure"
                disabled={effectiveUser?.role !== 'admin'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generation Details Modal */}
      <GenerationDetailsModal
        isOpen={showGenerationDetails}
        onClose={() => setShowGenerationDetails(false)}
        metadata={currentGenerationMetadata}
        userRole={effectiveUser?.role}
      />
    </div>
  );
}; 