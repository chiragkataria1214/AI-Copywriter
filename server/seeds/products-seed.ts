import { db } from '../db';
import { products, productClaims } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Product data with descriptions and claims
const productData = [
  // SKINCARE PRODUCTS
  {
    name: 'miracle-balm',
    displayName: 'Miracle Balm',
    description: 'A luxurious multi-use balm infused with nourishing Jojoba Oil and Vitamin E that delivers an instant glow while addressing dullness and redness. This rich, versatile formula works as a highlighter, moisturizer, or targeted treatment for all skin types.',
    claims: ['Glow-enhancing', 'Multi-use', 'Nourishing', 'Anti-dullness', 'Redness-reducing', 'Vitamin E enriched', 'All skin types', 'Lightweight coverage']
  },
  {
    name: 'miracle-balm-palette',
    displayName: 'Miracle Balm Palette',
    description: 'A curated collection of Miracle Balms in complementary shades, featuring the same beloved Jojoba Oil and Vitamin E formula. Perfect for creating customized looks while treating dullness and redness across all skin types.',
    claims: ['Multi-shade palette', 'Customizable glow', 'Anti-dullness', 'Redness-reducing', 'Vitamin E enriched', 'All skin types', 'Versatile application']
  },
  {
    name: 'everyday-sunscreen-broad-spectrum-spf-30',
    displayName: 'Everyday Sunscreen Broad Spectrum SPF 30',
    description: 'A lightweight, glow-enhancing daily sunscreen that provides broad spectrum SPF 30 protection without compromising your radiant complexion. Enriched with Vitamin E for added skin benefits.',
    claims: ['Broad spectrum SPF 30', 'Daily protection', 'Glow-enhancing', 'Lightweight formula', 'Vitamin E enriched', 'All skin types', 'Non-greasy']
  },
  {
    name: 'shimmer-face-oil',
    displayName: 'Shimmer Face Oil',
    description: 'A luminous facial oil that combines the hydrating power of Jojoba Oil with Vitamin E to deliver instant radiance. Specially formulated for dry and all skin types to combat dullness with a lightweight, shimmering finish.',
    claims: ['Shimmer finish', 'Hydrating', 'Anti-dullness', 'Jojoba Oil', 'Vitamin E', 'Lightweight', 'Dry skin friendly', 'Radiance-boosting']
  },
  {
    name: 'the-oil-stick',
    displayName: 'The Oil Stick',
    description: 'A convenient, travel-friendly oil stick enriched with Jojoba Oil and Vitamin E. Provides medium coverage with a natural glow, perfect for dry to normal skin types seeking targeted hydration and luminosity.',
    claims: ['Convenient stick format', 'Medium coverage', 'Natural glow', 'Jojoba Oil', 'Vitamin E', 'Dry skin solution', 'Portable hydration']
  },
  {
    name: 'multivitamin-serum',
    displayName: 'Multivitamin Serum',
    description: 'A lightweight, glow-boosting serum powered by Panthenol and Vitamin E. Specifically designed to revitalize dry and all skin types while targeting dullness for a more radiant complexion.',
    claims: ['Multivitamin formula', 'Lightweight serum', 'Glow-boosting', 'Anti-dullness', 'Panthenol', 'Vitamin E', 'Revitalizing', 'All skin types']
  },
  {
    name: 'eye-cream',
    displayName: 'Eye Cream',
    description: 'A lightweight yet effective eye cream enriched with Vitamin E, specifically formulated to target dark circles while being gentle enough for all skin types. Provides essential hydration to the delicate eye area.',
    claims: ['Dark circle treatment', 'Lightweight formula', 'Vitamin E enriched', 'All skin types', 'Gentle care', 'Eye area hydration']
  },
  {
    name: 'rich-eye-cream',
    displayName: 'Rich Eye Cream',
    description: 'An intensive eye treatment featuring Niacinamide, Vitamin E, and Panthenol in a rich formula. Targets both dark circles and dullness around the eye area for all skin types.',
    claims: ['Intensive eye treatment', 'Rich formula', 'Dark circle reduction', 'Anti-dullness', 'Niacinamide', 'Vitamin E', 'Panthenol', 'Triple-action']
  },
  {
    name: 'miracle-cream',
    displayName: 'Miracle Cream',
    description: 'A rich, deeply nourishing cream enriched with Shea Butter, designed to provide intensive hydration for dry and all skin types. The ultimate comfort cream for lasting moisture and skin barrier support.',
    claims: ['Rich formula', 'Deep nourishment', 'Shea Butter', 'Intensive hydration', 'Dry skin care', 'Barrier support', 'All skin types']
  },
  {
    name: 'oil-free-moisturizer',
    displayName: 'Oil Free Moisturizer',
    description: 'A lightweight, oil-free moisturizer formulated with Vitamin E and Niacinamide specifically for oily skin. Provides essential hydration without clogging pores or adding unwanted shine.',
    claims: ['Oil-free formula', 'Lightweight hydration', 'Oily skin specific', 'Non-comedogenic', 'Vitamin E', 'Niacinamide', 'Shine-free', 'Pore-friendly']
  },
  {
    name: 'light-moisture-cream',
    displayName: 'Light Moisture Cream',
    description: 'A lightweight moisturizing cream enhanced with Niacinamide, suitable for all skin types. Provides balanced hydration without heaviness, perfect for daily use.',
    claims: ['Lightweight moisturizer', 'Niacinamide enriched', 'All skin types', 'Balanced hydration', 'Daily use', 'Non-heavy formula']
  },
  {
    name: 'cleansing-stick',
    displayName: 'Cleansing Stick',
    description: 'A convenient cleansing stick infused with Vitamin E and Jojoba Oil that provides medium coverage cleansing while nourishing the skin. Perfect for all skin types and on-the-go cleansing.',
    claims: ['Convenient stick format', 'Medium coverage cleansing', 'Vitamin E', 'Jojoba Oil', 'Nourishing cleanse', 'All skin types', 'Portable']
  },
  {
    name: 'soft-skin-cream-cleanser',
    displayName: 'Soft Skin Cream Cleanser',
    description: 'A gentle, lightweight cream cleanser that effectively removes impurities while maintaining skin\'s natural moisture balance. Suitable for all skin types seeking a soft, comfortable cleanse.',
    claims: ['Gentle cleanser', 'Lightweight formula', 'Moisture-balancing', 'All skin types', 'Soft cleanse', 'Comfort cleansing']
  },
  {
    name: 'shower-gel',
    displayName: 'Shower Gel',
    description: 'A refreshing shower gel enriched with Niacinamide, designed to cleanse and care for all skin types while providing a luxurious bathing experience.',
    claims: ['Niacinamide enriched', 'All skin types', 'Refreshing cleanse', 'Luxurious experience', 'Body care']
  },

  // MAKEUP PRODUCTS
  {
    name: 'tinted-face-powder',
    displayName: 'Tinted Face Powder',
    description: 'A lightweight, matte-finish face powder that provides light coverage while targeting dullness and dark circles. Specially formulated for all skin types, with particular benefits for oily skin.',
    claims: ['Matte finish', 'Lightweight formula', 'Light coverage', 'Anti-dullness', 'Dark circle coverage', 'Oil control', 'All skin types']
  },
  {
    name: 'the-mascara',
    displayName: 'The Mascara',
    description: 'A natural-finish mascara enriched with Vitamin E and Panthenol to nourish lashes while providing definition and length. Gentle enough for all skin types and sensitive eyes.',
    claims: ['Natural finish', 'Lash nourishing', 'Vitamin E', 'Panthenol', 'Gentle formula', 'All skin types', 'Definition and length']
  },
  {
    name: 'the-best-pencil',
    displayName: 'The Best Pencil',
    description: 'A versatile pencil enriched with Vitamin E, delivering natural-looking definition for eyes or lips. Suitable for all skin types and perfect for creating precise, everyday looks.',
    claims: ['Versatile pencil', 'Natural finish', 'Vitamin E enriched', 'Precise application', 'All skin types', 'Everyday use']
  },
  {
    name: 'the-brow-pencil',
    displayName: 'The Brow Pencil',
    description: 'A natural-finish brow pencil enriched with nourishing Shea Butter. Creates defined, natural-looking brows while caring for the delicate brow area, suitable for all skin types.',
    claims: ['Natural brow definition', 'Shea Butter enriched', 'Nourishing formula', 'All skin types', 'Precise application']
  },
  {
    name: 'the-brow-gel',
    displayName: 'The Brow Gel',
    description: 'A lightweight brow gel powered by Panthenol and Vitamin E that sets and nourishes brows while providing natural-looking hold. Suitable for all skin types.',
    claims: ['Lightweight gel', 'Natural hold', 'Panthenol', 'Vitamin E', 'Nourishing', 'All skin types', 'Brow setting']
  },
  {
    name: 'gel-liner',
    displayName: 'Gel Liner',
    description: 'A smooth, natural-finish gel liner that glides on effortlessly for precise eye definition. Suitable for all skin types and perfect for creating both subtle and dramatic looks.',
    claims: ['Natural finish', 'Smooth application', 'Precise definition', 'All skin types', 'Versatile looks', 'Gel formula']
  },
  {
    name: 'the-face-pencil',
    displayName: 'The Face Pencil',
    description: 'A medium-coverage face pencil enriched with Shea Butter and Vitamin E. Provides natural-looking coverage for redness, dark circles, hyperpigmentation, and dullness across all skin types.',
    claims: ['Medium coverage', 'Multi-correcting', 'Redness reduction', 'Dark circle coverage', 'Anti-hyperpigmentation', 'Anti-dullness', 'Shea Butter', 'Vitamin E']
  },
  {
    name: 'the-neutralizer',
    displayName: 'The Neutralizer',
    description: 'A lightweight, natural-finish concealer with medium coverage, enriched with Shea Butter and Vitamin E. Specifically targets dark circles and dullness for all skin types.',
    claims: ['Natural finish', 'Medium coverage', 'Dark circle neutralizing', 'Anti-dullness', 'Lightweight formula', 'Shea Butter', 'Vitamin E']
  },
  {
    name: 'gel-bronzer',
    displayName: 'Gel Bronzer',
    description: 'A lightweight gel bronzer enriched with Shea Butter that provides natural-looking warmth and targets dullness. Suitable for all skin types with an easy-to-blend formula.',
    claims: ['Gel formula', 'Natural warmth', 'Lightweight', 'Anti-dullness', 'Shea Butter', 'All skin types', 'Easy-blend']
  },
  {
    name: 'the-best-blush',
    displayName: 'The Best Blush',
    description: 'A natural-finish blush that provides light, buildable color for all skin types. Creates a healthy, natural-looking flush that complements any complexion.',
    claims: ['Natural finish', 'Light coverage', 'Buildable color', 'All skin types', 'Healthy flush', 'Complementary shades']
  },
  {
    name: 'the-bronzer',
    displayName: 'The Bronzer',
    description: 'A natural-finish bronzer that provides light coverage while targeting dullness. Perfect for adding warmth and dimension to all skin types.',
    claims: ['Natural finish', 'Light coverage', 'Anti-dullness', 'Warmth-adding', 'All skin types', 'Dimension-creating']
  },
  {
    name: 'just-enough-tinted-moisturizer',
    displayName: 'Just Enough Tinted Moisturizer',
    description: 'A lightweight tinted moisturizer enriched with Vitamin E that provides natural-looking light coverage while addressing redness and hyperpigmentation. Perfect for all skin types seeking effortless coverage.',
    claims: ['Tinted moisturizer', 'Lightweight formula', 'Natural coverage', 'Redness-reducing', 'Anti-hyperpigmentation', 'Vitamin E', 'Effortless coverage']
  },
  {
    name: 'what-the-foundation',
    displayName: 'What the Foundation',
    description: 'A rich, natural-finish foundation enriched with Hyaluronic Acid and Vitamin E. Provides light coverage while targeting redness, hyperpigmentation, and dullness for normal, dry, and combination skin types.',
    claims: ['Natural finish', 'Light coverage', 'Hyaluronic Acid', 'Vitamin E', 'Multi-correcting', 'Redness reduction', 'Anti-hyperpigmentation', 'Anti-dullness']
  },
  {
    name: 'the-best-eyeshadow',
    displayName: 'The Best Eyeshadow',
    description: 'Versatile eyeshadows available in natural and shimmer finishes with medium to light coverage. Suitable for all skin types and perfect for creating endless eye looks.',
    claims: ['Versatile shades', 'Natural and shimmer finishes', 'Medium to light coverage', 'All skin types', 'Endless possibilities']
  },
  {
    name: 'just-a-sec',
    displayName: 'Just A Sec',
    description: 'A quick-application shimmer product with light coverage, enriched with Vitamin E. Perfect for adding instant radiance to all skin types with minimal effort.',
    claims: ['Quick application', 'Shimmer finish', 'Light coverage', 'Vitamin E', 'Instant radiance', 'All skin types', 'Effortless glow']
  },
  {
    name: 'sparkle-wash',
    displayName: 'Sparkle Wash',
    description: 'A lightweight shimmer wash that provides light, luminous coverage for all skin types. Perfect for adding a subtle sparkle and glow to any look.',
    claims: ['Shimmer wash', 'Lightweight formula', 'Light coverage', 'Luminous finish', 'All skin types', 'Subtle sparkle']
  },

  // LIP PRODUCTS
  {
    name: 'hippie-stick',
    displayName: 'Hippie Stick',
    description: 'A rich, nourishing lip balm enriched with Shea Butter and Vitamin E. Provides intensive moisture and care for all skin types, perfect for daily lip maintenance.',
    claims: ['Rich formula', 'Nourishing', 'Shea Butter', 'Vitamin E', 'Intensive moisture', 'All skin types', 'Daily care']
  },
  {
    name: 'mini-hippie-stick',
    displayName: 'Mini Hippie Stick',
    description: 'The beloved Hippie Stick formula in a convenient mini size. Features the same rich, nourishing blend of Shea Butter and Vitamin E for all skin types.',
    claims: ['Mini size', 'Rich formula', 'Nourishing', 'Shea Butter', 'Vitamin E', 'Portable care', 'All skin types']
  },
  {
    name: 'the-lippie-stick',
    displayName: 'The Lippie Stick',
    description: 'A natural-finish lip color with light to medium coverage, enriched with Jojoba Oil and Vitamin E. Provides beautiful color while nourishing lips for all skin types.',
    claims: ['Natural finish', 'Light to medium coverage', 'Jojoba Oil', 'Vitamin E', 'Nourishing color', 'All skin types']
  },
  {
    name: 'lip-cheek-stick',
    displayName: 'Lip & Cheek Stick',
    description: 'A versatile stick with natural finish and light coverage, enriched with Vitamin E. Perfect for adding a pop of color to lips and cheeks for all skin types.',
    claims: ['Dual-use', 'Natural finish', 'Light coverage', 'Vitamin E', 'Versatile color', 'All skin types', 'Multi-purpose']
  },
  {
    name: 'the-lip-tint',
    displayName: 'The Lip Tint',
    description: 'A lightweight lip tint with natural finish and medium coverage, enriched with Vitamin E. Provides long-lasting color that feels comfortable on all skin types.',
    claims: ['Lightweight tint', 'Natural finish', 'Medium coverage', 'Vitamin E', 'Long-lasting color', 'All skin types']
  },
  {
    name: 'the-lip-pencil',
    displayName: 'The Lip Pencil',
    description: 'A precise lip pencil with natural finish and medium coverage, enriched with Vitamin E. Perfect for defining and lining lips for all skin types.',
    claims: ['Precise application', 'Natural finish', 'Medium coverage', 'Vitamin E', 'Lip defining', 'All skin types']
  },
  {
    name: 'the-classic-lip',
    displayName: 'The Classic Lip',
    description: 'A timeless lip color with natural finish and medium coverage, enriched with Vitamin E. Offers classic, wearable shades suitable for all skin types.',
    claims: ['Classic shades', 'Natural finish', 'Medium coverage', 'Vitamin E', 'Timeless appeal', 'All skin types']
  },
  {
    name: 'cool-gloss',
    displayName: 'Cool Gloss',
    description: 'A luminous lip gloss with shimmer and glow finish, featuring light coverage and enriched with Shea Butter and Vitamin E. Perfect for adding dimension and shine to all skin types.',
    claims: ['Shimmer and glow', 'Light coverage', 'Luminous finish', 'Shea Butter', 'Vitamin E', 'Dimensional shine', 'All skin types']
  },

  // SPECIALTY & GIFT SETS
  {
    name: 'universal-hair-balm',
    displayName: 'Universal Hair Balm',
    description: 'A rich, multi-use hair balm designed to nourish, protect, and add shine to all hair types. Perfect for taming flyaways, adding moisture, and creating sleek styles.',
    claims: ['Universal formula', 'Rich texture', 'Multi-use', 'All hair types', 'Nourishing', 'Shine-enhancing', 'Flyaway control']
  },
  {
    name: 'candle',
    displayName: 'Candle',
    description: 'A luxurious scented candle that complements your beauty routine with its sophisticated fragrance and elegant design.',
    claims: ['Luxurious scent', 'Sophisticated fragrance', 'Elegant design', 'Ambiance-creating']
  },
  {
    name: 'the-makeup-travel-kit-2-0',
    displayName: 'The Makeup Travel Kit 2.0',
    description: 'A curated collection of travel-sized makeup essentials with natural finish and lightweight formulas. Perfect for maintaining your beauty routine on-the-go, suitable for all skin types.',
    claims: ['Travel-sized', 'Curated collection', 'Natural finish', 'Lightweight formulas', 'On-the-go beauty', 'All skin types']
  },
  {
    name: 'the-hero-kit',
    displayName: 'The Hero Kit',
    description: 'An essential collection featuring hero products with natural finish and lightweight formulas. Perfect introduction to the brand for all skin types.',
    claims: ['Hero products', 'Essential collection', 'Natural finish', 'Lightweight formulas', 'Brand introduction', 'All skin types']
  },
  {
    name: 'nail-polish-kit',
    displayName: 'Nail Polish Kit',
    description: 'A complete nail care and color collection featuring high-quality polishes in versatile shades for creating perfect manicures at home.',
    claims: ['Complete nail care', 'High-quality polish', 'Versatile shades', 'Home manicure', 'Professional results']
  },
  {
    name: 'the-101-set',
    displayName: 'The 101 Set',
    description: 'A comprehensive starter set featuring natural finish products with light to medium coverage. Addresses dark circles, redness, hyperpigmentation, and dullness for all skin types.',
    claims: ['Comprehensive starter set', 'Natural finish', 'Multi-correcting', 'Dark circle coverage', 'Redness reduction', 'Anti-hyperpigmentation', 'Anti-dullness']
  },
  {
    name: 'the-skincare-travel-kit',
    displayName: 'The Skincare Travel Kit',
    description: 'A curated collection of travel-sized skincare essentials with natural finish and medium-weight formulas. Targets dullness while maintaining your skincare routine on-the-go for all skin types.',
    claims: ['Travel-sized skincare', 'Curated essentials', 'Anti-dullness', 'Medium-weight formulas', 'On-the-go routine', 'All skin types']
  },
  {
    name: 'the-complexion-set',
    displayName: 'The Complexion Set',
    description: 'A complete complexion collection featuring medium coverage products designed to address redness, dullness, dark circles, and hyperpigmentation for all skin types.',
    claims: ['Complete complexion care', 'Medium coverage', 'Multi-correcting', 'Redness reduction', 'Anti-dullness', 'Dark circle coverage', 'Anti-hyperpigmentation']
  },
  {
    name: 'fragrance-final-component',
    displayName: 'Fragrance (Final Component)',
    description: 'A signature fragrance that embodies the brand\'s philosophy of natural beauty and effortless elegance.',
    claims: ['Signature scent', 'Natural beauty', 'Effortless elegance', 'Brand philosophy']
  },
  {
    name: 'fragrance-2025-lab-launch',
    displayName: 'Fragrance 2025 (Lab Launch)',
    description: 'An innovative new fragrance launching from our labs, representing the next evolution in the brand\'s scent collection.',
    claims: ['Innovation', 'Lab-developed', 'Next evolution', 'New launch', 'Advanced formulation']
  }
];

