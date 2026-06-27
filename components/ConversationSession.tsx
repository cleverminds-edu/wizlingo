"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CHARACTER_INFO } from "@/lib/speaking-topics";
import { TurnRecord, scoreTurn } from "@/lib/speaking-score";
import { ConversationTurn } from "@/lib/ai-conversation";
import { generateSmartResponse } from "@/lib/smart-responses";

interface ConversationSessionProps {
  sessionId: string;
  character: string;
  openingLine: string;
  topicTitle: string;
  gradeBand: string;
  maxTurns: number;
  turnTimeSec: number;
  onComplete: (result: { turns: TurnRecord[]; totalWords: number; durationSec: number }) => void;
}

type Phase = "intro" | "ai-speaking" | "ai-thinking" | "student-speaking" | "between-turns" | "done";

interface SpeechRecognitionInstance {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  start(): void; stop(): void; abort(): void;
}
interface SpeechRecognitionEvent extends Event { resultIndex: number; results: SpeechRecognitionResultList; }
interface SpeechRecognitionResultList { length: number; [i: number]: SpeechRecognitionResult; }
interface SpeechRecognitionResult { isFinal: boolean; [i: number]: { transcript: string }; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function getBrowserMicrophoneGuide() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  const isChrome = ua.includes("chrome") || ua.includes("edge") || ua.includes("brave");
  const isFirefox = ua.includes("firefox");
  const isSafari = ua.includes("safari") && !ua.includes("chrome");

  if (isChrome) {
    return {
      shortMessage: "🔒 Microphone blocked. Allow permission to continue.",
      fullGuide: `
🔒 HOW TO ALLOW MICROPHONE (Chrome/Edge/Brave)

Step 1: Look at the address bar (top left)
Step 2: Click the 🔒 LOCK ICON next to the URL
Step 3: Find "Microphone" in the dropdown
Step 4: Click it and select ✅ "Allow"
Step 5: REFRESH the page (Press Ctrl+R or Cmd+R)
Step 6: Try the speaking session again!

📍 If you still see an error:
   Settings → Privacy & Security → Site Settings → Microphone
   Find wizlingo.edvanta.co.in → Change to "Allow"
   Refresh and try again.

Questions? Try a different browser if issues persist.
      `
    };
  } else if (isFirefox) {
    return {
      shortMessage: "🔒 Microphone blocked. Allow permission to continue.",
      fullGuide: `
🔒 HOW TO ALLOW MICROPHONE (Firefox)

Step 1: Look at the address bar (top left)
Step 2: Click the 🔒 LOCK ICON next to the URL
Step 3: Look for "Microphone" permission
Step 4: Change it from ❌ "Block" to ✅ "Allow"
Step 5: REFRESH the page (Press Ctrl+R or Cmd+R)
Step 6: Try the speaking session again!

Questions? Try a different browser if issues persist.
      `
    };
  } else if (isSafari) {
    return {
      shortMessage: "🔒 Microphone blocked. Allow permission to continue.",
      fullGuide: `
🔒 HOW TO ALLOW MICROPHONE (Safari)

Step 1: Click Safari menu (top left)
Step 2: Click "Settings" or "Preferences"
Step 3: Go to "Websites" tab
Step 4: Select "Microphone" in the left sidebar
Step 5: Find wizlingo.edvanta.co.in
Step 6: Change from "Deny" to "Allow"
Step 7: Close settings
Step 8: REFRESH the page (Press Cmd+R)
Step 9: Try the speaking session again!

Questions? Try Chrome or Firefox if issues persist.
      `
    };
  } else {
    return {
      shortMessage: "🔒 Microphone blocked. Allow permission to continue.",
      fullGuide: `
🔒 HOW TO ALLOW MICROPHONE

Your browser is blocking microphone access.

1️⃣ Look for the 🔒 LOCK ICON in the address bar
2️⃣ Click it and find "Microphone" permission
3️⃣ Change from ❌ "Block" to ✅ "Allow"
4️⃣ REFRESH the page
5️⃣ Try the speaking session again!

💡 BEST BROWSERS FOR THIS:
   ✅ Chrome, Edge, Brave (easiest)
   ✅ Firefox
   ✅ Safari

If you still have problems:
- Try a different browser
- Make sure your device has a working microphone
- Check system microphone permissions (Settings)
      `
    };
  }
}

