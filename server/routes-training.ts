import type { Express } from "express";
import { type TrainingConfig } from '@shared/training-config';
import { promises as fs } from 'fs';
import path from 'path';
import { storage } from './storage';

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
    try {
      const updatedConfig = req.body as TrainingConfig;
      
      // Validate the config structure (basic validation)
      if (!updatedConfig || typeof updatedConfig !== 'object') {
        return res.status(400).json({ message: "Invalid configuration format" });
      }

      // Sanitize arrays to remove null/undefined/empty values
      if (updatedConfig.brandGuidelines) {
        const { brandGuidelines } = updatedConfig;
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
}