import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, Eye, EyeOff, Move, Trash2 } from 'lucide-react';
import { ContextSectionConfig, VariableDefinition } from '@shared/training-config';
import { VariableInsertion } from './VariableEditor';

export const ContextSectionEditor: React.FC<{
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
