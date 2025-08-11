import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import {
    Button
} from '@/components/ui/button';
import {
    Input
} from '@/components/ui/input';
import {
    Textarea
} from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Switch
} from '@/components/ui/switch';
import {
    Slider
} from '@/components/ui/slider';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import {
    Badge
} from '@/components/ui/badge';
import {
    Label
} from '@/components/ui/label';
import { TargetPersona } from '@/components/common/TargetPersona';
import { StandardizedDebugButton } from '@/components/common/StandardizedDebugButton';
import { STATION_KEYS } from '@/hooks/generation/useDebugInfo';
import {
    Video,
    FileText,
    Camera,
    Upload,
    Users,
    Sparkles,
    Settings,
    Copy,
    Check,
    Target,
    Globe,
    ThumbsUp,
    Star,
    ThumbsDown,
    Save,
    Lightbulb,
    Calendar,
    Share2,
    DollarSign,
    RefreshCw,
    ArrowRightCircle,
    Shield,
    TrendingUp,
    MessageCircle,
    MousePointerClick,
    CircleDollarSign,
    AlertTriangle,
    Eye
} from 'lucide-react';
import React from 'react';
import { ProductSelection } from '@/components/common/ProductSelection';
import { BrandDrBalance } from '@/components/common/BrandDrBalance';
import { BRAND_NAME } from '@shared/constants';

interface AdCopyTabProps {
    contentType: string;
    setContentType: (value: string) => void;
    transcription: string;
    setTranscription: (value: string) => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    airLink: string;
    setAirLink: (value: string) => void;
    uploadedImage: string;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setUploadedImage: (value: string) => void;
    customBrief: string;
    setCustomBrief: (value: string) => void;
    persona: string;
    setPersona: (value: string) => void;
    personas: any;
    landingPageUrl: string;
    setLandingPageUrl: (value: string) => void;
    enableInfluencerMode: boolean;
    setEnableInfluencerMode: (value: boolean) => void;
    influencerHandle: string;
    setInfluencerHandle: (value: string) => void;
    voiceAnalysisMethod: string;
    setVoiceAnalysisMethod: (value: string) => void;
    influencerBrandBalance: number[];
    setInfluencerBrandBalance: (value: number[]) => void;
    useJonesBrandGuide: boolean;
    setUseJonesBrandGuide: (value: boolean) => void;
    brandDrBalance: number[];
    setBrandDrBalance: (value: number[]) => void;
    getBrandDrLabel: () => string;
    selectedProducts: string[];
    setSelectedProducts: (value: string[]) => void;
    products: any;
    generateAdCopy: () => void;
    generateAdCopyMutation: any;
    getGenerationDisabledState: (stationType: 'adCopy') => { disabled: boolean; reason: string };
    generatedHeadlines: Array<{ framework: string; copy: string }>;
    copyToClipboard: (text: string, type: string) => void;
    copiedHeadlines: boolean;
    getWordCount: (text: string) => number;
    setSelectedItemForRevision: (value: any) => void;
    setShowRevisionPanel: (value: boolean) => void;
    generatedPrimaryText: string;
    copiedPrimaryText: boolean;
    modelSettings: any;
    stationPrompts: any;
    brandGuidelines: any;
    copyFrameworks: any;
    setCurrentGenerationMetadata: (value: any) => void;
    setShowGenerationDetails: (value: boolean) => void;
    currentCopyId: string | null;
    copyRating: string | null;
    setCopyRating: (value: string | null) => void;
    feedbackText: string;
    setFeedbackText: (value: string) => void;
    submitFeedbackMutation: any;
    saveCopyMutation: any;
    selectedHeadlineIndex: number;
    setSelectedHeadlineIndex: (value: number) => void;
    debugInfoManager?: {
        getDebugInfo: (stationKey: string) => any;
        setDebugInfo: (stationKey: string, debugInfo: any) => void;
    };
    testingFocus?: string;
    strategicInsights?: { [key: string]: string | string[] } | null;
}

