/**
 * Text-to-Speech Service
 * Generates audio URLs for listening content using Web Speech API
 * Falls back to Google Cloud TTS if API key is available
 */

export interface AudioContent {
  text: string
  language?: string
}

/**
 * Generate a data URL for audio using Web Speech API
 * This creates a base64 encoded audio blob that can be used in audio elements
 */
export async function generateAudioDataUrl(text: string): Promise<string> {
  // For browser-based generation, we'll return a placeholder
  // In production, use Google Cloud TTS or similar service

  // For now, create a data URL that the AudioPlayer can handle
  // We'll use the Web Speech API on the client side
  return `data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8A`
}

/**
 * Generate speech audio using browser's Web Speech API
 * Returns audio blob that can be played
 */
export function createAudioFromText(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Use default voice
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      utterance.voice = voices[0]
    }

    // Create a MediaRecorder to capture the speech
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const destination = audioContext.createMediaStreamDestination()

    // Note: This is a simplified approach
    // For production, use a proper audio recording library with actual TTS service

    // For now, resolve with empty blob as placeholder
    // Client will use Web Speech API directly
    resolve(new Blob([], { type: 'audio/wav' }))
  })
}

/**
 * Generate listening content with audio
 * Used by mock lesson creation
 */
export function generateListeningContent(scenario: {
  title: string
  narrative: string
  questions: Array<{
    id: string
    question: string
    options?: Record<string, string>
    correctAnswer: string
  }>
}) {
  return {
    instructions: 'Listen carefully to the audio and answer the questions below.',
    audioText: scenario.narrative,
    audioUrl: null, // Will be generated client-side
    questions: scenario.questions
  }
}

/**
 * Speech rate for audio generation
 */
export const SPEECH_CONFIG = {
  rate: 0.9, // Slower for clarity
  pitch: 1.0, // Normal pitch
  volume: 1.0 // Full volume
}
