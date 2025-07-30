// API routes for database-driven configuration management
import { Router } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { insertProductSchema, insertProductClaimSchema, insertPersonaSchema, insertPersonaPillarSchema, insertBrandConfigurationSchema, insertCopyFrameworkSchema } from "@shared/schema";

const router = Router();

// Training configuration endpoint - replaces hardcoded config
router.get("/api/training-config", async (req, res) => {
  try {
    const config = await storage.getTrainingConfiguration();
    res.json(config);
  } catch (error) {
    console.error("Error fetching training configuration:", error);
    res.status(500).json({ error: "Failed to fetch training configuration" });
  }
});

// Products endpoints
router.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/api/products/active", async (req, res) => {
  try {
    const products = await storage.getActiveProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching active products:", error);
    res.status(500).json({ error: "Failed to fetch active products" });
  }
});

router.post("/api/products", async (req, res) => {
  try {
    const data = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(data);
    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: "Failed to create product" });
  }
});

router.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(id, data);
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ error: "Failed to update product" });
  }
});

router.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteProduct(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(400).json({ error: "Failed to delete product" });
  }
});

// Product claims endpoints
router.get("/api/products/:productId/claims", async (req, res) => {
  try {
    const { productId } = req.params;
    const claims = await storage.getProductClaims(productId);
    res.json(claims);
  } catch (error) {
    console.error("Error fetching product claims:", error);
    res.status(500).json({ error: "Failed to fetch product claims" });
  }
});

router.post("/api/products/:productId/claims", async (req, res) => {
  try {
    const { productId } = req.params;
    const data = insertProductClaimSchema.parse({ ...req.body, productId });
    const claim = await storage.createProductClaim(data);
    res.json(claim);
  } catch (error) {
    console.error("Error creating product claim:", error);
    res.status(400).json({ error: "Failed to create product claim" });
  }
});

router.put("/api/product-claims/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertProductClaimSchema.partial().parse(req.body);
    const claim = await storage.updateProductClaim(id, data);
    res.json(claim);
  } catch (error) {
    console.error("Error updating product claim:", error);
    res.status(400).json({ error: "Failed to update product claim" });
  }
});

router.delete("/api/product-claims/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteProductClaim(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product claim:", error);
    res.status(400).json({ error: "Failed to delete product claim" });
  }
});

// Personas endpoints
router.get("/api/personas", async (req, res) => {
  try {
    const personas = await storage.getAllPersonas();
    res.json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ error: "Failed to fetch personas" });
  }
});

router.get("/api/personas/active", async (req, res) => {
  try {
    const personas = await storage.getActivePersonas();
    res.json(personas);
  } catch (error) {
    console.error("Error fetching active personas:", error);
    res.status(500).json({ error: "Failed to fetch active personas" });
  }
});

router.post("/api/personas", async (req, res) => {
  try {
    const data = insertPersonaSchema.parse(req.body);
    const persona = await storage.createPersona(data);
    res.json(persona);
  } catch (error) {
    console.error("Error creating persona:", error);
    res.status(400).json({ error: "Failed to create persona" });
  }
});

router.put("/api/personas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertPersonaSchema.partial().parse(req.body);
    const persona = await storage.updatePersona(id, data);
    res.json(persona);
  } catch (error) {
    console.error("Error updating persona:", error);
    res.status(400).json({ error: "Failed to update persona" });
  }
});

router.delete("/api/personas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deletePersona(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting persona:", error);
    res.status(400).json({ error: "Failed to delete persona" });
  }
});

// Persona pillars endpoints
router.get("/api/personas/:personaId/pillars", async (req, res) => {
  try {
    const { personaId } = req.params;
    const pillars = await storage.getPersonaPillars(personaId);
    res.json(pillars);
  } catch (error) {
    console.error("Error fetching persona pillars:", error);
    res.status(500).json({ error: "Failed to fetch persona pillars" });
  }
});

router.post("/api/personas/:personaId/pillars", async (req, res) => {
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

router.put("/api/persona-pillars/:id", async (req, res) => {
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

router.delete("/api/persona-pillars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deletePersonaPillar(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting persona pillar:", error);
    res.status(400).json({ error: "Failed to delete persona pillar" });
  }
});

// Brand configuration endpoints
router.get("/api/brand-configuration", async (req, res) => {
  try {
    const config = await storage.getBrandConfiguration();
    res.json(config);
  } catch (error) {
    console.error("Error fetching brand configuration:", error);
    res.status(500).json({ error: "Failed to fetch brand configuration" });
  }
});

router.get("/api/brand-configuration/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const config = await storage.getBrandConfigurationByType(type);
    res.json(config);
  } catch (error) {
    console.error("Error fetching brand configuration by type:", error);
    res.status(500).json({ error: "Failed to fetch brand configuration by type" });
  }
});

