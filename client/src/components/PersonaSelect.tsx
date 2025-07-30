import React from 'react';
import { Label } from '@/components/ui/label';
import { SimpleSelect, SimpleSelectContent, SimpleSelectItem, SimpleSelectTrigger, SimpleSelectValue } from '@/components/ui/simple-select';

interface PersonaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  personas: Record<string, { label: string; subPersonas?: any }>;
  label?: string;
  placeholder?: string;
}

export function PersonaSelect({ 
  value, 
  onValueChange, 
  personas, 
  label = "Primary Persona",
  placeholder = "Select primary persona..."
}: PersonaSelectProps) {
  return (
    <div>
      <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
      <SimpleSelect value={value} onValueChange={onValueChange}>
        <SimpleSelectTrigger>
          <SimpleSelectValue placeholder={placeholder} />
        </SimpleSelectTrigger>
        <SimpleSelectContent>
          {Object.entries(personas).map(([key, persona]) => (
            <SimpleSelectItem key={key} value={key}>{persona.label}</SimpleSelectItem>
          ))}
        </SimpleSelectContent>
      </SimpleSelect>
    </div>
  );
}

interface SubPersonaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  subPersonas: Record<string, { label: string }>;
  label?: string;
  placeholder?: string;
}

export function SubPersonaSelect({ 
  value, 
  onValueChange, 
  subPersonas, 
  label = "Sub-Persona",
  placeholder = "Select sub-persona..."
}: SubPersonaSelectProps) {
  return (
    <div>
      <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
      <SimpleSelect value={value} onValueChange={onValueChange}>
        <SimpleSelectTrigger>
          <SimpleSelectValue placeholder={placeholder} />
        </SimpleSelectTrigger>
        <SimpleSelectContent>
          {Object.entries(subPersonas).map(([key, subPersona]) => (
            <SimpleSelectItem key={key} value={key}>{subPersona.label}</SimpleSelectItem>
          ))}
        </SimpleSelectContent>
      </SimpleSelect>
    </div>
  );
}