import { getAuth, getStudentIdFromAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { ageBandToGradeBand } from "@/lib/age-band-mapping";
import { selectSpeakingTopic } from "@/lib/content-selection";
import { ensurePassagesSeeded } from "@/lib/seed-passages";
import {
  getSpeakingPreference,
  getAvailableCharacterGenders,
  calculateProgressionWeek,
  getTargetDiversityPercentage,
  selectCharacterGender,
} from "@/lib/speaking-preference";

export async function GET(request: Request) {
  console.log('🎤 GET /api/speaking/topics - Starting');

  // Auto-seed if database is empty
  await ensurePassagesSeeded();

  // Debug: Count topics in database
  let topicCount = await prisma.conversationTopic.count();
  console.log(`📊 Database has ${topicCount} conversation topics`);

  if (topicCount < 30) {
    console.warn(`⚠️  INSUFFICIENT TOPICS (${topicCount} found) - Expanding topic library...`);
    try {
      // Expanded library: 45 topics across all levels and bands
      const topics = [
        // BAND_3_5, Level 1 (15 topics)
        { id: 't1', title: 'Breakfast Chat', character: 'Mom', characterGender: 'FEMALE' as const, characterRole: 'Parent', openingLine: 'Good morning, sweetie! How did you sleep? Let me make you something yummy!', script: 'Casual family chat about breakfast, plans for the day, favorite foods', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't2', title: 'Pet Friend', character: 'Alex', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Hey! You won\'t believe what happened! I got a new puppy and it\'s so adorable!', script: 'Fun chat about pets, animals, funny pet stories, how to care for animals', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't6', title: 'Movie Night', character: 'Sarah', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'Oh my gosh, I just watched the coolest movie! Have you seen it?', script: 'Casual chat about movies, favorite characters, what makes a good story', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't7', title: 'Sports Buddy', character: 'Ravi', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Are you into sports? I love playing and talking about games! What\'s your favorite?', script: 'Friendly sports enthusiast sharing passion about games, teamwork, and fitness', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't8', title: 'Hobby Passion', character: 'Emma', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'I\'m so excited to talk about my favorite hobby! What do you like to do for fun?', script: 'Enthusiastic conversation about hobbies, art, music, crafts, and interests', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't11', title: 'Food Lover', character: 'Chef', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Cooking is my passion! Do you like to cook? Let me share my favorite recipes!', script: 'Enthusiastic chef talking about food, cooking tips, and culinary adventures', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't12', title: 'Music Lover', character: 'Aisha', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'Music makes me so happy! What\'s your favorite song or artist? Let\'s talk about it!', script: 'Energetic friend passionate about music, sharing playlists and concert stories', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't18', title: 'Dream Maker', character: 'Coach', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Everyone has dreams! I believe in you! Tell me what you want to achieve!', script: 'Motivational coach believing in students and helping them set meaningful goals', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't19', title: 'Friendship Chat', character: 'Alex', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'You know what I love? Good friends! What does friendship mean to you?', script: 'Kind friend talking about the value of friendship and meaningful connections', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't21', title: 'Game Master', character: 'Jamie', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Do you like playing games? Board games, video games, outdoor games? Tell me!', script: 'Fun-loving friend excited about all types of games and friendly competition', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't22', title: 'Storyteller\'s World', character: 'Meera', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'I love creating stories! Would you like to make up a story together? Let\'s start!', script: 'Creative storyteller inviting imagination and collaborative story creation', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't23', title: 'Holiday Fun', character: 'Mom', characterGender: 'FEMALE' as const, characterRole: 'Parent', openingLine: 'Holidays are coming! What\'s your favorite holiday? How do you celebrate?', script: 'Warm discussion about festivals, celebrations, family traditions, and special memories', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't24', title: 'Art Explorer', character: 'Emma', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'I\'ve been drawing lately! Do you like art? What\'s your favorite thing to create?', script: 'Artistic friend discussing drawing, painting, crafts, and creative expression', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't25', title: 'Adventure Quest', character: 'Ravi', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Want to go on an adventure? Even if it\'s just in our imagination? Where should we go?', script: 'Energetic friend sparking adventurous conversations and exciting possibilities', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },

        // BAND_3_5, Level 2 (15 topics)
        { id: 't3', title: 'School Day', character: 'Teacher', characterGender: 'FEMALE' as const, characterRole: 'Teacher', openingLine: 'Hi there! How was your school day? Did you have fun with your friends?', script: 'Friendly teacher asking about school, friends, favorite subjects, and learning', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't13', title: 'Future Plans', character: 'Mentor', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'I\'m curious about your dreams! What do you want to be when you grow up?', script: 'Supportive mentor helping students think about their future and goals', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't20', title: 'Learning Quest', character: 'Sage', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Learning new things is the best adventure! What are you curious about today?', script: 'Wise mentor inspiring continuous learning and intellectual curiosity', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't26', title: 'Community Helper', character: 'Coach', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Good people help their community! What\'s one thing you\'d like to help with?', script: 'Inspirational mentor discussing community service and helping others', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't27', title: 'Science Fun', character: 'Professor', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Science is everywhere! Have you ever wondered how things work?', script: 'Curious mentor making simple science exciting and relatable', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't28', title: 'Nature Talk', character: 'Eco', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'Nature is so beautiful! Do you like being outdoors? What\'s your favorite place?', script: 'Enthusiastic nature lover discussing plants, animals, parks, and outdoor adventures', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't29', title: 'Reading Adventure', character: 'Librarian', characterGender: 'FEMALE' as const, characterRole: 'Mentor', openingLine: 'Books open amazing worlds! What kind of stories do you love?', script: 'Book-loving mentor encouraging reading and discussing favorite stories', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't30', title: 'Culture Celebration', character: 'Maya', characterGender: 'FEMALE' as const, characterRole: 'Mentor', openingLine: 'Every culture is special! Tell me about your traditions and celebrations!', script: 'Curious mentor celebrating cultural diversity and family traditions', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't31', title: 'Tech Wonder', character: 'Tech', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Technology is amazing! What\'s your favorite app or device?', script: 'Tech-savvy friend discussing cool gadgets, apps, and how technology helps us', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't32', title: 'Health Champion', character: 'Coach', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Staying healthy is important! Do you like sports or exercise?', script: 'Motivational mentor discussing fitness, healthy habits, and wellness', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't33', title: 'Problem Solver', character: 'Sage', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Everyone faces challenges! How do you solve problems?', script: 'Thoughtful mentor discussing problem-solving and overcoming challenges', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't34', title: 'Memory Keeper', character: 'Meera', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'What\'s your favorite memory? Let\'s talk about it!', script: 'Warm storyteller discussing precious memories and meaningful moments', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't35', title: 'Weather Watch', character: 'Jamie', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'The weather is interesting today! How does different weather make you feel?', script: 'Observant friend discussing seasons, weather patterns, and how they affect activities', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't36', title: 'Hero Talk', character: 'Coach', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Who\'s your hero? What makes them special?', script: 'Inspiring mentor discussing role models and admirable qualities', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't37', title: 'Innovation Station', character: 'Tech', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'If you could invent something, what would it be?', script: 'Creative friend discussing inventions, innovations, and ideas for improving life', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },

        // BAND_6_8 (15 topics)
        { id: 't4', title: 'Weather Talk', character: 'Jamie', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Hey! Have you seen this weather? It\'s so interesting! What do you think?', script: 'Chatting about weather, seasons, outdoor activities, and how weather affects plans', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't5', title: 'Adventure Time', character: 'Explorer', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'I love exploring! Would you like to plan an adventure together? Where should we go?', script: 'Exciting discussion about adventures, travel plans, exciting places to explore', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't9', title: 'Travel Dreams', character: 'Marco', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'I\'ve been to so many cool places! Let me tell you about my adventures. Where do YOU want to go?', script: 'Inspiring mentor sharing travel experiences and encouraging dream-building', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't10', title: 'Science Explorer', character: 'Professor', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Did you know that science is everywhere? What fascinates you the most?', script: 'Curious mentor making science fun and relatable through real-world examples', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't14', title: 'Technology Talk', character: 'Tech', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'Did you see the latest tech gadget? Technology is evolving so fast! What do you think?', script: 'Tech-savvy friend excited about innovations and how tech changes our lives', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't15', title: 'Book Club', character: 'Librarian', characterGender: 'FEMALE' as const, characterRole: 'Mentor', openingLine: 'I LOVE books! Have you read anything interesting lately? What do you think about it?', script: 'Enthusiastic librarian encouraging reading and discussing stories', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't16', title: 'Environment Buddy', character: 'Eco', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'Our planet is amazing! Do you care about the environment? Let\'s talk about it!', script: 'Passionate environmentalist discussing nature conservation and sustainability', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't17', title: 'Culture Explorer', character: 'Maya', characterGender: 'FEMALE' as const, characterRole: 'Mentor', openingLine: 'Different cultures are so interesting! Tell me about yours. I\'d love to learn!', script: 'Curious mentor celebrating cultural diversity and encouraging cultural exchange', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't38', title: 'Career Chat', character: 'Mentor', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'What interests you for your future career? Let\'s explore possibilities!', script: 'Mentoring discussion about career paths, interests, skills, and professional development', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't39', title: 'Global Perspective', character: 'Marco', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'The world is so diverse! What do you want to learn about the world?', script: 'Worldly mentor discussing global issues, cultures, geography, and international understanding', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't40', title: 'Philosophy Fun', character: 'Sage', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'What does happiness mean to you? Let\'s think about big ideas!', script: 'Thoughtful mentor discussing philosophy, values, meaning, and deeper questions', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't41', title: 'Arts & Creativity', character: 'Maya', characterGender: 'FEMALE' as const, characterRole: 'Friend', openingLine: 'Art expresses our souls! What kind of creativity speaks to you?', script: 'Creative friend discussing visual arts, performing arts, music, and self-expression', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't42', title: 'Social Impact', character: 'Coach', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'How can we make the world better? What change do you want to create?', script: 'Inspiring mentor discussing social responsibility and making positive impact', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't43', title: 'Brain Games', character: 'Professor', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Want to solve some puzzles? Let\'s challenge our minds!', script: 'Engaging mentor discussing logic, puzzles, critical thinking, and mental challenges', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't44', title: 'Sports Evolution', character: 'Coach', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Sports teach us so much! What\'s your favorite sport and why?', script: 'Enthusiastic sports mentor discussing teamwork, athletics, fitness, and sportsmanship', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
      ];

      let created = 0;
      for (const topic of topics) {
        try {
          await prisma.conversationTopic.create({ data: topic });
          created++;
        } catch (e) {
          // Skip duplicates
          if ((e as any).code !== 'P2002') throw e;
        }
      }
      console.log(`✅ Created ${created} new topics. Total available: ${topics.length}`);
      topicCount = await prisma.conversationTopic.count();
    } catch (e) {
      console.error('❌ Emergency seed failed:', e instanceof Error ? e.message : e);
      return Response.json({
        error: 'No conversation topics available. Emergency seeding failed.',
        debug: { topicCount, error: e instanceof Error ? e.message : String(e) }
      }, { status: 503 });
    }
  }

  const auth = await getAuth(request);
  console.log('🔐 Auth check:', { hasAuth: !!auth, role: auth?.role });
  if (!auth || auth.role !== "student") {
    console.error('❌ Auth failed');
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = getStudentIdFromAuth(auth);
  console.log('👤 Student ID:', studentId);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true, progress: true, speakingProgress: true },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  // Get grade band from age band
  const ageBand = student.progress?.ageBand ?? "9-11";
  const gradeBand = ageBandToGradeBand(ageBand as any);
  const level = student.speakingProgress?.currentLevel ?? 2;

  // PHASE A+B: Get speaking preference and apply character selection
  const preference = await getSpeakingPreference(student.id);
  const progressionWeek = calculateProgressionWeek(preference.startedAt);
  const diversity = getTargetDiversityPercentage(progressionWeek);
  const preferredGenders = getAvailableCharacterGenders(
    student.gender,
    preference.characterGenderPref as any
  );

  // Get topics for this level
  const allTopics = await prisma.conversationTopic.findMany({
    where: { gradeBand, level },
    select: {
      id: true,
      title: true,
      character: true,
      characterGender: true,
      characterRole: true,
      openingLine: true,
      script: true,
      level: true,
      gradeBand: true,
    },
  });

  if (allTopics.length === 0) {
    return Response.json({ error: "No topics available" }, { status: 404 });
  }

  // Intelligent character selection based on progression
  const allAvailableGenders = [...new Set(allTopics.map((t) => t.characterGender).filter(Boolean))];
  const selectedGender = selectCharacterGender(
    allAvailableGenders as string[],
    preferredGenders,
    diversity
  );

  // Filter topics by selected character gender
  let filteredTopics = allTopics.filter((t) => t.characterGender === selectedGender);

  // If no topics for selected gender, fall back to any available
  if (filteredTopics.length === 0) {
    filteredTopics = allTopics;
  }

  // Return all available topics for the student's level
  return Response.json({
    topics: filteredTopics.length > 0 ? filteredTopics : allTopics,
    gradeBand,
    level,
    preference: {
      characterGenderPref: preference.characterGenderPref,
      pronouns: preference.pronouns,
      progressionWeek,
      selectedCharacterGender: selectedGender,
      diversityTarget: diversity,
    },
    context: {
      ageBand,
      level,
      studentGender: student.gender,
    },
  });
}
