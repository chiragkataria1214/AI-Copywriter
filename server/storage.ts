import { 
  type User, 
  type InsertUser, 
  type InsertGeneratedCopy,
  type GeneratedCopy,
  users,
  generatedCopy
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Generated copy operations
  saveGeneratedCopy(data: InsertGeneratedCopy): Promise<GeneratedCopy>;
  updateCopyFeedback(id: string, rating: string, feedback?: string): Promise<void>;
  getCopyHistory(userId: string, limit?: number): Promise<GeneratedCopy[]>;
  getCopyAnalytics(): Promise<any>;
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
}

export const storage = new DatabaseStorage();
