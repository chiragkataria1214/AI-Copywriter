import React, { useState, useRef, useEffect, useMemo } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { ChevronDown, ChevronRight, Target, Copy, Plus, Eye } from 'lucide-react';
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractOutputStructure as extractOutputStructureCommon } from '@/components/meta-ad-generator/ai-settings/common/promptUtils';

const generateSystemPromptPreview = (config: TrainingConfig): string => {
  const adCopyPrompt = config.stationPrompts?.adCopy?.systemPrompt || '';
  const contextConfig = config.stationPrompts?.adCopy?.contextConfiguration as any;

  if (!contextConfig) {
    return adCopyPrompt;
  }

  const enabledContextSections = (contextConfig.contextSections || [])
    .filter((s: any) => s.enabled)
    .map((s: any) => `\n\n**[${s.name.toUpperCase()}]**\n{${s.id}}`)
    .join('');

  return `${adCopyPrompt}${enabledContextSections}`;
};

interface AdCopyStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';


export const AdCopyStation: React.FC<AdCopyStationProps> = ({
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
  const stationConfig = editingConfig.stationPrompts?.adCopy;
  const contextConfig = stationConfig?.contextConfiguration as any;
  const [showUserPreview, setShowUserPreview] = useState(false);
  const [showSystemPreview, setShowSystemPreview] = useState(false);

  useEffect(() => {
    if (!editingConfig.stationPrompts.adCopy) {
      const adCopyDefaults = {
        userPromptTemplate: "Default user prompt for ad copy...",
        systemPrompt: "Default system prompt for ad copy...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          adCopy: adCopyDefaults,
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

  // Restrict Insert Variable options to the explicit set requested for generateAdCopy
  const allowedAdCopyVariableKeys = useMemo(
    () => [
      'transcription',
      'customBrief',
      'persona',
      'landingPageUrl',
      'brandDrBalance',
      'useJonesBrandGuide',
      'airLink',
      'uploadedImage',
      'selectedProduct',
      'selectedProducts',
    ],
    []
  );

  const allowedVariables = useMemo(() => {
    const normalizeKey = (key: string) => (key || '').replace(/[{}]/g, '').trim();
    const available = ((contextConfig?.availableVariables || contextConfig?.variables) || []) as VariableDefinition[];
    const byKey = new Map(available.map(v => [normalizeKey(v.key), v] as const));
    // Preserve the exact order specified above; include only those present
    return allowedAdCopyVariableKeys
      .map((key) => byKey.get(normalizeKey(key)))
      .filter((v): v is VariableDefinition => Boolean(v));
  }, [contextConfig?.availableVariables, contextConfig?.variables, allowedAdCopyVariableKeys]);

  return (
    <div className="border border-gray-200 rounded-lg">
      <StationToggleButton
        isOpen={expandedStations.has('adCopy')}
        onClick={() => toggleStation('adCopy')}
        title="Ad Copy Station"
        icon={<Target className="w-5 h-5" />}
        iconColor="text-blue-500"
        description="Meta advertising copywriter for short-form direct response ads"
      />

      {expandedStations.has('adCopy') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'adCopy'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />

          {/* System Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('adCopy-systemPrompt')) {
                  newExpanded.delete('adCopy-systemPrompt');
                } else {
                  newExpanded.add('adCopy-systemPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('adCopy-systemPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-blue-600">🔧</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">System Prompt Configuration</h3>
                  {!expandedStations.has('adCopy-systemPrompt') && (
                    <p className="text-sm text-blue-700 mt-1">Base System Prompt + AI Settings Context</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 font-medium">
                  {expandedStations.has('adCopy-systemPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('adCopy-systemPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">


                <ProtectedPromptEditor
                  label="Base System Prompt (Editable)"
                  value={editingConfig?.stationPrompts?.adCopy?.systemPrompt || ''}
                  onChange={(newValue: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig.stationPrompts,
                        adCopy: {
                          ...stationConfig,
                          systemPrompt: newValue,
                        },
                      },
                    });
                  }}
                  placeholder="You are an expert Meta advertising copywriter specializing in short-form direct response ads..."
                  rows={8}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  textareaRef={systemPromptTextareaRef}
                  variables={allowedVariables}
                  contextConfiguration={editingConfig?.stationPrompts?.adCopy?.contextConfiguration as any}
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSystemPreview(true)}
                    title="View resolved system prompt"
                  >
                    <Eye size={16} className="mr-1" />
                    Preview
                  </Button>
                </div>

                {/* Final System Prompt Preview removed; use Preview button */}
              </div>
            )}
          </div>

          {/* User Prompt Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedStations);
                if (expandedStations.has('adCopy-userPrompt')) {
                  newExpanded.delete('adCopy-userPrompt');
                } else {
                  newExpanded.add('adCopy-userPrompt');
                }
                setExpandedStations(newExpanded);
              }}
              className="flex items-center justify-between w-full p-4 bg-green-50 hover:bg-green-100 rounded-t-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedStations.has('adCopy-userPrompt') ? (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-green-600">📝</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">User Prompt Configuration</h3>
                  {!expandedStations.has('adCopy-userPrompt') && (
                    <p className="text-sm text-green-700 mt-1">Base User Template + Dynamic Sections</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600 font-medium">
                  {expandedStations.has('adCopy-userPrompt') ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </button>

            {expandedStations.has('adCopy-userPrompt') && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                {/* User Prompt Structure Explanation */}
            

                {/* Base User Prompt Template - Editable */}
                <ProtectedPromptEditor
                  label="Base User Prompt Template (Editable)"
                  value={editingConfig?.stationPrompts?.adCopy?.userPromptTemplate || ''}
                  onChange={(newValue: string) => {
                    if (effectiveUser?.role !== 'admin') return;
                    setIsDirty(true);
                    setEditingConfig({
                      ...editingConfig,
                      stationPrompts: {
                        ...editingConfig.stationPrompts,
                        adCopy: {
                          ...stationConfig,
                          userPromptTemplate: newValue,
                        },
                      },
                    });
                  }}
                  placeholder="Generate high-converting Meta/Facebook ad copy..."
                  rows={6}
                  disabled={effectiveUser?.role !== 'admin'}
                  copyToClipboard={copyToClipboard}
                  textareaRef={userPromptTextareaRef}
                  variables={allowedVariables}
                  contextConfiguration={editingConfig?.stationPrompts?.adCopy?.contextConfiguration as any}
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserPreview(true)}
                    title="View resolved user prompt"
                  >
                    <Eye size={16} className="mr-1" />
                    Preview
                  </Button>
                </div>

                {/* Dynamic Sections removed as requested */}
              </div>
            )}
          </div>


        </div>
      )}
      {/* Resolved System Prompt Modal */}
      <Dialog open={showSystemPreview} onOpenChange={setShowSystemPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Resolved System Prompt</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[60vh] overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {generateSystemPromptPreview(editingConfig)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolved User Prompt Modal */}
      <Dialog open={showUserPreview} onOpenChange={setShowUserPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Resolved User Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[40vh] overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {editingConfig?.stationPrompts?.adCopy?.userPromptTemplate || ''}
              </pre>
            </div>
            {extractOutputStructureCommon(editingConfig?.stationPrompts?.adCopy?.systemPrompt || '') && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                <div className="text-xs font-medium text-amber-800 mb-2">Output Structure</div>
                <div className="bg-white border border-amber-200 rounded p-3 max-h-[30vh] overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {extractOutputStructureCommon(editingConfig?.stationPrompts?.adCopy?.systemPrompt || '')}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 