import { prisma } from "./prisma";

export async function ensurePassagesSeeded() {
  try {
    const passageCount = await prisma.readingPassage.count();
    const topicCount = await prisma.conversationTopic.count();

    // If we have content, skip seeding
    if (passageCount > 0 && topicCount > 0) {
      console.log(`✅ Database already has ${passageCount} passages and ${topicCount} topics`);
      return;
    }

    console.log('⏳ Checking if seeding is needed...');
    console.log(`   Passages: ${passageCount}, Topics: ${topicCount}`);

    if (passageCount === 0 || topicCount === 0) {
      console.warn('⚠️  Database is missing content. Seeding is handled at startup.');
      console.warn('⚠️  If you see this message, the init.js seed-direct.js script did not complete.');
      console.warn('⚠️  Passages and topics should have been created during startup.');
    }
  } catch (error) {
    console.error('❌ Error checking seeding status:', error instanceof Error ? error.message : error);
  }
}
