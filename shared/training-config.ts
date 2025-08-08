// Training configuration for Claude AI copywriting prompts
// This file contains all the brand guidelines, frameworks, and prompts used to train the AI

export interface TrainingConfig {
  brandGuidelines: {
    // Basic brand identity
    brandName?: string;
    website?: string;

    corePositioning: string;
    brandVoice: string[];
    keyTerminology: string[];
    approvedLanguage: string[];
    avoidedLanguage: string[];
    enabledBrandVoice?: boolean[];
    enabledKeyTerminology?: boolean[];
    enabledApprovedLanguage?: boolean[];
    enabledAvoidedLanguage?: boolean[];
  };
  productClaims: {
    [productName: string]: {
      displayName?: string;
      approvedClaims: string[];
      prohibitedClaims: string[];
      enabledApproved?: boolean[];
      enabledProhibited?: boolean[];
    };
  };
  personaPillars: {
    [personaName: string]: {
      pillars: string[];
      description?: string;
      enabledPillars?: boolean[];
      subpersonas?: {
        [subpersonaName: string]: {
          id?: string;
          description?: string;
          pillars?: string[];
          enabledPillars?: boolean[];
        };
      };
    };
  };
  copyFrameworks: {
    headlineFrameworks: Array<{
      name: string;
      description: string;
      template: string;
      examples: string[];
      isEnabled?: boolean;
    }>;
    emailFrameworks?: Array<{
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
      isEnabled?: boolean;
      sortOrder: number;
    }>;
    smsFrameworks?: Array<{
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
      isEnabled?: boolean;
      sortOrder: number;
    }>;
    landingPageFrameworks?: Array<{
      name: string;
      displayName: string;
      description: string;
      contentSequence: string[];
      reasonStructure: string[];
      optimizationRules: string[];
      realExamples: string[];
      systemPrompt: string;
      outputRequirements: string;
      images?: any[];
      isEnabled?: boolean;
      sortOrder: number;
    }>;
    primaryTextRules: string[];
    brandDrBalance: {
      brandFirst: string[];
      directResponse: string[];
    };
    enabledPrimaryTextRules?: boolean[];
    listicleFramework?: {
      contentSequence: string[];
      reasonStructure: string[];
      optimizationRules: string[];
      realExamples: string[];
    };
  };
  stationPrompts: {
    [stationName: string]: {
      systemPrompt: string;
      userPromptTemplate: string;
      selectedHeadlineFramework?: string;
      copyWritingRules?: string[];
      contentStructureRules?: string[];
      conversionGuidelines?: string[];
      enabledConversionGuidelines?: boolean[];
      ctaGuidelines?: string[];
      imageTextBalanceRules?: string[];
      platformGuidelines?: string[];
      subjectLineFrameworks?: string[];
      enabledSubjectLineFrameworks?: boolean[];
      retentionBestPractices?: string[];
      requestTypeGuidelines?: string[];
      // Social Captions Station properties
      hashtagStrategy?: string[];
      engagementTactics?: string[];
      // Story Sequences Station properties
      storyStructureGuidelines?: string[];
      sequenceTiming?: string[];
      narrativeTechniques?: string[];
      // Product Launch Station properties
      briefStructure?: string;
      
      // NEW: Enhanced context configuration
      contextConfiguration?: {
        // Available variables for templates
        availableVariables?: VariableDefinition[];
        
        // Context sections configuration
        contextSections?: ContextSectionConfig[];
        
        // Context building rules
        contextRules?: ContextBuildingRules;
        
        // AI Settings context customization
        aiSettingsContext?: AISettingsContextConfig;
        
        // Brand Guidelines configuration
        brandGuidelinesConfig?: BrandGuidelinesConfig[];
      };
    };
  };
  modelParameters: {
    model: string;
    maxTokens: number;
    temperature?: number;
  };
  systemPrompts: {
    adCopyGeneration: string;
    landingPageGeneration: string;
  };
  userPromptTemplates: {
    adCopy: string;
    landingPage: string;
  };
  emailTemplates?: {
    [key: string]: string[];
  };
}

