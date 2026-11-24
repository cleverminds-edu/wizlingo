'use client'

import { useState, useEffect } from 'react'

interface WritingEditorProps {
  prompt: string
  onAnswerChange: (answer: string) => void
  minWords?: number
  maxWords?: number
  placeholder?: string
}

export default function WritingEditor({
  prompt,
  onAnswerChange,
  minWords = 20,
  maxWords = 500,
  placeholder = 'Write your response here...'
}: WritingEditorProps) {
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const chars = text.length

    setWordCount(words)
    setCharacterCount(chars)
    onAnswerChange(text)
  }, [text, onAnswerChange])

  const getProgressColor = (): string => {
    if (wordCount < minWords) return 'text-red-600'
    if (wordCount > maxWords) return 'text-orange-600'
    return 'text-green-600'
  }

  const getProgressBarColor = (): string => {
    if (wordCount < minWords) return 'bg-red-500'
    if (wordCount > maxWords) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getProgress = (): number => {
    const ideal = (minWords + maxWords) / 2
    const deviation = Math.abs(wordCount - ideal)
    const maxDeviation = ideal - minWords
    return Math.max(0, 100 - (deviation / maxDeviation) * 50)
  }

  const handleClear = () => {
    setText('')
  }

  return (
    <div className="w-full space-y-4">
      {/* Writing Prompt */}
      <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded">
        <p className="text-sm text-gray-600 font-medium mb-1">📝 Your Task:</p>
        <p className="text-gray-800 text-base">{prompt}</p>
      </div>

      {/* Writing Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <p className="font-semibold text-blue-900 mb-1">✓ Requirements</p>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• Minimum: {minWords} words</li>
            <li>• Maximum: {maxWords} words</li>
            <li>• Clear structure</li>
            <li>• Proper grammar</li>
          </ul>
        </div>

        <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
          <p className="font-semibold text-indigo-900 mb-1">💡 Tips</p>
          <ul className="text-indigo-700 text-xs space-y-1">
            <li>• Use complete sentences</li>
            <li>• Vary your vocabulary</li>
            <li>• Check punctuation</li>
            <li>• Proofread before submitting</li>
          </ul>
        </div>
      </div>

      {/* Text Editor */}
      <div className="border-2 border-gray-200 rounded-lg p-4 focus-within:border-indigo-500 focus-within:shadow-md transition">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none font-sans text-base leading-relaxed"
        />
      </div>

      {/* Word Count & Progress */}
      <div className="space-y-2">
        {/* Word Count Display */}
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-600 font-medium">Words</p>
              <p className={`text-2xl font-bold ${getProgressColor()}`}>
                {wordCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Characters</p>
              <p className="text-2xl font-bold text-gray-700">
                {characterCount}
              </p>
            </div>
          </div>

          {/* Clear Button */}
          {text.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">
              Word count progress ({minWords}-{maxWords})
            </span>
            <span className={`text-xs font-bold ${getProgressColor()}`}>
              {wordCount < minWords
                ? `${minWords - wordCount} more needed`
                : wordCount > maxWords
                ? `${wordCount - maxWords} too many`
                : 'Perfect!'}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressBarColor()} transition-all duration-300`}
              style={{ width: `${Math.min(100, getProgress())}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg border-l-4 ${
        wordCount < minWords
          ? 'bg-red-50 border-red-500'
          : wordCount > maxWords
          ? 'bg-orange-50 border-orange-500'
          : 'bg-green-50 border-green-500'
      }`}>
        <p className={`text-sm font-medium ${
          wordCount < minWords
            ? 'text-red-700'
            : wordCount > maxWords
            ? 'text-orange-700'
            : 'text-green-700'
        }`}>
          {wordCount === 0
            ? '📝 Start typing your response...'
            : wordCount < minWords
            ? `⚠️ Your response is too short. Write ${minWords - wordCount} more words.`
            : wordCount > maxWords
            ? `⚠️ Your response is too long. Remove ${wordCount - maxWords} words.`
            : '✓ Your response meets the word count requirements!'}
        </p>
      </div>
    </div>
  )
}
