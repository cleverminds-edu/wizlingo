const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:password@localhost:5432/wizlingo_mvp'
});

async function main() {
  try {
    await client.connect();
    
    const lessonResult = await client.query('SELECT COUNT(*) FROM "Lesson"');
    const studentResult = await client.query('SELECT COUNT(*) FROM "Student"');
    const unitResult = await client.query('SELECT COUNT(*) FROM "CurriculumUnit"');

    console.log('\n📊 Database Status:');
    console.log(`  📖 Lessons: ${lessonResult.rows[0].count}`);
    console.log(`  🎓 Students: ${studentResult.rows[0].count}`);
    console.log(`  📚 Curriculum Units: ${unitResult.rows[0].count}`);

    if (parseInt(lessonResult.rows[0].count) > 0) {
      const lessonsResult = await client.query(
        'SELECT l.title, cu."gradeCategory" FROM "Lesson" l LEFT JOIN "CurriculumUnit" cu ON l."unitId" = cu.id LIMIT 5'
      );
      console.log('\n  📚 Sample Lessons:');
      lessonsResult.rows.forEach(row => {
        console.log(`    - ${row.title} (${row.gradeCategory || 'N/A'})`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
