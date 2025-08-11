import React, { useState } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { AdCopyStation } from '@/components/main/ai-settings/stations/AdCopyStation';
import { LandingPageStation } from '@/components/main/ai-settings/stations/LandingPageStation';
import { StaticAdStation } from '@/components/main/ai-settings/stations/StaticAdStation';
import { SocialCaptionsStation } from '@/components/main/ai-settings/stations/SocialCaptionsStation';
import { StorySequencesStation } from '@/components/main/ai-settings/stations/StorySequencesStation';
import { EmailStation } from '@/components/main/ai-settings/stations/EmailStation';
import { SmsStation } from '@/components/main/ai-settings/stations/SmsStation';
import { CustomRequestStation } from '@/components/main/ai-settings/stations/CustomRequestStation';

interface StationPromptsTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  onSaveStationPrompts?: (sp: TrainingConfig['stationPrompts']) => void;
  setIsDirty: (isDirty: boolean) => void;
}

export const StationPromptsTab: React.FC<StationPromptsTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  onSaveStationPrompts,
  setIsDirty
}) => {
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set());

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save handled by sticky bar in AISettingsComponent */}
      
      <AdCopyStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />
      

<StaticAdStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />

<SocialCaptionsStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />

      <StorySequencesStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />

      <LandingPageStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />

<CustomRequestStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />
      <EmailStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />
      <SmsStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
        setIsDirty={setIsDirty}
      />

 
    </div>
  );
}; 