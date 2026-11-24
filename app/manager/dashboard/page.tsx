'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ManagerState {
  id: string
  email: string
  name: string
  organizationName?: string
}

interface SchoolStat {
  schoolId: string
  schoolName: string
  city?: string
  students: number
  teachers: number
  classes: number
  sessions: number
  avgScore: number
  passRate: number
  xp: number
  avgReadingScore: number
  avgSpeakingScore: number
  avgWritingScore: number
  avgListeningScore: number
  topStudents: Array<{ studentId: string; name: string; xp: number }>
}

interface ManagerAnalytics {
  stats: {
    totalSchools: number
    totalTeachers: number
    totalStudents: number
    totalSessions: number
    totalXP: number
    avgScore: number
    passRate: number
    avgReadingScore: number
    avgSpeakingScore: number
    avgWritingScore: number
    avgListeningScore: number
  }
  schools: SchoolStat[]
}

type DashboardView = 'login' | 'overview' | 'schoolDetail'

export default function ManagerDashboard() {
  const router = useRouter()
  const [view, setView] = useState<DashboardView>('login')
  const [manager, setManager] = useState<ManagerState | null>(null)
  const [token, setToken] = useState('')
  const [analytics, setAnalytics] = useState<ManagerAnalytics | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<SchoolStat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('managerToken')
    const savedManager = localStorage.getItem('manager')
    if (savedToken && savedManager) {
      setToken(savedToken)
      setManager(JSON.parse(savedManager))
      setView('overview')
      loadAnalytics(savedToken)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/manager/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      const { token, manager } = data
      localStorage.setItem('managerToken', token)
      localStorage.setItem('manager', JSON.stringify(manager))
      setToken(token)
      setManager(manager)
      setView('overview')
      loadAnalytics(token)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async (managerToken: string) => {
    try {
      const response = await fetch('/api/manager/analytics', {
        headers: { 'Authorization': `Bearer ${managerToken}` }
      })

      const data = await response.json()

      if (response.ok) {
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Failed to load analytics')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('managerToken')
    localStorage.removeItem('manager')
    setToken('')
    setManager(null)
    setView('login')
    setError('')
  }

  // Login View
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WizLingo</h1>
          <p className="text-gray-600 mb-8">Global Manager Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="manager@wizlingo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/manager/signup')}
              className="text-purple-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Overview View
  if (view === 'overview' && analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Global Manager Dashboard</h1>
              <p className="text-gray-600">{manager?.name} • {manager?.organizationName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Schools</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.stats.totalSchools}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Teachers</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.stats.totalTeachers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-green-600">{analytics.stats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Sessions</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.stats.totalSessions}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Average Class Score</p>
              <p className="text-4xl font-bold text-gray-800">{analytics.stats.avgScore.toFixed(1)}%</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${analytics.stats.avgScore}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Pass Rate Across Schools</p>
              <p className="text-4xl font-bold text-green-600">{analytics.stats.passRate.toFixed(0)}%</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${analytics.stats.passRate}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Total XP Earned</p>
              <p className="text-4xl font-bold text-indigo-600">{analytics.stats.totalXP.toLocaleString()}</p>
            </div>
          </div>

          {/* LSRW Skills Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Global Skills Performance (LSRW)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Listening', score: analytics.stats.avgListeningScore, color: 'bg-blue-100', textColor: 'text-blue-600' },
                { label: 'Speaking', score: analytics.stats.avgSpeakingScore, color: 'bg-green-100', textColor: 'text-green-600' },
                { label: 'Reading', score: analytics.stats.avgReadingScore, color: 'bg-purple-100', textColor: 'text-purple-600' },
                { label: 'Writing', score: analytics.stats.avgWritingScore, color: 'bg-orange-100', textColor: 'text-orange-600' }
              ].map((skill) => (
                <div key={skill.label} className={`${skill.color} rounded-lg p-4`}>
                  <p className="text-gray-600 text-sm mb-2">{skill.label}</p>
                  <p className={`text-3xl font-bold ${skill.textColor}`}>{skill.score.toFixed(0)}%</p>
                  <div className="mt-2 bg-gray-300 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.textColor.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.min(skill.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schools List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">School Performance Rankings</h2>
            {analytics.schools.length === 0 ? (
              <p className="text-gray-600">No schools yet.</p>
            ) : (
              <div className="space-y-4">
                {analytics.schools.map((school, idx) => (
                  <div
                    key={school.schoolId}
                    onClick={() => {
                      setSelectedSchool(school)
                      setView('schoolDetail')
                    }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-purple-600">#{idx + 1}</span>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{school.schoolName}</h3>
                            <p className="text-sm text-gray-600">{school.city}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-indigo-600">{school.xp}</p>
                        <p className="text-xs text-gray-600">Total XP</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Students</p>
                        <p className="text-lg font-bold text-gray-800">{school.students}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Teachers</p>
                        <p className="text-lg font-bold text-gray-800">{school.teachers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Classes</p>
                        <p className="text-lg font-bold text-gray-800">{school.classes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Avg Score</p>
                        <p className="text-lg font-bold text-gray-800">{school.avgScore.toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Pass Rate</p>
                        <p className="text-lg font-bold text-green-600">{school.passRate.toFixed(0)}%</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {[
                        { label: 'R', score: school.avgReadingScore, color: 'bg-purple-100 text-purple-600' },
                        { label: 'L', score: school.avgListeningScore, color: 'bg-blue-100 text-blue-600' },
                        { label: 'S', score: school.avgSpeakingScore, color: 'bg-green-100 text-green-600' },
                        { label: 'W', score: school.avgWritingScore, color: 'bg-orange-100 text-orange-600' }
                      ].map((skill) => (
                        <div key={skill.label} className={`${skill.color} rounded px-3 py-1 text-center text-sm font-bold flex-1`}>
                          {skill.label}: {skill.score.toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // School Detail View
  if (view === 'schoolDetail' && selectedSchool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <button
                onClick={() => setView('overview')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-2"
              >
                ← Back to Schools
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{selectedSchool.schoolName}</h1>
              <p className="text-gray-600">{selectedSchool.city}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* School Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{selectedSchool.students}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-800">{selectedSchool.teachers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Classes</p>
              <p className="text-3xl font-bold text-gray-800">{selectedSchool.classes}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Sessions Completed</p>
              <p className="text-3xl font-bold text-gray-800">{selectedSchool.sessions}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total XP</p>
              <p className="text-3xl font-bold text-indigo-600">{selectedSchool.xp}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">School Average Score</p>
              <p className="text-4xl font-bold text-gray-800">{selectedSchool.avgScore.toFixed(0)}%</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${selectedSchool.avgScore}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Pass Rate</p>
              <p className="text-4xl font-bold text-green-600">{selectedSchool.passRate.toFixed(0)}%</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${selectedSchool.passRate}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Avg XP per Student</p>
              <p className="text-4xl font-bold text-indigo-600">
                {selectedSchool.students > 0 ? (selectedSchool.xp / selectedSchool.students).toFixed(0) : 0}
              </p>
            </div>
          </div>

          {/* LSRW Skills */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">School Skills Breakdown (LSRW)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Listening', score: selectedSchool.avgListeningScore, color: 'bg-blue-100', textColor: 'text-blue-600' },
                { label: 'Speaking', score: selectedSchool.avgSpeakingScore, color: 'bg-green-100', textColor: 'text-green-600' },
                { label: 'Reading', score: selectedSchool.avgReadingScore, color: 'bg-purple-100', textColor: 'text-purple-600' },
                { label: 'Writing', score: selectedSchool.avgWritingScore, color: 'bg-orange-100', textColor: 'text-orange-600' }
              ].map((skill) => (
                <div key={skill.label} className={`${skill.color} rounded-lg p-4`}>
                  <p className="text-gray-600 text-sm mb-2">{skill.label}</p>
                  <p className={`text-3xl font-bold ${skill.textColor}`}>{skill.score.toFixed(0)}%</p>
                  <div className="mt-2 bg-gray-300 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.textColor.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.min(skill.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Top Performers</h2>
            {selectedSchool.topStudents.length === 0 ? (
              <p className="text-gray-600">No student data available.</p>
            ) : (
              <div className="space-y-3">
                {selectedSchool.topStudents.map((student, idx) => (
                  <div key={student.studentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-purple-600">#{idx + 1}</span>
                      <p className="font-medium text-gray-800">{student.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{student.xp} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
