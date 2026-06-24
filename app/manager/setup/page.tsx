'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ManagerSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ready' | 'initializing' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Checking system status...');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const res = await fetch('/api/manager/init', {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('✅ Manager system is ready!');
        setCredentials({
          email: data.manager.email,
          password: data.manager.password
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/manager/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to initialize');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Connection error');
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setStatus('initializing');
    setMessage('Initializing manager system...');
    await checkSystemStatus();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/wiziingo-logo.svg"
              alt="WizLingo"
              width={120}
              height={120}
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WizLingo Manager</h1>
          <p className="text-gray-600">Platform Setup Wizard</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            {status === 'checking' || status === 'initializing' ? (
              <>
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="text-gray-600 font-medium">{message}</p>
              </>
            ) : status === 'success' ? (
              <>
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Ready to Use!</h2>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your login credentials:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Email:</p>
                      <p className="font-mono bg-white p-2 rounded border border-gray-200">
                        {credentials.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Password:</p>
                      <p className="font-mono bg-white p-2 rounded border border-gray-200">
                        {credentials.password}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Redirecting to login page...
                </p>

                <button
                  onClick={() => router.push('/manager/login')}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Go to Login
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">Setup Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-red-700">Troubleshooting:</p>
                  <ul className="text-sm text-red-600 space-y-2 mt-2">
                    <li>✓ Check if database is running</li>
                    <li>✓ Verify DATABASE_URL is set</li>
                    <li>✓ Try again in a few seconds</li>
                  </ul>
                </div>

                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Retrying...' : 'Try Again'}
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              This setup runs once automatically. <br />
              After setup, login at <span className="font-mono">/manager/login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
