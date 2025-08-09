import { TrainingConfig } from '@shared/training-config';
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  FALLBACK_MODEL_STR,
  DEFAULT_MAX_HEADLINES,
  DEFAULT_HEADLINE_FRAMEWORK,
  IMAGE_ANALYSIS_INSTRUCTIONS,
  STATION_CONFIGS,
} from '@shared/constants';
import { 
  buildMetaAdCopyFrameworksSection,
  buildLandingPageFrameworksSection,
  buildEmailFrameworksSection,
  buildSelectedProductsSection,
  buildTargetPersonaSection,
  buildSelectedLandingPageFrameworksSection,
  buildSelectedTargetPersonaSection,
  buildSelectedMetaAdCopyFrameworksSection,
  buildAllProductsSection,
  buildSelectedEmailFrameworksSection,
  buildAllBrandSettingsContext,
  buildBrandGuidelinesSection,
  buildProductClaimsSection,
  buildMultiProductClaimsSection,
  buildPersonaPillarsSection,
  buildBrandDrBalanceSection,
  buildBrandFirstGuidelinesSection,
  buildDirectResponseGuidelinesSection
} from './components';

export class AIPromptBuilder {
  // Station configuration moved to shared constants (STATION_CONFIGS)

  /**
   * Build station system prompt
   */
  static async buildStationSystemPrompt(
    stationName: string,
    trainingConfig: TrainingConfig,
    request: any,
    variables: Record<string, any> = {}
  ): Promise<string> {
      const stationConfig = STATION_CONFIGS[stationName as keyof typeof STATION_CONFIGS];
      if (!stationConfig) {
        throw new Error(`Unknown station: ${stationName}. Available stations: ${Object.keys(STATION_CONFIGS).join(', ')}`);
      }
      const systemPromptTemplate = trainingConfig?.stationPrompts?.[stationName]?.systemPrompt;
      if (!systemPromptTemplate) {
        throw new Error(`${stationConfig.name} system prompt not found in training configuration. Please ensure the database contains proper station prompt configuration for '${stationName}'.`);
      }
    return await AIPromptBuilder.renderTemplateWithComponentsAndVariables(
      systemPromptTemplate,
        trainingConfig,
        request,
        variables
      );
  }

  /**
   * Build station user prompt
   */
  static async buildStationUserPrompt(
    stationName: string,
    trainingConfig: TrainingConfig,
    request: any,
    variables: Record<string, any> = {}
  ): Promise<string> {
    const stationConfig = STATION_CONFIGS[stationName as keyof typeof STATION_CONFIGS];
    if (!stationConfig) {
      throw new Error(`Unknown station: ${stationName}. Available stations: ${Object.keys(STATION_CONFIGS).join(', ')}`);
    }
    const userPromptTemplate = trainingConfig?.stationPrompts?.[stationName]?.userPromptTemplate;
    if (!userPromptTemplate) {
      throw new Error(`${stationConfig.name} user prompt template not found in training configuration. Please ensure the database contains proper station prompt configuration for '${stationName}'.`);
    }
    return await AIPromptBuilder.renderTemplateWithComponentsAndVariables(
      userPromptTemplate,
      trainingConfig,
      request,
      variables
    );
  }

  /**
   * Build simple context for rendering templates
   */
  static buildSimpleContext(
    trainingConfig: TrainingConfig,
    request: { selectedProduct?: string; selectedProducts?: string[]; persona?: string; landingPageType?: string },
    variables: Record<string, any>
  ): { 
    products?: string; 
    persona?: string; 
    headline_frameworks?: string; 
    landing_frameworks?: string; 
    email_frameworks?: string; 
  } {
    const products = buildSelectedProductsSection(request.selectedProduct, request.selectedProducts, trainingConfig);
    const personaSection = buildSelectedTargetPersonaSection(request.persona || variables.persona || '', trainingConfig);
    const headlineFrameworks = buildMetaAdCopyFrameworksSection(trainingConfig);
    const landingFrameworks = request.landingPageType
      ? buildSelectedLandingPageFrameworksSection(trainingConfig, request.landingPageType)
      : buildLandingPageFrameworksSection(trainingConfig);
    const emailFrameworks = buildEmailFrameworksSection(trainingConfig);
    return { products, persona: personaSection, headline_frameworks: headlineFrameworks, landing_frameworks: landingFrameworks, email_frameworks: emailFrameworks };
  }

