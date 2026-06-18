import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ageBandToGradeBand } from "@/lib/age-band-mapping";
import { selectSpeakingTopic } from "@/lib/content-selection";
import {
  getSpeakingPreference,
  getAvailableCharacterGenders,
  calculateProgressionWeek,
  getTargetDiversityPercentage,
  selectCharacterGender,
} from "@/lib/speaking-preference";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.id },
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
