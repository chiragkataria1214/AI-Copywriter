// Migration script to move all hardcoded data from training-config.ts to database
import { db } from "./db";
import { storage } from "./storage";
import { defaultTrainingConfig } from "@shared/training-config";

async function migrateProducts() {
  console.log("🏗️ Migrating products and product claims...");
  
  // Define all products from various sources in the codebase
  const productsData = [
    { name: "foundation", displayName: "What The Foundation", description: "Jones Road Beauty's signature foundation" },
    { name: "mascara", displayName: "Miracle Mascara", description: "Lengthening and volumizing mascara" },
    { name: "sunscreen", displayName: "SPF 30 Face Cream", description: "Mineral sunscreen with skincare benefits" },
    { name: "miracleBalm", displayName: "Miracle Balm", description: "Multi-use balm for lips and cheeks" },
    { name: "justEnough", displayName: "Just Enough", description: "Lightweight coverage foundation" },
    { name: "heroKit", displayName: "Hero Kit", description: "Essential beauty products starter set" },
    { name: "lipStick", displayName: "Lip Stick", description: "Nourishing lip color" },
    { name: "facePencil", displayName: "Face Pencil", description: "Multi-use pencil for eyes and brows" },
    { name: "cleanser", displayName: "Gentle Cleanser", description: "Daily facial cleanser" },
    { name: "serum", displayName: "Face Serum", description: "Hydrating face serum" },
    { name: "eyeCream", displayName: "Eye Cream", description: "Nourishing eye treatment" },
    { name: "bronzer", displayName: "Bronzer", description: "Natural bronzing powder" },
    { name: "blush", displayName: "Blush", description: "Natural cheek color" },
    { name: "primer", displayName: "Face Primer", description: "Makeup base primer" },
    { name: "setting_spray", displayName: "Setting Spray", description: "Makeup setting spray" },
    { name: "lip_gloss", displayName: "Lip Gloss", description: "Glossy lip color" }
  ];

  // Create products
  const createdProducts = new Map();
  for (let i = 0; i < productsData.length; i++) {
    const productData = productsData[i];
    try {
      const product = await storage.createProduct({
        name: productData.name,
        displayName: productData.displayName,
        description: productData.description,
        isActive: "true",
        sortOrder: i
      });
      createdProducts.set(productData.name, product);
      console.log(`✅ Created product: ${productData.displayName}`);
    } catch (error) {
      console.log(`⚠️ Product ${productData.displayName} may already exist`);
    }
  }

  // Migrate product claims from defaultTrainingConfig
  const productClaims = defaultTrainingConfig.productClaims || {};
  
  for (const [productKey, claims] of Object.entries(productClaims)) {
    const product = createdProducts.get(productKey);
    if (!product) {
      console.log(`⚠️ Product ${productKey} not found for claims migration`);
      continue;
    }

    // Add approved claims
    if (claims.approvedClaims) {
      for (let i = 0; i < claims.approvedClaims.length; i++) {
        const claimText = claims.approvedClaims[i];
        if (claimText && claimText.trim()) {
          try {
            await storage.createProductClaim({
              productId: product.id,
              claimText: claimText.trim(),
              claimType: "approved",
              isEnabled: "true",
              sortOrder: i
            });
          } catch (error) {
            console.log(`⚠️ Approved claim may already exist: ${claimText}`);
          }
        }
      }
    }

    // Add prohibited claims
    if (claims.prohibitedClaims) {
      for (let i = 0; i < claims.prohibitedClaims.length; i++) {
        const claimText = claims.prohibitedClaims[i];
        if (claimText && claimText.trim()) {
          try {
            await storage.createProductClaim({
              productId: product.id,
              claimText: claimText.trim(),
              claimType: "prohibited",
              isEnabled: "true",
              sortOrder: i
            });
          } catch (error) {
            console.log(`⚠️ Prohibited claim may already exist: ${claimText}`);
          }
        }
      }
    }

    console.log(`✅ Migrated claims for ${product.displayName}`);
  }
}

