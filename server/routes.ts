import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerTrainingRoutes } from "./routes/training";
import { registerJunipRoutes } from "./routes/junip";
import { registerAdminRoutes } from "./routes/admin";
import { registerReviewRoutes } from "./routes/reviews";
import { storage, crudHandlers, asyncRouteHandler, sendSuccess } from "./utils";
import multer from "multer";
import {
  generateAdCopy,
  generateLandingPageCopy,
  reviseContent,
  generateCustomCopy,
  analyzeStaticAd,
  generateRetentionEmail,
  generateRetentionSms,
  generateRetentionVisualPreview,
  generateSocialCaptions,
  generateStorySequence,
  generateBrief
} from "./services";
import { analyzeInfluencerVoice, generateInfluencerStyleCopy, fetchInstagramContent } from "./services";
import { getTrainingConfig } from "./routes/training";
import { z } from "zod";
import { DEFAULT_BRAND_DR_BALANCE, DEFAULT_PERSONA_KEY, DEFAULT_CONTENT_TYPE, DEFAULT_SOCIAL_PLATFORM, DEFAULT_SOCIAL_GOAL, DEFAULT_TONE, DEFAULT_VARIATIONS, DEFAULT_SEQUENCE_TYPE, DEFAULT_STORY_LENGTH } from "@shared/constants";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq } from "drizzle-orm";
import {
  insertUserSchema,
  adminCreateUserSchema,
  updateUserSchema,
  insertProductSchema,
  insertProductClaimSchema,
  insertPersonaSchema,
  insertSubpersonaSchema,
  insertPersonaPillarSchema,
  insertBrandConfigurationSchema,
  insertCopyFrameworkSchema,
  productBriefs,
  insertProductBriefSchema
} from "@shared/schema";
import { BRAND_NAME } from "@shared/constants";
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  FALLBACK_MODEL_STR,
  DEFAULT_MAX_HEADLINES,
  DEFAULT_HEADLINE_FRAMEWORK,
  IMAGE_ANALYSIS_INSTRUCTIONS,
  STATION_CONFIGS,
} from '@shared/constants';

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


