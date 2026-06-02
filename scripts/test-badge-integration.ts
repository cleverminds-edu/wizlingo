import { BadgeType } from "@/app/generated/prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  try {
    // Check if test student already exists
    const existing = await prisma.student.findUnique({
      where: { id: "test-student-badge-demo" },
    });

    if (existing) {
      console.log("Test student already exists");
      return;
    }

    // Create a test class first
    const classRecord = await prisma.class.create({
      data: {
        grade: 5,
        section: "A",
        schoolId: "default-school",
      },
    });

    // Create a test student
    const student = await prisma.student.create({
      data: {
        admissionNumber: "badge-test@example.com",
        name: "Badge Tester",
        pin: "1234",
        classId: classRecord.id,
        accountType: "PUBLIC",
      },
    });

    console.log("✓ Created test student:", student.id);

    // Create some earned badges
    const badges: BadgeType[] = ["SPARK", "WORD_WIZARD", "VOICE_WIZARD"];
    for (const badgeType of badges) {
      const badge = await prisma.badge.create({
        data: {
          studentId: student.id,
          type: badgeType,
          earnedAt: new Date(),
        },
      });
      console.log(`✓ Created badge: ${badgeType}`);
    }

    // Create progress record
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        currentLevel: 2,
        avgWpm: 120,
        avgAccuracy: 85,
        totalSessions: 12,
        passedSessions: 10,
        gradeBand: "BAND_3_5",
      },
    });

    console.log("\n✓ Test data created successfully");
    console.log("Test student ID:", student.id);
    console.log("Badges earned:", badges.join(", "));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
