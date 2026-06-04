'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const SCREENS = [
  {
    number: 1,
    emoji: '👋',
    title: 'Welcome to WizLingo!',
    description: 'Master English in just 5 minutes a day with AI-powered reading and speaking practice.',
    highlights: ['📖 Reading & Speaking', '🤖 Powered by Edvanta Intelligence System (AI)', '⭐ Earn badges as you progress'],
    color: 'from-blue-500 to-indigo-600',
  },
  {
    number: 2,
    emoji: '🎮',
    title: 'How It Works',
    description: 'Choose from two types of sessions to improve your English skills.',
    highlights: [
      '📖 Reading: Read passages and get instant AI feedback',
      '🎤 Speaking: Have conversations with AI characters',
      '📊 Track your WPM, accuracy, and fluency',
    ],
    color: 'from-purple-500 to-pink-600',
  },
  {
    number: 3,
    emoji: '🏆',
    title: 'Earn & Progress',
    description: 'Complete sessions, earn badges, and level up to harder challenges.',
    highlights: [
      '⭐ 5 different badges: Spark, Word Wizard, Voice Wizard, Language Wizard, Grand Wizard',
      '📈 3 levels: Beginner → Explorer → Champion',
      '🎯 Adaptive AI adjusts difficulty based on your performance',
    ],
    color: 'from-yellow-500 to-orange-600',
  },
];

interface OnboardingCarouselProps {
  onComplete: () => void;
  studentName: string;
}

export default function OnboardingCarousel({
  onComplete,
  studentName,
}: OnboardingCarouselProps) {
  const [current, setCurrent] = useState(0);

  const screen = SCREENS[current];
  const isLast = current === SCREENS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur p-4">
      <div className={`bg-gradient-to-br ${screen.color} rounded-3xl p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">{screen.emoji}</div>
            <h2 className="text-4xl font-black text-white mb-2">{screen.title}</h2>
            {current === 0 && (
              <p className="text-white/80 text-lg font-semibold">{studentName} 👋</p>
            )}
          </div>

          {/* Description */}
          <p className="text-white text-center text-lg mb-8 leading-relaxed">
            {screen.description}
          </p>

          {/* Highlights */}
          <div className="space-y-4 mb-12">
            {screen.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-2xl flex-shrink-0">✓</span>
                <span className="text-white font-semibold text-lg">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {SCREENS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-3 rounded-full transition-all ${
                  i === current ? 'bg-white w-8' : 'bg-white/40 w-3 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Edvanta Branding */}
          <div className="text-center mb-8 text-sm text-white/80">
            Powered by <span className="font-bold text-white">Edvanta Intelligence System (AI)</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all disabled:hover:bg-white/20"
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <span className="text-white font-bold text-sm">
              {current + 1} / {SCREENS.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              {isLast ? "Let's Go! 🚀" : 'Next'}
              {!isLast && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
