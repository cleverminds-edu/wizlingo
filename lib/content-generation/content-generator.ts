import { Anthropic } from '@anthropic-ai/sdk'

// Initialize Anthropic client with API key
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.warn('⚠️ ANTHROPIC_API_KEY not set. Content generation will fail.')
}

const anthropic = new Anthropic({
  apiKey: apiKey || 'sk-placeholder',
})

/**
 * Content Generation Service
 * Generates curriculum content using Claude AI
 */

export interface ReadingPassageInput {
  theme: string
  grade: string
  difficulty_level: number
  length: 'short' | 'medium' | 'long'
  topics_focus?: string[]
  reading_level?: 'narrative' | 'informational' | 'descriptive'
}

export interface SpeakingTopicInput {
  theme: string
  grade: string
  difficulty_level: number
  scenario_type: 'dialogue' | 'presentation' | 'discussion' | 'description'
  duration_minutes?: number
  vocabulary_set?: string[]
}

export interface WritingPromptInput {
  theme: string
  grade: string
  difficulty_level: number
  writing_type: 'narrative' | 'descriptive' | 'persuasive' | 'expository' | 'poetic'
  word_count_min?: number
  word_count_max?: number
  grammatical_focus?: string[]
}

export interface VocabularySetInput {
  theme: string
  grade: string
  difficulty_level: number
  word_count: number
  vocabulary_types?: string[]
  include_word_families?: boolean
}

export interface ListeningStoryInput {
  theme: string
  grade: string
  difficulty_level: number
  duration_seconds: number
  story_type: 'narrative' | 'informational' | 'dialogue' | 'poem'
  vocabulary_set?: string[]
}

