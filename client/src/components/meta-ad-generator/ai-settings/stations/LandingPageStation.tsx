import React, { useRef, useEffect } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
 

interface LandingPageStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';

export const LandingPageStation: React.FC<LandingPageStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const userPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const stationConfig = editingConfig.stationPrompts?.landingPage;
  const contextConfig = stationConfig?.contextConfiguration as any;
  
  useEffect(() => {
    if (!editingConfig.stationPrompts.landingPage) {
      const landingPageDefaults = {
        userPromptTemplate: "Default user prompt for landing page...",
        systemPrompt: "Default system prompt for landing page...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          landingPage: landingPageDefaults,
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
        isOpen={expandedStations.has('landingPage')}
        onClick={() => toggleStation('landingPage')}
        title="Landing Page Station"
        icon={<FileText className="w-5 h-5" />}
        iconColor="text-green-500"
        description="Conversion-optimized landing page copywriter"
      />
      
      {expandedStations.has('landingPage') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'landingPage'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          


          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (newExpanded.has('landingPage-systemPrompt')) {
                  newExpanded.delete('landingPage-systemPrompt');
                } else {
                  newExpanded.add('landingPage-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('landingPage-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('landingPage-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('landingPage-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('landingPage-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
                  value={editingConfig?.stationPrompts?.landingPage?.systemPrompt || ''}
                  onChange={(value: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig?.stationPrompts,
                        landingPage: {
                          ...editingConfig?.stationPrompts?.landingPage,
                          systemPrompt: value
                        }
                      }
                    });
                  }}
                  placeholder="You are an expert landing page copywriter..."
                  rows={8}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  textareaRef={systemPromptTextareaRef}
                  contextConfiguration={contextConfig}
                />
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (newExpanded.has('landingPage-userPrompt')) {
                  newExpanded.delete('landingPage-userPrompt');
                } else {
                  newExpanded.add('landingPage-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('landingPage-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">User Prompt Configuration</h3>
                  {!expandedStations.has('landingPage-userPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('landingPage-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('landingPage-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                <ProtectedPromptEditor
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.landingPage?.userPromptTemplate || ''}
                  onChange={(value: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig?.stationPrompts,
                        landingPage: {
                          ...editingConfig?.stationPrompts?.landingPage,
                          userPromptTemplate: value
                        }
                      }
                    });
                  }}
                  placeholder="Create a high-converting landing page..."
                  rows={8}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  textareaRef={userPromptTextareaRef}
                  contextConfiguration={contextConfig}
                />
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