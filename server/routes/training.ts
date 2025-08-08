import type { Express } from "express";
import { type TrainingConfig } from '@shared/training-config';
import { promises as fs } from 'fs';
import path from 'path';
import { storage } from '../utils/storage';

const TRAINING_CONFIG_PATH = path.join(process.cwd(), 'shared', 'training-config.ts');

// Export function to get training config for use in other routes
export async function getTrainingConfig(): Promise<TrainingConfig> {
  try {
    // Get configuration from database only - no fallback
    const dbConfig = await storage.getTrainingConfiguration();
    
    // Validate that we have essential configuration
    if (!dbConfig || typeof dbConfig !== 'object') {
      throw new Error('Invalid configuration structure returned from database');
    }
    
    return dbConfig;
  } catch (error) {
    console.error('Failed to load config from database:', error);
    throw new Error('Configuration must be loaded from database. Please ensure database is properly set up and contains configuration data.');
  }
}

// Routes for managing training configuration
export function registerTrainingRoutes(app: Express, requireAdmin: any) {
  // Get current training configuration (now uses database)
  app.get('/api/training-config', requireAdmin, async (req, res) => {
    try {
      const config = await getTrainingConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching training config:", error);
      res.status(500).json({ message: "Failed to fetch training configuration" });
    }
  });

  // Update training configuration
  app.post('/api/training-config', requireAdmin, async (req, res) => {
    // Increase timeout for large training configurations
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
    
    try {
      const updatedConfig = req.body as TrainingConfig;
      
      // Validate the config structure (basic validation)
      if (!updatedConfig || typeof updatedConfig !== 'object') {
        return res.status(400).json({ message: "Invalid configuration format" });
      }

      // Sanitize arrays to remove null/undefined/empty values
      if (updatedConfig.brandGuidelines) {
        const { brandGuidelines } = updatedConfig;
        // Normalize simple identity fields
        if (brandGuidelines.brandName !== undefined && brandGuidelines.brandName !== null) {
          brandGuidelines.brandName = String(brandGuidelines.brandName);
        }
        if (brandGuidelines.website !== undefined && brandGuidelines.website !== null) {
          brandGuidelines.website = String(brandGuidelines.website);
        }
        if (brandGuidelines.brandVoice) {
          brandGuidelines.brandVoice = brandGuidelines.brandVoice.filter(item => item && item.trim() !== '');
        }
        if (brandGuidelines.keyTerminology) {
          brandGuidelines.keyTerminology = brandGuidelines.keyTerminology.filter(item => item && item.trim() !== '');
        }
        if (brandGuidelines.approvedLanguage) {
          brandGuidelines.approvedLanguage = brandGuidelines.approvedLanguage.filter(item => item && item.trim() !== '');
        }
        if (brandGuidelines.avoidedLanguage) {
          brandGuidelines.avoidedLanguage = brandGuidelines.avoidedLanguage.filter(item => item && item.trim() !== '');
        }
      }

      // Sanitize product claims
      if (updatedConfig.productClaims) {
        for (const productName in updatedConfig.productClaims) {
          const product = updatedConfig.productClaims[productName];
          if (product.approvedClaims) {
            product.approvedClaims = product.approvedClaims.filter(claim => claim && claim.trim() !== '');
          }
          if (product.prohibitedClaims) {
            product.prohibitedClaims = product.prohibitedClaims.filter(claim => claim && claim.trim() !== '');
          }
        }
      }

      // Sanitize persona pillars
      if (updatedConfig.personaPillars) {
        for (const personaName in updatedConfig.personaPillars) {
          const persona = updatedConfig.personaPillars[personaName];
          if (persona.pillars) {
            persona.pillars = persona.pillars.filter(pillar => pillar && pillar.trim() !== '');
          }
        }
      }

      // Sanitize copy frameworks
      if (updatedConfig.copyFrameworks) {
        const { copyFrameworks } = updatedConfig;
        if (copyFrameworks.primaryTextRules) {
          copyFrameworks.primaryTextRules = copyFrameworks.primaryTextRules.filter(rule => rule && rule.trim() !== '');
        }
        if (copyFrameworks.brandDrBalance?.brandFirst) {
          copyFrameworks.brandDrBalance.brandFirst = copyFrameworks.brandDrBalance.brandFirst.filter(rule => rule && rule.trim() !== '');
        }
        if (copyFrameworks.brandDrBalance?.directResponse) {
          copyFrameworks.brandDrBalance.directResponse = copyFrameworks.brandDrBalance.directResponse.filter(rule => rule && rule.trim() !== '');
        }
      }

      console.log('DEBUG: About to save training config:', {
        hasEmailFrameworks: !!updatedConfig.copyFrameworks?.emailFrameworks,
        emailFrameworksCount: updatedConfig.copyFrameworks?.emailFrameworks?.length || 0,
        frameworksWithImages: updatedConfig.copyFrameworks?.emailFrameworks?.filter(fw => fw.images && fw.images.length > 0).length || 0
      });
      
      // Log each framework with images
      if (updatedConfig.copyFrameworks?.emailFrameworks) {
        updatedConfig.copyFrameworks.emailFrameworks.forEach((fw, index) => {
          if (fw.images && fw.images.length > 0) {
            console.log(`DEBUG: Framework ${index} (${fw.displayName || fw.name}) has ${fw.images.length} images:`, 
              fw.images.map(img => ({ id: img.id, name: img.name, hasDataUri: !!img.dataUri }))
            );
          }
        });
      }

      await storage.saveTrainingConfiguration(updatedConfig);
      
      res.json({ message: "Training configuration updated successfully" });
    } catch (error) {
      console.error("Error updating training config:", error);
      res.status(500).json({ message: "Failed to update training configuration" });
    }
  });

  // Partial update: Brand Guidelines
  app.post('/api/training-config/brand-guidelines', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { brandGuidelines } = req.body as Partial<TrainingConfig>;
      if (!brandGuidelines || typeof brandGuidelines !== 'object') {
        return res.status(400).json({ message: 'Invalid brand guidelines payload' });
      }

      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = { ...currentConfig, brandGuidelines } as TrainingConfig;

      // Sanitize arrays
      if (updatedConfig.brandGuidelines) {
        const { brandGuidelines } = updatedConfig;
        if (brandGuidelines.brandName !== undefined && brandGuidelines.brandName !== null) {
          brandGuidelines.brandName = String(brandGuidelines.brandName);
        }
        if (brandGuidelines.website !== undefined && brandGuidelines.website !== null) {
          brandGuidelines.website = String(brandGuidelines.website);
        }
        if (brandGuidelines.brandVoice) {
          brandGuidelines.brandVoice = brandGuidelines.brandVoice.filter(item => item && item.trim() !== '');
        }
        if (brandGuidelines.keyTerminology) {
          brandGuidelines.keyTerminology = brandGuidelines.keyTerminology.filter(item => item && item.trim() !== '');
        }
        if (brandGuidelines.approvedLanguage) {
          brandGuidelines.approvedLanguage = brandGuidelines.approvedLanguage.filter(item => item && item.trim() !== '');
        }
        if (brandGuidelines.avoidedLanguage) {
          brandGuidelines.avoidedLanguage = brandGuidelines.avoidedLanguage.filter(item => item && item.trim() !== '');
        }
      }

      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Brand guidelines updated successfully' });
    } catch (error) {
      console.error('Error updating brand guidelines:', error);
      res.status(500).json({ message: 'Failed to update brand guidelines' });
    }
  });

  // Partial update: Product Claims (bulk for the tab)
  app.post('/api/training-config/product-claims', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { productClaims } = req.body as Partial<TrainingConfig>;
      if (!productClaims || typeof productClaims !== 'object') {
        return res.status(400).json({ message: 'Invalid product claims payload' });
      }

      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = { ...currentConfig, productClaims } as TrainingConfig;

      // Sanitize product claims
      if (updatedConfig.productClaims) {
        for (const productName in updatedConfig.productClaims) {
          const product = updatedConfig.productClaims[productName];
          if (product.approvedClaims) {
            product.approvedClaims = product.approvedClaims.filter(claim => claim && claim.trim() !== '');
          }
          if (product.prohibitedClaims) {
            product.prohibitedClaims = product.prohibitedClaims.filter(claim => claim && claim.trim() !== '');
          }
        }
      }

      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Product claims updated successfully' });
    } catch (error) {
      console.error('Error updating product claims:', error);
      res.status(500).json({ message: 'Failed to update product claims' });
    }
  });

  // Partial update: Product Claims for a single product
  app.post('/api/training-config/product-claims/:productKey', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { productKey } = req.params as { productKey: string };
      const productData = req.body;
      if (!productKey || typeof productData !== 'object') {
        return res.status(400).json({ message: 'Invalid product claims payload' });
      }

      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = {
        ...currentConfig,
        productClaims: {
          ...(currentConfig.productClaims || {}),
          [productKey]: productData,
        },
      } as TrainingConfig;

      // Sanitize that product's claims
      const product = updatedConfig.productClaims?.[productKey];
      if (product) {
        if (product.approvedClaims) {
          product.approvedClaims = product.approvedClaims.filter((claim: string) => claim && claim.trim() !== '');
        }
        if (product.prohibitedClaims) {
          product.prohibitedClaims = product.prohibitedClaims.filter((claim: string) => claim && claim.trim() !== '');
        }
      }

      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Product claims (single) updated successfully' });
    } catch (error) {
      console.error('Error updating product claims (single):', error);
      res.status(500).json({ message: 'Failed to update product claims' });
    }
  });

  // Partial update: Persona Pillars (entire map)
  app.post('/api/training-config/persona-pillars', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { personaPillars } = req.body as Partial<TrainingConfig>;
      if (!personaPillars || typeof personaPillars !== 'object') {
        return res.status(400).json({ message: 'Invalid persona pillars payload' });
      }
      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = { ...currentConfig, personaPillars } as TrainingConfig;

      // Sanitize pillars arrays
      for (const name in updatedConfig.personaPillars || {}) {
        const persona = (updatedConfig.personaPillars as any)[name];
        if (persona?.pillars) {
          persona.pillars = persona.pillars.filter((p: string) => p && p.trim() !== '');
        }
      }

      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Persona pillars updated successfully' });
    } catch (error) {
      console.error('Error updating persona pillars:', error);
      res.status(500).json({ message: 'Failed to update persona pillars' });
    }
  });

  // Partial update: Single Persona Pillars
  app.post('/api/training-config/persona-pillars/:personaName', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { personaName } = req.params as { personaName: string };
      const personaData = req.body;
      if (!personaName || typeof personaData !== 'object') {
        return res.status(400).json({ message: 'Invalid persona payload' });
      }

      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = {
        ...currentConfig,
        personaPillars: {
          ...(currentConfig.personaPillars || {}),
          [personaName]: personaData,
        },
      } as TrainingConfig;

      const persona = updatedConfig.personaPillars?.[personaName] as any;
      if (persona?.pillars) {
        persona.pillars = persona.pillars.filter((p: string) => p && p.trim() !== '');
      }

      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Persona updated successfully' });
    } catch (error) {
      console.error('Error updating persona:', error);
      res.status(500).json({ message: 'Failed to update persona' });
    }
  });

  // Partial update: Model Parameters
  app.post('/api/training-config/model-parameters', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { modelParameters } = req.body as Partial<TrainingConfig>;
      if (!modelParameters || typeof modelParameters !== 'object') {
        return res.status(400).json({ message: 'Invalid model parameters payload' });
      }

      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = { ...currentConfig, modelParameters } as TrainingConfig;

      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Model parameters updated successfully' });
    } catch (error) {
      console.error('Error updating model parameters:', error);
      res.status(500).json({ message: 'Failed to update model parameters' });
    }
  });

  // Partial update: Station Prompts (entire tab or per-station)
  app.post('/api/training-config/station-prompts', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { stationPrompts } = req.body as Partial<TrainingConfig>;
      if (!stationPrompts || typeof stationPrompts !== 'object') {
        return res.status(400).json({ message: 'Invalid station prompts payload' });
      }
      const currentConfig = await getTrainingConfig();
      const deepMerge = (target: any, source: any): any => {
        if (Array.isArray(source) || Array.isArray(target)) {
          return source; // arrays: replace
        }
        if (typeof target !== 'object' || target === null) return source;
        if (typeof source !== 'object' || source === null) return source;
        const result: any = { ...target };
        for (const key of Object.keys(source)) {
          const srcVal = (source as any)[key];
          const tgtVal = (target as any)[key];
          result[key] = deepMerge(tgtVal, srcVal);
        }
        return result;
      };

      const mergedStations: any = { ...(currentConfig as any).stationPrompts };
      for (const stationKey of Object.keys(stationPrompts)) {
        const incoming = (stationPrompts as any)[stationKey] || {};
        const existing = (currentConfig as any).stationPrompts?.[stationKey] || {};
        mergedStations[stationKey] = deepMerge(existing, incoming);
      }
      const updatedConfig: TrainingConfig = {
        ...currentConfig,
        stationPrompts: mergedStations
      } as TrainingConfig;
      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Station prompts updated successfully' });
    } catch (error) {
      console.error('Error updating station prompts:', error);
      res.status(500).json({ message: 'Failed to update station prompts' });
    }
  });

  // Partial update: Copy Frameworks (safe to send only copyFrameworks section)
  app.post('/api/training-config/copy-frameworks', requireAdmin, async (req, res) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    try {
      const { copyFrameworks } = req.body as Partial<TrainingConfig>;
      if (!copyFrameworks || typeof copyFrameworks !== 'object') {
        return res.status(400).json({ message: 'Invalid copy frameworks payload' });
      }
      const currentConfig = await getTrainingConfig();
      const updatedConfig: TrainingConfig = {
        ...currentConfig,
        copyFrameworks: { ...(currentConfig as any).copyFrameworks, ...copyFrameworks }
      } as TrainingConfig;
      await storage.saveTrainingConfiguration(updatedConfig);
      res.json({ message: 'Copy frameworks updated successfully' });
    } catch (error) {
      console.error('Error updating copy frameworks:', error);
      res.status(500).json({ message: 'Failed to update copy frameworks' });
    }
  });
}