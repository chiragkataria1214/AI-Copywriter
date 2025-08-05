import { db } from './db';
import { emailFrameworks, InsertEmailFramework } from '@shared/schema';

const frameworksData: InsertEmailFramework[] = [
  {
    name: 'gtl_get_the_look',
    displayName: 'GTL (Get the Look)',
    description: 'Show complete look recreation using multiple products',
    keyGuidelines: 'Focus on step-by-step product application, seasonal inspiration, and pro tips. Structure: Hero → Intro Module → Look Breakdown → Footer',
    structureTemplate: `**Hero**: [Visual of complete look with main headline]
**Intro Module**: Context setting (season, occasion, inspiration)
**Look Breakdown**: 
- Step 1: [Product + Application]
- Step 2: [Product + Application] 
- Step 3: [Product + Application]
**Pro Tips**: Additional techniques or variations
**Footer**: Related products or seasonal reminder`,
    exampleCopy: 'Get the Look: Weekend Glow\n\nPerfect for brunch dates and casual moments when you want to look effortlessly put-together.\n\nThe Breakdown:\n1. Start with Just Enough Tinted Moisturizer for that natural base\n2. Add Miracle Balm in Flushed for a healthy flush\n3. Finish with Tinted Brow Gel to frame your face\n\nPro Tip: Blend everything with your fingers for the most natural finish.',
    sortOrder: 1,
    isActive: 'true'
  },
  {
    name: 'plain_text_letter_style',
    displayName: 'Plain Text / Letter-Style Note',
    description: 'Personal storytelling, product context, exclusive announcements',
    keyGuidelines: 'Use conversational, first-person tone from founder. Structure: Personal greeting → Context paragraphs → Multiple CTAs → Urgency close',
    structureTemplate: `**Personal Greeting**: Hi [name], or casual opener
**Context Paragraphs**: 2-3 paragraphs of personal story/context
**Multiple CTAs**: 4-5 action calls throughout 
**Urgency Close**: Time-sensitive or exclusive ending`,
    exampleCopy: 'Hi friend,\n\nI was just looking at our latest restock numbers, and I had to share something with you.\n\nOur Miracle Balm just sold out again (for the third time this month!), but we managed to set aside some inventory for our email subscribers.\n\nTry it here before it goes live to everyone else tomorrow.\n\nThis really is the product that started it all for me...\n\nBobbi',
    sortOrder: 2,
    isActive: 'true'
  },
  {
    name: 'product_spotlight_hero',
    displayName: 'Product Spotlight / Hero Product',
    description: 'Feature single product and benefits',
    keyGuidelines: 'Focus on problem-solution positioning. Structure: Hero benefit → What It Is → Why We Love It → Shades/Application → Footer',
    structureTemplate: `**Hero Benefit**: Main problem this product solves
**What It Is**: Product description and key features
**Why We Love It**: Unique benefits and differentiators
**Shades/Application**: Available options and usage tips
**Footer**: Related products or restock reminder`,
    exampleCopy: 'The One Product That Does It All\n\nWhat It Is: A multitasking balm that works as blush, lip color, and eye tint\n\nWhy We Love It: Creates the most natural flush that looks like it comes from within. No harsh lines, no artificial look.\n\nAvailable in 4 shades that work on every skin tone.\n\nShop Miracle Balm',
    sortOrder: 3,
    isActive: 'true'
  },
  {
    name: 'product_roundup_theme',
    displayName: 'Product Roundup / Theme-Based Edit',
    description: 'Multiple products around a theme or need',
    keyGuidelines: 'Group products by theme, need, or occasion. Structure: Theme title → Product modules → Closing CTA → Footer',
    structureTemplate: `**Theme Title**: Clear theme or need statement
**Product Module 1**: [Product + Why it fits theme]
**Product Module 2**: [Product + Why it fits theme]
**Product Module 3**: [Product + Why it fits theme]
**Closing CTA**: Shop the complete [theme]
**Footer**: Additional related items`,
    exampleCopy: 'Your 5-Minute Face Essentials\n\nWhen you need to look put-together but only have 5 minutes:\n\n• Just Enough Tinted Moisturizer - One step base that evens and hydrates\n• Miracle Balm - Instant color for cheeks and lips\n• The Best Mascara - One coat for instant definition\n\nShop the 5-Minute Face',
    sortOrder: 4,
    isActive: 'true'
  },
  {
    name: 'back_in_stock',
    displayName: 'Back in Stock',
    description: 'Announce product returns with excitement and urgency',
    keyGuidelines: 'Lead with excitement and urgency. Structure: "It\'s Back" eyebrow → Product name → Brief description → CTA',
    structureTemplate: `**Eyebrow**: "IT'S BACK" or "RESTOCKED"
**Product Name**: Clear product identification
**Brief Description**: Why customers love it / why it sold out
**CTA**: Shop now before it sells out again
**Urgency**: Limited quantities or time reminder`,
    exampleCopy: 'IT\'S BACK\n\nMiracle Balm in Toffee\n\nOur cult-favorite multitasking balm that sold out in 3 days is finally back in stock.\n\nThis universally flattering warm nude works as blush, lip color, and eye tint.\n\nShop Now - Limited Quantities Available',
    sortOrder: 5,
    isActive: 'true'
  },
  {
    name: 'product_launch',
    displayName: 'Product Launch',
    description: 'New product introduction with clear positioning',
    keyGuidelines: 'Always lead with "NEW" or "INTRODUCING". Structure: NEW positioning → What It Is → Benefits → Shades → Footer',
    structureTemplate: `**NEW Positioning**: "NEW" or "INTRODUCING" lead
**What It Is**: Product category and main function
**Benefits**: Key differentiators and advantages
**Shades/Options**: Available varieties
**Footer**: Launch exclusive or early access`,
    exampleCopy: 'INTRODUCING: The Cleansing Oil\n\nOur first-ever cleanser that melts away makeup while nourishing your skin.\n\nWhat makes it special:\n• Removes even waterproof mascara\n• Leaves skin soft, never stripped\n• Clean, gentle formula\n\nGet it first - launching exclusively for email subscribers.',
    sortOrder: 6,
    isActive: 'true'
  },
  {
    name: 'teaser_pre_launch',
    displayName: 'Teaser Email (Pre-Launch)',
    description: 'Build anticipation without revealing everything',
    keyGuidelines: 'Create curiosity without full reveal. Structure: Vague enticing headline → Small hint → Preview CTA → SMS signup',
    structureTemplate: `**Vague Headline**: Intriguing but not revealing
**Small Hint**: Enough to create interest
**Preview CTA**: "Get a sneak peek" or "See what's coming"
**SMS Signup**: For instant launch alerts`,
    exampleCopy: 'Something New Is Coming...\n\nWe\'ve been working on this for months, and it\'s finally almost ready.\n\nHint: It\'s going to change your morning routine forever.\n\nGet the First Look\n\nWant to be the first to know when it launches? Text BEAUTY to 12345',
    sortOrder: 7,
    isActive: 'true'
  },
  {
    name: 'retail_event_popup',
    displayName: 'Retail Event / Pop-Up / IRL Activation',
    description: 'Drive in-person attendance with exclusivity',
    keyGuidelines: 'Focus on exclusivity and personal experience. Structure: Event name → Details (What/Where/When) → RSVP CTA → Online exclusives',
    structureTemplate: `**Event Name**: Clear event title
**What**: Event description and special features
**Where**: Location details
**When**: Date and time
**RSVP CTA**: How to secure spot
**Online Exclusives**: Special offers for attendees`,
    exampleCopy: 'Jones Road Beauty Pop-Up NYC\n\nJoin us for an exclusive shopping experience:\n\n📍 What: Personal consultations + exclusive products\n📍 Where: SoHo, 123 Spring Street\n📍 When: Saturday, March 15th, 11am-6pm\n\nRSVP Required - Limited Spots\n\nAttendees get 20% off and first access to new launches.',
    sortOrder: 8,
    isActive: 'true'
  },
  {
    name: 'promotional_offer',
    displayName: 'Promotional Email',
    description: 'Drive conversion via urgency and customer benefit',
    keyGuidelines: 'Never lead with just "Sale" - focus on customer benefit. Structure: "Limited Time" eyebrow → Benefit-focused headline → Offer details → How it works → Terms',
    structureTemplate: `**Limited Time Eyebrow**: Time sensitivity indicator
**Benefit-Focused Headline**: Customer advantage, not just discount
**Offer Details**: Clear value proposition
**How It Works**: Simple redemption process
**Terms**: Clear limitations and expiry`,
    exampleCopy: 'LIMITED TIME\n\nTry 3 Products, Pay for 2\n\nPerfect time to discover your new favorites or complete your makeup bag.\n\nHow it works:\n• Add any 3 products to cart\n• Lowest priced item is automatically free\n• No code needed\n\nEnds Sunday at midnight.',
    sortOrder: 9,
    isActive: 'true'
  },
  {
    name: 'set_or_kit',
    displayName: 'Set or Kit Email',
    description: 'Promote curated bundles with convenience and value',
    keyGuidelines: 'Focus on convenience and value bundling. Structure: Set name → What\'s included → Why you\'ll love it → Limited time reminder',
    structureTemplate: `**Set Name**: Clear bundle identification
**What's Included**: List of products in set
**Why You'll Love It**: Bundle benefits and value
**Limited Time**: Availability or pricing deadline`,
    exampleCopy: 'The Starter Set\n\nEverything you need for effortless everyday beauty:\n\n• Just Enough Tinted Moisturizer\n• Miracle Balm in Flushed\n• The Best Mascara\n\nWhy you\'ll love it: These three work together for the most natural, pulled-together look. Save $25 vs. buying separately.\n\nAvailable for limited time only.',
    sortOrder: 10,
    isActive: 'true'
  },
  {
    name: 'how_to_problem_solution',
    displayName: 'How-To (Problem/Solution)',
    description: 'Educate on solving common beauty problems',
    keyGuidelines: 'Educational first, selling second. Structure: Problem identification → Product solutions → Step-by-step → Cross-sell',
    structureTemplate: `**Problem Identification**: Common beauty challenge
**Product Solutions**: Specific products that help
**Step-by-Step**: Clear application process
**Cross-Sell**: Related products or tools`,
    exampleCopy: 'How to Get Natural-Looking Coverage\n\nThe Problem: Foundation can look cakey or unnatural\n\nThe Solution: Skip traditional foundation entirely\n\nHow to do it:\n1. Start with Just Enough Tinted Moisturizer\n2. Use fingers to blend for seamless coverage\n3. Build only where needed\n\nFor extra coverage: Try our Complexion Stick for targeted areas.',
    sortOrder: 11,
    isActive: 'true'
  },
  {
    name: 'duos_product_combinations',
    displayName: 'Duos or Product Combinations',
    description: 'Sell complementary products that work better together',
    keyGuidelines: 'Show enhanced results from pairing. Structure: Combo benefit → Product 1 spotlight → Product 2 spotlight → Pro tip → Related products',
    structureTemplate: `**Combo Benefit**: Why these work better together
**Product 1 Spotlight**: First product and its role
**Product 2 Spotlight**: Second product and its role
**Pro Tip**: Application or layering advice
**Related Products**: Additional complementary items`,
    exampleCopy: 'The Perfect Duo: Tinted Moisturizer + Miracle Balm\n\nWhy they work together: Natural base + natural color = the most effortless look\n\nJust Enough Tinted Moisturizer: Creates the perfect canvas with light, breathable coverage\n\nMiracle Balm: Adds the perfect flush of color that looks like it comes from within\n\nPro Tip: Apply moisturizer first, then dab balm on apples of cheeks and blend outward.',
    sortOrder: 12,
    isActive: 'true'
  },
  {
    name: 'shade_roundup',
    displayName: 'Shade Roundup',
    description: 'Curate shades for seasons, moods, or occasions',
    keyGuidelines: 'Focus on emotional connection to colors. Structure: Season/mood theme → Shade spotlights → Benefits → Shop all',
    structureTemplate: `**Season/Mood Theme**: Emotional or seasonal connection
**Shade Spotlight 1**: [Shade name + feeling/occasion]
**Shade Spotlight 2**: [Shade name + feeling/occasion]
**Shade Spotlight 3**: [Shade name + feeling/occasion]
**Benefits**: How shades enhance the theme
**Shop All**: Complete shade range CTA`,
    exampleCopy: 'Spring Awakening Shades\n\nFresh colors that capture the energy of new beginnings:\n\n🌸 Flushed: The perfect pink for a fresh-faced glow\n🌿 Toffee: Warm nude that feels like sunshine\n🌺 Berry: Rich berry for when you want more drama\n\nEach shade works as blush, lip color, and eye tint.\n\nShop All Miracle Balm Shades',
    sortOrder: 13,
    isActive: 'true'
  },
  {
    name: 'how_to_use_tutorial',
    displayName: 'How to Use It (Product Tutorial)',
    description: 'Teach application and layering techniques',
    keyGuidelines: 'Education leading to confidence and purchase. Structure: Product uniqueness → Step-by-step instructions → Pro tips → Tools/accessories',
    structureTemplate: `**Product Uniqueness**: What makes this different
**Step-by-Step Instructions**: Clear application process
**Pro Tips**: Advanced techniques or variations
**Tools/Accessories**: Recommended applicators or companions`,
    exampleCopy: 'How to Use: Miracle Balm\n\nWhat makes it special: This balm works on cheeks, lips, and eyes - but the application is key.\n\nStep-by-Step:\n1. Start with a small amount on fingertip\n2. Dab onto apples of cheeks\n3. Blend outward in circular motions\n4. For lips: apply directly from tube\n5. For eyes: dab lightly on lids\n\nPro Tip: Layer over tinted moisturizer for extra dimension, or use alone for a natural look.',
    sortOrder: 14,
    isActive: 'true'
  },
  {
    name: 'social_proof',
    displayName: 'Social Proof',
    description: 'Build credibility through reviews and press mentions',
    keyGuidelines: 'Use authentic testimonials and press quotes. Structure: "What people are saying" → 3-4 testimonials → Product CTA',
    structureTemplate: `**"What People Are Saying"**: Social proof header
**Testimonial 1**: Customer or press quote with attribution
**Testimonial 2**: Customer or press quote with attribution  
**Testimonial 3**: Customer or press quote with attribution
**Product CTA**: Direct link to featured product`,
    exampleCopy: 'What People Are Saying About Miracle Balm\n\n"This is the most natural-looking blush I\'ve ever used. It literally looks like I\'m glowing from within." - Sarah M.\n\n"Finally, a product that works on my lips AND cheeks. Game changer!" - Jessica R.\n\n"Best multitasking product in my makeup bag." - Allure Magazine\n\nTry Miracle Balm',
    sortOrder: 15,
    isActive: 'true'
  }
];

async function initializeEmailFrameworks() {
  try {
    console.log('Initializing email frameworks...');
    
    // Check if frameworks already exist
    const existingFrameworks = await db.select().from(emailFrameworks);
    
    if (existingFrameworks.length > 0) {
      console.log(`Found ${existingFrameworks.length} existing frameworks. Skipping initialization.`);
      return;
    }
    
    // Insert all frameworks
    await db.insert(emailFrameworks).values(frameworksData);
    
    console.log(`Successfully initialized ${frameworksData.length} email frameworks.`);
    
    // Verify insertion
    const insertedFrameworks = await db.select().from(emailFrameworks);
    console.log(`Verification: ${insertedFrameworks.length} frameworks now in database.`);
    
  } catch (error) {
    console.error('Error initializing email frameworks:', error);
    throw error;
  }
}

// Run the initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeEmailFrameworks()
    .then(() => {
      console.log('Email frameworks initialization completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Email frameworks initialization failed:', error);
      process.exit(1);
    });
}

export { initializeEmailFrameworks };