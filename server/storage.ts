import { 
  type User, 
  type InsertUser, 
  type InsertGeneratedCopy,
  type GeneratedCopy,
  type PasswordResetToken,
  type Product,
  type InsertProduct,
  type ProductClaim,
  type InsertProductClaim,
  type Persona,
  type InsertPersona,
  type PersonaPillar,
  type InsertPersonaPillar,
  type BrandConfiguration,
  type InsertBrandConfiguration,
  type CopyFramework,
  type InsertCopyFramework,
  type SystemConfiguration,
  type InsertSystemConfiguration,
  users,
  generatedCopy,
  passwordResetTokens,
  products,
  productClaims,
  personas,
  personaPillars,
  brandConfiguration,
  copyFrameworks,
  systemConfiguration,
  adminCreateUserSchema,
  updateUserSchema
} from "@shared/schema";
import { type TrainingConfig } from "@shared/training-config";
import { db } from "./db";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin user management operations
  getAllUsers(): Promise<User[]>;
  adminCreateUser(userData: z.infer<typeof adminCreateUserSchema>): Promise<User>;
  updateUser(id: string, userData: z.infer<typeof updateUserSchema>): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  makeUserAdmin(username: string): Promise<User>;
  
  // Generated copy operations
  saveGeneratedCopy(data: InsertGeneratedCopy): Promise<GeneratedCopy>;
  updateCopyFeedback(id: string, rating: string, feedback?: string): Promise<void>;
  getCopyHistory(userId: string, limit?: number): Promise<GeneratedCopy[]>;
  getCopyAnalytics(): Promise<any>;
  
  // Password reset operations
  createPasswordResetToken(userId: string): Promise<string>;
  usePasswordResetToken(token: string): Promise<string | null>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Product claims operations
  getProductClaims(productId: string): Promise<ProductClaim[]>;
  createProductClaim(data: InsertProductClaim): Promise<ProductClaim>;
  updateProductClaim(id: string, data: Partial<InsertProductClaim>): Promise<ProductClaim>;
  deleteProductClaim(id: string): Promise<void>;
  
  // Persona operations
  getAllPersonas(): Promise<Persona[]>;
  getActivePersonas(): Promise<Persona[]>;
  getPersona(id: string): Promise<Persona | undefined>;
  createPersona(data: InsertPersona): Promise<Persona>;
  updatePersona(id: string, data: Partial<InsertPersona>): Promise<Persona>;
  deletePersona(id: string): Promise<void>;
  
  // Persona pillars operations
  getPersonaPillars(personaId: string): Promise<PersonaPillar[]>;
  createPersonaPillar(data: InsertPersonaPillar): Promise<PersonaPillar>;
  updatePersonaPillar(id: string, data: Partial<InsertPersonaPillar>): Promise<PersonaPillar>;
  deletePersonaPillar(id: string): Promise<void>;
  
  // Brand configuration operations
  getBrandConfiguration(): Promise<BrandConfiguration[]>;
  getBrandConfigurationByType(configType: string): Promise<BrandConfiguration[]>;
  createBrandConfiguration(data: InsertBrandConfiguration): Promise<BrandConfiguration>;
  updateBrandConfiguration(id: string, data: Partial<InsertBrandConfiguration>): Promise<BrandConfiguration>;
  deleteBrandConfiguration(id: string): Promise<void>;
  
  // Copy frameworks operations
  getCopyFrameworks(): Promise<CopyFramework[]>;
  getCopyFrameworksByType(frameworkType: string): Promise<CopyFramework[]>;
  createCopyFramework(data: InsertCopyFramework): Promise<CopyFramework>;
  updateCopyFramework(id: string, data: Partial<InsertCopyFramework>): Promise<CopyFramework>;
  deleteCopyFramework(id: string): Promise<void>;
  
  // System configuration operations
  getSystemConfiguration(): Promise<SystemConfiguration[]>;
  getSystemConfigValue(key: string): Promise<string | null>;
  setSystemConfigValue(key: string, value: string, description?: string): Promise<SystemConfiguration>;
  
  // Comprehensive training config getter (combines all database sources)
  getTrainingConfiguration(): Promise<any>;
  saveTrainingConfiguration(config: TrainingConfig): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Admin user management methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async adminCreateUser(userData: z.infer<typeof adminCreateUserSchema>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: z.infer<typeof updateUserSchema>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async makeUserAdmin(username: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.username, username))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async saveGeneratedCopy(data: InsertGeneratedCopy): Promise<GeneratedCopy> {
    const [copy] = await db
      .insert(generatedCopy)
      .values(data)
      .returning();
    return copy;
  }

  async updateCopyFeedback(id: string, rating: string, feedback?: string): Promise<void> {
    await db
      .update(generatedCopy)
      .set({ rating, feedback })
      .where(eq(generatedCopy.id, id));
  }

  async getCopyHistory(userId: string, limit: number = 50): Promise<GeneratedCopy[]> {
    return await db
      .select()
      .from(generatedCopy)
      .where(eq(generatedCopy.userId, userId))
      .orderBy(desc(generatedCopy.createdAt))
      .limit(limit);
  }

  async getCopyAnalytics(): Promise<any> {
    const totalCopies = await db
      .select({ count: count() })
      .from(generatedCopy);

    const ratingStats = await db
      .select({
        rating: generatedCopy.rating,
        count: count()
      })
      .from(generatedCopy)
      .where(sql`${generatedCopy.rating} IS NOT NULL`)
      .groupBy(generatedCopy.rating);

    const avgGenerationTime = await db
      .select({ 
        avgTime: avg(generatedCopy.generationTimeMs)
      })
      .from(generatedCopy)
      .where(sql`${generatedCopy.generationTimeMs} IS NOT NULL`);

    return {
      totalGenerations: totalCopies[0]?.count || 0,
      ratingDistribution: ratingStats,
      averageGenerationTime: avgGenerationTime[0]?.avgTime || 0
    };
  }

  // Password reset token methods
  async createPasswordResetToken(userId: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    });
    
    return token;
  }

  async usePasswordResetToken(token: string): Promise<string | null> {
    // Find valid token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        sql`${passwordResetTokens.expiresAt} > NOW()`
      ));

    if (!resetToken) {
      return null;
    }

    // Delete the used token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    return resetToken.userId;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.sortOrder, products.displayName);
  }

  async getActiveProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isActive, "true"))
      .orderBy(products.sortOrder, products.displayName);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Product claims operations
  async getProductClaims(productId: string): Promise<ProductClaim[]> {
    return await db.select().from(productClaims)
      .where(eq(productClaims.productId, productId))
      .orderBy(productClaims.claimType, productClaims.sortOrder);
  }

  async createProductClaim(data: InsertProductClaim): Promise<ProductClaim> {
    const [claim] = await db.insert(productClaims).values(data).returning();
    return claim;
  }

  async updateProductClaim(id: string, data: Partial<InsertProductClaim>): Promise<ProductClaim> {
    const [claim] = await db.update(productClaims)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productClaims.id, id))
      .returning();
    return claim;
  }

  async deleteProductClaim(id: string): Promise<void> {
    await db.delete(productClaims).where(eq(productClaims.id, id));
  }

  // Persona operations
  async getAllPersonas(): Promise<Persona[]> {
    return await db.select().from(personas).orderBy(personas.sortOrder, personas.displayName);
  }

  async getActivePersonas(): Promise<Persona[]> {
    return await db.select().from(personas)
      .where(eq(personas.isActive, "true"))
      .orderBy(personas.sortOrder, personas.displayName);
  }

  async getPersona(id: string): Promise<Persona | undefined> {
    const [persona] = await db.select().from(personas).where(eq(personas.id, id));
    return persona || undefined;
  }

  async createPersona(data: InsertPersona): Promise<Persona> {
    const [persona] = await db.insert(personas).values(data).returning();
    return persona;
  }

  async updatePersona(id: string, data: Partial<InsertPersona>): Promise<Persona> {
    const [persona] = await db.update(personas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(personas.id, id))
      .returning();
    return persona;
  }

  async deletePersona(id: string): Promise<void> {
    await db.delete(personas).where(eq(personas.id, id));
  }

  // Persona pillars operations
  async getPersonaPillars(personaId: string): Promise<PersonaPillar[]> {
    return await db.select().from(personaPillars)
      .where(eq(personaPillars.personaId, personaId))
      .orderBy(personaPillars.sortOrder);
  }

  async createPersonaPillar(data: InsertPersonaPillar): Promise<PersonaPillar> {
    const [pillar] = await db.insert(personaPillars).values(data).returning();
    return pillar;
  }

  async updatePersonaPillar(id: string, data: Partial<InsertPersonaPillar>): Promise<PersonaPillar> {
    const [pillar] = await db.update(personaPillars)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(personaPillars.id, id))
      .returning();
    return pillar;
  }

  async deletePersonaPillar(id: string): Promise<void> {
    await db.delete(personaPillars).where(eq(personaPillars.id, id));
  }

  // Brand configuration operations
  async getBrandConfiguration(): Promise<BrandConfiguration[]> {
    return await db.select().from(brandConfiguration)
      .orderBy(brandConfiguration.configType, brandConfiguration.sortOrder);
  }

  async getBrandConfigurationByType(configType: string): Promise<BrandConfiguration[]> {
    return await db.select().from(brandConfiguration)
      .where(eq(brandConfiguration.configType, configType as "core_positioning" | "brand_voice" | "key_terminology" | "approved_language" | "avoided_language"))
      .orderBy(brandConfiguration.sortOrder);
  }

  async createBrandConfiguration(data: InsertBrandConfiguration): Promise<BrandConfiguration> {
    const [config] = await db.insert(brandConfiguration).values(data).returning();
    return config;
  }

  async updateBrandConfiguration(id: string, data: Partial<InsertBrandConfiguration>): Promise<BrandConfiguration> {
    const [config] = await db.update(brandConfiguration)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brandConfiguration.id, id))
      .returning();
    return config;
  }

  async deleteBrandConfiguration(id: string): Promise<void> {
    await db.delete(brandConfiguration).where(eq(brandConfiguration.id, id));
  }

  // Copy frameworks operations
  async getCopyFrameworks(): Promise<CopyFramework[]> {
    return await db.select().from(copyFrameworks)
      .orderBy(copyFrameworks.frameworkType, copyFrameworks.sortOrder);
  }

  async getCopyFrameworksByType(frameworkType: 'headline_framework' | 'primary_text_rule' | 'brand_first_guideline' | 'direct_response_guideline'): Promise<CopyFramework[]> {
    return await db.select().from(copyFrameworks)
      .where(eq(copyFrameworks.frameworkType, frameworkType))
      .orderBy(copyFrameworks.sortOrder);
  }

  async createCopyFramework(data: InsertCopyFramework): Promise<CopyFramework> {
    const [framework] = await db.insert(copyFrameworks).values(data).returning();
    return framework;
  }

  async updateCopyFramework(id: string, data: Partial<InsertCopyFramework>): Promise<CopyFramework> {
    const [framework] = await db.update(copyFrameworks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(copyFrameworks.id, id))
      .returning();
    return framework;
  }

  async deleteCopyFramework(id: string): Promise<void> {
    await db.delete(copyFrameworks).where(eq(copyFrameworks.id, id));
  }

  // System configuration operations
  async getSystemConfiguration(): Promise<SystemConfiguration[]> {
    return await db.select().from(systemConfiguration).orderBy(systemConfiguration.configKey);
  }

  async getSystemConfigValue(key: string): Promise<string | null> {
    const [config] = await db.select()
      .from(systemConfiguration)
      .where(eq(systemConfiguration.configKey, key));
    return config?.configValue || null;
  }

  async setSystemConfigValue(key: string, value: string, description?: string): Promise<SystemConfiguration> {
    const existing = await this.getSystemConfigValue(key);
    
    if (existing) {
      const [config] = await db.update(systemConfiguration)
        .set({ 
          configValue: value, 
          configDescription: description,
          updatedAt: new Date() 
        })
        .where(eq(systemConfiguration.configKey, key))
        .returning();
      return config;
    } else {
      const [config] = await db.insert(systemConfiguration)
        .values({ configKey: key, configValue: value, configDescription: description })
        .returning();
      return config;
    }
  }

  // Comprehensive training config getter (combines all database sources)
  async getTrainingConfiguration(): Promise<any> {
    const [
      allProducts,
      allPersonas,
      brandConfigs,
      copyFrameworksData,
      systemConfigs
    ] = await Promise.all([
      this.getAllProducts(),
      this.getAllPersonas(),
      this.getBrandConfiguration(),
      this.getCopyFrameworks(),
      this.getSystemConfiguration()
    ]);

   

    // Get all product claims
    const productClaims: { [key: string]: { approvedClaims: string[], prohibitedClaims: string[] } } = {};
    for (const product of allProducts) {
      const claims = await this.getProductClaims(product.id);
      productClaims[product.name] = {
        approvedClaims: claims.filter(c => c.claimType === 'approved' && c.isEnabled === 'true').map(c => c.claimText),
        prohibitedClaims: claims.filter(c => c.claimType === 'prohibited' && c.isEnabled === 'true').map(c => c.claimText)
      };
    }

    // Get all persona pillars
    const personaPillars: { [key: string]: { description: string | null, pillars: string[] } } = {};
    for (const persona of allPersonas) {
      const pillars = await this.getPersonaPillars(persona.id);
      personaPillars[persona.name] = {
        description: persona.description,
        pillars: pillars.filter(p => p.isEnabled === 'true').map(p => p.pillarText)
      };
    }

    // Organize brand configuration by type
    const brandGuidelines: any = {};
    const brandTypes = ['core_positioning', 'brand_voice', 'key_terminology', 'approved_language', 'avoided_language'];
    
    console.log('DEBUG: All brand configs from DB:', brandConfigs.length, brandConfigs);
    
    for (const type of brandTypes) {
      if (type === 'core_positioning') {
        const configs = brandConfigs.filter(c => c.configType === type && c.isEnabled === 'true');
        brandGuidelines.corePositioning = configs[0]?.configValue || '';
      } else {
        // Get all configs for this type (both enabled and disabled) ordered by sortOrder
        const allConfigs = brandConfigs
          .filter(c => c.configType === type)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        const key = type.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        const enabledKey = `enabled${key.charAt(0).toUpperCase() + key.slice(1)}`;
        
        console.log(`DEBUG: Processing ${type} -> key: ${key}, found configs:`, allConfigs.length);
        console.log(`DEBUG: All configs for ${type}:`, allConfigs);
        
        brandGuidelines[key] = allConfigs.map(c => c.configValue);
        brandGuidelines[enabledKey] = allConfigs.map(c => c.isEnabled === 'true');
        
        console.log(`DEBUG: Final ${key}:`, brandGuidelines[key], 'enabled:', brandGuidelines[enabledKey]);
      }
    }

    // Organize copy frameworks
    const copyFrameworksObj: any = {
      headlineFrameworks: [],
      primaryTextRules: [],
      brandDrBalance: {
        brandFirst: [],
        directResponse: []
      }
    };

    const headlineFrameworks = copyFrameworksData.filter(f => f.frameworkType === 'headline_framework' && f.isEnabled === 'true');
    copyFrameworksObj.headlineFrameworks = headlineFrameworks.map(f => ({
      name: f.name,
      description: f.description,
      template: f.template,
      examples: f.examples || []
    }));

    copyFrameworksObj.primaryTextRules = copyFrameworksData
      .filter(f => f.frameworkType === 'primary_text_rule' && f.isEnabled === 'true')
      .map(f => f.ruleText);

    copyFrameworksObj.brandDrBalance.brandFirst = copyFrameworksData
      .filter(f => f.frameworkType === 'brand_first_guideline' && f.isEnabled === 'true')
      .map(f => f.ruleText);

    copyFrameworksObj.brandDrBalance.directResponse = copyFrameworksData
      .filter(f => f.frameworkType === 'direct_response_guideline' && f.isEnabled === 'true')
      .map(f => f.ruleText);

    // Get system prompts and model parameters from system configuration
    const systemPromptsObj: any = {};
    const userPromptTemplatesObj: any = {};
    const modelParametersObj: any = {};
    const stationPromptsObj: any = {};

    for (const config of systemConfigs) {
      const { configKey, configValue } = config;
      
      if (configKey.startsWith('systemPrompts.')) {
        const key = configKey.replace('systemPrompts.', '');
        systemPromptsObj[key] = configValue;
      } else if (configKey.startsWith('userPromptTemplates.')) {
        const key = configKey.replace('userPromptTemplates.', '');
        userPromptTemplatesObj[key] = configValue;
      } else if (configKey.startsWith('modelParameters.')) {
        const key = configKey.replace('modelParameters.', '');
        modelParametersObj[key] = configKey === 'modelParameters.maxTokens' ? parseInt(configValue) : configValue;
      } else if (configKey.startsWith('stationPrompts.')) {
        const parts = configKey.replace('stationPrompts.', '').split('.');
        const station = parts[0];
        const field = parts[1];
        
        if (!stationPromptsObj[station]) stationPromptsObj[station] = {};
        stationPromptsObj[station][field] = configValue;
      }
    }

    return {
      brandGuidelines,
      productClaims,
      personaPillars,
      copyFrameworks: copyFrameworksObj,
      systemPrompts: systemPromptsObj,
      userPromptTemplates: userPromptTemplatesObj,
      modelParameters: modelParametersObj,
      stationPrompts: stationPromptsObj
    };
  }
  async saveTrainingConfiguration(config: TrainingConfig): Promise<void> {
    await db.transaction(async (tx) => {
      // #region Brand Guidelines
      const { brandGuidelines } = config;

      // Instead of deleting, we'll do a more surgical update.
      // Get all existing brand configurations
      const allDbBrandConfigs = await tx.select().from(brandConfiguration);
      const updatedConfigIds = new Set<string>();

      const guidelinesToInsert: InsertBrandConfiguration[] = [];
      const guidelinesToUpdate: { id: string; data: Partial<InsertBrandConfiguration> }[] = [];
      
      // Core Positioning - treat as a special case, upsert
      const corePositioningConfig = allDbBrandConfigs.find(c => c.configType === 'core_positioning');
      if (brandGuidelines.corePositioning) {
        if (corePositioningConfig) {
          // Update existing
          guidelinesToUpdate.push({ 
            id: corePositioningConfig.id, 
            data: { configValue: brandGuidelines.corePositioning, isEnabled: 'true' }
          });
          updatedConfigIds.add(corePositioningConfig.id);
        } else {
          // Insert new
          guidelinesToInsert.push({
            configType: 'core_positioning',
            configValue: brandGuidelines.corePositioning,
            isEnabled: 'true',
          });
        }
      } else if (corePositioningConfig) {
        // If it's empty in config but exists in db, mark as disabled
        guidelinesToUpdate.push({ id: corePositioningConfig.id, data: { isEnabled: 'false' } });
        updatedConfigIds.add(corePositioningConfig.id);
      }
      
      // Other brand guidelines
      const guidelineTypes: Array<'brand_voice' | 'key_terminology' | 'approved_language' | 'avoided_language'> = ['brand_voice', 'key_terminology', 'approved_language', 'avoided_language'];
      
      for (const type of guidelineTypes) {
        const key = type.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof typeof brandGuidelines;
        const items = (brandGuidelines[key] as string[]) || [];
        const enabledItems = brandGuidelines[`enabled${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof brandGuidelines] as boolean[] | undefined;
        
        const dbItemsForType = allDbBrandConfigs.filter(c => c.configType === type);

        for (let i = 0; i < items.length; i++) {
          const itemValue = items[i];
          const isEnabled = enabledItems?.[i] !== false;
          
          // Skip null, undefined, or empty string values to prevent database constraint violations
          if (!itemValue || itemValue.trim() === '') {
            continue;
          }
          
          // Check if a config for this item already exists (naive check by value)
          const existingItem = dbItemsForType.find(dbItem => dbItem.configValue === itemValue);

          if (existingItem) {
            // Update existing item
             guidelinesToUpdate.push({ 
               id: existingItem.id, 
               data: { isEnabled: isEnabled ? 'true' : 'false', sortOrder: i } 
             });
             updatedConfigIds.add(existingItem.id);
          } else {
            // Insert new item
            guidelinesToInsert.push({
              configType: type,
              configValue: itemValue,
              isEnabled: isEnabled ? 'true' : 'false',
              sortOrder: i,
            });
          }
        }
      }
      
      // Now, delete any configs that were not in the new payload
      const configsToDelete = allDbBrandConfigs.filter(c => !updatedConfigIds.has(c.id) && c.configType !== 'core_positioning'); // don't delete core positioning
      
      // Perform DB operations
      if (guidelinesToInsert.length > 0) {
        await tx.insert(brandConfiguration).values(guidelinesToInsert);
      }
      for (const update of guidelinesToUpdate) {
        await tx.update(brandConfiguration).set(update.data).where(eq(brandConfiguration.id, update.id));
      }
      for (const config of configsToDelete) {
        // We are no longer deleting, but disabling them
        await tx.update(brandConfiguration).set({ isEnabled: 'false' }).where(eq(brandConfiguration.id, config.id));
      }
      // #endregion

      // #region Product Claims
      const { productClaims: productClaimsData } = config;
      const allDbProducts = await tx.select().from(products);

      for (const productName in productClaimsData) {
        let product = allDbProducts.find(p => p.name === productName);
        
        // Create product if it doesn't exist
        if (!product) {
          [product] = await tx.insert(products).values({ name: productName, displayName: productName }).returning();
        }

        // Instead of clearing all claims, we'll do a more targeted update
        const existingClaims = await tx.select().from(productClaims).where(eq(productClaims.productId, product.id));
        const updatedClaimIds = new Set<string>();
        
        const claimsToInsert: InsertProductClaim[] = [];
        const claimsToUpdate: { id: string; data: Partial<InsertProductClaim> }[] = [];

        const processClaims = (claims: string[], type: 'approved' | 'prohibited', enabledStates?: boolean[]) => {
          claims.forEach((claimText: string, index: number) => {
            // Skip null, undefined, or empty string values to prevent database constraint violations
            if (!claimText || claimText.trim() === '') {
              return;
            }
            
            const isEnabled = enabledStates?.[index] !== false;
            const existingClaim = existingClaims.find(c => c.claimType === type && c.claimText === claimText);

            if (existingClaim) {
              // Update existing claim
              claimsToUpdate.push({
                id: existingClaim.id,
                data: { isEnabled: isEnabled ? 'true' : 'false', sortOrder: index }
              });
              updatedClaimIds.add(existingClaim.id);
            } else {
              // Insert new claim
              claimsToInsert.push({
                productId: product.id,
                claimType: type,
                claimText: claimText,
                isEnabled: isEnabled ? 'true' : 'false',
                sortOrder: index,
              });
            }
          });
        };

        const { approvedClaims, prohibitedClaims, enabledApproved, enabledProhibited } = productClaimsData[productName];
        processClaims(approvedClaims, 'approved', enabledApproved);
        processClaims(prohibitedClaims, 'prohibited', enabledProhibited);

        // Disable claims that are in the DB but not in the new config for this product
        const claimsToDisable = existingClaims.filter(c => !updatedClaimIds.has(c.id));
        for (const claim of claimsToDisable) {
          claimsToUpdate.push({ id: claim.id, data: { isEnabled: 'false' }});
        }
        
        if (claimsToInsert.length > 0) {
          await tx.insert(productClaims).values(claimsToInsert);
        }
        for (const update of claimsToUpdate) {
          await tx.update(productClaims).set(update.data).where(eq(productClaims.id, update.id));
        }
      }
      
      // Delete products that are in DB but not in the new config
      const productsInConfig = Object.keys(productClaimsData);
      const productsToDelete = allDbProducts.filter(p => !productsInConfig.includes(p.name));
      for (const product of productsToDelete) {
        await tx.delete(products).where(eq(products.id, product.id));
      }
      // #endregion

      // #region Personas
      const { personaPillars: personaData } = config;
      const allDbPersonas = await tx.select().from(personas);

      for (const personaName in personaData) {
        let persona = allDbPersonas.find(p => p.name === personaName);

        if (!persona) {
          [persona] = await tx.insert(personas).values({ name: personaName, displayName: personaName }).returning();
        }

        // Update description if provided, even if it's an empty string
        if (personaData[personaName].description !== undefined && persona.description !== personaData[personaName].description) {
          await tx.update(personas).set({ description: personaData[personaName].description }).where(eq(personas.id, persona.id));
        }

        // More surgical update for persona pillars
        const existingPillars = await tx.select().from(personaPillars).where(eq(personaPillars.personaId, persona.id));
        const updatedPillarIds = new Set<string>();

        const pillarsToInsert: InsertPersonaPillar[] = [];
        const pillarsToUpdate: { id: string; data: Partial<InsertPersonaPillar> }[] = [];

        const { pillars } = personaData[personaName];
        if (pillars && pillars.length > 0) {
          pillars.forEach((pillarText: string, index: number) => {
            // Skip null, undefined, or empty string values to prevent database constraint violations
            if (!pillarText || pillarText.trim() === '') {
              return;
            }
            
            const existingPillar = existingPillars.find(p => p.pillarText === pillarText);

            if (existingPillar) {
              // Update existing pillar
              pillarsToUpdate.push({
                id: existingPillar.id,
                data: { isEnabled: 'true', sortOrder: index }
              });
              updatedPillarIds.add(existingPillar.id);
            } else {
              // Insert new pillar
              pillarsToInsert.push({
                personaId: persona.id,
                pillarText: pillarText,
                isEnabled: 'true',
                sortOrder: index,
              });
            }
          });
        }
        
        // Disable pillars that are in DB but not in new config
        const pillarsToDisable = existingPillars.filter(p => !updatedPillarIds.has(p.id));
        for (const pillar of pillarsToDisable) {
          pillarsToUpdate.push({ id: pillar.id, data: { isEnabled: 'false' } });
        }
        
        if (pillarsToInsert.length > 0) {
          await tx.insert(personaPillars).values(pillarsToInsert);
        }
        for (const update of pillarsToUpdate) {
          await tx.update(personaPillars).set(update.data).where(eq(personaPillars.id, update.id));
        }
      }

      const personasInConfig = Object.keys(personaData);
      const personasToDelete = allDbPersonas.filter(p => !personasInConfig.includes(p.name));
      for (const persona of personasToDelete) {
        await tx.delete(personas).where(eq(personas.id, persona.id));
      }
      // #endregion
      
      // #region Copy Frameworks
      const { copyFrameworks: frameworksData } = config;
      const allDbFrameworks = await tx.select().from(copyFrameworks);
      const updatedFrameworkIds = new Set<string>();
      
      const frameworksToInsert: InsertCopyFramework[] = [];
      const frameworksToUpdate: { id: string; data: Partial<InsertCopyFramework> }[] = [];

      // Headline Frameworks
      frameworksData.headlineFrameworks.forEach((fw: any, index: number) => {
        // Skip frameworks with empty names to prevent database constraint violations
        if (!fw.name || fw.name.trim() === '') {
          return;
        }
        
        const existingFw = allDbFrameworks.find(dbFw => dbFw.frameworkType === 'headline_framework' && dbFw.name === fw.name);
        const isEnabled = fw.isEnabled !== false;
        if (existingFw) {
          frameworksToUpdate.push({
            id: existingFw.id,
            data: { 
              name: fw.name,
              description: fw.description,
              template: fw.template,
              examples: fw.examples,
              isEnabled: isEnabled ? 'true' : 'false', 
              sortOrder: index 
            }
          });
          updatedFrameworkIds.add(existingFw.id);
        } else {
          frameworksToInsert.push({
            frameworkType: 'headline_framework',
            name: fw.name,
            description: fw.description,
            template: fw.template,
            examples: fw.examples,
            isEnabled: isEnabled ? 'true' : 'false',
            sortOrder: index,
          });
        }
      });

      // Primary Text Rules
      frameworksData.primaryTextRules.forEach((rule: string, index: number) => {
        // Skip null, undefined, or empty string values to prevent database constraint violations
        if (!rule || rule.trim() === '') {
          return;
        }
        
        const existingRule = allDbFrameworks.find(dbFw => dbFw.frameworkType === 'primary_text_rule' && dbFw.ruleText === rule);
        const isEnabled = frameworksData.enabledPrimaryTextRules?.[index] !== false;
        if (existingRule) {
          frameworksToUpdate.push({ id: existingRule.id, data: { isEnabled: isEnabled ? 'true' : 'false', sortOrder: index }});
          updatedFrameworkIds.add(existingRule.id);
        } else {
          frameworksToInsert.push({
            frameworkType: 'primary_text_rule',
            ruleText: rule,
            isEnabled: isEnabled ? 'true' : 'false',
            sortOrder: index,
          });
        }
      });

      // Brand First Guidelines
      frameworksData.brandDrBalance.brandFirst.forEach((rule: string, index: number) => {
        // Skip null, undefined, or empty string values to prevent database constraint violations
        if (!rule || rule.trim() === '') {
          return;
        }
        
        const existingRule = allDbFrameworks.find(dbFw => dbFw.frameworkType === 'brand_first_guideline' && dbFw.ruleText === rule);
        if (existingRule) {
          frameworksToUpdate.push({ id: existingRule.id, data: { isEnabled: 'true', sortOrder: index }});
          updatedFrameworkIds.add(existingRule.id);
        } else {
          frameworksToInsert.push({
            frameworkType: 'brand_first_guideline',
            ruleText: rule,
            isEnabled: 'true',
            sortOrder: index,
          });
        }
      });

      // Direct Response Guidelines
      frameworksData.brandDrBalance.directResponse.forEach((rule: string, index: number) => {
        // Skip null, undefined, or empty string values to prevent database constraint violations
        if (!rule || rule.trim() === '') {
          return;
        }
        
        const existingRule = allDbFrameworks.find(dbFw => dbFw.frameworkType === 'direct_response_guideline' && dbFw.ruleText === rule);
        if (existingRule) {
          frameworksToUpdate.push({ id: existingRule.id, data: { isEnabled: 'true', sortOrder: index }});
          updatedFrameworkIds.add(existingRule.id);
        } else {
          frameworksToInsert.push({
            frameworkType: 'direct_response_guideline',
            ruleText: rule,
            isEnabled: 'true',
            sortOrder: index,
          });
        }
      });

      // Disable headline frameworks not in the new config (removed frameworks)
      const headlineFrameworksToDisable = allDbFrameworks.filter(f => 
        f.frameworkType === 'headline_framework' && !updatedFrameworkIds.has(f.id)
      );
      for (const fw of headlineFrameworksToDisable) {
        frameworksToUpdate.push({ id: fw.id, data: { isEnabled: 'false' } });
      }

      // Disable other framework types not in the new config
      const otherFrameworksToDisable = allDbFrameworks.filter(f => 
        f.frameworkType !== 'headline_framework' && !updatedFrameworkIds.has(f.id)
      );
      for (const fw of otherFrameworksToDisable) {
        frameworksToUpdate.push({ id: fw.id, data: { isEnabled: 'false' } });
      }

      if (frameworksToInsert.length > 0) {
        await tx.insert(copyFrameworks).values(frameworksToInsert);
      }
      for (const update of frameworksToUpdate) {
        await tx.update(copyFrameworks).set(update.data).where(eq(copyFrameworks.id, update.id));
      }
      // #endregion

      // #region System Configuration (Model, Prompts, etc.)
      const allDbSystemConfigs = await tx.select().from(systemConfiguration);
      const configsToUpsert: InsertSystemConfiguration[] = [];

      const processSystemConfig = (prefix: string, configObject: Record<string, any>) => {
        for (const key in configObject) {
          const configKey = `${prefix}.${key}`;
          const configValue = String(configObject[key]);
          configsToUpsert.push({ configKey, configValue });
        }
      };
      
      const processNestedSystemConfig = (prefix: string, configObject: Record<string, Record<string, any>>) => {
        for (const outerKey in configObject) {
          for (const innerKey in configObject[outerKey]) {
            const configKey = `${prefix}.${outerKey}.${innerKey}`;
            const configValue = String(configObject[outerKey][innerKey]);
            if(configValue) {
              configsToUpsert.push({ configKey, configValue });
            }
          }
        }
      };

      processSystemConfig('modelParameters', config.modelParameters);
      processNestedSystemConfig('stationPrompts', config.stationPrompts);
      
      // Upsert logic
      for (const config of configsToUpsert) {
        const existingConfig = allDbSystemConfigs.find(dbC => dbC.configKey === config.configKey);
        if (existingConfig) {
          if (existingConfig.configValue !== config.configValue) {
            await tx.update(systemConfiguration)
              .set({ configValue: config.configValue })
              .where(eq(systemConfiguration.configKey, config.configKey));
          }
        } else {
          await tx.insert(systemConfiguration).values(config);
        }
      }
      // #endregion
    });
  }
}

export const storage = new DatabaseStorage();
