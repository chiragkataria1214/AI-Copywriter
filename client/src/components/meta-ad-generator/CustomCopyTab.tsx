import React from 'react';
import { Brain, Sparkles, Copy, FileText, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductSelection } from '@/components/ProductSelection';
import { Product } from '@shared/schema';
import { UseMutationResult } from '@tanstack/react-query';

interface SubPersona {
  label: string;
}

interface Persona {
  label: string;
  subPersonas?: Record<string, SubPersona>;
}

interface CustomCopyTabProps {
  // State variables
  customRequest: string;
  setCustomRequest: (value: string) => void;
  generatedCustomResponse: string;
  customRequestHistory: Array<{
    request: string;
    response: string;
    timestamp: Date;
  }>;
  concept: string;
  setConcept: (value: string) => void;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  brandDrBalance: number[];
  setBrandDrBalance: (value: number[]) => void;
  subPersona: string;
  
  // Data
  personas: Record<string, Persona>;
  products: Product[];
  
  // Functions
  generateCustomCopyMutation: UseMutationResult<any, Error, void, unknown>;
  getGenerationDisabledState: (stationType: 'customRequest') => { disabled: boolean; reason: string };
  copyToClipboard: (text: string, type: string) => Promise<void>;
  setSelectedItemForRevision: (value: { type: "headline" | "primaryText" | "landingCopy" | "custom" | "retention"; index?: number; field?: string } | null) => void;
  setShowRevisionPanel: (value: boolean) => void;
  setCurrentGenerationMetadata: (metadata: any) => void;
  setShowGenerationDetails: (value: boolean) => void;
  
  // Settings data
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stationPrompts?: {
    customRequest?: {
      systemPrompt?: string;
    };
  };
  brandGuidelines?: {
    guidelines?: string[];
  };
  copyFrameworks?: {
    customRequest?: {
      frameworks?: string[];
    };
  };
}

export function CustomCopyTab({
  customRequest,
  setCustomRequest,
  generatedCustomResponse,
  customRequestHistory,
  concept,
  setConcept,
  selectedProduct,
  setSelectedProduct,
  brandDrBalance,
  setBrandDrBalance,
  subPersona,
  personas,
  products,
  generateCustomCopyMutation,
  getGenerationDisabledState,
  copyToClipboard,
  setSelectedItemForRevision,
  setShowRevisionPanel,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  modelSettings,
  stationPrompts,
  brandGuidelines,
  copyFrameworks,
}: CustomCopyTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Section */}
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Custom Copy Request
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you need
                </Label>
                <Textarea
                  placeholder="Example: Write a product announcement for our new mascara launch targeting busy moms, or create social media captions for a limited-time promotion, or write email subject lines for our newsletter..."
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Be as specific as possible about format, persona, tone, and purpose
                </p>
              </div>

              {/* Basic Settings */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Audience</Label>
                  <Select value={concept} onValueChange={setConcept}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(personas).length > 0 ? (
                        Object.entries(personas).map(([key, persona]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            {persona.label || key}
                          </SelectItem>
                        ))
                      ) : (
                        // Fallback to hardcoded options if personas haven't loaded yet
                        <>
                          <SelectItem value="lifeJuggler">Life Juggler</SelectItem>
                          <SelectItem value="cleanBeautyEnthusiast">Clean Beauty Enthusiast</SelectItem>
                          <SelectItem value="timeConstrainedProfessional">Time-Constrained Professional</SelectItem>
                          <SelectItem value="naturalBeautySeeker">Natural Beauty Seeker</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Product Context</Label>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">
                        Quick Select - Popular Products
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        Choose from our most frequently featured products for custom copy generation
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].map((productName) => {
                          const product = products.find(p => p.name === productName);
                          if (!product) return null;
                          
                          const isSelected = selectedProduct === productName;
                          return (
                            <button
                              key={productName}
                              onClick={() => setSelectedProduct(isSelected ? '' : productName)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                isSelected
                                  ? 'bg-[#004182] text-white border-2 border-[#004182] shadow-sm'
                                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#004182] hover:bg-blue-50'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${
                                isSelected ? 'bg-white' : 'bg-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-2 h-2 text-[#004182]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              {product.displayName}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            Or choose from all products
                          </Label>
                          <Select value={selectedProduct || "all"} onValueChange={(value) => setSelectedProduct(value === "all" ? "" : value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="All products (no filtering)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All products</SelectItem>
                              {products.map((product) => (
                                <SelectItem key={product.name} value={product.name}>
                                  {product.displayName || product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedProduct && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-[#004182] rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-[#004182]">
                              Selected: {products.find(p => p.name === selectedProduct)?.displayName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Brand/DR Balance: {brandDrBalance[0]}% Brand
                  </Label>
                  <Slider
                    value={brandDrBalance}
                    onValueChange={setBrandDrBalance}
                    max={100}
                    step={10}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Direct Response</span>
                    <span>Brand Focused</span>
                  </div>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        onClick={() => generateCustomCopyMutation.mutate()}
                        disabled={!customRequest.trim() || generateCustomCopyMutation.isPending || getGenerationDisabledState('customRequest').disabled}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        {generateCustomCopyMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Brain size={16} />
                            <span>Generate Custom Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {(getGenerationDisabledState('customRequest').disabled || !customRequest.trim()) && (
                    <TooltipContent>
                      <p>
                        {!customRequest.trim()
                          ? 'Please enter a custom request'
                          : getGenerationDisabledState('customRequest').reason
                        }
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <div className="space-y-4 sm:space-y-6">
        {generatedCustomResponse && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  Generated Copy
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItemForRevision({ type: 'custom' });
                      setShowRevisionPanel(true);
                    }}
                    className="flex items-center space-x-1"
                  >
                    <Sparkles size={14} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCustomResponse, 'custom')}
                    className="flex items-center space-x-1"
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentGenerationMetadata({
                        stationName: 'Custom Request',
                        timestamp: new Date().toISOString(),
                        modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                        temperature: modelSettings?.temperature || 0.7,
                        maxTokens: modelSettings?.maxTokens || 2000,
                        systemPrompt: stationPrompts?.customRequest?.systemPrompt || 'Expert marketing copywriter for Jones Road Beauty...',
                        userPrompt: `Request: ${customRequest}\nAudience: ${concept}...`,
                        brandGuidelines: brandGuidelines?.guidelines || ['Educational tone', 'Make up, Simplified philosophy', 'Authentic messaging'],
                        frameworks: copyFrameworks?.customRequest?.frameworks || ['Flexible copywriting', 'Brand consistency', 'Strategic messaging'],
                        personaSettings: {
                          concept: concept,
                          subPersona: subPersona === 'none' ? undefined : subPersona
                        },
                        brandDrBalance: brandDrBalance[0],
                        selectedProduct: selectedProduct
                      });
                      setShowGenerationDetails(true);
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Settings size={12} />
                    <span>View Details</span>
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {generatedCustomResponse}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        {customRequestHistory.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                Recent Requests
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {customRequestHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {item.timestamp.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Request: {item.request.substring(0, 100)}
                      {item.request.length > 100 && '...'}
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {item.response.substring(0, 200)}
                      {item.response.length > 200 && '...'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.response, 'custom')}
                      className="mt-2 flex items-center space-x-1"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 