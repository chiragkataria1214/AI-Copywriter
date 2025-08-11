import { z } from "zod";

/**
 * Common validation schemas used across multiple routes
 */

// Revision request schema used in multiple generation endpoints
export const revisionSchema = z.object({
  originalContent: z.string(),
  revisionInstructions: z.string(),
  contentType: z.enum(['headline', 'primaryText', 'landingCopy', 'custom', 'retention', 'staticAd', 'socialCaption', 'email', 'sms']),
  context: z.object({
    transcription: z.string().optional(),
    customBrief: z.string().optional(),
    persona: z.string().optional(),
    targetAudience: z.string().optional(),
    brandDrBalance: z.number().optional(),
    selectedProduct: z.string().optional(),
    selectedProducts: z.array(z.string()).optional(),
    field: z.string().optional(),
    customRequest: z.string().optional(),
    useJonesBrandGuide: z.boolean().optional()
  }).optional()
});

// Feedback schema used in multiple endpoints
export const feedbackSchema = z.object({
  copyId: z.string(),
  rating: z.enum(['excellent', 'good', 'poor']),
  feedback: z.string().optional(),
});

// Update copy schema
export const updateCopySchema = z.object({
  headlines: z.array(z.object({
    framework: z.string(),
    copy: z.string()
  })).optional(),
  primaryText: z.string().optional(),
});

// Influencer voice analysis schema
export const influencerAnalysisSchema = z.object({
  transcription: z.string().optional(),
  influencerHandle: z.string().optional(),
  voiceAnalysisMethod: z.enum(['video', 'social', 'combined'])
});

// Influencer copy generation schema
export const influencerGenerationSchema = z.object({
  transcription: z.string().optional(),
  customBrief: z.string().optional(),
  persona: z.string().optional(),
  targetAudience: z.string().optional(),
  landingPageUrl: z.string().optional(),
  brandDrBalance: z.array(z.number()).optional(),
  useJonesBrandGuide: z.boolean().optional(),
  airLink: z.string().optional(),
  uploadedImage: z.string().optional(),
  selectedProduct: z.string().optional(),
  voiceProfile: z.object({
    vocabulary: z.array(z.string()),
    toneDescriptors: z.array(z.string()),
    sentenceStructure: z.string(),
    commonPhrases: z.array(z.string()),
    emotionalStyle: z.string(),
    contentThemes: z.array(z.string()),
    engagementStyle: z.string()
  }),
  influencerBrandBalance: z.array(z.number())
});

// Brief feedback schema
export const briefFeedbackSchema = z.object({
  briefId: z.string(),
  rating: z.number().optional(),
  feedback: z.string().optional(),
  wasEdited: z.boolean().optional(),
  finalVersion: z.string().optional()
});

// Common generation parameters
export const baseGenerationParams = z.object({
  persona: z.string().optional(),
  brandDrBalance: z.number().optional(),
  selectedProduct: z.string().optional(),
  selectedProducts: z.array(z.string()).optional(),
  useJonesBrandGuide: z.boolean().optional()
});

// Social content generation schema
export const socialGenerationSchema = baseGenerationParams.extend({
  contentType: z.string().optional(),
  transcription: z.string().optional(),
  platform: z.string().optional(),
  goal: z.string().optional(),
  tone: z.string().optional(),
  variations: z.number().optional(),
  imageData: z.string().optional()
});

// Story sequence generation schema
export const storySequenceSchema = baseGenerationParams.extend({
  contentType: z.string().optional(),
  transcription: z.string().optional(),
  sequenceType: z.string().optional(),
  length: z.number().optional(),
  tone: z.string().optional(),
  imageData: z.string().optional()
});

// Retention generation schema
export const retentionGenerationSchema = baseGenerationParams.extend({
  keyMessage: z.string(),
  selectedProducts: z.array(z.string()).optional(),
  audience: z.string().optional(),
  goal: z.string().optional(),
  campaignType: z.string().optional(),
  contentLength: z.string().optional(),
  keywordsToInclude: z.array(z.string()).optional(),
  wordsToAvoid: z.array(z.string()).optional()
});

// Email retention specific schema
export const emailRetentionSchema = retentionGenerationSchema.extend({
  emailType: z.string().optional()
});