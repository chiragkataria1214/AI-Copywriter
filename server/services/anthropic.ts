import Anthropic from '@anthropic-ai/sdk';
import { type TrainingConfig } from '@shared/training-config';
import {
  detectImageType,
  resizeImageIfNeeded,
  buildTargetPersonaSection,
  buildSelectedProductsSection,
  buildAISettingsContext,
  buildLandingPageContext,
  buildCopyFrameworksSection,
  buildLandingPageFrameworksSection,
  buildCustomBriefSection,
  processImageForAnthropic,
  AIResponseParser,
  AIPromptBuilder,
  StationPromptManager,
  ContentContextBuilder
} from './anthropic-helpers';

import { DEFAULT_MODEL_STR } from '@shared/constants';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});
// Generation metadata interface for debugging/transparency
export interface GenerationMetadata {
  stationName: string;
  timestamp: string;
  modelUsed: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  userPrompt: string;
  brandGuidelines?: string[];
  frameworks?: string[];
  personaSettings?: {
    concept: string;
  };
  productClaims?: {
    approved: string[];
    prohibited: string[];
  };
  brandDrBalance?: number;
  selectedProduct?: string;
  settingsVersion?: string;
}

export interface AdCopyRequest {
  transcription: string;
  customBrief?: string;
  concept: string;
  targetAudience: string;
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
  concept: string;
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
  concept: string;
  brandDrBalance: number;
  selectedProduct?: string;
  selectedProducts?: string[];
  useJonesBrandGuide: boolean;
}

export interface StaticAdAnalysisRequest {
  staticAdImage: string;
  concept: string;
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
  contentType: 'headline' | 'primaryText' | 'landingCopy' | 'custom' | 'retention';
  context?: {
    transcription?: string;
    customBrief?: string;
    concept?: string;
    targetAudience?: string;
    brandDrBalance?: number;
    selectedProduct?: string;
    selectedProducts?: string[];
    field?: string;
    customRequest?: string;
    useJonesBrandGuide?: boolean;
  };
}