router.post("/api/brand-configuration", async (req, res) => {
  try {
    const data = insertBrandConfigurationSchema.parse(req.body);
    const config = await storage.createBrandConfiguration(data);
    res.json(config);
  } catch (error) {
    console.error("Error creating brand configuration:", error);
    res.status(400).json({ error: "Failed to create brand configuration" });
  }
});

router.put("/api/brand-configuration/:id", async (req, res) => {
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

router.delete("/api/brand-configuration/:id", async (req, res) => {
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
router.get("/api/copy-frameworks", async (req, res) => {
  try {
    const frameworks = await storage.getCopyFrameworks();
    res.json(frameworks);
  } catch (error) {
    console.error("Error fetching copy frameworks:", error);
    res.status(500).json({ error: "Failed to fetch copy frameworks" });
  }
});

router.get("/api/copy-frameworks/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const frameworks = await storage.getCopyFrameworksByType(type);
    res.json(frameworks);
  } catch (error) {
    console.error("Error fetching copy frameworks by type:", error);
    res.status(500).json({ error: "Failed to fetch copy frameworks by type" });
  }
});

router.post("/api/copy-frameworks", async (req, res) => {
  try {
    const data = insertCopyFrameworkSchema.parse(req.body);
    const framework = await storage.createCopyFramework(data);
    res.json(framework);
  } catch (error) {
    console.error("Error creating copy framework:", error);
    res.status(400).json({ error: "Failed to create copy framework" });
  }
});

router.put("/api/copy-frameworks/:id", async (req, res) => {
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

router.delete("/api/copy-frameworks/:id", async (req, res) => {
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
router.get("/api/system-configuration", async (req, res) => {
  try {
    const config = await storage.getSystemConfiguration();
    res.json(config);
  } catch (error) {
    console.error("Error fetching system configuration:", error);
    res.status(500).json({ error: "Failed to fetch system configuration" });
  }
});

router.get("/api/system-configuration/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const value = await storage.getSystemConfigValue(key);
    res.json({ key, value });
  } catch (error) {
    console.error("Error fetching system configuration value:", error);
    res.status(500).json({ error: "Failed to fetch system configuration value" });
  }
});

router.post("/api/system-configuration", async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const config = await storage.setSystemConfigValue(key, value, description);
    res.json(config);
  } catch (error) {
    console.error("Error setting system configuration value:", error);
    res.status(400).json({ error: "Failed to set system configuration value" });
  }
});

// Get personas from database
router.get('/personas', async (req, res) => {
  try {
    // For now, return empty object - personas will be loaded via main config endpoint
    // TODO: Add specific personas table/field when database schema is ready
    res.json({});
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ error: 'Failed to fetch personas' });
  }
});

// Get products from database
router.get('/products', async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    const productMap = products.reduce((acc, product) => {
      // Use display name as key, converting to lowercase with hyphens
      const key = product.displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      acc[key] = {
        id: product.id,
        name: product.name,
        displayName: product.displayName,
        description: product.description,
        isActive: product.isActive
      };
      return acc;
    }, {} as Record<string, any>);
    
    // If no products in database, return fallback structure
    if (Object.keys(productMap).length === 0) {
      res.json({
        'miracle-balm': { name: 'Miracle Balm', description: 'Multi-use balm' },
        'foundation': { name: 'What The Foundation', description: 'Serum foundation' },
        'tinted-moisturizer': { name: 'Tinted Moisturizer', description: 'Light coverage' },
        'hero-kit': { name: 'Hero Kit', description: 'Essential products' },
        'sunscreen': { name: 'What The SPF', description: 'Daily sunscreen' },
        'mascara': { name: 'What The Mascara', description: 'Natural mascara' },
        'lip-stick': { name: 'Lip Stick', description: 'Multi-use lip color' },
        'face-pencil': { name: 'Face Pencil', description: 'Versatile pencil' },
        'cleanser': { name: 'Cleanser', description: 'Gentle cleanser' },
        'serum': { name: 'Serum', description: 'Nourishing serum' },
        'eye-cream': { name: 'Eye Cream', description: 'Eye treatment' },
        'bronzer': { name: 'Bronzer', description: 'Natural bronzer' }
      });
    } else {
      res.json(productMap);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;