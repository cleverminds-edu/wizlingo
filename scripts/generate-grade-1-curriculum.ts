/**
 * Grade 1 Curriculum Content Generator
 * Generates complete Grade 1 curriculum (24 lessons × 5 content types = 120 pieces)
 *
 * Execution: npm run generate:grade1
 */

import fetch from 'node-fetch'

const API_BASE = process.env.API_BASE || 'http://localhost:5001'

// Grade 1 Curriculum Structure (12 themes, 2 lessons per theme)
const GRADE_1_CURRICULUM = [
  {
    unit: 1,
    unitName: 'Personal Identity',
    themes: [
      {
        themeId: '1.1',
        theme: 'Who Am I',
        description: 'Self-introduction and personal identity',
        vocabulary: 'name, age, like, dislike, happy, sad',
        difficulty: 4,
      },
      {
        themeId: '1.2',
        theme: 'My Family',
        description: 'Family members and relationships',
        vocabulary: 'father, mother, brother, sister, grandpa, grandma',
        difficulty: 4,
      },
    ],
  },
  {
    unit: 2,
    unitName: 'Daily Life & Routines',
    themes: [
      {
        themeId: '2.1',
        theme: 'Morning Routines',
        description: 'Wake up, breakfast, going to school',
        vocabulary: 'morning, wake up, brush, wash, eat, drink',
        difficulty: 4,
      },
      {
        themeId: '2.2',
        theme: 'School Day',
        description: 'School activities, lessons, breaks',
        vocabulary: 'school, teacher, book, pen, play, lunch',
        difficulty: 4,
      },
    ],
  },
  {
    unit: 3,
    unitName: 'Food & Eating',
    themes: [
      {
        themeId: '3.1',
        theme: 'Fruits & Vegetables',
        description: 'Food names, colors, tastes',
        vocabulary: 'apple, banana, carrot, tomato, salad, healthy',
        difficulty: 4,
      },
      {
        themeId: '3.2',
        theme: 'Meals & Food Items',
        description: 'Different meals, food groups',
        vocabulary: 'breakfast, lunch, dinner, bread, milk, rice, eggs',
        difficulty: 4,
      },
    ],
  },
  {
    unit: 4,
    unitName: 'Animals & Nature',
    themes: [
      {
        themeId: '4.1',
        theme: 'Domestic Animals',
        description: 'Pets and farm animals',
        vocabulary: 'dog, cat, cow, horse, bird, animal sound',
        difficulty: 4,
      },
      {
        themeId: '4.2',
        theme: 'Wild Animals',
        description: 'Zoo animals and habitats',
        vocabulary: 'lion, tiger, elephant, monkey, zebra, jungle',
        difficulty: 4,
      },
    ],
  },
  {
    unit: 5,
    unitName: 'Colors & Numbers',
    themes: [
      {
        themeId: '5.1',
        theme: 'Colors & Descriptions',
        description: 'Color names and objects',
        vocabulary: 'red, blue, yellow, green, pink, color',
        difficulty: 4,
      },
      {
        themeId: '5.2',
        theme: 'Numbers & Counting',
        description: 'Numbers 1-100, counting, quantity',
        vocabulary: 'one, two, three, count, number, more, less',
        difficulty: 4,
      },
    ],
  },
  {
    unit: 6,
    unitName: 'Clothes & Health',
    themes: [
      {
        themeId: '6.1',
        theme: 'Clothing Items',
        description: 'Clothes and wearing them',
        vocabulary: 'shirt, pants, dress, shoe, hat, wear, dress up',
        difficulty: 4,
      },
      {
        themeId: '6.2',
        theme: 'Sports & Exercise',
        description: 'Sports, physical activities, games',
        vocabulary: 'play, run, jump, kick, ball, game, sport, exercise',
        difficulty: 4,
      },
    ],
  },
]

interface GeneratedContent {
  theme: string
  type: string
  status: 'success' | 'failed'
  data?: any
  error?: string
}

const generatedContent: GeneratedContent[] = []

