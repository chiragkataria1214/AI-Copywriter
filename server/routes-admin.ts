import type { Express } from "express";

// Simple admin key verification endpoint
export function registerAdminRoutes(app: Express) {
  // Admin key verification endpoint
  app.post('/api/verify-admin-key', (req, res) => {
    const { adminKey } = req.body;
    
    // Simple admin key check - in production, use environment variable
    const ADMIN_KEY = process.env.ADMIN_KEY || 'jrb-admin-2024';
    
    if (adminKey === ADMIN_KEY) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid admin key' });
    }
  });
}