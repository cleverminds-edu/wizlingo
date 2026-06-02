const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test student
    const student = await prisma.student.create({
      data: {
        id: 'test-student-badge-demo',
        email: 'badge-test@example.com',
        name: 'Badge Tester',
        password: 'hashed-password',
        class: {
          create: {
            grade: 5,
            section: 'A',
          },
        },
        accountType: 'PUBLIC',
      },
    });

    console.log('✓ Created test student:', student.id);

    // Create some earned badges
    const badges = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD'];
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
    await prisma.progress.create({
      data: {
        studentId: student.id,
        currentLevel: 2,
        avgWpm: 120,
        avgAccuracy: 85,
        totalSessions: 12,
        passedSessions: 10,
        gradeBand: 'BAND_3_5',
      },
    });

    console.log('\n✓ Test data created successfully');
    console.log('Test student ID:', student.id);
    console.log('Badges earned:', badges.join(', '));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
