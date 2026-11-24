import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating test lessons...')

  // First, create or get a curriculum unit
  let unit = await prisma.curriculumUnit.findFirst()

  if (!unit) {
    unit = await prisma.curriculumUnit.create({
      data: {
        gradeCategory: 'GR_1_3',
        pillar: 'SOUND_FOUNDATION',
        stage: 'STAGE_1',
        title: 'Foundation Unit',
        description: 'Basic curriculum unit for testing',
        sequence: 1
      }
    })
    console.log('✅ Created curriculum unit')
  }

  // Create 13 lessons
  for (let i = 1; i <= 13; i++) {
    try {
      await prisma.lesson.create({
        data: {
          title: `Stage ${i} Lesson`,
          description: `Test lesson for stage ${i}`,
          sequence: i,
          estimatedMinutes: 15,
          unitId: unit.id,
          contents: {
            create: [
              {
                type: 'LESSON',
                sequence: 1,
                title: 'Lesson Content',
                content: {
                  text: `This is the lesson content for stage ${i}`
                }
              },
              {
                type: 'EXERCISE',
                sequence: 2,
                title: 'Exercise',
                content: {
                  passage: 'Read this passage carefully and answer the questions below.',
                  questions: [
                    {
                      id: `q${i}_1`,
                      type: 'multiple_choice',
                      question: 'What is the correct answer?',
                      options: {
                        a: 'Option A',
                        b: 'Option B (correct)',
                        c: 'Option C',
                        d: 'Option D'
                      },
                      points: 10
                    },
                    {
                      id: `q${i}_2`,
                      type: 'true_false',
                      question: 'True or False?',
                      points: 10
                    }
                  ]
                }
              },
              {
                type: 'ASSESSMENT',
                sequence: 3,
                title: 'Assessment',
                content: {
                  passage: 'Assessment passage',
                  questions: [
                    {
                      id: `q${i}_3`,
                      type: 'text_match',
                      question: 'Type your answer:',
                      points: 10
                    }
                  ]
                }
              }
            ]
          }
        }
      })
      console.log(`✅ Created: Lesson ${i}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Skipped: Lesson ${i} (already exists)`)
      } else {
        console.error(`❌ Error creating lesson ${i}:`, error.message)
      }
    }
  }

  console.log('✅ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
