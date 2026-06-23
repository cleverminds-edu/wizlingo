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
  // BAND_1_2 (Grade 1-2) - Level 1
  { id: 'p1', title: 'My Pet Dog', content: 'I have a dog. His name is Bruno. He is brown and big. Bruno likes to run and play. Every morning we go for a walk. He wags his tail when he is happy. I love my dog.', wordCount: 38, gradeBand: 'BAND_1_2', level: 1, topic: 'Animals' },
  { id: 'p2', title: 'The Red Ball', content: 'Tom has a red ball. He plays with it every day. One day the ball fell in a pond. A frog sat on it. Tom was sad. Then the frog pushed it back. Tom was very happy.', wordCount: 38, gradeBand: 'BAND_1_2', level: 1, topic: 'Play' },
  { id: 'p3', title: 'Our Cat', content: 'We have a cat at home. Her name is Meena. She is white with black spots. Meena sleeps on my bed. She drinks milk every morning. She likes to chase a ball of wool. She is my best friend.', wordCount: 40, gradeBand: 'BAND_1_2', level: 1, topic: 'Animals' },
  { id: 'p4', title: 'Happy Dog', content: 'Max is a happy dog. He likes to run and play. One day Max saw a ball. He ran after the ball. Max caught it! He was very happy.', wordCount: 28, gradeBand: 'BAND_1_2', level: 1, topic: 'Animals' },
  { id: 'p5', title: 'My School', content: 'I go to school every day. My school is big and fun. I have many friends at school. We play games and learn new things. My teacher is nice. I like my school.', wordCount: 35, gradeBand: 'BAND_1_2', level: 1, topic: 'School' },

  // BAND_3_5 (Grade 3-5) - Level 1
  { id: 'p6', title: 'The Little Butterfly', content: 'A small butterfly lived in a garden. It was yellow and orange. Every day it flew from flower to flower. The butterfly liked to drink sweet juice from the flowers. One sunny day, it saw a big butterfly. They became good friends and flew together.', wordCount: 49, gradeBand: 'BAND_3_5', level: 1, topic: 'Animals' },
  { id: 'p7', title: 'Rainy Day Fun', content: 'It was raining outside. The children could not play in the park. Instead, they played indoor games. They played hide and seek. They drew pictures and read books. They made a big fort with blankets and pillows. They had so much fun inside.', wordCount: 45, gradeBand: 'BAND_3_5', level: 1, topic: 'Play' },
  { id: 'p8', title: 'The Helpful Ant', content: 'An ant was walking alone. It found a grain of rice. The rice was too heavy. The ant called its friends. All the ants came to help. Together they carried the rice home. They worked as a team. This is why ants are very strong.', wordCount: 48, gradeBand: 'BAND_3_5', level: 1, topic: 'Animals' },
  { id: 'p9', title: 'Visiting Grandma', content: 'I went to visit my grandmother. She lives in a small house near the river. Grandma made delicious cookies for me. We sat in her garden and ate cookies. We watched birds singing in the trees. I told her stories about my school. Grandma is very kind and I love her.', wordCount: 50, gradeBand: 'BAND_3_5', level: 1, topic: 'Family' },
  { id: 'p10', title: 'The Curious Rabbit', content: 'A small rabbit lived in the forest. It was very curious about the world. One day it found a strange object. The rabbit showed it to other animals. Everyone tried to guess what it was. Finally, an old owl said it was a bell. All the animals laughed and played with the bell.', wordCount: 52, gradeBand: 'BAND_3_5', level: 1, topic: 'Animals' },

  // BAND_3_5 - Level 2
  { id: 'p11', title: 'Learning to Ride', content: 'Tom wanted to learn how to ride a bicycle. His father helped him practice every day. At first, Tom was scared. But he kept trying and never gave up. After many days of practice, he finally rode the bike without help. Tom felt proud and happy.', wordCount: 54, gradeBand: 'BAND_3_5', level: 2, topic: 'Play' },
  { id: 'p12', title: 'The Magic Garden', content: 'In a quiet corner of the town, there was a magical garden. Beautiful flowers grew tall and bright. A young girl named Emma discovered the garden one sunny afternoon. She found flowers that sang songs and trees that told stories. Every day she visited the garden and made new friends.', wordCount: 56, gradeBand: 'BAND_3_5', level: 2, topic: 'Nature' },
  { id: 'p13', title: 'The Lost Kitten', content: 'A little kitten got lost in the city. It was scared and hungry. A kind girl found it on the street. She gave it milk and warm blankets. The girl searched for the kitten\'s mother. Finally, she found the owner. The owner was very happy. The kitten was safe again.', wordCount: 54, gradeBand: 'BAND_3_5', level: 2, topic: 'Animals' },
  { id: 'p14', title: 'The Market Day', content: 'Every Sunday, there is a market near my house. Farmers bring vegetables and fruits. People buy fresh food for their families. My mother takes me to the market. We buy apples, bananas, and carrots. I help carry the bags. The market is always busy and fun.', wordCount: 50, gradeBand: 'BAND_3_5', level: 2, topic: 'Community' },
  { id: 'p15', title: 'Books Are Friends', content: 'I love reading books. Books can take you to magical places. You can meet interesting characters. You can learn about different countries. Some books are funny and make you laugh. Other books are exciting. Reading makes your imagination grow. Books are wonderful friends.', wordCount: 48, gradeBand: 'BAND_3_5', level: 2, topic: 'Education' },

  // BAND_3_5 - Level 3
  { id: 'p16', title: 'Festival Celebration', content: 'The annual festival was coming to the town. People decorated the streets with colorful lights and decorations. Families prepared special food and delicious treats. Children wore traditional clothes and danced together. The festival brought everyone together. It was a time of joy, laughter, and beautiful memories for all the people in the community.', wordCount: 62, gradeBand: 'BAND_3_5', level: 3, topic: 'Festivals' },
  { id: 'p17', title: 'The Invention', content: 'A young scientist named Ravi had an interesting idea. He wanted to create a machine that could help farmers. For months, he worked hard in his workshop. He tried many different designs. Finally, he succeeded. His invention saved farmers lots of time. People praised his hard work and creativity. Ravi proved that hard work leads to success.', wordCount: 60, gradeBand: 'BAND_3_5', level: 3, topic: 'Technology' },
  { id: 'p18', title: 'The Ancient Treasure', content: 'Archaeologists found an ancient treasure in the desert. The treasure was hidden for thousands of years. They discovered beautiful golden objects and precious stones. Scientists studied these objects carefully. They learned about the civilization that created them. The treasure tells us how people lived long ago. Museums display these treasures for people to see and learn.', wordCount: 58, gradeBand: 'BAND_3_5', level: 3, topic: 'History' },

  // BAND_6_8 (Grade 6-8) - Level 1
  { id: 'p19', title: 'Adventure Begins', content: 'Sarah was excited about her summer adventure. She had saved money for months to travel to the mountains. The journey would take three days by train. Along the way, she would see beautiful landscapes and meet interesting people. She packed her backpack carefully and prepared for the most important journey of her life so far.', wordCount: 60, gradeBand: 'BAND_6_8', level: 1, topic: 'Stories' },
  { id: 'p20', title: 'The Science of Rainbows', content: 'A rainbow appears when sunlight and water drops interact. The sunlight enters the water drop and bounces inside. The light separates into different colors. Each color has a different wavelength. Red light has the longest wavelength. Violet light has the shortest wavelength. This is why rainbows always have the same colors in the same order.', wordCount: 57, gradeBand: 'BAND_6_8', level: 1, topic: 'Science' },
  { id: 'p21', title: 'Sports and Health', content: 'Playing sports is important for your health. Exercise makes your heart stronger. It helps you maintain a healthy weight. Sports also improve your mental health. When you exercise, your brain releases chemicals that make you happy. Team sports teach you cooperation. They help you make friends. Everyone should find a sport they enjoy.', wordCount: 55, gradeBand: 'BAND_6_8', level: 1, topic: 'Health' },

  // BAND_6_8 - Level 2
  { id: 'p22', title: 'Climate Change', content: 'Climate change is one of the biggest challenges facing our world today. Our planet is getting warmer because of greenhouse gases in the atmosphere. These gases trap heat from the sun. Scientists have studied this problem for many years. They have found that we must act now to protect our environment for future generations.', wordCount: 58, gradeBand: 'BAND_6_8', level: 2, topic: 'Environment' },
  { id: 'p23', title: 'Artificial Intelligence', content: 'Artificial Intelligence is technology that can learn and make decisions. AI systems can recognize faces, understand language, and play games. Companies use AI to improve their services. Doctors use AI to diagnose diseases. AI can make human life easier and better. However, there are concerns about privacy and job loss. Society must develop responsible AI that benefits everyone.', wordCount: 61, gradeBand: 'BAND_6_8', level: 2, topic: 'Technology' },
  { id: 'p24', title: 'Exploring Ancient Civilizations', content: 'Ancient Egypt was one of the greatest civilizations in history. Egyptians built massive pyramids as tombs for their kings. They developed a writing system called hieroglyphics. They made advances in mathematics and medicine. The Nile River was central to their survival and prosperity. Their culture lasted for thousands of years. We still study ancient Egypt to understand human achievement.', wordCount: 59, gradeBand: 'BAND_6_8', level: 2, topic: 'History' },

  // BAND_6_8 - Level 3
  { id: 'p25', title: 'Technology History', content: 'Technology has changed how we live, work, and communicate. In the past hundred years, we invented the telephone, television, and computers. Each invention solved problems and made life easier. Now artificial intelligence is changing the world again. The future of technology will bring even more amazing discoveries and possibilities.', wordCount: 60, gradeBand: 'BAND_6_8', level: 3, topic: 'Technology' },
  { id: 'p26', title: 'Ocean Mysteries', content: 'The ocean covers seventy percent of Earth\'s surface. Yet we have explored less than five percent of it. The deep ocean is home to strange creatures. Some fish produce their own light. Some creatures can survive extreme pressure and cold. Scientists believe we may discover new species. Understanding the ocean is crucial for understanding our planet\'s health.', wordCount: 57, gradeBand: 'BAND_6_8', level: 3, topic: 'Science' },
  { id: 'p27', title: 'Global Leadership', content: 'Great leaders inspire people to achieve their goals. They have vision for a better future. They communicate effectively with others. They make difficult decisions fairly. Throughout history, leaders have shaped civilizations. Some leaders brought peace and prosperity. Others caused conflict and suffering. We can learn from both. Today\'s leaders must address global challenges like climate change and poverty.', wordCount: 60, gradeBand: 'BAND_6_8', level: 3, topic: 'Society' },
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
