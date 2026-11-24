'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const [signupType, setSignupType] = useState<'b2b' | 'b2c'>('b2b')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [b2bForm, setB2bForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gradeCategory: 'GR_1_3',
    dob: '',
  })

  const [b2cForm, setB2cForm] = useState({
    name: '',
    phone: '',
    gradeCategory: 'GR_1_3',
    dob: '',
  })

  const handleB2bSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (b2bForm.password !== b2bForm.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (b2bForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: b2bForm.name,
          email: b2bForm.email,
          password: b2bForm.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      setSuccess('Account created! Redirecting...')
      localStorage.setItem('token', data.token)
      localStorage.setItem('studentId', data.studentId)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleB2cSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!/^\d{10}$/.test(b2cForm.phone)) {
      setError('Phone must be 10 digits')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: b2cForm.name,
          phone: b2cForm.phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      setSuccess(`Account created! Your ID: ${data.userId}`)
      localStorage.setItem('token', data.token)
      localStorage.setItem('studentId', data.studentId)
      localStorage.setItem('userId', data.userId)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT SIDE - CLEAN HERO SECTION */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-slate-900 to-blue-900 relative overflow-hidden items-center justify-center min-h-screen">
        {/* Minimal, refined background */}
        <div className="absolute inset-0">
          {/* Subtle floating elements - very minimal */}
          <div className="absolute top-20 right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>

          {/* Very subtle grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" patternUnits="userSpaceOnUse">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hero Content - CLEAN & MINIMAL */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center px-8 py-12 max-w-lg">
          {/* Logo - Clean */}
          <img
            src="/wizlingo-logo.png"
            alt="WizLingo"
            className="h-64 lg:h-80 mb-12 lg:mb-16"
          />

          {/* Content - Minimal and Clean */}
          <div className="text-white text-center space-y-6">
            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Master Languages.<br/>Unlock Worlds.
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/80 leading-relaxed">
              AI-powered learning that adapts to you. Progress at your pace, master at your level.
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>

            {/* Simple features */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="text-white/70">Personalized AI learning paths</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span className="text-white/70">Master reading, writing, speaking, listening</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-white/70">Join 10M+ global learners</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP FORM */}
      <div className="flex-1 flex flex-col justify-center items-center lg:items-end p-6 sm:p-12 lg:w-1/2 lg:pr-20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6">
            <img src="/wizlingo-logo.png" alt="WizLingo" className="h-16" />
          </div>

        {/* Floating Card Effect */}
        <div className="w-full relative">
          {/* Subtle shadow backdrop */}
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/40 to-orange-100/40 rounded-3xl blur-xl hidden lg:block"></div>

          {/* Form Card */}
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Get Started
              </h2>
              <p className="text-gray-600 mb-8">Join millions learning smarter, not harder</p>

              {/* Tabs */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setSignupType('b2b')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    signupType === 'b2b'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🏫 School
                </button>
                <button
                  onClick={() => setSignupType('b2c')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    signupType === 'b2c'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  👨‍🎓 Individual
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              {/* Forms */}
              {signupType === 'b2b' && (
                <form onSubmit={handleB2bSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={b2bForm.name}
                      onChange={(e) => setB2bForm({ ...b2bForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Raj Kumar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={b2bForm.dob}
                      onChange={(e) => setB2bForm({ ...b2bForm, dob: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Grade Category</label>
                    <select
                      value={b2bForm.gradeCategory}
                      onChange={(e) => setB2bForm({ ...b2bForm, gradeCategory: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="PREPRIMARY">Pre-Primary (3-5 years)</option>
                      <option value="GR_1_3">Grade 1-3 (6-9 years)</option>
                      <option value="GR_4_7">Grade 4-7 (10-13 years)</option>
                      <option value="GR_8_10">Grade 8-10 (14-16 years)</option>
                      <option value="GR_11_12">Grade 11-12 (17-18 years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={b2bForm.email}
                      onChange={(e) => setB2bForm({ ...b2bForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="raj@school.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      required
                      value={b2bForm.password}
                      onChange={(e) => setB2bForm({ ...b2bForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={b2bForm.confirmPassword}
                      onChange={(e) => setB2bForm({ ...b2bForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Creating Account...' : '✨ Become a Language Wizard'}
                  </button>
                </form>
              )}

              {signupType === 'b2c' && (
                <form onSubmit={handleB2cSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={b2cForm.name}
                      onChange={(e) => setB2cForm({ ...b2cForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Priya Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={b2cForm.dob}
                      onChange={(e) => setB2cForm({ ...b2cForm, dob: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Grade Category</label>
                    <select
                      value={b2cForm.gradeCategory}
                      onChange={(e) => setB2cForm({ ...b2cForm, gradeCategory: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="PREPRIMARY">Pre-Primary (3-5 years)</option>
                      <option value="GR_1_3">Grade 1-3 (6-9 years)</option>
                      <option value="GR_4_7">Grade 4-7 (10-13 years)</option>
                      <option value="GR_8_10">Grade 8-10 (14-16 years)</option>
                      <option value="GR_11_12">Grade 11-12 (17-18 years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      pattern="\d{10}"
                      value={b2cForm.phone}
                      onChange={(e) => setB2cForm({ ...b2cForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="9876543210"
                    />
                    <p className="text-xs text-slate-500 mt-2">10 digits. Phone is your password.</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <strong className="text-blue-900">🧙 Your WizLingo ID:</strong>
                    <p className="text-sm text-blue-800 mt-1">Auto-generated (WL + 6 digits)</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Creating Account...' : '✨ Become a Language Wizard'}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="my-6 border-t border-slate-200"></div>

              {/* Login link */}
              <p className="text-center text-slate-700">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-bold text-blue-600 hover:text-blue-700 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
