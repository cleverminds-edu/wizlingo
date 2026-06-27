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

// Log startup status
if (typeof window === 'undefined') {
  console.log('🎵 Google Cloud TTS Status:');
  console.log('   Enabled:', GOOGLE_TTS_ENABLED ? '✅ YES' : '❌ NO');
  if (GOOGLE_TTS_ENABLED) {
    console.log('   ✅ API Key is set - using Google Cloud Neural2 voices');
  } else {
    console.log('   ⚠️ API Key not found - falling back to Web Speech API');
  }
}

// Character to Google Cloud NEURAL voice mapping (95% human quality)
// Neural2 voices sound much more natural than Standard voices
const CHARACTER_VOICE_MAP: Record<string, { name: string; gender: string; pitch: number; rate: number }> = {
  // Female NEURAL voices - warm, natural, expressive
  "Mom": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.5, rate: 0.95 },
  "Sarah": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.3, rate: 0.95 },
  "Emma": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.2, rate: 0.93 },
  "Aisha": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.4, rate: 0.94 },
  "Teacher": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.1, rate: 0.92 },
  "Librarian": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.2, rate: 0.91 },
  "Maya": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.35, rate: 0.94 },
  "Eco": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.3, rate: 0.93 },
  "Meera": { name: "en-IN-Neural2-A", gender: "FEMALE", pitch: 0.4, rate: 0.95 },

  // Male NEURAL voices - clear, friendly, youthful
  "Alex": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.2, rate: 0.93 },
  "Jamie": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.1, rate: 0.94 },
  "Ravi": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.3, rate: 0.93 },
  "Professor": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.5, rate: 0.90 },
  "Chef": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.2, rate: 0.94 },
  "Explorer": { name: "en-IN-Neural2-B", gender: "MALE", pitch: 0, rate: 0.95 },
  "Coach": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.3, rate: 0.92 },
  "Tech": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.1, rate: 0.94 },
  "Sage": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.6, rate: 0.89 },
  "Mentor": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.4, rate: 0.91 },
  "Marco": { name: "en-IN-Neural2-B", gender: "MALE", pitch: -0.2, rate: 0.94 },
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

    // Use character-specific pitch/rate, or override with options
    const pitch = options?.pitch ?? voiceInfo.pitch;
    const rate = options?.rate ?? voiceInfo.rate;

    console.log('🎤 Google TTS synthesis:', {
      character,
      voice: voiceInfo.name,
      pitch,
      rate,
      textLen: text.length,
    });

    const payload = {
      input: { text },
      voice: {
        languageCode: "en-IN",
        name: voiceInfo.name,
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch, // -20.0 to 20.0 (adjusted per character)
        speakingRate: rate, // 0.25 to 4.0 (optimized for natural speech)
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
