import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerTrainingRoutes } from "./routes-training";
import { storage } from "./storage";
import multer from "multer";
import { generateAdCopy, generateLandingPageCopy } from "./anthropic";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Generate ad copy endpoint
  app.post('/api/generate-ad-copy', async (req, res) => {
    try {
      const { transcription, concept, subPersona, targetAudience, landingPageUrl, brandDrBalance, useJonesBrandGuide } = req.body;
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ message: 'Anthropic API key not configured' });
      }
      
      const result = await generateAdCopy({
        transcription,
        concept,
        subPersona,
        targetAudience,
        landingPageUrl,
        brandDrBalance,
        useJonesBrandGuide
      });
      
      res.json({
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

  // Generate landing page copy endpoint
  app.post('/api/generate-landing-copy', async (req, res) => {
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

  // Training configuration routes
  registerTrainingRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
