'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SpeakingTopic {
  id: string
  title: string
  prompt: string
  level: number
  topic: string
}

export default function SpeakingPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [topics, setTopics] = useState<SpeakingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic | null>(null)

  useEffect(() => {
    const tok = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!tok) {
      router.push('/auth/login')
      return
    }
    setToken(tok)
    fetchTopics(tok)
  }, [router])

  const fetchTopics = async (tok: string) => {
    try {
      const res = await fetch('/api/content/speaking-topics', {
        headers: { Authorization: `Bearer ${tok}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTopics(data)
        if (data.length > 0) setSelectedTopic(data[0])
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-green-100 hover:text-white text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold">🎤 Speaking Practice</h1>
          <p className="text-green-100 mt-2">Develop your speaking and pronunciation skills</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No speaking topics available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Topics List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Available Topics</h3>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedTopic?.id === topic.id
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white text-gray-900 hover:shadow-md border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{topic.title}</div>
                  <div className={`text-sm mt-1 ${selectedTopic?.id === topic.id ? 'text-green-100' : 'text-gray-600'}`}>
                    Level {topic.level}
                  </div>
                </button>
              ))}
            </div>

            {/* Topic Content */}
            {selectedTopic && (
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedTopic.title}</h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📍 Level {selectedTopic.level}</span>
                    <span>🏷️ {selectedTopic.topic}</span>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">Topic Prompt:</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {selectedTopic.prompt}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition">
                    🎙️ Start Recording
                  </button>
                  <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition">
                    ✓ Skip for Now
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
