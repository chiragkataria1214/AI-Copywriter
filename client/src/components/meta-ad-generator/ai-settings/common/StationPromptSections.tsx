import React, { useMemo, useState } from 'react';
import { VariableDefinition, TrainingConfig } from '@shared/training-config';
import ProtectedPromptEditor from '@/components/meta-ad-generator/ai-settings/common/ProtectedPromptEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { extractOutputStructure as extractOutputStructureCommon } from '@/components/meta-ad-generator/ai-settings/common/promptUtils';
import { VariableEditor } from '@/components/meta-ad-generator/ai-settings/editors/VariableEditor';

type StationKey = keyof TrainingConfig['stationPrompts'] & string;

interface BaseSectionProps {
  stationKey: StationKey;
  sectionId: string; // e.g., "adCopy-systemPrompt" or "adCopy-userPrompt"
  title: string;
  description: string;
  headerColorClass: string; // e.g., 'bg-blue-50 hover:bg-blue-100 text-blue-600'
  iconEmoji: string; // e.g., '🔧' or '📝'
  isAdmin: boolean;
  expandedStations: Set<string>;
  setExpandedStations: (s: Set<string>) => void;
  editingConfig: TrainingConfig;
  setEditingConfig: (c: TrainingConfig) => void;
  setIsDirty: (dirty: boolean) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  contextConfiguration: any;
}

interface SystemSectionProps extends BaseSectionProps {
  placeholder?: string;
  rows?: number;
}

const VariableManagerModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationKey: string;
  editingConfig: TrainingConfig;
  setEditingConfig: (c: TrainingConfig) => void;
  setIsDirty: (dirty: boolean) => void;
}> = ({ open, onOpenChange, stationKey, editingConfig, setEditingConfig, setIsDirty }) => {
  const station = (editingConfig.stationPrompts?.[stationKey as any] as any) || {};
  const contextCfg = station.contextConfiguration || {};
  const variables: VariableDefinition[] = (contextCfg.availableVariables || []) as VariableDefinition[];

  const setVariables = (next: VariableDefinition[]) => {
    setIsDirty(true);
    const currentStation = (editingConfig.stationPrompts?.[stationKey as any] as any) || {};
    const updatedStation = {
      ...currentStation,
      contextConfiguration: {
        ...(currentStation.contextConfiguration || {}),
        availableVariables: next,
      },
    };
    setEditingConfig({
      ...editingConfig,
      stationPrompts: {
        ...editingConfig.stationPrompts,
        [stationKey]: updatedStation as any,
      } as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Variables</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">Add, edit, or delete variables available for Insert Variable/Component.</div>
            <button
              onClick={() => setVariables([...(variables || []), {
                key: 'newVariable',
                label: 'New Variable',
                description: '',
                type: 'string',
                category: 'user_input',
                required: false,
              } as any])}
              className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-gray-50 border-gray-200 text-gray-700"
            >
              + Add Variable
            </button>
          </div>
          <div className="divide-y divide-gray-100 rounded-md border border-gray-100 bg-white">
            {(variables || []).map((variable: VariableDefinition, index: number) => (
              <VariableEditor
                key={index}
                variable={variable}
                onUpdate={(updated) => {
                  const next = [...(variables || [])];
                  next[index] = updated as VariableDefinition;
                  setVariables(next);
                }}
                onDelete={() => {
                  const next = (variables || []).filter((_: any, i: number) => i !== index);
                  setVariables(next);
                }}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-gray-50 border-gray-200 text-gray-700"
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const StationSystemPromptSection: React.FC<SystemSectionProps> = ({
  stationKey,
  sectionId,
  title,
  description,
  headerColorClass,
  iconEmoji,
  isAdmin,
  expandedStations,
  setExpandedStations,
  editingConfig,
  setEditingConfig,
  setIsDirty,
  copyToClipboard,
  contextConfiguration,
  placeholder = 'You are an expert copywriter...'
}) => {
  const [showSystemPreview, setShowSystemPreview] = useState(false);
  const [showVarManager, setShowVarManager] = useState(false);
  const isOpen = expandedStations.has(sectionId);
  const systemTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const systemPrompt = (editingConfig.stationPrompts?.[stationKey as any] as any)?.systemPrompt || '';

  const systemPreview = useMemo(() => {
    const base = systemPrompt || '';
    const ctx = contextConfiguration as any;
    if (!ctx) return base;
    const enabled = (ctx.contextSections || [])
      .filter((s: any) => s.enabled)
      .map((s: any) => `\n\n**[${s.name.toUpperCase()}]**\n{${s.id}}`)
      .join('');
    return `${base}${enabled}`;
  }, [systemPrompt, contextConfiguration]);

  const toggle = () => {
    const next = new Set(expandedStations);
    if (isOpen) next.delete(sectionId); else next.add(sectionId);
    setExpandedStations(next);
  };

  const onChange = (value: string) => {
    if (!isAdmin) return;
    setIsDirty(true);
    const currentStation = (editingConfig.stationPrompts?.[stationKey as any] as any) || {};
    const updatedStation = { ...currentStation, systemPrompt: value };
    setEditingConfig({
      ...editingConfig,
      stationPrompts: {
        ...editingConfig.stationPrompts,
        [stationKey]: updatedStation as any,
      } as any,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button onClick={toggle} className={`flex items-center justify-between w-full p-4 rounded-t-lg transition-colors duration-200 ${headerColorClass}`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isOpen ? <span className={headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}>▼</span> : <span className={headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}>▶</span>}
            <span className={headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}>{iconEmoji}</span>
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-semibold ${headerColorClass.includes('blue') ? 'text-blue-900' : 'text-green-900'}`}>{title}</h3>
            {!isOpen && (
              <p className={`text-sm mt-1 ${headerColorClass.includes('blue') ? 'text-blue-700' : 'text-green-700'}`}>{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium ${headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}`}>{isOpen ? 'Collapse' : 'Expand'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-100 space-y-6">
          <ProtectedPromptEditor
            label="Base System Prompt (Editable)"
            value={systemPrompt}
            onChange={onChange}
            placeholder={placeholder}
            rows={8}
            disabled={!isAdmin}
            copyToClipboard={copyToClipboard}
            textareaRef={systemTextareaRef}
            contextConfiguration={contextConfiguration}
          />
          <div className="flex justify-between">
            <button
              className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-gray-50 border-gray-200 text-gray-700"
              onClick={() => setShowVarManager(true)}
              title="Add, edit, or delete available variables"
            >
              Manage Variables
            </button>
            <button className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-blue-50 border-blue-200 text-blue-700" onClick={() => setShowSystemPreview(true)} title="View resolved system prompt">
              <Eye size={16} className="mr-1" />
              Preview
            </button>
          </div>

          <Dialog open={showSystemPreview} onOpenChange={setShowSystemPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Resolved System Prompt</DialogTitle>
              </DialogHeader>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[60vh] overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{systemPreview}</pre>
              </div>
            </DialogContent>
          </Dialog>

          <VariableManagerModal
            open={showVarManager}
            onOpenChange={setShowVarManager}
            stationKey={stationKey}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            setIsDirty={setIsDirty}
          />
        </div>
      )}
    </div>
  );
};

interface UserSectionProps extends BaseSectionProps {
  placeholder?: string;
  rows?: number;
}

export const StationUserPromptSection: React.FC<UserSectionProps> = ({
  stationKey,
  sectionId,
  title,
  description,
  headerColorClass,
  iconEmoji,
  isAdmin,
  expandedStations,
  setExpandedStations,
  editingConfig,
  setEditingConfig,
  setIsDirty,
  copyToClipboard,
  contextConfiguration,
  placeholder = 'Create content...'
}) => {
  const [showUserPreview, setShowUserPreview] = useState(false);
  const [showVarManager, setShowVarManager] = useState(false);
  const isOpen = expandedStations.has(sectionId);
  const userTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const station = (editingConfig.stationPrompts?.[stationKey as any] as any) || {};
  const userPromptTemplate = station.userPromptTemplate || '';
  const systemPrompt = station.systemPrompt || '';

  const toggle = () => {
    const next = new Set(expandedStations);
    if (isOpen) next.delete(sectionId); else next.add(sectionId);
    setExpandedStations(next);
  };

  const onChange = (value: string) => {
    if (!isAdmin) return;
    setIsDirty(true);
    const currentStation = (editingConfig.stationPrompts?.[stationKey as any] as any) || {};
    const updatedStation = { ...currentStation, userPromptTemplate: value };
    setEditingConfig({
      ...editingConfig,
      stationPrompts: {
        ...editingConfig.stationPrompts,
        [stationKey]: updatedStation as any,
      } as any,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button onClick={toggle} className={`flex items-center justify-between w-full p-4 rounded-t-lg transition-colors duration-200 ${headerColorClass}`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isOpen ? <span className={headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}>▼</span> : <span className={headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}>▶</span>}
            <span className={headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}>{iconEmoji}</span>
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-semibold ${headerColorClass.includes('blue') ? 'text-blue-900' : 'text-green-900'}`}>{title}</h3>
            {!isOpen && (
              <p className={`text-sm mt-1 ${headerColorClass.includes('blue') ? 'text-blue-700' : 'text-green-700'}`}>{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium ${headerColorClass.includes('blue') ? 'text-blue-600' : 'text-green-600'}`}>{isOpen ? 'Collapse' : 'Expand'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-100 space-y-6">
          <ProtectedPromptEditor
            label="Base User Prompt Template (Editable)"
            value={userPromptTemplate}
            onChange={onChange}
            placeholder={placeholder}
            rows={6}
            disabled={!isAdmin}
            copyToClipboard={copyToClipboard}
            textareaRef={userTextareaRef}
            contextConfiguration={contextConfiguration}
          />
          <div className="flex justify-between">
            <button
              className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-gray-50 border-gray-200 text-gray-700"
              onClick={() => setShowVarManager(true)}
              title="Add, edit, or delete available variables"
            >
              Manage Variables
            </button>
            <button className="inline-flex items-center text-sm px-3 py-2 border rounded-md hover:bg-green-50 border-green-200 text-green-700" onClick={() => setShowUserPreview(true)} title="View resolved user prompt">
              <Eye size={16} className="mr-1" />
              Preview
            </button>
          </div>

          <Dialog open={showUserPreview} onOpenChange={setShowUserPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Resolved User Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[40vh] overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{userPromptTemplate}</pre>
                </div>
                {extractOutputStructureCommon(systemPrompt || '') && (
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-amber-800 mb-2">Output Structure</div>
                    <div className="bg-white border border-amber-200 rounded p-3 max-h-[30vh] overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{extractOutputStructureCommon(systemPrompt || '')}</pre>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <VariableManagerModal
            open={showVarManager}
            onOpenChange={setShowVarManager}
            stationKey={stationKey}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            setIsDirty={setIsDirty}
          />
        </div>
      )}
    </div>
  );
};

