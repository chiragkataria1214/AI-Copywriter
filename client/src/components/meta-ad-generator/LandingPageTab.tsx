import React, { useState, useEffect, useRef } from 'react';
import { FileText, List, Target, Sparkles, Users, Settings, Globe, Check, Copy, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface LandingPageFramework {
  id: string;
  name: string;
  displayName: string;
  description: string;
  contentSequence: string[];
  reasonStructure: string[];
  optimizationRules: string[];
  realExamples: string[];
  systemPrompt: string;
  outputRequirements: string;
  images?: any[];
  isActive: string;
  sortOrder: number;
}

interface LandingPageTabProps {
  // Landing Page States
  landingPageType: string;
  setLandingPageType: (value: string) => void;
  useAdsForLanding: boolean;
  setUseAdsForLanding: (value: boolean) => void;
  productBrief: string;
  setProductBrief: (value: string) => void;
  mainAngle: string;
  setMainAngle: (value: string) => void;
  generatedLandingCopy: {
    headline: string;
    subheadline: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    socialProof: string;
    riskReversal: string;
    conclusion: string;
    cta: string;
  };
  setGeneratedLandingCopy: (value: any) => void;
  landingPageAnalysis: {
    headlineLength: string;
    conversionScore: number;
    readabilityScore: string;
    totalWords: number;
    sectionCount: number;
    avgSectionLength: number;
    hasRiskReversal: boolean;
    productSpecific: boolean;
  } | null;
  copiedLandingCopy: boolean;

  // Persona States
  concept: string;
  setConcept: (value: string) => void;
  personas: Record<string, any>;

  // Brand States
  useJonesBrandGuide: boolean;
  setUseJonesBrandGuide: (value: boolean) => void;
  brandDrBalance: number[];
  setBrandDrBalance: (value: number[]) => void;
  getBrandDrLabel: () => string;

  // Product States
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  selectedProducts: string[];
  setSelectedProducts: (value: string[]) => void;
  products: Record<string, any>;

  // Generated Ad States
  generatedHeadlines: Array<{ framework: string; copy: string }>;
  generatedPrimaryText: string;
  selectedHeadlineIndex: number;
  setSelectedHeadlineIndex: (value: number) => void;

  // Functions
  generateAdCopy: () => void;
  generateLandingCopyMutation: any;
  getGenerationDisabledState: (stationType: 'adCopy' | 'landingPage' | 'customRequest' | 'emailSmsRetention' | 'staticAd') => { disabled: boolean; reason: string };
  copyToClipboard: (text: string, type: string) => Promise<void>;

  // Revision States
  setSelectedItemForRevision: (value: any) => void;
  setShowRevisionPanel: (value: boolean) => void;

  // Generation Details
  setCurrentGenerationMetadata: (value: any) => void;
  setShowGenerationDetails: (value: boolean) => void;
  modelSettings: any;
  stationPrompts: any;
  brandGuidelines: any;
  copyFrameworks: any;
  debugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
  landingPageDebugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
}

export const LandingPageTab: React.FC<LandingPageTabProps> = ({
  landingPageType,
  setLandingPageType,
  useAdsForLanding,
  setUseAdsForLanding,
  productBrief,
  setProductBrief,
  mainAngle,
  setMainAngle,
  generatedLandingCopy,
  landingPageAnalysis,
  copiedLandingCopy,
  concept,
  setConcept,
  personas,
  useJonesBrandGuide,
  setUseJonesBrandGuide,
  brandDrBalance,
  setBrandDrBalance,
  getBrandDrLabel,
  selectedProduct,
  setSelectedProduct,
  selectedProducts,
  setSelectedProducts,
  products,
  generatedHeadlines,
  generatedPrimaryText,
  selectedHeadlineIndex,
  setSelectedHeadlineIndex,
  generateAdCopy,
  generateLandingCopyMutation,
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
  landingPageDebugInfo,
}) => {
  const [landingPageFrameworks, setLandingPageFrameworks] = useState<LandingPageFramework[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
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

  // Load landing page frameworks on component mount
  useEffect(() => {
    const loadLandingPageFrameworks = async () => {
      setLoadingFrameworks(true);
      try {
        const response = await apiRequest('/api/landing-page-frameworks/active');
        setLandingPageFrameworks(response || []);
      } catch (error) {
        console.error('Failed to load landing page frameworks:', error);
        // Fallback to default frameworks if API fails
        setLandingPageFrameworks([
          {
            id: '1',
            name: 'listicle',
            displayName: 'Listicle',
            description: 'List-based content with numbered benefits',
            contentSequence: [],
            reasonStructure: [],
            optimizationRules: [],
            realExamples: [],
            systemPrompt: '',
            outputRequirements: '',
            isActive: 'true',
            sortOrder: 0
          },
          {
            id: '2',
            name: 'trojan_horse',
            displayName: 'Trojan Horse',
            description: 'Story-driven approach connecting to benefits',
            contentSequence: [],
            reasonStructure: [],
            optimizationRules: [],
            realExamples: [],
            systemPrompt: '',
            outputRequirements: '',
            isActive: 'true',
            sortOrder: 1
          },
          {
            id: '3',
            name: 'multi_product',
            displayName: 'Multi Product Page',
            description: 'Showcase multiple products with cross-selling',
            contentSequence: [],
            reasonStructure: [],
            optimizationRules: [],
            realExamples: [],
            systemPrompt: '',
            outputRequirements: '',
            isActive: 'true',
            sortOrder: 2
          }
        ]);
      } finally {
        setLoadingFrameworks(false);
      }
    };

    loadLandingPageFrameworks();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Section */}
      <div className="space-y-4 sm:space-y-6">
        {/* Landing Page Type Selection */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Landing Page Type
            </h3>

            {loadingFrameworks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jones-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading framework options...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {landingPageFrameworks.map((framework) => {
                  const isSelected = landingPageType === framework.name;
                  const getFrameworkIcon = (name: string) => {
                    switch (name) {
                      case 'listicle':
                        return List;
                      case 'trojan_horse':
                        return Target;
                      case 'multi_product':
                        return Sparkles;
                      default:
                        return FileText;
                    }
                  };
                  
                  const IconComponent = getFrameworkIcon(framework.name);
                  
                  return (
                    <div
                      key={framework.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-jones-primary bg-jones-light'
                          : 'border-gray-300 hover:border-jones-primary'
                      }`}
                      onClick={() => setLandingPageType(framework.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent 
                          className={isSelected ? 'text-jones-primary' : 'text-gray-400'} 
                          size={24} 
                        />
                        <div className={`w-4 h-4 border-2 rounded-full ${
                          isSelected
                            ? 'border-jones-primary bg-jones-primary'
                            : 'border-gray-300'
                        }`}></div>
                      </div>
                      <h4 className="font-semibold text-gray-900">{framework.displayName}</h4>
                      <p className="text-xs text-gray-500 mt-1">{framework.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Persona Selection */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Target Persona
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-2">Primary Persona</Label>
                <Select value={concept} onValueChange={setConcept}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(personas).map(([key, persona]) => (
                      <SelectItem key={key} value={key}>{(persona as any).label || key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


            </div>
          </CardContent>
        </Card>

        {/* Brand Guidelines */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="text-jones-primary mr-3" size={20} />
              Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Use Jones Brand Guide</Label>
                  <p className="text-xs text-gray-500">Apply Jones Road Beauty brand voice and guidelines</p>
                </div>
                <Switch checked={useJonesBrandGuide} onCheckedChange={setUseJonesBrandGuide} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">Brand/DR Balance</Label>
                  <span className="text-sm text-gray-500">{getBrandDrLabel()}</span>
                </div>
                <Slider
                  value={brandDrBalance}
                  onValueChange={setBrandDrBalance}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>All DR</span>
                  <span>Balanced</span>
                  <span>All Brand</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Product Focus (Multi-Select)
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 mb-4">
                Select products to feature in your landing page. Multiple products can be selected for comprehensive landing page copy.
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
                    const product = products[productName];
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
                      const allProductNames = Object.keys(products);
                      if (selectedProducts.length === allProductNames.length) {
                        setSelectedProducts([]);
                      } else {
                        setSelectedProducts(allProductNames);
                      }
                    }}
                  >
                    {selectedProducts.length === Object.keys(products).length ? "Deselect All" : "Select All"}
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
                          return products[selectedProducts[0]]?.displayName || selectedProducts[0];
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
                          const product = products[productName];
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
                        {Object.entries(products)
                          .filter(([productName]) => !['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].includes(productName))
                          .map(([productName, product]) => {
                            const isSelected = selectedProducts.includes(productName);
                            return (
                              <div
                                key={productName}
                                className="flex items-center px-1 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
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
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm">{(product as any).displayName}</span>
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
                      const product = products[productName];
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
                      No products selected - AI will generate general landing page copy without specific product focus
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Angle */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Main Angle
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="mainAngle" className="block text-sm font-medium text-gray-700 mb-2">
                  Landing Page Hook
                </Label>
                <Textarea
                  id="mainAngle"
                  rows={3}
                  className="w-full resize-none text-sm"
                  placeholder="What's the main hook or angle? (e.g., 'Perfect for busy moms', 'The 5-minute glow', 'Anne's personal favorites')"
                  value={mainAngle}
                  onChange={(e) => setMainAngle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The primary messaging angle that drives the entire landing page story
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Brief */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Product Brief
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="productBrief" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Details
                </Label>
                <Textarea
                  id="productBrief"
                  rows={5}
                  className="w-full resize-none text-sm"
                  placeholder="Describe your product, its benefits, target persona, and key selling points..."
                  value={productBrief}
                  onChange={(e) => setProductBrief(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include product features, benefits, target persona, and unique selling points for better landing page copy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Source */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Content Source
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Use Generated Ads Content {useAdsForLanding ? '(ON)' : '(OFF)'}
                  </Label>
                  <p className="text-xs text-gray-500">Use the ad copy generated in the previous tab</p>
                </div>
                <Switch
                  checked={useAdsForLanding}
                  onCheckedChange={(checked) => {
                    console.log('Toggle clicked, new value:', checked);
                    setUseAdsForLanding(checked);
                  }}
                />
              </div>

              {useAdsForLanding && generatedHeadlines.length > 0 && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-gray-700">
                    Select Your Chosen Ad Copy (for training alignment)
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose which headline and primary text you're using so the landing page aligns with your ad approach
                  </p>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">Chosen Headline</Label>
                      <Select value={selectedHeadlineIndex.toString()} onValueChange={(value) => setSelectedHeadlineIndex(parseInt(value))}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {generatedHeadlines.map((headline, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium text-sm">{headline.framework}</span>
                                <span className="text-xs text-gray-500">{headline.copy}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {generatedPrimaryText && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-2 block">Primary Text Preview</Label>
                        <div className="p-3 bg-white rounded border text-sm text-gray-700">
                          {generatedPrimaryText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  onClick={generateAdCopy}
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: '#004182' }}
                  disabled={generateLandingCopyMutation.isPending || getGenerationDisabledState('landingPage').disabled}
                >
                  {generateLandingCopyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={16} />
                      Generate Landing Page Copy
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {getGenerationDisabledState('landingPage').disabled && (
              <TooltipContent>
                <p>{getGenerationDisabledState('landingPage').reason}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Results Section */}
      <div className="space-y-4 sm:space-y-6">
        {/* Generated Landing Page Copy */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                Generated Landing Page
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(generatedLandingCopy, null, 2), 'landing')}
                disabled={!generatedLandingCopy.headline}
                className="w-full sm:w-auto"
              >
                {copiedLandingCopy ? <Check size={16} /> : <Copy size={16} />}
                <span className="ml-1">{copiedLandingCopy ? 'Copied' : 'Copy All'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!generatedLandingCopy.headline}
                onClick={() => {
                  setCurrentGenerationMetadata({
                    stationName: 'Landing Page',
                    timestamp: new Date().toISOString(),
                    modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                    temperature: modelSettings?.temperature || 0.7,
                    maxTokens: modelSettings?.maxTokens || 2000,
                    systemPrompt: landingPageDebugInfo?.systemPrompt || stationPrompts?.landingPage?.systemPrompt || 'Expert landing page copywriter specializing in Jones Road Beauty conversions...',
                    userPrompt: landingPageDebugInfo?.userPrompt || `Type: ${landingPageType}\nProduct Brief: ${productBrief}\nMain Angle: ${mainAngle}`,
                    requestPayload: landingPageDebugInfo?.requestPayload,
                    rawResponse: landingPageDebugInfo?.rawResponse
                  });
                  setShowGenerationDetails(true);
                }}
                className="flex items-center space-x-1 text-xs"
              >
                <Settings size={12} />
                <span>View Details</span>
              </Button>
            </div>

            {generateLandingCopyMutation.isPending ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-2">Generating Landing Page Copy</p>
                <p className="text-sm text-gray-500">
                  Creating high-converting landing page sections optimized for your product and audience...
                </p>
              </div>
            ) : generatedLandingCopy.headline ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="border-l-4 border-jones-primary pl-3 sm:pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Headline</h4>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{generatedLandingCopy.headline}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={() => {
                        setSelectedItemForRevision({ type: 'landingCopy', field: 'headline' });
                        setShowRevisionPanel(true);
                      }}
                      title="Suggest improvements"
                    >
                      <Target size={14} />
                    </Button>
                  </div>
                </div>

                <div className="border-l-4 border-gray-300 pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Introduction</h4>
                      <p className="text-gray-700">{generatedLandingCopy.introduction}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={() => {
                        setSelectedItemForRevision({ type: 'landingCopy', field: 'introduction' });
                        setShowRevisionPanel(true);
                      }}
                      title="Suggest improvements"
                    >
                      <Target size={14} />
                    </Button>
                  </div>
                </div>

                {generatedLandingCopy.sections.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      Strategic Reasons
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {generatedLandingCopy.sections.length}/5
                      </Badge>
                    </h4>

                    {generatedLandingCopy.sections.map((section, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <h5 className="font-medium text-gray-900">{section.title}</h5>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {section.content}
                            </div>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                              <Badge variant="outline" className="text-xs">
                                {(section as any)?.wordCount || section.content.split(/\s+/).length} words
                              </Badge>
                              {(section as any)?.hook && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800">
                                  Hook ✓
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                            onClick={() => {
                              setSelectedItemForRevision({ type: 'landingCopy', field: `section-${index}` });
                              setShowRevisionPanel(true);
                            }}
                            title="Suggest improvements"
                          >
                            <Target size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {generatedLandingCopy.riskReversal && (
                  <div className="border-l-4 border-orange-500 pl-4 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Risk Reversal</h4>
                        <p className="text-gray-700">{generatedLandingCopy.riskReversal}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        onClick={() => {
                          setSelectedItemForRevision({ type: 'landingCopy', field: 'riskReversal' });
                          setShowRevisionPanel(true);
                        }}
                        title="Suggest improvements"
                      >
                        <Target size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-l-4 border-green-500 pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Call-to-Action</h4>
                      <p className="text-lg font-medium text-green-700">{generatedLandingCopy.cta}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={() => {
                        setSelectedItemForRevision({ type: 'landingCopy', field: 'cta' });
                        setShowRevisionPanel(true);
                      }}
                      title="Suggest improvements"
                    >
                      <Target size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No landing page copy generated yet. Click "Generate Landing Page Copy" to create content.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Copy Performance Analysis */}
        {landingPageAnalysis && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="text-jones-primary mr-3" size={20} />
                Performance Analysis
              </h3>

              <div className="space-y-4">
                {/* Conversion Score - Primary Metric */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">Conversion Score</span>
                    <span className="text-lg font-bold text-green-700">
                      {landingPageAnalysis?.conversionScore || 'N/A'}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${landingPageAnalysis?.conversionScore || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Content Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs text-gray-700">Headline</span>
                    <span className="text-xs font-medium text-blue-700">
                      {landingPageAnalysis?.headlineLength || 'Not generated'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs text-gray-700">Readability</span>
                    <span className="text-xs font-medium text-blue-700">
                      {landingPageAnalysis?.readabilityScore || 'N/A'}/10
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-700">Total Words</span>
                    <span className="text-xs font-medium text-gray-700">
                      {landingPageAnalysis?.totalWords || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-700">Sections</span>
                    <span className="text-xs font-medium text-gray-700">
                      {landingPageAnalysis?.sectionCount || 0}/5
                    </span>
                  </div>
                </div>

                {/* Feature Indicators */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-center justify-between p-2 rounded-lg ${landingPageAnalysis?.hasRiskReversal ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className="text-xs text-gray-700">Risk Reversal</span>
                    <span className={`text-xs font-medium ${landingPageAnalysis?.hasRiskReversal ? 'text-green-700' : 'text-red-700'}`}>
                      {landingPageAnalysis?.hasRiskReversal ? '✓' : '✗'}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg ${landingPageAnalysis?.productSpecific ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <span className="text-xs text-gray-700">Product Focus</span>
                    <span className={`text-xs font-medium ${landingPageAnalysis?.productSpecific ? 'text-green-700' : 'text-yellow-700'}`}>
                      {landingPageAnalysis?.productSpecific ? '✓ Specific' : '⚠ Generic'}
                    </span>
                  </div>
                </div>

                {/* Performance Tips */}
                {landingPageAnalysis?.conversionScore && landingPageAnalysis.conversionScore < 85 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="text-xs font-medium text-yellow-800 mb-1">Optimization Tips:</div>
                    <div className="text-xs text-yellow-700 space-y-1">
                      {!landingPageAnalysis.hasRiskReversal && <div>• Add risk reversal/guarantee</div>}
                      {!landingPageAnalysis.productSpecific && <div>• Select specific product for insights</div>}
                      {landingPageAnalysis.sectionCount < 5 && <div>• Include all 5 strategic reasons</div>}
                      {landingPageAnalysis.totalWords < 800 && <div>• Expand content depth</div>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        const improvements = [];
                        if (!landingPageAnalysis.hasRiskReversal) improvements.push('Add risk reversal/guarantee');
                        if (!landingPageAnalysis.productSpecific) improvements.push('Select specific product for insights');
                        if (landingPageAnalysis.sectionCount < 5) improvements.push('Include all 5 strategic reasons');
                        if (landingPageAnalysis.totalWords < 800) improvements.push('Expand content depth');
                        improvements.push('Shorten body paragraphs for better readability'); // User's specific feedback

                        fetch('/api/conversion-feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            conversionScore: landingPageAnalysis.conversionScore,
                            content: generatedLandingCopy,
                            improvements
                          })
                        });

                        toast({
                          title: "Feedback Sent",
                          description: "Your feedback will help improve future copy generation.",
                        });
                      }}
                    >
                      Send Feedback to Improve AI Model
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 