export const AdCopyTab = ({
    contentType,
    setContentType,
    transcription,
    setTranscription,
    handleFileUpload,
    airLink,
    setAirLink,
    uploadedImage,
    handleImageUpload,
    setUploadedImage,
    customBrief,
    setCustomBrief,
    persona,
    setPersona,
    personas,
    landingPageUrl,
    setLandingPageUrl,
    enableInfluencerMode,
    setEnableInfluencerMode,
    influencerHandle,
    setInfluencerHandle,
    voiceAnalysisMethod,
    setVoiceAnalysisMethod,
    influencerBrandBalance,
    setInfluencerBrandBalance,
    useJonesBrandGuide,
    setUseJonesBrandGuide,
    brandDrBalance,
    setBrandDrBalance,
    getBrandDrLabel,
    selectedProducts,
    setSelectedProducts,
    products,
    generateAdCopy,
    generateAdCopyMutation,
    getGenerationDisabledState,
    generatedHeadlines,
    copyToClipboard,
    copiedHeadlines,
    getWordCount,
    setSelectedItemForRevision,
    setShowRevisionPanel,
    generatedPrimaryText,
    copiedPrimaryText,
    modelSettings,
    stationPrompts,
    brandGuidelines,
    copyFrameworks,
    setCurrentGenerationMetadata,
    setShowGenerationDetails,
    currentCopyId,
    copyRating,
    setCopyRating,
    feedbackText,
    setFeedbackText,
    submitFeedbackMutation,
    saveCopyMutation,
    selectedHeadlineIndex,
    setSelectedHeadlineIndex,
    debugInfoManager,
    testingFocus,
    strategicInsights
}: AdCopyTabProps) => {

    const [copiedHeadlineIndex, setCopiedHeadlineIndex] = React.useState<number | null>(null);
    const formatInsightKey = (key: string) => {
        const result = key.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    const insightIcons: { [key: string]: React.ElementType } = {
        audienceSegmentationStrategy: Users,
        seasonalPerformancePredictions: Calendar,
        crossChannelAmplification: Share2,
        budgetOptimizationStrategy: DollarSign,
        creativeRefreshTimeline: RefreshCw,
        conversionPathOptimization: ArrowRightCircle,
        riskMitigationStrategy: Shield,
        scaleabilityInsights: TrendingUp,
        audienceFeedbackLoop: MessageCircle,
        attributionOptimization: MousePointerClick,
        costEfficiencyPredictions: CircleDollarSign,
        contentSyndicationOpportunities: Copy,
        performanceMonitoringAlerts: AlertTriangle,
        default: Lightbulb,
    };

    const InsightIcon = ({ iconKey }: { iconKey: string }) => {
        const Icon = insightIcons[iconKey] || insightIcons.default;
        return <Icon className="text-jones-primary mr-3" size={20} />;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Section */}
            <div className="space-y-4 sm:space-y-6">
                {/* Content Input Section */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Video className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Content Input
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setContentType('video')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${contentType === 'video'
                                        ? 'border-jones-primary bg-jones-light text-jones-primary'
                                        : 'border-gray-300 hover:border-jones-primary'
                                        }`}
                                >
                                    <Camera size={20} className="mx-auto mb-2" />
                                    <span className="text-sm font-medium">Video/Transcription</span>
                                </button>
                                <button
                                    onClick={() => setContentType('image')}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${contentType === 'image'
                                        ? 'border-jones-primary bg-jones-light text-jones-primary'
                                        : 'border-gray-300 hover:border-jones-primary'
                                        }`}
                                >
                                    <FileText size={20} className="mx-auto mb-2" />
                                    <span className="text-sm font-medium">Image/URL</span>
                                </button>
                            </div>

                            {contentType === 'video' && (
                                <div className="space-y-4">
                                    <Textarea
                                        rows={6}
                                        className="w-full resize-none text-sm"
                                        placeholder="Paste your video transcription here..."
                                        value={transcription}
                                        onChange={(e) => setTranscription(e.target.value)}
                                    />

                                    <div className="text-center text-sm text-gray-500">OR</div>

                                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                                <Upload size={14} />
                                                <span className="hidden sm:inline">Upload Text</span>
                                                <span className="sm:hidden">Text</span>
                                            </Label>
                                            <Input
                                                id="file-upload"
                                                type="file"
                                                className="sr-only"
                                                accept=".txt,.doc,.docx"
                                                onChange={handleFileUpload}
                                            />

                                            <Label htmlFor="video-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                                <Camera size={14} />
                                                <span className="hidden sm:inline">Upload Video</span>
                                                <span className="sm:hidden">Video</span>
                                            </Label>
                                            <Input
                                                id="video-upload"
                                                type="file"
                                                className="sr-only"
                                                accept="video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        // Handle video file upload
                                                        console.log('Video uploaded:', file.name);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {contentType === 'image' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">Air Link or Image URL</Label>
                                        <Input
                                            type="url"
                                            placeholder="Paste Air.com link or image URL..."
                                            value={airLink}
                                            onChange={(e) => setAirLink(e.target.value)}
                                            className="mb-2"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Add an Air.com link or direct image URL to analyze existing ad creatives
                                        </p>
                                    </div>

                                    <div className="text-center text-sm text-gray-500">OR</div>

                                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="image-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                                <Upload size={14} />
                                                <span className="hidden sm:inline">Upload Image</span>
                                                <span className="sm:hidden">Image</span>
                                            </Label>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                className="sr-only"
                                                accept=".jpg,.jpeg,.png,.gif,.webp"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(airLink || uploadedImage) && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    {airLink && (
                                        <div className="flex items-center text-sm text-blue-700">
                                            <span className="font-medium">Air Link:</span>
                                            <span className="ml-2 truncate">{airLink}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setAirLink('')}
                                                className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    )}
                                    {uploadedImage && (
                                        <div className="flex items-center text-sm text-blue-700">
                                            <span className="font-medium">Uploaded Image:</span>
                                            <span className="ml-2">Ready for analysis</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setUploadedImage('')}
                                                className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="customBrief" className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Brief <span className="text-xs text-gray-500">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="customBrief"
                                    rows={3}
                                    className="w-full resize-none text-sm"
                                    placeholder="Add specific instructions for this ad (e.g., 'Focus on quick routine', 'Mention free shipping', 'Target working moms specifically')..."
                                    value={customBrief}
                                    onChange={(e) => setCustomBrief(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    These instructions will be included in the AI prompt for this specific generation
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Persona Selection */}
                <TargetPersona
                    personas={personas}
                    persona={persona}
                    setPersona={setPersona}
                    title="Primary Persona"
                />

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="landingPageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Landing Page URL <span className="text-xs text-gray-500">(Optional)</span>
                                </Label>
                                <Input
                                    type="url"
                                    id="landingPageUrl"
                                    placeholder="https://your-landing-page.com"
                                    value={landingPageUrl}
                                    onChange={(e) => setLandingPageUrl(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Provide your existing landing page URL to ensure ad copy aligns with your landing page messaging
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Influencer Voice Modeling */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                    <Users className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                    Partnership Ads
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Generate copy in the influencer's authentic voice while respecting brand guidelines</p>
                            </div>
                            <Switch checked={enableInfluencerMode} onCheckedChange={setEnableInfluencerMode} />
                        </div>

                        <div className="space-y-4">

                            {enableInfluencerMode && (
                                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div>
                                        <Label htmlFor="influencerHandle" className="block text-sm font-medium text-gray-700 mb-2">
                                            Instagram Handle <span className="text-xs text-gray-500">(Optional but recommended)</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="influencerHandle"
                                            placeholder="@username (without @)"
                                            value={influencerHandle}
                                            onChange={(e) => setInfluencerHandle(e.target.value.replace('@', ''))}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            We'll analyze their recent posts to understand their voice, vocabulary, and engagement style
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            Voice Analysis Method
                                        </Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="combined"
                                                    name="voiceMethod"
                                                    value="combined"
                                                    checked={voiceAnalysisMethod === 'combined'}
                                                    onChange={(e) => setVoiceAnalysisMethod(e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <Label htmlFor="combined" className="text-sm">Combined Analysis (Recommended)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="video-only"
                                                    name="voiceMethod"
                                                    value="video"
                                                    checked={voiceAnalysisMethod === 'video'}
                                                    onChange={(e) => setVoiceAnalysisMethod(e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <Label htmlFor="video-only" className="text-sm">Video Transcription Only</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="social-only"
                                                    name="voiceMethod"
                                                    value="social"
                                                    checked={voiceAnalysisMethod === 'social'}
                                                    onChange={(e) => setVoiceAnalysisMethod(e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <Label htmlFor="social-only" className="text-sm">Instagram Content Analysis</Label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Combined analysis provides the most authentic voice modeling by analyzing both speech patterns and written content
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-sm font-medium text-gray-700">Brand Guidelines Adherence</Label>
                                            <span className="text-sm text-gray-500">{influencerBrandBalance[0]}% Brand Guidelines</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Influencer Voice</span>
                                            <span className="text-sm text-gray-600">Brand Guidelines</span>
                                        </div>
                                        <Slider
                                            value={influencerBrandBalance}
                                            onValueChange={setInfluencerBrandBalance}
                                            max={100}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>100% Authentic Voice</span>
                                            <span>Balanced</span>
                                            <span>Brand Guidelines Priority</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Controls how strictly we maintain brand voice vs. authentic influencer voice
                                        </p>
                                    </div>
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
                            <BrandDrBalance
                                useBrandGuide={useJonesBrandGuide}
                                setUseBrandGuide={setUseJonesBrandGuide}
                                brandDrBalance={brandDrBalance}
                                setBrandDrBalance={setBrandDrBalance}
                            />
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

                        <ProductSelection
                            selectedProducts={selectedProducts || []}
                            setSelectedProducts={setSelectedProducts || (() => { })}
                            products={products}
                            title="Product Focus (Multi-Select)"
                            description="Choose products to feature in your ad copy. You can select multiple products for comprehensive campaigns."
                        />
                    </CardContent>
                </Card>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full">
                                <Button
                                    onClick={generateAdCopy}
                                    className="w-full text-white"
                                    style={{ backgroundColor: '#004182' }}
                                    disabled={generateAdCopyMutation?.isPending || getGenerationDisabledState('adCopy').disabled}
                                    size="sm"
                                >
                                    {generateAdCopyMutation?.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2" size={16} />
                                            Generate Ad Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{getGenerationDisabledState('adCopy').reason}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Results Section */}
            <div className="space-y-4 sm:space-y-6">
                {/* Generated Headlines */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                Generated Headlines
                            </h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard((generatedHeadlines || []).map((h: { copy: string }) => h.copy).join('\n'), 'headlines')}
                                            disabled={(generatedHeadlines || []).length === 0}
                                        >
                                            {copiedHeadlines ? <Check size={16} /> : <Copy size={16} />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {copiedHeadlines ? 'Copied' : 'Copy All'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {(generatedHeadlines || []).length > 0 ? (
                            <div className="space-y-3">
                                {(generatedHeadlines || []).map((headline, index) => (
                                    <div key={index} className="group relative border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-jones-primary transition-colors">
                                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                                            <div className="flex-1 pr-0 sm:pr-2">
                                                <p className="font-medium text-gray-900 text-sm sm:text-base leading-relaxed">{headline.copy}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 text-sm font-medium px-2.5 py-1">
                                                        {headline.framework}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 text-sm px-2.5 py-1">
                                                        {getWordCount(headline.copy)} words
                                                    </Badge>
                                                </div>
                                            </div>
                                            {/* <div className="flex items-center">
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="w-full sm:w-auto text-xs px-2"
                                                          onClick={() => {
                                                              copyToClipboard(headline.copy, 'headline');
                                                              setCopiedHeadlineIndex(index);
                                                              setTimeout(() => setCopiedHeadlineIndex(null), 2000);
                                                          }}
                                                          disabled={copiedHeadlineIndex === index}
                                                      >
                                                          {copiedHeadlineIndex === index ? <Check size={14} /> : <Copy size={14} />}
                                                      </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      {copiedHeadlineIndex === index ? 'Copied' : 'Copy'}
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                            </div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No headlines generated</h3>
                                <p className="mt-1 text-sm text-gray-500">Generate ad copy to see headlines here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>



                {/* Generated Primary Text */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                Primary Text
                            </h3>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedItemForRevision({ type: 'primaryText' });
                                        setShowRevisionPanel(true);
                                    }}
                                    disabled={!generatedPrimaryText}
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
                                          onClick={() => copyToClipboard(generatedPrimaryText, 'primary')}
                                          disabled={!generatedPrimaryText}
                                          className="w-full sm:w-auto text-xs px-2"
                                      >
                                          {copiedPrimaryText ? <Check size={14} /> : <Copy size={14} />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {copiedPrimaryText ? 'Copied' : 'Copy'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <StandardizedDebugButton
                                    stationKey={STATION_KEYS.AD_COPY}
                                    stationName="Ad Copy Generation"
                                    fallbackPrompts={{
                                        systemPrompt: stationPrompts?.adCopy?.systemPrompt || `Expert ad copy creator for ${BRAND_NAME}...`,
                                        userPrompt: `Content Type: ${contentType}\nPersona: ${persona}\nTranscription: ${transcription?.substring(0, 100)}...`
                                    }}
                                    modelSettings={modelSettings}
                                    setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                                    setShowGenerationDetails={setShowGenerationDetails}
                                    disabled={!currentCopyId}
                                    className="w-full sm:w-auto text-xs"
                                    size="sm"
                                    debugInfoManager={debugInfoManager}
                                />

                            </div>
                        </div>

                        {generatedPrimaryText ? (
                            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 group">
                                <div className="flex items-start justify-between">
                                    <p className="text-gray-900 leading-relaxed text-sm sm:text-base flex-1">{generatedPrimaryText}</p>
                                </div>

                                <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-200 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" style={{ backgroundColor: '#f0f4ff', color: '#004182' }} className="text-sm font-medium px-2.5 py-1 border border-blue-200">
                                            {getWordCount(generatedPrimaryText)} words
                                        </Badge>
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 text-sm font-medium px-2.5 py-1">
                                            Brand-First
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ) : generateAdCopyMutation?.isPending ? (
                            <div className="text-center py-12">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="flex space-x-1">
                                        <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                                <p className="text-gray-600 font-medium mb-2">Generating Primary Text</p>
                                <p className="text-sm text-gray-500">
                                    Crafting compelling ad copy that converts while maintaining brand voice...
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No primary text generated yet. Click "Generate Ad Copy" to create primary text.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/*  Testing Focus */}
                {/* {testingFocus && (
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            {testingFocus && (
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800 mb-2">Testing Focus</h4>
                                    <p className="text-sm text-gray-600">{testingFocus}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )} */}

                {/* Strategic Insights */}
                {strategicInsights && Object.keys(strategicInsights).length > 0 && (
                    <Card className="bg-blue-50/50 border-blue-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start mb-4">
                                <Lightbulb className="text-jones-primary mr-3 flex-shrink-0" size={24} />
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                        Strategic Insights
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Actionable recommendations to improve your campaign performance.
                                    </p>
                                </div>
                            </div>
                            <Accordion type="single" collapsible className="w-full bg-white rounded-lg border border-blue-200 shadow-sm">
                                {Object.entries(strategicInsights).map(([key, value]) => (
                                    <AccordionItem value={key} key={key} className="border-b border-blue-100 last:border-b-0">
                                        <AccordionTrigger className="text-sm font-semibold hover:no-underline px-4 py-3 text-left">
                                            <div className="flex items-center">
                                                <InsightIcon iconKey={key} />
                                                <span className="flex-1">{formatInsightKey(key)}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-0">
                                            {Array.isArray(value) ? (
                                                <ul className="list-disc pl-10 space-y-1 text-sm text-gray-700">
                                                    {value.map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-700 pl-8">{value as any}</p>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                )}


                {/* Ad Preview Section */}
                {((generatedHeadlines || []).length > 0 || generatedPrimaryText) && (
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                    <Globe className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                    Ad Preview
                                </h3>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                                    {(generatedHeadlines || []).length > 1 && (
                                        <div className="flex items-center space-x-2">
                                            <Label className="text-sm text-gray-600">Preview Headline:</Label>
                                            <Select value={selectedHeadlineIndex.toString()} onValueChange={(value) => setSelectedHeadlineIndex(parseInt(value))}>
                                                <SelectTrigger className="w-52">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(generatedHeadlines || []).map((headline, index) => (
                                                        <SelectItem key={index} value={index.toString()}>
                                                            <div className="flex flex-col py-1 max-w-48">
                                                                <span className="font-medium text-sm">{headline.framework}</span>
                                                                <span className="text-xs text-gray-500 truncate">{headline.copy.substring(0, 40)}...</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {(generatedHeadlines || []).length === 1 && (
                                        <div className="text-sm text-gray-600">
                                            Showing: <span className="font-medium">{(generatedHeadlines || [])[0]?.framework}</span>
                                        </div>
                                    )}
                                    <Badge variant="secondary" style={{ backgroundColor: '#f0f4ff', color: '#004182' }} className="text-sm font-medium px-3 py-1.5 border border-blue-200">
                                        Facebook Feed Ad
                                    </Badge>
                                </div>
                            </div>

                            {/* Mobile Facebook Feed Ad Format */}
                            <div className="max-w-xs sm:max-w-sm mx-auto bg-white shadow-sm border-0 overflow-hidden" style={{ maxWidth: '375px', width: '100%' }}>
                                {/* Mobile Page Header */}
                                <div className="flex items-center px-3 sm:px-4 py-3 bg-white">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004182 0%, #003366 100%)' }}>
                                        <span className="text-white font-bold text-xs sm:text-sm">JR</span>
                                    </div>
                                    <div className="ml-2 sm:ml-3 flex-1">
                                        <div className="font-medium text-sm sm:text-[15px] text-gray-900 flex items-center">
                                            {BRAND_NAME}
                                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-1.5" style={{ color: '#1877f2' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="text-[13px] text-gray-500 flex items-center">
                                            <span>Sponsored</span>
                                            <span className="mx-1">•</span>
                                            <Globe size={9} />
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Mobile Headline and Primary Text */}
                                <div className="px-4 pb-3">

                                    {generatedPrimaryText && (
                                        <p className="text-[15px] text-gray-900 leading-[1.4]">
                                            {generatedPrimaryText}
                                        </p>
                                    )}
                                </div>

                                {/* Mobile Product Image */}
                                <div className="aspect-square flex items-center justify-center relative bg-white">
                                    {uploadedImage ? (
                                        // Show uploaded image
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded ad creative"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        // Show default product image
                                        <>
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)' }}>
                                                <div className="absolute top-8 left-8 w-12 h-12 rounded-full blur-lg opacity-30" style={{ backgroundColor: '#004182' }}></div>
                                                <div className="absolute bottom-12 right-12 w-20 h-20 rounded-full blur-lg opacity-20" style={{ backgroundColor: '#1a5a9e' }}></div>
                                            </div>
                                            <div className="relative text-center z-10">
                                                <div className="w-28 h-28 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 mx-auto border border-gray-100">
                                                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004182 0%, #003366 100%)' }}>
                                                        <span className="text-white font-bold text-base">
                                                            {products[selectedProducts[0]]?.displayName?.split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 3) || 'JR'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-gray-500 text-xs font-medium">
                                                    {products[selectedProducts[0]]?.displayName || BRAND_NAME}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>


                                {/* Mobile Link Preview Section */}
                                {((generatedHeadlines || []).length > 0 || generatedPrimaryText) && (
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                        <div className="text-[13px] text-gray-500 mb-1 uppercase tracking-wide font-medium">
                                            {BRAND_NAME}.COM
                                        </div>
                                        {(generatedHeadlines || []).length > 0 && (generatedHeadlines || [])[selectedHeadlineIndex] && (
                                            <div className="mb-3">
                                                <p className="text-[16px] font-semibold text-gray-900 leading-[1.3] mb-2">
                                                    {(generatedHeadlines || [])[selectedHeadlineIndex]?.copy}
                                                </p>
                                                {/* <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 text-xs font-medium px-2 py-1">
                                                {(generatedHeadlines || [])[selectedHeadlineIndex]?.framework}
                                            </Badge> */}
                                            </div>
                                        )}
                                        <div className="font-medium text-[15px] text-gray-900 mb-3 leading-tight">
                                            {products[selectedProducts[0]]?.displayName || 'Discover Your Perfect Beauty Match'}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-white text-[14px] py-2.5 h-9 rounded-md font-semibold hover:opacity-90 shadow-sm"
                                            style={{ backgroundColor: '#1877f2' }}
                                        >
                                            SHOP NOW
                                        </Button>
                                    </div>
                                )}

                                {/* Mobile Engagement Section */}
                                <div className="px-4 py-3 border-t border-gray-200 bg-white">
                                    <div className="flex items-center justify-between text-[15px] text-gray-600">
                                        <div className="flex items-center space-x-8">
                                            <span className="flex items-center cursor-pointer font-medium hover:text-gray-800 transition-colors">
                                                <ThumbsUp size={18} className="mr-1.5" />
                                                Like
                                            </span>
                                            <span className="cursor-pointer font-medium hover:text-gray-800 transition-colors">Comment</span>
                                            <span className="cursor-pointer font-medium hover:text-gray-800 transition-colors">Share</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500">
                                    Mobile Facebook feed preview showing how your ad will appear to users on mobile devices
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* Feedback Section for Analytics */}
                {currentCopyId && ((generatedHeadlines || []).length > 0 || generatedPrimaryText) && (
                    <Card className="border-2" style={{ borderColor: '#004182' }}>
                        <CardContent className="p-6">
                            <div className="text-center space-y-4">
                                <h3 className="text-lg font-semibold" style={{ color: '#004182' }}>
                                    Rate This Copy
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Your feedback helps improve the AI copywriter for everyone
                                </p>

                                <div className="flex justify-center space-x-3 mb-4">
                                    <Button
                                        variant={copyRating === 'excellent' ? 'default' : 'outline'}
                                        size="sm"
                                        className={copyRating === 'excellent' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                        onClick={() => setCopyRating?.('excellent')}
                                    >
                                        <ThumbsUp size={16} className="mr-1" />
                                        Excellent
                                    </Button>
                                    <Button
                                        variant={copyRating === 'good' ? 'default' : 'outline'}
                                        size="sm"
                                        className={copyRating === 'good' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                                        onClick={() => setCopyRating?.('good')}
                                    >
                                        <Star size={16} className="mr-1" />
                                        Good
                                    </Button>
                                    <Button
                                        variant={copyRating === 'poor' ? 'default' : 'outline'}
                                        size="sm"
                                        className={copyRating === 'poor' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                                        onClick={() => setCopyRating?.('poor')}
                                    >
                                        <ThumbsDown size={16} className="mr-1" />
                                        Poor
                                    </Button>
                                </div>

                                {copyRating && (
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Optional: Share specific feedback to help improve the AI..."
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText?.(e.target.value)}
                                            className="min-h-20"
                                        />
                                        <Button
                                            onClick={() => {
                                                if (currentCopyId && copyRating) {
                                                    submitFeedbackMutation.mutate({
                                                        copyId: currentCopyId,
                                                        rating: copyRating,
                                                        feedback: feedbackText || undefined
                                                    });
                                                }
                                            }}
                                            className="w-full text-white"
                                            style={{ backgroundColor: '#004182' }}
                                            disabled={submitFeedbackMutation?.isPending}
                                            size="sm"
                                        >
                                            {submitFeedbackMutation?.isPending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Feedback'
                                            )}
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