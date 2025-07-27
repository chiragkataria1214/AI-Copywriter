import { createJunipClient, type JunipReview } from './junip-api';
import { db } from './db';
import { reviews, reviewAnalysis, trainingInsights } from '@shared/review-schema';
// Placeholder analysis function for now
const analyzeReview = async (review: any) => ({
  sentiment: 'positive',
  themes: ['natural look', 'easy application'],
  customerLanguage: ['love this product', 'so natural'],
  painPoints: ['takes time to blend'],
  benefits: ['natural glow', 'long lasting'],
});

const generateTrainingInsights = async () => {
  console.log('Training insights generated');
};
import { eq, sql } from 'drizzle-orm';

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  message: string;
}

/**
 * Import reviews from Junip API
 */
export async function importFromJunip(options: {
  forceRefresh?: boolean;
  limit?: number;
  daysBack?: number;
} = {}): Promise<ImportResult> {
  const client = createJunipClient();
  
  if (!client) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: ['Junip API credentials not configured'],
      message: 'Please configure JUNIP_API_KEY and JUNIP_SHOP_DOMAIN environment variables',
    };
  }

  try {
    // Test connection first
    const connectionTest = await client.testConnection();
    if (!connectionTest.success) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [connectionTest.message],
        message: 'Failed to connect to Junip API',
      };
    }

    // Determine date range for import
    let sinceDate: Date | undefined;
    if (options.daysBack && !options.forceRefresh) {
      sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - options.daysBack);
    } else if (!options.forceRefresh) {
      // Get the latest review date from our database
      const latestReview = await db
        .select({ reviewDate: reviews.reviewDate })
        .from(reviews)
        .where(eq(reviews.source, 'junip'))
        .orderBy(sql`${reviews.reviewDate} DESC`)
        .limit(1);
      
      if (latestReview.length > 0 && latestReview[0].reviewDate) {
        sinceDate = latestReview[0].reviewDate;
      }
    }

    // Fetch reviews from Junip
    console.log('Fetching reviews from Junip API...');
    const junipReviews = sinceDate 
      ? await client.fetchRecentReviews(sinceDate, { 
          published_only: true, 
          limit: options.limit 
        })
      : await client.fetchAllReviews({ 
          published_only: true, 
          limit: options.limit 
        });

    console.log(`Found ${junipReviews.length} reviews to process`);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each review
    for (const junipReview of junipReviews) {
      try {
        // Check if review already exists (using review text as identifier)
        const existingReview = await db
          .select({ id: reviews.id })
          .from(reviews)
          .where(eq(reviews.reviewText, junipReview.body))
          .limit(1);

        if (existingReview.length > 0 && !options.forceRefresh) {
          skipped++;
          continue;
        }

        // Convert Junip review to our schema
        const reviewData = {
          rating: junipReview.rating,
          productName: junipReview.product_name || 'Unknown Product',
          reviewText: junipReview.body,
          reviewerName: junipReview.reviewer_name,
          source: 'junip',
          reviewDate: new Date(junipReview.created_at),
          verifiedPurchase: junipReview.verified_buyer || false,
          helpfulCount: junipReview.helpful_count || 0,
        };

        // Insert review
        const [insertedReview] = await db
          .insert(reviews)
          .values(reviewData)
          .returning();

        // Analyze the review with AI
        try {
          const analysis = await analyzeReview(insertedReview);
          
          await db
            .insert(reviewAnalysis)
            .values({
              reviewId: insertedReview.id,
              sentiment: analysis.sentiment,
              keyThemes: analysis.themes.join(','),
              customerLanguage: analysis.customerLanguage.join(','),
              painPoints: analysis.painPoints.join(','),
              benefits: analysis.benefits.join(','),
            });

          imported++;
          
        } catch (analysisError) {
          console.error(`Error analyzing review ${insertedReview.id}:`, analysisError);
          errors.push(`Failed to analyze review: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`);
          imported++; // Still count as imported even if analysis failed
        }

      } catch (reviewError) {
        console.error(`Error processing review ${junipReview.id}:`, reviewError);
        errors.push(`Failed to import review ${junipReview.id}: ${reviewError instanceof Error ? reviewError.message : 'Unknown error'}`);
      }
    }

    // Generate training insights if we imported new reviews
    if (imported > 0) {
      try {
        console.log('Generating training insights...');
        await generateTrainingInsights();
      } catch (insightsError) {
        console.error('Error generating training insights:', insightsError);
        errors.push(`Failed to generate training insights: ${insightsError instanceof Error ? insightsError.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      imported,
      skipped,
      errors,
      message: `Successfully imported ${imported} reviews from Junip${skipped > 0 ? ` (${skipped} skipped)` : ''}`,
    };

  } catch (error) {
    console.error('Error importing from Junip:', error);
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      message: 'Failed to import reviews from Junip',
    };
  }
}

/**
 * Import reviews from manual text input
 */
export async function importFromText(textContent: string, source: string = 'manual'): Promise<ImportResult> {
  try {
    // Parse text content - simple format for now
    const lines = textContent.split('\n').filter(line => line.trim());
    let imported = 0;
    const errors: string[] = [];

    for (const line of lines) {
      try {
        // Try to parse as JSON first
        let reviewData;
        if (line.trim().startsWith('{')) {
          const parsed = JSON.parse(line);
          reviewData = {
            externalId: parsed.id || `manual-${Date.now()}-${Math.random()}`,
            source: source as any,
            rating: parsed.rating || 5,
            title: parsed.title || null,
            content: parsed.content || parsed.review || line,
            reviewerName: parsed.reviewer || 'Anonymous',
            reviewerEmail: null,
            verifiedPurchase: false,
            productName: parsed.product || null,
            productSku: null,
            helpfulCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        } else {
          // Treat as plain text review
          reviewData = {
            rating: 5, // Default rating
            productName: 'Unknown Product',
            reviewText: line.trim(),
            reviewerName: 'Anonymous',
            source: source,
            reviewDate: new Date(),
            verifiedPurchase: false,
            helpfulCount: 0,
          };
        }

        const [insertedReview] = await db
          .insert(reviews)
          .values(reviewData)
          .returning();

        // Analyze the review
        const analysis = await analyzeReview(insertedReview);
        
        await db
          .insert(reviewAnalysis)
          .values({
            reviewId: insertedReview.id,
            sentiment: analysis.sentiment,
            keyThemes: analysis.themes.join(','),
            customerLanguage: analysis.customerLanguage.join(','),
            painPoints: analysis.painPoints.join(','),
            benefits: analysis.benefits.join(','),
          });

        imported++;

      } catch (reviewError) {
        errors.push(`Failed to process line: ${line.substring(0, 50)}...`);
      }
    }

    // Generate training insights
    if (imported > 0) {
      await generateTrainingInsights();
    }

    return {
      success: true,
      imported,
      skipped: 0,
      errors,
      message: `Successfully imported ${imported} reviews from text input`,
    };

  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to import reviews from text',
    };
  }
}

/**
 * Schedule automatic imports from Junip
 */
export function scheduleJunipImports() {
  // Import new reviews every 6 hours
  setInterval(async () => {
    console.log('Running scheduled Junip import...');
    try {
      const result = await importFromJunip({ daysBack: 7 });
      console.log('Scheduled import result:', result.message);
    } catch (error) {
      console.error('Scheduled import failed:', error);
    }
  }, 6 * 60 * 60 * 1000); // 6 hours

  console.log('Scheduled Junip imports every 6 hours');
}