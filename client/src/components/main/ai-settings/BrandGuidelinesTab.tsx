import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrainingConfig } from '@shared/training-config';
import { ChevronDown, ChevronRight, UploadCloud, X } from 'lucide-react';
import { BRAND_NAME } from '@shared/constants';

interface BrandGuidelinesTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
  effectiveUser: any;
  onSaveBrandGuidelines?: (bg: TrainingConfig['brandGuidelines']) => void;
}

export const BrandGuidelinesTab: React.FC<BrandGuidelinesTabProps> = ({
  editingConfig,
  setEditingConfig,
  effectiveUser,
  onSaveBrandGuidelines
}) => {
  const [showBrandVoice, setShowBrandVoice] = useState(false);
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [showApprovedLanguage, setShowApprovedLanguage] = useState(false);
  const [showAvoidedLanguage, setShowAvoidedLanguage] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newBrandGuidelines = {
            ...editingConfig?.brandGuidelines,
            brandLogo: event.target.result as string,
          };
          setEditingConfig({
            ...editingConfig,
            brandGuidelines: newBrandGuidelines,
          });
          onSaveBrandGuidelines?.(newBrandGuidelines);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    const newBrandGuidelines = {
      ...editingConfig?.brandGuidelines,
      brandLogo: '',
    };
    setEditingConfig({
      ...editingConfig,
      brandGuidelines: newBrandGuidelines,
    });
    onSaveBrandGuidelines?.(newBrandGuidelines);
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
    icon: string; 
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
          <span className={`text-sm font-bold ${iconColor}`}>{icon}</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {count !== undefined && (
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-500 font-medium">
        {isOpen ? 'Collapse' : 'Expand'}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Save handled by sticky bar in AISettingsComponent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-1 block">Brand Name</Label>
          <Input
            value={editingConfig?.brandGuidelines?.brandName || ''}
            onChange={(e) => {
              if (effectiveUser?.role !== 'admin') return;
              setEditingConfig({
                ...editingConfig,
                brandGuidelines: {
                  ...editingConfig?.brandGuidelines,
                  brandName: e.target.value
                }
              });
            }}
            placeholder={`e.g., ${BRAND_NAME}`}
            disabled={effectiveUser?.role !== 'admin'}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-1 block">Website</Label>
          <Input
            value={editingConfig?.brandGuidelines?.website || ''}
            onChange={(e) => {
              if (effectiveUser?.role !== 'admin') return;
              setEditingConfig({
                ...editingConfig,
                brandGuidelines: {
                  ...editingConfig?.brandGuidelines,
                  website: e.target.value
                }
              });
            }}
            placeholder="https://yourbrand.com"
            disabled={effectiveUser?.role !== 'admin'}
          />
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-1 block">Brand Logo</Label>
        <div className="mt-2 flex items-center gap-x-3">
          {editingConfig?.brandGuidelines?.brandLogo ? (
            <div className="relative">
              <img
                src={editingConfig.brandGuidelines.brandLogo}
                alt="Brand Logo"
                className="h-16 w-16 rounded-md object-cover"
              />
              {effectiveUser?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                  onClick={removeLogo}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          ) : (
            <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
              <UploadCloud className="h-8 w-8 text-gray-400" />
            </div>
          )}
          {effectiveUser?.role === 'admin' && (
            <div className="flex-grow">
              <Input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={effectiveUser?.role !== 'admin'}
              />
              <Label
                htmlFor="logo-upload"
                className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Change logo
              </Label>
            </div>
          )}
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">Core Positioning</Label>
        <Textarea
          value={editingConfig?.brandGuidelines?.corePositioning || ''}
          onChange={(e) => {
            if (effectiveUser?.role !== 'admin') return;
            setEditingConfig({
              ...editingConfig,
              brandGuidelines: {
                ...editingConfig?.brandGuidelines,
                corePositioning: e.target.value
              }
            });
          }}
          className="mt-1 text-gray-900 font-medium"
          rows={3}
          placeholder="Your Skin But Better - natural, effortless enhancement..."
          disabled={effectiveUser?.role !== 'admin'}
        />
      </div>

      <div>
        <ToggleButton
          isOpen={showBrandVoice}
          onClick={() => setShowBrandVoice(!showBrandVoice)}
          title="Brand Voice Rules"
          icon="•"
          iconColor="text-blue-500"
          count={editingConfig?.brandGuidelines?.brandVoice?.length || 0}
        />
        {showBrandVoice && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-blue-100">
            {(editingConfig?.brandGuidelines?.brandVoice || []).map((rule: string, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={editingConfig?.brandGuidelines?.enabledBrandVoice?.[index] !== false}
                    onCheckedChange={(checked) => {
                      if (effectiveUser?.role !== 'admin') return;
                      const enabled = [...(editingConfig?.brandGuidelines?.enabledBrandVoice || [])];
                      enabled[index] = checked;
                      setEditingConfig({
                        ...editingConfig,
                        brandGuidelines: {
                          ...editingConfig?.brandGuidelines,
                          enabledBrandVoice: enabled
                        }
                      });
                    }}
                    disabled={effectiveUser?.role !== 'admin'}
                    className="flex-shrink-0"
                  />
                  <span className="text-blue-500 text-sm font-bold flex-shrink-0">•</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">Rule {index + 1}</span>
                  {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.brandVoice?.length > 3) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                      onClick={() => {
                        const rules = [...(editingConfig?.brandGuidelines?.brandVoice || [])];
                        const enabled = [...(editingConfig?.brandGuidelines?.enabledBrandVoice || [])];
                        rules.splice(index, 1);
                        enabled.splice(index, 1);
                        setEditingConfig({
                          ...editingConfig,
                          brandGuidelines: {
                            ...editingConfig?.brandGuidelines,
                            brandVoice: rules,
                            enabledBrandVoice: enabled
                          }
                        });
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
                <Input
                  value={rule}
                  onChange={(e) => {
                    if (effectiveUser?.role !== 'admin') return;
                    const rules = [...(editingConfig?.brandGuidelines?.brandVoice || [])];
                    rules[index] = e.target.value;
                    setEditingConfig({
                      ...editingConfig,
                      brandGuidelines: {
                        ...editingConfig?.brandGuidelines,
                        brandVoice: rules
                      }
                    });
                  }}
                  className={`w-full ml-0 text-gray-900 font-medium ${editingConfig?.brandGuidelines?.enabledBrandVoice?.[index] === false ? 'opacity-50' : ''}`}
                  placeholder="Enter brand voice rule..."
                  disabled={effectiveUser?.role !== 'admin'}
                />
              </div>
            ))}
            {effectiveUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rules = [...(editingConfig?.brandGuidelines?.brandVoice || [])];
                  const enabled = [...(editingConfig?.brandGuidelines?.enabledBrandVoice || [])];
                  rules.push('');
                  enabled.push(true);
                  setEditingConfig({
                    ...editingConfig,
                    brandGuidelines: {
                      ...editingConfig?.brandGuidelines,
                      brandVoice: rules,
                      enabledBrandVoice: enabled
                    }
                  });
                }}
                className="w-full border-dashed mt-2"
              >
                + Add brand voice rule
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        <ToggleButton
          isOpen={showKeyTerms}
          onClick={() => setShowKeyTerms(!showKeyTerms)}
          title="Key Terms & Phrases"
          icon="•"
          iconColor="text-gray-400"
          count={editingConfig?.brandGuidelines?.keyTerminology?.length || 0}
        />
        {showKeyTerms && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
            {(editingConfig?.brandGuidelines?.keyTerminology || []).map((term: string, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={editingConfig?.brandGuidelines?.enabledKeyTerminology?.[index] !== false}
                    onCheckedChange={(checked) => {
                      if (effectiveUser?.role !== 'admin') return;
                      const enabled = [...(editingConfig?.brandGuidelines?.enabledKeyTerminology || [])];
                      enabled[index] = checked;
                      setEditingConfig({
                        ...editingConfig,
                        brandGuidelines: {
                          ...editingConfig?.brandGuidelines,
                          enabledKeyTerminology: enabled
                        }
                      });
                    }}
                    disabled={effectiveUser?.role !== 'admin'}
                    className="flex-shrink-0"
                  />
                  <span className="text-gray-400 text-sm font-bold flex-shrink-0">•</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">Term {index + 1}</span>
                  {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.keyTerminology?.length > 3) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                      onClick={() => {
                        const terms = [...(editingConfig?.brandGuidelines?.keyTerminology || [])];
                        const enabled = [...(editingConfig?.brandGuidelines?.enabledKeyTerminology || [])];
                        terms.splice(index, 1);
                        enabled.splice(index, 1);
                        setEditingConfig({
                          ...editingConfig,
                          brandGuidelines: {
                            ...editingConfig?.brandGuidelines,
                            keyTerminology: terms,
                            enabledKeyTerminology: enabled
                          }
                        });
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
                <Input
                  value={term}
                  onChange={(e) => {
                    if (effectiveUser?.role !== 'admin') return;
                    const terms = [...(editingConfig?.brandGuidelines?.keyTerminology || [])];
                    terms[index] = e.target.value;
                    setEditingConfig({
                      ...editingConfig,
                      brandGuidelines: {
                        ...editingConfig?.brandGuidelines,
                        keyTerminology: terms
                      }
                    });
                  }}
                  className={`w-full ml-0 text-gray-900 font-medium ${editingConfig?.brandGuidelines?.enabledKeyTerminology?.[index] === false ? 'opacity-50' : ''}`}
                  placeholder="Enter key term or phrase..."
                  disabled={effectiveUser?.role !== 'admin'}
                />
              </div>
            ))}
            {effectiveUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const terms = [...(editingConfig?.brandGuidelines?.keyTerminology || [])];
                  const enabled = [...(editingConfig?.brandGuidelines?.enabledKeyTerminology || [])];
                  terms.push('');
                  enabled.push(true);
                  setEditingConfig({
                    ...editingConfig,
                    brandGuidelines: {
                      ...editingConfig?.brandGuidelines,
                      keyTerminology: terms,
                      enabledKeyTerminology: enabled
                    }
                  });
                }}
                className="w-full border-dashed mt-2"
              >
                + Add key term
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        <ToggleButton
          isOpen={showApprovedLanguage}
          onClick={() => setShowApprovedLanguage(!showApprovedLanguage)}
          title="Approved Language"
          icon="✓"
          iconColor="text-green-500"
          count={editingConfig?.brandGuidelines?.approvedLanguage?.length || 0}
        />
        {showApprovedLanguage && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-green-100">
            {(editingConfig?.brandGuidelines?.approvedLanguage || []).map((phrase: string, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={editingConfig?.brandGuidelines?.enabledApprovedLanguage?.[index] !== false}
                    onCheckedChange={(checked) => {
                      if (effectiveUser?.role !== 'admin') return;
                      const enabled = [...(editingConfig?.brandGuidelines?.enabledApprovedLanguage || [])];
                      enabled[index] = checked;
                      setEditingConfig({
                        ...editingConfig,
                        brandGuidelines: {
                          ...editingConfig?.brandGuidelines,
                          enabledApprovedLanguage: enabled
                        }
                      });
                    }}
                    disabled={effectiveUser?.role !== 'admin'}
                    className="flex-shrink-0"
                  />
                  <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">Approved {index + 1}</span>
                  {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.approvedLanguage?.length > 3) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                      onClick={() => {
                        const phrases = [...(editingConfig?.brandGuidelines?.approvedLanguage || [])];
                        const enabled = [...(editingConfig?.brandGuidelines?.enabledApprovedLanguage || [])];
                        phrases.splice(index, 1);
                        enabled.splice(index, 1);
                        setEditingConfig({
                          ...editingConfig,
                          brandGuidelines: {
                            ...editingConfig?.brandGuidelines,
                            approvedLanguage: phrases,
                            enabledApprovedLanguage: enabled
                          }
                        });
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
                <Input
                  value={phrase}
                  onChange={(e) => {
                    if (effectiveUser?.role !== 'admin') return;
                    const phrases = [...(editingConfig?.brandGuidelines?.approvedLanguage || [])];
                    phrases[index] = e.target.value;
                    setEditingConfig({
                      ...editingConfig,
                      brandGuidelines: {
                        ...editingConfig?.brandGuidelines,
                        approvedLanguage: phrases
                      }
                    });
                  }}
                  className={`w-full ml-0 text-gray-900 font-medium border-green-200 focus:border-green-400 ${editingConfig?.brandGuidelines?.enabledApprovedLanguage?.[index] === false ? 'opacity-50' : ''}`}
                  placeholder="Enter approved phrase..."
                  disabled={effectiveUser?.role !== 'admin'}
                />
              </div>
            ))}
            {effectiveUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const phrases = [...(editingConfig?.brandGuidelines?.approvedLanguage || [])];
                  const enabled = [...(editingConfig?.brandGuidelines?.enabledApprovedLanguage || [])];
                  phrases.push('');
                  enabled.push(true);
                  setEditingConfig({
                    ...editingConfig,
                    brandGuidelines: {
                      ...editingConfig?.brandGuidelines,
                      approvedLanguage: phrases,
                      enabledApprovedLanguage: enabled
                    }
                  });
                }}
                className="w-full border-dashed border-green-300 text-green-600 hover:bg-green-50 mt-2"
              >
                + Add approved phrase
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        <ToggleButton
          isOpen={showAvoidedLanguage}
          onClick={() => setShowAvoidedLanguage(!showAvoidedLanguage)}
          title="Avoided Language"
          icon="✗"
          iconColor="text-red-500"
          count={editingConfig?.brandGuidelines?.avoidedLanguage?.length || 0}
        />
        {showAvoidedLanguage && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-red-100">
            {(editingConfig?.brandGuidelines?.avoidedLanguage || []).map((phrase: string, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={editingConfig?.brandGuidelines?.enabledAvoidedLanguage?.[index] !== false}
                    onCheckedChange={(checked) => {
                      if (effectiveUser?.role !== 'admin') return;
                      const enabled = [...(editingConfig?.brandGuidelines?.enabledAvoidedLanguage || [])];
                      enabled[index] = checked;
                      setEditingConfig({
                        ...editingConfig,
                        brandGuidelines: {
                          ...editingConfig?.brandGuidelines,
                          enabledAvoidedLanguage: enabled
                        }
                      });
                    }}
                    disabled={effectiveUser?.role !== 'admin'}
                    className="flex-shrink-0"
                  />
                  <span className="text-red-500 text-sm font-bold flex-shrink-0">✗</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">Avoid {index + 1}</span>
                  {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.avoidedLanguage?.length > 3) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                      onClick={() => {
                        const phrases = [...(editingConfig?.brandGuidelines?.avoidedLanguage || [])];
                        const enabled = [...(editingConfig?.brandGuidelines?.enabledAvoidedLanguage || [])];
                        phrases.splice(index, 1);
                        enabled.splice(index, 1);
                        setEditingConfig({
                          ...editingConfig,
                          brandGuidelines: {
                            ...editingConfig?.brandGuidelines,
                            avoidedLanguage: phrases,
                            enabledAvoidedLanguage: enabled
                          }
                        });
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
                <Input
                  value={phrase}
                  onChange={(e) => {
                    if (effectiveUser?.role !== 'admin') return;
                    const phrases = [...(editingConfig?.brandGuidelines?.avoidedLanguage || [])];
                    phrases[index] = e.target.value;
                    setEditingConfig({
                      ...editingConfig,
                      brandGuidelines: {
                        ...editingConfig?.brandGuidelines,
                        avoidedLanguage: phrases
                      }
                    });
                  }}
                  className={`w-full ml-0 text-gray-900 font-medium border-red-200 focus:border-red-400 ${editingConfig?.brandGuidelines?.enabledAvoidedLanguage?.[index] === false ? 'opacity-50' : ''}`}
                  placeholder="Enter phrase to avoid..."
                  disabled={effectiveUser?.role !== 'admin'}
                />
              </div>
            ))}
            {effectiveUser?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const phrases = [...(editingConfig?.brandGuidelines?.avoidedLanguage || [])];
                  const enabled = [...(editingConfig?.brandGuidelines?.enabledAvoidedLanguage || [])];
                  phrases.push('');
                  enabled.push(true);
                  setEditingConfig({
                    ...editingConfig,
                    brandGuidelines: {
                      ...editingConfig?.brandGuidelines,
                      avoidedLanguage: phrases,
                      enabledAvoidedLanguage: enabled
                    }
                  });
                }}
                className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50 mt-2"
              >
                + Add phrase to avoid
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 