import { db } from './db.js';
import { products } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { generateProductSlug } from '@shared/utils';

/**
 * Clean up products database:
 * 1. Remove duplicates (keep the first occurrence)
 * 2. Remove products not in the approved list
 * 3. Standardize names for remaining products
 */
export async function cleanupProducts() {
  console.log('🧹 Starting product database cleanup...');
  
  // Approved products list (as provided by user)
  const approvedProducts = [
    'Miracle Balm',
    'Miracle Balm Palette',
    'Everyday Sunscreen Broad Spectrum SPF 30',
    'Shimmer Face Oil',
    'The Oil Stick',
    'Multivitamin Serum',
    'Tinted Face Powder',
    'The Mascara',
    'The Best Pencil',
    'The Brow Pencil',
    'The Brow Gel',
    'Gel Liner',
    'The Face Pencil',
    'The Neutralizer',
    'Gel Bronzer',
    'The Best Blush',
    'The Bronzer',
    'Just Enough Tinted Moizturizer', // Note: keeping the typo as specified
    'What the Foundation',
    'Eye Cream',
    'Hippie Stick',
    'Mini Hippie Stick',
    'Cleansing Stick',
    'Miracle Cream',
    'Oil Free Moisturizer',
    'Light Moisture Cream',
    'Rich Eye Cream',
    'Soft Skin Cream Cleanser',
    'The Lippie Stick',
    'Lip & Cheek Stick',
    'The Lip Tint',
    'The Lip Pencil',
    'The Classic Lip',
    'Universal Hair Balm',
    'Candle',
    'Shower Gel',
    'The Makeup Travel Kit 2.0',
    'The Hero Kit',
    'Nail Polish Kit',
    'The 101 Set',
    'The Skincare Travel Kit',
    'The Best Eyeshadow',
    'Just A Sec',
    'Sparkle Wash',
    'Cool Gloss',
    'Fragrance (Final Component)',
    'Fragrance 2025 (Lab Launch)',
    'The Complexion Set'
  ];

  try {
    // Get all products
    const allProducts = await db.select().from(products);
    console.log(`📊 Found ${allProducts.length} products in database`);
    
    // Step 1: Identify products to keep based on approved list
    const approvedSlugs = new Set(approvedProducts.map(name => generateProductSlug(name)));
    console.log(`✅ Approved products: ${approvedProducts.length}`);
    
    // Step 2: Find products that match approved list (by slug or display name)
    const productsToKeep = new Map<string, any>();
    const productsToDelete: string[] = [];
    
    for (const product of allProducts) {
      const productSlug = generateProductSlug(product.displayName);
      
      // Check if this product matches an approved product
      const isApproved = approvedSlugs.has(productSlug) || 
                        approvedProducts.some(approved => 
                          approved.toLowerCase() === product.displayName.toLowerCase() ||
                          generateProductSlug(approved) === productSlug
                        );
      
      if (isApproved) {
        // Check for duplicates - keep the first one we encounter
        if (!productsToKeep.has(productSlug)) {
          productsToKeep.set(productSlug, product);
          console.log(`✅ Keeping: "${product.displayName}" (${product.id})`);
        } else {
          console.log(`🗑️  Duplicate found: "${product.displayName}" (${product.id}) - will be deleted`);
          productsToDelete.push(product.id);
        }
      } else {
        console.log(`❌ Not approved: "${product.displayName}" (${product.id}) - will be deleted`);
        productsToDelete.push(product.id);
      }
    }
    
    // Step 3: Delete unwanted products
    if (productsToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${productsToDelete.length} products...`);
      
      // Delete in batches using inArray for efficiency
      const batchSize = 50;
      for (let i = 0; i < productsToDelete.length; i += batchSize) {
        const batch = productsToDelete.slice(i, i + batchSize);
        await db.delete(products).where(inArray(products.id, batch));
        console.log(`   Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(productsToDelete.length/batchSize)} (${batch.length} products)`);
      }
    }
    
    // Step 4: Standardize names for remaining products
    console.log(`\n🔧 Standardizing names for remaining products...`);
    let standardizedCount = 0;
    
    for (const [slug, product] of productsToKeep) {
      const properName = generateProductSlug(product.displayName);
      let properDisplayName = product.displayName;
      
      // Find the matching approved product name for proper capitalization
      const matchingApproved = approvedProducts.find(approved => 
        generateProductSlug(approved) === slug
      );
      
      if (matchingApproved) {
        properDisplayName = matchingApproved;
      } else if (product.displayName.includes('-') && !product.displayName.includes(' ')) {
        // Convert slug-style to proper display name
                 properDisplayName = product.displayName
           .split('-')
           .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
           .join(' ');
      }
      
      // Update if needed
      if (product.name !== properName || product.displayName !== properDisplayName) {
        await db
          .update(products)
          .set({
            name: properName,
            displayName: properDisplayName,
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));
        
        console.log(`📝 Updated: "${product.displayName}" → "${properDisplayName}"`);
        standardizedCount++;
      }
    }
    
    // Final summary
    const finalProducts = await db.select().from(products);
    
    console.log(`\n🎉 Product cleanup complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Original products: ${allProducts.length}`);
    console.log(`   - Products deleted: ${productsToDelete.length}`);
    console.log(`   - Products kept: ${productsToKeep.size}`);
    console.log(`   - Names standardized: ${standardizedCount}`);
    console.log(`   - Final product count: ${finalProducts.length}`);
    
    // Show final product list
    console.log(`\n📋 Final product list:`);
    finalProducts
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.displayName}" (${product.name})`);
      });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupProducts()
    .then(() => {
      console.log('✅ Cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
} 