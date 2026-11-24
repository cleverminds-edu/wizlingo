import { prisma } from '@/lib/prisma'
import { ContentType, GradeCategory, LearningPillar, ProgressionStage } from '@prisma/client'
import grade1Vocab from '@/content/grade-1-vocabulary.json'
import grade1Reading from '@/content/grade-1-reading-passages.json'
import grade1Speaking from '@/content/grade-1-speaking-topics.json'
import grade1Writing from '@/content/grade-1-writing-prompts.json'
import grade1Listening from '@/content/grade-1-listening-content.json'

/**
 * Comprehensive Grade 1 Curriculum Seeder
 * Creates complete curriculum unit structure with lessons and content
 */

export async function seedComprehensiveGrade1() {
  console.log('🌱 Starting comprehensive Grade 1 seeding...')

  try {
    // 1. Create or get curriculum unit for Grade 1
    const unit = await prisma.curriculumUnit.upsert({
      where: {
        gradeCategory_pillar_stage_sequence: {
          gradeCategory: GradeCategory.GR_1_3,
          pillar: LearningPillar.SOUND_FOUNDATION,
          stage: ProgressionStage.STAGE_1,
          sequence: 1
        }
      },
      create: {
        gradeCategory: GradeCategory.GR_1_3,
        pillar: LearningPillar.SOUND_FOUNDATION,
        stage: ProgressionStage.STAGE_1,
        sequence: 1,
        title: 'Grade 1: Foundations of English',
        description: 'Building phonemic awareness, vocabulary, and basic communication skills',
        skills: ['Phonemic Awareness', 'Basic Vocabulary', 'Sound Production', 'Word Recognition'],
        objectives: [
          'Identify and produce all English phonemes',
          'Master 200-300 core vocabulary words',
          'Develop listening comprehension',
          'Produce simple 2-3 word phrases'
        ]
      },
      update: {}
    })

    console.log(`✅ Curriculum unit ready: ${unit.id}`)

    // 2. Create lessons for each skill area
    console.log('\n📚 Creating lesson structure...')

    // Vocabulary Lesson
    const vocabLesson = await createOrUpdateLesson(unit.id, {
      title: 'Vocabulary Mastery - Grade 1',
      description: 'Core vocabulary words for Grade 1',
      sequence: 1,
      estimatedMinutes: 15
    })

    // Reading Lesson
    const readingLesson = await createOrUpdateLesson(unit.id, {
      title: 'Reading Comprehension - Grade 1',
      description: 'Simple passages with comprehension questions',
      sequence: 2,
      estimatedMinutes: 15
    })

    // Speaking Lesson
    const speakingLesson = await createOrUpdateLesson(unit.id, {
      title: 'Speaking Practice - Grade 1',
      description: 'Speaking topics and pronunciation practice',
      sequence: 3,
      estimatedMinutes: 15
    })

    // Writing Lesson
    const writingLesson = await createOrUpdateLesson(unit.id, {
      title: 'Writing Practice - Grade 1',
      description: 'Writing prompts with guided feedback',
      sequence: 4,
      estimatedMinutes: 15
    })

    // Listening Lesson
    const listeningLesson = await createOrUpdateLesson(unit.id, {
      title: 'Listening Comprehension - Grade 1',
      description: 'Audio stories with comprehension questions',
      sequence: 5,
      estimatedMinutes: 15
    })

    console.log('✅ Lessons created')

    // 3. Add content to each lesson
    console.log('\n📝 Adding vocabulary content...')
    await addVocabularyContent(vocabLesson.id, grade1Vocab)

    console.log('📖 Adding reading content...')
    await addReadingContent(readingLesson.id, grade1Reading)

    console.log('🎤 Adding speaking content...')
    await addSpeakingContent(speakingLesson.id, grade1Speaking)

    console.log('✏️ Adding writing content...')
    await addWritingContent(writingLesson.id, grade1Writing)

    console.log('🎧 Adding listening content...')
    await addListeningContent(listeningLesson.id, grade1Listening)

    console.log('\n🎉 Comprehensive Grade 1 seeding complete!')

    return {
      success: true,
      unit: unit.id,
      lessons: {
        vocabulary: vocabLesson.id,
        reading: readingLesson.id,
        speaking: speakingLesson.id,
        writing: writingLesson.id,
        listening: listeningLesson.id
      }
    }
  } catch (error) {
    console.error('❌ Error in comprehensive seeding:', error)
    throw error
  }
}

