/**
 * Client-side Text-to-Speech wrapper
 *
 * Strategy:
 * 1. Try Google Cloud TTS (if enabled on server)
 * 2. Fallback to Web Speech API (browser native)
 */

export async function synthesizeAudio(
  text: string,
  character: string
): Promise<HTMLAudioElement | null> {
  console.log('🎵 Requesting TTS:', { textLen: text.length, character });

  try {
    // Try Google Cloud TTS first
    const response = await fetch("/api/speaking/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text, character }),
    });

    if (response.ok && response.headers.get("content-type") === "audio/mpeg") {
      console.log('✅ Using Google Cloud TTS');
      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio();
      audio.src = url;
      audio.preload = "auto";

      // Cleanup URL after playback
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(url);
      });

      return audio;
    }
  } catch (error) {
    console.error('⚠️ Google TTS failed:', error);
  }

  // Fallback: Return null, caller will use Web Speech API
  console.log('⚠️ Google TTS not available, will use Web Speech API');
  return null;
}

export function playAudioElement(
  audio: HTMLAudioElement,
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    audio.addEventListener("ended", () => {
      onEnd?.();
      resolve();
    });

    audio.addEventListener("error", () => {
      console.error('❌ Audio playback error');
      resolve();
    });

    audio.play().catch((err) => {
      console.error('❌ Failed to play audio:', err);
      resolve();
    });
  });
}
