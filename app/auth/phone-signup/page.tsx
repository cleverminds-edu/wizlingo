'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PhoneSignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new B2C signup form (Name + DOB + Class + Phone)
    router.replace('/auth/signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}
