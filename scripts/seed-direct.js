#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️  DATABASE_URL not set, skipping seeding');
  process.exit(0);
}

const passages = [
  { id: 'p1', title: 'My Pet Dog', content: 'I have a dog. His name is Bruno. He is brown and big. Bruno likes to run and play. Every morning we go for a walk. He wags his tail when he is happy. I love my dog.', wordCount: 38, gradeBand: 'BAND_3_5', level: 1, topic: 'Animals' },
  { id: 'p2', title: 'The Red Ball', content: 'Tom has a red ball. He plays with it every day. One day the ball fell in a pond. A frog sat on it. Tom was sad. Then the frog pushed it back. Tom was very happy.', wordCount: 38, gradeBand: 'BAND_3_5', level: 1, topic: 'Play' },
  { id: 'p3', title: 'Our Cat', content: 'We have a cat at home. Her name is Meena. She is white with black spots. Meena sleeps on my bed. She drinks milk every morning. She likes to chase a ball of wool. She is my best friend.', wordCount: 40, gradeBand: 'BAND_3_5', level: 1, topic: 'Animals' },
  { id: 'p4', title: 'Learning to Ride', content: 'Tom wanted to learn how to ride a bicycle. His father helped him practice every day. At first, Tom was scared. But he kept trying and never gave up. After many days of practice, he finally rode the bike without help. Tom felt proud and happy.', wordCount: 54, gradeBand: 'BAND_3_5', level: 2, topic: 'Play' },
  { id: 'p5', title: 'The Magic Garden', content: 'In a quiet corner of the town, there was a magical garden. Beautiful flowers grew tall and bright. A young girl named Emma discovered the garden one sunny afternoon. She found flowers that sang songs and trees that told stories. Every day she visited the garden and made new friends.', wordCount: 56, gradeBand: 'BAND_3_5', level: 2, topic: 'Nature' },
  { id: 'p6', title: 'Festival Celebration', content: 'The annual festival was coming to the town. People decorated the streets with colorful lights and decorations. Families prepared special food and delicious treats. Children wore traditional clothes and danced together. The festival brought everyone together. It was a time of joy, laughter, and beautiful memories for all the people in the community.', wordCount: 62, gradeBand: 'BAND_3_5', level: 3, topic: 'Festivals' },
  { id: 'p7', title: 'Adventure Begins', content: 'Sarah was excited about her summer adventure. She had saved money for months to travel to the mountains. The journey would take three days by train. Along the way, she would see beautiful landscapes and meet interesting people. She packed her backpack carefully and prepared for the most important journey of her life so far.', wordCount: 60, gradeBand: 'BAND_6_8', level: 1, topic: 'Stories' },
  { id: 'p8', title: 'Climate Change', content: 'Climate change is one of the biggest challenges facing our world today. Our planet is getting warmer because of greenhouse gases in the atmosphere. These gases trap heat from the sun. Scientists have studied this problem for many years. They have found that we must act now to protect our environment for future generations.', wordCount: 58, gradeBand: 'BAND_6_8', level: 2, topic: 'Environment' },
  { id: 'p9', title: 'Technology History', content: 'Technology has changed how we live, work, and communicate. In the past hundred years, we invented the telephone, television, and computers. Each invention solved problems and made life easier. Now artificial intelligence is changing the world again. The future of technology will bring even more amazing discoveries and possibilities.', wordCount: 60, gradeBand: 'BAND_6_8', level: 3, topic: 'Technology' },
  { id: 'p10', title: 'Happy Dog', content: 'Max is a happy dog. He likes to run and play. One day Max saw a ball. He ran after the ball. Max caught it! He was very happy.', wordCount: 28, gradeBand: 'BAND_1_2', level: 1, topic: 'Animals' },
];

const topics = [
  { id: 't1', title: 'Breakfast Chat', character: 'Mom', characterGender: 'FEMALE', characterRole: 'Parent', openingLine: 'Good morning! Did you sleep well?', script: 'Regular conversation about breakfast and morning routine', level: 1, gradeBand: 'BAND_3_5', topic: 'Daily Life' },
  { id: 't2', title: 'Pet Friend', character: 'Alex', characterGender: 'MALE', characterRole: 'Friend', openingLine: 'I got a new puppy! Want to see?', script: 'Conversation about pets and animals', level: 1, gradeBand: 'BAND_3_5', topic: 'Animals' },
  { id: 't3', title: 'School Day', character: 'Teacher', characterGender: 'FEMALE', characterRole: 'Teacher', openingLine: 'How was your school day?', script: 'Discussion about school, classes, and friends', level: 2, gradeBand: 'BAND_3_5', topic: 'Daily Life' },
  { id: 't4', title: 'Weather Talk', character: 'Jamie', characterGender: 'MALE', characterRole: 'Friend', openingLine: 'What do you think about this weather?', script: 'Conversation about different weather types', level: 1, gradeBand: 'BAND_6_8', topic: 'Weather' },
  { id: 't5', title: 'Adventure Time', character: 'Explorer', characterGender: 'MALE', characterRole: 'Mentor', openingLine: 'Would you like to go on an adventure?', script: 'Planning and discussing outdoor adventures', level: 2, gradeBand: 'BAND_6_8', topic: 'Nature' },
];

async function seed() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // Required for Railway
  });

  try {
    console.log('🌱 Connecting to database for seeding...');
    await client.connect();
    console.log('✅ Connected');

    // Check if passages already exist
    const passageResult = await client.query('SELECT COUNT(*) FROM "ReadingPassage"');
    const passageCount = parseInt(passageResult.rows[0].count);

    console.log(`📊 Found ${passageCount} existing passages`);

    if (passageCount === 0) {
      console.log('🌱 Seeding reading passages...');
      for (const p of passages) {
        try {
          await client.query(
            `INSERT INTO "ReadingPassage" (id, title, content, "wordCount", "gradeBand", level, topic, "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [p.id, p.title, p.content, p.wordCount, p.gradeBand, p.level, p.topic]
          );
        } catch (e) {
          if (e.code === '23505') { // duplicate key
            continue; // Skip duplicates
          }
          throw e;
        }
      }
      console.log(`✅ Inserted ${passages.length} passages`);
    }

    // Check conversation topics
    const topicResult = await client.query('SELECT COUNT(*) FROM "ConversationTopic"');
    const topicCount = parseInt(topicResult.rows[0].count);

    console.log(`📊 Found ${topicCount} existing conversation topics`);

    if (topicCount === 0) {
      console.log('🌱 Seeding conversation topics via SQL...');
      try {
        const sqlFile = path.join(__dirname, 'seed-topics.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        await client.query(sql);
        console.log(`✅ Seeded conversation topics from SQL`);
      } catch (e) {
        console.error('❌ Failed to seed topics from SQL:', e.message);
        throw e;
      }
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error instanceof Error ? error.message : error);
    // Don't exit with error - seeding failure shouldn't block app startup
  } finally {
    await client.end();
  }
}

seed();
