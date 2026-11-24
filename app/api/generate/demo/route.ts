import { NextRequest, NextResponse } from 'next/server'

/**
 * Demo Content Generation Endpoint
 * Shows the structure of generated content without requiring API key
 * Useful for testing the UI and database integration
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, grade, difficulty_level, content_type } = body

    if (!theme || !grade || !difficulty_level || !content_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate sample data based on content type
    let data: any = {}

    switch (content_type) {
      case 'vocabulary':
        data = generateSampleVocabulary(theme, difficulty_level)
        break
      case 'reading':
        data = generateSampleReading(theme, difficulty_level)
        break
      case 'speaking':
        data = generateSampleSpeaking(theme, difficulty_level)
        break
      case 'writing':
        data = generateSampleWriting(theme, difficulty_level)
        break
      case 'listening':
        data = generateSampleListening(theme, difficulty_level)
        break
      default:
        return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        theme,
        grade,
        difficulty_level,
        content_type,
        generated_at: new Date().toISOString(),
        note: 'This is sample/demo data. Use real ANTHROPIC_API_KEY for production content generation.',
      },
    })
  } catch (error) {
    console.error('Demo generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateSampleVocabulary(theme: string, difficulty: number) {
  return {
    theme,
    vocabulary_set: [
      {
        word: 'example1',
        word_type: 'noun',
        definition: `A sample ${theme} noun for demonstration`,
        pronunciation: '[ig-ZA-mul]',
        example_sentence: `The ${theme} example is shown here.`,
        visual_description: 'A simple representation',
        related_words: ['demo', 'sample'],
        synonym: 'instance',
        antonym: 'reality',
        usage_frequency: 'common',
        difficulty_level: difficulty,
        category: theme,
      },
      {
        word: 'example2',
        word_type: 'verb',
        definition: `To demonstrate ${theme} action`,
        pronunciation: '[ig-ZA-min]',
        example_sentence: `We example the ${theme} lesson.`,
        visual_description: 'An action representation',
        related_words: ['show', 'display'],
        synonym: 'demonstrate',
        antonym: 'hide',
        usage_frequency: 'semi-common',
        difficulty_level: difficulty,
        category: theme,
      },
    ],
    theme_summary: `Sample vocabulary for ${theme} theme`,
    learning_strategy: 'Study one word per day using the example sentences',
    practice_activities: ['Flashcard matching', 'Word filling exercises'],
    assessment_ideas: ['Vocabulary quiz', 'Usage in sentences'],
  }
}

function generateSampleReading(theme: string, difficulty: number) {
  return {
    title: `The ${theme} Story - Sample`,
    passage: `This is a sample reading passage about ${theme}. Students at difficulty level ${difficulty} should understand this text easily. The passage introduces key vocabulary and concepts related to the theme. It follows a narrative structure with clear beginning, middle, and end. The text is engaging and age-appropriate for Grade 1 students learning about ${theme}.`,
    vocabulary_words: ['learn', 'explore', 'discover', 'understand'],
    key_grammar: ['simple present', 'present continuous'],
    comprehension_questions: [
      {
        id: 'q1',
        question: `What is this story about?`,
        type: 'multiple_choice',
        options: ['A. Cats', 'B. ' + theme, 'C. Dogs', 'D. Food'],
        correct_answer: 'B',
        difficulty: 'easy',
      },
      {
        id: 'q2',
        question: `What is the main character doing?`,
        type: 'multiple_choice',
        options: ['A. Playing', 'B. Sleeping', 'C. Learning', 'D. Running'],
        correct_answer: 'C',
        difficulty: 'medium',
      },
    ],
    word_count: 85,
    reading_time_minutes: 3,
    cultural_elements: ['everyday life', 'learning'],
    moral_lesson: 'Learning new things is fun and rewarding',
    vocabulary_difficulty: 'easy',
  }
}

function generateSampleSpeaking(theme: string, difficulty: number) {
  return {
    title: `Let's Talk About ${theme}`,
    scenario_type: 'dialogue',
    topic_description: `A conversation about ${theme} at difficulty level ${difficulty}`,
    learning_objectives: [
      'Use present tense to describe activities',
      'Answer questions about preferences',
      'Express opinions clearly',
    ],
    target_vocabulary: ['like', 'enjoy', 'prefer', 'think', 'because'],
    target_grammar: ['present tense', 'question formation', 'responses'],
    scenario: {
      setting: 'Classroom during English lesson',
      context: `Two students discussing ${theme}`,
      roles: {
        Student1: 'Asks questions about the theme',
        Student2: 'Answers and shares opinions',
      },
    },
    conversation_starters: [
      `Do you like ${theme}?`,
      `What do you think about ${theme}?`,
      `Can you tell me about ${theme}?`,
    ],
    follow_up_questions: [
      'Why do you like it?',
      'What is your favorite part?',
      'Have you ever done this?',
    ],
    example_dialogue: {
      Student1: `Do you like ${theme}?`,
      Student2: 'Yes, I really enjoy it!',
      Student1: 'Why do you like it?',
      Student2: 'Because it is fun and interesting.',
    },
    assessment_rubric: {
      pronunciation: 'Student pronounces most words clearly',
      vocabulary: 'Uses theme-related vocabulary appropriately',
      grammar: 'Constructs sentences with mostly correct grammar',
      fluency: 'Speaks with natural pace and hesitation',
    },
    extension_activities: ['Role-play interview', 'Group discussion'],
    duration_minutes: 15,
  }
}

function generateSampleWriting(theme: string, difficulty: number) {
  return {
    prompt_title: `Write About ${theme}`,
    writing_type: 'descriptive',
    prompt_text: `Think about ${theme}. Write a short description about what you see, feel, and think about it. Use the vocabulary words we learned. Try to make your writing colorful and interesting.`,
    target_word_count: {
      minimum: 30,
      maximum: 80,
    },
    learning_objectives: [
      'Use descriptive words appropriately',
      'Write in complete sentences',
      'Organize ideas logically',
    ],
    vocabulary_support: ['beautiful', 'interesting', 'happy', 'colorful', 'nice'],
    grammar_focus: ['adjectives', 'simple sentences', 'present tense'],
    planning_guide: {
      brainstorm_questions: [
        'What color is it?',
        'How does it feel?',
        'What can you do with it?',
      ],
      outline_template: '1. Introduction - What is it?\n2. Description - How does it look?\n3. Conclusion - Why do you like it?',
      sentence_starters: [
        'It is...',
        'I like...',
        'It has...',
        'I think...',
      ],
    },
    rubric: {
      content: 'Student writes about the theme clearly',
      organization: 'Writing follows a logical sequence',
      vocabulary: 'Uses appropriate descriptive words',
      grammar: 'Most sentences are grammatically correct',
      creativity: 'Adds interesting and unique details',
    },
    sample_response: `${theme} is very interesting. It is colorful and fun. I like to learn about ${theme} because it makes me happy. It is beautiful and important.`,
    common_mistakes: [
      'Forgetting capital letters at the start of sentences',
      'Using past tense instead of present',
      'Very short, incomplete sentences',
    ],
    revision_checklist: [
      'Does every sentence start with a capital letter?',
      'Did I use describing words?',
      'Are my sentences complete?',
      'Did I explain my ideas clearly?',
    ],
    difficulty_level: difficulty,
  }
}

function generateSampleListening(theme: string, difficulty: number) {
  return {
    title: `Listen About ${theme}`,
    story_type: 'narrative',
    theme: theme,
    duration_seconds: 120,
    script: [
      {
        speaker: 'Narrator',
        text: `Once upon a time, there was a wonderful ${theme}. `,
        tone: 'warm and engaging',
        sound_effects: ['background music start'],
        timing_seconds: 5,
      },
      {
        speaker: 'Narrator',
        text: `Every day, people would enjoy the ${theme} very much.`,
        tone: 'informative',
        sound_effects: ['ambient sounds'],
        timing_seconds: 8,
      },
      {
        speaker: 'Narrator',
        text: `And that is the story of ${theme}. The end.`,
        tone: 'conclusive',
        sound_effects: ['background music fade'],
        timing_seconds: 5,
      },
    ],
    production_notes: {
      background_music: 'Soft, instrumental, child-friendly',
      sound_effects_list: ['gentle ambience', 'nature sounds'],
      pronunciation_guide: {
        [theme]: '[pronunciation guide]',
      },
      character_descriptions: {
        Narrator: 'Clear, friendly, age-appropriate voice',
      },
    },
    comprehension_questions: [
      {
        question: `What is this story about?`,
        type: 'multiple_choice',
        options: ['A. Animals', 'B. ' + theme, 'C. Food', 'D. School'],
        correct_answer: 'B',
        difficulty: 'easy',
      },
      {
        question: `How do people feel about the ${theme}?`,
        type: 'multiple_choice',
        options: ['A. Sad', 'B. Happy', 'C. Tired', 'D. Scared'],
        correct_answer: 'B',
        difficulty: 'medium',
      },
    ],
    vocabulary_focus: ['story', 'wonderful', 'every', 'enjoy'],
    cultural_elements: ['storytelling tradition'],
    discussion_questions: [
      `Do you like ${theme}?`,
      'Why is this story important?',
      'What did you learn?',
    ],
    difficulty_level: difficulty,
  }
}
