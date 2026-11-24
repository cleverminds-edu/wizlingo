'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeacherSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'details' | 'school' | 'success'>('details')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolCity, setSchoolCity] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step === 'details') {
      if (!email || !password || !name) {
        setError('Email, password, and name are required')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      setStep('school')
      return
    }

    if (step === 'school') {
      if (!schoolName) {
        setError('School name is required')
        return
      }
      if (!acceptTerms) {
        setError('Please accept the terms and conditions')
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/teacher/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name,
            phone: phone || undefined,
            schoolName,
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Signup failed')
          return
        }

        // Save token and redirect
        localStorage.setItem('teacherToken', data.token)
        localStorage.setItem('teacher', JSON.stringify(data.teacher))
        setStep('success')

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/teacher/dashboard')
        }, 2000)
      } catch (err) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {name}!</h1>
          <p className="text-gray-600 mb-6">Your teacher account has been created successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">WizLingo</h1>
        <p className="text-gray-600 mb-8">Teacher Registration</p>

        {/* Step indicator */}
        <div className="flex justify-between mb-8">
          <div className={`flex-1 h-2 rounded-full mr-2 ${step === 'details' || step === 'school' || step === 'success' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full mr-2 ${step === 'school' || step === 'success' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full ${step === 'success' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {step === 'details' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Priya Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="priya@school.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}

          {step === 'school' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">School Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Delhi Public School"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
                <input
                  type="text"
                  value={schoolCity}
                  onChange={(e) => setSchoolCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="New Delhi"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-900">
                  <strong>Next step:</strong> Create classes and invite students to join using unique class codes.
                </p>
              </div>

              <div className="flex items-start mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I accept the <Link href="#" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 mt-6">
            {step === 'school' && (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? 'Creating...' : step === 'details' ? 'Next' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/teacher/dashboard" className="text-indigo-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
