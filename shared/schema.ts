import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { enum: ["admin", "team_member"] }).notNull().default("team_member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  username: true,
  role: true,
}).partial();

export const adminCreateUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Session table for express-session storage
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => [
  index("IDX_session_expire").on(table.expire)
]);

// Generated copy tracking for analytics and feedback
export const generatedCopy = pgTable("generated_copy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Input data
  inputText: text("input_text"),
  landingPageUrl: varchar("landing_page_url"),
  targetPersona: varchar("target_persona"),
  brandDrBalance: integer("brand_dr_balance"), // 0-100 percentage
  
  // Generated output
  headlines: jsonb("headlines"), // Array of headline objects with framework info
  primaryText: text("primary_text"),
  
  // AI configuration used
  configSnapshot: jsonb("config_snapshot"), // Training config at time of generation
  
  // Feedback data
  rating: varchar("rating"), // "excellent", "good", "poor", null
  feedback: text("feedback"), // Optional text feedback
  
  // Analytics
  generationTimeMs: integer("generation_time_ms"), // Time taken to generate
  tokensUsed: integer("tokens_used"), // Claude tokens consumed
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGeneratedCopySchema = createInsertSchema(generatedCopy).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedCopy = z.infer<typeof insertGeneratedCopySchema>;
export type GeneratedCopy = typeof generatedCopy.$inferSelect;

// Password reset tokens for secure email-based password reset
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Products table for dynamic product management
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  isActive: varchar("is_active").default("true"), // boolean as string for consistency
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product claims (approved and prohibited)
export const productClaims = pgTable("product_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  claimText: text("claim_text").notNull(),
  claimType: varchar("claim_type", { enum: ["approved", "prohibited"] }).notNull(),
  isEnabled: varchar("is_enabled").default("true"), // boolean as string
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Personas table for dynamic persona management
export const personas = pgTable("personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  isActive: varchar("is_active").default("true"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Persona pillars (the key messaging points for each persona)
export const personaPillars = pgTable("persona_pillars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").references(() => personas.id, { onDelete: "cascade" }).notNull(),
  pillarText: text("pillar_text").notNull(),
  isEnabled: varchar("is_enabled").default("true"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand configuration table for core positioning and guidelines
export const brandConfiguration = pgTable("brand_configuration", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configType: varchar("config_type", { 
    enum: ["core_positioning", "brand_voice", "key_terminology", "approved_language", "avoided_language"] 
  }).notNull(),
  configValue: text("config_value").notNull(),
  isEnabled: varchar("is_enabled").default("true"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Copy frameworks table for headline frameworks and guidelines
export const copyFrameworks = pgTable("copy_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkType: varchar("framework_type", { 
    enum: ["headline_framework", "primary_text_rule", "brand_first_guideline", "direct_response_guideline"] 
  }).notNull(),
  name: varchar("name"), // For headline frameworks
  description: text("description"), // For headline frameworks
  template: text("template"), // For headline frameworks
  examples: jsonb("examples"), // Array of examples for headline frameworks
  ruleText: text("rule_text"), // For rules and guidelines
  isEnabled: varchar("is_enabled").default("true"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System configuration for prompts and model parameters
export const systemConfiguration = pgTable("system_configuration", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configKey: varchar("config_key").notNull().unique(),
  configValue: text("config_value").notNull(),
  configDescription: text("config_description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email frameworks table for the 15 email types and their specific structures
export const emailFrameworks = pgTable("email_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // e.g., "gtl", "plain_text", "product_spotlight"
  displayName: varchar("display_name").notNull(), // e.g., "GTL (Get the Look)", "Plain Text / Letter-Style Note"
  description: text("description").notNull(), // Purpose and use case
  structure: text("structure").notNull(), // Framework structure description
  keyElements: text("key_elements"), // Key elements and guidelines
  frameworkContent: text("framework_content"), // Detailed framework content and examples
  systemPrompt: text("system_prompt").notNull(), // AI prompt for this framework
  outputRequirements: text("output_requirements"), // Expected output format and structure
  expectedLength: varchar("expected_length"), // Expected length (e.g., "short", "medium", "long", "500-800 words")
  customLength: varchar("custom_length"), // Custom length specification when expectedLength is "custom"
  images: jsonb("images"), // Array of image file paths for visual layout reference (max 5)
  isActive: varchar("is_active").default("true"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Landing page frameworks table for different landing page types and their structures
export const landingPageFrameworks = pgTable("landing_page_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(), // e.g., "listicle", "trojan_horse", "multi_product"
  displayName: varchar("display_name").notNull(), // e.g., "Listicle", "Trojan Horse", "Multi Product Page"
  description: text("description").notNull(), // Purpose and use case
  contentSequence: jsonb("content_sequence"), // Array of content structure sequence
  reasonStructure: jsonb("reason_structure"), // Array of each reason structure format
  optimizationRules: jsonb("optimization_rules"), // Array of optimization rules
  realExamples: jsonb("real_examples"), // Array of real example patterns to emulate
  systemPrompt: text("system_prompt").notNull(), // AI prompt for this framework
  outputRequirements: text("output_requirements"), // Expected output format and structure
  images: jsonb("images"), // Array of image file paths for visual layout reference (max 5)
  isActive: varchar("is_active").default("true"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email image analysis table for storing uploaded email images and their framework analysis
export const emailImageAnalysis = pgTable("email_image_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  imagePath: varchar("image_path").notNull(), // Path to uploaded image
  selectedFramework: varchar("selected_framework").references(() => emailFrameworks.name).notNull(),
  aiAnalysis: text("ai_analysis").notNull(), // Claude's analysis of the email
  extractedElements: jsonb("extracted_elements"), // Structured data from analysis
  confidence: integer("confidence"), // AI confidence score 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductClaimSchema = createInsertSchema(productClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonaSchema = createInsertSchema(personas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonaPillarSchema = createInsertSchema(personaPillars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandConfigurationSchema = createInsertSchema(brandConfiguration).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCopyFrameworkSchema = createInsertSchema(copyFrameworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemConfigurationSchema = createInsertSchema(systemConfiguration).omit({
  id: true,
  updatedAt: true,
});

export const insertEmailFrameworkSchema = createInsertSchema(emailFrameworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailImageAnalysisSchema = createInsertSchema(emailImageAnalysis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLandingPageFrameworkSchema = createInsertSchema(landingPageFrameworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductClaim = typeof productClaims.$inferSelect;
export type InsertProductClaim = z.infer<typeof insertProductClaimSchema>;
export type Persona = typeof personas.$inferSelect;
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type PersonaPillar = typeof personaPillars.$inferSelect;
export type InsertPersonaPillar = z.infer<typeof insertPersonaPillarSchema>;
export type BrandConfiguration = typeof brandConfiguration.$inferSelect;
export type InsertBrandConfiguration = z.infer<typeof insertBrandConfigurationSchema>;
export type CopyFramework = typeof copyFrameworks.$inferSelect;
export type InsertCopyFramework = z.infer<typeof insertCopyFrameworkSchema>;
export type SystemConfiguration = typeof systemConfiguration.$inferSelect;
export type InsertSystemConfiguration = z.infer<typeof insertSystemConfigurationSchema>;
export type EmailFramework = typeof emailFrameworks.$inferSelect;
export type InsertEmailFramework = z.infer<typeof insertEmailFrameworkSchema>;
export type LandingPageFramework = typeof landingPageFrameworks.$inferSelect;
export type InsertLandingPageFramework = z.infer<typeof insertLandingPageFrameworkSchema>;
export type EmailImageAnalysis = typeof emailImageAnalysis.$inferSelect;
export type InsertEmailImageAnalysis = z.infer<typeof insertEmailImageAnalysisSchema>;

// Product launch briefs table for storing and improving AI training data
export const productBriefs = pgTable("product_briefs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  
  // Input data
  notes: text("notes").notNull(), // Meeting notes and transcripts
  googleDriveLinks: jsonb("google_drive_links"), // Array of Google Drive links to past briefs
  
  // Generated output
  generatedBrief: text("generated_brief").notNull(),
  
  // AI configuration used
  configSnapshot: jsonb("config_snapshot"), // Training config at time of generation
  
  // Performance tracking
  generationTimeMs: integer("generation_time_ms"), // Time taken to generate
  tokensUsed: integer("tokens_used"), // Claude tokens consumed
  
  // Quality feedback (for future model improvement)
  rating: varchar("rating"), // "excellent", "good", "poor", null
  feedback: text("feedback"), // Optional text feedback from user
  wasEdited: varchar("was_edited").default("false"), // Track if user edited the output
  finalVersion: text("final_version"), // Store user's final edited version if different
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductBriefSchema = createInsertSchema(productBriefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProductBrief = typeof productBriefs.$inferSelect;
export type InsertProductBrief = z.infer<typeof insertProductBriefSchema>;