  /**
   * Render template with components and variables
   */
  private static async renderTemplateWithComponentsAndVariables(
    template: string,
    trainingConfig: TrainingConfig,
    request: { selectedProduct?: string; selectedProducts?: string[]; persona?: string; selectedHeadlineFrameworks?: string | string[]; selectedMetaAdCopyFrameworks?: string | string[] },
    variables: Record<string, any>
  ): Promise<string> {
    if (!template) return '';
    const simpleContext = AIPromptBuilder.buildSimpleContext(trainingConfig, request as any, variables);
    const sections: Record<string, string> = {
      selectedProducts: simpleContext.products || '',
      selectedPersona: simpleContext.persona || '',
      allProducts: buildAllProductsSection(trainingConfig) || '',
      allPersonas: buildTargetPersonaSection(trainingConfig) || '',
      metaAdCopyFrameworks: simpleContext.headline_frameworks || buildMetaAdCopyFrameworksSection(trainingConfig) || '',
      selectedMetaAdCopyFrameworks: buildSelectedMetaAdCopyFrameworksSection(
        trainingConfig,
        (request as any)?.selectedMetaAdCopyFrameworks || (request as any)?.selectedHeadlineFrameworks || variables?.selectedMetaAdCopyFrameworks || variables?.selectedHeadlineFrameworks
      ) || '',
      // Landing page frameworks (all and selected)
      landingPageFrameworks: simpleContext.landing_frameworks || buildLandingPageFrameworksSection(trainingConfig, (request as any)?.landingPageType) || '',
      selectedLandingPageFrameworks: buildSelectedLandingPageFrameworksSection(
          trainingConfig,
        (request as any)?.selectedLandingPageFrameworks
          ?? variables?.selectedLandingPageFrameworks
          ?? (request as any)?.landingPageType // Fallback: use landingPageType as selector
      ) || '',
      // Email frameworks (all and selected)
      emailFrameworks: simpleContext.email_frameworks || buildEmailFrameworksSection(trainingConfig) || '',
      selectedEmailFrameworks: buildSelectedEmailFrameworksSection(
        trainingConfig,
        (request as any)?.selectedEmailFrameworks || variables?.selectedEmailFrameworks
      ) || '',
      // Brand settings and related sections
      allBrandSettingsContext: buildAllBrandSettingsContext(trainingConfig, {
        persona: (request as any)?.persona ?? variables?.persona,
        selectedProduct: (request as any)?.selectedProduct ?? variables?.selectedProduct,
        selectedProducts: (request as any)?.selectedProducts ?? variables?.selectedProducts,
        brandDrBalance: (request as any)?.brandDrBalance ?? variables?.brandDrBalance,
        useJonesBrandGuide: (request as any)?.useJonesBrandGuide ?? variables?.useJonesBrandGuide,
      }) || '',
      brandGuidelines: buildBrandGuidelinesSection(trainingConfig) || '',
      productClaims: buildProductClaimsSection(
        trainingConfig,
        (request as any)?.selectedProduct ?? variables?.selectedProduct
      ) || '',
      multiProductClaims: buildMultiProductClaimsSection(
        trainingConfig,
        (request as any)?.selectedProducts ?? variables?.selectedProducts
      ) || '',
      personaPillars: buildPersonaPillarsSection(
        trainingConfig,
        (request as any)?.persona ?? variables?.persona
      ) || '',
      brandDrBalance: buildBrandDrBalanceSection(
        (request as any)?.brandDrBalance ?? variables?.brandDrBalance
      ) || '',
      brandFirstGuidelines: buildBrandFirstGuidelinesSection(trainingConfig) || '',
      directResponseGuidelines: buildDirectResponseGuidelinesSection(trainingConfig) || ''
    };
    let rendered = template;

    // Evaluate simple conditional blocks before variable replacement.
    // Supported syntax (non-nested):
    // {{#if landingPageType == 'multiProduct'}} ... {{else if landingPageType == 'listicle'}} ... {{else}} ... {{/if}}
    // Operators supported: ==, !=, in, includes (alias: contains)
    const evaluateCondition = (expr: string, scope: Record<string, any>): boolean => {
      const trimmed = (expr || '').trim();
      if (!trimmed) return false;
      // Normalize whitespace
      const normalized = trimmed.replace(/\s+/g, ' ');
      // Try patterns: var op value
      const opMatch = normalized.match(/^([a-zA-Z0-9_\.]+)\s*(==|!=|in|includes|contains)\s*(.+)$/);
      const getValue = (raw: string): any => {
        const s = raw.trim();
        // Strip surrounding quotes if present
        const unquoted = s.replace(/^['"]|['"]$/g, '');
        // If looks like an array list: 'a,b,c' or [a,b]
        if (s.startsWith('[') && s.endsWith(']')) {
          const inner = s.slice(1, -1);
          return inner.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        }
        if (unquoted.includes(',') && (normalized.includes(' in ') || normalized.includes(' includes ') || normalized.includes(' contains '))) {
          return unquoted.split(',').map(v => v.trim());
        }
        if (unquoted.toLowerCase() === 'true') return true;
        if (unquoted.toLowerCase() === 'false') return false;
        if (!isNaN(Number(unquoted))) return Number(unquoted);
        return unquoted;
      };
      const resolveVar = (path: string): any => {
        const parts = path.split('.');
        let current: any = scope;
        for (const p of parts) {
          if (current && typeof current === 'object' && p in current) current = current[p];
          else return undefined;
        }
        return current;
      };
      if (opMatch) {
        const [, leftVar, operator, rightRaw] = opMatch;
        const leftVal = resolveVar(leftVar);
        const rightVal = getValue(rightRaw);
        switch (operator) {
          case '==':
            return String(leftVal) === String(rightVal);
          case '!=':
            return String(leftVal) !== String(rightVal);
          case 'in':
            if (Array.isArray(rightVal)) return rightVal.map(String).includes(String(leftVal));
            return String(rightVal).split(',').map(s => s.trim()).includes(String(leftVal));
          case 'includes':
          case 'contains':
            if (Array.isArray(leftVal)) return leftVal.map(String).includes(String(getValue(rightRaw)));
            return String(leftVal || '').includes(String(getValue(rightRaw)));
        }
      }
      // Fallback: treat expression as truthy variable name
      const fallbackVal = resolveVar(normalized);
      return !!fallbackVal;
    };

    const processIfBlocks = (input: string, scope: Record<string, any>): string => {
      let out = input;
      const ifStartRe = /\{\{#if\s+([^}]+)\}\}/;
      // Iterate until no more if-blocks found (non-nested support). If nesting is present, outermost will be processed first due to greedy search below.
      while (true) {
        const startMatch = out.match(ifStartRe);
        if (!startMatch) break;
        const startIdx = startMatch.index as number;
        const condExpr = startMatch[1];
        // Find end tag corresponding to this start. We do a simple search; nested blocks are not supported.
        const afterStart = startIdx + startMatch[0].length;
        const endTag = '{{/if}}';
        const endIdx = out.indexOf(endTag, afterStart);
        if (endIdx === -1) break; // malformed, stop processing
        const blockContent = out.slice(afterStart, endIdx);
        // Find else-if and else segments within blockContent
        const segments: Array<{ type: 'if' | 'elseif' | 'else'; cond?: string; content: string }> = [];
        let cursor = 0;
        // Helper to push content until next tag
        const pushSegment = (type: 'if' | 'elseif' | 'else', cond: string | undefined, contentEnd: number) => {
          const content = blockContent.slice(cursor, contentEnd);
          segments.push({ type, cond, content });
          cursor = contentEnd;
        };
        // Walk through blockContent looking for else-if / else tags
        const tagRe = /\{\{else\s+if\s+([^}]+)\}\}|\{\{else\}\}/g;
        let m: RegExpExecArray | null;
        let lastType: 'if' | 'elseif' = 'if';
        while ((m = tagRe.exec(blockContent)) !== null) {
          const tagIdx = m.index;
          // push preceding content under current lastType
          pushSegment(lastType, lastType === 'if' ? condExpr : m[1], tagIdx);
          if (m[0].startsWith('{{else if')) {
            lastType = 'elseif';
          } else {
            // else tag: record it and the rest will be handled after loop
            segments.push({ type: 'else', content: blockContent.slice(tagIdx + m[0].length) });
            cursor = blockContent.length;
            break;
          }
        }
        if (cursor < blockContent.length) {
          // Remaining tail belongs to the last conditional type
          pushSegment(lastType, lastType === 'if' ? condExpr : undefined, blockContent.length);
        }

        // Choose the first matching segment
        let replacement = '';
        for (const seg of segments) {
          if (seg.type === 'else') { replacement = seg.content; break; }
          const condToEval = seg.cond ?? condExpr;
          if (seg.type === 'if' || seg.type === 'elseif') {
            if (evaluateCondition(condToEval, scope)) { replacement = seg.content; break; }
          }
        }
        // Replace whole block
        const fullBlock = out.slice(startIdx, endIdx + endTag.length);
        out = out.slice(0, startIdx) + replacement + out.slice(endIdx + endTag.length);
      }
      return out;
    };
    Object.entries(sections).forEach(([key, value]) => {
      const re = new RegExp(`\\{\\{\\s*components\\.${key}\\s*\\}\\}`, 'g');
      rendered = rendered.replace(re, value || '');
    });

    // Build a flat variable map prioritizing explicit variables, then request fields
    const flatVars: Record<string, any> = { ...variables };
    Object.keys(request || {}).forEach((k) => {
      if (flatVars[k] === undefined) flatVars[k] = (request as any)[k];
    });

    // Process conditional blocks with the available scope
    rendered = processIfBlocks(rendered, flatVars);

    // Replace simple variable placeholders like {{persona}}, {{selectedProduct}}, {{brandDrBalance}}, etc.
    // Helper to stringify values
    const toStringValue = (v: any): string => {
      if (v == null) return '';
      if (Array.isArray(v)) return v.join(', ');
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    };
    rendered = rendered.replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (match, varName: string) => {
      // Skip components.* which were handled above
      if (varName.startsWith('components.')) return match;
      // Support nested like request.field by mapping directly
      if (flatVars[varName] !== undefined) return toStringValue(flatVars[varName]);
      // Try to resolve dotted path inside flatVars
      if (varName.includes('.')) {
        const parts = varName.split('.');
        let current: any = flatVars;
        for (const p of parts) {
          if (current && typeof current === 'object' && p in current) current = current[p];
          else { current = undefined; break; }
        }
        if (current !== undefined) return toStringValue(current);
      }
      return '';
    });
    return rendered;
  }

  static getStationModelParams(stationName: string, trainingConfig: TrainingConfig) {
    const stationConfig = STATION_CONFIGS[stationName as keyof typeof STATION_CONFIGS];
    const defaultParams = trainingConfig?.modelParameters || {};
    return {
      model: defaultParams.model || FALLBACK_MODEL_STR,
      max_tokens: stationConfig?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: defaultParams.temperature ?? DEFAULT_TEMPERATURE,
    };
  }


  /**
   * Validate station prompt configuration
   */
  static validateStationPrompt(
  stationName: string,
    trainingConfig: TrainingConfig
  ): { isValid: boolean; missingElements: string[]; warnings: string[] } {
    const stationConfig = STATION_CONFIGS[stationName as keyof typeof STATION_CONFIGS];
    if (!stationConfig) {
      return { isValid: false, missingElements: ['Unknown station'], warnings: [] };
    }
    const missingElements: string[] = [];
    const warnings: string[] = [];
    if (!trainingConfig?.stationPrompts?.[stationName]?.systemPrompt) missingElements.push('System prompt');
    if (!trainingConfig?.stationPrompts?.[stationName]?.userPromptTemplate) missingElements.push('User prompt template');
    if ((stationConfig.requiredSections as readonly string[] | undefined)?.includes('targetPersona') && !trainingConfig?.personaPillars) warnings.push('No persona pillars configured');
    return { isValid: missingElements.length === 0, missingElements, warnings };
  }

  static buildImageAnalysisContext(
    imageData: string | undefined, 
    imageUrl: string | undefined,
    analysisType: 'ad_creative' | 'product_photo' | 'social_content' = 'ad_creative'
  ): { contextSection: string; hasImageContent: boolean; imageInput?: string } {
    let contextSection = '';
    let hasImageContent = false;
    let imageInput: string | undefined;
    const analysisInstructions = IMAGE_ANALYSIS_INSTRUCTIONS;
    if (imageUrl && imageUrl.trim()) {
      imageInput = imageUrl;
      hasImageContent = true;
      contextSection = `
# VISUAL CONTENT ANALYSIS:
${analysisInstructions[analysisType]} Use insights from this visual content to inform your copy generation while maintaining brand consistency.

Image Source: ${imageUrl}`;
    } else if (imageData && imageData.trim()) {
      imageInput = imageData;
      hasImageContent = true;
      contextSection = `
# VISUAL CONTENT ANALYSIS:
${analysisInstructions[analysisType]} Use insights from this visual content to inform your copy generation while maintaining brand consistency.`;
    }
    return { contextSection, hasImageContent, imageInput };
  }

  /**
   * Build a standardized debug info object
   */
  static createDebugInfo(
    systemPrompt: string,
    userPrompt: string,
    rawResponse: string,
    modelUsed: string,
    requestPayload?: any
  ) {
    return {
      systemPrompt,
      userPrompt,
      rawResponse,
      modelUsed,
      ...(requestPayload && { requestPayload })
    };
  }

  /**
   * Debug utility to inspect station configuration
   */
  static debugStationConfig(
    stationName: string,
    trainingConfig: TrainingConfig
  ): { stationExists: boolean; hasSystemPrompt: boolean; hasUserTemplate: boolean; availableEnhancements: string[]; configStructure: any } {
    const stationConfig = STATION_CONFIGS[stationName as keyof typeof STATION_CONFIGS];
    const stationPrompts = trainingConfig?.stationPrompts?.[stationName];
    const availableEnhancements: string[] = [];
    if (stationPrompts) {
      if (Array.isArray(stationPrompts.copyWritingRules) && stationPrompts.copyWritingRules.length > 0) availableEnhancements.push('copyWritingRules');
      if (Array.isArray(stationPrompts.contentStructureRules) && stationPrompts.contentStructureRules.length > 0) availableEnhancements.push('contentStructureRules');
      if (Array.isArray(stationPrompts.conversionGuidelines) && stationPrompts.conversionGuidelines.length > 0) availableEnhancements.push('conversionGuidelines');
      if (Array.isArray(stationPrompts.platformGuidelines) && stationPrompts.platformGuidelines.length > 0) availableEnhancements.push('platformGuidelines');
      if (Array.isArray(stationPrompts.ctaGuidelines) && stationPrompts.ctaGuidelines.length > 0) availableEnhancements.push('ctaGuidelines');
    }
    return { stationExists: !!stationConfig, hasSystemPrompt: !!stationPrompts?.systemPrompt, hasUserTemplate: !!stationPrompts?.userPromptTemplate, availableEnhancements, configStructure: stationPrompts ? Object.keys(stationPrompts) : [] };
  }
}

/**
 * Utility functions for parsing and validating AI responses
 */
export class AIResponseParser {
  /**
   * Clean text by removing markdown formatting and quotes
   */
  static cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/^\*\*(.+)\*\*$/, '$1')  // Remove bold markdown
      .replace(/^"(.+)"$/, '$1')        // Remove quotes
      .trim();
  }

