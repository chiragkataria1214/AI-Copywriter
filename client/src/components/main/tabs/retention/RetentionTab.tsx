import React, { useEffect, useState } from 'react';
import { Mail, MessageSquare, FileText, Copy, Settings, Zap, Eye, Image, ChevronLeft, ChevronRight, Lightbulb, BarChart, Target, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductSelection } from '@/components/common/ProductSelection';
import { GenerationMetadata } from "@/components/main/shared/types";
import { apiRequest } from '@/lib/queryClient';
import { TargetPersona } from '@/components/common/TargetPersona';
import { BRAND_NAME } from '@shared/constants';
import { BrandDrBalance } from '@/components/common/BrandDrBalance';
import { StandardizedDebugButton } from '@/components/common/StandardizedDebugButton';
import { STATION_KEYS } from '@/hooks/generation/useDebugInfo';

const EmailContentRenderer = ({ content }: { content: string }) => {
  const regex = /(\[.*?\]|\*\*.*?\*\*)/g;
  const parts = content.split(regex).filter(Boolean);

  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('[') && part.endsWith(']')) {
          const description = part.slice(1, -1);
          return (
            <div key={index} className="my-1 p-2 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center" style={{ whiteSpace: 'normal' }}>
              <Image size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-500 italic">{description}</p>
            </div>
          );
        }
        return part;
      })}
    </div>
  );
};

interface Persona {
  label: string;
}

interface Product {
  name: string;
  displayName: string;
}

interface RetentionCopyHistoryItem {
  keyMessage: string;
  platform: string;
  response: string;
  timestamp: Date;
}

interface EmailFramework {
  id: string;
  name: string;
  displayName: string;
  description: string;
  structure: string;
  keyElements: string;
  frameworkContent: string;
  systemPrompt: string;
  outputRequirements: string;
  expectedLength: string;
  images?: any[];
  isActive: string;
  sortOrder: number;
}

interface SmsFramework {
  id: string;
  name: string;
  displayName: string;
  description: string;
  structure: string;
  keyElements: string;
  frameworkContent: string;
  systemPrompt: string;
  outputRequirements: string;
  expectedLength: string;
  images?: any[];
  isActive: string;
  sortOrder: number;
}

interface VisualStrategy {
  heroImage: string;
  supportingImages: string[];
  imageToTextRatio: string;
}

interface EmailVariation {
  variation: string;
  subjectLine: string;
  preheader: string;
  content: string;
  cta: string;
  visualStrategy: VisualStrategy;
  testingFocus: string;
  whyItWorks: string;
}

interface StrategicInsights {
  testingRecommendations: string;
  performancePredictions: string;
  visualOptimizationTips: string[];
  optimizationTips: string[];
  brandAlignment: string;
  visualFrameworkInsights: string;
}

interface GeneratedEmailData {
  emailVariations: EmailVariation[];
  strategicInsights: StrategicInsights;
}

interface SmsVariation {
  variation: string;
  message: string;
  characterCount: string;
  cta: string;
  personalizationTokens: string[];
  testingFocus: string;
  complianceNotes: string;
  whyItWorks: string;
}

interface SmsStrategicInsights {
  testingRecommendations: string;
  performancePredictions: string;
  timingStrategy: {
    optimalSendTimes: string;
    frequencyGuidance: string;
    sequenceRecommendations: string;
  };
  complianceConsiderations: string[];
  optimizationTips: string[];
  brandAlignment: string;
  mobileEngagementInsights: string;
}

interface GeneratedSmsData {
  smsVariations: SmsVariation[];
  strategicInsights: SmsStrategicInsights;
}

interface RetentionTabProps {
  // State variables
  retentionKeyMessage: string;
  setRetentionKeyMessage: (value: string) => void;
  retentionPlatform: string;
  setRetentionPlatform: (value: string) => void;
  retentionEmailType: string;
  setRetentionEmailType: (value: string) => void;
  retentionSelectedProducts: string[];
  setRetentionSelectedProducts: (value: string[]) => void;
  retentionAudience: string;
  setRetentionAudience: (value: string) => void;
  retentionGoal: string;
  setRetentionGoal: (value: string) => void;
  retentionKeywordsToInclude: string[];
  retentionWordsToAvoid: string[];
  generatedRetentionCopy: string | any;
  retentionCopyHistory: RetentionCopyHistoryItem[];
  
  // Shared state
  persona: string;
  setPersona: (value: string) => void;
  brandDrBalance: number[];
  setBrandDrBalance: (value: number[]) => void;
  selectedProduct: string;
  
