import React, { useState, useRef } from 'react';
import EnhancedContextConfigurator from '@/components/meta-ad-generator/ai-settings/EnhancedContextConfigurator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrainingConfig, VariableDefinition, ContextSectionConfig, ContextBuildingRules, AISettingsContextConfig, BrandGuidelinesConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, Target, Copy, Plus, Settings, Move, Trash2, Eye, EyeOff } from 'lucide-react';

interface EnhancedAdCopyStationProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  expandedStations: Set<string>;
  setExpandedStations: (stations: Set<string>) => void;
  copyToClipboard: (text: string, label: string) => Promise<void>;
}

const StationToggleButton = ({ 
  isOpen, 
  onClick, 
  title, 
  icon, 
  iconColor,
  description
}: { 
  isOpen: boolean; 
  onClick: () => void; 
  title: string; 
  icon: React.ReactNode; 
  iconColor: string;
  description: string;
}) => (
  <div className="bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200">
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {!isOpen && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 font-medium">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </div>
    </button>
  </div>
);

// Default variables for Ad Copy station
const DEFAULT_AD_COPY_VARIABLES: VariableDefinition[] = [
  { 
    key: 'transcription', 
    label: 'Transcription', 
    description: 'The input transcription or brief content from the user',
    type: 'string',
    category: 'user_input',
    required: false
  },
  { 
    key: 'landingPageContext', 
    label: 'Landing Page Context', 
    description: 'Context scraped from the provided landing page URL',
    type: 'string',
    category: 'system_generated',
    required: false
  },
  { 
    key: 'targetAudience', 
    label: 'Target Audience', 
    description: 'The target audience specified in the request',
    type: 'string',
    category: 'user_input',
    required: false
  },
  { 
    key: 'brandPercent', 
    label: 'Brand Percentage', 
    description: 'Brand voice percentage (e.g., "60")',
    type: 'number',
    category: 'ai_settings',
    required: false
  },
  { 
    key: 'drPercent', 
    label: 'DR Percentage', 
    description: 'Direct response percentage (e.g., "40")',
    type: 'number',
    category: 'ai_settings',
    required: false
  },
  { 
    key: 'persona', 
    label: 'Persona', 
    description: 'The selected persona (e.g., "lifeJuggler")',
    type: 'string',
    category: 'ai_settings',
    required: false
  },
];

// Default context sections for Ad Copy station
const DEFAULT_AD_COPY_SECTIONS: ContextSectionConfig[] = [
  {
    id: 'transcription_context',
    name: 'Transcription Context',
    description: 'Video/audio transcription content',
    enabled: true,
    required: false,
    order: 1,
    template: `{{#if transcription}}
# TRANSCRIPTION CONTEXT:
{{transcription}}

Use this content as the foundation for your copy, extracting key messages, emotional hooks, and authentic language that resonates with the target audience.
{{/if}}`,
    conditions: {
      requiredVariables: ['transcription']
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal'
    },
    dataSource: {
      type: 'function',
      source: 'ContentContextBuilder.buildTranscriptionContext',
      parameters: {
        transcription: '$transcription',
        contentType: 'video'
      }
    }
  },
  {
    id: 'target_persona',
    name: 'Target Persona Section',
    description: 'Persona targeting content and pillars',
    enabled: true,
    required: true,
    order: 2,
    template: `{{#if persona}}
TARGET PERSONA - {{persona}}:
{{#if personaDescription}}Description: {{personaDescription}}{{/if}}

{{#if personaPillars}}
Key Targeting Pillars:
{{#each personaPillars}}
- {{this}}
{{/each}}
{{/if}}

PERSONA-SPECIFIC TARGETING REQUIREMENTS:
- Tailor ALL headlines and primary text to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges
{{/if}}`,
    conditions: {
      requiredVariables: ['persona']
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal'
    },
    dataSource: {
      type: 'function',
      source: 'buildTargetPersonaSection',
      parameters: {
        persona: '$persona'
      }
    }
  },
  {
    id: 'selected_products',
    name: 'Selected Products Section',
    description: 'Product-specific claims and information',
    enabled: true,
    required: false,
    order: 3,
    template: `{{#if selectedProduct}}
PRODUCT FOCUS:
Primary Product: {{selectedProduct}}

{{#if productClaims}}
PRODUCT-SPECIFIC CLAIMS:
{{#if productClaims.approved}}
Approved Claims (USE THESE):
{{#each productClaims.approved}}
- {{this}}
{{/each}}
{{/if}}

{{#if productClaims.prohibited}}
Prohibited Claims (NEVER USE):
{{#each productClaims.prohibited}}
- {{this}}
{{/each}}
{{/if}}
{{/if}}
{{/if}}`,
    conditions: {
      requiredVariables: ['selectedProduct']
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal'
    },
    dataSource: {
      type: 'function',
      source: 'buildSelectedProductsSection',
      parameters: {
        selectedProduct: '$selectedProduct',
        selectedProducts: '$selectedProducts'
      }
    }
  },
  {
    id: 'copy_frameworks',
    name: 'Copy Frameworks Section',
    description: 'Headline frameworks and copywriting guidance',
    enabled: true,
    required: false,
    order: 4,
    template: `HEADLINE FRAMEWORK GUIDANCE:
Use these proven frameworks to create diverse headline variations:

{{#each headlineFrameworks}}
• {{name}}: {{description}}
  Template: {{template}}
  {{#if examples}}Examples: {{join examples ", "}}{{/if}}
{{/each}}

FRAMEWORK APPLICATION:
- Create headlines using different frameworks for testing variety
- Match framework choice to the specific customer motivation being targeted
- Ensure each headline serves a distinct strategic purpose`,
    conditions: {},
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '•',
      indentation: 0,
      spacing: 'normal'
    },
    dataSource: {
      type: 'function',
      source: 'buildCopyFrameworksSection',
      parameters: {}
    }
  },
  {
    id: 'custom_brief',
    name: 'Custom Brief Section',
    description: 'User-provided custom instructions',
    enabled: true,
    required: false,
    order: 5,
    template: `{{#if customBrief}}
CUSTOM BRIEF FOR THIS GENERATION:
{{customBrief}}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the ad copy while maintaining brand voice and framework structure.
{{/if}}`,
    conditions: {
      requiredVariables: ['customBrief']
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal'
    },
    dataSource: {
      type: 'function',
      source: 'buildCustomBriefSection',
      parameters: {
        customBrief: '$customBrief'
      }
    }
  },
  {
    id: 'image_analysis',
    name: 'Image Analysis Section',
    description: 'Visual content analysis and insights',
    enabled: true,
    required: false,
    order: 6,
    template: `{{#if hasImageContent}}
VISUAL CONTENT ANALYSIS:
Analyze the ad creative to extract key visual elements, text overlay, color scheme, brand elements, and overall messaging strategy. Use insights from this visual content to inform your copy generation while maintaining brand consistency.

{{#if imageUrl}}Image Source: {{imageUrl}}{{/if}}
{{/if}}`,
    conditions: {
      requiredVariables: ['uploadedImage', 'airLink'],
      customLogic: 'variables.uploadedImage || variables.airLink'
    },
    formatting: {
      headerStyle: 'uppercase',
      bulletStyle: '-',
      indentation: 0,
      spacing: 'normal'
    },
    dataSource: {
      type: 'function',
      source: 'ContentContextBuilder.buildImageAnalysisContext',
      parameters: {
        imageData: '$uploadedImage',
        imageUrl: '$airLink',
        analysisType: 'ad_creative'
      }
    }
  }
];

