import { useState } from 'react';
import { Upload, Copy, Check, Target, Sparkles, Camera, FileText, AlertCircle, Settings, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Globe, ThumbsUp, MessageSquare, Share2, Music, Volume2, Play, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { GenerationMetadata } from '@/components/common/GenerationDetailsModal';
import { ProductSelection } from '@/components/common/ProductSelection';
import { TargetPersona } from '../../../common/TargetPersona';
import { DEFAULT_SOCIAL_PLATFORM } from '@shared/constants';

interface Product {
  name: string;
  displayName: string;
}

interface OrganicSocialTabProps {
  organicSocialType: string;
  setOrganicSocialType: (value: string) => void;
  organicContentType: string;
  setOrganicContentType: (value: string) => void;
  organicVideoFile: File | null;
  setOrganicVideoFile: (file: File | null) => void;
  organicVideoTranscription: string;
  setOrganicVideoTranscription: (value: string) => void;
  organicImageFile: File | null;
  setOrganicImageFile: (file: File | null) => void;
  organicImagePreview: string;
  setOrganicImagePreview: (value: string) => void;
  organicPlatform: string;
  setOrganicPlatform: (value: string) => void;
  organicGoal: string;
  setOrganicGoal: (value: string) => void;
  organicTone: string;
  setOrganicTone: (value: string) => void;
  generatedCaptions: string[];
  setGeneratedCaptions: (captions: string[]) => void;
  captionVariations: number;
  setCaptionVariations: (value: number) => void;
  storyContentType: string;
  setStoryContentType: (value: string) => void;
  storyVideoTranscription: string;
  setStoryVideoTranscription: (value: string) => void;
  storyVideoFile: File | null;
  setStoryVideoFile: (file: File | null) => void;
  storyImageFile: File | null;
  setStoryImageFile: (file: File | null) => void;
  storyImagePreview: string;
  setStoryImagePreview: (value: string) => void;
  storySequenceType: string;
  setStorySequenceType: (value: string) => void;
  storyLength: number;
  setStoryLength: (value: number) => void;
  storyTone: string;
  setStoryTone: (value: string) => void;
  generatedStorySequence: Array<{
    slide: number;
    type: string;
    title: string;
    content: string;
    visualDirection: string;
  }>;
  setGeneratedStorySequence: (sequence: Array<{
    slide: number;
    type: string;
    title: string;
    content: string;
    visualDirection: string;
  }>) => void;
  selectedProduct: string;
  
  // Multi-select product props for Social Captions
  organicSelectedProducts: string[];
  setOrganicSelectedProducts: (products: string[]) => void;
  
  // Multi-select product props for Story Sequences  
  storySelectedProducts: string[];
  setStorySelectedProducts: (products: string[]) => void;
  
  // Products data
  products: Record<string, Product>;
  
  // New props for View Details functionality
  setCurrentGenerationMetadata: (metadata: GenerationMetadata) => void;
  setShowGenerationDetails: (show: boolean) => void;
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stationPrompts?: {
    socialCaptions?: {
      systemPrompt?: string;
    };
    storySequence?: {
      systemPrompt?: string;
    };
  };
  brandGuidelines?: {
    guidelines?: string[];
  };
  copyFrameworks?: {
    socialCaptions?: {
      frameworks?: string[];
    };
    storySequence?: {
      frameworks?: string[];
    };
  };
  debugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
  socialCaptionsDebugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
  storySequenceDebugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
  setSocialCaptionsDebugInfo?: (debugInfo: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null) => void;
  setStorySequenceDebugInfo?: (debugInfo: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null) => void;
  
  // Persona props
  personas?: Record<string, any>;
  persona?: string;
  setPersona?: (value: string) => void;
}

export function OrganicSocialTab({
  organicSocialType,
  setOrganicSocialType,
  organicContentType,
  setOrganicContentType,
  organicVideoFile,
  setOrganicVideoFile,
  organicVideoTranscription,
  setOrganicVideoTranscription,
  organicImageFile,
  setOrganicImageFile,
  organicImagePreview,
  setOrganicImagePreview,
  organicPlatform,
  setOrganicPlatform,
  organicGoal,
  setOrganicGoal,
  organicTone,
  setOrganicTone,
  generatedCaptions,
  setGeneratedCaptions,
  captionVariations,
  setCaptionVariations,
  storyContentType,
  setStoryContentType,
  storyVideoTranscription,
  setStoryVideoTranscription,
  storyVideoFile,
  setStoryVideoFile,
  storyImageFile,
  setStoryImageFile,
  storyImagePreview,
  setStoryImagePreview,
  storySequenceType,
  setStorySequenceType,
  storyLength,
  setStoryLength,
  storyTone,
  setStoryTone,
  generatedStorySequence,
  setGeneratedStorySequence,
  selectedProduct,
  organicSelectedProducts,
  setOrganicSelectedProducts,
  storySelectedProducts,
  setStorySelectedProducts,
  products,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  modelSettings,
  stationPrompts,
  brandGuidelines,
  copyFrameworks,
  debugInfo,
  socialCaptionsDebugInfo,
  storySequenceDebugInfo,
  setSocialCaptionsDebugInfo,
  setStorySequenceDebugInfo,
  personas,
  persona,
  setPersona
}: OrganicSocialTabProps) {
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Defensive fallbacks for undefined arrays
  const safeOrganicSelectedProducts = organicSelectedProducts || [];
  const safeStorySelectedProducts = storySelectedProducts || [];
  
  // Defensive fallback for undefined products
  const safeProducts = products || {};

  // Helper: Render a post preview styled like a specific platform
  const renderPlatformPost = (
    params: {
      platform: 'instagram' | 'facebook' | 'tiktok';
      caption: string;
      imageSrc?: string | null;
      captionIndex: number;
    }
  ) => {
    const { platform, caption, imageSrc, captionIndex } = params;
    const imgEl = (
      <div className={`${platform === 'tiktok' ? 'h-[520px]' : 'h-72'} w-full bg-gray-100 rounded-md overflow-hidden relative`}> 
        {imageSrc ? (
          <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image uploaded</div>
        )}
      </div>
    );

    if (platform === 'instagram') {
      return (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-300" />
              <div className="text-sm font-semibold text-gray-900">jonesroad</div>
            </div>
            <MoreHorizontal size={18} className="text-gray-500" />
          </div>
          {imgEl}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Heart size={20} className="text-gray-800" />
              <MessageCircle size={20} className="text-gray-800" />
              <Send size={20} className="text-gray-800" />
            </div>
            <Bookmark size={20} className="text-gray-800" />
          </div>
          <div className="px-4 pb-1 text-sm font-semibold text-gray-900">1,234 likes</div>
          <div className="px-4 pb-1 text-sm text-gray-900 whitespace-pre-wrap">
            <span className="font-semibold mr-2">Jones Road</span>
            {caption}
          </div>
          <div className="px-4 pb-1 text-xs text-gray-500">View all 87 comments</div>
          <div className="px-4 pb-3 text-xs text-gray-400">2 hours ago</div>
        </div>
      );
    }

    if (platform === 'facebook') {
      return (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gray-300" />
              <div>
                <div className="text-[15px] font-semibold text-gray-900">Jones Road</div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <span>Just now</span>
                  <span>·</span>
                  <Globe size={12} />
                </div>
              </div>
            </div>
            <MoreHorizontal size={18} className="text-gray-500" />
          </div>
          <div className="px-4 pb-3 text-[15px] text-gray-900 whitespace-pre-wrap">{caption}</div>
          {imgEl}
          <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-600">
            <div>1.2K</div>
            <div className="space-x-2">
              <span>87 comments</span>
              <span>·</span>
              <span>12 shares</span>
            </div>
          </div>
          <div className="border-t px-2 py-1 grid grid-cols-3 text-center text-sm text-gray-700">
            <button className="py-2 hover:bg-gray-50 rounded flex items-center justify-center space-x-2">
              <ThumbsUp size={16} />
              <span>Like</span>
            </button>
            <button className="py-2 hover:bg-gray-50 rounded flex items-center justify-center space-x-2">
              <MessageSquare size={16} />
              <span>Comment</span>
            </button>
            <button className="py-2 hover:bg-gray-50 rounded flex items-center justify-center space-x-2">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      );
    }

    // tiktok
    return (
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <div className="text-sm font-semibold text-gray-900">Jones Road</div>
          </div>
          <MoreHorizontal size={18} className="text-gray-500" />
        </div>
        <div className="relative bg-black rounded-md mx-3 mb-3 overflow-hidden h-[520px]">
          {imageSrc ? (
            <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image uploaded</div>
          )}

          <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-4 text-white">
            <div className="flex flex-col items-center">
              <UserIcon size={24} />
            </div>
            <div className="flex flex-col items-center">
              <Heart size={24} />
              <span className="text-xs mt-1">1.2K</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle size={24} />
              <span className="text-xs mt-1">87</span>
            </div>
            <div className="flex flex-col items-center">
              <Share2 size={24} />
              <span className="text-xs mt-1">12</span>
            </div>
          </div>

          <div className="absolute left-3 right-16 bottom-4 text-white">
            <div className="text-sm font-semibold">@jonesroad</div>
            <div className="text-sm whitespace-pre-wrap">{caption}</div>
            <div className="mt-2 flex items-center space-x-2 text-xs">
              <Music size={14} />
              <span>Jones Road • Original audio</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  return (
    <>
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

                    {personas && persona && setPersona && (
                      <TargetPersona
                        personas={personas}
                        persona={persona}
                        setPersona={setPersona}
                        showCard={false}
                        showIcon={false}
                      />
                    )}

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

              {/* Product Selection for Social Captions */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                    Products to Feature
                  </h3>
                  
                  <ProductSelection
                    selectedProducts={safeOrganicSelectedProducts}
                    setSelectedProducts={setOrganicSelectedProducts}
                    products={safeProducts}
                    title="Select Products (Multi-Select)"
                    description="Select products to mention in your social media captions. Leave empty for general brand content."
                  />

                </CardContent>
              </Card>

              <Button
                className="w-full flex items-center justify-center space-x-2"
                disabled={(!organicVideoTranscription && !organicImageFile) || isGeneratingCaptions}
                onClick={async () => {
                  if (!organicVideoTranscription && !organicImageFile) return;

                  setIsGeneratingCaptions(true);
                  setCaptionError(null);

                  try {
                    // Prepare image data if available
                    let imageData = null;
                    if (organicImageFile && organicContentType === 'image') {
                      imageData = organicImagePreview; // This contains the full data URI
                    }

                    console.log('🚀 Sending Social Captions Request:', {
                      contentType: organicContentType,
                      transcription: organicVideoTranscription,
                      platform: organicPlatform,
                      goal: organicGoal,
                      tone: organicTone,
                      variations: captionVariations,
                      selectedProducts: safeOrganicSelectedProducts.length > 0 ? safeOrganicSelectedProducts : [selectedProduct].filter(Boolean),
                      hasImageData: !!imageData
                    });

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
                        selectedProducts: safeOrganicSelectedProducts.length > 0 ? safeOrganicSelectedProducts : [selectedProduct].filter(Boolean),
                        imageData: imageData,
                        persona: persona
                      })
                    });

                    console.log('📡 Social Captions Response Status:', response.status, response.statusText);

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ error: 'Failed to generate captions' }));
                      console.error('❌ Social Captions API Error:', errorData);
                      throw new Error(errorData.error || errorData.message || 'Failed to generate captions');
                    }

                    const data = await response.json();
                    // console.log('🔍 Social Captions API Response:', data);
                    // console.log('📝 Generated Captions Array:', data.captions);
                    // console.log('📊 Number of captions received:', data.captions?.length || 0);
                    
                    // Store debug information
                      const requestPayload = {
                      contentType: organicContentType,
                      transcription: organicVideoTranscription,
                      platform: organicPlatform,
                      goal: organicGoal,
                      tone: organicTone,
                      variations: captionVariations,
                      selectedProducts: safeOrganicSelectedProducts.length > 0 ? safeOrganicSelectedProducts : [selectedProduct].filter(Boolean),
                      imageData: imageData,
                        persona: persona
                    };
                    
                    // Store debug information from backend response
                    if (data.debugInfo) {
                      setSocialCaptionsDebugInfo?.({
                        systemPrompt: data.debugInfo.systemPrompt,
                        userPrompt: data.debugInfo.userPrompt,
                        requestPayload: requestPayload,
                        rawResponse: data.debugInfo.rawResponse
                      });
                    }
                    
                    // Ensure we have a valid array of captions
                    let captions = data.captions || [];
                    
                    // Handle case where captions might be a string instead of array
                    if (typeof captions === 'string') {
                      try {
                        captions = JSON.parse(captions);
                      } catch (parseError) {
                        console.log('Failed to parse captions string, treating as single caption');
                        captions = [captions];
                      }
                    }
                    
                    // Ensure it's an array
                    if (!Array.isArray(captions)) {
                      console.log('Captions is not an array, converting to array');
                      captions = [captions];
                    }
                    
                    // if (captions && Array.isArray(captions)) {
                    //   captions.forEach((caption: string, index: number) => {
                    //     console.log(`📄 Caption ${index + 1}:`, caption);
                    //   });
                    // }
                    
                    setGeneratedCaptions(captions);
                  } catch (error) {
                    console.error('Error generating captions:', error);
                    setCaptionError(error instanceof Error ? error.message : 'Failed to generate captions');
                  } finally {
                    setIsGeneratingCaptions(false);
                  }
                }}
              >
                <Sparkles size={16} />
                <span>
                  {isGeneratingCaptions
                    ? 'Generating Captions...'
                    : (!organicVideoTranscription && !organicImageFile)
                    ? 'Upload Asset or Enter Transcription'
                    : 'Generate Social Captions'}
                </span>
              </Button>

              {captionError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <strong>Error:</strong> {captionError}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardContent className="p-6">
                  {isGeneratingCaptions ? (
                    <div className="text-center py-16">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Generating Social Captions</h3>
                      <p className="text-gray-500">
                        Creating platform-optimized social media captions with hashtags and engagement hooks...
                      </p>
                    </div>
                  ) : generatedCaptions.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Generated Social Captions</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentGenerationMetadata({
                              stationName: 'Social Captions',
                              timestamp: new Date().toISOString(),
                              modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                              temperature: modelSettings?.temperature || 0.7,
                              maxTokens: modelSettings?.maxTokens || 2000,
                              systemPrompt: socialCaptionsDebugInfo?.systemPrompt || stationPrompts?.socialCaptions?.systemPrompt || 'Expert social media copywriter for Jones Road Beauty...',
                              userPrompt: socialCaptionsDebugInfo?.userPrompt || `Content Type: ${organicContentType}\nTranscription: ${organicVideoTranscription}\nPlatform: ${organicPlatform}\nGoal: ${organicGoal}\nTone: ${organicTone}\nVariations: ${captionVariations}\nSelected Products: ${safeOrganicSelectedProducts.length > 0 ? safeOrganicSelectedProducts.join(', ') : selectedProduct || 'None'}`,
                              requestPayload: socialCaptionsDebugInfo?.requestPayload,
                              rawResponse: socialCaptionsDebugInfo?.rawResponse
                            });
                            setShowGenerationDetails(true);
                          }}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <Settings size={12} />
                          <span>View Details</span>
                        </Button>
                      </div>
                      <div className="space-y-6">
                        {generatedCaptions.map((caption, index) => {
                          const imageSrc = organicContentType === 'image' ? organicImagePreview : '';
                          const platforms: Array<'instagram' | 'facebook' | 'tiktok'> = ['instagram', 'facebook', 'tiktok'];
                          const isMulti = organicPlatform === 'multi-platform';

                          if (!isMulti) {
                              const selectedPlatform = (organicPlatform as 'instagram' | 'facebook' | 'tiktok') || DEFAULT_SOCIAL_PLATFORM;
                            return (
                              <div key={index} className="relative">
                                <button
                                  onClick={() => navigator.clipboard.writeText(caption)}
                                  className="absolute right-3 top-3 z-10 text-jones-primary hover:text-jones-secondary"
                                  aria-label="Copy caption"
                                >
                                  <Copy size={16} />
                                </button>
                                {renderPlatformPost({ platform: selectedPlatform, caption, imageSrc, captionIndex: index })}
                              </div>
                            );
                          }

                          return (
                            <div key={index} className="space-y-4">
                              <div className="text-sm font-medium text-gray-700">Caption {index + 1} (Multi-Platform)</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {platforms.map((p) => (
                                  <div key={p} className="relative">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(caption)}
                                      className="absolute right-3 top-3 z-10 text-jones-primary hover:text-jones-secondary"
                                      aria-label={`Copy ${p} caption`}
                                    >
                                      <Copy size={16} />
                                    </button>
                                    {renderPlatformPost({ platform: p, caption, imageSrc, captionIndex: index })}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
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
                          placeholder="Paste your video transcription or describe the story here..."
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
                      <Select value={(storyLength || 5).toString()} onValueChange={(value) => setStoryLength(Number(value))}>
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

                    {personas && persona && setPersona && (
                      <TargetPersona
                        personas={personas}
                        persona={persona}
                        setPersona={setPersona}
                        showCard={false}
                        showIcon={false}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Selection for Story Sequences */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="text-jones-primary mr-2 sm:mr-3" size={18} />
                    Products to Feature
                  </h3>
                  
                  <ProductSelection
                    selectedProducts={safeStorySelectedProducts}
                    setSelectedProducts={setStorySelectedProducts}
                    products={safeProducts}
                    title="Select Products (Multi-Select)"
                    description="Select products to mention in your story sequence. Leave empty for general brand content."
                  />


                </CardContent>
              </Card>

              <Button
                className="w-full flex items-center justify-center space-x-2"
                disabled={(!storyVideoTranscription && !storyImageFile) || isGeneratingStory}
                onClick={async () => {
                  if (!storyVideoTranscription && !storyImageFile) return;

                  setIsGeneratingStory(true);
                  setStoryError(null);

                  try {
                    // Prepare image data if available
                    let imageData = null;
                    if (storyImageFile && storyContentType === 'image') {
                      imageData = storyImagePreview; // This contains the full data URI
                    }

                    // console.log('🚀 Sending Story Sequence Request:', {
                    //   contentType: storyContentType,
                    //   transcription: storyVideoTranscription,
                    //   sequenceType: storySequenceType,
                    //   length: storyLength,
                    //   tone: storyTone,
                    //   selectedProduct: selectedProduct,
                    //   hasImageData: !!imageData
                    // });

                    const response = await fetch('/api/generate-story-sequence', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        contentType: storyContentType,
                        transcription: storyVideoTranscription,
                        sequenceType: storySequenceType,
                        length: storyLength || 5,
                        tone: storyTone,
                        selectedProducts: safeStorySelectedProducts.length > 0 ? safeStorySelectedProducts : [selectedProduct].filter(Boolean),
                        imageData: imageData,
                        persona: persona
                      })
                    });

                    // console.log('📡 Story Sequence Response Status:', response.status, response.statusText);

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ error: 'Failed to generate story sequence' }));
                      console.error('❌ Story Sequence API Error:', errorData);
                      throw new Error(errorData.error || errorData.message || 'Failed to generate story sequence');
                    }

                    const data = await response.json();
                    // console.log('🔍 Story Sequence API Response:', data);
                    // console.log('📚 Generated Story Sequence Array:', data.sequence);
                    // console.log('📊 Number of slides received:', data.sequence?.length || 0);
                    
                    // Store debug information
                      const requestPayload = {
                      contentType: storyContentType,
                      transcription: storyVideoTranscription,
                      sequenceType: storySequenceType,
                      length: storyLength || 5,
                      tone: storyTone,
                      selectedProducts: safeStorySelectedProducts.length > 0 ? safeStorySelectedProducts : [selectedProduct].filter(Boolean),
                      imageData: imageData,
                        persona: persona
                    };
                    
                    // Store debug information from backend response
                    if (data.debugInfo) {
                      setStorySequenceDebugInfo?.({
                        systemPrompt: data.debugInfo.systemPrompt,
                        userPrompt: data.debugInfo.userPrompt,
                        requestPayload: requestPayload,
                        rawResponse: data.debugInfo.rawResponse
                      });
                    }
                    
                    // Ensure we have a valid array of slides
                    let sequence = data.sequence || [];
                    
                    // Handle case where sequence might be a string instead of array
                    if (typeof sequence === 'string') {
                      try {
                        sequence = JSON.parse(sequence);
                      } catch (parseError) {
                        console.log('Failed to parse sequence string, using empty array');
                        sequence = [];
                      }
                    }
                    
                    // Ensure it's an array
                    if (!Array.isArray(sequence)) {
                      console.log('Sequence is not an array, using empty array');
                      sequence = [];
                    }
                    
                    // if (sequence && Array.isArray(sequence)) {
                    //   sequence.forEach((slide: any, index: number) => {
                    //     console.log(`📄 Slide ${index + 1}:`, {
                    //       slide: slide.slide,
                    //       type: slide.type,
                    //       title: slide.title,
                    //       content: slide.content,
                    //       visualDirection: slide.visualDirection
                    //     });
                    //   });
                    // }
                    
                    setGeneratedStorySequence(sequence);
                  } catch (error) {
                    console.error('Error generating story sequence:', error);
                    setStoryError(error instanceof Error ? error.message : 'Failed to generate story sequence');
                  } finally {
                    setIsGeneratingStory(false);
                  }
                }}
              >
                <Sparkles size={16} />
                <span>
                  {isGeneratingStory
                    ? 'Generating Story...'
                    : (!storyVideoTranscription && !storyImageFile)
                    ? 'Upload Asset or Enter Content'
                    : 'Generate Story Sequence'}
                </span>
              </Button>

              {storyError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <strong>Error:</strong> {storyError}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardContent className="p-6">
                  {isGeneratingStory ? (
                    <div className="text-center py-16">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-3 h-3 bg-jones-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Generating Story Sequence</h3>
                      <p className="text-gray-500">
                        Creating an engaging Instagram story sequence with visual directions and timing...
                      </p>
                    </div>
                  ) : generatedStorySequence.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Generated Story Sequence</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentGenerationMetadata({
                              stationName: 'Story Sequences',
                              timestamp: new Date().toISOString(),
                              modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
                              temperature: modelSettings?.temperature || 0.7,
                              maxTokens: modelSettings?.maxTokens || 2000,
                              systemPrompt: storySequenceDebugInfo?.systemPrompt || stationPrompts?.storySequence?.systemPrompt || 'Expert Instagram story sequence creator for Jones Road Beauty...',
                              userPrompt: storySequenceDebugInfo?.userPrompt || `Content Type: ${storyContentType}\nTranscription: ${storyVideoTranscription}\nSequence Type: ${storySequenceType}\nLength: ${storyLength || 5} slides\nTone: ${storyTone}\nSelected Products: ${safeStorySelectedProducts.length > 0 ? safeStorySelectedProducts.join(', ') : selectedProduct || 'None'}`,
                              requestPayload: storySequenceDebugInfo?.requestPayload,
                              rawResponse: storySequenceDebugInfo?.rawResponse
                            });
                            setShowGenerationDetails(true);
                          }}
                          className="flex items-center space-x-1 text-xs"
                        >
                          <Settings size={12} />
                          <span>View Details</span>
                        </Button>
                      </div>
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
    </>
  );
} 