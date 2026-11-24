'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [startingLesson, setStartingLesson] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
          router.push('/auth/login')
          return
        }

        const [userRes, lessonsRes, statsRes, vocabRes] = await Promise.all([
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/student/lessons', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/student/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/student/vocabulary-strength', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (!userRes.ok) {
          localStorage.clear()
          router.push('/auth/login')
          return
        }

        const userData = await userRes.json()
        const lessonsData = lessonsRes.ok ? await lessonsRes.json() : { data: [] }
        const statsData = statsRes.ok ? await statsRes.json() : null
        const vocabData = vocabRes.ok ? await vocabRes.json() : null

        setUser(userData)
        setLessons(lessonsData.data || [])
        setStats({ ...statsData, vocabularyStrength: vocabData?.vocabularyStrength })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
        router.push('/auth/login')
      }
    }

    fetchData()
  }, [mounted, router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/auth/login')
  }

  const handleStartLesson = async (lessonId: string) => {
    if (!mounted || startingLesson) return

    try {
      setStartingLesson(lessonId)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      console.log('Starting lesson:', { lessonId, token: token?.substring(0, 20) + '...' })

      const response = await fetch('/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.error('API Error:', data)
        alert(`Error: ${data.error || 'Failed to start lesson'}`)
        return
      }

      const data = await response.json()
      console.log('Session created:', data.sessionId)
      router.push(`/lesson/${data.sessionId}`)
    } catch (error) {
      console.error('Error starting lesson:', error)
      alert('Failed to start lesson. Please try again.')
    } finally {
      setStartingLesson(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">Loading Your Journey...</div>
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Map lesson types to icons
  const lessonIcons: Record<string, string> = {
    'Vocabulary': '📝',
    'Reading': '📖',
    'Speaking': '🎤',
    'Writing': '✍️',
    'Listening': '👂'
  }

  const getLessonIcon = (title: string): string => {
    for (const [key, icon] of Object.entries(lessonIcons)) {
      if (title.includes(key)) return icon
    }
    return '📚'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              WizLingo
            </h1>
            <p className="text-orange-50">Language. Mastered.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Welcome back, {user.name}! 🧙‍♂️
          </h2>
          <p className="text-lg text-gray-600 mb-6">Continue your learning journey to language mastery</p>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Grade Category</div>
              <div className="text-xl font-bold text-blue-600">{user.gradeCategory?.replace(/_/g, ' ')}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total XP</div>
              <div className="text-2xl font-bold text-orange-600">{user.totalXP || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Streak Days</div>
              <div className="text-2xl font-bold text-purple-600">{user.streakDays || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Lessons Available</div>
              <div className="text-2xl font-bold text-green-600">{lessons.length}</div>
            </div>
          </div>

          {/* Reading vs Speaking Stats */}
          {stats && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Skills Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Reading Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-blue-900">📖 Reading</h4>
                    <span className="text-3xl">📚</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Questions Answered</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.reading?.questionsAnswered || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy Rate</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-blue-200 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${stats.reading?.accuracy || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xl font-bold text-blue-700">{stats.reading?.accuracy || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Speaking Stats */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-purple-900">🎤 Speaking</h4>
                    <span className="text-3xl">🗣️</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Questions Answered</p>
                      <p className="text-2xl font-bold text-purple-700">{stats.speaking?.questionsAnswered || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Accuracy</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-purple-200 rounded-full">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${stats.speaking?.accuracy || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xl font-bold text-purple-700">{stats.speaking?.accuracy || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vocabulary Stats */}
                {stats.vocabularyStrength && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-green-900">📝 Vocabulary</h4>
                      <span className="text-3xl">📚</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Proficiency Level</p>
                        <p className="text-2xl font-bold text-green-700">{stats.vocabularyStrength.proficiencyLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Overall Strength</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-green-200 rounded-full">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{ width: `${stats.vocabularyStrength.overall || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xl font-bold text-green-700">{stats.vocabularyStrength.overall || 0}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Pronunciation</p>
                          <p className="font-bold text-green-700">{stats.vocabularyStrength.pronunciation || 0}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Meaning</p>
                          <p className="font-bold text-green-700">{stats.vocabularyStrength.meaning || 0}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lessons Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">📚 Available Lessons</h3>
          <p className="text-gray-600 mb-6">
            {lessons.length === 0
              ? 'No lessons available for your grade level yet'
              : `Start learning with ${lessons.length} lessons for ${user.gradeCategory?.replace(/_/g, ' ')}`}
          </p>

          {lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
                  onClick={() => handleStartLesson(lesson.id)}
                >
                  <div className="text-4xl mb-3">{getLessonIcon(lesson.title)}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{lesson.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>

                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold">⏱️ Duration:</span> {lesson.estimatedMinutes} minutes
                    </div>
                    <div>
                      <span className="font-semibold">📖 Content Items:</span> {lesson.contentCount}
                    </div>
                  </div>

                  <button
                    disabled={startingLesson === lesson.id}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      startingLesson === lesson.id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {startingLesson === lesson.id ? 'Starting...' : 'Start Lesson'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600 text-lg">Lessons will appear here once your curriculum is ready.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