  // Data
  personas: Record<string, Persona>;
  products: Record<string, Product>;
  
  // Functions
  addRetentionKeyword: (keyword: string, isAvoid?: boolean) => void;
  removeRetentionKeyword: (keyword: string, isAvoid?: boolean) => void;
  getBrandDrLabel: () => string;
  getGenerationDisabledState: (stationType: 'email' | 'sms') => { disabled: boolean; reason: string };
  copyToClipboard: (text: string, type: string) => Promise<void>;
  
  // Mutations and settings
  generateRetentionEmailMutation: {
    mutate: () => void;
    isPending: boolean;
  };
  generateRetentionSmsMutation: {
    mutate: () => void;
    isPending: boolean;
  };
  
  // Modal functions
  setCurrentGenerationMetadata: (metadata: GenerationMetadata) => void;
  setShowGenerationDetails: (show: boolean) => void;
  setSelectedItemForRevision: (item: { type: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'email' | 'sms'; index?: number; field?: string } | null) => void;
  setRevisionInstructions: (instructions: string) => void;
  setShowRevisionPanel: (show: boolean) => void;
  
  // Settings
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stationPrompts?: {
    retention?: {
      systemPrompt?: string;
    };
  };
  brandGuidelines?: {
    guidelines?: string[];
  };
  copyFrameworks?: {
    retention?: {
      frameworks?: string[];
    };
  };
  debugInfoManager?: {
    getDebugInfo: (stationKey: string) => any;
    setDebugInfo: (stationKey: string, debugInfo: any) => void;
  };
}

