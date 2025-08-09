import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/useToast';
import { TrainingConfig } from '@shared/training-config';
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_PERSONA_KEY, DEFAULT_USE_JONES_BRAND_GUIDE } from '@shared/constants';

interface Persona {
  label: string;
}

export interface GenerationMetadata {
  stationName: string;
  timestamp: string;
  modelUsed: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
  brandGuidelines: string[];
  frameworks: string[];
  personaSettings: {
    persona: string;
  };
  brandDrBalance: number;
  selectedProduct: string;
}

export const useMetaAdGenerator = () => {
  const queryClient = useQueryClient();
  
  // Main navigation state
  const [activeTab, setActiveTab] = useState('paid-social');
  const [paidSocialSubTab, setPaidSocialSubTab] = useState('ad-copy');
  const [organicSocialType, setOrganicSocialType] = useState('captions');
  
  // Generation Details Modal state
  const [showGenerationDetails, setShowGenerationDetails] = useState(false);
  const [currentGenerationMetadata, setCurrentGenerationMetadata] = useState<GenerationMetadata | null>(null);
  
  // Admin access state
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showAdminKeyPrompt, setShowAdminKeyPrompt] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  
  // Content input states
  const [transcription, setTranscription] = useState('');
  const [airLink, setAirLink] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [customBrief, setCustomBrief] = useState('');
  
  // Persona and targeting states
  const [persona, setPersona] = useState(DEFAULT_PERSONA_KEY);
  const [targetAudience, setTargetAudience] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Brand settings
  const [useJonesBrandGuide, setUseJonesBrandGuide] = useState(DEFAULT_USE_JONES_BRAND_GUIDE);
  const [brandDrBalance, setBrandDrBalance] = useState([DEFAULT_BRAND_DR_BALANCE]);
  
  // Influencer mode states
  const [enableInfluencerMode, setEnableInfluencerMode] = useState(false);
  const [influencerHandle, setInfluencerHandle] = useState('');
  const [voiceAnalysisMethod, setVoiceAnalysisMethod] = useState('combined');
  const [influencerBrandBalance, setInfluencerBrandBalance] = useState([DEFAULT_BRAND_DR_BALANCE]);
  
  // Content type states
  const [contentType, setContentType] = useState('video');
  
  // Custom Request States
  const [customRequest, setCustomRequest] = useState('');
  const [customRequestHistory, setCustomRequestHistory] = useState<Array<{
    request: string;
    response: string;
    timestamp: Date;
  }>>([]);
  const [generatedCustomResponse, setGeneratedCustomResponse] = useState('');
  
  // Configuration data states
  const [products, setProducts] = useState<Record<string, any>>({});
  const [productClaims, setProductClaims] = useState<Record<string, any>>({});
  const [personas, setPersonas] = useState<Record<string, Persona>>({});
  const [brandGuidelines, setBrandGuidelines] = useState<any>({});
  const [copyFrameworks, setCopyFrameworks] = useState<any>({});
  const [stationPrompts, setStationPrompts] = useState<any>({});
  const [modelSettings, setModelSettings] = useState<any>({});
  
  // Training Configuration States
  const [editingConfig, setEditingConfig] = useState<TrainingConfig | null>(null);
  const [newProductName, setNewProductName] = useState('');
  
  // Data fetching queries
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiRequest('/api/config/products'),
  });

  const { data: personasData, isLoading: personasLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: () => apiRequest('/api/config/personas'),
  });

  const { data: brandGuidelinesData, isLoading: brandGuidelinesLoading } = useQuery({
    queryKey: ['brandGuidelines'],
    queryFn: () => apiRequest('/api/config/brand-guidelines'),
  });

  const { data: copyFrameworksData, isLoading: copyFrameworksLoading } = useQuery({
    queryKey: ['copyFrameworks'],
    queryFn: () => apiRequest('/api/config/copy-frameworks'),
  });

  const { data: stationPromptsData, isLoading: stationPromptsLoading } = useQuery({
    queryKey: ['stationPrompts'],
    queryFn: () => apiRequest('/api/config/station-prompts'),
  });

  const { data: modelSettingsData, isLoading: modelSettingsLoading } = useQuery({
    queryKey: ['modelSettings'],
    queryFn: () => apiRequest('/api/config/model-settings'),
  });

  // Effects to update state when data loads
  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  useEffect(() => {
    if (personasData) {
      setPersonas(personasData);
      if (!persona && Object.keys(personasData).length > 0) {
        const firstPersona = Object.keys(personasData)[0];
        setPersona(firstPersona);
      }
    }
  }, [personasData, persona]);

  useEffect(() => {
    if (brandGuidelinesData) setBrandGuidelines(brandGuidelinesData);
  }, [brandGuidelinesData]);

  useEffect(() => {
    if (copyFrameworksData) setCopyFrameworks(copyFrameworksData);
  }, [copyFrameworksData]);

  useEffect(() => {
    if (stationPromptsData) setStationPrompts(stationPromptsData);
  }, [stationPromptsData]);

  useEffect(() => {
    if (modelSettingsData) setModelSettings(modelSettingsData);
  }, [modelSettingsData]);

  // Helper function to check if generation buttons should be disabled
  const getGenerationDisabledState = (stationType: 'adCopy' | 'landingPage' | 'customRequest' | 'email' | 'sms' | 'staticAd') => {
    const hasModelName = modelSettings?.model && modelSettings.model.trim() !== '';
    const hasMaxTokens = modelSettings?.maxTokens && modelSettings.maxTokens > 0;
    
    let hasStationPrompt = false;
    let stationPromptReason = '';
    
    switch (stationType) {
      case 'adCopy':
        hasStationPrompt = stationPrompts?.adCopy?.systemPrompt && stationPrompts.adCopy.systemPrompt.trim() !== '';
        stationPromptReason = 'Ad Copy system prompt is not configured';
        break;
      case 'landingPage':
        hasStationPrompt = stationPrompts?.landingPage?.systemPrompt && stationPrompts.landingPage.systemPrompt.trim() !== '';
        stationPromptReason = 'Landing Page system prompt is not configured';
        break;
      case 'customRequest':
        hasStationPrompt = stationPrompts?.customRequest?.systemPrompt && stationPrompts.customRequest.systemPrompt.trim() !== '';
        stationPromptReason = 'Custom Request system prompt is not configured';
        break;
      case 'email':
        hasStationPrompt = stationPrompts?.email?.systemPrompt && stationPrompts.email.systemPrompt.trim() !== '';
        stationPromptReason = 'Email system prompt is not configured';
        break;
      case 'sms':
        hasStationPrompt = stationPrompts?.sms?.systemPrompt && stationPrompts.sms.systemPrompt.trim() !== '';
        stationPromptReason = 'SMS system prompt is not configured';
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

  // Handle AI Settings tab click
  const handleAISettingsClick = () => {
    if (hasAdminAccess) {
      setActiveTab('settings');
    } else {
      setShowAdminKeyPrompt(true);
    }
  };

  // File upload handlers
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
        setAirLink('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Utility functions
  const getBrandDrLabel = () => {
    const value = brandDrBalance[0];
    return `${value}% Brand / ${100 - value}% DR`;
  };

  const getWordCount = (text: string) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  return {
    // State
    activeTab,
    setActiveTab,
    paidSocialSubTab,
    setPaidSocialSubTab,
    organicSocialType,
    setOrganicSocialType,
    showGenerationDetails,
    setShowGenerationDetails,
    currentGenerationMetadata,
    setCurrentGenerationMetadata,
    hasAdminAccess,
    setHasAdminAccess,
    showAdminKeyPrompt,
    setShowAdminKeyPrompt,
    adminKeyInput,
    setAdminKeyInput,
    transcription,
    setTranscription,
    airLink,
    setAirLink,
    uploadedImage,
    setUploadedImage,
    customBrief,
    setCustomBrief,
    persona,
    setPersona,
    targetAudience,
    setTargetAudience,
    landingPageUrl,
    setLandingPageUrl,
    selectedProduct,
    setSelectedProduct,
    selectedProducts,
    setSelectedProducts,
    useJonesBrandGuide,
    setUseJonesBrandGuide,
    brandDrBalance,
    setBrandDrBalance,
    enableInfluencerMode,
    setEnableInfluencerMode,
    influencerHandle,
    setInfluencerHandle,
    voiceAnalysisMethod,
    setVoiceAnalysisMethod,
    influencerBrandBalance,
    setInfluencerBrandBalance,
    contentType,
    setContentType,
    customRequest,
    setCustomRequest,
    customRequestHistory,
    setCustomRequestHistory,
    generatedCustomResponse,
    setGeneratedCustomResponse,
    
    // Configuration data
    products,
    setProducts,
    productClaims,
    setProductClaims,
    personas,
    setPersonas,
    brandGuidelines,
    setBrandGuidelines,
    copyFrameworks,
    setCopyFrameworks,
    stationPrompts,
    setStationPrompts,
    modelSettings,
    setModelSettings,
    editingConfig,
    setEditingConfig,
    newProductName,
    setNewProductName,
    
    // Loading states
    productsLoading,
    personasLoading,
    brandGuidelinesLoading,
    copyFrameworksLoading,
    stationPromptsLoading,
    modelSettingsLoading,
    
    // Helper functions
    getGenerationDisabledState,
    verifyAdminKey,
    handleAISettingsClick,
    handleFileUpload,
    handleImageUpload,
    getBrandDrLabel,
    getWordCount,
    copyToClipboard,
  };
}; 