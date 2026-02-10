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
  
  // --- Admin ---
  app.get("/api/admin/results", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    // In a real app, check for admin role
    // const user = req.user as any;
    // if (user.role !== 'admin') return res.status(403).send();
    
    // For now, allow all authenticated users for demo purposes or check strict equality if role is implemented
    const user = req.user as any;
    if (user.role !== 'admin') {
       // Optional: Auto-promote first user or specific user for testing if needed, 
       // but for now let's enforce 403 if not admin, or just allow it if we want to test easily.
       // Let's enforce it but we need a way to make someone admin.
       // For this MVP, let's allow it if email matches validation or just comment it out.
       // Reverting to: allow if authenticated for now to demonstrate, or strict check.
       // User requested "Admin", so let's stick to the plan of having a role.
       // If I can't easily set the role, I might need a seed for that too.
       // Let's check if user.role is available (it should be added to schema).
       
       if ((req.user as any).role !== 'admin') {
         return res.status(403).json({ message: "Admin access required" });
       }
    }
    
    const results = await storage.getAllTestResults();
    res.json(results);
  });

  // Seed Data Endpoint (for development)
  app.get("/api/seed", async (req, res) => {
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
      
      // Test 3: STS 6-Factor Temperament Test
      const [test3] = await db.insert(tests).values({
        title: "STS 6요인 기질검사",
        description: "아이의 타고난 기질을 6가지 요인(활동성, 조심성, 긍정정서, 부정정서, 사회적민감성, 주의지속성)으로 분석합니다.",
        category: "child_development",
        questionCount: 41,
        estimatedTime: 10,
        coverImage: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9"
      }).returning();

      const likertOptions = [
        {label: "전혀 그렇지 않다", score: 1}, 
        {label: "드물게 그렇다", score: 2}, 
        {label: "때때로 그렇다", score: 3}, 
        {label: "자주 그렇다", score: 4}, 
        {label: "거의 항상 그렇다", score: 5}
      ];

      const stsQuestions = [
        "주변이 소란스러워도 하던 놀이를 계속한다.",
        "기분이 나쁠 때보다는 좋을 때가 더 많다.",
        "목욕할 때 물을 튀기거나 발로 차는 등 많이 움직인다.",
        "새로운 옷(또는 신발)을 입지 않으려고 한다.",
        "뜻대로 되지 않으면 쉽게 운다.",
        "가끔 보는 지인이 집에 오면 낯을 가린다.",
        "다른 아이가 울면 따라 운다.",
        "주의력이 요구되는 활동(퍼즐이나 책 등)을 좋아한다.",
        "도전적인 신체 활동을 좋아한다(예: 높은 곳에 기어오르기).",
        "항상 미소 짓거나 웃는다.",
        "컨디션이 좋지 않을 때 지나치게 칭얼거린다.",
        "낯선 성인을 만났을 때 엄마에게 매달린다.",
        "잠자고 일어날 때면 짜증을 내거나 운다.",
        "하루 중 대부분의 시간을 기분 좋게 보낸다.",
        "놀이터나 키즈카페에서 놀 때 행동이 재빠르다.",
        "놀이할 때 잘 웃는다.",
        "익숙하지 않은 상황을 피하려고 한다.",
        "처음 보는 친구에게 다가가기 어려워한다.",
        "다른 사람이 다치는 것을 보면 움츠러든다.",
        "새로운 활동을 시작하는 것을 주저한다.",
        "사물보다 사람에게 관심이 더 많다.",
        "처음 먹어보는 음식은 먹지 않으려고 한다.",
        "잠들기 전에 잠투정이 있다.",
        "사람들의 외적인 변화에 관심을 보인다(예: 안경, 수염, 헤어스타일, 액세서리 등).",
        "매일 밖에 나가서 놀자고 한다.",
        "좋아하는 장난감을 한참을 가지고 논다.",
        "동화책을 읽어주면 주의를 기울여 듣는다.",
        "잠자리가 바뀌면 잠들기 힘들다.",
        "“안 돼”라고 하면 하던 행동을 멈춘다.",
        "유모차나 카시트에서 계속 움직인다.",
        "잠깐 기다리라고 하면 참을 수 있다.",
        "새로운 상황에 적응하는 데 시간이 오래 걸린다.",
        "아파하는 사람을 보면 얼굴을 찡그린다.",
        "별일 아닌 것에도 즐거워한다.",
        "옷을 입힐 때 많이 움직인다.",
        "자주 칭얼거리거나 짜증을 낸다.",
        "양육자의 말을 귀 기울여 듣는다.",
        "사람들의 표정을 빤히 살펴보는 편이다.",
        "낯설거나 새로운 장소에 가면 불편해한다.",
        "한 번 징징거림이 시작되면 오래간다.",
        "가만히 앉아 있지 않고 계속 움직인다.",
        "아는 사람을 만나면 웃으며 반긴다."
      ];

      await db.insert(questions).values(
        stsQuestions.map((text, index) => ({
          testId: test3.id,
          text,
          type: "likert",
          order: index + 1,
          options: likertOptions
        }))
      );
      
      res.json({ message: "Seeded" });
    } else {
      res.json({ message: "Already seeded" });
    }
  });

  return httpServer;
}
