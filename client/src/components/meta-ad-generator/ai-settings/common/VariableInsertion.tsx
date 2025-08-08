import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VariableDefinition } from '@shared/training-config';

export interface VariableInsertionProps {
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  value: string;
  onChange: (value: string) => void;
  position?: 'left' | 'right';
  variables?: VariableDefinition[];
  buttonLabel?: string;
  mode?: 'variable' | 'context' | 'all';
}

export const VariableInsertion: React.FC<VariableInsertionProps> = ({
  textareaRef,
  value,
  onChange,
  position = 'left',
  variables = [],
  buttonLabel,
  mode,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef?.current;
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

  // Determine effective mode: prefer explicit prop; otherwise infer from label
  const effectiveMode: 'variable' | 'context' | 'all' = mode || (
    buttonLabel && /context/i.test(buttonLabel) ? 'context' : 'variable'
  );

  // Context categories considered as non-plain variables
  const contextCategories = new Set(['context_section', 'brand_guideline']);

  // Apply mode-based filtering first, then search filtering
  const modeFiltered = (variables || []).filter((v: any) => {
    const category = (v as any)?.category;
    if (effectiveMode === 'all') return true;
    if (effectiveMode === 'context') return contextCategories.has(category);
    // variable mode
    return !contextCategories.has(category);
  });

  const visibleVariables = modeFiltered.filter((v) => {
    if (!query) return true;
    const key = (v.key || '').toString().toLowerCase();
    const label = ((v as any).label || '').toString().toLowerCase();
    const q = query.toLowerCase();
    return key.includes(q) || label.includes(q);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 text-xs"
      >
        <Plus size={12} className="mr-1" />
        {buttonLabel || 'Insert Variable'}
      </Button>

      {isOpen && (
        <div className={dropdownClasses}>
          <div className="text-xs font-medium text-gray-700 mb-1 px-2">{effectiveMode === 'context' ? 'Available Context' : 'Available Variables'}</div>
          <div className="px-2 pb-2">
            <input
              className="w-full text-xs border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
            {visibleVariables.map((variable) => (
              <button
                key={variable.key}
                onClick={() => insertVariable(variable.key)}
                className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-xs border border-transparent hover:border-gray-200 bg-white"
              >
                <div className="font-mono text-blue-600">{`{{${variable.key}}}`}</div>
                <div className="font-medium text-gray-900">{(variable as any).label}</div>
                <div className="text-gray-600 text-[11px]">{(variable as any).description}</div>
                {(variable as any).category && (
                  <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded-full ${
                    (variable as any).category === 'context_section' ? 'bg-purple-100 text-purple-700' :
                    (variable as any).category === 'brand_guideline' ? 'bg-orange-100 text-orange-700' :
                    (variable as any).category === 'system_generated' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {(variable as any).category}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-0" />}
    </div>
  );
};

export default VariableInsertion;

