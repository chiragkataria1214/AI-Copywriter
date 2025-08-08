import { TrainingConfig, VariableDefinition, ContextSectionConfig, ContextBuildingRules, BrandGuidelinesConfig } from '@shared/training-config';
import {
  buildTargetPersonaSection,
  buildSelectedProductsSection,
  buildCopyFrameworksSection,
  buildCustomBriefSection,
  ContentContextBuilder
} from './anthropic-helpers';
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_PERSONA_KEY } from '@shared/constants';

/**
 * Enhanced context builder that supports fully configurable context sections
 */
export class EnhancedContextBuilder {
  /**
   * Build context sections dynamically based on station configuration
   */
  static async buildStationContext(
    stationName: string,
    trainingConfig: TrainingConfig,
    request: any,
    variables: Record<string, any>
  ): Promise<{
    contextSections: string[];
    totalTokens: number;
    sectionsUsed: string[];
    sectionsById: Record<string, string>;
    debugInfo: {
      availableVariables: Record<string, any>;
      evaluatedConditions: Record<string, boolean>;
      sectionResults: Record<string, { included: boolean; reason: string; tokens: number }>;
    };
  }> {
    const contextConfig = trainingConfig.stationPrompts[stationName]?.contextConfiguration;
    
    if (!contextConfig || !contextConfig.contextSections) {
      // Fallback to legacy context building
      const legacy = await this.buildLegacyContext(stationName, trainingConfig, request, variables);
      return { ...legacy, sectionsById: {} };
    }

    const sections: string[] = [];
    const sectionsById: Record<string, string> = {};
    const sectionsUsed: string[] = [];
    let totalTokens = 0;
    
    // Debug information
    const debugInfo = {
      availableVariables: variables,
      evaluatedConditions: {} as Record<string, boolean>,
      sectionResults: {} as Record<string, { included: boolean; reason: string; tokens: number }>
    };

    // Merge request data into variables
    const allVariables = { ...variables, ...request, transcription: request.transcription, customBrief: request.customBrief, persona: request.persona, landingPageUrl: request.landingPageUrl, brandDrBalance: request.brandDrBalance, config: trainingConfig };
    
    // Determine which sections are actually referenced in templates (system/user)
    const systemTemplate = trainingConfig.stationPrompts?.[stationName]?.systemPrompt || '';
    const userTemplate = trainingConfig.stationPrompts?.[stationName]?.userPromptTemplate || '';
    const candidateSectionIds = (contextConfig.contextSections || []).map(s => s.id);
    const brandCandidateIds = ((contextConfig.brandGuidelinesConfig || []).map(g => `brand_${g.id}`));
    const referencedSectionIds = EnhancedContextBuilder.extractReferencedSectionIds(systemTemplate, userTemplate, [...candidateSectionIds, ...brandCandidateIds]);

    // Build only the sections that are referenced; ignore enabled/disabled flags
    const referencedSections = (contextConfig.contextSections || [])
      .filter(section => referencedSectionIds.has(section.id))
      .sort((a, b) => a.order - b.order);

    // Evaluate conditions and build only referenced sections
    for (const sectionConfig of referencedSections) {
      try {
        const conditionResult = this.evaluateConditions(sectionConfig.conditions, allVariables, request);
        debugInfo.evaluatedConditions[sectionConfig.id] = conditionResult;
        
        if (!conditionResult) {
          debugInfo.sectionResults[sectionConfig.id] = {
            included: false,
            reason: 'Conditions not met',
            tokens: 0
          };
          continue;
        }

        const sectionContent = await this.buildSection(sectionConfig, allVariables, trainingConfig, request);
        
        if (sectionContent.trim()) {
          const sectionTokens = this.estimateTokens(sectionContent);
          
          // Check token budget
          if (contextConfig.contextRules?.maxTotalTokens) {
            if (totalTokens + sectionTokens > contextConfig.contextRules.maxTotalTokens) {
              debugInfo.sectionResults[sectionConfig.id] = {
                included: false,
                reason: `Would exceed token budget (${sectionTokens} tokens)`,
                tokens: sectionTokens
              };
              console.warn(`Skipping section ${sectionConfig.name} - would exceed token budget`);
              continue;
            }
          }
          
          sections.push(sectionContent);
          sectionsById[sectionConfig.id] = sectionContent;
          sectionsUsed.push(sectionConfig.name);
          totalTokens += sectionTokens;
          
          debugInfo.sectionResults[sectionConfig.id] = {
            included: true,
            reason: 'Successfully included',
            tokens: sectionTokens
          };
        } else {
          debugInfo.sectionResults[sectionConfig.id] = {
            included: false,
            reason: 'Empty content generated',
            tokens: 0
          };
        }
      } catch (error) {
        console.error(`Error building section ${sectionConfig.name}:`, error);
        debugInfo.sectionResults[sectionConfig.id] = {
          included: false,
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          tokens: 0
        };
        
        if (sectionConfig.required) {
          throw error;
        }
      }
    }

    // Process brand guidelines configurations only if referenced via {{sections.brand_<id>}}
    const brandGuidelinesConfig = contextConfig.brandGuidelinesConfig;
    if (brandGuidelinesConfig) {
      const referencedBrandIds = Array.from(referencedSectionIds)
        .filter(id => id.startsWith('brand_'))
        .map(id => id.slice(6));
      const brandConfigsToBuild = brandGuidelinesConfig
        .filter(guideline => referencedBrandIds.includes(guideline.id))
        .sort((a, b) => a.order - b.order);

      for (const guidelineConfig of brandConfigsToBuild) {
        try {
          const conditionResult = this.evaluateConditions(guidelineConfig.conditions, allVariables, request);
          debugInfo.evaluatedConditions[`brand_${guidelineConfig.id}`] = conditionResult;
          
          if (!conditionResult) {
            debugInfo.sectionResults[`brand_${guidelineConfig.id}`] = {
              included: false,
              reason: 'Conditions not met',
              tokens: 0
            };
            continue;
          }

          const brandContent = AdvancedTemplateEngine.buildBrandGuidelines(guidelineConfig, trainingConfig, allVariables);
          
          if (brandContent.trim()) {
            const brandTokens = this.estimateTokens(brandContent);
            
            // Check token budget
            if (contextConfig.contextRules?.maxTotalTokens) {
              if (totalTokens + brandTokens > contextConfig.contextRules.maxTotalTokens) {
                debugInfo.sectionResults[`brand_${guidelineConfig.id}`] = {
                  included: false,
                  reason: `Would exceed token budget (${brandTokens} tokens)`,
                  tokens: brandTokens
                };
                console.warn(`Skipping brand guideline ${guidelineConfig.name} - would exceed token budget`);
                continue;
              }
            }
            
            sections.push(brandContent);
            sectionsById[`brand_${guidelineConfig.id}`] = brandContent;
            sectionsUsed.push(`Brand: ${guidelineConfig.name}`);
            totalTokens += brandTokens;
            
            debugInfo.sectionResults[`brand_${guidelineConfig.id}`] = {
              included: true,
              reason: 'Successfully included',
              tokens: brandTokens
            };
          } else {
            debugInfo.sectionResults[`brand_${guidelineConfig.id}`] = {
              included: false,
              reason: 'Empty content generated',
              tokens: 0
            };
          }
        } catch (error) {
          console.error(`Error building brand guideline ${guidelineConfig.name}:`, error);
          debugInfo.sectionResults[`brand_${guidelineConfig.id}`] = {
            included: false,
            reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            tokens: 0
          };
          
          if (guidelineConfig.required) {
            throw error;
          }
        }
      }
    }

    return { contextSections: sections, totalTokens, sectionsUsed, sectionsById, debugInfo };
  }

