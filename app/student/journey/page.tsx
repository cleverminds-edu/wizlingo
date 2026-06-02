import { getSession } from "@/lib/auth";
import { calculateAchievementStats } from "@/lib/achievement-stats";
import { redirect } from "next/navigation";
import JourneyPageClient from "./journey-client";

export default async function JourneyPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/login");
  }

  const stats = await calculateAchievementStats(session.id);

  return <JourneyPageClient initialStats={stats} />;
}
