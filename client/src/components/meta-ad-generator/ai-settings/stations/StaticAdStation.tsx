import React, { useState, useRef } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { ChevronDown, ChevronRight, Image, Lock, Copy, Plus, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractOutputStructure as extractOutputStructureCommon } from '@/components/meta-ad-generator/ai-settings/common/promptUtils';
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { EnhancedArrayField, EnhancedTextField } from '@/components/meta-ad-generator/ai-settings/common/EnhancedFields';

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
const STATIC_AD_SYSTEM_VARIABLES: VariableDefinition[] = [
  { 
    key: 'persona', 
    label: 'Persona', 
    description: 'The selected persona (e.g., "lifeJuggler")',
    type: 'string',
    category: 'ai_settings',
    required: false,
  },
  { 
    key: 'brandPercent', 
    label: 'Brand Percentage', 
    description: 'Brand voice percentage (e.g., "60")',
    type: 'number',
    category: 'ai_settings',
    required: false,
  },
  { 
    key: 'drPercent', 
    label: 'DR Percentage', 
    description: 'Direct response percentage (e.g., "40")',
    type: 'number',
    category: 'ai_settings',
    required: false,
  },
];

// Use shared VariableInsertion inside ProtectedPromptEditor

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

// Use shared ProtectedPromptEditor and Enhanced Fields

export const StaticAdStation: React.FC<StaticAdStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard
}) => {
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const stationConfig = editingConfig.stationPrompts?.staticAd;
  const [showSystemPreview, setShowSystemPreview] = useState(false);
  const [showUserPreview, setShowUserPreview] = useState(false);
  const contextConfig = stationConfig?.contextConfiguration as any;

  const getAllAvailableVariables = (): VariableDefinition[] => {
    const regular = (contextConfig?.availableVariables || []) as VariableDefinition[];
    const sections = (contextConfig?.contextSections || [])
      .filter((s: any) => s.enabled)
      .map((s: any) => ({
        key: s.id,
        label: `Context: ${s.name}`,
        description: `Generated content from "${s.name}" context section: ${s.description}`,
        type: 'string' as const,
        category: 'context_section' as const,
        required: s.required,
      }));
    const brandGuidelineVariables: VariableDefinition[] = [
      { key: 'corePositioning', label: 'Core Positioning', description: 'Brand core positioning statement from brand guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'brandVoice', label: 'Brand Voice', description: 'Brand voice rules and guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'keyTerminology', label: 'Key Terminology', description: 'Key terms and phrases from brand guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'approvedLanguage', label: 'Approved Language', description: 'Approved language and phrases from brand guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'avoidedLanguage', label: 'Avoided Language', description: 'Language and phrases to avoid from brand guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
    ];
    return [...regular, ...sections, ...brandGuidelineVariables];
  };
  
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
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'staticAd'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          
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
          

                {/* Base System Prompt - Editable (Shared UI) */}
                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
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
                  rows={8}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  textareaRef={systemPromptTextareaRef}
                  variables={getAllAvailableVariables()}
                  contextConfiguration={editingConfig?.stationPrompts?.staticAd?.contextConfiguration as any}
                />

                {/* Final System Prompt Preview removed; use Preview button in user template section */}
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
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || '', 'Base User Prompt Template')}
                          disabled={!editingConfig?.stationPrompts?.staticAd?.userPromptTemplate}
                        >
                          <Copy size={16} className="mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowUserPreview(true)} title="View resolved user prompt">
                          <Eye size={16} className="mr-1" />
                          Preview
                        </Button>
                      </div>
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
                         placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."
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
TARGET PERSONA -
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
{`TARGET PERSONA -
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
                    These sections are dynamically generated based on your selections: persona, selected products, landing page URL, custom brief, uploaded images, and station-specific rules (Image-Text Balance, Platform Guidelines). Only sections with data will be included.
                  </p>
                </div>
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

          {/* Preview Dialogs */}
          <Dialog open={showSystemPreview} onOpenChange={setShowSystemPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Resolved System Prompt</DialogTitle>
              </DialogHeader>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[60vh] overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{generateSystemPromptPreview(editingConfig)}</pre>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showUserPreview} onOpenChange={setShowUserPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Resolved User Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[40vh] overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || ''}</pre>
                </div>
                {extractOutputStructureCommon(editingConfig?.stationPrompts?.staticAd?.systemPrompt || '') && (
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-amber-800 mb-2">Output Structure</div>
                    <div className="bg-white border border-amber-200 rounded p-3 max-h-[30vh] overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{extractOutputStructureCommon(editingConfig?.stationPrompts?.staticAd?.systemPrompt || '')}</pre>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}; 