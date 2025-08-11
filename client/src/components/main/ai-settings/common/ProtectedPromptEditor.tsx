import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { VariableDefinition } from '@shared/training-config';
import { VariableInsertion } from '@/components/main/ai-settings/editors/VariableEditor';
import { COMPONENT_KEY_MAP } from '@shared/constants';

export interface ProtectedPromptEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  contextConfiguration?: {
    availableVariables?: VariableDefinition[];
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


  // Component placeholders built from shared COMPONENT_KEY_MAP
  const componentOptions: VariableDefinition[] = React.useMemo(() => {
    const toTitle = (key: string) => {
      const spaced = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };
    return Object.entries(COMPONENT_KEY_MAP).map(([key, description]) => ({
      key: `components.${key}`,
      label: `Component: ${toTitle(key)}`,
      description,
      type: 'string',
      category: 'system_generated',
      required: false,
    }));
  }, []);


  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <div className="flex items-center space-x-2">
              {!disabled && textareaRef && ((contextConfiguration?.availableVariables?.length || 0) + componentOptions.length) > 0 && (
                <>
                  <VariableInsertion
                    textareaRef={textareaRef}
                    value={editableContent}
                    onChange={handleChange}
                    position="right"
                    availableVariables={contextConfiguration?.availableVariables || []}
                    buttonLabel="Insert Variable"
                  />
                  <VariableInsertion
                    textareaRef={textareaRef}
                    value={editableContent}
                    onChange={handleChange}
                    position="right"
                    availableVariables={componentOptions}
                    buttonLabel="Insert Component"
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

