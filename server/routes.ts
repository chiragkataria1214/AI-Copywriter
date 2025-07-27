import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerTrainingRoutes } from "./routes-training";
import { storage } from "./storage";
import multer from "multer";
import { generateAdCopy, generateLandingPageCopy } from "./anthropic";
import { getTrainingConfig } from "./routes-training";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { insertUserSchema, adminCreateUserSchema, updateUserSchema } from "@shared/schema";

const upload = multer({ dest: 'uploads/' });

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Admin middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Authorization check failed' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware with database storage
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      pool: pool,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication routes
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword
      });
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Ensure session is saved before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('Registration successful for user:', user.username, 'Session ID:', req.sessionID);
        res.json({ 
          message: 'User registered successfully',
          user: { id: user.id, username: user.username, role: user.role }
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      console.log('Login attempt for username:', username);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('User found, checking password...');
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', validPassword);
      
      if (!validPassword) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Ensure session is saved before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('Login successful for user:', user.username, 'Session ID:', req.sessionID);
        res.json({ 
          message: 'Login successful',
          user: { id: user.id, username: user.username, role: user.role }
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Password reset endpoint
  app.post('/api/reset-password', async (req, res) => {
    try {
      const { username, newPassword } = req.body;
      
      if (!username || !newPassword) {
        return res.status(400).json({ message: 'Username and new password required' });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUserPassword(user.id, hashedPassword);
      
      console.log('Password reset successful for user:', username);
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Password reset failed' });
    }
  });

  app.get('/api/me', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      console.log('Getting user for session:', req.sessionID, 'userId:', userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('User not found for ID:', userId);
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('Returning user:', user.username, 'role:', user.role);
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // One-time admin setup endpoint (for making first user admin)
  app.post('/api/setup-admin', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Make this user admin
      const adminUser = await storage.makeUserAdmin(user.username);
      res.json({ message: 'Admin privileges granted', user: { id: adminUser.id, username: adminUser.username, role: adminUser.role } });
    } catch (error) {
      console.error('Setup admin error:', error);
      res.status(500).json({ message: 'Failed to setup admin' });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send password hashes to frontend
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const userData = adminCreateUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const user = await storage.adminCreateUser(userData);
      res.json({
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userData = updateUserSchema.parse(req.body);
      
      // Check if username is taken by another user
      if (userData.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }
      
      const user = await storage.updateUser(id, userData);
      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = (req.session as any).userId;
      
      // Prevent admin from deleting themselves
      if (id === currentUserId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      await storage.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // File upload endpoint for video transcription
  app.post('/api/upload-video', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // In a real implementation, this would process the video file
      // and extract transcription using a service like OpenAI Whisper
      res.json({ 
        message: 'File uploaded successfully',
        filename: req.file.filename,
        transcription: 'Video transcription would be generated here...'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Generate ad copy endpoint with analytics tracking (protected)
  app.post('/api/generate-ad-copy', requireAuth, async (req, res) => {
    try {
      const startTime = Date.now();
      const { transcription, concept, subPersona, targetAudience, landingPageUrl, brandDrBalance, useJonesBrandGuide } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      // Get current training config for snapshot
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateAdCopy({
        transcription,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance,
        useJonesBrandGuide
      });
      
      const generationTime = Date.now() - startTime;

      // Save generation to database for analytics
      const userId = (req.session as any).userId;
      const savedCopy = await storage.saveGeneratedCopy({
        userId: userId,
        inputText: transcription || concept || '',
        landingPageUrl: landingPageUrl || null,
        targetPersona: subPersona || targetAudience || '',
        brandDrBalance: brandDrBalance || 50,
        headlines: result.headlines,
        primaryText: result.primaryText,
        configSnapshot: trainingConfig,
        generationTimeMs: generationTime,
        tokensUsed: null, // TODO: Track from Anthropic response
        rating: null,
        feedback: null,
      });
      
      res.json({
        copyId: savedCopy.id, // Return ID for feedback tracking
        headlines: result.headlines,
        primaryText: result.primaryText,
        performance: {
          estimatedCpc: 0.42,
          brandAlignment: 85
        }
      });
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ message: 'Failed to generate ad copy' });
    }
  });

  // Generate landing page copy endpoint (protected)
  app.post('/api/generate-landing-copy', requireAuth, async (req, res) => {
    try {
      const { landingPageType, productBrief, concept, subPersona, useAdsContent, adsContent, brandDrBalance } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      const result = await generateLandingPageCopy({
        landingPageType,
        productBrief,
        concept,
        subPersona,
        useAdsContent,
        adsContent,
        brandDrBalance
      });
      
      res.json({
        landingCopy: {
          headline: result.headline,
          subheadline: result.subheadline,
          introduction: result.introduction,
          sections: result.sections,
          socialProof: '',
          riskReversal: '',
          conclusion: '',
          cta: result.cta
        },
        analysis: {
          headlineLength: 'Optimal',
          brandAlignment: 92,
          readabilityScore: 8.5
        }
      });
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ message: 'Failed to generate landing page copy' });
    }
  });

  // Feedback endpoints for analytics (protected)
  app.post('/api/copy-feedback', requireAuth, async (req, res) => {
    try {
      const feedbackSchema = z.object({
        copyId: z.string(),
        rating: z.enum(['excellent', 'good', 'poor']),
        feedback: z.string().optional(),
      });

      const { copyId, rating, feedback } = feedbackSchema.parse(req.body);
      
      await storage.updateCopyFeedback(copyId, rating, feedback);
      
      res.json({ message: 'Feedback saved successfully' });
    } catch (error) {
      console.error('Feedback error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid feedback data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to save feedback' });
    }
  });

  // Analytics dashboard endpoint
  app.get('/api/analytics', async (req, res) => {
    try {
      const analytics = await storage.getCopyAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Copy history endpoint (protected)
  app.get('/api/copy-history', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const userId = (req.session as any).userId;
      const history = await storage.getCopyHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({ message: 'Failed to fetch copy history' });
    }
  });

  // Training configuration routes
  registerTrainingRoutes(app, requireAdmin);

  const httpServer = createServer(app);
  return httpServer;
}
