// Training configuration for Claude AI copywriting prompts
// This file contains all the brand guidelines, frameworks, and prompts used to train the AI

export interface TrainingConfig {
  brandGuidelines: {
    corePositioning: string;
    brandVoice: string[];
    keyTerminology: string[];
    approvedLanguage: string[];
    avoidedLanguage: string[];
  };
  copyFrameworks: {
    headlineFrameworks: Array<{
      name: string;
      description: string;
      template: string;
      examples: string[];
    }>;
    primaryTextRules: string[];
    brandDrBalance: {
      brandFirst: string[];
      directResponse: string[];
    };
  };
  systemPrompts: {
    adCopyGeneration: string;
    landingPageGeneration: string;
  };
  userPromptTemplates: {
    adCopy: string;
    landingPage: string;
  };
  modelParameters: {
    model: string;
    maxTokens: number;
    temperature?: number;
  };
}

export const defaultTrainingConfig: TrainingConfig = {
  brandGuidelines: {
    corePositioning: "Your Skin But Better - natural, effortless enhancement that melts into skin rather than sitting on top like a mask",
    brandVoice: [
      "Natural, welcoming, never pushy or aggressive",
      "Focus on enhancement not transformation",
      "Use inclusive, welcoming language", 
      "Avoid superlatives and exaggerated claims",
      "Speak to the authentic self, not aspirational perfection"
    ],
    keyTerminology: [
      "no-makeup makeup",
      "Your Skin But Better", 
      "one and done",
      "universal shades",
      "skin-nourishing oils"
    ],
    approvedLanguage: [
      "skin-nourishing oils",
      "subtle radiance", 
      "creamy",
      "glow",
      "effortless",
      "natural",
      "barely there",
      "enhanced you",
      "moisturizing"
    ],
    avoidedLanguage: [
      "hydrating (use moisturizing instead)",
      "dramatic transformation",
      "flawless perfection",
      "aggressive claims",
      "pushy language"
    ]
  },
  copyFrameworks: {
    headlineFrameworks: [
      {
        name: "BENEFIT DRIVEN",
        description: "Lead with the primary benefit/transformation the product delivers",
        template: "[Primary Benefit] + [Outcome]",
        examples: ["Natural Glow Simplified", "Effortless Beauty Found", "Your Skin But Better"]
      },
      {
        name: "SOCIAL PROOF",
        description: "Incorporate trust signals, reviews, or popularity metrics",
        template: "[Number/Authority] + [Approval] + [Product]",
        examples: ["Loved by 50,000+ Women", "Artist-Approved Formula", "5-Star Foundation"]
      },
      {
        name: "OFFER DRIVEN", 
        description: "Focus on a specific promotion, deal, or exclusive access",
        template: "[Offer Type] + [Value] + [Urgency]",
        examples: ["Limited Edition Drop", "Exclusive Early Access", "Bundle & Save 30%"]
      },
      {
        name: "VALUE PROPS",
        description: "Highlight unique product attributes or competitive advantages", 
        template: "[Unique Feature] + [Benefit]",
        examples: ["Universal Shade Technology", "12-Hour Comfortable Wear", "Cruelty-Free Formula"]
      },
      {
        name: "PROBLEM FOCUSED",
        description: "Address a specific pain point your audience faces",
        template: "No More [Problem] + [Solution]",
        examples: ["No More Cakey Foundation", "Skip the 10-Step Routine", "End Foundation Oxidation"]
      },
      {
        name: "URGENCY/SCARCITY",
        description: "Create time-sensitive or limited-availability motivation",
        template: "[Limited Factor] + [Action Required]",
        examples: ["Back in Stock Alert", "Limited Quantities Left", "Today Only Special"]
      }
    ],
    primaryTextRules: [
      "Headlines: Maximum 5 words, must fit in 1 line on mobile",
      "Primary text: 15-25 words optimal for Meta ads",
      "Keep sentences to 8-12 words for mobile comprehension",
      "Front-load differentiators (cruelty-free, talc-free, SPF) early",
      "Use sensory or outcome-oriented language",
      "Single CTA: Always end with one clear action"
    ],
    brandDrBalance: {
      brandFirst: [
        "Lead with natural, effortless messaging",
        "Use approved Jones Road language",
        "Social proof should feel natural and brand-aligned",
        "Avoid aggressive or pushy tactics",
        "Focus on enhancement over transformation"
      ],
      directResponse: [
        "Focus on specific benefits and outcomes", 
        "Include stronger calls to action",
        "Use urgency/scarcity framework when appropriate",
        "Emphasize concrete results and proof points",
        "Maintain brand voice even with urgency"
      ]
    }
  },
  systemPrompts: {
    adCopyGeneration: `You are an expert Meta ad copywriter specializing in Jones Road Beauty. You create ad copy that balances brand voice with direct response tactics.

JONES ROAD BEAUTY BRAND GUIDELINES:
- Core positioning: "Your Skin But Better" - natural, effortless enhancement
- Brand voice: Natural, welcoming, never pushy or aggressive
- Key concepts: "no-makeup makeup", "one and done", "universal shades"
- Always use "moisturizing" not "hydrating" for makeup products
- Focus on enhancement, not transformation
- Avoid superlatives and exaggerated claims

COPY REQUIREMENTS:
- Headlines: Maximum 5 words, must fit in 1 line on mobile
- Primary text: 15-25 words optimal
- Brand/DR Balance: {brandPercent}% brand voice, {drPercent}% direct response
- Target audience: {targetAudience}
- Persona: {concept}{subPersona}

BRAND-FIRST APPROACH (when brand % > 50):
- Lead with natural, effortless messaging
- Use approved language: "skin-nourishing oils", "subtle radiance", "creamy", "glow", "effortless", "natural", "barely there"
- Social proof should feel natural and brand-aligned

DIRECT RESPONSE APPROACH (when DR % > 50):
- Focus on specific benefits and outcomes
- Include stronger calls to action
- Use urgency/scarcity framework when strategically appropriate
- Maintain brand voice even with urgency - avoid aggressive or pushy language`,

    landingPageGeneration: `You are an expert landing page copywriter specializing in Jones Road Beauty. Create compelling landing page copy that converts while maintaining brand authenticity.

Follow the strategic frameworks and maintain Jones Road's natural, welcoming brand voice throughout all copy elements.`
  },
  userPromptTemplates: {
    adCopy: `Generate Meta ad copy based on this content:

TRANSCRIPTION/CONTENT:
{transcription}

{landingPageContext}

COPYWRITING FRAMEWORK REQUIREMENTS:
Generate exactly 5 headlines using these specific frameworks (select the 5 most appropriate):

1. BENEFIT DRIVEN: Lead with the primary benefit/transformation the product delivers
2. SOCIAL PROOF DRIVEN: Incorporate trust signals, reviews, or popularity metrics  
3. OFFER DRIVEN: Focus on a specific promotion, deal, or exclusive access
4. VALUE PROPS: Highlight unique product attributes or competitive advantages
5. PROBLEM FOCUSED: Address a specific pain point your audience faces
6. URGENCY/SCARCITY: Create time-sensitive or limited-availability motivation

FRAMEWORK PRINCIPLES:
- Lead with a hook: Start with concise, memorable phrase that distills core promise
- Use sensory or outcome-oriented language
- Keep sentences to 8-12 words for mobile comprehension
- Front-load differentiators early

FORMAT YOUR RESPONSE AS JSON:
{
  "headlines": [
    {"framework": "BENEFIT DRIVEN", "copy": "Natural Glow Simplified"},
    {"framework": "SOCIAL PROOF", "copy": "Loved by 50,000+ Women"},
    // ... 3 more headlines
  ],
  "primaryText": "What The Foundation is unlike any foundation you've ever tried..."
}`,

    landingPage: `Generate landing page copy for Jones Road Beauty based on the following:

CONTENT TYPE: {landingPageType}
PRODUCT BRIEF: {productBrief}
TARGET PERSONA: {concept} ({subPersona})
BRAND/DR BALANCE: {brandPercent}% brand, {drPercent}% direct response

{adsContentSection}

Follow Jones Road's brand guidelines and create compelling copy that converts while maintaining authenticity.`
  },
  modelParameters: {
    model: "claude-sonnet-4-20250514",
    maxTokens: 1024,
    temperature: undefined
  }
};