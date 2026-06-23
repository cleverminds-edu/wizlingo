import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalPassages = await prisma.readingPassage.count();
    const byBand = await prisma.readingPassage.groupBy({
      by: ["gradeBand", "level"],
      _count: true,
    });

    const totalTopics = await prisma.conversationTopic.count();
    const topicsByBand = await prisma.conversationTopic.groupBy({
      by: ["gradeBand", "level"],
      _count: true,
    });

    return Response.json({
      totalPassages,
      passagesByBandAndLevel: byBand,
      totalTopics,
      topicsByBandAndLevel: topicsByBand,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
