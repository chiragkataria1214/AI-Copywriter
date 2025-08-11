import React, { useState, useEffect } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractOutputStructure as extractOutputStructureCommon } from '@/components/main/ai-settings/common/promptUtils';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/main/ai-settings/common/StationPromptSections';

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

import { StationToggleButton } from '@/components/main/ai-settings/common/StationToggleButton';


export const AdCopyStation: React.FC<AdCopyStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
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

  // Variables are now sourced from database: contextConfiguration.availableVariables

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
          {/* System Prompt Section */}
          <StationSystemPromptSection
            stationKey="adCopy"
            sectionId="adCopy-systemPrompt"
            title="System Prompt Configuration"
            description=""
            headerColorClass="bg-blue-50 hover:bg-blue-100"
            iconEmoji="🔧"
            isAdmin={effectiveUser?.role === 'admin'}
            expandedStations={expandedStations}
            setExpandedStations={setExpandedStations}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            setIsDirty={setIsDirty}
            copyToClipboard={copyToClipboard}
            contextConfiguration={editingConfig?.stationPrompts?.adCopy?.contextConfiguration as any}
            placeholder="You are an expert Meta advertising copywriter specializing in short-form direct response ads..."
          />

          {/* User Prompt Section */}
          <StationUserPromptSection
            stationKey="adCopy"
            sectionId="adCopy-userPrompt"
            title="User Prompt Configuration"
            description=""
            headerColorClass="bg-green-50 hover:bg-green-100"
            iconEmoji="📝"
            isAdmin={effectiveUser?.role === 'admin'}
            expandedStations={expandedStations}
            setExpandedStations={setExpandedStations}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            setIsDirty={setIsDirty}
            copyToClipboard={copyToClipboard}
            contextConfiguration={editingConfig?.stationPrompts?.adCopy?.contextConfiguration as any}
            placeholder="Generate high-converting Meta/Facebook ad copy..."
          />


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