import { pgTable, index, varchar, jsonb, timestamp, foreignKey, text, integer, unique, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const gen_random_uuid = sql`gen_random_uuid()`



export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const generatedCopy = pgTable("generated_copy", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	userId: varchar("user_id"),
	inputText: text("input_text"),
	landingPageUrl: varchar("landing_page_url"),
	targetPersona: varchar("target_persona"),
	brandDrBalance: integer("brand_dr_balance"),
	headlines: jsonb(),
	primaryText: text("primary_text"),
	configSnapshot: jsonb("config_snapshot"),
	rating: varchar(),
	feedback: text(),
	generationTimeMs: integer("generation_time_ms"),
	tokensUsed: integer("tokens_used"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generated_copy_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	role: varchar().default('team_member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	token: varchar().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const products = pgTable("products", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	name: varchar().notNull(),
	displayName: varchar("display_name").notNull(),
	description: text(),
	isActive: varchar("is_active").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const productClaims = pgTable("product_claims", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	productId: varchar("product_id").notNull(),
	claimText: text("claim_text").notNull(),
	claimType: varchar("claim_type").notNull(),
	isEnabled: varchar("is_enabled").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_claims_product_id_fkey"
		}).onDelete("cascade"),
	check("product_claims_claim_type_check", sql`(claim_type)::text = ANY ((ARRAY['approved'::character varying, 'prohibited'::character varying])::text[])`),
]);

export const personas = pgTable("personas", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	name: varchar().notNull(),
	displayName: varchar("display_name").notNull(),
	description: text(),
	isActive: varchar("is_active").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const personaPillars = pgTable("persona_pillars", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	personaId: varchar("persona_id").notNull(),
	pillarText: text("pillar_text").notNull(),
	isEnabled: varchar("is_enabled").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.personaId],
			foreignColumns: [personas.id],
			name: "persona_pillars_persona_id_fkey"
		}).onDelete("cascade"),
]);

export const brandConfiguration = pgTable("brand_configuration", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	configType: varchar("config_type").notNull(),
	configValue: text("config_value").notNull(),
	isEnabled: varchar("is_enabled").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	check("brand_configuration_config_type_check", sql`(config_type)::text = ANY ((ARRAY['core_positioning'::character varying, 'brand_voice'::character varying, 'key_terminology'::character varying, 'approved_language'::character varying, 'avoided_language'::character varying])::text[])`),
]);

export const copyFrameworks = pgTable("copy_frameworks", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	frameworkType: varchar("framework_type").notNull(),
	name: varchar(),
	description: text(),
	template: text(),
	examples: jsonb(),
	ruleText: text("rule_text"),
	isEnabled: varchar("is_enabled").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	check("copy_frameworks_framework_type_check", sql`(framework_type)::text = ANY ((ARRAY['headline_framework'::character varying, 'primary_text_rule'::character varying, 'brand_first_guideline'::character varying, 'direct_response_guideline'::character varying])::text[])`),
]);

export const systemConfiguration = pgTable("system_configuration", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	configKey: varchar("config_key").notNull(),
	configValue: text("config_value").notNull(),
	configDescription: text("config_description"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const emailImageAnalysis = pgTable("email_image_analysis", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	userId: varchar("user_id"),
	imagePath: varchar("image_path").notNull(),
	selectedFramework: varchar("selected_framework").notNull(),
	aiAnalysis: text("ai_analysis").notNull(),
	extractedElements: jsonb("extracted_elements"),
	confidence: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_image_analysis_user_id_fkey"
		}),
	foreignKey({
			columns: [table.selectedFramework],
			foreignColumns: [emailFrameworks.name],
			name: "email_image_analysis_selected_framework_fkey"
		}),
]);

export const emailFrameworks = pgTable("email_frameworks", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	name: varchar().notNull(),
	displayName: varchar("display_name").notNull(),
	description: text().notNull(),
	structure: text().notNull(),
	keyElements: text("key_elements"),
	frameworkContent: text("framework_content"),
	systemPrompt: text("system_prompt").notNull(),
	outputRequirements: text("output_requirements"),
	expectedLength: varchar("expected_length"),
	customLength: varchar("custom_length"),
	images: jsonb("images"),
	isActive: varchar("is_active").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("email_frameworks_name_key").on(table.name),
]);

export const landingPageFrameworks = pgTable("landing_page_frameworks", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	name: varchar().notNull(),
	displayName: varchar("display_name").notNull(),
	description: text().notNull(),
	contentSequence: jsonb("content_sequence"),
	reasonStructure: jsonb("reason_structure"),
	optimizationRules: jsonb("optimization_rules"),
	realExamples: jsonb("real_examples"),
	systemPrompt: text("system_prompt").notNull(),
	outputRequirements: text("output_requirements"),
	images: jsonb("images"),
	isActive: varchar("is_active").default('true'),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("landing_page_frameworks_name_key").on(table.name),
]);

export const productBriefs = pgTable("product_briefs", {
	id: varchar().default(gen_random_uuid).primaryKey().notNull(),
	userId: varchar("user_id"),
	notes: text().notNull(),
	googleDriveLinks: jsonb("google_drive_links"),
	generatedBrief: text("generated_brief").notNull(),
	configSnapshot: jsonb("config_snapshot"),
	generationTimeMs: integer("generation_time_ms"),
	tokensUsed: integer("tokens_used"),
	rating: varchar(),
	feedback: text(),
	wasEdited: varchar("was_edited").default('false'),
	finalVersion: text("final_version"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});
