import React, { useState } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { AdCopyStation } from './stations/AdCopyStation';
import { LandingPageStation } from './stations/LandingPageStation';
import { StaticAdStation } from './stations/StaticAdStation';
import { SocialCaptionsStation } from './stations/SocialCaptionsStation';
import { StorySequencesStation } from './stations/StorySequencesStation';
import { EmailStation } from './stations/EmailStation';
import { SmsStation } from './stations/SmsStation';
import { CustomRequestStation } from './stations/CustomRequestStation';

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