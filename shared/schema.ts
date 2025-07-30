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
