'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface ReadingPassage {
  id: string
  title: string
  content: string
  wordCount: number
  level: number
  topic: string
}

export default function ReadingPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [passages, setPassages] = useState<ReadingPassage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(null)

  useEffect(() => {
    const tok = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!tok) {
      router.push('/auth/login')
      return
    }
    setToken(tok)
    fetchPassages(tok)
  }, [router])

  const fetchPassages = async (tok: string) => {
    try {
      const res = await fetch('/api/content/reading-passages', {
        headers: { Authorization: `Bearer ${tok}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPassages(data)
        if (data.length > 0) setSelectedPassage(data[0])
      }
    } catch (error) {
      console.error('Error fetching passages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-orange-100 hover:text-white text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold">📖 Reading Practice</h1>
          <p className="text-orange-100 mt-2">Enhance your reading comprehension and vocabulary</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading passages...</p>
          </div>
        ) : passages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No reading passages available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Passages List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Available Passages</h3>
              {passages.map((passage) => (
                <button
                  key={passage.id}
                  onClick={() => setSelectedPassage(passage)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedPassage?.id === passage.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-900 hover:shadow-md border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{passage.title}</div>
                  <div className={`text-sm mt-1 ${selectedPassage?.id === passage.id ? 'text-orange-100' : 'text-gray-600'}`}>
                    Level {passage.level} • {passage.wordCount} words
                  </div>
                </button>
              ))}
            </div>

            {/* Passage Content */}
            {selectedPassage && (
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedPassage.title}</h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📍 Level {selectedPassage.level}</span>
                    <span>📊 {selectedPassage.wordCount} words</span>
                    <span>🏷️ {selectedPassage.topic}</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {selectedPassage.content}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                  <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition">
                    📝 Answer Questions
                  </button>
                  <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition">
                    ✓ Mark Complete
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
