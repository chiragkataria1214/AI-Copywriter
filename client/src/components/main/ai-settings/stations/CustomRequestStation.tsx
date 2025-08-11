import React from 'react';
import { Button } from '@/components/ui/button';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { Sparkles, Copy } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/main/ai-settings/common/StationPromptSections';
import { StationToggleButton } from '@/components/main/ai-settings/common/StationToggleButton';

interface CustomRequestStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const CustomRequestStation: React.FC<CustomRequestStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.customRequest;
  const contextConfig = stationConfig?.contextConfiguration as any;
  // Variables now sourced from DB via contextConfiguration.availableVariables
  
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
        isOpen={expandedStations.has('customRequest')}
        onClick={() => toggleStation('customRequest')}
        title="Custom Request Station"
        icon={<Sparkles className="w-5 h-5" />}
        iconColor="text-pink-500"
        description="Versatile copywriter for any custom marketing request"
      />
      
      {expandedStations.has('customRequest') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">
          <StationSystemPromptSection
            stationKey="customRequest"
            sectionId="customRequest-systemPrompt"
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
            placeholder="You are a versatile marketing copywriter..."
          />

          <StationUserPromptSection
            stationKey="customRequest"
            sectionId="customRequest-userPrompt"
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
            placeholder="Handle this custom request: [USER_REQUEST] for [BRAND/PRODUCT] with [SPECIFIC_REQUIREMENTS]..."
          />
       
        </div>
      )}
    </div>
  );
}; 

