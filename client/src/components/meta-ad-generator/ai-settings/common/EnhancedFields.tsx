import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { VariableInsertion } from '../editors/VariableEditor';

export interface EnhancedTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  bgColor?: string;
  borderColor?: string;
  copyToClipboard: (text: string, label: string) => Promise<void>;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  variableInsertionProps?: Omit<React.ComponentProps<typeof VariableInsertion>, 'value' | 'onChange' | 'textareaRef'> & { enabled?: boolean };
}

export const EnhancedTextField: React.FC<EnhancedTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  bgColor = 'bg-blue-50',
  borderColor = 'border-blue-200',
  copyToClipboard,
  textareaRef,
  variableInsertionProps,
}) => (
  <div className="space-y-4 bg-white border rounded-lg p-4">
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <div className="flex items-center space-x-2">
          {!disabled && textareaRef && variableInsertionProps?.enabled && (
            <VariableInsertion
              textareaRef={textareaRef}
              value={value}
              onChange={onChange}
              position={variableInsertionProps.position}
              availableVariables={variableInsertionProps.availableVariables}
              buttonLabel={variableInsertionProps.buttonLabel}
            />
          )}
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(value, label)} disabled={!value}>
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
        </div>
      </div>
      {disabled ? (
        <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{value || placeholder}</pre>
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-gray-900 resize-y border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg p-4 transition-all duration-200"
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  </div>
);

export interface EnhancedArrayFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  rows?: number;
  disabled?: boolean;
  bgColor?: string;
  borderColor?: string;
  copyToClipboard: (text: string, label: string) => Promise<void>;
}

export const EnhancedArrayField: React.FC<EnhancedArrayFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  bgColor = 'bg-green-50',
  borderColor = 'border-green-200',
  copyToClipboard,
}) => {
  const textValue = Array.isArray(value) ? value.join('\n') : '';
  return (
    <div className="space-y-4 bg-white border rounded-lg p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(textValue, label)} disabled={!textValue}>
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
        </div>
        {disabled ? (
          <div className={`${bgColor} rounded-lg p-4 ${borderColor} border max-h-64 overflow-y-auto`}>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{textValue || placeholder}</pre>
          </div>
        ) : (
          <Textarea
            value={textValue}
            onChange={(e) => onChange(e.target.value.split('\n').map(item => item.trim()).filter(Boolean))}
            className="text-gray-900 resize-y border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg p-4 transition-all duration-200"
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedTextField;

