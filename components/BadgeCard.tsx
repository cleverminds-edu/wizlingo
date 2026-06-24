'use client';

interface BadgeCardProps {
  type: 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD' | 'WEEK_WARRIOR' | 'MONTH_MASTER';
  status: 'earned' | 'locked';
  progress?: number;
  maxProgress?: number;
  showProgress?: boolean;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark',
    rarity: 1,
    gradient: 'from-orange-400 to-yellow-500',
    description: 'First step'
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    gradient: 'from-purple-500 to-indigo-600',
    description: 'Reading master'
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    gradient: 'from-pink-500 to-rose-600',
    description: 'Speaking master'
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Committed learner'
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    description: 'Ultimate master'
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    gradient: 'from-orange-400 to-orange-500',
    description: '7-day streak'
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    gradient: 'from-yellow-400 to-orange-500',
    description: '30-day streak'
  },
};

export default function BadgeCard({ type, status, progress = 0, maxProgress = 10, showProgress = true }: BadgeCardProps) {
  const config = BADGE_CONFIG[type];
  const isLocked = status === 'locked';
  const progressPercent = maxProgress ? (progress / maxProgress) * 100 : 0;

  return (
    <div className={`
      relative w-full aspect-square max-w-[200px]
      rounded-3xl overflow-hidden
      transition-all duration-300 hover:scale-110
      cursor-pointer group
      ${isLocked ? 'opacity-60' : 'opacity-100'}
    `}>
      {/* Badge background with gradient */}
      <div className={`
        absolute inset-0
        bg-gradient-to-br ${config.gradient}
        shadow-xl group-hover:shadow-2xl
        border-2 border-white/20
        group-hover:border-white/40
        transition-all
      `} />

      {/* Glow effect */}
      <div className={`
        absolute inset-0
        bg-white/10 opacity-0 group-hover:opacity-20
        transition-opacity
      `} />

      {/* Lock overlay for locked badges */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/30 z-30 flex items-center justify-center">
          <div className="text-4xl">🔒</div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-4">
        {/* Rarity stars - top right */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {[...Array(config.rarity)].map((_, i) => (
            <span key={i} className="text-lg">⭐</span>
          ))}
        </div>

        {/* Emoji - center */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-6xl drop-shadow-lg">{config.emoji}</span>
        </div>

        {/* Badge name and status - bottom */}
        <div className="text-center w-full">
          <h3 className="text-white font-black text-sm uppercase tracking-tight mb-1">
            {config.name}
          </h3>
          <p className="text-white/90 text-xs font-semibold">
            {isLocked ? '🔒 Locked' : '🌟 Unlocked!'}
          </p>

          {/* Progress bar for locked badges */}
          {isLocked && showProgress && (
            <div className="mt-2 w-full">
              <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-white/80 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-white/80 text-xs mt-1">
                {progress}/{maxProgress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
