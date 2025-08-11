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
import { StandardizedDebugButton } from '@/components/common/StandardizedDebugButton';
import { STATION_KEYS } from '@/hooks/generation/useDebugInfo';

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
  setSelectedItemForRevision: (value: { type: "headline" | "primaryText" | "landingCopy" | "custom" | "retention" | "staticAd" | "socialCaption"; index?: number; field?: string } | null) => void;
  setShowRevisionPanel: (value: boolean) => void;

  // Generation Details
  setCurrentGenerationMetadata: (value: any) => void;
  setShowGenerationDetails: (value: boolean) => void;
  modelSettings: any;
  stationPrompts: any;
  brandGuidelines: any;
  copyFrameworks: any;
  debugInfoManager?: {
    getDebugInfo: (stationKey: string) => any;
    setDebugInfo: (stationKey: string, debugInfo: any) => void;
  };
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
  debugInfoManager,
}) => {
  const [landingPageFrameworks, setLandingPageFrameworks] = useState<LandingPageFramework[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [copied, setCopied] = useState(false);
  const selectedFrameworkDetails = landingPageFrameworks.find((f) => f.name === landingPageType);
  // Normalize known typo from upstream to ensure UI behavior remains correct
  const normalizedLandingPageType = landingPageType === 'peoduct_framework' ? 'multi_product_page' : landingPageType;

  // Visual Preview helpers (multi product page support)
  const multiProductPageRaw: any = (generatedLandingCopy as any)?.multiProductPage || (generatedLandingCopy as any)?.multi_product_page || null;
  const isMultiProductPageMode = normalizedLandingPageType === 'multi_product_page';
  const multiProductPage: any = multiProductPageRaw || ((isMultiProductPageMode && (generatedLandingCopy as any)?.hero_section) ? (generatedLandingCopy as any) : null);
  const isMultiProductPage = isMultiProductPageMode && !!multiProductPage;



  // Visual Preview helpers (listicle support)
  const listicleRaw: any = (generatedLandingCopy as any)?.listicle || null;
  const isListicleMode = normalizedLandingPageType === 'listicle';
  const listicle: any = listicleRaw;
  const isListicle = isListicleMode && !!listicle;



  // Additional debugging for listicle issue


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
              name: 'multi_product_page',
              displayName: 'Multi Product Page',
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
    if (isListicle && listicle) {
      copyToClipboard(JSON.stringify(listicle, null, 2), 'listicle');
    } else {
    copyToClipboard(JSON.stringify(generatedLandingCopy, null, 2), 'landing');
    }
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
                      case 'multi_product_page':
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItemForRevision({ type: 'landingCopy' });
                    setShowRevisionPanel(true);
                  }}
                  disabled={!generatedLandingCopy.headline && !isMultiProductPage && !isListicle}
                  className="w-full sm:w-auto text-xs"
                >
                  <Target size={14} className="mr-1" />
                  <span>Improve</span>
                </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                        size="sm"
                      onClick={handleCopy}
                      disabled={(!generatedLandingCopy.headline && !isMultiProductPage && !isListicle) || copied}
                        className="w-full sm:w-auto text-xs px-2"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? 'Copied' : 'Copy All'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <StandardizedDebugButton
                stationKey={STATION_KEYS.LANDING_PAGE}
                stationName="Landing Page"
                fallbackPrompts={{
                  systemPrompt: stationPrompts?.landingPage?.systemPrompt || `Expert landing page copywriter specializing in ${BRAND_NAME} conversions...`,
                  userPrompt: `Type: ${landingPageType}\nProduct Brief: ${productBrief}\nMain Angle: ${mainAngle}`
                }}
                modelSettings={modelSettings}
                setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                setShowGenerationDetails={setShowGenerationDetails}
                disabled={!generatedLandingCopy.headline && !isMultiProductPage && !isListicle}
                className="w-full sm:w-auto text-xs"
                size="sm"
                debugInfoManager={debugInfoManager}
              />
              </div>
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
            ) : isMultiProductPage ? (
              <div className="space-y-4 sm:space-y-6">
            
                {/* Multi Product Page: Hero */}
                {(multiProductPage?.hero_section?.headline || multiProductPage?.hero_section?.sub_headline) && (
                  <div className="border-l-4 border-jones-primary pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Hero</h4>
                    {multiProductPage?.hero_section?.headline && (
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{multiProductPage.hero_section.headline}</p>
                    )}
                    {multiProductPage?.hero_section?.sub_headline && (
                      <p className="mt-1 text-sm text-gray-700">{multiProductPage.hero_section.sub_headline}</p>
                    )}
                    {multiProductPage?.hero_section?.key_message && (
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{multiProductPage.hero_section.key_message}</p>
                    )}
                    {multiProductPage?.hero_section?.tone && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">Tone: {multiProductPage.hero_section.tone}</Badge>
                      </div>
                    )}
                    {Array.isArray(multiProductPage?.hero_section?.call_to_action_guidance) && multiProductPage.hero_section.call_to_action_guidance.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {multiProductPage.hero_section.call_to_action_guidance.map((g: string, gi: number) => (
                          <Badge key={gi} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    )}
                    {(multiProductPage?.hero_section?.cta_button || multiProductPage?.final_cta?.cta_button) && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          CTA: {multiProductPage?.hero_section?.cta_button || multiProductPage?.final_cta?.cta_button}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Multi Product Page: Product Showcase */}
                {multiProductPage?.product_showcase && (
                  <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{multiProductPage.product_showcase.section_title || 'Product Showcase'}</h4>
                    {multiProductPage.product_showcase.body_copy && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{multiProductPage.product_showcase.body_copy}</p>
                    )}
                    {multiProductPage.product_showcase.key_message && (
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{multiProductPage.product_showcase.key_message}</p>
                    )}
                    {Array.isArray(multiProductPage.product_showcase.product_lines) && multiProductPage.product_showcase.product_lines.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {multiProductPage.product_showcase.product_lines.map((pl: any, idx: number) => (
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
                    {Array.isArray(multiProductPage?.product_showcase?.call_to_action_guidance) && multiProductPage.product_showcase.call_to_action_guidance.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {multiProductPage.product_showcase.call_to_action_guidance.map((g: string, gi: number) => (
                          <Badge key={gi} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Multi Product Page: Comparison Grid */}
                {multiProductPage?.comparison_grid?.table && Array.isArray(multiProductPage.comparison_grid.table.columns) && Array.isArray(multiProductPage.comparison_grid.table.rows) && (
                  <div className="border-l-4 border-purple-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{multiProductPage.comparison_grid.section_title || 'Comparison'}</h4>
                    {multiProductPage.comparison_grid.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{multiProductPage.comparison_grid.key_message}</p>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border rounded-lg overflow-hidden bg-white">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-600 p-2">Feature</th>
                            {multiProductPage.comparison_grid.table.columns.map((col: string, ci: number) => (
                              <th key={ci} className="text-left text-xs font-semibold text-gray-600 p-2">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {multiProductPage.comparison_grid.table.rows.map((row: any, ri: number) => (
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
                    {Array.isArray(multiProductPage.comparison_grid.call_to_action_guidance) && multiProductPage.comparison_grid.call_to_action_guidance.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {multiProductPage.comparison_grid.call_to_action_guidance.map((g: string, gi: number) => (
                          <Badge key={gi} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Multi Product Page: Universal Benefits */}
                {multiProductPage?.universal_benefits && Array.isArray(multiProductPage.universal_benefits.features) && multiProductPage.universal_benefits.features.length > 0 && (
                  <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{multiProductPage.universal_benefits.section_title || 'Universal Benefits'}</h4>
                    {multiProductPage.universal_benefits.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{multiProductPage.universal_benefits.key_message}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {multiProductPage.universal_benefits.features.slice(0, 6).map((f: any, fi: number) => (
                        <div key={fi} className="border rounded p-3 bg-white">
                          <div className="font-semibold text-gray-900 text-sm">{f.headline}</div>
                          <div className="mt-1 text-sm text-gray-700">{f.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi Product Page: Social Proof */}
                {multiProductPage?.social_proof && Array.isArray(multiProductPage.social_proof.testimonials) && multiProductPage.social_proof.testimonials.length > 0 && (
                  <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{multiProductPage.social_proof.section_title || 'Social Proof'}</h4>
                    {multiProductPage.social_proof.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{multiProductPage.social_proof.key_message}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {multiProductPage.social_proof.testimonials.slice(0, 3).map((t: any, ti: number) => (
                        <div key={ti} className="border rounded p-3 bg-white">
                          <div className="text-sm font-semibold text-gray-900">{t.reviewer_name}</div>
                          {t.reviewer_title_or_handle && <div className="text-xs text-gray-500">{t.reviewer_title_or_handle}</div>}
                          <blockquote className="text-sm text-gray-700 mt-2">"{t.quote}"</blockquote>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi Product Page: Final CTA */}
                {multiProductPage?.final_cta?.cta_button && (
                  <div className="border-l-4 border-emerald-600 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{multiProductPage.final_cta.section_title || 'Call to Action'}</h4>
                    {multiProductPage.final_cta.key_message && (
                      <p className="mb-2 text-sm text-gray-700 whitespace-pre-line">{multiProductPage.final_cta.key_message}</p>
                    )}
                    <p className="text-sm font-medium text-emerald-700">{multiProductPage.final_cta.cta_button}</p>
                  </div>
                )}
              </div>
            ) : isListicle ? (
              <div className="space-y-4 sm:space-y-6">
           
                {/* Listicle: Meta Information */}
                {listicle?.meta && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center">
                      <Target className="text-blue-600 mr-2" size={16} />
                      Strategy Overview
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {listicle.meta.target_audience && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Target Audience</div>
                          <div className="text-sm font-medium text-gray-900">{listicle.meta.target_audience}</div>
                        </div>
                      )}
                      {listicle.meta.awareness_level && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Awareness Level</div>
                          <Badge variant="outline" className="text-xs">{listicle.meta.awareness_level}</Badge>
                        </div>
                      )}
                      {listicle.meta.word_count && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Word Count</div>
                          <div className="text-sm font-medium text-gray-900">{listicle.meta.word_count}</div>
                        </div>
                      )}
                      {listicle.meta.read_time_seconds && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Read Time</div>
                          <div className="text-sm font-medium text-gray-900">{Math.ceil(listicle.meta.read_time_seconds / 60)} min</div>
                        </div>
                      )}
                      {listicle.meta.ad_angle_match && (
                        <div className="bg-white rounded p-3 sm:col-span-2">
                          <div className="text-xs text-gray-500 mb-1">Ad Angle Match</div>
                          <div className="text-sm font-medium text-gray-900">{listicle.meta.ad_angle_match}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Listicle: Headline */}
                {listicle?.headline?.text && (
                  <div className="border-l-4 border-jones-primary pl-3 sm:pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Headline</h4>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{listicle.headline.text}</p>
                        <div className="flex flex-wrap gap-2">
                          {listicle.headline.framework_type && (
                            <Badge variant="secondary" className="text-xs">Framework: {listicle.headline.framework_type}</Badge>
                          )}
                          {listicle.headline.hook_strength && (
                            <Badge 
                              variant={listicle.headline.hook_strength === 'high' ? 'default' : 'outline'} 
                              className={`text-xs ${listicle.headline.hook_strength === 'high' ? 'bg-green-100 text-green-800' : listicle.headline.hook_strength === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                            >
                              Hook: {listicle.headline.hook_strength}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full sm:w-auto text-xs px-2"
                                onClick={() => copyToClipboard(listicle.headline.text, 'headline')}
                              >
                                <Copy size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy Headline</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                )}

                {/* Listicle: Bullets */}
                {listicle?.bullets && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      Strategic Bullet Points
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {Object.keys(listicle.bullets).length}/5
                      </Badge>
                    </h4>

                    {/* Bullet 1: Hook */}
                    {listicle.bullets.bullet_1_hook && (
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50 hover:border-red-300 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                #1 Hook
                              </span>
                              <Badge variant="outline" className="text-xs">{listicle.bullets.bullet_1_hook.purpose}</Badge>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed mb-3">
                              {listicle.bullets.bullet_1_hook.text}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {listicle.bullets.bullet_1_hook.emotional_trigger && (
                                <Badge variant="outline" className="text-xs bg-red-100 border-red-200 text-red-800">
                                  {listicle.bullets.bullet_1_hook.emotional_trigger}
                                </Badge>
                              )}
                              {listicle.bullets.bullet_1_hook.template_used && (
                                <Badge variant="outline" className="text-xs">
                                  Template: {listicle.bullets.bullet_1_hook.template_used}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs px-2"
                                    onClick={() => copyToClipboard(listicle.bullets.bullet_1_hook.text, 'bullet-1')}
                                  >
                                    <Copy size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bullet 2: Solution */}
                    {listicle.bullets.bullet_2_solution && (
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:border-blue-300 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                #2 Solution
                              </span>
                              <Badge variant="outline" className="text-xs">{listicle.bullets.bullet_2_solution.purpose}</Badge>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed mb-3">
                              {listicle.bullets.bullet_2_solution.text}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {listicle.bullets.bullet_2_solution.credibility_element && (
                                <Badge variant="outline" className="text-xs bg-blue-100 border-blue-200 text-blue-800">
                                  {listicle.bullets.bullet_2_solution.credibility_element}
                                </Badge>
                              )}
                              {listicle.bullets.bullet_2_solution.template_used && (
                                <Badge variant="outline" className="text-xs">
                                  Template: {listicle.bullets.bullet_2_solution.template_used}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs px-2"
                                    onClick={() => copyToClipboard(listicle.bullets.bullet_2_solution.text, 'bullet-2')}
                                  >
                                    <Copy size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bullet 3: Experience */}
                    {listicle.bullets.bullet_3_experience && (
                      <div className="border border-green-200 rounded-lg p-4 bg-green-50 hover:border-green-300 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                #3 Experience
                              </span>
                              <Badge variant="outline" className="text-xs">{listicle.bullets.bullet_3_experience.purpose}</Badge>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed mb-3">
                              {listicle.bullets.bullet_3_experience.text}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {listicle.bullets.bullet_3_experience.transformation_focus && (
                                <Badge variant="outline" className="text-xs bg-green-100 border-green-200 text-green-800">
                                  {listicle.bullets.bullet_3_experience.transformation_focus}
                                </Badge>
                              )}
                              {listicle.bullets.bullet_3_experience.template_used && (
                                <Badge variant="outline" className="text-xs">
                                  Template: {listicle.bullets.bullet_3_experience.template_used}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs px-2"
                                    onClick={() => copyToClipboard(listicle.bullets.bullet_3_experience.text, 'bullet-3')}
                                  >
                                    <Copy size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bullet 4: Validator */}
                    {listicle.bullets.bullet_4_validator && (
                      <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:border-purple-300 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                #4 Validator
                              </span>
                              <Badge variant="outline" className="text-xs">{listicle.bullets.bullet_4_validator.purpose}</Badge>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed mb-3">
                              {listicle.bullets.bullet_4_validator.text}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {Array.isArray(listicle.bullets.bullet_4_validator.proof_types) && listicle.bullets.bullet_4_validator.proof_types.map((proof: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-purple-100 border-purple-200 text-purple-800">
                                  {proof}
                                </Badge>
                              ))}
                              {listicle.bullets.bullet_4_validator.template_used && (
                                <Badge variant="outline" className="text-xs">
                                  Template: {listicle.bullets.bullet_4_validator.template_used}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs px-2"
                                    onClick={() => copyToClipboard(listicle.bullets.bullet_4_validator.text, 'bullet-4')}
                                  >
                                    <Copy size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bullet 5: Closer */}
                    {listicle.bullets.bullet_5_closer && (
                      <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:border-orange-300 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                                #5 Closer
                              </span>
                              <Badge variant="outline" className="text-xs">{listicle.bullets.bullet_5_closer.purpose}</Badge>
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed mb-3">
                              {listicle.bullets.bullet_5_closer.text}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {listicle.bullets.bullet_5_closer.urgency_element && (
                                <Badge variant="outline" className="text-xs bg-orange-100 border-orange-200 text-orange-800">
                                  {listicle.bullets.bullet_5_closer.urgency_element}
                                </Badge>
                              )}
                              {listicle.bullets.bullet_5_closer.template_used && (
                                <Badge variant="outline" className="text-xs">
                                  Template: {listicle.bullets.bullet_5_closer.template_used}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full sm:w-auto text-xs px-2"
                                    onClick={() => copyToClipboard(listicle.bullets.bullet_5_closer.text, 'bullet-5')}
                                  >
                                    <Copy size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Listicle: Social Proof */}
                {listicle?.social_proof && (
                  <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Social Proof Elements</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.isArray(listicle.social_proof.types_included) && listicle.social_proof.types_included.map((type: string, idx: number) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <Badge variant="outline" className="text-xs">{type}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      {listicle.social_proof.volume_metrics && (
                        <div className="text-sm text-gray-700"><strong>Volume:</strong> {listicle.social_proof.volume_metrics}</div>
                      )}
                      {listicle.social_proof.clinical_data && (
                        <div className="text-sm text-gray-700"><strong>Clinical:</strong> {listicle.social_proof.clinical_data}</div>
                      )}
                      {listicle.social_proof.media_validation && (
                        <div className="text-sm text-gray-700"><strong>Media:</strong> {listicle.social_proof.media_validation}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Listicle: Performance Indicators */}
                {/* {listicle?.performance_indicators && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Zap className="text-green-600 mr-2" size={16} />
                      Performance Indicators
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {listicle.performance_indicators.scroll_stopping_power && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Scroll Stop</div>
                          <Badge 
                            variant={listicle.performance_indicators.scroll_stopping_power === 'high' ? 'default' : 'outline'}
                            className={`text-xs ${listicle.performance_indicators.scroll_stopping_power === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {listicle.performance_indicators.scroll_stopping_power}
                          </Badge>
                        </div>
                      )}
                      {listicle.performance_indicators.conversion_readiness && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Conversion</div>
                          <Badge 
                            variant={listicle.performance_indicators.conversion_readiness === 'high' ? 'default' : 'outline'}
                            className={`text-xs ${listicle.performance_indicators.conversion_readiness === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {listicle.performance_indicators.conversion_readiness}
                          </Badge>
                        </div>
                      )}
                      {listicle.performance_indicators.message_continuity && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Message Flow</div>
                          <Badge 
                            variant={listicle.performance_indicators.message_continuity === 'perfect' ? 'default' : 'outline'}
                            className={`text-xs ${listicle.performance_indicators.message_continuity === 'perfect' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {listicle.performance_indicators.message_continuity}
                          </Badge>
                        </div>
                      )}
                      {listicle.performance_indicators.mobile_consumption && (
                        <div className="bg-white rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Mobile</div>
                          <Badge 
                            variant={listicle.performance_indicators.mobile_consumption === 'optimized' ? 'default' : 'outline'}
                            className={`text-xs ${listicle.performance_indicators.mobile_consumption === 'optimized' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {listicle.performance_indicators.mobile_consumption}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )} */}
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full sm:w-auto text-xs px-2"
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full sm:w-auto text-xs px-2"
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



                <div className="border-l-4 border-green-500 pl-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Call-to-Action</h4>
                      <p className="text-lg font-medium text-green-700">{generatedLandingCopy.cta}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full sm:w-auto text-xs px-2"
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


      </div>
    </div>
  );
}; 