import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Target, Copy, Rocket, Loader2 } from 'lucide-react';
import { TrainingConfig } from '@shared/training-config';
import {
  BrandGuidelinesTab,
  ProductClaimsTab,
  PersonasTab,
  CopyFrameworksTab,
  CustomerReviewsTab,
  StationPromptsTab,
  ProductLaunchTab,
  ModelSettingsTab
} from './ai-settings';

interface AISettingsComponentProps {
  editingConfig: TrainingConfig | null;
  setEditingConfig: (config: TrainingConfig | null) => void;
  loadTrainingConfigMutation: any;
  saveTrainingConfigMutation: any;
  saveBrandGuidelinesMutation?: any;
  saveProductClaimsMutation?: any;
  saveModelParametersMutation?: any;
  saveStationPromptsMutation?: any;
  saveCopyFrameworksMutation?: any;
  effectiveUser: any;
  newProductName: string;
  setNewProductName: (name: string) => void;
  expandedProducts: Set<string>;
  setExpandedProducts: (products: Set<string>) => void;
  products: Record<string, any>;
  productClaims: Record<string, any>;
  setProductClaims: (claims: Record<string, any>) => void;
  deleteProductMutation: any;
  reviewStats: any;
  debugInfo: any;
  copyToClipboard: (text: string, type: string) => Promise<void>;
  personas?: Record<string, any>;
  savePersonaPillarsMutation?: any;
  saveSinglePersonaMutation?: any;
  saveSingleProductClaimsMutation?: any;
}