  /** Extract section ids referenced as {{sections.<id>}} in either template */
  private static extractReferencedSectionIds(systemTemplate: string, userTemplate: string, knownIds: string[]): Set<string> {
    const ids = new Set<string>();
    const grab = (t: string) => {
      const re = /\{\{\s*sections\.([a-zA-Z0-9_\-]+)\s*\}\}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(t)) !== null) {
        ids.add(m[1]);
      }

      // Also allow bare references like {{selected_products}} mapping directly to a section id
      const bareVarRe = /\{\{\s*([^#\/{][^}\s]+)\s*\}\}/g;
      while ((m = bareVarRe.exec(t)) !== null) {
        const varName = m[1];
        if (knownIds.includes(varName)) {
          ids.add(varName);
        }
      }
    };
    grab(systemTemplate || '');
    grab(userTemplate || '');
    return ids;
  }

  /**
   * Build individual context section
   */
  private static async buildSection(
    sectionConfig: ContextSectionConfig,
    variables: Record<string, any>,
    trainingConfig: TrainingConfig,
    request: any
  ): Promise<string> {
    // Get section data based on data source
    let sectionData: any;
    
    switch (sectionConfig.dataSource.type) {
      case 'static':
        sectionData = sectionConfig.dataSource.source;
        break;
        
      case 'function':
        sectionData = await this.callContextFunction(
          sectionConfig.dataSource.source,
          sectionConfig.dataSource.parameters || {},
          variables,
          trainingConfig,
          request
        );
        break;
        
      // Unsupported sources are ignored for now (only 'static' and 'function' are supported)
        
      default:
        sectionData = '';
    }

    // Apply template with variables
    const templateEngine = new AdvancedTemplateEngine();
    const contextWithData = { 
      ...variables, 
      sectionData, 
      config: trainingConfig, 
      request,
      // Add commonly used computed values
      brandPercent: variables.brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
      drPercent: 100 - (variables.brandDrBalance || DEFAULT_BRAND_DR_BALANCE),
      persona: variables.persona || DEFAULT_PERSONA_KEY,
    };
    
    let content = templateEngine.render(sectionConfig.template, contextWithData);
    
    // Apply formatting
    content = this.applyFormatting(content, sectionConfig.formatting);
    
    return content;
  }

  /**
   * Evaluate section conditions
   */
  private static evaluateConditions(
    conditions: ContextSectionConfig['conditions'],
    variables: Record<string, any>,
    request: any
  ): boolean {
    // Check required variables
    if (conditions.requiredVariables?.length) {
      const hasAllRequired = conditions.requiredVariables.every(varName => {
        const value = variables[varName] ?? request[varName];
        return value !== undefined && value !== null && value !== '';
      });
      if (!hasAllRequired) return false;
    }

    // Check exclude conditions
    if (conditions.excludeWhen?.length) {
      const shouldExclude = conditions.excludeWhen.some(varName => {
        const value = variables[varName] ?? request[varName];
        return value !== undefined && value !== null && value !== '';
      });
      if (shouldExclude) return false;
    }

    // Evaluate custom logic
    if (conditions.customLogic) {
      try {
        const context = { variables, request };
        const result = new Function('context', `
          const { variables, request } = context;
          return ${conditions.customLogic};
        `)(context);
        return Boolean(result);
      } catch (error) {
        console.error('Error evaluating custom condition logic:', error);
        return true; // Default to include on error
      }
    }

    return true;
  }

  /**
   * Call context function with parameters
   */
  private static async callContextFunction(
    functionName: string,
    parameters: Record<string, any>,
    variables: Record<string, any>,
    trainingConfig: TrainingConfig,
    request: any
  ): Promise<any> {
    // Map of available context functions
    const contextFunctions = {
      'buildTargetPersonaSection': (persona: string) => 
        buildTargetPersonaSection(persona, trainingConfig),
      'buildSelectedProductsSection': (selectedProduct?: string, selectedProducts?: string[]) => 
        buildSelectedProductsSection(selectedProduct, selectedProducts, trainingConfig),
      'buildCopyFrameworksSection': () => 
        buildCopyFrameworksSection(trainingConfig),
      'buildCustomBriefSection': (customBrief?: string) => 
        buildCustomBriefSection(customBrief),
      'ContentContextBuilder.buildImageAnalysisContext': (imageData?: string, imageUrl?: string, analysisType?: string) =>
        ContentContextBuilder.buildImageAnalysisContext(imageData, imageUrl, analysisType as any),
      'ContentContextBuilder.buildTranscriptionContext': (transcription?: string, contentType?: string) =>
        ContentContextBuilder.buildTranscriptionContext(transcription, contentType as any),
      'ContentContextBuilder.buildCompetitiveContext': (competitorData: any[]) =>
        ContentContextBuilder.buildCompetitiveContext(competitorData),
      'ContentContextBuilder.buildTemporalContext': (season?: string, holidays?: string[], timeframe?: string) =>
        ContentContextBuilder.buildTemporalContext(season as any, holidays, timeframe as any),
      'ContentContextBuilder.buildPsychographicContext': (audience: any) =>
        ContentContextBuilder.buildPsychographicContext(audience),
      'ContentContextBuilder.buildPerformanceContext': (metrics: any) =>
        ContentContextBuilder.buildPerformanceContext(metrics)
    };

    const func = contextFunctions[functionName as keyof typeof contextFunctions];
    if (!func) {
      throw new Error(`Unknown context function: ${functionName}`);
    }

    // Resolve parameters from variables and request
    const resolvedParams = Object.entries(parameters).map(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('$')) {
        const varName = value.substring(1);
        return variables[varName] ?? request[varName] ?? value;
      }
      return value;
    });

    // @ts-ignore - Complex function type inference
    const result: any = func(...resolvedParams);
    
    // Handle async results
    if (result && typeof result.then === 'function') {
      return await result;
    }
    
    return result;
  }

