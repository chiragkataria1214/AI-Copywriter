import Anthropic from '@anthropic-ai/sdk';
import { type TrainingConfig } from '@shared/training-config';
import { AIResponseParser, AIPromptBuilder, AILogger, TextUtils } from './anthropic-helpers';
import { resizeImageIfNeeded, processImageForAnthropic } from './image-helper';
import { buildAllBrandSettingsContext, buildSelectedProductsSection, buildSelectedTargetPersonaSection } from './components';
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_IMAGE_MEDIA_TYPE, DEFAULT_MODEL_STR, DEFAULT_PERSONA_KEY } from '@shared/constants';
import { RevisionRequest, AdCopyRequest, LandingPageRequest, CustomCopyRequest, StaticAdAnalysisRequest, BriefRequest } from './anthropic-interface';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});


export async function reviseContent(request: RevisionRequest, trainingConfig: TrainingConfig): Promise<string> {
  const { originalContent, revisionInstructions, contentType, context } = request;

  // Map content types to station names for getting the appropriate system prompt
  const contentTypeToStation: Record<string, string> = {
    'headline': 'adCopy',
    'primaryText': 'adCopy',
    'landingCopy': 'landingPage',
    'custom': 'customRequest',
    'email': 'email',
    'sms': 'sms'
  };

  const stationName = contentTypeToStation[contentType] || 'customRequest';

  // Get station-specific system prompt from training config
  const baseSystemPrompt = (trainingConfig?.stationPrompts as any)?.[stationName]?.systemPrompt;

  // Build AI Settings context using the helper function
  const aiSettingsContext = buildAllBrandSettingsContext(trainingConfig, {
    persona: context?.persona || '',
    selectedProduct: context?.selectedProduct,
    selectedProducts: context?.selectedProducts,
    brandDrBalance: context?.brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
    useJonesBrandGuide: context?.useJonesBrandGuide ?? true
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

${contentType === 'sms' || contentType === 'email' ? `
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
    AILogger.logFinalPrompts('Ad Copy', systemPrompt, userPrompt);

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
    const { headlines, primaryText } = AIResponseParser.parseWithFallback(content);

    return {
      headlines,
      primaryText,
      debugInfo: AIPromptBuilder.createDebugInfo(
        systemPrompt,
        userPrompt,
        content,
        modelParams.model,
        { transcription, persona, brandDrBalance, selectedProduct }
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

  AILogger.logFinalPrompts('Landing Page', systemPrompt, userPrompt);

  try {
    // Use station-specific model parameters for Landing Page
    const modelParams = AIPromptBuilder.getStationModelParams('landingPage', trainingConfig);

    const response = await anthropic.messages.create({
      model: modelParams.model,
      system: systemPrompt,
      max_tokens: modelParams.max_tokens,
      temperature: modelParams.temperature,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Try to parse as JSON first, then fall back to text parsing (with fenced/embedded JSON support)
    const extractJson = (raw: string) => {
      const tryParse = (s: string) => TextUtils.tryParseJson(TextUtils.stripCodeFences(s));
      const direct = tryParse(raw);
      if (direct) return direct;
      const fenced = raw.match(/```json[\s\S]*?```/i)?.[0] || raw.match(/```[\s\S]*?```/)?.[0];
      if (fenced) {
        const parsed = tryParse(fenced);
        if (parsed) return parsed;
      }
      const first = raw.indexOf('{');
      const last = raw.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        const parsed = TextUtils.tryParseJson(raw.slice(first, last + 1));
        if (parsed) return parsed;
      }
      return null;
    };

    let parsedJson = extractJson(content);
    if (parsedJson) {
      console.log('Successfully parsed JSON response:', parsedJson);
    } else {
      console.log('Not a JSON response, using text parsing...');
    }

    let headlineMatch, subheadlineMatch, introMatch, ctaMatch, riskReversalMatch;

    if (parsedJson) {
      // Normalize wrapper shape if present
      const page: any = (parsedJson as any).landing_page || parsedJson;
      // Schema-aware extraction by framework
      const framework = landingPageType;
      const hero = page.hero_section || {};
      const productShowcase = page.product_showcase || {};
      const finalCta = page.final_cta || {};

      if (framework === 'product_framework') {
        const extractedHeadline = hero.headline || page.headline || page.hook || '';
        const extractedSubheadline = hero.sub_headline || hero.subheadline || page.subheader || page.subheadline || '';

        let extractedIntro = '';
        if (productShowcase.body_copy) {
          extractedIntro = productShowcase.body_copy;
        } else if (Array.isArray(hero.hero_benefits) && hero.hero_benefits.length > 0) {
          extractedIntro = hero.hero_benefits.join('\n');
        }

        const extractedCta = (
          finalCta.cta_button ||
          hero.cta_button ||
          page.cta ||
          (Array.isArray(page.cta_sections) && (page.cta_sections[0]?.cta || page.cta_sections[0]?.button || page.cta_sections[0]?.button_text)) ||
          (page.final_message && (page.final_message.final_cta || page.final_message.cta)) ||
          ''
        );
        const extractedRisk = page.riskReversal || page.risk_reversal || '';

        headlineMatch = extractedHeadline ? [null, extractedHeadline] : null;
        subheadlineMatch = extractedSubheadline ? [null, extractedSubheadline] : null;
        introMatch = extractedIntro ? [null, extractedIntro] : null;
        ctaMatch = extractedCta ? [null, extractedCta] : null;
        riskReversalMatch = extractedRisk ? [null, extractedRisk] : null;
      } else if (framework === 'listicle') {
        const extractedHeadline = page.headline || hero.headline || '';
        const extractedSubheadline = page.subheadline || hero.sub_headline || hero.subheadline || '';
        headlineMatch = extractedHeadline ? [null, extractedHeadline] : null;
        subheadlineMatch = extractedSubheadline ? [null, extractedSubheadline] : null;
        introMatch = null; // listicle has no introduction
        const extractedCta = page.cta || finalCta.cta_button || hero.cta_button || '';
        ctaMatch = extractedCta ? [null, extractedCta] : null;
        const risk = page.riskReversal || page.risk_reversal;
        riskReversalMatch = risk ? [null, risk] : null;
      } else {
        const extractedHeadline = page.headline || hero.headline || '';
        const extractedSubheadline = page.subheadline || hero.sub_headline || hero.subheadline || '';
        const extractedIntro = page.introduction || productShowcase.body_copy || '';
        const extractedCta = page.cta || finalCta.cta_button || hero.cta_button || '';
        const extractedRisk = page.riskReversal || page.risk_reversal || '';
        headlineMatch = extractedHeadline ? [null, extractedHeadline] : null;
        subheadlineMatch = extractedSubheadline ? [null, extractedSubheadline] : null;
        introMatch = extractedIntro ? [null, extractedIntro] : null;
        ctaMatch = extractedCta ? [null, extractedCta] : null;
        riskReversalMatch = extractedRisk ? [null, extractedRisk] : null;
      }
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

    if (parsedJson && Array.isArray((parsedJson as any))) {
      // Listicle or generic array: map array items to sections
      for (const item of (parsedJson as any)) {
        const sTitle = item.title || item.name || item.reason || '';
        const sContent = item.content || item.description || item.support || '';
        const hookMatch = sContent.match?.(/^([^.!?]*[.!?])/);
        const hook = hookMatch ? hookMatch[1].trim() : '';
        sections.push({
          title: sTitle,
          content: sContent,
          hook: hook.length < 200 ? hook : '',
          wordCount: (sContent || '').split(/\s+/).length
        });
      }
    } else if (parsedJson && (parsedJson as any).sections) {
      // Handle JSON sections
      for (const section of (parsedJson as any).sections) {
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
    } else if (parsedJson) {
      // Build sections from known nested landing page structures (normalize wrapper)
      const page: any = (parsedJson as any).landing_page || parsedJson;
      const productShowcase = page.product_showcase || {};
      const comparisonGrid = page.comparison_grid || {};
      const universalBenefits = page.universal_benefits || {};
      const socialProof = page.social_proof || {};
      const finalCta = page.final_cta || {};
      const products = Array.isArray(page.products) ? page.products : [];
      const problemSolution = page.problem_solution || {};

      // Product Showcase section
      if (productShowcase.section_title || productShowcase.body_copy) {
        const lines: string[] = [];
        if (productShowcase.body_copy) lines.push(productShowcase.body_copy);
        if (Array.isArray(productShowcase.product_lines)) {
          for (const line of productShowcase.product_lines) {
            if (line?.headline) lines.push(`Headline: ${line.headline}`);
            if (Array.isArray(line?.bullet_points)) {
              lines.push(...line.bullet_points.map((bp: string) => `- ${bp}`));
            }
          }
        }
        const contentStr = lines.join('\n');
        const hookMatch = contentStr.match(/^([^.!?]*[.!?])/);
        sections.push({
          title: productShowcase.section_title || 'Product Showcase',
          content: contentStr,
          hook: hookMatch ? hookMatch[1].trim() : '',
          wordCount: contentStr.split(/\s+/).length
        });
      }

      // Product sections array
      if (products.length > 0) {
        for (const p of products) {
          const title = p?.title || p?.name || p?.headline || 'Product';
          const lines: string[] = [];
          if (p?.description) lines.push(p.description);
          if (Array.isArray(p?.bullet_points)) {
            lines.push(...p.bullet_points.map((bp: string) => `- ${bp}`));
          }
          if (Array.isArray(p?.features)) {
            lines.push(
              ...p.features.map((f: any) =>
                typeof f === 'string'
                  ? `- ${f}`
                  : `- ${[f?.title || f?.name || '', f?.description || ''].filter(Boolean).join(': ')}`
              )
            );
          }
          const contentStr = lines.join('\n');
          const hookMatch = contentStr.match(/^([^.!?]*[.!?])/);
          sections.push({
            title,
            content: contentStr,
            hook: hookMatch ? hookMatch[1].trim() : '',
            wordCount: contentStr.split(/\s+/).length
          });
        }
      }

      // Problem/Solution blocks
      if (Array.isArray(problemSolution?.problems) && problemSolution.problems.length > 0) {
        const contentStr = problemSolution.problems
          .map((pr: any) => `- ${typeof pr === 'string' ? pr : (pr?.text || pr?.title || '')}`.trim())
          .join('\n');
        sections.push({
          title: problemSolution.problem_headline || 'Problems',
          content: contentStr,
          hook: '',
          wordCount: contentStr.split(/\s+/).length
        });
      }
      if (Array.isArray(problemSolution?.solutions) && problemSolution.solutions.length > 0) {
        const contentStr = problemSolution.solutions
          .map((sl: any) => `- ${typeof sl === 'string' ? sl : (sl?.text || sl?.title || '')}`.trim())
          .join('\n');
        sections.push({
          title: problemSolution.solution_headline || 'Solutions',
          content: contentStr,
          hook: '',
          wordCount: contentStr.split(/\s+/).length
        });
      }

      // Comparison Grid section
      if (comparisonGrid.section_title || comparisonGrid.table) {
        const table = comparisonGrid.table || {};
        const rows: string[] = [];
        if (Array.isArray(table.rows)) {
          for (const row of table.rows) {
            if (row?.feature && Array.isArray(row.values)) {
              rows.push(`${row.feature}: ${row.values.join(' vs ')}`);
            }
          }
        }
        const contentStr = rows.join('\n');
        sections.push({
          title: comparisonGrid.section_title || 'Comparison',
          content: contentStr,
          hook: '',
          wordCount: contentStr.split(/\s+/).length
        });
      }

      // Universal Benefits section
      if (universalBenefits.section_title || Array.isArray(universalBenefits.features)) {
        const features: string[] = [];
        if (Array.isArray(universalBenefits.features)) {
          for (const feat of universalBenefits.features) {
            if (feat?.headline) features.push(`${feat.headline}: ${feat.description || ''}`.trim());
          }
        }
        const contentStr = features.join('\n');
        sections.push({
          title: universalBenefits.section_title || 'Benefits',
          content: contentStr,
          hook: '',
          wordCount: contentStr.split(/\s+/).length
        });
      }

      // Social Proof section
      if (socialProof.section_title || Array.isArray(socialProof.testimonials)) {
        const testimonials: string[] = [];
        if (Array.isArray(socialProof.testimonials)) {
          for (const t of socialProof.testimonials) {
            const who = t?.reviewer_name || t?.reviewer_title_or_handle || t?.photo_url || '';
            if (t?.quote) testimonials.push(`"${t.quote}" — ${who}`.trim());
          }
        }
        const contentStr = testimonials.join('\n');
        sections.push({
          title: socialProof.section_title || 'Social Proof',
          content: contentStr,
          hook: '',
          wordCount: contentStr.split(/\s+/).length
        });
      }

      // Final CTA section (optional)
      if (finalCta.section_title || finalCta.key_message || finalCta.cta_button) {
        const contentStr = [finalCta.key_message, finalCta.cta_button].filter(Boolean).join('\n');
        sections.push({
          title: finalCta.section_title || 'Call To Action',
          content: contentStr,
          hook: '',
          wordCount: contentStr.split(/\s+/).length
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
        rawResponse: content,
        modelUsed: modelParams.model,
        landingPageType
      }
    };
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
- Create 3 compelling Jones Road variations that adapt the successful elements
- Focus on authentic language that resonates with the target persona
- Include specific headlines and primary text for each variation
- Maintain Jones Road's "effortless beauty" positioning throughout
- DO NOT provide detailed analysis - variations only`;
    } else {
      return `${outputInstructions}

INSTRUCTIONS:
- Provide comprehensive analysis of what makes this ad effective
- Create 3 compelling Jones Road variations that adapt the successful elements
- Focus on authentic language that resonates with the target persona
- Include specific headlines and primary text for each variation
- Maintain Jones Road's "effortless beauty" positioning throughout`;
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
    AILogger.logFinalPrompts('Static Ad Analysis', systemPrompt, userPrompt);
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

    // Try to parse JSON response first
    const parsedResponse = TextUtils.tryParseJson(content);
    if (parsedResponse) {
      if (outputFormat === 'analysis-only') {
        return {
          analysis: parsedResponse.analysis || 'Analysis not available',
          variations: [],
          rawResponse: content,
          debugInfo: { systemPrompt, userPrompt, rawResponse: content, modelUsed: modelParams.model }
        };
      }
      if (outputFormat === 'variations-only') {
        return {
          analysis: '',
          variations: parsedResponse.variations || [],
          rawResponse: content,
          debugInfo: { systemPrompt, userPrompt, rawResponse: content, modelUsed: modelParams.model }
        };
      }
      return {
        analysis: parsedResponse.analysis || 'Analysis not available',
        variations: parsedResponse.variations || [],
        rawResponse: content,
        debugInfo: { systemPrompt, userPrompt, rawResponse: content, modelUsed: modelParams.model }
      };
    }
    console.log('Failed to parse JSON, falling back to text formatting');
    const cleanedContent = TextUtils.cleanPlainText(content);
    return {
      analysis: cleanedContent,
      variations: [],
      rawResponse: content,
      debugInfo: { systemPrompt, userPrompt, rawResponse: content, modelUsed: modelParams.model }
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
    AILogger.logFinalPrompts('Custom Request', systemPrompt, userPrompt);
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
      debugInfo: {
        ...AIPromptBuilder.createDebugInfo(
          systemPrompt,
          userPrompt,
          content,
          modelParams.model,
          request
        )
      }
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
  const platform = 'SMS';

  // Build persona and product sections
  const safePersona = request.persona || DEFAULT_PERSONA_KEY;
  const targetPersonaSection = buildSelectedTargetPersonaSection(safePersona, trainingConfig);
  const selectedProductsSection = buildSelectedProductsSection(request.selectedProduct, request.selectedProducts, trainingConfig);

  const baseSystemPrompt = trainingConfig?.stationPrompts?.sms?.systemPrompt;
  if (!baseSystemPrompt) {
    throw new Error('SMS retention system prompt not found in training configuration.');
  }

  const systemPrompt = `${baseSystemPrompt}

SMS Copy Specifications:
- Platform: SMS
${request.selectedFramework ? `- Selected Framework: ${request.selectedFramework.displayName} (MUST FOLLOW EXACTLY)` : ''}
- Target Audience: ${request.audience || 'General audience'}
- Goal: ${request.goal || 'Drive Sales'}
- Campaign Type: ${request.campaignType || 'Product Spotlight / Hero Product'}
- Content Length: ${request.contentLength || 'Short'}

${request.keywordsToInclude && request.keywordsToInclude.length > 0 ? `Keywords to Include: ${request.keywordsToInclude.join(', ')}` : ''}
${request.wordsToAvoid && request.wordsToAvoid.length > 0 ? `\nWords to Avoid: ${request.wordsToAvoid.join(', ')}` : ''}
${request.selectedProducts && request.selectedProducts.length > 0 ? `\nProducts to Feature: ${request.selectedProducts.join(', ')}` : ''}

SMS-Specific Guidelines:
- Keep total message under 160 characters when possible for single SMS
- Use clear, direct language with immediate impact
- Include clear CTA with link or store direction
- Create urgency without being pushy
- Use emojis sparingly and only if they add value
- Personalize when possible

Content Length Specifications:
- Short: 50-100 words
- Medium: 100-160 characters total
- Long: Multiple messages (2-3 parts)

🚨 LENGTH COMPLIANCE IS MANDATORY 🚨`;

  const userPrompt = `Create sms retention copy based on this key message:

${targetPersonaSection}

${selectedProductsSection}

"${request.keyMessage}"

🎯 OUTPUT REQUIREMENTS:
- Return ONLY the SMS message text
- Keep under 160 characters when possible
- Include one clear CTA
- No markdown, no special formatting`;

  try {
    AILogger.logFinalPrompts('SMS Retention', systemPrompt, userPrompt);
    const messageContent: any[] = [{ type: 'text', text: userPrompt }];

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 1024,
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    if (!content || content.trim().length === 0) {
      throw new Error('Received empty response from Anthropic API');
    }

    return {
      response: content.trim(),
      debugInfo: {
        systemPrompt,
        userPrompt,
        requestPayload: request,
        rawResponse: content,
        wordCount: content.trim().split(/\s+/).length,
      }
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
    AILogger.logFinalPrompts('Email Retention', systemPrompt, userPrompt);
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
          let mediaType = DEFAULT_IMAGE_MEDIA_TYPE;
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
            let mediaType = DEFAULT_IMAGE_MEDIA_TYPE;
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

  AILogger.logFinalPrompts('Social Captions', systemPrompt, userPrompt);

  // Determine if there is image content to attach
  const hasImageContent = !!(request.imageData && request.imageData.trim());

  try {
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];

    if (hasImageContent && request.imageData) {
      // Process image data similar to generateAdCopy function
      let processedImageData = request.imageData;
      let mediaType = DEFAULT_IMAGE_MEDIA_TYPE;

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
    let captions = TextUtils.tryParseJsonArray(content);
    if (!captions) {
      // Try to find a JSON array pattern
      const arrayMatch = content.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        try {
          const maybe = JSON.parse(TextUtils.stripCodeFences(arrayMatch[0]));
          if (Array.isArray(maybe)) captions = maybe;
        } catch {/* ignore */ }
      }
    }
    if (!captions) {
      // Fallback: split by double newlines and clean up
      console.log('Using fallback parsing method for content:', content.substring(0, 200) + '...');
      captions = content
        .split('\n\n')
        .filter(caption => caption.trim().length > 0)
        .map(caption => caption.trim().replace(/^["']|["']$/g, ''))
        .slice(0, request.variations);
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
  AILogger.logFinalPrompts('Story Sequence', systemPrompt, userPrompt);


  // Determine if there is image content to attach
  const hasImageContent = !!(request.imageData && request.imageData.trim());

  try {
    // Debug: log final rendered prompts being sent to the model (Story Sequence)
    AILogger.logFinalPrompts('Story Sequence', systemPrompt, userPrompt);
    // Build message content with optional image
    let messageContent: any[] = [{ type: 'text', text: userPrompt }];

    if (hasImageContent && request.imageData) {
      // Process image data similar to generateAdCopy function
      let processedImageData = request.imageData;
      let mediaType = DEFAULT_IMAGE_MEDIA_TYPE;

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
    let slides = TextUtils.tryParseJsonArray(content);
    if (!slides) {
      const arrayMatch = content.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        try {
          const maybe = JSON.parse(TextUtils.stripCodeFences(arrayMatch[0]));
          if (Array.isArray(maybe)) slides = maybe;
        } catch {/* ignore */ }
      }
    }
    if (!slides) {
      // Fallback: create simple slides from content
      console.log('Using fallback parsing for story sequence');
      const fallbackSlides: any[] = [];
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
          let mediaType = DEFAULT_IMAGE_MEDIA_TYPE;

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
            mediaType = imageObj.mediaType || DEFAULT_IMAGE_MEDIA_TYPE;
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
    htmlContent = TextUtils.stripCodeFences(htmlContent);

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