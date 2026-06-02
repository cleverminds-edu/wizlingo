// Audio generator for badge celebration sounds
// Generates sounds programmatically as WAV data URIs

export function generateBadgeEarnedSound(): string {
  // Generate a cheerful chime (220Hz, 330Hz, 440Hz ascending notes)
  // This creates an uplifting celebratory tone
  const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

  if (!audioContext) {
    // Fallback: return a simple beep as data URI
    return generateSimpleTone(440, 200, 0.3);
  }

  // Create a more complex sound using Web Audio API
  const sampleRate = audioContext.sampleRate;
  const duration = 0.6; // 600ms
  const channels = 1;
  const frameCount = sampleRate * duration;

  const audioData = audioContext.createBuffer(channels, frameCount, sampleRate);
  const nowBuffering = audioData.getChannelData(0);

  // Generate three ascending notes for celebration
  const notes = [220, 330, 440]; // A3, E4, A4
  const noteDuration = frameCount / 3;

  for (let noteIdx = 0; noteIdx < notes.length; noteIdx++) {
    const frequency = notes[noteIdx];
    const startFrame = noteDuration * noteIdx;
    const endFrame = startFrame + noteDuration;

    for (let i = startFrame; i < endFrame; i++) {
      const t = (i - startFrame) / sampleRate;
      const envelope = Math.exp(-t * 3); // Fade out

      // Simple sine wave
      nowBuffering[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
  }

  // Convert to WAV and create data URL
  return audioBufferToWavDataUrl(audioData);
}

export function generateConfettiPopSound(): string {
  // Generate a short pop sound (quick high-to-low frequency sweep)
  const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

  if (!audioContext) {
    // Fallback: return a simple click
    return generateSimpleTone(600, 100, 0.2);
  }

  const sampleRate = audioContext.sampleRate;
  const duration = 0.15; // 150ms
  const channels = 1;
  const frameCount = sampleRate * duration;

  const audioData = audioContext.createBuffer(channels, frameCount, sampleRate);
  const nowBuffering = audioData.getChannelData(0);

  // Generate frequency sweep from 800Hz down to 300Hz
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Frequency sweep
    const startFreq = 800;
    const endFreq = 300;
    const frequency = startFreq + (endFreq - startFreq) * progress;

    // Amplitude envelope (quick attack, exponential decay)
    const envelope = Math.exp(-t * 15);

    // Generate sine wave
    nowBuffering[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
  }

  return audioBufferToWavDataUrl(audioData);
}

// Helper function to convert AudioBuffer to WAV data URL
function audioBufferToWavDataUrl(audioBuffer: AudioBuffer): string {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const channelData: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  const length = audioBuffer.length * numberOfChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Write audio data
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  // Create blob and data URL
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Simple fallback tone generator
function generateSimpleTone(frequency: number, duration: number, volume: number): string {
  const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

  if (!audioContext) {
    return '';
  }

  const sampleRate = audioContext.sampleRate;
  const frameCount = (sampleRate * duration) / 1000;
  const channels = 1;

  const audioData = audioContext.createBuffer(channels, frameCount, sampleRate);
  const nowBuffering = audioData.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-(t / (duration / 1000)) * 3);
    nowBuffering[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
  }

  return audioBufferToWavDataUrl(audioData);
}
