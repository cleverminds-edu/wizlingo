import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Only available in development
if (process.env.NODE_ENV === 'production') {
  throw new Error('This endpoint is only available in development');
}

export async function POST() {
  try {
    console.log('🚀 Creating demo account...\n');

    // Check if demo account already exists
    const existing = await prisma.student.findUnique({
      where: { id: 'demo-badge-student' },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Demo account already exists',
          credentials: {
            id: 'demo-badge-student',
            pin: '1234',
          },
        },
        { status: 400 }
      );
    }

    // 1. Get or create school
    let school = await prisma.school.findUnique({
      where: { code: 'DEMO-SCHOOL-001' },
    });

    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Demo School',
          code: 'DEMO-SCHOOL-001',
        },
      });
    }

    // 2. Create class
    const cls = await prisma.class.create({
      data: {
        grade: 5,
        section: 'A',
        schoolId: school.id,
      },
    });

    // 3. Create student
    const student = await prisma.student.create({
      data: {
        id: 'demo-badge-student',
        name: 'Badge Demo',
        admissionNumber: 'DEMO001',
        pin: '1234',
        classId: cls.id,
        accountType: 'SCHOOL',
      },
    });

    // 4. Create reading passage
    const passage = await prisma.readingPassage.create({
      data: {
        title: 'The Lion and the Mouse',
        content:
          'A mighty lion was sleeping when a tiny mouse ran across his face. The mouse wanted to escape, but the lion woke up and caught him. "Please let me go," said the mouse. "I will help you one day!" The lion laughed but let him go. One day, hunters caught the lion in a net. The mouse came and chewed the rope, freeing the lion. The lion thanked the mouse for his help.',
        wordCount: 95,
        gradeBand: 'BAND_3_5',
        level: 1,
        topic: 'Stories',
      },
    });

    // 5. Create reading sessions
    await prisma.readingSession.create({
      data: {
        studentId: student.id,
        passageId: passage.id,
        wpm: 95,
        accuracy: 85,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.readingSession.create({
      data: {
        studentId: student.id,
        passageId: passage.id,
        wpm: 110,
        accuracy: 88,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.readingSession.create({
      data: {
        studentId: student.id,
        passageId: passage.id,
        wpm: 125,
        accuracy: 92,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    // 6. Create conversation topic
    const topic = await prisma.conversationTopic.create({
      data: {
        title: 'Ordering Food',
        gradeBand: 'BAND_3_5',
        level: 1,
        character: 'Waiter',
        openingLine:
          'Welcome to our restaurant! What would you like to order?',
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

    // 8. Create progress
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

    // 9. Create badges (all 5)
    const badges = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'];
    for (const badgeType of badges) {
      await prisma.badge.create({
        data: {
          studentId: student.id,
          type: badgeType as any,
          earnedAt: new Date(),
        },
      });

      await prisma.certificate.create({
        data: {
          studentId: student.id,
          badgeType: badgeType as any,
          verifyCode: `VERIFY-${badgeType}-${Date.now()}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Demo account created successfully',
        credentials: {
          id: 'demo-badge-student',
          pin: '1234',
        },
        data: {
          student: student.name,
          badges: ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'],
          sessions: 11,
          progress: {
            level: 2,
            avgWpm: 110,
            avgAccuracy: 88,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating demo account:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