  /**
   * Apply formatting rules to content
   */
  private static applyFormatting(
    content: string,
    formatting: ContextSectionConfig['formatting']
  ): string {
    let formatted = content;

    // Apply header style
    if (formatting.headerStyle === 'uppercase') {
      formatted = formatted.replace(/^([A-Z\s]+:)/gm, (match) => match.toUpperCase());
    } else if (formatting.headerStyle === 'title') {
      formatted = formatted.replace(/^([^:]+:)/gm, (match) => 
        match.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
      );
    }

    // Apply bullet style
    if (formatting.bulletStyle !== '-') {
      if (formatting.bulletStyle === 'numbered') {
        let counter = 0;
        formatted = formatted.replace(/^-\s/gm, () => `${++counter}. `);
      } else {
        const bulletMap = {
          '•': '•',
          '→': '→'
        };
        const bullet = bulletMap[formatting.bulletStyle as keyof typeof bulletMap] || formatting.bulletStyle;
        formatted = formatted.replace(/^-\s/gm, `${bullet} `);
      }
    }

    // Apply indentation
    if (formatting.indentation > 0) {
      const indent = ' '.repeat(formatting.indentation);
      formatted = formatted.split('\n').map(line => 
        line.trim() ? indent + line : line
      ).join('\n');
    }

    // Apply spacing
    if (formatting.spacing === 'compact') {
      formatted = formatted.replace(/\n\n+/g, '\n');
    } else if (formatting.spacing === 'spacious') {
      formatted = formatted.replace(/\n(?=[A-Z])/g, '\n\n');
    }

    return formatted;
  }

