import { PrismaClient } from "./app/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("\n=== DATABASE VERIFICATION ===\n");
    
    // Test connection
    console.log("Testing database connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection OK\n");
    
    // Check tables
    console.log("Checking Phase 2 tables...");
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(t => t.table_name);
    const requiredTables = ["Student", "StudentProgress", "Leaderboard", "LeaderboardSnapshot", "NotificationPreference", "SentEmail", "Certificate"];
    
    for (const table of requiredTables) {
      const exists = tableNames.includes(table);
      console.log(`  ${exists ? "✓" : "✗"} ${table}`);
    }
    
    // Check StudentProgress avgFluency
    console.log("\nChecking StudentProgress avgFluency column...");
    const progressCols = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'StudentProgress'
    `;
    
    const hasAvgFluency = progressCols.some(c => c.column_name === 'avgFluency');
    console.log(`  ${hasAvgFluency ? "✓" : "✗"} avgFluency column exists`);
    
    // Check Student parentEmail
    console.log("\nChecking Student parentEmail column...");
    const studentCols = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'Student'
    `;
    
    const hasParentEmail = studentCols.some(c => c.column_name === 'parentEmail');
    console.log(`  ${hasParentEmail ? "✓" : "✗"} parentEmail column exists`);
    
    // Data counts
    console.log("\nData integrity checks:");
    const counts = {
      students: await prisma.student.count(),
      progress: await prisma.studentProgress.count(),
      leaderboard: await prisma.leaderboard.count(),
      notifications: await prisma.notificationPreference.count(),
      emails: await prisma.sentEmail.count(),
      certificates: await prisma.certificate.count()
    };
    
    for (const [key, count] of Object.entries(counts)) {
      console.log(`  ${key}: ${count} records`);
    }
    
    // Migrations
    console.log("\nApplied migrations:");
    const migrations = await prisma.$queryRaw`
      SELECT id FROM "_prisma_migrations" ORDER BY finished_at DESC
    `;
    
    for (const mig of migrations) {
      console.log(`  - ${mig.id}`);
    }
    
    console.log("\n✓ VERIFICATION COMPLETE");
    
  } catch (error) {
    console.error("\n✗ ERROR:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