export const RetentionTab: React.FC<RetentionTabProps> = ({
  retentionKeyMessage,
  setRetentionKeyMessage,
  retentionPlatform,
  setRetentionPlatform,
  retentionEmailType,
  setRetentionEmailType,
  retentionSelectedProducts,
  setRetentionSelectedProducts,
  retentionAudience,
  setRetentionAudience,
  retentionGoal,
  setRetentionGoal,
  retentionKeywordsToInclude,
  retentionWordsToAvoid,
  generatedRetentionCopy,
  retentionCopyHistory,
  persona,
  setPersona,
  brandDrBalance,
  setBrandDrBalance,
  selectedProduct,
  personas,
  products,
  addRetentionKeyword,
  removeRetentionKeyword,
  getBrandDrLabel,
  getGenerationDisabledState,
  copyToClipboard,
  generateRetentionEmailMutation,
  generateRetentionSmsMutation,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  setSelectedItemForRevision,
  setRevisionInstructions,
  setShowRevisionPanel,
  modelSettings,
  stationPrompts,
  brandGuidelines,
  copyFrameworks,
  debugInfoManager,
}) => {
  const [emailFrameworks, setEmailFrameworks] = useState<EmailFramework[]>([]);
  const [smsFrameworks, setSmsFrameworks] = useState<SmsFramework[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [visualPreviewHtml, setVisualPreviewHtml] = useState<string>('');
  const [showVisualPreview, setShowVisualPreview] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [generatedEmailData, setGeneratedEmailData] = useState<GeneratedEmailData | null>(null);
  const [generatedSmsData, setGeneratedSmsData] = useState<GeneratedSmsData | null>(null);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopyToClipboard = (text: string, type: string) => {
    copyToClipboard(text, type);
    setCopiedStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  useEffect(() => {
    setParsingError(null);
    if (generatedRetentionCopy) {
      try {
        let parsedData;
        
        // Check if generatedRetentionCopy is already an object
        if (typeof generatedRetentionCopy === 'object' && generatedRetentionCopy !== null) {
          parsedData = generatedRetentionCopy;
        } else {
          // If it's a string, parse it
          let jsonToParse = generatedRetentionCopy;

          // Extract JSON from markdown code blocks
          const match = jsonToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            jsonToParse = match[1];
          }

          // If no code block found, or to clean up further, find the raw JSON object
          const firstBrace = jsonToParse.indexOf('{');
          const lastBrace = jsonToParse.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonToParse = jsonToParse.substring(firstBrace, lastBrace + 1);
          }

          parsedData = JSON.parse(jsonToParse);
        }
        
        if (retentionPlatform === 'Email' && parsedData.emailVariations && parsedData.strategicInsights) {
          setGeneratedEmailData(parsedData);
          setGeneratedSmsData(null);
          setActiveVariationIndex(0); // Reset to first variation
        } else if (retentionPlatform === 'SMS' && parsedData.smsVariations && parsedData.strategicInsights) {
          setGeneratedSmsData(parsedData);
          setGeneratedEmailData(null);
          setActiveVariationIndex(0); // Reset to first variation
        } else {
          setGeneratedEmailData(null);
          setGeneratedSmsData(null);
        }
      } catch (e) {
        console.error("Failed to parse generated copy:", e);
        setGeneratedEmailData(null);
        setGeneratedSmsData(null);
        if (e instanceof SyntaxError) {
          setParsingError(`Failed to parse the response as it appears to be invalid JSON. Error: ${e.message}`);
        } else if (e instanceof Error) {
          setParsingError(`An unexpected error occurred while parsing the response: ${e.message}`);
        } else {
          setParsingError("An unknown error occurred while parsing the response.");
        }
      }
    } else {
      setGeneratedEmailData(null);
      setGeneratedSmsData(null);
    }
  }, [generatedRetentionCopy, retentionPlatform]);

  const handlePrev = () => {
    setActiveVariationIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (generatedEmailData) {
      setActiveVariationIndex(prev => Math.min(generatedEmailData.emailVariations.length - 1, prev + 1));
    } else if (generatedSmsData) {
      setActiveVariationIndex(prev => Math.min(generatedSmsData.smsVariations.length - 1, prev + 1));
    }
  };

  const handleGenerate = () => {
    setParsingError(null);
    setShowVisualPreview(false);
    debugInfoManager?.setDebugInfo(retentionPlatform.toLowerCase() === 'email' ? STATION_KEYS.RETENTION_EMAIL : STATION_KEYS.RETENTION_SMS, null);
    if (retentionPlatform.toLowerCase() === 'email') {
      generateRetentionEmailMutation.mutate();
    } else {
      generateRetentionSmsMutation.mutate();
    }
  };

  // Load email/SMS frameworks on component mount
  useEffect(() => {
    const loadFrameworks = async () => {
      if (emailFrameworks.length > 0 && smsFrameworks.length > 0) return;
      setLoadingFrameworks(true);
      try {
        const [emailResp, smsResp] = await Promise.all([
          apiRequest('/api/email-frameworks'),
          apiRequest('/api/sms-frameworks')
        ]);
        const emailActive = (emailResp || []).filter((fw: EmailFramework) => fw.isActive === 'true');
        const smsActive = (smsResp || []).filter((fw: SmsFramework) => fw.isActive === 'true');
        setEmailFrameworks(emailActive);
        setSmsFrameworks(smsActive);
      } catch (error) {
        console.error('Failed to load frameworks:', error);
        setEmailFrameworks([]);
        setSmsFrameworks([]);
      } finally {
        setLoadingFrameworks(false);
      }
    };

    loadFrameworks();
  }, [emailFrameworks.length, smsFrameworks.length]);

  // Generate visual preview function
  const generateVisualPreview = async () => {
    if (!generatedRetentionCopy.trim()) return;
    
    setGeneratingPreview(true);
    try {
      const selectedFramework = getSelectedFramework();
      const response = await fetch('/api/generate-retention-visual-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          copyContent: generatedRetentionCopy,
          platform: retentionPlatform,
          emailType: retentionEmailType,
          selectedFramework: selectedFramework
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate visual preview');
      }

      if (data.htmlContent) {
        // Additional frontend cleaning to remove any remaining markdown
        let cleanHtml = data.htmlContent;
        
        // Remove markdown code blocks if they still exist
        cleanHtml = cleanHtml.replace(/^```[a-zA-Z]*\s*/gi, '').trim();
        cleanHtml = cleanHtml.replace(/```\s*$/gi, '').trim();
        cleanHtml = cleanHtml.replace(/^```/g, '').replace(/```$/g, '').trim();
        
        setVisualPreviewHtml(cleanHtml);
        setShowVisualPreview(true);
      }
    } catch (error) {
      console.error('Failed to generate visual preview:', error);
      // Reset preview state on error
      setVisualPreviewHtml('');
      setShowVisualPreview(false);
    } finally {
      setGeneratingPreview(false);
    }
  };

  // Helper function to get selected framework details
  const getSelectedFramework = (): EmailFramework | null => {
    if (retentionPlatform === 'SMS') {
      if (!retentionEmailType || smsFrameworks.length === 0) return null;
      const found = smsFrameworks.find(framework => framework.displayName === retentionEmailType);
      return (found as unknown as EmailFramework) || null;
    }
    if (!retentionEmailType || emailFrameworks.length === 0) return null;
    return emailFrameworks.find(framework => framework.displayName === retentionEmailType) || null;
  };

  const generationDisabledState = getGenerationDisabledState(retentionPlatform === 'Email' ? 'email' : 'sms');
  const tooltipReason = !retentionKeyMessage.trim()
    ? 'Please enter a key message'
    : generationDisabledState.reason || (!stationPrompts?.retention?.systemPrompt ? 'System prompt for retention is not configured.' : '');


  return (
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
              {/* Platform Selection First */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setRetentionPlatform('Email');
                      setRetentionEmailType(emailFrameworks.length > 0 ? [...emailFrameworks].sort((a, b) => a.sortOrder - b.sortOrder)[0].displayName : 'GTL (Get the Look)');
                      setShowVisualPreview(false); // Hide preview on platform change
                    }}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${retentionPlatform === 'Email'
                        ? 'border-[#004182] bg-[#004182]/10 text-[#004182]'
                        : 'border-gray-300 hover:border-[#004182]'
                      }`}
                  >
                    <Mail size={20} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                  <button
                    onClick={() => {
                      setRetentionPlatform('SMS');
                      setRetentionEmailType(smsFrameworks.length > 0 ? [...smsFrameworks].sort((a, b) => a.sortOrder - b.sortOrder)[0].displayName : 'Product Launch');
                      setShowVisualPreview(false); // Hide preview on platform change
                    }}
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

              {/* Key Message Field */}
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

              {retentionPlatform === 'Email' && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Type *
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose the specific email framework that best fits your campaign goals
                  </p>
                  <Select value={retentionEmailType} onValueChange={setRetentionEmailType} disabled={loadingFrameworks}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingFrameworks ? "Loading frameworks..." : "Select email type"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {emailFrameworks.length > 0 ? (
                        emailFrameworks
                          .slice() // Create a shallow copy before sorting
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((framework) => (
                            <SelectItem key={framework.id} value={framework.displayName}>
                              <div className="flex flex-col">
                                <span className="font-medium">{framework.displayName}</span>
                                <span className="text-xs text-gray-500 truncate max-w-xs">
                                  {framework.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        // Fallback to hardcoded options if frameworks fail to load
                        <>
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
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {loadingFrameworks && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Loading email frameworks from database...
                    </p>
                  )}
                  
                  {/* Show selected framework details */}
                  {retentionEmailType && getSelectedFramework() && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            {getSelectedFramework()?.displayName}
                          </h4>
                          <p className="text-xs text-blue-700 mb-2">
                            {getSelectedFramework()?.description}
                          </p>
                          <div className="text-xs text-blue-600">
                            <span className="font-medium">Structure:</span> {getSelectedFramework()?.structure}
                          </div>
                          {getSelectedFramework()?.keyElements && (
                            <div className="text-xs text-blue-600 mt-1">
                              <span className="font-medium">Key Elements:</span> {getSelectedFramework()?.keyElements}
                            </div>
                          )}
                          {getSelectedFramework()?.expectedLength && (
                            <div className="text-xs text-blue-600 mt-1">
                              <span className="font-medium">Expected Length:</span> {getSelectedFramework()?.expectedLength}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {retentionPlatform === 'SMS' && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Type *
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose the specific SMS framework that best fits your campaign goals
                  </p>
                  <Select value={retentionEmailType} onValueChange={setRetentionEmailType} disabled={loadingFrameworks}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingFrameworks ? "Loading frameworks..." : "Select SMS type"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {smsFrameworks.length > 0 ? (
                        smsFrameworks
                          .slice() // Create a shallow copy before sorting
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((framework) => (
                            <SelectItem key={framework.id} value={framework.displayName}>
                              <div className="flex flex-col">
                                <span className="font-medium">{framework.displayName}</span>
                                <span className="text-xs text-gray-500 truncate max-w-xs">
                                  {framework.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <>
                          <SelectItem value="Product Launch">Product Launch</SelectItem>
                          <SelectItem value="Product Spotlight">Product Spotlight</SelectItem>
                          <SelectItem value="Product Roundup / Series">Product Roundup / Series</SelectItem>
                          <SelectItem value="Category Push">Category Push</SelectItem>
                          <SelectItem value="Social Proof / Reviews">Social Proof / Reviews</SelectItem>
                          <SelectItem value="Sale or Promotion Alert">Sale or Promotion Alert</SelectItem>
                          <SelectItem value="Reminder / Last Chance">Reminder / Last Chance</SelectItem>
                          <SelectItem value="Educational">Educational</SelectItem>
                          <SelectItem value="Cross-Sell / Upsell">Cross-Sell / Upsell</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {loadingFrameworks && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Loading SMS frameworks from database...
                    </p>
                  )}

                  {/* Show selected SMS framework details */}
                  {retentionEmailType && getSelectedFramework() && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-amber-900 mb-1">
                            {getSelectedFramework()?.displayName}
                          </h4>
                          <p className="text-xs text-amber-700 mb-2">
                            {getSelectedFramework()?.description}
                          </p>
                          <div className="text-xs text-amber-700">
                            <span className="font-medium">Structure:</span> {getSelectedFramework()?.structure}
                          </div>
                          {getSelectedFramework()?.keyElements && (
                            <div className="text-xs text-amber-700 mt-1">
                              <span className="font-medium">Key Elements:</span> {getSelectedFramework()?.keyElements}
                            </div>
                          )}
                          {getSelectedFramework()?.expectedLength && (
                            <div className="text-xs text-amber-700 mt-1">
                              <span className="font-medium">Expected Length:</span> {getSelectedFramework()?.expectedLength}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Target Persona Section */}
                              <TargetPersona
                  personas={personas}
                  persona={persona}
                  setPersona={setPersona}
                  optional={true}
                  description="Choose the primary audience for this retention campaign, or leave blank for general audience"
                  showCard={false}
                  showIcon={false}
                />

              {/* Product Selection for Retention */}
              <ProductSelection
                selectedProducts={retentionSelectedProducts}
                setSelectedProducts={setRetentionSelectedProducts}
                products={products}
                title="Products to Feature (Multi-Select)"
                description={`Select products to mention in your ${retentionPlatform.toLowerCase()} copy. Email/SMS campaigns often feature multiple products.`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience Segment
                  </Label>
                  <Select value={retentionAudience} onValueChange={setRetentionAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General audience">General audience</SelectItem>
                      <SelectItem value="New prospects">New prospects</SelectItem>
                      <SelectItem value="Existing customers">Existing customers</SelectItem>
                      <SelectItem value="VIP customers">VIP customers</SelectItem>
                      <SelectItem value="Cart abandoners">Cart abandoners</SelectItem>
                      <SelectItem value="Win-back customers">Win-back customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
              </div>

              {/* Brand/DR Balance Section */}
              <BrandDrBalance
                useBrandGuide={false} // Assuming default, adjust as needed
                setUseBrandGuide={() => {}} // Assuming default, adjust as needed
                brandDrBalance={brandDrBalance}
                setBrandDrBalance={setBrandDrBalance}
              />

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
                        onClick={handleGenerate}
                        disabled={!retentionKeyMessage.trim() || generateRetentionEmailMutation.isPending || generateRetentionSmsMutation.isPending || generationDisabledState.disabled}
                        className="w-full flex items-center justify-center space-x-2"
                        size="sm"
                      >
                        {generateRetentionEmailMutation.isPending || generateRetentionSmsMutation.isPending ? (
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
                  {(generationDisabledState.disabled || !retentionKeyMessage.trim()) && tooltipReason && (
                    <TooltipContent>
                      <p>
                        {tooltipReason}
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
        {parsingError && (
          <Card>
            <CardContent className="p-4 sm:p-6 bg-red-50 border-red-200 border rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 mr-3 h-6 w-6 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-red-800">Error Parsing Response</h3>
                  <p className="text-red-700 mt-1 text-sm">{parsingError}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Possible Cause:</strong> The AI's response might have been cut short, often due to exceeding the maximum output length (tokens). This results in incomplete or broken data.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>Suggestion:</strong> Check the raw response in "View Details" (if available) to confirm. If the response is truncated, consider increasing the 'max tokens' setting for the model if you have access to it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Generated Copy */}
        {generateRetentionEmailMutation.isPending || generateRetentionSmsMutation.isPending ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {retentionPlatform === 'SMS' ? <MessageSquare className="text-jones-primary mr-2 sm:mr-3" size={18} /> : <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />}
                Generating {retentionPlatform} Copy
              </h3>
              
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium mb-2">Creating {retentionPlatform} Copy</p>
                <p className="text-sm text-gray-500">
                  {retentionPlatform === 'SMS' 
                    ? 'Crafting concise, action-driving SMS copy that respects character limits...'
                    : 'Generating engaging email copy optimized for your selected framework and audience...'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : retentionPlatform === 'Email' && generatedEmailData ? (
          <>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />
                    Generated Email Variations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const subject = `Subject: ${generatedEmailData.emailVariations[activeVariationIndex].subjectLine}`;
                              const preheader = `Preheader: ${generatedEmailData.emailVariations[activeVariationIndex].preheader}`;
                              const body = generatedEmailData.emailVariations[activeVariationIndex].content;
                              handleCopyToClipboard(`${subject}\n\n${preheader}\n\n${body}`, `variation-${generatedEmailData.emailVariations[activeVariationIndex].variation}`);
                            }}
                            className="flex items-center space-x-2"
                            size="icon"
                            disabled={copiedStates[`variation-${generatedEmailData.emailVariations[activeVariationIndex].variation}`]}
                          >
                            {copiedStates[`variation-${generatedEmailData.emailVariations[activeVariationIndex].variation}`] ? <Check size={16} /> : <Copy size={16} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedStates[`variation-${generatedEmailData.emailVariations[activeVariationIndex].variation}`] ? 'Copied!' : `Copy Variation ${generatedEmailData.emailVariations[activeVariationIndex].variation}`}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedItemForRevision({
                          type: 'email',
                          field: `variation_${generatedEmailData.emailVariations[activeVariationIndex].variation}`
                        });
                        setRevisionInstructions('');
                        setShowRevisionPanel(true);
                      }}
                      className="w-full sm:w-auto text-xs"
                      size="sm"
                    >
                      <Zap size={14} className="mr-1" />
                      <span>Improve</span>
                    </Button>
                    <StandardizedDebugButton
                      stationKey={retentionPlatform.toLowerCase() === 'email' ? STATION_KEYS.RETENTION_EMAIL : STATION_KEYS.RETENTION_SMS}
                      stationName={`${retentionPlatform} Retention`}
                      fallbackPrompts={{
                        systemPrompt: stationPrompts?.retention?.systemPrompt || `Expert retention marketing copywriter for ${BRAND_NAME}...`,
                        userPrompt: `Platform: ${retentionPlatform}\nKey Message: ${retentionKeyMessage}\nProducts: ${retentionSelectedProducts.join(', ')}`
                      }}
                      modelSettings={modelSettings}
                      setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                      setShowGenerationDetails={setShowGenerationDetails}
                      className="w-full sm:w-auto text-xs"
                      size="sm"
                      debugInfoManager={debugInfoManager}
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="border rounded-lg p-4 bg-gray-50/70">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-lg text-gray-800">
                        Variation {generatedEmailData.emailVariations[activeVariationIndex].variation}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={handlePrev} disabled={activeVariationIndex === 0} className="h-8 w-8">
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          {generatedEmailData.emailVariations.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveVariationIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${activeVariationIndex === index ? 'bg-jones-primary' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                          ))}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNext} disabled={activeVariationIndex === generatedEmailData.emailVariations.length - 1} className="h-8 w-8">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-4">
                      {/* Email Draft Preview */}
                      <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
                        <div className="p-3 border-b bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 w-16 text-right">From:</span>
                            <span className="text-sm text-gray-800">{BRAND_NAME}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-gray-500 w-16 text-right">Subject:</span>
                            <span className="text-sm font-semibold text-gray-900">{generatedEmailData.emailVariations[activeVariationIndex].subjectLine}</span>
                          </div>
                          <div className="flex items-start gap-2 mt-2">
                            <span className="text-xs font-medium text-gray-500 w-16 text-right pt-0.5">Preheader:</span>
                            <span className="text-sm text-gray-600">{generatedEmailData.emailVariations[activeVariationIndex].preheader}</span>
                          </div>
                        </div>
                        <div className="p-4 text-sm text-gray-800 prose prose-sm max-w-none">
                          <EmailContentRenderer content={generatedEmailData.emailVariations[activeVariationIndex].content} />
                        </div>
                        <div className="p-4 text-center bg-gray-50 border-t">
                          <Button variant="default" size="sm" className="bg-jones-primary hover:bg-jones-primary-dark">
                            {generatedEmailData.emailVariations[activeVariationIndex].cta}
                          </Button>
                        </div>
                      </div>

                      {/* Visual Strategy */}
                      {generatedEmailData.emailVariations[activeVariationIndex].visualStrategy && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <Image size={16} className="mr-2 text-jones-primary" />
                            Visual Strategy
                          </h5>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Hero Image:</p>
                              <p className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1 mt-1">
                                {generatedEmailData.emailVariations[activeVariationIndex].visualStrategy.heroImage}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Supporting Images:</p>
                              <ul className="list-disc pl-8 mt-1 space-y-1 text-gray-600">
                                {generatedEmailData.emailVariations[activeVariationIndex].visualStrategy.supportingImages.map((img, i) => (
                                  <li key={i}>{img}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Image-to-Text Ratio:</p>
                              <p className="text-gray-600">{generatedEmailData.emailVariations[activeVariationIndex].visualStrategy.imageToTextRatio}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Testing & Rationale */}
                      <div className="grid gap-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                            <Check size={16} className="mr-2" />
                            Why It Works
                          </h5>
                          <p className="text-sm text-green-800">
                            {generatedEmailData.emailVariations[activeVariationIndex].whyItWorks}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  Strategic Insights
                </h4>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <BarChart className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-blue-900 mb-1">Testing Recommendations</h5>
                      <p className="text-sm text-blue-800">{generatedEmailData.strategicInsights.testingRecommendations}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-green-900 mb-1">Performance Predictions</h5>
                      <p className="text-sm text-green-800">{generatedEmailData.strategicInsights.performancePredictions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-yellow-900 mb-1">Optimization Tips</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-800">
                        {generatedEmailData.strategicInsights.optimizationTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {generatedEmailData.strategicInsights.visualOptimizationTips && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-teal-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-teal-900 mb-1">Visual Optimization Tips</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-teal-800">
                          {generatedEmailData.strategicInsights.visualOptimizationTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Check size={16} className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-purple-900 mb-1">Brand Alignment</h5>
                      <p className="text-sm text-purple-800">{generatedEmailData.strategicInsights.brandAlignment}</p>
                    </div>
                  </div>
                </div>

                {generatedEmailData.strategicInsights.visualFrameworkInsights && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-indigo-900 mb-1">Visual Framework Insights</h5>
                        <p className="text-sm text-indigo-800">{generatedEmailData.strategicInsights.visualFrameworkInsights}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : retentionPlatform === 'SMS' && generatedSmsData ? (
            <>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="text-jones-primary mr-2 sm:mr-3" size={18} />
                      Generated SMS Variations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => handleCopyToClipboard(generatedSmsData.smsVariations[activeVariationIndex].message, `sms-variation-${generatedSmsData.smsVariations[activeVariationIndex].variation}`)}
                              className="flex items-center space-x-2"
                              size="icon"
                              disabled={copiedStates[`sms-variation-${generatedSmsData.smsVariations[activeVariationIndex].variation}`]}
                            >
                              {copiedStates[`sms-variation-${generatedSmsData.smsVariations[activeVariationIndex].variation}`] ? <Check size={16} /> : <Copy size={16} />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedStates[`sms-variation-${generatedSmsData.smsVariations[activeVariationIndex].variation}`] ? 'Copied!' : `Copy Variation ${generatedSmsData.smsVariations[activeVariationIndex].variation}`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedItemForRevision({
                            type: 'sms',
                            field: `variation_${generatedSmsData.smsVariations[activeVariationIndex].variation}`
                          });
                          setRevisionInstructions('');
                          setShowRevisionPanel(true);
                        }}
                        className="w-full sm:w-auto text-xs"
                        size="sm"
                      >
                        <Zap size={14} className="mr-1" />
                        <span>Edit</span>
                      </Button>
                      <StandardizedDebugButton
                        stationKey={retentionPlatform.toLowerCase() === 'email' ? STATION_KEYS.RETENTION_EMAIL : STATION_KEYS.RETENTION_SMS}
                        stationName={`${retentionPlatform} Retention`}
                        fallbackPrompts={{
                          systemPrompt: stationPrompts?.retention?.systemPrompt || `Expert retention marketing copywriter for ${BRAND_NAME}...`,
                          userPrompt: `Platform: ${retentionPlatform}\nKey Message: ${retentionKeyMessage}\nProducts: ${retentionSelectedProducts.join(', ')}`
                        }}
                        modelSettings={modelSettings}
                        setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                        setShowGenerationDetails={setShowGenerationDetails}
                        className="flex items-center space-x-1 text-xs"
                        size="sm"
                        debugInfoManager={debugInfoManager}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="border rounded-lg p-4 bg-gray-50/70">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg text-gray-800">
                          Variation {generatedSmsData.smsVariations[activeVariationIndex].variation}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={activeVariationIndex === 0} className="h-8 w-8">
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <div className="flex items-center space-x-2">
                            {generatedSmsData.smsVariations.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setActiveVariationIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${activeVariationIndex === index ? 'bg-jones-primary' : 'bg-gray-300 hover:bg-gray-400'}`}
                              />
                            ))}
                          </div>
                          <Button variant="ghost" size="icon" onClick={handleNext} disabled={activeVariationIndex === generatedSmsData.smsVariations.length - 1} className="h-8 w-8">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{generatedSmsData.smsVariations[activeVariationIndex].message}</p>
                          <div className="text-right text-xs text-gray-500 mt-2">
                            {generatedSmsData.smsVariations[activeVariationIndex].characterCount} characters
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                              <Check size={16} className="mr-2" />
                              Why It Works
                            </h5>
                            <p className="text-sm text-green-800">
                              {generatedSmsData.smsVariations[activeVariationIndex].whyItWorks}
                            </p>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h5 className="font-semibold text-yellow-900 mb-2 flex items-center">
                              <AlertTriangle size={16} className="mr-2" />
                              Compliance Notes
                            </h5>
                            <p className="text-sm text-yellow-800">
                              {generatedSmsData.smsVariations[activeVariationIndex].complianceNotes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <Lightbulb className="text-jones-primary mr-2 sm:mr-3" size={18} />
                    Strategic Insights for SMS
                  </h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <BarChart className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-blue-900 mb-1">Testing Recommendations</h5>
                        <p className="text-sm text-blue-800">{generatedSmsData.strategicInsights.testingRecommendations}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-green-900 mb-1">Performance Predictions</h5>
                        <p className="text-sm text-green-800">{generatedSmsData.strategicInsights.performancePredictions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Check size={16} className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-purple-900 mb-1">Brand Alignment</h5>
                        <p className="text-sm text-purple-800">{generatedSmsData.strategicInsights.brandAlignment}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
        ) : generatedRetentionCopy ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                {retentionPlatform === 'SMS' ? <MessageSquare className="text-jones-primary mr-2 sm:mr-3" size={18} /> : <Mail className="text-jones-primary mr-2 sm:mr-3" size={18} />}
                Generated {retentionPlatform} Copy
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-sm text-gray-800">
                    {typeof generatedRetentionCopy === 'string' 
                      ? generatedRetentionCopy 
                      : JSON.stringify(generatedRetentionCopy, null, 2)
                    }
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleCopyToClipboard(generatedRetentionCopy, 'retention')}
                          className="flex items-center space-x-2"
                          size="icon"
                          disabled={copiedStates['retention']}
                        >
                          {copiedStates['retention'] ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedStates['retention'] ? 'Copied' : 'Copy'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    onClick={generateVisualPreview}
                    disabled={generatingPreview}
                    className="flex items-center space-x-2"
                    size="sm"
                  >
                    {generatingPreview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span>Preview {retentionPlatform}</span>
                      </>
                    )}
                  </Button>

                  <StandardizedDebugButton
                    stationKey={retentionPlatform.toLowerCase() === 'email' ? STATION_KEYS.RETENTION_EMAIL : STATION_KEYS.RETENTION_SMS}
                    stationName={`${retentionPlatform} Retention`}
                    fallbackPrompts={{
                      systemPrompt: stationPrompts?.retention?.systemPrompt || `Expert retention marketing copywriter for ${BRAND_NAME}...`,
                      userPrompt: `Platform: ${retentionPlatform}\nKey Message: ${retentionKeyMessage}\nProducts: ${retentionSelectedProducts.join(', ')}`
                    }}
                    modelSettings={modelSettings}
                    setCurrentGenerationMetadata={setCurrentGenerationMetadata}
                    setShowGenerationDetails={setShowGenerationDetails}
                    className="flex items-center space-x-1 text-xs"
                    size="sm"
                    debugInfoManager={debugInfoManager}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItemForRevision({
                        type: retentionPlatform === 'Email' ? 'email' : 'sms',
                        field: 'retention'
                      });
                      setRevisionInstructions('');
                      setShowRevisionPanel(true);
                    }}
                    className="w-full sm:w-auto text-xs"
                  >
                    <Zap size={14} className="mr-1" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Visual Preview */}
        {showVisualPreview && visualPreviewHtml && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <Image className="text-jones-primary mr-2 sm:mr-3" size={18} />
                  {retentionPlatform} Visual Preview
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVisualPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-600">
                    Preview of how your {retentionPlatform.toLowerCase()} copy will appear
                  </p>
                </div>
                <div className="bg-white relative">
                  <iframe
                    srcDoc={visualPreviewHtml}
                    className={`w-full border-0 ${retentionPlatform === 'SMS' ? 'h-80' : 'h-96'}`}
                    title={`${retentionPlatform} Preview`}
                    sandbox="allow-same-origin allow-scripts"
                    style={{ minHeight: retentionPlatform === 'SMS' ? '320px' : '384px' }}
                  />
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyToClipboard(item.response, `history-${index}`)}
                            className="mt-2 flex items-center space-x-1"
                            disabled={copiedStates[`history-${index}`]}
                          >
                            {copiedStates[`history-${index}`] ? <Check size={12} /> : <Copy size={12} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedStates[`history-${index}`] ? 'Copied' : 'Copy'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 