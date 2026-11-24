/**
 * Optimized Grade 1 Curriculum Generator
 * Designed for paid Anthropic accounts with:
 * - 5 requests per minute
 * - 4K output tokens per minute
 *
 * Strategy: Generate in order of token efficiency
 * 1. Vocabulary Sets (lowest tokens - ~500-800)
 * 2. Writing Prompts (medium - ~800-1200)
 * 3. Reading Passages (medium-high - ~1200-1500)
 * 4. Speaking Topics (high - ~1500-2000)
 * 5. Listening Stories (highest - ~1800-2500)
 *
 * With 12+ second delays, we stay within 5 req/min + 4K output tokens/min
 */

import fetch from 'node-fetch'

const API_BASE = process.env.API_BASE || 'http://localhost:5001'

// Grade 1 themes
const GRADE_1_THEMES = [
  { theme: 'Who Am I', unit: 1, difficulty: 4 },
  { theme: 'My Family', unit: 1, difficulty: 4 },
  { theme: 'Morning Routines', unit: 2, difficulty: 4 },
  { theme: 'School Day', unit: 2, difficulty: 4 },
  { theme: 'Fruits & Vegetables', unit: 3, difficulty: 4 },
  { theme: 'Meals & Food Items', unit: 3, difficulty: 4 },
  { theme: 'Domestic Animals', unit: 4, difficulty: 4 },
  { theme: 'Wild Animals', unit: 4, difficulty: 4 },
  { theme: 'Colors & Descriptions', unit: 5, difficulty: 4 },
  { theme: 'Numbers & Counting', unit: 5, difficulty: 4 },
  { theme: 'Clothing Items', unit: 6, difficulty: 4 },
  { theme: 'Sports & Exercise', unit: 6, difficulty: 4 },
]

// Content types ordered by token efficiency (lowest to highest)
const CONTENT_TYPES = [
  {
    type: 'vocabulary',
    endpoint: 'vocabulary-set',
    params: { word_count: 12, include_word_families: false },
    delay: 0, // Start immediately
  },
  {
    type: 'writing',
    endpoint: 'writing-prompt',
    params: { writing_type: 'descriptive', word_count_min: 30, word_count_max: 80 },
    delay: 13000, // 12+ seconds for rate limit
  },
  {
    type: 'reading',
    endpoint: 'reading-passage',
    params: { length: 'short', topics_focus: ['vocabulary', 'comprehension'] },
    delay: 13000,
  },
  {
    type: 'speaking',
    endpoint: 'speaking-topic',
    params: { scenario_type: 'dialogue', duration_minutes: 10 },
    delay: 13000,
  },
  {
    type: 'listening',
    endpoint: 'listening-story',
    params: { duration_seconds: 120, story_type: 'narrative' },
    delay: 13000,
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
  difficulty: number,
  additionalParams: Record<string, any> = {}
) {
  try {
    const url = `${API_BASE}/api/generate/${endpoint}`
    const payload = {
      theme,
      grade: 'Grade1',
      difficulty_level: difficulty,
      ...additionalParams,
    }

    console.log(`     📡 ${contentType.toUpperCase()}... `, { end: '' })

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
      console.log('✅')
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
    console.log(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
    generatedContent.push({
      theme,
      type: contentType,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 GRADE 1 OPTIMIZED CURRICULUM GENERATOR')
  console.log('='.repeat(60))
  console.log('\n📍 API Base: ' + API_BASE)
  console.log('📚 Generating: 12 Themes × 5 Content Types = 60 Pieces')
  console.log('⏱️  Rate Limit: 5 req/min, 4K output tokens/min')
  console.log('⏲️  Strategy: Token-efficient order (vocab → writing → reading → speaking → listening)')
  console.log('\n' + '-'.repeat(60))

  const startTime = Date.now()
  let lastRequestTime = startTime

  // Generate content by type (most efficient first)
  for (const contentTypeConfig of CONTENT_TYPES) {
    console.log(`\n📋 Generating ${contentTypeConfig.type.toUpperCase()} for all themes...`)
    console.log('-'.repeat(60))

    for (const themeConfig of GRADE_1_THEMES) {
      // Respect rate limit: 12+ seconds between requests
      const timeSinceLastRequest = Date.now() - lastRequestTime
      const delayNeeded = Math.max(0, 12000 - timeSinceLastRequest)

      if (delayNeeded > 0) {
        await new Promise(resolve => setTimeout(resolve, delayNeeded))
      }

      console.log(`${themeConfig.theme.padEnd(25)} `, { end: '' })
      await generateContent(
        contentTypeConfig.endpoint,
        contentTypeConfig.type,
        themeConfig.theme,
        themeConfig.difficulty,
        contentTypeConfig.params
      )

      lastRequestTime = Date.now()
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

  console.log(`\n✅ Successful: ${successful}/60 (${((successful / 60) * 100).toFixed(1)}%)`)
  console.log(`❌ Failed: ${failed}/60 (${((failed / 60) * 100).toFixed(1)}%)`)
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
