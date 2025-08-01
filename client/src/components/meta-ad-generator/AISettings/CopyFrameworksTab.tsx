import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TrainingConfig } from '@shared/training-config';

interface CopyFrameworksTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
}

export const CopyFrameworksTab: React.FC<CopyFrameworksTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser
}) => {
  const [showHeadlineFrameworks, setShowHeadlineFrameworks] = useState(false);
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<number>>(new Set());

  const toggleFramework = (index: number) => {
    const newExpanded = new Set(expandedFrameworks);
    if (expandedFrameworks.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFrameworks(newExpanded);
  };

  const ToggleButton = ({ 
    isOpen, 
    onClick, 
    title, 
    icon, 
    iconColor, 
    count 
  }: { 
    isOpen: boolean; 
    onClick: () => void; 
    title: string; 
    icon: React.ReactNode; 
    iconColor: string; 
    count?: number;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {count !== undefined && (
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {count} {count === 1 ? 'framework' : 'frameworks'}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {effectiveUser?.role === 'admin' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const newFramework = {
                name: '',
                description: '',
                template: '',
                examples: [],
                isEnabled: true
              };
              const updated = [...(editingConfig?.copyFrameworks?.headlineFrameworks || []), newFramework];
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig?.copyFrameworks,
                  headlineFrameworks: updated
                }
              });
            }}
            size="sm"
            variant="outline"
            className="text-xs bg-white hover:bg-gray-50"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Framework
          </Button>
        )}
        <span className="text-xs text-gray-500 font-medium">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </div>
    </button>
  );

  const FrameworkToggleButton = ({ 
    isOpen, 
    onClick, 
    framework, 
    index 
  }: { 
    isOpen: boolean; 
    onClick: () => void; 
    framework: any; 
    index: number;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-left">
          <span className="text-sm font-medium text-gray-900">
            {framework.name || `Framework ${index + 1}`}
          </span>
          {framework.template && !isOpen && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {framework.template}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          framework.isEnabled !== false 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {framework.isEnabled !== false ? 'Enabled' : 'Disabled'}
        </span>
        {effectiveUser?.role === 'admin' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const updated = editingConfig.copyFrameworks.headlineFrameworks.filter((_, i) => i !== index);
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  headlineFrameworks: updated
                }
              });
            }}
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
        <span className="text-xs text-gray-500 font-medium">
          {isOpen ? 'Collapse' : 'Expand'}
        </span>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <ToggleButton
          isOpen={showHeadlineFrameworks}
          onClick={() => setShowHeadlineFrameworks(!showHeadlineFrameworks)}
          title="Headline Frameworks"
          icon={<Sparkles className="w-5 h-5" />}
          iconColor="text-purple-500"
          count={editingConfig?.copyFrameworks?.headlineFrameworks?.length || 0}
        />
        
        {showHeadlineFrameworks && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-purple-100">
            {editingConfig?.copyFrameworks?.headlineFrameworks?.map((framework: any, index: number) => {
              const isExpanded = expandedFrameworks.has(index);
              
              return (
                <div key={index} className="space-y-2">
                  <FrameworkToggleButton
                    isOpen={isExpanded}
                    onClick={() => toggleFramework(index)}
                    framework={framework}
                    index={index}
                  />
                  
                  {isExpanded && (
                    <div className="ml-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={framework.isEnabled !== false}
                            onCheckedChange={(checked) => {
                              if (effectiveUser?.role !== 'admin') return;
                              const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                              updated[index] = { ...updated[index], isEnabled: checked };
                              setEditingConfig({
                                ...editingConfig,
                                copyFrameworks: {
                                  ...editingConfig.copyFrameworks,
                                  headlineFrameworks: updated
                                }
                              });
                            }}
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                          <Label className="text-xs text-gray-600">
                            {framework.isEnabled !== false ? 'Enabled' : 'Disabled'}
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs text-gray-600">Framework Name</Label>
                          <Input
                            value={framework.name}
                            onChange={(e) => {
                              if (effectiveUser?.role !== 'admin') return;
                              const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setEditingConfig({
                                ...editingConfig,
                                copyFrameworks: {
                                  ...editingConfig.copyFrameworks,
                                  headlineFrameworks: updated
                                }
                              });
                            }}
                            className="mt-1"
                            placeholder="BENEFIT DRIVEN"
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Template Format</Label>
                          <Input
                            value={framework.template}
                            onChange={(e) => {
                              if (effectiveUser?.role !== 'admin') return;
                              const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                              updated[index] = { ...updated[index], template: e.target.value };
                              setEditingConfig({
                                ...editingConfig,
                                copyFrameworks: {
                                  ...editingConfig.copyFrameworks,
                                  headlineFrameworks: updated
                                }
                              });
                            }}
                            className="mt-1"
                            placeholder="[Primary Benefit] + [Outcome]"
                            disabled={effectiveUser?.role !== 'admin'}
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label className="text-xs text-gray-600">Description & How to Use</Label>
                        <Textarea
                          value={framework.description}
                          onChange={(e) => {
                            if (effectiveUser?.role !== 'admin') return;
                            const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setEditingConfig({
                              ...editingConfig,
                              copyFrameworks: {
                                ...editingConfig.copyFrameworks,
                                headlineFrameworks: updated
                              }
                            });
                          }}
                          className="mt-1"
                          rows={2}
                          placeholder="Lead with the primary benefit/transformation the product delivers"
                          disabled={effectiveUser?.role !== 'admin'}
                        />
                      </div>
                      <div className="mt-2">
                        <Label className="text-xs text-gray-600">Example Headlines (one per line)</Label>
                        <Textarea
                          value={Array.isArray(framework.examples) ? framework.examples.join('\n') : ''}
                          onChange={(e) => {
                            if (effectiveUser?.role !== 'admin') return;
                            const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                            updated[index] = {
                              ...updated[index],
                              examples: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                            };
                            setEditingConfig({
                              ...editingConfig,
                              copyFrameworks: {
                                ...editingConfig.copyFrameworks,
                                headlineFrameworks: updated
                              }
                            });
                          }}
                          className="mt-1"
                          rows={2}
                          placeholder="Natural Glow Simplified
Effortless Beauty Found
Your Skin But Better"
                          disabled={effectiveUser?.role !== 'admin'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {(!editingConfig?.copyFrameworks?.headlineFrameworks || editingConfig.copyFrameworks.headlineFrameworks.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No headline frameworks configured</p>
                {effectiveUser?.role === 'admin' && (
                  <p className="text-xs mt-1">Click "Add Framework" to create your first headline framework</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">Copy Writing Rules (one per line)</Label>
        <Textarea
          value={Array.isArray(editingConfig?.copyFrameworks?.primaryTextRules)
            ? editingConfig.copyFrameworks.primaryTextRules.join('\n')
            : ''}
          onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
            ...editingConfig,
            copyFrameworks: {
              ...editingConfig.copyFrameworks,
              primaryTextRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
            }
          })}
          className="mt-1"
          rows={4}
          placeholder="Headlines: Maximum 5 words, must fit in 1 line on mobile
Primary text: 15-25 words optimal for Meta ads
Keep sentences to 8-12 words for mobile comprehension"
          disabled={effectiveUser?.role !== 'admin'}
        />
      </div>

      {/* Listicle Framework Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex items-center mb-4">
          <span className="w-3 h-3 bg-gray-600 rounded-full mr-2"></span>
          <Label className="text-sm font-medium text-gray-900">Listicle Framework (Based on Real Examples)</Label>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-900 mb-2 block">Content Structure Sequence</Label>
            <Textarea
              value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.contentSequence)
                ? editingConfig.copyFrameworks.listicleFramework.contentSequence.join('\n')
                : ''}
              onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  listicleFramework: {
                    ...editingConfig.copyFrameworks?.listicleFramework,
                    contentSequence: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                    reasonStructure: editingConfig.copyFrameworks?.listicleFramework?.reasonStructure || [],
                    optimizationRules: editingConfig.copyFrameworks?.listicleFramework?.optimizationRules || [],
                    realExamples: editingConfig.copyFrameworks?.listicleFramework?.realExamples || [],
                  }
                }
              })}
              className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
              rows={6}
              placeholder="1. IMMEDIATE PROBLEM SOLVER - addresses main pain point
2. UNIQUE ADVANTAGE - what makes this different
3. EASE OF USE - how simple/convenient it is
4. DEEPER BENEFIT - secondary value that matters
5. SOCIAL PROOF - real results from real people
6. NATURAL CONCLUSION - why this makes sense now"
              disabled={effectiveUser?.role !== 'admin'}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-900 mb-2 block">Each Reason Structure Format</Label>
            <Textarea
              value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.reasonStructure)
                ? editingConfig.copyFrameworks.listicleFramework.reasonStructure.join('\n')
                : ''}
              onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  listicleFramework: {
                    ...editingConfig.copyFrameworks?.listicleFramework,
                    reasonStructure: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                    contentSequence: editingConfig.copyFrameworks?.listicleFramework?.contentSequence || [],
                    optimizationRules: editingConfig.copyFrameworks?.listicleFramework?.optimizationRules || [],
                    realExamples: editingConfig.copyFrameworks?.listicleFramework?.realExamples || [],
                  }
                }
              })}
              className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
              rows={5}
              placeholder="- CLEAR BENEFIT STATEMENT (10-20 words): Direct, specific value
- BRIEF EXPLANATION (30-60 words): Why this matters, how it works
- SPECIFIC DETAILS (20-40 words): Numbers, features, proof points
- NATURAL BENEFIT BRIDGE (15-25 words): What this means practically
- OPTIONAL SOCIAL PROOF: Real customer quote if natural"
              disabled={effectiveUser?.role !== 'admin'}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-900 mb-2 block">Optimization Rules</Label>
            <Textarea
              value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.optimizationRules)
                ? editingConfig.copyFrameworks.listicleFramework.optimizationRules.join('\n')
                : ''}
              onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  listicleFramework: {
                    ...editingConfig.copyFrameworks?.listicleFramework,
                    optimizationRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                    contentSequence: editingConfig.copyFrameworks?.listicleFramework?.contentSequence || [],
                    reasonStructure: editingConfig.copyFrameworks?.listicleFramework?.reasonStructure || [],
                    realExamples: editingConfig.copyFrameworks?.listicleFramework?.realExamples || [],
                  }
                }
              })}
              className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
              rows={5}
              placeholder="Maximum 100 words per reason section (concise and scannable)
Lead with benefits, support with facts - not the other way around
Use specific details and numbers when possible (like '24dB reduction')
Keep language clear and direct - avoid flowery marketing speak
Each reason should stand alone and deliver immediate value"
              disabled={effectiveUser?.role !== 'admin'}
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-900 mb-2 block">Real Example Patterns to Emulate</Label>
            <Textarea
              value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.realExamples)
                ? editingConfig.copyFrameworks.listicleFramework.realExamples.join('\n')
                : ''}
              onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  listicleFramework: {
                    ...editingConfig.copyFrameworks?.listicleFramework,
                    realExamples: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                    contentSequence: editingConfig.copyFrameworks?.listicleFramework?.contentSequence || [],
                    reasonStructure: editingConfig.copyFrameworks?.listicleFramework?.reasonStructure || [],
                    optimizationRules: editingConfig.copyFrameworks?.listicleFramework?.optimizationRules || [],
                  }
                }
              })}
              className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
              rows={4}
              placeholder="Grüns: 'Better Poops (Seriously)' - direct, honest, conversational
Loop: 'Blocks Out The Loudest Tools - 24dB Reduction' - specific benefit + proof
Create: 'They're made with Creapure®, the highest-quality...' - quality focus
Tone: Educational but approachable, like explaining to a friend who asked"
              disabled={effectiveUser?.role !== 'admin'}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            <span className="inline-flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Brand-First Guidelines
            </span>
          </Label>
          <div className="space-y-2">
            {(editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst || []).map((guideline: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 group">
                <span className="text-blue-500 text-sm font-medium flex-shrink-0 mt-2">▶</span>
                <Input
                  value={guideline}
                  onChange={(e) => {
                    if (effectiveUser?.role !== 'admin') return;
                    const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.brandFirst || [])];
                    guidelines[index] = e.target.value;
                    setEditingConfig({
                      ...editingConfig,
                      copyFrameworks: {
                        ...editingConfig.copyFrameworks,
                        brandDrBalance: {
                          ...editingConfig.copyFrameworks.brandDrBalance,
                          brandFirst: guidelines.filter(g => g.trim() !== '')
                        }
                      }
                    });
                  }}
                  className="flex-1 border-blue-200 focus:border-blue-400"
                  placeholder="Enter brand-first guideline..."
                  disabled={effectiveUser?.role !== 'admin'}
                />
                {effectiveUser?.role === 'admin' && (editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst?.length > 1) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 flex-shrink-0"
                    onClick={() => {
                      const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.brandFirst || [])];
                      guidelines.splice(index, 1);
                      setEditingConfig({
                        ...editingConfig,
                        copyFrameworks: {
                          ...editingConfig.copyFrameworks,
                          brandDrBalance: {
                            ...editingConfig.copyFrameworks.brandDrBalance,
                            brandFirst: guidelines
                          }
                        }
                      });
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {effectiveUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const guidelines = [...(editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst || [])];
                  guidelines.push('');
                  setEditingConfig({
                    ...editingConfig,
                    copyFrameworks: {
                      ...editingConfig.copyFrameworks,
                      brandDrBalance: {
                        ...editingConfig.copyFrameworks.brandDrBalance,
                        brandFirst: guidelines
                      }
                    }
                  });
                }}
                className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 mt-2"
              >
                + Add brand-first guideline
              </Button>
            )}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-3 block">
            <span className="inline-flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Direct Response Guidelines
            </span>
          </Label>
          <div className="space-y-2">
            {(editingConfig?.copyFrameworks?.brandDrBalance?.directResponse || []).map((guideline: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 group">
                <span className="text-orange-500 text-sm font-medium flex-shrink-0 mt-2">⚡</span>
                <Input
                  value={guideline}
                  onChange={(e) => {
                    if (effectiveUser?.role !== 'admin') return;
                    const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.directResponse || [])];
                    guidelines[index] = e.target.value;
                    setEditingConfig({
                      ...editingConfig,
                      copyFrameworks: {
                        ...editingConfig.copyFrameworks,
                        brandDrBalance: {
                          ...editingConfig.copyFrameworks.brandDrBalance,
                          directResponse: guidelines.filter(g => g.trim() !== '')
                        }
                      }
                    });
                  }}
                  className="flex-1 border-orange-200 focus:border-orange-400"
                  placeholder="Enter direct response guideline..."
                  disabled={effectiveUser?.role !== 'admin'}
                />
                {effectiveUser?.role === 'admin' && (editingConfig?.copyFrameworks?.brandDrBalance?.directResponse?.length > 1) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 flex-shrink-0"
                    onClick={() => {
                      const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.directResponse || [])];
                      guidelines.splice(index, 1);
                      setEditingConfig({
                        ...editingConfig,
                        copyFrameworks: {
                          ...editingConfig.copyFrameworks,
                          brandDrBalance: {
                            ...editingConfig.copyFrameworks.brandDrBalance,
                            directResponse: guidelines
                          }
                        }
                      });
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {effectiveUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const guidelines = [...(editingConfig?.copyFrameworks?.brandDrBalance?.directResponse || [])];
                  guidelines.push('');
                  setEditingConfig({
                    ...editingConfig,
                    copyFrameworks: {
                      ...editingConfig.copyFrameworks,
                      brandDrBalance: {
                        ...editingConfig.copyFrameworks.brandDrBalance,
                        directResponse: guidelines
                      }
                    }
                  });
                }}
                className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 mt-2"
              >
                + Add direct response guideline
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 