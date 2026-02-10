import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// --- Profiles ---
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  relation: text("relation").notNull(), // 'self', 'spouse', 'child', etc.
  birthDate: timestamp("birth_date"),
  gender: text("gender"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });

// --- Tests ---
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'parenting', 'child_development', 'couple', 'temperament' etc.
  questionCount: integer("question_count").notNull(),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  coverImage: text("cover_image"),
  isPublic: boolean("is_public").default(true),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => tests.id),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'likert', 'choice'
  options: jsonb("options"), // Array of { label, score }
  order: integer("order").notNull(),
});

export const testsRelations = relations(tests, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
}));

export const insertTestSchema = createInsertSchema(tests).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });

// --- Results ---
export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  profileId: integer("profile_id").notNull().references(() => profiles.id), // Who took the test or who is it about
  testId: integer("test_id").notNull().references(() => tests.id),
  answers: jsonb("answers").notNull(), // Record<questionId, score/value>
  score: jsonb("score"), // Calculated result
  summary: text("summary"),
  conductedAt: timestamp("conducted_at").defaultNow(),
});

export const testResultsRelations = relations(testResults, ({ one }) => ({
  user: one(users, {
    fields: [testResults.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [testResults.profileId],
    references: [profiles.id],
  }),
  test: one(tests, {
    fields: [testResults.testId],
    references: [tests.id],
  }),
}));

export const insertTestResultSchema = createInsertSchema(testResults).omit({ id: true, conductedAt: true });

// --- Community ---
export const posts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'free', 'worry', 'info'
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, views: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });

// --- Types ---
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Test = typeof tests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type CreateTestResultRequest = InsertTestResult;