const FEMALE_CHARACTERS = ["Meera", "Priya", "Mom", "Sarah", "Emma", "Aisha", "Teacher", "Chef", "Librarian", "Maya", "Eco"];
const MALE_CHARACTERS = ["Alex", "Jamie", "Ravi", "Marco", "Professor", "Mentor", "Coach", "Tech", "Sage"];

// Character personality profiles with voice modulation (slower = more natural, less robotic)
const CHARACTER_VOICE_PROFILES: Record<string, { pitch: number; rate: number; volume?: number; warmth?: string }> = {
  // Parent/Family - very warm, slow conversational pace
  "Mom": { pitch: 1.45, rate: 0.65, warmth: "warm" },
  // Friends - friendly, conversational, slower
  "Alex": { pitch: 0.85, rate: 0.68, warmth: "friendly" },
  "Sarah": { pitch: 1.40, rate: 0.66, warmth: "friendly" },
  "Jamie": { pitch: 0.86, rate: 0.68, warmth: "casual" },
  "Ravi": { pitch: 0.82, rate: 0.66, warmth: "enthusiastic" },
  "Aisha": { pitch: 1.42, rate: 0.67, warmth: "energetic" },
  "Emma": { pitch: 1.40, rate: 0.67, warmth: "friendly" },
  "Meera": { pitch: 1.38, rate: 0.66, warmth: "warm" },
  // Mentors/Teachers - clear, measured pace
  "Teacher": { pitch: 1.35, rate: 0.64, warmth: "encouraging" },
  "Professor": { pitch: 0.80, rate: 0.62, warmth: "thoughtful" },
  "Chef": { pitch: 0.88, rate: 0.67, warmth: "enthusiastic" },
  "Librarian": { pitch: 1.32, rate: 0.64, warmth: "thoughtful" },
  "Explorer": { pitch: 0.87, rate: 0.68, warmth: "energetic" },
  "Coach": { pitch: 0.84, rate: 0.66, warmth: "motivating" },
  "Tech": { pitch: 0.87, rate: 0.68, warmth: "excited" },
  "Sage": { pitch: 0.79, rate: 0.61, warmth: "wise" },
  "Maya": { pitch: 1.36, rate: 0.66, warmth: "curious" },
  "Eco": { pitch: 1.34, rate: 0.67, warmth: "passionate" },
  "Mentor": { pitch: 0.85, rate: 0.65, warmth: "encouraging" },
  "Marco": { pitch: 0.86, rate: 0.68, warmth: "adventurous" },
  // Priya - analytical, slower
  "Priya": { pitch: 1.38, rate: 0.63, warmth: "curious" },
  // Rohan - cool, casual
  "Rohan": { pitch: 0.88, rate: 0.69, warmth: "cool" },
  // Arjun - energetic
  "Arjun": { pitch: 0.86, rate: 0.67, warmth: "energetic" },
};

