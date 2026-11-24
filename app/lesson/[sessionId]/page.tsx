'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTokenFromStorage } from '@/lib/auth-client'
import VoiceRecorder from './components/VoiceRecorder'
import AudioPlayer from './components/AudioPlayer'
import WritingEditor from './components/WritingEditor'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'text_match' | 'speaking'
  question: string
  expectedAnswer?: string
  options?: Record<string, string>
  points?: number
}

interface LessonContent {
  id: string
  type: string
  sequence: number
  title: string
  content: {
    text?: string
    passage?: string
    questions?: Question[]
    instructions?: string
  }
  mediaUrl?: string | null
}

interface LessonData {
  sessionId: string
  lessonId: string
  lesson: {
    id: string
    title: string
    description?: string
    estimatedMinutes: number
    contents: LessonContent[]
  }
  timing: {
    startedAt: string
    expiresAt: string
  }
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  // State management
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Fetch lesson content on mount
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = getTokenFromStorage()
        if (!token) {
          setError('Unauthorized: Please log in')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        // Fetch the existing session using the sessionId from the URL
        const response = await fetch(`/api/lesson/session/${sessionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to load lesson')
        }

        const data = await response.json()
        setLesson(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
        setLoading(false)
      }
    }

    fetchLesson()
  }, [sessionId, router])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!lesson) return

    setSubmitting(true)
    try {
      const token = getTokenFromStorage()
      if (!token) {
        setError('Unauthorized: Session expired')
        return
      }

      const response = await fetch(
        `/api/lesson/session/${lesson.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ responses: answers })
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit answers')
      }

      const resultData = await response.json()
      // Store results in localStorage for results page
      localStorage.setItem(`lessonResults_${lesson.sessionId}`, JSON.stringify(resultData))

