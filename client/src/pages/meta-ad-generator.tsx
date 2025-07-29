import { useState, useEffect } from 'react';
import { Upload, Copy, Check, Target, Sparkles, Video, FileText, Zap, ThumbsUp, ThumbsDown, Star, Globe, List, AlertCircle, Palette, Users, Settings, LogOut, User, Database, Brain, BarChart3, Camera, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ProductSelection } from "@/components/ProductSelection";

export default function MetaAdGenerator() {
  const [activeTab, setActiveTab] = useState('ads');
  
  // Admin key protection for AI Settings
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  
  // Core application states
  const [transcription, setTranscription] = useState('');
  const [airLink, setAirLink] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [customBrief, setCustomBrief] = useState('');
  const [concept, setConcept] = useState('lifeJuggler');
  const [subPersona, setSubPersona] = useState('newMom');
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Ad Copy States
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  const [selectedHeadlineIndex, setSelectedHeadlineIndex] = useState<number>(0);
  
  // Feedback states for analytics
  const [currentCopyId, setCurrentCopyId] = useState<string | null>(null);
  const [copyRating, setCopyRating] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Revision states
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [selectedItemForRevision, setSelectedItemForRevision] = useState<{
    type: 'headline' | 'primaryText' | 'landingCopy' | 'custom';
    index?: number;
    field?: string;
  } | null>(null);
  
  // Debug States
  const [debugInfo, setDebugInfo] = useState<{
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null>(null);
  
  // UI States
  const [copiedHeadlines, setCopiedHeadlines] = useState(false);
  const [copiedPrimaryText, setCopiedPrimaryText] = useState(false);
  const [copiedLandingCopy, setCopiedLandingCopy] = useState(false);
  const [copiedStatic, setCopiedStatic] = useState(false);
  const [copiedCreativeBrief, setCopiedCreativeBrief] = useState(false);
  const [useJonesBrandGuide, setUseJonesBrandGuide] = useState(true);
  const [brandDrBalance, setBrandDrBalance] = useState([50]);
  
  // Landing Page States
  const [landingPageType, setLandingPageType] = useState('listicle');
  const [useAdsForLanding, setUseAdsForLanding] = useState(false);
  const [adsContent, setAdsContent] = useState('');
  const [productBrief, setProductBrief] = useState('');
  const [mainAngle, setMainAngle] = useState('');
  const [generatedLandingCopy, setGeneratedLandingCopy] = useState<{
    headline: string;
    subheadline: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    socialProof: string;
    riskReversal: string;
    conclusion: string;
    cta: string;
  }>({
    headline: '',
    subheadline: '',
    introduction: '',
    sections: [],
    socialProof: '',
    riskReversal: '',
    conclusion: '',
    cta: ''
  });

  const [landingPageAnalysis, setLandingPageAnalysis] = useState<{
    headlineLength: string;
    conversionScore: number;
    readabilityScore: string;
    totalWords: number;
    sectionCount: number;
    avgSectionLength: number;
    hasRiskReversal: boolean;
    productSpecific: boolean;
  } | null>(null);

  // Custom Request States
  const [customRequest, setCustomRequest] = useState('');
  const [customRequestHistory, setCustomRequestHistory] = useState<Array<{
    request: string;
    response: string;
    timestamp: Date;
  }>>([]);
  const [generatedCustomResponse, setGeneratedCustomResponse] = useState('');
  
  // Launch Brief state
  const [launchBrief, setLaunchBrief] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [generatedLaunchCopy, setGeneratedLaunchCopy] = useState<{[key: string]: string}>({});
  const [briefSource, setBriefSource] = useState<'paste' | 'upload' | 'drive'>('paste');
  
  // Launch tab navigation state
  const [launchSubTab, setLaunchSubTab] = useState('creative-brief');

  // Creative Brief Generator States
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingTranscription, setMeetingTranscription] = useState('');
  const [creativeBriefSource, setCreativeBriefSource] = useState<'paste' | 'upload' | 'drive'>('paste');
  const [generatedCreativeBrief, setGeneratedCreativeBrief] = useState('');
  const [creativeBriefDriveLink, setCreativeBriefDriveLink] = useState('');

  // Strategy Planning States
  const [strategyBrief, setStrategyBrief] = useState('');
  const [strategyDriveLink, setStrategyDriveLink] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [generatedStrategies, setGeneratedStrategies] = useState<{[key: string]: any}>({});
  const [strategyBriefSource, setStrategyBriefSource] = useState<'paste' | 'upload' | 'drive'>('paste');

  // Static Ad Analysis States
  const [staticAdImage, setStaticAdImage] = useState('');
  const [staticAdImagePreview, setStaticAdImagePreview] = useState('');
  const [staticAdAnalysis, setStaticAdAnalysis] = useState('');

  // BYPASS AUTHENTICATION - Direct access mode for all copywriting features
  const effectiveUser = {
    username: 'user@jonesroadbeauty.com',
    role: hasAdminAccess ? 'admin' : 'user',
    isAdmin: hasAdminAccess
  };

  // Ultra-simple transcription handler 
  const handleTranscriptionChange = (value: string) => {
    console.log('PARENT: Transcription change received, length:', value.length);
    setTranscription(value);
    console.log('PARENT: State update completed');
  };

  // Completely static transcription preview to eliminate all re-render possibilities
  const getTranscriptionPreview = () => {
    if (!transcription) return '';
    if (transcription.length <= 200) return transcription;
    return transcription.substring(0, 200) + '...';
  };

  // API mutations for generating copy
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        transcription,
        customBrief,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance: brandDrBalance[0],
        useJonesBrandGuide,
        airLink,
        uploadedImage,
        selectedProduct
      };
      
      const result = await apiRequest('/api/generate-ad-copy', {
        method: 'POST',
        body: payload
      });
      
      return result;
    },
    onSuccess: (data) => {
      setGeneratedHeadlines(data.headlines || []);
      setGeneratedPrimaryText(data.primaryText || '');
      setCurrentCopyId(data.copyId || null);
      setSelectedHeadlineIndex(0);
      setCopyRating(null);
      setFeedbackText('');
      toast({
        title: "Ad Copy Generated Successfully",
        description: "Your ad copy has been generated using Claude AI.",
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateLandingPageMutation = useMutation({
    mutationFn: async () => {
      const useAdsForLanding = false;
      const chosenAdsContent = useAdsForLanding ? 
        `Headlines: ${generatedHeadlines.map(h => h.copy).join(', ')}\nPrimary Text: ${generatedPrimaryText}` : 
        adsContent;

      return await apiRequest('/api/generate-landing-copy', {
        method: 'POST',
        body: {
          landingPageType,
          productBrief,
          concept,
          subPersona,
          useAdsContent: useAdsForLanding,
          adsContent: chosenAdsContent,
          brandDrBalance: brandDrBalance[0],
          selectedProduct: landingPageType === 'multiProduct' ? selectedProducts.join(',') : selectedProduct,
          mainAngle,
          transcription: useAdsForLanding ? transcription : undefined
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedLandingCopy(data.landingCopy || {
        headline: '',
        subheadline: '',
        introduction: '',
        sections: [],
        socialProof: '',
        riskReversal: '',
        conclusion: '',
        cta: ''
      });
      setLandingPageAnalysis(data.analysis || null);
      toast({
        title: "Landing Page Copy Generated Successfully",
        description: `Generated ${data.analysis?.sectionCount || 0} sections with ${data.analysis?.conversionScore || 0}/100 conversion score.`,
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate landing page copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateCustomCopyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-custom-copy', {
        method: 'POST',
        body: {
          customRequest,
          concept,
          subPersona,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          useJonesBrandGuide
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedCustomResponse(data.response || '');
      setCustomRequestHistory(prev => [{
        request: customRequest,
        response: data.response || '',
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);
      toast({
        title: "Custom Copy Generated",
        description: "Your custom copy request has been completed.",
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate custom copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateCreativeBriefMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-creative-brief', {
        method: 'POST',
        body: {
          meetingNotes,
          meetingTranscription
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedCreativeBrief(data.creativeBrief || '');
      toast({
        title: "Creative Brief Generated",
        description: "Your creative brief has been generated from the meeting notes.",
      });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate creative brief. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: `${type} copied successfully.`,
      });
      
      // Set appropriate copied state based on type
      if (type.includes('Headlines')) setCopiedHeadlines(true);
      if (type.includes('Primary Text')) setCopiedPrimaryText(true);
      if (type.includes('Landing')) setCopiedLandingCopy(true);
      if (type.includes('Custom')) setCopiedCreativeBrief(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedHeadlines(false);
        setCopiedPrimaryText(false);
        setCopiedLandingCopy(false);
        setCopiedCreativeBrief(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Define personas with proper TypeScript structure
  const personas = {
    lifeJuggler: {
      label: 'Life Juggler',
      description: 'Busy individuals balancing work, family, and personal life, looking for reliable, time-saving beauty solutions',
      subPersonas: {
        newMom: {
          label: 'New Mom (6 month postpartum)',
          description: 'First time struggling with guilt, no time for self-care, hormone changes',
          valueProps: ['No time', 'Guilt about self-care', 'Hormone changes', 'Ingredient focused']
        },
        repeatMom: {
          label: 'Repeat Mom',
          description: 'Trying to maintain routine, worried about disruption',
          valueProps: ['Stress', 'Fear of losing established routine', 'Time management', 'Consistency needs']
        },
        professionalMom: {
          label: 'Professional Mom',
          description: 'Innovative, checking things off checklist, Type A personality',
          valueProps: ['Busy schedule', 'Guilt about self-care', 'Needs quick solutions', 'Efficiency focused']
        },
        wellnessMom: {
          label: 'Wellness/Stay-at-home Mom',
          description: 'Aspirational persona focused on clean ingredients for whole family',
          valueProps: ['Clean ingredients for family', 'Ingredient research', 'Health conscious', 'Quality focused']
        }
      }
    },
    beautyEnthusiast: {
      label: 'Beauty Enthusiast',
      description: 'Passionate about all things beauty, from trying the latest trends to experimenting with new looks',
      subPersonas: {}
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Copywriter</h1>
        <p className="text-gray-600">Generate professional marketing copy with AI</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {effectiveUser.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveTab('settings')}>
              <Database className="h-4 w-4 mr-2" />
              AI Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveTab('analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Review Analytics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ads">Ad Copy</TabsTrigger>
          <TabsTrigger value="landing">Landing Pages</TabsTrigger>
          <TabsTrigger value="static">Static Ad</TabsTrigger>
          <TabsTrigger value="launch">Launch</TabsTrigger>
          <TabsTrigger value="custom">Custom Request</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Content Input</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="airLink">Air Link or Image URL</Label>
                      <Input
                        id="airLink"
                        placeholder="Add an Air.com link or direct image URL to analyze existing ad creatives"
                        value={airLink}
                        onChange={(e) => setAirLink(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Add an Air.com link or direct image URL to analyze existing ad creatives</p>
                    </div>

                    <div className="text-center text-sm text-gray-500">OR</div>

                    <div className="space-y-2">
                      <Label htmlFor="customBrief">Custom Brief (Optional)</Label>
                      <Textarea
                        id="customBrief"
                        placeholder="These instructions will be included in the AI prompt for this specific generation"
                        value={customBrief}
                        onChange={(e) => setCustomBrief(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-gray-500">These instructions will be included in the AI prompt for this specific generation</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Text
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Target Persona</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Persona</Label>
                      <Select value={concept} onValueChange={setConcept}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(personas).map(([key, persona]) => (
                            <SelectItem key={key} value={key}>
                              {persona.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Sub-Persona</Label>
                      <Select value={subPersona} onValueChange={setSubPersona}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {concept && personas[concept as keyof typeof personas]?.subPersonas && 
                            Object.entries(personas[concept as keyof typeof personas].subPersonas).map(([key, subPers]) => (
                              <SelectItem key={key} value={key}>
                                {(subPers as any).label}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="landingPageUrl">Landing Page URL (Optional)</Label>
                      <Input
                        id="landingPageUrl"
                        placeholder="Provide your existing landing page URL to ensure ad copy aligns with your landing page messaging"
                        value={landingPageUrl}
                        onChange={(e) => setLandingPageUrl(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Provide your existing landing page URL to ensure ad copy aligns with your landing page messaging</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Partnership Ads</h3>
                  <p className="text-sm text-gray-500 mb-4">Generate copy in the influencer's authentic voice while respecting brand guidelines</p>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="influencer-mode" />
                    <Label htmlFor="influencer-mode">Enable Influencer Mode</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="jones-brand-guide" 
                        checked={useJonesBrandGuide}
                        onCheckedChange={setUseJonesBrandGuide}
                      />
                      <Label htmlFor="jones-brand-guide">Use Jones Brand Guide</Label>
                    </div>
                    <p className="text-sm text-gray-500">Apply Jones Road Beauty brand voice and guidelines</p>

                    <div className="space-y-2">
                      <Label>Brand/DR Balance</Label>
                      <div className="text-sm text-gray-600 mb-2">
                        {brandDrBalance[0]}% Brand / {100 - brandDrBalance[0]}% DR
                      </div>
                      <Slider
                        value={brandDrBalance}
                        onValueChange={setBrandDrBalance}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>All DR</span>
                        <span>Balanced</span>
                        <span>All Brand</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product Focus</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Quick Select - Top Products</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button 
                          variant={selectedProduct === 'miracle-balm' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedProduct('miracle-balm')}
                        >
                          Miracle Balm
                        </Button>
                        <Button 
                          variant={selectedProduct === 'what-the-foundation' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedProduct('what-the-foundation')}
                        >
                          What The Foundation
                        </Button>
                        <Button 
                          variant={selectedProduct === 'just-enough' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedProduct('just-enough')}
                        >
                          Just Enough
                        </Button>
                        <Button 
                          variant={selectedProduct === 'hero-kit' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedProduct('hero-kit')}
                        >
                          The Hero Kit
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Or choose from all products</Label>
                      <ProductSelection 
                        selectedProduct={selectedProduct}
                        onProductChange={setSelectedProduct}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                className="w-full"
                size="lg"
                onClick={() => generateAdCopyMutation.mutate()}
                disabled={generateAdCopyMutation.isPending}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generateAdCopyMutation.isPending ? 'Generating...' : 'Generate Ad Copy'}
              </Button>
            </div>

            {/* Right Column - Generated Content */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Generated Headlines</h3>
                    {generatedHeadlines.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedHeadlines.map(h => h.copy).join('\n'), 'All Headlines')}
                      >
                        Copy All
                      </Button>
                    )}
                  </div>
                  
                  {generatedHeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {generatedHeadlines.map((headline, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <Badge variant="outline" className="mr-2 text-xs">{headline.framework}</Badge>
                            <span className="text-sm">{headline.copy}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(headline.copy, 'Headline')}
                          >
                            {copiedHeadlines ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No headlines generated yet. Click "Generate Ad Copy" to create headlines.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Primary Text</h3>
                    {generatedPrimaryText && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Improve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generatedPrimaryText, 'Primary Text')}
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {generatedPrimaryText ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{generatedPrimaryText}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No primary text generated yet. Click "Generate Ad Copy" to create primary text.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="landing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Landing Page Configuration</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Landing Page Type</Label>
                      <Select value={landingPageType} onValueChange={setLandingPageType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listicle">Listicle Page</SelectItem>
                          <SelectItem value="trojanHorse">Trojan Horse Page</SelectItem>
                          <SelectItem value="multiProduct">Multi Product Page</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        {landingPageType === 'listicle' && 'List-based page format (e.g., "5 Reasons Why...")'}
                        {landingPageType === 'trojanHorse' && 'Educational content that leads to product'}
                        {landingPageType === 'multiProduct' && 'Showcase multiple products together'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="use-ads-for-landing"
                          checked={useAdsForLanding}
                          onCheckedChange={setUseAdsForLanding}
                        />
                        <Label htmlFor="use-ads-for-landing">Use Generated Ads Content</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Use previously generated ad copy and transcription for landing page consistency
                      </p>
                    </div>

                    {!useAdsForLanding && (
                      <div className="space-y-2">
                        <Label htmlFor="adsContent">Ads Content Reference (Optional)</Label>
                        <Textarea
                          id="adsContent"
                          placeholder="Paste existing ad copy to align landing page messaging..."
                          value={adsContent}
                          onChange={(e) => setAdsContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="productBrief">Product Brief</Label>
                      <Textarea
                        id="productBrief"
                        placeholder="Describe your product, key benefits, target audience, and main selling points..."
                        value={productBrief}
                        onChange={(e) => setProductBrief(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mainAngle">Main Marketing Angle</Label>
                      <Input
                        id="mainAngle"
                        placeholder="e.g., 'Clean beauty that actually works' or 'Professional results at home'"
                        value={mainAngle}
                        onChange={(e) => setMainAngle(e.target.value)}
                      />
                    </div>

                    <ProductSelection 
                      selectedProduct={selectedProduct}
                      onProductChange={setSelectedProduct}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Target Audience</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Persona</Label>
                      <Select value={concept} onValueChange={setConcept}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(personas).map(([key, persona]) => (
                            <SelectItem key={key} value={key}>
                              {persona.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Sub-Persona</Label>
                      <Select value={subPersona} onValueChange={setSubPersona}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {concept && personas[concept as keyof typeof personas]?.subPersonas && 
                            Object.entries(personas[concept as keyof typeof personas].subPersonas).map(([key, subPers]) => (
                              <SelectItem key={key} value={key}>
                                {(subPers as any).label}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Brand/DR Balance</Label>
                      <div className="text-sm text-gray-600 mb-2">
                        {brandDrBalance[0]}% Brand / {100 - brandDrBalance[0]}% DR
                      </div>
                      <Slider
                        value={brandDrBalance}
                        onValueChange={setBrandDrBalance}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => generateLandingPageMutation.mutate()}
                disabled={generateLandingPageMutation.isPending}
              >
                <Globe className="mr-2 h-4 w-4" />
                {generateLandingPageMutation.isPending ? 'Generating...' : 'Generate Landing Page'}
              </Button>
            </div>

            {/* Right Column - Generated Landing Page */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Generated Landing Page</h3>
                    {generatedLandingCopy.headline && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(
                          `${generatedLandingCopy.headline}\n\n${generatedLandingCopy.subheadline}\n\n${generatedLandingCopy.introduction}\n\n${generatedLandingCopy.sections.map(s => `${s.title}\n${s.content}`).join('\n\n')}\n\n${generatedLandingCopy.socialProof}\n\n${generatedLandingCopy.conclusion}\n\n${generatedLandingCopy.cta}`,
                          'Landing Page Copy'
                        )}
                      >
                        Copy All
                      </Button>
                    )}
                  </div>
                  
                  {generatedLandingCopy.headline ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">HEADLINE</h4>
                        <p className="text-lg font-bold">{generatedLandingCopy.headline}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">SUBHEADLINE</h4>
                        <p className="text-base">{generatedLandingCopy.subheadline}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">INTRODUCTION</h4>
                        <p className="text-sm text-gray-700">{generatedLandingCopy.introduction}</p>
                      </div>

                      {generatedLandingCopy.sections.map((section, index) => (
                        <div key={index}>
                          <h4 className="font-semibold text-sm text-gray-600 mb-2">{section.title.toUpperCase()}</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.content}</p>
                        </div>
                      ))}

                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">SOCIAL PROOF</h4>
                        <p className="text-sm text-gray-700">{generatedLandingCopy.socialProof}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">CONCLUSION</h4>
                        <p className="text-sm text-gray-700">{generatedLandingCopy.conclusion}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">CALL TO ACTION</h4>
                        <p className="text-sm font-semibold">{generatedLandingCopy.cta}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No landing page generated yet. Configure settings and click "Generate Landing Page".</p>
                  )}
                </CardContent>
              </Card>

              {landingPageAnalysis && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Conversion Score:</span>
                        <span className="ml-2 font-semibold">{landingPageAnalysis.conversionScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Words:</span>
                        <span className="ml-2 font-semibold">{landingPageAnalysis.totalWords}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Sections:</span>
                        <span className="ml-2 font-semibold">{landingPageAnalysis.sectionCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Readability:</span>
                        <span className="ml-2 font-semibold">{landingPageAnalysis.readabilityScore}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="launch" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs value={launchSubTab} onValueChange={setLaunchSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="creative-brief">Creative Brief Generator</TabsTrigger>
                  <TabsTrigger value="strategy">Strategy Planning</TabsTrigger>
                  <TabsTrigger value="launch-brief">Launch Brief Generation</TabsTrigger>
                </TabsList>

                <TabsContent value="creative-brief" className="space-y-4">
                  <h3 className="text-lg font-semibold">Creative Brief Generator</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meetingNotes">Meeting Notes</Label>
                    <Textarea
                      id="meetingNotes"
                      placeholder="Paste your meeting notes here..."
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingTranscription">Meeting Transcription (Optional)</Label>
                    <Textarea
                      id="meetingTranscription"
                      placeholder="Paste meeting transcription for additional context..."
                      value={meetingTranscription}
                      onChange={(e) => setMeetingTranscription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => generateCreativeBriefMutation.mutate()}
                    disabled={generateCreativeBriefMutation.isPending}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {generateCreativeBriefMutation.isPending ? 'Generating...' : 'Generate Creative Brief'}
                  </Button>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-4">
                  <h3 className="text-lg font-semibold">Strategy Planning</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="strategyBrief">Strategy Brief</Label>
                    <Textarea
                      id="strategyBrief"
                      placeholder="Paste your strategic brief or planning document..."
                      value={strategyBrief}
                      onChange={(e) => setStrategyBrief(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    <Target className="mr-2 h-4 w-4" />
                    Generate Strategy
                  </Button>
                </TabsContent>

                <TabsContent value="launch-brief" className="space-y-4">
                  <h3 className="text-lg font-semibold">Launch Brief Generation</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="launchBrief">Launch Brief</Label>
                    <Textarea
                      id="launchBrief"
                      placeholder="Paste your launch brief or campaign document..."
                      value={launchBrief}
                      onChange={(e) => setLaunchBrief(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Launch Copy
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="static" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Static Ad Analysis</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staticAdImage">Image URL</Label>
                      <Input
                        id="staticAdImage"
                        placeholder="Paste image URL of static ad to analyze..."
                        value={staticAdImage}
                        onChange={(e) => setStaticAdImage(e.target.value)}
                      />
                    </div>

                    {staticAdImage && (
                      <div className="space-y-2">
                        <Label>Image Preview</Label>
                        <div className="border rounded-lg p-4">
                          <img 
                            src={staticAdImage} 
                            alt="Static ad preview" 
                            className="max-w-full h-auto rounded"
                            onError={() => setStaticAdImagePreview('')}
                            onLoad={() => setStaticAdImagePreview(staticAdImage)}
                          />
                        </div>
                      </div>
                    )}

                    <Button className="w-full" size="lg">
                      <Camera className="mr-2 h-4 w-4" />
                      Analyze Static Ad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Analysis Results */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Analysis Results</h3>
                    {staticAdAnalysis && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(staticAdAnalysis, 'Static Ad Analysis')}
                      >
                        Copy Analysis
                      </Button>
                    )}
                  </div>
                  
                  {staticAdAnalysis ? (
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap text-sm">{staticAdAnalysis}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No analysis generated yet. Upload an image and click "Analyze Static Ad".</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Training Configuration</h4>
                    <p className="text-sm text-gray-500">Configure AI training parameters and prompts</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Customer Reviews</h4>
                    <p className="text-sm text-gray-500">Import and manage customer review data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Reviews
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Product Claims</h4>
                    <p className="text-sm text-gray-500">Configure approved product claims and validation</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Edit Claims
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Brand Guidelines</h4>
                    <p className="text-sm text-gray-500">Update Jones Road Beauty brand voice and guidelines</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Palette className="h-4 w-4 mr-2" />
                    Edit Guidelines
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Review Analytics</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">1,500+</div>
                    <div className="text-sm text-gray-500">Total Reviews</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">95%</div>
                    <div className="text-sm text-gray-500">Positive Sentiment</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Top Products by Review Volume</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>What The Foundation</span>
                      <Badge variant="outline">450+ reviews</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Miracle Balm</span>
                      <Badge variant="outline">400+ reviews</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Just Enough</span>
                      <Badge variant="outline">350+ reviews</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Request</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customRequest">Describe what you need</Label>
                  <Textarea
                    id="customRequest"
                    placeholder="Describe any copywriting task you need help with..."
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => generateCustomCopyMutation.mutate()}
                  disabled={generateCustomCopyMutation.isPending || !customRequest.trim()}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  {generateCustomCopyMutation.isPending ? 'Generating...' : 'Generate Custom Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedCustomResponse && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Generated Response</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generatedCustomResponse, 'Custom Response')}
                  >
                    {copiedCreativeBrief ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{generatedCustomResponse}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}