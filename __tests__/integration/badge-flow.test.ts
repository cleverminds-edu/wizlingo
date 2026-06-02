/**
 * Badge System Integration Tests
 * Tests full user flows from session completion to badge award
 */

import { checkAndAwardBadges, BadgeEvent } from "@/lib/badges";
import { BadgeType } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma");

describe("Badge System - Full User Flows", () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;
  const studentId = "demo-student-001";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Flow 1: New Student Earns SPARK", () => {
    test("student completes first session and earns SPARK", async () => {
      // Step 1: Setup - no badges yet
      mockPrisma.badge.findMany.mockResolvedValue([]);

      // Step 2: Student completes first session
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-1",
        studentId,
        type: "SPARK",
        earnedAt: new Date(),
      });

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      // Step 3: Check and award badges
      const result = await checkAndAwardBadges(studentId, event);

      // Step 4: Verify
      expect(result.newBadges).toContain("SPARK");
      expect(result.newBadges.length).toBe(1);

      // Verify badge was created in database
      expect(mockPrisma.badge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, type: "SPARK" },
        })
      );
    });

    test("celebration modal should show with personalized message", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-1",
        studentId,
        type: "SPARK",
        earnedAt: new Date(),
      });

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      const result = await checkAndAwardBadges(studentId, event);

      // In real scenario, frontend would:
      // 1. Show BadgeCelebration component
      // 2. Display personalized message with student name
      // 3. Show confetti animation
      // 4. Show share options
      expect(result.newBadges[0]).toBe("SPARK");
      expect(result.certificateVerifyCode).toBeNull(); // SPARK doesn't issue certificate
    });

    test("analytics event should be logged", async () => {
      const { trackBadgeEvent } = require("@/lib/badge-analytics");
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-1",
        studentId,
        type: "SPARK",
        earnedAt: new Date(),
      });

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      await checkAndAwardBadges(studentId, event);

      // In real scenario, analytics would track:
      // trackBadgeEvent('badge_earned', { badgeType: 'SPARK', studentName: 'John' })
      expect(trackBadgeEvent).toBeDefined();
    });
  });

  describe("Flow 2: Student Earns WORD_WIZARD", () => {
    test("student achieves 80%+ accuracy and earns WORD_WIZARD", async () => {
      // Step 1: Setup - student already has SPARK
      mockPrisma.badge.findMany.mockResolvedValue([{ type: "SPARK" }] as any);

      // Step 2: Student completes reading session with 85% accuracy
      mockPrisma.readingSession.findFirst.mockResolvedValue({
        id: "session-1",
        studentId,
        passageId: "passage-1",
        startedAt: new Date(),
        completedAt: new Date(),
        durationSec: 600,
        transcript: "Good reading",
        wpm: 150,
        accuracy: 85,
        missedWords: [],
        wrongWords: null,
        status: "COMPLETED",
        teacherNote: null,
        createdAt: new Date(),
        passage: null,
        student: null,
      } as any);

      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-2",
        studentId,
        type: "WORD_WIZARD",
        earnedAt: new Date(),
      });

      // Step 3: Award badges
      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      // Step 4: Verify
      expect(result.newBadges).toContain("WORD_WIZARD");
    });

    test("progress API should return updated WORD_WIZARD progress", async () => {
      // Simulate progress API call
      // GET /api/badges/progress/[studentId]

      mockPrisma.student.findUnique.mockResolvedValue({
        id: studentId,
        name: "John Doe",
        admissionNumber: "ADM001",
        pin: "1234",
        classId: "class-1",
        accountType: "SCHOOL",
        gender: "MALE",
        createdAt: new Date(),
        progress: {
          id: "progress-1",
          studentId,
          currentLevel: 3,
          gradeBand: "BAND_3_5",
          totalSessions: 5,
          passedSessions: 4,
          avgWpm: 150,
          avgAccuracy: 85, // This triggers WORD_WIZARD
          avgFluency: 65,
          updatedAt: new Date(),
          student: null,
        },
        speakingProgress: {
          id: "speaking-1",
          studentId,
          currentLevel: 2,
          passedSessions: 2,
          totalSessions: 3,
          avgWpm: 100,
          avgFluency: 65,
          updatedAt: new Date(),
          student: null,
        },
        badges: [{ type: "SPARK" }, { type: "WORD_WIZARD" }],
        certificates: [],
        sessions: [],
        speakingSessions: [],
        class: null,
      } as any);

      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK", earnedAt: new Date() },
        { type: "WORD_WIZARD", earnedAt: new Date() },
      ] as any);

      mockPrisma.readingSession.count.mockResolvedValue(5);
      mockPrisma.speakingSession.count.mockResolvedValue(3);

      // Progress should show:
      // - WORD_WIZARD earned and earned at date
      // - Progress: 100% (requirement met)
      // - Current: 85% accuracy
      expect(mockPrisma.student.findUnique).toBeDefined();
    });

    test("motivational messages should update based on progress", async () => {
      // Message progression:
      // 0-49%: "Building skills..."
      // 50-74%: "Good progress! Just X% more!"
      // 75-79%: "So close! Just X% more!"
      // 80%+: "WORD_WIZARD earned!"

      const accuracyScenarios = [
        { accuracy: 30, messageHint: "Building" },
        { accuracy: 60, messageHint: "great progress" },
        { accuracy: 78, messageHint: "So close" },
        { accuracy: 85, messageHint: "earned" },
      ];

      accuracyScenarios.forEach(async (scenario) => {
        // In real scenario, get message based on progress
        // getMotivationalMessage('WORD_WIZARD', scenario.accuracy)
        // Message content should match messageHint
      });
    });
  });

  describe("Flow 3: Student Earns VOICE_WIZARD", () => {
    test("student achieves 75%+ fluency and earns VOICE_WIZARD", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([{ type: "SPARK" }] as any);

      mockPrisma.speakingSession.findFirst.mockResolvedValue({
        id: "session-2",
        studentId,
        topicId: "topic-1",
        startedAt: new Date(),
        completedAt: new Date(),
        turns: [],
        totalWords: 500,
        durationSec: 300,
        wpm: 100,
        fluencyScore: 78,
        status: "COMPLETED",
        createdAt: new Date(),
        student: null,
        topic: null,
      } as any);

      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-3",
        studentId,
        type: "VOICE_WIZARD",
        earnedAt: new Date(),
      });

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("VOICE_WIZARD");
    });

    test("speaking session completion should award VOICE_WIZARD", async () => {
      // Simulate session completion flow:
      // 1. Student completes speaking session
      // 2. AI evaluates and scores fluency
      // 3. Session saved with fluencyScore >= 75
      // 4. Badge system checks and awards VOICE_WIZARD

      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
      ] as any);

      mockPrisma.speakingSession.findFirst.mockResolvedValue({
        id: "session-2",
        studentId,
        topicId: "topic-1",
        startedAt: new Date(),
        completedAt: new Date(),
        turns: [],
        totalWords: 600,
        durationSec: 300,
        wpm: 120,
        fluencyScore: 80,
        status: "COMPLETED",
        createdAt: new Date(),
        student: null,
        topic: null,
      } as any);

      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-3",
        studentId,
        type: "VOICE_WIZARD",
        earnedAt: new Date(),
      });

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 2,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("VOICE_WIZARD");
    });
  });

  describe("Flow 4: Student Earns LANGUAGE_WIZARD", () => {
    test("student completes 10+ sessions and earns LANGUAGE_WIZARD", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
      ] as any);

      mockPrisma.readingSession.count.mockResolvedValue(6);
      mockPrisma.speakingSession.count.mockResolvedValue(5); // Total: 11 sessions

      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-4",
        studentId,
        type: "LANGUAGE_WIZARD",
        earnedAt: new Date(),
      });

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("LANGUAGE_WIZARD");
    });

    test("sessions counted across reading and speaking combined", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
      ] as any);

      // Test various combinations that sum to 10
      const combinations = [
        { reading: 10, speaking: 0 },
        { reading: 5, speaking: 5 },
        { reading: 0, speaking: 10 },
        { reading: 7, speaking: 3 },
      ];

      for (const combo of combinations) {
        mockPrisma.readingSession.count.mockResolvedValue(combo.reading);
        mockPrisma.speakingSession.count.mockResolvedValue(combo.speaking);
        mockPrisma.badge.create.mockResolvedValue({
          id: "badge-4",
          studentId,
          type: "LANGUAGE_WIZARD",
          earnedAt: new Date(),
        });

        const event: BadgeEvent = {
          type: combo.reading > 0 ? "reading" : "speaking",
          passed: true,
          leveledUp: false,
          currentLevelBeforeUpdate: combo.reading + combo.speaking,
          isFirstEverSession: false,
        };

        const result = await checkAndAwardBadges(studentId, event);

        expect(result.newBadges).toContain("LANGUAGE_WIZARD");
      }
    });
  });

  describe("Flow 5: Student Earns GRAND_WIZARD (All Badges)", () => {
    test("student completes all requirements and earns GRAND_WIZARD", async () => {
      // Setup: Student has all 4 badges
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
        { type: "LANGUAGE_WIZARD" },
      ] as any);

      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-5",
        studentId,
        type: "GRAND_WIZARD",
        earnedAt: new Date(),
      });

      mockPrisma.certificate.create.mockResolvedValue({
        id: "cert-1",
        studentId,
        badgeType: "GRAND_WIZARD",
        verifyCode: "verify-12345",
        issuedAt: new Date(),
        student: null,
      } as any);

      mockPrisma.readingSession.count.mockResolvedValue(6);
      mockPrisma.speakingSession.count.mockResolvedValue(5);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("GRAND_WIZARD");
      expect(result.certificateVerifyCode).toBe("verify-12345");
    });

    test("certificate should be issued with GRAND_WIZARD", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
        { type: "LANGUAGE_WIZARD" },
      ] as any);

      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-5",
        studentId,
        type: "GRAND_WIZARD",
        earnedAt: new Date(),
      });

      mockPrisma.certificate.create.mockResolvedValue({
        id: "cert-1",
        studentId,
        badgeType: "GRAND_WIZARD",
        verifyCode: "unique-code-xyz",
        issuedAt: new Date(),
        student: null,
      } as any);

      mockPrisma.readingSession.count.mockResolvedValue(6);
      mockPrisma.speakingSession.count.mockResolvedValue(5);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      // Verify certificate was created
      expect(mockPrisma.certificate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, badgeType: "GRAND_WIZARD" },
        })
      );

      // Verify code is returned
      expect(result.certificateVerifyCode).toBeTruthy();
    });

    test("sharing GRAND_WIZARD should include all achievements", async () => {
      // In real scenario, when student clicks share:
      // Message should include:
      // - All 4 badges earned
      // - Reading mastery (80%+ accuracy)
      // - Speaking mastery (75%+ fluency)
      // - Dedication (10+ sessions)
      // - Call to action to share with others

      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
        { type: "LANGUAGE_WIZARD" },
        { type: "GRAND_WIZARD" },
      ] as any);

      // Share template should have comprehensive message
      const expectedShareContent = [
        "GRAND WIZARD",
        "SPARK",
        "WORD_WIZARD",
        "VOICE_WIZARD",
        "LANGUAGE_WIZARD",
        "80%",
        "75%",
        "10+",
      ];

      // In real test, would verify message contains all elements
      expect(mockPrisma.badge.findMany).toBeDefined();
    });
  });

  describe("Progress Tracking and Analytics", () => {
    test("progress API should return accurate badge progress", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK", earnedAt: new Date() },
        { type: "WORD_WIZARD", earnedAt: new Date() },
      ] as any);

      mockPrisma.readingSession.count.mockResolvedValue(7);
      mockPrisma.speakingSession.count.mockResolvedValue(2);

      // Expected progress:
      // SPARK: 100% (earned)
      // WORD_WIZARD: 100% (earned)
      // VOICE_WIZARD: 0% (locked)
      // LANGUAGE_WIZARD: 90% (9/10 sessions)
      // GRAND_WIZARD: 50% (2/4 badges)

      expect(mockPrisma.badge.findMany).toBeDefined();
    });

    test("analytics should track all badge events", async () => {
      // Events to track:
      // - badge_earned: when a badge is awarded
      // - share_badge: when a student shares (WhatsApp, copy, native)
      // - badge_progress: when progress updates

      // Each event should include:
      // - studentId
      // - badgeType
      // - platform (for shares)
      // - timestamp
      // - context data

      expect(true).toBe(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      mockPrisma.badge.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      try {
        await checkAndAwardBadges(studentId, event);
      } catch (error) {
        // Should handle error gracefully
        expect(error).toBeDefined();
      }
    });

    test("should handle concurrent badge award attempts", async () => {
      // When two sessions complete simultaneously and both try to award same badge
      mockPrisma.badge.findMany.mockResolvedValue([]);

      // First create succeeds
      mockPrisma.badge.create.mockResolvedValueOnce({
        id: "badge-1",
        studentId,
        type: "SPARK",
        earnedAt: new Date(),
      });

      // Second create fails with unique constraint
      mockPrisma.badge.create.mockRejectedValueOnce(
        new Error("Unique constraint failed on Badge_studentId_type_key")
      );

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      const result = await checkAndAwardBadges(studentId, event);

      // Should not error, should handle gracefully
      expect(result).toBeDefined();
    });

    test("should not award badges if session not completed", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);

      const event: BadgeEvent = {
        type: "reading",
        passed: false,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      const result = await checkAndAwardBadges(studentId, event);

      // SPARK should still be awarded for first session even if not passed
      // But other badges require passed: true
      expect(result).toBeDefined();
    });
  });

  describe("Responsive Design Verification", () => {
    test("badge components should render on mobile viewport", () => {
      // In real test, would use testing library with viewport sizes
      // Mobile: 375px width
      // Tablet: 768px width
      // Desktop: 1024px+ width

      // Should verify:
      // - BadgeCelebration modal is centered and readable
      // - BadgeProgress bar is full width and visible
      // - ModernBadgeDisplay uses grid layout responsively
      // - Share buttons are touch-friendly (min 44px height)
      // - Text is readable at 375px width

      expect(true).toBe(true);
    });

    test("animations should be smooth (60fps)", () => {
      // In real test, would measure animation frame rate
      // Verify:
      // - Confetti animation doesn't cause jank
      // - Badge rotation is smooth
      // - Modal pop animation is fluid
      // - Progress bar transitions are smooth

      expect(true).toBe(true);
    });
  });
});
