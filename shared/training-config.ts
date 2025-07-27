// Training configuration for Claude AI copywriting prompts
// This file contains all the brand guidelines, frameworks, and prompts used to train the AI

export interface TrainingConfig {
  brandGuidelines: {
    corePositioning: string;
    brandVoice: string[];
    keyTerminology: string[];
    approvedLanguage: string[];
    avoidedLanguage: string[];
    // Toggle states for individual items
    enabledBrandVoice?: boolean[];
    enabledKeyTerminology?: boolean[];
    enabledApprovedLanguage?: boolean[];
    enabledAvoidedLanguage?: boolean[];
  };
  personaPillars: {
    [personaName: string]: {
      description?: string;
      pillars: string[];
      enabledPillars?: boolean[];
    };
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
  personaPillars: {
    "Mom": {
      pillars: [
        "Lack of time - Quick, efficient beauty routines",
        "Versatility - Products that work for multiple looks/occasions", 
        "Clean ingredients - Safe, gentle formulas for sensitive skin",
        "Compliments/confidence - Looking put-together effortlessly",
        "Practical application - Easy to apply, mistake-proof",
        "Long-lasting wear - No touch-ups needed during busy days"
      ]
    },
    "Professional Woman": {
      pillars: [
        "Time efficiency - Fast morning routine",
        "All-day wear - Looks fresh from morning to evening",
        "Professional appearance - Polished, appropriate look",
        "Confidence boost - Feeling put-together and capable",
        "Travel-friendly - Easy to touch up or reapply",
        "Versatile coverage - Day to night transition"
      ]
    },
    "Beauty Enthusiast": {
      pillars: [
        "Ingredient quality - Clean, premium formulations",
        "Innovative features - Cutting-edge beauty technology",
        "Shade range - Inclusive, diverse color options",
        "Application technique - Professional-level results",
        "Brand reputation - Trusted by makeup artists",
        "Skincare benefits - Makeup that improves skin over time"
      ]
    },
    "Minimalist": {
      pillars: [
        "Multi-purpose products - One product, multiple benefits",
        "Effortless application - Natural, easy-to-achieve looks",
        "Clean formulation - Simple, effective ingredients",
        "Sustainable packaging - Eco-conscious choices",
        "Timeless appeal - Classic, never-goes-out-of-style",
        "Low maintenance - Set it and forget it beauty"
      ]
    }
  },
  copyFrameworks: {
    headlineFrameworks: [
      {
        name: "BENEFIT DRIVEN",
        description: "Lead with the primary benefit/transformation the product delivers",
        template: "[Primary Benefit] + [Specific Outcome] + [Qualifier]",
        examples: [
          "Finally, A Foundation That Actually Looks Like Your Skin",
          "The 5-Minute Face That Lasts Through Your Entire Day",
          "Skincare and Makeup in One Effortless Step"
        ]
      },
      {
        name: "SOCIAL PROOF",
        description: "Incorporate trust signals, reviews, or popularity metrics",
        template: "[Specific Number/Authority] + [Approval] + [Product Result]",
        examples: [
          "50,000+ Women Say This Foundation Changed Everything",
          "The Makeup Artist-Approved Secret for Perfect Skin",
          "Why Beauty Editors Call This The Holy Grail Foundation"
        ]
      },
      {
        name: "OFFER DRIVEN", 
        description: "Focus on a specific promotion, deal, or exclusive access",
        template: "[Specific Offer] + [Value Statement] + [Action Hook]",
        examples: [
          "Limited Edition Shade Now Available - Don't Miss Out",
          "Get 30% Off Your First Order Plus Free Shipping Today",
          "Exclusive Early Access For Our Newest Beauty Innovation"
        ]
      },
      {
        name: "VALUE PROPS",
        description: "Highlight unique product attributes or competitive advantages", 
        template: "[Unique Feature] + [Specific Benefit] + [Differentiation]",
        examples: [
          "The Only Foundation With Universal Shade Technology That Works",
          "12-Hour Comfortable Wear Without Any Touch-Ups Needed",
          "Cruelty-Free Formula That Actually Improves Your Skin Over Time"
        ]
      },
      {
        name: "PROBLEM FOCUSED",
        description: "Address a specific pain point your audience faces",
        template: "Stop [Specific Problem] + [Complete Solution]",
        examples: [
          "No More Foundation Lines That Show Every Wrinkle",
          "Stop Wasting Time on Makeup That Doesn't Last",
          "End the Search for Foundation That Actually Matches Your Skin"
        ]
      },
      {
        name: "URGENCY/SCARCITY",
        description: "Create time-sensitive or limited-availability motivation",
        template: "[Specific Urgency] + [Clear Action] + [Benefit]",
        examples: [
          "Back in Stock Alert: Your Favorite Shade Returns Today",
          "Only 48 Hours Left to Get This Exclusive Bundle Deal",
          "Last Chance: Free Gift With Purchase Ends Tonight"
        ]
      }
    ],
    primaryTextRules: [
      "Headlines: 8-15 words for stronger impact, up to 125 characters on Facebook",
      "Create complete thoughts and compelling statements, not just short phrases",
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
- Headlines: 8-15 words for maximum impact (up to 125 characters on Facebook)
- Create complete, compelling thoughts rather than short phrases
- Primary text: 15-25 words optimal
- Brand/DR Balance: {brandPercent}% brand voice, {drPercent}% direct response
- Target audience: {targetAudience}
- Persona: {concept}{subPersona}

PERSONA-SPECIFIC MESSAGING:
When creating headlines, focus on the core pillars for the selected persona. For Moms, prioritize: lack of time, versatility, clean ingredients, confidence/compliments. Headlines should address specific pain points and benefits relevant to that persona.

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
- Create complete compelling statements, not just short phrases
- Each headline should be 8-15 words for maximum impact
- Lead with a hook: Start with compelling promise that drives action
- Use sensory or outcome-oriented language
- Front-load differentiators early
- Examples: "Finally, A Foundation That Actually Looks Like Your Skin" vs "Natural Foundation"
- Focus on BENEFITS not features: "Skincare and Makeup in One Effortless Step" vs "Skincare Meets Makeup"
- Make headlines persona-specific: For Moms - "5-Minute Face That Lasts Through Soccer Practice"

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