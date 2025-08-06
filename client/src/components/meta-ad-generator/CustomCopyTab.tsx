import React, { useRef, useState } from 'react';
import { Brain, Sparkles, Copy, FileText, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductSelection } from '@/components/ProductSelection';
import { Product } from '@shared/schema';
import { UseMutationResult } from '@tanstack/react-query';

interface Persona {
  label: string;
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
  selectedProducts: string[];
  setSelectedProducts: (value: string[]) => void;
  brandDrBalance: number[];
  setBrandDrBalance: (value: number[]) => void;
  
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
  debugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
  customRequestDebugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
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
  selectedProducts,
  setSelectedProducts,
  brandDrBalance,
  setBrandDrBalance,
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
  debugInfo,
  customRequestDebugInfo,
}: CustomCopyTabProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Product Context (Multi-Select)</Label>
                  <p className="text-xs text-gray-500 mb-4">
                    Select products to mention in your custom copy. Multiple products can be selected for comprehensive copy generation.
                  </p>

                  {/* Quick Select - Top Products */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-medium text-gray-600">Quick Select - Popular Products</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-800 h-auto p-1"
                        onClick={() => {
                          const topProducts = ['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'];
                          const allTopSelected = topProducts.every(product => selectedProducts.includes(product));
                          
                          if (allTopSelected) {
                            // Deselect all top products
                            setSelectedProducts(selectedProducts.filter(p => !topProducts.includes(p)));
                          } else {
                            // Select all top products
                            const newSelection = [...new Set([...selectedProducts, ...topProducts])];
                            setSelectedProducts(newSelection);
                          }
                        }}
                      >
                        {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].every(product => selectedProducts.includes(product)) ? 'Deselect Top 5' : 'Select Top 5'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].map((productName) => {
                        const product = products.find(p => p.name === productName);
                        if (!product) return null;
                        
                        const isSelected = selectedProducts.includes(productName);
                        return (
                          <button
                            key={productName}
                            onClick={() => {
                              if (selectedProducts.includes(productName)) {
                                setSelectedProducts(selectedProducts.filter(p => p !== productName));
                              } else {
                                setSelectedProducts([...selectedProducts, productName]);
                              }
                            }}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-blue-500 text-white border-2 border-blue-500 shadow-sm'
                                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${
                              isSelected ? 'bg-white' : 'bg-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-2 h-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            {product.displayName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* All Products - Dropdown */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-xs font-medium text-gray-600">All Products</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1 h-auto border-dashed hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                        onClick={() => {
                          const allProductNames = products.map(product => product.name);
                          if (selectedProducts.length === allProductNames.length) {
                            setSelectedProducts([]);
                          } else {
                            setSelectedProducts(allProductNames);
                          }
                        }}
                      >
                        {selectedProducts.length === products.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>

                    {/* Multi-Select Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left font-normal"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
                      >
                        <span className="text-sm">
                          {(() => {
                            if (selectedProducts.length === 0) {
                              return "Choose products...";
                            } else if (selectedProducts.length === 1) {
                              return products.find(p => p.name === selectedProducts[0])?.displayName || selectedProducts[0];
                            } else {
                              return `${selectedProducts.length} products selected`;
                            }
                          })()}
                        </span>
                        <svg className={`w-4 h-4 opacity-50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {/* Popular Products Section */}
                          <div className="border-b border-gray-100 bg-blue-50 px-3 py-2">
                            <div className="text-xs font-semibold text-blue-800 mb-2">★ Popular Products</div>
                            {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].map((productName) => {
                              const product = products.find(p => p.name === productName);
                              if (!product) return null;
                              
                              const isSelected = selectedProducts.includes(productName);
                              return (
                                <div
                                  key={productName}
                                  className="flex items-center px-1 py-1.5 hover:bg-blue-100 cursor-pointer rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedProducts.includes(productName)) {
                                      setSelectedProducts(selectedProducts.filter(p => p !== productName));
                                    } else {
                                      setSelectedProducts([...selectedProducts, productName]);
                                    }
                                  }}
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                                    isSelected 
                                      ? 'bg-blue-500 border-blue-500' 
                                      : 'border-blue-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-blue-900">{product.displayName}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* All Other Products */}
                          <div className="px-3 py-2">
                            <div className="text-xs font-semibold text-gray-600 mb-2">All Products</div>
                            {products
                              .filter(product => !['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].includes(product.name))
                              .map((product) => {
                                const isSelected = selectedProducts.includes(product.name);
                                return (
                                  <div
                                    key={product.name}
                                    className="flex items-center px-1 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (selectedProducts.includes(product.name)) {
                                        setSelectedProducts(selectedProducts.filter(p => p !== product.name));
                                      } else {
                                        setSelectedProducts([...selectedProducts, product.name]);
                                      }
                                    }}
                                  >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                                      isSelected 
                                        ? 'bg-blue-500 border-blue-500' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{product.displayName}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Products Summary */}
                  {selectedProducts.length > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-blue-900">
                            {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''} Selected
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 h-6 px-2"
                          onClick={() => setSelectedProducts([])}
                        >
                          Clear all
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((productName) => {
                          const product = products.find(p => p.name === productName);
                          const productLabel = product?.displayName || productName;
                          return (
                            <Badge 
                              key={productName} 
                              variant="secondary" 
                              className="text-xs bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                              {productLabel}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedProducts.length === 0 && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">
                          No products selected - AI will generate general copy without specific product focus
                        </p>
                      </div>
                    </div>
                  )}
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
        {generateCustomCopyMutation.isPending ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                Generating Custom Copy
              </h3>
              
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-2">Processing Your Request</p>
                <p className="text-sm text-gray-500">
                  Creating custom copy tailored to your specific requirements and brand guidelines...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : generatedCustomResponse && (
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
                        systemPrompt: customRequestDebugInfo?.systemPrompt || stationPrompts?.customRequest?.systemPrompt || 'Expert marketing copywriter for Jones Road Beauty...',
                        userPrompt: customRequestDebugInfo?.userPrompt || `Request: ${customRequest}\nAudience: ${concept}`,
                        requestPayload: customRequestDebugInfo?.requestPayload,
                        rawResponse: customRequestDebugInfo?.rawResponse
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