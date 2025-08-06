import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, FileText, Lock, Copy } from 'lucide-react';

interface LandingPageStationProps {
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

// Component for displaying system prompts with protected output structure
const ProtectedPromptEditor = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 8,
  disabled = false,
  copyToClipboard
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  copyToClipboard: (text: string, label: string) => Promise<void>;
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
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {editableContent || placeholder}
              </pre>
            </div>
          ) : (
            <Textarea
              value={editableContent}
              onChange={(e) => handleChange(e.target.value)}
              className="text-gray-900 resize-y border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-4 transition-all duration-200"
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

// Enhanced text field component with card design
const EnhancedTextField = ({ 
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
          className={`text-gray-900 resize-y border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-4 transition-all duration-200`}
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
  bgColor = "bg-purple-50",
  borderColor = "border-purple-200",
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
            className="text-gray-900 resize-y border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-4 transition-all duration-200"
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export const LandingPageStation: React.FC<LandingPageStationProps> = ({
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
        isOpen={expandedStations.has('landingPage')}
        onClick={() => toggleStation('landingPage')}
        title="Landing Page Station"
        icon={<FileText className="w-5 h-5" />}
        iconColor="text-green-500"
        description="Conversion-optimized landing page copywriter"
      />
      
      {expandedStations.has('landingPage') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          
          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('landingPage-systemPrompt')) {
                  newExpanded.delete('landingPage-systemPrompt');
                } else {
                  newExpanded.add('landingPage-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('landingPage-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">System Prompt Configuration</h3>
                  {!expandedStations.has('landingPage-systemPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('landingPage-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('landingPage-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                {/* System Prompt Structure Explanation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">🔧 How System Prompt is Generated</p>
                  <p className="text-sm text-green-700 mt-1">
                    The final system prompt sent to Claude combines: <strong>Base System Prompt</strong> + <strong>AI Settings Context</strong> (brand guidelines, product claims, persona pillars, etc.)
                  </p>
                </div>

                {/* Base System Prompt - Editable */}
                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
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
                  placeholder="You are an expert landing page copywriter specializing in conversion-optimized pages for Jones Road Beauty..."
                  rows={8}
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
                if (expandedStations.has('landingPage-userPrompt')) {
                  newExpanded.delete('landingPage-userPrompt');
                } else {
                  newExpanded.add('landingPage-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('landingPage-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">User Prompt Configuration</h3>
                  {!expandedStations.has('landingPage-userPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('landingPage-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('landingPage-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                {/* User Prompt Structure Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">📝 How User Prompt is Generated</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The final user prompt combines: <strong>Base User Template</strong> + <strong>Dynamic Sections</strong> (product brief, target persona, ads content, main angle, selected products)
                  </p>
                </div>

                {/* Base User Prompt Template - Editable */}
                <EnhancedTextField
                  label="Base User Prompt Template (Editable)"
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
                  rows={6}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
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

PERSONA-SPECIFIC TARGETING REQUIREMENTS:
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

PRODUCT BRIEF:
{productBrief}

MAIN ANGLE/HOOK:
{mainAngle}

ADS CONTENT INTEGRATION:
{adsContent}

LANDING PAGE TYPE: {landingPageType}

CONTENT STRUCTURE REQUIREMENTS:
{contentStructureRules}

CONVERSION GUIDELINES:
{conversionGuidelines}

CTA GUIDELINES:
{ctaGuidelines}`, 'Dynamic Sections Template')}
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

PRODUCT BRIEF:
{productBrief}

MAIN ANGLE/HOOK:
{mainAngle}

ADS CONTENT INTEGRATION:
{adsContent}

LANDING PAGE TYPE: {landingPageType}

CONTENT STRUCTURE REQUIREMENTS:
- Hero section: Compelling headline + subheading + CTA
- Benefits section: 3-5 key benefits with icons
- Social proof: Customer testimonials and reviews
- ...

CONVERSION GUIDELINES:
- Use multiple CTAs throughout the page
- Create urgency without being pushy
- Focus on benefits over features
- ...

CTA GUIDELINES:
- Primary CTA: Action-oriented and benefit-focused
- Secondary CTA: Lower commitment alternative
- Button text: 2-4 words maximum
- ...`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    These sections are dynamically generated based on your selections: persona concept, selected products, product brief, main angle, ads content integration, and landing page type. Only sections with data will be included.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Configuration Sections */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('landingPage-additional')) {
                  newExpanded.delete('landingPage-additional');
                } else {
                  newExpanded.add('landingPage-additional');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('landingPage-additional') ? (
                    <ChevronDown className="w-4 h-4 text-purple-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="text-purple-600">⚙️</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-purple-900">Additional Configuration</h3>
                  {!expandedStations.has('landingPage-additional') && (
                    <p className="text-sm text-purple-700 mt-1">Content Structure, Conversion & CTA Guidelines</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-purple-600 font-medium">
                  {expandedStations.has('landingPage-additional') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('landingPage-additional') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
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
                  copyToClipboard={copyToClipboard}
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
                          className="flex-1 h-12 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg px-4 transition-all duration-200"
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
                  copyToClipboard={copyToClipboard}
                />
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">⚡ Final Prompt Assembly</p>
            <p className="text-sm text-amber-700 mt-1">
              <strong>System Prompt:</strong> Base System Prompt + AI Settings Context
              <br />
              <strong>User Prompt:</strong> Base User Template + Target Persona Section + Selected Products Section + Product Brief + Main Angle + Ads Content + Content Structure Rules + Conversion Guidelines + CTA Guidelines
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 