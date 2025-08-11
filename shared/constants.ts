// Model defaults
export const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
export const FALLBACK_MODEL_STR = "claude-3-sonnet-20240229";
export const DEFAULT_MAX_TOKENS = 2000;
export const DEFAULT_TEMPERATURE = 0.7;

// Brand name
export const BRAND_NAME = 'Jones Road Beauty';

// Server defaults
export const DEFAULT_SERVER_PORT = 5000;
export const DEFAULT_IMAGE_ANALYSIS_TYPE = 'ad_creative';

// Server limits
export const DEFAULT_BODY_SIZE_LIMIT = '50mb';


// Media defaults
export const DEFAULT_IMAGE_MEDIA_TYPE = "image/jpeg";
export const IMAGE_MAX_DIMENSION = 8000;
export const IMAGE_MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB

// Application defaults
export const DEFAULT_BRAND_DR_BALANCE = 50;
export const DEFAULT_USE_JONES_BRAND_GUIDE = true;
export const DEFAULT_PERSONA_KEY = 'lifeJuggler';

// Copy/Parsing defaults
export const DEFAULT_HEADLINE_FRAMEWORK = 'GENERAL';

// Product defaults
export const TOP_PRODUCTS = [
  'miracle-balm',
  'what-the-foundation',
  'the-mascara',
  'just-enough-tinted-moisturizer',
  'everyday-sunscreen-broad-spectrum-spf-30',
];

// Social/Story defaults
export const DEFAULT_CONTENT_TYPE = 'video';
export const DEFAULT_SOCIAL_PLATFORM = 'instagram';
export const DEFAULT_SOCIAL_GOAL = 'product-education';
export const DEFAULT_TONE = 'authentic-personal';
export const DEFAULT_VARIATIONS = 3;
export const DEFAULT_SEQUENCE_TYPE = 'product-showcase';
export const DEFAULT_STORY_LENGTH = 5;

// Retention defaults
export const DEFAULT_RETENTION_PLATFORM = 'Email';
export const DEFAULT_RETENTION_EMAIL_TYPE = 'Product Spotlight / Hero Product';
export const DEFAULT_RETENTION_AUDIENCE = 'General audience';
export const DEFAULT_RETENTION_GOAL = 'Drive Sales';

// UI/feature defaults
export const DEFAULT_LANDING_PAGE_TYPE = 'listicle';
export const DEFAULT_VOICE_ANALYSIS_METHOD = 'combined';

// Static labels and maps used in content/context builders
export const IMAGE_ANALYSIS_INSTRUCTIONS: Record<'ad_creative' | 'product_photo' | 'social_content', string> = {
  ad_creative: 'Analyze the ad creative to extract key visual elements, text overlay, color scheme, brand elements, and overall messaging strategy.',
  product_photo: 'Analyze the product image to identify key features, benefits, and visual selling points.',
  social_content: 'Analyze the social media content to understand the style, tone, and engagement elements.'
};

export const TRANSCRIPTION_LABELS: Record<'video' | 'audio' | 'ugc' | 'testimonial', string> = {
  video: 'VIDEO TRANSCRIPTION',
  audio: 'AUDIO TRANSCRIPTION',
  ugc: 'USER-GENERATED CONTENT',
  testimonial: 'CUSTOMER TESTIMONIAL'
};

export const SEASONAL_THEMES: Record<'spring' | 'summer' | 'fall' | 'winter', string> = {
  spring: 'renewal, fresh starts, lighter products, outdoor activities',
  summer: 'vacation, sun protection, bold colors, outdoor events',
  fall: 'back-to-school, cozy themes, rich colors, preparation',
  winter: 'holidays, gifts, comfort, indoor activities'
};

export const TIMING_GUIDANCE: Record<'urgent' | 'planned' | 'evergreen', string> = {
  urgent: 'Create urgency with limited-time offers and immediate action',
  planned: 'Build anticipation and provide detailed information for consideration',
  evergreen: 'Focus on timeless benefits and long-term value propositions'
};




