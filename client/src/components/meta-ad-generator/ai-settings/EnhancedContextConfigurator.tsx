import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Eye, EyeOff, Move, Plus, Trash2 } from 'lucide-react';
import { TrainingConfig, VariableDefinition, ContextSectionConfig, BrandGuidelinesConfig } from '@shared/training-config';

type StationKey = keyof NonNullable<TrainingConfig['stationPrompts']>;

// Default variables shared across stations
const DEFAULT_VARIABLES: VariableDefinition[] = [
  {
    key: 'transcription',
    label: 'Transcription',
    description: 'Input transcription or brief content from the user',
    type: 'string',
    category: 'user_input',
    required: false,
  },
  {
    key: 'landingPageContext',
    label: 'Landing Page Context',
    description: 'Context scraped from the provided landing page URL',
    type: 'string',
    category: 'system_generated',
    required: false,
  },
  {
    key: 'persona',
    label: 'Persona',
    description: 'Selected persona key (e.g., "lifeJuggler")',
    type: 'string',
    category: 'ai_settings',
    required: false,
  },
  {
    key: 'brandPercent',
    label: 'Brand Percentage',
    description: 'Brand voice percentage (e.g., "60")',
    type: 'number',
    category: 'ai_settings',
    required: false,
  },
  {
    key: 'drPercent',
    label: 'DR Percentage',
    description: 'Direct response percentage (e.g., "40")',
    type: 'number',
    category: 'ai_settings',
    required: false,
  },
  {
    key: 'brandDrBalance',
    label: 'Brand/DR Balance',
    description: 'Brand vs Direct Response balance (0-100)',
    type: 'number',
    category: 'ai_settings',
    required: false,
  },
  {
    key: 'useJonesBrandGuide',
    label: 'Use Jones Brand Guide',
    description: 'Whether to include Jones Road brand guidelines in context',
    type: 'boolean',
    category: 'ai_settings',
    required: false,
  },
  {
    key: 'selectedProduct',
    label: 'Selected Product',
    description: 'Primary selected product ID or name',
    type: 'string',
    category: 'ai_settings',
    required: false,
  },
  {
    key: 'selectedProducts',
    label: 'Selected Products',
    description: 'Multiple selected products for broader context',
    type: 'array',
    category: 'ai_settings',
    required: false,
  },
];

