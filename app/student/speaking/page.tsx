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

export default function SpeakingHomePage() {
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/speaking/topics", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch((e) => {
        if (e === 401) router.push("/login");
        else setError("Could not load topics. Please try again.");
      })
      .finally(() => setLoading(false));
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
      setError("Could not start session. Please try again.");
      setStarting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-center">
          <div className="text-7xl animate-float mb-4">🎤</div>
          <p className="text-purple-200 font-bold text-xl">Finding topics for you…</p>
        </div>
      </div>
    );
  }

  const level = data?.level ?? 1;
  const levelInfo = LEVEL_INFO[level - 1];

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <button onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
          <span className="font-medium">Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <Image src="/edvanta-logo1.png" alt="Edvanta" width={100} height={28}
            className="brightness-0 invert opacity-70" />
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <span className="text-lg">{levelInfo.emoji}</span>
          <span className="text-white font-bold text-sm">Level {level} {levelInfo.label}</span>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 max-w-4xl w-full mx-auto">

        {/* Hero */}
        <div className={`rounded-3xl p-8 mb-8 text-white bg-gradient-to-br ${levelInfo.color} shadow-2xl relative overflow-hidden`}>
          <div className="absolute -right-8 -top-8 text-[150px] leading-none opacity-10 select-none">🎤</div>
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">SpeakSmart · Conversation Practice</p>
            <h1 className="text-4xl font-black mb-2">Choose a Topic</h1>
            <p className="text-white/80 text-lg">
              Pick something you like — then have a real conversation with your practice partner!
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl px-6 py-4 mb-6">
            {error}
          </div>
        )}

        {!data?.topics?.length && !loading && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-white font-bold text-xl">No topics available yet</p>
            <p className="text-purple-400 mt-2">Ask your teacher to set up speaking topics.</p>
          </div>
        )}

        {/* Topic grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.topics ?? []).map((topic) => {
            const char = CHARACTER_INFO[topic.character] ?? { emoji: "🤖", from: "", tagline: "" };
            const emoji = TOPIC_EMOJIS[topic.title] ?? "💬";
            const isLoading = starting === topic.id;

            return (
              <button key={topic.id} onClick={() => startSession(topic.id)}
                disabled={!!starting}
                className="group text-left bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                <div className="text-4xl mb-3">{isLoading ? "⏳" : emoji}</div>
                <h3 className="text-white font-bold text-lg mb-1">{topic.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{char.emoji}</span>
                  <span className="text-purple-300 text-sm">with {topic.character} from {char.from}</span>
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
      </main>
    </div>
  );
}
