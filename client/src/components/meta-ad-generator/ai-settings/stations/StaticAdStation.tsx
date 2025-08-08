import React, { useState, useRef, useEffect } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { ChevronDown, ChevronRight, Image, Lock, Copy, Plus, Eye } from 'lucide-react';
import { extractOutputStructure as extractOutputStructureCommon } from '@/components/meta-ad-generator/ai-settings/common/promptUtils';
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 
  
interface StaticAdStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';

const generateSystemPromptPreview = (config: TrainingConfig): string => {
  const staticAdPrompt = config.stationPrompts?.staticAd?.systemPrompt || '';
  const contextConfig = config.stationPrompts?.staticAd?.contextConfiguration as any;

  if (!contextConfig) {
    return staticAdPrompt;
  }

  const enabledContextSections = (contextConfig.contextSections || [])
    .filter((s: any) => s.enabled)
    .map((s: any) => `\n\n**[${s.name.toUpperCase()}]**\n{${s.id}}`)
    .join('');

  return `${staticAdPrompt}${enabledContextSections}`;
};

// Use shared VariableInsertion inside ProtectedPromptEditor

// Use shared ProtectedPromptEditor and Enhanced Fields

export const StaticAdStation: React.FC<StaticAdStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const stationConfig = editingConfig.stationPrompts?.staticAd;
  const [showSystemPreview, setShowSystemPreview] = useState(false);
  const [showUserPreview, setShowUserPreview] = useState(false);
  const contextConfig = stationConfig?.contextConfiguration as any;

  useEffect(() => {
    if (!editingConfig.stationPrompts.staticAd) {
      const staticAdDefaults = {
        userPromptTemplate: "Default user prompt for static ad...",
        systemPrompt: "Default system prompt for static ad...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          staticAd: staticAdDefaults,
        },
      });
    }
  }, [editingConfig, setEditingConfig]);

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
                  onChange={(newValue: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig.stationPrompts,
                        staticAd: {
                          ...stationConfig,
                          systemPrompt: newValue,
                        },
                      },
                    });
                  }}
                  placeholder="You are a static ad copywriter specializing in visual-first advertising formats..."
                  rows={8}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  textareaRef={systemPromptTextareaRef}
                  contextConfiguration={editingConfig?.stationPrompts?.staticAd?.contextConfiguration as any}
                />
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowSystemPreview(true)} title="View resolved system prompt">
                    <Eye size={16} className="mr-1" />
                    Preview
                  </Button>
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
            

                {/* Base User Prompt Template - Editable */}
                <ProtectedPromptEditor
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || ''}
                  onChange={(newValue: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig.stationPrompts,
                        staticAd: {
                          ...stationConfig,
                          userPromptTemplate: newValue,
                        },
                      },
                    });
                  }}
                  placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."
                  rows={6}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  contextConfiguration={editingConfig?.stationPrompts?.staticAd?.contextConfiguration as any}
                />
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowUserPreview(true)} title="View resolved user prompt">
                    <Eye size={16} className="mr-1" />
                    Preview
                  </Button>
                </div>

                {/* Dynamic Sections - Read-only preview */}
                {/* <div className="space-y-4 bg-white border rounded-lg p-4">
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
                </div> */}
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