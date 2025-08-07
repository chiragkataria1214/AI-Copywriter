import { TrainingConfig } from '@shared/training-config';
import sharp from 'sharp';
// Helper functions for image processing
export function detectImageType(base64String: string): string {
  // If it's already a data URL, extract the type
  if (base64String.startsWith('data:image/')) {
    if (base64String.startsWith('data:image/png')) return 'image/png';
    if (base64String.startsWith('data:image/jpeg') || base64String.startsWith('data:image/jpg')) return 'image/jpeg';
    if (base64String.startsWith('data:image/gif')) return 'image/gif';
    if (base64String.startsWith('data:image/webp')) return 'image/webp';
  }
  
  // For raw base64, try to detect from magic bytes
  const bytes = base64String.substring(0, 20);
  
  // PNG signature: iVBORw0KGgo
  if (bytes.startsWith('iVBORw0KGgo')) return 'image/png';
  
  // JPEG signature: /9j/
  if (bytes.startsWith('/9j/')) return 'image/jpeg';
  
  // GIF signature: R0lGODlh or R0lGODdh
  if (bytes.startsWith('R0lGODlh') || bytes.startsWith('R0lGODdh')) return 'image/gif';
  
  // WebP signature: UklGR
  if (bytes.startsWith('UklGR')) return 'image/webp';
  
  // Default to jpeg if cannot detect
  return 'image/jpeg';
}

// Function to resize image if it exceeds Anthropic's dimension or file size limits
export async function resizeImageIfNeeded(base64String: string, maxDimension: number = 8000, maxSizeBytes: number = 4.5 * 1024 * 1024): Promise<{ data: string; mediaType: string }> {
  try {
    // Extract base64 data (remove data URL prefix if present)
    let imageData = base64String;
    let originalMediaType = 'image/jpeg'; // default
    
    if (base64String.startsWith('data:image/')) {
      const base64Match = base64String.match(/^data:image\/[^;]+;base64,(.+)$/);
      if (base64Match) {
        imageData = base64Match[1];
        // Extract original media type from data URL
        const mediaTypeMatch = base64String.match(/^data:(image\/[^;]+);/);
        if (mediaTypeMatch) {
          originalMediaType = mediaTypeMatch[1];
        }
      }
    } else {
      // For raw base64, detect the type
      originalMediaType = detectImageType(base64String);
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    // Check current file size
    const currentSizeBytes = buffer.length;
    console.log(`Image size: ${currentSizeBytes} bytes (${(currentSizeBytes / 1024 / 1024).toFixed(2)}MB), limit: ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB`);
    
    // Check if resizing or compression is needed
    const needsDimensionResize = metadata.width && metadata.height && 
        (metadata.width > maxDimension || metadata.height > maxDimension);
    const needsSizeCompression = currentSizeBytes > maxSizeBytes;
    
    if (needsDimensionResize || needsSizeCompression) {
      console.log(`Processing image: dimensions=${needsDimensionResize ? 'YES' : 'NO'}, size=${needsSizeCompression ? 'YES' : 'NO'}`);
      
      let sharpInstance = sharp(buffer);
      
      // Resize if needed
      if (needsDimensionResize) {
        console.log(`Resizing image from ${metadata.width}x${metadata.height} to fit within ${maxDimension}px`);
        sharpInstance = sharpInstance.resize(maxDimension, maxDimension, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Start with high quality and reduce if needed
      let quality = 85;
      let processedBuffer: Buffer;
      let currentDimension = maxDimension;
      
      // Progressive compression and resizing loop
      do {
        processedBuffer = await sharp(buffer)
          .resize(currentDimension, currentDimension, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality })
          .toBuffer();
        
        console.log(`Compressed to ${processedBuffer.length} bytes with quality ${quality} and dimension ${currentDimension}`);
        
        // If still too large, try reducing quality first, then dimensions
        if (processedBuffer.length > maxSizeBytes) {
          if (quality > 20) {
            quality -= 15;
          } else if (currentDimension > 1000) {
            // Reset quality and reduce dimensions
            quality = 70;
            currentDimension = Math.max(1000, Math.floor(currentDimension * 0.8));
          } else {
            // Final aggressive compression
            quality = Math.max(10, quality - 10);
          }
        } else {
          break;
        }
      } while (processedBuffer.length > maxSizeBytes && (quality > 10 || currentDimension > 500));
      
      // Final safety check - if still too large, apply most aggressive settings
      if (processedBuffer.length > maxSizeBytes) {
        console.log('Applying final aggressive compression...');
        processedBuffer = await sharp(buffer)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ 
            quality: 10,
            progressive: true,
            optimiseScans: true,
            trellisQuantisation: true,
            overshootDeringing: true
          })
          .toBuffer();
        
        console.log(`Final aggressive compression: ${processedBuffer.length} bytes`);
        
        // Last resort - if still too large, throw an error
        if (processedBuffer.length > maxSizeBytes) {
          throw new Error(`Unable to compress image below ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB limit. Final size: ${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB`);
        }
      }
      
      // Convert back to base64
      return {
        data: processedBuffer.toString('base64'),
        mediaType: 'image/jpeg' // Always JPEG after processing
      };
    }
    
    // Return original if no processing needed
    return {
      data: imageData,
      mediaType: originalMediaType
    };
  } catch (error) {
    console.error('Error processing image:', error);
    
    // If processing fails, try a simple fallback compression
    try {
      console.log('Attempting fallback compression...');
      const fallbackData = base64String.startsWith('data:image/') 
        ? base64String.split(',')[1] 
        : base64String;
      
      const buffer = Buffer.from(fallbackData, 'base64');
      const compressedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 50 })
        .toBuffer();
      
      if (compressedBuffer.length <= maxSizeBytes) {
        console.log(`Fallback compression successful: ${compressedBuffer.length} bytes`);
        return {
          data: compressedBuffer.toString('base64'),
          mediaType: 'image/jpeg'
        };
      }
    } catch (fallbackError) {
      console.error('Fallback compression also failed:', fallbackError);
    }
    
    // If all else fails, throw an error rather than returning oversized image
    throw new Error('Unable to process image to meet size requirements');
  }
}
/**
 * Processes an image for Anthropic API usage
 * Handles data URLs, raw base64, and URL fetching with consistent resizing and formatting
 */
