/**
 * Badge System Unit Tests
 * Tests the core badge logic for all 5 badge types and edge cases
 */

import { checkAndAwardBadges, BadgeEvent, BadgeResult, BADGE_META } from "@/lib/badges";
import { BadgeType } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma");

describe("Badge System - checkAndAwardBadges()", () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;
  const studentId = "test-student-001";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("SPARK Badge - First Session Ever", () => {
    test("should award SPARK on first session", async () => {
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

      expect(result.newBadges).toContain("SPARK");
      expect(mockPrisma.badge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, type: "SPARK" },
        })
      );
    });

    test("should not award SPARK twice", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
      ] as any);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: true,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("SPARK");
      expect(mockPrisma.badge.create).not.toHaveBeenCalled();
    });

    test("should not award SPARK if not first session", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 2,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("SPARK");
    });
  });

  describe("WORD_WIZARD Badge - 80%+ Reading Accuracy", () => {
    test("should award WORD_WIZARD with 80%+ accuracy", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-2",
        studentId,
        type: "WORD_WIZARD",
        earnedAt: new Date(),
      });
      mockPrisma.readingSession.findFirst.mockResolvedValue({
        id: "session-1",
        studentId,
        passageId: "passage-1",
        startedAt: new Date(),
        completedAt: new Date(),
        durationSec: 600,
        transcript: "transcript",
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

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("WORD_WIZARD");
      expect(mockPrisma.badge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, type: "WORD_WIZARD" },
        })
      );
    });

    test("should not award WORD_WIZARD below 80% accuracy", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.readingSession.findFirst.mockResolvedValue({
        id: "session-1",
        studentId,
        passageId: "passage-1",
        startedAt: new Date(),
        completedAt: new Date(),
        durationSec: 600,
        transcript: "transcript",
        wpm: 150,
        accuracy: 75,
        missedWords: [],
        wrongWords: null,
        status: "COMPLETED",
        teacherNote: null,
        createdAt: new Date(),
        passage: null,
        student: null,
      } as any);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("WORD_WIZARD");
    });

    test("should not award WORD_WIZARD for speaking sessions", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("WORD_WIZARD");
      expect(mockPrisma.readingSession.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("VOICE_WIZARD Badge - 75%+ Speaking Fluency", () => {
    test("should award VOICE_WIZARD with 75%+ fluency", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-3",
        studentId,
        type: "VOICE_WIZARD",
        earnedAt: new Date(),
      });
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
        fluencyScore: 80,
        status: "COMPLETED",
        createdAt: new Date(),
        student: null,
        topic: null,
      } as any);

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("VOICE_WIZARD");
      expect(mockPrisma.badge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, type: "VOICE_WIZARD" },
        })
      );
    });

    test("should not award VOICE_WIZARD below 75% fluency", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
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
        fluencyScore: 70,
        status: "COMPLETED",
        createdAt: new Date(),
        student: null,
        topic: null,
      } as any);

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("VOICE_WIZARD");
    });

    test("should not award VOICE_WIZARD for reading sessions", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("VOICE_WIZARD");
      expect(mockPrisma.speakingSession.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("LANGUAGE_WIZARD Badge - 10+ Sessions", () => {
    test("should award LANGUAGE_WIZARD with 10+ combined sessions", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-4",
        studentId,
        type: "LANGUAGE_WIZARD",
        earnedAt: new Date(),
      });
      mockPrisma.readingSession.count.mockResolvedValue(6);
      mockPrisma.speakingSession.count.mockResolvedValue(5);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("LANGUAGE_WIZARD");
      expect(mockPrisma.badge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, type: "LANGUAGE_WIZARD" },
        })
      );
    });

    test("should not award LANGUAGE_WIZARD below 10 sessions", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.readingSession.count.mockResolvedValue(4);
      mockPrisma.speakingSession.count.mockResolvedValue(4);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: false,
        currentLevelBeforeUpdate: 4,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("LANGUAGE_WIZARD");
    });

    test("should count reading and speaking sessions together", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.readingSession.count.mockResolvedValue(8);
      mockPrisma.speakingSession.count.mockResolvedValue(2);
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
        currentLevelBeforeUpdate: 2,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toContain("LANGUAGE_WIZARD");
    });
  });

  describe("GRAND_WIZARD Badge - All 4 Badges", () => {
    test("should award GRAND_WIZARD when all 4 badges earned", async () => {
      const existingBadges = [
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
        { type: "LANGUAGE_WIZARD" },
      ];
      mockPrisma.badge.findMany.mockResolvedValue(existingBadges as any);
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
        verifyCode: "verify-code-123",
        issuedAt: new Date(),
        student: null,
      } as any);
      mockPrisma.readingSession.count.mockResolvedValue(5);
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
      expect(result.certificateVerifyCode).toBe("verify-code-123");
      expect(mockPrisma.certificate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { studentId, badgeType: "GRAND_WIZARD" },
        })
      );
    });

    test("should not award GRAND_WIZARD if any badge is missing", async () => {
      const existingBadges = [
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        // Missing VOICE_WIZARD and LANGUAGE_WIZARD
      ];
      mockPrisma.badge.findMany.mockResolvedValue(existingBadges as any);
      mockPrisma.readingSession.count.mockResolvedValue(5);
      mockPrisma.speakingSession.count.mockResolvedValue(5);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).not.toContain("GRAND_WIZARD");
      expect(result.certificateVerifyCode).toBeNull();
    });

    test("should issue certificate with GRAND_WIZARD", async () => {
      const existingBadges = [
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
        { type: "LANGUAGE_WIZARD" },
      ];
      mockPrisma.badge.findMany.mockResolvedValue(existingBadges as any);
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
        verifyCode: "unique-verify-code",
        issuedAt: new Date(),
        student: null,
      } as any);
      mockPrisma.readingSession.count.mockResolvedValue(5);
      mockPrisma.speakingSession.count.mockResolvedValue(5);

      const event: BadgeEvent = {
        type: "reading",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.certificateVerifyCode).toBeDefined();
      expect(result.certificateVerifyCode?.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases and Concurrent Requests", () => {
    test("should handle unique constraint error gracefully", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      mockPrisma.badge.create.mockRejectedValueOnce(
        new Error("Unique constraint failed")
      );
      mockPrisma.badge.create.mockResolvedValueOnce({
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

      // Should not throw, should handle gracefully
      const result = await checkAndAwardBadges(studentId, event);

      expect(result).toBeDefined();
    });

    test("should return empty newBadges if no badges earned", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
      ] as any);
      mockPrisma.readingSession.count.mockResolvedValue(3);
      mockPrisma.speakingSession.count.mockResolvedValue(2);

      const event: BadgeEvent = {
        type: "reading",
        passed: false,
        leveledUp: false,
        currentLevelBeforeUpdate: 1,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges).toHaveLength(0);
      expect(result.certificateVerifyCode).toBeNull();
    });

    test("should award multiple badges in single session", async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        { type: "SPARK" },
        { type: "WORD_WIZARD" },
        { type: "VOICE_WIZARD" },
      ] as any);
      mockPrisma.badge.create.mockResolvedValue({
        id: "badge-4",
        studentId,
        type: "LANGUAGE_WIZARD",
        earnedAt: new Date(),
      });
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
        fluencyScore: 80,
        status: "COMPLETED",
        createdAt: new Date(),
        student: null,
        topic: null,
      } as any);
      mockPrisma.readingSession.count.mockResolvedValue(6);
      mockPrisma.speakingSession.count.mockResolvedValue(5);

      const event: BadgeEvent = {
        type: "speaking",
        passed: true,
        leveledUp: true,
        currentLevelBeforeUpdate: 5,
        isFirstEverSession: false,
      };

      const result = await checkAndAwardBadges(studentId, event);

      expect(result.newBadges.length).toBeGreaterThan(0);
    });
  });

  describe("BADGE_META Metadata", () => {
    test("should have metadata for all badge types", () => {
      const badgeTypes: BadgeType[] = [
        "SPARK",
        "WORD_WIZARD",
        "VOICE_WIZARD",
        "LANGUAGE_WIZARD",
        "GRAND_WIZARD",
      ];

      badgeTypes.forEach((type) => {
        expect(BADGE_META[type]).toBeDefined();
        expect(BADGE_META[type]).toHaveProperty("emoji");
        expect(BADGE_META[type]).toHaveProperty("label");
        expect(BADGE_META[type]).toHaveProperty("description");
        expect(BADGE_META[type]).toHaveProperty("color");
      });
    });

    test("should have unique emojis and colors for each badge", () => {
      const emojis = Object.values(BADGE_META).map((m) => m.emoji);
      const colors = Object.values(BADGE_META).map((m) => m.color);

      expect(new Set(emojis).size).toBe(emojis.length);
      expect(new Set(colors).size).toBe(colors.length);
    });
  });
});
