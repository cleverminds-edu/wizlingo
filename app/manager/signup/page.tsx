'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ManagerSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'details' | 'organization' | 'success'>('details')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [organizationName, setOrganizationName] = useState('')
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
      setStep('organization')
      return
    }

    if (step === 'organization') {
      if (!organizationName) {
        setError('Organization name is required')
        return
      }
      if (!acceptTerms) {
        setError('Please accept the terms and conditions')
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/manager/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name,
            phone: phone || undefined,
            organizationName,
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Signup failed')
          return
        }

        // Save token and redirect
        localStorage.setItem('managerToken', data.token)
        localStorage.setItem('manager', JSON.stringify(data.manager))
        setStep('success')

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/manager/dashboard')
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {name}!</h1>
          <p className="text-gray-600 mb-6">Your manager account has been created successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">WizLingo</h1>
        <p className="text-gray-600 mb-8">Global Manager Registration</p>

        {/* Step indicator */}
        <div className="flex justify-between mb-8">
          <div className={`flex-1 h-2 rounded-full mr-2 ${step === 'details' || step === 'organization' || step === 'success' ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full mr-2 ${step === 'organization' || step === 'success' ? 'bg-purple-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full ${step === 'success' ? 'bg-purple-600' : 'bg-gray-200'}`} />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Rajesh Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="rajesh@organization.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}

          {step === 'organization' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Organization Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="EduGroup India Pvt Ltd"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your company or education organization name</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">As a Global Manager, you can:</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Manage multiple schools</li>
                  <li>✓ Monitor cross-school analytics</li>
                  <li>✓ Track student progress across organization</li>
                  <li>✓ Generate school-wide reports</li>
                </ul>
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
                  I accept the <Link href="#" className="text-purple-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-purple-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 mt-6">
            {step === 'organization' && (
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
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? 'Creating...' : step === 'details' ? 'Next' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/manager/dashboard" className="text-purple-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
