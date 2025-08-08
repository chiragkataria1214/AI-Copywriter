import React, { useRef, useState, useEffect } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { ChevronDown, ChevronRight, FileText, Lock, Copy, Eye, Plus } from 'lucide-react';
 
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { EnhancedTextField, EnhancedArrayField } from '@/components/meta-ad-generator/ai-settings/common/EnhancedFields';


import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';

interface StorySequencesStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const StorySequencesStation: React.FC<StorySequencesStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.storySequences;
  const contextConfig = stationConfig?.contextConfiguration as any;

  useEffect(() => {
    if (!editingConfig.stationPrompts.storySequences) {
      const storySequencesDefaults = {
        userPromptTemplate: "Default user prompt for story sequences...",
        systemPrompt: "Default system prompt for story sequences...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
        storyStructureGuidelines: [],
        sequenceTiming: [],
        narrativeTechniques: [],
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          storySequences: storySequencesDefaults,
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
        isOpen={expandedStations.has('storySequences')}
        onClick={() => toggleStation('storySequences')}
        title="Story Sequences Station"
        icon={<FileText className="w-5 h-5" />}
        iconColor="text-indigo-500"
        description="Multi-part storytelling sequences for sustained engagement"
      />
      
      {expandedStations.has('storySequences') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'storySequences'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          
          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('storySequences-systemPrompt')) {
                  newExpanded.delete('storySequences-systemPrompt');
                } else {
                  newExpanded.add('storySequences-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('storySequences-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('storySequences-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('storySequences-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('storySequences-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
         
                {/* Base System Prompt - Editable */}
                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
                  value={editingConfig?.stationPrompts?.storySequences?.systemPrompt || ''}
                  onChange={(newValue: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig.stationPrompts,
                        storySequences: {
                          ...stationConfig,
                          systemPrompt: newValue,
                        },
                      },
                    });
                  }}
                  placeholder="You are a story sequence specialist creating multi-part narratives for sustained audience engagement..."
                  rows={6}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  contextConfiguration={editingConfig?.stationPrompts?.storySequences?.contextConfiguration as any}
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
                if (expandedStations.has('storySequences-userPrompt')) {
                  newExpanded.delete('storySequences-userPrompt');
                } else {
                  newExpanded.add('storySequences-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('storySequences-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">User Prompt Configuration</h3>
                  {!expandedStations.has('storySequences-userPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('storySequences-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('storySequences-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
              

                {/* Base User Prompt Template - Editable */}
                <EnhancedTextField
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.storySequences?.userPromptTemplate || ''}
                  onChange={(value: string) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      storySequences: {
                        ...editingConfig?.stationPrompts?.storySequences,
                        userPromptTemplate: value
                      }
                    }
                  })
}
}}
                  placeholder="Create a [X]-part story sequence about [TOPIC] for [PLATFORM] with [NARRATIVE_STYLE]..."
                  rows={4}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Story Structure Guidelines - Editable */}
                <EnhancedArrayField
                  label="Story Structure Guidelines (Editable)"
                  value={editingConfig?.stationPrompts?.storySequences?.storyStructureGuidelines || []}
                  onChange={(value: string[]) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      storySequences: {
                        ...editingConfig?.stationPrompts?.storySequences,
                        storyStructureGuidelines: value
                      }
                    }
                  })
}
}}
                  placeholder="Hook: Start with compelling opening that creates curiosity&#10;Build: Develop tension and emotional investment&#10;Climax: Deliver key message or revelation&#10;Resolution: Clear call-to-action or next steps"
                  rows={5}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Sequence Timing - Editable */}
                <EnhancedArrayField
                  label="Sequence Timing (Editable)"
                  value={editingConfig?.stationPrompts?.storySequences?.sequenceTiming || []}
                  onChange={(value: string[]) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      storySequences: {
                        ...editingConfig?.stationPrompts?.storySequences,
                        sequenceTiming: value
                      }
                    }
                  })
}
}}
                  placeholder="Instagram Stories: 15-second segments&#10;Email sequences: 24-48 hour intervals&#10;Social posts: Daily or every other day"
                  rows={4}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-teal-50"
                  borderColor="border-teal-200"
                  copyToClipboard={copyToClipboard}
                />

                {/* Narrative Techniques - Editable */}
                <EnhancedArrayField
                  label="Narrative Techniques (Editable)"
                  value={editingConfig?.stationPrompts?.storySequences?.narrativeTechniques || []}
                  onChange={(value: string[]) => {
if(effectiveUser?.role === 'admin') {
setIsDirty(true);
setEditingConfig({
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig?.stationPrompts,
                      storySequences: {
                        ...editingConfig?.stationPrompts?.storySequences,
                        narrativeTechniques: value
                      }
                    }
                  })
}
}}
                  placeholder="Cliffhangers: End each part with suspense&#10;Character development: Relatable protagonists&#10;Emotional arcs: Journey from problem to solution&#10;Visual storytelling: Describe scenes vividly"
                  rows={5}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-slate-50"
                  borderColor="border-slate-200"
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
- Tailor ALL story content to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges in the narrative

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

STORY STRUCTURE GUIDELINES:
{storyGuideline1}
{storyGuideline2}
...

SEQUENCE TIMING:
{timingGuideline1}
{timingGuideline2}
...

NARRATIVE TECHNIQUES:
{narrativeTechnique1}
{narrativeTechnique2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the story sequence while maintaining brand voice and narrative guidelines.`, 'Dynamic Sections Template')}
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
- Tailor ALL story content to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges in the narrative

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

STORY STRUCTURE GUIDELINES:
{storyGuideline1}
{storyGuideline2}
...

SEQUENCE TIMING:
{timingGuideline1}
{timingGuideline2}
...

NARRATIVE TECHNIQUES:
{narrativeTechnique1}
{narrativeTechnique2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the story sequence while maintaining brand voice and narrative guidelines.`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    These sections are dynamically generated based on your selections: persona, selected products, story structure guidelines, sequence timing, narrative techniques, and custom brief. Only sections with data will be included.
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
              <strong>User Prompt:</strong> Base User Template + Target Persona Section + Selected Products Section + Story Structure Guidelines + Sequence Timing + Narrative Techniques + Custom Brief Section
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 