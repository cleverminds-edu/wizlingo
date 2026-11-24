'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '',
    phone: '',
    userId: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    try {
      const body: any = { password: form.password }

      if (loginMethod === 'email') {
        if (!form.email) {
          setError('Please enter your email')
          setLoading(false)
          return
        }
        body.email = form.email
      } else {
        if (form.userId) {
          if (!form.userId.startsWith('WL')) {
            setError('UserID must start with WL')
            setLoading(false)
            return
          }
          body.userId = form.userId
        } else if (form.phone) {
          if (!/^\d{10}$/.test(form.phone)) {
            setError('Phone must be 10 digits')
            setLoading(false)
            return
          }
          body.phone = form.phone
        } else {
          setError('Please enter your phone or UserID')
          setLoading(false)
          return
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      setSuccess('Welcome back! Redirecting...')
      localStorage.setItem('token', data.token)
      localStorage.setItem('studentId', data.student.id)
      if (data.student.userId) {
        localStorage.setItem('userId', data.student.userId)
      }
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
              Welcome Back,<br/>Wizard
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/80 leading-relaxed">
              Continue where you left off. Your learning journey awaits.
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>

            {/* Simple status items */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="text-white/70">Your lessons are waiting</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span className="text-white/70">Progress saved and ready</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-white/70">New achievements to unlock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex-1 flex flex-col justify-center items-center lg:items-end p-6 sm:p-12 lg:w-1/2 lg:pr-20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6">
            <img src="/wizlingo-logo.png" alt="WizLingo" className="h-16" />
          </div>

        {/* Floating Card Effect */}
        <div className="w-full relative">
          {/* Subtle shadow backdrop */}
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-3xl blur-xl hidden lg:block"></div>

          {/* Form Card */}
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Welcome Back
              </h2>
              <p className="text-slate-600 mb-8">Continue your language journey</p>

              {/* Tabs */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    loginMethod === 'email'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📧 Email
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    loginMethod === 'phone'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📱 Phone/ID
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {loginMethod === 'email' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="raj@school.com"
                    />
                  </div>
                )}

                {loginMethod === 'phone' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone or WizLingo ID</label>
                    <input
                      type="text"
                      value={form.userId || form.phone}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val.startsWith('WL')) {
                          setForm({ ...form, userId: val, phone: '' })
                        } else {
                          setForm({ ...form, phone: val, userId: '' })
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="9876543210 or WL123456"
                    />
                    <p className="text-xs text-slate-500 mt-2">Phone (10 digits) or UserID (WL + 6 digits)</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••"
                  />
                  {loginMethod === 'phone' && (
                    <p className="text-xs text-slate-500 mt-2">First time? Use your phone as password</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" className="rounded border-slate-300" />
                    Remember me
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 transition">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? 'Logging in...' : '✨ Continue Your Journey'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 border-t border-slate-200"></div>

              {/* Signup link */}
              <p className="text-center text-slate-700">
                New to WizLingo?{' '}
                <Link href="/auth/signup" className="font-bold text-blue-600 hover:text-blue-700 transition">
                  Start here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
