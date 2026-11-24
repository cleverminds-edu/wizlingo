import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const existingPassages = await prisma.readingPassage.count()
    if (existingPassages > 0) {
      return NextResponse.json({
        message: 'Content already seeded',
        stats: {
          passages: existingPassages,
          topics: await prisma.speakingTopic.count(),
          prompts: await prisma.writingPrompt.count(),
          clips: await prisma.listeningClip.count()
        }
      })
    }

    const passages = await Promise.all([
      prisma.readingPassage.create({
        data: {
          title: 'The Friendly Cat',
          content: 'Whiskers is a friendly orange cat. He lives in a small house with his family. Every morning, Whiskers wakes up and plays with a ball. He loves to chase toys around the living room.',
          wordCount: 58,
          level: 2,
          topic: 'Animals'
        }
      }),
      prisma.readingPassage.create({
        data: {
          title: 'My School',
          content: 'I go to a big school. My school has many classrooms and a playground. Every day, I learn new things in class. I make friends and play games during lunch time.',
          wordCount: 50,
          level: 2,
          topic: 'Education'
        }
      }),
      prisma.readingPassage.create({
        data: {
          title: 'A Sunny Day',
          content: 'It is a beautiful sunny day. The weather is warm and pleasant. Children are playing in the park. Some are on the swings, some are on the slides. There are colorful flowers blooming everywhere.',
          wordCount: 50,
          level: 2,
          topic: 'Nature'
        }
      })
    ])

    const topics = await Promise.all([
      prisma.speakingTopic.create({
        data: {
          title: 'My Daily Routine',
          prompt: 'Describe your daily routine. What do you do in the morning, afternoon, and evening?',
          level: 2,
          topic: 'Daily Life'
        }
      }),
      prisma.speakingTopic.create({
        data: {
          title: 'My Best Friend',
          prompt: 'Tell me about your best friend. What do you like about them?',
          level: 2,
          topic: 'Relationships'
        }
      }),
      prisma.speakingTopic.create({
        data: {
          title: 'My Favorite Food',
          prompt: 'What is your favorite food? Why do you like it?',
          level: 2,
          topic: 'Food'
        }
      })
    ])

    const prompts = await Promise.all([
      prisma.writingPrompt.create({
        data: {
          title: 'My Best Day',
          prompt: 'Write about your best day ever. What made it special?',
          level: 2,
          topic: 'Personal Experience'
        }
      }),
      prisma.writingPrompt.create({
        data: {
          title: 'My Dream Vacation',
          prompt: 'Where would you like to go for a vacation? Describe the place.',
          level: 2,
          topic: 'Travel'
        }
      }),
      prisma.writingPrompt.create({
        data: {
          title: 'My Favorite Subject',
          prompt: 'Write about your favorite subject in school. Why do you like it?',
          level: 2,
          topic: 'Education'
        }
      })
    ])

    const clips = await Promise.all([
      prisma.listeningClip.create({
        data: {
          title: 'Greeting Introduction',
          audioUrl: '/audio/greeting-1.mp3',
          transcript: 'Hello, my name is John. I am from India. I like to play football.',
          level: 2,
          topic: 'Greetings',
          questions: [{ question: 'What is the person\'s name?', options: ['John', 'James', 'Jack', 'Joseph'], correct: 'a' }]
        }
      }),
      prisma.listeningClip.create({
        data: {
          title: 'School Day',
          audioUrl: '/audio/school-1.mp3',
          transcript: 'I go to school at 8 o\'clock. I study English, Math, and Science.',
          level: 2,
          topic: 'School',
          questions: [{ question: 'What time does school start?', options: ['7 o\'clock', '8 o\'clock', '9 o\'clock', '10 o\'clock'], correct: 'b' }]
        }
      }),
      prisma.listeningClip.create({
        data: {
          title: 'Family Introduction',
          audioUrl: '/audio/family-1.mp3',
          transcript: 'I have a small family. There are four people. My mother\'s name is Priya.',
          level: 2,
          topic: 'Family',
          questions: [{ question: 'How many people are in the family?', options: ['3', '4', '5', '6'], correct: 'b' }]
        }
      })
    ])

    return NextResponse.json({
      message: '✅ Content seeded successfully!',
      stats: {
        passages: passages.length,
        topics: topics.length,
        prompts: prompts.length,
        clips: clips.length
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}
