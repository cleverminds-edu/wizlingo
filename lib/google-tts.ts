/**
 * Google Cloud Text-to-Speech Integration
 *
 * Provides high-quality voice synthesis with Indian English support
 *
 * Setup:
 * 1. Create Google Cloud project
 * 2. Enable Text-to-Speech API
 * 3. Create service account → JSON key
 * 4. Set GOOGLE_TTS_API_KEY environment variable (or use GOOGLE_APPLICATION_CREDENTIALS)
 */

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_ENABLED = !!GOOGLE_TTS_API_KEY;

// Character to Google Cloud voice mapping
const CHARACTER_VOICE_MAP: Record<string, { name: string; gender: string }> = {
  // Female voices (en-IN-Standard-A or Neural2-A for premium)
  "Mom": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Sarah": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Emma": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Aisha": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Teacher": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Librarian": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Maya": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Eco": { name: "en-IN-Standard-A", gender: "FEMALE" },
  "Meera": { name: "en-IN-Standard-A", gender: "FEMALE" },

  // Male voices (en-IN-Standard-B or Neural2-B for premium)
  "Alex": { name: "en-IN-Standard-B", gender: "MALE" },
  "Jamie": { name: "en-IN-Standard-B", gender: "MALE" },
  "Ravi": { name: "en-IN-Standard-B", gender: "MALE" },
  "Professor": { name: "en-IN-Standard-B", gender: "MALE" },
  "Chef": { name: "en-IN-Standard-B", gender: "MALE" },
  "Explorer": { name: "en-IN-Standard-B", gender: "MALE" },
  "Coach": { name: "en-IN-Standard-B", gender: "MALE" },
  "Tech": { name: "en-IN-Standard-B", gender: "MALE" },
  "Sage": { name: "en-IN-Standard-B", gender: "MALE" },
  "Mentor": { name: "en-IN-Standard-B", gender: "MALE" },
  "Marco": { name: "en-IN-Standard-B", gender: "MALE" },
};

export async function synthesizeWithGoogle(
  text: string,
  character: string,
  options?: { pitch?: number; rate?: number }
): Promise<Buffer | null> {
  if (!GOOGLE_TTS_ENABLED) {
    console.warn('⚠️ Google Cloud TTS not configured. Using fallback.');
    return null;
  }

  try {
    const voiceInfo = CHARACTER_VOICE_MAP[character] || CHARACTER_VOICE_MAP["Alex"];

    const payload = {
      input: { text },
      voice: {
        languageCode: "en-IN",
        name: voiceInfo.name,
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: options?.pitch ?? 0, // -20.0 to 20.0
        speakingRate: options?.rate ?? 1.0, // 0.25 to 4.0
      },
    };

    const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_TTS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Google TTS API error:', error);
      return null;
    }

    const data = await response.json() as { audioContent?: string };
    if (!data.audioContent) {
      console.error('❌ No audio content in response');
      return null;
    }

    // Convert base64 to buffer
    return Buffer.from(data.audioContent, "base64");
  } catch (error) {
    console.error('❌ Google TTS error:', error);
    return null;
  }
}

export function isGoogleTTSEnabled(): boolean {
  return GOOGLE_TTS_ENABLED;
}

export function getVoiceInfo(character: string) {
  return CHARACTER_VOICE_MAP[character] || CHARACTER_VOICE_MAP["Alex"];
}