// Topic-based rate and pitch modulation (subtle, natural)
const TOPIC_VOICE_MODS: Record<string, { rateMod: number; pitchMod: number }> = {
  "Breakfast": { rateMod: -0.02, pitchMod: 0.03 }, // Slightly slower, warmer
  "Pet": { rateMod: 0.02, pitchMod: 0.04 }, // Slightly excited
  "School": { rateMod: 0.0, pitchMod: 0.0 }, // Natural
  "Weather": { rateMod: 0.01, pitchMod: 0.02 }, // Conversational
  "Adventure": { rateMod: 0.03, pitchMod: 0.04 }, // Slightly faster, excited
  "Movie": { rateMod: 0.02, pitchMod: 0.03 }, // Slightly enthusiastic
  "Sports": { rateMod: 0.03, pitchMod: 0.02 }, // Slightly energetic
  "Hobby": { rateMod: 0.02, pitchMod: 0.03 }, // Slightly enthusiastic
  "Travel": { rateMod: 0.02, pitchMod: 0.04 }, // Slightly excited
  "Science": { rateMod: -0.02, pitchMod: -0.02 }, // Slightly measured
  "Food": { rateMod: 0.01, pitchMod: 0.03 }, // Slightly warm
  "Music": { rateMod: 0.03, pitchMod: 0.04 }, // Slightly energetic
  "Future": { rateMod: -0.01, pitchMod: 0.02 }, // Thoughtful
  "Technology": { rateMod: 0.02, pitchMod: 0.03 }, // Slightly excited
  "Book": { rateMod: -0.02, pitchMod: 0.01 }, // Thoughtful
  "Environment": { rateMod: -0.01, pitchMod: 0.02 }, // Engaged
  "Culture": { rateMod: 0.0, pitchMod: 0.02 }, // Curious
  "Dream": { rateMod: 0.01, pitchMod: 0.03 }, // Inspiring
  "Friendship": { rateMod: 0.01, pitchMod: 0.03 }, // Warm
  "Learning": { rateMod: -0.01, pitchMod: 0.02 }, // Encouraging
};

// Voice pitch and rate matched to grade band (lower rates sound more natural)
const VOICE_SETTINGS: Record<string, { pitchF: number; pitchM: number; rate: number }> = {
  BAND_1_2:  { pitchF: 1.5, pitchM: 1.2, rate: 0.70 },
  BAND_3_5:  { pitchF: 1.3, pitchM: 1.05, rate: 0.72 },
  BAND_6_8:  { pitchF: 1.1, pitchM: 0.95, rate: 0.75 },
  BAND_9_10: { pitchF: 1.0, pitchM: 0.88, rate: 0.78 },
};

function pickVoice(character: string, gradeBand: string, topicTitle?: string): { voice: SpeechSynthesisVoice | null; pitch: number; rate: number } {
  // Determine character gender for voice matching
  const isFemale = FEMALE_CHARACTERS.includes(character);

  // Get character profile
  let pitch = 1.0;
  let rate = 0.80; // Slower rate = more natural, less robotic

  const charProfile = CHARACTER_VOICE_PROFILES[character];
  if (charProfile) {
    pitch = charProfile.pitch;
    rate = charProfile.rate;
  } else {
    // Fallback to gender-based settings
    const settings = VOICE_SETTINGS[gradeBand] ?? VOICE_SETTINGS.BAND_3_5;
    pitch = isFemale ? settings.pitchF : settings.pitchM;
    rate = settings.rate;
  }

  // Apply topic-based modulation
  if (topicTitle) {
    for (const [topicKey, mod] of Object.entries(TOPIC_VOICE_MODS)) {
      if (topicTitle.toLowerCase().includes(topicKey.toLowerCase())) {
        pitch += mod.pitchMod;
        rate += mod.rateMod;
        break;
      }
    }
  }

  // Clamp values to reasonable ranges
  pitch = Math.max(0.5, Math.min(2.0, pitch));
  rate = Math.max(0.5, Math.min(1.5, rate));

  const voices = window.speechSynthesis.getVoices();
  console.log('🎤 pickVoice:', { character, topicTitle, pitch, rate, availableVoices: voices.length });
  const local  = voices.filter(v => v.localService);
  const pool   = local.length > 0 ? local : voices;

  // Female name hints for voice matching
  const femaleHints = ["samantha", "victoria", "karen", "moira", "veena", "zira", "female", "woman", "girl"];
  const maleHints   = ["daniel", "alex", "tom", "fred", "rishi", "male", "man", "guy"];
  const hints = isFemale ? femaleHints : maleHints;

  let voice: SpeechSynthesisVoice | null = null;

  // Try en-IN first, then en-GB, then any English
  for (const lang of ["en-IN", "en-GB", "en-US", "en"]) {
    const langPool = pool.filter(v => v.lang.startsWith(lang.replace("-", "")));
    voice = langPool.find(v => hints.some(h => v.name.toLowerCase().includes(h))) ?? null;
    if (voice) break;
  }
  // Fallback: any English voice
  if (!voice) voice = pool.find(v => v.lang.startsWith("en")) ?? null;

  return { voice, pitch, rate };
}

