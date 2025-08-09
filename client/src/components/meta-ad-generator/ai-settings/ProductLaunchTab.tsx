import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingConfig } from '@shared/training-config';
import { Rocket, FileText, Target } from 'lucide-react';

interface ProductLaunchTabProps {
  editingConfig: TrainingConfig;
  setEditingConfig: (config: TrainingConfig) => void;
}

export const ProductLaunchTab: React.FC<ProductLaunchTabProps> = ({
  editingConfig,
  setEditingConfig
}) => {
  
  const updateProductLaunchConfig = (field: string, value: string) => {
    setEditingConfig({
      ...editingConfig,
      stationPrompts: {
        ...editingConfig.stationPrompts,
        productLaunch: {
          ...editingConfig.stationPrompts.productLaunch,
          [field]: value
        }
      }
    });
  };

  const briefStructure = `Create a creative strategy brief for a new Jones Road Beauty product based on the information provided below. Use the tone and structure of past briefs like the one for Everyday Sunscreen. Format the brief using the following sections:

1. Launch Overview  
2. Pre-Launch Messaging Theme  
3. Messaging Pillars (ranked in order of importance)  
4. Founder POV (in Bobbi's voice)  
5. Market Differentiation  
6. Target Audience  

Product Information:
- Product Name: [INSERT]
- Product Type/Category: [INSERT]
- Launch Date: [INSERT]
- Launch Tier: [INSERT]
- Key Product Features & Benefits: [INSERT]
- Customer Problem it Solves: [INSERT]
- How it's Different from Competitors: [INSERT]
- Any Seasonal Campaign Context (e.g. "Back to School," "New Year, Same You"): [INSERT]
- Why Bobbi Created It / Quote or POV: [INSERT]
- Intended Audience Segments: [INSERT]
- Influencer/PR Angle (optional): [INSERT]

Please write in a confident, conversational tone that reflects Jones Road's brand voice. The brief should feel strategic but creatively inspiring.`;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Rocket className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold">Product Launch Configuration</h3>
      </div>

      {/* Brief Output Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText size={18} />
            <span>Brief Output Structure</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brief-structure">Creative Brief Structure Template</Label>
            <p className="text-sm text-gray-600 mb-2">
              This defines the structure and format that the AI will use when generating product launch briefs.
            </p>
            <Textarea
              id="brief-structure"
              value={editingConfig.stationPrompts?.productLaunch?.briefStructure || briefStructure}
              onChange={(e) => updateProductLaunchConfig('briefStructure', e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Enter the brief structure template..."
            />
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target size={18} />
            <span>System Prompt for Brief Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <p className="text-sm text-gray-600 mb-2">
              This system prompt guides how the AI generates product launch briefs using the structure above.
            </p>
            <Textarea
              id="system-prompt"
              value={editingConfig.stationPrompts?.productLaunch?.systemPrompt || `You are an expert marketing strategist and creative brief writer specializing in Jones Road Beauty product launches. Your role is to create comprehensive, strategic product launch briefs that guide successful campaign execution.

Use the brief structure template provided and adapt it to the specific product information given. Ensure the brief captures Jones Road's brand voice - confident, conversational, and authentic.

Focus on:
- Strategic positioning that differentiates from competitors
- Authentic brand voice that reflects Bobbi Brown's perspective
- Clear messaging hierarchy with prioritized pillars
- Actionable insights for creative teams
- Market-relevant differentiation points

Always maintain Jones Road's core brand values of authenticity, inclusivity, and effortless beauty.`}
              onChange={(e) => updateProductLaunchConfig('systemPrompt', e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter the system prompt for brief generation..."
            />
          </div>
        </CardContent>
      </Card>

      {/* User Prompt Template */}
      <Card>
        <CardHeader>
          <CardTitle>User Prompt Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-prompt-template">Template for User Input Processing</Label>
            <p className="text-sm text-gray-600 mb-2">
              This template structures how user input (notes, meeting transcripts, Google Drive links) is processed.
            </p>
            <Textarea
              id="user-prompt-template"
              value={editingConfig.stationPrompts?.productLaunch?.userPromptTemplate || `Based on the following meeting notes and information, create a comprehensive product launch brief following the structure template:

Meeting Notes & Input:
{notes}

{googleDriveLinks ? "Referenced Past Briefs:\n" + googleDriveLinks.map((link, i) => (i + 1) + ". " + link).join("\n") + "\n\nNote: Please reference the strategic frameworks and successful elements from these past briefs in your recommendations.\n" : ""}

Please create a strategic, comprehensive product launch brief that incorporates these insights and provides clear direction for the launch campaign.`}
              onChange={(e) => updateProductLaunchConfig('userPromptTemplate', e.target.value)}
              className="min-h-[150px]"
              placeholder="Enter the user prompt template..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};