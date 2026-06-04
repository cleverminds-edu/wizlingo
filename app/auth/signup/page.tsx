"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition";

const GRADES = [
  { value: "1", label: "Grade I" },
  { value: "2", label: "Grade II" },
  { value: "3", label: "Grade III" },
  { value: "4", label: "Grade IV" },
  { value: "5", label: "Grade V" },
  { value: "6", label: "Grade VI" },
  { value: "7", label: "Grade VII" },
  { value: "8", label: "Grade VIII" },
  { value: "9", label: "Grade IX" },
  { value: "10", label: "Grade X" },
];

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grade: "",
    dateOfBirth: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate
    if (!formData.name || !formData.email || !formData.grade || !formData.dateOfBirth) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          grade: formData.grade,
          dateOfBirth: formData.dateOfBirth,
          accountType: "PUBLIC",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success! Show success message and redirect to verification page
      setSuccess(true);
      setFormData({ name: "", email: "", grade: "", dateOfBirth: "" });

      // Redirect to verification page after short delay
      setTimeout(() => {
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to WizLingo!</h1>
          <p className="text-gray-600 mb-6">
            Check your email for a welcome message and verification link. We're redirecting you now...
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Left panel — features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-orange-500 via-orange-600 to-purple-600">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none">WizLingo</p>
            <p className="text-orange-100 text-xs mt-0.5">Read. Speak. Excel.</p>
          </div>
        </div>

        <div className="text-white space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Start Your English <br />
            Journey Today
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-semibold">AI-Powered Reading</p>
                <p className="text-orange-100 text-sm">Practice with passages that adapt to your level</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="font-semibold">Confident Speaking</p>
                <p className="text-orange-100 text-sm">Build fluency through natural conversations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-semibold">Earn Badges</p>
                <p className="text-orange-100 text-sm">Unlock Word Wizard, Voice Wizard & more</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-orange-100 text-xs">
          © 2026 WizLingo by Edvanta — The Digital Advantage for Schools
        </p>
      </div>

      {/* Right panel — signup form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <p className="text-gray-900 font-extrabold text-lg leading-none">WizLingo</p>
              <p className="text-gray-500 text-xs">Read. Speak. Excel.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
              <p className="text-gray-600 text-sm mt-1">Join thousands of students mastering English</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. priya@school.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                  required
                />
              </div>

              {/* Grade Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className={INPUT_CLASS + " appearance-none cursor-pointer"}
                  required
                >
                  <option value="">Select your grade...</option>
                  {GRADES.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date of Birth Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:scale-105"
              >
                {loading ? "Creating Account…" : "Create My Account"}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By signing up, you agree to our{" "}
                <a href="/terms" className="text-orange-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-orange-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-orange-600 font-semibold hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
