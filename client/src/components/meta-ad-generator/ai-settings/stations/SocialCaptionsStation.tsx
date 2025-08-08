import React, { useState, useEffect } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Target, Lock, Copy, Eye, Plus } from 'lucide-react';
 
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { EnhancedTextField, EnhancedArrayField } from '@/components/meta-ad-generator/ai-settings/common/EnhancedFields';

import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';
import { TrainingConfig } from '@shared/training-config';

interface SocialCaptionsStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const SocialCaptionsStation: React.FC<SocialCaptionsStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.socialCaptions;
  const contextConfig = stationConfig?.contextConfiguration as any;

  useEffect(() => {
    if (!editingConfig.stationPrompts.socialCaptions) {
      const socialCaptionsDefaults = {
        userPromptTemplate: "Default user prompt for social captions...",
        systemPrompt: "Default system prompt for social captions...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
        platformGuidelines: [],
        hashtagStrategy: [],
        engagementTactics: [],
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          socialCaptions: socialCaptionsDefaults,
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
        isOpen={expandedStations.has('socialCaptions')}
        onClick={() => toggleStation('socialCaptions')}
        title="Social Captions Station"
        icon={<Target className="w-5 h-5" />}
        iconColor="text-blue-400"
        description="Platform-optimized social media captions and hashtag strategies"
      />
      
      {expandedStations.has('socialCaptions') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'socialCaptions'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          
          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('socialCaptions-systemPrompt')) {
                  newExpanded.delete('socialCaptions-systemPrompt');
                } else {
                  newExpanded.add('socialCaptions-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('socialCaptions-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('socialCaptions-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('socialCaptions-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('socialCaptions-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
           
                {/* Base System Prompt - Editable */}
                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.systemPrompt || ''}
                  onChange={(newValue: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig.stationPrompts,
                        socialCaptions: {
                          ...stationConfig,
                          systemPrompt: newValue,
                        },
                      },
                    });
                  }}
                  placeholder="You are a social media copywriter specializing in platform-optimized captions and engagement..."
                  rows={6}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  contextConfiguration={editingConfig?.stationPrompts?.socialCaptions?.contextConfiguration as any}
                />

                {/* AI Settings Context - Read-only preview */}
                <div className="space-y-4 bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">AI Settings Context (Auto-Generated - Read Only)</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(`
JONES ROAD BEAUTY BRAND GUIDELINES:
Core Positioning: {corePositioning}

Brand Voice Rules:
- {brandVoiceRule1}
- {brandVoiceRule2}
- ...

Key Terms & Phrases:
- {keyTerm1}
- {keyTerm2}
- ...

Approved Language:
- {approvedPhrase1}
- {approvedPhrase2}
- ...

Avoid These Phrases:
- {avoidedPhrase1}
- {avoidedPhrase2}
- ...

PRODUCT-SPECIFIC CLAIMS FOR {SELECTED_PRODUCT}:
Approved Claims:
- {approvedClaim1}
- {approvedClaim2}
- ...

Prohibited Claims (Never Use):
- {prohibitedClaim1}
- {prohibitedClaim2}
- ...

TARGET PERSONA -
Description: {personaDescription}
Key Pillars:
- {pillar1}
- {pillar2}
- ...

BRAND/DR BALANCE: {brandPercent}% Brand Voice, {drPercent}% Direct Response`, 'AI Settings Context Template')}
                    >
                      <Copy size={16} className="mr-1" />
                      Copy Template
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`JONES ROAD BEAUTY BRAND GUIDELINES:
Core Positioning: {corePositioning}

Brand Voice Rules:
- {brandVoiceRule1}
- {brandVoiceRule2}
- ...

Key Terms & Phrases:
- {keyTerm1}
- {keyTerm2}
- ...

Approved Language:
- {approvedPhrase1}
- {approvedPhrase2}
- ...

Avoid These Phrases:
- {avoidedPhrase1}
- {avoidedPhrase2}
- ...

PRODUCT-SPECIFIC CLAIMS FOR {SELECTED_PRODUCT}:
Approved Claims:
- {approvedClaim1}
- {approvedClaim2}
- ...

Prohibited Claims (Never Use):
- {prohibitedClaim1}
- {prohibitedClaim2}
- ...

TARGET PERSONA -
Description: {personaDescription}
Key Pillars:
- {pillar1}
- {pillar2}
- ...

BRAND/DR BALANCE: {brandPercent}% Brand Voice, {drPercent}% Direct Response`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This context is automatically built from your Brand Guidelines, Product Claims, Persona Pillars, and request parameters. Configure these in their respective tabs above.
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
                if (expandedStations.has('socialCaptions-userPrompt')) {
                  newExpanded.delete('socialCaptions-userPrompt');
                } else {
                  newExpanded.add('socialCaptions-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('socialCaptions-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">User Prompt Configuration</h3>
                  {!expandedStations.has('socialCaptions-userPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('socialCaptions-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('socialCaptions-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
            

                {/* Base User Prompt Template - Editable */}
                <EnhancedTextField
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.userPromptTemplate || ''}
                  onChange={(value: string) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      socialCaptions: {
                        ...editingConfig?.stationPrompts?.socialCaptions,
                        userPromptTemplate: value
                      }
                    }
                  })
}
}}
                  placeholder="Create [PLATFORM] caption for [CONTENT_TYPE] about [TOPIC] targeting [AUDIENCE]..."
                  rows={4}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Platform Guidelines - Editable */}
                <EnhancedArrayField
                  label="Platform Guidelines (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.platformGuidelines || []}
                  onChange={(value: string[]) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      socialCaptions: {
                        ...editingConfig?.stationPrompts?.socialCaptions,
                        platformGuidelines: value
                      }
                    }
                  })
}
}}
                  placeholder="Instagram: 125 characters optimal, use emojis, include CTA&#10;Facebook: Longer form OK, ask questions for engagement&#10;Twitter: 280 characters max, use trending hashtags"
                  rows={5}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Hashtag Strategy - Editable */}
                <EnhancedArrayField
                  label="Hashtag Strategy (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.hashtagStrategy || []}
                  onChange={(value: string[]) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      socialCaptions: {
                        ...editingConfig?.stationPrompts?.socialCaptions,
                        hashtagStrategy: value
                      }
                    }
                  })
}
}}
                  placeholder="Mix of branded, niche, and trending hashtags&#10;Instagram: 5-10 hashtags optimal&#10;LinkedIn: 3-5 hashtags maximum"
                  rows={5}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-pink-50"
                  borderColor="border-pink-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Engagement Tactics - Editable */}
                <EnhancedArrayField
                  label="Engagement Tactics (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.engagementTactics || []}
                  onChange={(value: string[]) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      socialCaptions: {
                        ...editingConfig?.stationPrompts?.socialCaptions,
                        engagementTactics: value
                      }
                    }
                  })
}
}}
                  placeholder="Ask questions to encourage comments&#10;Use polls and interactive features&#10;Include clear call-to-action"
                  rows={4}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-cyan-50"
                  borderColor="border-cyan-200"
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
- Tailor ALL captions to speak directly to this persona
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

PLATFORM GUIDELINES:
{platformGuideline1}
{platformGuideline2}
...

HASHTAG STRATEGY:
{hashtagStrategy1}
{hashtagStrategy2}
...

ENGAGEMENT TACTICS:
{engagementTactic1}
{engagementTactic2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the social captions while maintaining brand voice and platform guidelines.`, 'Dynamic Sections Template')}
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
- Tailor ALL captions to speak directly to this persona
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

PLATFORM GUIDELINES:
{platformGuideline1}
{platformGuideline2}
...

HASHTAG STRATEGY:
{hashtagStrategy1}
{hashtagStrategy2}
...

ENGAGEMENT TACTICS:
{engagementTactic1}
{engagementTactic2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the social captions while maintaining brand voice and platform guidelines.`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    These sections are dynamically generated based on your selections: persona, selected products, platform guidelines, hashtag strategy, engagement tactics, and custom brief. Only sections with data will be included.
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
              <strong>User Prompt:</strong> Base User Template + Target Persona Section + Selected Products Section + Platform Guidelines + Hashtag Strategy + Engagement Tactics + Custom Brief Section
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 