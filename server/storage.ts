import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  profiles, tests, questions, testResults, posts, comments,
  type Profile, type InsertProfile,
  type Test,
  type Question,
  type TestResult, type InsertTestResult,
  type Post, type InsertPost,
  type Comment, type InsertComment
} from "@shared/schema";

export interface IStorage {
  // Profiles
  getProfiles(userId: string): Promise<Profile[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  deleteProfile(id: number): Promise<void>;
  getProfile(id: number): Promise<Profile | undefined>;

  // Tests
  getTests(): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  getQuestions(testId: number): Promise<Question[]>;

  // Results
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  getTestResults(userId: string): Promise<(TestResult & { test: Test; profile: Profile })[]>;
  getTestResult(id: number): Promise<(TestResult & { test: Test; profile: Profile }) | undefined>;

  // Community
  getPosts(): Promise<(Post & { user: { firstName: string | null } })[]>;
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<(Post & { user: { firstName: string | null } }) | undefined>;
  getComments(postId: number): Promise<(Comment & { user: { firstName: string | null } })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfiles(userId: string): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.userId, userId));
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async deleteProfile(id: number): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  // Tests
  async getTests(): Promise<Test[]> {
    return await db.select().from(tests);
  }

  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async getQuestions(testId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.testId, testId)).orderBy(questions.order);
  }

  // Results
  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const [newResult] = await db.insert(testResults).values(result).returning();
    return newResult;
  }

  async getTestResults(userId: string): Promise<(TestResult & { test: Test; profile: Profile })[]> {
    return await db.query.testResults.findMany({
      where: eq(testResults.userId, userId),
      with: {
        test: true,
        profile: true
      },
      orderBy: desc(testResults.conductedAt)
    });
  }

  async getTestResult(id: number): Promise<(TestResult & { test: Test; profile: Profile }) | undefined> {
    return await db.query.testResults.findFirst({
      where: eq(testResults.id, id),
      with: {
        test: true,
        profile: true
      }
    });
  }

  // Community
  async getPosts(): Promise<(Post & { user: { firstName: string | null } })[]> {
    return await db.query.posts.findMany({
      with: {
        user: {
          columns: {
            firstName: true
          }
        }
      },
      orderBy: desc(posts.createdAt)
    });
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPost(id: number): Promise<(Post & { user: { firstName: string | null } }) | undefined> {
    return await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        user: {
          columns: {
            firstName: true
          }
        }
      }
    });
  }

  async getComments(postId: number): Promise<(Comment & { user: { firstName: string | null } })[]> {
    return await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      with: {
        user: {
          columns: {
            firstName: true
          }
        }
      },
      orderBy: desc(comments.createdAt)
    });
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }
}

export const storage = new DatabaseStorage();
