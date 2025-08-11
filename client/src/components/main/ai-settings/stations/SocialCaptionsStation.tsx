import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/main/ai-settings/common/StationPromptSections';
import { StationToggleButton } from '@/components/main/ai-settings/common/StationToggleButton';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';

interface SocialCaptionsStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const SocialCaptionsStation: React.FC<SocialCaptionsStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.socialCaptions;
  const contextConfig = stationConfig?.contextConfiguration as any;

  // Provide Insert Variable options based on anthropic-interface fields relevant to social captions
  // Variables now sourced from DB via contextConfiguration.availableVariables


  useEffect(() => {
    if (!editingConfig.stationPrompts.socialCaptions) {
      const socialCaptionsDefaults = {
        userPromptTemplate: "Default user prompt for social captions...",
        systemPrompt: "Default system prompt for social captions...",
        contextConfiguration: {
          contextSections: [],
          availableVariables: [],
        },
        platformGuidelines: [],
        hashtagStrategy: [],
        engagementTactics: [],
      };
      setEditingConfig({
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          socialCaptions: socialCaptionsDefaults,
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
          <StationSystemPromptSection
            stationKey="socialCaptions"
            sectionId="socialCaptions-systemPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.socialCaptions?.contextConfiguration as any}
            placeholder="You are a social media copywriter specializing in platform-optimized captions and engagement..."
          />


          {/* User Prompt Section */}
          <StationUserPromptSection
            stationKey="socialCaptions"
            sectionId="socialCaptions-userPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.socialCaptions?.contextConfiguration as any}
            placeholder="Create [PLATFORM] caption for [CONTENT_TYPE] about [TOPIC] targeting [AUDIENCE]..."
          />
          
        </div>
      )}
    </div>
  );
}; 