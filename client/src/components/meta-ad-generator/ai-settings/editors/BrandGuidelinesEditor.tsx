import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Eye, EyeOff, Move, Trash2 } from 'lucide-react';
import { BrandGuidelinesConfig, VariableDefinition } from '@shared/training-config';
import { VariableInsertion } from './VariableEditor';

const defaultBrandTemplate = `{{header}}\n{{#if corePositioning}}\nCore Positioning:\n{{corePositioning}}\n{{/if}}\n{{#if brandVoice}}\nBrand Voice:\n{{#each brandVoice}}\n- {{this}}\n{{/each}}\n{{/if}}\n{{#if keyTerminology}}\nKey Terminology:\n{{#each keyTerminology}}\n- {{this}}\n{{/each}}\n{{/if}}\n{{#if approvedLanguage}}\nApproved Language:\n{{#each approvedLanguage}}\n- {{this}}\n{{/each}}\n{{/if}}\n{{#if avoidedLanguage}}\nLanguage to Avoid:\n{{#each avoidedLanguage}}\n- {{this}}\n{{/each}}\n{{/if}}`;

export const BrandGuidelinesEditor: React.FC<{
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
