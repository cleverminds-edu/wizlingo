'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { ParticleSystem, ParticleRenderer, Particle, ParticleType } from '@/lib/particles';
import { playBadgeEarnedSound } from '@/lib/sound-effects';

interface UseCelebrationEffectsProps {
  isActive: boolean;
  badgeColor: string;
  particleType: ParticleType;
  onParticlesUpdate?: (particles: Particle[]) => void;
  onComplete?: () => void;
  particleCount?: number;
  duration?: number;
}

export function useCelebrationEffects({
  isActive,
  badgeColor,
  particleType,
  onParticlesUpdate,
  onComplete,
  particleCount = 75,
  duration = 1500,
}: UseCelebrationEffectsProps) {
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const particleRendererRef = useRef<ParticleRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize particle system and renderer
  useEffect(() => {
    if (!isActive) return;

    // Create container if it doesn't exist
    if (!containerRef.current) {
      const container = document.createElement('div');
      container.id = 'celebration-effects-container';
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '999';
      document.body.appendChild(container);
      containerRef.current = container;
    }

    // Initialize renderer
    if (!particleRendererRef.current) {
      particleRendererRef.current = new ParticleRenderer(containerRef.current);
    }

    // Initialize particle system
    particleSystemRef.current = new ParticleSystem(
      window.innerWidth / 2,
      window.innerHeight / 2,
      particleType,
      badgeColor,
      (updatedParticles) => {
        setParticles(updatedParticles);
        onParticlesUpdate?.(updatedParticles);
      },
      () => {
        // Cleanup when done
        if (particleRendererRef.current) {
          particleRendererRef.current.clear();
        }
        onComplete?.();
      },
      {
        particleCount,
        duration,
        colors: [badgeColor, '#FFD700', '#FFA500', '#FF69B4', '#00FF00'],
        badgeColor,
      }
    );

    // Play badge earned sound with slight delay
    const soundTimer = setTimeout(() => {
      playBadgeEarnedSound().catch((error) => {
        console.error('Failed to play badge earned sound:', error);
      });
    }, 300);

    // Start particle system
    particleSystemRef.current.start();

    return () => {
      clearTimeout(soundTimer);
      particleSystemRef.current?.stop();
    };
  }, [isActive, badgeColor, particleType, particleCount, duration, onParticlesUpdate, onComplete]);

  // Render particles
  useEffect(() => {
    if (particles.length > 0 && particleRendererRef.current) {
      particleRendererRef.current.render(particles);
    }
  }, [particles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (particleSystemRef.current) {
        particleSystemRef.current.stop();
      }
      if (particleRendererRef.current) {
        particleRendererRef.current.destroy();
        particleRendererRef.current = null;
      }
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
        containerRef.current = null;
      }
    };
  }, []);

  // Pause/resume functionality
  const pause = useCallback(() => {
    particleSystemRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    particleSystemRef.current?.resume();
  }, []);

  const isRunning = particleSystemRef.current?.isActive() ?? false;

  return {
    particles,
    isRunning,
    pause,
    resume,
  };
}
