import type { Express } from "express";
import { db } from './db';
import { sql } from 'drizzle-orm';

export function registerReviewRoutes(app: Express) {
  
  // Get reviews for viewing (using SQL directly to avoid schema issues)
  app.get('/api/reviews', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const result = await db.execute(sql`
        SELECT review_text, reviewer_name, product_name, rating, source, created_at
        FROM reviews 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `);
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  // Get review statistics (real data from database)
  app.get('/api/reviews/stats', async (req, res) => {
    try {
      // Get total count
      const totalResult = await db.execute(sql`SELECT COUNT(*) as total_reviews FROM reviews`);
      const totalReviews = totalResult.rows?.[0]?.total_reviews || 0;
      
      // Get product breakdown
      const productResult = await db.execute(sql`
        SELECT 
          product_name, 
          COUNT(*) as review_count 
        FROM reviews 
        WHERE product_name IS NOT NULL 
        GROUP BY product_name 
        ORDER BY review_count DESC
      `);

      
      // Get rating stats
      const ratingResult = await db.execute(sql`
        SELECT 
          AVG(CAST(rating AS DECIMAL)) as avg_rating,
          COUNT(CASE WHEN rating >= 4 THEN 1 END) * 100.0 / COUNT(*) as positive_percentage
        FROM reviews 
        WHERE rating IS NOT NULL
      `);
      
      const byProduct = {};
      const rows = productResult.rows || [];
      rows.forEach(row => {
        if (row?.product_name && row?.review_count) {
          byProduct[row.product_name.toLowerCase()] = parseInt(row.review_count);
        }
      });
      
      const ratingRows = ratingResult.rows?.[0] || {};
      const avgRating = ratingRows.avg_rating || 5.0;
      const positivePercentage = ratingRows.positive_percentage || 100.0;
      
      res.json({
        totalReviews: parseInt(totalReviews),
        byProduct,
        avgRating: parseFloat(avgRating).toFixed(1),
        positivePercentage: Math.round(parseFloat(positivePercentage))
      });
    } catch (error) {
      console.error('Review stats error:', error);
      res.status(500).json({ message: 'Failed to fetch review statistics' });
    }
  });

  // Get training insights (simplified)
  app.get('/api/reviews/insights', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM training_insights 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      res.json(result[0]?.[0] || null);
    } catch (error) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ message: 'Failed to fetch insights' });
    }
  });
}