  /**
   * Estimate token count
   */
  private static estimateTokens(text: string): number {
    // Rough token estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }

  /**
   * Fallback to legacy context building
   */
  private static async buildLegacyContext(
    stationName: string,
    trainingConfig: TrainingConfig,
    request: any,
    variables: Record<string, any>
  ): Promise<{
    contextSections: string[];
    totalTokens: number;
    sectionsUsed: string[];
    debugInfo: any;
  }> {
    const sections: string[] = [];
    const sectionsUsed: string[] = [];

    // Build legacy sections based on station
    if (stationName === 'adCopy') {
      const transcriptionContext = ContentContextBuilder.buildTranscriptionContext(request.transcription, 'video');
      if (transcriptionContext) {
        sections.push(transcriptionContext);
        sectionsUsed.push('Transcription Context');
      }

      const targetPersonaSection = buildTargetPersonaSection(request.persona || variables.persona, trainingConfig);
      if (targetPersonaSection) {
        sections.push(targetPersonaSection);
        sectionsUsed.push('Target Persona');
      }

      const selectedProductsSection = buildSelectedProductsSection(
        request.selectedProduct || variables.selectedProduct,
        request.selectedProducts || variables.selectedProducts,
        trainingConfig
      );
      if (selectedProductsSection) {
        sections.push(selectedProductsSection);
        sectionsUsed.push('Selected Products');
      }

      const copyFrameworksSection = buildCopyFrameworksSection(trainingConfig);
      if (copyFrameworksSection) {
        sections.push(copyFrameworksSection);
        sectionsUsed.push('Copy Frameworks');
      }

      const customBriefSection = buildCustomBriefSection(request.customBrief || variables.customBrief);
      if (customBriefSection) {
        sections.push(customBriefSection);
        sectionsUsed.push('Custom Brief');
      }

      const { contextSection: imageAnalysisSection } = ContentContextBuilder.buildImageAnalysisContext(
        request.uploadedImage || variables.uploadedImage,
        request.airLink || variables.airLink,
        'ad_creative'
      );
      if (imageAnalysisSection) {
        sections.push(imageAnalysisSection);
        sectionsUsed.push('Image Analysis');
      }
    }

    const totalTokens = sections.reduce((total, section) => total + this.estimateTokens(section), 0);

    return {
      contextSections: sections,
      totalTokens,
      sectionsUsed,
      debugInfo: {
        legacy: true,
        availableVariables: variables,
        evaluatedConditions: {},
        sectionResults: {}
      }
    };
  }

  // Database/API data sources removed for simplicity
}

/**
 * Advanced template engine for context templates
 */
export class AdvancedTemplateEngine {
  render(template: string, context: any): string {
    let rendered = template;

    // Process conditionals first
    rendered = this.processConditionals(rendered, context);
    
    // Process loops
    rendered = this.processLoops(rendered, context);
    
    // Process simple variables
    rendered = this.processVariables(rendered, context);
    
    // Process helpers
    rendered = this.processHelpers(rendered, context);

    // Clean up extra whitespace
    rendered = rendered.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return rendered;
  }