async function migratePersonas() {
  console.log("👥 Migrating personas and persona pillars...");
  
  // Define personas from training config
  const personasData = [
    { name: "Mom", displayName: "Mom", description: "Busy mothers needing quick, effective beauty routines" },
    { name: "Professional Woman", displayName: "Professional Woman", description: "Career-focused women seeking polished looks" },
    { name: "Beauty Enthusiast", displayName: "Beauty Enthusiast", description: "Beauty lovers interested in quality ingredients" },
    { name: "Minimalist", displayName: "Minimalist", description: "Those preferring simple, multi-purpose products" }
  ];

  // Create personas
  const createdPersonas = new Map();
  for (let i = 0; i < personasData.length; i++) {
    const personaData = personasData[i];
    try {
      const persona = await storage.createPersona({
        name: personaData.name,
        displayName: personaData.displayName,
        description: personaData.description,
        isActive: "true",
        sortOrder: i
      });
      createdPersonas.set(personaData.name, persona);
      console.log(`✅ Created persona: ${personaData.displayName}`);
    } catch (error) {
      console.log(`⚠️ Persona ${personaData.displayName} may already exist`);
    }
  }

  // Migrate persona pillars from defaultTrainingConfig
  const personaPillars = defaultTrainingConfig.personaPillars || {};
  
  for (const [personaKey, data] of Object.entries(personaPillars)) {
    const persona = createdPersonas.get(personaKey);
    if (!persona) {
      console.log(`⚠️ Persona ${personaKey} not found for pillars migration`);
      continue;
    }

    if (data.pillars) {
      for (let i = 0; i < data.pillars.length; i++) {
        const pillarText = data.pillars[i];
        if (pillarText && pillarText.trim()) {
          try {
            await storage.createPersonaPillar({
              personaId: persona.id,
              pillarText: pillarText.trim(),
              isEnabled: "true",
              sortOrder: i
            });
          } catch (error) {
            console.log(`⚠️ Persona pillar may already exist: ${pillarText}`);
          }
        }
      }
    }

    console.log(`✅ Migrated pillars for ${persona.displayName}`);
  }
}

