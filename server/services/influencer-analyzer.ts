import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_MODEL_STR } from '@shared/constants';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229".

interface VoiceAnalysisData {
  transcription?: string;
  socialContent?: string;
  influencerHandle?: string;
}

interface VoiceProfile {
  vocabulary: string[];
  toneDescriptors: string[];
  sentenceStructure: string;
  commonPhrases: string[];
  emotionalStyle: string;
  contentThemes: string[];
  engagementStyle: string;
}

export async function analyzeInfluencerVoice(data: VoiceAnalysisData): Promise<VoiceProfile> {
  const analysisPrompt = `
You are an expert voice and communication analyst. Analyze the provided content from an influencer to understand their authentic voice characteristics.

Content to analyze:
${data.transcription ? `VIDEO TRANSCRIPTION:\n${data.transcription}\n\n` : ''}
${data.socialContent ? `SOCIAL MEDIA CONTENT:\n${data.socialContent}\n\n` : ''}

Analyze and extract the following voice characteristics:

1. VOCABULARY PATTERNS: What specific words, slang, or phrases do they frequently use?
2. TONE DESCRIPTORS: How would you describe their communication style? (casual, energetic, authentic, relatable, etc.)
3. SENTENCE STRUCTURE: Do they use short punchy sentences, long flowing thoughts, questions, exclamations?
4. COMMON PHRASES: What are their signature expressions or recurring phrases?
5. EMOTIONAL STYLE: How do they express emotions and connect with audience?
6. CONTENT THEMES: What topics do they naturally gravitate toward?
7. ENGAGEMENT STYLE: How do they interact with their audience?

Return your analysis in this exact JSON format:
{
  "vocabulary": ["word1", "word2", "word3"],
  "toneDescriptors": ["casual", "energetic", "authentic"],
  "sentenceStructure": "Uses short, punchy sentences with lots of questions and exclamations",
  "commonPhrases": ["phrase1", "phrase2"],
  "emotionalStyle": "Warm and relatable, shares personal struggles openly",
  "contentThemes": ["motherhood", "self-care", "authenticity"],
  "engagementStyle": "Direct questions to audience, uses 'you guys', very conversational"
}
`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: analysisPrompt
      }]
    });

    const firstContent = response.content[0];
    if (firstContent.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }
    const analysis = JSON.parse(firstContent.text);
    return analysis;
  } catch (error) {
    console.error('Voice analysis error:', error);
    throw new Error('Failed to analyze influencer voice');
  }
}

export async function generateInfluencerStyleCopy(
  prompt: string,
  voiceProfile: VoiceProfile,
  brandGuidelines: any,
  balanceRatio: number // 0-100, where 0 is pure influencer voice, 100 is pure brand voice
): Promise<{ headlines: Array<{ framework: string; copy: string }>, primaryText: string }> {
  
  const voiceGuidance = `
INFLUENCER VOICE PROFILE:
- Vocabulary: ${voiceProfile.vocabulary.join(', ')}
- Tone: ${voiceProfile.toneDescriptors.join(', ')}
- Sentence Structure: ${voiceProfile.sentenceStructure}
- Common Phrases: ${voiceProfile.commonPhrases.join(', ')}
- Emotional Style: ${voiceProfile.emotionalStyle}
- Content Themes: ${voiceProfile.contentThemes.join(', ')}
- Engagement Style: ${voiceProfile.engagementStyle}

VOICE BALANCE INSTRUCTION:
Balance ratio: ${balanceRatio}% brand voice, ${100 - balanceRatio}% influencer voice
${balanceRatio < 30 ? 'Prioritize authentic influencer voice while maintaining basic brand safety' :
  balanceRatio > 70 ? 'Maintain brand guidelines while incorporating influencer personality' :
  'Balance both brand voice and influencer authenticity equally'}
`;

  const copyGenerationPrompt = `
${brandGuidelines ? `BRAND GUIDELINES:\n${JSON.stringify(brandGuidelines, null, 2)}\n\n` : ''}

${voiceGuidance}

USER REQUEST:
${prompt}

Generate ad copy that authentically reflects the influencer's voice while respecting brand guidelines based on the balance ratio.

REQUIREMENTS:
1. Generate 3 headlines using different frameworks
2. Generate 1 primary text (150-200 words)
3. Use the influencer's vocabulary and phrase patterns
4. Match their sentence structure and emotional style
5. Incorporate their engagement style naturally
6. Respect brand guidelines based on balance ratio

Return in this exact JSON format:
{
  "headlines": [
    {"framework": "BENEFIT DRIVEN", "copy": "headline text"},
    {"framework": "SOCIAL PROOF", "copy": "headline text"}, 
    {"framework": "PROBLEM FOCUSED", "copy": "headline text"}
  ],
  "primaryText": "primary text content"
}
`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: copyGenerationPrompt
      }]
    });

    const firstContent = response.content[0];
    if (firstContent.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }
    const result = JSON.parse(firstContent.text);
    return result;
  } catch (error) {
    console.error('Influencer copy generation error:', error);
    throw new Error('Failed to generate influencer-style copy');
  }
}

// Simulated Instagram content fetcher (would use Instagram API in production)
export async function fetchInstagramContent(handle: string): Promise<string> {
  // In a real implementation, this would use Instagram's API or a web scraping service
  // For demo purposes, we'll return a simulated response
  
  console.log(`Simulating Instagram content fetch for @${handle}`);
  
  // This would be replaced with actual Instagram API calls
  return `
Sample Instagram content for @${handle}:

Post 1: "obsessed with this new routine!! literally takes me 2 minutes and I'm glowing ✨ you guys know I don't have time for 20-step anything lol. link in bio if you want to try!"

Post 2: "real talk - my skin has been ROUGH lately (hello stress breakouts 🙃) but this foundation is actually magic?? covers everything but still looks like skin. mama needs this confidence boost!"

Post 3: "quick morning routine bc baby decided 5am was wake up time 😅 1. splash of water 2. this tinted moisturizer 3. lip balm 4. mascara DONE. looking human again lol"

Post 4: "you guys asked for an honest review... this stuff is IT. no filter needed which is saying something after zero sleep 😂 definitely worth the hype!"

Post 5: "messy hair don't care vibes today but at least my skin looks good! this foundation is literally foolproof - even when I'm rushing and basically slapping it on 💀"
`;
}