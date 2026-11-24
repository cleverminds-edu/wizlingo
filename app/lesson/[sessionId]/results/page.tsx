'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function LessonResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = localStorage.getItem(`lessonResults_${sessionId}`)
    if (storedResults) {
      const data = JSON.parse(storedResults)
      setResults(data)
    }
    setLoading(false)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <p className="text-gray-600">No results found</p>
        </div>
      </div>
    )
  }

  const score = results.score
  const passed = results.passed
  const vocabularyMetrics = results.vocabularyMetrics
  const focusAreas = results.focusAreas

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Score Card */}
        <div className={`rounded-lg shadow-lg p-8 mb-6 text-white ${
          score >= 80
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : score >= 70
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">{score}%</div>
            <p className="text-lg opacity-90">{results.correctCount} of {results.totalQuestions} questions correct</p>
          </div>

          <div className="flex justify-around text-center mb-6">
            <div>
              <p className="text-sm opacity-75">Completed</p>
              <p className="text-2xl font-bold">{Math.floor((new Date(results.completion.submittedAt).getTime() - new Date(results.completion.startedAt).getTime()) / 60000)}m</p>
            </div>
            <div>
              <p className="text-sm opacity-75">XP Earned</p>
              <p className="text-2xl font-bold">+{results.xpEarned}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Status</p>
              <p className="text-2xl font-bold">{passed ? '✓ Passed' : 'Try Again'}</p>
            </div>
          </div>
        </div>

        {/* Vocabulary Metrics */}
        {vocabularyMetrics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Vocabulary Strength Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Pronunciation */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-green-900">🎤 Pronunciation</h3>
                  <span className="text-2xl font-bold text-green-600">{vocabularyMetrics.pronunciationScore}%</span>
                </div>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${vocabularyMetrics.pronunciationScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  {vocabularyMetrics.pronunciationScore >= 80
                    ? '✓ Clear and accurate pronunciation'
                    : vocabularyMetrics.pronunciationScore >= 60
                    ? '◐ Good effort, keep practicing'
                    : '⚠ Needs more pronunciation practice'}
                </p>
              </div>

              {/* Meaning */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-blue-900">📚 Meaning</h3>
                  <span className="text-2xl font-bold text-blue-600">{vocabularyMetrics.meaningScore}%</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${vocabularyMetrics.meaningScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {vocabularyMetrics.meaningScore >= 80
                    ? '✓ Strong understanding of word meanings'
                    : vocabularyMetrics.meaningScore >= 60
                    ? '◐ Good, continue learning'
                    : '⚠ Focus on definition learning'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Overall Level:</strong> <span className="text-lg font-bold text-green-600">{vocabularyMetrics.proficiencyLevel}</span>
              </p>
            </div>
          </div>
        )}

        {/* Focus Areas - What Needs Practice */}
        {focusAreas && (focusAreas.pronunciation.count > 0 || focusAreas.meaning.count > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-amber-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Areas to Focus On</h2>

            {focusAreas.pronunciation.count > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-2">
                  🎤 Pronunciation ({focusAreas.pronunciation.count} words to improve)
                </h3>
                <p className="text-sm text-amber-800 mb-3">{focusAreas.pronunciation.advice}</p>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.pronunciation.words.map((word: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {focusAreas.meaning.count > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">
                  📚 Word Meanings ({focusAreas.meaning.count} words to review)
                </h3>
                <p className="text-sm text-blue-800">{focusAreas.meaning.advice}</p>
              </div>
            )}
          </div>
        )}

        {/* Feedback Messages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Personalized Feedback</h2>

          {results.feedback.encouragement && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-gray-700">{results.feedback.encouragement}</p>
            </div>
          )}

          {results.feedback.nextSteps && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm font-semibold text-green-900 mb-1">Next Steps:</p>
              <p className="text-gray-700">{results.feedback.nextSteps}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {!passed && (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