/**
 * Create or update a lesson
 */
async function createOrUpdateLesson(unitId: string, data: any) {
  return await prisma.lesson.upsert({
    where: { id: `lesson_${unitId}_${data.sequence}` || `lesson_${data.title.replace(/\s+/g, '_')}` },
    create: {
      unitId,
      ...data
    },
    update: {}
  }).catch(() => {
    // If unique constraint fails, just create new
    return prisma.lesson.create({
      data: {
        unitId,
        ...data
      }
    })
  })
}

/**
 * Add vocabulary content to lesson
 */
async function addVocabularyContent(lessonId: string, data: any) {
  const vocabularyList = data.vocabulary

  // 1. Vocabulary Introduction - Study phase
  await prisma.lessonContent.create({
    data: {
      lessonId,
      type: ContentType.LESSON,
      sequence: 1,
      title: 'Vocabulary Introduction',
      description: `Learn ${vocabularyList.length} core vocabulary words`,
      content: {
        type: 'vocabulary_list',
        words: vocabularyList.map((w: any) => ({
          word: w.word,
          definition: w.definition,
          pronunciation: w.pronunciation,
          exampleSentence: w.exampleSentence,
          category: w.category,
          imageTopic: w.imageTopic
        }))
      },
      isGraded: false,
      passingScore: 0
    }
  })

  // 2. Vocabulary Pronunciation Practice - Speaking phase
  const pronunciationQuestions = vocabularyList.slice(0, 10).map((w: any, idx: number) => ({
    id: `vocab-pron-${idx}`,
    type: 'speaking',
    question: `Say the word: "${w.word}"`,
    instructions: `Pronounce this word clearly. Target pronunciation: ${w.pronunciation}`,
    expectedAnswer: w.word
  }))

  await prisma.lessonContent.create({
    data: {
      lessonId,
      type: ContentType.SPEAKING,
      sequence: 2,
      title: 'Vocabulary Pronunciation Practice',
      description: 'Practice pronouncing vocabulary words correctly',
      content: {
        type: 'vocabulary_pronunciation',
        instructions: 'Record yourself saying each word. Try to match the target pronunciation.',
        vocabularyWords: vocabularyList.slice(0, 10).map((w: any) => ({
          word: w.word,
          pronunciation: w.pronunciation,
          category: w.category
        })),
        questions: pronunciationQuestions
      },
      isGraded: true,
      passingScore: 75
    }
  })

  // 3. Vocabulary Meaning Quiz - Assessment phase
  const meaningQuestions = generateVocabularyQuiz(vocabularyList.slice(0, 10))

  await prisma.lessonContent.create({
    data: {
      lessonId,
      type: ContentType.ASSESSMENT,
      sequence: 3,
      title: 'Vocabulary Meaning Quiz',
      description: 'Test your understanding of vocabulary definitions',
      content: {
        type: 'vocabulary_quiz',
        instructions: 'Select the correct definition for each word',
        questions: meaningQuestions
      },
      isGraded: true,
      passingScore: 80
    }
  })
}

/**
 * Generate vocabulary quiz questions from word list
 */
function generateVocabularyQuiz(words: any[]) {
  return words.map((word: any, idx: number) => {
    // Get correct answer index
    const correctIdx = 0

    // Create distractor options (wrong answers)
    const distractors = words
      .filter((_: any, i: number) => i !== idx)
      .slice(0, 3)
      .map((w: any) => w.definition)

    // Shuffle options and track correct answer position
    const allOptions = [word.definition, ...distractors]
    const correctAnswerIndex = 0 // First option is always correct before shuffle

    // Fisher-Yates shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]]
      if (i === correctAnswerIndex) {
        // Don't actually update - just track that position moved
      }
    }

    // Find where correct answer ended up after shuffle
    const newCorrectIdx = allOptions.indexOf(word.definition)

    return {
      id: `vocab-quiz-${idx}`,
      type: 'multiple_choice',
      question: `What does "${word.word}" mean?`,
      options: Object.fromEntries(
        allOptions.map((opt: string, i: number) => [i.toString(), opt])
      ),
      correctAnswer: newCorrectIdx.toString(),
      points: 10
    }
  })
}

/**
 * Add reading content to lesson
 */
