import React, { useEffect } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { MessageSquare } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/main/ai-settings/common/StationPromptSections';
import { StationToggleButton } from '@/components/main/ai-settings/common/StationToggleButton';

interface SmsStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const SmsStation: React.FC<SmsStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.sms;
  const contextConfig = stationConfig?.contextConfiguration as any;

  // Insert Variable keys for retention (sms) based on server request shapes
  // Variables now sourced from DB via contextConfiguration.availableVariables

  const generateSystemPromptPreview = (config: TrainingConfig): string => {
    const base = config.stationPrompts?.sms?.systemPrompt || '';
    const ctx = config.stationPrompts?.sms?.contextConfiguration as any;
    if (!ctx) return base;
    const enabled = (ctx.contextSections || [])
      .filter((s: any) => s.enabled)
      .map((s: any) => `\n\n**[${s.name.toUpperCase()}]**\n{${s.id}}`)
      .join('');
    return `${base}${enabled}`;
  };

  useEffect(() => {
    if (!editingConfig.stationPrompts.sms) {
      const smsDefaults = {
        userPromptTemplate: "Default user prompt for sms...",
        systemPrompt: "Default system prompt for sms...",
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
          sms: smsDefaults,
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
        isOpen={expandedStations.has('sms')}
        onClick={() => toggleStation('sms')}
        title="SMS Station"
        icon={<MessageSquare className="w-5 h-5" />}
        iconColor="text-blue-500"
        description="SMS marketing specialist for customer retention"
      />

      {expandedStations.has('sms') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">

          {/* System Prompt Section */}
          <StationSystemPromptSection
            stationKey="sms"
            sectionId="sms-systemPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.sms?.contextConfiguration as any}
            placeholder="You are an SMS marketing specialist focused on customer retention and engagement..."
          />

          {/* User Prompt Section */}
          <StationUserPromptSection
            stationKey="sms"
            sectionId="sms-userPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.sms?.contextConfiguration as any}
            placeholder="Create SMS retention copy for [CAMPAIGN_TYPE] targeting [AUDIENCE_SEGMENT]..."
          />

        </div>
      )}
    </div>
  );
};