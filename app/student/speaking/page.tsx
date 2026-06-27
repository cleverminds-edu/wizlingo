"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SpeakingHomePage() {
  const router = useRouter();

  useEffect(() => {
    async function startRandomTopic() {
      try {
        console.log('🎤 Loading topics...');
        const topicsRes = await fetch("/api/speaking/topics", { credentials: "include" });

        if (!topicsRes.ok) {
          console.error('Failed to load topics');
          router.push("/student/dashboard");
          return;
        }

        const topicsData = await topicsRes.json();
        const topics = topicsData.topics || [];

        if (!topics.length) {
          console.error('No topics available');
          router.push("/student/dashboard");
          return;
        }

        // Pick random topic
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        console.log('🎯 Selected random topic:', randomTopic.title);

        // Create session with this topic
        const sessionRes = await fetch("/api/speaking/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ topicId: randomTopic.id }),
        });

        if (!sessionRes.ok) {
          console.error('Failed to create session');
          router.push("/student/dashboard");
          return;
        }

        const session = await sessionRes.json();
        console.log('✅ Session created:', session.id);
        router.push(`/student/speaking/session?sessionId=${session.id}&topicId=${randomTopic.id}`);
      } catch (error) {
        console.error('❌ Error:', error);
        router.push("/student/dashboard");
      }
    }

    startRandomTopic();
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