  /**
   * Extract JSON from AI response that might be wrapped in markdown
   */
  static extractJSON(content: string): any {
    try {
      // Try direct JSON parse first
      return JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks or other wrapping
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    }
  }

  /**
   * Parse and validate ad copy response structure
   */
  static parseAdCopyResponse(content: string): {
    headlines: Array<{ framework: string; copy: string }>;
    primaryText: string;
  } {
    const parsedResponse = this.extractJSON(content);
    
    // Validate structure
    if (!parsedResponse.headlines || !Array.isArray(parsedResponse.headlines) || 
        !parsedResponse.primaryText || parsedResponse.headlines.length === 0) {
      throw new Error('Invalid response structure from AI');
    }
    
    // Clean and validate headlines
    const headlines = parsedResponse.headlines.slice(0, DEFAULT_MAX_HEADLINES).map((item: any) => ({
      framework: item.framework || DEFAULT_HEADLINE_FRAMEWORK,
      copy: this.cleanText(item.copy || '')
    })).filter((item: any) => item.copy.length > 0);
    
    const primaryText = this.cleanText(parsedResponse.primaryText);
    
    return { headlines, primaryText };
  }

  /**
   * Parse markdown response and extract structured data
   */
  static parseMarkdownResponse(content: string): {
    headlines: Array<{ framework: string; copy: string }>;
    primaryText: string;
  } {
    const headlines: Array<{ framework: string; copy: string }> = [];
    
    // Extract headlines from markdown
    const headlineMatches = content.match(/(?:HEADLINE|##\s*HEADLINE)[^:]*:?\s*(.+?)(?=\n|$)/gi);
    if (headlineMatches) {
      headlineMatches.slice(0, DEFAULT_MAX_HEADLINES).forEach((match) => {
        const cleanMatch = match.replace(/(?:HEADLINE|##\s*HEADLINE)[^:]*:?\s*/i, '').trim();
        if (cleanMatch) {
          headlines.push({
            framework: DEFAULT_HEADLINE_FRAMEWORK,
            copy: this.cleanText(cleanMatch)
          });
        }
      });
    }
    
    // Extract primary text
    let primaryText = '';
    const primaryTextMatch = content.match(/(?:PRIMARY TEXT|##\s*PRIMARY TEXT)[^:]*:?\s*([\s\S]*?)(?=\n##|\n\*\*|$)/i);
    if (primaryTextMatch) {
      primaryText = this.cleanText(primaryTextMatch[1]);
    }
    
    return { headlines, primaryText };
  }

  /**
   * Parse AI response with fallback strategies
   */
  static parseWithFallback(content: string): {
    headlines: Array<{ framework: string; copy: string }>;
    primaryText: string;
  } {
    try {
      // Try JSON parsing first
      return this.parseAdCopyResponse(content);
    } catch {
      // Fall back to markdown parsing
      const result = this.parseMarkdownResponse(content);
      if (result.headlines.length > 0 && result.primaryText) {
    return result;
  }
      throw new Error('Failed to parse AI response with any strategy');
    }
  }
}

/**
 * Lightweight text and JSON utilities to standardize model I/O handling
 */
export class TextUtils {
  /** Remove surrounding markdown fences (``` or ```lang) while keeping inner content */
  static stripCodeFences(text: string): string {
    if (!text) return '';
    let result = text.trim();
    // Remove opening fences like ``` or ```json
    result = result.replace(/^```[a-zA-Z]*\s*/gi, '').trim();
    // Remove closing fences
    result = result.replace(/```\s*$/gi, '').trim();
    // Remove any stray lone fences that may remain
    result = result.replace(/^```/g, '').replace(/```$/g, '').trim();
    return result;
  }

  /** Clean plain text by removing bold, quotes, markdown headers, code backticks */
  static cleanPlainText(text: string): string {
    if (!text) return '';
    return text
      .replace(/^\*\*(.+)\*\*$/s, '$1')
      .replace(/^['"]([\s\S]+)['"]$/s, '$1')
      .replace(/^#{1,6}\s?/gm, '')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
  }

  /** Try to parse JSON object/array from loose model output (handles code blocks and wrapping) */
  static tryParseJson(content: string): any | null {
    if (!content) return null;
    const candidates: string[] = [];
    // Raw content first
    candidates.push(content);
    // Code block content
    const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlock && codeBlock[1]) candidates.push(codeBlock[1]);
    // First object or array looking region
    const objMatch = content.match(/\{[\s\S]*\}/);
    if (objMatch) candidates.push(objMatch[0]);
    const arrMatch = content.match(/\[[\s\S]*\]/);
    if (arrMatch) candidates.push(arrMatch[0]);

    for (const c of candidates) {
      try {
        const cleaned = TextUtils.stripCodeFences(c);
        return JSON.parse(cleaned);
      } catch {/* try next */}
    }
    return null;
  }

  /** Try to parse a JSON array specifically; returns null if not found */
  static tryParseJsonArray(content: string): any[] | null {
    const parsed = TextUtils.tryParseJson(content);
    if (Array.isArray(parsed)) return parsed;
    return null;
  }
}

/**
 * Consistent, compact logging for prompts
 */
export class AILogger {
  static logFinalPrompts(tag: string, systemPrompt: string, userPrompt: string, preview: number = 800) {
    try {
      // Guard against huge logs while preserving signal
      // const sysPreview = (systemPrompt || '').substring(0, preview) + ((systemPrompt || '').length > preview ? '...' : '');
      // const userPreview = (userPrompt || '').substring(0, preview) + ((userPrompt || '').length > preview ? '...' : '');
      console.log(`=== FINAL PROMPT (${tag}) ===`);
      console.log('[SYSTEM PROMPT]', systemPrompt);
      console.log('[USER PROMPT]', userPrompt);
      console.log(`=== END FINAL PROMPT (${tag}) ===`);
    } catch (err) {
      console.warn('Prompt logging failed:', err);
    }
  }
}





