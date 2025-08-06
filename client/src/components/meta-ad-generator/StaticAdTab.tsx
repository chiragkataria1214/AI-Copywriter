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
import React, { useState, useRef, useEffect } from 'react';

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
        if (analyzeStaticAdMutation?.mutate) {
            analyzeStaticAdMutation.mutate({
                concept,
                analysisFocus,
                outputFormat,
                selectedProducts: selectedProducts || []
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

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                    Quick Select - Popular Products
                                </Label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Choose products that are featured in the ad. This helps provide more accurate analysis and better variations.
                                </p>
                                
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-xs font-medium text-gray-600">Top Products</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-blue-600 hover:text-blue-800 h-auto p-1"
                                            onClick={() => {
                                                const topProducts = ['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'];
                                                const allTopSelected = topProducts.every(product => selectedProducts.includes(product));
                                                
                                                if (allTopSelected) {
                                                    // Deselect all top products
                                                    setSelectedProducts?.(selectedProducts.filter(p => !topProducts.includes(p)));
                                                } else {
                                                    // Select all top products
                                                    const newSelection = [...new Set([...selectedProducts, ...topProducts])];
                                                    setSelectedProducts?.(newSelection);
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
                                                            setSelectedProducts?.(selectedProducts.filter(p => p !== productName));
                                                        } else {
                                                            setSelectedProducts?.([...selectedProducts, productName]);
                                                        }
                                                    }}
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
                                                    setSelectedProducts?.([]);
                                                } else {
                                                    setSelectedProducts?.(allProductNames);
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
                                                                        setSelectedProducts?.(selectedProducts.filter(p => p !== productName));
                                                                    } else {
                                                                        setSelectedProducts?.([...selectedProducts, productName]);
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
                                                        .filter(([key]) => !['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].includes(key))
                                                        .map(([key, product]) => {
                                                            const isSelected = selectedProducts.includes(key);
                                                            return (
                                                                <div
                                                                    key={key}
                                                                    className="flex items-center px-1 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (selectedProducts.includes(key)) {
                                                                            setSelectedProducts?.(selectedProducts.filter(p => p !== key));
                                                                        } else {
                                                                            setSelectedProducts?.([...selectedProducts, key]);
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
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 bg-[#004182] rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-[#004182]">
                                                    {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''} Selected
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 h-6 px-2"
                                                onClick={() => setSelectedProducts?.([])}
                                            >
                                                Clear all
                                            </Button>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProducts.map((productName) => {
                                                const productLabel = products[productName]?.displayName || productName;
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
                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm">
                                                No products selected - analysis will be general without product-specific insights
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    onClick={handleAnalyzeAd}
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
                            <Target className="mr-2" size={16} />
                            Analyze Ad
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
                                                                        userPrompt: debugInfo?.userPrompt || `Analysis Focus: ${analysisFocus}\nOutput Format: ${outputFormat}\nTarget Persona: ${concept}\nSelected Products: ${selectedProducts.join(', ')}`,
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
                                                                userPrompt: debugInfo?.userPrompt || `Analysis Focus: ${analysisFocus}\nOutput Format: ${outputFormat}\nTarget Persona: ${concept}\nSelected Products: ${selectedProducts.join(', ')}`,
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