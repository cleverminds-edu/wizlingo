#!/usr/bin/env npx ts-node

/**
 * CLI Script to Seed Grade 1 Content
 *
 * Usage:
 *   npx ts-node scripts/seed-grade-1.ts
 *   node scripts/seed-grade-1.js (after compilation)
 */

import { seedComprehensiveGrade1 } from '../lib/seed/comprehensive-grade-1-seeder'

async function main() {
  console.log('====================================')
  console.log('🌱 WizLingo Grade 1 Content Seeder')
  console.log('====================================\n')

  try {
    console.log('📊 Starting seeding process...')
    console.log('This will create:')
    console.log('  ✓ Curriculum unit for Grade 1')
    console.log('  ✓ 5 lesson modules')
    console.log('  ✓ Vocabulary, reading, speaking, writing, listening content')
    console.log('  ✓ Assessment questions and rubrics\n')

    const startTime = Date.now()

    const result = await seedComprehensiveGrade1()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log('\n====================================')
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!')
    console.log('====================================\n')

    console.log('📋 Summary:')
    console.log(`   Curriculum Unit ID: ${result.unit}`)
    console.log(`   Vocabulary Lesson: ${result.lessons.vocabulary}`)
    console.log(`   Reading Lesson: ${result.lessons.reading}`)
    console.log(`   Speaking Lesson: ${result.lessons.speaking}`)
    console.log(`   Writing Lesson: ${result.lessons.writing}`)
    console.log(`   Listening Lesson: ${result.lessons.listening}`)
    console.log(`   Duration: ${duration}s\n`)

    console.log('📝 Next Steps:')
    console.log('   1. Test Grade 1 content in the learning platform')
    console.log('   2. Verify reading passages display correctly')
    console.log('   3. Test speaking assessment')
    console.log('   4. Test writing validation')
    console.log('   5. Test listening comprehension\n')

    console.log('🚀 Your Grade 1 curriculum is ready to go!')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERROR DURING SEEDING:')
    console.error(error)
    console.error('\n⚠️ Troubleshooting:')
    console.error('   • Check database connection')
    console.error('   • Verify Prisma migrations are up to date')
    console.error('   • Check content JSON files exist in /content/')
    process.exit(1)
  }
}

main()
