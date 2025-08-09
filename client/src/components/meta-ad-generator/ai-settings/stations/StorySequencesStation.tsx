import React, { useEffect } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { FileText } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/meta-ad-generator/ai-settings/common/StationPromptSections';
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

          {/* System Prompt Section */}
          <StationSystemPromptSection
            stationKey="storySequences"
            sectionId="storySequences-systemPrompt"
            title="System Prompt Configuration"
            description="Base System Prompt + AI Settings Context"
            headerColorClass="bg-blue-50 hover:bg-blue-100"
            iconEmoji="🔧"
            isAdmin={effectiveUser?.role === 'admin'}
            expandedStations={expandedStations}
            setExpandedStations={setExpandedStations}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            setIsDirty={setIsDirty}
            copyToClipboard={copyToClipboard}
            contextConfiguration={editingConfig?.stationPrompts?.storySequences?.contextConfiguration as any}
            placeholder="You are a story sequence specialist creating multi-part narratives for sustained audience engagement..."
          />

          {/* User Prompt Section */}
          <StationUserPromptSection
            stationKey="storySequences"
            sectionId="storySequences-userPrompt"
            title="User Prompt Configuration"
            description="Base User Template + Dynamic Sections"
            headerColorClass="bg-green-50 hover:bg-green-100"
            iconEmoji="📝"
            isAdmin={effectiveUser?.role === 'admin'}
            expandedStations={expandedStations}
            setExpandedStations={setExpandedStations}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            setIsDirty={setIsDirty}
            copyToClipboard={copyToClipboard}
            contextConfiguration={editingConfig?.stationPrompts?.storySequences?.contextConfiguration as any}
            placeholder="Create a [X]-part story sequence about [TOPIC] for [PLATFORM] with [NARRATIVE_STYLE]..."
          />

        </div>
      )}
    </div>
  );
}; 