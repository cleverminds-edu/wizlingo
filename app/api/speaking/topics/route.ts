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

  if (topicCount === 0) {
    console.warn('⚠️  NO TOPICS IN DATABASE - Attempting emergency seed...');
    try {
      // Emergency: Create topics directly
      const topics = [
        { id: 't1', title: 'Breakfast Chat', character: 'Mom', characterGender: 'FEMALE' as const, characterRole: 'Parent', openingLine: 'Good morning! Did you sleep well?', script: 'Regular conversation about breakfast and morning routine', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't2', title: 'Pet Friend', character: 'Alex', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'I got a new puppy! Want to see?', script: 'Conversation about pets and animals', level: 1, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't3', title: 'School Day', character: 'Teacher', characterGender: 'FEMALE' as const, characterRole: 'Teacher', openingLine: 'How was your school day?', script: 'Discussion about school, classes, and friends', level: 2, gradeBand: 'BAND_3_5' as const, mode: 'SCRIPTED' as const },
        { id: 't4', title: 'Weather Talk', character: 'Jamie', characterGender: 'MALE' as const, characterRole: 'Friend', openingLine: 'What do you think about this weather?', script: 'Conversation about different weather types', level: 1, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
        { id: 't5', title: 'Adventure Time', character: 'Explorer', characterGender: 'MALE' as const, characterRole: 'Mentor', openingLine: 'Would you like to go on an adventure?', script: 'Planning and discussing outdoor adventures', level: 2, gradeBand: 'BAND_6_8' as const, mode: 'SCRIPTED' as const },
      ];

      for (const topic of topics) {
        try {
          await prisma.conversationTopic.create({ data: topic });
        } catch (e) {
          // Skip duplicates
          if ((e as any).code !== 'P2002') throw e;
        }
      }
      console.log(`✅ Emergency seeded ${topics.length} topics`);
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
