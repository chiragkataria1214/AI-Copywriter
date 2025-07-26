import { useState, useEffect } from 'react';
import { Upload, Copy, Check, Target, Sparkles, Video, FileText, Zap, ThumbsUp, ThumbsDown, Star, Globe, List, AlertCircle, Palette, Users, Settings } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';

export default function MetaAdGenerator() {
  const [activeTab, setActiveTab] = useState('ads');
  const [transcription, setTranscription] = useState('');
  const [concept, setConcept] = useState('lifeJuggler');
  const [subPersona, setSubPersona] = useState('newMom');
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  
  // Ad Copy States
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ framework: string; copy: string }>>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  
  // Debug States
  const [debugInfo, setDebugInfo] = useState<{
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null>(null);
  
  // Training Configuration States
  const [trainingConfig, setTrainingConfig] = useState<any>(null);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Landing Page States
  const [landingPageType, setLandingPageType] = useState('listicle');
  const [useAdsForLanding, setUseAdsForLanding] = useState(false);
  const [adsContent, setAdsContent] = useState('');
  const [productBrief, setProductBrief] = useState('Jones Road Beauty\'s What The Foundation is a revolutionary foundation that melts into your skin for a natural, "your skin but better" finish. Unlike traditional foundations that sit on top like a mask, WTF contains skin-nourishing oils that moisturize while providing buildable coverage. Perfect for busy women who want effortless beauty without the time-consuming routine. Available in universal shades that adapt to your skin tone.');
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
  
  // Remove individual isLoading since we'll use mutation loading states
  const [copiedHeadlines, setCopiedHeadlines] = useState(false);
  const [copiedPrimaryText, setCopiedPrimaryText] = useState(false);
  const [copiedLandingCopy, setCopiedLandingCopy] = useState(false);
  const [useJonesBrandGuide, setUseJonesBrandGuide] = useState(true);
  const [brandDrBalance, setBrandDrBalance] = useState([50]);

  // Define personas
  const personas = {
    innovators: {
      label: 'Innovators',
      description: 'Early adopters who are always on the lookout for revolutionary products',
      subPersonas: {}
    },
    skinSolutionist: {
      label: 'Skin Solutionist',
      description: 'Individuals with specific skin concerns looking for gentle, effective solutions',
      subPersonas: {}
    },
    beautyNovice: {
      label: 'Beauty Novice',
      description: 'Those new to makeup or returning after a long hiatus, looking for approachable products',
      subPersonas: {}
    },
    trendSeeker: {
      label: 'Trend Seeker',
      description: 'Social media-savvy individuals drawn to viral products and beauty trends',
      subPersonas: {}
    },
    luxuryForLess: {
      label: 'Luxury for Less',
      description: 'Shoppers who desire high-quality, premium beauty products at a reasonable price',
      subPersonas: {}
    },
    minimalist: {
      label: 'Minimalist',
      description: 'Individuals who prefer a streamlined routine with multi-functional products',
      subPersonas: {}
    },
    skincareEnthusiast: {
      label: 'Skincare Enthusiast',
      description: 'Passionate about skin health and prioritizing clean, nourishing products',
      subPersonas: {}
    },
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

  const landingPageTypes = {
    listicle: {
      label: 'Listicle',
      description: 'List-based content with numbered reasons and benefits',
      icon: List
    },
    trojanHorse: {
      label: 'Trojan Horse',
      description: 'Story-driven approach that connects to product benefits',
      icon: Target
    }
  };

  const generateTemplateAds = () => {
    const selectedPersona = personas[concept as keyof typeof personas];
    const selectedSubPersona = subPersona && selectedPersona?.subPersonas?.[subPersona as keyof typeof selectedPersona.subPersonas] ? selectedPersona.subPersonas[subPersona as keyof typeof selectedPersona.subPersonas] : null;
    const brandPercent = brandDrBalance[0];
    const drPercent = 100 - brandPercent;

    let headlineTemplates = [];
    
    if (drPercent > 75) {
      headlineTemplates = [
        `Transform Your ${selectedPersona?.label || 'Skin'} Now`,
        `Get ${selectedPersona?.label || 'Results'} in Days`,
        `Stop Struggling With Beauty`,
        `The ${selectedPersona?.label || 'Solution'} You Need`,
        `Finally - Beauty That Works`
      ];
    } else if (drPercent > 50) {
      headlineTemplates = [
        `${selectedPersona?.label || 'Beauty'} Made Simple`,
        `Your ${selectedPersona?.label || 'Glow'} Awaits`,
        `Discover ${selectedPersona?.label || 'Beauty'} Secrets`,
        `Perfect for ${selectedPersona?.label || 'You'}`,
        `${selectedPersona?.label || 'Results'} Guaranteed`
      ];
    } else if (brandPercent > 50) {
      headlineTemplates = [
        `Your Skin But Better`,
        `Effortless Beauty Found`,
        `Natural Glow Simplified`,
        `One Step Beauty`,
        `Barely There Perfect`
      ];
    } else {
      headlineTemplates = [
        `Your Skin But Better`,
        `Effortless Beauty Found`,
        `Natural Glow Simplified`,
        `Barely There Perfect`,
        `Skin That Looks Like Skin`
      ];
    }

    let primaryText = '';
    
    if (drPercent > 75) {
      primaryText = `Transform your beauty routine today! ${selectedPersona?.description || 'Get the results you deserve.'} `;
      if (selectedSubPersona) {
        primaryText += `Specifically designed for ${(selectedSubPersona as any).label.toLowerCase()}s dealing with ${(selectedSubPersona as any).valueProps.slice(0, 2).join(' and ').toLowerCase()}. `;
      }
      primaryText += `Don't wait - thousands are already experiencing the Jones Road difference. Limited time offer!`;
    } else if (brandPercent > 50) {
      primaryText = `Embrace beauty that feels natural and effortless. ${selectedPersona?.description || 'Designed for your authentic self.'} `;
      if (selectedSubPersona) {
        primaryText += `Lovingly crafted for ${(selectedSubPersona as any).label.toLowerCase()}s who cherish ${(selectedSubPersona as any).valueProps.slice(0, 2).join(' and ').toLowerCase()}. `;
      }
      primaryText += `Jones Road Beauty believes in enhancing who you already are - your skin but better, always.`;
    } else {
      primaryText = `What The Foundation is unlike any foundation you've ever tried. Not heavy, cakey, or dry. WTF is light and moisturizing, and barely noticeable so every day can be a great skin day. Perfect for busy ${selectedPersona?.label?.toLowerCase() || 'individuals'} who want to look effortlessly put-together without the time-consuming routine.`;
    }

    // Convert to new format with frameworks
    const headlinesWithFrameworks = headlineTemplates.slice(0, 5).map((copy, index) => {
      const frameworks = ["BENEFIT DRIVEN", "SOCIAL PROOF", "VALUE PROPS", "PROBLEM FOCUSED", "OFFER DRIVEN"];
      return {
        framework: frameworks[index] || "GENERAL",
        copy
      };
    });
    setGeneratedHeadlines(headlinesWithFrameworks);
    setGeneratedPrimaryText(primaryText);
  };

  const generateTemplateLandingPage = () => {
    const selectedPersona = personas[concept as keyof typeof personas];
    const brandPercent = brandDrBalance[0];
    const drPercent = 100 - brandPercent;

    let headline = '';
    if (drPercent > 75) {
      headline = `5 Reasons Why ${selectedPersona?.label || 'Smart Shoppers'} Choose Jones Road Beauty This Month`;
    } else if (drPercent > 50) {
      headline = `5 Reasons Why Your Current Beauty Routine Is Costing You Confidence`;
    } else if (brandPercent > 50) {
      headline = `5 Reasons Why 10,000+ Beauty Lovers Choose Jones Road Over Everything Else`;
    } else {
      headline = `5 Surprising Reasons Why "Natural Beauty" Actually Means Enhanced You`;
    }

    const landingCopy = {
      headline: headline,
      subheadline: `Discover the proven approach to effortless beauty that works for ${selectedPersona?.label?.toLowerCase() || 'everyone'}`,
      introduction: `If you're ${selectedPersona?.description?.toLowerCase() || 'tired of complicated beauty routines'}, you've found your solution. Jones Road Beauty creates the "Your Skin But Better" look because we understand that true beauty enhances who you already are, not who you think you should become.`,
      sections: [
        {
          title: 'REASON #1: It Actually Moisturizes Your Skin',
          content: `Unlike traditional foundations that can dry out your skin, What The Foundation contains skin-nourishing oils that hydrate while you wear it. This means your skin looks better at the end of the day than when you started. Over 85% of our customers report getting compliments on their "natural glow" within the first week of use.`
        },
        {
          title: 'REASON #2: No More Cakey, Mask-Like Finish', 
          content: `The secret is in the formula that melts into your skin rather than sitting on top. You get natural-looking coverage that moves with your face, never against it. In independent testing, 92% of users found Jones Road products provided adequate coverage for daily wear.`
        },
        {
          title: 'REASON #3: Get Ready in 5 Minutes or Less',
          content: `Jones Road's "one and done" approach means you can achieve a complete, put-together look using just a few multi-functional products. The average Jones Road user completes their entire makeup routine in under 5 minutes, compared to the 23-minute industry average.`
        }
      ],
      socialProof: `Trusted by 50,000+ ${selectedPersona?.label?.toLowerCase() || 'beauty lovers'} who've discovered that the best makeup looks like no makeup at all.`,
      riskReversal: `${drPercent > 50 ? 'Limited time: Get your complete Jones Road starter kit with 30-day money-back guarantee.' : 'Experience the Jones Road difference with our gentle 30-day trial. Love your natural glow or get your money back.'}`,
      conclusion: `Jones Road Beauty transforms your daily routine into moments of self-care and confidence, because the best version of you is already here.`,
      cta: `${drPercent > 50 ? 'Join 50,000+ Happy Customers → Start Your Natural Beauty Journey Today' : 'Discover Your Most Beautiful Self → Join the Jones Road Community'}`
    };

    setGeneratedLandingCopy(landingCopy);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setTranscription(result);
      }
    };
    reader.readAsText(file);
  };

  // Load training configuration
  const loadTrainingConfigMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/training-config', { method: 'GET' });
    },
    onSuccess: (data) => {
      setTrainingConfig(data);
      setEditingConfig(JSON.parse(JSON.stringify(data))); // Deep clone for editing
    },
    onError: (error) => {
      toast({
        title: "Failed to Load Configuration",
        description: "Could not load training configuration.",
        variant: "destructive"
      });
    }
  });

  // Save training configuration
  const saveTrainingConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest('/api/training-config', {
        method: 'POST',
        body: { ...config, adminPassword }
      });
    },
    onSuccess: () => {
      setTrainingConfig(editingConfig);
      toast({
        title: "Configuration Saved",
        description: "Training configuration updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Save Configuration", 
        description: "Could not save training configuration. Check admin password.",
        variant: "destructive"
      });
    }
  });

  // Admin authentication
  const authenticateAdmin = () => {
    // Simple admin check - in production this would be more secure
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      toast({
        title: "Admin Access Granted",
        description: "You can now edit training configuration.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password.",
        variant: "destructive"
      });
    }
  };

  // API mutations for generating copy
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        transcription,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance: brandDrBalance[0],
        useJonesBrandGuide
      };
      
      const result = await apiRequest('/api/generate-ad-copy', {
        method: 'POST',
        body: payload
      });
      
      // Store debug information
      if (result.debugInfo) {
        setDebugInfo({
          systemPrompt: result.debugInfo.systemPrompt,
          userPrompt: result.debugInfo.userPrompt,
          requestPayload: payload,
          rawResponse: result.debugInfo.rawResponse
        });
      }
      
      return result;
    },
    onSuccess: (data) => {
      setGeneratedHeadlines(data.headlines || []);
      setGeneratedPrimaryText(data.primaryText || '');
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

  const generateLandingCopyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-landing-copy', {
        method: 'POST',
        body: {
          landingPageType,
          productBrief,
          concept,
          subPersona,
          useAdsContent: useAdsForLanding,
          adsContent,
          brandDrBalance: brandDrBalance[0]
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
      toast({
        title: "Landing Page Copy Generated Successfully",
        description: "Your landing page copy has been generated using Claude AI.",
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

  const generateAdCopy = () => {
    if (activeTab === 'ads') {
      generateAdCopyMutation.mutate();
    } else {
      generateLandingCopyMutation.mutate();
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'headlines') setCopiedHeadlines(true);
      if (type === 'primary') setCopiedPrimaryText(true);
      if (type === 'landing') setCopiedLandingCopy(true);
      
      setTimeout(() => {
        setCopiedHeadlines(false);
        setCopiedPrimaryText(false);
        setCopiedLandingCopy(false);
      }, 2000);
      
      toast({
        title: "Copied to Clipboard",
        description: "Content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getWordCount = (text: string) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  const getBrandDrLabel = () => {
    const value = brandDrBalance[0];
    return `${value}% Brand / ${100 - value}% DR`;
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-jones-primary rounded-lg flex items-center justify-center">
                <Palette className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Jones Road Beauty</h1>
                <p className="text-xs sm:text-sm text-gray-500">AI Copywriter</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-jones-secondary rounded-full flex items-center justify-center">
                <Users className="text-jones-primary" size={14} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
            <TabsTrigger value="ads" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-3">
              <Sparkles size={16} />
              <span className="text-xs sm:text-sm">Ad Copy</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-3">
              <FileText size={16} />
              <span className="text-xs sm:text-sm">Landing Page</span>
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-3">
              <Target size={16} />
              <span className="text-xs sm:text-sm">Debug</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
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
                      <Textarea 
                        rows={6}
                        className="w-full resize-none text-sm"
                        placeholder="Paste your video transcription here or upload a file..."
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                      />
                      
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                            <Upload size={14} />
                            <span className="hidden sm:inline">Upload Transcription</span>
                            <span className="sm:hidden">Upload</span>
                          </Label>
                          <Input 
                            id="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept=".txt,.doc,.docx" 
                            onChange={handleFileUpload} 
                          />
                        </div>
                        

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
                              <SelectItem key={key} value={key}>{persona.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {personas[concept as keyof typeof personas]?.subPersonas && Object.keys(personas[concept as keyof typeof personas].subPersonas).length > 0 && (
                        <div>
                          <Label htmlFor="subPersona" className="block text-sm font-medium text-gray-700 mb-2">Sub-Persona</Label>
                          <Select value={subPersona} onValueChange={setSubPersona}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(personas[concept as keyof typeof personas].subPersonas).map(([key, subPersona]) => (
                                <SelectItem key={key} value={key}>{(subPersona as any).label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">Custom Target Audience</Label>
                        <Input 
                          type="text" 
                          id="targetAudience"
                          placeholder=""
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                        />
                      </div>

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

                <Button 
                  onClick={generateAdCopy} 
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: '#004182' }}
                  disabled={generateAdCopyMutation.isPending}
                >
                  {generateAdCopyMutation.isPending ? (
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedHeadlines.map(h => h.copy).join('\n'), 'headlines')}
                        disabled={generatedHeadlines.length === 0}
                        className="w-full sm:w-auto"
                      >
                        {copiedHeadlines ? <Check size={16} /> : <Copy size={16} />}
                        <span className="ml-1">{copiedHeadlines ? 'Copied' : 'Copy All'}</span>
                      </Button>
                    </div>
                    
                    {generatedHeadlines.length > 0 ? (
                      <div className="space-y-3">
                        {generatedHeadlines.map((headline, index) => (
                          <div key={index} className="group relative border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-jones-primary transition-colors">
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                              <div className="flex-1 pr-0 sm:pr-2">
                                <p className="font-medium text-gray-900 text-sm sm:text-base leading-relaxed">{headline.copy}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    {headline.framework}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                    {getWordCount(headline.copy)} words
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-start"
                                onClick={() => copyToClipboard(headline.copy, 'headline')}
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No headlines generated yet. Click "Generate Ad Copy" to create headlines.</p>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrimaryText, 'primary')}
                        disabled={!generatedPrimaryText}
                        className="w-full sm:w-auto"
                      >
                        {copiedPrimaryText ? <Check size={16} /> : <Copy size={16} />}
                        <span className="ml-1">{copiedPrimaryText ? 'Copied' : 'Copy'}</span>
                      </Button>
                    </div>
                    
                    {generatedPrimaryText ? (
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-900 leading-relaxed text-sm sm:text-base">{generatedPrimaryText}</p>
                        
                        <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-200 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" style={{ backgroundColor: '#f0f4ff', color: '#004182' }} className="text-xs">
                              {getWordCount(generatedPrimaryText)} words
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              Brand-First
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No primary text generated yet. Click "Generate Ad Copy" to create primary text.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ad Preview Section */}
                {(generatedHeadlines.length > 0 || generatedPrimaryText) && (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                          <Globe className="text-jones-primary mr-2 sm:mr-3" size={18} />
                          Ad Preview
                        </h3>
                        <Badge variant="secondary" style={{ backgroundColor: '#f0f4ff', color: '#004182' }} className="text-xs">
                          Facebook Feed Ad
                        </Badge>
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
                              Jones Road Beauty
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

                        {/* Mobile Primary Text */}
                        {generatedPrimaryText && (
                          <div className="px-4 pb-3">
                            <p className="text-[15px] text-gray-900 leading-[1.4]">
                              {generatedPrimaryText}
                            </p>
                          </div>
                        )}

                        {/* Mobile Product Image */}
                        <div className="aspect-square flex items-center justify-center relative bg-white">
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)' }}>
                            <div className="absolute top-8 left-8 w-12 h-12 rounded-full blur-lg opacity-30" style={{ backgroundColor: '#004182' }}></div>
                            <div className="absolute bottom-12 right-12 w-20 h-20 rounded-full blur-lg opacity-20" style={{ backgroundColor: '#1a5a9e' }}></div>
                          </div>
                          <div className="relative text-center z-10">
                            <div className="w-28 h-28 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 mx-auto border border-gray-100">
                              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004182 0%, #003366 100%)' }}>
                                <span className="text-white font-bold text-base">WTF</span>
                              </div>
                            </div>
                            <div className="text-gray-500 text-xs font-medium">What The Foundation</div>
                          </div>
                        </div>

                        {/* Mobile Link Preview Section */}
                        {generatedHeadlines.length > 0 && (
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="text-[13px] text-gray-500 mb-1 uppercase tracking-wide font-medium">
                              JONESROADBEAUTY.COM
                            </div>
                            <div className="font-medium text-[15px] text-gray-900 mb-3 leading-tight">
                              {generatedHeadlines[0]?.copy || 'Your Next Beauty Game-Changer'}
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full text-white text-[14px] py-2.5 h-9 rounded-md font-semibold hover:opacity-90 shadow-sm"
                              style={{ backgroundColor: '#1877f2' }}
                            >
                              Learn More
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

              </div>
            </div>
          </TabsContent>

          <TabsContent value="landing">
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        landingPageType === 'listicle' 
                          ? 'border-jones-primary bg-jones-light' 
                          : 'border-gray-300 hover:border-jones-primary'
                      }`} onClick={() => setLandingPageType('listicle')}>
                        <div className="flex items-center justify-between mb-2">
                          <List className={landingPageType === 'listicle' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                          <div className={`w-4 h-4 border-2 rounded-full ${
                            landingPageType === 'listicle' 
                              ? 'border-jones-primary bg-jones-primary' 
                              : 'border-gray-300'
                          }`}></div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Listicle</h4>
                        <p className="text-sm text-gray-600 mt-1">List-based content with numbered reasons and benefits</p>
                      </div>
                      
                      <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        landingPageType === 'trojanHorse' 
                          ? 'border-jones-primary bg-jones-light' 
                          : 'border-gray-300 hover:border-jones-primary'
                      }`} onClick={() => setLandingPageType('trojanHorse')}>
                        <div className="flex items-center justify-between mb-2">
                          <Target className={landingPageType === 'trojanHorse' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                          <div className={`w-4 h-4 border-2 rounded-full ${
                            landingPageType === 'trojanHorse' 
                              ? 'border-jones-primary bg-jones-primary' 
                              : 'border-gray-300'
                          }`}></div>
                        </div>
                        <h4 className="font-semibold text-gray-900">Trojan Horse</h4>
                        <p className="text-sm text-gray-600 mt-1">Story-driven approach that connects to product benefits</p>
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
                          <Label className="text-sm font-medium text-gray-700">Use Generated Ads Content</Label>
                          <p className="text-xs text-gray-500">Use the ad copy generated in the previous tab</p>
                        </div>
                        <Switch checked={useAdsForLanding} onCheckedChange={setUseAdsForLanding} />
                      </div>
                      
                      <div>
                        <Label htmlFor="productBrief" className="block text-sm font-medium text-gray-700 mb-2">
                          Product Brief
                        </Label>
                        <Textarea 
                          id="productBrief" 
                          rows={5}
                          className="w-full resize-none text-sm"
                          placeholder="Describe your product, its benefits, target audience, and key selling points..."
                          value={productBrief}
                          onChange={(e) => setProductBrief(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={generateAdCopy} 
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: '#004182' }}
                  disabled={generateLandingCopyMutation.isPending}
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
                    </div>
                    
                    {generatedLandingCopy.headline ? (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="border-l-4 border-jones-primary pl-3 sm:pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Headline</h4>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">{generatedLandingCopy.headline}</p>
                        </div>
                        
                        <div className="border-l-4 border-gray-300 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Introduction</h4>
                          <p className="text-gray-700">{generatedLandingCopy.introduction}</p>
                        </div>
                        
                        {generatedLandingCopy.sections.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Strategic Reasons</h4>
                            
                            {generatedLandingCopy.sections.slice(0, 2).map((section, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-2">{section.title}</h5>
                                <p className="text-sm text-gray-700">{section.content}</p>
                              </div>
                            ))}
                            
                            {generatedLandingCopy.sections.length > 2 && (
                              <div className="text-center py-2">
                                <span className="text-sm text-gray-500">+ {generatedLandingCopy.sections.length - 2} more reasons</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Call-to-Action</h4>
                          <p className="text-lg font-medium text-green-700">{generatedLandingCopy.cta}</p>
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

                {/* Copy Performance */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="text-jones-primary mr-3" size={20} />
                      Copy Analysis
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Headline Length</span>
                        <span className="text-sm font-medium text-green-700">
                          {generatedLandingCopy.headline ? `${getWordCount(generatedLandingCopy.headline)} words (Optimal)` : 'Not generated'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f0f4ff' }}>
                        <span className="text-sm text-gray-700">Brand Alignment</span>
                        <span className="text-sm font-medium" style={{ color: '#004182' }}>92%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f0f4ff' }}>
                        <span className="text-sm text-gray-700">Readability Score</span>
                        <span className="text-sm font-medium" style={{ color: '#004182' }}>8.5/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug">
            <div className="space-y-6">
              {/* Training Configuration Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4 mb-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Settings className="text-jones-primary mr-3" size={20} />
                      AI Training Configuration
                    </h3>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button 
                        onClick={() => loadTrainingConfigMutation.mutate()}
                        disabled={loadTrainingConfigMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {loadTrainingConfigMutation.isPending ? "Loading..." : "Load Config"}
                      </Button>
                      {!isAdmin && editingConfig && (
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                          <Input 
                            type="password"
                            placeholder="Admin password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full sm:w-32"
                            size="sm"
                          />
                          <Button 
                            onClick={authenticateAdmin}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            Unlock
                          </Button>
                        </div>
                      )}
                      {isAdmin && editingConfig && (
                        <Button 
                          onClick={() => saveTrainingConfigMutation.mutate(editingConfig)}
                          disabled={saveTrainingConfigMutation.isPending}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {saveTrainingConfigMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {!isAdmin && trainingConfig && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">Admin Access Required</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            These training materials are read-only. Enter the admin password above to make changes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {trainingConfig ? (
                    <Tabs defaultValue="brand-guidelines" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
                        <TabsTrigger value="brand-guidelines" className="text-xs sm:text-sm">Brand Guidelines</TabsTrigger>
                        <TabsTrigger value="frameworks" className="text-xs sm:text-sm">Copy Frameworks</TabsTrigger>
                        <TabsTrigger value="prompts" className="text-xs sm:text-sm">System Prompts</TabsTrigger>
                        <TabsTrigger value="model" className="text-xs sm:text-sm">Model Settings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="brand-guidelines" className="mt-4">
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">Core Positioning</Label>
                            <Textarea 
                              value={editingConfig?.brandGuidelines?.corePositioning || ''}
                              onChange={(e) => isAdmin && setEditingConfig({
                                ...editingConfig,
                                brandGuidelines: {
                                  ...editingConfig.brandGuidelines,
                                  corePositioning: e.target.value
                                }
                              })}
                              className="mt-1"
                              rows={3}
                              placeholder="Your Skin But Better - natural, effortless enhancement..."
                              disabled={!isAdmin}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">Brand Voice Rules</Label>
                            <div className="space-y-3">
                              {(editingConfig?.brandGuidelines?.brandVoice || ['', '', '']).map((rule: string, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <Switch 
                                      checked={editingConfig?.brandGuidelines?.enabledBrandVoice?.[index] !== false}
                                      onCheckedChange={(checked) => {
                                        if (!isAdmin) return;
                                        const enabled = [...(editingConfig?.brandGuidelines?.enabledBrandVoice || [])];
                                        enabled[index] = checked;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig.brandGuidelines,
                                            enabledBrandVoice: enabled
                                          }
                                        });
                                      }}
                                      disabled={!isAdmin}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-blue-500 text-sm font-bold flex-shrink-0">•</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Rule {index + 1}</span>
                                    {isAdmin && (editingConfig?.brandGuidelines?.brandVoice?.length > 3) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                        onClick={() => {
                                          const rules = [...(editingConfig.brandGuidelines.brandVoice || [])];
                                          const enabled = [...(editingConfig.brandGuidelines.enabledBrandVoice || [])];
                                          rules.splice(index, 1);
                                          enabled.splice(index, 1);
                                          setEditingConfig({
                                            ...editingConfig,
                                            brandGuidelines: {
                                              ...editingConfig.brandGuidelines,
                                              brandVoice: rules,
                                              enabledBrandVoice: enabled
                                            }
                                          });
                                        }}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                  <Input
                                    value={rule}
                                    onChange={(e) => {
                                      if (!isAdmin) return;
                                      const rules = [...(editingConfig.brandGuidelines.brandVoice || [])];
                                      rules[index] = e.target.value;
                                      setEditingConfig({
                                        ...editingConfig,
                                        brandGuidelines: {
                                          ...editingConfig.brandGuidelines,
                                          brandVoice: rules
                                        }
                                      });
                                    }}
                                    className={`w-full ml-0 ${editingConfig?.brandGuidelines?.enabledBrandVoice?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter brand voice rule..."
                                    disabled={!isAdmin}
                                  />
                                </div>
                              ))}
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const rules = [...(editingConfig?.brandGuidelines?.brandVoice || [])];
                                    const enabled = [...(editingConfig?.brandGuidelines?.enabledBrandVoice || [])];
                                    rules.push('');
                                    enabled.push(true);
                                    setEditingConfig({
                                      ...editingConfig,
                                      brandGuidelines: {
                                        ...editingConfig.brandGuidelines,
                                        brandVoice: rules,
                                        enabledBrandVoice: enabled
                                      }
                                    });
                                  }}
                                  className="w-full border-dashed mt-2"
                                >
                                  + Add brand voice rule
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">Key Terms & Phrases</Label>
                            <div className="space-y-3">
                              {(editingConfig?.brandGuidelines?.keyTerminology || ['', '', '']).map((term: string, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <Switch 
                                      checked={editingConfig?.brandGuidelines?.enabledKeyTerminology?.[index] !== false}
                                      onCheckedChange={(checked) => {
                                        if (!isAdmin) return;
                                        const enabled = [...(editingConfig?.brandGuidelines?.enabledKeyTerminology || [])];
                                        enabled[index] = checked;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig.brandGuidelines,
                                            enabledKeyTerminology: enabled
                                          }
                                        });
                                      }}
                                      disabled={!isAdmin}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-gray-400 text-sm font-bold flex-shrink-0">•</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Term {index + 1}</span>
                                    {isAdmin && (editingConfig?.brandGuidelines?.keyTerminology?.length > 3) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                        onClick={() => {
                                          const terms = [...(editingConfig.brandGuidelines.keyTerminology || [])];
                                          const enabled = [...(editingConfig.brandGuidelines.enabledKeyTerminology || [])];
                                          terms.splice(index, 1);
                                          enabled.splice(index, 1);
                                          setEditingConfig({
                                            ...editingConfig,
                                            brandGuidelines: {
                                              ...editingConfig.brandGuidelines,
                                              keyTerminology: terms,
                                              enabledKeyTerminology: enabled
                                            }
                                          });
                                        }}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                  <Input
                                    value={term}
                                    onChange={(e) => {
                                      if (!isAdmin) return;
                                      const terms = [...(editingConfig.brandGuidelines.keyTerminology || [])];
                                      terms[index] = e.target.value;
                                      setEditingConfig({
                                        ...editingConfig,
                                        brandGuidelines: {
                                          ...editingConfig.brandGuidelines,
                                          keyTerminology: terms
                                        }
                                      });
                                    }}
                                    className={`w-full ml-0 ${editingConfig?.brandGuidelines?.enabledKeyTerminology?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter key term or phrase..."
                                    disabled={!isAdmin}
                                  />
                                </div>
                              ))}
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const terms = [...(editingConfig?.brandGuidelines?.keyTerminology || [])];
                                    const enabled = [...(editingConfig?.brandGuidelines?.enabledKeyTerminology || [])];
                                    terms.push('');
                                    enabled.push(true);
                                    setEditingConfig({
                                      ...editingConfig,
                                      brandGuidelines: {
                                        ...editingConfig.brandGuidelines,
                                        keyTerminology: terms,
                                        enabledKeyTerminology: enabled
                                      }
                                    });
                                  }}
                                  className="w-full border-dashed mt-2"
                                >
                                  + Add key term
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">
                              <span className="inline-flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                Approved Language
                              </span>
                            </Label>
                            <div className="space-y-3">
                              {(editingConfig?.brandGuidelines?.approvedLanguage || ['', '', '']).map((phrase: string, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <Switch 
                                      checked={editingConfig?.brandGuidelines?.enabledApprovedLanguage?.[index] !== false}
                                      onCheckedChange={(checked) => {
                                        if (!isAdmin) return;
                                        const enabled = [...(editingConfig?.brandGuidelines?.enabledApprovedLanguage || [])];
                                        enabled[index] = checked;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig.brandGuidelines,
                                            enabledApprovedLanguage: enabled
                                          }
                                        });
                                      }}
                                      disabled={!isAdmin}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Approved {index + 1}</span>
                                    {isAdmin && (editingConfig?.brandGuidelines?.approvedLanguage?.length > 3) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                        onClick={() => {
                                          const phrases = [...(editingConfig.brandGuidelines.approvedLanguage || [])];
                                          const enabled = [...(editingConfig.brandGuidelines.enabledApprovedLanguage || [])];
                                          phrases.splice(index, 1);
                                          enabled.splice(index, 1);
                                          setEditingConfig({
                                            ...editingConfig,
                                            brandGuidelines: {
                                              ...editingConfig.brandGuidelines,
                                              approvedLanguage: phrases,
                                              enabledApprovedLanguage: enabled
                                            }
                                          });
                                        }}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                  <Input
                                    value={phrase}
                                    onChange={(e) => {
                                      if (!isAdmin) return;
                                      const phrases = [...(editingConfig.brandGuidelines.approvedLanguage || [])];
                                      phrases[index] = e.target.value;
                                      setEditingConfig({
                                        ...editingConfig,
                                        brandGuidelines: {
                                          ...editingConfig.brandGuidelines,
                                          approvedLanguage: phrases
                                        }
                                      });
                                    }}
                                    className={`w-full ml-0 border-green-200 focus:border-green-400 ${editingConfig?.brandGuidelines?.enabledApprovedLanguage?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter approved phrase..."
                                    disabled={!isAdmin}
                                  />
                                </div>
                              ))}
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const phrases = [...(editingConfig?.brandGuidelines?.approvedLanguage || [])];
                                    const enabled = [...(editingConfig?.brandGuidelines?.enabledApprovedLanguage || [])];
                                    phrases.push('');
                                    enabled.push(true);
                                    setEditingConfig({
                                      ...editingConfig,
                                      brandGuidelines: {
                                        ...editingConfig.brandGuidelines,
                                        approvedLanguage: phrases,
                                        enabledApprovedLanguage: enabled
                                      }
                                    });
                                  }}
                                  className="w-full border-dashed border-green-300 text-green-600 hover:bg-green-50 mt-2"
                                >
                                  + Add approved phrase
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">
                              <span className="inline-flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                Avoided Language
                              </span>
                            </Label>
                            <div className="space-y-3">
                              {(editingConfig?.brandGuidelines?.avoidedLanguage || ['', '', '']).map((phrase: string, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <Switch 
                                      checked={editingConfig?.brandGuidelines?.enabledAvoidedLanguage?.[index] !== false}
                                      onCheckedChange={(checked) => {
                                        if (!isAdmin) return;
                                        const enabled = [...(editingConfig?.brandGuidelines?.enabledAvoidedLanguage || [])];
                                        enabled[index] = checked;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig.brandGuidelines,
                                            enabledAvoidedLanguage: enabled
                                          }
                                        });
                                      }}
                                      disabled={!isAdmin}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-red-500 text-sm font-bold flex-shrink-0">✗</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Avoid {index + 1}</span>
                                    {isAdmin && (editingConfig?.brandGuidelines?.avoidedLanguage?.length > 3) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                        onClick={() => {
                                          const phrases = [...(editingConfig.brandGuidelines.avoidedLanguage || [])];
                                          const enabled = [...(editingConfig.brandGuidelines.enabledAvoidedLanguage || [])];
                                          phrases.splice(index, 1);
                                          enabled.splice(index, 1);
                                          setEditingConfig({
                                            ...editingConfig,
                                            brandGuidelines: {
                                              ...editingConfig.brandGuidelines,
                                              avoidedLanguage: phrases,
                                              enabledAvoidedLanguage: enabled
                                            }
                                          });
                                        }}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                  <Input
                                    value={phrase}
                                    onChange={(e) => {
                                      if (!isAdmin) return;
                                      const phrases = [...(editingConfig.brandGuidelines.avoidedLanguage || [])];
                                      phrases[index] = e.target.value;
                                      setEditingConfig({
                                        ...editingConfig,
                                        brandGuidelines: {
                                          ...editingConfig.brandGuidelines,
                                          avoidedLanguage: phrases
                                        }
                                      });
                                    }}
                                    className={`w-full ml-0 border-red-200 focus:border-red-400 ${editingConfig?.brandGuidelines?.enabledAvoidedLanguage?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter phrase to avoid..."
                                    disabled={!isAdmin}
                                  />
                                </div>
                              ))}
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const phrases = [...(editingConfig?.brandGuidelines?.avoidedLanguage || [])];
                                    const enabled = [...(editingConfig?.brandGuidelines?.enabledAvoidedLanguage || [])];
                                    phrases.push('');
                                    enabled.push(true);
                                    setEditingConfig({
                                      ...editingConfig,
                                      brandGuidelines: {
                                        ...editingConfig.brandGuidelines,
                                        avoidedLanguage: phrases,
                                        enabledAvoidedLanguage: enabled
                                      }
                                    });
                                  }}
                                  className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50 mt-2"
                                >
                                  + Add phrase to avoid
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="frameworks" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-900">Headline Frameworks</Label>
                            <div className="mt-2 space-y-3">
                              {editingConfig?.copyFrameworks?.headlineFrameworks?.map((framework: any, index: number) => (
                                <div key={index} className="border rounded-lg p-3">
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                      <Label className="text-xs text-gray-600">Framework Name</Label>
                                      <Input 
                                        value={framework.name}
                                        onChange={(e) => {
                                          if (!isAdmin) return;
                                          const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                                          updated[index] = { ...updated[index], name: e.target.value };
                                          setEditingConfig({
                                            ...editingConfig,
                                            copyFrameworks: {
                                              ...editingConfig.copyFrameworks,
                                              headlineFrameworks: updated
                                            }
                                          });
                                        }}
                                        className="mt-1"
                                        size="sm"
                                        placeholder="BENEFIT DRIVEN"
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600">Template Format</Label>
                                      <Input 
                                        value={framework.template}
                                        onChange={(e) => {
                                          if (!isAdmin) return;
                                          const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                                          updated[index] = { ...updated[index], template: e.target.value };
                                          setEditingConfig({
                                            ...editingConfig,
                                            copyFrameworks: {
                                              ...editingConfig.copyFrameworks,
                                              headlineFrameworks: updated
                                            }
                                          });
                                        }}
                                        className="mt-1"
                                        size="sm"
                                        placeholder="[Primary Benefit] + [Outcome]"
                                        disabled={!isAdmin}
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <Label className="text-xs text-gray-600">Description & How to Use</Label>
                                    <Textarea 
                                      value={framework.description}
                                      onChange={(e) => {
                                        if (!isAdmin) return;
                                        const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                                        updated[index] = { ...updated[index], description: e.target.value };
                                        setEditingConfig({
                                          ...editingConfig,
                                          copyFrameworks: {
                                            ...editingConfig.copyFrameworks,
                                            headlineFrameworks: updated
                                          }
                                        });
                                      }}
                                      className="mt-1"
                                      rows={2}
                                      placeholder="Lead with the primary benefit/transformation the product delivers"
                                      disabled={!isAdmin}
                                    />
                                  </div>
                                  <div className="mt-2">
                                    <Label className="text-xs text-gray-600">Example Headlines (one per line)</Label>
                                    <Textarea 
                                      value={framework.examples?.join('\n') || ''}
                                      onChange={(e) => {
                                        if (!isAdmin) return;
                                        const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                                        updated[index] = { 
                                          ...updated[index], 
                                          examples: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        };
                                        setEditingConfig({
                                          ...editingConfig,
                                          copyFrameworks: {
                                            ...editingConfig.copyFrameworks,
                                            headlineFrameworks: updated
                                          }
                                        });
                                      }}
                                      className="mt-1"
                                      rows={2}
                                      placeholder="Natural Glow Simplified
Effortless Beauty Found
Your Skin But Better"
                                      disabled={!isAdmin}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900">Copy Writing Rules (one per line)</Label>
                            <Textarea 
                              value={editingConfig?.copyFrameworks?.primaryTextRules?.join('\n') || ''}
                              onChange={(e) => isAdmin && setEditingConfig({
                                ...editingConfig,
                                copyFrameworks: {
                                  ...editingConfig.copyFrameworks,
                                  primaryTextRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                }
                              })}
                              className="mt-1"
                              rows={4}
                              placeholder="Headlines: Maximum 5 words, must fit in 1 line on mobile
Primary text: 15-25 words optimal for Meta ads
Keep sentences to 8-12 words for mobile comprehension"
                              disabled={!isAdmin}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                                <span className="inline-flex items-center">
                                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                  Brand-First Guidelines
                                </span>
                              </Label>
                              <div className="space-y-2">
                                {(editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst || ['']).map((guideline: string, index: number) => (
                                  <div key={index} className="flex items-start space-x-3 group">
                                    <span className="text-blue-500 text-sm font-medium flex-shrink-0 mt-2">▶</span>
                                    <Input
                                      value={guideline}
                                      onChange={(e) => {
                                        if (!isAdmin) return;
                                        const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.brandFirst || [])];
                                        guidelines[index] = e.target.value;
                                        setEditingConfig({
                                          ...editingConfig,
                                          copyFrameworks: {
                                            ...editingConfig.copyFrameworks,
                                            brandDrBalance: {
                                              ...editingConfig.copyFrameworks.brandDrBalance,
                                              brandFirst: guidelines.filter(g => g.trim() !== '')
                                            }
                                          }
                                        });
                                      }}
                                      className="flex-1 border-blue-200 focus:border-blue-400"
                                      placeholder="Enter brand-first guideline..."
                                      disabled={!isAdmin}
                                    />
                                    {isAdmin && (editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst?.length > 1) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 flex-shrink-0"
                                        onClick={() => {
                                          const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.brandFirst || [])];
                                          guidelines.splice(index, 1);
                                          setEditingConfig({
                                            ...editingConfig,
                                            copyFrameworks: {
                                              ...editingConfig.copyFrameworks,
                                              brandDrBalance: {
                                                ...editingConfig.copyFrameworks.brandDrBalance,
                                                brandFirst: guidelines
                                              }
                                            }
                                          });
                                        }}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {isAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const guidelines = [...(editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst || [])];
                                      guidelines.push('');
                                      setEditingConfig({
                                        ...editingConfig,
                                        copyFrameworks: {
                                          ...editingConfig.copyFrameworks,
                                          brandDrBalance: {
                                            ...editingConfig.copyFrameworks.brandDrBalance,
                                            brandFirst: guidelines
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 mt-2"
                                  >
                                    + Add brand-first guideline
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                                <span className="inline-flex items-center">
                                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                  Direct Response Guidelines
                                </span>
                              </Label>
                              <div className="space-y-2">
                                {(editingConfig?.copyFrameworks?.brandDrBalance?.directResponse || ['']).map((guideline: string, index: number) => (
                                  <div key={index} className="flex items-start space-x-3 group">
                                    <span className="text-orange-500 text-sm font-medium flex-shrink-0 mt-2">⚡</span>
                                    <Input
                                      value={guideline}
                                      onChange={(e) => {
                                        if (!isAdmin) return;
                                        const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.directResponse || [])];
                                        guidelines[index] = e.target.value;
                                        setEditingConfig({
                                          ...editingConfig,
                                          copyFrameworks: {
                                            ...editingConfig.copyFrameworks,
                                            brandDrBalance: {
                                              ...editingConfig.copyFrameworks.brandDrBalance,
                                              directResponse: guidelines.filter(g => g.trim() !== '')
                                            }
                                          }
                                        });
                                      }}
                                      className="flex-1 border-orange-200 focus:border-orange-400"
                                      placeholder="Enter direct response guideline..."
                                      disabled={!isAdmin}
                                    />
                                    {isAdmin && (editingConfig?.copyFrameworks?.brandDrBalance?.directResponse?.length > 1) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 flex-shrink-0"
                                        onClick={() => {
                                          const guidelines = [...(editingConfig.copyFrameworks.brandDrBalance.directResponse || [])];
                                          guidelines.splice(index, 1);
                                          setEditingConfig({
                                            ...editingConfig,
                                            copyFrameworks: {
                                              ...editingConfig.copyFrameworks,
                                              brandDrBalance: {
                                                ...editingConfig.copyFrameworks.brandDrBalance,
                                                directResponse: guidelines
                                              }
                                            }
                                          });
                                        }}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {isAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const guidelines = [...(editingConfig?.copyFrameworks?.brandDrBalance?.directResponse || [])];
                                      guidelines.push('');
                                      setEditingConfig({
                                        ...editingConfig,
                                        copyFrameworks: {
                                          ...editingConfig.copyFrameworks,
                                          brandDrBalance: {
                                            ...editingConfig.copyFrameworks.brandDrBalance,
                                            directResponse: guidelines
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 mt-2"
                                  >
                                    + Add direct response guideline
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="prompts" className="mt-4">
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 font-medium">System & User Prompts</p>
                            <p className="text-sm text-blue-700 mt-1">
                              These are the core instructions sent to Claude AI. Edit them to fine-tune how the AI generates copy.
                            </p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">
                              <span className="inline-flex items-center">
                                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                System Prompt - Main Instructions
                              </span>
                            </Label>
                            <p className="text-xs text-gray-600 mb-3">This tells Claude what role to play and what guidelines to follow</p>
                            <Textarea 
                              value={editingConfig?.systemPrompts?.adCopyGeneration || ''}
                              onChange={(e) => isAdmin && setEditingConfig({
                                ...editingConfig,
                                systemPrompts: {
                                  ...editingConfig.systemPrompts,
                                  adCopyGeneration: e.target.value
                                }
                              })}
                              className="border-purple-200 focus:border-purple-400"
                              rows={15}
                              placeholder="You are an expert Meta ad copywriter specializing in Jones Road Beauty..."
                              disabled={!isAdmin}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">
                              <span className="inline-flex items-center">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                User Prompt Template - Task Instructions
                              </span>
                            </Label>
                            <p className="text-xs text-gray-600 mb-3">This template defines the specific task and format for each request</p>
                            <Textarea 
                              value={editingConfig?.userPromptTemplates?.adCopy || ''}
                              onChange={(e) => isAdmin && setEditingConfig({
                                ...editingConfig,
                                userPromptTemplates: {
                                  ...editingConfig.userPromptTemplates,
                                  adCopy: e.target.value
                                }
                              })}
                              className="border-indigo-200 focus:border-indigo-400"
                              rows={12}
                              placeholder="Generate Meta ad copy based on this content:

TRANSCRIPTION/CONTENT:
{transcription}..."
                              disabled={!isAdmin}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="model" className="mt-4">
                        <div className="space-y-6">
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800 font-medium">AI Model Configuration</p>
                            <p className="text-sm text-purple-700 mt-1">
                              Configure Claude AI model parameters for optimal copy generation performance.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                                <span className="inline-flex items-center">
                                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                  Model Version
                                </span>
                              </Label>
                              <Input 
                                value={editingConfig?.modelParameters?.model || ''}
                                onChange={(e) => isAdmin && setEditingConfig({
                                  ...editingConfig,
                                  modelParameters: {
                                    ...editingConfig.modelParameters,
                                    model: e.target.value
                                  }
                                })}
                                className="border-purple-200 focus:border-purple-400"
                                placeholder="claude-sonnet-4-20250514"
                                disabled={!isAdmin}
                              />
                              <p className="text-xs text-gray-600 mt-1">Latest available Claude model version</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                                <span className="inline-flex items-center">
                                  <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                  Max Tokens
                                </span>
                              </Label>
                              <Input 
                                type="number"
                                value={editingConfig?.modelParameters?.maxTokens || ''}
                                onChange={(e) => isAdmin && setEditingConfig({
                                  ...editingConfig,
                                  modelParameters: {
                                    ...editingConfig.modelParameters,
                                    maxTokens: parseInt(e.target.value) || 1024
                                  }
                                })}
                                className="border-indigo-200 focus:border-indigo-400"
                                placeholder="1024"
                                disabled={!isAdmin}
                              />
                              <p className="text-xs text-gray-600 mt-1">Maximum response length (1024-4000 recommended)</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Load configuration to view and edit AI training settings</p>
                      <p className="text-sm mt-2">This includes brand guidelines, copy frameworks, prompts, and model parameters</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Debug Information Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="text-jones-primary mr-3" size={20} />
                    Prompt Debug Information
                  </h3>
                  
                  {debugInfo ? (
                    <div className="space-y-6">
                      {/* Request Payload */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Request Payload</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(debugInfo.requestPayload, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* System Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">System Prompt</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(debugInfo.systemPrompt, 'system-prompt')}
                          >
                            <Copy size={16} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {debugInfo.systemPrompt}
                          </pre>
                        </div>
                      </div>

                      {/* User Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">User Prompt</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(debugInfo.userPrompt, 'user-prompt')}
                          >
                            <Copy size={16} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200 max-h-64 overflow-y-auto">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {debugInfo.userPrompt}
                          </pre>
                        </div>
                      </div>

                      {/* Raw Response */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Raw AI Response</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(debugInfo.rawResponse, 'raw-response')}
                          >
                            <Copy size={16} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 max-h-64 overflow-y-auto">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {debugInfo.rawResponse}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Generate ad copy to see debug information</p>
                      <p className="text-sm mt-2">This will show the exact prompts, payloads, and responses sent to Claude AI</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
