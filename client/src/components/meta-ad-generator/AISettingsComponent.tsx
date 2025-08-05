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
} from './AISettings';

interface AISettingsComponentProps {
  editingConfig: TrainingConfig | null;
  setEditingConfig: (config: TrainingConfig | null) => void;
  loadTrainingConfigMutation: any;
  saveTrainingConfigMutation: any;
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
}

export const AISettingsComponent: React.FC<AISettingsComponentProps> = ({
  editingConfig,
  setEditingConfig,
  loadTrainingConfigMutation,
  saveTrainingConfigMutation,
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
  copyToClipboard
}) => {
  return (
    <>
     <div className="space-y-6">
                {/* Training Configuration Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4 mb-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Settings className="text-jones-primary mr-3" size={20} />
                        AI Training Configuration
                      </h3>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        {editingConfig && (
                          <Button
                            onClick={() => saveTrainingConfigMutation.mutate(editingConfig)}
                            disabled={saveTrainingConfigMutation.isPending}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {saveTrainingConfigMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingConfig ? (
                      <Tabs defaultValue="brand-guidelines" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 p-2 h-auto">
                          <TabsTrigger value="brand-guidelines" className="text-xs sm:text-sm py-2 px-3">Brand Guidelines</TabsTrigger>
                          <TabsTrigger value="product-claims" className="text-xs sm:text-sm py-2 px-3">Product Claims</TabsTrigger>
                          <TabsTrigger value="personas" className="text-xs sm:text-sm py-2 px-3">Personas</TabsTrigger>
                          <TabsTrigger value="frameworks" className="text-xs sm:text-sm py-2 px-3">Copy Frameworks</TabsTrigger>
                          <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 px-3">Customer Reviews</TabsTrigger>
                          <TabsTrigger value="station-prompts" className="text-xs sm:text-sm py-2 px-3">Station Prompts</TabsTrigger>
                          <TabsTrigger value="product-launch" className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1">
                            <Rocket size={14} />
                            <span>Product Launch</span>
                          </TabsTrigger>
                          <TabsTrigger value="model" className="text-xs sm:text-sm py-2 px-3">Model Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="brand-guidelines" className="mt-4">
                          <BrandGuidelinesTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
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
                          />
                        </TabsContent>

                        <TabsContent value="personas" className="mt-4">
                          <PersonasTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
                          />
                        </TabsContent>

                        <TabsContent value="frameworks" className="mt-4">
                          <CopyFrameworksTab
                            editingConfig={editingConfig}
                            setEditingConfig={setEditingConfig}
                            effectiveUser={effectiveUser}
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
                        <p>Load configuration to view and edit AI training settings</p>
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