import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { VariableDefinition } from '@shared/training-config';

export const VariableInsertion: React.FC<{
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  availableVariables: VariableDefinition[];
  position?: 'left' | 'right';
  buttonLabel?: string;
}> = ({ textareaRef, value, onChange, availableVariables, position = 'right', buttonLabel = 'Insert Variable' }) => {
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
    // Cache current scroll and caret; fallback to end if selection is undefined
    const prevScrollTop = textarea.scrollTop;
    const prevScrollLeft = textarea.scrollLeft;
    const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : value.length;
    const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : value.length;
    const variableString = `{{${variableKey}}}`;
    const newValue = value.substring(0, start) + variableString + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableString.length, start + variableString.length);
      // Restore scroll position so the field doesn't jump to the top
      textarea.scrollTop = prevScrollTop;
      textarea.scrollLeft = prevScrollLeft;
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
        <span>{buttonLabel}</span>
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

export const VariableEditor: React.FC<{
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
