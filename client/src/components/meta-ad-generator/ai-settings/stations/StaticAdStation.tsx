import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, Image, Lock, Copy, Plus } from 'lucide-react';

interface StaticAdStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
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

// Available variables for Static Ad system prompt
const STATIC_AD_SYSTEM_VARIABLES = [
  { 
    key: 'concept', 
    label: 'Concept/Persona', 
    description: 'The selected persona concept (e.g., "lifeJuggler")' 
  },
  { 
    key: 'brandPercent', 
    label: 'Brand Percentage', 
    description: 'Brand voice percentage (e.g., "60")' 
  },
  { 
    key: 'drPercent', 
    label: 'DR Percentage', 
    description: 'Direct response percentage (e.g., "40")' 
  },
];

interface VariableInsertionProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  position?: 'left' | 'right';
  variables?: typeof STATIC_AD_SYSTEM_VARIABLES;
}

const VariableInsertion: React.FC<VariableInsertionProps> = ({ 
  textareaRef, 
  value, 
  onChange, 
  position = 'left',
  variables = STATIC_AD_SYSTEM_VARIABLES 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variableString = `{${variableKey}}`;
    
    const newValue = value.substring(0, start) + variableString + value.substring(end);
    onChange(newValue);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableString.length, start + variableString.length);
    }, 0);
    
    setIsOpen(false);
  };

  const dropdownClasses = position === 'right' 
    ? "absolute top-8 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64"
    : "absolute top-8 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64";

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 text-xs"
      >
        <Plus size={12} className="mr-1" />
        Insert Variable
      </Button>
      
      {isOpen && (
        <div className={dropdownClasses}>
          <div className="text-xs font-medium text-gray-700 mb-2 px-2">Available Variables:</div>
          {variables.map((variable) => (
            <button
              key={variable.key}
              onClick={() => insertVariable(variable.key)}
              className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-xs border-none bg-transparent"
            >
              <div className="font-mono text-blue-600">{`{${variable.key}}`}</div>
              <div className="font-medium text-gray-900">{variable.label}</div>
              <div className="text-gray-600 text-xs">{variable.description}</div>
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 px-2">
            <div className="text-xs text-gray-500">
              <strong>Note:</strong> Static ad analysis uses direct image input with minimal template variables.
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Helper function to generate a preview of the final system prompt with replaced variables
const generateSystemPromptPreview = (editingConfig: TrainingConfig): string => {
  const baseSystemPrompt = editingConfig?.stationPrompts?.staticAd?.systemPrompt || '';
  
  if (!baseSystemPrompt) {
    return 'No base system prompt configured yet.';
  }

  // Build AI Settings Context preview using actual config data
  let aiSettingsContext = '\n\nJONES ROAD BEAUTY BRAND GUIDELINES:\n';
  
  // Core Positioning
  if (editingConfig.brandGuidelines?.corePositioning) {
    aiSettingsContext += `Core Positioning: ${editingConfig.brandGuidelines.corePositioning}\n\n`;
  }

  // Brand Voice Rules
  if (editingConfig.brandGuidelines?.brandVoice?.length > 0) {
    aiSettingsContext += 'Brand Voice Rules:\n';
    editingConfig.brandGuidelines.brandVoice.forEach((rule, index) => {
      const isEnabled = !editingConfig.brandGuidelines?.enabledBrandVoice || 
                       editingConfig.brandGuidelines.enabledBrandVoice[index];
      if (isEnabled) {
        aiSettingsContext += `- ${rule}\n`;
      }
    });
    aiSettingsContext += '\n';
  }

  // Key Terms & Phrases
  if (editingConfig.brandGuidelines?.keyTerminology?.length > 0) {
    aiSettingsContext += 'Key Terms & Phrases:\n';
    editingConfig.brandGuidelines.keyTerminology.forEach((term: string, index: number) => {
      const isEnabled = !editingConfig.brandGuidelines?.enabledKeyTerminology || 
                       editingConfig.brandGuidelines.enabledKeyTerminology[index];
      if (isEnabled) {
        aiSettingsContext += `- ${term}\n`;
      }
    });
    aiSettingsContext += '\n';
  }

  // Approved Language
  if (editingConfig.brandGuidelines?.approvedLanguage?.length > 0) {
    aiSettingsContext += 'Approved Language:\n';
    editingConfig.brandGuidelines.approvedLanguage.forEach((phrase: string, index: number) => {
      const isEnabled = !editingConfig.brandGuidelines?.enabledApprovedLanguage || 
                       editingConfig.brandGuidelines.enabledApprovedLanguage[index];
      if (isEnabled) {
        aiSettingsContext += `- ${phrase}\n`;
      }
    });
    aiSettingsContext += '\n';
  }

  // Avoid These Phrases
  if (editingConfig.brandGuidelines?.avoidedLanguage?.length > 0) {
    aiSettingsContext += 'Avoid These Phrases:\n';
    editingConfig.brandGuidelines.avoidedLanguage.forEach((phrase: string, index: number) => {
      const isEnabled = !editingConfig.brandGuidelines?.enabledAvoidedLanguage || 
                       editingConfig.brandGuidelines.enabledAvoidedLanguage[index];
      if (isEnabled) {
        aiSettingsContext += `- ${phrase}\n`;
      }
    });
    aiSettingsContext += '\n';
  }

  // Product Claims (show first few products as example)
  if (editingConfig.productClaims && Object.keys(editingConfig.productClaims).length > 0) {
    const productNames = Object.keys(editingConfig.productClaims).slice(0, 2);
    productNames.forEach(productName => {
      const claims = editingConfig.productClaims[productName];
      aiSettingsContext += `PRODUCT-SPECIFIC CLAIMS FOR ${productName.toUpperCase()}:\n`;
      
      if (claims.approvedClaims?.length > 0) {
        aiSettingsContext += 'Approved Claims:\n';
        claims.approvedClaims.forEach((claim: string, index: number) => {
          const isEnabled = !claims.enabledApproved || claims.enabledApproved[index];
          if (isEnabled) {
            aiSettingsContext += `- ${claim}\n`;
          }
        });
      }
      
      if (claims.prohibitedClaims?.length > 0) {
        aiSettingsContext += 'Prohibited Claims (Never Use):\n';
        claims.prohibitedClaims.forEach((claim: string, index: number) => {
          const isEnabled = !claims.enabledProhibited || claims.enabledProhibited[index];
          if (isEnabled) {
            aiSettingsContext += `- ${claim}\n`;
          }
        });
      }
      aiSettingsContext += '\n';
    });
    
    if (Object.keys(editingConfig.productClaims).length > 2) {
      aiSettingsContext += `... and ${Object.keys(editingConfig.productClaims).length - 2} more products\n\n`;
    }
  }

  // Persona Pillars (show first few personas as example)
  if (editingConfig.personaPillars && Object.keys(editingConfig.personaPillars).length > 0) {
    const personaNames = Object.keys(editingConfig.personaPillars).slice(0, 2);
    personaNames.forEach(personaName => {
      const persona = editingConfig.personaPillars[personaName];
      aiSettingsContext += `TARGET PERSONA - ${personaName.toUpperCase()}:\n`;
      
      if (persona.description) {
        aiSettingsContext += `Description: ${persona.description}\n`;
      }
      
      if (persona.pillars?.length > 0) {
        aiSettingsContext += 'Key Pillars:\n';
        persona.pillars.forEach(pillar => {
          aiSettingsContext += `- ${pillar}\n`;
        });
      }
      aiSettingsContext += '\n';
    });
    
    if (Object.keys(editingConfig.personaPillars).length > 2) {
      aiSettingsContext += `... and ${Object.keys(editingConfig.personaPillars).length - 2} more personas\n\n`;
    }
  }

  // Brand/DR Balance placeholder
  aiSettingsContext += 'BRAND/DR BALANCE: [Set at request time - e.g., 60% Brand Voice, 40% Direct Response]';

  return baseSystemPrompt + aiSettingsContext;
};

// Helper functions for protected prompts
const extractOutputStructure = (prompt: string) => {
  const outputRequirementMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*})/i);
  if (outputRequirementMatch) {
    return outputRequirementMatch[1];
  }
  
  const arrayStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*\])/i);
  if (arrayStructureMatch) {
    return arrayStructureMatch[1];
  }
  
  const textStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?You MUST return your response as[^.]*\.)/i);
  if (textStructureMatch) {
    return textStructureMatch[1];
  }
  
  return null;
};