// Context composition defaults
export const DEFAULT_APPEND_SECTIONS_BY_DEFAULT = false;
export const DEFAULT_AUTO_APPEND_OUTPUT_INSTRUCTIONS = true;

// Parsing and prompt-size estimates
export const DEFAULT_MAX_HEADLINES = 5;
export const LANDING_PAGE_TEXT_CHAR_LIMIT = 2000;
export const CHARACTERS_PER_TOKEN_ESTIMATE = 4; // Rough heuristic used when estimating tokens from string length

// Station configuration and output formatting
export const STATION_CONFIGS = {
  adCopy: {
    name: 'Ad Copy Generation',
    requiredSections: ['targetPersona', 'selectedProducts', 'copyFrameworks'],
    optionalSections: ['imageAnalysis', 'customBrief'],
    outputFormat: 'ad_copy_json',
    maxTokens: 2000
  },
  landingPage: {
    name: 'Landing Page Copy',
    requiredSections: ['targetPersona', 'selectedProducts', 'landingPageFrameworks'],
    optionalSections: ['transcription', 'mainAngle', 'productBrief'],
    outputFormat: 'structured_sections',
    maxTokens: 2048
  },
  customRequest: {
    name: 'Custom Copy Request',
    requiredSections: ['targetPersona', 'selectedProducts'],
    optionalSections: ['brandBalance'],
    outputFormat: 'flexible',
    maxTokens: 2048
  },
  email: {
    name: 'Email Retention',
    requiredSections: ['targetPersona', 'emailFrameworks'],
    optionalSections: ['selectedProducts', 'retentionBestPractices'],
    outputFormat: 'email_structure',
    maxTokens: 1500
  },
  sms: {
    name: 'SMS Retention',
    requiredSections: ['targetPersona'],
    optionalSections: ['selectedProducts', 'retentionBestPractices'],
    outputFormat: 'sms_structure',
    maxTokens: 500
  },
  staticAd: {
    name: 'Static Ad Analysis',
    requiredSections: ['targetPersona', 'selectedProducts'],
    optionalSections: ['analysisGuidance'],
    outputFormat: 'analysis_json',
    maxTokens: 2000
  },
  productLaunch: {
    name: 'Product Launch Brief',
    requiredSections: ['selectedProducts'],
    optionalSections: ['briefStructure', 'competitiveAnalysis'],
    outputFormat: 'strategic_brief',
    maxTokens: 3000
  },
  socialCaptions: {
    name: 'Social Captions',
    requiredSections: ['targetPersona', 'selectedProducts'],
    optionalSections: ['platformGuidelines', 'toneGuidance'],
    outputFormat: 'social_captions',
    maxTokens: 1500
  },
  storySequences: {
    name: 'Story Sequence',
    requiredSections: ['targetPersona', 'selectedProducts'],
    optionalSections: ['sequenceGuidance', 'visualDirection'],
    outputFormat: 'story_sequence_json',
    maxTokens: 2000
  },
  
} as const;

export const OUTPUT_FORMAT_INSTRUCTIONS: Record<string, string> = {
  ad_copy_json: `
# Output Format:
Return ONLY valid JSON with this exact structure. Do NOT include any additional text, explanations, code fences, or backticks.
{
  "headlines": [
       {"framework": "BENEFIT DRIVEN", "copy": "Your headline text here”},
   {"framework": "SOCIAL PROOF", "copy": "Your headline text here”},
 {"framework": "OFFER DRIVEN", "copy": "Your headline text here”},
 {"framework": "VALUE PROPS", "copy": "Your headline text here”},
 {"framework": "PROBLEM FOCUSED", "copy": "Your headline text here”},
  ],
  "primaryText": "Primary text content"
}`,
  email_structure: `
# Output Format:
Return ONLY valid JSON with this exact structure. Do NOT include any additional text, explanations, code fences, or backticks.
{
  "subjectLine": "Email subject line",
  "preheader": "Preview text",
  "content": "Email body content",
  "cta": "Call to action text"
}`,
  sms_structure: `
# Output Format:
Return ONLY the SMS message as a raw string. Do NOT include any additional text, explanations, code fences, or backticks.`,
  social_captions: `
# Output Format:
{
  "captions": [
    "Caption text #one #two",
    "Another caption #tag"
  ]
}`,
  story_sequence_json: `
# Output Format:
Return ONLY valid JSON as a JSON array. Do NOT include any additional text, explanations, code fences, or backticks.
[
  {
    "slide": 1,
    "type": "hook/tutorial/etc",
    "title": "Slide title",
    "content": "Main content",
    "visualDirection": "Visual instructions"
  }
]`,
  flexible: `
# Output Format:
Provide clean, well-structured text that matches the user's request format.
Use simple formatting: numbered lists (1. 2. 3.) and bullet points (-) only.
Avoid markdown symbols like *, #, [], etc.`
};

