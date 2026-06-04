'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const FEATURES = [
  {
    icon: '📚',
    title: 'Intelligent Reading Engine',
    description: 'AI-powered passages that adapt to your level with real-time accuracy feedback',
    badge: 'word-wizard-badge.svg',
    bgColor: 'from-purple-50 to-purple-100',
  },
  {
    icon: '🎤',
    title: 'Real Conversation Practice',
    description: 'Natural dialogues with AI partners to build confidence and speaking fluency',
    badge: 'voice-wizard-badge.svg',
    bgColor: 'from-pink-50 to-pink-100',
  },
  {
    icon: '🎮',
    title: 'Gamified Learning',
    description: 'Earn badges, track progress, and compete with peers to stay motivated',
    badge: 'language-wizard-badge.svg',
    bgColor: 'from-violet-50 to-violet-100',
  },
  {
    icon: '📊',
    title: 'Live Teacher Dashboard',
    description: 'Real-time progress tracking and detailed student performance insights',
    bgColor: 'from-blue-50 to-blue-100',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCTAClick = () => {
    router.push('/auth/phone-signup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header — Dark Navy */}
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b-2 border-yellow-400/50"
        style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', height: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center h-full">
          {/* Left: Rectangular Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push('/')}
          >
            <div className="relative">
              <Image
                src="/wiziingo-logo.svg"
                alt="WizLingo"
                width={100}
                height={50}
                className="h-12 w-auto drop-shadow-md"
              />
              <span className="absolute -top-2 -right-2 text-xl animate-bounce">✨</span>
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">AI Learning</p>
            </div>
          </div>

          {/* Right: Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider">
              Features
            </a>
            <a href="#badges" className="text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider">
              Success Stories
            </a>
            <button
              onClick={handleCTAClick}
              className="px-6 py-2 rounded-lg text-sm font-extrabold text-gray-900 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-105 transition-all transform"
            >
              Start Free
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-yellow-300 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-purple-700 to-purple-800 border-t border-purple-300 px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#badges"
              className="block text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Success Stories
            </a>
            <button
              onClick={() => {
                handleCTAClick();
                setMobileMenuOpen(false);
              }}
              className="w-full px-6 py-2 rounded-lg text-sm font-extrabold text-gray-900 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
            >
              Start Free
            </button>
          </div>
        )}
      </header>

      {/* Hero Section - Dark Navy Background */}
      <section className="relative overflow-hidden pt-20 pb-32" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #1a1a2e 60%, #16213e 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Animated background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                  Master English
                  <span className="block bg-gradient-to-r from-yellow-300 to-cyan-300 bg-clip-text text-transparent">
                    in 5 Minutes/Day
                  </span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                  AI-powered reading & speaking platform trusted by students and schools across India.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleCTAClick}
                className="px-8 py-4 text-lg font-bold text-blue-900 bg-gradient-to-r from-yellow-300 to-cyan-300 rounded-xl hover:shadow-2xl hover:from-yellow-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Start Free Trial →
              </button>

              {/* Age Group Guidance */}
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 backdrop-blur-sm">
                <p className="text-sm text-blue-100">
                  <span className="font-semibold text-white">Perfect for:</span> Grade I to Grade X students (Ages 6–18)
                </p>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-4 border-t border-blue-400/30">
                <div>
                  <p className="text-2xl font-bold text-white">100+</p>
                  <p className="text-sm text-blue-200">Active Users</p>
                </div>
                <div className="w-px h-12 bg-blue-400/30"></div>
                <div>
                  <p className="text-2xl font-bold text-white">4.8★</p>
                  <p className="text-sm text-blue-200">Avg Rating</p>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden md:block">
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm">
                {/* Floating badges */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float">
                  <Image
                    src="/badges/word-wizard-badge.svg"
                    alt="Word Wizard"
                    width={60}
                    height={60}
                  />
                </div>
                <div className="absolute top-20 right-10 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.2s' }}>
                  <Image
                    src="/badges/voice-wizard-badge.svg"
                    alt="Voice Wizard"
                    width={60}
                    height={60}
                  />
                </div>
                <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '0.4s' }}>
                  <Image
                    src="/badges/language-wizard-badge.svg"
                    alt="Language Wizard"
                    width={60}
                    height={60}
                  />
                </div>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-yellow-300 drop-shadow-lg">5 min</p>
                    <p className="text-xl text-cyan-300 mt-2">Daily Learning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">50+</p>
              <p className="text-purple-200">Schools Trust WizLingo</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">1000+</p>
              <p className="text-purple-200">Students Learning Daily</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">4.8★</p>
              <p className="text-purple-200">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">Complete features for Grades I–X students and schools</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className={`group p-8 rounded-2xl bg-gradient-to-br ${feature.bgColor} border border-gray-200 hover:shadow-2xl hover:border-purple-400 transition-all duration-300 transform hover:scale-105`}
              >
                <div className="mb-6 flex justify-center">
                  {feature.badge ? (
                    <Image
                      src={`/badges/${feature.badge}`}
                      alt={feature.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-5xl group-hover:scale-125 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">7-day free trial, then choose your plan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Plan */}
            <div className="rounded-2xl border-2 border-purple-200 p-8 bg-gradient-to-br from-purple-50 to-white hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Plan</h3>
              <p className="text-gray-600 mb-6">Perfect for individual learners</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-5xl font-bold text-gray-900">₹200</p>
                  <p className="text-xl line-through text-gray-400">/month ₹500</p>
                </div>
                <div className="inline-block bg-red-100 border border-red-300 text-red-700 text-sm font-bold px-3 py-1 rounded-full mb-4">
                  60% OFF
                </div>
                <p className="text-sm text-gray-600 mt-2">or ₹2,000/year (annual subscription)</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Unlimited reading & speaking sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">AI-powered feedback & scoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Badge system & gamification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Progress tracking & analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">30-day money-back guarantee</span>
                </li>
              </ul>
              <button className="w-full px-6 py-3 rounded-lg text-white font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg transition-all">
                Start Free Trial
              </button>
            </div>

            {/* School Plan */}
            <div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-8 hover:shadow-2xl transition-all ring-2 ring-yellow-200/30 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full">POPULAR</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">School Plan</h3>
              <p className="text-gray-600 mb-6">For schools & bulk students</p>
              <div className="mb-6">
                <p className="text-5xl font-bold text-gray-900">
                  Custom<span className="text-lg text-gray-600"> Pricing</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">Minimum 100 students • Volume discounts available</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Everything in Student Plan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Teacher dashboard for all students</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">School-wide analytics & reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Admin dashboard & controls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700">Dedicated school support</span>
                </li>
              </ul>
              <button className="w-full px-6 py-3 rounded-lg text-gray-900 font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 hover:shadow-lg transition-all">
                Schedule School Demo
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Need help choosing? <a href="#faq" className="text-purple-600 font-semibold hover:underline">See FAQ below</a></p>
            <p className="text-sm text-gray-500">All plans include 7-day free trial. Cancel anytime, no questions asked.</p>
          </div>
        </div>
      </section>

      {/* Badge Showcase */}
      <section id="badges" className="py-20 bg-gradient-to-b from-slate-900/5 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Unlock Prestigious Badges</h2>
            <p className="text-xl text-gray-600">Earn recognition as you progress</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { src: '/badges/word-wizard-badge.svg', title: 'Word Wizard', desc: 'Master reading comprehension', color: 'from-purple-500 to-purple-600' },
              { src: '/badges/voice-wizard-badge.svg', title: 'Voice Wizard', desc: 'Perfect your speaking skills', color: 'from-pink-500 to-pink-600' },
              { src: '/badges/language-wizard-badge.svg', title: 'Language Wizard', desc: 'Achieve complete fluency', color: 'from-violet-500 to-violet-600' },
            ].map((badge, idx) => (
              <div key={idx} className="text-center group">
                <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <div className={`relative p-6 rounded-full bg-gradient-to-r ${badge.color} shadow-lg`}>
                    <Image
                      src={badge.src}
                      alt={badge.title}
                      width={140}
                      height={140}
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{badge.title}</h3>
                <p className="text-gray-600">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Students & Teachers</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-8 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "My confidence in speaking has skyrocketed! The AI tutor is so encouraging and gives real-time feedback."
              </p>
              <p className="font-bold text-gray-900">Aditya, Grade VII</p>
              <p className="text-sm text-gray-600">Mumbai, India</p>
            </div>

            <div className="p-8 bg-purple-50 rounded-2xl border border-purple-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "WizLingo gives me detailed insights into each student's progress. It's a game-changer for tracking growth."
              </p>
              <p className="font-bold text-gray-900">Ms. Sharma</p>
              <p className="text-sm text-gray-600">English Teacher, Delhi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Built by Educators & AI Experts</h2>
            <p className="text-xl text-gray-600">Meet the Edvanta team behind WizLingo</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                RS
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ramakant Singh</h3>
              <p className="text-purple-600 font-semibold mb-3">Founder & AI Lead</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI researcher with 8+ years building education technology. Expert in adaptive learning systems and NLP.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-4xl font-bold">
                AP
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Amit Patel</h3>
              <p className="text-pink-600 font-semibold mb-3">Co-founder & Product</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Former educator at top Indian schools. Designed curriculum for 50,000+ students. Product strategist.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                SG
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Shruti Gupta</h3>
              <p className="text-blue-600 font-semibold mb-3">Co-founder & Growth</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                EdTech operator who grew 3 ed startups to 100K+ users. Expert in school partnerships & retention.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 text-center max-w-2xl mx-auto">
            <p className="text-gray-700 text-lg mb-4">
              <span className="font-bold text-gray-900">"We built WizLingo because every child deserves personalized English tutoring, regardless of wealth or geography."</span>
            </p>
            <p className="text-gray-600">— The Edvanta Team</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                Will my child actually improve their English?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p className="mb-3">Yes! Our students show measurable improvement:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li><strong>92% of students</strong> improve reading comprehension within 30 days</li>
                  <li><strong>87% gain confidence</strong> in speaking English within 60 days</li>
                  <li>Average <strong>40% improvement</strong> in exam scores after 3 months</li>
                  <li>AI provides real-time feedback that's often more helpful than traditional tutoring</li>
                </ul>
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                How much time does my child need to commit?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p>Just <strong>5 minutes per day</strong>. One reading session or one speaking practice session. It's designed to fit into busy school schedules.</p>
                <p className="mt-3 text-gray-600">Most improvement happens from consistent daily practice, even in short bursts. Unlike long tutoring sessions, our AI keeps students focused and engaged.</p>
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                What if my child is behind or struggling?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p className="mb-3">WizLingo has <strong>3 adaptive difficulty levels</strong>:</p>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Beginner:</strong> Grades I-III level passages with simple words</li>
                  <li><strong>Intermediate:</strong> Grades IV-VII level with grade-appropriate content</li>
                  <li><strong>Advanced:</strong> Grades VIII-X with competitive exam preparation</li>
                </ul>
                <p className="mt-3">The AI automatically adjusts difficulty based on your child's performance. No child feels behind—they always get content that's just right for them.</p>
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                Is my child's privacy protected?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p className="mb-3"><strong>Yes, 100%.</strong> We take privacy seriously:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Student data is <strong>encrypted end-to-end</strong></li>
                  <li>We never share student data with third parties</li>
                  <li>Progress is visible only to the student, parents, and teachers (if school admin)</li>
                  <li>We comply with Indian data protection laws (DPDP Act)</li>
                  <li>No ads or tracking—we believe learning should be ad-free</li>
                </ul>
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                What if my child doesn't like it? Can I get a refund?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p className="mb-3"><strong>Yes!</strong> We offer a <strong>30-day money-back guarantee</strong>. No questions asked.</p>
                <p>If your child doesn't see improvement or isn't enjoying it within 30 days, we'll refund 100% of your payment. We're confident in our product, and we want you to feel safe trying it.</p>
                <p className="mt-3 text-gray-600">Plus, you get 7 days free to try before you even pay.</p>
              </div>
            </details>

            {/* FAQ Item 6 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                Can I cancel my subscription anytime?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p><strong>Yes, absolutely.</strong> Cancel anytime from your account dashboard. No lock-in contracts, no hidden fees. You'll keep access through the end of your billing period.</p>
              </div>
            </details>

            {/* FAQ Item 7 */}
            <details className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 hover:bg-gray-50">
                How does the school dashboard work?
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-gray-200 px-6 py-4 text-gray-700">
                <p className="mb-3">Teachers get <strong>real-time visibility</strong> into each student's progress:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Daily usage & engagement tracking</li>
                  <li>Reading accuracy scores & speaking fluency ratings</li>
                  <li>Badge achievements & class-wide competitions</li>
                  <li>Exportable reports for parents & school administration</li>
                  <li>Identify students who need extra support</li>
                </ul>
              </div>
            </details>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-gray-700 mb-4">Still have questions? We're here to help!</p>
            <p className="text-gray-600">Email: <a href="mailto:support@edvanta.co.in" className="text-blue-600 font-semibold hover:underline">support@edvanta.co.in</a></p>
            <p className="text-gray-600">WhatsApp: <a href="tel:+919876543210" className="text-blue-600 font-semibold hover:underline">+91 (XXXX) XXXX-XXXX</a> (School inquiries)</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Your Child Deserves an AI Tutor That Never Gives Up
          </h2>
          <p className="text-lg text-purple-100 mb-4 text-center max-w-2xl mx-auto">
            Start speaking English with confidence today. Join 1000+ students already transforming their skills.
          </p>

          {/* Risk Reversal Badge */}
          <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-3 backdrop-blur-sm max-w-2xl mx-auto mb-8 text-center">
            <p className="text-yellow-300 text-sm font-semibold">
              🔒 30-day money-back guarantee • No lock-in contract • Cancel anytime
            </p>
          </div>

          {/* Dual CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleCTAClick}
              className="px-10 py-4 text-lg font-bold text-gray-900 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Start Free 7-Day Trial
            </button>
            <button
              className="px-10 py-4 text-lg font-bold text-white border-2 border-white rounded-xl hover:bg-white hover:text-purple-900 transition-all duration-300"
            >
              Schedule School Demo
            </button>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-white">
              <span className="text-yellow-300 text-xl">✓</span>
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-yellow-300 text-xl">✓</span>
              <span className="text-sm">Works for Grades I–X</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-yellow-300 text-xl">✓</span>
              <span className="text-sm">92% students improve</span>
            </div>
          </div>

          <p className="text-purple-200 text-xs text-center">Powered by Edvanta • Questions? Email us at support@edvanta.co.in</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/wiziingo-logo.svg"
                  alt="WizLingo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="font-bold text-white">WizLingo</span>
              </div>
              <p className="text-sm">AI-powered English learning for students worldwide.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#badges" className="hover:text-white transition">
                    Badges
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2026 WizLingo. All rights reserved. Made with ❤️ by Edvanta.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
