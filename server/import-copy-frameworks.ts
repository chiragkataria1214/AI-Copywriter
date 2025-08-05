import { db } from './db';
import { copyFrameworks } from '../shared/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CopyFrameworkJson {
  id: string;
  framework_type: 'headline_framework' | 'primary_text_rule' | 'brand_first_guideline' | 'direct_response_guideline';
  name: string | null;
  description: string | null;
  template: string | null;
  examples: string[] | null;
  rule_text: string | null;
  is_enabled: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function importCopyFrameworks() {
  try {
    console.log('Importing copy frameworks from JSON file...');
    
    // Read the JSON file
    const jsonPath = join(process.cwd(), 'copy_frameworks.json');
    const jsonData = readFileSync(jsonPath, 'utf-8');
    const frameworks: CopyFrameworkJson[] = JSON.parse(jsonData);
    
    console.log(`Found ${frameworks.length} frameworks in JSON file`);
    
    // Clear existing frameworks
    await db.delete(copyFrameworks);
    console.log('Cleared existing copy frameworks');
    
    // Transform and insert frameworks
    const transformedFrameworks = frameworks.map(framework => ({
      id: framework.id,
      frameworkType: framework.framework_type,
      name: framework.name,
      description: framework.description,
      template: framework.template,
      examples: framework.examples,
      ruleText: framework.rule_text,
      isEnabled: framework.is_enabled,
      sortOrder: framework.sort_order,
      createdAt: new Date(framework.created_at),
      updatedAt: new Date(framework.updated_at)
    }));
    
    // Insert frameworks in batches
    await db.insert(copyFrameworks).values(transformedFrameworks);
    
    console.log(`Successfully imported ${transformedFrameworks.length} copy frameworks`);
    
    // Verify import
    const imported = await db.select().from(copyFrameworks);
    console.log(`Verification: ${imported.length} frameworks now in database`);
    
    // Show breakdown by type
    const headlineCount = imported.filter(f => f.frameworkType === 'headline_framework').length;
    const primaryTextCount = imported.filter(f => f.frameworkType === 'primary_text_rule').length;
    const brandFirstCount = imported.filter(f => f.frameworkType === 'brand_first_guideline').length;
    const directResponseCount = imported.filter(f => f.frameworkType === 'direct_response_guideline').length;
    
    console.log(`Breakdown:`);
    console.log(`- Headline frameworks: ${headlineCount}`);
    console.log(`- Primary text rules: ${primaryTextCount}`);
    console.log(`- Brand-first guidelines: ${brandFirstCount}`);
    console.log(`- Direct response guidelines: ${directResponseCount}`);
    
  } catch (error) {
    console.error('Error importing copy frameworks:', error);
    throw error;
  }
}

// Run import if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importCopyFrameworks()
    .then(() => {
      console.log('Copy frameworks import completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Copy frameworks import failed:', error);
      process.exit(1);
    });
} 