function registerConfigRoutes(app: Express) {
  // #region: Database-driven configuration management
  
  // Training configuration endpoint - replaces hardcoded config
  app.get("/api/training-config", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      const config = await storage.getTrainingConfiguration();
      res.json(config);
    } catch (error) {
      console.error("Error fetching training configuration:", error);
      res.status(500).json({ error: "Failed to fetch training configuration" });
    }
  });

  // Email templates endpoint
  app.post("/api/email-templates", requireAuth, async (req, res) => {
    try {
      const { templates } = req.body;
      if (!Array.isArray(templates)) {
        return res.status(400).json({ error: "Templates must be an array" });
      }

      // Store email templates in system configuration
      await storage.setSystemConfigValue(
        'emailTemplates.retention',
        JSON.stringify(templates),
        'Email templates for retention copy generation'
      );

      res.json({ success: true, message: 'Email templates saved successfully' });
    } catch (error) {
      console.error("Error saving email templates:", error);
      res.status(500).json({ error: "Failed to save email templates" });
    }
  });

  app.get("/api/email-templates", requireAuth, async (req, res) => {
    try {
      const configs = await storage.getSystemConfiguration();
      const templateConfig = configs.find(c => c.configKey === 'emailTemplates.retention');
      const templates = templateConfig ? JSON.parse(templateConfig.configValue) : [];
      res.json({ templates });
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });
  
  // Products endpoints
  app.get("/api/products", crudHandlers.getAll(() => storage.getAllProducts(), "products"));
  app.get("/api/products/active", crudHandlers.getAll(() => storage.getActiveProducts(), "active products"));
  app.post("/api/products", crudHandlers.create((data) => storage.createProduct(data), insertProductSchema, "product"));
  app.put("/api/products/:id", crudHandlers.update((id, data) => storage.updateProduct(id, data), insertProductSchema, "product"));
  app.delete("/api/products/:id", crudHandlers.delete((id) => storage.deleteProduct(id), "product"));
  
  // Product claims endpoints
  app.get("/api/products/:productId/claims", asyncRouteHandler(async (req, res) => {
    const { productId } = req.params;
    const claims = await storage.getProductClaims(productId);
    res.json(claims);
  }, "fetch product claims"));
  
  app.post("/api/products/:productId/claims", asyncRouteHandler(async (req, res) => {
    const { productId } = req.params;
    const data = insertProductClaimSchema.parse({ ...req.body, productId });
    const claim = await storage.createProductClaim(data);
    res.status(201).json(claim);
  }, "create product claim", 400));
  
  app.put("/api/product-claims/:id", crudHandlers.update((id, data) => storage.updateProductClaim(id, data), insertProductClaimSchema, "product claim"));
  app.delete("/api/product-claims/:id", crudHandlers.delete((id) => storage.deleteProductClaim(id), "product claim"));
  
  // Personas endpoints
  app.get("/api/personas", crudHandlers.getAll(() => storage.getAllPersonas(), "personas"));
  app.get("/api/personas/active", crudHandlers.getAll(() => storage.getActivePersonas(), "active personas"));
  app.post("/api/personas", crudHandlers.create((data) => storage.createPersona(data), insertPersonaSchema, "persona"));
  app.put("/api/personas/:id", crudHandlers.update((id, data) => storage.updatePersona(id, data), insertPersonaSchema, "persona"));
  app.delete("/api/personas/:id", crudHandlers.delete((id) => storage.deletePersona(id), "persona"));
  
  // Persona pillars endpoints
  app.get("/api/personas/:personaId/pillars", async (req, res) => {
    try {
      const { personaId } = req.params;
      const pillars = await storage.getPersonaPillars(personaId);
      res.json(pillars);
    } catch (error) {
      console.error("Error fetching persona pillars:", error);
      res.status(500).json({ error: "Failed to fetch persona pillars" });
    }
  });
  
  app.post("/api/personas/:personaId/pillars", async (req, res) => {
    try {
      const { personaId } = req.params;
      const data = insertPersonaPillarSchema.parse({ ...req.body, personaId });
      const pillar = await storage.createPersonaPillar(data);
      res.json(pillar);
    } catch (error) {
      console.error("Error creating persona pillar:", error);
      res.status(400).json({ error: "Failed to create persona pillar" });
    }
  });
  
  app.put("/api/persona-pillars/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertPersonaPillarSchema.partial().parse(req.body);
      const pillar = await storage.updatePersonaPillar(id, data);
      res.json(pillar);
    } catch (error) {
      console.error("Error updating persona pillar:", error);
      res.status(400).json({ error: "Failed to update persona pillar" });
    }
  });
  
  app.delete("/api/persona-pillars/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePersonaPillar(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting persona pillar:", error);
      res.status(400).json({ error: "Failed to delete persona pillar" });
    }
  });
  
  // Subpersona endpoints
  app.get("/api/personas/:personaId/subpersonas", async (req, res) => {
    try {
      const { personaId } = req.params;
      const subpersonas = await storage.getSubpersonas(personaId);
      res.json(subpersonas);
    } catch (error) {
      console.error("Error fetching subpersonas:", error);
      res.status(500).json({ error: "Failed to fetch subpersonas" });
    }
  });
  
  app.get("/api/personas/:personaId/subpersonas/active", async (req, res) => {
    try {
      const { personaId } = req.params;
      const subpersonas = await storage.getActiveSubpersonas(personaId);
      res.json(subpersonas);
    } catch (error) {
      console.error("Error fetching active subpersonas:", error);
      res.status(500).json({ error: "Failed to fetch active subpersonas" });
    }
  });
  
  app.post("/api/personas/:personaId/subpersonas", async (req, res) => {
    try {
      const { personaId } = req.params;
      const data = insertSubpersonaSchema.parse({ ...req.body, personaId });
      const subpersona = await storage.createSubpersona(data);
      res.json(subpersona);
    } catch (error) {
      console.error("Error creating subpersona:", error);
      res.status(400).json({ error: "Failed to create subpersona" });
    }
  });
  
  app.get("/api/subpersonas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const subpersona = await storage.getSubpersona(id);
      if (!subpersona) {
        return res.status(404).json({ error: "Subpersona not found" });
      }
      res.json(subpersona);
    } catch (error) {
      console.error("Error fetching subpersona:", error);
      res.status(500).json({ error: "Failed to fetch subpersona" });
    }
  });
  
  app.put("/api/subpersonas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertSubpersonaSchema.partial().parse(req.body);
      const subpersona = await storage.updateSubpersona(id, data);
      res.json(subpersona);
    } catch (error) {
      console.error("Error updating subpersona:", error);
      res.status(400).json({ error: "Failed to update subpersona" });
    }
  });
  
  app.delete("/api/subpersonas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubpersona(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subpersona:", error);
      res.status(400).json({ error: "Failed to delete subpersona" });
    }
  });
  
  // Brand configuration endpoints
  app.get("/api/brand-configuration", async (req, res) => {
    try {
      const config = await storage.getBrandConfiguration();
      res.json(config);
    } catch (error) {
      console.error("Error fetching brand configuration:", error);
      res.status(500).json({ error: "Failed to fetch brand configuration" });
    }
  });
  
  app.get("/api/brand-configuration/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const config = await storage.getBrandConfigurationByType(type);
      res.json(config);
    } catch (error) {
      console.error("Error fetching brand configuration by type:", error);
      res.status(500).json({ error: "Failed to fetch brand configuration by type" });
    }
  });
  
  app.post("/api/brand-configuration", async (req, res) => {
    try {
      const data = insertBrandConfigurationSchema.parse(req.body);
      const config = await storage.createBrandConfiguration(data);
      res.json(config);
    } catch (error) {
      console.error("Error creating brand configuration:", error);
      res.status(400).json({ error: "Failed to create brand configuration" });
    }
  });
  
  app.put("/api/brand-configuration/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertBrandConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateBrandConfiguration(id, data);
      res.json(config);
    } catch (error) {
      console.error("Error updating brand configuration:", error);
      res.status(400).json({ error: "Failed to update brand configuration" });
    }
  });
  
  app.delete("/api/brand-configuration/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBrandConfiguration(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting brand configuration:", error);
      res.status(400).json({ error: "Failed to delete brand configuration" });
    }
  });
  
  // Copy frameworks endpoints
  app.get("/api/copy-frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getCopyFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching copy frameworks:", error);
      res.status(500).json({ error: "Failed to fetch copy frameworks" });
    }
  });
  
  app.get("/api/copy-frameworks/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const validTypes = ['headline_framework', 'primary_text_rule', 'brand_first_guideline', 'direct_response_guideline'];
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid framework type" });
      }
      
      const frameworks = await storage.getCopyFrameworksByType(type as 'headline_framework' | 'primary_text_rule' | 'brand_first_guideline' | 'direct_response_guideline');
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching copy frameworks by type:", error);
      res.status(500).json({ error: "Failed to fetch copy frameworks by type" });
    }
  });
  
  app.post("/api/copy-frameworks", async (req, res) => {
    try {
      const data = insertCopyFrameworkSchema.parse(req.body);
      const framework = await storage.createCopyFramework(data);
      res.json(framework);
    } catch (error) {
      console.error("Error creating copy framework:", error);
      res.status(400).json({ error: "Failed to create copy framework" });
    }
  });
  
  app.put("/api/copy-frameworks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertCopyFrameworkSchema.partial().parse(req.body);
      const framework = await storage.updateCopyFramework(id, data);
      res.json(framework);
    } catch (error) {
      console.error("Error updating copy framework:", error);
      res.status(400).json({ error: "Failed to update copy framework" });
    }
  });
  
  app.delete("/api/copy-frameworks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCopyFramework(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting copy framework:", error);
      res.status(400).json({ error: "Failed to delete copy framework" });
    }
  });
  
  // System configuration endpoints
  app.get("/api/system-configuration", async (req, res) => {
    try {
      const config = await storage.getSystemConfiguration();
      res.json(config);
    } catch (error) {
      console.error("Error fetching system configuration:", error);
      res.status(500).json({ error: "Failed to fetch system configuration" });
    }
  });
  
  app.get("/api/system-configuration/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const value = await storage.getSystemConfigValue(key);
      res.json({ key, value });
    } catch (error) {
      console.error("Error fetching system configuration value:", error);
      res.status(500).json({ error: "Failed to fetch system configuration value" });
    }
  });
  
  app.post("/api/system-configuration", async (req, res) => {
    try {
      const { key, value, description } = req.body;
      const config = await storage.setSystemConfigValue(key, value, description);
      res.json(config);
    } catch (error) {
      console.error("Error setting system configuration value:", error);
      res.status(400).json({ error: "Failed to set system configuration value" });
    }
  });
  
  // Email frameworks endpoints - Full CRUD operations
  
  // GET all email frameworks
  app.get("/api/email-frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getAllEmailFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching email frameworks:", error);
      res.status(500).json({ error: "Failed to fetch email frameworks" });
    }
  });

  // SMS frameworks endpoints - Full CRUD operations
  // GET all SMS frameworks
  app.get("/api/sms-frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getAllSmsFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching SMS frameworks:", error);
      res.status(500).json({ error: "Failed to fetch SMS frameworks" });
    }
  });

  // GET active SMS frameworks only
  app.get("/api/sms-frameworks/active", async (req, res) => {
    try {
      const frameworks = await storage.getActiveSmsFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching active SMS frameworks:", error);
      res.status(500).json({ error: "Failed to fetch active SMS frameworks" });
    }
  });

  // GET single SMS framework by name
  app.get("/api/sms-frameworks/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const framework = await storage.getSmsFramework(name);
      if (!framework) {
        return res.status(404).json({ error: "SMS framework not found" });
      }
      res.json(framework);
    } catch (error) {
      console.error("Error fetching SMS framework:", error);
      res.status(500).json({ error: "Failed to fetch SMS framework" });
    }
  });

  // POST create new SMS framework
  app.post("/api/sms-frameworks", requireAdmin, async (req, res) => {
    try {
      const { 
        name, 
        displayName, 
        description, 
        structure, 
        keyElements, 
        frameworkContent, 
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive,
        sortOrder 
      } = req.body;

      if (!name || !displayName || !description || !structure || !systemPrompt) {
        return res.status(400).json({ 
          error: "Missing required fields: name, displayName, description, structure, systemPrompt" 
        });
      }

      const existingFramework = await storage.getSmsFramework(name);
      if (existingFramework) {
        return res.status(409).json({ error: "Framework with this name already exists" });
      }

      const newFramework = await storage.createSmsFramework({
        name,
        displayName,
        description,
        structure,
        keyElements,
        frameworkContent,
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive: isActive || 'true',
        sortOrder: sortOrder || 0,
      });

      res.status(201).json({ success: true, framework: newFramework });
    } catch (error) {
      console.error("Error creating SMS framework:", error);
      res.status(500).json({ error: "Failed to create SMS framework" });
    }
  });

  // PUT update SMS framework by ID
  app.put("/api/sms-frameworks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name,
        displayName,
        description,
        structure, 
        keyElements, 
        frameworkContent, 
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive,
        sortOrder 
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Framework ID is required" });
      }

      const updatedFramework = await storage.updateSmsFramework(id, {
        name,
        displayName,
        description,
        structure,
        keyElements,
        frameworkContent,
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive,
        sortOrder,
      });

      if (!updatedFramework) {
        return res.status(404).json({ error: "Framework not found" });
      }

      res.json({ success: true, framework: updatedFramework });
    } catch (error) {
      console.error("Error updating SMS framework:", error);
      res.status(500).json({ error: "Failed to update SMS framework" });
    }
  });

  // DELETE SMS framework by ID
  app.delete("/api/sms-frameworks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSmsFrameworkById(id);
      res.json({ success: true, message: "Framework deleted successfully" });
    } catch (error) {
      console.error("Error deleting SMS framework:", error);
      res.status(500).json({ error: "Failed to delete SMS framework" });
    }
  });

  // POST seed SMS frameworks from template
  app.post("/api/sms-frameworks/seed", requireAdmin, async (req, res) => {
    try {
      const { seedSmsFrameworks } = await import('./seeds/sms-frameworks-seed.js');
      await seedSmsFrameworks();
      res.json({ success: true, message: "SMS frameworks seeded successfully" });
    } catch (error) {
      console.error("Error seeding SMS frameworks:", error);
      res.status(500).json({ error: "Failed to seed SMS frameworks" });
    }
  });

  // GET active email frameworks only
  app.get("/api/email-frameworks/active", async (req, res) => {
    try {
      const frameworks = await storage.getActiveEmailFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching active email frameworks:", error);
      res.status(500).json({ error: "Failed to fetch active email frameworks" });
    }
  });
  
  // GET single email framework by name
  app.get("/api/email-frameworks/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const framework = await storage.getEmailFramework(name);
      if (!framework) {
        return res.status(404).json({ error: "Email framework not found" });
      }
      res.json(framework);
    } catch (error) {
      console.error("Error fetching email framework:", error);
      res.status(500).json({ error: "Failed to fetch email framework" });
    }
  });

  // POST create new email framework
  app.post("/api/email-frameworks", requireAdmin, async (req, res) => {
    try {
      const { 
        name, 
        displayName, 
        description, 
        structure, 
        keyElements, 
        frameworkContent, 
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive,
        sortOrder 
      } = req.body;
      
      // Validate required fields
      if (!name || !displayName || !description || !structure || !systemPrompt) {
        return res.status(400).json({ 
          error: "Missing required fields: name, displayName, description, structure, systemPrompt" 
        });
      }

      // Check if framework with this name already exists
      const existingFramework = await storage.getEmailFramework(name);
      if (existingFramework) {
        return res.status(409).json({ error: "Framework with this name already exists" });
      }

      // Create the framework
      const newFramework = await storage.createEmailFramework({
        name,
        displayName,
        description,
        structure,
        keyElements,
        frameworkContent,
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive: isActive || 'true',
        sortOrder: sortOrder || 0,
      });

      res.status(201).json({ success: true, framework: newFramework });
    } catch (error) {
      console.error("Error creating email framework:", error);
      res.status(500).json({ error: "Failed to create email framework" });
    }
  });

  // PUT update email framework by ID
  app.put("/api/email-frameworks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name,
        displayName,
        description,
        structure, 
        keyElements, 
        frameworkContent, 
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive,
        sortOrder 
      } = req.body;
      
      // Validate required fields
      if (!id) {
        return res.status(400).json({ error: "Framework ID is required" });
      }

      // Update the framework
      const updatedFramework = await storage.updateEmailFramework(id, {
        name,
        displayName,
        description,
        structure,
        keyElements,
        frameworkContent,
        systemPrompt,
        outputRequirements,
        expectedLength,
        isActive,
        sortOrder,
      });

      if (!updatedFramework) {
        return res.status(404).json({ error: "Framework not found" });
      }

      res.json({ success: true, framework: updatedFramework });
    } catch (error) {
      console.error("Error updating email framework:", error);
      res.status(500).json({ error: "Failed to update email framework" });
    }
  });

  // DELETE email framework by ID
  app.delete("/api/email-frameworks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete the framework
      await storage.deleteEmailFrameworkById(id);

      res.json({ success: true, message: "Framework deleted successfully" });
    } catch (error) {
      console.error("Error deleting email framework:", error);
      res.status(500).json({ error: "Failed to delete email framework" });
    }
  });

  // POST seed email frameworks from template
  app.post("/api/email-frameworks/seed", requireAdmin, async (req, res) => {
    try {
      const { seedEmailFrameworks } = await import('./seeds/email-frameworks-seed.js');
      await seedEmailFrameworks();
      res.json({ success: true, message: "Email frameworks seeded successfully" });
    } catch (error) {
      console.error("Error seeding email frameworks:", error);
      res.status(500).json({ error: "Failed to seed email frameworks" });
    }
  });
  
  app.put("/api/email-frameworks/:name", requireAuth, async (req, res) => {
    try {
      const { name } = req.params;
      const data = req.body;
      const framework = await storage.updateEmailFrameworkByName(name, data);
      res.json(framework);
    } catch (error) {
      console.error("Error updating email framework:", error);
      res.status(400).json({ error: "Failed to update email framework" });
    }
  });
  
  // Email framework image upload endpoint
  app.post("/api/email-frameworks/:frameworkId/images", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const { frameworkId } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Please upload a valid image file (JPG, PNG, etc.)' });
      }
      
      // Validate file size (8MB limit)
      if (file.size > 8 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size must be less than 8MB' });
      }
      
      // Get the framework to check if it exists and get current images
      const framework = await storage.getEmailFrameworkById(frameworkId);
      if (!framework) {
        return res.status(404).json({ error: "Email framework not found" });
      }
      
      // Check if framework already has 5 images (max limit)
      const currentImages = framework.images ? (Array.isArray(framework.images) ? framework.images : []) : [];
      if (currentImages.length >= 5) {
        return res.status(400).json({ error: "Maximum 5 images allowed per framework" });
      }
      
      // Convert image to base64 for storage
      const fs = await import('fs');
      const imageBuffer = fs.readFileSync(file.path);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = file.mimetype;
      const dataUri = `data:${mimeType};base64,${base64Image}`;
      
      // Add the new image to the framework's images array
      const updatedImages = [...currentImages, {
        id: Date.now().toString(), // Simple ID for now
        name: file.originalname,
        dataUri: dataUri,
        mimeType: mimeType,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }];
      
      // Update the framework with the new images
      await storage.updateEmailFramework(frameworkId, { images: updatedImages });
      
      // Clean up the temporary file
      fs.unlinkSync(file.path);
      
      res.json({ 
        success: true, 
        image: updatedImages[updatedImages.length - 1],
        totalImages: updatedImages.length 
      });
    } catch (error) {
      console.error("Error uploading framework image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  
  // Delete email framework image endpoint
  app.delete("/api/email-frameworks/:frameworkId/images/:imageId", requireAdmin, async (req, res) => {
    try {
      const { frameworkId, imageId } = req.params;
      
      // Get the framework
      const framework = await storage.getEmailFrameworkById(frameworkId);
      if (!framework) {
        return res.status(404).json({ error: "Email framework not found" });
      }
      
      // Remove the image from the framework's images array
      const currentImages = framework.images ? (Array.isArray(framework.images) ? framework.images : []) : [];
      const updatedImages = currentImages.filter((img: any) => img.id !== imageId);
      
      // Update the framework
      await storage.updateEmailFramework(frameworkId, { images: updatedImages });
      
      res.json({ success: true, totalImages: updatedImages.length });
    } catch (error) {
      console.error("Error deleting framework image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });
  
  // Landing page frameworks endpoints - Full CRUD operations
  
  // GET all landing page frameworks
  app.get("/api/landing-page-frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getAllLandingPageFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching landing page frameworks:", error);
      res.status(500).json({ error: "Failed to fetch landing page frameworks" });
    }
  });

  // GET active landing page frameworks only
  app.get("/api/landing-page-frameworks/active", async (req, res) => {
    try {
      const frameworks = await storage.getActiveLandingPageFrameworks();
      res.json(frameworks);
    } catch (error) {
      console.error("Error fetching active landing page frameworks:", error);
      res.status(500).json({ error: "Failed to fetch active landing page frameworks" });
    }
  });
  
  // GET single landing page framework by name
  app.get("/api/landing-page-frameworks/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const framework = await storage.getLandingPageFramework(name);
      if (!framework) {
        return res.status(404).json({ error: "Landing page framework not found" });
      }
      res.json(framework);
    } catch (error) {
      console.error("Error fetching landing page framework:", error);
      res.status(500).json({ error: "Failed to fetch landing page framework" });
    }
  });

  // POST create new landing page framework
  app.post("/api/landing-page-frameworks", requireAdmin, async (req, res) => {
    try {
      const { 
        name, 
        displayName, 
        description, 
        contentSequence,
        reasonStructure,
        optimizationRules,
        realExamples,
        systemPrompt,
        outputRequirements,
        isActive,
        sortOrder 
      } = req.body;
      
      // Validate required fields
      if (!name || !displayName || !description || !systemPrompt) {
        return res.status(400).json({ 
          error: "Missing required fields: name, displayName, description, systemPrompt" 
        });
      }

      // Check if framework with this name already exists
      const existingFramework = await storage.getLandingPageFramework(name);
      if (existingFramework) {
        return res.status(409).json({ error: "Framework with this name already exists" });
      }

      // Create the framework
      const newFramework = await storage.createLandingPageFramework({
        name,
        displayName,
        description,
        contentSequence: contentSequence || [],
        reasonStructure: reasonStructure || [],
        optimizationRules: optimizationRules || [],
        realExamples: realExamples || [],
        systemPrompt,
        outputRequirements,
        isActive: isActive || 'true',
        sortOrder: sortOrder || 0,
      });

      res.status(201).json({ success: true, framework: newFramework });
    } catch (error) {
      console.error("Error creating landing page framework:", error);
      res.status(500).json({ error: "Failed to create landing page framework" });
    }
  });

  // PUT update landing page framework by ID
  app.put("/api/landing-page-frameworks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name,
        displayName,
        description,
        contentSequence,
        reasonStructure,
        optimizationRules,
        realExamples,
        systemPrompt,
        outputRequirements,
        isActive,
        sortOrder 
      } = req.body;
      
      // Validate required fields
      if (!id) {
        return res.status(400).json({ error: "Framework ID is required" });
      }

      // Update the framework
      const updatedFramework = await storage.updateLandingPageFramework(id, {
        name,
        displayName,
        description,
        contentSequence,
        reasonStructure,
        optimizationRules,
        realExamples,
        systemPrompt,
        outputRequirements,
        isActive,
        sortOrder,
      });

      if (!updatedFramework) {
        return res.status(404).json({ error: "Framework not found" });
      }

      res.json({ success: true, framework: updatedFramework });
    } catch (error) {
      console.error("Error updating landing page framework:", error);
      res.status(500).json({ error: "Failed to update landing page framework" });
    }
  });

  // DELETE landing page framework by ID
  app.delete("/api/landing-page-frameworks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete the framework
      await storage.deleteLandingPageFrameworkById(id);

      res.json({ success: true, message: "Framework deleted successfully" });
    } catch (error) {
      console.error("Error deleting landing page framework:", error);
      res.status(500).json({ error: "Failed to delete landing page framework" });
    }
  });
  
  // Email image analysis endpoints
  app.post("/api/email-image-analysis", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const { selectedFramework } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      if (!selectedFramework) {
        return res.status(400).json({ error: "Selected framework is required" });
      }
      
      // Get the framework details
      const framework = await storage.getEmailFramework(selectedFramework);
      if (!framework) {
        return res.status(400).json({ error: "Invalid email framework selected" });
      }
      
      // Create email analysis using the selected framework
      const analysisData = {
        userId: (req.session as any).userId,
        imagePath: file.path,
        selectedFramework,
        aiAnalysis: `Email analysis for ${framework.displayName} framework`,
        extractedElements: {
          subject: "Generated subject line",
          preheader: "Generated preheader text",
          ctaButtons: ["Shop Now"],
          framework: framework.name
        },
        confidence: 85
      };
      
      const analysis = await storage.saveEmailImageAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing email image:", error);
      res.status(500).json({ error: "Failed to analyze email image" });
    }
  });
  
  app.get("/api/email-image-analysis", requireAuth, async (req, res) => {
    try {
      const analyses = await storage.getEmailImageAnalysisByUser((req.session as any).userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching email analyses:", error);
      res.status(500).json({ error: "Failed to fetch email analyses" });
    }
  });
  
  app.get("/api/email-image-analysis/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getEmailImageAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: "Email analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching email analysis:", error);
      res.status(500).json({ error: "Failed to fetch email analysis" });
    }
  });
  
  // Get personas from database
  app.get('/personas', async (req, res) => {
    try {
      // For now, return empty object - personas will be loaded via main config endpoint
      // TODO: Add specific personas table/field when database schema is ready
      res.json({});
    } catch (error) {
      console.error('Error fetching personas:', error);
      res.status(500).json({ error: 'Failed to fetch personas' });
    }
  });
  
  // Products configuration endpoint (for frontend config loading)
  app.get("/api/config/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const productMap = products.reduce((acc, product) => {
        // Use name as key for consistency with existing code
        const key = product.name;
        acc[key] = {
          id: product.id,
          name: product.name,
          displayName: product.displayName,
          description: product.description,
          isActive: product.isActive,
          sortOrder: product.sortOrder
        };
        return acc;
      }, {} as Record<string, any>);
      
      res.json(productMap);
    } catch (error) {
      console.error("Error fetching products config:", error);
      res.status(500).json({ error: "Failed to fetch products configuration" });
    }
  });
  
  // Personas configuration endpoint (for frontend config loading)
  app.get("/api/config/personas", async (req, res) => {
    try {
      const personas = await storage.getAllPersonas();
      const personaMap = await personas.reduce(async (accPromise, persona) => {
        const acc = await accPromise;
        const key = persona.name;
        
        // Get subpersonas for this persona
        const subpersonas = await storage.getActiveSubpersonas(persona.id);
        
        acc[key] = {
          id: persona.id,
          name: persona.name,
          label: persona.displayName, // Frontend expects 'label' property
          displayName: persona.displayName,
          description: persona.description,
          isActive: persona.isActive,
          sortOrder: persona.sortOrder,
          subpersonas: subpersonas.map(sub => ({
            id: sub.id,
            name: sub.name,
            description: sub.description,
            sortOrder: sub.sortOrder
          }))
        };
        return acc;
      }, Promise.resolve({} as Record<string, any>));
      
      res.json(personaMap);
    } catch (error) {
      console.error("Error fetching personas config:", error);
      res.status(500).json({ error: "Failed to fetch personas configuration" });
    }
  });
  
  // Get products from database (legacy compatibility)
  app.get('/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const productMap = products.reduce((acc, product) => {
        // Use the standardized name field as key (already properly formatted)
        const key = product.name;
        acc[key] = {
          id: product.id,
          name: product.name,
          displayName: product.displayName,
          description: product.description,
          isActive: product.isActive
        };
        return acc;
      }, {} as Record<string, any>);
      
      res.json(productMap);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  
  // Brand Guidelines configuration endpoint
  app.get("/api/config/brand-guidelines", async (req, res) => {
    try {
      const config = await storage.getTrainingConfiguration();
      res.json(config.brandGuidelines || {});
    } catch (error) {
      console.error("Error fetching brand guidelines:", error);
      res.status(500).json({ error: "Failed to fetch brand guidelines" });
    }
  });
  
  // Copy Frameworks configuration endpoint
  app.get("/api/config/copy-frameworks", async (req, res) => {
    try {
      const config = await storage.getTrainingConfiguration();
      res.json(config.copyFrameworks || {});
    } catch (error) {
      console.error("Error fetching copy frameworks:", error);
      res.status(500).json({ error: "Failed to fetch copy frameworks" });
    }
  });
  
  // Station Prompts configuration endpoint
  app.get("/api/config/station-prompts", async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      const config = await storage.getTrainingConfiguration();
      res.json(config.stationPrompts || {});
    } catch (error) {
      console.error("Error fetching station prompts:", error);
      res.status(500).json({ error: "Failed to fetch station prompts" });
    }
  });

  // Station prompt validation endpoint
  app.post('/api/validate-station-prompts', requireAuth, async (req, res) => {
    try {
      const { AIPromptBuilder } = await import('./services/anthropic-helpers');
      const config = await storage.getTrainingConfiguration();
      
      const validationResults: Record<string, any> = {};
      const stations = Object.keys(STATION_CONFIGS);
      
      for (const station of stations) {
        validationResults[station] = AIPromptBuilder.validateStationPrompt(station, config);
      }
      
      // Overall health check
      const totalStations = stations.length;
      const validStations = Object.values(validationResults).filter((result: any) => result.isValid).length;
      const healthScore = Math.round((validStations / totalStations) * 100);
      
      res.json({
        healthScore,
        validStations,
        totalStations,
        stations: validationResults
      });
    } catch (error) {
      console.error("Error validating station prompts:", error);
      res.status(500).json({ error: "Failed to validate station prompts" });
    }
  });

  // Debug station configuration endpoint
  app.get('/api/debug-station/:stationName', requireAuth, async (req, res) => {
    try {
      const { AIPromptBuilder } = await import('./services/anthropic-helpers');
      const { stationName } = req.params;
      const config = await storage.getTrainingConfiguration();
      
      const debugInfo = AIPromptBuilder.debugStationConfig(stationName, config);
      
      res.json({
        station: stationName,
        debug: debugInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error debugging station ${req.params.stationName}:`, error);
      res.status(500).json({ error: `Failed to debug station ${req.params.stationName}` });
    }
  });
  
  // Model Settings configuration endpoint
  app.get("/api/config/model-settings", async (req, res) => {
    try {
      const config = await storage.getTrainingConfiguration();
      res.json(config.modelParameters || {});
    } catch (error) {
      console.error("Error fetching model settings:", error);
      res.status(500).json({ error: "Failed to fetch model settings" });
    }
  });
  
  // #endregion
}

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

 

  // Generate ad copy endpoint with analytics tracking (protected)
  app.post('/api/generate-ad-copy', requireAuth, async (req, res) => {
    try {
      const startTime = Date.now();
      const { transcription, customBrief, persona, targetAudience, landingPageUrl, brandDrBalance, useJonesBrandGuide, airLink, uploadedImage, selectedProduct, selectedProducts } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      // Get current training config for snapshot
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateAdCopy({
        transcription,
        customBrief,
        persona,
        landingPageUrl,
        brandDrBalance,
        useJonesBrandGuide,
        airLink,
        uploadedImage,
        selectedProduct,
        selectedProducts
      }, trainingConfig);
  
      
      const generationTime = Date.now() - startTime;

      // Save generation to database for analytics
      const userId = (req.session as any).userId;
      const savedCopy = await storage.saveGeneratedCopy({
        userId: userId,
        inputText: transcription || persona || '',
        landingPageUrl: landingPageUrl || null,
        targetPersona: targetAudience || '',
        brandDrBalance: brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
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
        testingFocus: result.testingFocus,
        strategicInsights: result.strategicInsights,
        debugInfo: result.debugInfo,
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
      const { customRequest, persona, brandDrBalance, selectedProduct, selectedProducts, useJonesBrandGuide } = req.body;
      
  
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      if (!customRequest || !customRequest.trim()) {
        return res.status(400).json({ message: 'Custom request is required' });
      }
      
      // Get current training config
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateCustomCopy({
        customRequest: customRequest.trim(),
        persona,
        brandDrBalance,
        selectedProduct,
        selectedProducts,
        useJonesBrandGuide
      }, trainingConfig);
      
      res.json({
        response: result.response,
        debugInfo: result.debugInfo
      });
    } catch (error) {
      console.error('Custom copy generation error:', error);
      res.status(500).json({ error: 'Failed to generate custom copy' });
    }
  });

  // Product Launch Brief generation endpoint (protected)
  app.post('/api/generate-brief', requireAuth, async (req, res) => {
    try {
      const { 
        notes, 
        googleDriveLinks, 
        selectedProduct, 
        selectedProducts, 
        persona, 
        brandDrBalance, 
        useJonesBrandGuide 
      } = req.body;
      
      console.log('Brief generation request:', { 
        notes, 
        googleDriveLinks, 
        selectedProduct, 
        selectedProducts, 
        persona, 
        brandDrBalance 
      });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      if (!notes || !notes.trim()) {
        return res.status(400).json({ message: 'Notes are required for brief generation' });
      }
      
      // Track generation start time
      const startTime = Date.now();
      
      // Get current training config
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateBrief({
        notes: notes.trim(),
        googleDriveLinks: googleDriveLinks || [],
        selectedProduct,
        selectedProducts,
        persona,
        brandDrBalance,
        useJonesBrandGuide
      }, trainingConfig);
      
      // Calculate generation time
      const generationTimeMs = Date.now() - startTime;
      
      // Save the brief to database for model improvement
      let briefId = null;
      try {
        const [insertedBrief] = await db.insert(productBriefs).values({
          userId: (req.session as any)?.userId || 'demo-user',
          notes: notes.trim(),
          googleDriveLinks: googleDriveLinks || [],
          generatedBrief: result.brief,
          configSnapshot: trainingConfig,
          generationTimeMs,
          tokensUsed: null
        }).returning({ id: productBriefs.id });
        
        briefId = insertedBrief.id;
        console.log('Brief saved to database for training improvement:', briefId);
      } catch (dbError) {
        console.error('Failed to save brief to database:', dbError);
        // Don't fail the request if database save fails
      }
      
      res.json({
        brief: result.brief,
        briefId: briefId,
        metadata: result.metadata
      });
    } catch (error) {
      console.error('Brief generation error:', error);
      res.status(500).json({ error: 'Failed to generate product launch brief' });
    }
  });

  // Brief feedback endpoint for model improvement (protected)
  app.post('/api/brief-feedback', requireAuth, async (req, res) => {
    try {
      const { briefId, rating, feedback, wasEdited, finalVersion } = req.body;
      
      if (!briefId) {
        return res.status(400).json({ message: 'Brief ID is required' });
      }
      
      // Update the brief with feedback data
      await db.update(productBriefs)
        .set({ 
          rating: rating || null,
          feedback: feedback || null,
          wasEdited: wasEdited ? 'true' : 'false',
          finalVersion: finalVersion || null,
          updatedAt: new Date()
        })
        .where(eq(productBriefs.id, briefId));
      
      console.log('Brief feedback saved:', { briefId, rating, hasCustomFeedback: !!feedback });
      
      res.json({ success: true, message: 'Feedback saved successfully' });
    } catch (error) {
      console.error('Brief feedback error:', error);
      res.status(500).json({ error: 'Failed to save brief feedback' });
    }
  });

  // Generate retention copy endpoint (protected)
  app.post('/api/generate-retention-email', requireAuth, async (req, res) => {
    try {
      const { 
        keyMessage,
        emailType,
        selectedProducts,
        audience, 
        goal, 
        campaignType, 
        contentLength, 
        keywordsToInclude, 
        wordsToAvoid,
        persona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      } = req.body;

      if (!process.env.ANTHROPIC_API_KEY || !keyMessage?.trim()) {
        return res.status(400).json({ error: 'Missing required parameters.' });
      }

      const trainingConfig = await getTrainingConfig();
      const frameworks = await storage.getAllEmailFrameworks();
      const selectedFramework = emailType ? frameworks.find(f => f.displayName === emailType) : null;
      
      const result = await generateRetentionEmail({
        keyMessage: keyMessage.trim(),
        emailType,
        selectedFramework,
        selectedProducts,
        audience,
        goal,
        campaignType,
        contentLength,
        keywordsToInclude,
        wordsToAvoid,
        persona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      }, trainingConfig);

      res.status(200).json(result);
    } catch (error) {
      console.error('Email retention copy generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate email retention copy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/generate-retention-sms', requireAuth, async (req, res) => {
    try {
      const { 
        keyMessage,
        selectedProducts,
        audience, 
        goal, 
        campaignType, 
        contentLength, 
        keywordsToInclude, 
        wordsToAvoid,
        persona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY || !keyMessage?.trim()) {
        return res.status(400).json({ error: 'Missing required parameters.' });
      }

      const trainingConfig = await getTrainingConfig();
      const result = await generateRetentionSms({
        keyMessage: keyMessage.trim(),
        selectedProducts,
        audience,
        goal,
        campaignType,
        contentLength,
        keywordsToInclude,
        wordsToAvoid,
        persona,
        brandDrBalance,
        selectedProduct,
        useJonesBrandGuide
      }, trainingConfig);

      res.status(200).json(result);
    } catch (error) {
      console.error('SMS retention copy generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate SMS retention copy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate retention copy visual preview endpoint (protected)
  app.post('/api/generate-retention-visual-preview', requireAuth, async (req, res) => {
    try {
      const { 
        copyContent,
        platform,
        emailType,
        selectedFramework
      } = req.body;
      
      console.log('Retention visual preview request:', { platform, emailType, copyContentLength: copyContent?.length });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      if (!copyContent?.trim()) {
        return res.status(400).json({ message: 'Copy content is required' });
      }
      
      if (!platform) {
        return res.status(400).json({ message: 'Platform is required' });
      }
      
      // Get current training config for framework images
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateRetentionVisualPreview({
        copyContent: copyContent.trim(),
        platform,
        emailType,
        selectedFramework
      }, trainingConfig);
      
      res.status(200).json({
        htmlContent: result.htmlContent,
        platform: result.platform,
        emailType: result.emailType
      });
    } catch (error) {
      console.error('Retention visual preview generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate visual preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate social captions endpoint (protected)
  app.post('/api/generate-social-captions', requireAuth, async (req, res) => {
    try {
      const { 
        contentType, 
        transcription, 
        platform, 
        goal, 
        tone, 
        variations, 
        selectedProduct,
        selectedProducts,
        imageData, // Add image data parameter
        persona // Add persona parameter
      } = req.body;
      
      console.log('Social captions request:', { contentType, platform, goal, tone, variations, selectedProduct, persona, transcriptionLength: transcription?.length, hasImageData: !!imageData });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      // Updated validation: require either transcription OR image data
      if (!transcription?.trim() && !imageData) {
        return res.status(400).json({ message: 'Content transcription or image is required' });
      }
      
      // Get current training config
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateSocialCaptions({
        contentType: contentType || DEFAULT_CONTENT_TYPE,
        transcription: transcription?.trim() || '',
        platform: platform || DEFAULT_SOCIAL_PLATFORM,
        goal: goal || DEFAULT_SOCIAL_GOAL,
        tone: tone || DEFAULT_TONE,
        variations: variations || DEFAULT_VARIATIONS,
        selectedProduct: selectedProduct,
        selectedProducts: selectedProducts,
    persona: persona || DEFAULT_PERSONA_KEY, // Use persona from request, fallback to default
        imageData: imageData // Pass image data to the function
      }, trainingConfig);
      
      res.json({
        captions: result?.captions || [],
        strategicInsights: result?.strategicInsights || '',
        debugInfo: result?.debugInfo
      });
    } catch (error) {
      console.error('Social captions generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate social captions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate story sequence endpoint (protected)
  app.post('/api/generate-story-sequence', requireAuth, async (req, res) => {
    try {
      const { 
        contentType, 
        transcription, 
        sequenceType, 
        length, 
        tone, 
        selectedProduct,
        selectedProducts,
        imageData, // Add image data parameter
        persona // Add persona parameter
      } = req.body;
      
  
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      // Updated validation: require either transcription OR image data
      if (!transcription?.trim() && !imageData) {
        return res.status(400).json({ message: 'Content transcription or image is required' });
      }
      
      // Get current training config
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateStorySequence({
        contentType: contentType || DEFAULT_CONTENT_TYPE,
        transcription: transcription?.trim() || '',
        sequenceType: sequenceType || DEFAULT_SEQUENCE_TYPE,
        length: length || DEFAULT_STORY_LENGTH,
        tone: tone || DEFAULT_TONE,
        selectedProduct: selectedProduct,
        selectedProducts: selectedProducts,
    persona: persona || DEFAULT_PERSONA_KEY, // Use persona from request, fallback to default
        imageData: imageData // Pass image data to the function
      }, trainingConfig);
      
      res.json({
        sequence: result?.sequence || [],
        debugInfo: result?.debugInfo
      });
    } catch (error) {
      console.error('Story sequence generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate story sequence',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Static ad analysis endpoint (protected)
  app.post('/api/analyze-static-ad', requireAuth, async (req, res) => {
    try {
      const { staticAdImage, persona, brandDrBalance, selectedProduct, selectedProducts, useJonesBrandGuide, outputFormat, analysisFocus } = req.body;
      
      console.log('Static ad analysis request:', { persona, brandDrBalance, selectedProduct, useJonesBrandGuide, outputFormat, analysisFocus, imageLength: staticAdImage?.length });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      if (!staticAdImage) {
        return res.status(400).json({ message: 'Static ad image is required' });
      }
      
      // Get current training config
      const trainingConfig = await getTrainingConfig();
      
      const result = await analyzeStaticAd({
        staticAdImage,
        persona: persona || DEFAULT_PERSONA_KEY,
        brandDrBalance: brandDrBalance || DEFAULT_BRAND_DR_BALANCE,
        selectedProduct: selectedProduct || undefined,
        selectedProducts: selectedProducts || [],
        useJonesBrandGuide,
        outputFormat,
        analysisFocus
      }, trainingConfig);
      
      res.json({
        analysis: result.analysis,
        variations: result.variations || [],
        rawResponse: result.rawResponse, // For debug purposes
        debugInfo: result.debugInfo // Include debug information
      });
    } catch (error) {
      console.error('Static ad analysis error:', error);
      
      // Provide more specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Image processing failed')) {
          return res.status(400).json({ 
            message: 'Image too large or invalid format. Please try uploading a smaller image (under 10MB) or a different format.',
            details: error.message
          });
        }
        if (error.message.includes('image exceeds')) {
          return res.status(400).json({ 
            message: 'Image file size exceeds the maximum allowed limit. Please compress your image and try again.',
            details: error.message
          });
        }
      }
      
      res.status(500).json({ message: 'Failed to analyze static ad' });
    }
  });

  // Generate landing page copy endpoint (protected)
  app.post('/api/generate-landing-copy', requireAuth, async (req, res) => {
    try {
      const { landingPageType, productBrief, persona, useAdsContent, adsContent, brandDrBalance, selectedProduct, selectedProducts, mainAngle, transcription } = req.body;
      
      console.log('Landing copy request body:', { landingPageType, productBrief, persona, useAdsContent, adsContent, brandDrBalance, selectedProduct, mainAngle, transcription: transcription ? 'included' : 'none' });
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      // Get current training config
      const trainingConfig = await getTrainingConfig();
      
      const result = await generateLandingPageCopy({
        landingPageType,
        productBrief,
        persona,
        useAdsContent,
        adsContent,
        brandDrBalance,
        selectedProduct,
        selectedProducts,
        mainAngle,
        transcription
      }, trainingConfig);
      
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
          socialProof: result.socialProof,
          conclusion: result.conclusion,
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
        debugInfo: result.debugInfo // For debug purposes
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

      const { originalContent, revisionInstructions, contentType, context } = revisionSchema.parse(req.body);
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }

      // Get training configuration from database
      const trainingConfig = await storage.getTrainingConfiguration();
      if (!trainingConfig) {
        return res.status(500).json({ message: 'Training configuration not found' });
      }

      // Import and use revision function from anthropic module
      // reviseContent is now imported at the top
      
      const revisedContent = await reviseContent({
        originalContent,
        revisionInstructions,
        contentType,
        context
      }, trainingConfig);
      
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

  // Update generated copy content (protected)
  app.put('/api/generated-copy/:id', requireAuth, async (req, res) => {
    try {
      const updateSchema = z.object({
        headlines: z.array(z.object({
          framework: z.string(),
          copy: z.string()
        })).optional(),
        primaryText: z.string().optional(),
      });

      const { headlines, primaryText } = updateSchema.parse(req.body);
      const copyId = req.params.id;
      
      if (!headlines && !primaryText) {
        return res.status(400).json({ message: 'At least one field (headlines or primaryText) must be provided' });
      }
      
      const updatedCopy = await storage.updateGeneratedCopy(copyId, {
        headlines,
        primaryText
      });
      
      res.json({ 
        message: 'Copy updated successfully',
        copy: updatedCopy
      });
    } catch (error) {
      console.error('Update copy error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid copy data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update copy' });
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

      const data = generationSchema.parse(req.body);
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }

      // Get brand guidelines from training config
      const trainingConfig = await getTrainingConfig();
      
      // Create prompt for influencer-style copy generation
      const prompt = `
Product: ${data.selectedProduct || `${BRAND_NAME} products`}
Transcription: ${data.transcription || ''}
Custom Brief: ${data.customBrief || ''}
Target Persona: ${data.persona}
Landing Page: ${data.landingPageUrl || 'None provided'}
`;

      const result = await generateInfluencerStyleCopy(
        prompt,
        data.voiceProfile,
        trainingConfig?.brandGuidelines,
        data.influencerBrandBalance[0] || DEFAULT_BRAND_DR_BALANCE
      );

      const userId = (req.session as any).userId;
      const savedCopy = await storage.saveGeneratedCopy({
        userId: userId,
        inputText: data.transcription || data.persona || '',
        landingPageUrl: data.landingPageUrl || null,
        targetPersona: data.targetAudience || '',
        brandDrBalance: data.brandDrBalance?.[0] || DEFAULT_BRAND_DR_BALANCE,
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
          balanceUsed: data.influencerBrandBalance[0] || DEFAULT_BRAND_DR_BALANCE,
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
  registerReviewRoutes(app);
  
  // Register Junip API routes
  registerJunipRoutes(app);
  
  // Register admin routes
  registerAdminRoutes(app);

  registerConfigRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
