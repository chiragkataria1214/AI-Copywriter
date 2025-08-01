import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { TrainingConfig } from '@shared/training-config';
import { Plus, Users, ChevronDown, ChevronRight } from 'lucide-react';

interface PersonasTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
}

export const PersonasTab: React.FC<PersonasTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser
}) => {
  const [newPersonaName, setNewPersonaName] = useState('');
  const [expandedPersonas, setExpandedPersonas] = useState<Set<string>>(new Set());

  const handleAddPersona = () => {
    if (newPersonaName.trim() && !editingConfig?.personaPillars?.[newPersonaName.trim()]) {
      setEditingConfig({
        ...editingConfig,
        personaPillars: {
          ...editingConfig.personaPillars,
          [newPersonaName.trim()]: {
            pillars: [''],
            enabledPillars: [true]
          }
        }
      });
      setNewPersonaName('');
    }
  };

  const togglePersona = (personaName: string) => {
    const newExpanded = new Set(expandedPersonas);
    if (expandedPersonas.has(personaName)) {
      newExpanded.delete(personaName);
    } else {
      newExpanded.add(personaName);
    }
    setExpandedPersonas(newExpanded);
  };

  const ToggleButton = ({ 
    isOpen, 
    onClick, 
    personaName, 
    personaData 
  }: { 
    isOpen: boolean; 
    onClick: () => void; 
    personaName: string; 
    personaData: any;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-left">
          <h4 className="text-lg font-semibold text-gray-900 capitalize">
            {personaName.replace(/([A-Z])/g, ' $1').trim()}
          </h4>
          {personaData.description && (
            <p className="text-sm text-gray-600 mt-1 max-w-2xl line-clamp-2">
              {personaData.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex-shrink-0">
          {personaData.pillars?.length || 0} Pillars
        </Badge>
        <span className="text-xs text-gray-500 font-medium">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium">Persona Training Data</p>
        <p className="text-sm text-blue-700 mt-1">
          Configure the target personas and their core pillars that Claude AI uses to generate personalized copy.
        </p>
      </div> */}

      {effectiveUser?.role === 'admin' && (
        <div className="relative overflow-hidden border-2 border-dashed border-blue-300 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
            <div className="w-full h-full bg-blue-200 rounded-full opacity-20"></div>
          </div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900">Add New Persona</h4>
                <p className="text-sm text-blue-700">Create a target persona with custom pillars and motivations</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter persona name (e.g., 'Beauty Enthusiast', 'Busy Professional')"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPersona();
                    }
                  }}
                  className="text-sm bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 placeholder:text-blue-400"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddPersona}
                disabled={!newPersonaName.trim() || !!editingConfig?.personaPillars?.[newPersonaName.trim()]}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Persona
              </Button>
            </div>
            
            {newPersonaName.trim() && (
              <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                {editingConfig?.personaPillars?.[newPersonaName.trim()] ? (
                  <p className="text-xs text-red-600">
                    <span className="font-medium">Warning:</span> A persona with this name already exists. Please choose a different name.
                  </p>
                ) : (
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Preview:</span> This will create a new persona called "{newPersonaName}" 
                    with empty pillar lists that you can customize with pain points and motivations.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {editingConfig?.personaPillars && Object.entries(editingConfig.personaPillars).map(([personaName, personaData]: [string, any]) => {
          const isExpanded = expandedPersonas.has(personaName);
          
          return (
            <div key={personaName} className="border border-gray-200 rounded-lg">
              <ToggleButton
                isOpen={isExpanded}
                onClick={() => togglePersona(personaName)}
                personaName={personaName}
                personaData={personaData}
              />
              
              {isExpanded && (
                <div className="p-6 pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    {!personaData.description && effectiveUser?.role === 'admin' && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">
                          Persona Description
                        </Label>
                        <Textarea
                          value=""
                          onChange={(e) => {
                            setEditingConfig({
                              ...editingConfig,
                              personaPillars: {
                                ...editingConfig.personaPillars,
                                [personaName]: {
                                  ...personaData,
                                  description: e.target.value
                                }
                              }
                            });
                          }}
                          className="text-gray-900 border-blue-200 focus:border-blue-400"
                          rows={2}
                          placeholder="Enter persona description (e.g., Busy individuals balancing work, family, and personal life...)"
                        />
                      </div>
                    )}

                    {personaData.description && effectiveUser?.role === 'admin' && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">
                          Persona Description
                        </Label>
                        <Textarea
                          value={personaData.description}
                          onChange={(e) => {
                            setEditingConfig({
                              ...editingConfig,
                              personaPillars: {
                                ...editingConfig.personaPillars,
                                [personaName]: {
                                  ...personaData,
                                  description: e.target.value
                                }
                              }
                            });
                          }}
                          className="text-gray-900 border-blue-200 focus:border-blue-400"
                          rows={2}
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-900 mb-3 block">
                        <span className="inline-flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          Core Pillars - Key Pain Points & Motivations
                        </span>
                      </Label>
                      <p className="text-xs text-gray-600 mb-3">
                        These pillars define what matters most to this persona. Claude uses these to create targeted, relevant copy.
                      </p>

                      <div className="space-y-3">
                        {(personaData.pillars || ['']).map((pillar: string, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={personaData.enabledPillars?.[index] !== false}
                                onCheckedChange={(checked) => {
                                  const enabled = [...(personaData.enabledPillars || [])];
                                  enabled[index] = checked;
                                  setEditingConfig({
                                    ...editingConfig,
                                    personaPillars: {
                                      ...editingConfig.personaPillars,
                                      [personaName]: {
                                        ...personaData,
                                        enabledPillars: enabled
                                      }
                                    }
                                  });
                                }}
                                className="flex-shrink-0"
                              />
                              <span className="text-blue-500 text-sm font-bold flex-shrink-0">•</span>
                              <span className="text-xs text-gray-600 flex-shrink-0">Pillar {index + 1}</span>
                              {effectiveUser?.role === 'admin' && (personaData.pillars?.length > 1) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                  onClick={() => {
                                    const pillars = [...(personaData.pillars || [])];
                                    const enabled = [...(personaData.enabledPillars || [])];
                                    pillars.splice(index, 1);
                                    enabled.splice(index, 1);
                                    setEditingConfig({
                                      ...editingConfig,
                                      personaPillars: {
                                        ...editingConfig.personaPillars,
                                        [personaName]: {
                                          ...personaData,
                                          pillars,
                                          enabledPillars: enabled
                                        }
                                      }
                                    });
                                  }}
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                            <Input
                              value={pillar}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const pillars = [...(personaData.pillars || [])];
                                pillars[index] = e.target.value;
                                setEditingConfig({
                                  ...editingConfig,
                                  personaPillars: {
                                    ...editingConfig.personaPillars,
                                    [personaName]: {
                                      ...personaData,
                                      pillars
                                    }
                                  }
                                });
                              }}
                              className={`w-full ml-0 text-gray-900 font-medium border-blue-200 focus:border-blue-400 ${personaData.enabledPillars?.[index] === false ? 'opacity-50' : ''}`}
                              placeholder="Enter core pillar (e.g., lack of time, versatility, clean ingredients)"
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                        ))}
                        {effectiveUser?.role === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const pillars = [...(personaData.pillars || [])];
                              const enabled = [...(personaData.enabledPillars || [])];
                              pillars.push('');
                              enabled.push(true);
                              setEditingConfig({
                                ...editingConfig,
                                personaPillars: {
                                  ...editingConfig.personaPillars,
                                  [personaName]: {
                                    ...personaData,
                                    pillars,
                                    enabledPillars: enabled
                                  }
                                }
                              });
                            }}
                            className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 mt-2"
                          >
                            + Add pillar for {personaName.replace(/([A-Z])/g, ' $1').trim()}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 