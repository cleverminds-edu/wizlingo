import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CURRICULUM_UNITS = [
  // PRE-PRIMARY
  { gradeCategory: 'PREPRIMARY', pillar: 'SOUND_FOUNDATION', stage: 'STAGE_1', title: 'Letters & Alphabet', description: 'Letter recognition', skills: ['Letter Recognition'], sequence: 1 },
  // GR 1-3
  { gradeCategory: 'GR_1_3', pillar: 'SOUND_FOUNDATION', stage: 'STAGE_2', title: 'Phonics & Blending', description: 'Phonics rules', skills: ['Phonics'], sequence: 1 },
  { gradeCategory: 'GR_1_3', pillar: 'LANGUAGE_FOUNDATION', stage: 'STAGE_3', title: 'Words & Vocabulary', description: 'Vocabulary', skills: ['Vocabulary'], sequence: 1 },
  { gradeCategory: 'GR_1_3', pillar: 'LANGUAGE_FOUNDATION', stage: 'STAGE_4', title: 'Sentences & Grammar', description: 'Grammar', skills: ['Grammar'], sequence: 1 },
  // GR 4-7
  { gradeCategory: 'GR_4_7', pillar: 'CORE_SKILLS', stage: 'STAGE_5', title: 'Reading Fluency', description: 'Reading', skills: ['Reading'], sequence: 1 },
  { gradeCategory: 'GR_4_7', pillar: 'CORE_SKILLS', stage: 'STAGE_6', title: 'Listening Comprehension', description: 'Listening', skills: ['Listening'], sequence: 1 },
  { gradeCategory: 'GR_4_7', pillar: 'CORE_SKILLS', stage: 'STAGE_7', title: 'Speaking & Oral', description: 'Speaking', skills: ['Speaking'], sequence: 1 },
  { gradeCategory: 'GR_4_7', pillar: 'CORE_SKILLS', stage: 'STAGE_8', title: 'Writing Fundamentals', description: 'Writing', skills: ['Writing'], sequence: 1 },
  // GR 8-10
  { gradeCategory: 'GR_8_10', pillar: 'LANGUAGE_FOUNDATION', stage: 'STAGE_9', title: 'Advanced Grammar', description: 'Advanced grammar', skills: ['Advanced Grammar'], sequence: 1 },
  { gradeCategory: 'GR_8_10', pillar: 'COMMUNICATION', stage: 'STAGE_10', title: 'Communication Skills', description: 'Communication', skills: ['Communication'], sequence: 1 },
  { gradeCategory: 'GR_8_10', pillar: 'HIGHER_ORDER_LANGUAGE', stage: 'STAGE_11', title: 'Critical Thinking', description: 'Analysis & thinking', skills: ['Critical Thinking'], sequence: 1 },
  // GR 11-12
  { gradeCategory: 'GR_11_12', pillar: 'HIGHER_ORDER_LANGUAGE', stage: 'STAGE_12', title: 'Advanced Academic Writing', description: 'Academic writing', skills: ['Academic Writing'], sequence: 1 },
  { gradeCategory: 'GR_11_12', pillar: 'COMMUNICATION', stage: 'STAGE_13', title: 'Professional Communication', description: 'Professional comm', skills: ['Professional Communication'], sequence: 1 },
]

export async function POST(request: NextRequest) {
  try {
    let createdCount = 0
    let skipCount = 0

    for (const unit of CURRICULUM_UNITS) {
      try {
        const existing = await prisma.curriculumUnit.findFirst({
          where: {
            gradeCategory: unit.gradeCategory as any,
            pillar: unit.pillar as any,
            stage: unit.stage as any,
          }
        })

        if (existing) {
          skipCount++
          continue
        }

        await prisma.curriculumUnit.create({
          data: {
            gradeCategory: unit.gradeCategory as any,
            pillar: unit.pillar as any,
            stage: unit.stage as any,
            title: unit.title,
            description: unit.description,
            skills: unit.skills,
            sequence: unit.sequence,
            objectives: []
          }
        })

        createdCount++
      } catch (err) {
        console.error(`Error in unit ${unit.title}:`, err)
      }
    }

    return NextResponse.json({
      message: 'Curriculum seeded',
      created: createdCount,
      skipped: skipCount,
    })
  } catch (error) {
    console.error('Curriculum seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
