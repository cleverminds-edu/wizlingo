// Sound effects manager for badge celebrations
export type SoundEffectType = 'badge-earned' | 'confetti-pop';

interface AudioCache {
  [key: string]: HTMLAudioElement | null;
}

let audioGenerator: typeof import('./audio-generator') | null = null;

// Lazy load audio generator
async function getAudioGenerator() {
  if (!audioGenerator) {
    try {
      audioGenerator = await import('./audio-generator');
    } catch (error) {
      console.error('Failed to load audio generator:', error);
      return null;
    }
  }
  return audioGenerator;
}

class SoundEffectsManager {
  private audioCache: AudioCache = {};
  private volumeLevel: number = 0.7; // Default 70%
  private isMuted: boolean = false;
  private isSupported: boolean = false;
  private generatedSoundCache: { [key: string]: string } = {};

  constructor() {
    // Check if audio is supported
    this.isSupported = typeof window !== 'undefined' && !!window.AudioContext;
  }

  /**
   * Load audio file (lazy load) - supports both files and generated sounds
   */
  private async loadAudio(soundType: SoundEffectType): Promise<HTMLAudioElement | null> {
    if (!this.isSupported) return null;

    if (this.audioCache[soundType]) {
      return this.audioCache[soundType];
    }

    try {
      const audio = new Audio();

      // First try to load from file
      audio.src = `/sounds/${soundType}.mp3`;

      // If file doesn't exist, try to generate sound programmatically
      audio.onerror = async () => {
        const generator = await getAudioGenerator();
        if (generator) {
          let soundUrl = this.generatedSoundCache[soundType];

          if (!soundUrl) {
            if (soundType === 'badge-earned') {
              soundUrl = generator.generateBadgeEarnedSound();
            } else if (soundType === 'confetti-pop') {
              soundUrl = generator.generateConfettiPopSound();
            }
            this.generatedSoundCache[soundType] = soundUrl;
          }

          if (soundUrl) {
            audio.src = soundUrl;
          }
        }
      };

      audio.preload = 'auto';
      audio.volume = this.isMuted ? 0 : this.volumeLevel;

      // Cache it
      this.audioCache[soundType] = audio;

      return audio;
    } catch (error) {
      console.error(`Failed to load sound: ${soundType}`, error);
      this.audioCache[soundType] = null;
      return null;
    }
  }

  /**
   * Play a sound effect
   */
  async play(soundType: SoundEffectType): Promise<void> {
    if (!this.isSupported || this.isMuted) return;

    try {
      const audio = await this.loadAudio(soundType);
      if (!audio) return;

      // Reset audio to start
      audio.currentTime = 0;

      // Create a clone to allow multiple plays
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = this.volumeLevel;

      clone.play().catch((error) => {
        console.error(`Failed to play sound: ${soundType}`, error);
      });
    } catch (error) {
      console.error(`Error playing sound: ${soundType}`, error);
    }
  }

  /**
   * Play multiple sound effects with delays
   */
  playSequence(sounds: Array<{ type: SoundEffectType; delay: number }>): void {
    sounds.forEach(({ type, delay }) => {
      setTimeout(() => this.play(type), delay);
    });
  }

  /**
   * Set volume (0-1)
   */
  setVolume(level: number): void {
    this.volumeLevel = Math.max(0, Math.min(1, level));

    // Update all cached audio elements
    Object.values(this.audioCache).forEach((audio) => {
      if (audio) {
        audio.volume = this.isMuted ? 0 : this.volumeLevel;
      }
    });
  }

  /**
   * Get current volume level
   */
  getVolume(): number {
    return this.volumeLevel;
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    this.isMuted = true;

    Object.values(this.audioCache).forEach((audio) => {
      if (audio) {
        audio.volume = 0;
      }
    });
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    this.isMuted = false;

    Object.values(this.audioCache).forEach((audio) => {
      if (audio) {
        audio.volume = this.volumeLevel;
      }
    });
  }

  /**
   * Check if muted
   */
  getMuteStatus(): boolean {
    return this.isMuted;
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    Object.values(this.audioCache).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  /**
   * Clear audio cache (for cleanup)
   */
  clearCache(): void {
    this.stopAll();
    this.audioCache = {};
  }

  /**
   * Check if audio is supported
   */
  isAudioSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Preload sound effect for faster playback
   */
  async preload(soundType: SoundEffectType): Promise<void> {
    await this.loadAudio(soundType);
  }

  /**
   * Preload all badge sounds
   */
  async preloadAll(): Promise<void> {
    await Promise.all([
      this.preload('badge-earned'),
      this.preload('confetti-pop'),
    ]);
  }
}

// Singleton instance
let soundManager: SoundEffectsManager | null = null;

/**
 * Get the global sound effects manager
 */
export function getSoundEffectsManager(): SoundEffectsManager {
  if (!soundManager) {
    soundManager = new SoundEffectsManager();
  }
  return soundManager;
}

/**
 * Initialize sound effects (preload sounds)
 */
export async function initializeSoundEffects(): Promise<void> {
  const manager = getSoundEffectsManager();
  await manager.preloadAll();
}

/**
 * Play a badge earned sound
 */
export async function playBadgeEarnedSound(): Promise<void> {
  await getSoundEffectsManager().play('badge-earned');
}

/**
 * Play confetti pop sound
 */
export async function playConfettiPopSound(): Promise<void> {
  await getSoundEffectsManager().play('confetti-pop');
}

/**
 * Set sound volume (0-1)
 */
export function setSoundVolume(level: number): void {
  getSoundEffectsManager().setVolume(level);
}

/**
 * Get current sound volume
 */
export function getSoundVolume(): number {
  return getSoundEffectsManager().getVolume();
}

/**
 * Mute all sounds
 */
export function muteSounds(): void {
  getSoundEffectsManager().mute();
}

/**
 * Unmute all sounds
 */
export function unmuteSounds(): void {
  getSoundEffectsManager().unmute();
}

/**
 * Get mute status
 */
export function getSoundMuteStatus(): boolean {
  return getSoundEffectsManager().getMuteStatus();
}

/**
 * Toggle mute
 */
export function toggleSoundMute(): boolean {
  return getSoundEffectsManager().toggleMute();
}

/**
 * Stop all sounds
 */
export function stopAllSounds(): void {
  getSoundEffectsManager().stopAll();
}

/**
 * Clear sound cache
 */
export function clearSoundCache(): void {
  getSoundEffectsManager().clearCache();
}
