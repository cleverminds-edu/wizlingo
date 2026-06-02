import { prisma } from '@/lib/prisma';

async function createDemoAccount() {
  try {
    console.log('🚀 Creating demo account...\n');

    // Check if demo account already exists
    const existing = await prisma.student.findUnique({
      where: { id: 'demo-badge-student' },
    });

    if (existing) {
      console.log('⚠️  Demo account already exists');
      console.log('  Student ID: demo-badge-student');
      console.log('  PIN: 1234\n');
      await prisma.$disconnect();
      return;
    }

    // 1. Create school
    const school = await prisma.school.create({
      data: {
        name: 'Demo School',
        code: 'DEMO-SCHOOL-001',
      },
    });
    console.log('✓ School created');

    // 2. Create class
    const cls = await prisma.class.create({
      data: {
        grade: 5,
        section: 'A',
        schoolId: school.id,
      },
    });
    console.log('✓ Class created');

    // 3. Create student
    const student = await prisma.student.create({
      data: {
        id: 'demo-badge-student',
        name: 'Badge Demo',
        admissionNumber: 'DEMO001',
        pin: '1234',
        classId: cls.id,
        accountType: 'PUBLIC',
      },
    });
    console.log('✓ Student created: Badge Demo');
    console.log('  ID: demo-badge-student');
    console.log('  PIN: 1234\n');

    // 4. Create reading passages
    const passage = await prisma.readingPassage.create({
      data: {
        title: 'The Lion and the Mouse',
        content: 'A mighty lion was sleeping when a tiny mouse ran across his face. The mouse wanted to escape, but the lion woke up and caught him. "Please let me go," said the mouse. "I will help you one day!" The lion laughed but let him go. One day, hunters caught the lion in a net. The mouse came and chewed the rope, freeing the lion. The lion thanked the mouse for his help.',
        wordCount: 95,
        gradeBand: 'BAND_3_5',
        level: 1,
        topic: 'Stories',
      },
    });
    console.log('✓ Reading passage created');

    // 5. Create reading sessions with completed status
    const session1 = await prisma.readingSession.create({
      data: {
        studentId: student.id,
        passageId: passage.id,
        wpm: 95,
        accuracy: 85,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    });
    console.log('✓ Reading session 1: 85% accuracy, 95 wpm');

    const session2 = await prisma.readingSession.create({
      data: {
        studentId: student.id,
        passageId: passage.id,
        wpm: 110,
        accuracy: 88,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });
    console.log('✓ Reading session 2: 88% accuracy, 110 wpm');

    const session3 = await prisma.readingSession.create({
      data: {
        studentId: student.id,
        passageId: passage.id,
        wpm: 125,
        accuracy: 92,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    });
    console.log('✓ Reading session 3: 92% accuracy, 125 wpm\n');

    // 6. Create conversation topic
    const topic = await prisma.conversationTopic.create({
      data: {
        title: 'Ordering Food',
        gradeBand: 'BAND_3_5',
        level: 1,
        character: 'Waiter',
        openingLine: 'Welcome to our restaurant! What would you like to order?',
      },
    });

    // 7. Create speaking sessions
    for (let i = 0; i < 8; i++) {
      await prisma.speakingSession.create({
        data: {
          studentId: student.id,
          topicId: topic.id,
          wpm: 60 + Math.random() * 20,
          fluencyScore: 70 + Math.random() * 10,
          status: 'COMPLETED',
          completedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log('✓ Speaking sessions created (8 sessions)');
    console.log('  Fluency: 70-80% range\n');

    // 8. Create StudentProgress
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        currentLevel: 2,
        avgWpm: 110,
        avgAccuracy: 88,
        totalSessions: 11,
        passedSessions: 11,
        gradeBand: 'BAND_3_5',
      },
    });
    console.log('✓ Progress record created');
    console.log('  Level: 2 (Explorer)');
    console.log('  Avg Speed: 110 wpm');
    console.log('  Avg Accuracy: 88%\n');

    // 9. Create badges
    const badges = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD'];
    for (const badgeType of badges) {
      await prisma.badge.create({
        data: {
          studentId: student.id,
          type: badgeType as any,
          earnedAt: new Date(),
        },
      });

      // Create certificate for each badge
      await prisma.certificate.create({
        data: {
          studentId: student.id,
          badgeType: badgeType as any,
          verifyCode: `VERIFY-${badgeType}-${Date.now()}`,
        },
      });
    }
    console.log('✓ Badges created:');
    console.log('  ✨ SPARK (1st session completed)');
    console.log('  📚 WORD WIZARD (80%+ reading accuracy)');
    console.log('  🎤 VOICE WIZARD (75%+ speaking fluency)\n');
    console.log('✓ Certificates created\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Demo account ready for testing!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Login Details:');
    console.log('  Student ID: demo-badge-student');
    console.log('  PIN: 1234\n');
    console.log('Test with:');
    console.log('  1. Login to http://localhost:3000/login');
    console.log('  2. Use ID: demo-badge-student, PIN: 1234');
    console.log('  3. Navigate to Dashboard');
    console.log('  4. Scroll down to see badges section\n');
    console.log('Expected to see:');
    console.log('  ✨ 3 earned badges (SPARK, WORD WIZARD, VOICE WIZARD)');
    console.log('  🎯 2 locked badges (LANGUAGE WIZARD, GRAND WIZARD)');
    console.log('  🎉 Share buttons on hover\n');
  } catch (error) {
    console.error('Error creating demo account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAccount();
