export interface BaseTabProps {
  // Common props shared across all tab components
  persona?: string;
  setPersona?: (value: string) => void;
  selectedProduct?: string;
  selectedProducts?: string[];
  setSelectedProducts?: (value: string[]) => void;
  products?: Record<string, any>;
  brandDrBalance?: number[];
  setBrandDrBalance?: (value: number[]) => void;
  useJonesBrandGuide?: boolean;
  setUseJonesBrandGuide?: (value: boolean) => void;
  copyToClipboard?: (text: string, type: string) => Promise<void>;
}

export interface GenerationProps {
  // Props related to content generation
  getGenerationDisabledState?: (stationType: string) => { disabled: boolean; reason: string };
  generateMutation?: any;
  generatedContent?: string;
  setGeneratedContent?: (value: string) => void;
}

export interface DebugProps {
  // Props for debugging and generation details
  setCurrentGenerationMetadata?: (metadata: any) => void;
  setShowGenerationDetails?: (show: boolean) => void;
  debugInfo?: {
    systemPrompt: string;
    userPrompt: string;
    requestPayload: any;
    rawResponse: string;
  } | null;
}

export interface AISettingsProps {
  // Props for AI configuration
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stationPrompts?: Record<string, any>;
  brandGuidelines?: {
    guidelines?: string[];
  };
  copyFrameworks?: Record<string, any>;
}

export interface FormInputProps {
  // Props for form inputs
  transcription?: string;
  setTranscription?: (value: string) => void;
  customBrief?: string;
  setCustomBrief?: (value: string) => void;
  targetAudience?: string;
  setTargetAudience?: (value: string) => void;
  uploadedImage?: string;
  setUploadedImage?: (value: string) => void;
}

// Complete tab component props combining all interfaces
export interface TabComponentProps extends 
  BaseTabProps, 
  GenerationProps, 
  DebugProps, 
  AISettingsProps, 
  FormInputProps {
  // Any additional specific props can be added here
}

// Persona interface used across components
export interface Persona {
  label: string;
  value: string;
}

// Subpersona interface for optional persona subdivisions
export interface Subpersona {
  id: string;
  personaId: string;
  name: string;
  description?: string;
  isActive: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationMetadata {
  stationName: string;
  timestamp: string;
  modelUsed: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  userPrompt: string;
  requestPayload?: any;
  rawResponse?: string;
  brandGuidelines?: string[];
  frameworks?: string[];
  personaSettings?: {
    persona: string;
  };
  productClaims?: {
    approved: string[];
    prohibited: string[];
  };
  brandDrBalance?: number;
  selectedProduct?: string;
  settingsVersion?: string;
}

// Common error response interface
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
}

// Common success response interface
export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}