export async function seedProductsAndClaims() {
  try {
    console.log('Seeding products and claims...');
    
    for (const productInfo of productData) {
      // First, try to find existing product by name
      const [existingProduct] = await db.select().from(products).where(eq(products.name, productInfo.name));
      
      let productId: string;
      
      if (existingProduct) {
        // Update existing product with description
        console.log(`Updating product: ${productInfo.displayName}`);
        const [updatedProduct] = await db.update(products)
          .set({ 
            description: productInfo.description,
            updatedAt: new Date()
          })
          .where(eq(products.id, existingProduct.id))
          .returning();
        productId = updatedProduct.id;
      } else {
        // Create new product
        console.log(`Creating new product: ${productInfo.displayName}`);
        const [newProduct] = await db.insert(products).values({
          name: productInfo.name,
          displayName: productInfo.displayName,
          description: productInfo.description,
          isActive: 'true',
          sortOrder: 0
        }).returning();
        productId = newProduct.id;
      }
      
      // Clear existing claims for this product
      await db.delete(productClaims).where(eq(productClaims.productId, productId));
      
      // Add new claims
      const claimsToInsert = productInfo.claims.map((claim, index) => ({
        productId,
        claimText: claim,
        claimType: 'approved' as const,
        isEnabled: 'true',
        sortOrder: index
      }));
      
      if (claimsToInsert.length > 0) {
        await db.insert(productClaims).values(claimsToInsert);
        console.log(`Added ${claimsToInsert.length} claims for ${productInfo.displayName}`);
      }
    }
    
    console.log(`Successfully seeded ${productData.length} products with descriptions and claims`);
  } catch (error) {
    console.error('Error seeding products and claims:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductsAndClaims()
    .then(() => {
      console.log('Products and claims seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Products and claims seeding failed:', error);
      process.exit(1);
    });
} 