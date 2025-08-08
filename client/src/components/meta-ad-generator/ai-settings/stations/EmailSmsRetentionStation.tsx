import React, { useRef, useState, useEffect } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { ChevronDown, ChevronRight, Mail, Lock, Copy } from 'lucide-react';
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { EnhancedArrayField, EnhancedTextField } from '@/components/meta-ad-generator/ai-settings/common/EnhancedFields';
 

interface EmailSmsRetentionStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';

// using shared extractOutputStructure from promptUtils

// Removed local ProtectedPromptEditor/Enhanced fields in favor of shared components

export const EmailSmsRetentionStation: React.FC<EmailSmsRetentionStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const stationConfig = editingConfig.stationPrompts?.emailSmsRetention;
  const [showResolvedPreview, setShowResolvedPreview] = useState(false);
  const contextConfig = stationConfig?.contextConfiguration as any;

  useEffect(() => {
    if (!editingConfig.stationPrompts.emailSmsRetention) {
      const emailSmsRetentionDefaults = {
        userPromptTemplate: "Default user prompt for email/sms...",
        systemPrompt: "Default system prompt for email/sms...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
        subjectLineFrameworks: [],
        enabledSubjectLineFrameworks: [],
        retentionBestPractices: [],
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          emailSmsRetention: emailSmsRetentionDefaults,
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
        isOpen={expandedStations.has('emailSmsRetention')}
        onClick={() => toggleStation('emailSmsRetention')}
        title="Email & SMS Retention Station"
        icon={<Mail className="w-5 h-5" />}
        iconColor="text-orange-500"
        description="Customer retention and engagement specialist"
      />
      
      {expandedStations.has('emailSmsRetention') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'emailSmsRetention'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          
          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('emailSmsRetention-systemPrompt')) {
                  newExpanded.delete('emailSmsRetention-systemPrompt');
                } else {
                  newExpanded.add('emailSmsRetention-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('emailSmsRetention-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('emailSmsRetention-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('emailSmsRetention-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('emailSmsRetention-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
       
                {/* Base System Prompt - Editable */}
                 <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
                  value={editingConfig?.stationPrompts?.emailSmsRetention?.systemPrompt || ''}
                   onChange={(value: string) => {
                     if (effectiveUser?.role !== 'admin') return;
                     setIsDirty(true);
                     setEditingConfig({
                       ...editingConfig,
                       stationPrompts: {
                         ...editingConfig?.stationPrompts,
                         emailSmsRetention: {
                           ...editingConfig?.stationPrompts?.emailSmsRetention,
                           systemPrompt: value
                         }
                       }
                     });
                   }}
                  placeholder="You are an email and SMS marketing specialist focused on customer retention and engagement..."
                  rows={6}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                   textareaRef={systemPromptTextareaRef}
                   contextConfiguration={editingConfig?.stationPrompts?.emailSmsRetention?.contextConfiguration as any}
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
                if (expandedStations.has('emailSmsRetention-userPrompt')) {
                  newExpanded.delete('emailSmsRetention-userPrompt');
                } else {
                  newExpanded.add('emailSmsRetention-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('emailSmsRetention-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">User Prompt Configuration</h3>
                  {!expandedStations.has('emailSmsRetention-userPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('emailSmsRetention-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('emailSmsRetention-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
            
                {/* Base User Prompt Template - Editable */}
                 <EnhancedTextField
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.emailSmsRetention?.userPromptTemplate || ''}
                   onChange={(value: string) => {
                     if (effectiveUser?.role !== 'admin') return;
                     setIsDirty(true);
                     setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig?.stationPrompts,
                        emailSmsRetention: {
                          ...editingConfig?.stationPrompts?.emailSmsRetention,
                          userPromptTemplate: value
                        }
                      }
                    });
                   }}
                  placeholder="Create [EMAIL/SMS] retention copy for [CAMPAIGN_TYPE] targeting [AUDIENCE_SEGMENT]..."
                  rows={4}
                  disabled={effectiveUser?.role !== 'admin'}
                   bgColor="bg-green-50"
                   borderColor="border-green-200"
                   copyToClipboard={copyToClipboard}
                />

                {/* Subject Line Frameworks - Special Component */}
                <div className="space-y-4 bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Subject Line Frameworks (Editable)</h4>
                  </div>
                  <div className="space-y-2">
                    {(editingConfig?.stationPrompts?.emailSmsRetention?.subjectLineFrameworks || ['', '', '']).map((framework: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Switch
                          checked={editingConfig?.stationPrompts?.emailSmsRetention?.enabledSubjectLineFrameworks?.[index] !== false}
                          onCheckedChange={(checked) => {
                            if (effectiveUser?.role !== 'admin') return;
                             setIsDirty(true);
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
                            setIsDirty(true);
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

                {/* Retention Best Practices - Editable */}
                 <EnhancedArrayField
                  label="Retention Best Practices (Editable)"
                  value={editingConfig?.stationPrompts?.emailSmsRetention?.retentionBestPractices || []}
                   onChange={(value: string[]) => {
                     if (effectiveUser?.role !== 'admin') return;
                     setIsDirty(true);
                     setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig?.stationPrompts,
                        emailSmsRetention: {
                          ...editingConfig?.stationPrompts?.emailSmsRetention,
                          retentionBestPractices: value
                        }
                      }
                    });
                   }}
                  placeholder="Send times: Email 10-11am EST, SMS 2-4pm EST&#10;Frequency: Email 2-3x/week max, SMS 1-2x/week max&#10;Personalization: Use first name and purchase history"
                  rows={5}
                  disabled={effectiveUser?.role !== 'admin'}
                  bgColor="bg-amber-50"
                  borderColor="border-amber-200"
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
- Tailor ALL email/SMS content to speak directly to this persona
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

SUBJECT LINE FRAMEWORKS:
{enabledFramework1}
{enabledFramework2}
...

RETENTION BEST PRACTICES:
{retentionPractice1}
{retentionPractice2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the email/SMS content while maintaining brand voice and retention best practices.`, 'Dynamic Sections Template')}
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
- Tailor ALL email/SMS content to speak directly to this persona
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

SUBJECT LINE FRAMEWORKS:
{enabledFramework1}
{enabledFramework2}
...

RETENTION BEST PRACTICES:
{retentionPractice1}
{retentionPractice2}
...

CUSTOM BRIEF FOR THIS GENERATION:
{customBrief}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the email/SMS content while maintaining brand voice and retention best practices.`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    These sections are dynamically generated based on your selections: persona, selected products, enabled subject line frameworks, retention best practices, and custom brief. Only sections with data will be included.
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
              <strong>User Prompt:</strong> Base User Template + Target Persona Section + Selected Products Section + Subject Line Frameworks + Retention Best Practices + Custom Brief Section
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 