export const AISettingsComponent: React.FC<AISettingsComponentProps> = ({
  editingConfig,
  setEditingConfig,
  loadTrainingConfigMutation,
  saveTrainingConfigMutation,
  saveBrandGuidelinesMutation,
  saveProductClaimsMutation,
  saveModelParametersMutation,
  saveStationPromptsMutation,
  saveCopyFrameworksMutation,
  savePersonaPillarsMutation,
  saveSinglePersonaMutation,
  saveSingleProductClaimsMutation,
  effectiveUser,
  newProductName,
  setNewProductName,
  expandedProducts,
  setExpandedProducts,
  products,
  productClaims,
  setProductClaims,
  deleteProductMutation,
  reviewStats,
  debugInfo,
  copyToClipboard,
  personas
}) => {
  const [activeTab, setActiveTab] = React.useState<string>('brand-guidelines');

  // Track last-saved snapshot to detect unsaved changes by section
  const lastSavedRef = React.useRef<TrainingConfig | null>(null);
  const [baselineVersion, setBaselineVersion] = React.useState<number>(0);

  React.useEffect(() => {
    if (loadTrainingConfigMutation?.isSuccess && editingConfig) {
      lastSavedRef.current = JSON.parse(JSON.stringify(editingConfig));
      setBaselineVersion((v) => v + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrainingConfigMutation?.isSuccess]);

  // Normalize values so '' and whitespace-only strings are treated like undefined and omitted from objects
  // Then perform order-insensitive stringify for comparison
  const normalizeForCompare = (value: unknown): unknown => {
    if (value === null) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    if (Array.isArray(value)) {
      // Do NOT drop items for arrays; normalize each element
      return value.map((item) => normalizeForCompare(item));
    }
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const normalized: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        const nv = normalizeForCompare(obj[key]);
        if (nv !== undefined) {
          normalized[key] = nv;
        }
      }
      return normalized;
    }
    return value;
  };

  const stableStringify = (value: unknown): string => {
    if (value === null || typeof value !== 'object') {
      // JSON.stringify(undefined) returns undefined; coerce to string to make comparisons stable
      const primitive = JSON.stringify(value);
      return primitive === undefined ? 'undefined' : primitive;
    }
    if (Array.isArray(value)) {
      return `[` + value.map((item) => stableStringify(item)).join(',') + `]`;
    }
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
    return `{` + entries.join(',') + `}`;
  };

  const deepEqual = (a: unknown, b: unknown) => {
    try {
      const na = normalizeForCompare(a);
      const nb = normalizeForCompare(b);
      return stableStringify(na) === stableStringify(nb);
    } catch {
      return a === b;
    }
  };

  const sectionDirty = React.useMemo(() => {
    if (!editingConfig || !lastSavedRef.current) {
      return {
        brand: false,
        claims: false,
        personas: false,
        frameworks: false,
        stations: false,
        model: false,
      };
    }
    return {
      brand: !deepEqual(editingConfig.brandGuidelines, lastSavedRef.current.brandGuidelines),
      claims: !deepEqual(editingConfig.productClaims, lastSavedRef.current.productClaims),
      personas: !deepEqual((editingConfig as any).personaPillars, (lastSavedRef.current as any).personaPillars),
      frameworks: !deepEqual(editingConfig.copyFrameworks, lastSavedRef.current.copyFrameworks),
      stations: !deepEqual(editingConfig.stationPrompts, lastSavedRef.current.stationPrompts),
      model: !deepEqual(editingConfig.modelParameters, lastSavedRef.current.modelParameters),
    };
  }, [editingConfig, baselineVersion]);

  const isActiveTabDirty = React.useMemo(() => {
    switch (activeTab) {
      case 'brand-guidelines':
        return sectionDirty.brand;
      case 'product-claims':
        return sectionDirty.claims;
      case 'personas':
        return sectionDirty.personas;
      case 'frameworks':
        return sectionDirty.frameworks;
      case 'station-prompts':
        return sectionDirty.stations;
      case 'model':
        return sectionDirty.model;
      default:
        return false;
    }
  }, [activeTab, sectionDirty]);

  const getIsSaving = () => {
    switch (activeTab) {
      case 'brand-guidelines':
        return !!saveBrandGuidelinesMutation?.isPending;
      case 'product-claims':
        return !!(saveProductClaimsMutation?.isPending || saveSingleProductClaimsMutation?.isPending);
      case 'personas':
        return !!(savePersonaPillarsMutation?.isPending || saveSinglePersonaMutation?.isPending);
      case 'frameworks':
        return !!saveCopyFrameworksMutation?.isPending;
      case 'station-prompts':
        return !!saveStationPromptsMutation?.isPending;
      case 'model':
        return !!saveModelParametersMutation?.isPending;
      default:
        return false;
    }
  };

  const callMutateAsync = async (mutation: any, payload: any) => {
    if (!mutation) return;
    if (typeof mutation.mutateAsync === 'function') {
      return await mutation.mutateAsync(payload);
    }
    return await new Promise((resolve, reject) => {
      try {
        mutation.mutate(payload, { onSuccess: resolve, onError: reject });
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleSaveActiveTab = async () => {
    if (!editingConfig) return;
    switch (activeTab) {
      case 'brand-guidelines':
        await callMutateAsync(saveBrandGuidelinesMutation, editingConfig.brandGuidelines);
        if (lastSavedRef.current) {
          lastSavedRef.current.brandGuidelines = JSON.parse(JSON.stringify(editingConfig.brandGuidelines));
          setBaselineVersion((v) => v + 1);
        }
        break;
      case 'product-claims':
        await callMutateAsync(saveProductClaimsMutation, editingConfig.productClaims);
        if (lastSavedRef.current) {
          lastSavedRef.current.productClaims = JSON.parse(JSON.stringify(editingConfig.productClaims));
          setBaselineVersion((v) => v + 1);
        }
        break;
      case 'personas':
        await callMutateAsync(savePersonaPillarsMutation, (editingConfig as any).personaPillars);
        if (lastSavedRef.current) {
          (lastSavedRef.current as any).personaPillars = JSON.parse(JSON.stringify((editingConfig as any).personaPillars));
          setBaselineVersion((v) => v + 1);
        }
        break;
      case 'frameworks':
        await callMutateAsync(saveCopyFrameworksMutation, editingConfig.copyFrameworks);
        if (lastSavedRef.current) {
          lastSavedRef.current.copyFrameworks = JSON.parse(JSON.stringify(editingConfig.copyFrameworks));
          setBaselineVersion((v) => v + 1);
        }
        break;
      case 'station-prompts':
        await callMutateAsync(saveStationPromptsMutation, editingConfig.stationPrompts);
        if (lastSavedRef.current) {
          lastSavedRef.current.stationPrompts = JSON.parse(JSON.stringify(editingConfig.stationPrompts));
          setBaselineVersion((v) => v + 1);
        }
        break;
      case 'model':
        await callMutateAsync(saveModelParametersMutation, editingConfig.modelParameters);
        if (lastSavedRef.current) {
          lastSavedRef.current.modelParameters = JSON.parse(JSON.stringify(editingConfig.modelParameters));
          setBaselineVersion((v) => v + 1);
        }
        break;
      default:
        break;
    }
  };

  const handleDiscardActiveTab = () => {
    if (!editingConfig || !lastSavedRef.current) return;
    switch (activeTab) {
      case 'brand-guidelines':
        setEditingConfig({
          ...editingConfig,
          brandGuidelines: JSON.parse(JSON.stringify(lastSavedRef.current.brandGuidelines))
        });
        setBaselineVersion((v) => v + 1);
        break;
      case 'product-claims':
        setEditingConfig({
          ...editingConfig,
          productClaims: JSON.parse(JSON.stringify(lastSavedRef.current.productClaims))
        });
        setBaselineVersion((v) => v + 1);
        break;
      case 'personas':
        setEditingConfig({
          ...editingConfig,
          // personaPillars may not be in type; cast to any
          ...(editingConfig as any),
          personaPillars: JSON.parse(JSON.stringify((lastSavedRef.current as any).personaPillars))
        } as any);
        setBaselineVersion((v) => v + 1);
        break;
      case 'frameworks':
        setEditingConfig({
          ...editingConfig,
          copyFrameworks: JSON.parse(JSON.stringify(lastSavedRef.current.copyFrameworks))
        });
        setBaselineVersion((v) => v + 1);
        break;
      case 'station-prompts':
        setEditingConfig({
          ...editingConfig,
          stationPrompts: JSON.parse(JSON.stringify(lastSavedRef.current.stationPrompts))
        });
        setBaselineVersion((v) => v + 1);
        break;
      case 'model':
        setEditingConfig({
          ...editingConfig,
          modelParameters: JSON.parse(JSON.stringify(lastSavedRef.current.modelParameters))
        });
        setBaselineVersion((v) => v + 1);
        break;
      default:
        break;
    }
  };

  // When any section save mutation succeeds (from any source), refresh the baseline for that section
  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveBrandGuidelinesMutation?.isSuccess) {
      lastSavedRef.current.brandGuidelines = JSON.parse(JSON.stringify(editingConfig.brandGuidelines));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveBrandGuidelinesMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveProductClaimsMutation?.isSuccess) {
      lastSavedRef.current.productClaims = JSON.parse(JSON.stringify(editingConfig.productClaims));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveProductClaimsMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveSingleProductClaimsMutation?.isSuccess) {
      lastSavedRef.current.productClaims = JSON.parse(JSON.stringify(editingConfig.productClaims));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveSingleProductClaimsMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (savePersonaPillarsMutation?.isSuccess) {
      (lastSavedRef.current as any).personaPillars = JSON.parse(JSON.stringify((editingConfig as any).personaPillars));
      setBaselineVersion((v) => v + 1);
    }
  }, [savePersonaPillarsMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveSinglePersonaMutation?.isSuccess) {
      (lastSavedRef.current as any).personaPillars = JSON.parse(JSON.stringify((editingConfig as any).personaPillars));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveSinglePersonaMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveCopyFrameworksMutation?.isSuccess) {
      lastSavedRef.current.copyFrameworks = JSON.parse(JSON.stringify(editingConfig.copyFrameworks));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveCopyFrameworksMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveStationPromptsMutation?.isSuccess) {
      lastSavedRef.current.stationPrompts = JSON.parse(JSON.stringify(editingConfig.stationPrompts));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveStationPromptsMutation?.isSuccess, editingConfig]);

  React.useEffect(() => {
    if (!editingConfig || !lastSavedRef.current) return;
    if (saveModelParametersMutation?.isSuccess) {
      lastSavedRef.current.modelParameters = JSON.parse(JSON.stringify(editingConfig.modelParameters));
      setBaselineVersion((v) => v + 1);
    }
  }, [saveModelParametersMutation?.isSuccess, editingConfig]);
  return (
    <>
     {isActiveTabDirty && (
       <div className="fixed top-0 left-0 right-0 z-50 bg-jones-light border-b border-jones-secondary shadow-sm pointer-events-none">
         <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between pointer-events-auto gap-3">
           <span className="text-sm text-jones-accent">You have unsaved changes in this tab</span>
           <div className="flex items-center gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={handleDiscardActiveTab}
               disabled={getIsSaving()}
               className="border-jones-secondary text-jones-accent hover:bg-jones-light"
             >
               Discard
             </Button>
             <Button
               size="sm"
               onClick={handleSaveActiveTab}
               disabled={getIsSaving()}
               className="bg-jones-primary hover:bg-jones-secondary text-white"
             >
               {getIsSaving() ? 'Saving…' : 'Save Changes'}
             </Button>
           </div>
         </div>
       </div>
     )}

     {isActiveTabDirty && <div className="h-12" />}

     <div className="space-y-6">
                {/* Training Configuration Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4 mb-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Settings className="text-jones-primary mr-3" size={20} />
                        AI Training Configuration
                      </h3>
                       {/* Global saving handled by sticky bar; removed inline Save Changes */}
                    </div>

                    {editingConfig ? (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 p-2 h-auto">
                          <TabsTrigger value="brand-guidelines" className="text-xs sm:text-sm py-2 px-3">Brand Guidelines</TabsTrigger>
                          <TabsTrigger value="product-claims" className="text-xs sm:text-sm py-2 px-3">Product Claims</TabsTrigger>
                          <TabsTrigger value="personas" className="text-xs sm:text-sm py-2 px-3">Personas</TabsTrigger>
                          <TabsTrigger value="frameworks" className="text-xs sm:text-sm py-2 px-3">Copy Frameworks</TabsTrigger>
                          <TabsTrigger value="station-prompts" className="text-xs sm:text-sm py-2 px-3">Station Prompts</TabsTrigger>
                          <TabsTrigger value="product-launch" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1">
                            <Rocket size={14} />
                            <span>Product Launch</span>
                          </TabsTrigger>
                          <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 px-3">Customer Reviews</TabsTrigger>
                          <TabsTrigger value="model" className="text-xs sm:text-sm py-2 px-3">Model Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="brand-guidelines" className="mt-4">
                          <BrandGuidelinesTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
                            onSaveBrandGuidelines={(bg) => saveBrandGuidelinesMutation?.mutate(bg)}
                          />
                        </TabsContent>

                        <TabsContent value="product-claims" className="mt-4">
                          <ProductClaimsTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
                            newProductName={newProductName}
                            setNewProductName={setNewProductName}
                            expandedProducts={expandedProducts}
                            setExpandedProducts={setExpandedProducts}
                            products={products}
                            productClaims={productClaims}
                            setProductClaims={setProductClaims}
                            deleteProductMutation={deleteProductMutation}
                            onSaveProductClaims={(pc) => saveProductClaimsMutation?.mutate(pc)}
                            onSaveSingleProductClaims={({ productKey, productData }) => saveSingleProductClaimsMutation?.mutate({ productKey, productData })}
                          />
                        </TabsContent>

                        <TabsContent value="personas" className="mt-4">
                          <PersonasTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
                            personas={personas}
                            onSavePersonaPillars={(pp) => savePersonaPillarsMutation?.mutate(pp)}
                            onSaveSinglePersona={({ personaName, personaData }) => saveSinglePersonaMutation?.mutate({ personaName, personaData })}
                          />
                        </TabsContent>

                        <TabsContent value="frameworks" className="mt-4">
                          <CopyFrameworksTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
                            onSaveCopyFrameworks={(cf) => saveCopyFrameworksMutation?.mutate(cf)}
                          />
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-4">
                          <CustomerReviewsTab
                            effectiveUser={effectiveUser}
                            reviewStats={reviewStats}
                            products={products}
                          />
                        </TabsContent>

                        <TabsContent value="station-prompts" className="mt-4">
                          <StationPromptsTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
                            onSaveStationPrompts={(sp) => saveStationPromptsMutation?.mutate(sp)}
                          />
                        </TabsContent>

                        <TabsContent value="product-launch" className="mt-4">
                          <ProductLaunchTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                          />
                        </TabsContent>

                        <TabsContent value="model" className="mt-4">
                          <ModelSettingsTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            onSaveModelParameters={(mp) => saveModelParametersMutation?.mutate(mp)}
                          />
                        </TabsContent>
                      </Tabs>
                    ) : loadTrainingConfigMutation.isPending ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
                        <p className="text-lg font-medium text-gray-700">Loading configuration...</p>
                        <p className="text-sm mt-2">Please wait while we fetch your AI training settings</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Settings size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-700">Configuration will load automatically after admin access</p>
                        <p className="text-sm mt-2">This includes brand guidelines, copy frameworks, prompts, and model parameters</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Debug Information Section */}
                {/* <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="text-jones-primary mr-3" size={20} />
                      Prompt Debug Information
                    </h3>

                    {debugInfo ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Request Payload</h4>
                          <div className="bg-gray-50 rounded-lg p-4 border">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(debugInfo.requestPayload, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">System Prompt</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(debugInfo.systemPrompt, 'system-prompt')}
                            >
                              <Copy size={16} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {debugInfo.systemPrompt}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">User Prompt</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(debugInfo.userPrompt, 'user-prompt')}
                            >
                              <Copy size={16} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200 max-h-64 overflow-y-auto">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {debugInfo.userPrompt}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Raw AI Response</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(debugInfo.rawResponse, 'raw-response')}
                            >
                              <Copy size={16} className="mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 max-h-64 overflow-y-auto">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {debugInfo.rawResponse}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Generate ad copy to see debug information</p>
                        <p className="text-sm mt-2">This will show the exact prompts, payloads, and responses sent to Claude AI</p>
                      </div>
                    )}
                  </CardContent>
                </Card> */}
              </div>
    </>
  );
}; 