// Variable Insertion Component
const VariableInsertion: React.FC<{
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  availableVariables: VariableDefinition[];
  position?: 'left' | 'right';
}> = ({ textareaRef, value, onChange, availableVariables, position = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variableString = `{{${variableKey}}}`;
    
    const newValue = value.substring(0, start) + variableString + value.substring(end);
    onChange(newValue);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableString.length, start + variableString.length);
    }, 0);
    
    setIsOpen(false);
  };

  const dropdownClasses = position === 'right' 
    ? "absolute top-8 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64"
    : "absolute top-8 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64";

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1"
      >
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
                  <div className="text-xs text-gray-400 mt-1">
                    <span className={`px-1 py-0.5 rounded text-xs ${
                      variable.category === 'user_input' ? 'bg-blue-100 text-blue-700' :
                      variable.category === 'system_generated' ? 'bg-green-100 text-green-700' :
                      variable.category === 'context_section' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {variable.type}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Variable Editor Component
const VariableEditor: React.FC<{
  variable: VariableDefinition;
  onUpdate: (variable: VariableDefinition) => void;
  onDelete: () => void;
}> = ({ variable, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <div>
            <span className="font-medium">{variable.label || variable.key}</span>
            <span className="text-sm text-gray-500 ml-2">({variable.type})</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded ${
            variable.category === 'user_input' ? 'bg-blue-100 text-blue-800' :
            variable.category === 'system_generated' ? 'bg-green-100 text-green-800' :
            variable.category === 'context_section' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {variable.category}
          </span>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <Input
                value={variable.key}
                onChange={(e) => onUpdate({ ...variable, key: e.target.value })}
                placeholder="variableName"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <Input
                value={variable.label}
                onChange={(e) => onUpdate({ ...variable, label: e.target.value })}
                placeholder="Display Name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              value={variable.description}
              onChange={(e) => onUpdate({ ...variable, description: e.target.value })}
              placeholder="Description of this variable"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select 
                value={variable.type} 
                onValueChange={(value) => onUpdate({ ...variable, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select 
                value={variable.category} 
                onValueChange={(value) => onUpdate({ ...variable, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_input">User Input</SelectItem>
                  <SelectItem value="system_generated">System Generated</SelectItem>
                  <SelectItem value="context_section">Context Section</SelectItem>
                  <SelectItem value="ai_settings">AI Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center space-x-2">
                <Switch
                  checked={variable.required || false}
                  onCheckedChange={(checked) => onUpdate({ ...variable, required: checked })}
                />
                <span className="text-sm">Required</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Context Section Editor Component
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
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{section.name}</span>
            <span className="text-sm text-gray-500">#{section.order}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={section.enabled}
            onCheckedChange={(checked) => onUpdate({ ...section, enabled: checked })}
          />
          {section.enabled ? (
            <Eye className="w-4 h-4 text-green-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                value={section.name}
                onChange={(e) => onUpdate({ ...section, name: e.target.value })}
                placeholder="Section Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <Input
                type="number"
                value={section.order}
                onChange={(e) => {
                  const newOrder = parseInt(e.target.value) || 0;
                  onUpdate({ ...section, order: newOrder });
                  onReorder(newOrder);
                }}
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              value={section.description}
              onChange={(e) => onUpdate({ ...section, description: e.target.value })}
              placeholder="Description of this context section"
              rows={2}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <VariableInsertion
                textareaRef={templateRef}
                value={section.template}
                onChange={(value) => onUpdate({ ...section, template: value })}
                availableVariables={availableVariables}
                position="right"
              />
            </div>
            <Textarea
              ref={templateRef}
              value={section.template}
              onChange={(e) => onUpdate({ ...section, template: e.target.value })}
              placeholder="Template with {{variables}} and {{#if conditions}}...{{/if}}"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source Type</label>
              <Select 
                value={section.dataSource.type} 
                onValueChange={(value) => onUpdate({ 
                  ...section, 
                  dataSource: { ...section.dataSource, type: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="function">Function</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
              <Input
                value={section.dataSource.source}
                onChange={(e) => onUpdate({ 
                  ...section, 
                  dataSource: { ...section.dataSource, source: e.target.value }
                })}
                placeholder="Function name, query, or endpoint"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Variables (comma-separated)</label>
            <Input
              value={section.conditions.requiredVariables?.join(', ') || ''}
              onChange={(e) => onUpdate({ 
                ...section, 
                conditions: { 
                  ...section.conditions, 
                  requiredVariables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                }
              })}
              placeholder="transcription, persona, selectedProduct"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <Switch
                checked={section.required}
                onCheckedChange={(checked) => onUpdate({ ...section, required: checked })}
              />
              <span className="text-sm">Required Section</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Default brand guideline template
const defaultTemplate = `{{header}}
{{#if corePositioning}}
Core Positioning:
{{corePositioning}}
{{/if}}
{{#if brandVoice}}
Brand Voice:
{{#each brandVoice}}
- {{this}}
{{/each}}
{{/if}}
{{#if keyTerminology}}
Key Terminology:
{{#each keyTerminology}}
- {{this}}
{{/each}}
{{/if}}
{{#if approvedLanguage}}
Approved Language:
{{#each approvedLanguage}}
- {{this}}
{{/each}}
{{/if}}
{{#if avoidedLanguage}}
Language to Avoid:
{{#each avoidedLanguage}}
- {{this}}
{{/each}}
{{/if}}`;

// Brand Guidelines Editor Component
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-blue-700">{guideline.name}</span>
            <span className="text-sm text-blue-500">#{guideline.order}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={guideline.enabled}
            onCheckedChange={(checked) => onUpdate({ ...guideline, enabled: checked })}
          />
          {guideline.enabled ? (
            <Eye className="w-4 h-4 text-green-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                value={guideline.name}
                onChange={(e) => onUpdate({ ...guideline, name: e.target.value })}
                placeholder="Brand Guideline Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <Input
                type="number"
                value={guideline.order}
                onChange={(e) => {
                  const newOrder = parseInt(e.target.value) || 0;
                  onUpdate({ ...guideline, order: newOrder });
                  onReorder(newOrder);
                }}
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              value={guideline.description}
              onChange={(e) => onUpdate({ ...guideline, description: e.target.value })}
              placeholder="Description of this brand guideline configuration"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Brand Guideline Types</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2">
                <Switch
                  checked={guideline.includeTypes.corePositioning}
                  onCheckedChange={(checked) => onUpdate({ 
                    ...guideline, 
                    includeTypes: { ...guideline.includeTypes, corePositioning: checked }
                  })}
                />
                <span className="text-sm">Core Positioning</span>
              </label>
              <label className="flex items-center space-x-2">
                <Switch
                  checked={guideline.includeTypes.brandVoice}
                  onCheckedChange={(checked) => onUpdate({ 
                    ...guideline, 
                    includeTypes: { ...guideline.includeTypes, brandVoice: checked }
                  })}
                />
                <span className="text-sm">Brand Voice</span>
              </label>
              <label className="flex items-center space-x-2">
                <Switch
                  checked={guideline.includeTypes.keyTerminology}
                  onCheckedChange={(checked) => onUpdate({ 
                    ...guideline, 
                    includeTypes: { ...guideline.includeTypes, keyTerminology: checked }
                  })}
                />
                <span className="text-sm">Key Terminology</span>
              </label>
              <label className="flex items-center space-x-2">
                <Switch
                  checked={guideline.includeTypes.approvedLanguage}
                  onCheckedChange={(checked) => onUpdate({ 
                    ...guideline, 
                    includeTypes: { ...guideline.includeTypes, approvedLanguage: checked }
                  })}
                />
                <span className="text-sm">Approved Language</span>
              </label>
              <label className="flex items-center space-x-2">
                <Switch
                  checked={guideline.includeTypes.avoidedLanguage}
                  onCheckedChange={(checked) => onUpdate({ 
                    ...guideline, 
                    includeTypes: { ...guideline.includeTypes, avoidedLanguage: checked }
                  })}
                />
                <span className="text-sm">Avoided Language</span>
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <VariableInsertion
                textareaRef={templateRef}
                value={guideline.template}
                onChange={(value) => onUpdate({ ...guideline, template: value })}
                availableVariables={availableVariables}
                position="right"
              />
            </div>
            <Textarea
              ref={templateRef}
              value={guideline.template}
              onChange={(e) => onUpdate({ ...guideline, template: e.target.value })}
              placeholder="Custom template for brand guidelines. Leave empty to use default formatting."
              defaultValue={defaultTemplate}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Style</label>
              <Select 
                value={guideline.formatting.headerStyle} 
                onValueChange={(value) => onUpdate({ 
                  ...guideline, 
                  formatting: { ...guideline.formatting, headerStyle: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uppercase">UPPERCASE</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                  <SelectItem value="none">none</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bullet Style</label>
              <Select 
                value={guideline.formatting.bulletStyle} 
                onValueChange={(value) => onUpdate({ 
                  ...guideline, 
                  formatting: { ...guideline.formatting, bulletStyle: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select 
                value={guideline.formatting.spacing} 
                onValueChange={(value) => onUpdate({ 
                  ...guideline, 
                  formatting: { ...guideline.formatting, spacing: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Variables (comma-separated)</label>
            <Input
              value={guideline.conditions.requiredVariables?.join(', ') || ''}
              onChange={(e) => onUpdate({ 
                ...guideline, 
                conditions: { 
                  ...guideline.conditions, 
                  requiredVariables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                }
              })}
              placeholder="selectedProduct, brandDrBalance"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <Switch
                checked={guideline.required}
                onCheckedChange={(checked) => onUpdate({ ...guideline, required: checked })}
              />
              <span className="text-sm">Required Guideline</span>
            </label>
            <label className="flex items-center space-x-2">
              <Switch
                checked={guideline.formatting.includeHeaders}
                onCheckedChange={(checked) => onUpdate({ 
                  ...guideline, 
                  formatting: { ...guideline.formatting, includeHeaders: checked }
                })}
              />
              <span className="text-sm">Include Section Headers</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Enhanced AdCopy Station Component
const EnhancedAdCopyStation: React.FC<EnhancedAdCopyStationProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  expandedStations,
  setExpandedStations,
  copyToClipboard
}) => {
  const isOpen = expandedStations.has('adCopy');
  const stationConfig = editingConfig.stationPrompts?.adCopy;
  const contextConfig = stationConfig?.contextConfiguration;
  
  // Refs for textarea elements
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);
  const userPromptRef = useRef<HTMLTextAreaElement>(null);

  const toggleStation = () => {
    const newExpanded = new Set(expandedStations);
    if (isOpen) {
      newExpanded.delete('adCopy');
    } else {
      newExpanded.add('adCopy');
    }
    setExpandedStations(newExpanded);
  };

  const updateContextConfig = (key: keyof NonNullable<typeof contextConfig>, value: any) => {
    const updatedConfig = {
      ...editingConfig,
      stationPrompts: {
        ...editingConfig.stationPrompts,
        adCopy: {
          ...stationConfig,
          contextConfiguration: {
            ...contextConfig,
            [key]: value
          }
        }
      }
    };
    setEditingConfig(updatedConfig);
  };



  // Get all available variables including context sections and brand guidelines (for System/User prompts)
  const getAllAvailableVariables = (): VariableDefinition[] => {
    const regularVariables = contextConfig?.availableVariables || DEFAULT_AD_COPY_VARIABLES;
    const contextSections = contextConfig?.contextSections || [];
    const brandGuidelines = contextConfig?.brandGuidelinesConfig || [];
    
    // Convert context sections to variables that can be referenced in System/User prompts
    const contextSectionVariables: VariableDefinition[] = contextSections
      .filter(section => section.enabled) // Only include enabled sections
      .map(section => ({
        key: section.id,
        label: `Context: ${section.name}`,
        description: `Generated content from "${section.name}" context section: ${section.description}`,
        type: 'string' as const,
        category: 'context_section' as const,
        required: section.required
      }));

    // Convert brand guideline types to variables that can be referenced in System/User prompts
    const brandGuidelineVariables: VariableDefinition[] = [
      {
        key: 'corePositioning',
        label: 'Core Positioning',
        description: 'Brand core positioning statement from brand guidelines',
        type: 'string' as const,
        category: 'brand_guideline' as const,
        required: false
      },
      {
        key: 'brandVoice',
        label: 'Brand Voice',
        description: 'Brand voice rules and guidelines',
        type: 'string' as const,
        category: 'brand_guideline' as const,
        required: false
      },
      {
        key: 'keyTerminology',
        label: 'Key Terminology',
        description: 'Key terms and phrases from brand guidelines',
        type: 'string' as const,
        category: 'brand_guideline' as const,
        required: false
      },
      {
        key: 'approvedLanguage',
        label: 'Approved Language',
        description: 'Approved language and phrases from brand guidelines',
        type: 'string' as const,
        category: 'brand_guideline' as const,
        required: false
      },
      {
        key: 'avoidedLanguage',
        label: 'Avoided Language',
        description: 'Language and phrases to avoid from brand guidelines',
        type: 'string' as const,
        category: 'brand_guideline' as const,
        required: false
      }
    ];

    return [...regularVariables, ...contextSectionVariables, ...brandGuidelineVariables];
  };

  // Get variables for context section templates (excludes other context sections to avoid circular refs)
  const getContextSectionVariables = (): VariableDefinition[] => {
    return contextConfig?.availableVariables || DEFAULT_AD_COPY_VARIABLES;
  };

  React.useEffect(() => {
    const cfg = stationConfig?.contextConfiguration;
    const needsInit = isOpen && (
      !cfg ||
      !Array.isArray(cfg.availableVariables) || cfg.availableVariables.length === 0 ||
      !Array.isArray(cfg.contextSections) || cfg.contextSections.length === 0
    );

    if (needsInit) {
      console.log('Initializing Ad Copy context configuration...', {
        hasCfg: Boolean(cfg),
        availableVariablesLen: cfg?.availableVariables?.length,
        contextSectionsLen: cfg?.contextSections?.length,
      });

      const updatedConfig = {
        ...editingConfig,
        stationPrompts: {
          ...editingConfig.stationPrompts,
          adCopy: {
            ...(stationConfig || {}),
            contextConfiguration: {
              availableVariables: DEFAULT_AD_COPY_VARIABLES,
              contextSections: DEFAULT_AD_COPY_SECTIONS,
              brandGuidelinesConfig: cfg?.brandGuidelinesConfig || [],
              contextRules: cfg?.contextRules,
            }
          }
        }
      };

      setEditingConfig(updatedConfig);
      console.log('Ad Copy context configuration set:', updatedConfig.stationPrompts?.adCopy?.contextConfiguration);
    } else {
      console.log('Ad Copy context configuration already present', cfg);
    }
  }, [isOpen, stationConfig, editingConfig, setEditingConfig]);

  return (
    <div className="space-y-4">
      <StationToggleButton
        isOpen={isOpen}
        onClick={toggleStation}
        title="Ad Copy Station (Enhanced)"
        icon={<Target className="w-5 h-5" />}
        iconColor="text-blue-600"
        description="Enhanced configuration for ad copy generation with full context control"
      />
      
      {isOpen && (
        <div className="ml-4 space-y-6 bg-white border border-gray-200 rounded-lg p-6">
          {/* Enhanced Context Configurator (shared) */}
          <EnhancedContextConfigurator
            stationKey={'adCopy'}
            editingConfig={editingConfig}
            setEditingConfig={setEditingConfig}
            title="Enhanced Context Configuration"
          />
          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">System Prompt</label>
              <VariableInsertion
                textareaRef={systemPromptRef}
                value={stationConfig?.systemPrompt || ''}
                onChange={(value) => {
                  const updatedConfig = {
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig.stationPrompts,
                      adCopy: {
                        ...stationConfig,
                        systemPrompt: value
                      }
                    }
                  };
                  setEditingConfig(updatedConfig);
                }}
                availableVariables={getAllAvailableVariables()}
                position="right"
              />
            </div>
            <Textarea
              ref={systemPromptRef}
              value={stationConfig?.systemPrompt || ''}
              onChange={(e) => {
                const updatedConfig = {
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig.stationPrompts,
                    adCopy: {
                      ...stationConfig,
                      systemPrompt: e.target.value
                    }
                  }
                };
                setEditingConfig(updatedConfig);
              }}
              rows={8}
              className="font-mono text-sm"
              placeholder="Enter the system prompt for ad copy generation..."
            />
          </div>

          {/* User Prompt Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">User Prompt Template</label>
              <VariableInsertion
                textareaRef={userPromptRef}
                value={stationConfig?.userPromptTemplate || ''}
                onChange={(value) => {
                  const updatedConfig = {
                    ...editingConfig,
                    stationPrompts: {
                      ...editingConfig.stationPrompts,
                      adCopy: {
                        ...stationConfig,
                        userPromptTemplate: value
                      }
                    }
                  };
                  setEditingConfig(updatedConfig);
                }}
                availableVariables={getAllAvailableVariables()}
                position="right"
              />
            </div>
            <Textarea
              ref={userPromptRef}
              value={stationConfig?.userPromptTemplate || ''}
              onChange={(e) => {
                const updatedConfig = {
                  ...editingConfig,
                  stationPrompts: {
                    ...editingConfig.stationPrompts,
                    adCopy: {
                      ...stationConfig,
                      userPromptTemplate: e.target.value
                    }
                  }
                };
                setEditingConfig(updatedConfig);
              }}
              rows={8}
              className="font-mono text-sm"
              placeholder="Enter the user prompt template with {{variables}}..."
            />
          </div>

          {/* Variables, Context Sections, Brand Guidelines moved to EnhancedContextConfigurator */}

          {/* Context Building Rules */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Context Building Rules</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Tokens</label>
                <Input
                  type="number"
                  value={contextConfig?.contextRules?.maxTotalTokens || ''}
                  onChange={(e) => {
                    const currentRules = contextConfig?.contextRules || {
                      prioritization: 'order' as const,
                      sectionOrder: { fixed: [], flexible: [], priority: {} },
                      conditionalRules: {},
                      tokenManagement: { enabled: false, truncationStrategy: 'end' as const }
                    };
                    updateContextConfig('contextRules', {
                      ...currentRules,
                      maxTotalTokens: parseInt(e.target.value) || undefined
                    });
                  }}
                  placeholder="e.g., 2000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritization Strategy</label>
                <Select 
                  value={contextConfig?.contextRules?.prioritization || 'order'}
                  onValueChange={(value) => {
                    const currentRules = contextConfig?.contextRules || {
                      prioritization: 'order' as const,
                      sectionOrder: { fixed: [], flexible: [], priority: {} },
                      conditionalRules: {},
                      tokenManagement: { enabled: false, truncationStrategy: 'end' as const }
                    };
                    updateContextConfig('contextRules', {
                      ...currentRules,
                      prioritization: value as 'order' | 'relevance' | 'custom'
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order-based</SelectItem>
                    <SelectItem value="relevance">Relevance-based</SelectItem>
                    <SelectItem value="custom">Custom Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdCopyStation;