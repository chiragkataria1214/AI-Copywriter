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
    Camera,
    Upload,
    Target,
    Check,
    X,
    Copy,
    Settings
} from 'lucide-react';
import { useState } from 'react';

interface StaticAdTabProps {
    personas: any;
    concept: string;
    setConcept: (value: string) => void;
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
    selectedProduct?: any;
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
}

export const StaticAdTab = ({
    personas,
    concept,
    setConcept,
    staticAdImage,
    setStaticAdImage,
    staticAdImagePreview,
    setStaticAdImagePreview,
    staticAdAnalysis,
    setStaticAdAnalysis,
    analyzeStaticAdMutation,
    getGenerationDisabledState,
    copyToClipboard,
    selectedProduct,
    brandDrBalance,
    setCurrentGenerationMetadata,
    setShowGenerationDetails,
    modelSettings,
    stationPrompts,
    brandGuidelines,
    copyFrameworks
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
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setStaticAdImage?.('');
        setStaticAdImagePreview?.('');
        setStaticAdAnalysis?.('');
    };

    const handleAnalyzeAd = () => {
        if (analyzeStaticAdMutation && staticAdImage) {
            analyzeStaticAdMutation.mutate({ outputFormat, analysisFocus });
        }
    };

    const isAnalyzeDisabled = !staticAdImage || 
        analyzeStaticAdMutation?.isPending || 
        getGenerationDisabledState?.('staticAd')?.disabled;

    const getButtonText = () => {
        if (analyzeStaticAdMutation?.isPending) return 'Analyzing...';
        if (!staticAdImage) return 'Upload Image First';
        return 'Analyze Ad & Generate Variations';
    };

    const getDisabledReason = () => {
        if (!staticAdImage) return 'Please upload an image first';
        return getGenerationDisabledState?.('staticAd')?.reason;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Section */}
            <div className="space-y-4 sm:space-y-6">
                {/* Upload Section */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Camera className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Upload Ad Creative
                        </h3>

                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Static Ad Image
                                </Label>
                                
                                {!staticAdImagePreview ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="static-ad-upload"
                                            onChange={handleImageUpload}
                                        />
                                        <label htmlFor="static-ad-upload" className="cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-sm text-gray-600">
                                                Click to upload an ad image (JPG, PNG)
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Max file size: 10MB
                                            </p>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={staticAdImagePreview}
                                            alt="Uploaded ad"
                                            className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={handleRemoveImage}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
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
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Target Persona</Label>
                                <Select value={concept} onValueChange={setConcept}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select persona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(personas).map(([key, persona]) => (
                                            <SelectItem key={key} value={key}>{(persona as any).label || key}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">Analysis Focus</Label>
                                <Select value={analysisFocus} onValueChange={setAnalysisFocus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="visual">Visual Design Analysis</SelectItem>
                                        <SelectItem value="copy">Copy Effectiveness</SelectItem>
                                        <SelectItem value="adaptation">Jones Road Adaptation</SelectItem>
                                        <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700">Output Format</Label>
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

                <Button 
                    className="w-full flex items-center justify-center space-x-2" 
                    disabled={isAnalyzeDisabled}
                    onClick={handleAnalyzeAd}
                >
                    <Camera size={16} />
                    <span>{getButtonText()}</span>
                </Button>

                {isAnalyzeDisabled && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                        {getDisabledReason()}
                    </p>
                )}
            </div>

            {/* Preview/Results Section */}
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardContent className="p-6">
                        {analyzeStaticAdMutation?.isPending ? (
                            <div className="text-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-jones-light border-t-jones-primary mx-auto mb-4"></div>
                                    <Camera size={32} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-jones-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Analyzing Your Ad</h3>
                                <p className="text-gray-500 mb-4">
                                    Our AI is examining the visual elements, copy effectiveness, and brand alignment...
                                </p>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span>Processing</span>
                                </div>
                            </div>
                        ) : !staticAdAnalysis ? (
                            <div className="text-center py-16">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-jones-light to-jones-secondary rounded-full mx-auto flex items-center justify-center">
                                        <Camera size={40} className="text-jones-primary" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Target size={16} className="text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Static Ad Analysis</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Upload any static ad to get detailed analysis and Jones Road Beauty variations
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                                    <div className="flex items-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                                        <Check size={16} className="mr-2 text-green-500 flex-shrink-0" />
                                        <span>Visual design breakdown</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                                        <Check size={16} className="mr-2 text-green-500 flex-shrink-0" />
                                        <span>Copy effectiveness scoring</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                                        <Check size={16} className="mr-2 text-green-500 flex-shrink-0" />
                                        <span>Jones Road brand adaptations</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                                        <Check size={16} className="mr-2 text-green-500 flex-shrink-0" />
                                        <span>Competitive positioning insights</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard?.(staticAdAnalysis, 'static-analysis')}
                                        >
                                            <Copy size={16} className="mr-2" />
                                            Copy All
                                        </Button>
                                        {setCurrentGenerationMetadata && setShowGenerationDetails && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setCurrentGenerationMetadata({
                                                        stationName: 'Static Ad Analysis',
                                                        timestamp: new Date().toISOString(),
                                                        modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                                                        temperature: modelSettings?.temperature || 0.7,
                                                        maxTokens: modelSettings?.maxTokens || 2000,
                                                        systemPrompt: stationPrompts?.staticAd?.systemPrompt || 'Expert static ad analyzer for Jones Road Beauty...',
                                                        userPrompt: `Analysis Focus: ${analysisFocus}\nOutput Format: ${outputFormat}\nTarget Persona: ${concept}\nSelected Product: ${selectedProduct}`,
                                                        requestPayload: null,
                                                        rawResponse: null
                                                    });
                                                    setShowGenerationDetails(true);
                                                }}
                                                className="flex items-center space-x-1 text-xs"
                                            >
                                                <Settings size={12} />
                                                <span>View Details</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Try to parse JSON response and display structured results */}
                                {(() => {
                                    try {
                                        const jsonMatch = staticAdAnalysis.match(/\{[\s\S]*\}/);
                                        const jsonString = jsonMatch ? jsonMatch[0] : null;
                                        
                                        if (jsonString) {
                                            const parsedData = JSON.parse(jsonString);
                                            
                                            return (
                                                <div className="space-y-6">
                                                    {/* Analysis Section */}
                                                    {parsedData.analysis && (
                                                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
                                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/30 rounded-full -ml-12 -mb-12"></div>
                                                            <div className="flex items-center mb-6 relative z-10">
                                                                <div className="bg-white rounded-full p-3 shadow-sm mr-4">
                                                                    <Target className="text-blue-600" size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xl font-bold text-blue-900">Ad Analysis</h4>
                                                                    <p className="text-sm text-blue-700">Comprehensive breakdown of ad effectiveness</p>
                                                                </div>
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50 shadow-sm">
                                                                    <div className="prose prose-blue max-w-none">
                                                                        <div className="text-blue-900 leading-relaxed whitespace-pre-wrap text-base">
                                                                            {parsedData.analysis}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Variations Section */}
                                                    {parsedData.variations && parsedData.variations.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center mb-6">
                                                                <div className="flex items-center">
                                                                    <Camera className="text-jones-primary mr-3" size={20} />
                                                                    <h4 className="text-lg font-semibold text-gray-900">Jones Road Beauty Variations</h4>
                                                                </div>
                                                                <div className="ml-auto bg-jones-light text-jones-primary px-3 py-1 rounded-full text-xs font-medium">
                                                                    {parsedData.variations.length} variations
                                                                </div>
                                                            </div>
                                                            <div className="grid gap-6">
                                                                {parsedData.variations.map((variation: any, index: number) => (
                                                                    <div key={index} className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-jones-primary/20 transition-all duration-200">
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <div className="flex items-center">
                                                                                <div className="bg-gradient-to-r from-jones-primary to-jones-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 shadow-sm">
                                                                                    {index + 1}
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-xs font-medium text-jones-primary bg-jones-light px-3 py-1 rounded-full">
                                                                                        {variation.framework || 'Framework'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-jones-light"
                                                                                onClick={() => {
                                                                                    const variationText = `Headline: ${variation.headline}\n\nPrimary Text: ${variation.primaryText}\n\nFramework: ${variation.framework}`;
                                                                                    copyToClipboard?.(variationText, `variation-${index + 1}`);
                                                                                }}
                                                                            >
                                                                                <Copy size={14} className="mr-1" />
                                                                                <span className="text-xs">Copy</span>
                                                                            </Button>
                                                                        </div>
                                                                        
                                                                        {variation.headline && (
                                                                            <div className="mb-6">
                                                                                <Label className="text-sm font-semibold text-gray-800 mb-3 block flex items-center">
                                                                                    <div className="w-2 h-2 bg-jones-primary rounded-full mr-2"></div>
                                                                                    Headline
                                                                                </Label>
                                                                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-jones-primary relative overflow-hidden">
                                                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-jones-primary/5 rounded-full -mr-10 -mt-10"></div>
                                                                                    <p className="font-semibold text-gray-900 leading-relaxed text-lg relative z-10">
                                                                                        "{variation.headline}"
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {variation.primaryText && (
                                                                            <div>
                                                                                <Label className="text-sm font-semibold text-gray-800 mb-3 block flex items-center">
                                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                                                    Primary Text
                                                                                </Label>
                                                                                <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
                                                                                    <div className="absolute top-2 right-2 text-xs text-gray-400">
                                                                                        {variation.primaryText.split(' ').length} words
                                                                                    </div>
                                                                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap pr-16">
                                                                                        {variation.primaryText}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    } catch (parseError) {
                                        // Fallback to plain text display
                                    }
                                    
                                    // Fallback: Display as formatted plain text
                                    return (
                                        <div className="bg-gray-50 rounded-lg p-6 border">
                                            <div className="prose max-w-none">
                                                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                                                    {staticAdAnalysis}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}; 