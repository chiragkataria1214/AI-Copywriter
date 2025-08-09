import React, { useEffect } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { Mail } from 'lucide-react';
import { StationSystemPromptSection, StationUserPromptSection } from '@/components/meta-ad-generator/ai-settings/common/StationPromptSections';
import { StationToggleButton } from '@/components/meta-ad-generator/ai-settings/common/StationToggleButton';

interface EmailStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

export const EmailStation: React.FC<EmailStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard,
  setIsDirty
}) => {
  const stationConfig = editingConfig.stationPrompts?.email;
  const contextConfig = stationConfig?.contextConfiguration as any;

  // Insert Variable keys for retention (email) based on server request shapes
  // Variables now sourced from DB via contextConfiguration.availableVariables

  const generateSystemPromptPreview = (config: TrainingConfig): string => {
    const base = config.stationPrompts?.email?.systemPrompt || '';
    const ctx = config.stationPrompts?.email?.contextConfiguration as any;
    if (!ctx) return base;
    const enabled = (ctx.contextSections || [])
      .filter((s: any) => s.enabled)
      .map((s: any) => `\n\n**[${s.name.toUpperCase()}]**\n{${s.id}}`)
      .join('');
    return `${base}${enabled}`;
  };

  useEffect(() => {
    if (!editingConfig.stationPrompts.email) {
      const emailDefaults = {
        userPromptTemplate: "Default user prompt for email...",
        systemPrompt: "Default system prompt for email...",
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
          email: emailDefaults,
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
        isOpen={expandedStations.has('email')}
        onClick={() => toggleStation('email')}
        title="Email Station"
        icon={<Mail className="w-5 h-5" />}
        iconColor="text-orange-500"
        description="Email marketing specialist for customer retention"
      />

      {expandedStations.has('email') && (
        <div className="p-6 pt-4 border-t border-gray-100 space-y-6">

          {/* System Prompt Section */}
          <StationSystemPromptSection
            stationKey="email"
            sectionId="email-systemPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.email?.contextConfiguration as any}
            placeholder="You are an email marketing specialist focused on customer retention and engagement..."
          />

          {/* User Prompt Section */}
          <StationUserPromptSection
            stationKey="email"
            sectionId="email-userPrompt"
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
            contextConfiguration={editingConfig?.stationPrompts?.email?.contextConfiguration as any}
            placeholder="Create email retention copy for [CAMPAIGN_TYPE] targeting [AUDIENCE_SEGMENT]..."
          />

        </div>
      )}
    </div>
  );
};