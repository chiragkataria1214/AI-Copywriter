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
import { Header, MainTabs, PaidSocialTabs, ProductLaunchTabs, AdCopyTab, StaticAdTab, OrganicSocialTab, LandingPageTab, CustomCopyTab, RetentionTab, AISettingsComponent } from '@/components/meta-ad-generator';

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
  const [productLaunchSubTab, setProductLaunchSubTab] = useState('brief-creation');
  const [organicSocialType, setOrganicSocialType] = useState('captions');

  // Generation Details Modal state
  const [showGenerationDetails, setShowGenerationDetails] = useState(false);
  const [currentGenerationMetadata, setCurrentGenerationMetadata] = useState<GenerationMetadata | null>(null);

  // Helper function to check if generation buttons should be disabled
  const getGenerationDisabledState = (stationType: 'adCopy' | 'landingPage' | 'customRequest' | 'emailSmsRetention' | 'staticAd') => {
    // Debug logging
    // console.log('DEBUG: Validation check for', stationType);
    // console.log('DEBUG: modelSettings:', modelSettings);
    // console.log('DEBUG: stationPrompts:', stationPrompts);

    // Check if model settings are configured
    const hasModelName = modelSettings?.model && modelSettings.model.trim() !== '';
    const hasMaxTokens = modelSettings?.maxTokens && modelSettings.maxTokens > 0;

    // console.log('DEBUG: hasModelName:', hasModelName, 'model:', modelSettings?.model);
    // console.log('DEBUG: hasMaxTokens:', hasMaxTokens, 'maxTokens:', modelSettings?.maxTokens);

    // Check if station-specific prompt exists
    let hasStationPrompt = false;
    let stationPromptReason = '';

    switch (stationType) {
      case 'adCopy':
        hasStationPrompt = stationPrompts?.adCopy?.systemPrompt && stationPrompts.adCopy.systemPrompt.trim() !== '';
        stationPromptReason = 'Ad Copy system prompt is not configured';
        // console.log('DEBUG: adCopy prompt check:', hasStationPrompt, 'prompt:', stationPrompts?.adCopy?.systemPrompt?.substring(0, 50) + '...');
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

  // AUTHENTICATION - Use proper auth hook
  const { user: currentUser, logout, isLoggingOut, setupAdmin, isSettingUpAdmin } = useAuth();
  
  const effectiveUser = currentUser ? {
    username: (currentUser as any).username,
    role: (currentUser as any).role,
    isAdmin: (currentUser as any).role === 'admin'
  } : null;
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
      // console.log('DEBUG: Training config loaded:', data);
      // console.log('DEBUG: Brand guidelines:', data?.brandGuidelines);
      // console.log('DEBUG: Brand voice:', data?.brandGuidelines?.brandVoice);
      // console.log('DEBUG: Enabled brand voice:', data?.brandGuidelines?.enabledBrandVoice);
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

  // Retention Tab States (moved before mutations to fix hoisting)
  const [retentionKeyMessage, setRetentionKeyMessage] = useState('');
  const [retentionPlatform, setRetentionPlatform] = useState('Email');
  const [retentionEmailType, setRetentionEmailType] = useState('Product Spotlight / Hero Product');
  const [retentionSelectedProducts, setRetentionSelectedProducts] = useState<string[]>([]);
  const [retentionAudience, setRetentionAudience] = useState('General audience');
  const [retentionGoal, setRetentionGoal] = useState('Drive Sales');
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
        // Store the framework data separately, don't overwrite landingPageType
        const frameworkMap = (data.landingPage || []).reduce((acc: any, framework: any) => {
          acc[framework.name] = {
            label: framework.displayName,
            description: framework.description,
            icon: Target // You might want to map icons dynamically
          };
          return acc;
        }, {});
        // Note: landingPageType should remain a string ('listicle', 'trojanHorse', 'multiProduct')
        // The frameworkMap data can be used elsewhere if needed for dynamic framework loading
        console.log('Loaded landing page frameworks:', frameworkMap);
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
          campaignType: retentionEmailType,

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

      const requestBody = {
        landingPageType,
        productBrief,
        concept,
        subPersona,
        useAdsContent: useAdsForLanding,
        adsContent: chosenAdsContent,
        brandDrBalance: brandDrBalance[0],
        selectedProduct: landingPageType === 'multiProduct' ? selectedProducts.join(',') : selectedProduct,
        mainAngle
      };

      console.log('Landing page copy request body:', requestBody);

      const response = await apiRequest('/api/generate-landing-copy', {
        method: 'POST',
        body: requestBody
      });

      console.log('Landing page copy API response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Landing page copy response received:', data);
      console.log('Landing page copy data:', data.landingCopy);
      console.log('Landing page analysis:', data.analysis);
      
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
      console.error('Landing page copy generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      toast({
        title: "Generation Failed",
        description: "Failed to generate landing page copy. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateAdCopy = () => {
    if (activeTab === 'paid-social') {
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
                staticAdImage={staticAdImage}
                setStaticAdImage={setStaticAdImage}
                staticAdImagePreview={staticAdImagePreview}
                setStaticAdImagePreview={setStaticAdImagePreview}
                staticAdAnalysis={staticAdAnalysis}
                setStaticAdAnalysis={setStaticAdAnalysis}
                analyzeStaticAdMutation={analyzeStaticAdMutation}
              />
            </TabsContent>

            <TabsContent value="organic-social">
              <OrganicSocialTab
                organicSocialType={organicSocialType}
                setOrganicSocialType={setOrganicSocialType}
                organicContentType={organicContentType}
                setOrganicContentType={setOrganicContentType}
                organicVideoFile={organicVideoFile}
                setOrganicVideoFile={setOrganicVideoFile}
                organicVideoTranscription={organicVideoTranscription}
                setOrganicVideoTranscription={setOrganicVideoTranscription}
                organicImageFile={organicImageFile}
                setOrganicImageFile={setOrganicImageFile}
                organicImagePreview={organicImagePreview}
                setOrganicImagePreview={setOrganicImagePreview}
                organicPlatform={organicPlatform}
                setOrganicPlatform={setOrganicPlatform}
                organicGoal={organicGoal}
                setOrganicGoal={setOrganicGoal}
                organicTone={organicTone}
                setOrganicTone={setOrganicTone}
                generatedCaptions={generatedCaptions}
                setGeneratedCaptions={setGeneratedCaptions}
                captionVariations={captionVariations}
                setCaptionVariations={setCaptionVariations}
                storyContentType={storyContentType}
                setStoryContentType={setStoryContentType}
                storyVideoTranscription={storyVideoTranscription}
                setStoryVideoTranscription={setStoryVideoTranscription}
                storyVideoFile={storyVideoFile}
                setStoryVideoFile={setStoryVideoFile}
                storyImageFile={storyImageFile}
                setStoryImageFile={setStoryImageFile}
                storyImagePreview={storyImagePreview}
                setStoryImagePreview={setStoryImagePreview}
                storySequenceType={storySequenceType}
                setStorySequenceType={setStorySequenceType}
                storyLength={storyLength}
                setStoryLength={setStoryLength}
                storyTone={storyTone}
                setStoryTone={setStoryTone}
                generatedStorySequence={generatedStorySequence}
                setGeneratedStorySequence={setGeneratedStorySequence}
                selectedProduct={selectedProduct}
                setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                setShowGenerationDetails={setShowGenerationDetails}
                modelSettings={modelSettings}
                stationPrompts={stationPrompts}
                brandGuidelines={brandGuidelines}
                copyFrameworks={copyFrameworks}
              />
            </TabsContent>

            <TabsContent value="landing">
              <LandingPageTab
                landingPageType={landingPageType}
                setLandingPageType={setLandingPageType}
                useAdsForLanding={useAdsForLanding}
                setUseAdsForLanding={setUseAdsForLanding}
                productBrief={productBrief}
                setProductBrief={setProductBrief}
                mainAngle={mainAngle}
                setMainAngle={setMainAngle}
                generatedLandingCopy={generatedLandingCopy}
                setGeneratedLandingCopy={setGeneratedLandingCopy}
                landingPageAnalysis={landingPageAnalysis}
                copiedLandingCopy={copiedLandingCopy}
                concept={concept}
                setConcept={setConcept}
                subPersona={subPersona}
                setSubPersona={setSubPersona}
                personas={personas}
                useJonesBrandGuide={useJonesBrandGuide}
                setUseJonesBrandGuide={setUseJonesBrandGuide}
                brandDrBalance={brandDrBalance}
                setBrandDrBalance={setBrandDrBalance}
                getBrandDrLabel={getBrandDrLabel}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                products={products}
                generatedHeadlines={generatedHeadlines}
                generatedPrimaryText={generatedPrimaryText}
                selectedHeadlineIndex={selectedHeadlineIndex}
                setSelectedHeadlineIndex={setSelectedHeadlineIndex}
                generateAdCopy={generateAdCopy}
                generateLandingCopyMutation={generateLandingCopyMutation}
                getGenerationDisabledState={getGenerationDisabledState}
                copyToClipboard={copyToClipboard}
                setSelectedItemForRevision={setSelectedItemForRevision}
                setShowRevisionPanel={setShowRevisionPanel}
                setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                setShowGenerationDetails={setShowGenerationDetails}
                modelSettings={modelSettings}
                stationPrompts={stationPrompts}
                brandGuidelines={brandGuidelines}
                copyFrameworks={copyFrameworks}
              />
            </TabsContent>
            <TabsContent value="custom">
              <CustomCopyTab
                customRequest={customRequest}
                setCustomRequest={setCustomRequest}
                generatedCustomResponse={generatedCustomResponse}
                customRequestHistory={customRequestHistory}
                concept={concept}
                setConcept={setConcept}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                brandDrBalance={brandDrBalance}
                setBrandDrBalance={setBrandDrBalance}
                subPersona={subPersona}
                personas={personas}
                products={Object.values(products)}
                generateCustomCopyMutation={generateCustomCopyMutation}
                getGenerationDisabledState={getGenerationDisabledState}
                copyToClipboard={copyToClipboard}
                setSelectedItemForRevision={setSelectedItemForRevision}
                setShowRevisionPanel={setShowRevisionPanel}
                setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                setShowGenerationDetails={setShowGenerationDetails}
                modelSettings={modelSettings}
                stationPrompts={stationPrompts}
                brandGuidelines={brandGuidelines}
                copyFrameworks={copyFrameworks}
              />
            </TabsContent>

            {/* Retention Tab - Email & SMS Copy */}
            <TabsContent value="retention">
              <RetentionTab
                retentionKeyMessage={retentionKeyMessage}
                setRetentionKeyMessage={setRetentionKeyMessage}
                retentionPlatform={retentionPlatform}
                setRetentionPlatform={setRetentionPlatform}
                retentionEmailType={retentionEmailType}
                setRetentionEmailType={setRetentionEmailType}
                retentionSelectedProducts={retentionSelectedProducts}
                setRetentionSelectedProducts={setRetentionSelectedProducts}
                retentionAudience={retentionAudience}
                setRetentionAudience={setRetentionAudience}
                retentionGoal={retentionGoal}
                setRetentionGoal={setRetentionGoal}
                retentionKeywordsToInclude={retentionKeywordsToInclude}
                retentionWordsToAvoid={retentionWordsToAvoid}
                generatedRetentionCopy={generatedRetentionCopy}
                retentionCopyHistory={retentionCopyHistory}
                concept={concept}
                setConcept={setConcept}
                subPersona={subPersona}
                setSubPersona={setSubPersona}
                brandDrBalance={brandDrBalance}
                setBrandDrBalance={setBrandDrBalance}
                selectedProduct={selectedProduct}
                personas={personas}
                products={products}
                addRetentionKeyword={addRetentionKeyword}
                removeRetentionKeyword={removeRetentionKeyword}
                getBrandDrLabel={getBrandDrLabel}
                getGenerationDisabledState={getGenerationDisabledState}
                copyToClipboard={copyToClipboard}
                generateRetentionCopyMutation={generateRetentionCopyMutation}
                setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                setShowGenerationDetails={setShowGenerationDetails}
                setSelectedItemForRevision={setSelectedItemForRevision}
                setRevisionInstructions={setRevisionInstructions}
                setShowRevisionPanel={setShowRevisionPanel}
                modelSettings={modelSettings}
                stationPrompts={stationPrompts}
                brandGuidelines={brandGuidelines}
                copyFrameworks={copyFrameworks}
              />
            </TabsContent>

            <TabsContent value="product-launch">
              <ProductLaunchTabs 
                productLaunchSubTab={productLaunchSubTab}
                setProductLaunchSubTab={setProductLaunchSubTab}
                personas={personas}
                products={products}
                modelSettings={modelSettings}
                stationPrompts={stationPrompts}
                brandGuidelines={brandGuidelines}
                copyFrameworks={copyFrameworks}
              />
            </TabsContent>

            {/* Debug Tab */}
            <TabsContent value="settings">
              <AISettingsComponent
                editingConfig={editingConfig}
                setEditingConfig={setEditingConfig}
                loadTrainingConfigMutation={loadTrainingConfigMutation}
                saveTrainingConfigMutation={saveTrainingConfigMutation}
                effectiveUser={effectiveUser}
                newProductName={newProductName}
                setNewProductName={setNewProductName}
                expandedProducts={expandedProducts}
                setExpandedProducts={setExpandedProducts}
                products={products}
                productClaims={productClaims}
                setProductClaims={setProductClaims}
                deleteProductMutation={deleteProductMutation}
                reviewStats={reviewStats}
                debugInfo={debugInfo}
                copyToClipboard={copyToClipboard}
              />
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