// Quality guidelines
export const QUALITY_GUIDELINES_BASE: string[] = [
  '# Quality Standards:',
  '- Maintain brand voice consistency throughout',
  '- Ensure all claims are accurate and supportable',
  '- Use clear, compelling language that drives action',
  '- Optimize for the target audience and platform',
  '- Follow all regulatory and compliance requirements'
];

export const QUALITY_GUIDELINES_BY_STATION: Record<string, string[]> = {
  adCopy: [
    '- Headlines must be attention-grabbing and benefit-focused',
    '- Primary text should build desire and urgency',
    '- Include clear calls-to-action',
    '- Balance brand storytelling with direct response elements'
  ],
  email: [
    '- Subject lines must drive open rates',
    '- Content should re-engage inactive customers',
    '- Include personalization where possible',
    '- Provide clear value proposition for return'
  ],
  sms: [
    '- Message must be concise and under 160 characters',
    '- Content should be direct and have a clear call-to-action',
    '- Use a friendly and approachable tone'
  ],
  landingPage: [
    '- Headlines should match ad messaging',
    '- Structure content for easy scanning',
    '- Include social proof and risk reversal',
    '- Optimize for conversion and user experience'
  ]
};

// Mapping of component output keys used in templates to their semantic meaning
// Use with: {{ components.<key> }} inside prompt templates
export const COMPONENT_KEY_MAP = {
  // Persona and products
  selectedProducts: 'Selected products details and claims for chosen products',
  selectedPersona: 'Selected target persona (and subpersona) with pillars and requirements',
  allProducts: 'Claims overview for all products in the catalog',
  allPersonas: 'Overview of all configured target personas and subpersonas',

  // Ad copy frameworks
  metaAdCopyFrameworks: 'Guidance for all meta ad copy headline frameworks',
  selectedMetaAdCopyFrameworks: 'Guidance for selected meta ad copy headline frameworks',

  // Landing page frameworks
  landingPageFrameworks: 'Guidance for all landing page frameworks (optionally filtered by landing page type)',
  selectedLandingPageFrameworks: 'Guidance for selected landing page frameworks',

  // Email frameworks
  emailFrameworks: 'Guidance for all email frameworks',
  selectedEmailFrameworks: 'Guidance for selected email frameworks',

  // SMS frameworks
  smsFrameworks: 'Guidance for all SMS frameworks',
  selectedSmsFrameworks: 'Guidance for selected SMS frameworks',

  // Brand settings and guidelines
  allBrandSettingsContext: 'Comprehensive brand settings context including brand guidelines, product claims, persona pillars, and DR balance',
  brandGuidelines: `${BRAND_NAME} brand guidelines`,
  productClaims: 'Claims for a specific selected product',
  multiProductClaims: 'Claims for multiple selected products',
  personaPillars: 'Pillars for a specific persona',
  brandDrBalance: 'Brand vs Direct Response balance guidance',
  brandFirstGuidelines: 'Brand-first guidelines list',
  directResponseGuidelines: 'Direct response guidelines list',

} as const;
