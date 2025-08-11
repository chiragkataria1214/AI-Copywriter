import React, { useState, useEffect } from 'react';
import { FileText, List, Target, Sparkles, Settings, Globe, Check, Copy, Zap, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductSelection } from '@/components/common/ProductSelection';
import { toast } from '@/hooks/utils/useToast';
import { apiRequest } from '@/lib/queryClient';
import { TargetPersona } from '@/components/common/TargetPersona';
import { BRAND_NAME } from '@shared/constants';
import { BrandDrBalance } from '@/components/common/BrandDrBalance';

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
  persona: string;
  setPersona: (value: string) => void;
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
  getGenerationDisabledState: (stationType: 'adCopy' | 'landingPage' | 'customRequest' | 'email' | 'sms' | 'staticAd') => { disabled: boolean; reason: string };
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

// Simple scalable placeholder graphic for visual preview boxes/avatars
const PlaceholderGraphic = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Placeholder graphic"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e5e7eb" />
        <stop offset="100%" stopColor="#f3f4f6" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="200" height="200" fill="url(#pg)" />
    <g stroke="#d1d5db" strokeWidth="6" strokeLinecap="round">
      <path d="M40 140 L85 95 L115 125 L160 80" fill="none" />
      <circle cx="65" cy="70" r="18" fill="none" />
    </g>
  </svg>
);

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
  persona,
  setPersona,
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
  const [copied, setCopied] = useState(false);
  const selectedFrameworkDetails = landingPageFrameworks.find((f) => f.name === landingPageType);
  // Normalize known typo from upstream to ensure UI behavior remains correct
  const normalizedLandingPageType = landingPageType === 'peoduct_framework' ? 'product_framework' : landingPageType;

  // Visual Preview helpers (product framework support)
  const productFrameworkRaw: any = (generatedLandingCopy as any)?.productFramework || (generatedLandingCopy as any)?.product_framework || null;
  const isProductFrameworkMode = normalizedLandingPageType === 'product_framework';
  const productFramework: any = productFrameworkRaw || ((isProductFrameworkMode && (generatedLandingCopy as any)?.hero_section) ? (generatedLandingCopy as any) : null);
  const isProductFramework = isProductFrameworkMode && !!productFramework;

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
            },
            {
              id: '4',
              name: 'product_framework',
              displayName: 'Product Framework',
              description: 'Structured, product-first framework (hero, showcase, grid, benefits, social, CTA)',
              contentSequence: [],
              reasonStructure: [],
              optimizationRules: [],
              realExamples: [],
              systemPrompt: '',
              outputRequirements: '',
              isActive: 'true',
              sortOrder: 3
            }
        ]);
      } finally {
        setLoadingFrameworks(false);
      }
    };

    loadLandingPageFrameworks();
  }, []);

  const handleCopy = () => {
    copyToClipboard(JSON.stringify(generatedLandingCopy, null, 2), 'landing');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  const isSelected = normalizedLandingPageType === framework.name;
                  const getFrameworkIcon = (name: string) => {
                    switch (name) {
                      case 'listicle':
                        return List;
                      case 'trojan_horse':
                        return Target;
                      case 'multi_product':
                        return Sparkles;
                      case 'product_framework':
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
                      {/* <p className="text-xs text-gray-500 mt-1">{framework.description}</p> */}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Framework Output Requirements */}
        {/* {selectedFrameworkDetails?.outputRequirements && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <List className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  Framework Output Requirements
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => copyToClipboard(selectedFrameworkDetails.outputRequirements, 'output-requirements')}
                >
                  <Copy size={14} className="mr-1" /> Copy
                </Button>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Based on: <span className="font-medium">{selectedFrameworkDetails.displayName}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap text-gray-700">
                {selectedFrameworkDetails.outputRequirements}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Persona Selection */}
                      <TargetPersona
                personas={personas}
                persona={persona}
                setPersona={setPersona}
                title="Primary Persona"
              />

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
                  <p className="text-xs text-gray-500">Apply {BRAND_NAME} brand voice and guidelines</p>
                </div>
                <Switch checked={useJonesBrandGuide} onCheckedChange={setUseJonesBrandGuide} />
              </div>

              <div>
                <BrandDrBalance
                  useBrandGuide={useJonesBrandGuide}
                  setUseBrandGuide={setUseJonesBrandGuide}
                  brandDrBalance={brandDrBalance}
                  setBrandDrBalance={setBrandDrBalance}
                />
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

            <ProductSelection
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              products={products}
              title="Product Focus (Multi-Select)"
              description="Select products to feature in your landing page. Multiple products can be selected for comprehensive landing page copy."
              className="space-y-4"
            />
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
                  onClick={() => generateLandingCopyMutation.mutate()}
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: '#004182' }}
                  disabled={generateLandingCopyMutation.isPending || getGenerationDisabledState('landingPage').disabled}
                  size="sm"
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      disabled={(!generatedLandingCopy.headline && !isProductFramework) || copied}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? 'Copied' : 'Copy All'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                disabled={!generatedLandingCopy.headline && !isProductFramework}
                onClick={() => {
                  setCurrentGenerationMetadata({
                    stationName: 'Landing Page',
                    timestamp: new Date().toISOString(),
                    modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                    temperature: modelSettings?.temperature || 0.7,
                    maxTokens: modelSettings?.maxTokens || 2000,
                    systemPrompt: landingPageDebugInfo?.systemPrompt || stationPrompts?.landingPage?.systemPrompt || `Expert landing page copywriter specializing in ${BRAND_NAME} conversions...`,
                    userPrompt: landingPageDebugInfo?.userPrompt || `Type: ${landingPageType}\nProduct Brief: ${productBrief}\nMain Angle: ${mainAngle}`,
                    requestPayload: landingPageDebugInfo?.requestPayload,
                    rawResponse: landingPageDebugInfo?.rawResponse
                  });
                  setShowGenerationDetails(true);
                }}
                className="flex items-center space-x-1 text-xs"
              >
                <Eye size={12} />
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
            ) : isProductFramework ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Product Framework: Hero */}
                {(productFramework?.hero_section?.headline || productFramework?.hero_section?.sub_headline) && (
                  <div className="border-l-4 border-jones-primary pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Hero</h4>
                    {productFramework?.hero_section?.headline && (
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{productFramework.hero_section.headline}</p>
                    )}
                    {productFramework?.hero_section?.sub_headline && (
                      <p className="mt-1 text-sm text-gray-700">{productFramework.hero_section.sub_headline}</p>
                    )}
                    {productFramework?.hero_section?.key_message && (
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{productFramework.hero_section.key_message}</p>
                    )}
                    {productFramework?.hero_section?.tone && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Tone: {productFramework.hero_section.tone}</Badge>
                      </div>
                    )}
                    {Array.isArray(productFramework?.hero_section?.call_to_action_guidance) && productFramework.hero_section.call_to_action_guidance.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {productFramework.hero_section.call_to_action_guidance.map((g: string, gi: number) => (
                          <Badge key={gi} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    )}
                    {(productFramework?.hero_section?.cta_button || productFramework?.final_cta?.cta_button) && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          CTA: {productFramework?.hero_section?.cta_button || productFramework?.final_cta?.cta_button}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Framework: Product Showcase */}
                {productFramework?.product_showcase && (
                  <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{productFramework.product_showcase.section_title || 'Product Showcase'}</h4>
                    {productFramework.product_showcase.body_copy && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{productFramework.product_showcase.body_copy}</p>
                    )}
                    {productFramework.product_showcase.key_message && (
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{productFramework.product_showcase.key_message}</p>
                    )}
                    {Array.isArray(productFramework.product_showcase.product_lines) && productFramework.product_showcase.product_lines.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {productFramework.product_showcase.product_lines.map((pl: any, idx: number) => (
                          <div key={idx} className="border rounded p-3">
                            <div className="font-medium text-gray-900 text-sm">{pl.name || pl.headline}</div>
                            {Array.isArray(pl.bullet_points) && pl.bullet_points.length > 0 && (
                              <ul className="mt-1 list-disc list-inside text-sm text-gray-700 space-y-1">
                                {pl.bullet_points.slice(0, 4).map((b: string, bi: number) => (
                                  <li key={bi}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {Array.isArray(productFramework?.product_showcase?.call_to_action_guidance) && productFramework.product_showcase.call_to_action_guidance.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {productFramework.product_showcase.call_to_action_guidance.map((g: string, gi: number) => (
                          <Badge key={gi} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Product Framework: Comparison Grid */}
                {productFramework?.comparison_grid?.table && Array.isArray(productFramework.comparison_grid.table.columns) && Array.isArray(productFramework.comparison_grid.table.rows) && (
                  <div className="border-l-4 border-purple-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{productFramework.comparison_grid.section_title || 'Comparison'}</h4>
                    {productFramework.comparison_grid.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{productFramework.comparison_grid.key_message}</p>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border rounded-lg overflow-hidden bg-white">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-600 p-2">Feature</th>
                            {productFramework.comparison_grid.table.columns.map((col: string, ci: number) => (
                              <th key={ci} className="text-left text-xs font-semibold text-gray-600 p-2">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {productFramework.comparison_grid.table.rows.map((row: any, ri: number) => (
                            <tr key={ri} className="border-t">
                              <td className="p-2 text-xs sm:text-sm text-gray-900 font-medium">{row.feature}</td>
                              {Array.isArray(row.values) && row.values.map((val: string, vi: number) => (
                                <td key={vi} className="p-2 text-xs sm:text-sm text-gray-700">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {Array.isArray(productFramework.comparison_grid.call_to_action_guidance) && productFramework.comparison_grid.call_to_action_guidance.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {productFramework.comparison_grid.call_to_action_guidance.map((g: string, gi: number) => (
                          <Badge key={gi} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Product Framework: Universal Benefits */}
                {productFramework?.universal_benefits && Array.isArray(productFramework.universal_benefits.features) && productFramework.universal_benefits.features.length > 0 && (
                  <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{productFramework.universal_benefits.section_title || 'Universal Benefits'}</h4>
                    {productFramework.universal_benefits.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{productFramework.universal_benefits.key_message}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {productFramework.universal_benefits.features.slice(0, 6).map((f: any, fi: number) => (
                        <div key={fi} className="border rounded p-3 bg-white">
                          <div className="font-semibold text-gray-900 text-sm">{f.headline}</div>
                          <div className="mt-1 text-sm text-gray-700">{f.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Framework: Social Proof */}
                {productFramework?.social_proof && Array.isArray(productFramework.social_proof.testimonials) && productFramework.social_proof.testimonials.length > 0 && (
                  <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{productFramework.social_proof.section_title || 'Social Proof'}</h4>
                    {productFramework.social_proof.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{productFramework.social_proof.key_message}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {productFramework.social_proof.testimonials.slice(0, 3).map((t: any, ti: number) => (
                        <div key={ti} className="border rounded p-3 bg-white">
                          <div className="text-sm font-semibold text-gray-900">{t.reviewer_name}</div>
                          {t.reviewer_title_or_handle && <div className="text-xs text-gray-500">{t.reviewer_title_or_handle}</div>}
                          <blockquote className="text-sm text-gray-700 mt-2">“{t.quote}”</blockquote>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Framework: Final CTA */}
                {productFramework?.final_cta?.cta_button && (
                  <div className="border-l-4 border-emerald-600 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{productFramework.final_cta.section_title || 'Call to Action'}</h4>
                    {productFramework.final_cta.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{productFramework.final_cta.key_message}</p>
                    )}
                    <p className="text-sm font-medium text-emerald-700">{productFramework.final_cta.cta_button}</p>
                  </div>
                )}
              </div>
            ) : generatedLandingCopy.headline ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="border-l-4 border-jones-primary pl-3 sm:pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Headline</h4>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{generatedLandingCopy.headline}</p>
                    </div>
                    <div className="flex items-center space-x-1">
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(generatedLandingCopy.headline, 'headline')}
                            >
                                <Copy size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Copy
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-gray-300 pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Introduction</h4>
                      <p className="text-gray-700">{generatedLandingCopy.introduction}</p>
                    </div>
                    <div className="flex items-center space-x-1">
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(generatedLandingCopy.introduction, 'introduction')}
                            >
                                <Copy size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Copy
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
                          <div className="flex items-center space-x-1">
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => copyToClipboard(section.content, `section-${index}`)}
                                  >
                                      <Copy size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Copy
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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
                      <div className="flex items-center space-x-1">
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => copyToClipboard(generatedLandingCopy.riskReversal, 'riskReversal')}
                              >
                                  <Copy size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Copy
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-l-4 border-green-500 pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Call-to-Action</h4>
                      <p className="text-lg font-medium text-green-700">{generatedLandingCopy.cta}</p>
                    </div>
                    <div className="flex items-center space-x-1">
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(generatedLandingCopy.cta, 'cta')}
                            >
                                <Copy size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Copy
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
                      onClick={async () => {
                        try {
                          const improvements = [];
                          if (!landingPageAnalysis.hasRiskReversal) improvements.push('Add risk reversal/guarantee');
                          if (!landingPageAnalysis.productSpecific) improvements.push('Select specific product for insights');
                          if (landingPageAnalysis.sectionCount < 5) improvements.push('Include all 5 strategic reasons');
                          if (landingPageAnalysis.totalWords < 800) improvements.push('Expand content depth');
                          improvements.push('Shorten body paragraphs for better readability'); // User's specific feedback

                          await apiRequest('/api/conversion-feedback', {
                            method: 'POST',
                            body: {
                              conversionScore: landingPageAnalysis.conversionScore,
                              content: generatedLandingCopy,
                              improvements
                            }
                          });

                          toast({
                            title: "Feedback Sent",
                            description: "Your feedback will help improve future copy generation.",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to send feedback. Please try again.",
                            variant: "destructive"
                          });
                        }
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

        {/* Visual Landing Page Preview */}
        {generatedLandingCopy.headline && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Globe className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  Visual Preview
                </h3>
                <div className="text-xs text-gray-500">Responsive landing page mock</div>
              </div>

              <div className="bg-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-pink-50" />
                  <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 lg:py-16">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      <div className="text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                          {isProductFramework ? (productFramework?.hero_section?.headline || generatedLandingCopy.headline) : generatedLandingCopy.headline}
                        </h1>
                        {isProductFramework ? (
                          (productFramework?.hero_section?.sub_headline || productFramework?.hero_section?.key_message) && (
                            <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-3xl lg:max-w-none mx-auto lg:mx-0 break-words">
                              {productFramework?.hero_section?.sub_headline || productFramework?.hero_section?.key_message}
                            </p>
                          )
                        ) : (generatedLandingCopy.subheadline || generatedLandingCopy.introduction ? (
                          <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-3xl lg:max-w-none mx-auto lg:mx-0 break-words">
                            {generatedLandingCopy.subheadline || generatedLandingCopy.introduction}
                          </p>
                        ) : null)}
                        {(isProductFramework ? (productFramework?.hero_section?.cta_button || productFramework?.final_cta?.cta_button) : generatedLandingCopy.cta) && (
                          <div className="mt-6">
                            <Button className="text-white px-6 py-2 text-sm sm:text-base" style={{ backgroundColor: '#004182' }} size="sm">
                              {isProductFramework ? (productFramework?.hero_section?.cta_button || productFramework?.final_cta?.cta_button) : generatedLandingCopy.cta}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center lg:justify-end">
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl shadow-2xl border bg-white overflow-hidden ring-1 ring-black/5">
                          <PlaceholderGraphic className="w-full h-full" />
                          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-pink-200/40 blur-2xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Product Showcase & Benefit Categories */}
                {isProductFramework && productFramework?.product_showcase ? (
                  <section className="mx-auto max-w-5xl px-4 py-10">
                    <div className="text-center mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{productFramework.product_showcase.section_title || 'Product Showcase & Benefits'}</h2>
                      {productFramework.product_showcase.body_copy && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{productFramework.product_showcase.body_copy}</p>
                      )}
                    </div>
                    <div className="space-y-4">
                      {(productFramework.product_showcase.product_lines || []).map((pl: any, idx: number) => (
                        <div key={idx} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <PlaceholderGraphic className="w-full h-full" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{pl.name || pl.headline}</h3>
                            </div>
                            {Array.isArray(pl.bullet_points) && pl.bullet_points.length > 0 && (
                              <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                                {pl.bullet_points.slice(0, 4).map((b: string, bi: number) => (
                                  <li key={bi}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  generatedLandingCopy.sections?.length > 0 && (
                    <section className="mx-auto max-w-4xl px-4 py-10">
                      <div className="text-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Benefits & Reasons to Believe</h2>
                        <p className="text-sm text-gray-600 mt-1">A focused, scroll-friendly breakdown</p>
                      </div>
                      <div className="space-y-4">
                        {generatedLandingCopy.sections.map((section, index) => (
                          <div key={index} className="relative flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{index + 1}</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{section.title}</h3>
                                <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{(section as any)?.wordCount || section.content.split(/\s+/).length} words</span>
                              </div>
                              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line leading-relaxed break-words">{section.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                )}

                {/* Comparison Grid / Which One is for You? */}
                {isProductFramework && productFramework?.comparison_grid && (
                  <section className="mx-auto max-w-6xl px-4 py-10">
                    <div className="text-center mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{productFramework.comparison_grid.section_title || 'Which One Is For You?'}</h2>
                    </div>
                    {/* Desktop table */}
                    {productFramework.comparison_grid.table && Array.isArray(productFramework.comparison_grid.table.columns) && Array.isArray(productFramework.comparison_grid.table.rows) && (
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full border rounded-lg overflow-hidden bg-white">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left text-xs font-semibold text-gray-600 p-3">Feature</th>
                              {productFramework.comparison_grid.table.columns.map((col: string, ci: number) => (
                                <th key={ci} className="text-left text-xs font-semibold text-gray-600 p-3">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {productFramework.comparison_grid.table.rows.map((row: any, ri: number) => (
                              <tr key={ri} className="border-t">
                                <td className="p-3 text-sm text-gray-900 font-medium">{row.feature}</td>
                                {Array.isArray(row.values) && row.values.map((val: string, vi: number) => (
                                  <td key={vi} className="p-3 text-sm text-gray-700">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Mobile cards */}
                    {productFramework.comparison_grid.table && (
                      <div className="grid md:hidden grid-cols-1 gap-4 mt-4">
                        {productFramework.comparison_grid.table.rows.map((row: any, ri: number) => (
                          <div key={ri} className="border rounded-lg p-4 bg-white">
                            <div className="text-sm font-semibold text-gray-900 mb-1">{row.feature}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                              {row.values?.map((val: string, vi: number) => (
                                <div key={vi} className="p-2 rounded bg-gray-50 border">{val}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Universal Benefits & Features */}
                {isProductFramework && productFramework?.universal_benefits && (
                  <section className="mx-auto max-w-5xl px-4 py-10">
                    <div className="text-center mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{productFramework.universal_benefits.section_title || 'Universal Benefits & Features'}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(productFramework.universal_benefits.features || []).slice(0, 6).map((f: any, fi: number) => (
                        <div key={fi} className="border rounded-lg p-4 bg-white">
                          <div className="font-semibold text-gray-900">{f.headline}</div>
                          <div className="mt-1 text-sm text-gray-700">{f.description}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Social Proof */}
                {isProductFramework && productFramework?.social_proof && (
                  <section className="mx-auto max-w-5xl px-4 py-10">
                    <div className="text-center mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{productFramework.social_proof.section_title || 'What People Are Saying'}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(productFramework.social_proof.testimonials || []).slice(0, 3).map((t: any, ti: number) => (
                        <div key={ti} className="border rounded-lg p-4 bg-white">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                              <PlaceholderGraphic className="w-full h-full" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{t.reviewer_name}</div>
                              {t.reviewer_title_or_handle && <div className="text-xs text-gray-500">{t.reviewer_title_or_handle}</div>}
                            </div>
                          </div>
                          <blockquote className="text-sm text-gray-700">“{t.quote}”</blockquote>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Risk Reversal */}
                {generatedLandingCopy.riskReversal && (
                  <section className="mx-auto max-w-4xl px-4 py-8">
                    <div className="rounded-lg border bg-orange-50 border-orange-200 p-5">
                      <h3 className="font-semibold text-orange-900 mb-1">Risk Reversal</h3>
                      <p className="text-sm text-orange-900/90 break-words">{generatedLandingCopy.riskReversal}</p>
                    </div>
                  </section>
                )}

                {/* Social Proof */}
                {generatedLandingCopy.socialProof && (
                  <section className="mx-auto max-w-4xl px-4 py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What People Are Saying</h3>
                      <blockquote className="mx-auto max-w-3xl bg-gray-50 border rounded-lg p-5 text-gray-700 text-sm">
                        “{generatedLandingCopy.socialProof}”
                      </blockquote>
                    </div>
                  </section>
                )}

                {/* Final CTA */}
                {isProductFramework ? (
                  productFramework?.final_cta?.cta_button && (
                    <section className="mx-auto max-w-5xl px-4 py-12">
                      <div className="text-center border rounded-xl p-8 bg-gradient-to-r from-gray-50 to-blue-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{productFramework.final_cta.section_title || 'Ready to take the next step?'}</h3>
                        <Button className="text-white px-6 py-2 text-sm sm:text-base" style={{ backgroundColor: '#004182' }} size="sm">
                          {productFramework.final_cta.cta_button}
                        </Button>
                      </div>
                    </section>
                  )
                ) : (
                  generatedLandingCopy.cta && (
                    <section className="mx-auto max-w-5xl px-4 py-12">
                      <div className="text-center border rounded-xl p-8 bg-gradient-to-r from-gray-50 to-blue-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to take the next step?</h3>
                        <Button className="text-white px-6 py-2 text-sm sm:text-base" style={{ backgroundColor: '#004182' }} size="sm">
                          {generatedLandingCopy.cta}
                        </Button>
                      </div>
                    </section>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 