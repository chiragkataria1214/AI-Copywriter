import { useState } from 'react';
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
                    selectedProduct: props.selectedProduct,
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
                        
                        {/* Product Selection */}
                        {props.products && Object.keys(props.products).length > 0 && (
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Product Focus (Optional)</Label>
                                <p className="text-sm text-gray-600 mb-3">
                                    Select a product to include specific product claims and benefits in your brief.
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['miracle-balm', 'what-the-foundation', 'the-mascara', 'just-enough-tinted-moisturizer', 'everyday-sunscreen-broad-spectrum-spf-30'].map((productName) => {
                                        const product = props.products[productName];
                                        if (!product) return null;
                                        
                                        const isSelected = props.selectedProduct === productName;
                                        return (
                                            <button
                                                key={productName}
                                                onClick={() => props.setSelectedProduct && props.setSelectedProduct(isSelected ? '' : productName)}
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
                                        <Select value={props.selectedProduct || "all"} onValueChange={(value) => props.setSelectedProduct && props.setSelectedProduct(value === "all" ? "" : value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All products (no filtering)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All products</SelectItem>
                                                {Object.entries(props.products).map(([key, product]: [string, any]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {product.displayName || product.name || key}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {props.selectedProduct && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-5 h-5 bg-[#004182] rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                AI will use product-specific claims and benefits for <strong>{props.products[props.selectedProduct]?.displayName || props.selectedProduct}</strong>
                                            </span>
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