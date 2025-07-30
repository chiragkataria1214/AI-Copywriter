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
      .where(eq(brandConfiguration.configType, configType))
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

  async getCopyFrameworksByType(frameworkType: string): Promise<CopyFramework[]> {
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
    const personaPillars: { [key: string]: { pillars: string[] } } = {};
    for (const persona of allPersonas) {
      const pillars = await this.getPersonaPillars(persona.id);
      personaPillars[persona.name] = {
        pillars: pillars.filter(p => p.isEnabled === 'true').map(p => p.pillarText)
      };
    }

    // Organize brand configuration by type
    const brandGuidelines: any = {};
    const brandTypes = ['core_positioning', 'brand_voice', 'key_terminology', 'approved_language', 'avoided_language'];
    
    for (const type of brandTypes) {
      const configs = brandConfigs.filter(c => c.configType === type && c.isEnabled === 'true');
      if (type === 'core_positioning') {
        brandGuidelines.corePositioning = configs[0]?.configValue || '';
      } else {
        const key = type.replace('_', '');
        brandGuidelines[key] = configs.map(c => c.configValue);
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
}

export const storage = new DatabaseStorage();