  private processConditionals(template: string, context: any): string {
    // Handle {{#if condition}}...{{/if}}
    return template.replace(
      /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        try {
          const result = this.evaluateExpression(condition.trim(), context);
          return result ? content : '';
        } catch (error) {
          console.error('Error evaluating condition:', condition, error);
          return '';
        }
      }
    );
  }

  private processLoops(template: string, context: any): string {
    // Handle {{#each array}}...{{/each}}
    return template.replace(
      /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayPath, content) => {
        try {
          const array = this.getNestedValue(context, arrayPath.trim());
          if (!Array.isArray(array)) return '';
          
          return array.map((item, index) => {
            const itemContext = { ...context, this: item, index, '@index': index };
            return this.processVariables(content, itemContext);
          }).join('');
        } catch (error) {
          console.error('Error processing loop:', arrayPath, error);
          return '';
        }
      }
    );
  }

  private processVariables(template: string, context: any): string {
    // Handle {{variable}} and {{object.property}}
    return template.replace(
      /\{\{([^}#\/]+)\}\}/g,
      (match, path) => {
        try {
          const cleanPath = path.trim();
          if (cleanPath.includes(' ')) {
            // This might be a helper call, skip for now
            return match;
          }
          const value = this.getNestedValue(context, cleanPath);
          return value !== undefined && value !== null ? String(value) : '';
        } catch (error) {
          console.error('Error processing variable:', path, error);
          return '';
        }
      }
    );
  }

  private processHelpers(template: string, context: any): string {
    const helpers = {
      join: (array: any[], separator: string = ', ') => 
        Array.isArray(array) ? array.join(separator) : '',
      capitalize: (str: string) => 
        str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
      upper: (str: string) => 
        str ? str.toUpperCase() : '',
      lower: (str: string) => 
        str ? str.toLowerCase() : '',
      truncate: (str: string, length: number) => 
        str && str.length > length ? str.substring(0, length) + '...' : str || '',
      formatPercentage: (value: number) => 
        `${value}%`
    };

    // Handle {{helper arg1 arg2}}
    return template.replace(
      /\{\{(\w+)\s+([^}]+)\}\}/g,
      (match, helperName, args) => {
        try {
          const helper = helpers[helperName as keyof typeof helpers];
          if (!helper) return match;
          
          const argValues = this.parseArguments(args, context);
          // @ts-ignore - Complex helper function type inference
          return String(helper(...argValues));
        } catch (error) {
          console.error('Error processing helper:', helperName, error);
          return match;
        }
      }
    );
  }

  private parseArguments(argsString: string, context: any): any[] {
    // Simple argument parsing - handles strings, numbers, and variable references
    const args = argsString.trim().split(/\s+/);
    return args.map(arg => {
      if (arg.startsWith('"') && arg.endsWith('"')) {
        return arg.slice(1, -1); // String literal
      }
      if (arg.startsWith("'") && arg.endsWith("'")) {
        return arg.slice(1, -1); // String literal
      }
      if (!isNaN(Number(arg))) {
        return Number(arg); // Number literal
      }
      return this.getNestedValue(context, arg); // Variable reference
    });
  }

  private getNestedValue(obj: any, path: string): any {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateExpression(expression: string, context: any): boolean {
    // Simple expression evaluation for conditions
    try {
      // Handle simple truthiness checks
      if (!expression.includes(' ')) {
        const value = this.getNestedValue(context, expression);
        return Boolean(value);
      }

      // Handle simple comparisons
      const comparisonMatch = expression.match(/^(.+?)\s*(===|!==|==|!=|>|>=|<|<=)\s*(.+)$/);
      if (comparisonMatch) {
        const [, left, operator, right] = comparisonMatch;
        const leftValue = this.getNestedValue(context, left.trim());
        let rightValue: any = right.trim();
        
        // Parse right value
        if (rightValue.startsWith('"') && rightValue.endsWith('"')) {
          rightValue = rightValue.slice(1, -1);
        } else if (!isNaN(Number(rightValue))) {
          rightValue = Number(rightValue);
        } else {
          rightValue = this.getNestedValue(context, rightValue);
        }

        switch (operator) {
          case '===': return leftValue === rightValue;
          case '!==': return leftValue !== rightValue;
          case '==': return leftValue == rightValue;
          case '!=': return leftValue != rightValue;
          case '>': return leftValue > rightValue;
          case '>=': return leftValue >= rightValue;
          case '<': return leftValue < rightValue;
          case '<=': return leftValue <= rightValue;
          default: return false;
        }
      }

      // Handle logical operators
      if (expression.includes('||')) {
        return expression.split('||').some(part => 
          this.evaluateExpression(part.trim(), context)
        );
      }
      
      if (expression.includes('&&')) {
        return expression.split('&&').every(part => 
          this.evaluateExpression(part.trim(), context)
        );
      }

      // Fallback to simple truthiness
      const value = this.getNestedValue(context, expression);
      return Boolean(value);
    } catch (error) {
      console.error('Error evaluating expression:', expression, error);
      return false;
    }
  }

  /**
   * Build brand guidelines content based on configuration
   */
  static buildBrandGuidelines(
    config: BrandGuidelinesConfig,
    trainingConfig: TrainingConfig,
    variables: Record<string, any>
  ): string {
    if (!trainingConfig.brandGuidelines) {
      return '';
    }

    // Use custom template if provided
    if (config.template && config.template.trim()) {
      const templateEngine = new AdvancedTemplateEngine();
      const brandContext = {
        ...variables,
        corePositioning: trainingConfig.brandGuidelines.corePositioning,
        brandVoice: trainingConfig.brandGuidelines.brandVoice?.filter((_, i) => 
          trainingConfig.brandGuidelines.enabledBrandVoice?.[i] !== false
        ) || [],
        keyTerminology: trainingConfig.brandGuidelines.keyTerminology?.filter((_, i) => 
          trainingConfig.brandGuidelines.enabledKeyTerminology?.[i] !== false
        ) || [],
        approvedLanguage: trainingConfig.brandGuidelines.approvedLanguage?.filter((_, i) => 
          trainingConfig.brandGuidelines.enabledApprovedLanguage?.[i] !== false
        ) || [],
        avoidedLanguage: trainingConfig.brandGuidelines.avoidedLanguage?.filter((_, i) => 
          trainingConfig.brandGuidelines.enabledAvoidedLanguage?.[i] !== false
        ) || []
      };
      
      return templateEngine.render(config.template, brandContext);
    }

    // Use default formatting based on configuration
    const parts: string[] = [];
    const { formatting, includeTypes } = config;
    const spacing = formatting.spacing === 'compact' ? '\n' : 
                   formatting.spacing === 'spacious' ? '\n\n' : '\n';
    const bullet = formatting.bulletStyle === 'numbered' ? '1. ' : `${formatting.bulletStyle} `;

    // Header
    if (formatting.includeHeaders) {
      let header = 'Brand Guidelines';
      if (formatting.headerStyle === 'uppercase') header = header.toUpperCase();
      if (formatting.headerStyle === 'title') header = header.replace(/\b\w/g, l => l.toUpperCase());
      parts.push(header + ':');
    }

    // Core Positioning
    if (includeTypes.corePositioning && trainingConfig.brandGuidelines.corePositioning) {
      if (formatting.includeHeaders) parts.push('Core Positioning:');
      parts.push(trainingConfig.brandGuidelines.corePositioning);
      parts.push(''); // spacing
    }

    // Brand Voice
    if (includeTypes.brandVoice && trainingConfig.brandGuidelines.brandVoice) {
      const enabledVoice = trainingConfig.brandGuidelines.brandVoice.filter((_, index) => 
        trainingConfig.brandGuidelines.enabledBrandVoice?.[index] !== false
      );
      if (enabledVoice.length > 0) {
        if (formatting.includeHeaders) parts.push('Brand Voice:');
        enabledVoice.forEach((rule, index) => {
          const bulletText = formatting.bulletStyle === 'numbered' ? `${index + 1}. ` : bullet;
          parts.push(`${bulletText}${rule}`);
        });
        parts.push(''); // spacing
      }
    }

    // Key Terminology
    if (includeTypes.keyTerminology && trainingConfig.brandGuidelines.keyTerminology) {
      const enabledTerms = trainingConfig.brandGuidelines.keyTerminology.filter((_, index) => 
        trainingConfig.brandGuidelines.enabledKeyTerminology?.[index] !== false
      );
      if (enabledTerms.length > 0) {
        if (formatting.includeHeaders) parts.push('Key Terms:');
        enabledTerms.forEach((term, index) => {
          const bulletText = formatting.bulletStyle === 'numbered' ? `${index + 1}. ` : bullet;
          parts.push(`${bulletText}${term}`);
        });
        parts.push(''); // spacing
      }
    }

    // Approved Language
    if (includeTypes.approvedLanguage && trainingConfig.brandGuidelines.approvedLanguage) {
      const enabledApproved = trainingConfig.brandGuidelines.approvedLanguage.filter((_, index) => 
        trainingConfig.brandGuidelines.enabledApprovedLanguage?.[index] !== false
      );
      if (enabledApproved.length > 0) {
        if (formatting.includeHeaders) parts.push('Approved Language:');
        enabledApproved.forEach((phrase, index) => {
          const bulletText = formatting.bulletStyle === 'numbered' ? `${index + 1}. ` : bullet;
          parts.push(`${bulletText}${phrase}`);
        });
        parts.push(''); // spacing
      }
    }

    // Avoided Language
    if (includeTypes.avoidedLanguage && trainingConfig.brandGuidelines.avoidedLanguage) {
      const enabledAvoided = trainingConfig.brandGuidelines.avoidedLanguage.filter((_, index) => 
        trainingConfig.brandGuidelines.enabledAvoidedLanguage?.[index] !== false
      );
      if (enabledAvoided.length > 0) {
        if (formatting.includeHeaders) parts.push('Avoid These:');
        enabledAvoided.forEach((phrase, index) => {
          const bulletText = formatting.bulletStyle === 'numbered' ? `${index + 1}. ` : bullet;
          parts.push(`${bulletText}${phrase}`);
        });
        parts.push(''); // spacing
      }
    }

    return parts.join(spacing).trim();
  }
}