import { storage } from '../utils/storage';
import { TrainingConfig, VariableDefinition } from '@shared/training-config';
import { STATION_CONFIGS } from '@shared/constants';

async function main() {
  const config = (await storage.getTrainingConfiguration()) as TrainingConfig;

  const v = (
    key: string,
    label: string,
    description: string,
    type: VariableDefinition['type'],
    required = false
  ): VariableDefinition => ({ key, label, description, type, category: 'user_input', required });

  const stationVariables: Record<string, VariableDefinition[]> = {
    // adCopy: [
    //   v('transcription', 'Transcription', 'Raw transcription text to base copy on', 'string'),
    //   v('customBrief', 'Custom Brief', 'Extra instructions for this generation', 'string'),
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string', true),
    //   v('landingPageUrl', 'Landing Page URL', 'URL of the landing page to align copy with', 'string'),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number', true),
    //   v('useJonesBrandGuide', 'Use Brand Guidelines', 'Include brand guidelines in prompts', 'boolean', true),
    //   v('airLink', 'Image URL', 'URL to an image to analyze or reference', 'string'),
    //   v('uploadedImage', 'Image Data (base64)', 'Base64-encoded image data to analyze', 'string'),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    // ],
    // landingPage: [
    //   v('landingPageType', 'Landing Page Type', 'Type of landing page to generate', 'string', true),
    //   v('productBrief', 'Product Brief', 'Product brief or notes for this page', 'string', true),
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string', true),
    //   v('useAdsContent', 'Use Ads Content', 'Whether to incorporate ads content into the page', 'boolean', true),
    //   v('adsContent', 'Ads Content', 'Ads content to optionally incorporate', 'string'),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number', true),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    //   v('mainAngle', 'Main Angle', 'Primary persuasive angle for this page', 'string'),
    //   v('transcription', 'Transcription', 'Raw transcription text to base copy on', 'string'),
    // ],
    // customRequest: [
    //   v('customRequest', 'Custom Request', 'Freeform request the model should fulfill', 'string', true),
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string', true),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number', true),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    //   v('useJonesBrandGuide', 'Use Brand Guidelines', 'Include brand guidelines in prompts', 'boolean', true),
    // ],
    // staticAd: [
    //   v('staticAdImage', 'Static Ad Image (base64 or URL)', 'Image data or URL for analysis', 'string', true),
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string', true),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number', true),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    //   v('useJonesBrandGuide', 'Use Brand Guidelines', 'Include brand guidelines in prompts', 'boolean'),
    //   v('outputFormat', 'Output Format', 'Desired output format for analysis', 'string'),
    //   v('analysisFocus', 'Analysis Focus', 'Specific focus for the analysis', 'string'),
    // ],
    email: [
      v('campaign_type', 'Campaign Type', 'e.g., Product Launch, Promotion, Newsletter', 'string'),
      v('audience_segment', 'Audience Segment', 'e.g., VIP Customers, New Subscribers', 'string'),
    ],
    // sms: [
    //   v('campaign_type', 'Campaign Type', 'e.g., Flash Sale, New Arrival', 'string'),
    //   v('audience_segment', 'Audience Segment', 'e.g., Engaged Users, Lapsed Customers', 'string'),
    // ],
    // productLaunch: [
    //   v('notes', 'Notes', 'Notes for the product launch brief', 'string', true),
    //   v('googleDriveLinks', 'Google Drive Links', 'Links to supporting assets', 'array'),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string'),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number'),
    //   v('useJonesBrandGuide', 'Use Brand Guidelines', 'Include brand guidelines in prompts', 'boolean'),
    // ],
    // socialCaptions: [
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string', true),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number', true),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    //   v('customBrief', 'Custom Brief', 'Extra instructions for this generation', 'string'),
    // ],
    // storySequences: [
    //   v('persona', 'Persona (key or key:subId)', 'Target persona key (optionally with subpersona id)', 'string', true),
    //   v('brandDrBalance', 'Brand/DR Balance (%)', 'Percent brand voice vs direct response', 'number', true),
    //   v('selectedProduct', 'Selected Product (key)', 'Primary product key to focus on', 'string'),
    //   v('selectedProducts', 'Selected Products (keys)', 'List of product keys to include', 'array'),
    //   v('customBrief', 'Custom Brief', 'Extra instructions for this generation', 'string'),
    //   v('transcription', 'Transcription', 'Raw transcription text to base copy on', 'string'),
    // ],
  };

  const stationKeys = Array.from(
    new Set<string>([
      ...Object.keys(STATION_CONFIGS || {}),
      ...Object.keys((config as any).stationPrompts || {}),
    ])
  );

  const updatedStations: any = { ...(config as any).stationPrompts };
  for (const station of stationKeys) {
    const currentStation = updatedStations[station] || {};
    const currentContext = currentStation.contextConfiguration || {};
    const existing = currentContext.availableVariables as VariableDefinition[] | undefined;
    const seeded = stationVariables[station] || [];
    if (!existing || existing.length === 0) {
      currentStation.contextConfiguration = {
        ...currentContext,
        availableVariables: seeded,
      };
      updatedStations[station] = currentStation;
    }
  }

  const updatedConfig: TrainingConfig = {
    ...config,
    stationPrompts: updatedStations,
  } as TrainingConfig;

  await storage.saveTrainingConfiguration(updatedConfig);
  console.log('Seeded contextConfiguration.availableVariables for stations:', stationKeys.join(', '));
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

