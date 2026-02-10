import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProfileSchema, insertPostSchema, insertCommentSchema, insertTestResultSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- Profiles ---
  app.get(api.profiles.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const profiles = await storage.getProfiles((req.user as any).claims.sub);
    res.json(profiles);
  });

  app.post(api.profiles.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const data = insertProfileSchema.parse({
        ...req.body,
        userId: (req.user as any).claims.sub
      });
      const profile = await storage.createProfile(data);
      res.status(201).json(profile);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.profiles.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    // TODO: Verify ownership
    await storage.deleteProfile(id);
    res.status(204).send();
  });

  // --- Tests ---
  app.get(api.tests.list.path, async (req, res) => {
    const tests = await storage.getTests();
    res.json(tests);
  });

  app.get(api.tests.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const test = await storage.getTest(id);
    if (!test) return res.status(404).send();
    const questions = await storage.getQuestions(id);
    res.json({ ...test, questions });
  });

  app.post(api.tests.submit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const testId = parseInt(req.params.id);
      const data = insertTestResultSchema.omit({ userId: true, testId: true }).parse(req.body);
      
      // Calculate score logic here (simplified for now)
      // In a real app, we'd compare answers to scoring key
      const score = { total: Object.values(data.answers as Record<string, number>).reduce((a, b) => a + Number(b), 0) };
      
      const result = await storage.createTestResult({
        ...data,
        testId,
        userId: (req.user as any).claims.sub,
        score
      });
      res.status(201).json(result);
    } catch (e) {
      console.error(e);
      res.status(400).send();
    }
  });

  // --- Results ---
  app.get(api.results.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const results = await storage.getTestResults((req.user as any).claims.sub);
    res.json(results);
  });

  app.get(api.results.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    const result = await storage.getTestResult(id);
    if (!result) return res.status(404).send();
    // Verify ownership
    if (result.userId !== (req.user as any).claims.sub) return res.status(403).send();
    res.json(result);
  });

  // --- Community ---
  app.get(api.community.list.path, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post(api.community.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const data = insertPostSchema.omit({ userId: true }).parse(req.body);
      const post = await storage.createPost({
        ...data,
        userId: (req.user as any).claims.sub
      });
      res.status(201).json(post);
    } catch (e) {
      res.status(400).send();
    }
  });

  app.get(api.community.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const post = await storage.getPost(id);
    if (!post) return res.status(404).send();
    const comments = await storage.getComments(id);
    res.json({ ...post, comments });
  });

  app.post(api.community.comment.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const postId = parseInt(req.params.id);
      const data = insertCommentSchema.omit({ userId: true, postId: true }).parse(req.body);
      const comment = await storage.createComment({
        ...data,
        postId,
        userId: (req.user as any).claims.sub
      });
      res.status(201).json(comment);
    } catch (e) {
      res.status(400).send();
    }
  });

  // Seed Data Endpoint (for development)
  app.post("/api/seed", async (req, res) => {
    const existingTests = await storage.getTests();
    if (existingTests.length === 0) {
      const { db } = await import("./db");
      const { tests, questions } = await import("@shared/schema");
      
      // Test 1: Parenting Stress
      const [test1] = await db.insert(tests).values({
        title: "부모 양육 스트레스 검사 (PSI)",
        description: "육아로 인한 스트레스 수준을 점검하고 마음의 여유를 찾으세요.",
        category: "parenting",
        questionCount: 5,
        estimatedTime: 3,
        coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a"
      }).returning();
      
      await db.insert(questions).values([
        { testId: test1.id, text: "아이와 함께 있으면 기이 빨리는 느낌이 든다.", type: "likert", order: 1, options: [{label: "전혀 아니다", score: 1}, {label: "매우 그렇다", score: 5}] },
        { testId: test1.id, text: "육아 때문에 내 개인적인 삶이 없어진 것 같다.", type: "likert", order: 2, options: [] },
        { testId: test1.id, text: "아이가 나를 힘들게 하려고 일부러 그러는 것 같다.", type: "likert", order: 3, options: [] },
        { testId: test1.id, text: "다른 부모들에 비해 내가 부족한 것 같아 우울하다.", type: "likert", order: 4, options: [] },
        { testId: test1.id, text: "아이의 장래가 걱정되어 잠이 안 올 때가 있다.", type: "likert", order: 5, options: [] },
      ]);

      // Test 2: Couple Satisfaction
      const [test2] = await db.insert(tests).values({
        title: "부부 관계 만족도 검사",
        description: "우리 부부의 소통 방식과 친밀도를 점검해보세요.",
        category: "couple",
        questionCount: 5,
        estimatedTime: 3,
        coverImage: "https://images.unsplash.com/photo-1621451537084-482c73073a0f"
      }).returning();

      await db.insert(questions).values([
        { testId: test2.id, text: "배우자와 대화가 잘 통한다고 느낀다.", type: "likert", order: 1, options: [] },
        { testId: test2.id, text: "갈등이 생겼을 때 원만하게 해결하는 편이다.", type: "likert", order: 2, options: [] },
        { testId: test2.id, text: "배우자는 나의 감정을 잘 이해해준다.", type: "likert", order: 3, options: [] },
        { testId: test2.id, text: "우리는 육아와 가사를 공평하게 분담한다.", type: "likert", order: 4, options: [] },
        { testId: test2.id, text: "다시 태어나도 지금의 배우자와 결혼하고 싶다.", type: "likert", order: 5, options: [] },
      ]);
      
      res.json({ message: "Seeded" });
    } else {
      res.json({ message: "Already seeded" });
    }
  });

  return httpServer;
}
