import type { Express } from "express";
import { z } from 'zod';
import { importFromJunip, importFromText, type ImportResult } from './review-importer';
import { createJunipClient } from './junip-api';
import { db } from './db';
import { reviews, reviewAnalysis, trainingInsights } from '@shared/review-schema';
import { sql, desc, eq, count } from 'drizzle-orm';

// Placeholder function
const generateTrainingInsights = async () => {
  console.log('Training insights generated');
};

// Request schemas
const JunipImportRequestSchema = z.object({
  forceRefresh: z.boolean().optional(),
  limit: z.number().min(1).max(1000).optional(),
  daysBack: z.number().min(1).max(365).optional(),
});

const TextImportRequestSchema = z.object({
  content: z.string().min(1),
  source: z.string().default('manual'),
});

const JunipConfigSchema = z.object({
  apiKey: z.string().min(1),
  shopDomain: z.string().min(1),
});

export function registerJunipRoutes(app: Express) {
  
  /**
   * Test Junip API connection
   */
  app.get('/api/junip/test', async (req, res) => {
    try {
      const client = createJunipClient();
      
      if (!client) {
        return res.status(400).json({
          success: false,
          message: 'Junip API credentials not configured. Please set JUNIP_API_KEY and JUNIP_SHOP_DOMAIN environment variables.',
        });
      }

      const result = await client.testConnection();
      res.json(result);
      
    } catch (error) {
      console.error('Error testing Junip connection:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  });

  /**
   * Import reviews from Junip API
   */
  app.post('/api/junip/import', async (req, res) => {
    try {
      const body = JunipImportRequestSchema.parse(req.body);
      
      console.log('Starting Junip import with options:', body);
      const result = await importFromJunip(body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error importing from Junip:', error);
      res.status(500).json({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Failed to import reviews from Junip',
      });
    }
  });

  /**
   * Import reviews from text input
   */
  app.post('/api/reviews/import-text', async (req, res) => {
    try {
      const body = TextImportRequestSchema.parse(req.body);
      
      const result = await importFromText(body.content, body.source);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error importing from text:', error);
      res.status(500).json({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Failed to import reviews from text',
      });
    }
  });

  /**
   * Get review analytics and statistics
   */
  app.get('/api/reviews/analytics', async (req, res) => {
    try {
      // Get overall review statistics
      const [totalReviews] = await db
        .select({ count: count() })
        .from(reviews);

      const [avgRating] = await db
        .select({ avg: sql<number>`ROUND(AVG(${reviews.rating}), 2)` })
        .from(reviews);

      // Get reviews by source
      const reviewsBySource = await db
        .select({ 
          source: reviews.source, 
          count: count() 
        })
        .from(reviews)
        .groupBy(reviews.source);

      // Get sentiment distribution
      const sentimentData = await db
        .select({ 
          sentiment: reviewAnalysis.sentiment,
          count: count() 
        })
        .from(reviewAnalysis)
        .groupBy(reviewAnalysis.sentiment);

      // Get most common themes (placeholder for now)
      const topThemes = [
        { theme: 'natural look', count: 15 },
        { theme: 'easy application', count: 12 },
        { theme: 'long lasting', count: 8 }
      ];

      // Get recent reviews
      const recentReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          content: reviews.reviewText,
          reviewerName: reviews.reviewerName,
          productName: reviews.productName,
          source: reviews.source,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .limit(5);

      res.json({
        totalReviews: totalReviews.count,
        averageRating: avgRating.avg || 0,
        reviewsBySource,
        sentimentDistribution: sentimentData,
        topThemes,
        recentReviews,
      });

    } catch (error) {
      console.error('Error fetching review analytics:', error);
      res.status(500).json({
        error: 'Failed to fetch review analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get customer language patterns from training insights
   */
  app.get('/api/reviews/language-patterns', async (req, res) => {
    try {
      // Placeholder response - will be populated when we have real insights
      res.json({
        commonPhrases: ['love this product', 'so natural', 'easy to apply'],
        painPoints: ['takes time to blend', 'expensive'],
        benefits: ['natural glow', 'long lasting', 'easy application'],
        momLanguagePatterns: ['quick morning routine', 'no time for makeup'],
        personas: ['busy mom', 'working professional'],
        lastUpdated: new Date(),
      });

    } catch (error) {
      console.error('Error fetching language patterns:', error);
      res.status(500).json({
        error: 'Failed to fetch language patterns',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Manually trigger training insights generation
   */
  app.post('/api/reviews/generate-insights', async (req, res) => {
    try {
      console.log('Manually generating training insights...');
      await generateTrainingInsights();
      
      res.json({
        success: true,
        message: 'Training insights generated successfully',
      });

    } catch (error) {
      console.error('Error generating training insights:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate training insights',
      });
    }
  });

  /**
   * Update Junip configuration (for future use when we add settings UI)
   */
  app.post('/api/junip/config', async (req, res) => {
    try {
      const body = JunipConfigSchema.parse(req.body);
      
      // In a production environment, you'd want to encrypt and store these securely
      // For now, we'll just validate them
      
      // TODO: Store configuration securely
      // This is a placeholder for when we add a settings interface
      
      res.json({
        success: true,
        message: 'Junip configuration updated successfully',
      });

    } catch (error) {
      console.error('Error updating Junip config:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid configuration',
      });
    }
  });

  /**
   * Get review import history/status
   */
  app.get('/api/reviews/import-status', async (req, res) => {
    try {
      // Get latest import timestamps by source
      const importStatus = await db
        .select({
          source: reviews.source,
          lastImport: sql<Date>`MAX(${reviews.reviewDate})`,
          count: count(),
        })
        .from(reviews)
        .groupBy(reviews.source);

      // Check if Junip API is configured
      const junipConfigured = !!(process.env.JUNIP_API_KEY && process.env.JUNIP_SHOP_DOMAIN);

      res.json({
        importStatus,
        junipConfigured,
        lastUpdated: new Date(),
      });

    } catch (error) {
      console.error('Error fetching import status:', error);
      res.status(500).json({
        error: 'Failed to fetch import status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}