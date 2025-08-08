import {
    Card,
    CardContent
} from '@/components/ui/card';
import {
    Button
} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Label
} from '@/components/ui/label';
import {
    Input
} from '@/components/ui/input';
import {
    Badge
} from '@/components/ui/badge';
import {
    Camera,
    Upload,
    Target,
    Check,
    X,
    Copy,
    Settings,
    Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import { ProductSelection } from '@/components/common/ProductSelection';
import { TargetPersona } from '../../../common/TargetPersona';

interface StaticAdTabProps {
    personas: any;
      persona: string;
  setPersona: (value: string) => void;
    // Add static ad specific props
    staticAdImage?: string;
    setStaticAdImage?: (value: string) => void;
    staticAdImagePreview?: string;
    setStaticAdImagePreview?: (value: string) => void;
    staticAdAnalysis?: string;
    setStaticAdAnalysis?: (value: string) => void;
    analyzeStaticAdMutation?: any;
    getGenerationDisabledState?: (stationType: string) => { disabled: boolean; reason: string };
    copyToClipboard?: (text: string, type: string) => void;
    selectedProducts?: string[];
    setSelectedProducts?: (value: string[]) => void;
    products?: any;
    brandDrBalance?: number;
    
    // View Details functionality
    setCurrentGenerationMetadata?: (metadata: any) => void;
    setShowGenerationDetails?: (show: boolean) => void;
    modelSettings?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    };
    stationPrompts?: {
        staticAd?: {
            systemPrompt?: string;
        };
    };
    brandGuidelines?: {
        guidelines?: string[];
    };
    copyFrameworks?: {
        staticAd?: {
            frameworks?: string[];
        };
    };
    debugInfo?: {
        systemPrompt: string;
        userPrompt: string;
        requestPayload: any;
        rawResponse: string;
    } | null;
}

