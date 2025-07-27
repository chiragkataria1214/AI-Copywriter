import type { Express } from "express";
import { reviewAnalyzer } from './review-analyzer';
import { db } from './db';
import { reviews, reviewAnalysis, trainingInsights, type InsertReview } from '@shared/review-schema';
import { eq, count, avg, desc } from 'drizzle-orm';
// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
};

export function registerReviewRoutes(app: Express) {
  
  // Get reviews for viewing (with pagination)
  app.get('/api/reviews', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const reviewsList = await db.select()
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);
      
      res.json(reviewsList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  // Get review statistics
  app.get('/api/reviews/stats', async (req, res) => {
    try {
      // Get total count
      const [totalResult] = await db.select({ count: count() }).from(reviews);
      
      // Get count by product
      const productCounts = await db
        .select({
          product_name: reviews.productName,
          count: count()
        })
        .from(reviews)
        .groupBy(reviews.productName)
        .orderBy(desc(count()));
      
      const byProduct = {};
      productCounts.forEach((row: any) => {
        byProduct[row.product_name] = row.count;
      });
      
      res.json({
        totalReviews: totalResult?.count || 0,
        byProduct
      });
    } catch (error) {
      console.error('Review stats error:', error);
      res.status(500).json({ message: 'Failed to fetch review statistics' });
    }
  });

  // Import bulk reviews
  app.post('/api/reviews/import', requireAuth, async (req, res) => {
    try {
      const { reviews: reviewsData, format } = req.body;
      
      if (!reviewsData) {
        return res.status(400).json({ message: 'No review data provided' });
      }

      let parsedReviews: InsertReview[] = [];

      if (format === 'csv') {
        // Parse CSV format
        const lines = reviewsData.split('\n').filter((line: string) => line.trim());
        const headers = lines[0].split(',').map((h: string) => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
          if (values.length >= 3) {
            parsedReviews.push({
              productName: values[0] || 'Unknown Product',
              rating: parseInt(values[1]) || 5,
              reviewText: values[2] || '',
              reviewerName: values[3] || null,
              reviewSource: 'import',
              verified: true
            });
          }
        }
      } else if (format === 'json') {
        // Parse JSON format
        const jsonData = JSON.parse(reviewsData);
        parsedReviews = jsonData.map((review: any) => ({
          productName: review.product || review.productName || 'Unknown Product',
          rating: review.rating || 5,
          reviewText: review.review || review.reviewText || '',
          reviewerName: review.reviewer || review.reviewerName || null,
          reviewSource: review.source || 'import',
          verified: review.verified || true
        }));
      } else {
        // Parse plain text format (one review per line)
        const lines = reviewsData.split('\n').filter((line: string) => line.trim());
        parsedReviews = lines.map((line: string) => ({
          productName: 'Jones Road Beauty Product',
          rating: 5, // Default to 5 stars for text imports
          reviewText: line.trim(),
          reviewSource: 'import',
          verified: true
        }));
      }

      // Import and analyze reviews
      await reviewAnalyzer.importReviews(parsedReviews);

      res.json({ 
        message: 'Reviews imported successfully',
        count: parsedReviews.length
      });
    } catch (error) {
      console.error('Review import error:', error);
      res.status(500).json({ message: 'Failed to import reviews' });
    }
  });

  // Generate training insights from reviews
  app.post('/api/reviews/generate-insights', requireAuth, async (req, res) => {
    try {
      await reviewAnalyzer.generateTrainingInsights();
      res.json({ message: 'Training insights generated successfully' });
    } catch (error) {
      console.error('Insight generation error:', error);
      res.status(500).json({ message: 'Failed to generate insights' });
    }
  });

  // Get review statistics
  app.get('/api/reviews/stats', requireAuth, async (req, res) => {
    try {
      const [totalReviews] = await db.select({ count: count() }).from(reviews);
      const [analyzedReviews] = await db.select({ count: count() }).from(reviewAnalysis);
      const [momReviews] = await db.select({ count: count() }).from(reviewAnalysis).where(eq(reviewAnalysis.momSpecific, true));
      const [avgRatingResult] = await db.select({ avg: avg(reviews.rating) }).from(reviews);
      const avgRating = avgRatingResult?.avg || 0;

      // Get persona breakdown
      const personaData = await db.select().from(reviewAnalysis);
      const personaBreakdown: Record<string, number> = {};
      personaData.forEach(analysis => {
        if (analysis.personas) {
          analysis.personas.forEach(persona => {
            personaBreakdown[persona] = (personaBreakdown[persona] || 0) + 1;
          });
        }
      });

      // Get top pain points and benefits
      const allPainPoints: string[] = [];
      const allBenefits: string[] = [];
      personaData.forEach(analysis => {
        if (analysis.painPoints) allPainPoints.push(...analysis.painPoints);
        if (analysis.benefits) allBenefits.push(...analysis.benefits);
      });

      const topPainPoints = [...new Set(allPainPoints)].slice(0, 5);
      const topBenefits = [...new Set(allBenefits)].slice(0, 5);

      res.json({
        totalReviews: totalReviews.count,
        analyzedReviews: analyzedReviews.count,
        momReviews: momReviews.count,
        avgRating: Math.round(Number(avgRating) * 10) / 10,
        personaBreakdown,
        topPainPoints,
        topBenefits
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: 'Failed to get review stats' });
    }
  });

  // Get training insights
  app.get('/api/reviews/insights', requireAuth, async (req, res) => {
    try {
      const allInsights = await db
        .select()
        .from(trainingInsights)
        .where(eq(trainingInsights.isActive, true))
        .orderBy(desc(trainingInsights.frequency));

      const groupedInsights = allInsights.reduce((acc: any, insight) => {
        if (!acc[insight.category]) {
          acc[insight.category] = [];
        }
        acc[insight.category].push(insight);
        return acc;
      }, {});

      res.json(groupedInsights);
    } catch (error) {
      console.error('Insights error:', error);
      res.status(500).json({ message: 'Failed to get insights' });
    }
  });

  // Get customer language patterns for AI training
  app.get('/api/reviews/language-patterns', requireAuth, async (req, res) => {
    try {
      const patterns = await reviewAnalyzer.getCustomerLanguagePatterns();
      res.json(patterns);
    } catch (error) {
      console.error('Language patterns error:', error);
      res.status(500).json({ message: 'Failed to get language patterns' });
    }
  });
}