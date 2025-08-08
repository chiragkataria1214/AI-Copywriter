// Shared constants across the application

// Model defaults
export const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
export const FALLBACK_MODEL_STR = "claude-3-sonnet-20240229";
export const DEFAULT_MAX_TOKENS = 2000;
export const DEFAULT_TEMPERATURE = 0.7;

// Server defaults
export const DEFAULT_SERVER_PORT = 5000;

// Media defaults
export const DEFAULT_IMAGE_MEDIA_TYPE = "image/jpeg";
export const IMAGE_MAX_DIMENSION = 8000;
export const IMAGE_MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB

// Application defaults
export const DEFAULT_BRAND_DR_BALANCE = 50;
export const DEFAULT_USE_JONES_BRAND_GUIDE = true;
export const DEFAULT_PERSONA_KEY = 'lifeJuggler';

// Context composition defaults
export const DEFAULT_APPEND_SECTIONS_BY_DEFAULT = false;
export const DEFAULT_AUTO_APPEND_OUTPUT_INSTRUCTIONS = true;

// Parsing and prompt-size estimates
export const DEFAULT_MAX_HEADLINES = 5;
export const LANDING_PAGE_TEXT_CHAR_LIMIT = 2000;
export const CHARACTERS_PER_TOKEN_ESTIMATE = 4; // Rough heuristic used when estimating tokens from string length

// Copy/Parsing defaults
export const DEFAULT_HEADLINE_FRAMEWORK = 'GENERAL';

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

// Station configuration and output formatting
export const STATION_CONFIGS = {
  adCopy: {
    name: 'Ad Copy Generation',
    requiredSections: ['targetPersona', 'selectedProducts', 'copyFrameworks'],
    optionalSections: ['landingPageContext', 'imageAnalysis', 'customBrief'],
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
  emailSmsRetention: {
    name: 'Email/SMS Retention',
    requiredSections: ['targetPersona', 'emailFrameworks'],
    optionalSections: ['selectedProducts', 'retentionBestPractices'],
    outputFormat: 'email_structure',
    maxTokens: 1500
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
  organicSocial: {
    name: 'Organic Social Content',
    requiredSections: ['targetPersona', 'selectedProducts'],
    optionalSections: ['platformGuidelines', 'toneGuidance'],
    outputFormat: 'social_captions',
    maxTokens: 1500
  },
  storySequence: {
    name: 'Story Sequence',
    requiredSections: ['targetPersona', 'selectedProducts'],
    optionalSections: ['sequenceGuidance', 'visualDirection'],
    outputFormat: 'story_sequence_json',
    maxTokens: 2000
  }
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
  social_captions: `
# Output Format:
Return ONLY valid JSON as a JSON array. Do NOT include any additional text, explanations, code fences, or backticks.
[
  {
    "platform": "PLATFORM_NAME",
    "caption": "Caption text",
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
]`,
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
  emailSmsRetention: [
    '- Subject lines must drive open rates',
    '- Content should re-engage inactive customers',
    '- Include personalization where possible',
    '- Provide clear value proposition for return'
  ],
  landingPage: [
    '- Headlines should match ad messaging',
    '- Structure content for easy scanning',
    '- Include social proof and risk reversal',
    '- Optimize for conversion and user experience'
  ]
};

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

// Server limits
export const DEFAULT_BODY_SIZE_LIMIT = '50mb';