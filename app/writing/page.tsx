'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface WritingPrompt {
  id: string
  title: string
  prompt: string
  level: number
  topic: string
}

export default function WritingPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<WritingPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null)

  useEffect(() => {
    const tok = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!tok) {
      router.push('/auth/login')
      return
    }
    setToken(tok)
    fetchPrompts(tok)
  }, [router])

  const fetchPrompts = async (tok: string) => {
    try {
      const res = await fetch('/api/content/writing-prompts', {
        headers: { Authorization: `Bearer ${tok}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPrompts(data)
        if (data.length > 0) setSelectedPrompt(data[0])
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-purple-100 hover:text-white text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold">✍️ Writing Practice</h1>
          <p className="text-purple-100 mt-2">Improve your writing skills and grammar</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No writing prompts available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Prompts List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Available Prompts</h3>
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedPrompt?.id === prompt.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-900 hover:shadow-md border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{prompt.title}</div>
                  <div className={`text-sm mt-1 ${selectedPrompt?.id === prompt.id ? 'text-purple-100' : 'text-gray-600'}`}>
                    Level {prompt.level}
                  </div>
                </button>
              ))}
            </div>

            {/* Prompt Content */}
            {selectedPrompt && (
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedPrompt.title}</h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📍 Level {selectedPrompt.level}</span>
                    <span>🏷️ {selectedPrompt.topic}</span>
                  </div>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">Writing Prompt:</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {selectedPrompt.prompt}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block font-bold text-gray-900 mb-3">Your Response:</label>
                  <textarea
                    placeholder="Start typing your response here..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40"
                  ></textarea>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                  <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition">
                    📤 Submit Response
                  </button>
                  <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition">
                    ✓ Save Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
