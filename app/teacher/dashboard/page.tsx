'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TeacherState {
  id: string
  email: string
  name: string
  schoolName?: string
}

interface ClassData {
  id: string
  name: string
  gradeLevel: string
  code: string
  students?: number
  avgScore?: number
  passRate?: number
  xp?: number
}

interface StudentMetric {
  studentId: string
  name: string
  avgScore: number
  passRate: number
  xp: number
  sessions: number
  stage: string
  stageProgress: number
}

interface ClassAnalytics {
  id: string
  name: string
  code: string
  gradeLevel: string
  stats: {
    totalStudents: number
    totalSessions: number
    avgScore: number
    passRate: number
    totalXP: number
    avgReadingScore: number
    avgSpeakingScore: number
    avgWritingScore: number
    avgListeningScore: number
  }
  students: StudentMetric[]
}

type DashboardView = 'login' | 'classes' | 'classDetail'

export default function TeacherDashboard() {
  const router = useRouter()
  const [view, setView] = useState<DashboardView>('login')
  const [teacher, setTeacher] = useState<TeacherState | null>(null)
  const [token, setToken] = useState('')
  const [classes, setClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassAnalytics | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentMetric | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Create class form state
  const [newClassName, setNewClassName] = useState('')
  const [newClassGrade, setNewClassGrade] = useState('GR_1_3')

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('teacherToken')
    const savedTeacher = localStorage.getItem('teacher')
    if (savedToken && savedTeacher) {
      setToken(savedToken)
      setTeacher(JSON.parse(savedTeacher))
      setView('classes')
      loadClasses(savedToken)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/teacher/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      const { token, teacher } = data
      localStorage.setItem('teacherToken', token)
      localStorage.setItem('teacher', JSON.stringify(teacher))
      setToken(token)
      setTeacher(teacher)
      setView('classes')
      loadClasses(token)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async (teacherToken: string) => {
    try {
      // Fetch classes and their analytics
      const response = await fetch('/api/teacher/classes', {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      })

      if (!response.ok) return

      const data = await response.json()
      setClasses(data.classes || [])
    } catch (err) {
      console.error('Failed to load classes')
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/teacher/class/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newClassName, gradeLevel: newClassGrade })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create class')
        return
      }

      setNewClassName('')
      loadClasses(token)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewClassDetail = async (classId: string) => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teacher/class/${classId}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok) {
        setSelectedClass(data)
        setView('classDetail')
      }
    } catch (err) {
      setError('Failed to load class details')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('teacherToken')
    localStorage.removeItem('teacher')
    setToken('')
    setTeacher(null)
    setView('login')
    setError('')
  }

  // Login View
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WizLingo</h1>
          <p className="text-gray-600 mb-8">Teacher Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="teacher@school.com"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/teacher/signup')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Classes View
  if (view === 'classes') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
              <p className="text-gray-600">{teacher?.name} • {teacher?.schoolName}</p>
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
          {/* Create Class Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Class</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Grade 3A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="PREPRIMARY">Pre-Primary (Ages 3-5)</option>
                    <option value="GR_1_3">Grade 1-3 (Ages 6-9)</option>
                    <option value="GR_4_7">Grade 4-7 (Ages 10-13)</option>
                    <option value="GR_8_10">Grade 8-10 (Ages 14-16)</option>
                    <option value="GR_11_12">Grade 11-12 (Ages 17-18)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            </form>
          </div>

          {/* Classes Grid */}
          {classes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No classes yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => handleViewClassDetail(cls.id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{cls.gradeLevel}</p>
                    <p className="text-xs text-gray-500 mt-2">Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{cls.code}</span></p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-semibold text-gray-800">{cls.students || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Score:</span>
                      <span className="font-semibold text-gray-800">{(cls.avgScore || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pass Rate:</span>
                      <span className="font-semibold text-green-600">{(cls.passRate || 0).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total XP:</span>
                      <span className="font-semibold text-indigo-600">{cls.xp || 0}</span>
                    </div>
                  </div>

                  <button className="mt-4 w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Class Detail View
  if (view === 'classDetail' && selectedClass) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <button
                onClick={() => setView('classes')}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-2"
              >
                ← Back to Classes
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{selectedClass.name}</h1>
              <p className="text-gray-600">Class Code: {selectedClass.code}</p>
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
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{selectedClass.stats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Sessions Completed</p>
              <p className="text-3xl font-bold text-gray-800">{selectedClass.stats.totalSessions}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Class Average</p>
              <p className="text-3xl font-bold text-gray-800">{selectedClass.stats.avgScore.toFixed(0)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Pass Rate</p>
              <p className="text-3xl font-bold text-green-600">{selectedClass.stats.passRate.toFixed(0)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Total XP Earned</p>
              <p className="text-3xl font-bold text-indigo-600">{selectedClass.stats.totalXP}</p>
            </div>
          </div>

          {/* LSRW Skills Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Skills Breakdown (LSRW)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Listening', score: selectedClass.stats.avgListeningScore, color: 'bg-blue-100', textColor: 'text-blue-600' },
                { label: 'Speaking', score: selectedClass.stats.avgSpeakingScore, color: 'bg-green-100', textColor: 'text-green-600' },
                { label: 'Reading', score: selectedClass.stats.avgReadingScore, color: 'bg-purple-100', textColor: 'text-purple-600' },
                { label: 'Writing', score: selectedClass.stats.avgWritingScore, color: 'bg-orange-100', textColor: 'text-orange-600' }
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

          {/* Student Roster */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Student Performance</h2>
            {selectedClass.students.length === 0 ? (
              <p className="text-gray-600">No students in this class yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Sessions</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Pass Rate</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">XP</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Current Stage</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClass.students
                      .sort((a, b) => b.xp - a.xp)
                      .map((student) => (
                        <tr key={student.studentId} className="border-b hover:bg-gray-50 cursor-pointer">
                          <td className="py-3 px-4 font-medium text-gray-800">{student.name}</td>
                          <td className="text-center py-3 px-4 text-gray-600">{student.sessions}</td>
                          <td className="text-center py-3 px-4 text-gray-600">{student.avgScore.toFixed(0)}%</td>
                          <td className="text-center py-3 px-4 text-green-600 font-medium">{student.passRate.toFixed(0)}%</td>
                          <td className="text-center py-3 px-4 text-indigo-600 font-semibold">{student.xp}</td>
                          <td className="text-center py-3 px-4 text-gray-600">{student.stage}</td>
                          <td className="text-center py-3 px-4">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${student.stageProgress}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
