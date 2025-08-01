import { useState, useEffect, useMemo, useCallback } from 'react';
import { Upload, Copy, Check, Target, Sparkles, Video, FileText, Zap, ThumbsUp, ThumbsDown, Star, Globe, List, AlertCircle, Palette, Users, Settings, LogOut, User, Database, Brain, BarChart3, Camera, Lock, Mail, MessageSquare, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { ProductSelection } from "@/components/ProductSelection";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { TrainingConfig } from '@shared/training-config';
import { GenerationDetailsModal, GenerationMetadata } from '@/components/GenerationDetailsModal';
import { Header, MainTabs, PaidSocialTabs, AdCopyTab, StaticAdTab } from '@/components/meta-ad-generator';

interface SubPersona {
  label: string;
}

interface Persona {
  label: string;
  subPersonas?: Record<string, SubPersona>;
}

export default function MetaAdGenerator() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('paid-social');
  const [paidSocialSubTab, setPaidSocialSubTab] = useState('ad-copy');
  const [organicSocialType, setOrganicSocialType] = useState('captions');

  // Generation Details Modal state
  const [showGenerationDetails, setShowGenerationDetails] = useState(false);
  const [currentGenerationMetadata, setCurrentGenerationMetadata] = useState<GenerationMetadata | null>(null);

  // Helper function to check if generation buttons should be disabled
  const getGenerationDisabledState = (stationType: 'adCopy' | 'landingPage' | 'customRequest' | 'emailSmsRetention' | 'staticAd') => {
    // Debug logging
    console.log('DEBUG: Validation check for', stationType);
    console.log('DEBUG: modelSettings:', modelSettings);
    console.log('DEBUG: stationPrompts:', stationPrompts);

    // Check if model settings are configured
    const hasModelName = modelSettings?.model && modelSettings.model.trim() !== '';
    const hasMaxTokens = modelSettings?.maxTokens && modelSettings.maxTokens > 0;

    console.log('DEBUG: hasModelName:', hasModelName, 'model:', modelSettings?.model);
    console.log('DEBUG: hasMaxTokens:', hasMaxTokens, 'maxTokens:', modelSettings?.maxTokens);

    // Check if station-specific prompt exists
    let hasStationPrompt = false;
    let stationPromptReason = '';

    switch (stationType) {
      case 'adCopy':
        hasStationPrompt = stationPrompts?.adCopy?.systemPrompt && stationPrompts.adCopy.systemPrompt.trim() !== '';
        stationPromptReason = 'Ad Copy system prompt is not configured';
        console.log('DEBUG: adCopy prompt check:', hasStationPrompt, 'prompt:', stationPrompts?.adCopy?.systemPrompt?.substring(0, 50) + '...');
        break;
      case 'landingPage':
        hasStationPrompt = stationPrompts?.landingPage?.systemPrompt && stationPrompts.landingPage.systemPrompt.trim() !== '';
        stationPromptReason = 'Landing Page system prompt is not configured';
        break;
      case 'customRequest':
        hasStationPrompt = stationPrompts?.customRequest?.systemPrompt && stationPrompts.customRequest.systemPrompt.trim() !== '';
        stationPromptReason = 'Custom Request system prompt is not configured';
        break;
      case 'emailSmsRetention':
        hasStationPrompt = stationPrompts?.emailSmsRetention?.systemPrompt && stationPrompts.emailSmsRetention.systemPrompt.trim() !== '';
        stationPromptReason = 'Email/SMS Retention system prompt is not configured';
        break;
      case 'staticAd':
        hasStationPrompt = stationPrompts?.staticAd?.systemPrompt && stationPrompts.staticAd.systemPrompt.trim() !== '';
        stationPromptReason = 'Static Ad system prompt is not configured';
        break;
    }

    const reasons = [];
    if (!hasModelName) reasons.push('Model name is not set');
    if (!hasMaxTokens) reasons.push('Max tokens is not set');
    if (!hasStationPrompt) reasons.push(stationPromptReason);

    return {
      disabled: !hasModelName || !hasMaxTokens || !hasStationPrompt,
      reason: reasons.join(', ')
    };
  };

  // New product name for adding products to claims
  const [newProductName, setNewProductName] = useState('');
  
  // State for tracking expanded products in claims section
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Admin key protection for AI Settings
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // Handle AI Settings tab click
  const handleAISettingsClick = () => {
    if (hasAdminAccess) {
      setActiveTab('settings');
      if (!editingConfig) {
        loadTrainingConfigMutation.mutate();
      }
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
        // Load training configuration immediately after granting access
        loadTrainingConfigMutation.mutate();
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
  const logout = () => { };
  const isLoggingOut = false;
  const setupAdmin = () => { };
  const isSettingUpAdmin = false;
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
    type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention';
    index?: number;
    field?: string;
  } | null>(null);



  // Training Configuration States
  const [editingConfig, setEditingConfig] = useState<TrainingConfig | null>(null);

  const loadTrainingConfigMutation = useMutation({
    mutationFn: async () => apiRequest('/api/training-config'),
    onSuccess: (data) => {
      console.log('DEBUG: Training config loaded:', data);
      console.log('DEBUG: Brand guidelines:', data?.brandGuidelines);
      console.log('DEBUG: Brand voice:', data?.brandGuidelines?.brandVoice);
      console.log('DEBUG: Enabled brand voice:', data?.brandGuidelines?.enabledBrandVoice);
      setEditingConfig(data);
      toast({
        title: "Configuration Loaded",
        description: "You can now edit the AI training configuration.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Load Configuration",
        description: "Could not load the training configuration.",
        variant: "destructive",
      });
    },
  });

  const saveTrainingConfigMutation = useMutation({
    mutationFn: async (config: TrainingConfig) => {
      return await apiRequest('/api/training-config', {
        method: 'POST',
        body: config,
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "The AI training configuration has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['trainingConfig'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Save Configuration",
        description: "Could not save the training configuration.",
        variant: "destructive",
      });
    },
  });





  const [products, setProducts] = useState<Record<string, any>>({});
  const [productClaims, setProductClaims] = useState<Record<string, any>>({});
  const [personas, setPersonas] = useState<Record<string, Persona>>({});
  const [brandGuidelines, setBrandGuidelines] = useState<any>({});
  const [copyFrameworks, setCopyFrameworks] = useState<any>({});
  const [stationPrompts, setStationPrompts] = useState<any>({});
  const [modelSettings, setModelSettings] = useState<any>({});
  const [reviewStats, setReviewStats] = useState<any>(null);



  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiRequest('/api/config/products'),
  });

  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  const { data: personasData, isLoading: personasLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: () => apiRequest('/api/config/personas'),
  });

  useEffect(() => {
    if (personasData) {
      setPersonas(personasData);
      // Set default persona if none selected
      if (!concept && Object.keys(personasData).length > 0) {
        const firstPersona = Object.keys(personasData)[0];
        setConcept(firstPersona);
      }
    }
  }, [personasData, concept]);

  const { data: brandGuidelinesData, isLoading: brandGuidelinesLoading } = useQuery({
    queryKey: ['brandGuidelines'],
    queryFn: () => apiRequest('/api/config/brand-guidelines'),
  });

  useEffect(() => {
    if (brandGuidelinesData) setBrandGuidelines(brandGuidelinesData);
  }, [brandGuidelinesData]);

  const { data: copyFrameworksData, isLoading: copyFrameworksLoading } = useQuery({
    queryKey: ['copyFrameworks'],
    queryFn: () => apiRequest('/api/config/copy-frameworks'),
  });

  useEffect(() => {
    if (copyFrameworksData) setCopyFrameworks(copyFrameworksData);
  }, [copyFrameworksData]);

  const { data: stationPromptsData, isLoading: stationPromptsLoading } = useQuery({
    queryKey: ['stationPrompts'],
    queryFn: () => apiRequest('/api/config/station-prompts'),
  });

  useEffect(() => {
    if (stationPromptsData) setStationPrompts(stationPromptsData);
  }, [stationPromptsData]);

  const { data: modelSettingsData, isLoading: modelSettingsLoading } = useQuery({
    queryKey: ['modelSettings'],
    queryFn: () => apiRequest('/api/config/model-settings'),
  });

  useEffect(() => {
    if (modelSettingsData) setModelSettings(modelSettingsData);
  }, [modelSettingsData]);

  // Sync productClaims with editingConfig when loaded
  useEffect(() => {
    if (editingConfig?.productClaims) {
      setProductClaims(editingConfig.productClaims);
    }
  }, [editingConfig]);

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
  const [generatedCustomResponse, setGeneratedCustomResponse] = useState('');

  // Retention Tab States
  const [retentionKeyMessage, setRetentionKeyMessage] = useState('');
  const [retentionPlatform, setRetentionPlatform] = useState('Email');
  const [retentionEmailType, setRetentionEmailType] = useState('Product Spotlight / Hero Product');
  const [retentionSelectedProducts, setRetentionSelectedProducts] = useState<string[]>([]);
  const [retentionAudience, setRetentionAudience] = useState('General audience');
  const [retentionGoal, setRetentionGoal] = useState('Drive Sales');
  const [retentionCampaignType, setRetentionCampaignType] = useState('Product Spotlight / Hero Product');

  const [retentionContentLength, setRetentionContentLength] = useState('Short');
  const [retentionKeywordsToInclude, setRetentionKeywordsToInclude] = useState<string[]>([]);
  const [retentionWordsToAvoid, setRetentionWordsToAvoid] = useState<string[]>([]);
  const [generatedRetentionCopy, setGeneratedRetentionCopy] = useState('');
  const [retentionCopyHistory, setRetentionCopyHistory] = useState<Array<{
    keyMessage: string;
    platform: string;
    response: string;
    timestamp: Date;
  }>>([]);

  // Debug States
  const [debugInfo, setDebugInfo] = useState<{
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null>(null);
  const [influencerHandle, setInfluencerHandle] = useState('');
  const [voiceAnalysisMethod, setVoiceAnalysisMethod] = useState('combined');
  const [influencerBrandBalance, setInfluencerBrandBalance] = useState([50]);

  // Static Ad Analysis States
  const [staticAdImage, setStaticAdImage] = useState('');
  const [staticAdImagePreview, setStaticAdImagePreview] = useState('');
  const [staticAdAnalysis, setStaticAdAnalysis] = useState('');

  // Content Type States (for both paid and organic)
  const [contentType, setContentType] = useState('video'); // 'video' or 'image'
  const [organicContentType, setOrganicContentType] = useState('video'); // 'video' or 'image'
  const [organicVideoFile, setOrganicVideoFile] = useState<File | null>(null);
  const [organicVideoTranscription, setOrganicVideoTranscription] = useState('');
  const [organicImageFile, setOrganicImageFile] = useState<File | null>(null);
  const [organicImagePreview, setOrganicImagePreview] = useState('');
  const [organicPlatform, setOrganicPlatform] = useState('instagram');
  const [organicGoal, setOrganicGoal] = useState('product-education');
  const [organicTone, setOrganicTone] = useState('authentic-personal');
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [captionVariations, setCaptionVariations] = useState(3);

  // Story Sequence States
  const [storyContentType, setStoryContentType] = useState('video');
  const [storyVideoTranscription, setStoryVideoTranscription] = useState('');
  const [storyVideoFile, setStoryVideoFile] = useState<File | null>(null);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState('');
  const [storySequenceType, setStorySequenceType] = useState('product-showcase');
  const [storyLength, setStoryLength] = useState(5);
  const [storyTone, setStoryTone] = useState('authentic-personal');
  const [generatedStorySequence, setGeneratedStorySequence] = useState<Array<{
    slide: number;
    type: string;
    title: string;
    content: string;
    visualDirection: string;
  }>>([]);

  useEffect(() => {
    fetch('/api/config/copy-frameworks')
      .then(res => res.json())
      .then(data => {
        // Assuming the data is an array of frameworks, convert it to a map
        const frameworkMap = (data.landingPage || []).reduce((acc: any, framework: any) => {
          acc[framework.name] = {
            label: framework.displayName,
            description: framework.description,
            icon: Target // You might want to map icons dynamically
          };
          return acc;
        }, {});
        setLandingPageType(frameworkMap);
      })
      .catch(err => {
        console.error('Failed to load landing page types:', err);
        toast({
          title: "Failed to Load Landing Page Types",
          description: "Could not load landing page types from the database.",
          variant: "destructive",
        });
      });
  }, []);





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

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted from the database.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Product",
        description: "Could not delete the product from the database.",
        variant: "destructive",
      });
    },
  });

  // API mutations for generating copy
  const generateAdCopyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        transcription,
        customBrief,
        concept,
        subPersona,
        targetAudience: targetAudience || personas[concept]?.label || concept,
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
        description: error.message || "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Revision mutation for copy improvements
  const reviseContentMutation = useMutation({
    mutationFn: async ({ instructions, type, index, field }: {
      instructions: string;
      type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention';
      index?: number;
      field?: string;
    }) => {
      const payload = {
        originalContent: type === 'headline' ? generatedHeadlines[index || 0].copy :
          type === 'primaryText' ? generatedPrimaryText :
            type === 'landingCopy' && field ? (generatedLandingCopy as any)[field] :
              type === 'custom' ? generatedCustomResponse :
                type === 'retention' ? generatedRetentionCopy : '',
        revisionInstructions: instructions,
        contentType: type,
        context: {
          transcription,
          customBrief,
          concept,
          subPersona,
          targetAudience: targetAudience || personas[concept]?.label || concept,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          selectedProducts: retentionSelectedProducts,
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
        } else if (type === 'retention') {
          setGeneratedRetentionCopy(data.revisedContent);
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

  // Retention copy mutation
  const generateRetentionCopyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-retention-copy', {
        method: 'POST',
        body: {
          keyMessage: retentionKeyMessage,
          platform: retentionPlatform,
          emailType: retentionEmailType,
          selectedProducts: retentionSelectedProducts,
          audience: retentionAudience,
          goal: retentionGoal,
          campaignType: retentionCampaignType,

          contentLength: retentionContentLength,
          keywordsToInclude: retentionKeywordsToInclude,
          wordsToAvoid: retentionWordsToAvoid,
          concept,
          subPersona,
          brandDrBalance: brandDrBalance[0],
          selectedProduct,
          useJonesBrandGuide
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedRetentionCopy(data.response || '');

      // Store debug information for retention copy
      if (data.debugInfo) {
        setDebugInfo({
          systemPrompt: data.debugInfo.systemPrompt,
          userPrompt: data.debugInfo.userPrompt,
          requestPayload: data.debugInfo.requestPayload,
          rawResponse: data.debugInfo.rawResponse
        });
      }

      // Add to history
      setRetentionCopyHistory(prev => [{
        keyMessage: retentionKeyMessage,
        platform: retentionPlatform,
        response: data.response,
        timestamp: new Date()
      }, ...prev]);

      toast({
        title: "Retention Copy Generated Successfully",
        description: `Your ${retentionPlatform.toLowerCase()} copy has been generated.`,
      });
    },
    onError: (error) => {
      console.error('Retention generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate retention copy. Please try again.",
        variant: "destructive"
      });
    }
  });

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
        primaryText: generatedPrimaryText
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
          mainAngle
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

  // Retention chip helpers
  const addRetentionKeyword = (keyword: string, isAvoid: boolean = false) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    if (isAvoid) {
      if (!retentionWordsToAvoid.includes(trimmedKeyword)) {
        setRetentionWordsToAvoid([...retentionWordsToAvoid, trimmedKeyword]);
      }
    } else {
      if (!retentionKeywordsToInclude.includes(trimmedKeyword)) {
        setRetentionKeywordsToInclude([...retentionKeywordsToInclude, trimmedKeyword]);
      }
    }
  };

  const removeRetentionKeyword = (keyword: string, isAvoid: boolean = false) => {
    if (isAvoid) {
      setRetentionWordsToAvoid(retentionWordsToAvoid.filter(k => k !== keyword));
    } else {
      setRetentionKeywordsToInclude(retentionKeywordsToInclude.filter(k => k !== keyword));
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
    <>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Header */}
        <Header 
          effectiveUser={effectiveUser}
          logout={logout}
          isLoggingOut={isLoggingOut}
          setupAdmin={setupAdmin}
          isSettingUpAdmin={isSettingUpAdmin}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <MainTabs 
              activeTab={activeTab}
              handleAISettingsClick={handleAISettingsClick}
              hasAdminAccess={hasAdminAccess}
            />

            <TabsContent value="paid-social">
              <PaidSocialTabs 
                paidSocialSubTab={paidSocialSubTab}
                setPaidSocialSubTab={setPaidSocialSubTab}
                contentType={contentType}
                setContentType={setContentType}
                transcription={transcription}
                setTranscription={setTranscription}
                handleFileUpload={handleFileUpload}
                airLink={airLink}
                setAirLink={setAirLink}
                uploadedImage={uploadedImage}
                handleImageUpload={handleImageUpload}
                setUploadedImage={setUploadedImage}
                customBrief={customBrief}
                setCustomBrief={setCustomBrief}
                concept={concept}
                setConcept={setConcept}
                personas={personas}
                subPersona={subPersona}
                setSubPersona={setSubPersona}
                landingPageUrl={landingPageUrl}
                setLandingPageUrl={setLandingPageUrl}
                enableInfluencerMode={enableInfluencerMode}
                setEnableInfluencerMode={setEnableInfluencerMode}
                influencerHandle={influencerHandle}
                setInfluencerHandle={setInfluencerHandle}
                voiceAnalysisMethod={voiceAnalysisMethod}
                setVoiceAnalysisMethod={setVoiceAnalysisMethod}
                influencerBrandBalance={influencerBrandBalance}
                setInfluencerBrandBalance={setInfluencerBrandBalance}
                useJonesBrandGuide={useJonesBrandGuide}
                setUseJonesBrandGuide={setUseJonesBrandGuide}
                brandDrBalance={brandDrBalance}
                setBrandDrBalance={setBrandDrBalance}
                getBrandDrLabel={getBrandDrLabel}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                products={products}
                generateAdCopy={generateAdCopy}
                generateAdCopyMutation={generateAdCopyMutation}
                getGenerationDisabledState={getGenerationDisabledState}
                generatedHeadlines={generatedHeadlines}
                copyToClipboard={copyToClipboard}
                copiedHeadlines={copiedHeadlines}
                getWordCount={getWordCount}
                setSelectedItemForRevision={setSelectedItemForRevision}
                setShowRevisionPanel={setShowRevisionPanel}
                generatedPrimaryText={generatedPrimaryText}
                copiedPrimaryText={copiedPrimaryText}
                modelSettings={modelSettings}
                stationPrompts={stationPrompts}
                brandGuidelines={brandGuidelines}
                copyFrameworks={copyFrameworks}
                setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                setShowGenerationDetails={setShowGenerationDetails}
                currentCopyId={currentCopyId}
                copyRating={copyRating}
                setCopyRating={setCopyRating}
                feedbackText={feedbackText}
                setFeedbackText={setFeedbackText}
                submitFeedbackMutation={submitFeedbackMutation}
                selectedHeadlineIndex={selectedHeadlineIndex}
                setSelectedHeadlineIndex={setSelectedHeadlineIndex}
              />
            </TabsContent>

            <TabsContent value="organic-social">
              {/* Sub-tabs for different types of organic social content */}
              <Tabs value={organicSocialType} onValueChange={setOrganicSocialType} className="w-full">
                <div className="flex justify-center mb-6">
                  <TabsList className="grid grid-cols-2 w-auto">
                    <TabsTrigger value="captions" className="flex items-center space-x-2">
                      <Camera size={16} />
                      <span>Social Captions</span>
                    </TabsTrigger>
                    <TabsTrigger value="stories" className="flex items-center space-x-2">
                      <FileText size={16} />
                      <span>Story Sequences</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Social Captions Sub-Tab */}
                <TabsContent value="captions">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Input Section */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Content Type Selection */}
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Upload className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Creative Asset
                          </h3>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setOrganicContentType('video')}
                                className={`p-3 border-2 rounded-lg text-center transition-colors ${organicContentType === 'video'
                                    ? 'border-jones-primary bg-jones-light text-jones-primary'
                                    : 'border-gray-300 hover:border-jones-primary'
                                  }`}
                              >
                                <Camera size={20} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">Video/Transcription</span>
                              </button>
                              <button
                                onClick={() => setOrganicContentType('image')}
                                className={`p-3 border-2 rounded-lg text-center transition-colors ${organicContentType === 'image'
                                    ? 'border-jones-primary bg-jones-light text-jones-primary'
                                    : 'border-gray-300 hover:border-jones-primary'
                                  }`}
                              >
                                <FileText size={20} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">Image</span>
                              </button>
                            </div>

                            {organicContentType === 'video' && (
                              <div className="space-y-4">
                                <Textarea
                                  rows={6}
                                  className="w-full resize-none text-sm"
                                  placeholder="Paste your video transcription or describe the content here..."
                                  value={organicVideoTranscription}
                                  onChange={(e) => setOrganicVideoTranscription(e.target.value)}
                                />

                                <div className="text-center text-sm text-gray-500">OR</div>

                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="organic-video-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                      <Camera size={14} />
                                      <span className="hidden sm:inline">Upload Video</span>
                                      <span className="sm:hidden">Video</span>
                                    </Label>
                                    <Input
                                      id="organic-video-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="video/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setOrganicVideoFile(file);
                                        }
                                      }}
                                    />

                                    <Label htmlFor="organic-text-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                      <Upload size={14} />
                                      <span className="hidden sm:inline">Upload Text</span>
                                      <span className="sm:hidden">Text</span>
                                    </Label>
                                    <Input
                                      id="organic-text-upload"
                                      type="file"
                                      className="sr-only"
                                      accept=".txt,.doc,.docx"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            setOrganicVideoTranscription(e.target?.result as string);
                                          };
                                          reader.readAsText(file);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {organicContentType === 'image' && (
                              <div className="space-y-4">
                                <div className="text-center text-sm text-gray-500">Upload a product image to generate captions</div>

                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="organic-image-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                      <Upload size={14} />
                                      <span className="hidden sm:inline">Upload Image</span>
                                      <span className="sm:hidden">Image</span>
                                    </Label>
                                    <Input
                                      id="organic-image-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setOrganicImageFile(file);
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            setOrganicImagePreview(e.target?.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {(organicVideoFile || organicImageFile) && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                {organicVideoFile && (
                                  <div className="flex items-center text-sm text-blue-700">
                                    <span className="font-medium">Video:</span>
                                    <span className="ml-2 truncate">{organicVideoFile.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setOrganicVideoFile(null)}
                                      className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )}
                                {organicImageFile && (
                                  <div className="flex items-center text-sm text-blue-700">
                                    <span className="font-medium">Image:</span>
                                    <span className="ml-2">{organicImageFile.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setOrganicImageFile(null);
                                        setOrganicImagePreview('');
                                      }}
                                      className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {organicImagePreview && (
                              <div className="mt-4">
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Image Preview
                                </Label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                  <img
                                    src={organicImagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Platform & Strategy Settings */}
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Content Strategy
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Platform</Label>
                              <Select value={organicPlatform} onValueChange={setOrganicPlatform}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="instagram">Instagram</SelectItem>
                                  <SelectItem value="facebook">Facebook</SelectItem>
                                  <SelectItem value="tiktok">TikTok</SelectItem>
                                  <SelectItem value="multi-platform">Multi-Platform</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700">Content Goal</Label>
                              <Select value={organicGoal} onValueChange={setOrganicGoal}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="product-education">Product Education</SelectItem>
                                  <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                                  <SelectItem value="community-building">Community Building</SelectItem>
                                  <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                                  <SelectItem value="user-generated">User Generated Content</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700">Tone & Voice</Label>
                              <Select value={organicTone} onValueChange={setOrganicTone}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="authentic-personal">Authentic & Personal</SelectItem>
                                  <SelectItem value="educational-expert">Educational & Expert</SelectItem>
                                  <SelectItem value="fun-playful">Fun & Playful</SelectItem>
                                  <SelectItem value="inspirational">Inspirational</SelectItem>
                                  <SelectItem value="conversational">Conversational</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700">Number of Variations</Label>
                              <Select value={captionVariations.toString()} onValueChange={(value) => setCaptionVariations(Number(value))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 variations</SelectItem>
                                  <SelectItem value="5">5 variations</SelectItem>
                                  <SelectItem value="7">7 variations</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        className="w-full flex items-center justify-center space-x-2"
                        disabled={!organicVideoTranscription && !organicImageFile}
                        onClick={async () => {
                          if (!organicVideoTranscription && !organicImageFile) return;

                          try {
                            const response = await fetch('/api/generate-social-captions', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                contentType: organicContentType,
                                transcription: organicVideoTranscription,
                                platform: organicPlatform,
                                goal: organicGoal,
                                tone: organicTone,
                                variations: captionVariations,
                                selectedProduct: selectedProduct
                              })
                            });

                            if (!response.ok) {
                              throw new Error('Failed to generate captions');
                            }

                            const data = await response.json();
                            setGeneratedCaptions(data.captions);
                          } catch (error) {
                            console.error('Error generating captions:', error);
                          }
                        }}
                      >
                        <Sparkles size={16} />
                        <span>
                          {(!organicVideoTranscription && !organicImageFile)
                            ? 'Upload Asset or Enter Transcription'
                            : 'Generate Social Captions'}
                        </span>
                      </Button>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-4 sm:space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          {generatedCaptions.length > 0 ? (
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-4">Generated Social Captions</h3>
                              <div className="space-y-4">
                                {generatedCaptions.map((caption, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-sm font-medium text-gray-600">
                                        Caption {index + 1} ({organicPlatform})
                                      </span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(caption);
                                        }}
                                        className="text-jones-primary hover:text-jones-secondary text-sm"
                                      >
                                        <Copy size={16} />
                                      </button>
                                    </div>
                                    <div className="text-gray-900 whitespace-pre-wrap">
                                      {caption}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <Camera size={64} className="mx-auto text-gray-400 mb-4" />
                              <h3 className="text-xl font-semibold text-gray-600 mb-2">Social Caption Preview</h3>
                              <p className="text-gray-500">
                                Upload creative assets to generate platform-optimized social media captions
                              </p>
                              <div className="mt-6 text-left space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Platform-optimized copy
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Hashtag recommendations
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Engagement hooks
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Multiple variations
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Story Sequences Sub-Tab */}
                <TabsContent value="stories">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Input Section */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Content Type Selection */}
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Upload className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Creative Asset
                          </h3>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setStoryContentType('video')}
                                className={`p-3 border-2 rounded-lg text-center transition-colors ${storyContentType === 'video'
                                    ? 'border-jones-primary bg-jones-light text-jones-primary'
                                    : 'border-gray-300 hover:border-jones-primary'
                                  }`}
                              >
                                <Camera size={20} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">Video/Transcription</span>
                              </button>
                              <button
                                onClick={() => setStoryContentType('image')}
                                className={`p-3 border-2 rounded-lg text-center transition-colors ${storyContentType === 'image'
                                    ? 'border-jones-primary bg-jones-light text-jones-primary'
                                    : 'border-gray-300 hover:border-jones-primary'
                                  }`}
                              >
                                <FileText size={20} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">Image</span>
                              </button>
                            </div>

                            {storyContentType === 'video' && (
                              <div className="space-y-4">
                                <Textarea
                                  rows={6}
                                  className="w-full resize-none text-sm"
                                  placeholder="Paste your video transcription or describe the story concept here..."
                                  value={storyVideoTranscription}
                                  onChange={(e) => setStoryVideoTranscription(e.target.value)}
                                />

                                <div className="text-center text-sm text-gray-500">OR</div>

                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="story-video-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                      <Camera size={14} />
                                      <span className="hidden sm:inline">Upload Video</span>
                                      <span className="sm:hidden">Video</span>
                                    </Label>
                                    <Input
                                      id="story-video-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="video/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setStoryVideoFile(file);
                                        }
                                      }}
                                    />

                                    <Label htmlFor="story-text-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                      <Upload size={14} />
                                      <span className="hidden sm:inline">Upload Text</span>
                                      <span className="sm:hidden">Text</span>
                                    </Label>
                                    <Input
                                      id="story-text-upload"
                                      type="file"
                                      className="sr-only"
                                      accept=".txt,.doc,.docx"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            setStoryVideoTranscription(e.target?.result as string);
                                          };
                                          reader.readAsText(file);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {storyContentType === 'image' && (
                              <div className="space-y-4">
                                <div className="text-center text-sm text-gray-500">Upload a product image to generate story sequence</div>

                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor="story-image-upload" className="cursor-pointer flex items-center space-x-2 px-3 sm:px-4 py-2 bg-jones-light hover:bg-jones-secondary text-jones-primary rounded-md transition-colors text-sm">
                                      <Upload size={14} />
                                      <span className="hidden sm:inline">Upload Image</span>
                                      <span className="sm:hidden">Image</span>
                                    </Label>
                                    <Input
                                      id="story-image-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setStoryImageFile(file);
                                          const reader = new FileReader();
                                          reader.onload = (e) => {
                                            setStoryImagePreview(e.target?.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {(storyVideoFile || storyImageFile) && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                {storyVideoFile && (
                                  <div className="flex items-center text-sm text-blue-700">
                                    <span className="font-medium">Video:</span>
                                    <span className="ml-2 truncate">{storyVideoFile.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setStoryVideoFile(null)}
                                      className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )}
                                {storyImageFile && (
                                  <div className="flex items-center text-sm text-blue-700">
                                    <span className="font-medium">Image:</span>
                                    <span className="ml-2">{storyImageFile.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setStoryImageFile(null);
                                        setStoryImagePreview('');
                                      }}
                                      className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {storyImagePreview && (
                              <div className="mt-4">
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Image Preview
                                </Label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                  <img
                                    src={storyImagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Story Configuration */}
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                            Story Configuration
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Sequence Type</Label>
                              <Select value={storySequenceType} onValueChange={setStorySequenceType}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="product-showcase">Product Showcase</SelectItem>
                                  <SelectItem value="tutorial">Tutorial/How-To</SelectItem>
                                  <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                                  <SelectItem value="before-after">Before & After</SelectItem>
                                  <SelectItem value="day-in-life">Day in the Life</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700">Story Length</Label>
                              <Select value={storyLength.toString()} onValueChange={(value) => setStoryLength(Number(value))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 slides</SelectItem>
                                  <SelectItem value="5">5 slides</SelectItem>
                                  <SelectItem value="7">7 slides</SelectItem>
                                  <SelectItem value="10">10 slides</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700">Tone & Voice</Label>
                              <Select value={storyTone} onValueChange={setStoryTone}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="authentic-personal">Authentic & Personal</SelectItem>
                                  <SelectItem value="educational-expert">Educational & Expert</SelectItem>
                                  <SelectItem value="fun-playful">Fun & Playful</SelectItem>
                                  <SelectItem value="inspirational">Inspirational</SelectItem>
                                  <SelectItem value="conversational">Conversational</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        className="w-full flex items-center justify-center space-x-2"
                        disabled={!storyVideoTranscription && !storyImageFile}
                        onClick={async () => {
                          if (!storyVideoTranscription && !storyImageFile) return;

                          try {
                            const response = await fetch('/api/generate-story-sequence', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                contentType: storyContentType,
                                transcription: storyVideoTranscription,
                                sequenceType: storySequenceType,
                                length: storyLength,
                                tone: storyTone,
                                selectedProduct: selectedProduct
                              })
                            });

                            if (!response.ok) {
                              throw new Error('Failed to generate story sequence');
                            }

                            const data = await response.json();
                            setGeneratedStorySequence(data.sequence);
                          } catch (error) {
                            console.error('Error generating story sequence:', error);
                          }
                        }}
                      >
                        <Sparkles size={16} />
                        <span>
                          {(!storyVideoTranscription && !storyImageFile)
                            ? 'Upload Asset or Enter Content'
                            : 'Generate Story Sequence'}
                        </span>
                      </Button>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-4 sm:space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          {generatedStorySequence.length > 0 ? (
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-4">Generated Story Sequence</h3>
                              <div className="space-y-4">
                                {generatedStorySequence.map((slide, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="bg-jones-primary text-white text-xs px-2 py-1 rounded">
                                          Slide {slide.slide}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                          {slide.type}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const slideContent = `${slide.title}\n\n${slide.content}\n\nVisual: ${slide.visualDirection}`;
                                          navigator.clipboard.writeText(slideContent);
                                        }}
                                        className="text-jones-primary hover:text-jones-secondary text-sm"
                                      >
                                        <Copy size={16} />
                                      </button>
                                    </div>

                                    {slide.title && (
                                      <div className="mb-2">
                                        <h4 className="font-semibold text-gray-900">{slide.title}</h4>
                                      </div>
                                    )}

                                    <div className="text-gray-900 text-sm mb-3 whitespace-pre-wrap">
                                      {slide.content}
                                    </div>

                                    {slide.visualDirection && (
                                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                        <span className="text-xs font-medium text-blue-800">Visual Direction:</span>
                                        <p className="text-xs text-blue-700 mt-1">{slide.visualDirection}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                              <h3 className="text-xl font-semibold text-gray-600 mb-2">Story Sequence Preview</h3>
                              <p className="text-gray-500">
                                Upload creative assets to generate Instagram story sequences
                              </p>
                              <div className="mt-6 text-left space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Multi-slide story planning
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Visual direction guidance
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Engagement optimization
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Brand-consistent messaging
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
                        <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${landingPageType === 'listicle'
                            ? 'border-jones-primary bg-jones-light'
                            : 'border-gray-300 hover:border-jones-primary'
                          }`} onClick={() => setLandingPageType('listicle')}>
                          <div className="flex items-center justify-between mb-2">
                            <List className={landingPageType === 'listicle' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                            <div className={`w-4 h-4 border-2 rounded-full ${landingPageType === 'listicle'
                                ? 'border-jones-primary bg-jones-primary'
                                : 'border-gray-300'
                              }`}></div>
                          </div>
                          <h4 className="font-semibold text-gray-900">Listicle</h4>
                          <p className="text-xs text-gray-500 mt-1">List-based content with numbered benefits</p>
                        </div>

                        <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${landingPageType === 'trojanHorse'
                            ? 'border-jones-primary bg-jones-light'
                            : 'border-gray-300 hover:border-jones-primary'
                          }`} onClick={() => setLandingPageType('trojanHorse')}>
                          <div className="flex items-center justify-between mb-2">
                            <Target className={landingPageType === 'trojanHorse' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                            <div className={`w-4 h-4 border-2 rounded-full ${landingPageType === 'trojanHorse'
                                ? 'border-jones-primary bg-jones-primary'
                                : 'border-gray-300'
                              }`}></div>
                          </div>
                          <h4 className="font-semibold text-gray-900">Trojan Horse</h4>
                          <p className="text-xs text-gray-500 mt-1">Story-driven approach connecting to benefits</p>
                        </div>

                        <div className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${landingPageType === 'multiProduct'
                            ? 'border-jones-primary bg-jones-light'
                            : 'border-gray-300 hover:border-jones-primary'
                          }`} onClick={() => setLandingPageType('multiProduct')}>
                          <div className="flex items-center justify-between mb-2">
                            <Sparkles className={landingPageType === 'multiProduct' ? 'text-jones-primary' : 'text-gray-400'} size={24} />
                            <div className={`w-4 h-4 border-2 rounded-full ${landingPageType === 'multiProduct'
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
                                <SelectItem key={key} value={key}>{(persona as any).label || key}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {personas[concept]?.subPersonas && Object.keys(personas[concept].subPersonas!).length > 0 && (
                          <div>
                            <Label htmlFor="subPersona" className="block text-sm font-medium text-gray-700 mb-2">Sub-Persona</Label>
                            <Select value={subPersona} onValueChange={setSubPersona}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(personas[concept].subPersonas!).map(([key, s]) => (
                                  <SelectItem key={key} value={key}>{s.label}</SelectItem>
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
                            {Object.values(products).slice(0, 4).map((product: any) => (
                              <Button
                                key={product.name}
                                variant={selectedProduct === product.name ? "default" : "outline"}
                                size="sm"
                                className={`text-xs px-3 py-1 h-8 ${selectedProduct === product.name
                                    ? 'bg-[#004182] text-white border-[#004182]'
                                    : 'hover:bg-gray-50'
                                  }`}
                                onClick={() => setSelectedProduct(product.name)}
                              >
                                {product.displayName}
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
                                {Object.entries(products).map(([key, product]) => (
                                  <SelectItem key={key} value={key}>
                                    {(product as any).displayName || (product as any).name || key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedProduct && (
                            <p className="text-xs text-gray-500 mt-2">
                              AI will use customer reviews specific to {
                                products[selectedProduct]?.displayName || selectedProduct
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
                            placeholder="Describe your product, its benefits, target persona, and key selling points..."
                            value={productBrief}
                            onChange={(e) => setProductBrief(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Include product features, benefits, target persona, and unique selling points for better landing page copy
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
                                          <span className="text-xs text-gray-500">{headline.copy}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {generatedPrimaryText && (
                                <div>
                                  <Label className="text-xs font-medium text-gray-600 mb-2 block">Primary Text Preview</Label>
                                  <div className="p-3 bg-white rounded border text-sm text-gray-700">
                                    {generatedPrimaryText}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            onClick={generateAdCopy}
                            className="w-full text-white hover:opacity-90"
                            style={{ backgroundColor: '#004182' }}
                            disabled={generateLandingCopyMutation.isPending || getGenerationDisabledState('landingPage').disabled}
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
                      </TooltipTrigger>
                      {getGenerationDisabledState('landingPage').disabled && (
                        <TooltipContent>
                          <p>{getGenerationDisabledState('landingPage').reason}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
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

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!generatedLandingCopy.headline}
                          onClick={() => {
                            setCurrentGenerationMetadata({
                              stationName: 'Landing Page',
                              timestamp: new Date().toISOString(),
                              modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                              temperature: modelSettings?.temperature || 0.7,
                              maxTokens: modelSettings?.maxTokens || 2000,
                              systemPrompt: stationPrompts?.landingPage?.systemPrompt || 'Expert landing page copywriter specializing in Jones Road Beauty conversions...',
                              userPrompt: `Type: ${landingPageType}\nProduct Brief: ${productBrief}\nMain Angle: ${mainAngle}...`,
                              brandGuidelines: brandGuidelines?.guidelines || ['Educational tone', 'Make up, Simplified philosophy', 'Authentic messaging'],
                              frameworks: copyFrameworks?.landingPage?.frameworks || ['Conversion optimization', 'Social proof integration', 'Mobile-first approach'],
                              personaSettings: {
                                concept: concept,
                                subPersona: subPersona === 'none' ? undefined : subPersona
                              },
                              brandDrBalance: brandDrBalance[0],
                              selectedProduct: selectedProduct
                            });
                            setShowGenerationDetails(true);
                          }}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <Settings size={12} />
                          <span>View Details</span>
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

                          <div className="border-l-4 border-gray-300 pl-4 group">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">Introduction</h4>
                                <p className="text-gray-700">{generatedLandingCopy.introduction}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                onClick={() => {
                                  setSelectedItemForRevision({ type: 'landingCopy', field: 'introduction' });
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
                                Strategic Reasons
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
                            Be as specific as possible about format, persona, tone, and purpose
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
                                {Object.entries(personas).length > 0 ? (
                                  Object.entries(personas).map(([key, persona]: [string, any]) => (
                                    <SelectItem key={key} value={key}>
                                      {persona.label || key}
                                    </SelectItem>
                                  ))
                                ) : (
                                  // Fallback to hardcoded options if personas haven't loaded yet
                                  <>
                                    <SelectItem value="lifeJuggler">Life Juggler</SelectItem>
                                    <SelectItem value="cleanBeautyEnthusiast">Clean Beauty Enthusiast</SelectItem>
                                    <SelectItem value="timeConstrainedProfessional">Time-Constrained Professional</SelectItem>
                                    <SelectItem value="naturalBeautySeeker">Natural Beauty Seeker</SelectItem>
                                  </>
                                )}
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
                              setSelectedProducts={() => { }}
                              products={products}
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

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <Button
                                  onClick={() => generateCustomCopyMutation.mutate()}
                                  disabled={!customRequest.trim() || generateCustomCopyMutation.isPending || getGenerationDisabledState('customRequest').disabled}
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
                            </TooltipTrigger>
                            {(getGenerationDisabledState('customRequest').disabled || !customRequest.trim()) && (
                              <TooltipContent>
                                <p>
                                  {!customRequest.trim()
                                    ? 'Please enter a custom request'
                                    : getGenerationDisabledState('customRequest').reason
                                  }
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
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

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentGenerationMetadata({
                                  stationName: 'Custom Request',
                                  timestamp: new Date().toISOString(),
                                  modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                                  temperature: modelSettings?.temperature || 0.7,
                                  maxTokens: modelSettings?.maxTokens || 2000,
                                  systemPrompt: stationPrompts?.customRequest?.systemPrompt || 'Expert marketing copywriter for Jones Road Beauty...',
                                  userPrompt: `Request: ${customRequest}\nAudience: ${concept}...`,
                                  brandGuidelines: brandGuidelines?.guidelines || ['Educational tone', 'Make up, Simplified philosophy', 'Authentic messaging'],
                                  frameworks: copyFrameworks?.customRequest?.frameworks || ['Flexible copywriting', 'Brand consistency', 'Strategic messaging'],
                                  personaSettings: {
                                    concept: concept,
                                    subPersona: subPersona === 'none' ? undefined : subPersona
                                  },
                                  brandDrBalance: brandDrBalance[0],
                                  selectedProduct: selectedProduct
                                });
                                setShowGenerationDetails(true);
                              }}
                              className="flex items-center space-x-1 text-xs"
                            >
                              <Settings size={12} />
                              <span>View Details</span>
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

            {/* Retention Tab - Email & SMS Copy */}
            <TabsContent value="retention">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Input Section */}
                <div className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />
                        Email & SMS Retention Copy
                      </h3>

                      <div className="space-y-4">
                        {/* Required Fields */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Key Message / Short Description *
                          </Label>
                          <Textarea
                            placeholder="Brief description of what the copy should be about..."
                            value={retentionKeyMessage}
                            onChange={(e) => setRetentionKeyMessage(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform *
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setRetentionPlatform('Email')}
                              className={`p-3 border-2 rounded-lg text-center transition-colors ${retentionPlatform === 'Email'
                                  ? 'border-[#004182] bg-[#004182]/10 text-[#004182]'
                                  : 'border-gray-300 hover:border-[#004182]'
                                }`}
                            >
                              <Mail size={20} className="mx-auto mb-2" />
                              <span className="text-sm font-medium">Email</span>
                            </button>
                            <button
                              onClick={() => setRetentionPlatform('SMS')}
                              className={`p-3 border-2 rounded-lg text-center transition-colors ${retentionPlatform === 'SMS'
                                  ? 'border-[#004182] bg-[#004182]/10 text-[#004182]'
                                  : 'border-gray-300 hover:border-[#004182]'
                                }`}
                            >
                              <MessageSquare size={20} className="mx-auto mb-2" />
                              <span className="text-sm font-medium">SMS</span>
                            </button>
                          </div>
                        </div>

                        {retentionPlatform === 'Email' && (
                          <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Type *
                            </Label>
                            <p className="text-xs text-gray-500 mb-3">
                              Choose the specific email framework that best fits your campaign goals
                            </p>
                            <Select value={retentionEmailType} onValueChange={setRetentionEmailType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select email type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GTL (Get the Look)">GTL (Get the Look)</SelectItem>
                                <SelectItem value="Plain Text / Letter-Style Note">Plain Text / Letter-Style Note</SelectItem>
                                <SelectItem value="Product Spotlight / Hero Product">Product Spotlight / Hero Product</SelectItem>
                                <SelectItem value="Product Roundup / Theme-Based Edit">Product Roundup / Theme-Based Edit</SelectItem>
                                <SelectItem value="Back in Stock">Back in Stock</SelectItem>
                                <SelectItem value="Product Launch">Product Launch</SelectItem>
                                <SelectItem value="Teaser Email (Pre-Launch)">Teaser Email (Pre-Launch)</SelectItem>
                                <SelectItem value="Retail Event / Pop-Up / IRL Activation">Retail Event / Pop-Up / IRL Activation</SelectItem>
                                <SelectItem value="Promotional Email">Promotional Email</SelectItem>
                                <SelectItem value="Set or Kit Email">Set or Kit Email</SelectItem>
                                <SelectItem value="How-To (Problem/Solution)">How-To (Problem/Solution)</SelectItem>
                                <SelectItem value="Duos or Product Combinations">Duos or Product Combinations</SelectItem>
                                <SelectItem value="Shade Roundup">Shade Roundup</SelectItem>
                                <SelectItem value="How to Use It (Product Tutorial)">How to Use It (Product Tutorial)</SelectItem>
                                <SelectItem value="Social Proof">Social Proof</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Target Persona Section */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Persona
                          </Label>
                          <p className="text-xs text-gray-500 mb-3">
                            Choose the primary audience for this retention campaign
                          </p>
                          <Select value={concept} onValueChange={setConcept}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target persona" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(personas).map(([key, persona]) => (
                                <SelectItem key={key} value={key}>
                                  {(persona as any).label || key.replace(/([A-Z])/g, ' $1').trim()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Sub-Persona Selection */}
                          {concept && personas[concept]?.subPersonas && (
                            <div className="mt-3">
                              <Label className="block text-sm font-medium text-gray-700 mb-2">
                                Sub-Persona (Optional)
                              </Label>
                              <Select value={subPersona} onValueChange={setSubPersona}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose specific sub-persona" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None (General)</SelectItem>
                                  {personas[concept]?.subPersonas && Object.entries(personas[concept].subPersonas).map(([key, subPersona]) => (
                                    <SelectItem key={key} value={key}>
                                      {(subPersona as any).label || key.replace(/([A-Z])/g, ' $1').trim()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Product Selection for Retention */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Products to Feature (Multi-Select)
                          </Label>
                          <p className="text-xs text-gray-500 mb-3">
                            Select products to mention in your {retentionPlatform.toLowerCase()} copy. Email/SMS campaigns often feature multiple products.
                          </p>

                          {/* Quick Select Buttons */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {Object.values(products).map((product: any) => (
                              <Button
                                key={product.name}
                                variant={retentionSelectedProducts.includes(product.name) ? "default" : "outline"}
                                size="sm"
                                className={`text-xs px-2 py-2 h-auto justify-start ${retentionSelectedProducts.includes(product.name)
                                    ? 'bg-[#004182] text-white border-[#004182]'
                                    : 'hover:bg-gray-50'
                                  }`}
                                onClick={() => {
                                  if (retentionSelectedProducts.includes(product.name)) {
                                    setRetentionSelectedProducts(retentionSelectedProducts.filter(p => p !== product.name));
                                  } else {
                                    setRetentionSelectedProducts([...retentionSelectedProducts, product.name]);
                                  }
                                }}
                              >
                                {product.displayName}
                              </Button>
                            ))}
                          </div>

                          {/* Selected Products Display */}
                          {retentionSelectedProducts.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <p className="text-xs font-medium text-blue-900 mb-2">
                                Selected Products ({retentionSelectedProducts.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {retentionSelectedProducts.map((productValue) => {
                                  const productLabel = products[productValue]?.displayName || productValue;

                                  return (
                                    <Badge key={productValue} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                      {productLabel}
                                    </Badge>
                                  );
                                })}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-700 hover:text-blue-900 mt-2 h-6 p-0"
                                onClick={() => setRetentionSelectedProducts([])}
                              >
                                Clear all selections
                              </Button>
                            </div>
                          )}

                          {retentionSelectedProducts.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              No products selected - AI will generate general copy without specific product focus
                            </p>
                          )}
                        </div>



                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                              Goal
                            </Label>
                            <Select value={retentionGoal} onValueChange={setRetentionGoal}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Drive Sales">Drive Sales</SelectItem>
                                <SelectItem value="Educate">Educate</SelectItem>
                                <SelectItem value="Re-engage">Re-engage</SelectItem>
                                <SelectItem value="Promote New Arrival">Promote New Arrival</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                              Campaign Type
                            </Label>
                            <Select value={retentionCampaignType} onValueChange={setRetentionCampaignType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GTL (Get the Look)">GTL (Get the Look)</SelectItem>
                                <SelectItem value="Plain Text / Letter-Style Note">Plain Text / Letter-Style Note</SelectItem>
                                <SelectItem value="Product Spotlight / Hero Product">Product Spotlight / Hero Product</SelectItem>
                                <SelectItem value="Product Roundup / Theme-Based Edit">Product Roundup / Theme-Based Edit</SelectItem>
                                <SelectItem value="Back in Stock">Back in Stock</SelectItem>
                                <SelectItem value="Product Launch">Product Launch</SelectItem>
                                <SelectItem value="Teaser Email (Pre-Launch)">Teaser Email (Pre-Launch)</SelectItem>
                                <SelectItem value="Retail Event / Pop-Up / IRL Activation">Retail Event / Pop-Up / IRL Activation</SelectItem>
                                <SelectItem value="Promotional Email">Promotional Email</SelectItem>
                                <SelectItem value="Set or Kit Email">Set or Kit Email</SelectItem>
                                <SelectItem value="How-To (Problem/Solution)">How-To (Problem/Solution)</SelectItem>
                                <SelectItem value="Duos or Product Combinations">Duos or Product Combinations</SelectItem>
                                <SelectItem value="Shade Roundup">Shade Roundup</SelectItem>
                                <SelectItem value="How to Use It (Product Tutorial)">How to Use It (Product Tutorial)</SelectItem>
                                <SelectItem value="Social Proof">Social Proof</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>



                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Length
                          </Label>
                          <Select value={retentionContentLength} onValueChange={setRetentionContentLength}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short">Short</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Long">Long</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>





                        {/* Keywords to Include */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Keywords to Include (Optional)
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {retentionKeywordsToInclude.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {keyword}
                                <button
                                  onClick={() => removeRetentionKeyword(keyword, false)}
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Type keyword and press Enter..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addRetentionKeyword(e.currentTarget.value, false);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Examples: "clean ingredients", "limited edition", "fast shipping"
                          </p>
                        </div>

                        {/* Words to Avoid */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Words to Avoid (Optional)
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {retentionWordsToAvoid.map((word, index) => (
                              <Badge key={index} variant="destructive" className="flex items-center gap-1">
                                {word}
                                <button
                                  onClick={() => removeRetentionKeyword(word, true)}
                                  className="ml-1 text-white hover:text-gray-200"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Type word to avoid and press Enter..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addRetentionKeyword(e.currentTarget.value, true);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Examples: "cheap", "guaranteed", "free forever"
                          </p>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <Button
                                  onClick={() => generateRetentionCopyMutation.mutate()}
                                  disabled={!retentionKeyMessage.trim() || generateRetentionCopyMutation.isPending || getGenerationDisabledState('emailSmsRetention').disabled}
                                  className="w-full flex items-center justify-center space-x-2"
                                >
                                  {generateRetentionCopyMutation.isPending ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      {retentionPlatform === 'SMS' ? <MessageSquare size={16} /> : <Mail size={16} />}
                                      <span>Generate {retentionPlatform} Copy</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            {(getGenerationDisabledState('emailSmsRetention').disabled || !retentionKeyMessage.trim()) && (
                              <TooltipContent>
                                <p>
                                  {!retentionKeyMessage.trim()
                                    ? 'Please enter a key message'
                                    : getGenerationDisabledState('emailSmsRetention').reason
                                  }
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Output Section */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Generated Copy */}
                  {generatedRetentionCopy && (
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          {retentionPlatform === 'SMS' ? <MessageSquare className="text-jones-primary mr-2 sm:mr-3" size={18} /> : <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />}
                          Generated {retentionPlatform} Copy
                        </h3>

                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="whitespace-pre-wrap text-sm text-gray-800">
                              {generatedRetentionCopy}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => copyToClipboard(generatedRetentionCopy, 'retention')}
                              className="flex items-center space-x-2"
                            >
                              <Copy size={16} />
                              <span>Copy</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentGenerationMetadata({
                                  stationName: 'Email & SMS Retention',
                                  timestamp: new Date().toISOString(),
                                  modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                                  temperature: modelSettings?.temperature || 0.7,
                                  maxTokens: modelSettings?.maxTokens || 2000,
                                  systemPrompt: stationPrompts?.retention?.systemPrompt || 'Expert retention marketing copywriter for Jones Road Beauty...',
                                  userPrompt: `Platform: ${retentionPlatform}\nKey Message: ${retentionKeyMessage}\nProducts: ${retentionSelectedProducts.join(', ')}...`,
                                  brandGuidelines: brandGuidelines?.guidelines || ['Educational tone', 'Make up, Simplified philosophy', 'Authentic messaging'],
                                  frameworks: copyFrameworks?.retention?.frameworks || ['Retention marketing', 'Email optimization', 'SMS best practices'],
                                  personaSettings: {
                                    concept: concept,
                                    subPersona: subPersona
                                  },
                                  brandDrBalance: brandDrBalance[0],
                                  selectedProduct: selectedProduct
                                });
                                setShowGenerationDetails(true);
                              }}
                              className="flex items-center space-x-1 text-xs"
                            >
                              <Settings size={12} />
                              <span>View Details</span>
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedItemForRevision({
                                  type: 'retention',
                                  field: 'retention'
                                });
                                setRevisionInstructions('');
                                setShowRevisionPanel(true);
                              }}
                              className="flex items-center space-x-2"
                            >
                              <Zap size={16} />
                              <span>Edit</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Copy History */}
                  {retentionCopyHistory.length > 0 && (
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="text-jones-primary mr-2 sm:mr-3" size={18} />
                          Recent {retentionPlatform} Copy
                        </h3>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {retentionCopyHistory.slice(0, 5).map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                {item.timestamp.toLocaleString()} • {item.platform}
                              </div>
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Message: {item.keyMessage.substring(0, 100)}
                                {item.keyMessage.length > 100 && '...'}
                              </div>
                              <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                                {item.response.substring(0, 200)}
                                {item.response.length > 200 && '...'}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(item.response, 'retention')}
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

            {/* Debug Tab */}
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



                    {editingConfig ? (
                      <Tabs defaultValue="brand-guidelines" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-2 h-auto">
                          <TabsTrigger value="brand-guidelines" className="text-xs sm:text-sm py-2 px-3">Brand Guidelines</TabsTrigger>
                          <TabsTrigger value="product-claims" className="text-xs sm:text-sm py-2 px-3">Product Claims</TabsTrigger>
                          <TabsTrigger value="personas" className="text-xs sm:text-sm py-2 px-3">Personas</TabsTrigger>
                          <TabsTrigger value="frameworks" className="text-xs sm:text-sm py-2 px-3">Copy Frameworks</TabsTrigger>
                          <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 px-3">Customer Reviews</TabsTrigger>
                          <TabsTrigger value="station-prompts" className="text-xs sm:text-sm py-2 px-3">Station Prompts</TabsTrigger>
                          <TabsTrigger value="model" className="text-xs sm:text-sm py-2 px-3">Model Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="brand-guidelines" className="mt-4">
                          <div className="space-y-6">
                            <div>
                              <Label className="text-sm font-medium text-gray-900 mb-3 block">Core Positioning</Label>
                              <Textarea
                                value={editingConfig?.brandGuidelines?.corePositioning || ''}
                                onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                  ...editingConfig,
                                  brandGuidelines: {
                                    ...editingConfig?.brandGuidelines,
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
                                {(editingConfig?.brandGuidelines?.brandVoice || []).map((rule: string, index: number) => (
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
                                              ...editingConfig?.brandGuidelines,
                                              enabledBrandVoice: enabled
                                            }
                                          });
                                        }}
                                        disabled={false}
                                        className="flex-shrink-0"
                                      />
                                      <span className="text-blue-500 text-sm font-bold flex-shrink-0">•</span>
                                      <span className="text-xs text-gray-600 flex-shrink-0">Rule {index + 1}</span>
                                      {effectiveUser?.role !== 'admin' && (editingConfig?.brandGuidelines?.brandVoice?.length > 3) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                          onClick={() => {
                                            const rules = [...(editingConfig?.brandGuidelines?.brandVoice || [])];
                                            const enabled = [...(editingConfig?.brandGuidelines?.enabledBrandVoice || [])];
                                            rules.splice(index, 1);
                                            enabled.splice(index, 1);
                                            setEditingConfig({
                                              ...editingConfig,
                                              brandGuidelines: {
                                                ...editingConfig?.brandGuidelines,
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
                                        if (effectiveUser?.role === 'admin') return;
                                        const rules = [...(editingConfig?.brandGuidelines?.brandVoice || [])];
                                        rules[index] = e.target.value;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig?.brandGuidelines,
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
                                {effectiveUser?.role !== 'admin' && (
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
                                          ...editingConfig?.brandGuidelines,
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
                                {(editingConfig?.brandGuidelines?.keyTerminology || []).map((term: string, index: number) => (
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
                                              ...editingConfig?.brandGuidelines,
                                              enabledKeyTerminology: enabled
                                            }
                                          });
                                        }}
                                        disabled={false}
                                        className="flex-shrink-0"
                                      />
                                      <span className="text-gray-400 text-sm font-bold flex-shrink-0">•</span>
                                      <span className="text-xs text-gray-600 flex-shrink-0">Term {index + 1}</span>
                                      {effectiveUser?.role !== 'admin' && (editingConfig?.brandGuidelines?.keyTerminology?.length > 3) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                          onClick={() => {
                                            const terms = [...(editingConfig?.brandGuidelines?.keyTerminology || [])];
                                            const enabled = [...(editingConfig?.brandGuidelines?.enabledKeyTerminology || [])];
                                            terms.splice(index, 1);
                                            enabled.splice(index, 1);
                                            setEditingConfig({
                                              ...editingConfig,
                                              brandGuidelines: {
                                                ...editingConfig?.brandGuidelines,
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
                                        if (effectiveUser?.role === 'admin') return;
                                        const terms = [...(editingConfig?.brandGuidelines?.keyTerminology || [])];
                                        terms[index] = e.target.value;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig?.brandGuidelines,
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
                                {effectiveUser?.role !== 'admin' && (
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
                                          ...editingConfig?.brandGuidelines,
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
                                {(editingConfig?.brandGuidelines?.approvedLanguage || []).map((phrase: string, index: number) => (
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
                                              ...editingConfig?.brandGuidelines,
                                              enabledApprovedLanguage: enabled
                                            }
                                          });
                                        }}
                                        disabled={false}
                                        className="flex-shrink-0"
                                      />
                                      <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                                      <span className="text-xs text-gray-600 flex-shrink-0">Approved {index + 1}</span>
                                      {effectiveUser?.role !== 'admin' && (editingConfig?.brandGuidelines?.approvedLanguage?.length > 3) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                          onClick={() => {
                                            const phrases = [...(editingConfig?.brandGuidelines?.approvedLanguage || [])];
                                            const enabled = [...(editingConfig?.brandGuidelines?.enabledApprovedLanguage || [])];
                                            phrases.splice(index, 1);
                                            enabled.splice(index, 1);
                                            setEditingConfig({
                                              ...editingConfig,
                                              brandGuidelines: {
                                                ...editingConfig?.brandGuidelines,
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
                                        if (effectiveUser?.role === 'admin') return;
                                        const phrases = [...(editingConfig?.brandGuidelines?.approvedLanguage || [])];
                                        phrases[index] = e.target.value;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig?.brandGuidelines,
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
                                {effectiveUser?.role !== 'admin' && (
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
                                          ...editingConfig?.brandGuidelines,
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
                                {(editingConfig?.brandGuidelines?.avoidedLanguage || []).map((phrase: string, index: number) => (
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
                                              ...editingConfig?.brandGuidelines,
                                              enabledAvoidedLanguage: enabled
                                            }
                                          });
                                        }}
                                        disabled={false}
                                        className="flex-shrink-0"
                                      />
                                      <span className="text-red-500 text-sm font-bold flex-shrink-0">✗</span>
                                      <span className="text-xs text-gray-600 flex-shrink-0">Avoid {index + 1}</span>
                                      {effectiveUser?.role !== 'admin' && (editingConfig?.brandGuidelines?.avoidedLanguage?.length > 3) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                          onClick={() => {
                                            const phrases = [...(editingConfig?.brandGuidelines?.avoidedLanguage || [])];
                                            const enabled = [...(editingConfig?.brandGuidelines?.enabledAvoidedLanguage || [])];
                                            phrases.splice(index, 1);
                                            enabled.splice(index, 1);
                                            setEditingConfig({
                                              ...editingConfig,
                                              brandGuidelines: {
                                                ...editingConfig?.brandGuidelines,
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
                                        if (effectiveUser?.role === 'admin') return;
                                        const phrases = [...(editingConfig?.brandGuidelines?.avoidedLanguage || [])];
                                        phrases[index] = e.target.value;
                                        setEditingConfig({
                                          ...editingConfig,
                                          brandGuidelines: {
                                            ...editingConfig?.brandGuidelines,
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
                                {effectiveUser?.role !== 'admin' && (
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
                                          ...editingConfig?.brandGuidelines,
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
                            {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-800 font-medium">Product Claims Management</p>
                              <p className="text-sm text-green-700 mt-1">
                                Configure approved and prohibited claims for all products. AI uses these to ensure compliant copy generation.
                              </p>
                            </div> */}

                            {/* Add New Product Section */}
                            {effectiveUser?.role === 'admin' && (
                              <div className="border border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                                <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Product</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Product name (e.g., 'lip-gloss')"
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    className="text-sm"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (newProductName.trim()) {
                                        const productKey = newProductName.toLowerCase().replace(/\s+/g, '-');
                                        setEditingConfig({
                                          ...editingConfig,
                                          productClaims: {
                                            ...editingConfig.productClaims,
                                            [productKey]: {
                                              approvedClaims: [''],
                                              prohibitedClaims: [''],
                                              enabledApproved: [true],
                                              enabledProhibited: [true]
                                            }
                                          }
                                        });
                                        setNewProductName('');
                                      }
                                    }}
                                    disabled={!newProductName.trim()}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    Add Product
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* All Products List */}
                            <div className="space-y-6">
                              {/* Show all products from catalog plus existing claims */}
                              {(() => {
                                const allProductKeys = new Set([
                                  ...Object.keys(products),
                                  ...Object.keys(editingConfig?.productClaims || {})
                                ]);

                                return Array.from(allProductKeys).map((productKey: string) => {
                                  const claimsData = editingConfig?.productClaims?.[productKey] || {
                                    approvedClaims: [],
                                    prohibitedClaims: [],
                                    enabledApproved: [],
                                    enabledProhibited: []
                                  };

                                  const displayName = products[productKey]?.displayName ||
                                    productKey.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                                  const isExpanded = expandedProducts.has(productKey);
                                  
                                  const toggleExpanded = () => {
                                    const newExpanded = new Set(expandedProducts);
                                    if (isExpanded) {
                                      newExpanded.delete(productKey);
                                    } else {
                                      newExpanded.add(productKey);
                                    }
                                    setExpandedProducts(newExpanded);
                                  };

                                  return (
                                    <div key={productKey} className="border border-gray-200 rounded-lg">
                                      <div 
                                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={toggleExpanded}
                                      >
                                        <div className="flex items-center space-x-3">
                                          {isExpanded ? (
                                            <ChevronDown size={20} className="text-gray-500" />
                                          ) : (
                                            <ChevronRight size={20} className="text-gray-500" />
                                          )}
                                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                            {displayName}
                                            {effectiveUser?.role === 'admin' && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={(e) => {
                                                  e.stopPropagation(); // Prevent toggle when clicking delete
                                                  if (window.confirm(`Are you sure you want to delete the product '${displayName}'? This action cannot be undone.`)) {
                                                    const productId = products[productKey]?.id;
                                                    if (productId) {
                                                      deleteProductMutation.mutate(productId);
                                                    } else {
                                                      const updatedClaims = { ...productClaims };
                                                      delete updatedClaims[productKey];
                                                      setProductClaims(updatedClaims);
                                                    }
                                                  }
                                                }}
                                              >
                                                <span className="text-xs">Delete Product</span>
                                              </Button>
                                            )}
                                          </h4>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            {claimsData.approvedClaims?.length || 0} Approved
                                          </Badge>
                                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                                            {claimsData.prohibitedClaims?.length || 0} Prohibited
                                          </Badge>
                                        </div>
                                      </div>

                                      {isExpanded && (
                                        <div className="px-6 pb-6">
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Approved Claims */}
                                        <div>
                                          <Label className="text-sm font-medium text-green-800 mb-3 block">✓ Approved Claims</Label>
                                          <div className="space-y-3">
                                            {(claimsData.approvedClaims || ['']).map((claim: string, index: number) => (
                                              <div key={`approved-${index}`} className="space-y-2">
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
                                                          [productKey]: {
                                                            ...claimsData,
                                                            enabledApproved: enabled
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    className="flex-shrink-0"
                                                  />
                                                  <span className="text-green-500 text-sm font-bold flex-shrink-0">✓</span>
                                                  {effectiveUser?.role === 'admin' && claimsData.approvedClaims?.length > 1 && (
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                                      onClick={() => {
                                                        const claims = [...(claimsData.approvedClaims || [])];
                                                        const enabled = [...(claimsData.enabledApproved || [])];
                                                        claims.splice(index, 1);
                                                        enabled.splice(index, 1);
                                                        setEditingConfig({
                                                          ...editingConfig,
                                                          productClaims: {
                                                            ...editingConfig.productClaims,
                                                            [productKey]: {
                                                              ...claimsData,
                                                              approvedClaims: claims,
                                                              enabledApproved: enabled
                                                            }
                                                          }
                                                        });
                                                      }}
                                                    >
                                                      ×
                                                    </Button>
                                                  )}
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
                                                          [productKey]: {
                                                            ...claimsData,
                                                            approvedClaims: claims
                                                          }
                                                        }
                                                      });
                                                    }
                                                  }}
                                                  className="text-sm resize-none min-h-[60px] border-green-200 focus:border-green-400"
                                                  placeholder="Enter approved product claim..."
                                                  disabled={effectiveUser?.role !== 'admin'}
                                                />
                                              </div>
                                            ))}
                                            {effectiveUser?.role === 'admin' && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  const claims = [...(claimsData.approvedClaims || [])];
                                                  const enabled = [...(claimsData.enabledApproved || [])];
                                                  claims.push('');
                                                  enabled.push(true);
                                                  setEditingConfig({
                                                    ...editingConfig,
                                                    productClaims: {
                                                      ...editingConfig.productClaims,
                                                      [productKey]: {
                                                        ...claimsData,
                                                        approvedClaims: claims,
                                                        enabledApproved: enabled
                                                      }
                                                    }
                                                  });
                                                }}
                                                className="w-full border-dashed border-green-300 text-green-600 hover:bg-green-50"
                                              >
                                                + Add approved claim
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        {/* Prohibited Claims */}
                                        <div>
                                          <Label className="text-sm font-medium text-red-800 mb-3 block">✗ Prohibited Claims</Label>
                                          <div className="space-y-3">
                                            {(claimsData.prohibitedClaims || ['']).map((claim: string, index: number) => (
                                              <div key={`prohibited-${index}`} className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                  <Switch
                                                    checked={claimsData.enabledProhibited?.[index] !== false}
                                                    onCheckedChange={(checked) => {
                                                      const enabled = [...(claimsData.enabledProhibited || [])];
                                                      enabled[index] = checked;
                                                      setEditingConfig({
                                                        ...editingConfig,
                                                        productClaims: {
                                                          ...editingConfig.productClaims,
                                                          [productKey]: {
                                                            ...claimsData,
                                                            enabledProhibited: enabled
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    className="flex-shrink-0"
                                                  />
                                                  <span className="text-red-500 text-sm font-bold flex-shrink-0">✗</span>
                                                  {effectiveUser?.role === 'admin' && claimsData.prohibitedClaims?.length > 1 && (
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-auto"
                                                      onClick={() => {
                                                        const claims = [...(claimsData.prohibitedClaims || [])];
                                                        const enabled = [...(claimsData.enabledProhibited || [])];
                                                        claims.splice(index, 1);
                                                        enabled.splice(index, 1);
                                                        setEditingConfig({
                                                          ...editingConfig,
                                                          productClaims: {
                                                            ...editingConfig.productClaims,
                                                            [productKey]: {
                                                              ...claimsData,
                                                              prohibitedClaims: claims,
                                                              enabledProhibited: enabled
                                                            }
                                                          }
                                                        });
                                                      }}
                                                    >
                                                      ×
                                                    </Button>
                                                  )}
                                                </div>
                                                <Textarea
                                                  value={claim}
                                                  onChange={(e) => {
                                                    if (effectiveUser?.role === 'admin') {
                                                      const claims = [...(claimsData.prohibitedClaims || [])];
                                                      claims[index] = e.target.value;
                                                      setEditingConfig({
                                                        ...editingConfig,
                                                        productClaims: {
                                                          ...editingConfig.productClaims,
                                                          [productKey]: {
                                                            ...claimsData,
                                                            prohibitedClaims: claims
                                                          }
                                                        }
                                                      });
                                                    }
                                                  }}
                                                  className="text-sm resize-none min-h-[60px] border-red-200 focus:border-red-400"
                                                  placeholder="Enter prohibited product claim..."
                                                  disabled={effectiveUser?.role !== 'admin'}
                                                />
                                              </div>
                                            ))}
                                            {effectiveUser?.role === 'admin' && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  const claims = [...(claimsData.prohibitedClaims || [])];
                                                  const enabled = [...(claimsData.enabledProhibited || [])];
                                                  claims.push('');
                                                  enabled.push(true);
                                                  setEditingConfig({
                                                    ...editingConfig,
                                                    productClaims: {
                                                      ...editingConfig.productClaims,
                                                      [productKey]: {
                                                        ...claimsData,
                                                        prohibitedClaims: claims,
                                                        enabledProhibited: enabled
                                                      }
                                                    }
                                                  });
                                                }}
                                                className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50"
                                              >
                                                + Add prohibited claim
                                              </Button>
                                            )}
                                          </div>
                                          </div>
                                        </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
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
                              <div className="flex justify-between items-center mb-3">
                                <Label className="text-sm font-medium text-gray-900">Headline Frameworks</Label>
                                {effectiveUser?.role === 'admin' && (
                                  <Button
                                    onClick={() => {
                                      const newFramework = {
                                        name: '',
                                        description: '',
                                        template: '',
                                        examples: [],
                                        isEnabled: true
                                      };
                                      const updated = [...(editingConfig?.copyFrameworks?.headlineFrameworks || []), newFramework];
                                      setEditingConfig({
                                        ...editingConfig,
                                        copyFrameworks: {
                                          ...editingConfig?.copyFrameworks,
                                          headlineFrameworks: updated
                                        }
                                      });
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Add Framework
                                  </Button>
                                )}
                              </div>
                              <div className="mt-2 space-y-3">
                                {editingConfig?.copyFrameworks?.headlineFrameworks?.map((framework: any, index: number) => (
                                  <div key={index} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={framework.isEnabled !== false}
                                          onCheckedChange={(checked) => {
                                            if (effectiveUser?.role !== 'admin') return;
                                            const updated = [...editingConfig.copyFrameworks.headlineFrameworks];
                                            updated[index] = { ...updated[index], isEnabled: checked };
                                            setEditingConfig({
                                              ...editingConfig,
                                              copyFrameworks: {
                                                ...editingConfig.copyFrameworks,
                                                headlineFrameworks: updated
                                              }
                                            });
                                          }}
                                          disabled={effectiveUser?.role !== 'admin'}
                                        />
                                        <Label className="text-xs text-gray-600">
                                          {framework.isEnabled !== false ? 'Enabled' : 'Disabled'}
                                        </Label>
                                      </div>
                                      {effectiveUser?.role === 'admin' && (
                                        <Button
                                          onClick={() => {
                                            const updated = editingConfig.copyFrameworks.headlineFrameworks.filter((_, i) => i !== index);
                                            setEditingConfig({
                                              ...editingConfig,
                                              copyFrameworks: {
                                                ...editingConfig.copyFrameworks,
                                                headlineFrameworks: updated
                                              }
                                            });
                                          }}
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
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
                                        value={Array.isArray(framework.examples) ? framework.examples.join('\n') : ''}
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
                                {(!editingConfig?.copyFrameworks?.headlineFrameworks || editingConfig.copyFrameworks.headlineFrameworks.length === 0) && (
                                  <div className="text-center py-8 text-gray-500">
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">No headline frameworks configured</p>
                                    {effectiveUser?.role === 'admin' && (
                                      <p className="text-xs mt-1">Click "Add Framework" to create your first headline framework</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-900">Copy Writing Rules (one per line)</Label>
                              <Textarea
                                value={Array.isArray(editingConfig?.copyFrameworks?.primaryTextRules)
                                  ? editingConfig.copyFrameworks.primaryTextRules.join('\n')
                                  : ''}
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
                                    value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.contentSequence)
                                      ? editingConfig.copyFrameworks.listicleFramework.contentSequence.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      copyFrameworks: {
                                        ...editingConfig.copyFrameworks,
                                        listicleFramework: {
                                          ...editingConfig.copyFrameworks?.listicleFramework,
                                          contentSequence: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                                          reasonStructure: editingConfig.copyFrameworks?.listicleFramework?.reasonStructure || [],
                                          optimizationRules: editingConfig.copyFrameworks?.listicleFramework?.optimizationRules || [],
                                          realExamples: editingConfig.copyFrameworks?.listicleFramework?.realExamples || [],
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
                                    value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.reasonStructure)
                                      ? editingConfig.copyFrameworks.listicleFramework.reasonStructure.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      copyFrameworks: {
                                        ...editingConfig.copyFrameworks,
                                        listicleFramework: {
                                          ...editingConfig.copyFrameworks?.listicleFramework,
                                          reasonStructure: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                                          contentSequence: editingConfig.copyFrameworks?.listicleFramework?.contentSequence || [],
                                          optimizationRules: editingConfig.copyFrameworks?.listicleFramework?.optimizationRules || [],
                                          realExamples: editingConfig.copyFrameworks?.listicleFramework?.realExamples || [],
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
                                    value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.optimizationRules)
                                      ? editingConfig.copyFrameworks.listicleFramework.optimizationRules.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      copyFrameworks: {
                                        ...editingConfig.copyFrameworks,
                                        listicleFramework: {
                                          ...editingConfig.copyFrameworks?.listicleFramework,
                                          optimizationRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                                          contentSequence: editingConfig.copyFrameworks?.listicleFramework?.contentSequence || [],
                                          reasonStructure: editingConfig.copyFrameworks?.listicleFramework?.reasonStructure || [],
                                          realExamples: editingConfig.copyFrameworks?.listicleFramework?.realExamples || [],
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
                                    value={Array.isArray(editingConfig?.copyFrameworks?.listicleFramework?.realExamples)
                                      ? editingConfig.copyFrameworks.listicleFramework.realExamples.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      copyFrameworks: {
                                        ...editingConfig.copyFrameworks,
                                        listicleFramework: {
                                          ...editingConfig.copyFrameworks?.listicleFramework,
                                          realExamples: e.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                                          contentSequence: editingConfig.copyFrameworks?.listicleFramework?.contentSequence || [],
                                          reasonStructure: editingConfig.copyFrameworks?.listicleFramework?.reasonStructure || [],
                                          optimizationRules: editingConfig.copyFrameworks?.listicleFramework?.optimizationRules || [],
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
                                  {(editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst || []).map((guideline: string, index: number) => (
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
                                      {effectiveUser?.role !== 'admin' && (editingConfig?.copyFrameworks?.brandDrBalance?.brandFirst?.length > 1) && (
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
                                  {effectiveUser?.role !== 'admin' && (
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
                                  {(editingConfig?.copyFrameworks?.brandDrBalance?.directResponse || []).map((guideline: string, index: number) => (
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
                                      {effectiveUser?.role !== 'admin' && (editingConfig?.copyFrameworks?.brandDrBalance?.directResponse?.length > 1) && (
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
                                  {effectiveUser?.role !== 'admin' && (
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
                                    {Object.entries(products).slice(0, 4).map(([key, product], index) => {
                                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500'];
                                      const count = reviewStats.byProduct?.[key] || 0;
                                      const color = colors[index % colors.length];
                                      return { product: (product as any).displayName, count, color, key };
                                    }).map(({ product, count, color, key }) => {
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
                                        {Object.entries(products).map(([key, product]) => (
                                          <SelectItem key={key} value={key}>
                                            {(product as any).displayName} ({reviewStats?.byProduct?.[key] || 0} reviews)
                                          </SelectItem>
                                        ))}
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
                                  {effectiveUser?.role !== 'admin' && (
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

                                  {effectiveUser?.role !== 'admin' && (
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

                                {effectiveUser?.role !== 'admin' && (
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

                        <TabsContent value="station-prompts" className="mt-4">
                          <div className="space-y-8">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-800 font-medium">🎯 Station Prompts Configuration</p>
                              <p className="text-sm text-blue-700 mt-1">
                                Configure specialized AI prompts and guidelines for each content generation station.
                              </p>
                            </div>

                            {/* Ad Copy Station */}
                            <div className="border border-gray-200 rounded-lg">
                              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  🎯 Ad Copy Station
                                </h3>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">System Prompt</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.adCopy?.systemPrompt || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        adCopy: {
                                          ...editingConfig?.stationPrompts?.adCopy,
                                          systemPrompt: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="You are an expert Meta advertising copywriter specializing in short-form direct response ads..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.adCopy?.userPromptTemplate || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        adCopy: {
                                          ...editingConfig?.stationPrompts?.adCopy,
                                          userPromptTemplate: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={3}
                                    placeholder="Generate Meta advertising copy for: [PRODUCT] targeting [AUDIENCE]..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Headline Framework</Label>
                                  <Select
                                    value={editingConfig?.stationPrompts?.adCopy?.selectedHeadlineFramework || ''}
                                    onValueChange={(value) => {
                                      if (effectiveUser?.role !== 'admin') return;
                                      setEditingConfig({
                                        ...editingConfig,
                                        stationPrompts: {
                                          ...editingConfig?.stationPrompts,
                                          adCopy: {
                                            ...editingConfig?.stationPrompts?.adCopy,
                                            selectedHeadlineFramework: value
                                          }
                                        }
                                      });
                                    }}
                                    disabled={effectiveUser?.role !== 'admin'}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select headline framework from Copy Frameworks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {editingConfig?.copyFrameworks?.headlineFrameworks?.map((framework: any, index: number) => (
                                        <SelectItem key={index} value={framework.name || `framework-${index}`}>
                                          {framework.name || `Framework ${index + 1}`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Configure headline frameworks in Copy Frameworks tab above
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Copy Writing Rules</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.adCopy?.copyWritingRules)
                                      ? editingConfig.stationPrompts.adCopy.copyWritingRules.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        adCopy: {
                                          ...editingConfig?.stationPrompts?.adCopy,
                                          copyWritingRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="Headlines: Maximum 5 words, must fit in 1 line on mobile&#10;Primary text: 15-25 words optimal for Meta ads&#10;Keep sentences to 8-12 words for mobile comprehension"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-sm text-blue-800 font-medium">📋 Brand & DR Guidelines</p>
                                  <p className="text-sm text-blue-700 mt-1">
                                    Brand-First and Direct Response guidelines are configured in the Copy Frameworks tab above.
                                    The system automatically uses those settings based on your Brand/DR balance slider.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Landing Page Station */}
                            <div className="border border-gray-200 rounded-lg">
                              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  📄 Landing Page Station
                                </h3>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">System Prompt</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.landingPage?.systemPrompt || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        landingPage: {
                                          ...editingConfig?.stationPrompts?.landingPage,
                                          systemPrompt: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="You are an expert landing page copywriter specializing in conversion-optimized pages..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.landingPage?.userPromptTemplate || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        landingPage: {
                                          ...editingConfig?.stationPrompts?.landingPage,
                                          userPromptTemplate: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={3}
                                    placeholder="Create a high-converting landing page for [PRODUCT] with focus on [BENEFITS]..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Content Structure Rules</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.landingPage?.contentStructureRules)
                                      ? editingConfig.stationPrompts.landingPage.contentStructureRules.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        landingPage: {
                                          ...editingConfig?.stationPrompts?.landingPage,
                                          contentStructureRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="Hero section: Compelling headline + subheading + CTA&#10;Benefits section: 3-5 key benefits with icons&#10;Social proof: Customer testimonials and reviews"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Conversion Guidelines</Label>
                                  <div className="space-y-2">
                                    {(editingConfig?.stationPrompts?.landingPage?.conversionGuidelines || ['', '', '']).map((guideline: string, index: number) => (
                                      <div key={index} className="flex items-center space-x-3">
                                        <Switch
                                          checked={editingConfig?.stationPrompts?.landingPage?.enabledConversionGuidelines?.[index] !== false}
                                          onCheckedChange={(checked) => {
                                            if (effectiveUser?.role !== 'admin') return;
                                            const enabled = [...(editingConfig?.stationPrompts?.landingPage?.enabledConversionGuidelines || [])];
                                            enabled[index] = checked;
                                            setEditingConfig({
                                              ...editingConfig,
                                              stationPrompts: {
                                                ...editingConfig?.stationPrompts,
                                                landingPage: {
                                                  ...editingConfig?.stationPrompts?.landingPage,
                                                  enabledConversionGuidelines: enabled
                                                }
                                              }
                                            });
                                          }}
                                          disabled={effectiveUser?.role !== 'admin'}
                                        />
                                        <Input
                                          value={guideline}
                                          onChange={(e) => {
                                            if (effectiveUser?.role !== 'admin') return;
                                            const updated = [...(editingConfig?.stationPrompts?.landingPage?.conversionGuidelines || [])];
                                            updated[index] = e.target.value;
                                            setEditingConfig({
                                              ...editingConfig,
                                              stationPrompts: {
                                                ...editingConfig?.stationPrompts,
                                                landingPage: {
                                                  ...editingConfig?.stationPrompts?.landingPage,
                                                  conversionGuidelines: updated
                                                }
                                              }
                                            });
                                          }}
                                          placeholder="Use multiple CTAs throughout the page"
                                          disabled={effectiveUser?.role !== 'admin'}
                                          className="flex-1"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">CTA Guidelines</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.landingPage?.ctaGuidelines)
                                      ? editingConfig.stationPrompts.landingPage.ctaGuidelines.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        landingPage: {
                                          ...editingConfig?.stationPrompts?.landingPage,
                                          ctaGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={3}
                                    placeholder="Primary CTA: Action-oriented and benefit-focused&#10;Secondary CTA: Lower commitment alternative&#10;Button text: 2-4 words maximum"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Static Ad Station */}
                            <div className="border border-gray-200 rounded-lg">
                              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  📱 Static Ad Station
                                </h3>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">System Prompt</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.staticAd?.systemPrompt || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        staticAd: {
                                          ...editingConfig?.stationPrompts?.staticAd,
                                          systemPrompt: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="You are a static ad copywriter specializing in visual-first advertising formats..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.staticAd?.userPromptTemplate || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        staticAd: {
                                          ...editingConfig?.stationPrompts?.staticAd,
                                          userPromptTemplate: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={3}
                                    placeholder="Create static ad copy for [PLATFORM] showcasing [PRODUCT] with visual emphasis on [KEY_FEATURE]..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Image-Text Balance Rules</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.staticAd?.imageTextBalanceRules)
                                      ? editingConfig.stationPrompts.staticAd.imageTextBalanceRules.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        staticAd: {
                                          ...editingConfig?.stationPrompts?.staticAd,
                                          imageTextBalanceRules: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="Keep text minimal - let visuals tell the story&#10;Text should complement, not compete with imagery&#10;Focus on one key message per visual"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Platform-Specific Guidelines</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.staticAd?.platformGuidelines)
                                      ? editingConfig.stationPrompts.staticAd.platformGuidelines.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        staticAd: {
                                          ...editingConfig?.stationPrompts?.staticAd,
                                          platformGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="Instagram: Square format, lifestyle focused&#10;Facebook: More text-friendly, broader demographics&#10;Pinterest: Vertical format, aspirational content"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Email & SMS Retention Station */}
                            <div className="border border-gray-200 rounded-lg">
                              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  📧 Email & SMS Retention Station
                                </h3>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">System Prompt</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.emailSmsRetention?.systemPrompt || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        emailSmsRetention: {
                                          ...editingConfig?.stationPrompts?.emailSmsRetention,
                                          systemPrompt: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="You are an email and SMS marketing specialist focused on customer retention and engagement..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.emailSmsRetention?.userPromptTemplate || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        emailSmsRetention: {
                                          ...editingConfig?.stationPrompts?.emailSmsRetention,
                                          userPromptTemplate: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={3}
                                    placeholder="Create [EMAIL/SMS] retention copy for [CAMPAIGN_TYPE] targeting [AUDIENCE_SEGMENT]..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Email Design Integration</Label>
                                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <div className="text-gray-500 mb-2">📁 Upload Email Templates</div>
                                    <p className="text-sm text-gray-500">
                                      Upload designed email templates to ensure copy matches visual layout
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-3" disabled={effectiveUser?.role !== 'admin'}>
                                      Browse Files
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Subject Line Frameworks</Label>
                                  <div className="space-y-2">
                                    {(editingConfig?.stationPrompts?.emailSmsRetention?.subjectLineFrameworks || ['', '', '']).map((framework: string, index: number) => (
                                      <div key={index} className="flex items-center space-x-3">
                                        <Switch
                                          checked={editingConfig?.stationPrompts?.emailSmsRetention?.enabledSubjectLineFrameworks?.[index] !== false}
                                          onCheckedChange={(checked) => {
                                            if (effectiveUser?.role !== 'admin') return;
                                            const enabled = [...(editingConfig?.stationPrompts?.emailSmsRetention?.enabledSubjectLineFrameworks || [])];
                                            enabled[index] = checked;
                                            setEditingConfig({
                                              ...editingConfig,
                                              stationPrompts: {
                                                ...editingConfig?.stationPrompts,
                                                emailSmsRetention: {
                                                  ...editingConfig?.stationPrompts?.emailSmsRetention,
                                                  enabledSubjectLineFrameworks: enabled
                                                }
                                              }
                                            });
                                          }}
                                          disabled={effectiveUser?.role !== 'admin'}
                                        />
                                        <Input
                                          value={framework}
                                          onChange={(e) => {
                                            if (effectiveUser?.role !== 'admin') return;
                                            const updated = [...(editingConfig?.stationPrompts?.emailSmsRetention?.subjectLineFrameworks || [])];
                                            updated[index] = e.target.value;
                                            setEditingConfig({
                                              ...editingConfig,
                                              stationPrompts: {
                                                ...editingConfig?.stationPrompts,
                                                emailSmsRetention: {
                                                  ...editingConfig?.stationPrompts?.emailSmsRetention,
                                                  subjectLineFrameworks: updated
                                                }
                                              }
                                            });
                                          }}
                                          placeholder="Curiosity-driven: 'The secret to...' or 'Why [benefit]?'"
                                          disabled={effectiveUser?.role !== 'admin'}
                                          className="flex-1"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Retention Best Practices</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.emailSmsRetention?.retentionBestPractices)
                                      ? editingConfig.stationPrompts.emailSmsRetention.retentionBestPractices.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        emailSmsRetention: {
                                          ...editingConfig?.stationPrompts?.emailSmsRetention,
                                          retentionBestPractices: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="Send times: Email 10-11am EST, SMS 2-4pm EST&#10;Frequency: Email 2-3x/week max, SMS 1-2x/week max&#10;Personalization: Use first name and purchase history"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Custom Request Station */}
                            <div className="border border-gray-200 rounded-lg">
                              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  ✨ Custom Request Station
                                </h3>
                              </div>
                              <div className="p-6 space-y-6">
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">System Prompt</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.customRequest?.systemPrompt || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        customRequest: {
                                          ...editingConfig?.stationPrompts?.customRequest,
                                          systemPrompt: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="You are a versatile copywriter capable of handling any custom marketing request..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">User Prompt Template</Label>
                                  <Textarea
                                    value={editingConfig?.stationPrompts?.customRequest?.userPromptTemplate || ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        customRequest: {
                                          ...editingConfig?.stationPrompts?.customRequest,
                                          userPromptTemplate: e.target.value
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={3}
                                    placeholder="Handle this custom request: [USER_REQUEST] for [BRAND/PRODUCT] with [SPECIFIC_REQUIREMENTS]..."
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Request Type Guidelines</Label>
                                  <Textarea
                                    value={Array.isArray(editingConfig?.stationPrompts?.customRequest?.requestTypeGuidelines)
                                      ? editingConfig.stationPrompts.customRequest.requestTypeGuidelines.join('\n')
                                      : ''}
                                    onChange={(e) => effectiveUser?.role !== 'admin' && setEditingConfig({
                                      ...editingConfig,
                                      stationPrompts: {
                                        ...editingConfig?.stationPrompts,
                                        customRequest: {
                                          ...editingConfig?.stationPrompts?.customRequest,
                                          requestTypeGuidelines: e.target.value.split('\n').map(item => item.trim()).filter(Boolean)
                                        }
                                      }
                                    })}
                                    className="text-gray-900"
                                    rows={4}
                                    placeholder="Product descriptions: Focus on benefits and use cases&#10;Social media captions: Platform-appropriate length and tone&#10;Blog posts: SEO-optimized with clear structure"
                                    disabled={effectiveUser?.role !== 'admin'}
                                  />
                                </div>
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
      <Tabs>
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
                          {Object.entries(personas).map(([key, persona]) => (
                            <SelectItem key={key} value={key}>
                              {(persona as any).label || key.replace(/([A-Z])/g, ' $1').trim()}
                            </SelectItem>
                          ))}
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
                          <SelectItem value="none">None (General)</SelectItem>
                          {personas[concept]?.subPersonas && Object.entries(personas[concept].subPersonas).map(([key, subPersona]) => (
                            <SelectItem key={key} value={key}>
                              {(subPersona as any).label || key.replace(/([A-Z])/g, ' $1').trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            onClick={() => analyzeStaticAdMutation.mutate()}
                            disabled={!staticAdImage || analyzeStaticAdMutation.isPending || getGenerationDisabledState('staticAd').disabled}
                            className="w-full flex items-center justify-center space-x-2"
                          >
                            <Camera size={16} />
                            <span>
                              {analyzeStaticAdMutation.isPending ? 'Analyzing...' :
                                staticAdImage ? 'Analyze Ad & Generate Variations' : 'Upload Image First'}
                            </span>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {(getGenerationDisabledState('staticAd').disabled || !staticAdImage) && (
                        <TooltipContent>
                          <p>
                            {!staticAdImage
                              ? 'Please upload an image first'
                              : getGenerationDisabledState('staticAd').reason
                            }
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
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


      </Tabs>
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

      {/* Generation Details Modal */}
      <GenerationDetailsModal
        isOpen={showGenerationDetails}
        onClose={() => setShowGenerationDetails(false)}
        metadata={currentGenerationMetadata}
        onEditSettings={() => {
          if (hasAdminAccess) {
            setActiveTab('settings');
          } else {
            toast({
              title: "Access Required",
              description: "Admin access required to edit AI Settings",
              variant: "destructive"
            });
          }
        }}
        userRole={effectiveUser?.role}
      />
    </>
  );
}

