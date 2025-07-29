import { useState, useEffect, useMemo, useCallback } from 'react';
import { Upload, Copy, Check, Target, Sparkles, Video, FileText, Zap, ThumbsUp, ThumbsDown, Star, Globe, List, AlertCircle, Palette, Users, Settings, LogOut, User, Database, Brain, BarChart3, Camera, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Direct textarea implementation to avoid deployment sync issues
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { ProductSelection } from "@/components/ProductSelection";


export default function MetaAdGenerator() {
  const [activeTab, setActiveTab] = useState('ads');
  
  // Admin key protection for AI Settings
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  
  // Handle AI Settings tab click
  const handleAISettingsClick = () => {
    if (hasAdminAccess) {
      setActiveTab('settings');
    } else {
      setShowAdminKeyPrompt(true);
    }
  };
  
  // Admin key verification
  const verifyAdminKey = async (key: string) => {
    try {
      const response = await fetch('/api/verify-admin-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey: key }),
      });
      
      if (response.ok) {
        setHasAdminAccess(true);
        setShowAdminKeyPrompt(false);
        setAdminKeyInput('');
        setActiveTab('settings');
        toast({
          title: "Access Granted",
          description: "You now have access to AI Settings",
          variant: "default",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin key",
        variant: "destructive",
      });
    }
  };
  
  // BYPASS AUTHENTICATION - Direct access mode for all copywriting features
  const effectiveUser = {
    username: 'user@jonesroadbeauty.com',
    role: hasAdminAccess ? 'admin' : 'user',
    isAdmin: hasAdminAccess
  };
  
  // Dummy auth functions for compatibility
  const logout = () => {};
  const isLoggingOut = false;
  const setupAdmin = () => {};
  const isSettingUpAdmin = false;
  const [transcription, setTranscription] = useState('');
  
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
  
  // Training Configuration States
  const [trainingConfig, setTrainingConfig] = useState<any>(null);
  

  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);
  // Admin state managed through useAuth hook
  const [adminPassword, setAdminPassword] = useState('');
  
  // Review stats state
  const [reviewStats, setReviewStats] = useState<any>(null);
  
  // Auto-load training config when settings tab is accessed
  useEffect(() => {
    if (activeTab === 'settings' && !trainingConfig && !configLoading) {
      loadTrainingConfigMutation.mutate();
    }
  }, [activeTab]);
  
  // Load review stats
  useEffect(() => {
    fetch('/api/reviews/stats')
      .then(res => res.json())
      .then(data => setReviewStats(data))
      .catch(err => console.error('Failed to load review stats:', err));
  }, []); // Remove effectiveUser dependency to prevent infinite loop
  
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
  
  // Remove individual isLoading since we'll use mutation loading states
  const [copiedHeadlines, setCopiedHeadlines] = useState(false);
  const [copiedPrimaryText, setCopiedPrimaryText] = useState(false);
  const [copiedLandingCopy, setCopiedLandingCopy] = useState(false);
  const [copiedStatic, setCopiedStatic] = useState(false);
  const [copiedCreativeBrief, setCopiedCreativeBrief] = useState(false);
  const [useJonesBrandGuide, setUseJonesBrandGuide] = useState(true);
  const [brandDrBalance, setBrandDrBalance] = useState([50]);
  
  // Influencer Mode States
  const [enableInfluencerMode, setEnableInfluencerMode] = useState(false);
  
  // Custom Request States
  const [customRequest, setCustomRequest] = useState('');
  const [customRequestHistory, setCustomRequestHistory] = useState<Array<{
    request: string;
    response: string;
    timestamp: Date;
  }>>([]);
  
  // Launch Brief state
  const [launchBrief, setLaunchBrief] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [generatedLaunchCopy, setGeneratedLaunchCopy] = useState<{[key: string]: string}>({});
  const [briefSource, setBriefSource] = useState<'paste' | 'upload' | 'drive'>('paste');

  // Strategy Planning States
  const [strategyBrief, setStrategyBrief] = useState('');
  const [strategyDriveLink, setStrategyDriveLink] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [generatedStrategies, setGeneratedStrategies] = useState<{[key: string]: any}>({});
  const [strategyBriefSource, setStrategyBriefSource] = useState<'paste' | 'upload' | 'drive'>('paste');

  // Creative Brief Generator States
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingTranscription, setMeetingTranscription] = useState('');
  const [creativeBriefSource, setCreativeBriefSource] = useState<'paste' | 'upload' | 'drive'>('paste');
  const [generatedCreativeBrief, setGeneratedCreativeBrief] = useState('');
  const [creativeBriefDriveLink, setCreativeBriefDriveLink] = useState('');

  // Launch tab navigation state
  const [launchSubTab, setLaunchSubTab] = useState('creative-brief');
  const [generatedCustomResponse, setGeneratedCustomResponse] = useState('');
  const [influencerHandle, setInfluencerHandle] = useState('');
  const [voiceAnalysisMethod, setVoiceAnalysisMethod] = useState('combined');
  const [influencerBrandBalance, setInfluencerBrandBalance] = useState([50]);

  // Static Ad Analysis States
  const [staticAdImage, setStaticAdImage] = useState('');
  const [staticAdImagePreview, setStaticAdImagePreview] = useState('');
  const [staticAdAnalysis, setStaticAdAnalysis] = useState('');

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
    setSelectedHeadlineIndex(0); // Reset to first headline when new ones are generated
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

  const handleTranscriptionFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setUploadedImage(result);
        setAirLink(''); // Clear air link if image is uploaded
      }
    };
    reader.readAsDataURL(file);
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

  // Admin state (bypassed for direct access)
  const [isAdmin, setIsAdmin] = useState(true);
  
  // Admin authentication (bypassed)
  const authenticateAdmin = () => {
    setIsAdmin(true);
    toast({
      title: "Admin Access Granted",
      description: "You can now edit training configuration.",
    });
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
      setCurrentCopyId(data.copyId || null); // Store copy ID for feedback
      setSelectedHeadlineIndex(0); // Reset to first headline when new ones are generated
      // Reset feedback state for new generation
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

  // Revision mutation for copy improvements
  const reviseContentMutation = useMutation({
    mutationFn: async ({ instructions, type, index, field }: {
      instructions: string;
      type: 'headline' | 'primaryText' | 'landingCopy' | 'custom';
      index?: number;
      field?: string;
    }) => {
      const payload = {
        originalContent: type === 'headline' ? generatedHeadlines[index || 0].copy :
                        type === 'primaryText' ? generatedPrimaryText :
                        type === 'landingCopy' && field ? (generatedLandingCopy as any)[field] :
                        type === 'custom' ? generatedCustomResponse : '',
        revisionInstructions: instructions,
        contentType: type,
        context: {
          transcription,
          customBrief,
          concept,
          subPersona,
          targetAudience,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          field: field || undefined,
          customRequest: type === 'custom' ? customRequest : undefined
        }
      };
      
      return await apiRequest('/api/revise-content', {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: (data) => {
      // Update the appropriate content with revised version
      if (selectedItemForRevision) {
        const { type, index, field } = selectedItemForRevision;
        
        if (type === 'headline' && index !== undefined) {
          const newHeadlines = [...generatedHeadlines];
          newHeadlines[index] = { ...newHeadlines[index], copy: data.revisedContent };
          setGeneratedHeadlines(newHeadlines);
        } else if (type === 'primaryText') {
          setGeneratedPrimaryText(data.revisedContent);
        } else if (type === 'landingCopy' && field) {
          setGeneratedLandingCopy(prev => ({
            ...prev,
            [field]: data.revisedContent
          }));
        } else if (type === 'custom') {
          setGeneratedCustomResponse(data.revisedContent);
        }
      }
      
      // Close revision panel
      setShowRevisionPanel(false);
      setRevisionInstructions('');
      setSelectedItemForRevision(null);
      
      toast({
        title: "Content Revised Successfully",
        description: "Your content has been improved based on your feedback.",
      });
    },
    onError: (error) => {
      toast({
        title: "Revision Failed",
        description: "Failed to revise content. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit feedback mutation for analytics
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: { copyId: string; rating: string; feedback?: string }) => {
      return await apiRequest('/api/copy-feedback', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback helps improve the AI copywriter.",
      });
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Custom request mutation
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
      
      // Add to history
      setCustomRequestHistory(prev => [{
        request: customRequest,
        response: data.response,
        timestamp: new Date()
      }, ...prev]);
      
      toast({
        title: "Custom Copy Generated Successfully",
        description: "Your custom copywriting request has been completed.",
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

  // Launch copy generation mutation
  const generateLaunchCopyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-launch-copy', {
        method: 'POST',
        body: {
          launchBrief,
          selectedDeliverables,
          concept,
          subPersona,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          useJonesBrandGuide
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedLaunchCopy(data.deliverables || {});
      toast({
        title: "Launch Copy Generated Successfully",
        description: `Generated ${selectedDeliverables.length} deliverables for your product launch.`,
      });
    },
    onError: (error) => {
      console.error('Launch generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate launch copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Strategy planning generation mutation
  const generateStrategyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-strategy', {
        method: 'POST',
        body: {
          strategyBrief,
          selectedDepartments,
          concept,
          subPersona,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          useJonesBrandGuide
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedStrategies(data.strategies || {});
      toast({
        title: "Strategy Planning Generated Successfully",
        description: `Generated strategic frameworks for ${selectedDepartments.length} departments.`,
      });
    },
    onError: (error) => {
      console.error('Strategy generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate strategy planning. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Creative brief generation mutation
  const generateCreativeBriefMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-creative-brief', {
        method: 'POST',
        body: {
          meetingNotes,
          meetingTranscription,
          concept,
          subPersona,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          useJonesBrandGuide
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedCreativeBrief(data.creativeBrief || '');
      toast({
        title: "Creative Brief Generated Successfully",
        description: "Your creative brief draft has been generated based on the holiday kit format.",
      });
    },
    onError: (error) => {
      console.error('Creative brief generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate creative brief. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Creative Brief Generation Handler
  const handleGenerateCreativeBrief = async () => {
    if (!meetingNotes.trim()) {
      toast({
        title: "Meeting Notes Required",
        description: "Please add meeting notes before generating the creative brief.",
        variant: "destructive"
      });
      return;
    }

    generateCreativeBriefMutation.mutate();
  };

  // Google Drive fetch mutation
  const fetchDriveBriefMutation = useMutation({
    mutationFn: async (driveUrl: string) => {
      return await apiRequest('/api/fetch-drive-brief', {
        method: 'POST',
        body: { driveUrl }
      });
    },
    onSuccess: (data) => {
      setLaunchBrief(data.content || '');
      toast({
        title: "Brief Loaded Successfully",
        description: "Google Drive brief has been loaded into the editor.",
      });
    },
    onError: (error) => {
      console.error('Drive fetch error:', error);
      toast({
        title: "Failed to Load Brief",
        description: "Could not access the Google Drive document. Please check the link and permissions.",
        variant: "destructive"
      });
    }
  });

  // File upload handler
  const handleFileUpload = async (file: File) => {
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setLaunchBrief(content);
        toast({
          title: "File Loaded Successfully",
          description: `${file.name} has been loaded into the editor.`,
        });
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Handle PDF upload
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          setLaunchBrief(data.content);
          toast({
            title: "PDF Loaded Successfully",
            description: `${file.name} has been parsed and loaded into the editor.`,
          });
        } else {
          throw new Error('Failed to parse PDF');
        }
      } catch (error) {
        toast({
          title: "PDF Parse Error",
          description: "Failed to parse PDF file. Please try a text file instead.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Unsupported File Type",
        description: "Currently supports .txt and .pdf files. Word document support coming soon.",
        variant: "destructive"
      });
    }
  };

  // Static ad analysis mutation
  const analyzeStaticAdMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/analyze-static-ad', {
        method: 'POST',
        body: {
          staticAdImage,
          concept,
          subPersona,
          brandDrBalance: brandDrBalance[0],
          selectedProduct
        }
      });
    },
    onSuccess: (data) => {
      setStaticAdAnalysis(data.analysis || '');
      toast({
        title: "Ad Analysis Complete",
        description: "Static ad has been analyzed and Jones Road variations generated.",
      });
    },
    onError: (error) => {
      console.error('Static ad analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze static ad. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateLandingCopyMutation = useMutation({
    mutationFn: async () => {
      // When using ads content, include the selected headline and primary text
      const selectedHeadline = generatedHeadlines[selectedHeadlineIndex];
      const chosenAdsContent = useAdsForLanding && selectedHeadline ? {
        headline: selectedHeadline.copy,
        framework: selectedHeadline.framework,
        primaryText: generatedPrimaryText,
        transcription: transcription // Include transcription for consistency
      } : adsContent;

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
          transcription: useAdsForLanding ? transcription : undefined // Include transcription when using ads content
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
      if (type === 'static-analysis') setCopiedStatic(true);
      if (type === 'creative-brief') setCopiedCreativeBrief(true);
      if (type === 'custom') {
        // Custom copy doesn't need specific state, just show the toast
      }
      
      setTimeout(() => {
        setCopiedHeadlines(false);
        setCopiedPrimaryText(false);
        setCopiedLandingCopy(false);
        setCopiedStatic(false);
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
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{effectiveUser?.username}</span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings size={16} className="text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Connected</span>
                    </div>
                    {effectiveUser?.role === 'admin' && (
                      <div className="text-xs text-blue-600 mt-1">Administrator</div>
                    )}
                  </div>
                  
                  {effectiveUser?.role !== 'admin' && (
                    <DropdownMenuItem 
                      onClick={setupAdmin}
                      disabled={isSettingUpAdmin}
                      className="flex items-center space-x-2"
                    >
                      <Settings size={14} />
                      <span>{isSettingUpAdmin ? 'Setting up...' : 'Become Admin'}</span>
                    </DropdownMenuItem>
                  )}
                  
                  {effectiveUser?.role === 'admin' && (
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/users'}
                      className="flex items-center space-x-2"
                    >
                      <Users size={14} />
                      <span>Manage Users</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex w-full mb-6 sm:mb-8">
            <TabsList className="grid grid-cols-5 flex-1">
              <TabsTrigger value="ads" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <Sparkles size={16} />
                <span className="text-xs sm:text-sm">Ad Copy</span>
              </TabsTrigger>
              
              <TabsTrigger value="landing" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <FileText size={16} />
                <span className="text-xs sm:text-sm">Landing Page</span>
              </TabsTrigger>
              
              <TabsTrigger value="static-ad" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <Camera size={16} />
                <span className="text-xs sm:text-sm">Static Ad</span>
              </TabsTrigger>
              
              <TabsTrigger value="launch" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <List size={16} />
                <span className="text-xs sm:text-sm">Launch</span>
              </TabsTrigger>
              
              <TabsTrigger value="custom" className="tabs-trigger-fix flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2">
                <Brain size={16} />
                <span className="text-xs sm:text-sm">Custom Request</span>
              </TabsTrigger>
            </TabsList>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={handleAISettingsClick}
              className="ml-2 flex-col sm:flex-row space-y-0 sm:space-y-0 sm:space-x-2 h-auto py-2 px-3"
              style={activeTab === 'settings' ? { backgroundColor: '#004182', color: 'white' } : {}}
            >
              {hasAdminAccess ? <Settings size={16} /> : <Lock size={16} />}
              <span className="text-xs sm:text-sm">AI Settings</span>
            </Button>
          </div>

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

                      <div className="text-center text-sm text-gray-500">OR</div>

                      <textarea 
                        rows={6}
                        className="w-full resize-none text-sm"
                        placeholder="Paste your video transcription or ad concept here..."
                        value={transcription}
                        onChange={(e) => {
                          console.log('RAW TEXTAREA DIRECT: Input detected, length:', e.target.value.length);
                          handleTranscriptionChange(e.target.value);
                        }}
                        style={{
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '8px',
                          fontFamily: 'inherit'
                        }}
                      />
                      
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
                            onChange={handleTranscriptionFileUpload} 
                          />
                          
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
                          Quick Select - Top Products
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            { value: 'miracle balm', label: 'Miracle Balm' },
                            { value: 'foundation', label: 'What The Foundation' },
                            { value: 'tinted moisturizer', label: 'Just Enough' },
                            { value: 'hero kit', label: 'The Hero Kit' }
                          ].map((product) => (
                            <Button
                              key={product.value}
                              variant={selectedProduct === product.value ? "default" : "outline"}
                              size="sm"
                              className={`text-xs px-3 py-1 h-8 ${
                                selectedProduct === product.value 
                                  ? 'bg-[#004182] text-white border-[#004182]' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedProduct(product.value)}
                            >
                              {product.label}
                            </Button>
                          ))}
                        </div>
                        
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
                              <SelectItem value="miracle balm">Miracle Balm</SelectItem>
                              <SelectItem value="foundation">What The Foundation</SelectItem>
                              <SelectItem value="tinted moisturizer">Just Enough Tinted Moisturizer</SelectItem>
                              <SelectItem value="hero kit">The Hero Kit</SelectItem>
                              <SelectItem value="sunscreen">Everyday Sunscreen</SelectItem>
                              <SelectItem value="mascara">What The Mascara</SelectItem>
                              <SelectItem value="lip stick">Lip & Cheek Stick</SelectItem>
                              <SelectItem value="face pencil">The Face Pencil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedProduct && (
                          <p className="text-xs text-gray-500 mt-2">
                            AI will use customer reviews specific to {
                              selectedProduct === 'miracle balm' ? 'Miracle Balm' :
                              selectedProduct === 'foundation' ? 'What The Foundation' :
                              selectedProduct === 'tinted moisturizer' ? 'Just Enough Tinted Moisturizer' :
                              selectedProduct === 'hero kit' ? 'The Hero Kit' :
                              selectedProduct === 'sunscreen' ? 'Everyday Sunscreen' :
                              selectedProduct === 'mascara' ? 'What The Mascara' :
                              selectedProduct === 'lip stick' ? 'Lip & Cheek Stick' :
                              selectedProduct === 'face pencil' ? 'The Face Pencil' :
                              selectedProduct
                            } for authentic language patterns
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={generateAdCopy} 
                  className="w-full text-white"
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
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 text-sm font-medium px-2.5 py-1">
                                    {headline.framework}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 text-sm px-2.5 py-1">
                                    {getWordCount(headline.copy)} words
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setSelectedItemForRevision({ type: 'headline', index });
                                    setShowRevisionPanel(true);
                                  }}
                                >
                                  <Target size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                  onClick={() => copyToClipboard(headline.copy, 'headline')}
                                >
                                  <Copy size={14} />
                                </Button>
                              </div>
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
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedItemForRevision({ type: 'primaryText' });
                            setShowRevisionPanel(true);
                          }}
                          disabled={!generatedPrimaryText}
                          className="w-full sm:w-auto"
                        >
                          <Target size={16} />
                          <span className="ml-1">Improve</span>
                        </Button>
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
                    </div>
                    
                    {generatedPrimaryText ? (
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 group">
                        <div className="flex items-start justify-between">
                          <p className="text-gray-900 leading-relaxed text-sm sm:text-base flex-1">{generatedPrimaryText}</p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 mt-0"
                            onClick={() => {
                              setSelectedItemForRevision({ type: 'primaryText' });
                              setShowRevisionPanel(true);
                            }}
                            title="Suggest improvements"
                          >
                            <Target size={14} />
                          </Button>
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
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No primary text generated yet. Click "Generate Ad Copy" to create primary text.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Feedback Section for Analytics */}
                {currentCopyId && (generatedHeadlines.length > 0 || generatedPrimaryText) && (
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
                            onClick={() => setCopyRating('excellent')}
                          >
                            <ThumbsUp size={16} className="mr-1" />
                            Excellent
                          </Button>
                          <Button
                            variant={copyRating === 'good' ? 'default' : 'outline'}
                            size="sm"
                            className={copyRating === 'good' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                            onClick={() => setCopyRating('good')}
                          >
                            <Star size={16} className="mr-1" />
                            Good
                          </Button>
                          <Button
                            variant={copyRating === 'poor' ? 'default' : 'outline'}
                            size="sm"
                            className={copyRating === 'poor' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                            onClick={() => setCopyRating('poor')}
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
                              onChange={(e) => setFeedbackText(e.target.value)}
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
                              disabled={submitFeedbackMutation.isPending}
                            >
                              {submitFeedbackMutation.isPending ? (
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

                {/* Ad Preview Section */}
                {(generatedHeadlines.length > 0 || generatedPrimaryText) && (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                          <Globe className="text-jones-primary mr-2 sm:mr-3" size={18} />
                          Ad Preview
                        </h3>
                        <div className="flex items-center space-x-3">
                          {generatedHeadlines.length > 1 && (
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm text-gray-600">Headline:</Label>
                              <Select value={selectedHeadlineIndex.toString()} onValueChange={(value) => setSelectedHeadlineIndex(parseInt(value))}>
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {generatedHeadlines.map((headline, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                      <div className="flex flex-col py-1">
                                        <span className="font-medium text-sm">{headline.framework}</span>
                                        <span className="text-xs text-gray-500 truncate">{headline.copy.substring(0, 35)}...</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                      {selectedProduct === 'foundation' ? 'WTF' : 
                                       selectedProduct === 'mascara' ? 'WTM' :
                                       selectedProduct === 'sunscreen' ? 'SPF' :
                                       selectedProduct === 'miracle balm' ? 'MB' :
                                       selectedProduct === 'tinted moisturizer' ? 'JE' :
                                       selectedProduct === 'hero kit' ? 'HK' : 'JR'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-gray-500 text-xs font-medium">
                                  {selectedProduct === 'foundation' ? 'What The Foundation' : 
                                   selectedProduct === 'mascara' ? 'What The Mascara' :
                                   selectedProduct === 'sunscreen' ? 'Everyday Sunscreen' :
                                   selectedProduct === 'miracle balm' ? 'Miracle Balm' :
                                   selectedProduct === 'tinted moisturizer' ? 'Just Enough' :
                                   selectedProduct === 'lip stick' ? 'Lip & Cheek Stick' :
                                   selectedProduct === 'face pencil' ? 'The Face Pencil' :
                                   selectedProduct === 'hero kit' ? 'The Hero Kit' : 
                                   'Jones Road Beauty'}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Mobile Link Preview Section */}
                        {generatedHeadlines.length > 0 && (
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="text-[13px] text-gray-500 mb-1 uppercase tracking-wide font-medium">
                              JONESROADBEAUTY.COM
                            </div>
                            <div className="font-medium text-[15px] text-gray-900 mb-3 leading-tight">
                              {generatedHeadlines[selectedHeadlineIndex]?.copy || 'Your Next Beauty Game-Changer'}
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <p className="text-xs text-gray-500 mt-1">List-based content with numbered benefits</p>
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
                        <p className="text-xs text-gray-500 mt-1">Story-driven approach connecting to benefits</p>
                      </div>
                      
                      <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        landingPageType === 'multiProduct' 
                          ? 'border-jones-primary bg-jones-light' 
                          : 'border-gray-300 hover:border-jones-primary'
                      }`} onClick={() => setLandingPageType('multiProduct')}>
                        <div className="flex items-center justify-between mb-2">
                          <Sparkles className={landingPageType === 'multiProduct' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                          <div className={`w-4 h-4 border-2 rounded-full ${
                            landingPageType === 'multiProduct' 
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
                          Quick Select - Top Products
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            { value: 'miracle balm', label: 'Miracle Balm' },
                            { value: 'foundation', label: 'What The Foundation' },
                            { value: 'tinted moisturizer', label: 'Just Enough' },
                            { value: 'hero kit', label: 'The Hero Kit' }
                          ].map((product) => (
                            <Button
                              key={product.value}
                              variant={selectedProduct === product.value ? "default" : "outline"}
                              size="sm"
                              className={`text-xs px-3 py-1 h-8 ${
                                selectedProduct === product.value 
                                  ? 'bg-[#004182] text-white border-[#004182]' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedProduct(product.value)}
                            >
                              {product.label}
                            </Button>
                          ))}
                        </div>
                        
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
                              <SelectItem value="miracle balm">Miracle Balm</SelectItem>
                              <SelectItem value="foundation">What The Foundation</SelectItem>
                              <SelectItem value="tinted moisturizer">Just Enough Tinted Moisturizer</SelectItem>
                              <SelectItem value="hero kit">The Hero Kit</SelectItem>
                              <SelectItem value="sunscreen">Everyday Sunscreen</SelectItem>
                              <SelectItem value="mascara">What The Mascara</SelectItem>
                              <SelectItem value="lip stick">Lip & Cheek Stick</SelectItem>
                              <SelectItem value="face pencil">The Face Pencil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedProduct && (
                          <p className="text-xs text-gray-500 mt-2">
                            AI will use customer reviews specific to {
                              selectedProduct === 'miracle balm' ? 'Miracle Balm' :
                              selectedProduct === 'foundation' ? 'What The Foundation' :
                              selectedProduct === 'tinted moisturizer' ? 'Just Enough Tinted Moisturizer' :
                              selectedProduct === 'hero kit' ? 'The Hero Kit' :
                              selectedProduct === 'sunscreen' ? 'Everyday Sunscreen' :
                              selectedProduct === 'mascara' ? 'What The Mascara' :
                              selectedProduct === 'lip stick' ? 'Lip & Cheek Stick' :
                              selectedProduct === 'face pencil' ? 'The Face Pencil' :
                              selectedProduct
                            } for authentic language patterns
                          </p>
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
                          placeholder="Describe your product, its benefits, target audience, and key selling points..."
                          value={productBrief}
                          onChange={(e) => setProductBrief(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Include product features, benefits, target audience, and unique selling points for better landing page copy
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
                                        <span className="text-xs text-gray-500 truncate max-w-xs">{headline.copy}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {generatedPrimaryText && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600 mb-2 block">Selected Primary Text</Label>
                                <div className="p-3 bg-white rounded border text-sm text-gray-700">
                                  {generatedPrimaryText}
                                </div>
                              </div>
                            )}
                            
                            {transcription && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600 mb-2 block">Source Transcription</Label>
                                <div className="p-3 bg-gray-50 rounded border text-xs text-gray-600 max-h-24 overflow-y-auto">
                                  {getTranscriptionPreview()}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  This transcription content will be included in the landing page generation for consistency
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                        

                        
                        {generatedLandingCopy.sections.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              5 reasons
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
              </div>
            </div>
          </TabsContent>

          {/* Custom Request Tab */}
          <TabsContent value="custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Input Section */}
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Brain className="text-jones-primary mr-2 sm:mr-3" size={18} />
                      Custom Copy Request
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe what you need
                        </Label>
                        <Textarea
                          placeholder="Example: Write a product announcement for our new mascara launch targeting busy moms, or create social media captions for a limited-time promotion, or write email subject lines for our newsletter..."
                          value={customRequest}
                          onChange={(e) => setCustomRequest(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Be as specific as possible about format, audience, tone, and purpose
                        </p>
                      </div>

                      {/* Basic Settings */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Audience</Label>
                          <Select value={concept} onValueChange={setConcept}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lifeJuggler">Life Juggler</SelectItem>
                              <SelectItem value="cleanBeautyEnthusiast">Clean Beauty Enthusiast</SelectItem>
                              <SelectItem value="timeConstrainedProfessional">Time-Constrained Professional</SelectItem>
                              <SelectItem value="naturalBeautySeeker">Natural Beauty Seeker</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Product Context</Label>
                          <ProductSelection
                            landingPageType="single"
                            selectedProduct={selectedProduct}
                            setSelectedProduct={setSelectedProduct}
                            selectedProducts={[]}
                            setSelectedProducts={() => {}}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Brand/DR Balance: {brandDrBalance[0]}% Brand
                          </Label>
                          <Slider
                            value={brandDrBalance}
                            onValueChange={setBrandDrBalance}
                            max={100}
                            step={10}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Direct Response</span>
                            <span>Brand Focused</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => generateCustomCopyMutation.mutate()}
                        disabled={!customRequest.trim() || generateCustomCopyMutation.isPending}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        {generateCustomCopyMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Brain size={16} />
                            <span>Generate Custom Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Output Section */}
              <div className="space-y-4 sm:space-y-6">
                {generatedCustomResponse && (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                          <Sparkles className="text-jones-primary mr-2 sm:mr-3" size={18} />
                          Generated Copy
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItemForRevision({ type: 'custom' });
                              setShowRevisionPanel(true);
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Sparkles size={14} />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(generatedCustomResponse, 'custom')}
                            className="flex items-center space-x-1"
                          >
                            <Copy size={14} />
                            <span>Copy</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                          {generatedCustomResponse}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Request History */}
                {customRequestHistory.length > 0 && (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                        Recent Requests
                      </h3>
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {customRequestHistory.slice(0, 5).map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              {item.timestamp.toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Request: {item.request.substring(0, 100)}
                              {item.request.length > 100 && '...'}
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                              {item.response.substring(0, 200)}
                              {item.response.length > 200 && '...'}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(item.response, 'custom')}
                              className="mt-2 flex items-center space-x-1"
                            >
                              <Copy size={12} />
                              <span>Copy</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Launch Tab with Nested Structure */}
          <TabsContent value="launch">
            <div className="space-y-6">
              {/* Launch Sub-Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setLaunchSubTab('creative-brief')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      launchSubTab === 'creative-brief'
                        ? 'border-jones-primary text-jones-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Creative Brief Generator
                  </button>
                  <button
                    onClick={() => setLaunchSubTab('strategy')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      launchSubTab === 'strategy'
                        ? 'border-jones-primary text-jones-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Strategy Planning
                  </button>
                  <button
                    onClick={() => setLaunchSubTab('launch-brief')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      launchSubTab === 'launch-brief'
                        ? 'border-jones-primary text-jones-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Launch Brief Generation
                  </button>
                </div>
              </div>

              {/* Launch Content Wrapper */}
              <div>
              {/* Creative Brief Generator */}
              {launchSubTab === 'creative-brief' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Input Section */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Meeting Notes Input */}
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                          Meeting Notes & Transcription
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Brief Source Selection */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">
                              How would you like to add your content?
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => setCreativeBriefSource('paste')}
                                className={`p-3 rounded-lg border text-center transition-colors ${
                                  creativeBriefSource === 'paste' 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm font-medium">Paste Text</div>
                                <div className="text-xs text-gray-500 mt-1">Type or paste</div>
                              </button>
                              <button
                                onClick={() => setCreativeBriefSource('drive')}
                                className={`p-3 rounded-lg border text-center transition-colors ${
                                  creativeBriefSource === 'drive' 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm font-medium">Google Drive</div>
                                <div className="text-xs text-gray-500 mt-1">Share link</div>
                              </button>
                              <button
                                onClick={() => setCreativeBriefSource('upload')}
                                className={`p-3 rounded-lg border text-center transition-colors ${
                                  creativeBriefSource === 'upload' 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm font-medium">File Upload</div>
                                <div className="text-xs text-gray-500 mt-1">.txt/.pdf</div>
                              </button>
                            </div>
                          </div>

                          {/* Paste Option */}
                          {creativeBriefSource === 'paste' && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Meeting Notes
                                </Label>
                                <textarea
                                  rows={6}
                                  className="w-full resize-none text-sm"
                                  placeholder="Paste your meeting notes here including key decisions, product details, target audience discussions, creative direction, etc..."
                                  value={meetingNotes}
                                  onChange={(e) => setMeetingNotes(e.target.value)}
                                  style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Meeting Transcription <span className="text-xs text-gray-500">(Optional)</span>
                                </Label>
                                <textarea
                                  rows={6}
                                  className="w-full resize-none text-sm"
                                  placeholder="Paste your meeting transcription here for additional context and direct quotes..."
                                  value={meetingTranscription}
                                  onChange={(e) => setMeetingTranscription(e.target.value)}
                                  style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-500">
                            Upload your meeting notes and transcription. The AI will generate a comprehensive creative brief following the holiday kit format with all necessary sections for campaign planning.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      onClick={() => generateCreativeBriefMutation.mutate()}
                      className="w-full text-white"
                      style={{ backgroundColor: '#004182' }}
                      disabled={!meetingNotes.trim() || generateCreativeBriefMutation.isPending}
                    >
                      {generateCreativeBriefMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Creative Brief...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2" size={16} />
                          Generate Creative Brief
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-4 sm:space-y-6">
                    {generatedCreativeBrief ? (
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              Generated Creative Brief
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedCreativeBrief, 'creative-brief')}
                              className="flex items-center space-x-1"
                            >
                              <Copy size={12} />
                              <span>Copy</span>
                            </Button>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                              {generatedCreativeBrief}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-4 sm:p-6 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Creative Brief Generator</h3>
                          <p className="text-gray-600 mb-4">
                            Upload your meeting notes and transcription to generate a comprehensive creative brief.
                          </p>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>• Paste meeting notes and transcription</p>
                            <p>• Generate professional creative brief</p>
                            <p>• Based on holiday kit brief format</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Strategy Planning */}
              {launchSubTab === 'strategy' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Input Section */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Strategy Brief Input */}
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                          Strategic Planning Brief
                        </h3>
                    
                    <div className="space-y-4">
                      {/* Brief Source Selection */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          How would you like to add your brief?
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setStrategyBriefSource('paste')}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              strategyBriefSource === 'paste' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">Paste Text</div>
                            <div className="text-xs text-gray-500 mt-1">Type or paste</div>
                          </button>
                          <button
                            onClick={() => setStrategyBriefSource('drive')}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              strategyBriefSource === 'drive' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">Google Drive</div>
                            <div className="text-xs text-gray-500 mt-1">Share link</div>
                          </button>
                          <button
                            onClick={() => setStrategyBriefSource('upload')}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              strategyBriefSource === 'upload' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">File Upload</div>
                            <div className="text-xs text-gray-500 mt-1">.txt/.pdf</div>
                          </button>
                        </div>
                      </div>

                      {/* Paste Option */}
                      {strategyBriefSource === 'paste' && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Paste Your Creative Brief
                          </Label>
                          <textarea
                            rows={10}
                            className="w-full resize-none text-sm"
                            placeholder="Paste your complete creative brief here including product details, target audience, key messages, positioning, launch timeline, budget, objectives, etc..."
                            value={strategyBrief}
                            onChange={(e) => setStrategyBrief(e.target.value)}
                            style={{
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '12px',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Include all relevant information: product details, positioning, target audience, key messages, launch goals, timeline, budget considerations, competitive landscape, etc.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Department Selection */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="text-jones-primary mr-2 sm:mr-3" size={18} />
                      Select Departments
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Departments organized by function */}
                      {[
                        {
                          department: 'Ecom',
                          color: '#3b82f6',
                          description: 'Website strategy, product pages, user experience, conversion optimization'
                        },
                        {
                          department: 'Retention',
                          color: '#10b981',
                          description: 'Email marketing, SMS campaigns, loyalty programs, customer lifecycle'
                        },
                        {
                          department: 'Growth',
                          color: '#8b5cf6',
                          description: 'Paid advertising, Meta ads, acquisition channels, performance marketing'
                        },
                        {
                          department: 'Brand',
                          color: '#f59e0b',
                          description: 'Public relations, brand positioning, partnerships, influencer strategy'
                        },
                        {
                          department: 'Social',
                          color: '#ec4899',
                          description: 'Social media strategy, content planning, community management'
                        }
                      ].map((dept) => (
                        <div key={dept.department} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={dept.department}
                            checked={selectedDepartments.includes(dept.department)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDepartments([...selectedDepartments, dept.department]);
                              } else {
                                setSelectedDepartments(selectedDepartments.filter(id => id !== dept.department));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: dept.color }}
                              ></div>
                              <Label htmlFor={dept.department} className="text-sm font-medium text-gray-700 cursor-pointer uppercase tracking-wide">
                                {dept.department}
                              </Label>
                            </div>
                            <p className="text-xs text-gray-500">{dept.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedDepartments.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>{selectedDepartments.length}</strong> departments selected for strategy planning
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  onClick={() => generateStrategyMutation.mutate()}
                  className="w-full text-white"
                  style={{ backgroundColor: '#004182' }}
                  disabled={!strategyBrief.trim() || selectedDepartments.length === 0 || generateStrategyMutation.isPending}
                >
                  {generateStrategyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Strategy Plans...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2" size={16} />
                      Generate Strategy Planning
                    </>
                  )}
                </Button>
              </div>

              {/* Output Section */}
              <div className="space-y-4 sm:space-y-6">
                {Object.keys(generatedStrategies).length > 0 ? (
                  Object.entries(generatedStrategies).map(([deptId, strategy]) => (
                    <Card key={deptId}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: deptId === 'Ecom' ? '#3b82f6' :
                                               deptId === 'Retention' ? '#10b981' :
                                               deptId === 'Growth' ? '#8b5cf6' :
                                               deptId === 'Brand' ? '#f59e0b' :
                                               deptId === 'Social' ? '#ec4899' : '#6b7280'
                              }}
                            ></div>
                            {deptId} Strategy
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(strategy, 'strategy')}
                            className="flex items-center space-x-1"
                          >
                            <Copy size={12} />
                            <span>Copy</span>
                          </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                            {strategy}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                      <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Planning Framework</h3>
                      <p className="text-gray-600 mb-4">
                        Upload your creative brief and select departments to generate comprehensive strategic frameworks.
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>• Paste your complete creative brief</p>
                        <p>• Select the departments that need strategy</p>
                        <p>• Get professional strategic planning documents</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
              )}

              {/* Launch Brief Generation */}
              {launchSubTab === 'launch-brief' && (
                <div className="space-y-6">
                  {/* Beta Banner */}
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">BETA</span>
                <span className="text-orange-800 text-sm font-medium">Launch Brief Generation</span>
              </div>
              <p className="text-orange-700 text-sm mt-2">
                This feature is under active development. Please test thoroughly and report any issues to the team.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Input Section */}
              <div className="space-y-4 sm:space-y-6">
                {/* Launch Brief Input */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <List className="text-jones-primary mr-2 sm:mr-3" size={18} />
                      Creative Brief Input
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Brief Source Selection */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          How would you like to add your brief?
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setBriefSource('paste')}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              briefSource === 'paste' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">Paste Text</div>
                            <div className="text-xs text-gray-500 mt-1">Type or paste</div>
                          </button>
                          <button
                            onClick={() => setBriefSource('drive')}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              briefSource === 'drive' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">Google Drive</div>
                            <div className="text-xs text-gray-500 mt-1">Share link</div>
                          </button>
                          <button
                            onClick={() => setBriefSource('upload')}
                            className={`p-3 rounded-lg border text-center transition-colors ${
                              briefSource === 'upload' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">File Upload</div>
                            <div className="text-xs text-gray-500 mt-1">.txt/.pdf</div>
                          </button>
                        </div>
                      </div>

                      {/* Paste Option */}
                      {briefSource === 'paste' && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Paste Your Launch Brief
                          </Label>
                          <textarea
                            rows={12}
                            className="w-full resize-none text-sm"
                            placeholder="Paste your complete creative brief here including product details, target audience, key messages, positioning, launch timeline, etc..."
                            value={launchBrief}
                            onChange={(e) => setLaunchBrief(e.target.value)}
                            style={{
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '12px',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>
                      )}

                      {/* Google Drive Option */}
                      {briefSource === 'drive' && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Google Drive Share Link
                          </Label>
                          <div className="flex space-x-2">
                            <input
                              type="url"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="https://docs.google.com/document/d/..."
                              value={driveLink}
                              onChange={(e) => setDriveLink(e.target.value)}
                            />
                            <Button
                              onClick={() => driveLink && fetchDriveBriefMutation.mutate(driveLink)}
                              disabled={!driveLink || fetchDriveBriefMutation.isPending}
                              className="text-white"
                              style={{ backgroundColor: '#004182' }}
                            >
                              {fetchDriveBriefMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                'Load'
                              )}
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            <p><strong>To share your Google Doc:</strong></p>
                            <p>1. Click "Share" in your Google Doc</p>
                            <p>2. Change to "Anyone with the link can view"</p>
                            <p>3. Copy and paste the share link here</p>
                            <p>4. Works with Google Docs, Slides, and Sheets</p>
                          </div>
                          
                          {launchBrief && (
                            <div className="mt-4">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Loaded Brief Preview
                              </Label>
                              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {launchBrief.substring(0, 500)}
                                  {launchBrief.length > 500 && '...'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* File Upload Option */}
                      {briefSource === 'upload' && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Upload Brief File
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept=".txt,.pdf"
                              className="hidden"
                              id="brief-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file);
                                }
                              }}
                            />
                            <label htmlFor="brief-upload" className="cursor-pointer">
                              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-sm text-gray-600">
                                Click to upload a brief file
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Supports .txt and .pdf files
                              </p>
                            </label>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Include all relevant information: product details, positioning, target audience, key messages, launch goals, timeline, budget considerations, etc.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Deliverables Selection */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                      Select Deliverables
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Deliverables organized by department */}
                      {[
                        {
                          department: 'Ecom',
                          color: 'blue',
                          deliverables: [
                            { id: 'product-descriptions', label: 'Product Descriptions', desc: 'Website and marketplace copy' },
                            { id: 'announcement-bar', label: 'Announcement Bar Copy', desc: 'Website banner and notification text' },
                            { id: 'hero-headline', label: 'Hero Module Headline', desc: 'Main homepage/product page headline' },
                            { id: 'hero-subheadline', label: 'Hero Module Subheadline', desc: 'Supporting headline for hero section' },
                            { id: 'landing-page', label: 'Landing Page Copy', desc: 'Complete page copy structure' }
                          ]
                        },
                        {
                          department: 'Retention',
                          color: 'green',
                          deliverables: [
                            { id: 'email-subject', label: 'Email Subject Lines', desc: 'Launch announcement email subjects' },
                            { id: 'email-body', label: 'Email Copy', desc: 'Full launch announcement email body' },
                            { id: 'sms-copy', label: 'SMS Campaign Copy', desc: 'Text message marketing copy' }
                          ]
                        },
                        {
                          department: 'Growth',
                          color: 'purple',
                          deliverables: [
                            { id: 'ad-headlines', label: 'Meta Ad Headlines', desc: 'Facebook/Instagram ad headlines' },
                            { id: 'ad-copy', label: 'Meta Ad Copy', desc: 'Complete Meta social ad copy' }
                          ]
                        },
                        {
                          department: 'Brand',
                          color: 'amber',
                          deliverables: [
                            { id: 'press-release', label: 'Press Release', desc: 'Media announcement copy' },
                            { id: 'influencer-talking-points', label: 'Influencer Talking Points', desc: 'Key messages for partnerships' }
                          ]
                        },
                        {
                          department: 'Social',
                          color: 'pink',
                          deliverables: [
                            { id: 'social-captions', label: 'Social Media Captions', desc: 'Instagram, Facebook, TikTok posts' }
                          ]
                        }
                      ].map((section) => (
                        <div key={section.department} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: section.color === 'blue' ? '#3b82f6' :
                                               section.color === 'green' ? '#10b981' :
                                               section.color === 'purple' ? '#8b5cf6' :
                                               section.color === 'amber' ? '#f59e0b' :
                                               section.color === 'pink' ? '#ec4899' : '#6b7280'
                              }}
                            ></div>
                            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              {section.department}
                            </h4>
                          </div>
                          <div className="pl-5 space-y-2">
                            {section.deliverables.map((deliverable) => (
                              <div key={deliverable.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  id={deliverable.id}
                                  checked={selectedDeliverables.includes(deliverable.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDeliverables([...selectedDeliverables, deliverable.id]);
                                    } else {
                                      setSelectedDeliverables(selectedDeliverables.filter(id => id !== deliverable.id));
                                    }
                                  }}
                                  className="mt-1 w-4 h-4 text-blue-600"
                                />
                                <div className="flex-1">
                                  <Label htmlFor={deliverable.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                                    {deliverable.label}
                                  </Label>
                                  <p className="text-xs text-gray-500 mt-1">{deliverable.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedDeliverables.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>{selectedDeliverables.length}</strong> deliverables selected for generation
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  onClick={() => generateLaunchCopyMutation.mutate()}
                  className="w-full text-white"
                  style={{ backgroundColor: '#004182' }}
                  disabled={!launchBrief.trim() || selectedDeliverables.length === 0 || generateLaunchCopyMutation.isPending}
                >
                  {generateLaunchCopyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Launch Copy...
                    </>
                  ) : (
                    <>
                      <List className="mr-2" size={16} />
                      Generate Launch Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Output Section */}
              <div className="space-y-4 sm:space-y-6">
                {Object.keys(generatedLaunchCopy).length > 0 ? (
                  Object.entries(generatedLaunchCopy).map(([deliverableId, content]) => (
                    <Card key={deliverableId}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                            {deliverableId.replace(/-/g, ' ')}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(content, 'launch')}
                            className="flex items-center space-x-1"
                          >
                            <Copy size={12} />
                            <span>Copy</span>
                          </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                            {content}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-4 sm:p-6 text-center">
                      <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Launch Copy Deliverables</h3>
                      <p className="text-gray-600 mb-4">
                        Upload your creative brief and select deliverables to generate comprehensive launch copy.
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>• Paste your complete creative brief</p>
                        <p>• Select the deliverables you need</p>
                        <p>• Get professional copy for your entire launch</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Static Ad Analysis Tab */}
          <TabsContent value="static-ad">
            <div className="space-y-6">
              {/* Upload Section */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Camera className="text-jones-primary mr-2 sm:mr-3" size={18} />
                    Static Ad Analysis
                  </h3>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Upload Ad Image
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="static-ad-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const base64 = e.target?.result as string;
                                setStaticAdImage(base64.split(',')[1]); // Store just the base64 data
                                setStaticAdImagePreview(base64); // Keep full URL for preview
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label htmlFor="static-ad-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm text-gray-600">
                            Click to upload an ad image (JPG, PNG)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload competitor ads, social media posts, or any static creative
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {staticAdImagePreview && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Uploaded Image Preview
                        </Label>
                        <div className="relative">
                          <img 
                            src={staticAdImagePreview} 
                            alt="Uploaded ad"
                            className="max-w-full h-auto max-h-64 rounded-lg border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStaticAdImage('');
                              setStaticAdImagePreview('');
                            }}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                        <Select value={concept} onValueChange={setConcept}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lifeJuggler">Life Juggler</SelectItem>
                            <SelectItem value="cleanBeautyEnthusiast">Clean Beauty Enthusiast</SelectItem>
                            <SelectItem value="timeConstrainedProfessional">Time-Constrained Professional</SelectItem>
                            <SelectItem value="naturalBeautySeeker">Natural Beauty Seeker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Sub-Persona</Label>
                        <Select value={subPersona} onValueChange={setSubPersona}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub-persona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newMom">New Mom</SelectItem>
                            <SelectItem value="workingMom">Working Mom</SelectItem>
                            <SelectItem value="busyProfessional">Busy Professional</SelectItem>
                            <SelectItem value="naturalBeautyLover">Natural Beauty Lover</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={() => analyzeStaticAdMutation.mutate()}
                      disabled={!staticAdImage || analyzeStaticAdMutation.isPending}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Camera size={16} />
                      <span>
                        {analyzeStaticAdMutation.isPending ? 'Analyzing...' :
                         staticAdImage ? 'Analyze Ad & Generate Variations' : 'Upload Image First'}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {staticAdAnalysis && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Target className="text-jones-primary mr-3" size={18} />
                        Ad Analysis & Jones Road Variations
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedItemForRevision({ type: 'custom' });
                            setShowRevisionPanel(true);
                          }}
                          title="Edit analysis"
                        >
                          <Target size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(staticAdAnalysis, 'static-analysis')}
                        >
                          {copiedStatic ? <Check size={16} /> : <Copy size={16} />}
                          <span className="ml-1">{copiedStatic ? 'Copied' : 'Copy'}</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {staticAdAnalysis}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Creative Brief Generation subtab */}
          <TabsContent value="creative-brief">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Input Section */}
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <FileText className="text-jones-primary mr-3" size={18} />
                      Creative Brief Generator
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Upload meeting notes or transcriptions to generate comprehensive creative briefs based on the holiday kit brief format.
                    </p>

                    {/* Meeting Notes Input */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Meeting Notes
                        </Label>
                        <Textarea
                          placeholder="Paste meeting notes, strategy session notes, or planning discussion summaries..."
                          value={meetingNotes}
                          onChange={(e) => setMeetingNotes(e.target.value)}
                          rows={8}
                          className="resize-none"
                        />
                      </div>

                      {/* Meeting Transcription Input */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Meeting Transcription (Optional)
                        </Label>
                        <Textarea
                          placeholder="Paste meeting transcription for additional context..."
                          value={meetingTranscription}
                          onChange={(e) => setMeetingTranscription(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      {/* Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                          <Select value={concept} onValueChange={setConcept}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lifeJuggler">Life Juggler</SelectItem>
                              <SelectItem value="cleanBeautyEnthusiast">Clean Beauty Enthusiast</SelectItem>
                              <SelectItem value="timeConstrainedProfessional">Time-Constrained Professional</SelectItem>
                              <SelectItem value="naturalBeautySeeker">Natural Beauty Seeker</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Sub-Persona</Label>
                          <Select value={subPersona} onValueChange={setSubPersona}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-persona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newMom">New Mom</SelectItem>
                              <SelectItem value="workingMom">Working Mom</SelectItem>
                              <SelectItem value="busyProfessional">Busy Professional</SelectItem>
                              <SelectItem value="naturalBeautyLover">Natural Beauty Lover</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Brand/DR Balance */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Brand vs Direct Response Balance: {brandDrBalance[0]}% Brand
                        </Label>
                        <Slider
                          value={brandDrBalance}
                          onValueChange={setBrandDrBalance}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>100% Direct Response</span>
                          <span>100% Brand Focused</span>
                        </div>
                      </div>

                      {/* Product Selection */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Product Focus (Optional)</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product focus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No specific product</SelectItem>
                            <SelectItem value="What The Foundation">What The Foundation</SelectItem>
                            <SelectItem value="Miracle Balm">Miracle Balm</SelectItem>
                            <SelectItem value="Mascara">Mascara</SelectItem>
                            <SelectItem value="Sunscreen">Sunscreen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Generate Button */}
                      <Button 
                        onClick={handleGenerateCreativeBrief}
                        disabled={!meetingNotes.trim() || generateCreativeBriefMutation.isPending}
                        className="w-full bg-jones-primary hover:bg-jones-primary/90"
                      >
                        {generateCreativeBriefMutation.isPending ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Generating Creative Brief...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Creative Brief
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Output Section */}
              <div className="space-y-4 sm:space-y-6">
                {generatedCreativeBrief ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FileText className="text-jones-primary mr-3" size={18} />
                          Generated Creative Brief
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedItemForRevision({ type: 'custom' });
                              setShowRevisionPanel(true);
                            }}
                            title="Edit creative brief"
                          >
                            <Target size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(generatedCreativeBrief, 'creative-brief')}
                          >
                            {copiedCreativeBrief ? <Check size={16} /> : <Copy size={16} />}
                            <span className="ml-1">{copiedCreativeBrief ? 'Copied' : 'Copy'}</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {generatedCreativeBrief}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Creative Brief Generated</h3>
                      <p className="text-gray-600">
                        Add meeting notes and click "Generate Creative Brief" to create a comprehensive campaign brief.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Custom Request Tab - moved to far right */}
          <TabsContent value="custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Section */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <Brain className="text-jones-primary mr-3" size={18} />
                  Custom Request
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Request any type of marketing copy or brief. The AI will maintain Jones Road's authentic voice while adapting to your specific format and needs.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Your Request
                    </Label>
                    <Textarea
                      placeholder="Describe what you need: social media captions, email copy, product announcements, campaign briefs, PR statements, etc."
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                      <Select value={concept} onValueChange={setConcept}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lifeJuggler">Life Juggler</SelectItem>
                          <SelectItem value="cleanBeautyEnthusiast">Clean Beauty Enthusiast</SelectItem>
                          <SelectItem value="timeConstrainedProfessional">Time-Constrained Professional</SelectItem>
                          <SelectItem value="naturalBeautySeeker">Natural Beauty Seeker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Sub-Persona</Label>
                      <Select value={subPersona} onValueChange={setSubPersona}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-persona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newMom">New Mom</SelectItem>
                          <SelectItem value="workingMom">Working Mom</SelectItem>
                          <SelectItem value="busyProfessional">Busy Professional</SelectItem>
                          <SelectItem value="naturalBeautyLover">Natural Beauty Lover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Brand/DR Balance */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Brand vs Direct Response Balance: {brandDrBalance[0]}% Brand
                    </Label>
                    <Slider
                      value={brandDrBalance}
                      onValueChange={setBrandDrBalance}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>100% Direct Response</span>
                      <span>100% Brand Focused</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={() => generateCustomCopyMutation.mutate({
                      request: customRequest
                    })}
                    disabled={!customRequest.trim() || generateCustomCopyMutation.isPending}
                    className="w-full bg-jones-primary hover:bg-jones-primary/90"
                  >
                    {generateCustomCopyMutation.isPending ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Generating Custom Copy...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Custom Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-4 sm:space-y-6">
            {generatedCustomResponse ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Brain className="text-jones-primary mr-3" size={18} />
                      Generated Custom Copy
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedItemForRevision({ type: 'custom' });
                          setShowRevisionPanel(true);
                        }}
                        title="Edit custom copy"
                      >
                        <Target size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedCustomResponse, 'custom')}
                      >
                        <Copy size={16} />
                        <span className="ml-1">Copy</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {generatedCustomResponse}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Copy Generated</h3>
                  <p className="text-gray-600">
                    Describe your request and click "Generate Custom Copy" to create tailored marketing content.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Request History */}
            {customRequestHistory.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request History</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {customRequestHistory.slice().reverse().slice(0, 3).map((item, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.response, 'custom')}
                            className="flex items-center space-x-1"
                          >
                            <Copy size={12} />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 font-medium">Request:</p>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.request}</p>
                        <p className="text-sm text-gray-700 mb-1 font-medium">Response:</p>
                        <p className="text-xs text-gray-600 line-clamp-3">{item.response}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* AI Settings Tab */}
      <TabsContent value="settings">
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
                  {loadTrainingConfigMutation.isPending && (
                    <div className="text-sm text-gray-600">Loading configuration...</div>
                  )}
                  {editingConfig && (
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

              {trainingConfig ? (
                    <Tabs defaultValue="brand-guidelines" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-2 h-auto">
                        <TabsTrigger value="brand-guidelines" className="text-xs sm:text-sm py-2 px-3">Brand Guidelines</TabsTrigger>
                        <TabsTrigger value="product-claims" className="text-xs sm:text-sm py-2 px-3">Product Claims</TabsTrigger>
                        <TabsTrigger value="personas" className="text-xs sm:text-sm py-2 px-3">Personas</TabsTrigger>
                        <TabsTrigger value="frameworks" className="text-xs sm:text-sm py-2 px-3">Copy Frameworks</TabsTrigger>
                        <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 px-3">Customer Reviews</TabsTrigger>
                        <TabsTrigger value="prompts" className="text-xs sm:text-sm py-2 px-3">System Prompts</TabsTrigger>
                        <TabsTrigger value="model" className="text-xs sm:text-sm py-2 px-3">Model Settings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="brand-guidelines" className="mt-4">
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-900 mb-3 block">Core Positioning</Label>
                            <Textarea 
                              value={editingConfig?.brandGuidelines?.corePositioning || ''}
                              onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
                                ...editingConfig,
                                brandGuidelines: {
                                  ...editingConfig.brandGuidelines,
                                  corePositioning: e.target.value
                                }
                              })}
                              className="mt-1 text-gray-900 font-medium"
                              rows={3}
                              placeholder="Your Skin But Better - natural, effortless enhancement..."
                              disabled={effectiveUser?.role !== 'admin'}
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
                                      disabled={false}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-blue-500 text-sm font-bold flex-shrink-0">•</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Rule {index + 1}</span>
                                    {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.brandVoice?.length > 3) && (
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
                                      if (effectiveUser?.role !== 'admin') return;
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
                                    className={`w-full ml-0 text-gray-900 font-medium ${editingConfig?.brandGuidelines?.enabledBrandVoice?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter brand voice rule..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              ))}
                              {effectiveUser?.role === 'admin' && (
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
                                      disabled={false}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-gray-400 text-sm font-bold flex-shrink-0">•</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Term {index + 1}</span>
                                    {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.keyTerminology?.length > 3) && (
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
                                      if (effectiveUser?.role !== 'admin') return;
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
                                    className={`w-full ml-0 text-gray-900 font-medium ${editingConfig?.brandGuidelines?.enabledKeyTerminology?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter key term or phrase..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              ))}
                              {effectiveUser?.role === 'admin' && (
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
                                      disabled={false}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Approved {index + 1}</span>
                                    {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.approvedLanguage?.length > 3) && (
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
                                      if (effectiveUser?.role !== 'admin') return;
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
                                    className={`w-full ml-0 text-gray-900 font-medium border-green-200 focus:border-green-400 ${editingConfig?.brandGuidelines?.enabledApprovedLanguage?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter approved phrase..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              ))}
                              {effectiveUser?.role === 'admin' && (
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
                                      disabled={false}
                                      className="flex-shrink-0"
                                    />
                                    <span className="text-red-500 text-sm font-bold flex-shrink-0">✗</span>
                                    <span className="text-xs text-gray-600 flex-shrink-0">Avoid {index + 1}</span>
                                    {effectiveUser?.role === 'admin' && (editingConfig?.brandGuidelines?.avoidedLanguage?.length > 3) && (
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
                                      if (effectiveUser?.role !== 'admin') return;
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
                                    className={`w-full ml-0 text-gray-900 font-medium border-red-200 focus:border-red-400 ${editingConfig?.brandGuidelines?.enabledAvoidedLanguage?.[index] === false ? 'opacity-50' : ''}`}
                                    placeholder="Enter phrase to avoid..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              ))}
                              {effectiveUser?.role === 'admin' && (
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

                      <TabsContent value="product-claims" className="mt-4">
                        <div className="space-y-6">
                          <div className="space-y-8">
                            {editingConfig?.productClaims && Object.entries(editingConfig.productClaims).map(([productName, claimsData]: [string, any]) => (
                              <div key={productName} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {productName === 'foundation' ? 'What the Foundation' : 
                                     productName === 'mascara' ? 'Like A Mother Mascara' :
                                     productName === 'sunscreen' ? 'Under Eye Rescue SPF 30' :
                                     productName === 'miracleBalm' ? 'Miracle Balm' : productName}
                                  </h4>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {claimsData.approvedClaims?.length || 0} Approved Claims
                                  </Badge>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium text-green-800 mb-3 block">✓ Approved Claims</Label>
                                  <div className="space-y-3">
                                    {claimsData.approvedClaims?.map((claim: string, index: number) => (
                                      <div key={index} className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                          <Switch 
                                            checked={claimsData.enabledApproved?.[index] !== false}
                                            onCheckedChange={(checked) => {
                                              const enabled = [...(claimsData.enabledApproved || [])];
                                              enabled[index] = checked;
                                              setEditingConfig({
                                                ...editingConfig,
                                                productClaims: {
                                                  ...editingConfig.productClaims,
                                                  [productName]: {
                                                    ...claimsData,
                                                    enabledApproved: enabled
                                                  }
                                                }
                                              });
                                            }}
                                            className="flex-shrink-0"
                                          />
                                          <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                                        </div>
                                        <Textarea
                                          value={claim}
                                          onChange={(e) => {
                                            if (effectiveUser?.role === 'admin') {
                                              const claims = [...(claimsData.approvedClaims || [])];
                                              claims[index] = e.target.value;
                                              setEditingConfig({
                                                ...editingConfig,
                                                productClaims: {
                                                  ...editingConfig.productClaims,
                                                  [productName]: {
                                                    ...claimsData,
                                                    approvedClaims: claims
                                                  }
                                                }
                                              });
                                            }
                                          }}
                                          className="mt-2 text-sm resize-none min-h-[60px] border-green-200 focus:border-green-400"
                                          disabled={effectiveUser?.role !== 'admin'}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="personas" className="mt-4">
                        <div className="space-y-6">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800 font-medium">Persona Training Data</p>
                            <p className="text-sm text-green-700 mt-1">
                              Configure the target personas and their core pillars that Claude AI uses to generate personalized copy.
                            </p>
                          </div>
                          
                          <div className="space-y-8">
                            {editingConfig?.personaPillars && Object.entries(editingConfig.personaPillars).map(([personaName, personaData]: [string, any]) => (
                              <div key={personaName} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                      {personaName.replace(/([A-Z])/g, ' $1').trim()}
                                    </h4>
                                    {personaData.description && (
                                      <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                                        {personaData.description}
                                      </p>
                                    )}
                                  </div>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0">
                                    {personaData.pillars?.length || 0} Pillars
                                  </Badge>
                                </div>
                                
                                <div className="space-y-4">
                                  {!personaData.description && effectiveUser?.role === 'admin' && (
                                    <div className="mb-4">
                                      <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                        Persona Description
                                      </Label>
                                      <Textarea
                                        value=""
                                        onChange={(e) => {
                                          setEditingConfig({
                                            ...editingConfig,
                                            personaPillars: {
                                              ...editingConfig.personaPillars,
                                              [personaName]: {
                                                ...personaData,
                                                description: e.target.value
                                              }
                                            }
                                          });
                                        }}
                                        className="text-gray-900 border-green-200 focus:border-green-400"
                                        rows={2}
                                        placeholder="Enter persona description (e.g., Busy individuals balancing work, family, and personal life...)"
                                      />
                                    </div>
                                  )}
                                  
                                  {personaData.description && effectiveUser?.role === 'admin' && (
                                    <div className="mb-4">
                                      <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                        Persona Description
                                      </Label>
                                      <Textarea
                                        value={personaData.description}
                                        onChange={(e) => {
                                          setEditingConfig({
                                            ...editingConfig,
                                            personaPillars: {
                                              ...editingConfig.personaPillars,
                                              [personaName]: {
                                                ...personaData,
                                                description: e.target.value
                                              }
                                            }
                                          });
                                        }}
                                        className="text-gray-900 border-green-200 focus:border-green-400"
                                        rows={2}
                                      />
                                    </div>
                                  )}
                                  
                                  <div>
                                    <Label className="text-sm font-medium text-gray-900 mb-3 block">
                                      <span className="inline-flex items-center">
                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                        Core Pillars - Key Pain Points & Motivations
                                      </span>
                                    </Label>
                                    <p className="text-xs text-gray-600 mb-3">
                                      These pillars define what matters most to this persona. Claude uses these to create targeted, relevant copy.
                                    </p>
                                    
                                    <div className="space-y-3">
                                      {(personaData.pillars || ['']).map((pillar: string, index: number) => (
                                        <div key={index} className="space-y-2">
                                          <div className="flex items-center space-x-3">
                                            <Switch 
                                              checked={personaData.enabledPillars?.[index] !== false}
                                              onCheckedChange={(checked) => {
                                                const enabled = [...(personaData.enabledPillars || [])];
                                                enabled[index] = checked;
                                                setEditingConfig({
                                                  ...editingConfig,
                                                  personaPillars: {
                                                    ...editingConfig.personaPillars,
                                                    [personaName]: {
                                                      ...personaData,
                                                      enabledPillars: enabled
                                                    }
                                                  }
                                                });
                                              }}
                                              className="flex-shrink-0"
                                            />
                                            <span className="text-green-500 text-sm font-bold flex-shrink-0">•</span>
                                            <span className="text-xs text-gray-600 flex-shrink-0">Pillar {index + 1}</span>
                                            {effectiveUser?.role === 'admin' && (personaData.pillars?.length > 1) && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                                onClick={() => {
                                                  const pillars = [...(personaData.pillars || [])];
                                                  const enabled = [...(personaData.enabledPillars || [])];
                                                  pillars.splice(index, 1);
                                                  enabled.splice(index, 1);
                                                  setEditingConfig({
                                                    ...editingConfig,
                                                    personaPillars: {
                                                      ...editingConfig.personaPillars,
                                                      [personaName]: {
                                                        ...personaData,
                                                        pillars,
                                                        enabledPillars: enabled
                                                      }
                                                    }
                                                  });
                                                }}
                                              >
                                                ×
                                              </Button>
                                            )}
                                          </div>
                                          <Input
                                            value={pillar}
                                            onChange={(e) => {
                                              if (effectiveUser?.role !== 'admin') return;
                                              const pillars = [...(personaData.pillars || [])];
                                              pillars[index] = e.target.value;
                                              setEditingConfig({
                                                ...editingConfig,
                                                personaPillars: {
                                                  ...editingConfig.personaPillars,
                                                  [personaName]: {
                                                    ...personaData,
                                                    pillars
                                                  }
                                                }
                                              });
                                            }}
                                            className={`w-full ml-0 text-gray-900 font-medium border-green-200 focus:border-green-400 ${personaData.enabledPillars?.[index] === false ? 'opacity-50' : ''}`}
                                            placeholder="Enter core pillar (e.g., lack of time, versatility, clean ingredients)"
                                            disabled={effectiveUser?.role !== 'admin'}
                                          />
                                        </div>
                                      ))}
                                      {effectiveUser?.role === 'admin' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const pillars = [...(personaData.pillars || [])];
                                            const enabled = [...(personaData.enabledPillars || [])];
                                            pillars.push('');
                                            enabled.push(true);
                                            setEditingConfig({
                                              ...editingConfig,
                                              personaPillars: {
                                                ...editingConfig.personaPillars,
                                                [personaName]: {
                                                  ...personaData,
                                                  pillars,
                                                  enabledPillars: enabled
                                                }
                                              }
                                            });
                                          }}
                                          className="w-full border-dashed border-green-300 text-green-600 hover:bg-green-50 mt-2"
                                        >
                                          + Add pillar for {personaName.replace(/([A-Z])/g, ' $1').trim()}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {effectiveUser?.role === 'admin' && (
                              <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
                                <h4 className="text-sm font-medium text-green-700 mb-2">Add New Persona</h4>
                                <p className="text-xs text-gray-600 mb-4">Create a new target persona with custom pillars</p>
                                <div className="flex items-center space-x-2">
                                  <Input 
                                    placeholder="Persona name (e.g., beautyEnthusiast)"
                                    className="flex-1 border-green-300"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        const personaName = (e.target as HTMLInputElement).value.trim();
                                        if (personaName && !editingConfig?.personaPillars?.[personaName]) {
                                          setEditingConfig({
                                            ...editingConfig,
                                            personaPillars: {
                                              ...editingConfig.personaPillars,
                                              [personaName]: {
                                                pillars: [''],
                                                enabledPillars: [true]
                                              }
                                            }
                                          });
                                          (e.target as HTMLInputElement).value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-green-300 text-green-600 hover:bg-green-50"
                                    onClick={(e) => {
                                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                      const personaName = input?.value.trim();
                                      if (personaName && !editingConfig?.personaPillars?.[personaName]) {
                                        setEditingConfig({
                                          ...editingConfig,
                                          personaPillars: {
                                            ...editingConfig.personaPillars,
                                            [personaName]: {
                                              pillars: [''],
                                              enabledPillars: [true]
                                            }
                                          }
                                        });
                                        input.value = '';
                                      }
                                    }}
                                  >
                                    Add Persona
                                  </Button>
                                </div>
                              </div>
                            )}
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
                                          if (effectiveUser?.role !== 'admin') return;
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
                                        placeholder="BENEFIT DRIVEN"
                                        disabled={effectiveUser?.role !== 'admin'}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600">Template Format</Label>
                                      <Input 
                                        value={framework.template}
                                        onChange={(e) => {
                                          if (effectiveUser?.role !== 'admin') return;
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
                                        placeholder="[Primary Benefit] + [Outcome]"
                                        disabled={effectiveUser?.role !== 'admin'}
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <Label className="text-xs text-gray-600">Description & How to Use</Label>
                                    <Textarea 
                                      value={framework.description}
                                      onChange={(e) => {
                                        if (effectiveUser?.role !== 'admin') return;
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
                                      disabled={effectiveUser?.role !== 'admin'}
                                    />
                                  </div>
                                  <div className="mt-2">
                                    <Label className="text-xs text-gray-600">Example Headlines (one per line)</Label>
                                    <Textarea 
                                      value={framework.examples?.join('\n') || ''}
                                      onChange={(e) => {
                                        if (effectiveUser?.role !== 'admin') return;
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
                                      disabled={effectiveUser?.role !== 'admin'}
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
                              onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
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
                              disabled={effectiveUser?.role !== 'admin'}
                            />
                          </div>

                          {/* Listicle Framework Section */}
                          <div className="border border-gray-200 rounded-lg p-6 bg-white">
                            <div className="flex items-center mb-4">
                              <span className="w-3 h-3 bg-gray-600 rounded-full mr-2"></span>
                              <Label className="text-sm font-medium text-gray-900">Listicle Framework (Based on Real Examples)</Label>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label className="text-xs font-medium text-gray-900 mb-2 block">Content Structure Sequence</Label>
                                <Textarea 
                                  value={editingConfig?.copyFrameworks?.listicleFramework?.contentSequence?.join('\n') || ''}
                                  onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      listicleFramework: {
                                        ...editingConfig.copyFrameworks?.listicleFramework,
                                        contentSequence: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                      }
                                    }
                                  })}
                                  className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
                                  rows={6}
                                  placeholder="1. IMMEDIATE PROBLEM SOLVER - addresses main pain point
2. UNIQUE ADVANTAGE - what makes this different
3. EASE OF USE - how simple/convenient it is
4. DEEPER BENEFIT - secondary value that matters
5. SOCIAL PROOF - real results from real people
6. NATURAL CONCLUSION - why this makes sense now"
                                  disabled={effectiveUser?.role !== 'admin'}
                                />
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-gray-900 mb-2 block">Each Reason Structure Format</Label>
                                <Textarea 
                                  value={editingConfig?.copyFrameworks?.listicleFramework?.reasonStructure?.join('\n') || ''}
                                  onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      listicleFramework: {
                                        ...editingConfig.copyFrameworks?.listicleFramework,
                                        reasonStructure: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                      }
                                    }
                                  })}
                                  className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
                                  rows={5}
                                  placeholder="- CLEAR BENEFIT STATEMENT (10-20 words): Direct, specific value
- BRIEF EXPLANATION (30-60 words): Why this matters, how it works
- SPECIFIC DETAILS (20-40 words): Numbers, features, proof points
- NATURAL BENEFIT BRIDGE (15-25 words): What this means practically
- OPTIONAL SOCIAL PROOF: Real customer quote if natural"
                                  disabled={effectiveUser?.role !== 'admin'}
                                />
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-gray-900 mb-2 block">Optimization Rules</Label>
                                <Textarea 
                                  value={editingConfig?.copyFrameworks?.listicleFramework?.optimizationRules?.join('\n') || ''}
                                  onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      listicleFramework: {
                                        ...editingConfig.copyFrameworks?.listicleFramework,
                                        optimizationRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                      }
                                    }
                                  })}
                                  className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
                                  rows={5}
                                  placeholder="Maximum 100 words per reason section (concise and scannable)
Lead with benefits, support with facts - not the other way around
Use specific details and numbers when possible (like '24dB reduction')
Keep language clear and direct - avoid flowery marketing speak
Each reason should stand alone and deliver immediate value"
                                  disabled={effectiveUser?.role !== 'admin'}
                                />
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-gray-900 mb-2 block">Real Example Patterns to Emulate</Label>
                                <Textarea 
                                  value={editingConfig?.copyFrameworks?.listicleFramework?.realExamples?.join('\n') || ''}
                                  onChange={(e) => effectiveUser?.role === 'admin' && setEditingConfig({
                                    ...editingConfig,
                                    copyFrameworks: {
                                      ...editingConfig.copyFrameworks,
                                      listicleFramework: {
                                        ...editingConfig.copyFrameworks?.listicleFramework,
                                        realExamples: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                      }
                                    }
                                  })}
                                  className="mt-1 text-gray-900 border-gray-300 focus:border-gray-500"
                                  rows={4}
                                  placeholder="Grüns: 'Better Poops (Seriously)' - direct, honest, conversational
Loop: 'Blocks Out The Loudest Tools - 24dB Reduction' - specific benefit + proof
Create: 'They're made with Creapure®, the highest-quality...' - quality focus
Tone: Educational but approachable, like explaining to a friend who asked"
                                  disabled={effectiveUser?.role !== 'admin'}
                                />
                              </div>
                            </div>
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
                                        if (effectiveUser?.role !== 'admin') return;
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
                                      disabled={effectiveUser?.role !== 'admin'}
                                    />
                                    {effectiveUser?.role === 'admin' && (editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst?.length > 1) && (
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
                                {effectiveUser?.role === 'admin' && (
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
                                        if (effectiveUser?.role !== 'admin') return;
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
                                      disabled={effectiveUser?.role !== 'admin'}
                                    />
                                    {effectiveUser?.role === 'admin' && (editingConfig?.copyFrameworks?.brandDrBalance?.directResponse?.length > 1) && (
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
                                {effectiveUser?.role === 'admin' && (
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

                      <TabsContent value="reviews" className="mt-4">
                        <div className="space-y-6">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800 font-medium">Customer Review Analytics & Training</p>
                            <p className="text-sm text-green-700 mt-1">
                              Comprehensive analytics dashboard for your 21,169+ authentic customer reviews from Jones Road's Junip platform.
                            </p>
                          </div>
                          
                          {/* Sub-tabs for comprehensive analytics */}
                          <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="analytics">Analytics</TabsTrigger>
                              <TabsTrigger value="reviews">Review Browser</TabsTrigger>
                              <TabsTrigger value="import">Import</TabsTrigger>
                              <TabsTrigger value="insights">Insights</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-4">
                              {!reviewStats ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg p-4">
                                      <div className="text-3xl font-bold text-[#004182]">{reviewStats.totalReviews?.toLocaleString()}</div>
                                      <div className="text-sm text-gray-600 mt-1">Total Reviews</div>
                                      <div className="text-xs text-green-600 mt-2 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        Live Data
                                      </div>
                                    </div>
                                    
                                    <div className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-lg p-4">
                                      <div className="text-3xl font-bold text-green-600">{reviewStats.avgRating}★</div>
                                      <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                                      <div className="text-xs text-gray-500 mt-2">Perfect satisfaction</div>
                                    </div>
                                    
                                    <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg p-4">
                                      <div className="text-3xl font-bold text-purple-600">{reviewStats.positivePercentage}%</div>
                                      <div className="text-sm text-gray-600 mt-1">Positive Sentiment</div>
                                      <div className="text-xs text-gray-500 mt-2">Outstanding satisfaction</div>
                                    </div>
                                    
                                    <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-lg p-4">
                                      <div className="text-3xl font-bold text-orange-600">{Object.keys(reviewStats.byProduct || {}).length}</div>
                                      <div className="text-sm text-gray-600 mt-1">Top Products</div>
                                      <div className="text-xs text-gray-500 mt-2">With review data</div>
                                    </div>
                                  </div>

                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                          <Database className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-green-800">Authentic Data Source Verified</h3>
                                          <p className="text-sm text-green-600">
                                            Reviews imported from Jones Road's official Junip customer review platform
                                          </p>
                                        </div>
                                      </div>
                                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        {reviewStats.totalReviews?.toLocaleString()} Reviews Active
                                      </Badge>
                                    </div>
                                  </div>
                                </>
                              )}
                            </TabsContent>

                            {/* Analytics Tab */}
                            <TabsContent value="analytics" className="space-y-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-medium text-blue-800 flex items-center">
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Product Review Distribution
                                </h3>
                                <p className="text-sm text-blue-600">Visual breakdown of your authentic customer reviews by product</p>
                              </div>
                              
                              {!reviewStats ? (
                                <div className="flex justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {[
                                    { product: 'What The Mascara', count: reviewStats.byProduct?.mascara || 0, color: 'bg-blue-500' },
                                    { product: 'What The Foundation', count: reviewStats.byProduct?.foundation || 0, color: 'bg-purple-500' },
                                    { product: 'What The SPF', count: reviewStats.byProduct?.sunscreen || 0, color: 'bg-yellow-500' },
                                    { product: 'Miracle Balm', count: reviewStats.byProduct?.['miracle balm'] || 0, color: 'bg-green-500' }
                                  ].map(({ product, count, color }) => {
                                    const percentage = reviewStats.totalReviews > 0 ? Math.round((count / reviewStats.totalReviews) * 100) : 0;
                                    return (
                                      <div key={product} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                            <span className="text-sm font-medium">{product}</span>
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {count.toLocaleString()} reviews ({percentage}%)
                                          </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                          <div 
                                            className={`h-3 rounded-full transition-all duration-500 ${color}`}
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </TabsContent>

                            {/* Review Browser Tab */}
                            <TabsContent value="reviews" className="space-y-4">
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 className="font-medium text-purple-800 flex items-center">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Browse Customer Reviews
                                </h3>
                                <p className="text-sm text-purple-600">Search and filter through your authentic customer feedback</p>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                  <Label htmlFor="review-search">Search Reviews</Label>
                                  <Input 
                                    id="review-search"
                                    placeholder="Search review content, customer names, or keywords..."
                                    className="mt-1"
                                  />
                                </div>
                                <div className="w-48">
                                  <Label htmlFor="product-filter">Filter by Product</Label>
                                  <Select>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="All Products" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Products</SelectItem>
                                      <SelectItem value="mascara">What The Mascara (5,659 reviews)</SelectItem>
                                      <SelectItem value="foundation">What The Foundation (5,654 reviews)</SelectItem>
                                      <SelectItem value="sunscreen">What The SPF (4,933 reviews)</SelectItem>
                                      <SelectItem value="miracle-balm">Miracle Balm (4,923 reviews)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-yellow-50 text-center">
                                <Database className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                                <p className="text-yellow-700 font-medium">Live Review Data Connected</p>
                                <p className="text-sm text-yellow-600 mt-1">
                                  Your {reviewStats?.totalReviews?.toLocaleString() || 'review'} reviews are active and ready for AI training
                                </p>
                              </div>
                            </TabsContent>

                            {/* Import Tab */}
                            <TabsContent value="import" className="space-y-4">
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h3 className="font-medium text-orange-800 flex items-center">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Import Customer Reviews
                                </h3>
                                <p className="text-sm text-orange-600">Add more reviews from any platform to enhance AI training</p>
                              </div>
                              
                              <div className="space-y-4">
                                {effectiveUser?.role === 'admin' && (
                                  <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={async () => {
                                      try {
                                        const response = await fetch('/api/junip/import-page', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' }
                                        });
                                        
                                        const result = await response.json();
                                        if (result.success) {
                                          alert(`Success! Imported ${result.imported} real customer reviews from your Junip page and analyzed them for AI training!`);
                                        } else {
                                          alert('Import failed: ' + result.message);
                                        }
                                      } catch (error) {
                                        alert('Import error: ' + (error as Error).message);
                                      }
                                    }}
                                  >
                                    Import Reviews from Junip Page
                                  </Button>
                                )}
                                
                                <div>
                                  <Label className="text-sm font-medium">Manual Review Import</Label>
                                  <Textarea 
                                    placeholder="Paste customer reviews here..."
                                    className="mt-2"
                                    rows={4}
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                                
                                {effectiveUser?.role === 'admin' && (
                                  <Button 
                                    variant="outline"
                                    className="w-full"
                                    onClick={async () => {
                                      try {
                                        const reviewText = (document.querySelector('textarea[placeholder*="reviews"]') as HTMLTextAreaElement)?.value;
                                        if (!reviewText?.trim()) {
                                          alert('Please paste some reviews in the text area above first');
                                          return;
                                        }
                                        
                                        const response = await fetch('/api/reviews/import-text', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ 
                                            content: reviewText,
                                            source: 'junip-manual'
                                          })
                                        });
                                        
                                        const result = await response.json();
                                        if (result.success) {
                                          alert(`Successfully imported ${result.imported} reviews and analyzed them for AI training!`);
                                        } else {
                                          alert('Import failed: ' + result.message);
                                        }
                                      } catch (error) {
                                        alert('Import error: ' + (error as Error).message);
                                      }
                                    }}
                                  >
                                    Import from Text Above
                                  </Button>
                                )}
                              </div>
                            </TabsContent>

                            {/* Insights Tab */}
                            <TabsContent value="insights" className="space-y-4">
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h3 className="font-medium text-indigo-800 flex items-center">
                                  <Brain className="w-4 h-4 mr-2" />
                                  AI Training Insights
                                </h3>
                                <p className="text-sm text-indigo-600">Generate insights from customer reviews to train AI on authentic language patterns</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                  <h4 className="font-medium text-green-800">Customer Language</h4>
                                  <p className="text-sm text-green-600 mt-1">Authentic phrases like "hands-down the best mascara"</p>
                                </div>
                                
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                  <h4 className="font-medium text-blue-800">Pain Points</h4>
                                  <p className="text-sm text-blue-600 mt-1">Common customer challenges addressed</p>
                                </div>
                                
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                  <h4 className="font-medium text-purple-800">Benefits</h4>
                                  <p className="text-sm text-purple-600 mt-1">Most mentioned product benefits</p>
                                </div>
                              </div>
                              
                              {effectiveUser?.role === 'admin' && (
                                <Button 
                                  variant="outline" 
                                  className="w-full" 
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/reviews/generate-insights', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' }
                                      });
                                      
                                      const result = await response.json();
                                      if (result.success) {
                                        alert('Training insights generated successfully! The AI now has updated customer language patterns.');
                                      } else {
                                        alert('Failed to generate insights: ' + result.message);
                                      }
                                    } catch (error) {
                                      alert('Error: ' + (error as Error).message);
                                    }
                                  }}
                                >
                                  Generate Training Insights
                                </Button>
                              )}
                            </TabsContent>
                          </Tabs>
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
                              onChange={(e) => setEditingConfig({
                                ...editingConfig,
                                systemPrompts: {
                                  ...editingConfig.systemPrompts,
                                  adCopyGeneration: e.target.value
                                }
                              })}
                              className="text-gray-900 font-medium border-purple-200 focus:border-purple-400"
                              rows={15}
                              placeholder="You are an expert Meta ad copywriter specializing in Jones Road Beauty..."
                              disabled={false}
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
                              onChange={(e) => setEditingConfig({
                                ...editingConfig,
                                userPromptTemplates: {
                                  ...editingConfig.userPromptTemplates,
                                  adCopy: e.target.value
                                }
                              })}
                              className="text-gray-900 font-medium border-indigo-200 focus:border-indigo-400"
                              rows={12}
                              placeholder="Generate Meta ad copy based on this content:

TRANSCRIPTION/CONTENT:
{transcription}..."
                              disabled={false}
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
                                onChange={(e) => setEditingConfig({
                                  ...editingConfig,
                                  modelParameters: {
                                    ...editingConfig.modelParameters,
                                    model: e.target.value
                                  }
                                })}
                                className="text-gray-900 font-medium border-purple-200 focus:border-purple-400"
                                placeholder="claude-sonnet-4-20250514"
                                disabled={false}
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
                                onChange={(e) => setEditingConfig({
                                  ...editingConfig,
                                  modelParameters: {
                                    ...editingConfig.modelParameters,
                                    maxTokens: parseInt(e.target.value) || 1024
                                  }
                                })}
                                className="text-gray-900 font-medium border-indigo-200 focus:border-indigo-400"
                                placeholder="1024"
                                disabled={false}
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

      {/* Revision Panel */}
      {showRevisionPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="text-jones-primary mr-3" size={20} />
                Suggest Improvements
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Describe how you'd like to improve this copy. Be specific about what needs to change.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">
                  What should be improved?
                </Label>
                <Textarea
                  value={revisionInstructions}
                  onChange={(e) => setRevisionInstructions(e.target.value)}
                  placeholder="e.g., Make it more urgent, add more social proof, use simpler language, emphasize benefits over features..."
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRevisionPanel(false);
                    setRevisionInstructions('');
                    setSelectedItemForRevision(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedItemForRevision && revisionInstructions.trim()) {
                      reviseContentMutation.mutate({
                        instructions: revisionInstructions,
                        type: selectedItemForRevision.type,
                        index: selectedItemForRevision.index,
                        field: selectedItemForRevision.field
                      });
                    }
                  }}
                  disabled={!revisionInstructions.trim() || reviseContentMutation.isPending}
                  style={{ backgroundColor: '#004182' }}
                  className="text-white hover:opacity-90"
                >
                  {reviseContentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={16} />
                      Apply Improvements
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Key Dialog */}
      <Dialog open={showAdminKeyPrompt} onOpenChange={setShowAdminKeyPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lock className="mr-2" size={18} />
              AI Settings Access
            </DialogTitle>
            <DialogDescription>
              Enter the admin key to access AI Settings and training configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin key..."
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verifyAdminKey(adminKeyInput);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdminKeyPrompt(false);
                setAdminKeyInput('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => verifyAdminKey(adminKeyInput)}
              disabled={!adminKeyInput}
              style={{ backgroundColor: '#004182' }}
            >
              Access Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </Tabs>
      </div>
    </div>
  );
}
