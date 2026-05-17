import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// School runs 2 sessions per week.
// A student is "stuck" when they have attempted ≥ 6 sessions (≈3 weeks)
// at the current level but have fewer than 2 passes — clearly not progressing.
const STUCK_SESSION_THRESHOLD = 6;
const STUCK_PASS_THRESHOLD = 2;

export async function GET() {
  const authSession = await getSession();
  if (!authSession || authSession.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolId = authSession.schoolId!;

  // ── Class-wise stats ─────────────────────────────────────────────────────
  type ProgressRow = {
    currentLevel: number; avgWpm: number; avgAccuracy: number;
    totalSessions: number; passedSessions: number;
  };
  type StudentRow = {
    id: string; name: string; admissionNumber: string;
    progress: ProgressRow | null;
    sessions: Array<{ id: string; status: string; createdAt: Date; wpm: number | null; accuracy: number | null }>;
  };
  type ClassRow = { id: string; grade: number; section: string; students: StudentRow[] };

  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      students: {
        include: {
          progress: true,
          sessions: {
            where: { status: { in: ["COMPLETED", "NEEDS_REVIEW"] } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  }) as unknown as ClassRow[];

  const classStats = classes.map((cls) => {
    const students = cls.students;
    const withProgress = students.filter((s) => s.progress);

    const avgWpm = withProgress.length
      ? withProgress.reduce((sum, s) => sum + (s.progress?.avgWpm ?? 0), 0) / withProgress.length
      : 0;
    const avgAccuracy = withProgress.length
      ? withProgress.reduce((sum, s) => sum + (s.progress?.avgAccuracy ?? 0), 0) / withProgress.length
      : 0;

    const levelDist = [1, 2, 3].map((lvl) => ({
      level: lvl,
      count: withProgress.filter((s) => s.progress?.currentLevel === lvl).length,
    }));

    const atRisk = students.filter(
      (s) => !s.progress || s.progress.avgAccuracy < 70 || s.progress.avgWpm < 30
    );

    // Stuck: enough attempts but not enough passes
    const stuck = students.filter((s) => {
      if (!s.progress) return false;
      return (
        s.progress.totalSessions >= STUCK_SESSION_THRESHOLD &&
        s.progress.passedSessions < STUCK_PASS_THRESHOLD
      );
    });

    return {
      classId: cls.id,
      grade: cls.grade,
      section: cls.section,
      totalStudents: students.length,
      activeStudents: withProgress.length,
      avgWpm: Math.round(avgWpm * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      levelDist,
      atRiskCount: atRisk.length,
      atRiskStudents: atRisk.map((s) => ({
        id: s.id,
        name: s.name,
        admissionNumber: s.admissionNumber,
        avgWpm: s.progress?.avgWpm ?? 0,
        avgAccuracy: s.progress?.avgAccuracy ?? 0,
      })),
      stuckStudents: stuck.map((s) => {
        const firstSession = s.sessions[0];
        const daysSince = firstSession
          ? Math.floor((Date.now() - new Date(firstSession.createdAt).getTime()) / 86_400_000)
          : null;
        return {
          id: s.id,
          name: s.name,
          admissionNumber: s.admissionNumber,
          level: s.progress!.currentLevel,
          totalSessions: s.progress!.totalSessions,
          passedSessions: s.progress!.passedSessions,
          avgWpm: Math.round(s.progress!.avgWpm),
          avgAccuracy: Math.round(s.progress!.avgAccuracy),
          daysSince,
        };
      }),
    };
  });

  // ── Weekly trend (last 7 days) ───────────────────────────────────────────
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  type SessionRow = { createdAt: Date; wpm: number | null; accuracy: number | null; studentId: string };

  const weeklySessions = await prisma.readingSession.findMany({
    where: {
      student: { class: { schoolId } },
      createdAt: { gte: sevenDaysAgo, lte: today },
      status: { in: ["COMPLETED", "NEEDS_REVIEW"] },
    },
    select: { createdAt: true, wpm: true, accuracy: true, studentId: true },
    orderBy: { createdAt: "asc" },
  }) as unknown as SessionRow[];

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = `${DAY_LABELS[d.getDay()]} ${d.getDate()}`;
    const day = weeklySessions.filter(
      (s) => new Date(s.createdAt).toISOString().slice(0, 10) === dateStr
    );
    const uniqueStudents = new Set(day.map((s) => s.studentId)).size;
    const wpms = day.map((s) => s.wpm ?? 0).filter((w) => w > 0);
    const accs = day.map((s) => s.accuracy ?? 0).filter((a) => a > 0);
    return {
      date: dateStr,
      label,
      sessions: day.length,
      students: uniqueStudents,
      avgWpm: wpms.length ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length) : 0,
      avgAccuracy: accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0,
    };
  });

  // Previous 7 days for % change
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  const prevWeekEnd = new Date(sevenDaysAgo);
  prevWeekEnd.setSeconds(prevWeekEnd.getSeconds() - 1);
  const prevWeekCount = await prisma.readingSession.count({
    where: {
      student: { class: { schoolId } },
      createdAt: { gte: fourteenDaysAgo, lte: prevWeekEnd },
      status: { in: ["COMPLETED", "NEEDS_REVIEW"] },
    },
  });

  const thisWeek = weeklySessions.length;
  const weekWpms = weeklySessions.map((s) => s.wpm ?? 0).filter((w) => w > 0);
  const weekAccs = weeklySessions.map((s) => s.accuracy ?? 0).filter((a) => a > 0);
  const weekSummary = {
    sessions: thisWeek,
    students: new Set(weeklySessions.map((s) => s.studentId)).size,
    avgWpm: weekWpms.length ? Math.round(weekWpms.reduce((a, b) => a + b, 0) / weekWpms.length) : 0,
    avgAccuracy: weekAccs.length ? Math.round(weekAccs.reduce((a, b) => a + b, 0) / weekAccs.length) : 0,
    vsLastWeek: prevWeekCount > 0
      ? Math.round(((thisWeek - prevWeekCount) / prevWeekCount) * 100)
      : null,
  };

  const totalStudents = classStats.reduce((s: number, c) => s + c.totalStudents, 0);
  const totalActive = classStats.reduce((s: number, c) => s + c.activeStudents, 0);
  const totalAtRisk = classStats.reduce((s: number, c) => s + c.atRiskCount, 0);
  const totalStuck = classStats.reduce((s: number, c) => s + c.stuckStudents.length, 0);

  return Response.json({
    classStats, totalStudents, totalActive, totalAtRisk, totalStuck,
    weeklyTrend, weekSummary,
  });
}
