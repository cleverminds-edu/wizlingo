"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Role = "student" | "teacher" | "admin";

const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

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
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f3e8ff 100%)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #1e3a8a 0%, #3730a3 60%, #6d28d9 100%)" }}>
        {/* Dark-background logo — SVG so no white patch */}
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="url(#eg)"/>
            <text x="7" y="26" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="white">E</text>
            <defs>
              <linearGradient id="eg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8"/>
                <stop offset="100%" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
          </svg>
          <div>
            <p className="text-white font-extrabold text-xl leading-none tracking-tight">Edvanta</p>
            <p className="text-indigo-300 text-xs mt-0.5">The Digital Advantage for Schools</p>
          </div>
        </div>

        <div className="text-white space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            ReadSmart<br />
            <span className="text-blue-300">Reading Skills</span><br />
            Platform
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Personalised reading assessment for<br />
            Grade I to Grade X — powered by AI.
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
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo — on white background, no filter needed */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image src="/edvanta-logo1.png" alt="Edvanta" width={140} height={36} />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to ReadSmart</p>
            </div>

            {/* Role selector */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6 gap-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}
