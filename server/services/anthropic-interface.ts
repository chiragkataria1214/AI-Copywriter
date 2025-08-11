import { GenerationMetadata } from "@/components/main/shared/types";

  export interface AdCopyRequest {
    transcription: string;
    customBrief?: string;
    persona: string;
    landingPageUrl?: string;
    brandDrBalance: number;
    useJonesBrandGuide: boolean;
    airLink?: string;
    uploadedImage?: string;
    selectedProduct?: string;
    selectedProducts?: string[];
  }
  
  export interface LandingPageRequest {
    landingPageType: string;
    productBrief: string;
    persona: string;
    useAdsContent: boolean;
    adsContent?: string;
    brandDrBalance: number;
    selectedProduct?: string;
    selectedProducts?: string[];
    mainAngle?: string;
    transcription?: string;
  }
  
  export interface CustomCopyRequest {
    customRequest: string;
    persona: string;
    brandDrBalance: number;
    selectedProduct?: string;
    selectedProducts?: string[];
    useJonesBrandGuide: boolean;
  }
  
  export interface StaticAdAnalysisRequest {
    staticAdImage: string;
    persona: string;
    brandDrBalance: number;
    selectedProduct?: string;
    selectedProducts?: string[];
    useJonesBrandGuide?: boolean;
    outputFormat?: string;
    analysisFocus?: string;
  }
  
  export interface RevisionRequest {
    originalContent: string;
    revisionInstructions: string;
    contentType: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'email' | 'sms' | 'staticAd' | 'socialCaption' | 'retention' | 'storySequence';
    context?: {
      transcription?: string;
      customBrief?: string;
      persona?: string;
      targetAudience?: string;
      brandDrBalance?: number;
      selectedProduct?: string;
      selectedProducts?: string[];
      field?: string;
      customRequest?: string;
      useJonesBrandGuide?: boolean;
    };
  }

  export interface BriefRequest {
  notes: string;
  googleDriveLinks?: string[];
  selectedProduct?: string;
  selectedProducts?: string[];
  persona?: string;
  brandDrBalance?: number;
  useJonesBrandGuide?: boolean;
  metadata?: GenerationMetadata;
}