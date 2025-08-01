// Training configuration for Claude AI copywriting prompts
// This file contains all the brand guidelines, frameworks, and prompts used to train the AI

export interface TrainingConfig {
  brandGuidelines: {
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

