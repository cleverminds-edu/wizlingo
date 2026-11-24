'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface ListeningClip {
  id: string
  title: string
  transcript: string
  audioUrl: string
  level: number
  topic: string
}

export default function ListeningPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [clips, setClips] = useState<ListeningClip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClip, setSelectedClip] = useState<ListeningClip | null>(null)

  useEffect(() => {
    const tok = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!tok) {
      router.push('/auth/login')
      return
    }
    setToken(tok)
    fetchClips(tok)
  }, [router])

  const fetchClips = async (tok: string) => {
    try {
      const res = await fetch('/api/content/listening-clips', {
        headers: { Authorization: `Bearer ${tok}` }
      })
      if (res.ok) {
        const data = await res.json()
        setClips(data)
        if (data.length > 0) setSelectedClip(data[0])
      }
    } catch (error) {
      console.error('Error fetching clips:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-100 hover:text-white text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold">👂 Listening Practice</h1>
          <p className="text-blue-100 mt-2">Improve your listening comprehension skills</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clips...</p>
          </div>
        ) : clips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No listening clips available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Clips List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Available Clips</h3>
              {clips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedClip?.id === clip.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-900 hover:shadow-md border border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{clip.title}</div>
                  <div className={`text-sm mt-1 ${selectedClip?.id === clip.id ? 'text-blue-100' : 'text-gray-600'}`}>
                    Level {clip.level}
                  </div>
                </button>
              ))}
            </div>

            {/* Clip Content */}
            {selectedClip && (
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedClip.title}</h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📍 Level {selectedClip.level}</span>
                    <span>🏷️ {selectedClip.topic}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Audio Player:</h3>
                  <div className="bg-gray-200 rounded-lg p-4 text-center text-gray-600 mb-4">
                    🎵 Audio player coming soon
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Transcript:</h3>
                  <p className="text-gray-700 text-base leading-relaxed italic">
                    {selectedClip.transcript}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition">
                    🎙️ Answer Questions
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
