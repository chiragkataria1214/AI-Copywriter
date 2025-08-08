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
  type Subpersona,
  type InsertSubpersona,
  type PersonaPillar,
  type InsertPersonaPillar,
  type BrandConfiguration,
  type InsertBrandConfiguration,
  type CopyFramework,
  type InsertCopyFramework,
  type SystemConfiguration,
  type InsertSystemConfiguration,
  type EmailFramework,
  type InsertEmailFramework,
  type SmsFramework,
  type InsertSmsFramework,
  type LandingPageFramework,
  type InsertLandingPageFramework,
  type EmailImageAnalysis,
  type InsertEmailImageAnalysis,
  users,
  generatedCopy,
  passwordResetTokens,
  products,
  productClaims,
  personas,
  subpersonas,
  personaPillars,
  brandConfiguration,
  copyFrameworks,
  systemConfiguration,
  emailFrameworks,
  smsFrameworks,
  landingPageFrameworks,
  emailImageAnalysis,
  adminCreateUserSchema,
  updateUserSchema
} from "@shared/schema";
import { type TrainingConfig } from "@shared/training-config";
import { slugToDisplayName } from "@shared/utils";
import { db } from "../db";
import { eq, desc, and, count, avg, sql, inArray } from "drizzle-orm";
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
  updateGeneratedCopy(id: string, data: { headlines?: any; primaryText?: string }): Promise<GeneratedCopy>;
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
  
  // Subpersona operations
  getSubpersonas(personaId: string): Promise<Subpersona[]>;
  getActiveSubpersonas(personaId: string): Promise<Subpersona[]>;
  getSubpersona(id: string): Promise<Subpersona | undefined>;
  createSubpersona(data: InsertSubpersona): Promise<Subpersona>;
  updateSubpersona(id: string, data: Partial<InsertSubpersona>): Promise<Subpersona>;
  deleteSubpersona(id: string): Promise<void>;
  
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
  
  // Email frameworks operations
  getAllEmailFrameworks(): Promise<EmailFramework[]>;
  getActiveEmailFrameworks(): Promise<EmailFramework[]>;
  getEmailFramework(name: string): Promise<EmailFramework | undefined>;
  getEmailFrameworkById(id: string): Promise<EmailFramework | undefined>;
  createEmailFramework(data: InsertEmailFramework): Promise<EmailFramework>;
  updateEmailFramework(id: string, data: Partial<InsertEmailFramework>): Promise<EmailFramework>;
  updateEmailFrameworkByName(name: string, data: Partial<InsertEmailFramework>): Promise<EmailFramework>;
  deleteEmailFramework(name: string): Promise<void>;
  deleteEmailFrameworkById(id: string): Promise<void>;

  // SMS frameworks operations
  getAllSmsFrameworks(): Promise<SmsFramework[]>;
  getActiveSmsFrameworks(): Promise<SmsFramework[]>;
  getSmsFramework(name: string): Promise<SmsFramework | undefined>;
  getSmsFrameworkById(id: string): Promise<SmsFramework | undefined>;
  createSmsFramework(data: InsertSmsFramework): Promise<SmsFramework>;
  updateSmsFramework(id: string, data: Partial<InsertSmsFramework>): Promise<SmsFramework>;
  updateSmsFrameworkByName(name: string, data: Partial<InsertSmsFramework>): Promise<SmsFramework>;
  deleteSmsFramework(name: string): Promise<void>;
  deleteSmsFrameworkById(id: string): Promise<void>;
  
  // Landing page frameworks operations
  getAllLandingPageFrameworks(): Promise<LandingPageFramework[]>;
  getActiveLandingPageFrameworks(): Promise<LandingPageFramework[]>;
  getLandingPageFramework(name: string): Promise<LandingPageFramework | undefined>;
  getLandingPageFrameworkById(id: string): Promise<LandingPageFramework | undefined>;
  createLandingPageFramework(data: InsertLandingPageFramework): Promise<LandingPageFramework>;
  updateLandingPageFramework(id: string, data: Partial<InsertLandingPageFramework>): Promise<LandingPageFramework>;
  updateLandingPageFrameworkByName(name: string, data: Partial<InsertLandingPageFramework>): Promise<LandingPageFramework>;
  deleteLandingPageFramework(name: string): Promise<void>;
  deleteLandingPageFrameworkById(id: string): Promise<void>;
  
  // Email image analysis operations
  saveEmailImageAnalysis(data: InsertEmailImageAnalysis): Promise<EmailImageAnalysis>;
  getEmailImageAnalysis(id: string): Promise<EmailImageAnalysis | undefined>;
  getEmailImageAnalysisByUser(userId: string): Promise<EmailImageAnalysis[]>;
  updateEmailImageAnalysis(id: string, data: Partial<InsertEmailImageAnalysis>): Promise<EmailImageAnalysis>;
  deleteEmailImageAnalysis(id: string): Promise<void>;
  
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

  async updateGeneratedCopy(id: string, data: { headlines?: any; primaryText?: string }): Promise<GeneratedCopy> {
    const [copy] = await db.update(generatedCopy)
      .set(data)
      .where(eq(generatedCopy.id, id))
      .returning();
    return copy;
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

  // Subpersona operations
  async getSubpersonas(personaId: string): Promise<Subpersona[]> {
    return await db.select().from(subpersonas)
      .where(eq(subpersonas.personaId, personaId))
      .orderBy(subpersonas.sortOrder, subpersonas.name);
  }

  async getActiveSubpersonas(personaId: string): Promise<Subpersona[]> {
    return await db.select().from(subpersonas)
      .where(and(eq(subpersonas.personaId, personaId), eq(subpersonas.isActive, "true")))
      .orderBy(subpersonas.sortOrder, subpersonas.name);
  }

  async getSubpersona(id: string): Promise<Subpersona | undefined> {
    const [subpersona] = await db.select().from(subpersonas).where(eq(subpersonas.id, id));
    return subpersona || undefined;
  }

  async createSubpersona(data: InsertSubpersona): Promise<Subpersona> {
    const [subpersona] = await db.insert(subpersonas).values(data).returning();
    return subpersona;
  }

  async updateSubpersona(id: string, data: Partial<InsertSubpersona>): Promise<Subpersona> {
    const [subpersona] = await db.update(subpersonas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subpersonas.id, id))
      .returning();
    return subpersona;
  }

  async deleteSubpersona(id: string): Promise<void> {
    await db.delete(subpersonas).where(eq(subpersonas.id, id));
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
      emailFrameworksData,
      smsFrameworksData,
      landingPageFrameworksData,
      systemConfigs
    ] = await Promise.all([
      this.getAllProducts(),
      this.getAllPersonas(),
      this.getBrandConfiguration(),
      this.getCopyFrameworks(),
      this.getAllEmailFrameworks(),
      this.getAllSmsFrameworks(),
      this.getAllLandingPageFrameworks(),
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

    // Get all persona pillars and subpersonas
    const personaPillars: { [key: string]: { description: string | null, pillars: string[], subpersonas?: { [key: string]: { description?: string, pillars?: string[] } } } } = {};
    for (const persona of allPersonas) {
      const pillars = await this.getPersonaPillars(persona.id);
      const subpersonas = await this.getActiveSubpersonas(persona.id);
      
      // Build subpersonas object with ID mapping
      const subpersonasObj: { [key: string]: { id?: string, description?: string, pillars?: string[] } } = {};
      for (const subpersona of subpersonas) {
        subpersonasObj[subpersona.name] = {
          id: subpersona.id,
          description: subpersona.description || undefined,
          pillars: [] // Subpersonas don't have their own pillars in this implementation
        };
      }
      
      personaPillars[persona.name] = {
        description: persona.description,
        pillars: pillars.filter(p => p.isEnabled === 'true').map(p => p.pillarText),
        subpersonas: Object.keys(subpersonasObj).length > 0 ? subpersonasObj : undefined
      };
    }

    // Organize brand configuration by type
    const brandGuidelines: any = {};
    const brandTypes = ['core_positioning', 'brand_voice', 'key_terminology', 'approved_language', 'avoided_language'];
    

    
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
        
        
        
        brandGuidelines[key] = allConfigs.map(c => c.configValue);
        brandGuidelines[enabledKey] = allConfigs.map(c => c.isEnabled === 'true');
        
  
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

    // Add email frameworks to copyFrameworks object (include all frameworks, not just active ones)
    copyFrameworksObj.emailFrameworks = emailFrameworksData
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(f => ({
        id: f.id,
        name: f.name,
        displayName: f.displayName,
        description: f.description,
        structure: f.structure,
        keyElements: f.keyElements,
        frameworkContent: f.frameworkContent,
        systemPrompt: f.systemPrompt,
        outputRequirements: f.outputRequirements,
        expectedLength: f.expectedLength,
        isEnabled: f.isActive === 'true',
        sortOrder: f.sortOrder
      }));

    // Add SMS frameworks to copyFrameworks object
    copyFrameworksObj.smsFrameworks = smsFrameworksData
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(f => ({
        id: f.id,
        name: f.name,
        displayName: f.displayName,
        description: f.description,
        structure: f.structure,
        keyElements: f.keyElements,
        frameworkContent: f.frameworkContent,
        systemPrompt: f.systemPrompt,
        outputRequirements: f.outputRequirements,
        expectedLength: f.expectedLength,
        isEnabled: f.isActive === 'true',
        sortOrder: f.sortOrder
      }));

    // Add landing page frameworks to copyFrameworks object (include all frameworks, not just active ones)
    copyFrameworksObj.landingPageFrameworks = landingPageFrameworksData
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(f => ({
        id: f.id,
        name: f.name,
        displayName: f.displayName,
        description: f.description,
        contentSequence: f.contentSequence || [],
        reasonStructure: f.reasonStructure || [],
        optimizationRules: f.optimizationRules || [],
        realExamples: f.realExamples || [],
        systemPrompt: f.systemPrompt,
        outputRequirements: f.outputRequirements,
        images: f.images,
        isEnabled: f.isActive === 'true',
        sortOrder: f.sortOrder
      }));

    // Get system prompts and model parameters from system configuration
    const systemPromptsObj: any = {};
    const userPromptTemplatesObj: any = {};
    const modelParametersObj: any = {};
    const stationPromptsObj: any = {};
    const emailTemplatesObj: any = {};

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
        // Attempt to parse JSON for nested objects (e.g., contextConfiguration)
        try {
          const maybeObject = JSON.parse(configValue);
          stationPromptsObj[station][field] = maybeObject;
        } catch {
          stationPromptsObj[station][field] = configValue;
        }
      } else if (configKey.startsWith('emailTemplates.')) {
        const key = configKey.replace('emailTemplates.', '');
        try {
          emailTemplatesObj[key] = JSON.parse(configValue);
        } catch (error) {
          console.error(`Failed to parse email templates for key ${key}:`, error);
          emailTemplatesObj[key] = [];
        }
      }
    }

    // Also read brand name and website from brand configuration table
    const brandNameConfig = brandConfigs.find(c => c.configType === 'brand_name' && c.isEnabled === 'true');
    const websiteConfig = brandConfigs.find(c => c.configType === 'website' && c.isEnabled === 'true');
    if (brandNameConfig) brandGuidelines.brandName = brandNameConfig.configValue;
    if (websiteConfig) brandGuidelines.website = websiteConfig.configValue;

    return {
      brandGuidelines,
      productClaims,
      personaPillars,
      copyFrameworks: copyFrameworksObj,
      systemPrompts: systemPromptsObj,
      userPromptTemplates: userPromptTemplatesObj,
      modelParameters: modelParametersObj,
      stationPrompts: stationPromptsObj,
      emailTemplates: emailTemplatesObj
    };
  }
  async saveTrainingConfiguration(config: TrainingConfig): Promise<void> {
    console.log('Starting training configuration save...');
    const startTime = Date.now();
    
    await db.transaction(async (tx) => {
      let t = Date.now();
      await this.upsertBrandGuidelines(tx, config.brandGuidelines as any);
      console.log(`Timing: upsertBrandGuidelines ${Date.now() - t}ms`);

      t = Date.now();
      await this.syncProductClaims(tx, config.productClaims as any);
      console.log(`Timing: syncProductClaims ${Date.now() - t}ms`);

      t = Date.now();
      await this.syncPersonas(tx, config.personaPillars as any);
      console.log(`Timing: syncPersonas ${Date.now() - t}ms`);

      t = Date.now();
      await this.syncCopyFrameworks(tx, config.copyFrameworks as any);
      console.log(`Timing: syncCopyFrameworks ${Date.now() - t}ms`);

      t = Date.now();
      await this.syncEmailFrameworks(tx, (config.copyFrameworks as any)?.emailFrameworks);
      console.log(`Timing: syncEmailFrameworks ${Date.now() - t}ms`);

      t = Date.now();
      await this.syncSmsFrameworks(tx, (config.copyFrameworks as any)?.smsFrameworks);
      console.log(`Timing: syncSmsFrameworks ${Date.now() - t}ms`);

      t = Date.now();
      await this.syncLandingPageFrameworks(tx, (config.copyFrameworks as any)?.landingPageFrameworks);
      console.log(`Timing: syncLandingPageFrameworks ${Date.now() - t}ms`);

      t = Date.now();
      await this.upsertSystemConfiguration(tx, config);
      console.log(`Timing: upsertSystemConfiguration ${Date.now() - t}ms`);
      
      const totalTime = Date.now() - startTime;
      console.log(`Training configuration saved successfully in ${totalTime}ms`);
    });
  }

  // Helper methods extracted from saveTrainingConfiguration
  private async upsertBrandGuidelines(tx: any, brandGuidelines: any): Promise<void> {
    const allDbBrandConfigs = await tx.select().from(brandConfiguration);
    const updatedConfigIds = new Set<string>();

    const guidelinesToInsert: InsertBrandConfiguration[] = [];
    const guidelinesToUpdate: { id: string; data: Partial<InsertBrandConfiguration> }[] = [];

    const corePositioningConfig = allDbBrandConfigs.find((c: any) => c.configType === 'core_positioning');
    if (brandGuidelines?.corePositioning) {
      if (corePositioningConfig) {
        guidelinesToUpdate.push({
          id: corePositioningConfig.id,
          data: { configValue: brandGuidelines.corePositioning, isEnabled: 'true' },
        });
        updatedConfigIds.add(corePositioningConfig.id);
      } else {
        guidelinesToInsert.push({
          configType: 'core_positioning',
          configValue: brandGuidelines.corePositioning,
          isEnabled: 'true',
        });
      }
    } else if (corePositioningConfig) {
      guidelinesToUpdate.push({ id: corePositioningConfig.id, data: { isEnabled: 'false' } });
      updatedConfigIds.add(corePositioningConfig.id);
    }

    const guidelineTypes: Array<'brand_voice' | 'key_terminology' | 'approved_language' | 'avoided_language'> = [
      'brand_voice',
      'key_terminology',
      'approved_language',
      'avoided_language',
    ];

    for (const type of guidelineTypes) {
      const keyStr = type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const items = (brandGuidelines?.[keyStr] as string[]) || [];
      const enabledKey = `enabled${keyStr.charAt(0).toUpperCase() + keyStr.slice(1)}`;
      const enabledItems = brandGuidelines?.[enabledKey] as boolean[] | undefined;

      const dbItemsForType = allDbBrandConfigs.filter((c: any) => c.configType === type);

      for (let i = 0; i < items.length; i++) {
        const itemValue = items[i];
        const isEnabled = enabledItems?.[i] !== false;
        if (!itemValue || itemValue.trim() === '') continue;

        const existingItem = dbItemsForType.find((dbItem: any) => dbItem.configValue === itemValue);
        if (existingItem) {
          guidelinesToUpdate.push({ id: existingItem.id, data: { isEnabled: isEnabled ? 'true' : 'false', sortOrder: i } });
          updatedConfigIds.add(existingItem.id);
        } else {
          guidelinesToInsert.push({
            configType: type,
            configValue: itemValue,
            isEnabled: isEnabled ? 'true' : 'false',
            sortOrder: i,
          });
        }
      }
    }

    const configsToDelete = allDbBrandConfigs.filter((c: any) => !updatedConfigIds.has(c.id) && c.configType !== 'core_positioning');

    const operations: Promise<any>[] = [];
    if (guidelinesToInsert.length > 0) {
      operations.push(tx.insert(brandConfiguration).values(guidelinesToInsert));
    }
    if (guidelinesToUpdate.length > 0) {
      const updatePromises = guidelinesToUpdate.map((update) =>
        tx.update(brandConfiguration).set(update.data).where(eq(brandConfiguration.id, update.id))
      );
      operations.push(...updatePromises);
    }
    if (configsToDelete.length > 0) {
      const disablePromises = configsToDelete.map((config: any) =>
        tx.update(brandConfiguration).set({ isEnabled: 'false' }).where(eq(brandConfiguration.id, config.id))
      );
      operations.push(...disablePromises);
    }
    if (operations.length > 0) await Promise.all(operations);
  }

  private async syncProductClaims(tx: any, productClaimsData: any): Promise<void> {
    const allDbProducts = await tx.select().from(products);
    const productsToCreate: { name: string; displayName: string }[] = [];
    const productMap = new Map<string, any>();
    const allDbProductsByName = new Map<string, any>(allDbProducts.map((p: any) => [p.name, p]));

    for (const productName in productClaimsData) {
      const existing = allDbProductsByName.get(productName);
      if (!existing) {
        const claimData = productClaimsData[productName];
        const displayName = claimData.displayName || slugToDisplayName(productName);
        productsToCreate.push({ name: productName, displayName });
      } else {
        productMap.set(productName, existing);
      }
    }

    if (productsToCreate.length > 0) {
      const createdProducts = await tx.insert(products).values(productsToCreate).returning();
      createdProducts.forEach((product: any, index: number) => {
        productMap.set(productsToCreate[index].name, product);
      });
    }

    const productIds = Array.from(productMap.values()).map((p: any) => p.id);
    const allExistingClaims =
      productIds.length > 0 ? await tx.select().from(productClaims).where(inArray(productClaims.productId, productIds)) : [];

    const allClaimsToInsert: InsertProductClaim[] = [];
    const allClaimsToUpdate: { id: string; data: Partial<InsertProductClaim> }[] = [];

    // Build a fast lookup map of existing claims per product
    const existingClaimsByProduct: Map<string, Map<string, any>> = new Map();
    for (const c of allExistingClaims) {
      const pid = (c as any).productId as string;
      const key = `${(c as any).claimType}:${(c as any).claimText}`;
      if (!existingClaimsByProduct.has(pid)) existingClaimsByProduct.set(pid, new Map());
      existingClaimsByProduct.get(pid)!.set(key, c);
    }

    for (const productName in productClaimsData) {
      const product = productMap.get(productName);
      if (!product) continue;
      const pid = product.id as string;
      const existingMap = existingClaimsByProduct.get(pid) || new Map<string, any>();

      const processedIds = new Set<string>();
      const processClaims = (claims: string[], type: 'approved' | 'prohibited', enabledStates?: boolean[]) => {
        for (let index = 0; index < (claims?.length || 0); index++) {
          const claimText = claims[index];
          if (!claimText || claimText.trim() === '') continue;
          const isEnabled = enabledStates?.[index] !== false;
          const desiredEnabled = isEnabled ? 'true' : 'false';
          const key = `${type}:${claimText}`;
          const existing = existingMap.get(key);
          if (existing) {
            processedIds.add(existing.id);
            const needsEnabledUpdate = existing.isEnabled !== desiredEnabled;
            const needsSortUpdate = existing.sortOrder !== index;
            if (needsEnabledUpdate || needsSortUpdate) {
              allClaimsToUpdate.push({ id: existing.id, data: { isEnabled: desiredEnabled, sortOrder: index } });
            }
          } else {
            allClaimsToInsert.push({
              productId: pid,
              claimType: type,
              claimText,
              isEnabled: desiredEnabled,
              sortOrder: index,
            });
          }
        }
      };

      const { approvedClaims, prohibitedClaims, enabledApproved, enabledProhibited } = productClaimsData[productName];
      processClaims(approvedClaims || [], 'approved', enabledApproved);
      processClaims(prohibitedClaims || [], 'prohibited', enabledProhibited);

      // Disable only those that are currently enabled and not processed
      for (const existing of existingMap.values()) {
        if (!processedIds.has(existing.id) && existing.isEnabled !== 'false') {
          allClaimsToUpdate.push({ id: existing.id, data: { isEnabled: 'false' } });
        }
      }
    }

    const claimsOperations: Promise<any>[] = [];
    if (allClaimsToInsert.length > 0) {
      claimsOperations.push(tx.insert(productClaims).values(allClaimsToInsert));
    }
    if (allClaimsToUpdate.length > 0) {
      const MAX_CONCURRENCY = 50;
      for (let i = 0; i < allClaimsToUpdate.length; i += MAX_CONCURRENCY) {
        const slice = allClaimsToUpdate.slice(i, i + MAX_CONCURRENCY);
        claimsOperations.push(
          Promise.all(
            slice.map((update) => tx.update(productClaims).set(update.data).where(eq(productClaims.id, update.id)))
          )
        );
      }
    }

    const productsInConfig = Object.keys(productClaimsData);
    const allDbProductsAfter = await tx.select().from(products);
    const productsToDelete = allDbProductsAfter.filter((p: any) => !productsInConfig.includes(p.name));
    if (productsToDelete.length > 0) {
      const deletePromises = productsToDelete.map((product: any) => tx.delete(products).where(eq(products.id, product.id)));
      claimsOperations.push(...deletePromises);
    }

    if (claimsOperations.length > 0) {
      await Promise.all(claimsOperations);
    }
  }

  private async syncPersonas(tx: any, personaData: any): Promise<void> {
    const allDbPersonas = await tx.select().from(personas);

    for (const personaName in personaData) {
      let persona = allDbPersonas.find((p: any) => p.name === personaName);
      if (!persona) {
        [persona] = await tx.insert(personas).values({ name: personaName, displayName: personaName }).returning();
      }

      if (personaData[personaName].description !== undefined && persona.description !== personaData[personaName].description) {
        await tx.update(personas).set({ description: personaData[personaName].description }).where(eq(personas.id, persona.id));
      }

      const existingPillars = await tx.select().from(personaPillars).where(eq(personaPillars.personaId, persona.id));
      const updatedPillarIds = new Set<string>();
      const pillarsToInsert: InsertPersonaPillar[] = [];
      const pillarsToUpdate: { id: string; data: Partial<InsertPersonaPillar> }[] = [];

      const { pillars } = personaData[personaName];
      if (pillars && pillars.length > 0) {
        pillars.forEach((pillarText: string, index: number) => {
          if (!pillarText || pillarText.trim() === '') return;
          const existingPillar = existingPillars.find((p: any) => p.pillarText === pillarText);
          if (existingPillar) {
            pillarsToUpdate.push({ id: existingPillar.id, data: { isEnabled: 'true', sortOrder: index } });
            updatedPillarIds.add(existingPillar.id);
          } else {
            pillarsToInsert.push({ personaId: persona.id, pillarText, isEnabled: 'true', sortOrder: index });
          }
        });
      }

      const pillarsToDisable = existingPillars.filter((p: any) => !updatedPillarIds.has(p.id));
      for (const pillar of pillarsToDisable) {
        pillarsToUpdate.push({ id: pillar.id, data: { isEnabled: 'false' } });
      }

      if (pillarsToInsert.length > 0) {
        await tx.insert(personaPillars).values(pillarsToInsert);
      }
      for (const update of pillarsToUpdate) {
        await tx.update(personaPillars).set(update.data).where(eq(personaPillars.id, update.id));
      }

      if (personaData[personaName].subpersonas) {
        const existingSubpersonas = await tx.select().from(subpersonas).where(eq(subpersonas.personaId, persona.id));
        const updatedSubpersonaIds = new Set<string>();
        const subpersonasToInsert: InsertSubpersona[] = [];
        const subpersonasToUpdate: { id: string; data: Partial<InsertSubpersona> }[] = [];

        let sortOrder = 0;
        for (const subpersonaName in personaData[personaName].subpersonas!) {
          const subpersonaData = personaData[personaName].subpersonas![subpersonaName];
          const existingSubpersona = existingSubpersonas.find((s: any) => s.name === subpersonaName);
          if (existingSubpersona) {
            subpersonasToUpdate.push({
              id: existingSubpersona.id,
              data: { description: subpersonaData.description || null, isActive: 'true', sortOrder },
            });
            updatedSubpersonaIds.add(existingSubpersona.id);
          } else {
            subpersonasToInsert.push({
              personaId: persona.id,
              name: subpersonaName,
              description: subpersonaData.description || null,
              isActive: 'true',
              sortOrder,
            });
          }
          sortOrder++;
        }

        const subpersonasToDisable = existingSubpersonas.filter((s: any) => !updatedSubpersonaIds.has(s.id));
        for (const subpersona of subpersonasToDisable) {
          subpersonasToUpdate.push({ id: subpersona.id, data: { isActive: 'false' } });
        }

        if (subpersonasToInsert.length > 0) {
          await tx.insert(subpersonas).values(subpersonasToInsert);
        }
        for (const update of subpersonasToUpdate) {
          await tx.update(subpersonas).set(update.data).where(eq(subpersonas.id, update.id));
        }
      }
    }

    const personasInConfig = Object.keys(personaData);
    const allDbPersonasAfter = await tx.select().from(personas);
    const personasToDelete = allDbPersonasAfter.filter((p: any) => !personasInConfig.includes(p.name));
    for (const persona of personasToDelete) {
      await tx.delete(personas).where(eq(personas.id, persona.id));
    }
  }

  private async syncCopyFrameworks(tx: any, frameworksData: any): Promise<void> {
    const allDbFrameworks = await tx.select().from(copyFrameworks);
    const updatedFrameworkIds = new Set<string>();
    const frameworksToInsert: InsertCopyFramework[] = [];
    const frameworksToUpdate: { id: string; data: Partial<InsertCopyFramework> }[] = [];

    (frameworksData?.headlineFrameworks || []).forEach((fw: any, index: number) => {
      if (!fw.name || fw.name.trim() === '') return;
      const existingFw = allDbFrameworks.find((dbFw: any) => dbFw.frameworkType === 'headline_framework' && dbFw.name === fw.name);
      const isEnabled = fw.isEnabled !== false;
      if (existingFw) {
        frameworksToUpdate.push({
          id: existingFw.id,
          data: { name: fw.name, description: fw.description, template: fw.template, examples: fw.examples, isEnabled: isEnabled ? 'true' : 'false', sortOrder: index },
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

    (frameworksData?.primaryTextRules || []).forEach((rule: string, index: number) => {
      if (!rule || rule.trim() === '') return;
      const existingRule = allDbFrameworks.find((dbFw: any) => dbFw.frameworkType === 'primary_text_rule' && dbFw.ruleText === rule);
      const isEnabled = frameworksData.enabledPrimaryTextRules?.[index] !== false;
      if (existingRule) {
        frameworksToUpdate.push({ id: existingRule.id, data: { isEnabled: isEnabled ? 'true' : 'false', sortOrder: index } });
        updatedFrameworkIds.add(existingRule.id);
      } else {
        frameworksToInsert.push({ frameworkType: 'primary_text_rule', ruleText: rule, isEnabled: isEnabled ? 'true' : 'false', sortOrder: index });
      }
    });

    (frameworksData?.brandDrBalance?.brandFirst || []).forEach((rule: string, index: number) => {
      if (!rule || rule.trim() === '') return;
      const existingRule = allDbFrameworks.find((dbFw: any) => dbFw.frameworkType === 'brand_first_guideline' && dbFw.ruleText === rule);
      if (existingRule) {
        frameworksToUpdate.push({ id: existingRule.id, data: { isEnabled: 'true', sortOrder: index } });
        updatedFrameworkIds.add(existingRule.id);
      } else {
        frameworksToInsert.push({ frameworkType: 'brand_first_guideline', ruleText: rule, isEnabled: 'true', sortOrder: index });
      }
    });

    (frameworksData?.brandDrBalance?.directResponse || []).forEach((rule: string, index: number) => {
      if (!rule || rule.trim() === '') return;
      const existingRule = allDbFrameworks.find((dbFw: any) => dbFw.frameworkType === 'direct_response_guideline' && dbFw.ruleText === rule);
      if (existingRule) {
        frameworksToUpdate.push({ id: existingRule.id, data: { isEnabled: 'true', sortOrder: index } });
        updatedFrameworkIds.add(existingRule.id);
      } else {
        frameworksToInsert.push({ frameworkType: 'direct_response_guideline', ruleText: rule, isEnabled: 'true', sortOrder: index });
      }
    });

    const headlineFrameworksToDisable = allDbFrameworks.filter((f: any) => f.frameworkType === 'headline_framework' && !updatedFrameworkIds.has(f.id));
    for (const fw of headlineFrameworksToDisable) {
      frameworksToUpdate.push({ id: fw.id, data: { isEnabled: 'false' } });
    }

    const otherFrameworksToDisable = allDbFrameworks.filter((f: any) => f.frameworkType !== 'headline_framework' && !updatedFrameworkIds.has(f.id));
    for (const fw of otherFrameworksToDisable) {
      frameworksToUpdate.push({ id: fw.id, data: { isEnabled: 'false' } });
    }

    if (frameworksToInsert.length > 0) {
      await tx.insert(copyFrameworks).values(frameworksToInsert);
    }
    for (const update of frameworksToUpdate) {
      await tx.update(copyFrameworks).set(update.data).where(eq(copyFrameworks.id, update.id));
    }
  }

  private async syncEmailFrameworks(tx: any, emailFrameworksArr: any[] | undefined): Promise<void> {
    if (!emailFrameworksArr || !Array.isArray(emailFrameworksArr)) return;
    const allDbEmailFrameworks = await tx.select().from(emailFrameworks);
    const emailFrameworksToUpdate: { id: string; data: Partial<InsertEmailFramework> }[] = [];
    const emailFrameworksToInsert: InsertEmailFramework[] = [];
    const updatedEmailFrameworkIds = new Set<string>();

    emailFrameworksArr.forEach((fw: any, index: number) => {
      if (!fw.name && !fw.displayName) return;
      const existingFw = allDbEmailFrameworks.find(
        (dbFw: any) => (fw.id && dbFw.id === fw.id) || (fw.name && dbFw.name === fw.name) || (fw.displayName && dbFw.displayName === fw.displayName)
      );
      const isEnabled = fw.isEnabled !== false;
      const frameworkData = {
        name: fw.name || fw.displayName?.toLowerCase().replace(/\s+/g, '_') || `framework_${index}`,
        displayName: fw.displayName || fw.name || `Framework ${index + 1}`,
        description: fw.description || '',
        structure: fw.structure || '',
        keyElements: fw.keyElements || '',
        frameworkContent: fw.frameworkContent || '',
        systemPrompt: fw.systemPrompt || '',
        outputRequirements: fw.outputRequirements || '',
        expectedLength: fw.expectedLength || 'medium',
        images: fw.images || null,
        isActive: isEnabled ? 'true' : 'false',
        sortOrder: fw.sortOrder !== undefined ? fw.sortOrder : index,
      };
      if (existingFw) {
        emailFrameworksToUpdate.push({ id: existingFw.id, data: frameworkData });
        updatedEmailFrameworkIds.add(existingFw.id);
      } else {
        emailFrameworksToInsert.push(frameworkData as InsertEmailFramework);
      }
    });

    const emailFrameworksToDisable = allDbEmailFrameworks.filter((f: any) => !updatedEmailFrameworkIds.has(f.id));
    for (const fw of emailFrameworksToDisable) {
      emailFrameworksToUpdate.push({ id: fw.id, data: { isActive: 'false' } });
    }

    const emailOperations: Promise<any>[] = [];
    if (emailFrameworksToInsert.length > 0) {
      emailOperations.push(tx.insert(emailFrameworks).values(emailFrameworksToInsert));
    }
    if (emailFrameworksToUpdate.length > 0) {
      const updatePromises = emailFrameworksToUpdate.map((update) =>
        tx.update(emailFrameworks).set({ ...update.data, updatedAt: new Date() }).where(eq(emailFrameworks.id, update.id))
      );
      emailOperations.push(...updatePromises);
    }
    if (emailOperations.length > 0) await Promise.all(emailOperations);
  }

  private async syncSmsFrameworks(tx: any, smsFrameworksArr: any[] | undefined): Promise<void> {
    if (!smsFrameworksArr || !Array.isArray(smsFrameworksArr)) return;
    const allDbSmsFrameworks = await tx.select().from(smsFrameworks);
    const smsFrameworksToUpdate: { id: string; data: Partial<InsertSmsFramework> }[] = [];
    const smsFrameworksToInsert: InsertSmsFramework[] = [];
    const updatedSmsFrameworkIds = new Set<string>();

    smsFrameworksArr.forEach((fw: any, index: number) => {
      if (!fw.name && !fw.displayName) return;
      const existingFw = allDbSmsFrameworks.find(
        (dbFw: any) => (fw.id && dbFw.id === fw.id) || (fw.name && dbFw.name === fw.name) || (fw.displayName && dbFw.displayName === fw.displayName)
      );
      const isEnabled = fw.isEnabled !== false;
      const frameworkData: InsertSmsFramework = {
        name: fw.name || fw.displayName?.toLowerCase().replace(/\s+/g, '_') || `framework_${index}`,
        displayName: fw.displayName || fw.name || `Framework ${index + 1}`,
        description: fw.description || '',
        structure: fw.structure || '',
        keyElements: fw.keyElements || '',
        frameworkContent: fw.frameworkContent || '',
        systemPrompt: fw.systemPrompt || '',
        outputRequirements: fw.outputRequirements || '',
        expectedLength: fw.expectedLength || 'short',
        images: fw.images || null,
        isActive: isEnabled ? 'true' : 'false',
        sortOrder: fw.sortOrder !== undefined ? fw.sortOrder : index,
      } as any;
      if (existingFw) {
        smsFrameworksToUpdate.push({ id: existingFw.id, data: frameworkData });
        updatedSmsFrameworkIds.add(existingFw.id);
      } else {
        smsFrameworksToInsert.push(frameworkData);
      }
    });

    const smsFrameworksToDisable = allDbSmsFrameworks.filter((f: any) => !updatedSmsFrameworkIds.has(f.id));
    for (const fw of smsFrameworksToDisable) {
      smsFrameworksToUpdate.push({ id: fw.id, data: { isActive: 'false' } });
    }

    const ops: Promise<any>[] = [];
    if (smsFrameworksToInsert.length > 0) {
      ops.push(tx.insert(smsFrameworks).values(smsFrameworksToInsert));
    }
    if (smsFrameworksToUpdate.length > 0) {
      const updatePromises = smsFrameworksToUpdate.map((update) =>
        tx.update(smsFrameworks).set({ ...update.data, updatedAt: new Date() }).where(eq(smsFrameworks.id, update.id))
      );
      ops.push(...updatePromises);
    }
    if (ops.length > 0) await Promise.all(ops);
  }

  private async syncLandingPageFrameworks(tx: any, landingPageFrameworksArr: any[] | undefined): Promise<void> {
    if (!landingPageFrameworksArr || !Array.isArray(landingPageFrameworksArr)) return;
    const allDbLandingPageFrameworks = await tx.select().from(landingPageFrameworks);
    const landingPageFrameworksToUpdate: { id: string; data: Partial<InsertLandingPageFramework> }[] = [];
    const landingPageFrameworksToInsert: InsertLandingPageFramework[] = [];
    const updatedLandingPageFrameworkIds = new Set<string>();

    landingPageFrameworksArr.forEach((fw: any, index: number) => {
      if (!fw.name && !fw.displayName) return;
      const existingFw = allDbLandingPageFrameworks.find(
        (dbFw: any) => (fw.id && dbFw.id === fw.id) || (fw.name && dbFw.name === fw.name) || (fw.displayName && dbFw.displayName === fw.displayName)
      );
      const isEnabled = fw.isEnabled !== false;
      const frameworkData = {
        name: fw.name || fw.displayName?.toLowerCase().replace(/\s+/g, '_') || `framework_${index}`,
        displayName: fw.displayName || fw.name || `Framework ${index + 1}`,
        description: fw.description || '',
        contentSequence: fw.contentSequence || [],
        reasonStructure: fw.reasonStructure || [],
        optimizationRules: fw.optimizationRules || [],
        realExamples: fw.realExamples || [],
        systemPrompt: fw.systemPrompt || '',
        outputRequirements: fw.outputRequirements || '',
        images: fw.images || null,
        isActive: isEnabled ? 'true' : 'false',
        sortOrder: fw.sortOrder !== undefined ? fw.sortOrder : index,
      };
      if (existingFw) {
        landingPageFrameworksToUpdate.push({ id: existingFw.id, data: frameworkData });
        updatedLandingPageFrameworkIds.add(existingFw.id);
      } else {
        landingPageFrameworksToInsert.push(frameworkData as InsertLandingPageFramework);
      }
    });

    if (landingPageFrameworksToInsert.length > 0) {
      await tx.insert(landingPageFrameworks).values(landingPageFrameworksToInsert);
    }
    for (const update of landingPageFrameworksToUpdate) {
      await tx
        .update(landingPageFrameworks)
        .set({ ...update.data, updatedAt: new Date() })
        .where(eq(landingPageFrameworks.id, update.id));
    }
  }

  private async upsertSystemConfiguration(tx: any, config: TrainingConfig): Promise<void> {
    const allDbSystemConfigs = await tx.select().from(systemConfiguration);
    const allDbBrandConfigs = await tx.select().from(brandConfiguration);
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
        const inner = configObject[outerKey] || {};
        for (const innerKey in inner) {
          const configKey = `${prefix}.${outerKey}.${innerKey}`;
          const rawValue = inner[innerKey];
          const configValue = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);
          if (configValue !== undefined && configValue !== null) {
            configsToUpsert.push({ configKey, configValue: String(configValue) });
          }
        }
      }
    };

    if (config.modelParameters) processSystemConfig('modelParameters', config.modelParameters as any);
    if (config.stationPrompts) processNestedSystemConfig('stationPrompts', config.stationPrompts as any);

    if (config.brandGuidelines) {
      const { brandName, website } = config.brandGuidelines as any;
      const existingBrandName = allDbBrandConfigs.find((c: any) => c.configType === 'brand_name');
      if (brandName !== undefined) {
        if (existingBrandName) {
          await tx
            .update(brandConfiguration)
            .set({ configValue: String(brandName), isEnabled: 'true' })
            .where(eq(brandConfiguration.id, existingBrandName.id));
        } else if (String(brandName).trim() !== '') {
          await tx.insert(brandConfiguration).values({
            configType: 'brand_name',
            configValue: String(brandName),
            isEnabled: 'true',
            sortOrder: 0,
          });
        }
      }
      const existingWebsite = allDbBrandConfigs.find((c: any) => c.configType === 'website');
      if (website !== undefined) {
        if (existingWebsite) {
          await tx
            .update(brandConfiguration)
            .set({ configValue: String(website), isEnabled: 'true' })
            .where(eq(brandConfiguration.id, existingWebsite.id));
        } else if (String(website).trim() !== '') {
          await tx.insert(brandConfiguration).values({
            configType: 'website',
            configValue: String(website),
            isEnabled: 'true',
            sortOrder: 0,
          });
        }
      }
    }

    for (const cfg of configsToUpsert) {
      const existingConfig = allDbSystemConfigs.find((dbC: any) => dbC.configKey === cfg.configKey);
      if (existingConfig) {
        if (existingConfig.configValue !== cfg.configValue) {
          await tx.update(systemConfiguration).set({ configValue: cfg.configValue }).where(eq(systemConfiguration.configKey, cfg.configKey));
        }
      } else {
        await tx.insert(systemConfiguration).values(cfg);
      }
    }

    const newStationKeys = new Set(
      configsToUpsert.filter((c) => c.configKey.startsWith('stationPrompts.')).map((c) => c.configKey)
    );
    const existingStationKeys = allDbSystemConfigs.filter((c: any) => c.configKey.startsWith('stationPrompts.')).map((c: any) => c.configKey);
    const stationKeysToDelete = existingStationKeys.filter((k: string) => !newStationKeys.has(k));
    for (const key of stationKeysToDelete) {
      await tx.delete(systemConfiguration).where(eq(systemConfiguration.configKey, key));
    }
    if (stationKeysToDelete.length > 0) {
      console.log(`Station Prompts: removed ${stationKeysToDelete.length} stale keys`);
    }
  }

  // Email frameworks operations
  async getAllEmailFrameworks(): Promise<EmailFramework[]> {
    const frameworks = await db.select().from(emailFrameworks).orderBy(emailFrameworks.sortOrder);

    return frameworks;
  }

  async getActiveEmailFrameworks(): Promise<EmailFramework[]> {
    return await db.select().from(emailFrameworks).where(eq(emailFrameworks.isActive, 'true')).orderBy(emailFrameworks.sortOrder);
  }

  async getEmailFramework(name: string): Promise<EmailFramework | undefined> {
    const [framework] = await db.select().from(emailFrameworks).where(eq(emailFrameworks.name, name));
    return framework || undefined;
  }

  async getEmailFrameworkById(id: string): Promise<EmailFramework | undefined> {
    const [framework] = await db.select().from(emailFrameworks).where(eq(emailFrameworks.id, id));
    return framework || undefined;
  }

  async createEmailFramework(data: InsertEmailFramework): Promise<EmailFramework> {
    const [framework] = await db.insert(emailFrameworks).values(data).returning();
    return framework;
  }

  async updateEmailFramework(id: string, data: Partial<InsertEmailFramework>): Promise<EmailFramework> {
    const [framework] = await db.update(emailFrameworks).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(emailFrameworks.id, id)).returning();
    return framework;
  }

  async updateEmailFrameworkByName(name: string, data: Partial<InsertEmailFramework>): Promise<EmailFramework> {
    const [framework] = await db.update(emailFrameworks).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(emailFrameworks.name, name)).returning();
    return framework;
  }

  async deleteEmailFramework(name: string): Promise<void> {
    await db.delete(emailFrameworks).where(eq(emailFrameworks.name, name));
  }

  async deleteEmailFrameworkById(id: string): Promise<void> {
    await db.delete(emailFrameworks).where(eq(emailFrameworks.id, id));
  }

  // SMS frameworks operations
  async getAllSmsFrameworks(): Promise<SmsFramework[]> {
    const frameworks = await db.select().from(smsFrameworks).orderBy(smsFrameworks.sortOrder);
    return frameworks;
  }

  async getActiveSmsFrameworks(): Promise<SmsFramework[]> {
    return await db.select().from(smsFrameworks).where(eq(smsFrameworks.isActive, 'true')).orderBy(smsFrameworks.sortOrder);
  }

  async getSmsFramework(name: string): Promise<SmsFramework | undefined> {
    const [framework] = await db.select().from(smsFrameworks).where(eq(smsFrameworks.name, name));
    return framework || undefined;
  }

  async getSmsFrameworkById(id: string): Promise<SmsFramework | undefined> {
    const [framework] = await db.select().from(smsFrameworks).where(eq(smsFrameworks.id, id));
    return framework || undefined;
  }

  async createSmsFramework(data: InsertSmsFramework): Promise<SmsFramework> {
    const [framework] = await db.insert(smsFrameworks).values(data).returning();
    return framework;
  }

  async updateSmsFramework(id: string, data: Partial<InsertSmsFramework>): Promise<SmsFramework> {
    const [framework] = await db.update(smsFrameworks).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(smsFrameworks.id, id)).returning();
    return framework;
  }

  async updateSmsFrameworkByName(name: string, data: Partial<InsertSmsFramework>): Promise<SmsFramework> {
    const [framework] = await db.update(smsFrameworks).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(smsFrameworks.name, name)).returning();
    return framework;
  }

  async deleteSmsFramework(name: string): Promise<void> {
    await db.delete(smsFrameworks).where(eq(smsFrameworks.name, name));
  }

  async deleteSmsFrameworkById(id: string): Promise<void> {
    await db.delete(smsFrameworks).where(eq(smsFrameworks.id, id));
  }

  // Landing page frameworks operations
  async getAllLandingPageFrameworks(): Promise<LandingPageFramework[]> {
    const frameworks = await db.select().from(landingPageFrameworks).orderBy(landingPageFrameworks.sortOrder);
    return frameworks;
  }

  async getActiveLandingPageFrameworks(): Promise<LandingPageFramework[]> {
    return await db.select().from(landingPageFrameworks).where(eq(landingPageFrameworks.isActive, 'true')).orderBy(landingPageFrameworks.sortOrder);
  }

  async getLandingPageFramework(name: string): Promise<LandingPageFramework | undefined> {
    const [framework] = await db.select().from(landingPageFrameworks).where(eq(landingPageFrameworks.name, name));
    return framework || undefined;
  }

  async getLandingPageFrameworkById(id: string): Promise<LandingPageFramework | undefined> {
    const [framework] = await db.select().from(landingPageFrameworks).where(eq(landingPageFrameworks.id, id));
    return framework || undefined;
  }

  async createLandingPageFramework(data: InsertLandingPageFramework): Promise<LandingPageFramework> {
    const [framework] = await db.insert(landingPageFrameworks).values(data).returning();
    return framework;
  }

  async updateLandingPageFramework(id: string, data: Partial<InsertLandingPageFramework>): Promise<LandingPageFramework> {
    const [framework] = await db.update(landingPageFrameworks).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(landingPageFrameworks.id, id)).returning();
    return framework;
  }

  async updateLandingPageFrameworkByName(name: string, data: Partial<InsertLandingPageFramework>): Promise<LandingPageFramework> {
    const [framework] = await db.update(landingPageFrameworks).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(landingPageFrameworks.name, name)).returning();
    return framework;
  }

  async deleteLandingPageFramework(name: string): Promise<void> {
    await db.delete(landingPageFrameworks).where(eq(landingPageFrameworks.name, name));
  }

  async deleteLandingPageFrameworkById(id: string): Promise<void> {
    await db.delete(landingPageFrameworks).where(eq(landingPageFrameworks.id, id));
  }

  // Email image analysis operations
  async saveEmailImageAnalysis(data: InsertEmailImageAnalysis): Promise<EmailImageAnalysis> {
    const [analysis] = await db.insert(emailImageAnalysis).values(data).returning();
    return analysis;
  }

  async getEmailImageAnalysis(id: string): Promise<EmailImageAnalysis | undefined> {
    const [analysis] = await db.select().from(emailImageAnalysis).where(eq(emailImageAnalysis.id, id));
    return analysis || undefined;
  }

  async getEmailImageAnalysisByUser(userId: string): Promise<EmailImageAnalysis[]> {
    return await db.select().from(emailImageAnalysis).where(eq(emailImageAnalysis.userId, userId)).orderBy(desc(emailImageAnalysis.createdAt));
  }

  async updateEmailImageAnalysis(id: string, data: Partial<InsertEmailImageAnalysis>): Promise<EmailImageAnalysis> {
    const [analysis] = await db.update(emailImageAnalysis).set(data).where(eq(emailImageAnalysis.id, id)).returning();
    return analysis;
  }

  async deleteEmailImageAnalysis(id: string): Promise<void> {
    await db.delete(emailImageAnalysis).where(eq(emailImageAnalysis.id, id));
  }
}

export const storage = new DatabaseStorage();
