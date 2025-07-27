import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { reviews, reviewAnalysis, trainingInsights, type InsertReview, type InsertReviewAnalysis, type InsertTrainingInsight } from '@shared/review-schema';
import { eq, desc, and } from 'drizzle-orm';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export class ReviewAnalyzer {
  
  // Analyze a single review using Claude
  async analyzeReview(reviewText: string, productName: string, rating: number): Promise<any> {
    const systemPrompt = `You are an expert customer insights analyst for Jones Road Beauty. Analyze customer reviews to extract:

1. SENTIMENT: positive, negative, or neutral
2. KEY THEMES: main topics mentioned (max 5)
3. CUSTOMER LANGUAGE: exact phrases customers use that we should adopt
4. PAIN POINTS: problems or concerns mentioned
5. BENEFITS: positive outcomes or results mentioned
6. MOM_SPECIFIC: true if review mentions parenting/mom context
7. PERSONAS: which customer types this review represents
8. AGE_GROUP: inferred age range (20s, 30s, 40s, 50+, unknown)
9. LIFESTYLE_CONTEXT: situations mentioned (busy morning, work, date night, etc.)

Focus on authentic customer language and real experiences. Extract specific phrases that sound natural and relatable.

Return JSON format only:
{
  "sentiment": "positive|negative|neutral",
  "keyThemes": ["theme1", "theme2"],
  "customerLanguage": ["exact phrase 1", "exact phrase 2"],
  "painPoints": ["pain point 1"],
  "benefits": ["benefit 1", "benefit 2"],
  "momSpecific": true|false,
  "personas": ["lifeJuggler", "minimalist", "beautyEnthusiast"],
  "ageGroup": "30s",
  "lifestyleContext": ["busy morning", "quick routine"]
}`;

    const userPrompt = `Analyze this ${productName} review (${rating}/5 stars):

"${reviewText}"

Extract insights in JSON format.`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: systemPrompt,
        max_tokens: 1024,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Review analysis error:', error);
      throw error;
    }
  }

  // Bulk import reviews with analysis
  async importReviews(reviewsData: InsertReview[]): Promise<void> {
    console.log(`Starting import of ${reviewsData.length} reviews...`);
    
    for (const reviewData of reviewsData) {
      try {
        // Insert review
        const [insertedReview] = await db
          .insert(reviews)
          .values(reviewData)
          .returning();

        // Analyze with Claude
        const analysis = await this.analyzeReview(
          reviewData.reviewText,
          reviewData.productName,
          reviewData.rating
        );

        // Insert analysis
        await db.insert(reviewAnalysis).values({
          reviewId: insertedReview.id,
          ...analysis
        });

        console.log(`Processed review for ${reviewData.productName}`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to process review: ${reviewData.reviewText.substring(0, 50)}...`, error);
      }
    }

    console.log('Review import completed');
  }

  // Generate training insights from analyzed reviews
  async generateTrainingInsights(): Promise<void> {
    console.log('Generating training insights from reviews...');

    const systemPrompt = `You are an expert copywriter analyzing customer reviews for Jones Road Beauty to extract training insights for AI copywriting.

From the provided review analysis data, identify:

1. LANGUAGE PATTERNS: Common phrases and words customers use that sound authentic
2. PAIN POINTS: Recurring problems that ads should address
3. BENEFITS: Key outcomes customers care about most
4. PERSONA INSIGHTS: Specific needs/language for different customer types
5. MOM-SPECIFIC LANGUAGE: Unique phrases and concerns from mom customers

For each insight, provide:
- The insight text
- How frequently it appears (estimate)
- Confidence level (0-100)
- Which category it belongs to

Return JSON array:
[
  {
    "category": "language_patterns",
    "insight": "Customers frequently say 'effortless' and 'natural glow' rather than 'flawless' or 'perfect'",
    "frequency": 25,
    "confidence": 85
  }
]`;

    try {
      // Get all review analyses
      const analyses = await db
        .select()
        .from(reviewAnalysis)
        .limit(100); // Process in batches

      if (analyses.length === 0) {
        console.log('No review analyses found');
        return;
      }

      const userPrompt = `Analyze these customer review insights and extract training data:

${JSON.stringify(analyses, null, 2)}

Generate actionable insights for AI copywriting training.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: systemPrompt,
        max_tokens: 2048,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const insights = JSON.parse(content.text);
        
        // Insert insights into database
        for (const insight of insights) {
          await db.insert(trainingInsights).values({
            category: insight.category,
            insight: insight.insight,
            frequency: insight.frequency,
            confidence: insight.confidence,
            supportingReviewIds: analyses.map(a => a.reviewId).filter(Boolean)
          });
        }

        console.log(`Generated ${insights.length} training insights`);
      }
    } catch (error) {
      console.error('Failed to generate training insights:', error);
      throw error;
    }
  }

  // Get customer language patterns for training
  async getCustomerLanguagePatterns(): Promise<{
    commonPhrases: string[];
    painPoints: string[];
    benefits: string[];
    momLanguage: string[];
  }> {
    const languageInsights = await db
      .select()
      .from(trainingInsights)
      .where(and(
        eq(trainingInsights.category, 'language_patterns'),
        eq(trainingInsights.isActive, true)
      ))
      .orderBy(desc(trainingInsights.frequency));

    const painPointInsights = await db
      .select()
      .from(trainingInsights)
      .where(and(
        eq(trainingInsights.category, 'pain_points'),
        eq(trainingInsights.isActive, true)
      ));

    const benefitInsights = await db
      .select()
      .from(trainingInsights)
      .where(and(
        eq(trainingInsights.category, 'benefits'),
        eq(trainingInsights.isActive, true)
      ));

    // Get mom-specific language from review analyses
    const momAnalyses = await db
      .select()
      .from(reviewAnalysis)
      .where(eq(reviewAnalysis.momSpecific, true));

    const momLanguage = momAnalyses
      .flatMap(a => a.customerLanguage || [])
      .filter((phrase, index, arr) => arr.indexOf(phrase) === index); // unique

    return {
      commonPhrases: languageInsights.map(i => i.insight),
      painPoints: painPointInsights.map(i => i.insight),
      benefits: benefitInsights.map(i => i.insight),
      momLanguage
    };
  }
}

export const reviewAnalyzer = new ReviewAnalyzer();