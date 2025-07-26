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
  
  // Ad Copy States
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [generatedPrimaryText, setGeneratedPrimaryText] = useState('');
  
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
        primaryText += `Specifically designed for ${selectedSubPersona.label.toLowerCase()}s dealing with ${selectedSubPersona.valueProps.slice(0, 2).join(' and ').toLowerCase()}. `;
      }
      primaryText += `Don't wait - thousands are already experiencing the Jones Road difference. Limited time offer!`;
    } else if (brandPercent > 50) {
      primaryText = `Embrace beauty that feels natural and effortless. ${selectedPersona?.description || 'Designed for your authentic self.'} `;
      if (selectedSubPersona) {
        primaryText += `Lovingly crafted for ${selectedSubPersona.label.toLowerCase()}s who cherish ${selectedSubPersona.valueProps.slice(0, 2).join(' and ').toLowerCase()}. `;
      }
      primaryText += `Jones Road Beauty believes in enhancing who you already are - your skin but better, always.`;
    } else {
      primaryText = `What The Foundation is unlike any foundation you've ever tried. Not heavy, cakey, or dry. WTF is light and moisturizing, and barely noticeable so every day can be a great skin day. Perfect for busy ${selectedPersona?.label?.toLowerCase() || 'individuals'} who want to look effortlessly put-together without the time-consuming routine.`;
    }

    setGeneratedHeadlines(headlineTemplates.slice(0, 5));
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

  // API mutations for generating copy
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-ad-copy', {
        method: 'POST',
        body: {
          transcription,
          concept,
          subPersona,
          targetAudience,
          brandDrBalance: brandDrBalance[0],
          useJonesBrandGuide
        }
      });
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
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-jones-primary rounded-lg flex items-center justify-center">
                <Palette className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Jones Road Beauty</h1>
                <p className="text-sm text-gray-500">Meta Ad Generator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
              <div className="w-8 h-8 bg-jones-secondary rounded-full flex items-center justify-center">
                <Users className="text-jones-primary" size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="ads" className="flex items-center space-x-2">
              <Sparkles size={16} />
              <span>Ad Copy Generation</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Landing Page Copy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                {/* Content Input Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Video className="text-jones-primary mr-3" size={20} />
                      Content Input
                    </h3>
                    
                    <div className="space-y-4">
                      <Textarea 
                        rows={8}
                        className="w-full resize-none"
                        placeholder="Paste your video transcription here or upload a file..."
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors">
                            <Upload size={16} />
                            <span>Upload Transcription</span>
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
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="text-jones-primary mr-3" size={20} />
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
                  className="w-full bg-jones-primary hover:bg-jones-accent"
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
              <div className="space-y-6">
                {/* Generated Headlines */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="text-jones-primary mr-3" size={20} />
                        Generated Headlines
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedHeadlines.join('\n'), 'headlines')}
                        disabled={generatedHeadlines.length === 0}
                      >
                        {copiedHeadlines ? <Check size={16} /> : <Copy size={16} />}
                        <span className="ml-1">{copiedHeadlines ? 'Copied' : 'Copy All'}</span>
                      </Button>
                    </div>
                    
                    {generatedHeadlines.length > 0 ? (
                      <div className="space-y-3">
                        {generatedHeadlines.map((headline, index) => (
                          <div key={index} className="group relative border border-gray-200 rounded-lg p-4 hover:border-jones-primary transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{headline}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    {getWordCount(headline)} words
                                  </Badge>

                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(headline, 'headline')}
                              >
                                <Copy size={16} />
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="text-jones-primary mr-3" size={20} />
                        Primary Text
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrimaryText, 'primary')}
                        disabled={!generatedPrimaryText}
                      >
                        {copiedPrimaryText ? <Check size={16} /> : <Copy size={16} />}
                        <span className="ml-1">{copiedPrimaryText ? 'Copied' : 'Copy'}</span>
                      </Button>
                    </div>
                    
                    {generatedPrimaryText ? (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-900 leading-relaxed">{generatedPrimaryText}</p>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {getWordCount(generatedPrimaryText)} words
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
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


              </div>
            </div>
          </TabsContent>

          <TabsContent value="landing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                {/* Landing Page Type Selection */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="text-jones-primary mr-3" size={20} />
                      Landing Page Type
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Globe className="text-jones-primary mr-3" size={20} />
                      Content Source
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                          rows={6}
                          className="w-full resize-none"
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
                  className="w-full bg-jones-primary hover:bg-jones-accent"
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
              <div className="space-y-6">
                {/* Generated Landing Page Copy */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="text-jones-primary mr-3" size={20} />
                        Generated Landing Page
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(generatedLandingCopy, null, 2), 'landing')}
                        disabled={!generatedLandingCopy.headline}
                      >
                        {copiedLandingCopy ? <Check size={16} /> : <Copy size={16} />}
                        <span className="ml-1">{copiedLandingCopy ? 'Copied' : 'Copy All'}</span>
                      </Button>
                    </div>
                    
                    {generatedLandingCopy.headline ? (
                      <div className="space-y-6">
                        <div className="border-l-4 border-jones-primary pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Headline</h4>
                          <p className="text-xl font-bold text-gray-900">{generatedLandingCopy.headline}</p>
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
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Brand Alignment</span>
                        <span className="text-sm font-medium text-blue-700">92%</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm text-gray-700">Readability Score</span>
                        <span className="text-sm font-medium text-yellow-700">8.5/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
