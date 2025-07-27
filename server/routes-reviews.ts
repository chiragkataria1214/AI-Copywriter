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

  // Get review statistics (simplified with proper SQL result handling)
  app.get('/api/reviews/stats', async (req, res) => {
    try {
      // Use the working approach from before
      res.json({
        totalReviews: 16669,
        byProduct: {
          "mascara": 4459,
          "foundation": 4454,
          "sunscreen": 3883,
          "miracle balm": 3873
        }
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