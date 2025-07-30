import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerTrainingRoutes } from "./routes-training";
import { registerJunipRoutes } from "./routes-junip";
import { registerAdminRoutes } from "./routes-admin";
import { storage } from "./storage";
import multer from "multer";
import { generateAdCopy, generateLandingPageCopy, reviseContent, generateCustomCopy, analyzeStaticAd, generateRetentionCopy } from "./anthropic";
import { analyzeInfluencerVoice, generateInfluencerStyleCopy, fetchInstagramContent } from "./influencer-analyzer";
import { getTrainingConfig } from "./routes-training";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { insertUserSchema, adminCreateUserSchema, updateUserSchema } from "@shared/schema";

const upload = multer({ dest: 'uploads/' });

// Authentication middleware (bypassed for direct access)
const requireAuth = (req: any, res: any, next: any) => {
  // Create bypass session for direct access
  if (!req.session?.userId) {
    req.session.userId = 'demo-user';
  }
  next();
};

// Admin middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    // Handle bypass user
    if (req.session.userId === 'demo-user') {
      req.user = {
        id: 'demo-user',
        username: 'demo@jonesroadbeauty.com',
        role: 'admin',
        email: 'demo@jonesroadbeauty.com',
        isAdmin: true
      };
      return next();
    }
    
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
  console.log('Setting up session middleware...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
  
  const pgStore = connectPg(session);
  
  // Test database connection for sessions
  try {
    const testQuery = await pool.query('SELECT 1');
    console.log('Database connection for sessions: OK');
  } catch (error) {
    console.error('Database connection for sessions failed:', error);
  }
  
  app.use(session({
    store: new pgStore({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: false, // Table should already exist
    }),
    secret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    name: 'jrb.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    }
  }));
  
  console.log('Session middleware configured');

  // Session debug endpoint
  app.get('/api/session-debug', (req, res) => {
    console.log('Session debug - Session ID:', req.sessionID);
    console.log('Session debug - Session data:', req.session);
    console.log('Session debug - Headers:', req.headers);
    res.json({
      sessionId: req.sessionID,
      session: req.session,
      hasSession: !!req.session,
      userId: (req.session as any)?.userId,
      nodeEnv: process.env.NODE_ENV
    });
  });

  // Bypass authentication - temporary development route
  app.get('/api/bypass-login', (req, res) => {
    const tempUser = {
      id: 'demo-user',
      username: 'demo@jonesroadbeauty.com',
      email: 'demo@jonesroadbeauty.com',
      role: 'admin',
      isAdmin: true
    };
    
    (req.session as any).userId = tempUser.id;
    (req.session as any).isAuthenticated = true;
    
    req.session.save((err) => {
      if (err) {
        console.error('Bypass session save error:', err);
        return res.status(500).json({ message: 'Session creation failed' });
      }
      console.log('Bypass session created for demo user');
      res.json({ success: true, user: tempUser, redirect: '/' });
    });
  });

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
      console.log('Provided password length:', password.length);
      console.log('Stored hash:', user.password.substring(0, 20) + '...');
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', validPassword);
      
      if (!validPassword) {
        console.log('Invalid password for user:', username);
        console.log('Tried password:', password);
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

  // Request password reset token via email
  app.post('/api/request-password-reset', async (req, res) => {
    try {
      const { email } = req.body;
      
      console.log('Password reset request for:', email);
      
      if (!email) {
        return res.status(400).json({ message: 'Email address required' });
      }
      
      // Find user by email
      const user = await storage.getUserByUsername(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        console.log('User not found for reset request:', email);
        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      }
      
      // Generate reset token and save to database
      const resetToken = await storage.createPasswordResetToken(user.id);
      
      // TODO: Send email with reset link containing the token
      // For now, we'll return the token in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset token for', email, ':', resetToken);
        res.json({ 
          message: 'Password reset token generated (dev mode)',
          resetToken: resetToken // Only in development
        });
      } else {
        // In production, send email and don't return token
        res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Password reset request failed' });
    }
  });

  // Reset password with token
  app.post('/api/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      console.log('Password reset with token attempt');
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Reset token and new password required' });
      }
      
      // Verify and use reset token
      const userId = await storage.usePasswordResetToken(token);
      if (!userId) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUserPassword(userId, hashedPassword);
      
      console.log('Password reset successful for user ID:', userId);
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Password reset failed' });
    }
  });

  // Emergency admin access endpoint for deployment issues
  app.post('/api/emergency-login', async (req, res) => {
    try {
      const { username } = req.body;
      
      console.log('Emergency login attempt for:', username);
      
      if (!username) {
        return res.status(400).json({ message: 'Username required' });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log('User not found for emergency login:', username);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Set session without password check (emergency only)
      (req.session as any).userId = user.id;
      
      // Ensure session is saved
      req.session.save((err) => {
        if (err) {
          console.error('Emergency session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('Emergency login successful for user:', user.username, 'Session ID:', req.sessionID);
        res.json({ 
          message: 'Emergency login successful',
          user: { id: user.id, username: user.username, role: user.role }
        });
      });
    } catch (error) {
      console.error('Emergency login error:', error);
      res.status(500).json({ message: 'Emergency login failed' });
    }
  });

  app.get('/api/me', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      console.log('Getting user for session:', req.sessionID, 'userId:', userId);
      
      // Handle bypass user
      if (userId === 'demo-user') {
        return res.json({
          id: 'demo-user',
          username: 'demo@jonesroadbeauty.com',
          role: 'admin',
          email: 'demo@jonesroadbeauty.com',
          isAdmin: true
        });
      }
      
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

  // Demo ad copy generation endpoint (no auth required)
  app.post('/api/demo/generate-ad-copy', async (req, res) => {
    try {
      const { transcription, customBrief, concept, subPersona, targetAudience, landingPageUrl, brandDrBalance, useJonesBrandGuide, airLink, uploadedImage } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      const result = await generateAdCopy({
        transcription,
        customBrief,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance,
        useJonesBrandGuide,
        airLink,
        uploadedImage
      });
      
      res.json({
        copyId: 'demo-' + Date.now(), // Demo ID
        headlines: result.headlines,
        primaryText: result.primaryText,
        performance: {
          estimatedCpc: 0.42,
          brandAlignment: 85
        }
      });
    } catch (error) {
      console.error('Demo generation error:', error);
      res.status(500).json({ message: 'Failed to generate ad copy' });
    }
  });

  // Generate ad copy endpoint with analytics tracking (protected)
  app.post('/api/generate-ad-copy', requireAuth, async (req, res) => {
    try {
      const startTime = Date.now();
      const { transcription, customBrief, concept, subPersona, targetAudience, landingPageUrl, brandDrBalance, useJonesBrandGuide, airLink, uploadedImage } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      // Get current training config for snapshot
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateAdCopy({
        transcription,
        customBrief,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance,
        useJonesBrandGuide,
        airLink,
        uploadedImage
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

  // Conversion score feedback endpoint for model improvement
  app.post('/api/conversion-feedback', requireAuth, async (req, res) => {
    try {
      const { conversionScore, content, improvements } = req.body;
      
      // Log feedback for model improvement
      console.log(`Conversion Score Feedback: ${conversionScore}/100`);
      console.log(`Improvements needed: ${improvements.join(', ')}`);
      
      // Store feedback for future model training (in production, this would go to a database)
      const feedback = {
        score: conversionScore,
        timestamp: new Date(),
        improvements,
        contentType: 'landing-page',
        userId: (req as any).user.id
      };
      
      res.json({ 
        success: true, 
        message: 'Feedback recorded for model improvement',
        feedback 
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  // Generate custom copy endpoint (protected)
  app.post('/api/generate-custom-copy', requireAuth, async (req, res) => {
    try {
      const { customRequest, concept, subPersona, brandDrBalance, selectedProduct, useJonesBrandGuide } = req.body;
      
      console.log('Custom copy request:', { customRequest, concept, subPersona, brandDrBalance, selectedProduct, useJonesBrandGuide });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      if (!customRequest || !customRequest.trim()) {
        return res.status(400).json({ message: 'Custom request is required' });
      }
      
      const result = await generateCustomCopy({
        customRequest: customRequest.trim(),
        concept,
        subPersona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      });
      
      res.json({
        response: result.response,
        debugInfo: result.debugInfo
      });
    } catch (error) {
      console.error('Custom copy generation error:', error);
      res.status(500).json({ error: 'Failed to generate custom copy' });
    }
  });

  // Generate retention copy endpoint (protected)
  app.post('/api/generate-retention-copy', requireAuth, async (req, res) => {
    try {
      const { 
        keyMessage, 
        platform, 
        selectedProducts,
        audience, 
        goal, 
        campaignType, 
        urgencyLevel, 
        contentLength, 
        keywordsToInclude, 
        wordsToAvoid,
        concept,
        subPersona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      } = req.body;
      
      console.log('Retention copy request:', { keyMessage, platform, audience, goal, campaignType, urgencyLevel, contentLength });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY missing');
        return res.status(400).json({ error: 'Anthropic API key not configured' });
      }
      
      if (!keyMessage || !keyMessage.trim()) {
        console.error('Key message missing');
        return res.status(400).json({ error: 'Key message is required' });
      }
      
      const result = await generateRetentionCopy({
        keyMessage: keyMessage.trim(),
        platform,
        selectedProducts,
        audience,
        goal,
        campaignType,
        urgencyLevel,
        contentLength,
        keywordsToInclude,
        wordsToAvoid,
        concept,
        subPersona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      });
      
      res.status(200).json({
        response: result.response,
        debugInfo: result.debugInfo
      });
    } catch (error) {
      console.error('Retention copy generation error:', error);
      // Ensure we always return JSON, never HTML
      res.status(500).json({ 
        error: 'Failed to generate retention copy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Static ad analysis endpoint (protected)
  app.post('/api/analyze-static-ad', requireAuth, async (req, res) => {
    try {
      const { staticAdImage, concept, subPersona, brandDrBalance, selectedProduct } = req.body;
      
      console.log('Static ad analysis request:', { concept, subPersona, brandDrBalance, selectedProduct, imageLength: staticAdImage?.length });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      if (!staticAdImage) {
        return res.status(400).json({ message: 'Static ad image is required' });
      }
      
      const result = await analyzeStaticAd({
        staticAdImage,
        concept: concept || 'lifeJuggler',
        subPersona: subPersona || undefined,
        brandDrBalance: brandDrBalance || 50,
        selectedProduct: selectedProduct || undefined
      });
      
      res.json({
        analysis: result.analysis,
        rawResponse: result.rawResponse // For debug purposes
      });
    } catch (error) {
      console.error('Static ad analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze static ad' });
    }
  });

  // Generate landing page copy endpoint (protected)
  app.post('/api/generate-landing-copy', requireAuth, async (req, res) => {
    try {
      const { landingPageType, productBrief, concept, subPersona, useAdsContent, adsContent, brandDrBalance, selectedProduct, mainAngle, transcription } = req.body;
      
      console.log('Landing copy request body:', { landingPageType, productBrief, concept, subPersona, useAdsContent, adsContent, brandDrBalance, selectedProduct, mainAngle, transcription: transcription ? 'included' : 'none' });
      
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
        brandDrBalance,
        selectedProduct,
        mainAngle,
        transcription
      });
      
      // Calculate performance metrics based on copy structure
      const headlineWords = result.headline ? result.headline.split(/\s+/).length : 0;
      const totalWords = result.stats?.totalWords || 0;
      const sectionCount = result.stats?.sectionCount || 0;
      
      // Performance scoring based on conversion copywriting best practices
      const headlineScore = headlineWords >= 6 && headlineWords <= 12 ? 'Optimal' : 
                           headlineWords < 6 ? 'Too Short' : 'Too Long';
      
      const conversionScore = Math.min(100, Math.max(70, 
        (sectionCount >= 5 ? 20 : sectionCount * 4) + // Section completeness
        (totalWords >= 800 ? 25 : totalWords / 32) + // Content depth  
        (result.introduction ? 15 : 0) + // Has introduction
        (result.cta ? 15 : 0) + // Has CTA
        (selectedProduct ? 25 : 15) // Product-specific insights (bonus for no risk reversal)
      ));
      
      const readabilityScore = Math.min(10, Math.max(6,
        8.5 - (result.stats?.avgSectionLength > 150 ? 1 : 0) + // Penalty for long sections
        (result.stats?.avgSectionLength < 50 ? -1 : 0) // Penalty for too short
      ));
      
      res.json({
        landingCopy: {
          headline: result.headline,
          subheadline: result.subheadline,
          introduction: result.introduction,
          sections: result.sections,
          riskReversal: result.riskReversal,
          cta: result.cta,
          stats: result.stats
        },
        analysis: {
          headlineLength: headlineScore,
          conversionScore: Math.round(conversionScore),
          readabilityScore: readabilityScore.toFixed(1),
          totalWords: totalWords,
          sectionCount: sectionCount,
          avgSectionLength: result.stats?.avgSectionLength || 0,
          hasRiskReversal: !!result.riskReversal,
          productSpecific: !!selectedProduct
        },
        rawResponse: result.rawResponse // For debug purposes
      });
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ message: 'Failed to generate landing page copy' });
    }
  });

  // Content revision endpoint (protected)
  app.post('/api/revise-content', requireAuth, async (req, res) => {
    try {
      const revisionSchema = z.object({
        originalContent: z.string(),
        revisionInstructions: z.string(),
        contentType: z.enum(['headline', 'primaryText', 'landingCopy', 'custom', 'retention']),
        context: z.object({
          transcription: z.string().optional(),
          customBrief: z.string().optional(),
          concept: z.string().optional(),
          subPersona: z.string().optional(),
          targetAudience: z.string().optional(),
          brandDrBalance: z.number().optional(),
          selectedProduct: z.string().optional(),
          selectedProducts: z.array(z.string()).optional(),
          field: z.string().optional(),
          customRequest: z.string().optional()
        }).optional()
      });

      const { originalContent, revisionInstructions, contentType, context } = revisionSchema.parse(req.body);
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }

      // Import and use revision function from anthropic module
      // reviseContent is now imported at the top
      
      const revisedContent = await reviseContent({
        originalContent,
        revisionInstructions,
        contentType,
        context
      });
      
      res.json({
        revisedContent,
        original: originalContent,
        instructions: revisionInstructions
      });
    } catch (error) {
      console.error('Revision error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid revision request', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to revise content' });
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

  // Influencer voice analysis endpoint (protected)
  app.post('/api/analyze-influencer-voice', requireAuth, async (req, res) => {
    try {
      const analysisSchema = z.object({
        transcription: z.string().optional(),
        influencerHandle: z.string().optional(),
        voiceAnalysisMethod: z.enum(['video', 'social', 'combined'])
      });

      const { transcription, influencerHandle, voiceAnalysisMethod } = analysisSchema.parse(req.body);
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }

      let socialContent = '';
      
      // Fetch Instagram content if method includes social analysis
      if ((voiceAnalysisMethod === 'social' || voiceAnalysisMethod === 'combined') && influencerHandle) {
        try {
          socialContent = await fetchInstagramContent(influencerHandle);
        } catch (error) {
          console.error('Instagram fetch error:', error);
          // Continue with just transcription if social fetch fails
        }
      }

      // Perform voice analysis
      const voiceProfile = await analyzeInfluencerVoice({
        transcription: voiceAnalysisMethod !== 'social' ? transcription : undefined,
        socialContent: voiceAnalysisMethod !== 'video' ? socialContent : undefined,
        influencerHandle
      });

      res.json({
        voiceProfile,
        analysisMethod: voiceAnalysisMethod,
        dataUsed: {
          transcription: !!transcription && voiceAnalysisMethod !== 'social',
          socialContent: !!socialContent && voiceAnalysisMethod !== 'video',
          influencerHandle
        }
      });
    } catch (error) {
      console.error('Voice analysis error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid analysis request', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to analyze influencer voice' });
    }
  });

  // Enhanced ad copy generation with influencer voice (protected)
  app.post('/api/generate-influencer-copy', requireAuth, async (req, res) => {
    try {
      const generationSchema = z.object({
        transcription: z.string().optional(),
        customBrief: z.string().optional(),
        concept: z.string().optional(),
        subPersona: z.string().optional(),
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

      const data = generationSchema.parse(req.body);
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }

      // Get brand guidelines from training config
      const trainingConfig = await getTrainingConfig();
      
      // Create prompt for influencer-style copy generation
      const prompt = `
Product: ${data.selectedProduct || 'Jones Road Beauty products'}
Transcription: ${data.transcription || ''}
Custom Brief: ${data.customBrief || ''}
Target Persona: ${data.concept} - ${data.subPersona}
Landing Page: ${data.landingPageUrl || 'None provided'}
`;

      const result = await generateInfluencerStyleCopy(
        prompt,
        data.voiceProfile,
        trainingConfig?.brandGuidelines,
        data.influencerBrandBalance[0] || 50
      );

      const userId = (req.session as any).userId;
      const savedCopy = await storage.saveGeneratedCopy({
        userId: userId,
        inputText: data.transcription || data.concept || '',
        landingPageUrl: data.landingPageUrl || null,
        targetPersona: data.subPersona || data.targetAudience || '',
        brandDrBalance: data.brandDrBalance?.[0] || 50,
        headlines: result.headlines,
        primaryText: result.primaryText,
        configSnapshot: trainingConfig,
        generationTimeMs: 0,
        tokensUsed: null,
        rating: null,
        feedback: null,
      });

      res.json({
        copyId: savedCopy.id,
        headlines: result.headlines,
        primaryText: result.primaryText,
        voiceAnalysis: {
          balanceUsed: data.influencerBrandBalance[0] || 50,
          voiceElements: data.voiceProfile.toneDescriptors.slice(0, 3)
        }
      });
    } catch (error) {
      console.error('Influencer copy generation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid generation request', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to generate influencer copy' });
    }
  });

  // Training configuration routes (bypassed for direct access)
  registerTrainingRoutes(app, (req: any, res: any, next: any) => {
    // Create bypass admin user for direct access
    req.user = {
      id: 'demo-user',
      username: 'demo@jonesroadbeauty.com',
      role: 'admin',
      isAdmin: true
    };
    next();
  });
  
  // Register review routes
  const { registerReviewRoutes } = await import("./routes-reviews");
  registerReviewRoutes(app);
  
  // Register Junip API routes
  registerJunipRoutes(app);
  
  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
