"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SpeakingHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-start a free-form speaking session without topic selection
    async function startFreeFormSession() {
      try {
        const res = await fetch("/api/speaking/sessions/freeform", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          console.error("Failed to create free-form session");
          router.push("/student/dashboard");
          return;
        }

        const session = await res.json();
        router.push(`/student/speaking/session?sessionId=${session.id}&freeform=true`);
      } catch (error) {
        console.error("Error starting session:", error);
        router.push("/student/dashboard");
      }
    }

    startFreeFormSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
      <div className="text-center">
        <div className="text-7xl animate-float mb-4">🎤</div>
        <p className="text-purple-200 font-bold text-xl">Starting your speaking session…</p>
      </div>
    </div>
  );
}
