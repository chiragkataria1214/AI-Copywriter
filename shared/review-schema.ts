import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customer Reviews Table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: varchar("product_name").notNull(),
  reviewText: text("review_text").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewerName: varchar("reviewer_name"),
  reviewerAge: varchar("reviewer_age"), // e.g., "30s", "40s", "50+"
  skinType: varchar("skin_type"), // e.g., "dry", "oily", "combination", "sensitive"

  source: varchar("source").notNull(), // "website", "amazon", "sephora", etc.
  verifiedPurchase: boolean("verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Analysis of Reviews
export const reviewAnalysis = pgTable("review_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").references(() => reviews.id),
  sentiment: varchar("sentiment"), // "positive", "negative", "neutral"
  keyThemes: text("key_themes"), // comma-separated themes
  customerLanguage: text("customer_language"), // comma-separated phrases
  painPoints: text("pain_points"), // comma-separated pain points
  benefits: text("benefits"), // comma-separated benefits
  momSpecific: boolean("mom_specific").default(false), // if review mentions mom/parenting context
  personas: jsonb("personas").$type<string[]>(), // which personas this review fits
  ageGroup: varchar("age_group"), // inferred from review content
  lifestyleContext: jsonb("lifestyle_context").$type<string[]>(), // "busy morning", "work", "date night"
  createdAt: timestamp("created_at").defaultNow(),
});

// Training Insights derived from reviews
export const trainingInsights = pgTable("training_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull(), // "language_patterns", "pain_points", "benefits", "personas"
  insight: text("insight").notNull(),
  supportingReviewIds: jsonb("supporting_review_ids").$type<string[]>(),
  frequency: integer("frequency").default(1), // how often this insight appears
  confidence: integer("confidence").default(50), // 0-100 confidence score
  isActive: boolean("is_active").default(true), // whether to use in training
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewAnalysisSchema = createInsertSchema(reviewAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingInsightSchema = createInsertSchema(trainingInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ReviewAnalysis = typeof reviewAnalysis.$inferSelect;
export type InsertReviewAnalysis = z.infer<typeof insertReviewAnalysisSchema>;
export type TrainingInsight = typeof trainingInsights.$inferSelect;
export type InsertTrainingInsight = z.infer<typeof insertTrainingInsightSchema>;