"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Role = "student" | "teacher" | "admin";

const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

const DEMO_ROLES = [
  { icon: "🎓", label: "Principal",          color: "#2563eb", body: { role: "admin",    empCode: "EMP001",      pin: "1111" }, redirect: "/admin/dashboard" },
  { icon: "📚", label: "Academic Incharge",  color: "#0891b2", body: { role: "admin",    empCode: "EMP002",      pin: "2222" }, redirect: "/admin/dashboard" },
  { icon: "🍎", label: "Teacher",            color: "#10b981", body: { role: "teacher",  empCode: "EMP101",      pin: "3333" }, redirect: "/teacher/dashboard" },
  { icon: "👦", label: "Student",            color: "#f59e0b", body: { role: "student",  admissionNumber: "EDV2024001", pin: "1234" }, redirect: "/student/dashboard" },
];

const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Principal / Incharge",
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({ admissionNumber: "", pin: "" });
  const [staffForm, setStaffForm] = useState({ empCode: "", pin: "" });
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function handleDemoLogin(label: string, body: object, redirect: string) {
    setDemoLoading(label);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Demo login failed"); return; }
      router.push(redirect);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDemoLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body =
      role === "student"
        ? { role, ...studentForm }
        : { role, ...staffForm };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }

      if (role === "student") router.push("/student/dashboard");
      else if (role === "teacher") router.push("/teacher/dashboard");
      else router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1a1a2e 75%, #16213e 100%)" }}>
      {/* Animated background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10"
        style={{ background: "linear-gradient(160deg, #1e3a8a 0%, #3730a3 50%, #6d28d9 100%)" }}>
        {/* WizLingo Logo */}
        <div className="space-y-8">
          <div className="relative inline-block">
            <Image
              src="/wiziingo-logo.svg"
              alt="WizLingo"
              width={100}
              height={50}
              className="h-12 w-auto drop-shadow-md"
            />
            <span className="absolute -top-2 -right-2 text-xl animate-bounce">✨</span>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <p className="text-white text-lg font-bold">Welcome to WizLingo</p>
            <p className="text-blue-100 text-sm leading-relaxed">
              AI-powered reading and speaking practice for Grade I to Grade X. Trusted by 50+ schools across India.
            </p>
          </div>
        </div>

        <div className="text-white space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            WizLingo<br />
            <span className="text-blue-300">Read. Speak.</span><br />
            Excel.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            AI-powered reading & speaking practice for<br />
            Grade I to Grade X — powered by Edvanta.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            {["Grades I–X", "3 Levels", "AI Scoring", "Live Dashboard"].map((tag) => (
              <span key={tag} className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">
          © 2026 Edvanta — The Digital Advantage for Schools
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 30%, #f0f4ff 60%, #e0e7ff 100%)" }}>
        {/* Subtle gradient orbs in background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-yellow-200 to-yellow-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-200 to-purple-300/20 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full max-w-md relative z-20">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 space-y-3 text-center relative z-20">
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src="/wiziingo-logo.svg"
                  alt="WizLingo"
                  width={100}
                  height={50}
                  className="h-12 w-auto drop-shadow-md"
                />
                <span className="absolute -top-2 -right-2 text-xl animate-bounce">✨</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium">Sign in to WizLingo</p>
          </div>

          <div className="bg-gradient-to-br from-white via-blue-50/80 to-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100/60 backdrop-blur-sm">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-cyan-400 rounded-full"></div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Welcome back</h1>
              </div>
              <p className="text-gray-600 text-sm">Sign in to continue your WizLingo journey</p>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Select your role</p>
              <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
                {(["student", "teacher", "admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      role === r
                        ? "bg-white shadow text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {role === "student" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EDV2024001"
                      value={studentForm.admissionNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, admissionNumber: e.target.value.trim() })}
                      className={INPUT_CLASS}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your PIN"
                      maxLength={6}
                      value={studentForm.pin}
                      onChange={(e) => setStudentForm({ ...studentForm, pin: e.target.value })}
                      className={INPUT_CLASS}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EMP001"
                      value={staffForm.empCode}
                      onChange={(e) => setStaffForm({ ...staffForm, empCode: e.target.value.trim() })}
                      className={INPUT_CLASS}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your PIN"
                      maxLength={6}
                      value={staffForm.pin}
                      onChange={(e) => setStaffForm({ ...staffForm, pin: e.target.value })}
                      className={INPUT_CLASS}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                style={{ background: loading ? "#93a3d4" : "linear-gradient(135deg, #1e3a8a, #3730a3)" }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="mt-4 text-xs text-center text-gray-400">
            {role === "student"
              ? "Your admission number and PIN are provided by your school"
              : "Your employee code and PIN are issued by your school administrator"}
          </p>

            {/* Signup Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                New user? <a href="/auth/phone-signup" className="text-blue-600 hover:underline font-semibold">Start here</a>
              </p>
            </div>
          </div>

          {/* Demo role picker */}
          <div className="mt-8 relative z-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <p className="text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Or try demo</p>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handleDemoLogin(r.label, r.body, r.redirect)}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-md disabled:opacity-50"
                  style={{ borderColor: r.color + "40", background: r.color + "08" }}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.label}</p>
                    <p className="text-xs" style={{ color: r.color }}>
                      {demoLoading === r.label ? "Signing in…" : "Try demo"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
