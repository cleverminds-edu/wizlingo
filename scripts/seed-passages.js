#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SAMPLE_PASSAGES = [
  // Grade 3-5 (for ages 9-11)
  { title: "The Little Cat", content: "A little cat lived in a small house. She liked to play with toys. Every day she would run and jump. Her name was Whiskers.", wordCount: 35, gradeBand: "BAND_3_5", level: 1, topic: "Animals" },
  { title: "My School Day", content: "I wake up at 7 o'clock. I eat breakfast with my family. Then I go to school. I play with my friends at lunch. School is fun and I learn many things every day.", wordCount: 42, gradeBand: "BAND_3_5", level: 1, topic: "Daily Life" },
  { title: "The Rainy Day", content: "It was raining outside. The sky was very dark and cloudy. Rain fell on the windows. Children played inside the house. They watched the rain and told stories. When the sun came out, they went to play.", wordCount: 48, gradeBand: "BAND_3_5", level: 2, topic: "Weather" },
  { title: "The Magic Garden", content: "In a quiet corner of the town, there was a magical garden. Beautiful flowers grew tall and bright. A young girl named Emma discovered the garden one sunny afternoon. She found flowers that sang songs and trees that told stories. Every day she visited the garden and made new friends.", wordCount: 56, gradeBand: "BAND_3_5", level: 2, topic: "Nature" },
  { title: "Learning to Ride a Bike", content: "Tom wanted to learn how to ride a bicycle. His father helped him practice every day. At first, Tom was scared. But he kept trying and never gave up. After many days of practice, he finally rode the bike without help. Tom felt proud and happy.", wordCount: 54, gradeBand: "BAND_3_5", level: 2, topic: "Play" },
  { title: "The Festival Celebration", content: "The annual festival was coming to the town. People decorated the streets with colorful lights and decorations. Families prepared special food and delicious treats. Children wore traditional clothes and danced together. The festival brought everyone together. It was a time of joy, laughter, and beautiful memories for all the people in the community.", wordCount: 62, gradeBand: "BAND_3_5", level: 3, topic: "Festivals" },

  // Grade 6-8 (for ages 12-14)
  { title: "The Adventure Begins", content: "Sarah was excited about her summer adventure. She had saved money for months to travel to the mountains. The journey would take three days by train. Along the way, she would see beautiful landscapes and meet interesting people. She packed her backpack carefully and prepared for the most important journey of her life so far.", wordCount: 60, gradeBand: "BAND_6_8", level: 1, topic: "Stories" },
  { title: "Climate Change Explained", content: "Climate change is one of the biggest challenges facing our world today. Our planet is getting warmer because of greenhouse gases in the atmosphere. These gases trap heat from the sun. Scientists have studied this problem for many years. They have found that we must act now to protect our environment for future generations.", wordCount: 58, gradeBand: "BAND_6_8", level: 2, topic: "Environment" },
  { title: "The History of Technology", content: "Technology has changed how we live, work, and communicate. In the past hundred years, we invented the telephone, television, and computers. Each invention solved problems and made life easier. Now artificial intelligence is changing the world again. The future of technology will bring even more amazing discoveries and possibilities.", wordCount: 60, gradeBand: "BAND_6_8", level: 3, topic: "Technology" },

  // Grade 1-2 (for ages 6-8)
  { title: "The Happy Dog", content: "Max is a happy dog. He likes to run and play. One day Max saw a ball. He ran after the ball. Max caught it! He was very happy.", wordCount: 28, gradeBand: "BAND_1_2", level: 1, topic: "Animals" },
  { title: "Apple and Orange", content: "There was an apple and an orange. They were friends. The apple was red. The orange was orange. They sat together in a bowl. They were happy.", wordCount: 30, gradeBand: "BAND_1_2", level: 1, topic: "Daily Life" },
  { title: "The Sunny Day", content: "It was a sunny day. The sun was bright and warm. A boy went outside. He played with his toy. He made a new friend. They played together all day.", wordCount: 34, gradeBand: "BAND_1_2", level: 2, topic: "Weather" },
];

async function seedPassages() {
  try {
    console.log('🌱 Seeding reading passages...\n');

    for (const passage of SAMPLE_PASSAGES) {
      const existing = await prisma.readingPassage.findFirst({
        where: { title: passage.title }
      });

      if (!existing) {
        await prisma.readingPassage.create({ data: passage });
        console.log(`✅ Created: ${passage.title} (${passage.gradeBand}, Level ${passage.level})`);
      }
    }

    console.log('\n✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPassages();
