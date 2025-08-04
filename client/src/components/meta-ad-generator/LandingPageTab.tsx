import React from 'react';
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
  subPersona: string;
  setSubPersona: (value: string) => void;
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
  subPersona,
  setSubPersona,
  personas,
  useJonesBrandGuide,
  setUseJonesBrandGuide,
  brandDrBalance,
  setBrandDrBalance,
  getBrandDrLabel,
  selectedProduct,
  setSelectedProduct,
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
}) => {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${landingPageType === 'listicle'
                  ? 'border-jones-primary bg-jones-light'
                  : 'border-gray-300 hover:border-jones-primary'
                }`} onClick={() => setLandingPageType('listicle')}>
                <div className="flex items-center justify-between mb-2">
                  <List className={landingPageType === 'listicle' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                  <div className={`w-4 h-4 border-2 rounded-full ${landingPageType === 'listicle'
                      ? 'border-jones-primary bg-jones-primary'
                      : 'border-gray-300'
                    }`}></div>
                </div>
                <h4 className="font-semibold text-gray-900">Listicle</h4>
                <p className="text-xs text-gray-500 mt-1">List-based content with numbered benefits</p>
              </div>

              <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${landingPageType === 'trojanHorse'
                  ? 'border-jones-primary bg-jones-light'
                  : 'border-gray-300 hover:border-jones-primary'
                }`} onClick={() => setLandingPageType('trojanHorse')}>
                <div className="flex items-center justify-between mb-2">
                  <Target className={landingPageType === 'trojanHorse' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                  <div className={`w-4 h-4 border-2 rounded-full ${landingPageType === 'trojanHorse'
                      ? 'border-jones-primary bg-jones-primary'
                      : 'border-gray-300'
                    }`}></div>
                </div>
                <h4 className="font-semibold text-gray-900">Trojan Horse</h4>
                <p className="text-xs text-gray-500 mt-1">Story-driven approach connecting to benefits</p>
              </div>

              <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${landingPageType === 'multiProduct'
                  ? 'border-jones-primary bg-jones-light'
                  : 'border-gray-300 hover:border-jones-primary'
                }`} onClick={() => setLandingPageType('multiProduct')}>
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className={landingPageType === 'multiProduct' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                  <div className={`w-4 h-4 border-2 rounded-full ${landingPageType === 'multiProduct'
                      ? 'border-jones-primary bg-jones-primary'
                      : 'border-gray-300'
                    }`}></div>
                </div>
                <h4 className="font-semibold text-gray-900">Multi Product Page</h4>
                <p className="text-xs text-gray-500 mt-1">Showcase multiple products with cross-selling</p>
              </div>
            </div>
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

              {personas[concept]?.subPersonas && Object.keys(personas[concept].subPersonas!).length > 0 && (
                <div>
                  <Label htmlFor="subPersona" className="block text-sm font-medium text-gray-700 mb-2">Sub-Persona</Label>
                  <Select value={subPersona} onValueChange={setSubPersona}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(personas[concept].subPersonas!).map(([key, subPersona]) => (
                        <SelectItem key={key} value={key}>{(subPersona as any).label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              Product Focus
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Quick Select - Popular Products
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  Choose from our most frequently featured products for landing page generation
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].map((productName) => {
                    const product = products[productName];
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
                    <Label className="text-sm font-medium text-gray-700">
                      Or choose from all products
                    </Label>
                    <Select value={selectedProduct || "all"} onValueChange={(value) => setSelectedProduct(value === "all" ? "" : value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All products (no filtering)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All products</SelectItem>
                        {Object.entries(products).map(([key, product]) => (
                          <SelectItem key={key} value={key}>
                            {(product as any).displayName || (product as any).name || key}
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
                        Selected: {products[selectedProduct]?.displayName}
                      </p>
                    </div>
                    
                  </div>
                )}
              </div>
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
                    systemPrompt: stationPrompts?.landingPage?.systemPrompt || 'Expert landing page copywriter specializing in Jones Road Beauty conversions...',
                    userPrompt: `Type: ${landingPageType}\nProduct Brief: ${productBrief}\nMain Angle: ${mainAngle}...`,
                    brandGuidelines: brandGuidelines?.guidelines || ['Educational tone', 'Make up, Simplified philosophy', 'Authentic messaging'],
                    frameworks: copyFrameworks?.landingPage?.frameworks || ['Conversion optimization', 'Social proof integration', 'Mobile-first approach'],
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

            {generatedLandingCopy.headline ? (
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