import { PrismaClient } from '@/app/generated/prisma/client'

const prisma = new PrismaClient()

async function seedContent() {
  console.log('🌱 Seeding MVP content...')

  try {
    // Reading Passages - Level 2
    const passages = [
      {
        title: 'The Friendly Cat',
        content: 'Whiskers is a friendly orange cat. He lives in a small house with his family. Every morning, Whiskers wakes up and plays with a ball. He loves to chase toys around the living room. In the afternoon, he takes a long nap in the sun. At night, Whiskers cuddles with the children and purrs softly. He is the happiest cat in the neighborhood.',
        wordCount: 70,
        level: 2,
        topic: 'Animals'
      },
      {
        title: 'My School',
        content: 'I go to a big school. My school has many classrooms and a playground. Every day, I learn new things in class. I make friends and play games during lunch time. My favorite subject is English. The teachers are very kind and helpful. After school, I go home and do my homework. I love my school very much.',
        wordCount: 65,
        level: 2,
        topic: 'Education'
      },
      {
        title: 'A Sunny Day',
        content: 'It is a beautiful sunny day. The weather is warm and pleasant. Children are playing in the park. Some are on the swings, some are on the slides. There are colorful flowers blooming everywhere. Birds are singing sweet songs in the trees. People are sitting on benches and enjoying ice cream. Everyone is happy and smiling.',
        wordCount: 60,
        level: 2,
        topic: 'Nature'
      },
      {
        title: 'My Family',
        content: 'I have a loving family. My mother cooks delicious food for us. My father works hard to take care of us. I have one brother and one sister. We play together every day. On weekends, we go to the park or visit our grandparents. We eat dinner together and share stories. My family is very important to me.',
        wordCount: 62,
        level: 2,
        topic: 'Family'
      },
      {
        title: 'The Little Bird',
        content: 'A little bird lives in a tree. Every morning, it sings a beautiful song. The bird looks for food like seeds and insects. It flies from tree to tree in the garden. One day, the bird found a friend, another small bird. They play together and build a nest. The birds are very happy living in their home.',
        wordCount: 63,
        level: 2,
        topic: 'Animals'
      }
    ]

    for (const passage of passages) {
      await prisma.readingPassage.create({ data: passage })
    }
    console.log(`✓ Created ${passages.length} reading passages`)

    // Speaking Topics - Level 2
    const topics = [
      {
        title: 'My Daily Routine',
        prompt: 'Describe your daily routine. What do you do in the morning, afternoon, and evening?',
        level: 2,
        topic: 'Daily Life'
      },
      {
        title: 'My Best Friend',
        prompt: 'Tell me about your best friend. What do you like about them?',
        level: 2,
        topic: 'Relationships'
      },
      {
        title: 'My Favorite Food',
        prompt: 'What is your favorite food? Why do you like it?',
        level: 2,
        topic: 'Food'
      },
      {
        title: 'My Hobby',
        prompt: 'What is your favorite hobby? How much time do you spend on it?',
        level: 2,
        topic: 'Hobbies'
      },
      {
        title: 'A Happy Memory',
        prompt: 'Tell me about a happy memory. What happened and who was with you?',
        level: 2,
        topic: 'Memories'
      }
    ]

    for (const topic of topics) {
      await prisma.speakingTopic.create({ data: topic })
    }
    console.log(`✓ Created ${topics.length} speaking topics`)

    // Writing Prompts - Level 2
    const prompts = [
      {
        title: 'My Best Day',
        prompt: 'Write about your best day ever. What made it special?',
        level: 2,
        topic: 'Personal Experience'
      },
      {
        title: 'My Dream Vacation',
        prompt: 'Where would you like to go for a vacation? Describe the place.',
        level: 2,
        topic: 'Travel'
      },
      {
        title: 'My Favorite Subject',
        prompt: 'Write about your favorite subject in school. Why do you like it?',
        level: 2,
        topic: 'Education'
      },
      {
        title: 'A Helpful Person',
        prompt: 'Write about someone who has helped you. How did they help?',
        level: 2,
        topic: 'People'
      },
      {
        title: 'My Future Goals',
        prompt: 'What do you want to be when you grow up? Why?',
        level: 2,
        topic: 'Future'
      }
    ]

    for (const prompt of prompts) {
      await prisma.writingPrompt.create({ data: prompt })
    }
    console.log(`✓ Created ${prompts.length} writing prompts`)

    // Listening Clips - Level 2
    const clips = [
      {
        title: 'Greeting Introduction',
        audioUrl: '/audio/greeting-1.mp3',
        transcript: 'Hello, my name is John. I am from India. I like to play football. What is your name?',
        level: 2,
        topic: 'Greetings',
        questions: JSON.stringify([
          {
            question: 'What is the person\'s name?',
            options: ['John', 'James', 'Jack', 'Joseph'],
            correct: 'a'
          },
          {
            question: 'What sport does he like?',
            options: ['Cricket', 'Football', 'Basketball', 'Tennis'],
            correct: 'b'
          }
        ])
      },
      {
        title: 'School Day',
        audioUrl: '/audio/school-1.mp3',
        transcript: 'I go to school at 8 o\'clock. I study English, Math, and Science. My lunch break is at 12 o\'clock. I eat lunch with my friends. School ends at 3 o\'clock.',
        level: 2,
        topic: 'School',
        questions: JSON.stringify([
          {
            question: 'What time does school start?',
            options: ['7 o\'clock', '8 o\'clock', '9 o\'clock', '10 o\'clock'],
            correct: 'b'
          },
          {
            question: 'When is lunch break?',
            options: ['11 o\'clock', '12 o\'clock', '1 o\'clock', '2 o\'clock'],
            correct: 'b'
          }
        ])
      },
      {
        title: 'Family Introduction',
        audioUrl: '/audio/family-1.mp3',
        transcript: 'I have a small family. There are four people. My mother\'s name is Priya. My father\'s name is Raj. I have one sister named Anjali. We live together in a house.',
        level: 2,
        topic: 'Family',
        questions: JSON.stringify([
          {
            question: 'How many people are in the family?',
            options: ['3', '4', '5', '6'],
            correct: 'b'
          },
          {
            question: 'What is the sister\'s name?',
            options: ['Priya', 'Anjali', 'Meera', 'Anya'],
            correct: 'b'
          }
        ])
      }
    ]

    for (const clip of clips) {
      await prisma.listeningClip.create({ data: clip })
    }
    console.log(`✓ Created ${clips.length} listening clips`)

    console.log('\n✅ Content seeding complete!')
    console.log('Ready for MVP testing on Railway 🚀')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedContent()
