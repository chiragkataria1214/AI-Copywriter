import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Target, Zap, Upload, Link, Sparkles, Copy, Check, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export const ProductLaunchTabs = (props: any) => {
    return (
        <Tabs value={props.productLaunchSubTab} onValueChange={props.setProductLaunchSubTab} className="w-full">
            <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-3 w-auto">
                    <TabsTrigger value="brief-creation" className="flex items-center space-x-2">
                        <FileText size={16} />
                        <span>Brief Creation</span>
                    </TabsTrigger>
                    <TabsTrigger value="integrated-strategy" className="flex items-center space-x-2">
                        <Target size={16} />
                        <span>Integrated Strategy</span>
                    </TabsTrigger>
                    <TabsTrigger value="launch-copy-output" className="flex items-center space-x-2">
                        <Zap size={16} />
                        <span>Launch Copy Output</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* Brief Creation Sub-Tab */}
            <TabsContent value="brief-creation">
                <BriefCreationTab {...props} />
            </TabsContent>

            {/* Integrated Strategy Sub-Tab */}
            <TabsContent value="integrated-strategy">
                <ComingSoonTab 
                    title="Integrated Strategy" 
                    description="Create comprehensive launch strategies across all marketing channels."
                />
            </TabsContent>

            {/* Launch Copy Output Sub-Tab */}
            <TabsContent value="launch-copy-output">
                <ComingSoonTab 
                    title="Launch Copy Output" 
                    description="Generate cohesive copy for all launch touchpoints and campaigns."
                />
            </TabsContent>
        </Tabs>
    );
};

