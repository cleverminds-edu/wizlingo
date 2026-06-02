// Particle system for badge celebration effects
export type ParticleType = 'star' | 'book' | 'note' | 'sparkle' | 'crown';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  life: number; // 0-1
  maxLife: number; // total life duration in ms
  rotation: number;
  rotationVelocity: number;
  type: ParticleType;
  color: string;
  size: number;
  gravity: number;
}

interface ParticleSystemConfig {
  particleCount: number;
  duration: number; // ms
  spreadAngle: number; // degrees
  initialVelocity: number;
  gravity: number;
  colors: string[];
  badgeColor: string;
}

const DEFAULT_PARTICLE_CONFIG: ParticleSystemConfig = {
  particleCount: 75,
  duration: 1500,
  spreadAngle: 360,
  initialVelocity: 8,
  gravity: 0.15,
  colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#00FFFF'],
  badgeColor: '#FFD700',
};

export class ParticleSystem {
  particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private config: ParticleSystemConfig;
  private onUpdate: (particles: Particle[]) => void;
  private onComplete: () => void;
  private isRunning: boolean = false;

  constructor(
    centerX: number,
    centerY: number,
    particleType: ParticleType,
    badgeColor: string,
    onUpdate: (particles: Particle[]) => void,
    onComplete: () => void,
    config?: Partial<ParticleSystemConfig>
  ) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;

    this.config = {
      ...DEFAULT_PARTICLE_CONFIG,
      badgeColor,
      ...config,
    };

    // Generate particles
    this.generateParticles(
      centerX,
      centerY,
      particleType,
      badgeColor
    );
  }

  private generateParticles(
    centerX: number,
    centerY: number,
    particleType: ParticleType,
    badgeColor: string
  ) {
    for (let i = 0; i < this.config.particleCount; i++) {
      const angle = (i / this.config.particleCount) * this.config.spreadAngle * (Math.PI / 180);
      const velocity = this.config.initialVelocity * (0.7 + Math.random() * 0.6);

      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 2; // Slight upward bias

      const particle: Particle = {
        id: `${Date.now()}_${i}`,
        x: centerX,
        y: centerY,
        vx,
        vy,
        life: 1,
        maxLife: this.config.duration,
        rotation: Math.random() * 360,
        rotationVelocity: (Math.random() - 0.5) * 20,
        type: particleType,
        color: this.getParticleColor(particleType, badgeColor, i),
        size: this.getParticleSize(particleType),
        gravity: this.config.gravity,
      };

      this.particles.push(particle);
    }
  }

  private getParticleColor(
    particleType: ParticleType,
    badgeColor: string,
    index: number
  ): string {
    const colors = this.config.colors;

    switch (particleType) {
      case 'star':
        return colors[index % colors.length];
      case 'book':
        return ['#4F46E5', '#6366F1', '#818CF8'][index % 3];
      case 'note':
        return ['#9333EA', '#A855F7', '#C084FC'][index % 3];
      case 'sparkle':
        return ['#059669', '#10B981', '#34D399'][index % 3];
      case 'crown':
        return ['#D97706', '#F59E0B', '#FBBF24'][index % 3];
      default:
        return badgeColor;
    }
  }

  private getParticleSize(particleType: ParticleType): number {
    switch (particleType) {
      case 'star':
        return 8;
      case 'book':
        return 6;
      case 'note':
        return 6;
      case 'sparkle':
        return 4;
      case 'crown':
        return 7;
      default:
        return 6;
    }
  }

  private getParticleSymbol(particleType: ParticleType): string {
    switch (particleType) {
      case 'star':
        return '⭐';
      case 'book':
        return '📖';
      case 'note':
        return '♪';
      case 'sparkle':
        return '✨';
      case 'crown':
        return '👑';
      default:
        return '•';
    }
  }

  private updateParticles(deltaTime: number) {
    this.particles = this.particles
      .map((particle) => {
        const progress = 1 - particle.life;

        // Physics update
        let newVy = particle.vy + particle.gravity;
        let newX = particle.x + particle.vx;
        let newY = particle.y + newVy;

        // Fade out
        const life = Math.max(0, particle.life - deltaTime / particle.maxLife);

        return {
          ...particle,
          x: newX,
          y: newY,
          vy: newVy,
          life,
          rotation: particle.rotation + particle.rotationVelocity,
        };
      })
      .filter((p) => p.life > 0);
  }

  private animate = (currentTime: number) => {
    if (this.startTime === 0) {
      this.startTime = currentTime;
    }

    const elapsed = currentTime - this.startTime;
    const deltaTime = Math.min(elapsed, 16); // Cap at 60fps

    this.updateParticles(deltaTime);
    this.onUpdate([...this.particles]);

    if (this.particles.length > 0 && elapsed < this.config.duration) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.stop();
      this.onComplete();
    }
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = 0;
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pause() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume() {
    if (this.isRunning && this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }

  getParticles(): Particle[] {
    return [...this.particles];
  }

  isActive(): boolean {
    return this.isRunning && this.particles.length > 0;
  }
}

// Canvas-based particle renderer
export class ParticleRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(container: HTMLElement) {
    this.setupCanvas(container);
  }

  private setupCanvas(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '999';

    this.ctx = this.canvas.getContext('2d');
    container.appendChild(this.canvas);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private onWindowResize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  render(particles: Particle[]) {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    particles.forEach((particle) => {
      this.drawParticle(particle);
    });
  }

  private drawParticle(particle: Particle) {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const opacity = particle.life;

    ctx.save();
    ctx.globalAlpha = opacity;

    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);

    switch (particle.type) {
      case 'star':
        this.drawStar(ctx, particle);
        break;
      case 'book':
        this.drawBook(ctx, particle);
        break;
      case 'note':
        this.drawNote(ctx, particle);
        break;
      case 'sparkle':
        this.drawSparkle(ctx, particle);
        break;
      case 'crown':
        this.drawCrown(ctx, particle);
        break;
      default:
        this.drawCircle(ctx, particle);
    }

    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, particle: Particle) {
    ctx.fillStyle = particle.color;
    ctx.font = `${particle.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', 0, 0);
  }

  private drawBook(ctx: CanvasRenderingContext2D, particle: Particle) {
    ctx.fillStyle = particle.color;
    ctx.font = `${particle.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📖', 0, 0);
  }

  private drawNote(ctx: CanvasRenderingContext2D, particle: Particle) {
    ctx.fillStyle = particle.color;
    // Draw musical note
    const size = particle.size / 2;
    ctx.beginPath();
    ctx.arc(0, -size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 3, -size / 2);
    ctx.lineTo(size / 3, size);
    ctx.stroke();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, particle: Particle) {
    ctx.fillStyle = particle.color;
    const size = particle.size / 2;
    // Draw cross/sparkle pattern
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawCrown(ctx: CanvasRenderingContext2D, particle: Particle) {
    ctx.fillStyle = particle.color;
    ctx.font = `${particle.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', 0, 0);
  }

  private drawCircle(ctx: CanvasRenderingContext2D, particle: Particle) {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  clear() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}
