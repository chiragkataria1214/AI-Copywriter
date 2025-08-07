import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, Target, Lock, Copy } from 'lucide-react';

interface SocialCaptionsStationProps {
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

// Helper components (shared logic)
const extractOutputStructure = (prompt: string) => {
  const outputRequirementMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*})/i);
  if (outputRequirementMatch) return outputRequirementMatch[1];
  const arrayStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*\])/i);
  if (arrayStructureMatch) return arrayStructureMatch[1];
  const textStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?You MUST return your response as[^.]*\.)/i);
  if (textStructureMatch) return textStructureMatch[1];
  return null;
};

const getEditablePrompt = (prompt: string) => {
  const structure = extractOutputStructure(prompt);
  return structure ? prompt.replace(structure, '').trim() : prompt;
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

const ProtectedPromptEditor = ({ label, value, onChange, placeholder, rows = 8, disabled = false, copyToClipboard }: any) => {
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
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(value, label)} disabled={!value}>
              <Copy size={16} className="mr-1" />
              Copy
            </Button>
          </div>
          {disabled ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{editableContent || placeholder}</pre>
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
      {outputStructure && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Protected Output Structure</span>
          </div>
          <div className="bg-white border border-amber-200 rounded p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{outputStructure}</pre>
          </div>
          <p className="text-xs text-amber-700 mt-2">This section is protected to ensure frontend compatibility.</p>
        </div>
      )}
    </div>
  );
};

const EnhancedTextField = ({ label, value, onChange, placeholder, rows = 4, disabled = false, bgColor = "bg-blue-50", borderColor = "border-blue-200", copyToClipboard }: any) => (
  <div className="space-y-4 bg-white border rounded-lg p-4">
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <Button variant="outline" size="sm" onClick={() => copyToClipboard(value, label)} disabled={!value}>
          <Copy size={16} className="mr-1" />
          Copy
        </Button>
      </div>
      {disabled ? (
        <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{value || placeholder}</pre>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  </div>
);

const EnhancedArrayField = ({ label, value, onChange, placeholder, rows = 4, disabled = false, bgColor = "bg-green-50", borderColor = "border-green-200", copyToClipboard }: any) => {
  const textValue = Array.isArray(value) ? value.join('\n') : '';
  
  return (
    <div className="space-y-4 bg-white border rounded-lg p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(textValue, label)} disabled={!textValue}>
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
        </div>
        {disabled ? (
          <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{textValue || placeholder}</pre>
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

export const SocialCaptionsStation: React.FC<SocialCaptionsStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard
}) => {
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
                {/* System Prompt Structure Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">🔧 How System Prompt is Generated</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The final system prompt sent to Claude combines: <strong>Base System Prompt</strong> + <strong>AI Settings Context</strong> (brand guidelines, product claims, persona pillars, etc.)
                  </p>
                </div>

                {/* Base System Prompt - Editable */}
                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.systemPrompt || ''}
                  onChange={(value: string) => setEditingConfig({
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
                  copyToClipboard={copyToClipboard}
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

TARGET PERSONA - {CONCEPT}:
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

TARGET PERSONA - {CONCEPT}:
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
                {/* User Prompt Structure Explanation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">📝 How User Prompt is Generated</p>
                  <p className="text-sm text-green-700 mt-1">
                    The final user prompt combines: <strong>Base User Template</strong> + <strong>Dynamic Sections</strong> (platform guidelines, hashtag strategy, engagement tactics, persona targeting, product focus, custom brief)
                  </p>
                </div>

                {/* Base User Prompt Template - Editable */}
                <EnhancedTextField
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.userPromptTemplate || ''}
                  onChange={(value: string) => effectiveUser?.role === 'admin' && setEditingConfig({
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
                  copyToClipboard={copyToClipboard}
                />

                {/* Platform Guidelines - Editable */}
                <EnhancedArrayField
                  label="Platform Guidelines (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.platformGuidelines || []}
                  onChange={(value: string[]) => effectiveUser?.role === 'admin' && setEditingConfig({
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
                  copyToClipboard={copyToClipboard}
                />

                {/* Hashtag Strategy - Editable */}
                <EnhancedArrayField
                  label="Hashtag Strategy (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.hashtagStrategy || []}
                  onChange={(value: string[]) => effectiveUser?.role === 'admin' && setEditingConfig({
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
                  copyToClipboard={copyToClipboard}
                />

                {/* Engagement Tactics - Editable */}
                <EnhancedArrayField
                  label="Engagement Tactics (Editable)"
                  value={editingConfig?.stationPrompts?.socialCaptions?.engagementTactics || []}
                  onChange={(value: string[]) => effectiveUser?.role === 'admin' && setEditingConfig({
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
TARGET PERSONA - {CONCEPT}:
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
{`TARGET PERSONA - {CONCEPT}:
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
                    These sections are dynamically generated based on your selections: persona concept, selected products, platform guidelines, hashtag strategy, engagement tactics, and custom brief. Only sections with data will be included.
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