// Enhanced context configuration interfaces
export interface VariableDefinition {
  key: string;
  label: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  category: 'user_input' | 'system_generated' | 'context_section' | 'ai_settings' | 'brand_guideline';
  required?: boolean;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface ContextSectionConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  order: number;
  
  // Section template - fully customizable
  template: string;
  
  // Conditional inclusion logic
  conditions: {
    requiredVariables?: string[];
    excludeWhen?: string[];
    customLogic?: string; // JavaScript expression
  };
  
  // Section-specific formatting
  formatting: {
    headerStyle: 'uppercase' | 'title' | 'none';
    bulletStyle: '•' | '-' | '→' | 'numbered';
    indentation: number;
    spacing: 'compact' | 'normal' | 'spacious';
  };
  
  // Data source configuration
  dataSource: {
    type: 'static' | 'function' | 'database' | 'api';
    source: string; // Function name, DB query, API endpoint
    parameters?: Record<string, any>;
  };
}

export interface ContextBuildingRules {
  // Global rules for context building
  maxTotalTokens?: number;
  prioritization: 'order' | 'relevance' | 'custom';
  
  // Whether to auto-append built context sections/output when not referenced in template
  // Defaults to false (template-driven only)
  appendSectionsByDefault?: boolean;
  autoAppendOutputInstructions?: boolean;
  
  // Section ordering rules
  sectionOrder: {
    fixed: string[]; // Sections that must be in specific order
    flexible: string[]; // Sections that can be reordered
    priority: Record<string, number>; // Priority scores for sections
  };
  
  // Conditional logic
  conditionalRules: {
    [sectionId: string]: {
      showWhen?: string; // JavaScript expression
      hideWhen?: string; // JavaScript expression
      requiredVariables?: string[];
    };
  };
  
  // Token management
  tokenManagement: {
    enabled: boolean;
    budgetPerSection?: Record<string, number>;
    truncationStrategy: 'end' | 'middle' | 'smart';
  };
}

export interface AISettingsContextConfig {
  // Customize which AI settings components to include
  components: {
    brandGuidelines: {
      enabled: boolean;
      template?: string;
      includeFields: ('corePositioning' | 'brandVoice' | 'keyTerminology' | 'approvedLanguage' | 'avoidedLanguage')[];
    };
    productClaims: {
      enabled: boolean;
      template?: string;
      showApproved: boolean;
      showProhibited: boolean;
    };
    personaPillars: {
      enabled: boolean;
      template?: string;
      includeDescription: boolean;
      includePillars: boolean;
    };
    brandDrBalance: {
      enabled: boolean;
      template?: string;
      customRanges?: {
        brandFirst: { min: number; max: number; template: string };
        balanced: { min: number; max: number; template: string };
        drFirst: { min: number; max: number; template: string };
      };
    };
  };
  
  // Custom AI settings sections
  customSections: {
    [sectionName: string]: {
      enabled: boolean;
      template: string;
      dataSource: string;
      order: number;
    };
  };
}

export interface BrandGuidelinesConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  order: number;
  
  // Brand guideline template
  template: string;
  
  // Which brand guideline types to include
  includeTypes: {
    corePositioning: boolean;
    brandVoice: boolean;
    keyTerminology: boolean;
    approvedLanguage: boolean;
    avoidedLanguage: boolean;
  };
  
  // Custom formatting for this station
  formatting: {
    headerStyle: 'uppercase' | 'title' | 'none';
    bulletStyle: '•' | '-' | '→' | 'numbered';
    indentation: number;
    spacing: 'compact' | 'normal' | 'spacious';
    includeHeaders: boolean;
  };
  
  // Conditional inclusion logic
  conditions: {
    requiredVariables?: string[];
    excludeWhen?: string[];
    customLogic?: string;
  };
}

