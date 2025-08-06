import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Trash2, ChevronDown, ChevronRight, Plus, Mail, Upload, Check, X, List } from 'lucide-react';
import { TrainingConfig } from '@shared/training-config';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showEmailFrameworks, setShowEmailFrameworks] = useState(false);
  const [expandedEmailFrameworks, setExpandedEmailFrameworks] = useState<Set<number>>(new Set());
  const [loadingEmailFrameworks, setLoadingEmailFrameworks] = useState(false);
  const { toast } = useToast();
  const frameworksLoadedRef = useRef(false);

  // Add landing page frameworks state
  const [showLandingPageFrameworks, setShowLandingPageFrameworks] = useState(false);
  const [expandedLandingPageFrameworks, setExpandedLandingPageFrameworks] = useState<Set<number>>(new Set());
  const [loadingLandingPageFrameworks, setLoadingLandingPageFrameworks] = useState(false);

  // Load email frameworks from database on component mount
  useEffect(() => {
    const loadEmailFrameworks = async () => {
      // Always load from API to ensure we have the latest data including images
      console.log('DEBUG: Loading email frameworks from API...');
      setLoadingEmailFrameworks(true);
      
      try {
        const response = await apiRequest('/api/email-frameworks');
        console.log('DEBUG: Received email frameworks from API:', {
          count: response?.length || 0,
          frameworksWithImages: (response || []).filter((fw: any) => fw.images && Array.isArray(fw.images) && fw.images.length > 0).length,
          frameworks: (response || []).map((fw: any) => ({
            id: fw.id,
            name: fw.name,
            displayName: fw.displayName,
            hasImages: !!fw.images,
            imagesCount: Array.isArray(fw.images) ? fw.images.length : 0,
            firstImageDataUriLength: fw.images && fw.images[0] ? fw.images[0].dataUri?.length : 0
          }))
        });
        
        const emailFrameworks = (response || []).map((framework: any) => ({
          ...framework,
          isEnabled: framework.isActive === 'true' || framework.isActive === true
        }));
        
        // Update the editing config with loaded frameworks
        const updatedConfig = {
          ...editingConfig,
          copyFrameworks: {
            ...editingConfig?.copyFrameworks,
            emailFrameworks: emailFrameworks
          }
        };
        setEditingConfig(updatedConfig);
        
        console.log('DEBUG: Updated config with frameworks:', {
          totalFrameworks: emailFrameworks.length,
          frameworksWithImages: emailFrameworks.filter((fw: any) => fw.images && Array.isArray(fw.images) && fw.images.length > 0).length
        });
        
      } catch (error) {
        console.error('Failed to load email frameworks:', error);
        toast({
          title: "Error",
          description: "Failed to load email frameworks from database",
          variant: "destructive",
        });
      } finally {
        setLoadingEmailFrameworks(false);
      }
    };

    loadEmailFrameworks();
  }, []); // Only run once on mount

  // Load landing page frameworks from database on component mount
  useEffect(() => {
    const loadLandingPageFrameworks = async () => {
      // Always load from API to ensure we have the latest data including images
      console.log('DEBUG: Loading landing page frameworks from API...');
      setLoadingLandingPageFrameworks(true);
      
      try {
        const response = await apiRequest('/api/landing-page-frameworks');
        console.log('DEBUG: Received landing page frameworks from API:', {
          count: response?.length || 0,
          frameworks: (response || []).map((fw: any) => ({
            id: fw.id,
            name: fw.name,
            displayName: fw.displayName,
            hasImages: !!fw.images,
            imagesCount: Array.isArray(fw.images) ? fw.images.length : 0
          }))
        });
        
        const landingPageFrameworks = (response || []).map((framework: any) => ({
          ...framework,
          isEnabled: framework.isActive === 'true' || framework.isActive === true
        }));
        
        // Update the editing config with loaded frameworks
        const updatedConfig = {
          ...editingConfig,
          copyFrameworks: {
            ...editingConfig?.copyFrameworks,
            landingPageFrameworks: landingPageFrameworks
          }
        };
        setEditingConfig(updatedConfig);
        
        console.log('DEBUG: Updated config with landing page frameworks:', {
          totalFrameworks: landingPageFrameworks.length
        });
        
      } catch (error) {
        console.error('Failed to load landing page frameworks:', error);
        toast({
          title: "Error",
          description: "Failed to load landing page frameworks from database",
          variant: "destructive",
        });
      } finally {
        setLoadingLandingPageFrameworks(false);
      }
    };

    loadLandingPageFrameworks();
  }, []); // Only run once on mount

  const toggleFramework = (index: number) => {
    const newExpanded = new Set(expandedFrameworks);
    if (expandedFrameworks.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFrameworks(newExpanded);
  };

  // Add email framework toggle function
  const toggleEmailFramework = (index: number) => {
    const newExpanded = new Set(expandedEmailFrameworks);
    if (expandedEmailFrameworks.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEmailFrameworks(newExpanded);
  };

  // Add landing page framework toggle function
  const toggleLandingPageFramework = (index: number) => {
    const newExpanded = new Set(expandedLandingPageFrameworks);
    if (expandedLandingPageFrameworks.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLandingPageFrameworks(newExpanded);
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
    <div
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200 cursor-pointer"
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
        {effectiveUser?.role === 'admin' && title === 'Meta Ads Frameworks' && (
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
        {effectiveUser?.role === 'admin' && title === 'Email Frameworks' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const newFramework = {
                name: '',
                displayName: '',
                description: '',
                structure: '',
                keyElements: '',
                frameworkContent: '',
                systemPrompt: '',
                outputRequirements: '',
                expectedLength: 'medium',
                isEnabled: true,
                sortOrder: (editingConfig?.copyFrameworks?.emailFrameworks || []).length
              };
              const updated = [...(editingConfig?.copyFrameworks?.emailFrameworks || []), newFramework];
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig?.copyFrameworks,
                  emailFrameworks: updated
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
        {effectiveUser?.role === 'admin' && title === 'Landing Page Frameworks' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const newFramework = {
                name: '',
                displayName: '',
                description: '',
                contentSequence: [],
                reasonStructure: [],
                optimizationRules: [],
                realExamples: [],
                systemPrompt: '',
                outputRequirements: '',
                isEnabled: true,
                sortOrder: (editingConfig?.copyFrameworks?.landingPageFrameworks || []).length
              };
              const updated = [...(editingConfig?.copyFrameworks?.landingPageFrameworks || []), newFramework];
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig?.copyFrameworks,
                  landingPageFrameworks: updated
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
    </div>
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

  // Email Framework Toggle Button
  const EmailFrameworkToggleButton = ({ 
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
          <Mail className="w-4 h-4 text-green-500" />
        </div>
        <div className="text-left">
          <span className="text-sm font-medium text-gray-900">
            {framework.displayName || framework.name || `Email Framework ${index + 1}`}
          </span>
          {framework.description && !isOpen && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {framework.description}
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
              const updated = (editingConfig.copyFrameworks.emailFrameworks || []).filter((_, i) => i !== index);
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  emailFrameworks: updated
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

  // Landing Page Framework Toggle Button
  const LandingPageFrameworkToggleButton = ({ 
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
          <List className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-left">
          <span className="text-sm font-medium text-gray-900">
            {framework.displayName || framework.name || `Landing Page Framework ${index + 1}`}
          </span>
          {framework.description && !isOpen && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {framework.description}
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
              const updated = (editingConfig.copyFrameworks.landingPageFrameworks || []).filter((_, i) => i !== index);
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  landingPageFrameworks: updated
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
          title="Meta Ads Frameworks"
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
                <p className="text-sm">No meta ads frameworks configured</p>
                {effectiveUser?.role === 'admin' && (
                  <p className="text-xs mt-1">Click "Add Framework" to create your first headline framework</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

   {/* Email Frameworks Section */}
   <div>
        <ToggleButton
          isOpen={showEmailFrameworks}
          onClick={() => setShowEmailFrameworks(!showEmailFrameworks)}
          title="Email Frameworks"
          icon={<Mail className="w-5 h-5" />}
          iconColor="text-green-500"
          count={editingConfig?.copyFrameworks?.emailFrameworks?.length || 0}
        />
        
        {showEmailFrameworks && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-green-100">
            {loadingEmailFrameworks && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p>Loading email frameworks...</p>
              </div>
            )}

            {(!editingConfig?.copyFrameworks?.emailFrameworks || editingConfig.copyFrameworks.emailFrameworks.length === 0) && !loadingEmailFrameworks ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No email frameworks found.</p>
                {effectiveUser?.role === 'admin' && (
                  <p className="text-xs mt-2">Click "Add Framework" to create your first email framework.</p>
                )}
              </div>
            ) : !loadingEmailFrameworks ? (
              <div className="space-y-4">
                {(editingConfig.copyFrameworks.emailFrameworks || []).map((framework, index) => {
                  const isExpanded = expandedEmailFrameworks.has(index);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <EmailFrameworkToggleButton
                        isOpen={isExpanded}
                        onClick={() => toggleEmailFramework(index)}
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
                                  const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                  updated[index] = { ...updated[index], isEnabled: checked };
                                  setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      emailFrameworks: updated
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
                            {/* <div>
                              <Label className="text-xs text-gray-600">Framework Name</Label>
                              <Input
                                value={framework.name || ''}
                                onChange={(e) => {
                                  if (effectiveUser?.role !== 'admin') return;
                                  const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                  updated[index] = { ...updated[index], name: e.target.value };
                                  setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      emailFrameworks: updated
                                    }
                                  });
                                }}
                                className="mt-1"
                                placeholder="e.g., GTL"
                                disabled={effectiveUser?.role !== 'admin'}
                              />
                            </div> */}
                            <div>
                            <Label className="text-xs text-gray-600">Framework Name</Label>
                              <Input
                                value={framework.displayName || ''}
                                onChange={(e) => {
                                  if (effectiveUser?.role !== 'admin') return;
                                  const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                  updated[index] = { ...updated[index], displayName: e.target.value };
                                  setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      emailFrameworks: updated
                                    }
                                  });
                                }}
                                className="mt-1"
                                placeholder="e.g., Get the Look"
                                disabled={effectiveUser?.role !== 'admin'}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Description</Label>
                            <Textarea
                              value={framework.description || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], description: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={2}
                              placeholder="Brief description of this email framework..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Structure Template</Label>
                            <Textarea
                              value={framework.structure || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], structure: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={2}
                              placeholder="e.g., Hero: Hed / Dek / CTA → Intro Module → Product Breakdown..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Key Elements</Label>
                            <Textarea
                              value={framework.keyElements || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], keyElements: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={2}
                              placeholder="e.g., Product steps, application tips, seasonal inspiration..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Framework Content & Examples</Label>
                            <Textarea
                              value={framework.frameworkContent || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], frameworkContent: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1 font-mono"
                              rows={4}
                              placeholder="Detailed framework structure, examples, best practices..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">AI System Prompt</Label>
                            <Textarea
                              value={framework.systemPrompt || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], systemPrompt: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={3}
                              placeholder="Instructions for AI to generate this framework type..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Output Requirements</Label>
                            <Textarea
                              value={framework.outputRequirements || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], outputRequirements: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={2}
                              placeholder="Expected output format and requirements..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Expected Length</Label>
                            <Input
                              value={framework.expectedLength || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                updated[index] = { ...updated[index], expectedLength: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    emailFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              placeholder="e.g., short, medium, long, 300-500 words, 2-3 paragraphs, etc."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Common options: short, medium, long, or specify custom like "300-500 words", "2-3 paragraphs"
                            </p>
                          </div>
                          
                          {/* Framework Images Section */}
                          <div className="mt-4">
                            <Label className="text-xs text-gray-600 mb-2 block">
                              Visual Layout References (Max 5 images)
                            </Label>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <p className="text-xs text-blue-800 font-medium">📸 Image Guidelines</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Upload email examples or layouts that represent this framework. These images will be sent to AI when generating copy to match the visual style.
                              </p>
                              <p className="text-xs text-blue-600 mt-2 font-medium">
                                ⚠️ Remember to click "Save Changes" at the top after uploading images to persist them.
                              </p>
                            </div>
                            
                            {/* Current Images Display */}
                            {(() => {
                              console.log('DEBUG: Checking framework images for display:', {
                                frameworkName: framework.displayName || framework.name,
                                hasImages: !!framework.images,
                                isArray: Array.isArray(framework.images),
                                imagesLength: framework.images ? framework.images.length : 0,
                                images: framework.images
                              });
                              return null;
                            })()}
                            {framework.images && Array.isArray(framework.images) && framework.images.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                {framework.images.map((image: any, imgIndex: number) => {
                                  console.log('DEBUG: Rendering image in UI:', {
                                    frameworkName: framework.displayName || framework.name,
                                    imageIndex: imgIndex,
                                    imageName: image.name,
                                    hasDataUri: !!image.dataUri,
                                    dataUriLength: image.dataUri?.length || 0,
                                    dataUriStart: image.dataUri?.substring(0, 50) || 'N/A'
                                  });
                                  return (
                                    <div key={imgIndex} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                                      <img 
                                        src={image.dataUri} 
                                        alt={image.name || `Framework image ${imgIndex + 1}`}
                                        className="w-full h-24 object-cover"
                                        onError={(e) => {
                                          console.error('DEBUG: Image failed to load:', {
                                            frameworkName: framework.displayName || framework.name,
                                            imageIndex: imgIndex,
                                            imageName: image.name,
                                            src: image.dataUri?.substring(0, 100) || 'N/A'
                                          });
                                        }}
                                      />
                                      {effectiveUser?.role === 'admin' && (
                                        <button
                                          onClick={() => {
                                            if (confirm('Remove this image?')) {
                                              const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                              const updatedImages = [...(updated[index].images || [])];
                                              updatedImages.splice(imgIndex, 1);
                                              updated[index] = { ...updated[index], images: updatedImages };
                                              setEditingConfig({
                                                ...editingConfig,
                                                copyFrameworks: {
                                                  ...editingConfig.copyFrameworks,
                                                  emailFrameworks: updated
                                                }
                                              });
                                            }
                                          }}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                        {image.name || `Image ${imgIndex + 1}`}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {/* Upload Button */}
                            {effectiveUser?.role === 'admin' && (
                              <div className="space-y-2">
                                {(!framework.images || framework.images.length < 5) ? (
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      id={`framework-image-upload-${index}`}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        
                                        // Validate file type
                                        if (!file.type.startsWith('image/')) {
                                          toast({
                                            title: "Invalid File",
                                            description: "Please upload a valid image file (JPG, PNG, etc.)",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        
                                        // Validate file size (8MB limit)
                                        if (file.size > 8 * 1024 * 1024) {
                                          toast({
                                            title: "File Too Large",
                                            description: "File size must be less than 8MB",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const result = event.target?.result as string;
                                          if (result) {
                                            const updated = [...(editingConfig.copyFrameworks.emailFrameworks || [])];
                                            const currentImages = updated[index].images || [];
                                            const newImage = {
                                              id: Date.now().toString(),
                                              name: file.name,
                                              dataUri: result,
                                              mimeType: file.type,
                                              size: file.size,
                                              uploadedAt: new Date().toISOString()
                                            };
                                            updated[index] = { 
                                              ...updated[index], 
                                              images: [...currentImages, newImage] 
                                            };
                                            setEditingConfig({
                                              ...editingConfig,
                                              copyFrameworks: {
                                                ...editingConfig.copyFrameworks,
                                                emailFrameworks: updated
                                              }
                                            });
                                            
                                            // console.log('DEBUG: Image added to framework', {
                                            //   frameworkIndex: index,
                                            //   frameworkName: framework.displayName || framework.name,
                                            //   fileName: file.name,
                                            //   imageId: newImage.id,
                                            //   totalImages: [...currentImages, newImage].length,
                                            //   updatedFramework: { ...updated[index], images: [...currentImages, newImage] }
                                            // });
                                            
                                            toast({
                                              title: "Image Added",
                                              description: `Added ${file.name} to framework. Don't forget to click "Save Changes" to persist your images.`,
                                              variant: "default",
                                            });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                        
                                        // Reset the input
                                        e.target.value = '';
                                      }}
                                    />
                                    <label
                                      htmlFor={`framework-image-upload-${index}`}
                                      className="inline-flex items-center px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-colors"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Image ({(framework.images && Array.isArray(framework.images) ? framework.images.length : 0)}/5)
                                    </label>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 italic">
                                    Maximum of 5 images reached. Remove an image to add a new one.
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {effectiveUser?.role !== 'admin' && (
                              <p className="text-xs text-gray-500 italic">Admin access required to manage images</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Landing Page Frameworks Section */}
      <div>
        <ToggleButton
          isOpen={showLandingPageFrameworks}
          onClick={() => setShowLandingPageFrameworks(!showLandingPageFrameworks)}
          title="Landing Page Frameworks"
          icon={<List className="w-5 h-5" />}
          iconColor="text-blue-500"
          count={editingConfig?.copyFrameworks?.landingPageFrameworks?.length || 0}
        />
        
        {showLandingPageFrameworks && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-blue-100">
            {loadingLandingPageFrameworks && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading landing page frameworks...</p>
              </div>
            )}

            {(!editingConfig?.copyFrameworks?.landingPageFrameworks || editingConfig.copyFrameworks.landingPageFrameworks.length === 0) && !loadingLandingPageFrameworks ? (
              <div className="text-center py-8 text-gray-500">
                <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No landing page frameworks found.</p>
                {effectiveUser?.role === 'admin' && (
                  <p className="text-xs mt-2">Click "Add Framework" to create your first landing page framework.</p>
                )}
              </div>
            ) : !loadingLandingPageFrameworks ? (
              <div className="space-y-4">
                {(editingConfig.copyFrameworks.landingPageFrameworks || []).map((framework, index) => {
                  const isExpanded = expandedLandingPageFrameworks.has(index);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <LandingPageFrameworkToggleButton
                        isOpen={isExpanded}
                        onClick={() => toggleLandingPageFramework(index)}
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
                                  const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                  updated[index] = { ...updated[index], isEnabled: checked };
                                  setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      landingPageFrameworks: updated
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
                                value={framework.displayName || ''}
                                onChange={(e) => {
                                  if (effectiveUser?.role !== 'admin') return;
                                  const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                  updated[index] = { ...updated[index], displayName: e.target.value };
                                  setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      landingPageFrameworks: updated
                                    }
                                  });
                                }}
                                className="mt-1"
                                placeholder="e.g., Listicle"
                                disabled={effectiveUser?.role !== 'admin'}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Description</Label>
                            <Textarea
                              value={framework.description || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { ...updated[index], description: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={2}
                              placeholder="Brief description of this landing page framework..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Content Structure Sequence</Label>
                            <Textarea
                              value={Array.isArray(framework.contentSequence) ? framework.contentSequence.join('\n') : ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { 
                                  ...updated[index], 
                                  contentSequence: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={3}
                              placeholder="1. IMMEDIATE PROBLEM SOLVER - addresses main pain point&#10;2. UNIQUE ADVANTAGE - what makes this different&#10;3. EASE OF USE - how simple/convenient it is"
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Each Reason Structure Format</Label>
                            <Textarea
                              value={Array.isArray(framework.reasonStructure) ? framework.reasonStructure.join('\n') : ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { 
                                  ...updated[index], 
                                  reasonStructure: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={3}
                              placeholder="- CLEAR BENEFIT STATEMENT (10-20 words): Direct, specific value&#10;- BRIEF EXPLANATION (30-60 words): Why this matters, how it works"
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Optimization Rules</Label>
                            <Textarea
                              value={Array.isArray(framework.optimizationRules) ? framework.optimizationRules.join('\n') : ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { 
                                  ...updated[index], 
                                  optimizationRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={3}
                              placeholder="Maximum 100 words per reason section (concise and scannable)&#10;Lead with benefits, support with facts - not the other way around"
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Real Example Patterns to Emulate</Label>
                            <Textarea
                              value={Array.isArray(framework.realExamples) ? framework.realExamples.join('\n') : ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { 
                                  ...updated[index], 
                                  realExamples: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={3}
                              placeholder="Grüns: 'Better Poops (Seriously)' - direct, honest, conversational&#10;Loop: 'Blocks Out The Loudest Tools - 24dB Reduction' - specific benefit + proof"
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">AI System Prompt</Label>
                            <Textarea
                              value={framework.systemPrompt || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { ...updated[index], systemPrompt: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={3}
                              placeholder="Instructions for AI to generate this framework type..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                          
                          <div className="mt-2">
                            <Label className="text-xs text-gray-600">Output Requirements</Label>
                            <Textarea
                              value={framework.outputRequirements || ''}
                              onChange={(e) => {
                                if (effectiveUser?.role !== 'admin') return;
                                const updated = [...(editingConfig.copyFrameworks.landingPageFrameworks || [])];
                                updated[index] = { ...updated[index], outputRequirements: e.target.value };
                                setEditingConfig({
                                  ...editingConfig,
                                  copyFrameworks: {
                                    ...editingConfig.copyFrameworks,
                                    landingPageFrameworks: updated
                                  }
                                });
                              }}
                              className="mt-1"
                              rows={2}
                              placeholder="Expected output format and requirements..."
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Copy Writing Rules Section - Improved UI */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <Label className="text-lg font-semibold text-gray-900">Copy Writing Rules</Label>
              <p className="text-sm text-gray-600 mt-1">Define core copywriting guidelines (one per line)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-medium">📝 Writing Guidelines</p>
          <p className="text-sm text-blue-700 mt-1">
            Set fundamental rules that apply to all copy generation. Each rule should be on its own line for clarity.
          </p>
        </div>

        <Textarea
          value={Array.isArray(editingConfig?.copyFrameworks?.primaryTextRules)
            ? editingConfig.copyFrameworks.primaryTextRules.join('\n')
            : ''}
          onChange={(e) => {
            if (effectiveUser?.role === 'admin') {
              setEditingConfig({
                ...editingConfig,
                copyFrameworks: {
                  ...editingConfig.copyFrameworks,
                  primaryTextRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                }
              });
            }
          }}
          className="mt-1 text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          rows={6}
          placeholder="Headlines: Maximum 5 words, must fit in 1 line on mobile
Primary text: 15-25 words optimal for Meta ads
Keep sentences to 8-12 words for mobile comprehension
Use active voice and direct language
Include clear value propositions
Test emotional triggers and rational benefits"
          disabled={effectiveUser?.role !== 'admin'}
        />
        
        {effectiveUser?.role !== 'admin' && (
          <p className="text-xs text-gray-500 mt-2 italic">Admin access required to edit copy writing rules</p>
        )}
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