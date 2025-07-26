import type { Express } from "express";
import { defaultTrainingConfig, type TrainingConfig } from '@shared/training-config';
import { promises as fs } from 'fs';
import path from 'path';

const TRAINING_CONFIG_PATH = path.join(process.cwd(), 'shared', 'training-config.ts');

// Routes for managing training configuration
export function registerTrainingRoutes(app: Express) {
  // Get current training configuration
  app.get('/api/training-config', async (req, res) => {
    try {
      res.json(defaultTrainingConfig);
    } catch (error) {
      console.error("Error fetching training config:", error);
      res.status(500).json({ message: "Failed to fetch training configuration" });
    }
  });

  // Update training configuration
  app.post('/api/training-config', async (req, res) => {
    try {
      const updatedConfig: TrainingConfig = req.body;
      
      // Validate the config structure (basic validation)
      if (!updatedConfig.brandGuidelines || !updatedConfig.copyFrameworks || !updatedConfig.systemPrompts) {
        return res.status(400).json({ message: "Invalid configuration structure" });
      }

      // Read the current file
      const fileContent = await fs.readFile(TRAINING_CONFIG_PATH, 'utf-8');
      
      // Generate the new configuration object
      const newConfigString = `// Training configuration for Claude AI copywriting prompts
// This file contains all the brand guidelines, frameworks, and prompts used to train the AI

export interface TrainingConfig {
  brandGuidelines: {
    corePositioning: string;
    brandVoice: string[];
    keyTerminology: string[];
    approvedLanguage: string[];
    avoidedLanguage: string[];
  };
  copyFrameworks: {
    headlineFrameworks: Array<{
      name: string;
      description: string;
      template: string;
      examples: string[];
    }>;
    primaryTextRules: string[];
    brandDrBalance: {
      brandFirst: string[];
      directResponse: string[];
    };
  };
  systemPrompts: {
    adCopyGeneration: string;
    landingPageGeneration: string;
  };
  userPromptTemplates: {
    adCopy: string;
    landingPage: string;
  };
  modelParameters: {
    model: string;
    maxTokens: number;
    temperature?: number;
  };
}

export const defaultTrainingConfig: TrainingConfig = ${JSON.stringify(updatedConfig, null, 2)};`;

      // Write the updated file
      await fs.writeFile(TRAINING_CONFIG_PATH, newConfigString, 'utf-8');
      
      res.json({ message: "Training configuration updated successfully" });
    } catch (error) {
      console.error("Error updating training config:", error);
      res.status(500).json({ message: "Failed to update training configuration" });
    }
  });
}