export async function processImageForAnthropic(
  imageInput: string,
  options: {
    maxDimension?: number;
    maxSizeBytes?: number;
    logContext?: string;
  } = {}
): Promise<{
  type: 'image';
  source: {
    type: 'base64';
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    data: string;
  };
} | null> {
  const { maxDimension = 8000, maxSizeBytes = 4.5 * 1024 * 1024, logContext = 'image' } = options;

  try {
    let base64Data: string;
    let originalMediaType: string = 'image/jpeg';

    // Handle different input formats
    if (imageInput.startsWith('data:image/')) {
      // Data URL format
      const mimeMatch = imageInput.match(/^data:image\/([a-zA-Z0-9+/]+);base64,(.+)$/);
      if (mimeMatch) {
        originalMediaType = `image/${mimeMatch[1]}`;
        base64Data = mimeMatch[2];
      } else {
        throw new Error('Invalid data URL format');
      }
    } else if (imageInput.startsWith('http')) {
      // URL - fetch and convert
      const imageResponse = await fetch(imageInput);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      const buffer = await imageResponse.arrayBuffer();
      base64Data = Buffer.from(buffer).toString('base64');
      originalMediaType = imageResponse.headers.get('content-type') || 'image/jpeg';
    } else {
      // Assume raw base64
      base64Data = imageInput;
      originalMediaType = detectImageType(imageInput);
    }

    // Log original image details if context provided
    if (logContext) {
      const originalSizeBytes = Buffer.from(base64Data, 'base64').length;
      console.log(`${logContext} processing:`, {
        detectedType: originalMediaType,
        originalSizeBytes,
        originalSizeMB: (originalSizeBytes / 1024 / 1024).toFixed(2)
      });
    }

    // Resize and compress image
    const { data: resizedImageData, mediaType: finalMediaType } = await resizeImageIfNeeded(
      base64Data, 
      maxDimension, 
      maxSizeBytes
    );

    // Log final processed image size
    if (logContext) {
      const finalSizeBytes = Buffer.from(resizedImageData, 'base64').length;
      console.log(`${logContext} processed:`, {
        finalSizeBytes,
        finalSizeMB: (finalSizeBytes / 1024 / 1024).toFixed(2),
        mediaType: finalMediaType
      });
    }

    return {
      type: 'image',
      source: {
        type: 'base64',
        media_type: finalMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: resizedImageData
      }
    };

  } catch (error) {
    console.error(`Failed to process ${logContext}:`, error);
    return null;
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
    const headlines = parsedResponse.headlines.slice(0, 5).map((item: any) => ({
      framework: item.framework || 'GENERAL',
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
      headlineMatches.slice(0, 5).forEach((match) => {
        const cleanMatch = match.replace(/(?:HEADLINE|##\s*HEADLINE)[^:]*:?\s*/i, '').trim();
        if (cleanMatch) {
          headlines.push({
            framework: 'GENERAL',
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
 * Enhanced Station Prompt Manager for consistent, optimized prompt building
 */
export class StationPromptManager {
  private static readonly STATION_CONFIGS = {
    adCopy: {
      name: 'Ad Copy Generation',
      requiredSections: ['targetPersona', 'selectedProducts', 'copyFrameworks'],
      optionalSections: ['landingPageContext', 'imageAnalysis', 'customBrief'],
      outputFormat: 'structured_json',
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
      outputFormat: 'story_json',
      maxTokens: 2000
    }
  };

  /**
   * Build a complete system prompt for any station
   */
  static buildStationSystemPrompt(
    stationName: string,
    trainingConfig: TrainingConfig,
    options: {
      concept?: string;
      selectedProduct?: string;
      selectedProducts?: string[];
      brandDrBalance?: number;
      useJonesBrandGuide?: boolean;
    } = {}
  ): string {
    try {
      const stationConfig = this.STATION_CONFIGS[stationName as keyof typeof this.STATION_CONFIGS];
      if (!stationConfig) {
        throw new Error(`Unknown station: ${stationName}. Available stations: ${Object.keys(this.STATION_CONFIGS).join(', ')}`);
      }

      // Get base system prompt from training config
      const baseSystemPrompt = trainingConfig?.stationPrompts?.[stationName]?.systemPrompt;
      if (!baseSystemPrompt) {
        throw new Error(`${stationConfig.name} system prompt not found in training configuration. Please ensure the database contains proper station prompt configuration for '${stationName}'.`);
      }

      // Build AI Settings context
      const aiSettingsContext = buildAISettingsContext(trainingConfig, options);

      // Add station-specific enhancements (with error handling)
      let stationEnhancements = '';
      try {
        stationEnhancements = this.buildStationEnhancements(stationName, trainingConfig);
      } catch (enhancementError) {
        console.warn(`Warning: Failed to build station enhancements for ${stationName}:`, enhancementError);
        // Continue without enhancements rather than failing completely
      }

      // Build quality guidelines
      const qualityGuidelines = this.buildQualityGuidelines(stationName, trainingConfig);

      return [
        baseSystemPrompt,
        aiSettingsContext,
        stationEnhancements,
        qualityGuidelines
      ].filter(Boolean).join('\n\n');
    } catch (error) {
      console.error(`Error building system prompt for station '${stationName}':`, error);
      throw new Error(`Failed to build system prompt for ${stationName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build a complete user prompt for any station
   */
  static buildStationUserPrompt(
    stationName: string,
    trainingConfig: TrainingConfig,
    templateVariables: Record<string, string>,
    contextSections: string[] = []
  ): string {
    try {
      const stationConfig = this.STATION_CONFIGS[stationName as keyof typeof this.STATION_CONFIGS];
      if (!stationConfig) {
        throw new Error(`Unknown station: ${stationName}. Available stations: ${Object.keys(this.STATION_CONFIGS).join(', ')}`);
      }

      // Get user prompt template from training config
      const userTemplate = trainingConfig?.stationPrompts?.[stationName]?.userPromptTemplate;
      if (!userTemplate) {
        throw new Error(`${stationConfig.name} user prompt template not found in training configuration. Please ensure the database contains proper station prompt configuration for '${stationName}'.`);
      }

      // Process template variables safely
      let processedTemplate = '';
      try {
        processedTemplate = AIPromptBuilder.replaceTemplateVariables(userTemplate, templateVariables);
      } catch (templateError) {
        console.warn(`Warning: Failed to process template variables for ${stationName}:`, templateError);
        processedTemplate = userTemplate; // Use template as-is if variable replacement fails
      }

      // Add output format instructions
      const outputInstructions = this.buildOutputFormatInstructions(stationName, trainingConfig);

      return [
        processedTemplate,
        ...contextSections.filter(Boolean),
        outputInstructions
      ].filter(Boolean).join('\n\n');
    } catch (error) {
      console.error(`Error building user prompt for station '${stationName}':`, error);
      throw new Error(`Failed to build user prompt for ${stationName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build station-specific enhancements
   */
  private static buildStationEnhancements(stationName: string, trainingConfig: TrainingConfig): string {
    const stationPrompts = trainingConfig?.stationPrompts?.[stationName];
    if (!stationPrompts) return '';

    const enhancements: string[] = [];

    // Helper function to safely check if a property is a non-empty array
    const isNonEmptyArray = (arr: any): arr is any[] => {
      return Array.isArray(arr) && arr.length > 0;
    };

    // Copy writing rules
    if (isNonEmptyArray(stationPrompts.copyWritingRules)) {
      enhancements.push(`# Copy Writing Rules:\n${stationPrompts.copyWritingRules.map(rule => `- ${rule}`).join('\n')}`);
    }

    // Content structure rules
    if (isNonEmptyArray(stationPrompts.contentStructureRules)) {
      enhancements.push(`# Content Structure Rules:\n${stationPrompts.contentStructureRules.map(rule => `- ${rule}`).join('\n')}`);
    }

    // Conversion guidelines
    if (isNonEmptyArray(stationPrompts.conversionGuidelines)) {
      const enabledGuidelines = stationPrompts.conversionGuidelines.filter((_, index) => 
        !stationPrompts.enabledConversionGuidelines || 
        (Array.isArray(stationPrompts.enabledConversionGuidelines) && stationPrompts.enabledConversionGuidelines[index])
      );
      if (enabledGuidelines.length > 0) {
        enhancements.push(`# Conversion Guidelines:\n${enabledGuidelines.map(guideline => `- ${guideline}`).join('\n')}`);
      }
    }

    // Platform-specific guidelines
    if (isNonEmptyArray(stationPrompts.platformGuidelines)) {
      enhancements.push(`# Platform Guidelines:\n${stationPrompts.platformGuidelines.map(guideline => `- ${guideline}`).join('\n')}`);
    }

    // CTA guidelines
    if (isNonEmptyArray(stationPrompts.ctaGuidelines)) {
      enhancements.push(`# CTA Guidelines:\n${stationPrompts.ctaGuidelines.map(guideline => `- ${guideline}`).join('\n')}`);
    }

    // Image text balance rules
    if (isNonEmptyArray(stationPrompts.imageTextBalanceRules)) {
      enhancements.push(`# Image Text Balance Rules:\n${stationPrompts.imageTextBalanceRules.map(rule => `- ${rule}`).join('\n')}`);
    }

    // Subject line frameworks (for email stations)
    if (isNonEmptyArray(stationPrompts.subjectLineFrameworks)) {
      const enabledFrameworks = stationPrompts.subjectLineFrameworks.filter((_, index) => 
        !stationPrompts.enabledSubjectLineFrameworks || 
        (Array.isArray(stationPrompts.enabledSubjectLineFrameworks) && stationPrompts.enabledSubjectLineFrameworks[index])
      );
      if (enabledFrameworks.length > 0) {
        enhancements.push(`# Subject Line Frameworks:\n${enabledFrameworks.map(framework => `- ${framework}`).join('\n')}`);
      }
    }

    // Retention best practices (for retention stations)
    if (isNonEmptyArray(stationPrompts.retentionBestPractices)) {
      enhancements.push(`# Retention Best Practices:\n${stationPrompts.retentionBestPractices.map(practice => `- ${practice}`).join('\n')}`);
    }

    return enhancements.join('\n\n');
  }

  /**
   * Build quality guidelines for consistent output
   */
  private static buildQualityGuidelines(stationName: string, trainingConfig: TrainingConfig): string {
    const guidelines: string[] = [
      '# Quality Standards:',
      '- Maintain brand voice consistency throughout',
      '- Ensure all claims are accurate and supportable',
      '- Use clear, compelling language that drives action',
      '- Optimize for the target audience and platform',
      '- Follow all regulatory and compliance requirements'
    ];

    // Add station-specific quality guidelines
    switch (stationName) {
      case 'adCopy':
        guidelines.push(
          '- Headlines must be attention-grabbing and benefit-focused',
          '- Primary text should build desire and urgency',
          '- Include clear calls-to-action',
          '- Balance brand storytelling with direct response elements'
        );
        break;
      case 'emailSmsRetention':
        guidelines.push(
          '- Subject lines must drive open rates',
          '- Content should re-engage inactive customers',
          '- Include personalization where possible',
          '- Provide clear value proposition for return'
        );
        break;
      case 'landingPage':
        guidelines.push(
          '- Headlines should match ad messaging',
          '- Structure content for easy scanning',
          '- Include social proof and risk reversal',
          '- Optimize for conversion and user experience'
        );
        break;
    }

    return guidelines.join('\n');
  }

  /**
   * Build output format instructions based on station type
   */
  private static buildOutputFormatInstructions(stationName: string, trainingConfig: TrainingConfig): string {
    const stationConfig = this.STATION_CONFIGS[stationName as keyof typeof this.STATION_CONFIGS];
    
    const formatInstructions: Record<string, string> = {
      structured_json: `
# Output Format:
Return your response as valid JSON with this structure:
{
  "headlines": [
    {"framework": "FRAMEWORK_NAME", "copy": "Headline text"}
  ],
  "primaryText": "Primary text content"
}`,
      
      email_structure: `
# Output Format:
Return your response as valid JSON with this structure:
{
  "subjectLine": "Email subject line",
  "preheader": "Preview text",
  "content": "Email body content",
  "cta": "Call to action text"
}`,
      
      social_captions: `
# Output Format:
Return your response as a JSON array:
[
  {
    "platform": "PLATFORM_NAME",
    "caption": "Caption text",
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
]`,
      
      story_json: `
# Output Format:
Return your response as a JSON array:
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

    return formatInstructions[stationConfig.outputFormat] || formatInstructions.flexible;
  }

  /**
   * Validate prompt completeness for a station
   */
  static validateStationPrompt(stationName: string, trainingConfig: TrainingConfig): {
    isValid: boolean;
    missingElements: string[];
    warnings: string[];
  } {
    const stationConfig = this.STATION_CONFIGS[stationName as keyof typeof this.STATION_CONFIGS];
    if (!stationConfig) {
      return { isValid: false, missingElements: ['Unknown station'], warnings: [] };
    }

    const missingElements: string[] = [];
    const warnings: string[] = [];

    // Check system prompt
    if (!trainingConfig?.stationPrompts?.[stationName]?.systemPrompt) {
      missingElements.push('System prompt');
    }

    // Check user prompt template
    if (!trainingConfig?.stationPrompts?.[stationName]?.userPromptTemplate) {
      missingElements.push('User prompt template');
    }

    // Check required configuration elements
    if (stationConfig.requiredSections.includes('targetPersona') && !trainingConfig?.personaPillars) {
      warnings.push('No persona pillars configured');
    }

    // Note: Product configuration is checked elsewhere in the system
    // This validation focuses on prompt structure rather than data availability

    return {
      isValid: missingElements.length === 0,
      missingElements,
      warnings
    };
  }

  /**
   * Get optimal model parameters for a station
   */
  static getStationModelParams(stationName: string, trainingConfig: TrainingConfig) {
    const stationConfig = this.STATION_CONFIGS[stationName as keyof typeof this.STATION_CONFIGS];
    const defaultParams = trainingConfig?.modelParameters || {};
    
    return {
      model: defaultParams.model || 'claude-3-sonnet-20240229',
      max_tokens: stationConfig?.maxTokens || 2000,
      temperature: defaultParams.temperature || 0.7
    };
  }

  /**
   * Debug utility to inspect station configuration
   */
  static debugStationConfig(stationName: string, trainingConfig: TrainingConfig): {
    stationExists: boolean;
    hasSystemPrompt: boolean;
    hasUserTemplate: boolean;
    availableEnhancements: string[];
    configStructure: any;
  } {
    const stationConfig = this.STATION_CONFIGS[stationName as keyof typeof this.STATION_CONFIGS];
    const stationPrompts = trainingConfig?.stationPrompts?.[stationName];
    
    const availableEnhancements: string[] = [];
    
    if (stationPrompts) {
      if (Array.isArray(stationPrompts.copyWritingRules) && stationPrompts.copyWritingRules.length > 0) {
        availableEnhancements.push('copyWritingRules');
      }
      if (Array.isArray(stationPrompts.contentStructureRules) && stationPrompts.contentStructureRules.length > 0) {
        availableEnhancements.push('contentStructureRules');
      }
      if (Array.isArray(stationPrompts.conversionGuidelines) && stationPrompts.conversionGuidelines.length > 0) {
        availableEnhancements.push('conversionGuidelines');
      }
      if (Array.isArray(stationPrompts.platformGuidelines) && stationPrompts.platformGuidelines.length > 0) {
        availableEnhancements.push('platformGuidelines');
      }
      if (Array.isArray(stationPrompts.ctaGuidelines) && stationPrompts.ctaGuidelines.length > 0) {
        availableEnhancements.push('ctaGuidelines');
      }
    }

    return {
      stationExists: !!stationConfig,
      hasSystemPrompt: !!(stationPrompts?.systemPrompt),
      hasUserTemplate: !!(stationPrompts?.userPromptTemplate),
      availableEnhancements,
      configStructure: stationPrompts ? Object.keys(stationPrompts) : []
    };
  }
}

/**
 * Specialized context builders for different content types
 */
export class ContentContextBuilder {
  /**
   * Build image analysis context for visual content
   */
  static buildImageAnalysisContext(
    imageData: string | undefined, 
    imageUrl: string | undefined,
    analysisType: 'ad_creative' | 'product_photo' | 'social_content' = 'ad_creative'
  ): { 
    contextSection: string; 
    hasImageContent: boolean; 
    imageInput?: string;
  } {
    let contextSection = '';
    let hasImageContent = false;
    let imageInput: string | undefined;

    const analysisInstructions = {
      ad_creative: 'Analyze the ad creative to extract key visual elements, text overlay, color scheme, brand elements, and overall messaging strategy.',
      product_photo: 'Analyze the product image to identify key features, benefits, and visual selling points.',
      social_content: 'Analyze the social media content to understand the style, tone, and engagement elements.'
    };

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
   * Build transcription context for video/audio content
   */
  static buildTranscriptionContext(
    transcription: string | undefined,
    contentType: 'video' | 'audio' | 'ugc' | 'testimonial' = 'video'
  ): string {
    if (!transcription || !transcription.trim()) return '';

    const contextLabels = {
      video: 'VIDEO TRANSCRIPTION',
      audio: 'AUDIO TRANSCRIPTION', 
      ugc: 'USER-GENERATED CONTENT',
      testimonial: 'CUSTOMER TESTIMONIAL'
    };

    return `
# ${contextLabels[contentType]}:
${transcription.trim()}

Use this content as the foundation for your copy, extracting key messages, emotional hooks, and authentic language that resonates with the target audience.`;
  }

  /**
   * Build competitive analysis context
   */
  static buildCompetitiveContext(
    competitorData: {
      brand?: string;
      messaging?: string;
      positioning?: string;
      strengths?: string[];
      weaknesses?: string[];
    }[]
  ): string {
    if (!competitorData || competitorData.length === 0) return '';

    const competitorSections = competitorData.map((competitor, index) => {
      const sections = [`## Competitor ${index + 1}: ${competitor.brand || 'Unknown'}`];
      
      if (competitor.messaging) sections.push(`Messaging: ${competitor.messaging}`);
      if (competitor.positioning) sections.push(`Positioning: ${competitor.positioning}`);
      if (competitor.strengths?.length) sections.push(`Strengths: ${competitor.strengths.join(', ')}`);
      if (competitor.weaknesses?.length) sections.push(`Weaknesses: ${competitor.weaknesses.join(', ')}`);
      
      return sections.join('\n');
    }).join('\n\n');

    return `
# COMPETITIVE LANDSCAPE:
${competitorSections}

Use this competitive intelligence to differentiate your messaging and highlight unique value propositions.`;
  }

  /**
   * Build seasonal/temporal context
   */
  static buildTemporalContext(
    season?: 'spring' | 'summer' | 'fall' | 'winter',
    holidays?: string[],
    timeframe?: 'urgent' | 'planned' | 'evergreen'
  ): string {
    if (!season && !holidays?.length && !timeframe) return '';

    const sections: string[] = ['# TIMING & SEASONAL CONTEXT:'];

    if (season) {
      const seasonalThemes = {
        spring: 'renewal, fresh starts, lighter products, outdoor activities',
        summer: 'vacation, sun protection, bold colors, outdoor events',
        fall: 'back-to-school, cozy themes, rich colors, preparation',
        winter: 'holidays, gifts, comfort, indoor activities'
      };
      sections.push(`Season: ${season.charAt(0).toUpperCase() + season.slice(1)} - Focus on themes: ${seasonalThemes[season]}`);
    }

    if (holidays?.length) {
      sections.push(`Holidays: ${holidays.join(', ')} - Incorporate relevant holiday messaging and urgency`);
    }

    if (timeframe) {
      const timingGuidance = {
        urgent: 'Create urgency with limited-time offers and immediate action',
        planned: 'Build anticipation and provide detailed information for consideration',
        evergreen: 'Focus on timeless benefits and long-term value propositions'
      };
      sections.push(`Timeframe: ${timeframe} - ${timingGuidance[timeframe]}`);
    }

    return sections.join('\n') + '\n';
  }

  /**
   * Build audience psychographic context
   */
  static buildPsychographicContext(
    audience: {
      painPoints?: string[];
      motivations?: string[];
      objections?: string[];
      values?: string[];
      lifestyle?: string[];
    }
  ): string {
    if (!audience || Object.keys(audience).length === 0) return '';

    const sections: string[] = ['# AUDIENCE PSYCHOGRAPHICS:'];

    if (audience.painPoints?.length) {
      sections.push(`Pain Points: ${audience.painPoints.join(', ')}`);
    }

    if (audience.motivations?.length) {
      sections.push(`Core Motivations: ${audience.motivations.join(', ')}`);
    }

    if (audience.objections?.length) {
      sections.push(`Common Objections: ${audience.objections.join(', ')}`);
    }

    if (audience.values?.length) {
      sections.push(`Values: ${audience.values.join(', ')}`);
    }

    if (audience.lifestyle?.length) {
      sections.push(`Lifestyle: ${audience.lifestyle.join(', ')}`);
    }

    sections.push('\nUse these insights to create emotionally resonant copy that addresses specific needs and motivations.');

    return sections.join('\n') + '\n';
  }

  /**
   * Build performance optimization context
   */
  static buildPerformanceContext(
    metrics: {
      targetCTR?: number;
      targetCPC?: number;
      targetROAS?: number;
      benchmarkData?: Record<string, number>;
    }
  ): string {
    if (!metrics || Object.keys(metrics).length === 0) return '';

    const sections: string[] = ['# PERFORMANCE OPTIMIZATION:'];

    if (metrics.targetCTR) {
      sections.push(`Target CTR: ${metrics.targetCTR}% - Optimize headlines and hooks for click-through`);
    }

    if (metrics.targetCPC) {
      sections.push(`Target CPC: $${metrics.targetCPC} - Balance broad appeal with specific targeting`);
    }

    if (metrics.targetROAS) {
      sections.push(`Target ROAS: ${metrics.targetROAS}x - Focus on high-intent language and clear value props`);
    }

    if (metrics.benchmarkData && Object.keys(metrics.benchmarkData).length > 0) {
      const benchmarks = Object.entries(metrics.benchmarkData)
        .map(([metric, value]) => `${metric}: ${value}`)
        .join(', ');
      sections.push(`Industry Benchmarks: ${benchmarks}`);
    }

    sections.push('Optimize copy elements to exceed these performance targets.');

    return sections.join('\n') + '\n';
  }
}

/**
 * Legacy AIPromptBuilder - maintained for backward compatibility
 * @deprecated Use StationPromptManager instead
 */
export class AIPromptBuilder {
  /**
   * Build a system prompt with consistent structure
   */
  static buildSystemPrompt(
    basePrompt: string,
    aiSettingsContext: string,
    additionalSections: string[] = []
  ): string {
    return [
      basePrompt,
      aiSettingsContext,
      ...additionalSections
    ].filter(Boolean).join('\n\n');
  }

  /**
   * Replace template variables in a prompt template
   */
  static replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    }
    return result;
  }

  /**
   * Build a user prompt with sections
   */
  static buildUserPrompt(
    baseTemplate: string,
    templateVariables: Record<string, string>,
    additionalSections: string[] = []
  ): string {
    const processedTemplate = this.replaceTemplateVariables(baseTemplate, templateVariables);
    return [
      processedTemplate,
      ...additionalSections.filter(Boolean)
    ].join('\n');
  }

  /**
   * Create a standardized debug info object
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
}

// Helper function to build target persona section
export function buildTargetPersonaSection(concept: string, trainingConfig: TrainingConfig): string {
  if (!concept || concept === 'none' || !trainingConfig.personaPillars?.[concept]) {
    return '';
  }

  const persona = trainingConfig.personaPillars[concept];
  let section = `

TARGET PERSONA - ${concept.toUpperCase()}:
${persona.description ? `Description: ${persona.description}` : ''}`;

  if (persona.pillars && persona.pillars.length > 0) {
    const enabledPillars = persona.pillars.filter((_, index) => 
      persona.enabledPillars?.[index] !== false
    );
    
    if (enabledPillars.length > 0) {
      section += `
Key Targeting Pillars:
${enabledPillars.map(pillar => `- ${pillar}`).join('\n')}`;
    }
  }

  section += `

PERSONA-SPECIFIC TARGETING REQUIREMENTS:
- Tailor ALL headlines and primary text to speak directly to this persona
- Use language patterns and scenarios this audience relates to
- Address their specific pain points and motivations
- Reference their lifestyle and daily challenges`;

  return section;
}

// Helper function to build selected products section
export function buildSelectedProductsSection(selectedProduct: string | undefined, selectedProducts: string[] | undefined, trainingConfig: TrainingConfig): string {
  if (!selectedProduct && (!selectedProducts || selectedProducts.length === 0)) {
    return '';
  }

  let section = `

PRODUCT FOCUS:`;

  // Handle single selected product
  if (selectedProduct) {
    const productConfig = trainingConfig.productClaims?.[selectedProduct];
    const displayName = productConfig?.displayName || selectedProduct;
    section += `
Primary Product: ${displayName}`;
  }

  // Handle multiple selected products
  if (selectedProducts && selectedProducts.length > 0) {
    const productDisplayNames = selectedProducts.map(product => {
      const productConfig = trainingConfig.productClaims?.[product];
      return productConfig?.displayName || product;
    });
    section += `
Selected Products: ${productDisplayNames.join(', ')}`;
  }

  section += `

PRODUCT-SPECIFIC CLAIMS:`;

  // Add claims for single product
  if (selectedProduct && trainingConfig.productClaims?.[selectedProduct]) {
    const productConfig = trainingConfig.productClaims[selectedProduct];
    const displayName = productConfig.displayName || selectedProduct;
    section += `
${displayName.toUpperCase()}:`;
    
    if (productConfig.approvedClaims && productConfig.approvedClaims.length > 0) {
      section += `
Approved Claims (USE THESE):`;
      productConfig.approvedClaims.forEach((claim, index) => {
        if (productConfig.enabledApproved?.[index] !== false) {
          section += `
- ${claim}`;
        }
      });
    }
    
    if (productConfig.prohibitedClaims && productConfig.prohibitedClaims.length > 0) {
      section += `
Prohibited Claims (NEVER USE):`;
      productConfig.prohibitedClaims.forEach((claim, index) => {
        if (productConfig.enabledProhibited?.[index] !== false) {
          section += `
- ${claim}`;
        }
      });
    }
  }

  // Add claims for multiple products
  if (selectedProducts && selectedProducts.length > 0 && trainingConfig.productClaims) {
    selectedProducts.forEach(product => {
      const productConfig = trainingConfig.productClaims[product];
      if (productConfig) {
        const displayName = productConfig.displayName || product;
        section += `
${displayName.toUpperCase()}:`;
        
        if (productConfig.approvedClaims && productConfig.approvedClaims.length > 0) {
          section += `
Approved Claims (USE THESE):`;
          productConfig.approvedClaims.forEach((claim, index) => {
            if (productConfig.enabledApproved?.[index] !== false) {
              section += `
- ${claim}`;
            }
          });
        }
        
        if (productConfig.prohibitedClaims && productConfig.prohibitedClaims.length > 0) {
          section += `
Prohibited Claims (NEVER USE):`;
          productConfig.prohibitedClaims.forEach((claim, index) => {
            if (productConfig.enabledProhibited?.[index] !== false) {
              section += `
- ${claim}`;
            }
          });
        }
      }
    });
  }

  section += `

PRODUCT-SPECIFIC REQUIREMENTS:
- Feature the selected product(s) prominently in headlines and copy
- Use ONLY the approved claims listed above for each product
- NEVER use any of the prohibited claims listed above
- Highlight unique benefits and selling points of these specific products
- Create compelling product-focused calls-to-action
- Ensure copy drives interest in these specific products`;

  return section;
}

// Helper function to build comprehensive AI Settings context
export function buildAISettingsContext(trainingConfig: TrainingConfig, request: {
  concept?: string;
  selectedProduct?: string;
  selectedProducts?: string[];
  brandDrBalance?: number;
  useJonesBrandGuide?: boolean;
}) {
  const { concept = '', selectedProduct = '', selectedProducts = [], brandDrBalance = 50, useJonesBrandGuide = true } = request;
  
  // Handle optional personas - if concept is 'none' or empty, skip persona targeting
  
  let context = '';
  
  if (useJonesBrandGuide && trainingConfig) {
    // Brand Guidelines
    if (trainingConfig.brandGuidelines) {
      context += '\nJONES ROAD BEAUTY BRAND GUIDELINES:\n';
      context += `Core Positioning: ${trainingConfig.brandGuidelines.corePositioning}\n\n`;
      
      // Brand Voice (only enabled ones)
      if (trainingConfig.brandGuidelines.brandVoice) {
        context += 'Brand Voice Rules:\n';
        trainingConfig.brandGuidelines.brandVoice.forEach((rule, index) => {
          if (trainingConfig.brandGuidelines.enabledBrandVoice?.[index] !== false) {
            context += `- ${rule}\n`;
          }
        });
        context += '\n';
      }
      
      // Key Terminology (only enabled ones)
      if (trainingConfig.brandGuidelines.keyTerminology) {
        context += 'Key Terms & Phrases:\n';
        trainingConfig.brandGuidelines.keyTerminology.forEach((term, index) => {
          if (trainingConfig.brandGuidelines.enabledKeyTerminology?.[index] !== false) {
            context += `- ${term}\n`;
          }
        });
        context += '\n';
      }
      
      // Approved Language (only enabled ones)
      if (trainingConfig.brandGuidelines.approvedLanguage) {
        context += 'Approved Language:\n';
        trainingConfig.brandGuidelines.approvedLanguage.forEach((phrase, index) => {
          if (trainingConfig.brandGuidelines.enabledApprovedLanguage?.[index] !== false) {
            context += `- ${phrase}\n`;
          }
        });
        context += '\n';
      }
      
      // Avoided Language (only enabled ones)
      if (trainingConfig.brandGuidelines.avoidedLanguage) {
        context += 'Avoid These Phrases:\n';
        trainingConfig.brandGuidelines.avoidedLanguage.forEach((phrase, index) => {
          if (trainingConfig.brandGuidelines.enabledAvoidedLanguage?.[index] !== false) {
            context += `- ${phrase}\n`;
          }
        });
        context += '\n';
      }
    }
    
    // Product Claims
    if (selectedProduct && trainingConfig.productClaims && trainingConfig.productClaims[selectedProduct]) {
      const productClaims = trainingConfig.productClaims[selectedProduct];
      context += `PRODUCT-SPECIFIC CLAIMS FOR ${selectedProduct.toUpperCase()}:\n`;
      
      if (productClaims.approvedClaims && productClaims.approvedClaims.filter((_, index) => productClaims.enabledApproved?.[index] !== false).length > 0) {
        context += 'Approved Claims:\n';
        productClaims.approvedClaims.forEach((claim, index) => {
          if (productClaims.enabledApproved?.[index] !== false) {
            context += `- ${claim}\n`;
          }
        });
      }
      
      if (productClaims.prohibitedClaims && productClaims.prohibitedClaims.filter((_, index) => productClaims.enabledProhibited?.[index] !== false).length > 0) {
        context += 'Prohibited Claims (Never Use):\n';
        productClaims.prohibitedClaims.forEach((claim, index) => {
          if (productClaims.enabledProhibited?.[index] !== false) {
            context += `- ${claim}\n`;
          }
        });
      }
      context += '\n';
    }
    
    // Multi-Product Claims for retention
    if (selectedProducts && selectedProducts.length > 0 && trainingConfig.productClaims) {
      context += 'MULTI-PRODUCT CLAIMS:\n';
      selectedProducts.forEach(product => {
        if (trainingConfig.productClaims[product]) {
          context += `${product.toUpperCase()}:\n`;
          const productClaims = trainingConfig.productClaims[product];
          if (productClaims.approvedClaims) {
            productClaims.approvedClaims.forEach((claim, index) => {
              if (productClaims.enabledApproved?.[index] !== false) {
                context += `  - ${claim}\n`;
              }
            });
          }
        }
      });
      context += '\n';
    }
    
    // Persona Pillars - skip if concept is 'none' or empty
    if (concept && concept !== 'none' && trainingConfig.personaPillars && trainingConfig.personaPillars[concept]) {
      const persona = trainingConfig.personaPillars[concept];
      context += `TARGET PERSONA - ${concept.toUpperCase()}:\n`;
      if (persona.description) {
        context += `Description: ${persona.description}\n`;
      }
      if (persona.pillars && persona.pillars.length > 0) {
        context += 'Key Pillars:\n';
        persona.pillars.forEach((pillar, index) => {
          if (persona.enabledPillars?.[index] !== false) {
            context += `- ${pillar}\n`;
          }
        });
      }
      context += '\n';
    }
  }
  
  // Brand/DR Balance
  const brandPercent = brandDrBalance;
  const drPercent = 100 - brandPercent;
  context += `BRAND/DR BALANCE: ${brandPercent}% Brand Voice, ${drPercent}% Direct Response\n`;
  
  // Brand-First Guidelines
  if (trainingConfig.copyFrameworks?.brandDrBalance?.brandFirst && trainingConfig.copyFrameworks.brandDrBalance.brandFirst.length > 0) {
    const brandGuidelines = trainingConfig.copyFrameworks.brandDrBalance.brandFirst.filter(g => g && g.trim() !== '');
    if (brandGuidelines.length > 0) {
      context += `\nBRAND-FIRST GUIDELINES:\n`;
      brandGuidelines.forEach(guideline => {
        context += `- ${guideline}\n`;
      });
    }
  }
  
  // Direct Response Guidelines
  if (trainingConfig.copyFrameworks?.brandDrBalance?.directResponse && trainingConfig.copyFrameworks.brandDrBalance.directResponse.length > 0) {
    const drGuidelines = trainingConfig.copyFrameworks.brandDrBalance.directResponse.filter(g => g && g.trim() !== '');
    if (drGuidelines.length > 0) {
      context += `\nDIRECT RESPONSE GUIDELINES:\n`;
      drGuidelines.forEach(guideline => {
        context += `- ${guideline}\n`;
      });
    }
  }
  
  context += '\n';
  
  return context;
}

// Helper function for Ad Copy Generation -- to build landing page context section
export async function buildLandingPageContext(landingPageUrl?: string): Promise<string> {
  if (!landingPageUrl || !landingPageUrl.trim()) {
    return '';
  }

  let landingPageContent = '';
  try {
    const response = await fetch(landingPageUrl);
    if (response.ok) {
      const html = await response.text();
      // Extract basic text content (simplified approach)
      landingPageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000); // Limit to first 2000 characters
    }
  } catch (error) {
    console.error('Failed to fetch landing page:', error);
  }

  return landingPageContent ? `
LANDING PAGE CONTEXT:
${landingPageContent}

FUNNEL ALIGNMENT REQUIREMENT:
Ensure the ad copy creates a seamless transition from ad to landing page. The messaging should be congruent - if the landing page emphasizes certain benefits or uses specific language, mirror that in the ad copy to create expectation alignment and reduce bounce rate.
` : '';
}

// Helper function to build copy frameworks section
export function buildCopyFrameworksSection(trainingConfig: TrainingConfig): string {
  if (!trainingConfig.copyFrameworks?.headlineFrameworks) {
    return '';
  }

  return `

HEADLINE FRAMEWORK GUIDANCE:
Use these proven frameworks to create diverse headline variations:
${trainingConfig.copyFrameworks.headlineFrameworks.map(framework => `
• ${framework.name}: ${framework.description}
  Template: ${framework.template}
  ${framework.examples && framework.examples.length > 0 ? `Examples: ${framework.examples.slice(0, 2).join(', ')}` : ''}`).join('')}

FRAMEWORK APPLICATION:
- Create headlines using different frameworks for testing variety
- Match framework choice to the specific customer motivation being targeted
- Ensure each headline serves a distinct strategic purpose`;
}

export function buildLandingPageFrameworksSection(trainingConfig: TrainingConfig): string {
  if (!trainingConfig.copyFrameworks?.landingPageFrameworks) {
    return '';
  }

  return `

LANDING PAGE FRAMEWORK GUIDANCE:
Use these proven frameworks to structure compelling landing page copy:
${trainingConfig.copyFrameworks.landingPageFrameworks.map(framework => `
• ${framework.name}: ${framework.description}
  Content Sequence: ${framework.contentSequence.join(' → ')}
  Reason Structure: ${framework.reasonStructure.join(', ')}
  Optimization Rules: ${framework.optimizationRules.join('; ')}
  ${framework.realExamples && framework.realExamples.length > 0 ? `Examples: ${framework.realExamples.slice(0, 2).join(', ')}` : ''}`).join('')}

FRAMEWORK APPLICATION:
- Choose the framework that best matches your landing page type and audience
- Follow the content sequence to ensure logical flow and persuasion
- Apply optimization rules to maximize conversion potential
- Use reason structures to build compelling arguments for your offer`;
}

// Helper function to build custom brief section
export function buildCustomBriefSection(customBrief?: string): string {
  if (!customBrief || !customBrief.trim()) {
    return '';
  }

  return `

CUSTOM BRIEF FOR THIS GENERATION:
${customBrief.trim()}

PRIORITY INSTRUCTION: Incorporate the specific instructions above into the ad copy while maintaining brand voice and framework structure.`;
} 