// Reading Passage Generator
export async function generateReadingPassage(input: ReadingPassageInput) {
  const gradeLevel = getGradeInfo(input.grade)
  const lengthGuide = {
    short: '50-100',
    medium: '100-200',
    long: '200-400',
  }

  const prompt = `You are an expert English language curriculum designer. Generate an engaging reading passage for ${input.grade} (age ${gradeLevel.age}) students.

REQUIREMENTS:
- Theme: ${input.theme}
- Reading Level: ${input.reading_level || 'narrative'}
- Target Length: ${lengthGuide[input.length]} words
- Difficulty Level: ${input.difficulty_level}/20
- Pedagogical Focus: ${input.topics_focus?.join(', ') || 'vocabulary building, comprehension'}
- Age-appropriate content and scenarios
- Include cultural relevance for Indian context where appropriate
- Create engaging characters and relatable situations
- Clear beginning, middle, and end

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "title": "...",
  "passage": "...",
  "vocabulary_words": ["word1", "word2", ...],
  "key_grammar": ["tense1", "structure1", ...],
  "comprehension_questions": [
    {
      "id": "q1",
      "question": "...",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "difficulty": "easy"
    }
  ],
  "word_count": number,
  "reading_time_minutes": number,
  "cultural_elements": ["..."],
  "moral_lesson": "...",
  "vocabulary_difficulty": "easy|medium|hard"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse JSON response
    const jsonText = content.text.trim()
    const result = JSON.parse(jsonText)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Reading passage generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Speaking Topic Generator
export async function generateSpeakingTopic(input: SpeakingTopicInput) {
  const gradeLevel = getGradeInfo(input.grade)

  const prompt = `You are an expert language instructor. Create an engaging speaking activity for ${input.grade} (age ${gradeLevel.age}) students.

REQUIREMENTS:
- Theme: ${input.theme}
- Scenario Type: ${input.scenario_type}
- Expected Duration: ${input.duration_minutes || 15} minutes
- Difficulty Level: ${input.difficulty_level}/20
- Vocabulary Focus: ${input.vocabulary_set?.join(', ') || 'theme-related'}
- Age-appropriate scenarios
- Real-world communication situations
- Indian cultural context integration
- Clear scaffolding for lower levels

Return ONLY valid JSON (no markdown) with this structure:
{
  "title": "...",
  "scenario_type": "${input.scenario_type}",
  "topic_description": "...",
  "learning_objectives": ["obj1", "obj2", ...],
  "target_vocabulary": ["word1", "word2", ...],
  "target_grammar": ["grammar1", "grammar2", ...],
  "scenario": {
    "setting": "...",
    "context": "...",
    "roles": {"role1": "description", ...}
  },
  "conversation_starters": ["starter1", "starter2", ...],
  "follow_up_questions": ["question1", "question2", ...],
  "example_dialogue": {
    "Speaker1": "...",
    "Speaker2": "...",
    "Speaker1": "...",
    "Speaker2": "..."
  },
  "assessment_rubric": {
    "pronunciation": "...",
    "vocabulary": "...",
    "grammar": "...",
    "fluency": "..."
  },
  "extension_activities": ["activity1", "activity2", ...],
  "duration_minutes": number
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const result = JSON.parse(content.text.trim())
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Speaking topic generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Writing Prompt Generator
export async function generateWritingPrompt(input: WritingPromptInput) {
  const gradeLevel = getGradeInfo(input.grade)
  const wordCountMin = input.word_count_min || 50
  const wordCountMax = input.word_count_max || 200

  const prompt = `You are an expert writing teacher. Create an engaging writing prompt for ${input.grade} (age ${gradeLevel.age}) students.

REQUIREMENTS:
- Theme: ${input.theme}
- Writing Type: ${input.writing_type}
- Difficulty Level: ${input.difficulty_level}/20
- Target Word Count: ${wordCountMin}-${wordCountMax} words
- Grammar Focus: ${input.grammatical_focus?.join(', ') || 'general'}
- Clear, inspiring prompt
- Age-appropriate expectations
- Indian relevance and cultural sensitivity
- Multiple scaffolding options
- Clear success criteria

Return ONLY valid JSON (no markdown) with this structure:
{
  "prompt_title": "...",
  "writing_type": "${input.writing_type}",
  "prompt_text": "...",
  "target_word_count": {
    "minimum": ${wordCountMin},
    "maximum": ${wordCountMax}
  },
  "learning_objectives": ["obj1", "obj2", ...],
  "vocabulary_support": ["word1", "word2", ...],
  "grammar_focus": ["grammar1", "grammar2", ...],
  "planning_guide": {
    "brainstorm_questions": ["q1", "q2", ...],
    "outline_template": "...",
    "sentence_starters": ["starter1", "starter2", ...]
  },
  "rubric": {
    "content": "description",
    "organization": "description",
    "vocabulary": "description",
    "grammar": "description",
    "creativity": "description"
  },
  "sample_response": "...",
  "common_mistakes": ["mistake1", "mistake2", ...],
  "revision_checklist": ["item1", "item2", ...],
  "difficulty_level": ${input.difficulty_level}
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const result = JSON.parse(content.text.trim())
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Writing prompt generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Vocabulary Set Generator
export async function generateVocabularySet(input: VocabularySetInput) {
  const gradeLevel = getGradeInfo(input.grade)

  const prompt = `You are a vocabulary curriculum expert. Create a comprehensive vocabulary set for ${input.grade} (age ${gradeLevel.age}) students.

REQUIREMENTS:
- Theme: ${input.theme}
- Difficulty Level: ${input.difficulty_level}/20
- Number of Words: ${input.word_count}
- Vocabulary Types: ${input.vocabulary_types?.join(', ') || 'mixed'}
- Include Word Forms: ${input.include_word_families ? 'yes' : 'no'}
- Age-appropriate selections
- High-frequency and useful words
- Clear, simple definitions
- Relevant example sentences
- Pronunciation guides (phonetic)
- Cultural connections where relevant

Return ONLY valid JSON (no markdown) with this structure:
{
  "theme": "${input.theme}",
  "vocabulary_set": [
    {
      "word": "...",
      "word_type": "noun|verb|adjective|adverb|phrase",
      "definition": "...",
      "pronunciation": "[phonetic]",
      "example_sentence": "...",
      "visual_description": "...",
      "related_words": ["word1", "word2"],
      "synonym": "...",
      "antonym": "...",
      "usage_frequency": "common|semi-common|rare",
      "difficulty_level": ${input.difficulty_level},
      "category": "..."
    }
  ],
  "theme_summary": "...",
  "learning_strategy": "...",
  "practice_activities": ["activity1", "activity2", ...],
  "assessment_ideas": ["assessment1", "assessment2", ...]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const result = JSON.parse(content.text.trim())
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Vocabulary generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Listening Story Generator
export async function generateListeningStory(input: ListeningStoryInput) {
  const gradeLevel = getGradeInfo(input.grade)

  const prompt = `You are an expert audio content creator. Write a listening script for ${input.grade} (age ${gradeLevel.age}) students.

REQUIREMENTS:
- Theme: ${input.theme}
- Story Type: ${input.story_type}
- Duration: ~${input.duration_seconds} seconds
- Difficulty Level: ${input.difficulty_level}/20
- Vocabulary Focus: ${input.vocabulary_set?.join(', ') || 'theme-related'}
- Engaging storytelling
- Clear, natural pace
- Age-appropriate content
- Sound effect suggestions
- Comprehension questions included
- Background music suggestions

Return ONLY valid JSON (no markdown) with this structure:
{
  "title": "...",
  "story_type": "${input.story_type}",
  "theme": "${input.theme}",
  "duration_seconds": ${input.duration_seconds},
  "script": [
    {
      "speaker": "Narrator|Character",
      "text": "...",
      "tone": "...",
      "sound_effects": ["effect1", "effect2"],
      "timing_seconds": number
    }
  ],
  "production_notes": {
    "background_music": "...",
    "sound_effects_list": ["effect1", "effect2", ...],
    "pronunciation_guide": {"word": "[pronunciation]", ...},
    "character_descriptions": {"Character": "description", ...}
  },
  "comprehension_questions": [
    {
      "question": "...",
      "type": "multiple_choice|true_false|short_answer",
      "options": ["opt1", "opt2", "opt3"],
      "correct_answer": "opt1",
      "difficulty": "easy|medium|hard"
    }
  ],
  "vocabulary_focus": ["word1", "word2", ...],
  "cultural_elements": ["element1", "element2", ...],
  "discussion_questions": ["q1", "q2", ...],
  "difficulty_level": ${input.difficulty_level}
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const result = JSON.parse(content.text.trim())
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Listening story generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper function to get grade information
function getGradeInfo(grade: string): { age: string; level: number } {
  const gradeMap: Record<string, { age: string; level: number }> = {
    'Nursery': { age: '3-4', level: 1 },
    'KG': { age: '4-5', level: 2 },
    'Grade1': { age: '6-7', level: 4 },
    'Grade2': { age: '7-8', level: 5 },
    'Grade3': { age: '8-9', level: 7 },
    'Grade4': { age: '9-10', level: 8 },
    'Grade5': { age: '10-11', level: 10 },
    'Grade6': { age: '11-12', level: 11 },
    'Grade7': { age: '12-13', level: 13 },
    'Grade8': { age: '13-14', level: 14 },
    'Grade9': { age: '14-15', level: 16 },
    'Grade10': { age: '15-16', level: 17 },
    'Grade11': { age: '16-17', level: 19 },
    'Grade12': { age: '17-18', level: 20 },
  }
  return gradeMap[grade] || { age: 'unknown', level: 1 }
}

export default {
  generateReadingPassage,
  generateSpeakingTopic,
  generateWritingPrompt,
  generateVocabularySet,
  generateListeningStory,
}
