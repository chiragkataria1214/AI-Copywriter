import React, { useEffect } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { FileText } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/main/ai-settings/common/StationPromptSections';
import { StationToggleButton } from '@/components/main/ai-settings/common/StationToggleButton';

interface LandingPageStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const LandingPageStation: React.FC<LandingPageStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.landingPage;
  const contextConfig = stationConfig?.contextConfiguration as any;


  // Variables now sourced from DB via contextConfiguration.availableVariables

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

          <StationSystemPromptSection
            stationKey="landingPage"
            sectionId="landingPage-systemPrompt"
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
            contextConfiguration={contextConfig}
            placeholder="You are an expert landing page copywriter..."
          />

          <StationUserPromptSection
            stationKey="landingPage"
            sectionId="landingPage-userPrompt"
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
            contextConfiguration={contextConfig}
            placeholder="Create a high-converting landing page..."
          />

        </div>
      )}
    </div>
  );
}; 