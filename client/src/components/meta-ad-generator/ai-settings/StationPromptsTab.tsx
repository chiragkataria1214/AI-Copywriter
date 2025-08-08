import React, { useState } from 'react';
import { TrainingConfig } from '@shared/training-config';
import { AdCopyStation } from './stations/AdCopyStation';
import EnhancedAdCopyStation from './stations/EnhancedAdCopyStation';
import { LandingPageStation } from './stations/LandingPageStation';
import { StaticAdStation } from './stations/StaticAdStation';
import { SocialCaptionsStation } from './stations/SocialCaptionsStation';
import { StorySequencesStation } from './stations/StorySequencesStation';
import { EmailSmsRetentionStation } from './stations/EmailSmsRetentionStation';
import { CustomRequestStation } from './stations/CustomRequestStation';

interface StationPromptsTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  onSaveStationPrompts?: (sp: TrainingConfig['stationPrompts']) => void;
}

export const StationPromptsTab: React.FC<StationPromptsTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  onSaveStationPrompts
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
      {/* <EnhancedAdCopyStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      /> */}
      
      <AdCopyStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />
      

<StaticAdStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />

<SocialCaptionsStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />

      <StorySequencesStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />

      <LandingPageStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />

<CustomRequestStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />
      <EmailSmsRetentionStation
        editingConfig={editingConfig}
        setEditingConfig={setEditingConfig}
        effectiveUser={effectiveUser}
        expandedStations={expandedStations}
        setExpandedStations={setExpandedStations}
        copyToClipboard={copyToClipboard}
      />

 
    </div>
  );
}; 