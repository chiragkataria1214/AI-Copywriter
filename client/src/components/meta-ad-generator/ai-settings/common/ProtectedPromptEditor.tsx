import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { VariableDefinition, ContextSectionConfig, BrandGuidelinesConfig } from '@shared/training-config';
import { VariableInsertion } from '../editors/VariableEditor';

export interface ProtectedPromptEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  variables?: VariableDefinition[];
  contextConfiguration?: {
    availableVariables?: VariableDefinition[];
    contextSections?: ContextSectionConfig[];
    contextRules?: any;
    aiSettingsContext?: any;
    brandGuidelinesConfig?: BrandGuidelinesConfig[];
  };
}

const ProtectedPromptEditor: React.FC<ProtectedPromptEditorProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
  disabled = false,
  copyToClipboard,
  textareaRef,
  variables,
  contextConfiguration,
}) => {
  // Maintain local editable content to avoid caret jumping to end on each parent update
  const [editableContent, setEditableContent] = React.useState<string>(value || '');
  const lastExternalValueRef = React.useRef<string>(value || '');

  // Sync local editable content when external value changes meaningfully
  React.useEffect(() => {
    const prev = lastExternalValueRef.current;
    if (prev !== (value || '')) {
      lastExternalValueRef.current = value || '';
      setEditableContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (newEditableContent: string) => {
    setEditableContent(newEditableContent);
    onChange(newEditableContent);
  };

  // Build lists strictly from station's configuration, augmenting context dropdown with enabled context sections
  const baseVariables: VariableDefinition[] = React.useMemo(() => {
    return (variables || contextConfiguration?.availableVariables || []) as VariableDefinition[];
  }, [variables, contextConfiguration?.availableVariables]);

  const derivedContextSectionVariables: VariableDefinition[] = React.useMemo(() => {
    const sections = contextConfiguration?.contextSections || [];
    return sections
      .filter((s: any) => s && (s.enabled ?? true))
      .map((s: any) => ({
        key: s.id,
        label: `Context: ${s.name}`,
        description: `Generated content from "${s.name}" context section: ${s.description || ''}`,
        type: 'string',
        category: 'context_section',
        required: !!s.required,
      } as VariableDefinition));
  }, [contextConfiguration?.contextSections]);

  // Split into variable vs context options
  const variableOptions = React.useMemo(() => {
    const contextCategories = new Set(['context_section', 'brand_guideline']);
    return baseVariables.filter((v: any) => !contextCategories.has((v as any)?.category));
  }, [baseVariables]);

  const contextOptions = React.useMemo(() => {
    const contextCategories = new Set(['context_section', 'brand_guideline']);
    const fromAvailable = baseVariables.filter((v: any) => contextCategories.has((v as any)?.category));
    const mapByKey = new Map<string, VariableDefinition>();
    [...fromAvailable, ...derivedContextSectionVariables].forEach((v) => {
      if (v?.key) mapByKey.set(v.key, v);
    });
    return Array.from(mapByKey.values());
  }, [baseVariables, derivedContextSectionVariables]);

  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <div className="flex items-center space-x-2">
              {!disabled && textareaRef && ((variableOptions.length + contextOptions.length) > 0) && (
                <>
                  <VariableInsertion
                    textareaRef={textareaRef}
                    value={editableContent}
                    onChange={handleChange}
                    position="right"
                    availableVariables={variableOptions}
                    buttonLabel="Insert Variable"
                  />
                  <VariableInsertion
                    textareaRef={textareaRef}
                    value={editableContent}
                    onChange={handleChange}
                    position="right"
                    availableVariables={contextOptions}
                    buttonLabel="Insert Context"
                  />
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(value || '', label)}
                disabled={!value}
              >
                <Copy size={16} className="mr-1" />
                Copy
              </Button>
            </div>
          </div>
          {disabled ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{editableContent || placeholder}</pre>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={editableContent}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
            />
          )}
        </div>
      </div>


    </div>
  );
};

export default ProtectedPromptEditor;

