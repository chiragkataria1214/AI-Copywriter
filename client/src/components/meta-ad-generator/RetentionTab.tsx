import React, { useRef, useEffect, useState } from 'react';
import { Mail, MessageSquare, FileText, Copy, Settings, Zap, Eye, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GenerationMetadata } from '@/components/GenerationDetailsModal';
import { apiRequest } from '@/lib/queryClient';

interface Persona {
  label: string;
}

interface Product {
  name: string;
  displayName: string;
}

interface RetentionCopyHistoryItem {
  keyMessage: string;
  platform: string;
  response: string;
  timestamp: Date;
}

interface EmailFramework {
  id: string;
  name: string;
  displayName: string;
  description: string;
  structure: string;
  keyElements: string;
  frameworkContent: string;
  systemPrompt: string;
  outputRequirements: string;
  expectedLength: string;
  images?: any[];
  isActive: string;
  sortOrder: number;
}

interface RetentionTabProps {
  // State variables
  retentionKeyMessage: string;
  setRetentionKeyMessage: (value: string) => void;
  retentionPlatform: string;
  setRetentionPlatform: (value: string) => void;
  retentionEmailType: string;
  setRetentionEmailType: (value: string) => void;
  retentionSelectedProducts: string[];
  setRetentionSelectedProducts: (value: string[]) => void;
  retentionAudience: string;
  setRetentionAudience: (value: string) => void;
  retentionGoal: string;
  setRetentionGoal: (value: string) => void;
  retentionKeywordsToInclude: string[];
  retentionWordsToAvoid: string[];
  generatedRetentionCopy: string;
  retentionCopyHistory: RetentionCopyHistoryItem[];
  
  // Shared state
  concept: string;
  setConcept: (value: string) => void;
  brandDrBalance: number[];
  setBrandDrBalance: (value: number[]) => void;
  selectedProduct: string;
  
  // Data
  personas: Record<string, Persona>;
  products: Record<string, Product>;
  
  // Functions
  addRetentionKeyword: (keyword: string, isAvoid?: boolean) => void;
  removeRetentionKeyword: (keyword: string, isAvoid?: boolean) => void;
  getBrandDrLabel: () => string;
  getGenerationDisabledState: (stationType: 'emailSmsRetention') => { disabled: boolean; reason: string };
  copyToClipboard: (text: string, type: string) => Promise<void>;
  
  // Mutations and settings
  generateRetentionCopyMutation: {
    mutate: () => void;
    isPending: boolean;
  };
  
