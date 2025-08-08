import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Lock } from 'lucide-react';
import { VariableDefinition, ContextSectionConfig, BrandGuidelinesConfig } from '@shared/training-config';
import VariableInsertion from './VariableInsertion';
import ContextInsertion from './ContextInsertion';
import { extractOutputStructure, getEditablePrompt, reconstructPrompt } from './promptUtils';

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
  const outputStructure = extractOutputStructure(value || '');
  const editableContent = getEditablePrompt(value || '');

  const handleChange = (newEditableContent: string) => {
    const reconstructedPrompt = reconstructPrompt(newEditableContent, value || '');
    onChange(reconstructedPrompt);
  };

  // Build comprehensive variable list from availableVariables + enabled context sections + brand guidelines
  const computedVariables: VariableDefinition[] = React.useMemo(() => {
    const base: VariableDefinition[] = variables || contextConfiguration?.availableVariables || [];
    const result: VariableDefinition[] = [...base];

    const addUnique = (v: VariableDefinition) => {
      if (!result.find((x) => x.key === v.key)) result.push(v);
    };

    // Context sections as variables
    (contextConfiguration?.contextSections || [])
      .filter((s) => s.enabled)
      .forEach((s) => addUnique({
        key: s.id,
        label: `Context: ${s.name}`,
        description: `Generated content from "${s.name}" context section: ${s.description}`,
        type: 'string',
        category: 'context_section',
        required: s.required,
      } as VariableDefinition));

    // Brand guideline variables
    const brandVars: VariableDefinition[] = [
      { key: 'corePositioning', label: 'Core Positioning', description: 'Brand core positioning statement', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'brandVoice', label: 'Brand Voice', description: 'Brand voice rules and guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'keyTerminology', label: 'Key Terminology', description: 'Key terms and phrases from brand guidelines', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'approvedLanguage', label: 'Approved Language', description: 'Approved language and phrases', type: 'string', category: 'brand_guideline', required: false } as any,
      { key: 'avoidedLanguage', label: 'Avoided Language', description: 'Phrases to avoid', type: 'string', category: 'brand_guideline', required: false } as any,
    ];
    brandVars.forEach(addUnique);

    return result;
  }, [variables, contextConfiguration]);

  // Split into plain variables vs context-only options for clarity
  const contextCategories = new Set(['context_section', 'brand_guideline']);
  const variableOptions = React.useMemo(
    () => computedVariables.filter((v: any) => !contextCategories.has((v as any)?.category)),
    [computedVariables]
  );
  const contextOptions = React.useMemo(
    () => computedVariables.filter((v: any) => contextCategories.has((v as any)?.category)),
    [computedVariables]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-white border rounded-lg p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <div className="flex items-center space-x-2">
              {!disabled && textareaRef && (computedVariables.length > 0) && (
                <>
                  <VariableInsertion
                    textareaRef={textareaRef}
                    value={editableContent}
                    onChange={handleChange}
                    position="right"
                    variables={variableOptions}
                    buttonLabel="Insert Variable"
                  />
                  <ContextInsertion
                    textareaRef={textareaRef}
                    value={editableContent}
                    onChange={handleChange}
                    position="right"
                    variables={contextOptions}
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
            <Textarea
              ref={textareaRef}
              value={editableContent}
              onChange={(e) => handleChange(e.target.value)}
              className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
            />
          )}
        </div>
      </div>

      {outputStructure && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Protected Output Structure</span>
          </div>
          <div className="bg-white border border-amber-200 rounded p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{outputStructure}</pre>
          </div>
          <p className="text-xs text-amber-700 mt-2">This section is protected to ensure frontend compatibility.</p>
        </div>
      )}
    </div>
  );
};

export default ProtectedPromptEditor;

