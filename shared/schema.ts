import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
