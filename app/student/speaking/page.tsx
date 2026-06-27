"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { CHARACTER_INFO } from "@/lib/speaking-topics";

interface Topic {
  id: string;
  title: string;
  character: string;
  openingLine: string;
}

interface PageData {
  topics: Topic[];
  gradeBand: string;
  level: number;
}

const LEVEL_INFO = [
  { label: "Starter",  emoji: "🌱", color: "from-green-400 to-emerald-600" },
  { label: "Explorer", emoji: "🚀", color: "from-blue-400 to-indigo-600"   },
  { label: "Fluent",   emoji: "🏆", color: "from-yellow-400 to-orange-500" },
];

const TOPIC_EMOJIS: Record<string, string> = {
  "My Family": "👨‍👩‍👧‍👦",
  "My Pet or Favourite Animal": "🐾",
  "My Favourite Food": "🍛",
  "My School Day": "🎒",
  "My Best Friend": "🤝",
  "Colours and Art": "🎨",
  "Diwali Festival": "🪔",
  "My Favourite Game": "🎮",
  "The Monsoon Season": "🌧️",
  "Summer Holidays": "☀️",
  "My Favourite Sport": "🏏",
  "Indian Festivals": "🎉",
  "A Book I Recently Read": "📚",
  "A Place I Want to Visit": "✈️",
  "Wildlife in India": "🐯",
  "Nature and Environment": "🌿",
  "A Famous Indian I Admire": "⭐",
  "Science in Daily Life": "🔬",
  "My Favourite Subject": "📐",
  "Technology in School": "💻",
  "India's Heritage and Monuments": "🏛️",
  "Cricket and Indian Sports": "🏏",
  "Climate Change and Our Lives": "🌍",
  "Social Media and Youth": "📱",
  "My Career Dreams": "🌟",
  "Inspiring Women of India": "👩‍🔬",
  "India's Space Programme": "🚀",
  "Career Choices After Class 10": "🎓",
  "Technology and Society": "⚡",
  "Indian Identity and Culture": "🇮🇳",
  "Climate Change and India's Response": "🌱",
  "Education System in India": "📖",
  "Entrepreneurship and Innovation in India": "💡",
  "India's Role in a Changing World": "🌏",
  "Artificial Intelligence: Opportunity or Threat?": "🤖",
  "Democracy, Youth, and Civic Life": "🗳️",
};

const FEMALE_CHARACTERS = ["Mom", "Sarah", "Emma", "Aisha", "Teacher", "Chef", "Librarian", "Maya", "Eco"];
const MALE_CHARACTERS   = ["Alex", "Jamie", "Ravi", "Marco", "Professor", "Mentor", "Coach", "Tech", "Sage", "Explorer"];

export default function SpeakingHomePage() {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [data, setData] = useState<PageData | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [studentGender, setStudentGender] = useState<string | null>(null);

  useEffect(() => {
    // Try to start a free-form session first
    async function startFreeFormSession() {
      try {
        console.log('🎤 Requesting free-form session...');
        const res = await fetch("/api/speaking/sessions/freeform", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        console.log('📡 Response status:', res.status);

        if (res.ok) {
          const session = await res.json();
          console.log('✅ Free-form session created:', { id: session.id });
          router.push(`/student/speaking/session?sessionId=${session.id}&freeform=true`);
          return;
        }

        // If freeform fails, show topic picker as fallback
        const errorData = await res.json();
        console.warn('⚠️ Free-form failed, showing topic picker:', { status: res.status, error: errorData });
      } catch (error) {
        console.error('❌ Error starting session:', error);
      }

      // Fallback: Load topics
      setLoadingSession(false);
      loadTopics();
    }

    async function loadTopics() {
      try {
        const [meRes, topicsRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/speaking/topics", { credentials: "include" }),
        ]);

        if (meRes.ok) {
          const me = await meRes.json();
          if (me?.gender) setStudentGender(me.gender);
        }

        if (topicsRes.ok) {
          const topicsData = await topicsRes.json();
          setData(topicsData);
        }
      } catch (error) {
        console.error('Error loading topics:', error);
      }
    }

    startFreeFormSession();
  }, [router]);

  async function startSession(topicId: string) {
    setStarting(topicId);
    try {
      const res = await fetch("/api/speaking/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topicId }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const session = await res.json();
      router.push(`/student/speaking/session?sessionId=${session.id}&topicId=${topicId}`);
    } catch {
      setStarting(null);
    }
  }

  // Loading state
  if (loadingSession) {
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

  const level = data?.level ?? 1;
  const levelInfo = LEVEL_INFO[level - 1];

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10">
        <button onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium text-sm sm:text-base">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Image src="/wiziingo-logo.svg" alt="WizLingo" width={100} height={28}
            className="brightness-0 invert opacity-70 h-7 w-auto" />
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <span>{levelInfo.emoji}</span>
          <span className="text-white font-bold text-xs">Level {level} {levelInfo.label}</span>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-4 sm:py-8 max-w-4xl w-full mx-auto">
        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8 text-white bg-gradient-to-br ${levelInfo.color} shadow-2xl relative overflow-hidden`}>
          <div className="absolute -right-8 -top-8 text-[100px] sm:text-[150px] leading-none opacity-10 select-none">🎤</div>
          <div className="relative z-10">
            <p className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">WizLingo · Practice</p>
            <h1 className="text-2xl sm:text-4xl font-black mb-2">Pick a Topic</h1>
            <p className="text-white/80 text-sm sm:text-base">
              Choose a conversation topic or skip to start instantly!
            </p>
          </div>
        </div>

        {!data?.topics?.length ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-white font-bold text-xl">No topics available yet</p>
            <p className="text-purple-400 mt-2">Ask your teacher to set up speaking topics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.topics ?? [])
              .slice()
              .sort((a, b) => {
                if (!studentGender) return 0;
                const matchedChars = studentGender === "FEMALE" ? FEMALE_CHARACTERS : MALE_CHARACTERS;
                const aMatch = matchedChars.includes(a.character) ? -1 : 1;
                const bMatch = matchedChars.includes(b.character) ? -1 : 1;
                return aMatch - bMatch;
              })
              .map((topic) => {
              const char = CHARACTER_INFO[topic.character] ?? { emoji: "🤖", from: "", tagline: "" };
              const emoji = TOPIC_EMOJIS[topic.title] ?? "💬";
              const isLoading = starting === topic.id;
              const isGenderMatch = studentGender
                ? (studentGender === "FEMALE" ? FEMALE_CHARACTERS : MALE_CHARACTERS).includes(topic.character)
                : false;

              return (
                <button key={topic.id} onClick={() => startSession(topic.id)}
                  disabled={!!starting}
                  className={`group text-left backdrop-blur-sm rounded-3xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed border ${
                    isGenderMatch
                      ? "bg-indigo-500/15 border-indigo-400/40 hover:bg-indigo-500/20"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{isLoading ? "⏳" : emoji}</span>
                    {isGenderMatch && (
                      <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-400/30 font-semibold">
                        ✨ Best match
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{topic.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{char.emoji}</span>
                    <span className="text-purple-300 text-sm">with {topic.character}</span>
                  </div>
                  <p className="text-purple-400 text-sm italic line-clamp-2">"{topic.openingLine}"</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-purple-300">
                      Level {level}
                    </span>
                    <span className="text-purple-400 group-hover:text-white transition-colors text-sm font-semibold">
                      {isLoading ? "Starting…" : "Start →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
