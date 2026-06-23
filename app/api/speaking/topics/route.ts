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
  const topicCount = await prisma.conversationTopic.count();
  console.log(`📊 Database has ${topicCount} conversation topics`);
  if (topicCount === 0) {
    console.error('❌ NO TOPICS IN DATABASE - This should have been seeded at startup!');
    return Response.json({
      error: 'No conversation topics available in database. System is not properly initialized.',
      debug: { topicCount }
    }, { status: 503 });
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

  // Random selection
  const selectedTopic = filteredTopics[Math.floor(Math.random() * filteredTopics.length)];

  return Response.json({
    topic: selectedTopic,
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