async function migrateBrandConfiguration() {
  console.log("🎯 Migrating brand configuration...");
  
  const brandGuidelines = defaultTrainingConfig.brandGuidelines || {};

  // Migrate core positioning
  if (brandGuidelines.corePositioning) {
    try {
      await storage.createBrandConfiguration({
        configType: "core_positioning",
        configValue: brandGuidelines.corePositioning,
        isEnabled: "true",
        sortOrder: 0
      });
      console.log("✅ Migrated core positioning");
    } catch (error) {
      console.log("⚠️ Core positioning may already exist");
    }
  }

  // Migrate brand voice items
  if (brandGuidelines.brandVoice) {
    for (let i = 0; i < brandGuidelines.brandVoice.length; i++) {
      const voiceItem = brandGuidelines.brandVoice[i];
      if (voiceItem && voiceItem.trim()) {
        try {
          await storage.createBrandConfiguration({
            configType: "brand_voice",
            configValue: voiceItem.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Brand voice item may already exist: ${voiceItem}`);
        }
      }
    }
    console.log("✅ Migrated brand voice items");
  }

  // Migrate key terminology
  if (brandGuidelines.keyTerminology) {
    for (let i = 0; i < brandGuidelines.keyTerminology.length; i++) {
      const term = brandGuidelines.keyTerminology[i];
      if (term && term.trim()) {
        try {
          await storage.createBrandConfiguration({
            configType: "key_terminology",
            configValue: term.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Key terminology may already exist: ${term}`);
        }
      }
    }
    console.log("✅ Migrated key terminology");
  }

  // Migrate approved language
  if (brandGuidelines.approvedLanguage) {
    for (let i = 0; i < brandGuidelines.approvedLanguage.length; i++) {
      const language = brandGuidelines.approvedLanguage[i];
      if (language && language.trim()) {
        try {
          await storage.createBrandConfiguration({
            configType: "approved_language",
            configValue: language.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Approved language may already exist: ${language}`);
        }
      }
    }
    console.log("✅ Migrated approved language");
  }

  // Migrate avoided language
  if (brandGuidelines.avoidedLanguage) {
    for (let i = 0; i < brandGuidelines.avoidedLanguage.length; i++) {
      const language = brandGuidelines.avoidedLanguage[i];
      if (language && language.trim()) {
        try {
          await storage.createBrandConfiguration({
            configType: "avoided_language",
            configValue: language.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Avoided language may already exist: ${language}`);
        }
      }
    }
    console.log("✅ Migrated avoided language");
  }
}

async function migrateCopyFrameworks() {
  console.log("📝 Migrating copy frameworks...");
  
  const copyFrameworks = defaultTrainingConfig.copyFrameworks || {};

  // Migrate headline frameworks
  if (copyFrameworks.headlineFrameworks) {
    for (let i = 0; i < copyFrameworks.headlineFrameworks.length; i++) {
      const framework = copyFrameworks.headlineFrameworks[i];
      if (framework && framework.name) {
        try {
          await storage.createCopyFramework({
            frameworkType: "headline_framework",
            name: framework.name,
            description: framework.description,
            template: framework.template,
            examples: framework.examples,
            ruleText: null,
            isEnabled: "true",
            sortOrder: i
          });
          console.log(`✅ Migrated headline framework: ${framework.name}`);
        } catch (error) {
          console.log(`⚠️ Headline framework may already exist: ${framework.name}`);
        }
      }
    }
  }

  // Migrate primary text rules
  if (copyFrameworks.primaryTextRules) {
    for (let i = 0; i < copyFrameworks.primaryTextRules.length; i++) {
      const rule = copyFrameworks.primaryTextRules[i];
      if (rule && rule.trim()) {
        try {
          await storage.createCopyFramework({
            frameworkType: "primary_text_rule",
            name: null,
            description: null,
            template: null,
            examples: null,
            ruleText: rule.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Primary text rule may already exist: ${rule}`);
        }
      }
    }
    console.log("✅ Migrated primary text rules");
  }

  // Migrate brand first guidelines
  if (copyFrameworks.brandDrBalance?.brandFirst) {
    for (let i = 0; i < copyFrameworks.brandDrBalance.brandFirst.length; i++) {
      const guideline = copyFrameworks.brandDrBalance.brandFirst[i];
      if (guideline && guideline.trim()) {
        try {
          await storage.createCopyFramework({
            frameworkType: "brand_first_guideline",
            name: null,
            description: null,
            template: null,
            examples: null,
            ruleText: guideline.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Brand first guideline may already exist: ${guideline}`);
        }
      }
    }
    console.log("✅ Migrated brand first guidelines");
  }

  // Migrate direct response guidelines
  if (copyFrameworks.brandDrBalance?.directResponse) {
    for (let i = 0; i < copyFrameworks.brandDrBalance.directResponse.length; i++) {
      const guideline = copyFrameworks.brandDrBalance.directResponse[i];
      if (guideline && guideline.trim()) {
        try {
          await storage.createCopyFramework({
            frameworkType: "direct_response_guideline",
            name: null,
            description: null,
            template: null,
            examples: null,
            ruleText: guideline.trim(),
            isEnabled: "true",
            sortOrder: i
          });
        } catch (error) {
          console.log(`⚠️ Direct response guideline may already exist: ${guideline}`);
        }
      }
    }
    console.log("✅ Migrated direct response guidelines");
  }
}

async function migrateSystemConfiguration() {
  console.log("⚙️ Migrating system configuration...");

  const config = defaultTrainingConfig;

  // Migrate system prompts
  if (config.systemPrompts) {
    for (const [key, value] of Object.entries(config.systemPrompts)) {
      try {
        await storage.setSystemConfigValue(
          `systemPrompts.${key}`,
          value,
          `System prompt for ${key}`
        );
        console.log(`✅ Migrated system prompt: ${key}`);
      } catch (error) {
        console.log(`⚠️ System prompt may already exist: ${key}`);
      }
    }
  }

  // Migrate user prompt templates
  if (config.userPromptTemplates) {
    for (const [key, value] of Object.entries(config.userPromptTemplates)) {
      try {
        await storage.setSystemConfigValue(
          `userPromptTemplates.${key}`,
          value,
          `User prompt template for ${key}`
        );
        console.log(`✅ Migrated user prompt template: ${key}`);
      } catch (error) {
        console.log(`⚠️ User prompt template may already exist: ${key}`);
      }
    }
  }

  // Migrate model parameters
  if (config.modelParameters) {
    for (const [key, value] of Object.entries(config.modelParameters)) {
      try {
        await storage.setSystemConfigValue(
          `modelParameters.${key}`,
          String(value),
          `Model parameter: ${key}`
        );
        console.log(`✅ Migrated model parameter: ${key}`);
      } catch (error) {
        console.log(`⚠️ Model parameter may already exist: ${key}`);
      }
    }
  }

  // Migrate station prompts
  if (config.stationPrompts) {
    for (const [stationKey, stationData] of Object.entries(config.stationPrompts)) {
      for (const [fieldKey, fieldValue] of Object.entries(stationData)) {
        try {
          await storage.setSystemConfigValue(
            `stationPrompts.${stationKey}.${fieldKey}`,
            String(fieldValue),
            `Station prompt: ${stationKey}.${fieldKey}`
          );
          console.log(`✅ Migrated station prompt: ${stationKey}.${fieldKey}`);
        } catch (error) {
          console.log(`⚠️ Station prompt may already exist: ${stationKey}.${fieldKey}`);
        }
      }
    }
  }
}

async function runMigration() {
  console.log("🚀 Starting database migration from hardcoded data...\n");
  
  try {
    await migrateProducts();
    console.log("");
    
    await migratePersonas();
    console.log("");
    
    await migrateBrandConfiguration();
    console.log("");
    
    await migrateCopyFrameworks();
    console.log("");
    
    await migrateSystemConfiguration();
    console.log("");
    
    console.log("✅ Migration completed successfully!");
    console.log("🗄️ All hardcoded configuration data has been moved to the database.");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migration if this file is executed directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  runMigration();
}

export { runMigration };