"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WizAdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wizadmin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) { setError("Invalid secret key"); return; }
      router.push("/wizadmin/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧙</div>
          <h1 className="text-2xl font-black text-white">WizLingo Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Internal school management panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-8 space-y-4 border border-white/10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Secret Key</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
              placeholder="Enter admin secret key"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            {loading ? "Signing in…" : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