export default function ConversationSession({
  sessionId: _sessionId,
  character,
  openingLine,
  topicTitle,
  gradeBand,
  maxTurns,
  turnTimeSec,
  onComplete,
}: ConversationSessionProps) {
  const charInfo = CHARACTER_INFO[character] ?? { emoji: "🤖", from: "", tagline: "" };

  const [phase, setPhase]             = useState<Phase>("intro");
  const [studentTurnCount, setStudentTurnCount] = useState(0);
  const [transcript, setTranscript]   = useState("");
  const [interimText, setInterimText] = useState("");
  const [timeLeft, setTimeLeft]       = useState(turnTimeSec);
  const [recordedTurns, setRecordedTurns] = useState<TurnRecord[]>([]);
  const [browserOk, setBrowserOk]     = useState(true);
  const [micError, setMicError]       = useState("");
  const [micReady, setMicReady]       = useState(false);
  const [currentAiText, setCurrentAiText] = useState(openingLine || "Let's start our conversation!");
  const [history, setHistory]         = useState<ConversationTurn[]>([
    { role: "ai", text: openingLine || "Let's start our conversation!" },
  ]);

  useEffect(() => {
    console.log('🎤 ConversationSession initialized:', {
      character,
      topicTitle,
      openingLine: openingLine ? `${openingLine.substring(0, 30)}...` : 'MISSING',
      phase,
    });
  }, []);

  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef    = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const startTimeRef      = useRef(0);
  const committedRef      = useRef(false);
  const recordedTurnsRef  = useRef<TurnRecord[]>([]);
  const historyRef        = useRef<ConversationTurn[]>([{ role: "ai", text: openingLine }]);
  const studentTurnRef    = useRef(0);
  const finishSpeakRef    = useRef<(() => void) | null>(null);
  const startStudentTurnRef = useRef<() => void>(null!);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  };

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.error('❌ Speech synthesis not available');
      onEnd?.();
      return;
    }
    const synth = window.speechSynthesis;
    console.log('🔊 speakText called:', { textLength: text.length, isSpeaking: synth.speaking, isPending: synth.pending });
    if (synth.speaking || synth.pending) synth.cancel();

    const makeUtter = (withVoice = true) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-IN";
      const { voice, pitch, rate } = pickVoice(character, gradeBand, topicTitle);
      u.pitch = pitch;
      u.rate  = rate;
      if (withVoice && voice) u.voice = voice;
      return u;
    };

    if (!onEnd) { synth.pause(); synth.speak(makeUtter()); synth.resume(); return; }

    let done = false;
    let fallbackId: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
      finishSpeakRef.current = null;
      onEnd();
    };

    finishSpeakRef.current = finish;
    const words = text.trim().split(/\s+/).length;
    const estimatedMs = Math.min((words / 120) * 60_000 + 2000, 30_000);

    const trySpeak = (attempt: number) => {
      if (done) return;
      console.log('🎤 trySpeak attempt:', attempt);
      const utter = makeUtter(attempt === 1);
      let utterDone = false;

      utter.onend = () => {
        console.log('✅ Speech ended');
        if (utterDone || done) return;
        utterDone = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        finish();
      };

      utter.onerror = (e) => {
        console.error('❌ Speech error:', e.error);
        if (utterDone || done) return;
        utterDone = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        if ((e.error === "canceled" || e.error === "interrupted") && attempt < 2) {
          console.log('🔄 Retrying speech...');
          setTimeout(() => trySpeak(2), 300);
        } else {
          finish();
        }
      };

      synth.pause();
      synth.speak(utter);
      synth.resume();

      if (fallbackId) clearTimeout(fallbackId);
      fallbackId = setTimeout(() => { synth.cancel(); finish(); }, estimatedMs);
    };

    trySpeak(1);
  }, [character, gradeBand]);

  // After student turn: call AI or end session
  const commitTurn = useCallback(() => {
    if (committedRef.current) {
      console.log('⚠️  Turn already committed, ignoring duplicate');
      return;
    }

    committedRef.current = true;
    setMicReady(false);
    stopTimer();
    stopRecognition();
    window.speechSynthesis?.cancel();

    // Get the final transcript - use state if ref is empty (speech recognition lag)
    let text = finalTranscriptRef.current.trim();
    if (!text) {
      console.warn('⚠️  finalTranscriptRef empty, checking state...');
      // In case ref wasn't updated, use the transcript state
      text = transcript.trim() || interimText.trim();
    }

    console.log('💾 commitTurn with text:', text.substring(0, 50));
    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const { wordCount, wpm, fillerCount } = scoreTurn(text, durationSec);

    const record: TurnRecord = {
      aiText: currentAiText,
      studentText: text,
      durationSec,
      wordCount,
      wpm,
      fillerCount,
      longPauses: 0,
    };

    const updatedTurns = [...recordedTurnsRef.current, record];
    recordedTurnsRef.current = updatedTurns;
    setRecordedTurns(updatedTurns);

    // Update history with student response
    const updatedHistory: ConversationTurn[] = [
      ...historyRef.current,
      { role: "student", text: text || "..." },
    ];
    historyRef.current = updatedHistory;
    setHistory(updatedHistory);

    const nextTurnCount = studentTurnRef.current + 1;
    studentTurnRef.current = nextTurnCount;
    setStudentTurnCount(nextTurnCount);

    if (nextTurnCount >= maxTurns) {
      const totalWords    = updatedTurns.reduce((s, t) => s + t.wordCount, 0);
      const totalDuration = updatedTurns.reduce((s, t) => s + t.durationSec, 0);
      setPhase("done");
      onComplete({ turns: updatedTurns, totalWords, durationSec: totalDuration });
      return;
    }

    // Fetch next AI response
    setPhase("between-turns");
    const isLastTurn = nextTurnCount >= maxTurns - 1;

    console.log('🤖 Fetching AI response with history:', {
      character,
      topicTitle,
      gradeBand,
      historyLength: updatedHistory.length,
      lastTurn: updatedHistory[updatedHistory.length - 1],
      isLastTurn,
    });

    console.log('🤖 Calling /api/speaking/ai-turn with:', {
      character,
      topicTitle,
      gradeBand,
      historyLen: updatedHistory.length,
      isLastTurn,
    });

    fetch("/api/speaking/ai-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        character,
        topicTitle,
        gradeBand,
        history: updatedHistory,
        isLastTurn,
      }),
    })
      .then(async r => {
        const text = await r.text();
        console.log('📩 AI turn response:', { status: r.status, bodyLen: text.length });
        if (!r.ok) {
          console.error('❌ AI turn API error:', { status: r.status, body: text });
          throw new Error(`API error: ${r.status} - ${text}`);
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('❌ Failed to parse AI response:', text);
          throw new Error('Invalid JSON response');
        }
      })
      .then(({ text: aiResponse }: { text: string }) => {
        if (!aiResponse || typeof aiResponse !== 'string') {
          console.error('❌ Invalid AI response:', aiResponse);
          throw new Error('Invalid response format: ' + JSON.stringify(aiResponse));
        }
        console.log('✅ AI response received:', aiResponse.substring(0, 50));
        const newHistory: ConversationTurn[] = [
          ...historyRef.current,
          { role: "ai", text: aiResponse },
        ];
        historyRef.current = newHistory;
        setHistory(newHistory);
        setCurrentAiText(aiResponse);
        setTranscript("");
        setInterimText("");
        setPhase("ai-speaking");
        speakText(aiResponse, () => startStudentTurnRef.current());
      })
      .catch((err) => {
        console.error('❌ AI turn error:', err);

        // Smart fallback: Generate conversational response that references what student said
        const lastStudentMessage = updatedHistory.length > 0
          ? updatedHistory[updatedHistory.length - 1].text
          : "something interesting";

        const smartResponse = generateSmartResponse({
          character,
          topicTitle,
          studentMessage: lastStudentMessage,
          gradeBand,
          isLastTurn,
        });

        console.log('🎤 Smart fallback response:', smartResponse);
        setCurrentAiText(smartResponse);
        setTranscript("");
        setInterimText("");
        setPhase("ai-speaking");

        // Speak the smart response
        speakText(smartResponse, () => startStudentTurnRef.current());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, topicTitle, gradeBand, maxTurns, onComplete, currentAiText, speakText]);

  const startStudentTurn = useCallback(() => {
    committedRef.current = false;
    finalTranscriptRef.current = "";
    startTimeRef.current = Date.now();
    setTranscript("");
    setInterimText("");
    setTimeLeft(turnTimeSec);
    setElapsed(0);
    setMicError("");
    setMicReady(false);
    setPhase("student-speaking");

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    function startRec() {
      const rec = new SpeechRecognitionCtor!();
      rec.continuous     = true;
      rec.interimResults = true;
      rec.lang           = "en-IN";
      console.log('🎙️  Starting speech recognition...');

      rec.onstart = () => {
        console.log('✅ Speech recognition started');
      };

      rec.onresult = (e: SpeechRecognitionEvent) => {
        let finals = "";
        let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finals += t + " ";
          else interim = t;
        }
        if (finals) {
          console.log('📝 Final transcript captured:', finals.trim());
          finalTranscriptRef.current += finals; // Append to preserve all finals
        }
        if (interim) console.log('💬 Interim:', interim);
        // Update UI with current final transcript
        setTranscript(finalTranscriptRef.current.trim());
        setInterimText(interim);
      };

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        console.error('❌ Speech recognition error:', e.error);
        if (e.error === "not-allowed") {
          console.error('🔒 User denied microphone permission');
          const browserGuide = getBrowserMicrophoneGuide();
          setMicError(browserGuide.shortMessage);
          // Show detailed guide
          setTimeout(() => {
            const fullGuide = browserGuide.fullGuide;
            console.log(fullGuide);
            alert(fullGuide);
          }, 300);
        }
        else if (e.error === "no-speech") {
          console.log('⚠️  No speech detected, restarting...');
          startRec();
        }
        else if (e.error === "network") {
          setMicError("🌐 Network error. Check your internet connection.");
          console.error('Network error in speech recognition');
        }
        else if (e.error !== "aborted") {
          setMicError(`🎙️ Mic error: ${e.error}`);
        }
      };

      rec.onend = () => {
        console.log('🛑 Speech recognition ended, final transcript:', finalTranscriptRef.current.trim());
        // Only auto-restart if user is still in conversation and speech wasn't intentionally stopped
        if (!committedRef.current && !stoppedRef.current && phase === "student-speaking") {
          try {
            rec.start();
          } catch (e) {
            console.error('⚠️ Could not restart speech recognition:', e);
            // Don't keep trying - let user click microphone button again
          }
        }
      };

      try {
        rec.start();
        recognitionRef.current = rec;
        setTimeout(() => setMicReady(true), 600);
        console.log('✅ Microphone started successfully');
      } catch (e) {
        console.error('❌ Could not start microphone:', e);
        setMicError("Could not start microphone. Please check browser permissions.");
      }
    }

    startRec();

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          if (!committedRef.current) commitTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnTimeSec, commitTurn]);

  // Keep ref in sync with latest startStudentTurn
  useEffect(() => { startStudentTurnRef.current = startStudentTurn; }, [startStudentTurn]);

  // elapsed state (separate from countdown timer)
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (phase !== "student-speaking") return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!getSpeechRecognition()) setBrowserOk(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => window.speechSynthesis.getVoices());
    }
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis && !window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10_000);
    return () => {
      clearInterval(keepAlive);
      stopTimer();
      stopRecognition();
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDone() {
    if (committedRef.current) return;
    console.log('🎯 handleDone called, committing turn...');
    // Small delay to ensure speech recognition has captured final words
    setTimeout(() => {
      if (!committedRef.current) commitTurn();
    }, 100);
  }

  if (!browserOk) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-4">🌐</p>
        <p className="text-white font-bold text-xl mb-2">Chrome Required</p>
        <p className="text-purple-300">Please open this page in Google Chrome for the speaking feature.</p>
      </div>
    );
  }

  const progressPct = Math.round((studentTurnCount / maxTurns) * 100);

  return (
    <div className="flex flex-col gap-6">

      {/* Character card */}
      <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/20">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-4xl bg-white/10 border border-white/20 shrink-0">
          {charInfo.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base sm:text-lg">{character}</p>
          <p className="text-purple-300 text-xs sm:text-sm">{charInfo.from}</p>
          <p className="text-purple-400 text-xs mt-0.5 italic hidden sm:block">{charInfo.tagline}</p>
        </div>
        {/* Turn progress */}
        <div className="text-right shrink-0">
          <p className="text-white/60 text-xs mb-1">Turn {Math.min(studentTurnCount + 1, maxTurns)}/{maxTurns}</p>
          <div className="w-20 sm:w-24 bg-white/10 rounded-full h-1.5">
            <div className="bg-purple-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Intro — start button */}
      {phase === "intro" && (
        <div className="text-center py-4 sm:py-6">
          <p className="text-purple-200 text-sm sm:text-lg mb-4 sm:mb-6">
            {character} wants to chat with you about <span className="text-white font-bold">"{topicTitle}"</span>!
          </p>
          <button
            onClick={() => {
              setPhase("ai-speaking");
              speakText(openingLine, () => startStudentTurnRef.current());
            }}
            className="px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold sm:font-black text-white text-base sm:text-xl shadow-2xl transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            Start Talking! 🎤
          </button>
        </div>
      )}

      {/* AI speaking */}
      {(phase === "ai-speaking" || phase === "between-turns") && (
        <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl shrink-0">{charInfo.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">{character} says</p>
              <p className="text-white text-base sm:text-lg leading-relaxed">{currentAiText}</p>
            </div>
          </div>
          {phase === "ai-speaking" && (
            <div className="mt-3 sm:mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
                <span className="text-purple-400 text-xs sm:text-sm ml-2">Speaking…</span>
              </div>
              <button onClick={() => { window.speechSynthesis?.cancel(); finishSpeakRef.current?.(); }}
                className="text-xs text-purple-500 hover:text-purple-300 underline transition-colors whitespace-nowrap ml-2">
                Skip →
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI thinking */}
      {phase === "between-turns" && (
        <div className="flex items-center gap-3 text-purple-400 text-sm">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-400 wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          {character} is thinking…
        </div>
      )}

      {/* Student speaking */}
      {phase === "student-speaking" && (
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* What the character said (context reminder) */}
          <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10">
            <p className="text-purple-400 text-xs font-semibold mb-1">{character} asked:</p>
            <p className="text-purple-200 text-sm italic line-clamp-2">{currentAiText}</p>
          </div>

          {/* Live transcript */}
          <div className="bg-black/30 rounded-2xl p-3 sm:p-4 min-h-[80px] sm:min-h-[90px] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {micReady
                  ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-xs font-medium">Mic active — speak now</span></>
                  : <><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="text-yellow-400 text-xs">Starting mic…</span></>
                }
              </div>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                {transcript}
                <span className="text-purple-400/70 italic">{interimText}</span>
                {!transcript && !interimText && micReady && (
                  <span className="text-purple-500">Start speaking…</span>
                )}
              </p>
            </div>
          </div>

          {micError && <p className="text-red-400 text-xs sm:text-sm text-center">{micError}</p>}

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 sm:px-4 py-2 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-300 font-mono font-bold text-sm sm:text-lg">{timeLeft}s</span>
            </div>
            <button onClick={handleDone}
              className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* Completed turns mini log */}
      {recordedTurns.length > 0 && phase !== "done" && (
        <div className="flex gap-2 flex-wrap">
          {recordedTurns.map((t, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-3 py-2 text-xs text-purple-300 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Turn {i + 1} · {t.wordCount}w · {Math.round(t.wpm)} WPM
            </div>
          ))}
        </div>
      )}

      {/* Suppressed unused variable warning */}
      {elapsed > 0 && null}
    </div>
  );
}