// Brief Creation Tab Component
const BriefCreationTab = (props: any) => {
    const [notes, setNotes] = useState('');
    const [googleDriveLinks, setGoogleDriveLinks] = useState<string[]>([]);
    const [newGoogleDriveLink, setNewGoogleDriveLink] = useState('');
    const [generatedBrief, setGeneratedBrief] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedBrief, setCopiedBrief] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
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

    const addGoogleDriveLink = () => {
        if (newGoogleDriveLink.trim()) {
            setGoogleDriveLinks([...googleDriveLinks, newGoogleDriveLink.trim()]);
            setNewGoogleDriveLink('');
        }
    };

    const removeGoogleDriveLink = (index: number) => {
        setGoogleDriveLinks(googleDriveLinks.filter((_, i) => i !== index));
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedBrief(true);
            toast({ title: "Copied to clipboard!" });
            setTimeout(() => setCopiedBrief(false), 2000);
        } catch (err) {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const generateBrief = async () => {
        if (!notes.trim()) {
            toast({ title: "Please add some notes or meeting transcripts", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const data = await apiRequest('/api/generate-brief', {
                method: 'POST',
                body: {
                    notes,
                    googleDriveLinks,
                    selectedProducts: selectedProducts, // Changed from selectedProduct to selectedProducts
                    concept: props.concept,
                    brandDrBalance: props.brandDrBalance,
                    useJonesBrandGuide: props.useJonesBrandGuide
                }
            });

            setGeneratedBrief(data.brief);
            
            // Store briefId for potential future feedback functionality
            if (data.briefId) {
                console.log('Brief saved with ID:', data.briefId);
            }
            
            toast({ title: "Brief generated successfully!" });
        } catch (error) {
            console.error('Brief generation error:', error);
            toast({ 
                title: "Error generating brief", 
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                variant: "destructive" 
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notes and Meeting Transcripts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText size={20} />
                            <span>Notes & Meeting Transcripts</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="notes">Meeting Notes, Bullet Points, Transcripts</Label>
                            <Textarea
                                id="notes"
                                placeholder="Enter your meeting notes, bullet points, or transcribed conversations here...\n\n• Product overview\n• Target audience insights\n• Key objectives\n• Timeline considerations\n• Budget constraints\n• Success metrics"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[300px] mt-2"
                            />
                        </div>
                        
                        {/* Multiple Product Selection */}
                        {props.products && Object.keys(props.products).length > 0 && (
                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                    Products to Feature (Multi-Select)
                                </Label>
                                <p className="text-xs text-gray-500 mb-4">
                                    Select products to include in your product launch brief. You can feature multiple products in a single campaign.
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
                                            const product = props.products[productName];
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
                                                const allProductNames = Object.values(props.products).map((product: any) => product.name);
                                                if (selectedProducts.length === allProductNames.length) {
                                                    setSelectedProducts([]);
                                                } else {
                                                    setSelectedProducts(allProductNames);
                                                }
                                            }}
                                        >
                                            {selectedProducts.length === Object.values(props.products).length ? "Deselect All" : "Select All"}
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
                                                    const allProducts = Object.values(props.products);
                                                    const selectedFromDropdown = selectedProducts.filter(productName => 
                                                        allProducts.some((product: any) => product.name === productName)
                                                    );
                                                    if (selectedFromDropdown.length === 0) {
                                                        return "Choose products...";
                                                    } else if (selectedFromDropdown.length === 1) {
                                                        return props.products[selectedFromDropdown[0]]?.displayName || selectedFromDropdown[0];
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
                                                        const product = props.products[productName];
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
                                                    {Object.values(props.products)
                                                        .filter((product: any) => !['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].includes(product.name))
                                                        .map((product: any) => {
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
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mt-4">
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
                                            {selectedProducts.map((productValue) => {
                                                const productLabel = props.products[productValue]?.displayName || productValue;
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

                                {selectedProducts.length === 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                                        <div className="flex items-center space-x-2 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm">
                                                No products selected - AI will generate general brief without specific product focus
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Past Briefs Reference */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Link size={20} />
                            <span>Past Briefs Reference</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="googleDriveLink">Google Drive Links</Label>
                            <div className="flex space-x-2 mt-2">
                                <Input
                                    id="googleDriveLink"
                                    placeholder="Paste Google Drive link to past brief..."
                                    value={newGoogleDriveLink}
                                    onChange={(e) => setNewGoogleDriveLink(e.target.value)}
                                />
                                <Button 
                                    onClick={addGoogleDriveLink}
                                    variant="outline"
                                    size="icon"
                                >
                                    <Plus size={16} />
                                </Button>
                            </div>
                        </div>
                        
                        {googleDriveLinks.length > 0 && (
                            <div className="space-y-2">
                                <Label>Added References:</Label>
                                {googleDriveLinks.map((link, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm truncate flex-1 mr-2">{link}</span>
                                        <Button
                                            onClick={() => removeGoogleDriveLink(index)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="pt-4 border-t">
                            <Label className="text-sm text-gray-600">Alternative: PDF Upload</Label>
                            <div className="mt-2 p-4 border-2 border-dashed border-gray-200 rounded text-center">
                                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">PDF upload coming soon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Generate Button */}
            <div className="text-center">
                <Button
                    onClick={generateBrief}
                    disabled={isGenerating || !notes.trim()}
                    style={{ backgroundColor: '#004182' }}
                    className="text-white hover:opacity-90"
                    size="lg"
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating Brief...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2" size={16} />
                            Generate Product Launch Brief
                        </>
                    )}
                </Button>
            </div>

            {/* Generated Brief Output */}
            {generatedBrief && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <Zap size={20} />
                                <span>Generated Brief</span>
                            </CardTitle>
                            <Button
                                onClick={() => copyToClipboard(generatedBrief)}
                                variant="outline"
                                size="sm"
                            >
                                {copiedBrief ? (
                                    <>
                                        <Check className="mr-2" size={14} />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2" size={14} />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-sm bg-white border border-gray-200 p-6 rounded-lg text-gray-900 leading-relaxed">
                                {generatedBrief}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// Coming Soon Component
const ComingSoonTab = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Zap size={24} className="text-gray-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h4>
                        <p className="text-gray-500">This feature is currently under development.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};