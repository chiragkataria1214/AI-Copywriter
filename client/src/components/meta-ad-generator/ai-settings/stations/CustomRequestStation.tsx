import React, { useState, useRef } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { ChevronDown, ChevronRight, Sparkles, Lock, Copy, Plus } from 'lucide-react';
import { EnhancedArrayField, EnhancedTextField } from '@/components/meta-ad-generator/ai-settings/common/EnhancedFields';

interface CustomRequestStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';

// Use shared VariableInsertion inside ProtectedPromptEditor

// Use shared ProtectedPromptEditor and Enhanced Fields

export const CustomRequestStation: React.FC<CustomRequestStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const stationConfig = editingConfig.stationPrompts?.customRequest;
  const contextConfig = stationConfig?.contextConfiguration as any;
  
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
        isOpen={expandedStations.has('customRequest')}
        onClick={() => toggleStation('customRequest')}
        title="Custom Request Station"
        icon={<Sparkles className="w-5 h-5" />}
        iconColor="text-pink-500"
        description="Versatile copywriter for any custom marketing request"
      />
      
      {expandedStations.has('customRequest') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'customRequest'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          
          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('customRequest-systemPrompt')) {
                  newExpanded.delete('customRequest-systemPrompt');
                } else {
                  newExpanded.add('customRequest-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('customRequest-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('customRequest-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('customRequest-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('customRequest-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
        

                {/* Base User Prompt Template - Editable */}
                <EnhancedTextField
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.customRequest?.userPromptTemplate || ''}
                  onChange={(value: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig?.stationPrompts,
                        customRequest: {
                          ...editingConfig?.stationPrompts?.customRequest,
                          userPromptTemplate: value
                        }
                      }
                    });
                  }}
                  placeholder="Handle this custom request: [USER_REQUEST] for [BRAND/PRODUCT] with [SPECIFIC_REQUIREMENTS]..."
                  rows={4}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Request Type Guidelines - Editable */}
                <EnhancedArrayField
                  label="Request Type Guidelines (Editable)"
                  value={editingConfig?.stationPrompts?.customRequest?.requestTypeGuidelines || []}
                  onChange={(value: string[]) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig?.stationPrompts,
                        customRequest: {
                          ...editingConfig?.stationPrompts?.customRequest,
                          requestTypeGuidelines: value
                        }
                      }
                    });
                  }}
                  placeholder="Product descriptions: Focus on benefits and use cases&#10;Social media captions: Platform-appropriate length and tone&#10;Blog posts: SEO-optimized with clear structure"
                  rows={5}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-rose-50"
                  borderColor="border-rose-200"
                  copyToClipboard={copyToClipboard}
                />

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

PERSONA-SPECIFIC REQUIREMENTS:
- Tailor ALL content to speak directly to this persona
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

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the content while maintaining brand voice and request type guidelines.`, 'Dynamic Sections Template')}
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

PERSONA-SPECIFIC REQUIREMENTS:
- Tailor ALL content to speak directly to this persona
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

REQUEST TYPE GUIDELINES:
{requestTypeGuideline1}
{requestTypeGuideline2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the content while maintaining brand voice and request type guidelines.`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    These sections are dynamically generated based on your selections: persona, selected products, request type guidelines, and custom brief. Only sections with data will be included.
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
              <strong>User Prompt:</strong> Base User Template + Target Persona Section + Selected Products Section + Request Type Guidelines + Custom Brief Section
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 