import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { TrainingConfig, VariableDefinition, BrandGuidelinesConfig, ContextSectionConfig } from '@shared/training-config';
import { VariableEditor } from './editors/VariableEditor';
import { ContextSectionEditor } from './editors/ContextSectionEditor';
import { BrandGuidelinesEditor } from './editors/BrandGuidelinesEditor';

type StationKey = keyof NonNullable<TrainingConfig['stationPrompts']>;

export const EnhancedContextConfigurator: React.FC<{
  stationKey: StationKey;
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  title?: string;
}> = ({ stationKey, editingConfig, setEditingConfig, title = 'Enhanced Context Configuration' }) => {
  const stationConfig = editingConfig.stationPrompts?.[stationKey];
  const contextConfig = stationConfig?.contextConfiguration as any;

  const updateContextConfig = (key: keyof NonNullable<typeof contextConfig>, value: any) => {
    const updated = {
      ...editingConfig,
      stationPrompts: {
        ...editingConfig.stationPrompts,
        [stationKey]: {
          ...(stationConfig as any),
          contextConfiguration: {
            ...(contextConfig || {}),
            [key]: value,
          },
        },
      },
    } as TrainingConfig;
    setEditingConfig(updated);
  };

  // Initialize if missing or empty (supports legacy 'variables' key)
  React.useEffect(() => {
    const cfg = contextConfig;
    const existingVars = (cfg?.availableVariables && Array.isArray(cfg.availableVariables) && cfg.availableVariables.length > 0)
      ? cfg.availableVariables
      : (cfg?.variables && Array.isArray(cfg.variables) && cfg.variables.length > 0)
        ? cfg.variables
        : undefined;
    const existingSections = (cfg?.contextSections && Array.isArray(cfg.contextSections) && cfg.contextSections.length > 0)
      ? cfg.contextSections
      : undefined;
    const needsInit = !cfg || !existingVars || !existingSections;
    if (needsInit) {
      const updated = {
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          [stationKey]: {
            ...(stationConfig as any),
            contextConfiguration: {
              // Prefer any existing values (including legacy 'variables'); otherwise, initialize empty
              availableVariables: existingVars || [],
              contextSections: existingSections || [],
              brandGuidelinesConfig: cfg?.brandGuidelinesConfig || [],
              contextRules: cfg?.contextRules,
            },
          },
        },
      } as TrainingConfig;
      setEditingConfig(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationKey]);

  // Build station-scoped variable list for insertions (prefer station's own list; otherwise empty)
  const getContextSectionVariables = (): VariableDefinition[] => {
    const cfg = contextConfig;
    const existing = (cfg?.availableVariables && Array.isArray(cfg.availableVariables) && cfg.availableVariables.length > 0)
      ? (cfg.availableVariables as VariableDefinition[])
      : (cfg?.variables && Array.isArray(cfg.variables) && cfg.variables.length > 0)
        ? (cfg.variables as VariableDefinition[])
        : undefined;
    return existing || [];
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6 border-t border-gray-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Available Variables */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold">Available Variables</h4>
              <Button
                variant="outline"
                onClick={() => {
                  const newVar: VariableDefinition = { key: 'newVariable', label: 'New Variable', description: '', type: 'string', category: 'user_input', required: false } as any;
                  const baseVars = getContextSectionVariables();
                  updateContextConfig('availableVariables', [...baseVars, newVar]);
                }}
                size="sm"
                className="pl-2 pr-3 gap-2"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                  <Plus className="w-3 h-3" />
                </span>
                <span>Add Variable</span>
              </Button>
            </div>
            <div className="divide-y divide-gray-100 rounded-md border border-gray-100 bg-white">
              {getContextSectionVariables().map((variable: VariableDefinition, index: number) => (
                <VariableEditor
                  key={index}
                  variable={variable}
                  onUpdate={(updated) => {
                    const baseVars = getContextSectionVariables();
                    const newVariables = [...baseVars];
                    newVariables[index] = updated as VariableDefinition;
                    updateContextConfig('availableVariables', newVariables as any);
                  }}
                  onDelete={() => {
                    const baseVars = getContextSectionVariables();
                    const newVariables = baseVars.filter((_: any, i: number) => i !== index);
                    updateContextConfig('availableVariables', newVariables as any);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Context Sections */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold">Context Sections</h4>
              <Button
                variant="outline"
                onClick={() => {
                  const newSection: ContextSectionConfig = {
                    id: `section_${Date.now()}`,
                    name: 'New Context Section',
                    description: '',
                    enabled: true,
                    required: false,
                    order: (contextConfig?.contextSections?.length || 0) + 1,
                    template: '',
                    conditions: {},
                    formatting: { headerStyle: 'uppercase', bulletStyle: '-', indentation: 0, spacing: 'normal' },
                    dataSource: { type: 'static', source: '' },
                  } as any;
                  const sections = contextConfig?.contextSections || [];
                  updateContextConfig('contextSections', [...sections, newSection]);
                }}
                size="sm"
                className="pl-2 pr-3 gap-2"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                  <Plus className="w-3 h-3" />
                </span>
                <span>Add Section</span>
              </Button>
            </div>
            <div className="divide-y divide-gray-100 rounded-md border border-gray-100 bg-white">
              {(contextConfig?.contextSections || [])
                .sort((a: ContextSectionConfig, b: ContextSectionConfig) => a.order - b.order)
                .map((section: ContextSectionConfig) => (
                  <ContextSectionEditor
                    key={section.id}
                    section={section}
                    availableVariables={getContextSectionVariables()}
                    onUpdate={(updated) => {
                      const newSections = (contextConfig?.contextSections || []).map((s: ContextSectionConfig) => s.id === section.id ? updated : s);
                      updateContextConfig('contextSections', newSections);
                    }}
                    onDelete={() => {
                      const newSections = (contextConfig?.contextSections || []).filter((s: ContextSectionConfig) => s.id !== section.id);
                      updateContextConfig('contextSections', newSections);
                    }}
                    onReorder={(newOrder) => {
                      const updated = { ...section, order: newOrder };
                      const newSections = (contextConfig?.contextSections || []).map((s: ContextSectionConfig) => s.id === section.id ? updated : s);
                      updateContextConfig('contextSections', newSections);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
        {/* Brand Guidelines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold">Brand Guidelines</h4>
            <Button
              variant="outline"
              onClick={() => {
                const newGuideline: BrandGuidelinesConfig = {
                  id: `brand_${Date.now()}`,
                  name: 'New Brand Guideline',
                  description: '',
                  enabled: true,
                  required: false,
                  order: (contextConfig?.brandGuidelinesConfig?.length || 0) + 1,
                  template: '',
                  includeTypes: {
                    corePositioning: true,
                    brandVoice: true,
                    keyTerminology: true,
                    approvedLanguage: true,
                    avoidedLanguage: true,
                  },
                  formatting: { headerStyle: 'uppercase', bulletStyle: '-', indentation: 0, spacing: 'normal', includeHeaders: true },
                  conditions: {},
                } as any;
                const list = contextConfig?.brandGuidelinesConfig || [];
                updateContextConfig('brandGuidelinesConfig', [...list, newGuideline]);
              }}
              size="sm"
              className="pl-2 pr-3 gap-2"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                <Plus className="w-3 h-3" />
              </span>
              <span>Add Brand Guideline</span>
            </Button>
          </div>
          <div className="space-y-4">
            {(contextConfig?.brandGuidelinesConfig || [])
              .sort((a: BrandGuidelinesConfig, b: BrandGuidelinesConfig) => a.order - b.order)
              .map((guideline: BrandGuidelinesConfig) => (
                <BrandGuidelinesEditor
                  key={guideline.id}
                  guideline={guideline}
                  availableVariables={getContextSectionVariables()}
                  onUpdate={(updated) => {
                    const newList = (contextConfig?.brandGuidelinesConfig || []).map((g: BrandGuidelinesConfig) => g.id === guideline.id ? updated : g);
                    updateContextConfig('brandGuidelinesConfig', newList);
                  }}
                  onDelete={() => {
                    const newList = (contextConfig?.brandGuidelinesConfig || []).filter((g: BrandGuidelinesConfig) => g.id !== guideline.id);
                    updateContextConfig('brandGuidelinesConfig', newList);
                  }}
                  onReorder={(newOrder) => {
                    const updated = { ...guideline, order: newOrder };
                    const newList = (contextConfig?.brandGuidelinesConfig || []).map((g: BrandGuidelinesConfig) => g.id === guideline.id ? updated : g);
                    updateContextConfig('brandGuidelinesConfig', newList);
                  }}
                />
              ))}
          </div>
        </div>

        {/* Context Building Rules */}
        <div>
          <h4 className="text-md font-semibold mb-4">Context Building Rules</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Tokens</label>
              <Input
                type="number"
                value={contextConfig?.contextRules?.maxTotalTokens || ''}
                onChange={(e) => {
                  const currentRules = contextConfig?.contextRules || {
                    sectionOrder: { fixed: [], flexible: [], priority: {} },
                    conditionalRules: {},
                    tokenManagement: { enabled: false, truncationStrategy: 'end' as const },
                  };
                  updateContextConfig('contextRules', { ...currentRules, maxTotalTokens: parseInt(e.target.value) || undefined });
                }}
                placeholder="e.g., 2000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedContextConfigurator;
