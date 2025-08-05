import { db } from "./db";
import { emailFrameworks } from "@shared/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

async function updateCompleteFrameworks() {
  try {
    console.log("Reading complete framework content from attached file...");
    
    // Read the complete file content
    const fileContent = readFileSync('attached_assets/Pasted-1-GTL-Get-the-Look-Purpose-Show-how-to-recreate-a-full-look-or-theme-using-multiple-products-Fr-1754400504155_1754400504156.txt', 'utf8');
    
    // Split the content by framework sections
    const sections = fileContent.split(/(?=^\d+\.\s)/m);
    
    const frameworkMap: Record<string, string> = {};
    
    // Process each section
    for (const section of sections) {
      if (!section.trim()) continue;
      
      const lines = section.split('\n');
      const firstLine = lines[0];
      
      // Extract framework name and map to database key
      if (firstLine.includes('GTL (Get the Look)')) {
        frameworkMap['gtl'] = section.trim();
      } else if (firstLine.includes('Plain Text / Letter-Style Note')) {
        frameworkMap['plain_text'] = section.trim();
      } else if (firstLine.includes('Product Spotlight / Hero Product')) {
        frameworkMap['product_spotlight'] = section.trim();
      } else if (firstLine.includes('Product Roundup / Theme-Based Edit')) {
        frameworkMap['product_roundup'] = section.trim();
      } else if (firstLine.includes('Back in Stock')) {
        frameworkMap['back_in_stock'] = section.trim();
      } else if (firstLine.includes('Product Launch')) {
        frameworkMap['product_launch'] = section.trim();
      } else if (firstLine.includes('Teaser Email (Pre-Launch)')) {
        frameworkMap['teaser'] = section.trim();
      } else if (firstLine.includes('Retail Event / Pop-Up / IRL Activation')) {
        frameworkMap['retail_event'] = section.trim();
      } else if (firstLine.includes('Promotional Email')) {
        frameworkMap['promotional'] = section.trim();
      } else if (firstLine.includes('Set or Kit Email')) {
        frameworkMap['set_or_kit'] = section.trim();
      } else if (firstLine.includes('How-To (Problem/Solution)')) {
        frameworkMap['how_to_problem_solution'] = section.trim();
      } else if (firstLine.includes('Duos or Product Combinations')) {
        frameworkMap['duos_or_combinations'] = section.trim();
      } else if (firstLine.includes('Shade Roundup')) {
        frameworkMap['shade_roundup'] = section.trim();
      } else if (firstLine.includes('How to Use It (Product Tutorial)')) {
        frameworkMap['how_to_use_tutorial'] = section.trim();
      } else if (firstLine.includes('Social Proof')) {
        frameworkMap['social_proof'] = section.trim();
      }
    }
    
    console.log(`Found ${Object.keys(frameworkMap).length} frameworks to update`);
    
    // Update each framework in the database
    for (const [name, content] of Object.entries(frameworkMap)) {
      try {
        console.log(`Updating framework: ${name}`);
        const [updated] = await db
          .update(emailFrameworks)
          .set({ frameworkContent: content })
          .where(eq(emailFrameworks.name, name))
          .returning();
          
        if (updated) {
          console.log(`✓ Updated ${name}: ${updated.displayName}`);
        } else {
          console.log(`⚠ Framework not found: ${name}`);
        }
      } catch (error) {
        console.error(`Error updating framework ${name}:`, error);
      }
    }
    
    console.log("Complete framework content update finished!");
  } catch (error) {
    console.error("Error updating complete frameworks:", error);
  }
}

// Run the update
updateCompleteFrameworks();