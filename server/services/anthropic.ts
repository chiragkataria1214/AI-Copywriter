import Anthropic from '@anthropic-ai/sdk';
import { type TrainingConfig } from '@shared/training-config';
import { AIResponseParser, AIPromptBuilder, AILogger, TextUtils } from './anthropic-helpers';
import { processImageForAnthropic } from './image-helper';
import { buildAllBrandSettingsContext, buildSelectedProductsSection, buildSelectedTargetPersonaSection } from './components';
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_MODEL_STR, DEFAULT_PERSONA_KEY } from '@shared/constants';
import { RevisionRequest, AdCopyRequest, LandingPageRequest, CustomCopyRequest, StaticAdAnalysisRequest, BriefRequest } from './anthropic-interface';
import { BRAND_NAME } from '@shared/constants';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});

export async function reviseContent(request: RevisionRequest, trainingConfig: TrainingConfig): Promise<{ revisedContent: string; debugInfo: any }> {
  const { originalContent, revisionInstructions, contentType, context } = request;
  
  // 🔍 DEBUG: Log incoming revision request
  console.group('🔄 BACKEND REVISION REQUEST');
  console.log('📝 Revision Instructions:', revisionInstructions);
  console.log('🎯 Content Type:', contentType);
  console.log('📄 Original Content Length:', originalContent?.length || 0);
  console.log('📄 Original Content Preview:', originalContent?.substring(0, 200) + (originalContent?.length > 200 ? '...' : ''));
  console.log('🎯 Context:', context);
  console.log('🕐 Request Timestamp:', new Date().toISOString());

  // Map content types to station names for getting the appropriate system prompt
  const contentTypeToStation: Record<string, string> = {
    'headline': 'adCopy',
    'primaryText': 'adCopy',
    'landingCopy': 'landingPage',
    'custom': 'customRequest',
    'email': 'email',
    'sms': 'sms',
    'retention': 'email', // Map retention to email station for general retention copy
    'staticAd': 'staticAd',
    'socialCaption': 'socialCaptions',
    'storySequence': 'socialCaptions' // Map story sequence to social captions station
  };

  const stationName = contentTypeToStation[contentType] || 'customRequest';
  
  console.log('🏭 Station Mapping:', { contentType, stationName });
  console.log('📊 Available Stations:', Object.keys(trainingConfig?.stationPrompts || {}));

  // Get station-specific system prompt from training config
  const baseSystemPrompt = (trainingConfig?.stationPrompts as any)?.[stationName]?.systemPrompt;
  
  console.log('📋 Base System Prompt Found:', !!baseSystemPrompt);
  console.log('📋 Base System Prompt Length:', baseSystemPrompt?.length || 0);

  // Build AI Settings context using the helper function
  const aiSettingsContext = buildAllBrandSettingsContext(trainingConfig, {
    persona: context?.persona || '',
    selectedProduct: context?.selectedProduct,
    selectedProducts: context?.selectedProducts,
    brandDrBalance: context?.brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
    useJonesBrandGuide: context?.useJonesBrandGuide ?? true
  });
  
  console.log('🎯 AI Settings Context Length:', aiSettingsContext?.length || 0);
  console.log('🎯 Context Parameters:', {
    persona: context?.persona,
    selectedProduct: context?.selectedProduct,
    selectedProducts: context?.selectedProducts,
    brandDrBalance: context?.brandDrBalance,
    useJonesBrandGuide: context?.useJonesBrandGuide
  });

  // Create revision-specific system prompt
  let systemPrompt = '';
  
  // Check if this is a listicle revision by looking for listicle structure in original content
  const isListicleRevision = originalContent && (
    originalContent.includes('"listicle"') || 
    originalContent.includes('"bullets"') || 
    originalContent.includes('"bullet_1_hook"') ||
    originalContent.includes('bullet_1_hook') ||
    originalContent.includes('bullet_2_solution')
  );
  
  console.log('🔍 REVISION LISTICLE DETECTION:', { 
    isListicleRevision, 
    contentType,
    hasListicleKey: originalContent?.includes('"listicle"'),
    hasBulletsKey: originalContent?.includes('"bullets"'),
    originalContentPreview: originalContent?.substring(0, 200)
  });

  if (baseSystemPrompt) {
    // Use station-specific prompt as base and add revision context
    systemPrompt = `You are an expert copywriter specializing in improving content. You will be revising ${contentType} copy based on specific improvement instructions.

${baseSystemPrompt}

${aiSettingsContext}

REVISION TASK:
Your task is to revise ${contentType} copy based on specific improvement instructions while maintaining the brand voice and style established above.

${isListicleRevision ? `
CRITICAL: This is a LISTICLE revision. You MUST return the response in the exact JSON format below:

\`\`\`json
{
  "listicle": {
    "meta": {
      "target_audience": "string - specific audience segment",
      "awareness_level": "problem-aware|solution-aware|product-aware", 
      "ad_angle_match": "string - primary ad angle being matched",
      "word_count": "number - total words",
      "read_time_seconds": "number - estimated read time"
    },
    "headline": {
      "text": "string - 8-15 words",
      "framework_type": "problem_specific_benefit|curiosity_paradox|authority_disruption|positive_polarization|urgency_benefit",
      "hook_strength": "high|medium|low"
    },
    "bullets": {
      "bullet_1_hook": {
        "text": "string - 1-3 sentences",
        "purpose": "problem_agitation",
        "emotional_trigger": "string - primary emotion targeted",
        "template_used": "pain_point|disruption|urgency"
      },
      "bullet_2_solution": {
        "text": "string - 2-4 sentences",
        "purpose": "authority_establishment", 
        "credibility_element": "string - main credibility factor",
        "template_used": "science_innovation|authority|unique_mechanism"
      },
      "bullet_3_experience": {
        "text": "string - 2-4 sentences",
        "purpose": "desire_creation",
        "transformation_focus": "string - main benefit highlighted", 
        "template_used": "ease|transformation_timeline|sensory"
      },
      "bullet_4_validator": {
        "text": "string - 1-3 sentences",
        "purpose": "trust_building",
        "proof_types": ["array of proof types used"],
        "template_used": "media|expert|clinical|customer"
      },
      "bullet_5_closer": {
        "text": "string - 1-2 sentences",
        "purpose": "action_driver",
        "urgency_element": "string - scarcity/urgency factor",
        "template_used": "bundle_urgency|risk_reversal|scarcity"
      }
    },
    "social_proof": {
      "types_included": ["array - minimum 3 types"],
      "volume_metrics": "string - if included",
      "clinical_data": "string - if included",
      "media_validation": "string - if included", 
      "expert_endorsements": "string - if included",
      "customer_testimonials": "string - if included",
      "founder_authority": "string - if included"
    },
    "optimization_compliance": {
      "reading_level": "number - grade level",
      "customer_language_used": "boolean",
      "specific_numbers_included": "boolean",
      "power_words_count": "number", 
      "mobile_optimized": "boolean",
      "conversion_focused": "boolean"
    },
    "psychological_progression": {
      "attention_grab": "boolean - headline + bullet 1",
      "interest_build": "boolean - bullet 2",
      "desire_create": "boolean - bullet 3", 
      "trust_establish": "boolean - bullet 4",
      "action_drive": "boolean - bullet 5"
    },
    "performance_indicators": {
      "scroll_stopping_power": "high|medium|low",
      "conversion_readiness": "high|medium|low",
      "message_continuity": "perfect|good|needs_work",
      "mobile_consumption": "optimized|adequate|poor"
    }
  }
}
\`\`\`

You MUST return ONLY the JSON structure above. Do not include any explanations or additional text outside the JSON.
` : ''}

${contentType === 'custom' ? `
SPECIAL NOTES FOR CUSTOM COPY REVISION:
- This could be any format: social media, email, brief, announcement, etc.
- Maintain the original format and structure unless specifically asked to change it
- Focus on the specific improvements requested while keeping the established brand voice
- Be adaptable to any copywriting format or purpose
- Use clean, plain text formatting without special characters like asterisks, hashtags, or markdown
- Output should be clean and readable without formatting symbols
` : ''}

${contentType === 'socialCaption' ? `
SPECIAL NOTES FOR SOCIAL CAPTION REVISION:
- This is a social media caption.
- Consider platform-specific conventions (e.g., hashtags for Instagram, professional tone for LinkedIn).
- Ensure the caption is engaging and encourages interaction.
- Keep the caption concise and easy to read.
` : ''}

${contentType === 'sms' || contentType === 'email' || contentType === 'retention' ? `
SPECIAL NOTES FOR RETENTION COPY REVISION:
- This is ${contentType === 'sms' ? 'SMS' : contentType === 'email' ? 'email' : 'general retention'} content
- Maintain platform-appropriate length and formatting (Email vs SMS vs general retention)
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

${contentType === 'storySequence' ? `
SPECIAL NOTES FOR STORY SEQUENCE REVISION:
- This is a story sequence slide/frame for social media stories
- Maintain the slide structure with title, content, and visual direction
- Keep content concise and visually engaging for mobile viewing
- Ensure the content flows well with other slides in the sequence
- Consider the visual direction when crafting the text content
- Use clean, plain text formatting without markdown or special characters
- Focus on creating compelling, swipeable content that holds attention
` : ''}

${contentType === 'staticAd' ? `
SPECIAL NOTES FOR STATIC AD ANALYSIS REVISION:
- This is analysis of an existing static ad image
- Maintain analytical depth while improving clarity and actionability
- Focus on performance insights, creative feedback, and strategic recommendations
- Structure insights in a clear, scannable format
- Balance creative critique with strategic business impact
- Use clean, plain text formatting without markdown or special characters
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
- Target Audience: ${context.persona}${context.targetAudience ? ` (${context.targetAudience})` : ''}
- Product: ${context.selectedProduct || 'General brand content'}
- Brand/DR Balance: ${context.brandDrBalance || DEFAULT_BRAND_DR_BALANCE}% brand voice
${context.customBrief ? `- Custom Brief: ${context.customBrief}` : ''}
${context.customRequest && contentType === 'custom' ? `- Original Request: ${context.customRequest}` : ''}
` : ''}

Please revise the content applying the improvement instructions while maintaining the established brand voice and the original intent.`;

  console.log('📋 Final System Prompt Length:', systemPrompt.length);
  console.log('📄 Final User Prompt Length:', userPrompt.length);
  console.log('📄 User Prompt Preview:', userPrompt.substring(0, 300) + (userPrompt.length > 300 ? '...' : ''));

  try {
    const startTime = Date.now();
    console.log('🤖 Sending request to Anthropic API...');
    
    // Increase max tokens for landing copy revisions (especially listicle format)
    const maxTokens = contentType === 'landingCopy' ? 8000 : 1024;
    
    console.log('⚙️ Request Parameters:', {
      model: DEFAULT_MODEL_STR,
      max_tokens: maxTokens,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      contentType: contentType
    });

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const endTime = Date.now();
    console.log('✅ Anthropic API Response received in:', (endTime - startTime) + 'ms');
    console.log('🤖 Response Usage:', response.usage);
    console.log('🤖 Response Model:', response.model);

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('📄 Raw AI Response Length:', content.length);
    console.log('📄 Raw AI Response Preview:', content.substring(0, 300) + (content.length > 300 ? '...' : ''));

    // Clean up the response - remove quotes and extra formatting
    const revisedContent = content
      .replace(/^["'](.+)["']$/s, '$1') // Remove surrounding quotes
      .replace(/^\*\*(.+)\*\*$/s, '$1') // Remove bold formatting
      .trim();

    console.log('✨ Cleaned Response Length:', revisedContent.length);
    console.log('✨ Cleaned Response Preview:', revisedContent.substring(0, 300) + (revisedContent.length > 300 ? '...' : ''));
    console.log('✅ Revision completed successfully');
    console.groupEnd();

    return {
      revisedContent,
      debugInfo: {
        systemPrompt,
        userPrompt,
        requestPayload: request,
        rawResponse: content
      }
    };
  } catch (error) {
    console.error('❌ Content revision error:', error);
    console.error('💥 Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    console.groupEnd();
    throw new Error('Failed to revise content');
  }
}

export async function generateAdCopy(request: AdCopyRequest, trainingConfig: TrainingConfig) {
  const { transcription, customBrief, persona, landingPageUrl, brandDrBalance, useJonesBrandGuide, airLink, uploadedImage, selectedProduct, selectedProducts } = request;
  // Validate required parameters
  if (!persona || persona === 'none') {
    throw new Error('Persona is required and must be provided from database persona data.');
  }

  // Provide safe defaults for undefined values
  const safeBrandDrBalance = brandDrBalance || DEFAULT_BRAND_DR_BALANCE;
  const safePersona = persona || DEFAULT_PERSONA_KEY;

  // Build enhanced system prompt using StationPromptManager
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt('adCopy', trainingConfig, request, {
    persona: safePersona,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide
  });

  // Build user prompt using the same structure as system prompt (no enhancements)
  const userPrompt = await AIPromptBuilder.buildStationUserPrompt(
    'adCopy',
    trainingConfig,
    request,
    {
      persona: safePersona,
      selectedProduct,
      selectedProducts,
      brandDrBalance: safeBrandDrBalance,
      useJonesBrandGuide
    }
  );


  const { contextSection: imageAnalysisSection, hasImageContent, imageInput } =
    AIPromptBuilder.buildImageAnalysisContext(uploadedImage, airLink, 'ad_creative');


  // Set image variables for message content
  const base64Image = hasImageContent && imageInput?.startsWith('data:') ? imageInput : '';
  const imageUrl = hasImageContent && imageInput?.startsWith('http') ? imageInput : '';

  try {
    // Debug: log final rendered prompts being sent to the model
    // AILogger.logFinalPrompts('Ad Copy', systemPrompt, userPrompt);

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
    const modelParams = AIPromptBuilder.getStationModelParams('adCopy', trainingConfig);

    const response = await anthropic.messages.create({
      model: modelParams.model,
      system: systemPrompt,
      max_tokens: modelParams.max_tokens,
      temperature: modelParams.temperature,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse AI response using centralized parser
    const { headlines, primaryText, testingFocus, strategicInsights } = AIResponseParser.parseWithFallback(content);

    return {
      headlines,
      primaryText,
      testingFocus,
      strategicInsights,
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        modelParams.model,
        request,
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
  const { landingPageType, productBrief, persona, useAdsContent, adsContent, brandDrBalance, selectedProduct, selectedProducts, mainAngle, transcription } = request;

  // Validate required parameters
  if (!persona || persona === 'none') {
    throw new Error('Persona is required and must be provided from database persona data.');
  }

  const safeBrandDrBalance = brandDrBalance || DEFAULT_BRAND_DR_BALANCE;
  const safePersona = persona || DEFAULT_PERSONA_KEY;

  // Build system prompt using the same builder approach as ad copy
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt(
    'landingPage',
    trainingConfig,
    request,
    {
      persona: safePersona,
      selectedProduct,
      selectedProducts,
      brandDrBalance: safeBrandDrBalance,
      useJonesBrandGuide: true
    }
  );
  // Build user prompt using the same structure as system prompt (no enhancements)
  const userPrompt = await AIPromptBuilder.buildStationUserPrompt(
    'landingPage',
    trainingConfig,
    request,
    {
      persona: safePersona,
      selectedProduct,
      selectedProducts,
      brandDrBalance: safeBrandDrBalance,
      useJonesBrandGuide: true
    }
  );

  // AILogger.logFinalPrompts('Landing Page', systemPrompt, userPrompt);

  try {
    // Use station-specific model parameters for Landing Page
    const modelParams = AIPromptBuilder.getStationModelParams('landingPage', trainingConfig);
    
    // Increase max tokens for listicle format due to detailed JSON structure
    const maxTokens = landingPageType === 'listicle' ? 8000 : modelParams.max_tokens;
    

    const response = await anthropic.messages.create({
      model: modelParams.model,
      system: systemPrompt,
      max_tokens: maxTokens,
      temperature: modelParams.temperature,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Handle different landing page types
    if (landingPageType === 'listicle') {
      // Parse listicle response using specialized parser
      const { listicle, rawContent } = AIResponseParser.parseListicleResponse(content);
      
      return {
        headline: listicle?.headline?.text || '',
        subheadline: '',
        introduction: '',
        sections: [],
        cta: '',
        riskReversal: '',
        socialProof: '',
        conclusion: '',
        listicle: listicle, // Add the full listicle structure
        rawResponse: content,
        stats: {
          totalWords: content.split(/\s+/).length,
          sectionCount: 0,
          avgSectionLength: 0
        },
        debugInfo: AIPromptBuilder.createDebugInfo(
          systemPrompt,
          userPrompt,
          content,
          modelParams.model,
          request
        )
      };
    } else if (landingPageType === 'multi_product_page') {
      // Parse multi product page response using dedicated parser
      const { multi_product_page } = AIResponseParser.parseMultiProductPageResponse(content);
      
      // Also parse standard fields as fallback
      const { headline, subheadline, introduction, sections, cta, riskReversal } = AIResponseParser.parseLandingPageResponse(content, landingPageType);

      return {
        headline,
        subheadline,
        introduction,
        sections,
        cta,
        riskReversal,
        socialProof: '',
        conclusion: '',
        multi_product_page,
        rawResponse: content,
        stats: {
          totalWords: content.split(/\s+/).length,
          sectionCount: sections.length,
          avgSectionLength: sections.length > 0 ? Math.round(sections.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0) / sections.length) : 0
        },
        debugInfo: AIPromptBuilder.createDebugInfo(
          systemPrompt,
          userPrompt,
          content,
          modelParams.model,
          request
        )
      };
    } else {
      // Parse standard landing page response using centralized parser
      const { headline, subheadline, introduction, sections, cta, riskReversal } = AIResponseParser.parseLandingPageResponse(content, landingPageType);

      return {
        headline,
        subheadline,
        introduction,
        sections,
        cta,
        riskReversal,
        socialProof: '',
        conclusion: '',
        rawResponse: content,
        stats: {
          totalWords: content.split(/\s+/).length,
          sectionCount: sections.length,
          avgSectionLength: sections.length > 0 ? Math.round(sections.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0) / sections.length) : 0
        },
        debugInfo: AIPromptBuilder.createDebugInfo(
          systemPrompt,
          userPrompt,
          content,
          modelParams.model,
          request
        )
      };
    }
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw new Error('Failed to generate landing page copy');
  }
}

export async function analyzeStaticAd(request: StaticAdAnalysisRequest, trainingConfig: TrainingConfig) {
  const { staticAdImage, persona, brandDrBalance, selectedProduct, selectedProducts, useJonesBrandGuide, outputFormat, analysisFocus } = request;

  // Provide safe defaults for undefined values
  const safeBrandDrBalance = brandDrBalance || DEFAULT_BRAND_DR_BALANCE;
  const safePersona = persona || DEFAULT_PERSONA_KEY;

  // Process static ad image
  const processedImage = await processImageForAnthropic(staticAdImage, {
    logContext: 'Static ad analysis'
  });

  if (!processedImage) {
    throw new Error('Failed to process static ad image');
  }

  // Build system prompt using station prompt builder (align with ad copy)
  const baseSystemPrompt = await AIPromptBuilder.buildStationSystemPrompt('staticAd', trainingConfig, request, {
    persona: safePersona,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide
  });
  const systemPrompt = `${baseSystemPrompt}

**Use simple formatting: numbered lists (1. 2. 3.) and bullet points (-) only.**
**Avoid markdown symbols like *, #, [], etc.**
**Format Requirements:**
- Clean, readable text without complex formatting
- Use numbered lists (1. 2. 3.) for sequential information
- Use bullet points (-) for non-sequential lists
- No bold, italic, or other markdown formatting
- No hashtags, brackets, or special symbols
- Focus on content clarity over visual formatting
- Match the specific format requested in the custom request

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
`;


  const getOutputInstructions = () => {
    const outputInstructions = ``;

    // Customize instructions based on outputFormat
    if (outputFormat === 'analysis-only') {
      return `${outputInstructions}

INSTRUCTIONS:
- Provide comprehensive analysis of what makes this ad effective
- Focus on visual elements, copy effectiveness, and conversion optimization
- DO NOT create variations - analysis only`;
    } else if (outputFormat === 'variations-only') {
      return `${outputInstructions}

INSTRUCTIONS:
- Create 3 compelling ${BRAND_NAME} variations that adapt the successful elements
- Focus on authentic language that resonates with the target persona
- Include specific headlines and primary text for each variation
- Maintain ${BRAND_NAME}'s "effortless beauty" positioning throughout
- DO NOT provide detailed analysis - variations only`;
    } else {
      return `${outputInstructions}

INSTRUCTIONS:
- Provide comprehensive analysis of what makes this ad effective
- Create 3 compelling ${BRAND_NAME} variations that adapt the successful elements
- Focus on authentic language that resonates with the target persona
- Include specific headlines and primary text for each variation
- Maintain ${BRAND_NAME}'s "effortless beauty" positioning throughout`;
    }
  };

  // Build user prompt via station prompt builder and append output instructions at the end
  const baseUserPrompt = await AIPromptBuilder.buildStationUserPrompt('staticAd', trainingConfig, request, {
    persona: safePersona,
    selectedProduct,
    selectedProducts,
    brandDrBalance: safeBrandDrBalance,
    useJonesBrandGuide,
    analysisFocus,
    outputFormat
  });
  const userPrompt = `${baseUserPrompt}\n\n${getOutputInstructions()}`;
  try {
    // Debug: log final rendered prompts being sent to the model (Static Ad)
    // AILogger.logFinalPrompts('Static Ad Analysis', systemPrompt, userPrompt);
    // Use station-specific model parameters for Static Ad
    const modelParams = AIPromptBuilder.getStationModelParams('staticAd', trainingConfig);
    const response = await anthropic.messages.create({
      model: modelParams.model,
      system: systemPrompt,
      max_tokens: modelParams.max_tokens,
      temperature: modelParams.temperature,
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

    // Parse static ad response using centralized parser
    const { analysis, variations } = AIResponseParser.parseStaticAdResponse(content, outputFormat);

    return {
      analysis,
      variations,
      rawResponse: content,
      debugInfo: AIPromptBuilder.createDebugInfo(systemPrompt, userPrompt, content, modelParams.model, request)
    };
  } catch (error) {
    console.error('Static ad analysis error:', error);
    throw new Error('Failed to analyze static ad');
  }
}

export async function generateCustomCopy(request: CustomCopyRequest, trainingConfig: TrainingConfig) {
  const { customRequest, persona, brandDrBalance, selectedProduct, selectedProducts, useJonesBrandGuide } = request;

  // Validate required parameters
  if (!persona || persona === 'none') {
    throw new Error('Persona is required and must be provided from database persona data.');
  }

  // Build system prompt using station builders (align with ad/landing pattern)
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt('customRequest', trainingConfig, request, {
    persona: persona || DEFAULT_PERSONA_KEY,
    selectedProduct,
    selectedProducts,
    brandDrBalance: brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
    useJonesBrandGuide: true
  });

  // Build user prompt via station builder
  const userPrompt = await AIPromptBuilder.buildStationUserPrompt('customRequest', trainingConfig, request, {
    persona: persona || DEFAULT_PERSONA_KEY,
    selectedProduct,
    selectedProducts,
    brandDrBalance: brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
    useJonesBrandGuide: true,
    customRequest
  });

  try {
    // Debug: log final rendered prompts being sent to the model (Custom Request)
    // AILogger.logFinalPrompts('Custom Request', systemPrompt, userPrompt);
    // Get optimized model parameters for this station
    const modelParams = AIPromptBuilder.getStationModelParams('customRequest', trainingConfig);

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
        DEFAULT_MODEL_STR,
        request
      )
    };
  } catch (error) {
    console.error('Custom copy generation error:', error);
    throw new Error('Failed to generate custom copy');
  }
}
// Back-compat wrapper keeping existing API stable
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
  persona?: string;
  brandDrBalance?: number;
  selectedProduct?: string;
  useJonesBrandGuide?: boolean;
}, trainingConfig: TrainingConfig) {
  if ((request.platform || 'Email') === 'SMS') {
    return await generateRetentionSms(request, trainingConfig);
  }
  return await generateRetentionEmail(request, trainingConfig);
}

export async function generateRetentionSms(request: {
  keyMessage: string;
  selectedFramework?: any;
  selectedProducts?: string[];
  audience?: string;
  goal?: string;
  campaignType?: string;
  contentLength?: string;
  keywordsToInclude?: string[];
  wordsToAvoid?: string[];
  persona?: string;
  brandDrBalance?: number;
  selectedProduct?: string;
  useJonesBrandGuide?: boolean;
}, trainingConfig: TrainingConfig) {
  // Build system and user prompts via builders
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt('sms', trainingConfig, request, {
    persona: request.persona || DEFAULT_PERSONA_KEY,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });

  const userPrompt = await AIPromptBuilder.buildStationUserPrompt('sms', trainingConfig, request, {
    persona: request.persona || DEFAULT_PERSONA_KEY,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });

  try {
    // AILogger.logFinalPrompts('SMS Retention', systemPrompt, userPrompt);
    const messageContent: any[] = [{ type: 'text', text: userPrompt }];

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

    const { smsVariations, strategicInsights } = AIResponseParser.parseSmsResponse(content);

    return {
      smsVariations,
      strategicInsights,
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        DEFAULT_MODEL_STR,
        request
      )
    };
  } catch (error) {
    console.error('Retention SMS generation error:', error);
    throw new Error('Failed to generate SMS retention copy');
  }
}


export async function generateRetentionEmail(request: {
  keyMessage: string;
  emailType?: string;
  selectedFramework?: any;
  selectedProducts?: string[];
  audience?: string;
  goal?: string;
  campaignType?: string;
  contentLength?: string;
  keywordsToInclude?: string[];
  wordsToAvoid?: string[];
  persona?: string;
  brandDrBalance?: number;
  selectedProduct?: string;
  useJonesBrandGuide?: boolean;
}, trainingConfig: TrainingConfig) {
  // Build system and user prompts via builders (pattern like ad/landing)
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt('email', trainingConfig, request, {
    persona: request.persona || DEFAULT_PERSONA_KEY,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });
  const userPrompt = await AIPromptBuilder.buildStationUserPrompt('email', trainingConfig, request, {
    persona: request.persona || DEFAULT_PERSONA_KEY,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });

  try {
    // AILogger.logFinalPrompts('Email Retention', systemPrompt, userPrompt);
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
          const processedImage = await processImageForAnthropic(template, {
            logContext: `Retention Email Template ${index + 1}`
          });
          if (processedImage) {
            messageContent.push(processedImage);
          }
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
            const processedImage = await processImageForAnthropic(image.dataUri, {
              logContext: `Retention Email Framework Image ${index + 1}`
            });
            if (processedImage) {
              messageContent.push(processedImage);
            }
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
      max_tokens: 4096,
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
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        DEFAULT_MODEL_STR,
        request
      )
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
  persona?: string;
  imageData?: string; // Add image data parameter
}, trainingConfig: TrainingConfig) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Build persona and product sections
  const safePersona = request.persona || DEFAULT_PERSONA_KEY;
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt('socialCaptions', trainingConfig, request, {
    persona: safePersona,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });
  const userPrompt = await AIPromptBuilder.buildStationUserPrompt('socialCaptions', trainingConfig, request, {
    persona: safePersona,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });

  // AILogger.logFinalPrompts('Social Captions', systemPrompt, userPrompt);

  // Determine if there is image content to attach
  const hasImageContent = !!(request.imageData && request.imageData.trim());

  try {
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];

    if (hasImageContent && request.imageData) {
      const processedImage = await processImageForAnthropic(request.imageData, {
        logContext: 'Social captions generation'
      });
      if (processedImage) {
        messageContent.push(processedImage);
      }
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 4096,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse social captions response using centralized parser
    const { captions, strategicInsights } = AIResponseParser.parseSocialCaptionsResponse(content, request.variations);

    return {
      captions,
      strategicInsights,
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        DEFAULT_MODEL_STR,
        request
      )
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
  persona?: string;
  imageData?: string; // Add image data parameter
}, trainingConfig: TrainingConfig) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Build persona and product sections
  const safePersona = request.persona || DEFAULT_PERSONA_KEY;
  const systemPrompt = await AIPromptBuilder.buildStationSystemPrompt('storySequences', trainingConfig, request, {
    persona: safePersona,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });
  const userPrompt = await AIPromptBuilder.buildStationUserPrompt('storySequences', trainingConfig, request, {
    persona: safePersona,
    selectedProduct: request.selectedProduct,
    selectedProducts: request.selectedProducts,
  });
  // AILogger.logFinalPrompts('Story Sequence', systemPrompt, userPrompt);


  // Determine if there is image content to attach
  const hasImageContent = !!(request.imageData && request.imageData.trim());

  try {
    // Debug: log final rendered prompts being sent to the model (Story Sequence)
    // AILogger.logFinalPrompts('Story Sequence', systemPrompt, userPrompt);
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];

    if (hasImageContent && request.imageData) {
      const processedImage = await processImageForAnthropic(request.imageData, {
        logContext: 'Story sequence generation'
      });
      if (processedImage) {
        messageContent.push(processedImage);
      }
    }

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2048,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse story sequence response using centralized parser
    const slides = AIResponseParser.parseStorySequenceResponse(content, request.length, hasImageContent);

    return {
      sequence: slides,
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        DEFAULT_MODEL_STR,
        request
      )
    };
  } catch (error) {
    console.error('Story sequence generation error:', error);
    throw new Error('Failed to generate story sequence');
  }
}
// Product Launch Brief Generation
export async function generateBrief(request: BriefRequest, trainingConfig: TrainingConfig) {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build comprehensive AI Settings context including product claims
    const aiSettingsContext = buildAllBrandSettingsContext(trainingConfig, {
      persona: request.persona,
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
          ? `Referenced Past Briefs:\n${request.googleDriveLinks.map((link: string, i: number) => `${i + 1}. ${link}`).join('\n')}\n\nNote: Please reference the strategic frameworks and successful elements from these past briefs in your recommendations.\n`
          : '');
    } else {
      userPrompt = `Based on the following meeting notes and information, create a comprehensive product launch brief:\n\n# Meeting Notes & Input:\n${request.notes}`;

      // Add Google Drive references if provided
      if (request.googleDriveLinks && request.googleDriveLinks.length > 0) {
        userPrompt += `\n\n# Referenced Past Briefs:\n`;
        request.googleDriveLinks.forEach((link: string, index: number) => {
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
        metadata: request.metadata,
        debugInfo: AIPromptBuilder.createDebugInfo(
          systemPrompt,
          userPrompt,
          content.text,
          trainingConfig.modelParameters.model,
          request
        )
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
  const systemPrompt = `You are an expert email and SMS design specialist for ${BRAND_NAME}. Create HTML/CSS mockups that EXACTLY replicate ${BRAND_NAME}'s actual email design style and layout.

CRITICAL REQUIREMENTS:
1. Generate COMPLETE, SELF-CONTAINED HTML with inline CSS
2. REPLICATE ${BRAND_NAME}'s actual email design patterns
3. Use EXACT ${BRAND_NAME} brand styling and layout
4. For SMS: Create iPhone Messages-style interface
5. Include proper email structure matching ${BRAND_NAME}'s templates
6. Make it pixel-perfect to ${BRAND_NAME}'s actual emails
7. Include realistic placeholder images matching ${BRAND_NAME}'s style
8. Ensure responsive design for mobile and desktop

${BRAND_NAME} BRAND STYLING:
- Primary Brand Color: #e0ded8 (${BRAND_NAME})
- Secondary: #F5F5F5 (Light Gray backgrounds)
- Accent: #E8F4F8 (Light Blue highlights)
- Text Primary: #333333 (Dark Gray)
- Text Secondary: #666666 (Medium Gray)
- Background: #FFFFFF (White)
- Font Family: Use web-safe fonts like Arial, Helvetica, sans-serif for email compatibility

${BRAND_NAME} EMAIL DESIGN PATTERNS:
- Clean, minimal layout with plenty of white space
- Centered content with max-width around 600px
- Simple header with ${BRAND_NAME} logo
- Hero sections with large, clean typography
- Product images with clean borders or shadows
- CTA buttons: Rounded corners, ${BRAND_NAME} blue background, white text
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
- ${BRAND_NAME} as sender name
- Message bubbles with proper iOS styling
- Realistic timestamps and interface elements

VISUAL LAYOUT ANALYSIS:
${request.selectedFramework?.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0 ?
      `CRITICAL: Framework images are provided. You MUST analyze these images to understand the EXACT layout, spacing, typography, and visual hierarchy. Create HTML that perfectly matches the visual structure shown in these reference images.` :
      `Create a layout that follows ${BRAND_NAME}'s typical email design patterns - clean, minimal, premium beauty brand aesthetic.'`}

OUTPUT REQUIREMENTS:
- Return ONLY the complete HTML code
- DO NOT wrap in markdown code blocks (no \`\`\`html or \`\`\`)
- DO NOT include any markdown formatting
- Include all CSS inline within <style> tags in the <head>
- No external dependencies or imports
- Self-contained and ready to render
- Include proper viewport meta tags for responsive design
- Make it look EXACTLY like a real ${BRAND_NAME} email
- Start directly with <!DOCTYPE html> or <html>`;

  const userPrompt = `Create a ${request.platform.toLowerCase()} visual mockup that looks EXACTLY like a real ${BRAND_NAME} ${request.platform.toLowerCase()}.

COPY CONTENT TO STYLE:
${request.copyContent}

PLATFORM: ${request.platform}
${request.emailType ? `EMAIL TYPE: ${request.emailType}` : ''}
${request.selectedFramework ? `FRAMEWORK: ${request.selectedFramework.displayName}` : ''}

DESIGN REQUIREMENTS:
${request.platform === 'Email' ? `
EMAIL DESIGN SPECIFICATIONS:
- Replicate ${BRAND_NAME}'s actual email design style
- Header: Clean logo area (use placeholder logo)
- Hero section: Large, impactful headline matching the copy
- Content sections: Clean typography with proper hierarchy
- Product showcases: Clean product image placeholders with proper spacing
- CTA buttons: ${BRAND_NAME} blue (#004182), rounded corners, white text
- Footer: Standard email footer with unsubscribe and company info
- Color scheme: Whites, light grays, with ${BRAND_NAME} blue accents
- Typography: Clean, readable fonts (Arial/Helvetica for email safety)
- Layout: Centered, max-width 600px, mobile responsive
- Spacing: Generous white space, premium feel
- Images: Use placeholder images that match ${BRAND_NAME}'s clean aesthetic
- Make it look like it came directly from ${BRAND_NAME}'s email marketing team
` : `
SMS DESIGN SPECIFICATIONS:
- Create realistic iPhone Messages interface
- Sender: "${BRAND_NAME}" 
- Message bubbles: iOS blue (#007AFF) for sent messages
- Background: iOS Messages gray background (#F2F2F7)
- Typography: San Francisco font style (or similar)
- Include realistic timestamp
- Show message as received on iPhone
- Keep message concise and readable
- Include ${BRAND_NAME} branding in the message content
`}

CRITICAL SUCCESS FACTORS:
- Must look indistinguishable from actual ${BRAND_NAME} emails/SMS
- Professional, premium beauty brand aesthetic
- Clean, minimal design with strategic use of ${BRAND_NAME} blue
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

Return the complete, self-contained HTML that renders a pixel-perfect ${BRAND_NAME} ${request.platform.toLowerCase()}.`;

  try {
    // Prepare message content with framework images if available
    const messageContent: any[] = [{ type: 'text', text: userPrompt }];


    // Add framework images if available for visual reference
    if (request.selectedFramework?.images && Array.isArray(request.selectedFramework.images) && request.selectedFramework.images.length > 0) {
      console.log(`Processing ${request.selectedFramework.images.length} framework image(s) for visual preview generation`);

      for (const [index, imageObj] of request.selectedFramework.images.entries()) {
        try {
          let imageData: string | undefined;

          // Handle different image object formats
          if (typeof imageObj === 'string') {
            imageData = imageObj;
          } else if (imageObj.dataUri) {
            imageData = imageObj.dataUri;
          } else if (imageObj.data) {
            imageData = imageObj.data;
          }

          if (imageData) {
            const processedImage = await processImageForAnthropic(imageData, {
              logContext: `Visual Preview Framework Image ${index + 1}`
            });

            if (processedImage) {
              messageContent.push(processedImage);
              console.log(`Framework image ${index + 1} added for visual reference`);
            }
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
    htmlContent = TextUtils.stripCodeFences(htmlContent);

    return {
      htmlContent,
      platform: request.platform,
      emailType: request.emailType,
      rawResponse: htmlContent, // For backwards compatibility
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        htmlContent,
        DEFAULT_MODEL_STR,
        request
      )
    };
  } catch (error) {
    console.error('Visual preview generation error:', error);
    throw new Error('Failed to generate visual preview');
  }
}