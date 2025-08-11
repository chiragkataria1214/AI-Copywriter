import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Subpersona } from '@/components/main/shared/types';

interface TargetPersonaProps {
  personas: Record<string, any>;
  persona: string;
  setPersona: (value: string) => void;
  optional?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  showCard?: boolean;
  showIcon?: boolean;
  fallbackOptions?: Array<{ key: string; label: string }>;
}

export const TargetPersona: React.FC<TargetPersonaProps> = ({
  personas,
  persona,
  setPersona,
  optional = false,
  title,
  description,
  placeholder,
  className = '',
  showCard = true,
  showIcon = true,
  fallbackOptions,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [selectedSubpersona, setSelectedSubpersona] = useState<string>('');

  const defaultTitle = optional ? 'Target Persona (Optional)' : 'Target Persona';
  const defaultPlaceholder = optional ? 'Select target persona (optional)' : 'Select persona';
  const defaultDescription = optional 
    ? 'Choose the primary audience for this campaign, or leave blank for general audience'
    : undefined;

  // Parse persona to extract persona and subpersona
  useEffect(() => {
    if (persona) {
      const parts = persona.split(':');
      setSelectedPersona(parts[0]);
      setSelectedSubpersona(parts[1] || '');
    } else {
      setSelectedPersona('');
      setSelectedSubpersona('');
    }
  }, [persona]);

  // Get the current persona's ID for fetching subpersonas
  const currentPersonaId = selectedPersona && personas[selectedPersona]?.id;

  // Fetch subpersonas for the selected persona
  const { data: subpersonas = [], isLoading: subpersonasLoading } = useQuery<Subpersona[]>({
    queryKey: ['subpersonas', currentPersonaId],
    queryFn: () => apiRequest(`/api/personas/${currentPersonaId}/subpersonas`),
    enabled: !!currentPersonaId
  });

  // Auto-select first subpersona when subpersonas are loaded
  useEffect(() => {
    if (subpersonas.length > 0 && selectedPersona && !selectedSubpersona && typeof setPersona === 'function') {
      const firstSubpersona = subpersonas[0];
      setSelectedSubpersona(firstSubpersona.id);
      setPersona(`${selectedPersona}:${firstSubpersona.id}`);
    }
  }, [subpersonas, selectedPersona, selectedSubpersona, setPersona]);

  // Handle persona selection
  const handlePersonaChange = (personaKey: string) => {
    setSelectedPersona(personaKey);
    setSelectedSubpersona('');
    setPersona(personaKey);
  };

  // Handle subpersona selection
  const handleSubpersonaChange = (subpersonaId: string) => {
    if (subpersonaId === 'none') {
      setSelectedSubpersona('');
      setPersona(selectedPersona);
    } else {
      setSelectedSubpersona(subpersonaId);
      setPersona(`${selectedPersona}:${subpersonaId}`);
    }
  };

  const content = (
    <div className={`space-y-4 ${className}`}>
      {showIcon && (
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="text-jones-primary mr-2 sm:mr-3" size={18} />
          {title || defaultTitle}
        </h3>
      )}
      
      {!showIcon && (
        <Label className={`${optional ? 'block' : ''} text-sm font-medium text-gray-700 ${showIcon ? '' : 'mb-2'}`}>
          {title || defaultTitle}
        </Label>
      )}
      
      {(description || defaultDescription) && (
        <p className="text-xs text-gray-500 mb-3">
          {description || defaultDescription}
        </p>
      )}
      
      <Select value={selectedPersona} onValueChange={handlePersonaChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || defaultPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {optional && (
            <SelectItem value="none">None (General Audience)</SelectItem>
          )}
          {Object.entries(personas).length > 0 ? (
            Object.entries(personas).map(([key, persona]) => (
              <SelectItem key={key} value={key}>
                {(persona as any).label || key.replace(/([A-Z])/g, ' $1').trim()}
              </SelectItem>
            ))
          ) : fallbackOptions ? (
            fallbackOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))
          ) : null}
        </SelectContent>
      </Select>

      {/* Subpersona Selection - only show if persona is selected and has subpersonas */}
      {selectedPersona && currentPersonaId && subpersonas.length > 0 && (
        <div className="mt-3">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            Subpersona (Optional)
          </Label>
          <Select value={selectedSubpersona || (subpersonas.length > 0 ? subpersonas[0].id : 'none')} onValueChange={handleSubpersonaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select subpersona (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {subpersonas.map((subpersona) => (
                <SelectItem key={subpersona.id} value={subpersona.id}>
                  {subpersona.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSubpersona && selectedSubpersona !== 'none' && (
            <p className="text-xs text-gray-500 mt-1">
              {subpersonas.find(s => s.id === selectedSubpersona)?.description}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {content}
      </CardContent>
    </Card>
  );
};