      // Redirect to results page
      router.push(`/lesson/${lesson.sessionId}/results`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const currentContent = lesson?.lesson.contents[currentContentIndex]
  const totalContent = lesson?.lesson.contents.length || 0
  const progress = totalContent > 0 ? ((currentContentIndex + 1) / totalContent) * 100 : 0
  const allQuestionsAnswered = lesson?.lesson.contents
    .flatMap(c => c.content.questions || [])
    .every(q => answers[q.id] !== undefined) ?? false

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!lesson || !currentContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-gray-600">No lesson content found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{lesson.lesson.title}</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              {currentContentIndex + 1} / {totalContent}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Content Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentContent.title}
          </h2>

          {/* Lesson Content */}
          {currentContent.type === 'LESSON' && (
            <div className="space-y-6">
              {currentContent.content.text && (
                <div className="prose max-w-none text-gray-700">
                  <p className="text-lg leading-relaxed">{currentContent.content.text}</p>
                </div>
              )}

              {/* Vocabulary List */}
              {currentContent.content.type === 'vocabulary_list' && currentContent.content.words && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-2">📖 Vocabulary Learning</h3>
                    <p className="text-blue-100 text-lg">Read and study each word carefully:</p>
                    <ul className="mt-4 space-y-2 text-blue-100">
                      <li>✓ Read the word and definition</li>
                      <li>✓ Listen to the pronunciation (🔊)</li>
                      <li>✓ Study the example sentence</li>
                      <li>✓ Try to remember each word for the practice section</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentContent.content.words.map((word: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-l-4 border-blue-500 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-indigo-900">{word.word}</h3>
                          <span className="text-sm bg-indigo-200 text-indigo-800 px-2 py-1 rounded font-medium">
                            {word.category}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 font-medium">{word.definition}</p>
                        {word.exampleSentence && (
                          <div className="bg-white bg-opacity-60 rounded p-3 mb-2">
                            <p className="text-sm text-gray-600 italic">"{word.exampleSentence}"</p>
                          </div>
                        )}
                        {word.pronunciation && (
                          <div className="text-sm text-blue-600 font-semibold">
                            🔊 {word.pronunciation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exercise/Assessment */}
          {(currentContent.type === 'EXERCISE' || currentContent.type === 'ASSESSMENT') && (
            <div className="space-y-8">
              {currentContent.content.passage && (
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed italic">
                    {currentContent.content.passage}
                  </p>
                </div>
              )}

              {/* Vocabulary Matching Exercise */}
              {currentContent.content.type === 'vocabulary_matching' && currentContent.content.words && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-2">🎯 Vocabulary Practice</h3>
                    <p className="text-green-100 text-lg mb-4">Test your vocabulary knowledge! Try these practice methods:</p>
                    <ul className="space-y-2 text-green-100">
                      <li>✓ <strong>Cover & Guess:</strong> Hide the definitions and guess each word's meaning</li>
                      <li>✓ <strong>Pronunciation Practice:</strong> Say each word out loud using the pronunciation guide</li>
                      <li>✓ <strong>Sentence Builder:</strong> Create your own sentences using these words</li>
                      <li>✓ <strong>Memory Check:</strong> Close your eyes and recall as many words as you can</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-6">📚 Vocabulary Words Reference</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentContent.content.words.map((word: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition"
                        >
                          <div className="mb-3">
                            <h5 className="text-lg font-bold text-green-900">{word.word}</h5>
                            <p className="text-sm text-green-700 font-medium mt-1">{word.definition}</p>
                          </div>
                          {word.exampleSentence && (
                            <div className="bg-white bg-opacity-70 rounded p-2 mb-2 text-sm text-gray-600 italic">
                              "{word.exampleSentence}"
                            </div>
                          )}
                          <div className="text-sm text-green-600 font-semibold">
                            🔊 {word.pronunciation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border-l-4 border-amber-500">
                    <h4 className="font-bold text-amber-900 mb-3">💡 Tips for Mastery</h4>
                    <ul className="space-y-2 text-sm text-amber-900">
                      <li>📝 <strong>Write it:</strong> Writing words helps your brain remember them better</li>
                      <li>🗣️ <strong>Say it:</strong> Speak the words and example sentences out loud</li>
                      <li>🔄 <strong>Repeat:</strong> Practice daily - repetition is key to long-term memory</li>
                      <li>🎨 <strong>Use it:</strong> Try using these words in your own sentences</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {currentContent.content.questions?.map((question, idx) => (
                  <div key={question.id} className="border-b pb-6 last:border-b-0">
                    <label className="block mb-4">
                      <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Question {idx + 1}
                      </span>
                      <p className="text-lg font-medium text-gray-800 mt-2">
                        {question.question}
                      </p>
                    </label>

                    {/* Multiple Choice */}
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3 ml-4">
                        {Object.entries(question.options || {}).map(([key, value]) => (
                          <label key={key} className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
                            <input
                              type="radio"
                              name={question.id}
                              value={key}
                              checked={answers[question.id] === key}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="ml-3 text-gray-700">{value}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {question.type === 'true_false' && (
                      <div className="flex gap-4 ml-4">
                        {['true', 'false'].map((option) => (
                          <label key={option} className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="ml-3 text-gray-700 capitalize font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Text Match */}
                    {question.type === 'text_match' && (
                      <input
                        type="text"
                        placeholder="Type your answer here..."
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="ml-4 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                      />
                    )}

                    {/* Speaking */}
                    {question.type === 'speaking' && (
                      <div className="ml-4 w-full">
                        <VoiceRecorder
                          prompt={question.question}
                          onTranscriptChange={(transcript) => handleAnswerChange(question.id, transcript)}
                          maxDuration={30}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPEAKING Content Type - Vocabulary Pronunciation */}
          {currentContent.type === 'SPEAKING' && currentContent.content.type === 'vocabulary_pronunciation' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-2">🎤 Vocabulary Pronunciation Practice</h3>
                <p className="text-green-100 text-lg">Record yourself saying each word correctly</p>
                {currentContent.content.instructions && (
                  <p className="text-green-100 mt-3">{currentContent.content.instructions}</p>
                )}
              </div>

              {currentContent.content.vocabularyWords && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {currentContent.content.vocabularyWords.map((vocab: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                      <h5 className="text-lg font-bold text-green-900 mb-2">{vocab.word}</h5>
                      <p className="text-sm text-green-700 font-medium mb-2">Target: {vocab.pronunciation}</p>
                      <p className="text-xs text-green-600 bg-white bg-opacity-70 px-2 py-1 rounded inline-block">
                        Category: {vocab.category}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pronunciation Recording Questions */}
              <div className="space-y-8">
                {currentContent.content.questions?.map((question, idx) => (
                  <div key={`${question.id}-${idx}`} className="border-b pb-8 last:border-b-0">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block flex-1">
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                          Word {idx + 1}
                        </span>
                        <p className="text-lg font-medium text-gray-800 mt-2">
                          {question.question}
                        </p>
                      </label>
                      <button
                        onClick={() => {
                          handleAnswerChange(question.id, 'skipped')
                          alert('Pronunciation for this word will be marked as attempted. You can retry after submission.')
                        }}
                        className="ml-4 px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition"
                        title="Skip this pronunciation and move forward"
                      >
                        ⏭️ Skip
                      </button>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      answers[question.id]
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}>
                      <VoiceRecorder
                        key={`recorder-${question.id}-${idx}`}
                        prompt="Click the microphone to record your pronunciation"
                        onTranscriptChange={(transcript) => {
                          console.log(`Recording answer for ${question.id}:`, transcript)
                          handleAnswerChange(question.id, transcript)
                        }}
                        maxDuration={5}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPEAKING Content Type - Regular Speaking */}
          {currentContent.type === 'SPEAKING' && currentContent.content.type !== 'vocabulary_pronunciation' && (
            <div className="space-y-6">
              {currentContent.content.instructions && (
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed">{currentContent.content.instructions}</p>
                </div>
              )}

              {/* Speaking Questions */}
              <div className="space-y-8">
                {currentContent.content.questions?.map((question, idx) => (
                  <div key={question.id} className="border-b pb-8 last:border-b-0">
                    <label className="block mb-4">
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Question {idx + 1}
                      </span>
                      <p className="text-lg font-medium text-gray-800 mt-2">
                        {question.question}
                      </p>
                    </label>

                    <VoiceRecorder
                      prompt="Click the microphone to record your answer"
                      onTranscriptChange={(transcript) => handleAnswerChange(question.id, transcript)}
                      maxDuration={30}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LISTENING Content Type */}
          {currentContent.type === 'LISTENING' && (
            <div className="space-y-6">
              {currentContent.content.instructions && (
                <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <p className="text-gray-700 leading-relaxed">{currentContent.content.instructions}</p>
                </div>
              )}

              {/* Audio Player */}
              {currentContent.content.audioText && (
                <AudioPlayer
                  text={currentContent.content.audioText}
                  instructions="Listen to the audio carefully"
                />
              )}

              {/* Listening Comprehension Questions */}
              <div className="space-y-8">
                {currentContent.content.questions?.map((question, idx) => (
                  <div key={question.id} className="border-b pb-6 last:border-b-0">
                    <label className="block mb-4">
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Question {idx + 1}
                      </span>
                      <p className="text-lg font-medium text-gray-800 mt-2">
                        {question.question}
                      </p>
                    </label>

                    {/* Multiple Choice */}
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3 ml-4">
                        {Object.entries(question.options || {}).map(([key, value]) => (
                          <label key={key} className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition">
                            <input
                              type="radio"
                              name={question.id}
                              value={key}
                              checked={answers[question.id] === key}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="ml-3 text-gray-700">{value}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {question.type === 'true_false' && (
                      <div className="flex gap-4 ml-4">
                        {['true', 'false'].map((option) => (
                          <label key={option} className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="ml-3 text-gray-700 capitalize font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Text Match */}
                    {question.type === 'text_match' && (
                      <input
                        type="text"
                        placeholder="Type your answer here..."
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="ml-4 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WRITING Content Type */}
          {currentContent.type === 'WRITING' && (
            <div className="space-y-6">
              {currentContent.content.instructions && (
                <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-500">
                  <p className="text-gray-700 leading-relaxed">{currentContent.content.instructions}</p>
                </div>
              )}

              {/* Writing Questions */}
              <div className="space-y-8">
                {currentContent.content.questions?.map((question, idx) => (
                  <div key={question.id} className="border-b pb-8 last:border-b-0">
                    <label className="block mb-4">
                      <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Question {idx + 1}
                      </span>
                      <p className="text-lg font-medium text-gray-800 mt-2">
                        {question.question}
                      </p>
                    </label>

                    <WritingEditor
                      prompt={question.prompt}
                      onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                      minWords={question.minWords || 30}
                      maxWords={question.maxWords || 300}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity/Other */}
          {!['LESSON', 'EXERCISE', 'ASSESSMENT', 'SPEAKING', 'LISTENING', 'WRITING'].includes(currentContent.type) && (
            <div className="text-gray-600">
              <p>Activity: {currentContent.title}</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setCurrentContentIndex(Math.max(0, currentContentIndex - 1))}
            disabled={currentContentIndex === 0}
            className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>

          {currentContentIndex < totalContent - 1 ? (
            <button
              onClick={() => setCurrentContentIndex(currentContentIndex + 1)}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || submitting}
              className="px-8 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⟳</span> Submitting...
                </>
              ) : (
                <>✓ Submit Answers</>
              )}
            </button>
          )}
        </div>

        {/* Answer Requirements */}
        {currentContentIndex === totalContent - 1 && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              {allQuestionsAnswered
                ? '✓ All questions answered. Ready to submit!'
                : '⚠ Please answer all questions before submitting.'}
            </p>
            {!allQuestionsAnswered && (
              <details className="mt-2 text-xs text-blue-600">
                <summary>Debug Info</summary>
                <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
                  Total Content: {totalContent}
                  {'\n'}Current Index: {currentContentIndex}
                  {'\n'}Total Questions: {lesson?.lesson.contents.flatMap(c => c.content.questions || []).length}
                  {'\n'}Answered Questions: {Object.keys(answers).length}
                  {'\n'}Question IDs: {JSON.stringify(lesson?.lesson.contents.flatMap(c => c.content.questions || []).map(q => q.id))}
                  {'\n'}Answered IDs: {JSON.stringify(Object.keys(answers))}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Timer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Session expires at {new Date(lesson.timing.expiresAt).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}