export async function reviseContent(request: RevisionRequest, trainingConfig: TrainingConfig): Promise<string> {
  const { originalContent, revisionInstructions, contentType, context } = request;
  
  // Map content types to station names for getting the appropriate system prompt
  const contentTypeToStation: Record<string, string> = {
    'headline': 'adCopy',
    'primaryText': 'adCopy', 
    'landingCopy': 'landingPage',
    'custom': 'customRequest',
    'retention': 'emailSmsRetention'
  };
  
  const stationName = contentTypeToStation[contentType] || 'customRequest';
  
  // Get station-specific system prompt from training config
  const baseSystemPrompt = trainingConfig?.stationPrompts?.[stationName]?.systemPrompt;
  
  // Build AI Settings context using the helper function
  const aiSettingsContext = buildAISettingsContext(trainingConfig, {
    concept: context?.concept || '',
    selectedProduct: context?.selectedProduct,
    selectedProducts: context?.selectedProducts,
    brandDrBalance: context?.brandDrBalance || 50,
    useJonesBrandGuide: context?.useJonesBrandGuide !== false // Default to true
  });

  // Create revision-specific system prompt
  let systemPrompt = '';
  
  if (baseSystemPrompt) {
    // Use station-specific prompt as base and add revision context
    systemPrompt = `You are an expert copywriter specializing in improving content. You will be revising ${contentType} copy based on specific improvement instructions.

${baseSystemPrompt}

${aiSettingsContext}

REVISION TASK:
Your task is to revise ${contentType} copy based on specific improvement instructions while maintaining the brand voice and style established above.

${contentType === 'custom' ? `
SPECIAL NOTES FOR CUSTOM COPY REVISION:
- This could be any format: social media, email, brief, announcement, etc.
- Maintain the original format and structure unless specifically asked to change it
- Focus on the specific improvements requested while keeping the established brand voice
- Be adaptable to any copywriting format or purpose
- Use clean, plain text formatting without special characters like asterisks, hashtags, or markdown
- Output should be clean and readable without formatting symbols
` : ''}

${contentType === 'retention' ? `
SPECIAL NOTES FOR RETENTION COPY REVISION:
- This is ${context?.field === 'retention' ? 'email/SMS retention copy' : 'retention marketing content'}
- Maintain platform-appropriate length and formatting (Email vs SMS)
- Focus on customer retention and engagement principles
- Use personalized, relationship-building language appropriate for existing customers
- Balance promotional content with value-driven messaging
- Include relevant product mentions if specific products were selected
- Ensure mobile-friendly formatting for both email and SMS
- Use clean, plain text formatting without markdown or special characters
${context?.selectedProducts && context.selectedProducts.length > 0 ? `
- Feature these selected products appropriately: ${context.selectedProducts.join(', ')}
` : ''}
` : ''}

REVISION PRINCIPLES:
- Keep the core message and structure intact (unless explicitly asked to change)
- Apply the requested improvements precisely
- Maintain the established brand voice and tone
- Use authentic language patterns that feel genuine
- Ensure copy aligns with the brand positioning established above

Return ONLY the revised content without explanations, special characters, or markdown formatting. Use clean, plain text only.`;
  } else {
    // Fallback system prompt if no station-specific prompt is found
    systemPrompt = `You are an expert copywriter specializing in improving content. 

${aiSettingsContext}

Your task is to revise ${contentType} copy based on specific improvement instructions while maintaining the brand voice and style established above.

${contentType === 'custom' ? `
SPECIAL NOTES FOR CUSTOM COPY REVISION:
- This could be any format: social media, email, brief, announcement, etc.
- Maintain the original format and structure unless specifically asked to change it
- Focus on the specific improvements requested while keeping the established brand voice
- Be adaptable to any copywriting format or purpose
- Use clean, plain text formatting without special characters like asterisks, hashtags, or markdown
- Output should be clean and readable without formatting symbols
` : ''}

${contentType === 'retention' ? `
SPECIAL NOTES FOR RETENTION COPY REVISION:
- This is ${context?.field === 'retention' ? 'email/SMS retention copy' : 'retention marketing content'}
- Maintain platform-appropriate length and formatting (Email vs SMS)
- Focus on customer retention and engagement principles
- Use personalized, relationship-building language appropriate for existing customers
- Balance promotional content with value-driven messaging
- Include relevant product mentions if specific products were selected
- Ensure mobile-friendly formatting for both email and SMS
- Use clean, plain text formatting without markdown or special characters
${context?.selectedProducts && context.selectedProducts.length > 0 ? `
- Feature these selected products appropriately: ${context.selectedProducts.join(', ')}
` : ''}
` : ''}

REVISION PRINCIPLES:
- Keep the core message and structure intact (unless explicitly asked to change)
- Apply the requested improvements precisely
- Maintain the established brand voice and tone
- Use authentic language patterns that feel genuine

Return ONLY the revised content without explanations, special characters, or markdown formatting. Use clean, plain text only.`;
  }

  const userPrompt = `ORIGINAL CONTENT:
"${originalContent}"

IMPROVEMENT INSTRUCTIONS:
${revisionInstructions}

CONTENT TYPE: ${contentType}
${context?.field ? `SPECIFIC FIELD: ${context.field}` : ''}

${context ? `
CONTEXT:
- Target Audience: ${context.concept}${context.targetAudience ? ` (${context.targetAudience})` : ''}
- Product: ${context.selectedProduct || 'General brand content'}
- Brand/DR Balance: ${context.brandDrBalance || 50}% brand voice
${context.customBrief ? `- Custom Brief: ${context.customBrief}` : ''}
${context.customRequest && contentType === 'custom' ? `- Original Request: ${context.customRequest}` : ''}
` : ''}

Please revise the content applying the improvement instructions while maintaining the established brand voice and the original intent.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Clean up the response - remove quotes and extra formatting
    const revisedContent = content
      .replace(/^["'](.+)["']$/s, '$1') // Remove surrounding quotes
      .replace(/^\*\*(.+)\*\*$/s, '$1') // Remove bold formatting
      .trim();
    
    return revisedContent;
  } catch (error) {
    console.error('Content revision error:', error);
    throw new Error('Failed to revise content');
  }
}

export async function generateAdCopy(request: AdCopyRequest, trainingConfig: TrainingConfig) {
  const { transcription, customBrief, concept, targetAudience, landingPageUrl, brandDrBalance, useJonesBrandGuide, airLink, uploadedImage, selectedProduct, selectedProducts } = request;
  
  // Validate required parameters
  if (!concept || concept === 'none') {
    throw new Error('Concept is required and must be provided from database persona data.');
  }
  if (!targetAudience) {
    throw new Error('Target audience is required and must be provided.');
  }
  
  // Provide safe defaults for undefined values
  const safeBrandDrBalance = brandDrBalance || 50;
  const brandPercent = safeBrandDrBalance;
  const drPercent = 100 - brandPercent;
  const safeConcept = concept;
  const safeTargetAudience = targetAudience;
  
  // Build enhanced system prompt using StationPromptManager
  const systemPrompt = StationPromptManager.buildStationSystemPrompt('adCopy', trainingConfig, {
    concept: safeConcept,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide
  });

  // Build context sections using enhanced builders
  const landingPageContext = await buildLandingPageContext(landingPageUrl);
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(selectedProduct, selectedProducts, trainingConfig);
  const copyFrameworksSection = buildCopyFrameworksSection(trainingConfig);
  const customBriefSection = buildCustomBriefSection(customBrief);

  // Enhanced image analysis using ContentContextBuilder
  const { contextSection: imageAnalysisSection, hasImageContent, imageInput } = 
    ContentContextBuilder.buildImageAnalysisContext(uploadedImage, airLink, 'ad_creative');

  // Enhanced transcription context
  const transcriptionContext = ContentContextBuilder.buildTranscriptionContext(transcription, 'video');

  // Build enhanced user prompt using StationPromptManager
  const templateVariables = {
    transcription: transcription || '',
    landingPageContext: landingPageContext || ''
  };

  const contextSections = [
    transcriptionContext,
    targetPersonaSection,
    selectedProductsSection,
    copyFrameworksSection,
    customBriefSection,
    imageAnalysisSection
  ];

  const userPrompt = StationPromptManager.buildStationUserPrompt(
    'adCopy',
    trainingConfig,
    templateVariables,
    contextSections
  );

  // Set image variables for message content
  const base64Image = hasImageContent && imageInput?.startsWith('data:') ? imageInput : '';
  const imageUrl = hasImageContent && imageInput?.startsWith('http') ? imageInput : '';

  try {
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];
    
    if (hasImageContent) {
      const imageInput = base64Image || imageUrl;
      if (imageInput) {
        const processedImage = await processImageForAnthropic(imageInput, {
          logContext: 'Ad copy generation'
        });
        if (processedImage) {
          messageContent.push(processedImage);
        }
      }
    }

    // Get optimized model parameters for this station
    const modelParams = StationPromptManager.getStationModelParams('adCopy', trainingConfig);
    
    const response = await anthropic.messages.create({
      model: modelParams.model,
      system: systemPrompt,
      max_tokens: modelParams.max_tokens,
      temperature: modelParams.temperature,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse AI response using centralized parser
    const { headlines, primaryText } = AIResponseParser.parseWithFallback(content);
    
    return {
      headlines,
      primaryText,
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        modelParams.model,
        { transcription, concept, targetAudience, brandDrBalance, selectedProduct }
      )
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      hasImageContent,
      imageLength: base64Image?.length || 0,
      airLink,
      uploadedImageLength: uploadedImage?.length || 0
    });
    throw new Error(`Failed to generate ad copy: ${errorMessage}`);
  }
}

export async function generateLandingPageCopy(request: LandingPageRequest, trainingConfig: TrainingConfig) {
  const { landingPageType, productBrief, concept, useAdsContent, adsContent, brandDrBalance, selectedProduct, selectedProducts, mainAngle, transcription } = request;
  

  
  // Validate required parameters
  if (!concept || concept === 'none') {
    throw new Error('Concept is required and must be provided from database persona data.');
  }
  
  const safeBrandDrBalance = brandDrBalance || 50;
  const safeConcept = concept;
  
  // Build comprehensive AI Settings context
  const aiSettingsContext = buildAISettingsContext(trainingConfig, {
    concept: safeConcept,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide: true
  });
  
  // Build comprehensive sections using helper functions
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(selectedProduct, selectedProducts, trainingConfig);
  const landingPageFrameworksSection = buildLandingPageFrameworksSection(trainingConfig);
  

  
  // Build additional contextual sections
  const transcriptionSection = transcription ? `
TRANSCRIPTION CONTEXT:
${transcription}

TRANSCRIPTION INTEGRATION REQUIREMENT:
- Use key insights, quotes, and messaging angles from the transcription
- Maintain the authentic voice and tone established in the original content
- Extract compelling hooks and benefit statements for landing page copy
- Ensure messaging consistency between the source material and landing page
` : '';

  const adsContentSection = useAdsContent && adsContent ? `
ADS CONTENT TO REFERENCE:
${adsContent}

AD-TO-LANDING PAGE ALIGNMENT:
- Create seamless messaging flow from ad to landing page
- Maintain consistent value propositions and benefit language
- Ensure headline and angle alignment for reduced bounce rate
- Use similar emotional hooks and persuasion elements
` : '';

  const mainAngleSection = mainAngle ? `

MAIN ANGLE FOCUS:
${mainAngle}

ANGLE AMPLIFICATION REQUIREMENTS:
- Make this angle the central theme throughout all landing page sections
- Use this angle to inform headline strategy and messaging hierarchy
- Ensure all benefit statements support and reinforce this main angle
- Create compelling proof points that validate this specific angle
` : '';

  const productBriefSection = productBrief ? `
PRODUCT BRIEF DETAILS:
${productBrief}

BRIEF INTEGRATION REQUIREMENTS:
- Incorporate specific product details and unique selling points
- Use brief information to create targeted benefit statements
- Ensure technical accuracy while maintaining compelling copy
- Highlight differentiators and competitive advantages mentioned in brief
` : '';

  const brandBalanceSection = `
BRAND/DR BALANCE GUIDANCE:
Brand Voice: ${safeBrandDrBalance}% | Direct Response: ${100 - safeBrandDrBalance}%

${safeBrandDrBalance > 60 ? `
BRAND-FIRST APPROACH (High Brand %):
- Lead with brand storytelling and emotional connection
- Use authentic, conversational tone throughout
- Focus on brand values and lifestyle integration
- Create aspirational messaging that builds brand affinity
- Incorporate brand personality and voice characteristics
` : safeBrandDrBalance < 40 ? `
DIRECT RESPONSE APPROACH (High DR %):
- Lead with clear, immediate benefits and results
- Use urgency and scarcity elements where appropriate
- Focus on problem/solution messaging
- Create action-oriented copy with strong CTAs
- Emphasize tangible outcomes and proof points
` : `
BALANCED APPROACH (Equal Brand/DR):
- Blend brand storytelling with clear benefit communication
- Use authentic voice while maintaining conversion focus
- Balance emotional connection with logical persuasion
- Create compelling narrative that drives action
- Maintain brand integrity while optimizing for results
`}`;

  // Use database system prompt instead of hardcoded
  const baseSystemPrompt = trainingConfig?.stationPrompts?.landingPage?.systemPrompt;
  
  if (!baseSystemPrompt) {
    throw new Error('Landing page system prompt not found in training configuration. Please ensure database contains proper station prompt configuration.');
  }
  
  const systemPrompt = `${baseSystemPrompt}

 ${landingPageFrameworksSection}

${aiSettingsContext}`;

  // Use database user prompt template instead of hardcoded
  const baseUserPrompt = trainingConfig?.stationPrompts?.landingPage?.userPromptTemplate;
  
  if (!baseUserPrompt) {
    throw new Error('Landing page user prompt template not found in training configuration. Please ensure database contains proper station prompt configuration.');
  }

  // Debug logging for selected products
  console.log('=== LANDING PAGE SELECTED PRODUCTS DEBUG ===');
  console.log('selectedProduct:', selectedProduct);
  console.log('selectedProducts:', selectedProducts);
  console.log('selectedProductsSection length:', selectedProductsSection.length);
  console.log('selectedProductsSection preview:', selectedProductsSection.substring(0, 200) + '...');
  
  // Build comprehensive user prompt with template replacements and additional sections
  const userPrompt = baseUserPrompt
    .replace('{landingPageType}', landingPageType)
    .replace('{productBrief}', productBrief || '')
    .replace('{mainAngle}', mainAngle || '')
    .replace('{concept}', safeConcept)
    .replace('{brandPercent}', safeBrandDrBalance.toString())
    .replace('{drPercent}', (100 - safeBrandDrBalance).toString())
    .replace('{adsContentSection}', useAdsContent && adsContent ? `\nADS CONTENT TO REFERENCE:\n${adsContent}\n` : '')
    .replace('{targetPersonaSection}', targetPersonaSection)
    .replace('{selectedProductsSection}', selectedProductsSection) + 
    transcriptionSection + 
    adsContentSection + 
    mainAngleSection + 
    productBriefSection + 
    targetPersonaSection +
    selectedProductsSection + 
    brandBalanceSection;

  console.log('=== FINAL USER PROMPT PREVIEW ===');
  console.log(userPrompt.substring(0, 500) + '...');
  console.log('=== END DEBUG ===');

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2048,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Debug logging to see what we received
    // console.log('AI Response for landing page:', content.substring(0, 500) + '...');
    
    // Try to parse as JSON first, then fall back to text parsing
    let parsedJson = null;
    try {
      // Extract JSON from response - handle potential markdown wrapping
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      parsedJson = JSON.parse(jsonString);
      console.log('Successfully parsed JSON response:', parsedJson);
    } catch (error) {
      console.log('Not a JSON response, using text parsing...');
    }
    
    let headlineMatch, subheadlineMatch, introMatch, ctaMatch, riskReversalMatch;
    
         if (parsedJson) {
       // Use JSON parsing
       headlineMatch = parsedJson.headline ? [null, parsedJson.headline] : null;
       subheadlineMatch = parsedJson.subheadline ? [null, parsedJson.subheadline] : null;
       introMatch = parsedJson.introduction ? [null, parsedJson.introduction] : null;
       ctaMatch = parsedJson.cta ? [null, parsedJson.cta] : null;
       riskReversalMatch = parsedJson.riskReversal || parsedJson.risk_reversal ? [null, parsedJson.riskReversal || parsedJson.risk_reversal] : null;
    } else {
      // Use text parsing as fallback
      headlineMatch = content.match(/HEADLINE:?\s*(.+?)(?=\n|SUBHEADLINE|INTRODUCTION|$)/is);
      // If no HEADLINE prefix found, use the first line as headline
      const fallbackHeadline = !headlineMatch ? content.match(/^(.+?)(?=\n)/) : null;
      if (!headlineMatch && fallbackHeadline) headlineMatch = fallbackHeadline;
      
      subheadlineMatch = content.match(/SUBHEADLINE:?\s*(.+?)(?=\n|INTRODUCTION|REASON|HERO PRODUCT|PRODUCT|$)/is);
      introMatch = landingPageType === 'multiProduct' 
        ? content.match(/INTRODUCTION:?\s*([\s\S]*?)(?=HERO PRODUCT|PRODUCT #?1|$)/i)
        : landingPageType === 'listicle' 
          ? null // No introduction for listicles
          : content.match(/INTRODUCTION:?\s*([\s\S]*?)(?=REASON #?1|$)/i);
      ctaMatch = content.match(/CTA:?\s*([\s\S]*?)(?=RISK REVERSAL|$)/i);
      riskReversalMatch = content.match(/RISK REVERSAL:?\s*([\s\S]*?)$/i);
    }
    
    console.log('Parsing results:', {
      headline: headlineMatch ? headlineMatch[1] : 'NOT FOUND',
      hasReasons: content.includes('REASON'),
      hasProducts: content.includes('PRODUCT'),
      hasHeroProduct: content.includes('HERO PRODUCT'),
      landingPageType: landingPageType,
      contentStart: content.substring(0, 200),
      isJsonResponse: !!parsedJson
    });
    
    // Extract sections with improved parsing (works for REASON, PRODUCT, and HERO PRODUCT sections)
    const sections = [];
    
    if (parsedJson && parsedJson.sections) {
      // Handle JSON sections
      for (const section of parsedJson.sections) {
        const content = section.content || section.description || '';
        const hookMatch = content.match(/^([^.!?]*[.!?])/);
        const hook = hookMatch ? hookMatch[1].trim() : '';
        
        sections.push({
          title: section.title || section.name || '',
          content,
          hook: hook.length < 200 ? hook : '',
          wordCount: content.split(/\s+/).length
        });
      }
    } else if (landingPageType === 'multiProduct') {
      // Handle HERO PRODUCT first
      const heroMatch = content.match(/HERO PRODUCT:?\s*(.+?)(?=\n)([\s\S]*?)(?=PRODUCT #\d+|COLLECTION BENEFITS:|SOCIAL PROOF:|CTA:|RISK REVERSAL:|$)/i);
      if (heroMatch) {
        const title = heroMatch[1].trim().replace(/\*\*/g, '');
        const content = heroMatch[2].trim().replace(/\*\*/g, '');
        const hookMatch = content.match(/^([^.!?]*[.!?])/);
        const hook = hookMatch ? hookMatch[1].trim() : '';
        
        sections.push({
          title: `Hero: ${title}`,
          content,
          hook: hook.length < 200 ? hook : '',
          wordCount: content.split(/\s+/).length
        });
      }
      
      // Handle numbered PRODUCT sections
      const productPattern = /PRODUCT #(\d+):?\s*(.+?)(?=\n)([\s\S]*?)(?=PRODUCT #\d+|COLLECTION BENEFITS:|SOCIAL PROOF:|CTA:|RISK REVERSAL:|$)/gi;
      const productMatches = content.match(productPattern);
      if (productMatches) {
        for (const match of productMatches) {
          const titleMatch = match.match(/PRODUCT #\d+:?\s*(.+?)(?=\n)/i);
          const contentMatch = match.match(/\n([\s\S]*?)$/);
          if (titleMatch && contentMatch) {
            const title = titleMatch[1].trim().replace(/\*\*/g, '');
            const content = contentMatch[1].trim().replace(/\*\*/g, '');
            const hookMatch = content.match(/^([^.!?]*[.!?])/);
            const hook = hookMatch ? hookMatch[1].trim() : '';
            
            sections.push({
              title,
              content,
              hook: hook.length < 200 ? hook : '',
              wordCount: content.split(/\s+/).length
            });
          }
        }
      }
    } else {
      // Handle REASON sections for other landing page types
      const sectionPattern = /REASON #(\d+):?\s*(.+?)(?=\n)([\s\S]*?)(?=REASON #\d+|CTA:|RISK REVERSAL:|$)/gi;
      const sectionMatches = content.match(sectionPattern);
      if (sectionMatches) {
        for (const match of sectionMatches) {
          const titleMatch = match.match(/REASON #\d+:?\s*(.+?)(?=\n)/i);
          const contentMatch = match.match(/\n([\s\S]*?)$/);
          if (titleMatch && contentMatch) {
            const title = titleMatch[1].trim().replace(/\*\*/g, '');
            const content = contentMatch[1].trim().replace(/\*\*/g, '');
            const hookMatch = content.match(/^([^.!?]*[.!?])/);
            const hook = hookMatch ? hookMatch[1].trim() : '';
            
            sections.push({
              title,
              content,
              hook: hook.length < 200 ? hook : '',
              wordCount: content.split(/\s+/).length
            });
          }
        }
      }
    }
    
    // For multi-product pages, also extract collection benefits and social proof sections
    if (landingPageType === 'multiProduct') {
      // Extract Collection Benefits section
      const collectionMatch = content.match(/COLLECTION BENEFITS:?\s*([\s\S]*?)(?=SOCIAL PROOF:|CTA:|RISK REVERSAL:|$)/i);
      if (collectionMatch) {
        const collectionContent = collectionMatch[1].trim().replace(/\*\*/g, '');
        sections.push({
          title: 'Collection Benefits',
          content: collectionContent,
          hook: '',
          wordCount: collectionContent.split(/\s+/).length
        });
      }
      
      // Extract Social Proof section
      const socialProofMatch = content.match(/SOCIAL PROOF:?\s*([\s\S]*?)(?=CTA:|RISK REVERSAL:|$)/i);
      if (socialProofMatch) {
        const socialProofContent = socialProofMatch[1].trim().replace(/\*\*/g, '');
        sections.push({
          title: 'Social Proof',
          content: socialProofContent,
          hook: '',
          wordCount: socialProofContent.split(/\s+/).length
        });
      }
    }
    
    const finalHeadline = headlineMatch ? headlineMatch[1] : '';
    
    return {
      headline: finalHeadline.trim().replace(/\*\*/g, ''),
      subheadline: subheadlineMatch ? subheadlineMatch[1].trim().replace(/\*\*/g, '') : '',
      introduction: introMatch ? introMatch[1].trim().replace(/\*\*/g, '') : '',
      sections,
      cta: ctaMatch ? ctaMatch[1].trim().replace(/\*\*/g, '') : '',
      riskReversal: riskReversalMatch ? riskReversalMatch[1].trim().replace(/\*\*/g, '') : '',
      socialProof: '', // Add empty socialProof for frontend compatibility
      conclusion: '', // Add empty conclusion for frontend compatibility
      rawResponse: content,
      stats: {
        totalWords: content.split(/\s+/).length,
        sectionCount: sections.length,
        avgSectionLength: sections.length > 0 ? Math.round(sections.reduce((sum, s) => sum + (s.wordCount || 0), 0) / sections.length) : 0
      },
      debugInfo: {
        systemPrompt,
        userPrompt,
        requestPayload: request,
        rawResponse: content
      }
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw new Error('Failed to generate landing page copy');
  }
}

export async function analyzeStaticAd(request: StaticAdAnalysisRequest, _trainingConfig: TrainingConfig) {
  const { staticAdImage, concept, brandDrBalance, selectedProduct, selectedProducts, useJonesBrandGuide, outputFormat, analysisFocus } = request;
  
  const brandPercent = brandDrBalance;
  const drPercent = 100 - brandPercent;
  
  // Provide safe defaults for undefined values
  const safeConcept = concept || '';
  const safeBrandDrBalance = brandDrBalance || 50;
  
  // Process static ad image
  const processedImage = await processImageForAnthropic(staticAdImage, {
    logContext: 'Static ad analysis'
  });
  
  if (!processedImage) {
    throw new Error('Failed to process static ad image');
  }
  
  // After processing, the image is converted to JPEG format for optimal compression
  // const finalMediaType = "image/jpeg"; // resizeImageIfNeeded always converts to JPEG when processing
  
  // Get training configuration
  const config = await import('../routes/training').then(m => m.getTrainingConfig());
  
  // Build comprehensive AI Settings context including product claims
  const aiSettingsContext = buildAISettingsContext(config, {
    concept: safeConcept,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide
  });
  
  // Use database system prompt instead of hardcoded fallback
  const baseSystemPrompt = config?.stationPrompts?.staticAd?.systemPrompt;
  
  if (!baseSystemPrompt) {
    throw new Error('Static ad analysis system prompt not found in training configuration. Please ensure database contains proper station prompt configuration.');
  }
  
  const systemPrompt = `${baseSystemPrompt}

${aiSettingsContext}

IMPORTANT: Return your response in structured JSON format with the following structure:
{
  "analysis": "Your comprehensive analysis of what makes this ad effective",
  "variations": [
    {
      "headline": "Compelling headline variation",
      "primaryText": "Primary text variation (150-200 words)",
      "framework": "Framework used (e.g., BENEFIT DRIVEN, SOCIAL PROOF, etc.)"
    }
  ]
}

OUTPUT FORMAT: ${outputFormat || 'analysis-variations'}
ANALYSIS FOCUS: ${analysisFocus || 'comprehensive'}`;

  // Build sections using helper functions
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, config);
  const selectedProductsSection = buildSelectedProductsSection(selectedProduct, selectedProducts, config);

  const getInstructions = () => {
    const baseInstructions = `Please analyze this static ad image and create Jones Road Beauty variations targeting ${safeConcept}.`;
    
    // Customize instructions based on outputFormat
    if (outputFormat === 'analysis-only') {
      return `${baseInstructions}

INSTRUCTIONS:
- Provide comprehensive analysis of what makes this ad effective
- Focus on visual elements, copy effectiveness, and conversion optimization
- DO NOT create variations - analysis only`;
    } else if (outputFormat === 'variations-only') {
      return `${baseInstructions}

INSTRUCTIONS:
- Create 3 compelling Jones Road variations that adapt the successful elements
- Focus on authentic language that resonates with the target persona
- Include specific headlines and primary text for each variation
- Maintain Jones Road's "effortless beauty" positioning throughout
- DO NOT provide detailed analysis - variations only`;
    } else {
      return `${baseInstructions}

INSTRUCTIONS:
- Provide comprehensive analysis of what makes this ad effective
- Create 3 compelling Jones Road variations that adapt the successful elements
- Focus on authentic language that resonates with the target persona
- Include specific headlines and primary text for each variation
- Maintain Jones Road's "effortless beauty" positioning throughout`;
    }
  };

  const userPrompt = getInstructions() + 
    targetPersonaSection + 
    selectedProductsSection;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt
          },
          processedImage
        ]
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Try to parse JSON response first
    let parsedResponse;
    try {
      // Extract JSON from response - handle potential markdown wrapping
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      parsedResponse = JSON.parse(jsonString);
      
      // Handle different output formats
      if (outputFormat === 'analysis-only') {
        return {
          analysis: parsedResponse.analysis || 'Analysis not available',
          variations: [],
          rawResponse: content,
          debugInfo: {
            systemPrompt,
            userPrompt,
            rawResponse: content,
            modelUsed: DEFAULT_MODEL_STR
          }
        };
      } else if (outputFormat === 'variations-only') {
        return {
          analysis: '', // No analysis for variations-only
          variations: parsedResponse.variations || [],
          rawResponse: content,
          debugInfo: {
            systemPrompt,
            userPrompt,
            rawResponse: content,
            modelUsed: DEFAULT_MODEL_STR
          }
        };
      } else {
        // Default: analysis-variations
        return {
          analysis: parsedResponse.analysis || 'Analysis not available',
          variations: parsedResponse.variations || [],
          rawResponse: content,
          debugInfo: {
            systemPrompt,
            userPrompt,
            rawResponse: content,
            modelUsed: DEFAULT_MODEL_STR
          }
        };
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, falling back to text formatting');
      
      // Fallback: Clean up formatting and return as text
      const cleanedContent = content
        .replace(/\*\*/g, '') // Remove bold formatting
        .replace(/#{1,6}\s?/g, '') // Remove markdown headers
        .replace(/\[([^\]]+)\]/g, '$1') // Remove square brackets
        .replace(/`([^`]+)`/g, '$1') // Remove code formatting
        .trim();
      
      // For fallback, always return analysis with no variations
      return {
        analysis: cleanedContent,
        variations: [],
        rawResponse: content,
        debugInfo: {
          systemPrompt,
          userPrompt,
          rawResponse: content,
          modelUsed: DEFAULT_MODEL_STR
        }
      };
    }
  } catch (error) {
    console.error('Static ad analysis error:', error);
    throw new Error('Failed to analyze static ad');
  }
}

export async function generateCustomCopy(request: CustomCopyRequest, trainingConfig: TrainingConfig) {
  const { customRequest, concept, brandDrBalance, selectedProduct, selectedProducts, useJonesBrandGuide } = request;
  
  // Validate required parameters
  if (!concept || concept === 'none') {
    throw new Error('Concept is required and must be provided from database persona data.');
  }
  
  const safeBrandDrBalance = brandDrBalance || 50;
  const safeConcept = concept;
  
  // Build comprehensive AI Settings context
  const aiSettingsContext = buildAISettingsContext(trainingConfig, {
    concept: safeConcept,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide
  });
  
  // Build enhanced system prompt using StationPromptManager
  const systemPrompt = StationPromptManager.buildStationSystemPrompt('customRequest', trainingConfig, {
    concept: safeConcept,
    selectedProduct,
    selectedProducts: request.selectedProducts,
    brandDrBalance: request.brandDrBalance,
    useJonesBrandGuide: true
  });


  const brandBalance = request.brandDrBalance || 50;
  
  // Brand balance guidance should come from database copy frameworks
  let balanceGuidance = "Balance brand voice with clear benefits";
  if (trainingConfig.copyFrameworks) {
    // Use copy framework rules to determine guidance
    if (trainingConfig.copyFrameworks.brandDrBalance) {
      if (brandBalance > 60 && trainingConfig.copyFrameworks.brandDrBalance.brandFirst) {
        balanceGuidance = "Lean more toward brand storytelling and emotional connection";
      } else if (brandBalance < 40 && trainingConfig.copyFrameworks.brandDrBalance.directResponse) {
        balanceGuidance = "Focus more on direct benefits and actionable results";
      }
    }
  }

  // Build context sections for custom request
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(selectedProduct, request.selectedProducts, trainingConfig);

  // Build enhanced user prompt using StationPromptManager
  const templateVariables = {
    customRequest: request.customRequest,
    brandBalance: brandBalance.toString(),
    balanceGuidance: balanceGuidance
  };

  const contextSections = [
    targetPersonaSection,
    selectedProductsSection,
    `BRAND/DR BALANCE: ${brandBalance}% brand voice - ${balanceGuidance}`
  ];

  const userPrompt = StationPromptManager.buildStationUserPrompt(
    'customRequest',
    trainingConfig,
    templateVariables,
    contextSections
  );

  try {
    // Get optimized model parameters for this station
    const modelParams = StationPromptManager.getStationModelParams('customRequest', trainingConfig);
    
    const response = await anthropic.messages.create({
      model: modelParams.model,
      system: systemPrompt,
      max_tokens: modelParams.max_tokens,
      temperature: modelParams.temperature,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    return {
      response: content.trim(),
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        modelParams.model,
        request
      )
    };
  } catch (error) {
    console.error('Custom copy generation error:', error);
    throw new Error('Failed to generate custom copy');
  }
}

export async function generateRetentionCopy(request: {
  keyMessage: string;
  platform: string;
  emailType?: string;
  selectedFramework?: any;
  selectedProducts?: string[];
  audience?: string;
  goal?: string;
  campaignType?: string;
  contentLength?: string;
  keywordsToInclude?: string[];
  wordsToAvoid?: string[];
  concept?: string;
  brandDrBalance?: number;
  selectedProduct?: string;
  useJonesBrandGuide?: boolean;
}, trainingConfig: TrainingConfig) {
  console.log('generateRetentionCopy called with selectedProducts:', request.selectedProducts);
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Build comprehensive AI Settings context
  const aiSettingsContext = buildAISettingsContext(trainingConfig, request);
  
  // Build persona and product sections
  const safeConcept = request.concept || 'lifeJuggler';
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(request.selectedProduct, request.selectedProducts, trainingConfig);
  
  // Get station-specific system prompt with AI Settings integration - database only
  const baseSystemPrompt = trainingConfig?.stationPrompts?.emailSmsRetention?.systemPrompt;
  
  if (!baseSystemPrompt) {
    throw new Error('Email/SMS retention system prompt not found in training configuration. Please ensure database contains proper station prompt configuration.');
  }
  
  const systemPrompt = `${baseSystemPrompt}

${aiSettingsContext}

${request.selectedFramework ? `
🎯 FRAMEWORK-DRIVEN COPY GENERATION 🎯
You are operating in FRAMEWORK COMPLIANCE MODE. This means:
- The selected framework "${request.selectedFramework.displayName}" takes ABSOLUTE PRIORITY
- All copy must conform to the framework's structure, requirements, and specifications
- Visual layout compliance is MANDATORY when framework images are provided
- Framework-specific content requirements override general guidelines
- Expected length and output format must match framework specifications exactly

FRAMEWORK INTEGRATION PRIORITY:
1. Framework structure and requirements (HIGHEST PRIORITY)
2. Visual layout compatibility (when images provided)
3. Brand voice and messaging guidelines
4. Platform specifications and general requirements
` : ''}

${request.platform === 'SMS' ? 'SMS' : 'Email'} Copy Specifications:
- Platform: ${request.platform || 'Email'}
${request.platform === 'Email' && request.emailType ? `- Email Type: ${request.emailType}` : ''}
${request.selectedFramework ? `- Selected Framework: ${request.selectedFramework.displayName} (MUST FOLLOW EXACTLY)` : ''}
- Target Audience: ${request.audience || 'General audience'}
- Goal: ${request.goal || 'Drive Sales'}
- Campaign Type: ${request.campaignType || 'Product Spotlight / Hero Product'}
- Content Length: ${request.contentLength || 'Short'}

${request.keywordsToInclude && request.keywordsToInclude.length > 0 ? `
Keywords to Include: ${request.keywordsToInclude.join(', ')}
` : ''}

${request.wordsToAvoid && request.wordsToAvoid.length > 0 ? `
Words to Avoid: ${request.wordsToAvoid.join(', ')}
` : ''}

${request.selectedProducts && request.selectedProducts.length > 0 ? `
Products to Feature: ${request.selectedProducts.join(', ')}
- Include these products naturally in the copy where relevant
- Highlight benefits and unique selling points of selected products
- Create product-specific calls to action when appropriate
` : ''}

${request.selectedFramework && request.selectedFramework.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0 ? `
🖼️ VISUAL ANALYSIS INTEGRATION 🖼️
Framework images are provided that show the EXACT layout structure you must follow. Your copy generation must:
- Analyze visual elements to understand content placement requirements
- Match copy sections to corresponding visual areas in the layout
- Ensure content hierarchy aligns with visual emphasis
- Include appropriate image placeholders where visuals are indicated
- Consider responsive design implications if evident in the layout
- Maintain consistency between copy structure and visual framework

CRITICAL: The framework images serve as your structural blueprint - every piece of copy must correspond to and fit within the visual layout shown.
` : ''}

${request.platform === 'SMS' ? `
SMS-Specific Guidelines:
- Keep total message under 160 characters when possible for single SMS
- Use clear, direct language with immediate impact
- Include clear CTA with link or store direction
- Create urgency without being pushy
- Use emojis sparingly and only if they add value
- Personalize when possible
` : `
Email-Specific Guidelines:
- Create compelling subject lines that drive opens
- Structure: Subject Line + Preview Text + Body Copy + Clear CTA
- Maintain Jones Road's authentic voice throughout
- Use social proof and customer testimonials when relevant
- Balance promotional content with value-driven messaging
- Ensure mobile-friendly formatting
`}

Content Length Specifications:
- Short: ${request.platform === 'SMS' ? '50-100 words' : '75-150 words'}
- Medium: ${request.platform === 'SMS' ? '100-160 characters total' : '150-300 words'}
- Long: ${request.platform === 'SMS' ? 'Multiple messages (2-3 parts)' : '300-500 words'}

🚨 LENGTH COMPLIANCE IS MANDATORY 🚨
When a specific word count or length is provided (e.g., "20 words"), you MUST strictly adhere to that constraint. This overrides all other formatting requirements. Count every word carefully and do not exceed the specified limit under any circumstances.

Tone Guidelines:
- Friendly: Warm, conversational, approachable
- Bold: Confident, direct, statement-making
- Urgent: Time-sensitive, compelling, action-driving
- Playful: Fun, lighthearted, engaging
- Professional: Polished, authoritative, trustworthy

Campaign Type Focus:
- Welcome: Introduce brand values and first-purchase incentives
- Promo: Feature specific offers, discounts, or limited-time deals
- Product Drop: Announce new products with excitement and exclusivity
- Cart Recovery: Gentle reminders with added incentives
- Winback: Re-engage lapsed customers with special offers

Create ${request.platform?.toLowerCase() || 'email'} copy that authentically represents Jones Road Beauty while achieving the specified campaign goals.`;

  const userPrompt = `Create ${request.platform?.toLowerCase() || 'email'} retention copy based on this key message:

${targetPersonaSection}

${selectedProductsSection}

"${request.keyMessage}"

${request.platform === 'Email' && request.selectedFramework ? `
🎯 EMAIL FRAMEWORK COMPLIANCE REQUIREMENT 🎯
You MUST follow the "${request.selectedFramework.displayName}" email framework structure EXACTLY. This is MANDATORY and takes priority over general guidelines.

FRAMEWORK DETAILS:
═══════════════════════════════════════════════════════════════════════════════════════════════════════

FRAMEWORK NAME: ${request.selectedFramework.displayName}
DESCRIPTION: ${request.selectedFramework.description}

REQUIRED STRUCTURE:
${request.selectedFramework.structure}

MANDATORY KEY ELEMENTS:
${request.selectedFramework.keyElements}

FRAMEWORK-SPECIFIC CONTENT REQUIREMENTS:
${request.selectedFramework.frameworkContent}

FRAMEWORK SYSTEM PROMPT INTEGRATION:
${request.selectedFramework.systemPrompt}

OUTPUT REQUIREMENTS (MUST FOLLOW):
${request.selectedFramework.outputRequirements}

EXPECTED LENGTH (STRICT COMPLIANCE):
${request.selectedFramework.expectedLength}

${request.selectedFramework.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0 ? `
📐 VISUAL LAYOUT ANALYSIS & COMPLIANCE 📐
The framework includes ${request.selectedFramework.images.length} visual reference image(s) that show the EXACT email layout and design structure you MUST follow.

CRITICAL VISUAL ANALYSIS REQUIREMENTS:
1. ANALYZE the provided framework image(s) to identify:
   - Header/hero section layout and text placement
   - Content block organization and hierarchy
   - Section divisions and spacing requirements
   - CTA button placement and sizing constraints
   - Footer layout and required elements
   - Image placement areas and dimensions
   - Typography hierarchy and text flow

2. MATCH YOUR COPY to the visual structure by:
   - Creating headlines that fit the header/hero areas shown
   - Writing body content that aligns with content block layouts
   - Sizing copy sections to match the visual proportions
   - Placing CTAs exactly where buttons appear in the layout
   - Including image placeholders "[IMAGE: Description]" where visuals are shown
   - Following the content flow and reading pattern established by the design

3. ENSURE DESIGN COMPATIBILITY:
   - Copy length must fit within designated text areas
   - Content hierarchy must match visual emphasis
   - Tone and style must complement the visual aesthetic
   - All required framework elements must be present and positioned correctly

4. FRAMEWORK IMAGE INTEGRATION:
   - Use the visual layout as your structural blueprint
   - Ensure every section of copy corresponds to a visual element
   - Include specific image placeholders matching the template design
   - Consider mobile responsiveness if layout indicates responsive design

VISUAL COMPLIANCE IS MANDATORY - Your copy must work seamlessly with the exact layout shown in the framework images.
` : ''}

⚠️ ABSOLUTE PRIORITY: FRAMEWORK COMPLIANCE ⚠️
1. Framework structure requirements override all other formatting preferences
2. Expected length must be strictly adhered to (count every word)
3. Visual layout compatibility is mandatory when images are provided
4. All framework-specific elements must be included exactly as specified
5. Output format must match framework requirements precisely

FRAMEWORK ADHERENCE CHECKLIST:
☐ Structure follows framework requirements exactly
☐ All mandatory key elements are included
☐ Copy fits visual layout constraints (if images provided)
☐ Length matches expected word count
☐ Output format matches framework specifications
☐ Content hierarchy aligns with visual design
☐ CTA placement matches framework guidelines

Follow this framework structure with ABSOLUTE PRECISION to ensure the email follows the proven format and converts effectively.
` : request.platform === 'Email' && request.emailType ? `
EMAIL FRAMEWORK REQUIREMENT:
You MUST follow the "${request.emailType}" email framework structure. This framework has specific requirements for:
- Content organization and flow
- Section structure and messaging
- Call-to-action placement and style
- Tone and approach
- Length and format expectations

Research and apply the best practices for the "${request.emailType}" framework to ensure the email follows the proven structure and converts effectively.
` : ''}

CRITICAL: Return ONLY plain text email copy. NO JSON, NO markdown, NO special formatting.

${trainingConfig?.emailTemplates?.retention && trainingConfig.emailTemplates.retention.length > 0 ? `
📧 EMAIL TEMPLATE VISUAL ANALYSIS REQUIRED 📧
${trainingConfig.emailTemplates.retention.length} email template image(s) have been provided as additional visual references. You MUST:

TEMPLATE ANALYSIS STEPS:
1. EXAMINE each template image for:
   - Overall layout structure and content organization
   - Text placement areas and content blocks
   - Visual hierarchy and emphasis patterns
   - Image placement zones and sizing
   - Header, body, and footer sections
   - CTA button locations and styles
   - Color scheme and design aesthetic

2. ADAPT your copy to work with these templates by:
   - Creating content that fits designated text areas
   - Matching the tone suggested by the visual design
   - Ensuring copy length aligns with template layout constraints
   - Structuring content to match visible sections
   - Including image placeholders where templates show image areas
   - Following the content flow established by the template design

3. TEMPLATE INTEGRATION REQUIREMENTS:
   - Copy must be designed for professional email template insertion
   - Include specific image placeholders: "[IMAGE: Product photo]", "[IMAGE: Hero banner]", "[IMAGE: Logo]"
   - Consider mobile responsiveness and template flexibility
   - Ensure copy works seamlessly with template design elements
   - Match content hierarchy to template visual emphasis

TEMPLATE COMPATIBILITY IS ESSENTIAL - Your copy will be inserted into these designed templates, so structure and length must align perfectly.
` : ''}

🎯 WORD COUNT PRIORITY: If an exact word count is specified (like "20 words"), that constraint takes ABSOLUTE PRIORITY over all other requirements. Your response must not exceed that limit.

Requirements:
1. Follow the ${request.platform === 'SMS' ? 'SMS' : 'email'} format and character/word limits for ${request.contentLength?.toLowerCase() || 'short'} content
2. Use Jones Road Beauty's authentic, friendly tone throughout
3. Target ${request.audience || 'general audience'} specifically
4. Focus on ${request.goal?.toLowerCase() || 'driving sales'} as the primary goal
5. Structure as ${request.campaignType?.toLowerCase() || 'promo'} campaign type
6. Include clear, compelling call-to-action appropriate for the campaign
${request.selectedProducts && request.selectedProducts.length > 0 ? `7. FEATURE THESE PRODUCTS: ${request.selectedProducts.join(', ')} - Include these products naturally in the copy with their benefits and create relevant calls-to-action` : ''}
${request.keywordsToInclude && request.keywordsToInclude.length > 0 ? `8. Naturally incorporate these keywords: ${request.keywordsToInclude.join(', ')}` : ''}
${request.wordsToAvoid && request.wordsToAvoid.length > 0 ? `9. Avoid using these words: ${request.wordsToAvoid.join(', ')}` : ''}

${request.platform === 'SMS' ? `
RETURN ONLY SMS TEXT:
[Your SMS message here]
` : `
${request.selectedFramework ? `
🎯 FRAMEWORK-COMPLIANT OUTPUT REQUIRED 🎯
Your output must EXACTLY match the "${request.selectedFramework.displayName}" framework requirements:
- Follow the specified output format from framework requirements
- Include all mandatory elements in the correct order
- Match the expected length precisely
- Structure content according to framework specifications
- Include visual layout elements if framework images were provided

FRAMEWORK OUTPUT FORMAT:
${request.selectedFramework.outputRequirements || 'Follow standard email format with framework-specific structure'}

IF NO SPECIFIC FORMAT IS PROVIDED, USE THIS TEMPLATE-READY FORMAT:
` : 'RETURN TEMPLATE-READY EMAIL COPY IN THIS FORMAT:'}

SUBJECT LINE 1: [First subject line]
SUBJECT LINE 2: [Second subject line]  
PREHEADER: [4-6 word preview]

MAIN COPY:
[Write copy for designed email templates - short, scannable paragraphs that work with visual layouts. Focus on clear benefits and engaging content that fits into professional email designs. Include image placeholders using format "[IMAGE: Description]" where visual elements would enhance the message (e.g., "[IMAGE: Product photo]", "[IMAGE: Hero banner]", "[IMAGE: Logo]").${request.selectedFramework && request.selectedFramework.images && request.selectedFramework.images.length > 0 ? ' CRITICAL: Structure your copy to match the visual layout shown in the framework images - ensure headlines fit header areas, body content aligns with content blocks, and CTAs are placed where buttons appear in the layout.' : ''}]

This copy will be inserted into designed email templates, NOT plain text emails.
`}

NO JSON STRUCTURE. NO MARKDOWN. JUST COPY ELEMENTS FOR EMAIL TEMPLATES.${request.selectedFramework ? ` FRAMEWORK COMPLIANCE IS MANDATORY.` : ''}`;

  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key') {
      throw new Error('Anthropic API key not configured properly');
    }

    // Prepare message content with images if provided
    const messageContent: any[] = [{ type: 'text', text: userPrompt }];
    
    // Add email template images from training configuration (not from request)
    const emailTemplates = trainingConfig?.emailTemplates?.retention || [];
    if (emailTemplates.length > 0) {
      console.log(`Processing ${emailTemplates.length} email template(s) for visual layout guidance`);
      
      for (const [index, template] of emailTemplates.entries()) {
        try {
          // Clean the base64 string and detect format
          let mediaType = 'image/jpeg'; // default
          let cleanBase64 = template;
          
          // Remove data URL prefix if present
          if (template.includes(',')) {
            const parts = template.split(',');
            if (parts.length > 1) {
              cleanBase64 = parts[1];
              // Extract media type from data URL
              const dataUrlPrefix = parts[0];
              if (dataUrlPrefix.includes('image/png')) {
                mediaType = 'image/png';
              } else if (dataUrlPrefix.includes('image/gif')) {
                mediaType = 'image/gif';
              } else if (dataUrlPrefix.includes('image/webp')) {
                mediaType = 'image/webp';
              } else if (dataUrlPrefix.includes('image/jpeg') || dataUrlPrefix.includes('image/jpg')) {
                mediaType = 'image/jpeg';
              }
              console.log(`Template ${index + 1}: Extracted media type from data URL: ${mediaType}`);
            }
          } else {
            // Try to detect from magic bytes
            const headerBase64 = cleanBase64.substring(0, 16);
            const binaryString = atob(headerBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Check magic bytes for different formats
            if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
              mediaType = 'image/png';
              console.log(`Template ${index + 1}: Detected PNG format via magic bytes`);
            } else if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
              mediaType = 'image/jpeg';
              console.log(`Template ${index + 1}: Detected JPEG format via magic bytes`);
            } else if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && 
                       bytes[3] === 0x38 && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) {
              mediaType = 'image/gif';
              console.log(`Template ${index + 1}: Detected GIF format via magic bytes`);
            } else if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                       bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
              mediaType = 'image/webp';
              console.log(`Template ${index + 1}: Detected WebP format via magic bytes`);
            } else {
              console.log(`Template ${index + 1}: Unknown format, using JPEG as default. First 8 bytes:`, 
                         Array.from(bytes.slice(0, 8)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));
            }
          }

          // Resize template image if needed to prevent dimension errors
          const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(cleanBase64);
          
          console.log(`Template ${index + 1}: Final media type: ${finalMediaType}, Processed Base64 length: ${resizedImageData.length}`);

          messageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: resizedImageData
            }
          });
        } catch (error) {
          console.error(`Template ${index + 1}: Failed to process email template image:`, error);
          // Continue with other templates if one fails
        }
      }
    }
    
    // Add framework images if available
    if (request.selectedFramework?.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0) {
      console.log(`Processing ${request.selectedFramework.images.length} framework image(s) for visual layout reference`);
      
      for (const [index, image] of request.selectedFramework.images.entries()) {
        if (image.dataUri) {
          try {
            // Extract media type and base64 data from data URI
            let mediaType = 'image/jpeg'; // default
            let cleanBase64 = image.dataUri;
            
            if (image.dataUri.includes(',')) {
              const parts = image.dataUri.split(',');
              if (parts.length > 1) {
                cleanBase64 = parts[1];
                // Extract media type from data URL
                const dataUrlPrefix = parts[0];
                if (dataUrlPrefix.includes('image/png')) {
                  mediaType = 'image/png';
                } else if (dataUrlPrefix.includes('image/gif')) {
                  mediaType = 'image/gif';
                } else if (dataUrlPrefix.includes('image/webp')) {
                  mediaType = 'image/webp';
                } else if (dataUrlPrefix.includes('image/jpeg') || dataUrlPrefix.includes('image/jpg')) {
                  mediaType = 'image/jpeg';
                }
                console.log(`Framework image ${index + 1}: Extracted media type from data URL: ${mediaType}`);
              }
            } else if (image.mimeType) {
              // Use the stored mime type if available
              mediaType = image.mimeType;
              console.log(`Framework image ${index + 1}: Using stored media type: ${mediaType}`);
            }

            // Resize framework image if needed to prevent dimension errors
            const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(cleanBase64);
            
            console.log(`Framework image ${index + 1}: Final media type: ${finalMediaType}, Processed Base64 length: ${resizedImageData.length}`);

            messageContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: resizedImageData
              }
            });
          } catch (error) {
            console.error(`Framework image ${index + 1}: Failed to process image:`, error);
            // Continue with other images if one fails
          }
        }
      }
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2048,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    if (!content || content.trim().length === 0) {
      throw new Error('Received empty response from Anthropic API');
    }

    // Validate word count if a specific numeric constraint is provided
    if (request.selectedFramework?.expectedLength && /^\d+\s*words?$/i.test(request.selectedFramework.expectedLength.trim())) {
      const expectedWordCount = parseInt(request.selectedFramework.expectedLength.match(/\d+/)?.[0] || '0');
      const actualWordCount = content.trim().split(/\s+/).length;
      
      if (actualWordCount > expectedWordCount * 1.2) { // Allow 20% tolerance
        console.warn(`Word count validation failed: Expected ~${expectedWordCount} words, got ${actualWordCount} words`);
        // Log but don't throw error to avoid breaking the user experience
      }
    }
    
    return {
      response: content.trim(),
      debugInfo: {
        systemPrompt,
        userPrompt,
        requestPayload: request,
        rawResponse: content,
        wordCount: content.trim().split(/\s+/).length,
        expectedLength: request.selectedFramework?.expectedLength
      }
    };
  } catch (error) {
    console.error('Retention copy generation error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API key configuration error: ' + error.message);
      } else if (error.message.includes('rate_limit')) {
        throw new Error('API rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Anthropic account.');
      } else {
        throw new Error('Anthropic API error: ' + error.message);
      }
    }
    
    throw new Error('Failed to generate retention copy due to an unknown error');
  }
}

export async function generateSocialCaptions(request: {
  contentType: string;
  transcription: string;
  platform: string;
  goal: string;
  tone: string;
  variations: number;
  selectedProduct?: string;
  selectedProducts?: string[];
  concept?: string;
  imageData?: string; // Add image data parameter
}, trainingConfig: TrainingConfig) {
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Build comprehensive AI Settings context
  const aiSettingsContext = buildAISettingsContext(trainingConfig, request);
  
  // Build persona and product sections
  const safeConcept = request.concept || 'lifeJuggler';
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(request.selectedProduct, request.selectedProducts, trainingConfig);
  
  const systemPrompt = `You are a social media expert specializing in creating engaging organic social content for Jones Road Beauty. Your goal is to create authentic, platform-optimized captions that drive engagement and reflect the brand's "effortless beauty" philosophy.

${aiSettingsContext}

PLATFORM OPTIMIZATION:
- Instagram: Use relevant hashtags, encourage engagement, visual storytelling
- Facebook: Longer form content, community building, discussion starters  
- TikTok: Trending language, hooks, call-to-actions for engagement
- Multi-Platform: Adaptable content that works across channels

ENGAGEMENT TACTICS:
- Start with strong hooks
- Include questions to encourage comments
- Use relevant hashtags strategically
- Add clear call-to-actions
- Create shareable moments
- Encourage user-generated content`;

  const platformGuidance = {
    instagram: "Use 1-3 relevant hashtags, encourage saves/shares, ask engaging questions",
    facebook: "Longer captions (150-250 words), storytelling approach, community discussion",
    tiktok: "Trendy language, strong hooks, call-to-actions for engagement",
    "multi-platform": "Adaptable content that works across Instagram, Facebook, and TikTok"
  };

  // Determine content source for prompt
  let contentSource = '';
  let hasImageContent = false;
  
  if (request.transcription && request.transcription.trim()) {
    contentSource = `CONTENT TRANSCRIPTION: ${request.transcription}`;
  } else if (request.imageData) {
    contentSource = 'CONTENT: Analyze the uploaded image to create captions';
    hasImageContent = true;
  } else {
    throw new Error('Either transcription or image data is required');
  }

  const userPrompt = `Create ${request.variations} unique social media captions for ${request.platform} based on this content:

${contentSource}

CONTENT TYPE: ${request.contentType}
PLATFORM: ${request.platform}
GOAL: ${request.goal}
TONE: ${request.tone}
VARIATIONS: ${request.variations}

PLATFORM GUIDANCE: ${platformGuidance[request.platform as keyof typeof platformGuidance] || platformGuidance["multi-platform"]}

${targetPersonaSection}

Incorporate this product naturally into the captions
${selectedProductsSection}

REQUIREMENTS:
- Create exactly ${request.variations} distinct caption variations
- Each should be 50-150 words (adjust for platform)
- Include relevant hashtags where appropriate
- Add engaging hooks and call-to-actions
- Maintain Jones Road Beauty's authentic voice
- Make each variation unique in approach and angle
${hasImageContent ? '- Analyze the image content to create relevant captions that describe or relate to what is shown' : ''}

Return as a JSON array of strings:
["Caption 1 text...", "Caption 2 text...", "Caption 3 text..."]`;

  try {
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];
    
    if (hasImageContent && request.imageData) {
      // Process image data similar to generateAdCopy function
      let processedImageData = request.imageData;
      let mediaType = 'image/jpeg'; // default
      
      // Handle data URI format
      if (request.imageData.startsWith('data:image/')) {
        const mimeMatch = request.imageData.match(/^data:image\/([a-zA-Z0-9+/]+);base64,(.+)$/);
        if (mimeMatch) {
          mediaType = `image/${mimeMatch[1]}`;
          processedImageData = mimeMatch[2];
        }
      }
      
      // Resize image if needed to prevent dimension errors
      const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(processedImageData);
      
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: resizedImageData
        }
      });
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2048,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse JSON response
    let captions;
    try {
      // First try direct parsing
      captions = JSON.parse(content);
      if (!Array.isArray(captions)) {
        throw new Error('Not an array');
      }
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        try {
          captions = JSON.parse(jsonMatch[1]);
          if (!Array.isArray(captions)) {
            throw new Error('Not an array');
          }
        } catch (innerParseError) {
          console.log('Failed to parse extracted JSON:', innerParseError);
          captions = null;
        }
      }
      
      if (!captions) {
        // Try to find a JSON array pattern in the content
        const arrayMatch = content.match(/\[[\s\S]*?\]/);
        if (arrayMatch) {
          try {
            captions = JSON.parse(arrayMatch[0]);
            if (!Array.isArray(captions)) {
              throw new Error('Not an array');
            }
          } catch (arrayParseError) {
            console.log('Failed to parse array match:', arrayParseError);
            captions = null;
          }
        }
      }
      
      if (!captions) {
        // Fallback: split by double newlines and clean up
        console.log('Using fallback parsing method for content:', content.substring(0, 200) + '...');
        captions = content
          .split('\n\n')
          .filter(caption => caption.trim().length > 0)
          .map(caption => caption.trim().replace(/^["']|["']$/g, '')) // Remove surrounding quotes
          .slice(0, request.variations);
      }
    }
    
    return { 
      captions,
      debugInfo: {
        systemPrompt,
        userPrompt,
        rawResponse: content,
        modelUsed: DEFAULT_MODEL_STR
      }
    };
  } catch (error) {
    console.error('Social captions generation error:', error);
    throw new Error('Failed to generate social captions');
  }
}

export async function generateStorySequence(request: {
  contentType: string;
  transcription: string;
  sequenceType: string;
  length: number;
  tone: string;
  selectedProduct?: string;
  selectedProducts?: string[];
  concept?: string;
  imageData?: string; // Add image data parameter
}, trainingConfig: TrainingConfig) {
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Build comprehensive AI Settings context
  const aiSettingsContext = buildAISettingsContext(trainingConfig, request);
  
  // Build persona and product sections
  const safeConcept = request.concept || 'lifeJuggler';
  const targetPersonaSection = buildTargetPersonaSection(safeConcept, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(request.selectedProduct, request.selectedProducts, trainingConfig);
  
  const systemPrompt = `You are a social media strategist specializing in Instagram Stories for Jones Road Beauty. Your goal is to create engaging story sequences that drive engagement and showcase the brand's "effortless beauty" philosophy.

${aiSettingsContext}

STORY BEST PRACTICES:
- Strong opening hook to stop the scroll
- Clear visual direction for each slide
- Progressive narrative that builds engagement
- Interactive elements (polls, questions, swipe-ups)
- Strong call-to-action in final slides
- Consistent brand aesthetic and voice`;

  const sequenceTypeGuidance = {
    "product-showcase": "Feature product benefits, application, results, before/after",
    "tutorial": "Step-by-step process, educational content, how-to guidance",
    "behind-scenes": "Process, team, authenticity, brand personality, workspace",
    "before-after": "Transformation journey, results, testimonials, progress",
    "day-in-life": "Routine integration, lifestyle content, relatable moments"
  };

  const toneGuidance = {
    "authentic-personal": "Personal stories, vulnerable moments, relatable experiences",
    "educational-expert": "Tips, tutorials, ingredient benefits, how-to content",
    "fun-playful": "Lighthearted, humorous, entertaining content",
    "inspirational": "Motivational, empowering, confidence-building messages",
    "conversational": "Casual chat, friend-to-friend tone, everyday language"
  };

  // Determine content source for prompt
  let contentSource = '';
  let hasImageContent = false;
  
  if (request.transcription && request.transcription.trim()) {
    contentSource = `CONTENT: ${request.transcription}`;
  } else if (request.imageData) {
    contentSource = 'CONTENT: Analyze the uploaded image to create story sequence';
    hasImageContent = true;
  } else {
    throw new Error('Either transcription or image data is required');
  }

  const userPrompt = `Create a ${request.length}-slide Instagram Story sequence based on this content:

${contentSource}

SEQUENCE TYPE: ${request.sequenceType}
TONE: ${request.tone}
LENGTH: ${request.length} slides

SEQUENCE GUIDANCE: ${sequenceTypeGuidance[request.sequenceType as keyof typeof sequenceTypeGuidance] || "Create engaging story content"}
TONE GUIDANCE: ${toneGuidance[request.tone as keyof typeof toneGuidance] || "Authentic and engaging"}

${targetPersonaSection}

Incorporate this product naturally into the captions
${selectedProductsSection}

REQUIREMENTS:
- Create exactly ${request.length} slides
- Each slide should have: title, content, visual direction
- Progressive narrative that builds engagement
- Include interactive elements where appropriate
- Strong opening hook and closing call-to-action
- Maintain Jones Road Beauty's authentic voice
- Provide specific visual direction for each slide
${hasImageContent ? '- Analyze the image content to create relevant story slides that describe or relate to what is shown' : ''}

Return as JSON array with this structure:
[
  {
    "slide": 1,
    "type": "hook/intro/tutorial/etc",
    "title": "Slide title",
    "content": "Main text content for the slide",
    "visualDirection": "Specific direction for what to show visually"
  }
]`;

  try {
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];
    
    if (hasImageContent && request.imageData) {
      // Process image data similar to generateAdCopy function
      let processedImageData = request.imageData;
      let mediaType = 'image/jpeg'; // default
      
      // Handle data URI format
      if (request.imageData.startsWith('data:image/')) {
        const mimeMatch = request.imageData.match(/^data:image\/([a-zA-Z0-9+/]+);base64,(.+)$/);
        if (mimeMatch) {
          mediaType = `image/${mimeMatch[1]}`;
          processedImageData = mimeMatch[2];
        }
      }
      
      // Resize image if needed to prevent dimension errors
      const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(processedImageData);
      
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: resizedImageData
        }
      });
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2048,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse JSON response
    let slides;
    try {
      // Extract JSON from response - handle potential markdown wrapping
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      slides = JSON.parse(jsonString);
      
      if (!Array.isArray(slides)) {
        throw new Error('Not an array');
      }
    } catch (parseError) {
      // Try to extract from markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch) {
        try {
          slides = JSON.parse(codeBlockMatch[1]);
          if (!Array.isArray(slides)) {
            throw new Error('Not an array');
          }
        } catch (innerParseError) {
          console.log('Failed to parse code block JSON:', innerParseError);
          slides = null;
        }
      }
      
      if (!slides) {
        // Fallback: create simple slides from content
        console.log('Using fallback parsing for story sequence');
        const fallbackSlides = [];
        const lines = content.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < Math.min(request.length, lines.length); i++) {
          fallbackSlides.push({
            slide: i + 1,
            type: i === 0 ? 'hook' : i === request.length - 1 ? 'cta' : 'content',
            title: `Slide ${i + 1}`,
            content: lines[i].trim(),
            visualDirection: hasImageContent ? 'Use the uploaded image as reference' : 'Show relevant visual content'
          });
        }
        
        slides = fallbackSlides;
      }
    }
    
    return { 
      sequence: slides,
      debugInfo: {
        systemPrompt,
        userPrompt,
        rawResponse: content,
        modelUsed: DEFAULT_MODEL_STR
      }
    };
  } catch (error) {
    console.error('Story sequence generation error:', error);
    throw new Error('Failed to generate story sequence');
  }
}

// Product Launch Brief Generation
interface BriefRequest {
  notes: string;
  googleDriveLinks?: string[];
  selectedProduct?: string;
  selectedProducts?: string[];
  concept?: string;
  brandDrBalance?: number;
  useJonesBrandGuide?: boolean;
  metadata?: GenerationMetadata;
}

export async function generateBrief(request: BriefRequest, trainingConfig: TrainingConfig) {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build comprehensive AI Settings context including product claims
    const aiSettingsContext = buildAISettingsContext(trainingConfig, {
      concept: request.concept,
      selectedProduct: request.selectedProduct,
      selectedProducts: request.selectedProducts,
      brandDrBalance: request.brandDrBalance,
      useJonesBrandGuide: request.useJonesBrandGuide
    });

    // Use system prompt from training config if available, otherwise use default
    let systemPrompt = trainingConfig.stationPrompts?.productLaunch?.systemPrompt || `You are an expert marketing strategist and brief writer specializing in product launches. Your role is to create comprehensive, strategic product launch briefs that guide successful campaign execution.

# Brand Guidelines:
Core Positioning: ${trainingConfig.brandGuidelines.corePositioning}

`;

    // Add AI Settings context (includes product claims, brand guidelines, etc.)
    systemPrompt += `\n${aiSettingsContext}\n`;

    // Add brand voice rules if available and not using custom system prompt
    if (!trainingConfig.stationPrompts?.productLaunch?.systemPrompt && trainingConfig.brandGuidelines.brandVoice && trainingConfig.brandGuidelines.brandVoice.length > 0) {
      systemPrompt += 'Brand Voice Rules:\n';
      trainingConfig.brandGuidelines.brandVoice.forEach((rule, index) => {
        const isEnabled = !trainingConfig.brandGuidelines.enabledBrandVoice || trainingConfig.brandGuidelines.enabledBrandVoice[index];
        if (isEnabled) {
          systemPrompt += `- ${rule}\n`;
        }
      });
      systemPrompt += '\n';
    }

    // Add brief structure from training config if available
    if (trainingConfig.stationPrompts?.productLaunch?.briefStructure && !trainingConfig.stationPrompts?.productLaunch?.systemPrompt) {
      systemPrompt += `\n# Brief Structure Template:\n${trainingConfig.stationPrompts.productLaunch.briefStructure}\n\nUse this structure template when creating the brief.`;
    } else if (!trainingConfig.stationPrompts?.productLaunch?.systemPrompt) {
      systemPrompt += `
# Brief Writing Guidelines:

## Structure Requirements:
- Executive Summary
- Product Overview
- Target Audience Analysis
- Competitive Landscape
- Key Messages & Positioning
- Launch Strategy & Timeline
- Channel Strategy
- Success Metrics & KPIs
- Budget Considerations
- Risk Assessment

## Writing Style:
- Professional yet accessible tone
- Clear, actionable recommendations
- Data-driven insights where possible
- Strategic thinking with tactical execution details
- Concise but comprehensive coverage

## Output Format:
- Use clear headings and subheadings
- Include bullet points for easy scanning
- Provide specific, actionable recommendations
- Include timeline considerations
- Suggest success metrics

Create a strategic product launch brief that synthesizes the provided information into a comprehensive launch strategy.`;
    }

    // Use user prompt template from training config if available, otherwise use default
    let userPrompt: string;
    if (trainingConfig.stationPrompts?.productLaunch?.userPromptTemplate) {
      userPrompt = trainingConfig.stationPrompts.productLaunch.userPromptTemplate
        .replace('{notes}', request.notes)
        .replace('{googleDriveLinks}', request.googleDriveLinks && request.googleDriveLinks.length > 0 
          ? `Referenced Past Briefs:\n${request.googleDriveLinks.map((link, i) => `${i + 1}. ${link}`).join('\n')}\n\nNote: Please reference the strategic frameworks and successful elements from these past briefs in your recommendations.\n`
          : '');
    } else {
      userPrompt = `Based on the following meeting notes and information, create a comprehensive product launch brief:\n\n# Meeting Notes & Input:\n${request.notes}`;
      
      // Add Google Drive references if provided
      if (request.googleDriveLinks && request.googleDriveLinks.length > 0) {
        userPrompt += `\n\n# Referenced Past Briefs:\n`;
        request.googleDriveLinks.forEach((link, index) => {
          userPrompt += `${index + 1}. ${link}\n`;
        });
        userPrompt += `\nNote: Please reference the strategic frameworks and successful elements from these past briefs in your recommendations.`;
      }
      
      userPrompt += `\n\nPlease create a strategic, comprehensive product launch brief that incorporates these insights and provides clear direction for the launch campaign.`;
    }

    const response = await anthropic.messages.create({
      model: trainingConfig.modelParameters.model,
      max_tokens: trainingConfig.modelParameters.maxTokens,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return { 
        brief: content.text,
        metadata: request.metadata
      };
    } else {
      throw new Error('Unexpected response type from Claude');
    }
  } catch (error) {
    console.error('Brief generation error:', error);
    throw new Error('Failed to generate product launch brief');
  }
}

