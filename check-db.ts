import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const lessonCount = await prisma.lesson.count()
  const studentCount = await prisma.student.count()
  const unitCount = await prisma.curriculumUnit.count()

  console.log(`\n📊 Database Status:`)
  console.log(`  📖 Lessons: ${lessonCount}`)
  console.log(`  🎓 Students: ${studentCount}`)
  console.log(`  📚 Curriculum Units: ${unitCount}`)

  if (lessonCount > 0) {
    const lessons = await prisma.lesson.findMany({
      include: { unit: true },
      take: 5
    })
    console.log(`\n  Sample Lessons:`)
    lessons.forEach(l => {
      console.log(`    - ${l.title} (${l.unit?.gradeCategory})`)
    })
  }

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
