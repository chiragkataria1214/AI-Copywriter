import React, { useEffect } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { Image } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/main/ai-settings/common/StationPromptSections';
import { StationToggleButton } from '@/components/main/ai-settings/common/StationToggleButton';

interface StaticAdStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const StaticAdStation: React.FC<StaticAdStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.staticAd;
  const contextConfig = stationConfig?.contextConfiguration as any;

  // Insert Variable keys for static ad analysis
  // Variables now sourced from DB via contextConfiguration.availableVariables

  useEffect(() => {
    if (!editingConfig.stationPrompts.staticAd) {
      const staticAdDefaults = {
        userPromptTemplate: "Default user prompt for static ad...",
        systemPrompt: "Default system prompt for static ad...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          staticAd: staticAdDefaults,
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
        isOpen={expandedStations.has('staticAd')}
        onClick={() => toggleStation('staticAd')}
        title="Static Ad Station"
        icon={<Image className="w-5 h-5" />}
        iconColor="text-purple-500"
        description="Visual-first advertising formats with image-text balance"
      />

      {expandedStations.has('staticAd') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">

          {/* System Prompt Section */}
          <StationSystemPromptSection
            stationKey="staticAd"
            sectionId="staticAd-systemPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.staticAd?.contextConfiguration as any}
            placeholder="You are a static ad copywriter specializing in visual-first advertising formats..."
          />

          {/* User Prompt Section */}
          <StationUserPromptSection
            stationKey="staticAd"
            sectionId="staticAd-userPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.staticAd?.contextConfiguration as any}
            placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."
          />

        </div>
      )}
    </div>
  );
}; 