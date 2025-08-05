import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, Target, FileText, Image, Mail, Sparkles, Lock, Copy } from 'lucide-react';

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

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You might want to add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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

  const StationToggleButton = ({ 
    isOpen, 
    onClick, 
    title, 
    icon, 
    iconColor,
    description
  }: { 
    isOpen: boolean; 
    onClick: () => void; 
    title: string; 
    icon: React.ReactNode; 
    iconColor: string;
    description: string;
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
          <span className="text-xs text-gray-500 font-medium">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
        </div>
      </button>
    </div>
  );

  // Enhanced text field component with card design
  const EnhancedTextField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rows = 4,
    disabled = false,
    bgColor = "bg-blue-50",
    borderColor = "border-blue-200"
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
    disabled?: boolean;
    bgColor?: string;
    borderColor?: string;
  }) => (
    <div className="space-y-4 bg-white border rounded-lg p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => copyToClipboard(value, label)}
            disabled={!value}
          >
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
        </div>
        {disabled ? (
          <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {value || placeholder}
            </pre>
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200`}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );

  // Enhanced array field component
  const EnhancedArrayField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rows = 4,
    disabled = false,
    bgColor = "bg-green-50",
    borderColor = "border-green-200"
  }: {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
    rows?: number;
    disabled?: boolean;
    bgColor?: string;
    borderColor?: string;
  }) => {
    const textValue = Array.isArray(value) ? value.join('\n') : '';
    
    return (
      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(textValue, label)}
              disabled={!textValue}
            >
              <Copy size={16} className="mr-1" />
              Copy
            </Button>
          </div>
          {disabled ? (
            <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {textValue || placeholder}
              </pre>
            </div>
          ) : (
            <Textarea
              value={textValue}
              onChange={(e) => onChange(e.target.value.split('\n').map(item => item.trim()).filter(Boolean))}
              className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    );
  };

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
      <div className="space-y-4">
        <div className="space-y-4 bg-white border rounded-lg p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{label}</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(value, label)}
                disabled={!value}
              >
                <Copy size={16} className="mr-1" />
                Copy
              </Button>
            </div>
            
            {disabled ? (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {editableContent || placeholder}
                </pre>
              </div>
            ) : (
              <Textarea
                value={editableContent}
                onChange={(e) => handleChange(e.target.value)}
                className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}
          </div>
        </div>

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
              rows={8}
              disabled={effectiveUser?.role !== 'admin'}
            />

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.adCopy?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  adCopy: {
                    ...editingConfig?.stationPrompts?.adCopy,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Generate Meta advertising copy for: [PRODUCT] targeting [AUDIENCE]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <EnhancedArrayField
              label="Copy Writing Rules"
              value={editingConfig?.stationPrompts?.adCopy?.copyWritingRules || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  adCopy: {
                    ...editingConfig?.stationPrompts?.adCopy,
                    copyWritingRules: value
                  }
                }
              })}
              placeholder="Headlines: Maximum 5 words, must fit in 1 line on mobile&#10;Primary text: 15-25 words optimal for Meta ads&#10;Keep sentences to 8-12 words for mobile comprehension"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
            />

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

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.landingPage?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  landingPage: {
                    ...editingConfig?.stationPrompts?.landingPage,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Create a high-converting landing page for [PRODUCT] with focus on [BENEFITS]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <EnhancedArrayField
              label="Content Structure Rules"
              value={editingConfig?.stationPrompts?.landingPage?.contentStructureRules || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  landingPage: {
                    ...editingConfig?.stationPrompts?.landingPage,
                    contentStructureRules: value
                  }
                }
              })}
              placeholder="Hero section: Compelling headline + subheading + CTA&#10;Benefits section: 3-5 key benefits with icons&#10;Social proof: Customer testimonials and reviews"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
            />

            <div className="space-y-4 bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Conversion Guidelines</h4>
              </div>
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
                      className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            <EnhancedArrayField
              label="CTA Guidelines"
              value={editingConfig?.stationPrompts?.landingPage?.ctaGuidelines || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  landingPage: {
                    ...editingConfig?.stationPrompts?.landingPage,
                    ctaGuidelines: value
                  }
                }
              })}
              placeholder="Primary CTA: Action-oriented and benefit-focused&#10;Secondary CTA: Lower commitment alternative&#10;Button text: 2-4 words maximum"
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-orange-50"
              borderColor="border-orange-200"
            />
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

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  staticAd: {
                    ...editingConfig?.stationPrompts?.staticAd,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <EnhancedArrayField
              label="Image-Text Balance Rules"
              value={editingConfig?.stationPrompts?.staticAd?.imageTextBalanceRules || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  staticAd: {
                    ...editingConfig?.stationPrompts?.staticAd,
                    imageTextBalanceRules: value
                  }
                }
              })}
              placeholder="Keep text minimal - let visuals tell the story&#10;Text should complement, not compete with imagery&#10;Focus on one key message per visual"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
            />

            <EnhancedArrayField
              label="Platform-Specific Guidelines"
              value={editingConfig?.stationPrompts?.staticAd?.platformGuidelines || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  staticAd: {
                    ...editingConfig?.stationPrompts?.staticAd,
                    platformGuidelines: value
                  }
                }
              })}
              placeholder="Instagram: Square format, lifestyle focused&#10;Facebook: More text-friendly, broader demographics&#10;Pinterest: Vertical format, aspirational content"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-indigo-50"
              borderColor="border-indigo-200"
            />
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

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.socialCaptions?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  socialCaptions: {
                    ...editingConfig?.stationPrompts?.socialCaptions,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Create [PLATFORM] caption for [CONTENT_TYPE] about [TOPIC] targeting [AUDIENCE]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <EnhancedArrayField
              label="Platform Guidelines"
              value={editingConfig?.stationPrompts?.socialCaptions?.platformGuidelines || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  socialCaptions: {
                    ...editingConfig?.stationPrompts?.socialCaptions,
                    platformGuidelines: value
                  }
                }
              })}
              placeholder="Instagram: 125 characters optimal, use emojis, include CTA&#10;Facebook: Longer form OK, ask questions for engagement&#10;Twitter: 280 characters max, use trending hashtags"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
            />

            <EnhancedArrayField
              label="Hashtag Strategy"
              value={editingConfig?.stationPrompts?.socialCaptions?.hashtagStrategy || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  socialCaptions: {
                    ...editingConfig?.stationPrompts?.socialCaptions,
                    hashtagStrategy: value
                  }
                }
              })}
              placeholder="Mix of branded, niche, and trending hashtags&#10;Instagram: 5-10 hashtags optimal&#10;LinkedIn: 3-5 hashtags maximum"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-pink-50"
              borderColor="border-pink-200"
            />

            <EnhancedArrayField
              label="Engagement Tactics"
              value={editingConfig?.stationPrompts?.socialCaptions?.engagementTactics || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  socialCaptions: {
                    ...editingConfig?.stationPrompts?.socialCaptions,
                    engagementTactics: value
                  }
                }
              })}
              placeholder="Ask questions to encourage comments&#10;Use polls and interactive features&#10;Include clear call-to-action"
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-cyan-50"
              borderColor="border-cyan-200"
            />
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

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.storySequences?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  storySequences: {
                    ...editingConfig?.stationPrompts?.storySequences,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Create a [X]-part story sequence about [TOPIC] for [PLATFORM] with [NARRATIVE_STYLE]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <EnhancedArrayField
              label="Story Structure Guidelines"
              value={editingConfig?.stationPrompts?.storySequences?.storyStructureGuidelines || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  storySequences: {
                    ...editingConfig?.stationPrompts?.storySequences,
                    storyStructureGuidelines: value
                  }
                }
              })}
              placeholder="Hook: Start with compelling opening that creates curiosity&#10;Build: Develop tension and emotional investment&#10;Climax: Deliver key message or revelation&#10;Resolution: Clear call-to-action or next steps"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
            />

            <EnhancedArrayField
              label="Sequence Timing"
              value={editingConfig?.stationPrompts?.storySequences?.sequenceTiming || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  storySequences: {
                    ...editingConfig?.stationPrompts?.storySequences,
                    sequenceTiming: value
                  }
                }
              })}
              placeholder="Instagram Stories: 15-second segments&#10;Email sequences: 24-48 hour intervals&#10;Social posts: Daily or every other day"
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-teal-50"
              borderColor="border-teal-200"
            />

            <EnhancedArrayField
              label="Narrative Techniques"
              value={editingConfig?.stationPrompts?.storySequences?.narrativeTechniques || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  storySequences: {
                    ...editingConfig?.stationPrompts?.storySequences,
                    narrativeTechniques: value
                  }
                }
              })}
              placeholder="Cliffhangers: End each part with suspense&#10;Character development: Relatable protagonists&#10;Emotional arcs: Journey from problem to solution&#10;Visual storytelling: Describe scenes vividly"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-slate-50"
              borderColor="border-slate-200"
            />
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

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.emailSmsRetention?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  emailSmsRetention: {
                    ...editingConfig?.stationPrompts?.emailSmsRetention,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Create [EMAIL/SMS] retention copy for [CAMPAIGN_TYPE] targeting [AUDIENCE_SEGMENT]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <div className="space-y-4 bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Subject Line Frameworks</h4>
              </div>
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
                      className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            <EnhancedArrayField
              label="Retention Best Practices"
              value={editingConfig?.stationPrompts?.emailSmsRetention?.retentionBestPractices || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  emailSmsRetention: {
                    ...editingConfig?.stationPrompts?.emailSmsRetention,
                    retentionBestPractices: value
                  }
                }
              })}
              placeholder="Send times: Email 10-11am EST, SMS 2-4pm EST&#10;Frequency: Email 2-3x/week max, SMS 1-2x/week max&#10;Personalization: Use first name and purchase history"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
            />
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

            <EnhancedTextField
              label="User Prompt Template"
              value={editingConfig?.stationPrompts?.customRequest?.userPromptTemplate || ''}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  customRequest: {
                    ...editingConfig?.stationPrompts?.customRequest,
                    userPromptTemplate: value
                  }
                }
              })}
              placeholder="Handle this custom request: [USER_REQUEST] for [BRAND/PRODUCT] with [SPECIFIC_REQUIREMENTS]..."
              rows={4}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />

            <EnhancedArrayField
              label="Request Type Guidelines"
              value={editingConfig?.stationPrompts?.customRequest?.requestTypeGuidelines || []}
              onChange={(value) => effectiveUser?.role === 'admin' && setEditingConfig({
                ...editingConfig,
                stationPrompts: {
                  ...editingConfig?.stationPrompts,
                  customRequest: {
                    ...editingConfig?.stationPrompts?.customRequest,
                    requestTypeGuidelines: value
                  }
                }
              })}
              placeholder="Product descriptions: Focus on benefits and use cases&#10;Social media captions: Platform-appropriate length and tone&#10;Blog posts: SEO-optimized with clear structure"
              rows={5}
              disabled={effectiveUser?.role !== 'admin'}
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
            />
          </div>
        )}
      </div>

    </div>
  );
}; 