export const StaticAdTab = ({
    personas,
      persona,
  setPersona,
    staticAdImage,
    setStaticAdImage,
    staticAdImagePreview,
    setStaticAdImagePreview,
    staticAdAnalysis,
    setStaticAdAnalysis,
    analyzeStaticAdMutation,
    getGenerationDisabledState,
    copyToClipboard,
    selectedProducts = [],
    setSelectedProducts,
    products = {},
    brandDrBalance,
    setCurrentGenerationMetadata,
    setShowGenerationDetails,
    modelSettings,
    stationPrompts,
    brandGuidelines,
    copyFrameworks,
    debugInfo
}: StaticAdTabProps) => {
    const [analysisFocus, setAnalysisFocus] = useState('comprehensive');
    const [outputFormat, setOutputFormat] = useState('analysis-variations');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file (JPG, PNG, etc.)');
            return;
        }

        // Validate file size (8MB limit for better processing)
        if (file.size > 8 * 1024 * 1024) {
            alert('File size must be less than 8MB. For best results, try to keep images under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                // Store base64 data without the data URI prefix for API
                const base64Data = result.split(',')[1];
                setStaticAdImage?.(base64Data);
                // Keep full data URI for preview
                setStaticAdImagePreview?.(result);
            }
        };
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
        
        // Reset the input value to allow re-uploading the same file
        event.target.value = '';
    };

    const handleRemoveImage = () => {
        setStaticAdImage?.('');
        setStaticAdImagePreview?.('');
        setStaticAdAnalysis?.('');
    };

    const handleAnalyzeAd = () => {
        console.log('handleAnalyzeAd called', {
            hasStaticAdImage: !!staticAdImage,
            hasMutation: !!analyzeStaticAdMutation,
            hasMutateFunction: !!analyzeStaticAdMutation?.mutate,
            persona,
            analysisFocus,
            outputFormat,
            selectedProducts
        });
        
        if (analyzeStaticAdMutation?.mutate) {
            console.log('Calling mutation with params:', {
                persona,
                analysisFocus,
                outputFormat,
                selectedProducts: selectedProducts || []
            });
            
            analyzeStaticAdMutation.mutate({
                persona,
                analysisFocus,
                outputFormat,
                selectedProducts: selectedProducts || []
            });
        } else {
            console.error('analyzeStaticAdMutation or mutate function not available', {
                analyzeStaticAdMutation
            });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Section */}
            <div className="space-y-4 sm:space-y-6">
                {/* Image Upload Section */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Camera className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Upload Ad Image
                        </h3>

                        <div className="space-y-4">
                            {!staticAdImagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-jones-primary transition-colors">
                                    <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-900">Upload an ad image to analyze</p>
                                        <p className="text-xs text-gray-500">
                                            JPG, PNG, or GIF up to 8MB. For best results, use high-quality images.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <Label htmlFor="static-ad-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-jones-primary hover:bg-jones-secondary text-white rounded-md transition-colors">
                                            <Upload size={16} className="mr-2" />
                                            Choose Image
                                        </Label>
                                        <Input
                                            id="static-ad-upload"
                                            type="file"
                                            className="sr-only"
                                            accept=".jpg,.jpeg,.png,.gif,.webp"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={staticAdImagePreview}
                                        alt="Uploaded ad"
                                        className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Options */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Analysis Settings
                        </h3>

                        <div className="space-y-4">
                            <TargetPersona
                                personas={personas}
                                                persona={persona}
                setPersona={setPersona}
                                showCard={false}
                                showIcon={false}
                                placeholder="Select persona"
                            />

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2">Analysis Focus</Label>
                                <Select value={analysisFocus} onValueChange={setAnalysisFocus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                                        <SelectItem value="copy-focused">Copy-Focused</SelectItem>
                                        <SelectItem value="design-focused">Design-Focused</SelectItem>
                                        <SelectItem value="performance-prediction">Performance Prediction</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2">Output Format</Label>
                                <Select value={outputFormat} onValueChange={setOutputFormat}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="analysis-variations">Analysis + Variations</SelectItem>
                                        <SelectItem value="analysis-only">Analysis Only</SelectItem>
                                        <SelectItem value="variations-only">Variations Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Focus Section */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Product Focus
                        </h3>

                        <ProductSelection
                            selectedProducts={selectedProducts || []}
                            setSelectedProducts={setSelectedProducts || (() => {})}
                            products={products}
                            title="Product Focus (Multi-Select)"
                            description="Choose products that are featured in the ad. This helps provide more accurate analysis and better variations."
                        />
                    </CardContent>
                </Card>

                <Button
                    onClick={() => {
                        console.log('Button clicked!');
                        handleAnalyzeAd();
                    }}
                    disabled={!staticAdImage || analyzeStaticAdMutation?.isPending || getGenerationDisabledState?.('staticAd')?.disabled}
                    className="w-full text-white"
                    style={{ backgroundColor: '#004182' }}
                >
                    {analyzeStaticAdMutation?.isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Camera className="mr-2" size={16} />
                            Analyze Static Ad
                        </>
                    )}
                </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-4 sm:space-y-6">
                {staticAdAnalysis ? (
                    <div className="space-y-4">
                        {(() => {
                            try {
                                // Try to parse as JSON first
                                const parsedResult = JSON.parse(staticAdAnalysis);
                                
                                return (
                                    <>
                                        {/* Analysis Section */}
                                        {parsedResult.analysis && (
                                            <Card>
                                                <CardContent className="p-4 sm:p-6">
                                                    <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                                            <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                                            Ad Analysis
                                                        </h3>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => copyToClipboard?.(parsedResult.analysis, 'analysis')}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                <Copy size={16} />
                                                                <span className="ml-1">Copy</span>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setCurrentGenerationMetadata?.({
                                                                        stationName: 'Static Ad Analysis',
                                                                        timestamp: new Date().toISOString(),
                                                                        modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                                                                        temperature: modelSettings?.temperature || 0.7,
                                                                        maxTokens: modelSettings?.maxTokens || 2000,
                                                                        systemPrompt: debugInfo?.systemPrompt || stationPrompts?.staticAd?.systemPrompt || 'Expert static ad analyzer for Jones Road Beauty...',
                                                                        userPrompt: debugInfo?.userPrompt || `Analysis Focus: ${analysisFocus}\nOutput Format: ${outputFormat}\nTarget Persona: ${persona}\nSelected Products: ${selectedProducts.join(', ')}`,
                                                                        requestPayload: debugInfo?.requestPayload,
                                                                        rawResponse: debugInfo?.rawResponse
                                                                    });
                                                                    setShowGenerationDetails?.(true);
                                                                }}
                                                                className="flex items-center space-x-1 text-xs"
                                                            >
                                                                <Settings size={14} />
                                                                <span>View Details</span>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                                                            {parsedResult.analysis}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Variations Section */}
                                        {parsedResult.variations && parsedResult.variations.length > 0 && (
                                            <Card>
                                                <CardContent className="p-4 sm:p-6">
                                                    <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                                            <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                                            Copy Variations ({parsedResult.variations.length})
                                                        </h3>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const allVariations = parsedResult.variations.map((v: any, i: number) => 
                                                                        `VARIATION ${i + 1} (${v.framework || 'Framework'}):\n\nHeadline: ${v.headline}\n\n${v.primaryText}`
                                                                    ).join('\n\n---\n\n');
                                                                    copyToClipboard?.(allVariations, 'all-variations');
                                                                }}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                <Copy size={16} />
                                                                <span className="ml-1">Copy All</span>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {parsedResult.variations.map((variation: any, index: number) => (
                                                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center space-x-3">
                                                                        <Badge variant="secondary" className="text-xs font-medium">
                                                                            Variation {index + 1}
                                                                        </Badge>
                                                                        {variation.framework && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {variation.framework}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const variationText = `Headline: ${variation.headline}\n\n${variation.primaryText}`;
                                                                            copyToClipboard?.(variationText, `variation-${index + 1}`);
                                                                        }}
                                                                        className="h-8 px-2"
                                                                    >
                                                                        <Copy size={14} />
                                                                    </Button>
                                                                </div>
                                                                
                                                                <div className="space-y-3">
                                                                    {variation.headline && (
                                                                        <div>
                                                                            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                                                Headline
                                                                            </Label>
                                                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                                                {variation.headline}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {variation.primaryText && (
                                                                        <div>
                                                                            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                                                Primary Text
                                                                            </Label>
                                                                            <p className="text-sm text-gray-800 leading-relaxed mt-1">
                                                                                {variation.primaryText}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                );
                            } catch (error) {
                                // If parsing fails, display as plain text (fallback)
                                return (
                                    <Card>
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                                    <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                                                    Ad Analysis
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard?.(staticAdAnalysis, 'static-ad-analysis')}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <Copy size={16} />
                                                        <span className="ml-1">Copy</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!staticAdAnalysis}
                                                        onClick={() => {
                                                            setCurrentGenerationMetadata?.({
                                                                stationName: 'Static Ad Analysis',
                                                                timestamp: new Date().toISOString(),
                                                                modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                                                                temperature: modelSettings?.temperature || 0.7,
                                                                maxTokens: modelSettings?.maxTokens || 2000,
                                                                systemPrompt: debugInfo?.systemPrompt || stationPrompts?.staticAd?.systemPrompt || 'Expert static ad analyzer for Jones Road Beauty...',
                                                                userPrompt: debugInfo?.userPrompt || `Analysis Focus: ${analysisFocus}\nOutput Format: ${outputFormat}\nTarget Persona: ${persona}\nSelected Products: ${selectedProducts.join(', ')}`,
                                                                requestPayload: debugInfo?.requestPayload,
                                                                rawResponse: debugInfo?.rawResponse
                                                            });
                                                            setShowGenerationDetails?.(true);
                                                        }}
                                                        className="flex items-center space-x-1 text-xs"
                                                    >
                                                        <Settings size={14} />
                                                        <span>View Details</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                                                    {staticAdAnalysis}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }
                        })()}
                    </div>
                ) : analyzeStaticAdMutation?.isPending ? (
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="text-center py-12">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="flex space-x-1">
                                        <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                                <p className="text-gray-600 font-medium mb-2">Analyzing Your Ad</p>
                                <p className="text-sm text-gray-500">
                                    Using AI to analyze your ad creative and generate insights...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="text-center py-12">
                                <Camera size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-600 font-medium mb-2">Upload an Ad to Analyze</p>
                                <p className="text-sm text-gray-500">
                                    Upload an ad image to get AI-powered analysis and copy variations
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}; 