async function generateContent(
  endpoint: string,
  contentType: string,
  theme: string,
  grade: string,
  difficulty: number,
  additionalParams: Record<string, any> = {}
) {
  try {
    const url = `${API_BASE}/api/generate/${endpoint}`
    const payload = {
      theme,
      grade,
      difficulty_level: difficulty,
      ...additionalParams,
    }

    console.log(`\n  📡 Generating ${contentType}...`)
    console.log(`     POST ${endpoint}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log(`     ✅ Generated successfully`)
      generatedContent.push({
        theme,
        type: contentType,
        status: 'success',
        data: result.data,
      })
      return result.data
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error(`     ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    generatedContent.push({
      theme,
      type: contentType,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

async function generateTheme(
  themeId: string,
  theme: string,
  vocabulary: string,
  difficulty: number
) {
  console.log(`\n🎯 Generating Theme: ${theme}`)
  console.log(`   Difficulty: ${difficulty}/20`)

  const contentParams = {
    reading: {
      length: 'short',
      topics_focus: ['vocabulary', 'comprehension'],
      reading_level: 'narrative',
    },
    speaking: {
      scenario_type: 'dialogue',
      duration_minutes: 10,
    },
    writing: {
      writing_type: 'descriptive',
      word_count_min: 30,
      word_count_max: 80,
    },
    vocabulary: {
      word_count: 12,
      include_word_families: false,
    },
    listening: {
      duration_seconds: 120,
      story_type: 'narrative',
    },
  }

  // Generate all 5 content types for this theme
  await generateContent(
    'vocabulary-set',
    'Vocabulary Set',
    theme,
    'Grade1',
    difficulty,
    contentParams.vocabulary
  )

  await generateContent(
    'reading-passage',
    'Reading Passage',
    theme,
    'Grade1',
    difficulty,
    contentParams.reading
  )

  await generateContent(
    'speaking-topic',
    'Speaking Topic',
    theme,
    'Grade1',
    difficulty,
    contentParams.speaking
  )

  await generateContent(
    'writing-prompt',
    'Writing Prompt',
    theme,
    'Grade1',
    difficulty,
    contentParams.writing
  )

  await generateContent(
    'listening-story',
    'Listening Story',
    theme,
    'Grade1',
    difficulty,
    contentParams.listening
  )
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 GRADE 1 CURRICULUM GENERATOR')
  console.log('='.repeat(60))
  console.log(`\n📍 API Base: ${API_BASE}`)
  console.log(`📚 Generating: 12 Themes × 5 Content Types = 60 Pieces`)
  console.log(`⏱️  Estimated Time: 5-10 minutes (API calls may take time)`)
  console.log('\n' + '-'.repeat(60))

  const startTime = Date.now()
  let themeCount = 0

  // Generate content for each theme
  for (const unit of GRADE_1_CURRICULUM) {
    console.log(`\n📖 UNIT ${unit.unit}: ${unit.unitName}`)
    console.log('─'.repeat(60))

    for (const themeConfig of unit.themes) {
      themeCount++
      await generateTheme(
        themeConfig.themeId,
        themeConfig.theme,
        themeConfig.vocabulary,
        themeConfig.difficulty
      )

      // Add strategic delay between themes to respect rate limits:
      // 5 requests/min = 12 seconds per request minimum
      // 4K output tokens/min means we need spacing for long responses
      await new Promise(resolve => setTimeout(resolve, 13000))
    }
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 GENERATION SUMMARY')
  console.log('='.repeat(60))

  const successful = generatedContent.filter(c => c.status === 'success').length
  const failed = generatedContent.filter(c => c.status === 'failed').length

  console.log(`\n✅ Successful: ${successful}/${generatedContent.length}`)
  console.log(`❌ Failed: ${failed}/${generatedContent.length}`)
  console.log(`⏱️  Total Time: ${duration} minutes`)

  if (failed > 0) {
    console.log(`\n⚠️  Failed Items:`)
    generatedContent
      .filter(c => c.status === 'failed')
      .forEach(c => {
        console.log(`   - ${c.theme} (${c.type}): ${c.error}`)
      })
  }

  console.log(`\n✨ Grade 1 Curriculum Generation Complete!`)
  console.log('='.repeat(60) + '\n')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