// Extract variable paths from templates (simple handlebars-style parser)
const extractTemplateVariablePaths = (template: string): string[] => {
  if (!template) return [];
  const paths = new Set<string>();

  const varRegex = /\{\{([^#\/][^}]+)\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = varRegex.exec(template)) !== null) {
    const raw = m[1].trim();
    if (raw.includes(' ')) continue; // likely a helper call
    paths.add(raw);
  }

  const ifRegex = /\{\{#if\s+([^}]+)\}\}/g;
  while ((m = ifRegex.exec(template)) !== null) {
    const expr = m[1].trim();
    // naive split by non-word characters to collect identifiers
    expr.split(/[^A-Za-z0-9_.]+/).forEach(tok => {
      if (tok && !/^\d+$/.test(tok)) paths.add(tok);
    });
  }

  const eachRegex = /\{\{#each\s+([^}]+)\}\}/g;
  while ((m = eachRegex.exec(template)) !== null) {
    const arrPath = m[1].trim();
    if (arrPath) paths.add(arrPath);
  }

  // Normalize to root keys
  const rootKeys = Array.from(paths)
    .map(p => p.split('.')[0])
    .filter(k => k && k !== 'this' && k !== '@index');
  return Array.from(new Set(rootKeys));
};

// Station-specific default variables derived dynamically from templates
const getDefaultVariablesForStation = (stationKey: StationKey, config: TrainingConfig): VariableDefinition[] => {
  const base = [...DEFAULT_VARIABLES];

  const stationPrompts = config.stationPrompts?.[stationKey] as any;
  const systemTemplate = stationPrompts?.systemPrompt || '';
  const userTemplate = stationPrompts?.userPromptTemplate || '';

  const keys = new Set<string>([
    ...extractTemplateVariablePaths(systemTemplate),
    ...extractTemplateVariablePaths(userTemplate),
  ]);

  // Build variable definitions for discovered keys that are not already in base
  const baseKeys = new Set(base.map(v => v.key));
  const discovered: VariableDefinition[] = Array.from(keys)
    .filter(k => !baseKeys.has(k))
    .map(k => ({
      key: k,
      label: k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()),
      description: '',
      type: 'string',
      category: 'ai_settings',
      required: false,
    } as VariableDefinition));

  return [...base, ...discovered];
};

// Base context sections shared across stations
const BASE_DEFAULT_SECTIONS: ContextSectionConfig[] = [
  {
    id: 'transcription_context',
    name: 'Transcription Context',
    description: 'Video/audio transcription content',
    enabled: true,
    required: false,
    order: 1,
    template: `{{#if transcription}}\n# TRANSCRIPTION CONTEXT:\n{{transcription}}\n\nUse this content as the foundation for your copy.{{/if}}`,
    conditions: {
      requiredVariables: ['transcription'],
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal',
    },
    dataSource: {
      type: 'function',
      source: 'ContentContextBuilder.buildTranscriptionContext',
      parameters: {
        transcription: '$transcription',
        contentType: 'video',
      },
    },
  },
  {
    id: 'ai_settings_context',
    name: 'AI Settings Context',
    description: 'Brand guidelines, product claims, persona pillars, etc.',
    enabled: false,
    required: false,
    order: 98,
    template: `{{aiSettingsContext}}`,
    conditions: {},
    formatting: {
      headerStyle: 'none',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal',
    },
    dataSource: {
      type: 'function',
      source: 'ContentContextBuilder.buildBrandAndProductContext',
      parameters: {}
    } as any
  },
  {
    id: 'station_enhancements',
    name: 'Station Enhancements',
    description: 'Station-specific best practices and rules',
    enabled: false,
    required: false,
    order: 99,
    template: `{{stationEnhancements}}`,
    conditions: {},
    formatting: {
      headerStyle: 'none',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal',
    },
    dataSource: {
      type: 'function',
      source: 'StationPromptManager.buildStationEnhancements',
      parameters: {}
    } as any
  },
  {
    id: 'quality_guidelines',
    name: 'Quality Guidelines',
    description: 'Quality standards to ensure consistent output',
    enabled: false,
    required: false,
    order: 100,
    template: `{{qualityGuidelines}}`,
    conditions: {},
    formatting: {
      headerStyle: 'none',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal',
    },
    dataSource: {
      type: 'function',
      source: 'StationPromptManager.buildQualityGuidelines',
      parameters: {}
    } as any
  },
  {
    id: 'target_persona',
    name: 'Target Persona Section',
    description: 'Persona targeting content and pillars',
    enabled: true,
    required: true,
    order: 2,
    template: `{{#if persona}}\nTARGET PERSONA - {{persona}}:\n{{#if personaDescription}}Description: {{personaDescription}}{{/if}}\n\n{{#if personaPillars}}\nKey Targeting Pillars:\n{{#each personaPillars}}\n- {{this}}\n{{/each}}\n{{/if}}\n\nPERSONA-SPECIFIC TARGETING REQUIREMENTS:\n- Tailor content to this persona\n- Use relatable scenarios\n- Address specific pain points\n- Reflect lifestyle and challenges\n{{/if}}`,
    conditions: {
      requiredVariables: ['persona'],
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal',
    },
    dataSource: {
      type: 'function',
      source: 'buildTargetPersonaSection',
      parameters: { persona: '$persona' },
    },
  },
  {
    id: 'image_analysis',
    name: 'Image Analysis Section',
    description: 'Visual content analysis and insights',
    enabled: true,
    required: false,
    order: 3,
    template: `{{#if hasImageContent}}\nVISUAL CONTENT ANALYSIS:\nAnalyze the creative to extract key visual elements and messaging cues.{{/if}}`,
    conditions: {
      requiredVariables: ['uploadedImage', 'airLink'],
      customLogic: 'variables.uploadedImage || variables.airLink',
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal',
    },
    dataSource: {
      type: 'function',
      source: 'ContentContextBuilder.buildImageAnalysisContext',
      parameters: {
        imageData: '$uploadedImage',
        imageUrl: '$airLink',
        analysisType: 'ad_creative',
      },
    },
  },
];

// Station-specific default sections
const getDefaultSectionsForStation = (stationKey: StationKey): ContextSectionConfig[] => {
  const common = [...BASE_DEFAULT_SECTIONS];

  if (stationKey === 'adCopy') {
    // Add Headline Copy Frameworks section for Ad Copy station
    common.push({
      id: 'copy_frameworks',
      name: 'Copy Frameworks Section',
      description: 'Headline frameworks and copywriting guidance',
      enabled: true,
      required: false,
      order: 4,
      template: `HEADLINE FRAMEWORK GUIDANCE:\nUse these proven frameworks to create diverse headline variations:\n\n{{#each headlineFrameworks}}\n• {{name}}: {{description}}\n  Template: {{template}}\n  {{#if examples}}Examples: {{join examples ", "}}{{/if}}\n{{/each}}\n\nFRAMEWORK APPLICATION:\n- Create headlines using different frameworks for testing variety\n- Match framework choice to the specific customer motivation being targeted\n- Ensure each headline serves a distinct strategic purpose`,
      conditions: {},
      formatting: {
        headerStyle: 'uppercase',
        bulletStyle: '•',
        indentation: 0,
        spacing: 'normal',
      },
      dataSource: {
        type: 'function',
        source: 'buildCopyFrameworksSection',
        parameters: {},
      },
    } as any);
  }

  if (stationKey === 'landingPage') {
    // Add Landing Page Frameworks section for Landing Page station
    common.push({
      id: 'landing_page_frameworks',
      name: 'Landing Page Frameworks Section',
      description: 'Landing page frameworks and structure guidance',
      enabled: true,
      required: false,
      order: 4,
      template: `LANDING PAGE FRAMEWORK GUIDANCE:\nUse these frameworks to structure conversion-focused landing pages:\n\n{{#each landingPageFrameworks}}\n• {{name}}: {{description}}\n  Template: {{template}}\n  {{#if examples}}Examples: {{join examples ", "}}{{/if}}\n{{/each}}\n\nFRAMEWORK APPLICATION:\n- Map sections to the chosen framework structure\n- Ensure clear value proposition and benefit hierarchy\n- Place CTAs strategically for optimal conversion`,
      conditions: {},
      formatting: {
        headerStyle: 'uppercase',
        bulletStyle: '•',
        indentation: 0,
        spacing: 'normal',
      },
      dataSource: {
        type: 'function',
        source: 'buildLandingPageFrameworksSection',
        parameters: {},
      },
    } as any);
  }

  if (stationKey === 'emailSmsRetention') {
    // Add Email/SMS Frameworks section for retention station
    common.push({
      id: 'email_frameworks',
      name: 'Email/SMS Frameworks Section',
      description: 'Subject line frameworks and retention best practices',
      enabled: true,
      required: false,
      order: 4,
      template: `SUBJECT LINE FRAMEWORK GUIDANCE:\nUse these frameworks to craft engaging subject lines:\n\n{{#if subjectLineFrameworks}}\n{{#each subjectLineFrameworks}}\n• {{this}}\n{{/each}}\n{{/if}}\n\nRETENTION BEST PRACTICES:\n{{#if retentionBestPractices}}\n{{#each retentionBestPractices}}\n- {{this}}\n{{/each}}\n{{/if}}\n\nAPPLICATION NOTES:\n- Match the subject line framework to the campaign objective\n- Personalize where appropriate (first name, purchase history)\n- Balance frequency to avoid fatigue`,
      conditions: {},
      formatting: {
        headerStyle: 'uppercase',
        bulletStyle: '•',
        indentation: 0,
        spacing: 'normal',
      },
      dataSource: {
        type: 'function',
        source: 'buildEmailFrameworksSection',
        parameters: {},
      },
    } as any);
  }

  // Append a default Output Instructions section so teams can configure it per station
  common.push({
    id: 'output_instructions',
    name: 'Output Instructions',
    description: 'Defines the required response format for this station',
    enabled: true,
    required: false,
    order: 9999,
    template: `# Output Format\nProvide your response in the exact structure required for this station.\n\nFor JSON outputs, ensure valid JSON and include all required fields.`,
    conditions: {},
    formatting: { headerStyle: 'title', bulletStyle: '-', indentation: 0, spacing: 'normal' },
    dataSource: { type: 'static', source: '' },
  } as any);

  return common;
};

// Default brand guideline template
const defaultBrandTemplate = `{{header}}\n{{#if corePositioning}}\nCore Positioning:\n{{corePositioning}}\n{{/if}}\n{{#if brandVoice}}\nBrand Voice:\n{{#each brandVoice}}\n- {{this}}\n{{/each}}\n{{/if}}\n{{#if keyTerminology}}\nKey Terminology:\n{{#each keyTerminology}}\n- {{this}}\n{{/each}}\n{{/if}}\n{{#if approvedLanguage}}\nApproved Language:\n{{#each approvedLanguage}}\n- {{this}}\n{{/each}}\n{{/if}}\n{{#if avoidedLanguage}}\nLanguage to Avoid:\n{{#each avoidedLanguage}}\n- {{this}}\n{{/each}}\n{{/if}}`;

const VariableInsertion: React.FC<{
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  availableVariables: VariableDefinition[];
  position?: 'left' | 'right';
}> = ({ textareaRef, value, onChange, availableVariables, position = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variableString = `{{${variableKey}}}`;
    const newValue = value.substring(0, start) + variableString + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableString.length, start + variableString.length);
    }, 0);
    setIsOpen(false);
  };

  const dropdownClasses = position === 'right'
    ? 'absolute top-8 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64'
    : 'absolute top-8 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64';

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-1">
        <Plus className="w-4 h-4" />
        <span>Insert Variable</span>
      </Button>
      {isOpen && (
        <div className={dropdownClasses}>
          <div className="text-sm font-medium text-gray-700 mb-2">Available Variables</div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {availableVariables.length === 0 ? (
              <div className="text-sm text-gray-500 p-2">No variables defined yet</div>
            ) : (
              availableVariables.map((variable) => (
                <button
                  key={variable.key}
                  onClick={() => insertVariable(variable.key)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                >
                  <div className="font-medium text-blue-600">{`{{${variable.key}}}`}</div>
                  <div className="text-gray-700 text-xs font-medium">{variable.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{variable.description}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const VariableEditor: React.FC<{
  variable: VariableDefinition;
  onUpdate: (variable: VariableDefinition) => void;
  onDelete: () => void;
}> = ({ variable, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="group rounded-md px-2 py-1.5 hover:bg-gray-50">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center space-x-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <div className="flex items-center min-w-0">
            <span className="font-medium text-sm truncate max-w-[240px]">{variable.label || variable.key}</span>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">({variable.type})</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <span className={`px-1.5 py-0.5 text-xs rounded-md ${
            variable.category === 'user_input' ? 'bg-blue-100 text-blue-800' :
            variable.category === 'system_generated' ? 'bg-green-100 text-green-800' :
            variable.category === 'context_section' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800'
          }`}>{variable.category}</span>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <Input value={variable.key} onChange={(e) => onUpdate({ ...variable, key: e.target.value })} placeholder="variableName" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <Input value={variable.label} onChange={(e) => onUpdate({ ...variable, label: e.target.value })} placeholder="Display Name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea value={variable.description} onChange={(e) => onUpdate({ ...variable, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select value={variable.type} onValueChange={(value) => onUpdate({ ...variable, type: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={variable.category} onValueChange={(value) => onUpdate({ ...variable, category: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_input">User Input</SelectItem>
                  <SelectItem value="system_generated">System Generated</SelectItem>
                  <SelectItem value="context_section">Context Section</SelectItem>
                  <SelectItem value="brand_guideline">Brand Guideline</SelectItem>
                  <SelectItem value="ai_settings">AI Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3 pt-4">
              <label className="flex items-center space-x-2">
                <Switch checked={variable.required || false} onCheckedChange={(checked) => onUpdate({ ...variable, required: checked })} />
                <span className="text-sm">Required</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContextSectionEditor: React.FC<{
  section: ContextSectionConfig;
  onUpdate: (section: ContextSectionConfig) => void;
  onDelete: () => void;
  onReorder: (newOrder: number) => void;
  availableVariables?: VariableDefinition[];
}> = ({ section, onUpdate, onDelete, onReorder, availableVariables = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const templateRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="group rounded-md px-2 py-1.5 hover:bg-gray-50">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center space-x-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <div className="flex items-center space-x-2 min-w-0">
            <Move className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-sm truncate max-w-[240px]">{section.name}</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">#{section.order}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={section.enabled}
            onCheckedChange={(checked) => onUpdate({ ...section, enabled: checked })}
            onClick={(e) => e.stopPropagation()}
          />
          {section.enabled ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input value={section.name} onChange={(e) => onUpdate({ ...section, name: e.target.value })} placeholder="Section Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <Input type="number" value={section.order} onChange={(e) => { const newOrder = parseInt(e.target.value) || 0; onUpdate({ ...section, order: newOrder }); onReorder(newOrder); }} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea value={section.description} onChange={(e) => onUpdate({ ...section, description: e.target.value })} rows={2} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <VariableInsertion textareaRef={templateRef} value={section.template} onChange={(val) => onUpdate({ ...section, template: val })} availableVariables={availableVariables} position="right" />
            </div>
            <Textarea ref={templateRef} value={section.template} onChange={(e) => onUpdate({ ...section, template: e.target.value })} rows={8} className="font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Variables (comma-separated)</label>
            <Input
              value={section.conditions.requiredVariables?.join(', ') || ''}
              onChange={(e) => onUpdate({ ...section, conditions: { ...section.conditions, requiredVariables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) } })}
              placeholder="transcription, persona"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const BrandGuidelinesEditor: React.FC<{
  guideline: BrandGuidelinesConfig;
  onUpdate: (guideline: BrandGuidelinesConfig) => void;
  onDelete: () => void;
  onReorder: (newOrder: number) => void;
  availableVariables?: VariableDefinition[];
}> = ({ guideline, onUpdate, onDelete, onReorder, availableVariables = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const templateRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-blue-700">{guideline.name}</span>
            <span className="text-sm text-blue-500">#{guideline.order}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={guideline.enabled}
            onCheckedChange={(checked) => onUpdate({ ...guideline, enabled: checked })}
            onClick={(e) => e.stopPropagation()}
          />
          {guideline.enabled ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input value={guideline.name} onChange={(e) => onUpdate({ ...guideline, name: e.target.value })} placeholder="Brand Guideline Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <Input type="number" value={guideline.order} onChange={(e) => { const newOrder = parseInt(e.target.value) || 0; onUpdate({ ...guideline, order: newOrder }); onReorder(newOrder); }} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea value={guideline.description} onChange={(e) => onUpdate({ ...guideline, description: e.target.value })} rows={2} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <VariableInsertion textareaRef={templateRef} value={guideline.template} onChange={(val) => onUpdate({ ...guideline, template: val })} availableVariables={availableVariables} position="right" />
            </div>
            <Textarea ref={templateRef} value={guideline.template} onChange={(e) => onUpdate({ ...guideline, template: e.target.value })} placeholder="Custom template for brand guidelines. Leave empty to use default formatting." defaultValue={defaultBrandTemplate} rows={8} className="font-mono text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Style</label>
              <Select value={guideline.formatting.headerStyle} onValueChange={(v) => onUpdate({ ...guideline, formatting: { ...guideline.formatting, headerStyle: v as any } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uppercase">UPPERCASE</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                  <SelectItem value="none">none</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bullet Style</label>
              <Select value={guideline.formatting.bulletStyle} onValueChange={(v) => onUpdate({ ...guideline, formatting: { ...guideline.formatting, bulletStyle: v as any } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="•">• Bullet</SelectItem>
                  <SelectItem value="-">- Dash</SelectItem>
                  <SelectItem value="→">→ Arrow</SelectItem>
                  <SelectItem value="numbered">1. Numbered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spacing</label>
              <Select value={guideline.formatting.spacing} onValueChange={(v) => onUpdate({ ...guideline, formatting: { ...guideline.formatting, spacing: v as any } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <Switch checked={guideline.required} onCheckedChange={(checked) => onUpdate({ ...guideline, required: checked })} />
              <span className="text-sm">Required Guideline</span>
            </label>
            <label className="flex items-center space-x-2">
              <Switch checked={guideline.formatting.includeHeaders} onCheckedChange={(checked) => onUpdate({ ...guideline, formatting: { ...guideline.formatting, includeHeaders: checked } })} />
              <span className="text-sm">Include Section Headers</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Initialize if missing or empty
  React.useEffect(() => {
    const cfg = contextConfig;
    const needsInit = !cfg || !Array.isArray(cfg.availableVariables) || cfg.availableVariables.length === 0 || !Array.isArray(cfg.contextSections) || cfg.contextSections.length === 0;
    if (needsInit) {
      const updated = {
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          [stationKey]: {
            ...(stationConfig as any),
            contextConfiguration: {
              availableVariables: getDefaultVariablesForStation(stationKey, editingConfig),
              contextSections: getDefaultSectionsForStation(stationKey),
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

  const getContextSectionVariables = (): VariableDefinition[] => contextConfig?.availableVariables || DEFAULT_VARIABLES;

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
                  const vars = contextConfig?.availableVariables || [];
                  updateContextConfig('availableVariables', [...vars, newVar]);
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
              {(contextConfig?.availableVariables || []).map((variable: VariableDefinition, index: number) => (
                <VariableEditor
                  key={variable.key || index}
                  variable={variable}
                  onUpdate={(updated) => {
                    const newVariables = [...(contextConfig?.availableVariables || [])];
                    newVariables[index] = updated;
                    updateContextConfig('availableVariables', newVariables);
                  }}
                  onDelete={() => {
                    const newVariables = (contextConfig?.availableVariables || []).filter((_: any, i: number) => i !== index);
                    updateContextConfig('availableVariables', newVariables);
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
                  template: defaultBrandTemplate,
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

