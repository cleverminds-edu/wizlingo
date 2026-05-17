import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { SPEAKING_TOPICS } from "../lib/speaking-topics";
config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding speaking topics...");
  let created = 0;

  for (const t of SPEAKING_TOPICS) {
    const id = `topic-${t.gradeBand}-l${t.level}-${t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await prisma.conversationTopic.upsert({
      where: { id },
      update: { openingLine: t.openingLine, script: t.script as object },
      create: {
        id,
        title: t.title,
        gradeBand: t.gradeBand,
        level: t.level,
        character: t.character,
        openingLine: t.openingLine,
        mode: "SCRIPTED",
        script: t.script as object,
      },
    });
    created++;
  }

  console.log(`Seeded ${created} conversation topics.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