async function addReadingContent(lessonId: string, data: any) {
  for (const passage of data.passages) {
    // Process questions to ensure they have proper type field and options format
    const processedQuestions = passage.comprehensionQuestions.map((q: any) => {
      // Convert options array to object with numeric keys {0: option1, 1: option2, ...}
      const optionsObj = q.options
        ? Object.fromEntries(q.options.map((opt: string, idx: number) => [idx.toString(), opt]))
        : undefined

      // Find the index of the correct answer in the options array
      let correctAnswerIndex = q.correctAnswer
      if (q.options && typeof q.correctAnswer === 'string') {
        const idx = q.options.indexOf(q.correctAnswer)
        correctAnswerIndex = idx >= 0 ? idx.toString() : q.correctAnswer
      }

      return {
        ...q,
        id: q.id || `q-${Math.random().toString(36).substr(2, 9)}`,
        type: q.options ? 'multiple_choice' : 'text_match', // Use multiple_choice if has options, else text_match
        options: optionsObj, // Use converted options object
        correctAnswer: correctAnswerIndex // Use index as correctAnswer for multiple choice
      }
    })

    await prisma.lessonContent.create({
      data: {
        lessonId,
        type: ContentType.ASSESSMENT,
        sequence: data.passages.indexOf(passage) + 1,
        title: passage.title,
        description: `${passage.wordCount} words, Reading Level: ${passage.readingLevel}`,
        content: {
          type: 'reading_passage',
          passage: passage.content,
          wordCount: passage.wordCount,
          readingLevel: passage.readingLevel,
          estimatedWPM: passage.estimatedWPM,
          keyVocabulary: passage.keyVocabulary,
          questions: processedQuestions
        },
        isGraded: true,
        passingScore: 75
      }
    })
  }
}

/**
 * Add speaking content to lesson
 */
async function addSpeakingContent(lessonId: string, data: any) {
  for (const topic of data.speakingTopics) {
    await prisma.lessonContent.create({
      data: {
        lessonId,
        type: ContentType.SPEAKING,
        sequence: data.speakingTopics.indexOf(topic) + 1,
        title: topic.title,
        description: `${topic.expectedResponseLength}, Difficulty: ${topic.difficulty}`,
        content: {
          type: 'speaking_prompt',
          prompt: topic.prompt,
          difficulty: topic.difficulty,
          expectedResponseLength: topic.expectedResponseLength,
          estimatedTimeSeconds: topic.estimatedTimeSeconds,
          keyVocabulary: topic.keyVocabulary,
          sampleResponse: topic.sampleResponse,
          pronunciationFocus: topic.pronunciationFocus,
          assessmentCriteria: topic.assessmentCriteria
        },
        isGraded: true,
        passingScore: 75
      }
    })
  }
}

/**
 * Add writing content to lesson
 */
async function addWritingContent(lessonId: string, data: any) {
  for (const prompt of data.writingPrompts) {
    await prisma.lessonContent.create({
      data: {
        lessonId,
        type: ContentType.WRITING,
        sequence: data.writingPrompts.indexOf(prompt) + 1,
        title: prompt.title,
        description: `${prompt.wordCountTarget.minimum}-${prompt.wordCountTarget.maximum} words, Difficulty: ${prompt.difficulty}`,
        content: {
          type: 'writing_prompt',
          prompt: prompt.prompt,
          difficulty: prompt.difficulty,
          wordCountTarget: prompt.wordCountTarget,
          estimatedTimeMinutes: prompt.estimatedTimeMinutes,
          keyVocabulary: prompt.keyVocabulary,
          sampleResponse: prompt.sampleResponse,
          rubric: prompt.rubric
        },
        isGraded: true,
        passingScore: 75
      }
    })
  }
}

/**
 * Add listening content to lesson
 */
async function addListeningContent(lessonId: string, data: any) {
  for (const content of data.listeningContent) {
    await prisma.lessonContent.create({
      data: {
        lessonId,
        type: ContentType.LISTENING,
        sequence: data.listeningContent.indexOf(content) + 1,
        title: content.title,
        description: `${content.duration_seconds} seconds, Reading Level: ${content.readingLevel}`,
        content: {
          type: 'listening_clip',
          transcript: content.transcript,
          durationSeconds: content.duration_seconds,
          readingLevel: content.readingLevel,
          keyVocabulary: content.keyVocabulary,
          backgroundInfo: content.backgroundInfo,
          questions: content.comprehensionQuestions,
          audioUrl: `https://example.com/audio/${content.id}.mp3` // Placeholder
        },
        isGraded: true,
        passingScore: 75,
        mediaUrl: `https://example.com/audio/${content.id}.mp3`
      }
    })
  }
}

export default seedComprehensiveGrade1
