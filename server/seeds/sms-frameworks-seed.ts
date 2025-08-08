import { db } from '../db';
import { smsFrameworks } from '../../shared/schema';

// All SMS must be <= 250 characters including spaces and line breaks unless stated otherwise
// Tone: friendly, slightly editorial, confident, minimal, helpful; no emojis; limited punctuation
// Always include a CTA + short link at the end; one idea per SMS.

const smsFrameworksData = [
  {
    name: 'product_launch',
    displayName: 'Product Launch',
    description: "Announce a brand-new product. Lead with what's new, different, exciting.",
    structure: 'Hook → What’s new + key benefit → CTA + short link',
    keyElements: 'Newness, single benefit, clear CTA, sub-160-250 chars',
    frameworkContent: `Goal: Use to announce a brand-new product. Highlight what’s new, different, and exciting.

Examples:
1) It's BACK: The limited-edition Makeup Travel Kit 2.0. It sold out fast last year... Now it's here for your summer travels with 6 vacation-ready staples for less. Grab your getaway glow: LINK

2) It's officially here: The NEW Just Enough Tinted Moisturizer. Lightweight, natural coverage that feels like nothing. Your skin, but better. Shop your new staple: LINK`,
    systemPrompt: 'Write an SMS announcing a new product. Start with a tight hook. State one standout benefit. Keep under 250 characters. No emojis. Limit punctuation. End with a single CTA and short link.',
    outputRequirements: 'Single message under 250 chars, one CTA with short link, no emojis, minimal punctuation',
    expectedLength: 'short',
    sortOrder: 1,
  },
  {
    name: 'product_spotlight',
    displayName: 'Product Spotlight',
    description: 'Focus on one hero product with a key benefit.',
    structure: 'Hook → Benefit or why we love it → When/how to use (brief) → CTA + link',
    keyElements: 'Single product, 1-2 benefits max, seasonal hook optional, clear CTA',
    frameworkContent: `Goal: Focus on one hero product. Emphasize key benefits, why we love it, problem it solves, when/how to use.

Examples:
1) Instantly radiant eyes. A few swipes of Just a Sec gives depth, highlight, and shimmer—effortlessly. Shop all 8 shades: LINK

2) It wouldn't be spring without a little shimmery radiance. Shimmer Face Oil = natural luminosity with zero fuss. Get the glow: LINK`,
    systemPrompt: 'Write a concise SMS featuring one product. Lead with the effect. Include a single strongest benefit. Keep it clear and skimmable. End with one CTA plus short link.',
    outputRequirements: 'Under 250 chars, one idea, one CTA with link, no emojis',
    expectedLength: 'short',
    sortOrder: 2,
  },
  {
    name: 'product_roundup',
    displayName: 'Product Roundup / Series',
    description: 'Highlight a small group of products tied to a theme.',
    structure: 'Theme hook → 2-3 items named with micro-benefit → CTA + link',
    keyElements: 'Editorial curation, tight micro-benefits, single theme, single CTA',
    frameworkContent: `Goal: Highlight a group of products under a common theme.

Examples:
1) Beach day, sorted. Everyday Sunscreen + Miracle Balm + The Lippie Stick = sun-ready, simple, polished. Shop beach bag must-haves: LINK

2) Light, bright, effortless. Switch to breathable, quick-fix staples for warmer days. Your summer refresh starts here: LINK`,
    systemPrompt: 'Write an SMS curating 2–3 products around one theme. Use micro-benefits. Keep tight and scannable. One CTA with link.',
    outputRequirements: 'Under 250 chars, single theme, single CTA+link',
    expectedLength: 'short',
    sortOrder: 3,
  },
  {
    name: 'category_push',
    displayName: 'Category Push',
    description: 'Drive traffic to a specific product category with a seasonal or need-based hook.',
    structure: 'Season/need hook → Category value → CTA + link',
    keyElements: 'Seasonality or need, clarity, one CTA',
    frameworkContent: `Goal: Drive traffic to a specific category.

Examples:
1) Hot weather, cool lips. Lightweight, sheer color with zero stickiness. Find your summer lip: LINK

2) Eyeing a summer look? Gel Liner + Sparkle Wash + Brow Gel = polished, breezy eyes. Take a peek: LINK`,
    systemPrompt: 'Write an SMS pushing a category with a seasonal or need-based hook. Clear, direct, one CTA + link.',
    outputRequirements: 'Under 250 chars, one hook, one CTA + link',
    expectedLength: 'short',
    sortOrder: 4,
  },
  {
    name: 'social_proof',
    displayName: 'Social Proof / Reviews',
    description: 'Use a short quote to validate the product and nudge purchase.',
    structure: 'Product or set → 1 short quote → CTA + link',
    keyElements: 'Authentic quote, product specificity, one CTA',
    frameworkContent: `Goal: Use short customer quotes or review snippets to validate the product.

Examples:
1) Miracle Balm Palettes are a hit. “Perfect for carrying 3 shades that work beautifully together.” Shop the favorite: LINK

2) Just A Sec: “Buildable—sheer or vibrant.” Now in 3 new neutrals. See shades: LINK`,
    systemPrompt: 'Write an SMS anchored on one concise review quote. Keep it credible and specific. One CTA + short link.',
    outputRequirements: 'Under 250 chars, one quote, one CTA + link',
    expectedLength: 'short',
    sortOrder: 5,
  },
  {
    name: 'promotion',
    displayName: 'Sale or Promotion Alert',
    description: 'Announce a promotion with urgency. Lead with the offer.',
    structure: 'Offer + urgency → Key mechanic → CTA + link',
    keyElements: 'Offer first, urgency, mechanics if needed, one CTA',
    frameworkContent: `Goal: Announce a promotion. Lead with offer and urgency.

Examples:
1) Mini Miracles + up to 25% off kits. Black Friday is live. Shop before they’re gone: LINK

2) Mother’s Day: Free Lip Tint on orders $100+. Choose 1 of 3 best-sellers. Ends tonight. Shop now: LINK

3) Free Lip Tint on $100+—spring shades on us. Build your cart: LINK`,
    systemPrompt: 'Write a promotion SMS. Start with the offer/urgency. Be clear on mechanics if essential. End with one CTA + link.',
    outputRequirements: 'Under 250 chars, offer-first, one CTA + link',
    expectedLength: 'short',
    sortOrder: 6,
  },
  {
    name: 'reminder',
    displayName: 'Reminder / Last Chance',
    description: 'Close out an offer or final hours of a sale.',
    structure: 'Urgency hook → What ends → CTA + link',
    keyElements: 'Direct, punchy, clear deadline, one CTA',
    frameworkContent: `Goal: Push final hours.

Examples:
1) FINAL HOURS: Mini Memorial Day Exclusive. Build 4, 6, or 8—before they’re gone: LINK

2) Last call: Limited Holiday Collection ends tomorrow. Shop now: LINK`,
    systemPrompt: 'Write a last-chance SMS. Be direct. Use urgency without shouting. One CTA + link.',
    outputRequirements: 'Under 250 chars, urgency-led, one CTA + link',
    expectedLength: 'short',
    sortOrder: 7,
  },
  {
    name: 'educational',
    displayName: 'Educational',
    description: 'Quick how-to or problem/solution. Include a CTA.',
    structure: 'Problem hook → Solution product → CTA + link',
    keyElements: 'Clear problem, clear solution, one CTA',
    frameworkContent: `Goal: Share quick “how to” content.

Examples:
1) Tired of dark circles? Brighten with The Neutralizer Pencil—color-corrects fast. Shop now: LINK

2) Breaking out? Just Enough evens redness—light, hydrating, non-comedogenic. Treat better: LINK`,
    systemPrompt: 'Write an educational SMS with a clear problem and solution. Be concise. One CTA + link.',
    outputRequirements: 'Under 250 chars, problem-solution, one CTA + link',
    expectedLength: 'short',
    sortOrder: 8,
  },
  {
    name: 'cross_sell',
    displayName: 'Cross-Sell / Upsell',
    description: 'Suggest a complementary product to pair with a recent or favorite item.',
    structure: 'Starter product → Complement + benefit → CTA + link',
    keyElements: 'Single pairing, reason to pair, one CTA',
    frameworkContent: `Goal: Suggest complementary products.

Examples:
1) After The Mascara, define with The Best Pencil for stand-out eyes. Finish your look: LINK

2) Love Miracle Balm’s moisture? Layer Lip & Cheek Stick for more color—creamy, buildable. See all 8 shades: LINK`,
    systemPrompt: 'Write an upsell/cross-sell SMS. Name the core item, then the complement and benefit. One CTA + link.',
    outputRequirements: 'Under 250 chars, one pairing, one CTA + link',
    expectedLength: 'short',
    sortOrder: 9,
  },
];

export async function seedSmsFrameworks() {
  try {
    console.log('Seeding SMS frameworks...');
    await db.delete(smsFrameworks);
    await db.insert(smsFrameworks).values(smsFrameworksData);
    console.log(`Successfully seeded ${smsFrameworksData.length} SMS frameworks`);
  } catch (error) {
    console.error('Error seeding SMS frameworks:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSmsFrameworks()
    .then(() => {
      console.log('SMS frameworks seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('SMS frameworks seeding failed:', error);
      process.exit(1);
    });
}

