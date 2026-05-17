"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CHARACTER_INFO, ScriptTurn } from "@/lib/speaking-topics";
import { TurnRecord, scoreTurn } from "@/lib/speaking-score";

interface ConversationSessionProps {
  sessionId: string;
  character: string;
  openingLine: string;
  turns: ScriptTurn[];
  onComplete: (result: {
    turns: TurnRecord[];
    totalWords: number;
    durationSec: number;
  }) => void;
}

type Phase = "intro" | "ai-speaking" | "student-speaking" | "between-turns" | "done";

// Web Speech API type helpers
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList { length: number; [index: number]: SpeechRecognitionResult; }
interface SpeechRecognitionResult { isFinal: boolean; [index: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionAlternative { transcript: string; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function pickChildVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Prefer local (non-network) voices — Google network voices get silently canceled
  const local = voices.filter(v => v.localService);
  const pool  = local.length > 0 ? local : voices;
  return pool.find(v => v.lang === "en-IN" && /female|girl|woman/i.test(v.name))
    ?? pool.find(v => v.lang.startsWith("en-IN"))
    ?? pool.find(v => v.lang.startsWith("en") && /female|girl|woman/i.test(v.name))
    ?? pool.find(v => v.lang.startsWith("en"))
    ?? null;
}

export default function ConversationSession({
  sessionId,
  character,
  openingLine,
  turns,
  onComplete,
}: ConversationSessionProps) {
  const charInfo = CHARACTER_INFO[character] ?? { emoji: "🤖", from: "", tagline: "" };

  const [phase, setPhase] = useState<Phase>("intro");
  const [turnIndex, setTurnIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [recordedTurns, setRecordedTurns] = useState<TurnRecord[]>([]);
  const [browserOk, setBrowserOk] = useState(true);
  const [micError, setMicError] = useState("");
  const [micReady, setMicReady] = useState(false);
  const [aiText, setAiText] = useState(openingLine);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const startTimeRef = useRef(0);
  const currentTurnRef = useRef<ScriptTurn | null>(null);
  const committedRef = useRef(false);
  const recordedTurnsRef = useRef<TurnRecord[]>([]);
  // Holds the current TTS finish fn so the skip button can call it directly
  const finishSpeakRef = useRef<(() => void) | null>(null);

  // speakText lives here so it can write to finishSpeakRef
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) synth.cancel();

    const makeUtter = (withVoice = true) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang  = "en-IN";
      u.rate  = 1.05;
      u.pitch = 1.6;
      if (withVoice) {
        const voice = pickChildVoice();
        if (voice) u.voice = voice;
      }
      return u;
    };

    if (!onEnd) { synth.pause(); synth.speak(makeUtter()); synth.resume(); return; }

    let done       = false;
    let fallbackId: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
      finishSpeakRef.current = null;
      onEnd();
    };

    finishSpeakRef.current = finish;

    const words       = text.trim().split(/\s+/).length;
    const estimatedMs = Math.min((words / 130) * 60_000 + 2000, 30_000);