const getEditablePrompt = (prompt: string) => {
  const structure = extractOutputStructure(prompt);
  if (structure) {
    return prompt.replace(structure, '').trim();
  }
  return prompt;
};

const reconstructPrompt = (editableContent: string, originalPrompt: string) => {
  const structure = extractOutputStructure(originalPrompt);
  if (structure) {
    const lines = editableContent.split('\n');
    const insertIndex = lines.findIndex(line => line.trim() === '') || 1;
    const beforeStructure = lines.slice(0, insertIndex).join('\n');
    const afterStructure = lines.slice(insertIndex).join('\n');
    
    return `${beforeStructure}\n\n${structure}\n\n${afterStructure}`.trim();
  }
  return editableContent;
};

const ProtectedPromptEditor = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 8,
  disabled = false,
  copyToClipboard,
  textareaRef,
  variables
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  variables?: typeof STATIC_AD_SYSTEM_VARIABLES;
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
            <div className="flex items-center space-x-2">
              {!disabled && textareaRef && variables && (
                <VariableInsertion
                  textareaRef={textareaRef}
                  value={editableContent}
                  onChange={handleChange}
                  position="right"
                  variables={variables}
                />
              )}
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
          </div>
          
          {disabled ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {editableContent || placeholder}
              </pre>
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
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

      {outputStructure && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Protected Output Structure</span>
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

const EnhancedTextField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 4,
  disabled = false,
  bgColor = "bg-blue-50",
  borderColor = "border-blue-200",
  copyToClipboard
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  bgColor?: string;
  borderColor?: string;
  copyToClipboard: (text: string, label: string) => Promise<void>;
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

const EnhancedArrayField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 4,
  disabled = false,
  bgColor = "bg-green-50",
  borderColor = "border-green-200",
  copyToClipboard
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  bgColor?: string;
  borderColor?: string;
  copyToClipboard: (text: string, label: string) => Promise<void>;
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

export const StaticAdStation: React.FC<StaticAdStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard
}) => {
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const toggleStation = (stationId: string) => {
    const newExpanded = new Set(expandedStations);
    if (expandedStations.has(stationId)) {
      newExpanded.delete(stationId);
    } else {
      newExpanded.add(stationId);
    }
    setExpandedStations(newExpanded);
  };

  return (
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
          
          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('staticAd-systemPrompt')) {
                  newExpanded.delete('staticAd-systemPrompt');
                } else {
                  newExpanded.add('staticAd-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('staticAd-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('staticAd-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('staticAd-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('staticAd-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                {/* System Prompt Structure Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">🔧 How System Prompt is Generated</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The final system prompt sent to Claude combines: <strong>Base System Prompt</strong> + <strong>AI Settings Context</strong> (brand guidelines, product claims, persona pillars, etc.)
                  </p>
                </div>

                {/* Base System Prompt - Editable */}
                <div className="space-y-4 bg-white border rounded-lg p-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Base System Prompt (Editable)</h4>
                      <div className="flex items-center space-x-2">
                        {effectiveUser?.role === 'admin' && (
                          <VariableInsertion
                            textareaRef={systemPromptTextareaRef}
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
                            position="right"
                            variables={STATIC_AD_SYSTEM_VARIABLES}
                          />
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(editingConfig?.stationPrompts?.staticAd?.systemPrompt || '', 'Base System Prompt')}
                          disabled={!editingConfig?.stationPrompts?.staticAd?.systemPrompt}
                        >
                          <Copy size={16} className="mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    {effectiveUser?.role !== 'admin' ? (
                      <div className="bg-blue-50 rounded-lg p-4 border-blue-200 border max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {editingConfig?.stationPrompts?.staticAd?.systemPrompt || "You are a static ad copywriter specializing in visual-first advertising formats..."}
                        </pre>
                      </div>
                    ) : (
                      <Textarea
                        ref={systemPromptTextareaRef}
                        value={editingConfig?.stationPrompts?.staticAd?.systemPrompt || ''}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          stationPrompts: {
                            ...editingConfig?.stationPrompts,
                            staticAd: {
                              ...editingConfig?.stationPrompts?.staticAd,
                              systemPrompt: e.target.value
                            }
                          }
                        })}
                        className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
                        rows={8}
                        placeholder="You are a static ad copywriter specializing in visual-first advertising formats..."
                      />
                    )}
                  </div>
                </div>

                {/* Final System Prompt Preview - Shows actual resolved prompt */}
                <div className="space-y-4 bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Final System Prompt Preview (With Resolved Values)</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(generateSystemPromptPreview(editingConfig), 'Final System Prompt Preview')}
                      disabled={!editingConfig?.stationPrompts?.staticAd?.systemPrompt}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy Preview
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {generateSystemPromptPreview(editingConfig)}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This shows how the final system prompt will look with your current Brand Guidelines, Product Claims, and Persona Pillars. The Brand/DR balance will be set dynamically at request time.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('staticAd-userPrompt')) {
                  newExpanded.delete('staticAd-userPrompt');
                } else {
                  newExpanded.add('staticAd-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('staticAd-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">User Prompt Configuration</h3>
                  {!expandedStations.has('staticAd-userPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('staticAd-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('staticAd-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                {/* User Prompt Structure Explanation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">📝 How User Prompt is Generated</p>
                  <p className="text-sm text-green-700 mt-1">
                    The final user prompt combines: <strong>Base User Template</strong> + <strong>Dynamic Sections</strong> (landing page context, persona targeting, product focus, copy frameworks, custom brief, image analysis)
                  </p>
                </div>

                {/* Base User Prompt Template - Editable */}
                <div className="space-y-4 bg-white border rounded-lg p-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Base User Prompt Template (Editable)</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || '', 'Base User Prompt Template')}
                        disabled={!editingConfig?.stationPrompts?.staticAd?.userPromptTemplate}
                      >
                        <Copy size={16} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                    {effectiveUser?.role !== 'admin' ? (
                      <div className="bg-green-50 rounded-lg p-4 border-green-200 border max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || "Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."}
                        </pre>
                      </div>
                    ) : (
                      <Textarea
                        value={editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || ''}
                        onChange={(e) => setEditingConfig({
                          ...editingConfig,
                          stationPrompts: {
                            ...editingConfig?.stationPrompts,
                            staticAd: {
                              ...editingConfig?.stationPrompts?.staticAd,
                              userPromptTemplate: e.target.value
                            }
                          }
                        })}
                        className="text-gray-900 resize-y border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-4 transition-all duration-200"
                        rows={6}
                        placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]...&#10;&#10;CONTENT INPUTS:&#10;TRANSCRIPTION/BRIEF: {transcription}&#10;LANDING PAGE CONTEXT: {landingPageContext}&#10;&#10;[Additional template content...]"
                        disabled={false}
                      />
                    )}
                  </div>
                </div>

                {/* Dynamic Sections - Read-only preview */}
                <div className="space-y-4 bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Dynamic Sections (Auto-Generated - Read Only)</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(`
TARGET PERSONA - {CONCEPT}:
Description: {personaDescription}
Key Targeting Pillars:
- {pillar1}
- {pillar2}

PERSONA-SPECIFIC TARGETING REQUIREMENTS:
- Tailor ALL headlines and primary text to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges

PRODUCT FOCUS:
Primary Product: {selectedProductDisplayName}

PRODUCT-SPECIFIC CLAIMS:
{PRODUCT_NAME}:
Approved Claims (USE THESE):
- {approvedClaim1}
- {approvedClaim2}

Prohibited Claims (NEVER USE):
- {prohibitedClaim1}
- {prohibitedClaim2}

PRODUCT-SPECIFIC REQUIREMENTS:
- Feature the selected product(s) prominently in headlines and copy
- Use ONLY the approved claims listed above for each product
- NEVER use any of the prohibited claims listed above
- Highlight unique benefits and selling points of these specific products
- Create compelling product-focused calls-to-action
- Ensure copy drives interest in these specific products

IMAGE-TEXT BALANCE RULES:
- {imageTextRule1}
- {imageTextRule2}
- ...

PLATFORM-SPECIFIC GUIDELINES:
- {platformGuideline1}
- {platformGuideline2}
- ...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the ad copy while maintaining brand voice and framework structure.

EXISTING AD CREATIVE ANALYSIS:
{imageAnalysisInstructions}`, 'Dynamic Sections Template')}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy Template
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-80 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`TARGET PERSONA - {CONCEPT}:
Description: {personaDescription}
Key Targeting Pillars:
- {pillar1}
- {pillar2}
- ...

PERSONA-SPECIFIC TARGETING REQUIREMENTS:
- Tailor ALL headlines and primary text to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges

PRODUCT FOCUS:
Primary Product: {selectedProductDisplayName}

PRODUCT-SPECIFIC CLAIMS:
{PRODUCT_NAME}:
Approved Claims (USE THESE):
- {approvedClaim1}
- {approvedClaim2}
- ...

Prohibited Claims (NEVER USE):
- {prohibitedClaim1}
- {prohibitedClaim2}
- ...

PRODUCT-SPECIFIC REQUIREMENTS:
- Feature the selected product(s) prominently in headlines and copy
- Use ONLY the approved claims listed above for each product
- NEVER use any of the prohibited claims listed above
- Highlight unique benefits and selling points of these specific products
- Create compelling product-focused calls-to-action
- Ensure copy drives interest in these specific products

IMAGE-TEXT BALANCE RULES:
- {imageTextRule1}
- {imageTextRule2}
- ...

PLATFORM-SPECIFIC GUIDELINES:
- {platformGuideline1}
- {platformGuideline2}
- ...

LANDING PAGE CONTEXT:
{landingPageContent}

FUNNEL ALIGNMENT REQUIREMENT:
Ensure the ad copy creates a seamless transition from ad to landing page...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the ad copy while maintaining brand voice and framework structure.

EXISTING AD CREATIVE ANALYSIS:
{imageAnalysisInstructions}`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    These sections are dynamically generated based on your selections: persona concept, selected products, landing page URL, custom brief, uploaded images, and station-specific rules (Image-Text Balance, Platform Guidelines). Only sections with data will be included.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Station-Specific Configuration */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('staticAd-stationConfig')) {
                  newExpanded.delete('staticAd-stationConfig');
                } else {
                  newExpanded.add('staticAd-stationConfig');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('staticAd-stationConfig') ? (
                    <ChevronDown className="w-4 h-4 text-purple-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="text-purple-600">⚙️</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-purple-900">Station-Specific Configuration</h3>
                  {!expandedStations.has('staticAd-stationConfig') && (
                    <p className="text-sm text-purple-700 mt-1">Image-Text Balance Rules & Platform Guidelines</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-purple-600 font-medium">
                  {expandedStations.has('staticAd-stationConfig') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('staticAd-stationConfig') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
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
                  copyToClipboard={copyToClipboard}
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
                  copyToClipboard={copyToClipboard}
                />
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">⚡ Final Prompt Assembly</p>
            <p className="text-sm text-amber-700 mt-1">
              <strong>System Prompt:</strong> Base System Prompt + AI Settings Context + TARGET AUDIENCE: {`{targetAudience}`}
              <br />
              <strong>User Prompt:</strong> Base User Template + Landing Page Context + Target Persona Section + Selected Products Section + Image-Text Balance Rules + Platform Guidelines + Custom Brief Section + Image Analysis Section
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 