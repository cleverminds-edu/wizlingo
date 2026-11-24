import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const lessons = await prisma.lesson.findMany({
    include: {
      unit: true,
      contents: true,
      sessions: {
        select: {
          id: true,
          student: { select: { name: true } }
        }
      }
    },
    take: 20
  })

  console.log(`\n📚 Total Lessons Found: ${lessons.length}\n`)
  
  if (lessons.length === 0) {
    console.log('No lessons in database yet.')
  } else {
    lessons.forEach((lesson) => {
      console.log(`📖 ${lesson.title}`)
      console.log(`   Grade: ${lesson.unit?.gradeCategory || 'N/A'}`)
      console.log(`   Pillar: ${lesson.unit?.pillar || 'N/A'}`)
      console.log(`   Content Pieces: ${lesson.contents.length}`)
      console.log(`   Student Sessions: ${lesson.sessions.length}`)
      console.log(`   Created: ${lesson.createdAt.toLocaleString()}`)
      console.log()
    })
  }

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