    const trySpeak = (attempt: number) => {
      if (done) return;
      const utter    = makeUtter(attempt === 1);
      let utterDone  = false; // guards this specific utterance's events

      // eslint-disable-next-line no-console
      console.log(`[tts] attempt=${attempt} text="${text.slice(0, 30)}"`);

      utter.onstart = () => {
        // eslint-disable-next-line no-console
        console.log(`[tts] onstart ✓ attempt=${attempt}`);
      };

      utter.onend = () => {
        // eslint-disable-next-line no-console
        console.log(`[tts] onend attempt=${attempt}`);
        if (utterDone || done) return;
        utterDone = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        finish();
      };

      utter.onerror = (e) => {
        // eslint-disable-next-line no-console
        console.log(`[tts] onerror attempt=${attempt}:`, e.error);
        if (utterDone || done) return;
        utterDone = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        if ((e.error === "canceled" || e.error === "interrupted") && attempt < 2) {
          // Chrome dropped the utterance — wait briefly then retry without voice
          setTimeout(() => trySpeak(2), 300);
        } else {
          finish(); // Give up after 2 attempts or on a real error
        }
      };

      // Queue while paused → then resume triggers immediate playback.
      // This avoids Chrome re-entering idle between resume() and speak().
      synth.pause();
      synth.speak(utter);
      synth.resume();
      // eslint-disable-next-line no-console
      console.log(`[tts] speak() called speaking=${synth.speaking}`);

      // Hard fallback in case onend/onerror never fire
      if (fallbackId) clearTimeout(fallbackId);
      const _setAt = Date.now();
      // eslint-disable-next-line no-console
      console.log(`[tts] fallback scheduled estimatedMs=${estimatedMs} words=${words}`);
      fallbackId = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log(`[tts] fallback FIRED after ${Date.now() - _setAt}ms`);
        synth.cancel(); finish();
      }, estimatedMs);
    };

    trySpeak(1);
  }, []);

  useEffect(() => {
    if (!getSpeechRecognition()) setBrowserOk(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () =>
        window.speechSynthesis.getVoices()
      );
    }
    // Chrome silently pauses speechSynthesis after idle — keepalive prevents it
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

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  };

  const commitTurn = useCallback(() => {
    committedRef.current = true;
    setMicReady(false);
    stopTimer();
    stopRecognition();
    window.speechSynthesis?.cancel();

    const text = finalTranscriptRef.current.trim();
    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const { wordCount, wpm, fillerCount } = scoreTurn(text, durationSec);
    const turn = currentTurnRef.current!;

    const record: TurnRecord = {
      aiText: turn.aiText,
      studentText: text,
      durationSec,
      wordCount,
      wpm,
      fillerCount,
      longPauses: 0,
    };

    // Build updated list via ref — avoids side effects inside a functional state updater
    // (React StrictMode double-invokes updater fns, which would fire setTimeout twice)
    const updated = [...recordedTurnsRef.current, record];
    recordedTurnsRef.current = updated;
    setRecordedTurns(updated);

    const nextIndex = turnIndex + 1;

    if (nextIndex >= turns.length) {
      const totalWords = updated.reduce((s, t) => s + t.wordCount, 0);
      const totalDuration = updated.reduce((s, t) => s + t.durationSec, 0);
      setPhase("done");
      onComplete({ turns: updated, totalWords, durationSec: totalDuration });
    } else {
      setPhase("between-turns");
      setTimeout(() => {
        setTurnIndex(nextIndex);
        const next = turns[nextIndex];
        setAiText(next.aiText);
        setPhase("ai-speaking");
        setTranscript("");
        setInterimText("");
        speakText(next.aiText, () => startStudentTurn(next));
      }, 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnIndex, turns, onComplete]);

  const startStudentTurn = useCallback((turn: ScriptTurn) => {
    // eslint-disable-next-line no-console
    console.trace("[rec] startStudentTurn CALLER");
    committedRef.current = false;
    finalTranscriptRef.current = "";
    currentTurnRef.current = turn;
    startTimeRef.current = Date.now();
    setTranscript("");
    setInterimText("");
    setElapsed(0);
    setMicError("");
    setMicReady(false);
    setPhase("student-speaking");

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    function startRec() {
      const rec = new SpeechRecognitionCtor!();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN";
      recognitionRef.current = rec;

      rec.onresult = (e: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscriptRef.current += t + " ";
            setTranscript(finalTranscriptRef.current.trim());
          } else {
            interim += t;
          }
        }
        setInterimText(interim);
      };

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setMicError("Microphone blocked — click the 🔒 in the address bar and allow microphone access, then refresh.");
        } else if (e.error !== "no-speech" && e.error !== "aborted") {
          setMicError(`Mic error: ${e.error}. Try clicking Done and speaking again.`);
        }
      };

      // Chrome stops recognition after ~60 s or on silence. Restart automatically.
      rec.onend = () => {
        if (!committedRef.current && recognitionRef.current === rec) {
          // Small gap so Chrome fully releases the audio pipe before re-opening it
          setTimeout(() => {
            if (!committedRef.current) try { startRec(); } catch { /* ignore */ }
          }, 120);
        }
      };

      try { rec.start(); } catch { setMicError("Could not start microphone. Allow mic access and refresh."); }
    }

    // 500 ms gap: Chrome needs time to release TTS audio device before mic can open
    // eslint-disable-next-line no-console
    console.log("[rec] startStudentTurn called, scheduling startRec in 500ms");
    setTimeout(() => {
      if (!committedRef.current) {
        // eslint-disable-next-line no-console
        console.log("[rec] starting recognition now");
        setMicReady(true); startRec();
      }
    }, 500);

    // Auto-commit when time runs out
    let secs = 0;
    timerRef.current = setInterval(() => {
      secs++;
      setElapsed(secs);
      if (secs >= turn.timeSec) {
        stopTimer();
        commitTurn();
      }
    }, 1000);
  }, [commitTurn]);

  function handleStart() {
    setPhase("ai-speaking");
    setAiText(openingLine);
    speakText(openingLine, () => {
      if (turns.length > 0) startStudentTurn(turns[0]);
    });
  }

  function handleDone() {
    commitTurn();
  }

  const currentTurn = turns[turnIndex];
  const timeLeft = currentTurn ? Math.max(0, currentTurn.timeSec - elapsed) : 0;
  const progress = turnIndex / turns.length;

  if (!browserOk) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🌐</div>
        <p className="text-white font-bold text-xl">Please use Google Chrome</p>
        <p className="text-purple-300 mt-2">The speaking module uses built-in browser speech recognition,<br />which works best in Google Chrome.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">

      {/* Progress bar */}
      <div className="bg-white/10 rounded-full h-2 w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(5, progress * 100)}%` }} />
      </div>
      <p className="text-center text-purple-400 text-sm">Turn {Math.min(turnIndex + 1, turns.length)} of {turns.length}</p>

      {/* Character card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <div className="text-5xl shrink-0">{charInfo.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-bold">{character}</span>
              <span className="text-purple-400 text-sm">from {charInfo.from}</span>
              {phase === "ai-speaking" && (
                <span className="flex gap-1 ml-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400 wave-bar"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              )}
            </div>
            <p className="text-white text-lg leading-relaxed">{aiText}</p>
          </div>
        </div>
      </div>

      {/* Intro phase */}
      {phase === "intro" && (
        <div className="text-center py-4">
          <p className="text-purple-300 mb-6">
            {character} wants to have a chat with you!<br />Speak naturally — there are no wrong answers.
          </p>
          <button onClick={handleStart}
            className="px-12 py-4 rounded-2xl font-bold text-xl text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
            Start Talking! 🎤
          </button>
        </div>
      )}

      {/* Student speaking phase */}
      {phase === "student-speaking" && currentTurn && (
        <div className="flex flex-col gap-4">

          {/* Hint bubble */}
          <div className="bg-indigo-900/50 border border-indigo-500/40 rounded-2xl px-5 py-3 flex items-start gap-3">
            <span className="text-yellow-400 text-lg shrink-0">💡</span>
            <p className="text-indigo-200 text-sm">{currentTurn.hint}</p>
          </div>

          {/* Transcript live view */}
          <div className="bg-black/30 rounded-2xl p-4 min-h-[80px] border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              {micReady
                ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-xs font-medium">Mic active</span></>
                : <><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="text-yellow-400 text-xs">Starting mic…</span></>
              }
            </div>
            <p className="text-white/90 leading-relaxed">
              {transcript}
              <span className="text-purple-400/70 italic">{interimText}</span>
              {!transcript && !interimText && micReady && (
                <span className="text-purple-500">Start speaking…</span>
              )}
            </p>
          </div>

          {micError && (
            <p className="text-red-400 text-sm text-center">{micError}</p>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/40 px-4 py-3 rounded-2xl">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-300 font-mono font-bold text-lg">{timeLeft}s</span>
            </div>

            <button onClick={handleDone}
              className="flex-1 py-3 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* AI speaking */}
      {phase === "ai-speaking" && (
        <div className="text-center py-2">
          <p className="text-purple-400 text-sm mb-3">
            {character} is speaking… listen carefully!
          </p>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              finishSpeakRef.current?.();
            }}
            className="text-xs text-purple-500 hover:text-purple-300 underline transition-colors"
          >
            Skip voice →
          </button>
        </div>
      )}

      {/* Between turns */}
      {phase === "between-turns" && (
        <div className="flex items-center justify-center gap-3 py-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-purple-400 wave-bar"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          <span className="text-purple-300">{character} is thinking…</span>
        </div>
      )}

      {/* Recorded turns summary (small) */}
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
    </div>
  );
}
