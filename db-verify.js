const { PrismaClient } = require("./app/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    console.log("\n=== DATABASE CONNECTION TEST ===");
    const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
    console.log("✓ Database connection successful");
    
    // Check all required Phase 2 tables
    console.log("\n=== PHASE 2 TABLE VERIFICATION ===");
    
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const tableNames = tables.map((t) => t.table_name);
    console.log("Existing tables:", tableNames);
    
    const requiredTables = [
      "Student",
      "StudentProgress",
      "Leaderboard",
      "LeaderboardSnapshot",
      "NotificationPreference",
      "SentEmail",
      "Certificate"
    ];
    
    console.log("\nPhase 2 table checks:");
    for (const table of requiredTables) {
      const exists = tableNames.includes(table);
      console.log(`  ${exists ? "✓" : "✗"} ${table}`);
    }
    
    // Check StudentProgress columns
    console.log("\n=== STUDENT PROGRESS COLUMNS ===");
    const progressCols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'StudentProgress' 
      ORDER BY ordinal_position
    `;
    
    const progressColNames = progressCols.map((c) => c.column_name);
    console.log("StudentProgress columns:", progressColNames);
    console.log(`  ${progressColNames.includes("avgFluency") ? "✓" : "✗"} avgFluency`);
    
    // Check Student parentEmail
    console.log("\n=== STUDENT TABLE ===");
    const studentCols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'Student'
      ORDER BY ordinal_position
    `;
    
    const studentColNames = studentCols.map((c) => c.column_name);
    console.log(`  ${studentColNames.includes("parentEmail") ? "✓" : "✗"} parentEmail`);
    
    // Check data counts
    console.log("\n=== DATA INTEGRITY ===");
    
    const studentCount = await prisma.student.count();
    console.log(`Student records: ${studentCount}`);
    
    const progressCount = await prisma.studentProgress.count();
    console.log(`StudentProgress records: ${progressCount}`);
    
    const leaderboardCount = await prisma.leaderboard.count();
    console.log(`Leaderboard records: ${leaderboardCount}`);
    
    const notifCount = await prisma.notificationPreference.count();
    console.log(`NotificationPreference records: ${notifCount}`);
    
    const emailCount = await prisma.sentEmail.count();
    console.log(`SentEmail records: ${emailCount}`);
    
    const certCount = await prisma.certificate.count();
    console.log(`Certificate records: ${certCount}`);
    
    console.log("\n=== MIGRATION STATUS ===");
    const migrations = await prisma.$queryRaw`
      SELECT id, finished_at 
      FROM "_prisma_migrations" 
      ORDER BY finished_at DESC
    `;
    
    console.log("Applied migrations:");
    for (const mig of migrations) {
      console.log(`  - ${mig.id}`);
    }
    
    console.log("\n✓ ALL CHECKS COMPLETE");
    
  } catch (error) {
    console.error("\n✗ ERROR:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