export async function generateRetentionVisualPreview(request: {
  copyContent: string;
  platform: string;
  emailType?: string;
  selectedFramework?: any;
}, trainingConfig?: TrainingConfig) {
  const systemPrompt = `You are an expert email and SMS design specialist for Jones Road Beauty. Create HTML/CSS mockups that EXACTLY replicate Jones Road Beauty's actual email design style and layout.

CRITICAL REQUIREMENTS:
1. Generate COMPLETE, SELF-CONTAINED HTML with inline CSS
2. REPLICATE Jones Road Beauty's actual email design patterns
3. Use EXACT Jones Road Beauty brand styling and layout
4. For SMS: Create iPhone Messages-style interface
5. Include proper email structure matching Jones Road's templates
6. Make it pixel-perfect to Jones Road's actual emails
7. Include realistic placeholder images matching Jones Road's style
8. Ensure responsive design for mobile and desktop

JONES ROAD BEAUTY BRAND STYLING:
- Primary Brand Color: #e0ded8 (Jones Road)
- Secondary: #F5F5F5 (Light Gray backgrounds)
- Accent: #E8F4F8 (Light Blue highlights)
- Text Primary: #333333 (Dark Gray)
- Text Secondary: #666666 (Medium Gray)
- Background: #FFFFFF (White)
- Font Family: Use web-safe fonts like Arial, Helvetica, sans-serif for email compatibility

JONES ROAD EMAIL DESIGN PATTERNS:
- Clean, minimal layout with plenty of white space
- Centered content with max-width around 600px
- Simple header with Jones Road logo
- Hero sections with large, clean typography
- Product images with clean borders or shadows
- CTA buttons: Rounded corners, Jones Road blue background, white text
- Footer: Simple, clean with social links and unsubscribe
- Mobile-first responsive design
- Professional, premium beauty brand aesthetic

EMAIL TEMPLATE STRUCTURE:
- Header: Simple logo area, possibly with navigation
- Hero: Large headline, subheadline, hero image
- Content sections: Clean typography, product showcases
- CTA sections: Prominent buttons with proper spacing
- Footer: Standard email footer with links

SMS DESIGN:
- iPhone Messages interface mockup
- Jones Road Beauty as sender name
- Message bubbles with proper iOS styling
- Realistic timestamps and interface elements

VISUAL LAYOUT ANALYSIS:
${request.selectedFramework?.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0 ? 
`CRITICAL: Framework images are provided. You MUST analyze these images to understand the EXACT layout, spacing, typography, and visual hierarchy. Create HTML that perfectly matches the visual structure shown in these reference images.` : 
'Create a layout that follows Jones Road Beauty\'s typical email design patterns - clean, minimal, premium beauty brand aesthetic.'}

OUTPUT REQUIREMENTS:
- Return ONLY the complete HTML code
- DO NOT wrap in markdown code blocks (no \`\`\`html or \`\`\`)
- DO NOT include any markdown formatting
- Include all CSS inline within <style> tags in the <head>
- No external dependencies or imports
- Self-contained and ready to render
- Include proper viewport meta tags for responsive design
- Make it look EXACTLY like a real Jones Road Beauty email
- Start directly with <!DOCTYPE html> or <html>`;

  const userPrompt = `Create a ${request.platform.toLowerCase()} visual mockup that looks EXACTLY like a real Jones Road Beauty ${request.platform.toLowerCase()}.

COPY CONTENT TO STYLE:
${request.copyContent}

PLATFORM: ${request.platform}
${request.emailType ? `EMAIL TYPE: ${request.emailType}` : ''}
${request.selectedFramework ? `FRAMEWORK: ${request.selectedFramework.displayName}` : ''}

DESIGN REQUIREMENTS:
${request.platform === 'Email' ? `
EMAIL DESIGN SPECIFICATIONS:
- Replicate Jones Road Beauty's actual email design style
- Header: Clean logo area (use placeholder logo)
- Hero section: Large, impactful headline matching the copy
- Content sections: Clean typography with proper hierarchy
- Product showcases: Clean product image placeholders with proper spacing
- CTA buttons: Jones Road blue (#004182), rounded corners, white text
- Footer: Standard email footer with unsubscribe and company info
- Color scheme: Whites, light grays, with Jones Road blue accents
- Typography: Clean, readable fonts (Arial/Helvetica for email safety)
- Layout: Centered, max-width 600px, mobile responsive
- Spacing: Generous white space, premium feel
- Images: Use placeholder images that match Jones Road's clean aesthetic
- Make it look like it came directly from Jones Road Beauty's email marketing team
` : `
SMS DESIGN SPECIFICATIONS:
- Create realistic iPhone Messages interface
- Sender: "Jones Road Beauty" 
- Message bubbles: iOS blue (#007AFF) for sent messages
- Background: iOS Messages gray background (#F2F2F7)
- Typography: San Francisco font style (or similar)
- Include realistic timestamp
- Show message as received on iPhone
- Keep message concise and readable
- Include Jones Road branding in the message content
`}

CRITICAL SUCCESS FACTORS:
- Must look indistinguishable from actual Jones Road Beauty emails/SMS
- Professional, premium beauty brand aesthetic
- Clean, minimal design with strategic use of Jones Road blue
- Proper spacing and typography hierarchy
- Mobile-responsive design
- Include realistic placeholder content (product images, logos, etc.)

${request.selectedFramework?.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0 ? 
`FRAMEWORK VISUAL COMPLIANCE:
The selected framework includes reference images. Analyze these images carefully and ensure your HTML layout EXACTLY matches:
- Header placement and styling
- Content block organization
- Image placement and sizing
- CTA button positioning and styling
- Footer layout and content
- Overall spacing and proportions
- Typography hierarchy and sizing
- Color usage and branding elements

Your HTML must be structured to perfectly replicate the visual layout shown in the framework images.` : ''}

Return the complete, self-contained HTML that renders a pixel-perfect Jones Road Beauty ${request.platform.toLowerCase()}.`;

  try {
    // Prepare message content with framework images if available
    const messageContent: any[] = [{ type: 'text', text: userPrompt }];
    

    // Add framework images if available for visual reference
    if (request.selectedFramework?.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0) {
      console.log(`Processing ${request.selectedFramework.images.length} framework image(s) for visual preview generation`);
      
      for (const [index, imageObj] of request.selectedFramework.images.entries()) {
        try {
          let imageData = '';
          let mediaType = 'image/jpeg';
          
          // Handle different image object formats
          if (typeof imageObj === 'string') {
            // Direct base64 string
            imageData = imageObj;
          } else if (imageObj.dataUri) {
            // Object with dataUri property
            const mimeMatch = imageObj.dataUri.match(/^data:image\/([a-zA-Z0-9+/]+);base64,(.+)$/);
            if (mimeMatch) {
              mediaType = `image/${mimeMatch[1]}`;
              imageData = mimeMatch[2];
            }
          } else if (imageObj.data) {
            // Object with data property
            imageData = imageObj.data;
            mediaType = imageObj.mediaType || 'image/jpeg';
          }
          
          if (imageData) {
            // Resize image if needed
            const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(imageData);
            
            messageContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: resizedImageData
              }
            });
            
            console.log(`Framework image ${index + 1} added for visual reference`);
          }
        } catch (error) {
          console.error(`Failed to process framework image ${index + 1}:`, error);
        }
      }
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 4000,
      messages: [{ role: 'user', content: messageContent }],
    });

    let htmlContent = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Clean the HTML content by removing markdown code blocks more thoroughly
    // Remove opening code blocks (```html, ```HTML, ```, etc.)
    htmlContent = htmlContent.replace(/^```[a-zA-Z]*\s*/gi, '').trim();
    
    // Remove closing code blocks (```)
    htmlContent = htmlContent.replace(/```\s*$/gi, '').trim();
    
    // Remove any remaining ``` that might be in the middle or at edges
    htmlContent = htmlContent.replace(/^```/g, '').replace(/```$/g, '').trim();
    
    // Additional cleanup for any stray markdown
    htmlContent = htmlContent.replace(/^\s*```html\s*/gi, '').replace(/^\s*```\s*/gi, '').trim();
    
    return {
      htmlContent,
      platform: request.platform,
      emailType: request.emailType,
      rawResponse: response.content[0].type === 'text' ? response.content[0].text : ''
    };
  } catch (error) {
    console.error('Visual preview generation error:', error);
    throw new Error('Failed to generate visual preview');
  }
}