  // Modal functions
  setCurrentGenerationMetadata: (metadata: GenerationMetadata) => void;
  setShowGenerationDetails: (show: boolean) => void;
  setSelectedItemForRevision: (item: { type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention'; index?: number; field?: string } | null) => void;
  setRevisionInstructions: (instructions: string) => void;
  setShowRevisionPanel: (show: boolean) => void;
  
  // Settings
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stationPrompts?: {
    retention?: {
      systemPrompt?: string;
    };
  };
  brandGuidelines?: {
    guidelines?: string[];
  };
  copyFrameworks?: {
    retention?: {
      frameworks?: string[];
    };
  };
  debugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
  retentionDebugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
}

export const RetentionTab: React.FC<RetentionTabProps> = ({
  retentionKeyMessage,
  setRetentionKeyMessage,
  retentionPlatform,
  setRetentionPlatform,
  retentionEmailType,
  setRetentionEmailType,
  retentionSelectedProducts,
  setRetentionSelectedProducts,
  retentionAudience,
  setRetentionAudience,
  retentionGoal,
  setRetentionGoal,
  retentionKeywordsToInclude,
  retentionWordsToAvoid,
  generatedRetentionCopy,
  retentionCopyHistory,
  concept,
  setConcept,
  brandDrBalance,
  setBrandDrBalance,
  selectedProduct,
  personas,
  products,
  addRetentionKeyword,
  removeRetentionKeyword,
  getBrandDrLabel,
  getGenerationDisabledState,
  copyToClipboard,
  generateRetentionCopyMutation,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  setSelectedItemForRevision,
  setRevisionInstructions,
  setShowRevisionPanel,
  modelSettings,
  stationPrompts,
  brandGuidelines,
  copyFrameworks,
  debugInfo,
  retentionDebugInfo,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailFrameworks, setEmailFrameworks] = useState<EmailFramework[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [visualPreviewHtml, setVisualPreviewHtml] = useState<string>('');
  const [showVisualPreview, setShowVisualPreview] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load email frameworks on component mount
  useEffect(() => {
    const loadEmailFrameworks = async () => {
      if (emailFrameworks.length > 0) return; // Don't load if already loaded
      
      setLoadingFrameworks(true);
      try {
        const response = await apiRequest('/api/email-frameworks');
        const frameworks = (response || []).filter((framework: EmailFramework) => 
          framework.isActive === 'true'
        );
        setEmailFrameworks(frameworks);
      } catch (error) {
        console.error('Failed to load email frameworks:', error);
        // Fallback to hardcoded frameworks if API fails
        setEmailFrameworks([]);
      } finally {
        setLoadingFrameworks(false);
      }
    };

    loadEmailFrameworks();
  }, [emailFrameworks.length]);

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

  // Generate visual preview function
  const generateVisualPreview = async () => {
    if (!generatedRetentionCopy.trim()) return;
    
    setGeneratingPreview(true);
    try {
      const selectedFramework = getSelectedFramework();
      const response = await fetch('/api/generate-retention-visual-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          copyContent: generatedRetentionCopy,
          platform: retentionPlatform,
          emailType: retentionEmailType,
          selectedFramework: selectedFramework
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate visual preview');
      }

      if (data.htmlContent) {
        // Additional frontend cleaning to remove any remaining markdown
        let cleanHtml = data.htmlContent;
        
        // Remove markdown code blocks if they still exist
        cleanHtml = cleanHtml.replace(/^```[a-zA-Z]*\s*/gi, '').trim();
        cleanHtml = cleanHtml.replace(/```\s*$/gi, '').trim();
        cleanHtml = cleanHtml.replace(/^```/g, '').replace(/```$/g, '').trim();
        
        setVisualPreviewHtml(cleanHtml);
        setShowVisualPreview(true);
      }
    } catch (error) {
      console.error('Failed to generate visual preview:', error);
      // Reset preview state on error
      setVisualPreviewHtml('');
      setShowVisualPreview(false);
    } finally {
      setGeneratingPreview(false);
    }
  };

  // Helper function to get selected framework details
  const getSelectedFramework = (): EmailFramework | null => {
    if (!retentionEmailType || emailFrameworks.length === 0) return null;
    return emailFrameworks.find(framework => framework.displayName === retentionEmailType) || null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Section */}
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />
              Email & SMS Retention Copy
            </h3>

            <div className="space-y-4">
              {/* Platform Selection First */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setRetentionPlatform('Email');
                      setShowVisualPreview(false); // Hide preview on platform change
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${retentionPlatform === 'Email'
                        ? 'border-[#004182] bg-[#004182]/10 text-[#004182]'
                        : 'border-gray-300 hover:border-[#004182]'
                      }`}
                  >
                    <Mail size={20} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                  <button
                    onClick={() => {
                      setRetentionPlatform('SMS');
                      setShowVisualPreview(false); // Hide preview on platform change
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${retentionPlatform === 'SMS'
                        ? 'border-[#004182] bg-[#004182]/10 text-[#004182]'
                        : 'border-gray-300 hover:border-[#004182]'
                      }`}
                  >
                    <MessageSquare size={20} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">SMS</span>
                  </button>
                </div>
              </div>

              {/* Key Message Field */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Message / Short Description *
                </Label>
                <Textarea
                  placeholder="Brief description of what the copy should be about..."
                  value={retentionKeyMessage}
                  onChange={(e) => setRetentionKeyMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {retentionPlatform === 'Email' && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Type *
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose the specific email framework that best fits your campaign goals
                  </p>
                  <Select value={retentionEmailType} onValueChange={setRetentionEmailType} disabled={loadingFrameworks}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingFrameworks ? "Loading frameworks..." : "Select email type"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {emailFrameworks.length > 0 ? (
                        emailFrameworks
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((framework) => (
                            <SelectItem key={framework.id} value={framework.displayName}>
                              <div className="flex flex-col">
                                <span className="font-medium">{framework.displayName}</span>
                                <span className="text-xs text-gray-500 truncate max-w-xs">
                                  {framework.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        // Fallback to hardcoded options if frameworks fail to load
                        <>
                          <SelectItem value="GTL (Get the Look)">GTL (Get the Look)</SelectItem>
                          <SelectItem value="Plain Text / Letter-Style Note">Plain Text / Letter-Style Note</SelectItem>
                          <SelectItem value="Product Spotlight / Hero Product">Product Spotlight / Hero Product</SelectItem>
                          <SelectItem value="Product Roundup / Theme-Based Edit">Product Roundup / Theme-Based Edit</SelectItem>
                          <SelectItem value="Back in Stock">Back in Stock</SelectItem>
                          <SelectItem value="Product Launch">Product Launch</SelectItem>
                          <SelectItem value="Teaser Email (Pre-Launch)">Teaser Email (Pre-Launch)</SelectItem>
                          <SelectItem value="Retail Event / Pop-Up / IRL Activation">Retail Event / Pop-Up / IRL Activation</SelectItem>
                          <SelectItem value="Promotional Email">Promotional Email</SelectItem>
                          <SelectItem value="Set or Kit Email">Set or Kit Email</SelectItem>
                          <SelectItem value="How-To (Problem/Solution)">How-To (Problem/Solution)</SelectItem>
                          <SelectItem value="Duos or Product Combinations">Duos or Product Combinations</SelectItem>
                          <SelectItem value="Shade Roundup">Shade Roundup</SelectItem>
                          <SelectItem value="How to Use It (Product Tutorial)">How to Use It (Product Tutorial)</SelectItem>
                          <SelectItem value="Social Proof">Social Proof</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {loadingFrameworks && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Loading email frameworks from database...
                    </p>
                  )}
                  
                  {/* Show selected framework details */}
                  {retentionEmailType && getSelectedFramework() && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            {getSelectedFramework()?.displayName}
                          </h4>
                          <p className="text-xs text-blue-700 mb-2">
                            {getSelectedFramework()?.description}
                          </p>
                          <div className="text-xs text-blue-600">
                            <span className="font-medium">Structure:</span> {getSelectedFramework()?.structure}
                          </div>
                          {getSelectedFramework()?.keyElements && (
                            <div className="text-xs text-blue-600 mt-1">
                              <span className="font-medium">Key Elements:</span> {getSelectedFramework()?.keyElements}
                            </div>
                          )}
                          {getSelectedFramework()?.expectedLength && (
                            <div className="text-xs text-blue-600 mt-1">
                              <span className="font-medium">Expected Length:</span> {getSelectedFramework()?.expectedLength}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Target Persona Section */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Persona (Optional)
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  Choose the primary audience for this retention campaign, or leave blank for general audience
                </p>
                <Select value={concept} onValueChange={setConcept}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target persona (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General Audience)</SelectItem>
                    {Object.entries(personas).map(([key, persona]) => (
                      <SelectItem key={key} value={key}>
                        {(persona as any).label || key.replace(/([A-Z])/g, ' $1').trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>


              </div>

              {/* Product Selection for Retention */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Products to Feature (Multi-Select)
                </Label>
                <p className="text-xs text-gray-500 mb-4">
                  Select products to mention in your {retentionPlatform.toLowerCase()} copy. Email/SMS campaigns often feature multiple products.
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
                        const allTopSelected = topProducts.every(product => retentionSelectedProducts.includes(product));
                        
                        if (allTopSelected) {
                          // Deselect all top products
                          setRetentionSelectedProducts(retentionSelectedProducts.filter(p => !topProducts.includes(p)));
                        } else {
                          // Select all top products
                          const newSelection = [...new Set([...retentionSelectedProducts, ...topProducts])];
                          setRetentionSelectedProducts(newSelection);
                        }
                      }}
                    >
                      {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].every(product => retentionSelectedProducts.includes(product)) ? 'Deselect Top 5' : 'Select Top 5'}
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].map((productName) => {
                      const product = products[productName];
                      if (!product) return null;
                      
                      const isSelected = retentionSelectedProducts.includes(productName);
                      return (
                        <button
                          key={productName}
                          onClick={() => {
                            if (retentionSelectedProducts.includes(productName)) {
                              setRetentionSelectedProducts(retentionSelectedProducts.filter(p => p !== productName));
                            } else {
                              setRetentionSelectedProducts([...retentionSelectedProducts, productName]);
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
                        const allProductNames = Object.values(products).map((product: any) => product.name);
                        if (retentionSelectedProducts.length === allProductNames.length) {
                          setRetentionSelectedProducts([]);
                        } else {
                          setRetentionSelectedProducts(allProductNames);
                        }
                      }}
                    >
                      {retentionSelectedProducts.length === Object.values(products).length ? "Deselect All" : "Select All"}
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
                          const allProducts = Object.values(products);
                          const selectedFromDropdown = retentionSelectedProducts.filter(productName => 
                            allProducts.some((product: any) => product.name === productName)
                          );
                          if (selectedFromDropdown.length === 0) {
                            return "Choose products...";
                          } else if (selectedFromDropdown.length === 1) {
                            return products[selectedFromDropdown[0]]?.displayName || selectedFromDropdown[0];
                          } else {
                            return `${selectedFromDropdown.length} products selected`;
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
                              
                              const isSelected = retentionSelectedProducts.includes(productName);
                              return (
                                <div
                                  key={productName}
                                  className="flex items-center px-1 py-1.5 hover:bg-blue-100 cursor-pointer rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (retentionSelectedProducts.includes(productName)) {
                                      setRetentionSelectedProducts(retentionSelectedProducts.filter(p => p !== productName));
                                    } else {
                                      setRetentionSelectedProducts([...retentionSelectedProducts, productName]);
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
                            {Object.values(products)
                              .filter((product: any) => !['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].includes(product.name))
                              .map((product: any) => {
                                const isSelected = retentionSelectedProducts.includes(product.name);
                                return (
                                  <div
                                    key={product.name}
                                    className="flex items-center px-1 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (retentionSelectedProducts.includes(product.name)) {
                                        setRetentionSelectedProducts(retentionSelectedProducts.filter(p => p !== product.name));
                                      } else {
                                        setRetentionSelectedProducts([...retentionSelectedProducts, product.name]);
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

                  {/* Selected Products from Dropdown as Chips */}
                  
                </div>

                {/* Selected Products Summary */}
                {retentionSelectedProducts.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-blue-900">
                          {retentionSelectedProducts.length} Product{retentionSelectedProducts.length !== 1 ? 's' : ''} Selected
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 h-6 px-2"
                        onClick={() => setRetentionSelectedProducts([])}
                      >
                        Clear all
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {retentionSelectedProducts.map((productValue) => {
                        const productLabel = products[productValue]?.displayName || productValue;
                        return (
                          <Badge 
                            key={productValue} 
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

                {retentionSelectedProducts.length === 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience Segment
                  </Label>
                  <Select value={retentionAudience} onValueChange={setRetentionAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General audience">General audience</SelectItem>
                      <SelectItem value="New prospects">New prospects</SelectItem>
                      <SelectItem value="Existing customers">Existing customers</SelectItem>
                      <SelectItem value="VIP customers">VIP customers</SelectItem>
                      <SelectItem value="Cart abandoners">Cart abandoners</SelectItem>
                      <SelectItem value="Win-back customers">Win-back customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal
                  </Label>
                  <Select value={retentionGoal} onValueChange={setRetentionGoal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drive Sales">Drive Sales</SelectItem>
                      <SelectItem value="Educate">Educate</SelectItem>
                      <SelectItem value="Re-engage">Re-engage</SelectItem>
                      <SelectItem value="Promote New Arrival">Promote New Arrival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Brand/DR Balance Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">Brand/DR Balance</Label>
                  <span className="text-sm text-gray-500">{getBrandDrLabel()}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Balance between brand storytelling and direct response tactics
                </p>
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

              {/* Keywords to Include */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords to Include (Optional)
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {retentionKeywordsToInclude.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeRetentionKeyword(keyword, false)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Type keyword and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRetentionKeyword(e.currentTarget.value, false);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: "clean ingredients", "limited edition", "fast shipping"
                </p>
              </div>

              {/* Words to Avoid */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Words to Avoid (Optional)
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {retentionWordsToAvoid.map((word, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {word}
                      <button
                        onClick={() => removeRetentionKeyword(word, true)}
                        className="ml-1 text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Type word to avoid and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRetentionKeyword(e.currentTarget.value, true);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: "cheap", "guaranteed", "free forever"
                </p>
              </div>



              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        onClick={() => {
                          setShowVisualPreview(false); // Hide preview when generating new copy
                          generateRetentionCopyMutation.mutate();
                        }}
                        disabled={!retentionKeyMessage.trim() || generateRetentionCopyMutation.isPending || getGenerationDisabledState('emailSmsRetention').disabled}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        {generateRetentionCopyMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            {retentionPlatform === 'SMS' ? <MessageSquare size={16} /> : <Mail size={16} />}
                            <span>Generate {retentionPlatform} Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {(getGenerationDisabledState('emailSmsRetention').disabled || !retentionKeyMessage.trim()) && (
                    <TooltipContent>
                      <p>
                        {!retentionKeyMessage.trim()
                          ? 'Please enter a key message'
                          : getGenerationDisabledState('emailSmsRetention').reason
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
        {/* Generated Copy */}
        {generateRetentionCopyMutation.isPending ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {retentionPlatform === 'SMS' ? <MessageSquare className="text-jones-primary mr-2 sm:mr-3" size={18} /> : <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />}
                Generating {retentionPlatform} Copy
              </h3>
              
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-2">Creating {retentionPlatform} Copy</p>
                <p className="text-sm text-gray-500">
                  {retentionPlatform === 'SMS' 
                    ? 'Crafting concise, action-driving SMS copy that respects character limits...'
                    : 'Generating engaging email copy optimized for your selected framework and audience...'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : generatedRetentionCopy && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {retentionPlatform === 'SMS' ? <MessageSquare className="text-jones-primary mr-2 sm:mr-3" size={18} /> : <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />}
                Generated {retentionPlatform} Copy
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-sm text-gray-800">
                    {generatedRetentionCopy}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(generatedRetentionCopy, 'retention')}
                    className="flex items-center space-x-2"
                  >
                    <Copy size={16} />
                    <span>Copy</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={generateVisualPreview}
                    disabled={generatingPreview}
                    className="flex items-center space-x-2"
                  >
                    {generatingPreview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span>Preview {retentionPlatform}</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentGenerationMetadata({
                        stationName: 'Email & SMS Retention',
                        timestamp: new Date().toISOString(),
                        modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                        temperature: modelSettings?.temperature || 0.7,
                        maxTokens: modelSettings?.maxTokens || 2000,
                        systemPrompt: retentionDebugInfo?.systemPrompt || stationPrompts?.retention?.systemPrompt || 'Expert retention marketing copywriter for Jones Road Beauty...',
                        userPrompt: retentionDebugInfo?.userPrompt || `Platform: ${retentionPlatform}\nKey Message: ${retentionKeyMessage}\nProducts: ${retentionSelectedProducts.join(', ')}`,
                        requestPayload: retentionDebugInfo?.requestPayload,
                        rawResponse: retentionDebugInfo?.rawResponse
                      });
                      setShowGenerationDetails(true);
                    }}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Settings size={12} />
                    <span>View Details</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedItemForRevision({
                        type: 'retention',
                        field: 'retention'
                      });
                      setRevisionInstructions('');
                      setShowRevisionPanel(true);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Zap size={16} />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Preview */}
        {showVisualPreview && visualPreviewHtml && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Image className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  {retentionPlatform} Visual Preview
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVisualPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-600">
                    Preview of how your {retentionPlatform.toLowerCase()} copy will appear
                  </p>
                </div>
                <div className="bg-white relative">
                  <iframe
                    srcDoc={visualPreviewHtml}
                    className={`w-full border-0 ${retentionPlatform === 'SMS' ? 'h-80' : 'h-96'}`}
                    title={`${retentionPlatform} Preview`}
                    sandbox="allow-same-origin allow-scripts"
                    style={{ minHeight: retentionPlatform === 'SMS' ? '320px' : '384px' }}
                  />
                </div>
              </div>

            
            </CardContent>
          </Card>
        )}

        {/* Copy History */}
        {retentionCopyHistory.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                Recent {retentionPlatform} Copy
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {retentionCopyHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {item.timestamp.toLocaleString()} • {item.platform}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Message: {item.keyMessage.substring(0, 100)}
                      {item.keyMessage.length > 100 && '...'}
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {item.response.substring(0, 200)}
                      {item.response.length > 200 && '...'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.response, 'retention')}
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
}; 