'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EnrolledClass {
  id: string
  className: string
  gradeLevel: string
  enrolledAt: string
}

export default function StudentEnrollment() {
  const router = useRouter()
  const [view, setView] = useState<'join' | 'list'>('list')
  const [classCode, setClassCode] = useState('')
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [token, setToken] = useState('')

  // Check if logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('studentToken')
    if (!savedToken) {
      router.push('/auth/login')
      return
    }
    setToken(savedToken)
    loadEnrolledClasses(savedToken)
  }, [])

  const loadEnrolledClasses = async (authToken: string) => {
    try {
      const response = await fetch('/api/student/enrollments', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      if (response.ok) {
        const data = await response.json()
        setEnrolledClasses(data.classes || [])
      }
    } catch (err) {
      console.error('Failed to load classes')
    }
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!classCode.trim()) {
      setError('Please enter a class code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ classCode: classCode.trim().toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to join class')
        return
      }

      setSuccess(`Successfully joined ${data.enrollment.className}!`)
      setClassCode('')
      setTimeout(() => {
        loadEnrolledClasses(token)
        setView('list')
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClass = (classId: string) => {
    localStorage.setItem('selectedClassId', classId)
    router.push('/dashboard')
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">WizLingo</h1>
          <button
            onClick={() => {
              localStorage.removeItem('studentToken')
              router.push('/auth/login')
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* View toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            My Classes
          </button>
          <button
            onClick={() => setView('join')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'join'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Join Class
          </button>
        </div>

        {/* My Classes View */}
        {view === 'list' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Your Classes</h2>

            {enrolledClasses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 mb-6">You haven't joined any classes yet.</p>
                <button
                  onClick={() => setView('join')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Join a Class
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer" onClick={() => handleSelectClass(cls.id)}>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{cls.className}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>Grade: {cls.gradeLevel}</p>
                      <p>Joined: {new Date(cls.enrolledAt).toLocaleDateString()}</p>
                    </div>
                    <button className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 font-medium">
                      Start Learning →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Join Class View */}
        {view === 'join' && (
          <div className="max-w-md">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Join a Class</h2>

              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Code
                  </label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="AB1234"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ask your teacher for the 6-character class code
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{success}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-medium text-lg"
                >
                  {loading ? 'Joining...' : 'Join Class'}
                </button>
              </form>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-900">
                  <strong>Need a class code?</strong> Ask your teacher. They'll give you a unique 6-character code to join their class.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
