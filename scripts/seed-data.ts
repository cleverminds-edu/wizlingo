import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const PASSAGES = [
  { id: 'p1', title: 'My Pet Dog', content: 'I have a dog. His name is Bruno. He is brown and big. Bruno likes to run and play. Every morning we go for a walk. He wags his tail when he is happy. I love my dog.', wordCount: 38, gradeBand: 'BAND_3_5' as const, level: 1, topic: 'Animals' },
  { id: 'p2', title: 'The Red Ball', content: 'Tom has a red ball. He plays with it every day. One day the ball fell in a pond. A frog sat on it. Tom was sad. Then the frog pushed it back. Tom was very happy.', wordCount: 38, gradeBand: 'BAND_3_5' as const, level: 1, topic: 'Play' },
  { id: 'p3', title: 'Our Cat', content: 'We have a cat at home. Her name is Meena. She is white with black spots. Meena sleeps on my bed. She drinks milk every morning. She likes to chase a ball of wool. She is my best friend.', wordCount: 40, gradeBand: 'BAND_3_5' as const, level: 1, topic: 'Animals' },
  { id: 'p4', title: 'Learning to Ride', content: 'Tom wanted to learn how to ride a bicycle. His father helped him practice every day. At first, Tom was scared. But he kept trying and never gave up. After many days of practice, he finally rode the bike without help. Tom felt proud and happy.', wordCount: 54, gradeBand: 'BAND_3_5' as const, level: 2, topic: 'Play' },
  { id: 'p5', title: 'The Magic Garden', content: 'In a quiet corner of the town, there was a magical garden. Beautiful flowers grew tall and bright. A young girl named Emma discovered the garden one sunny afternoon. She found flowers that sang songs and trees that told stories. Every day she visited the garden and made new friends.', wordCount: 56, gradeBand: 'BAND_3_5' as const, level: 2, topic: 'Nature' },
  { id: 'p6', title: 'Festival Celebration', content: 'The annual festival was coming to the town. People decorated the streets with colorful lights and decorations. Families prepared special food and delicious treats. Children wore traditional clothes and danced together. The festival brought everyone together. It was a time of joy, laughter, and beautiful memories for all the people in the community.', wordCount: 62, gradeBand: 'BAND_3_5' as const, level: 3, topic: 'Festivals' },
];

async function seedData() {
  try {
    const existingCount = await prisma.readingPassage.count();
    if (existingCount > 0) {
      console.log(`✅ Database already has ${existingCount} passages`);
      return;
    }

    console.log('🌱 Seeding passages...');
    for (const p of PASSAGES) {
      await prisma.readingPassage.create({ data: p });
    }
    console.log(`✅ Seeded ${PASSAGES.length} passages`);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
