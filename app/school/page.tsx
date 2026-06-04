'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function SchoolPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => setDemoSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b-2 border-yellow-400/50"
        style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', height: '88px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center h-full">
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
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#benefits" className="text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider">
              Benefits
            </a>
            <a href="#pricing" className="text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider">
              Pricing
            </a>
            <a href="#demo" className="text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider">
              Demo
            </a>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-yellow-300 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-purple-700 to-purple-800 border-t border-purple-300 px-4 py-4 space-y-3">
            <a
              href="#benefits"
              className="block text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefits
            </a>
            <a
              href="#pricing"
              className="block text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#demo"
              className="block text-sm font-semibold text-gray-200 hover:text-white transition uppercase tracking-wider py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #1a1a2e 60%, #16213e 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                  Transform Your School's English Program
                  <span className="block bg-gradient-to-r from-yellow-300 to-cyan-300 bg-clip-text text-transparent">
                    with AI-Powered Learning
                  </span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                  50+ schools across India are already using WizLingo to help their students master English. See measurable improvements in reading comprehension and speaking skills in just 90 days.
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-4 backdrop-blur-sm">
                <p className="text-yellow-300 font-semibold text-sm">
                  ✓ Proven ROI: 40% improvement in exam scores<br/>
                  ✓ Real school data: 1000+ active students<br/>
                  ✓ 30-day guarantee: See results or full refund
                </p>
              </div>

              <a
                href="#demo"
                className="px-8 py-4 text-lg font-bold text-blue-900 bg-gradient-to-r from-yellow-300 to-cyan-300 rounded-xl hover:shadow-2xl hover:from-yellow-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Request Demo →
              </a>
            </div>

            <div className="relative hidden md:block">
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-yellow-300 drop-shadow-lg">40%</p>
                    <p className="text-xl text-cyan-300 mt-2">Average Score Improvement</p>
                    <p className="text-sm text-blue-200 mt-4">In 90 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Benefits Section */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why 50+ Schools Choose WizLingo</h2>
            <p className="text-xl text-gray-600">Complete solution for standardized, scalable English learning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Live Teacher Dashboard',
                description: 'Real-time visibility into each student\'s progress, accuracy scores, and speaking fluency. Export reports for parents and administration.',
                stat: '100% of teachers',
                statDesc: 'report better insights'
              },
              {
                title: 'Proven Results',
                description: '40% average improvement in exam scores. 92% of students show measurable progress within 30 days. Documented case studies available.',
                stat: '4.8★',
                statDesc: 'School rating'
              },
              {
                title: 'Easy Implementation',
                description: 'Integrate with your existing schedule. Works across grades I-X. Takes 15 minutes daily. No special equipment needed.',
                stat: '5 min',
                statDesc: 'Per day per student'
              },
              {
                title: 'Affordable for Schools',
                description: 'Just ₹200 per student per year. Bulk discounts available. Full school data ownership. Lifetime access to student progress history.',
                stat: '₹200',
                statDesc: 'Per student/year'
              },
              {
                title: 'Engagement & Retention',
                description: 'Gamified learning with badges keeps students motivated. Class competitions drive healthy engagement. Detailed analytics show which students need support.',
                stat: '85%',
                statDesc: 'Weekly engagement rate'
              },
              {
                title: 'Dedicated Support',
                description: 'Onboarding support for all teachers. Monthly performance reviews. Direct contact with our education team. Curriculum alignment consultation.',
                stat: '24/7',
                statDesc: 'Email support'
              },
            ].map((benefit, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 hover:shadow-xl transition-all">
                <div className="mb-4">
                  <p className="text-3xl font-bold text-purple-600">{benefit.stat}</p>
                  <p className="text-sm text-gray-600">{benefit.statDesc}</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-700 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-24 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Calculate Your School's ROI</h2>
            <p className="text-xl text-gray-600">See the impact on exam scores and student engagement</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Students</label>
                  <input type="number" placeholder="e.g. 100" defaultValue={100} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Classes</label>
                  <input type="number" placeholder="e.g. 4" defaultValue={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Score Improvement</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Conservative (25%)</option>
                    <option selected>Average (40%)</option>
                    <option>Optimistic (50%)</option>
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 space-y-6">
                <div className="border-b-2 border-purple-300 pb-4">
                  <p className="text-gray-600 text-sm">Annual Cost</p>
                  <p className="text-4xl font-bold text-purple-600">₹20,000</p>
                  <p className="text-xs text-gray-600">100 students × ₹200/year</p>
                </div>

                <div className="border-b-2 border-purple-300 pb-4">
                  <p className="text-gray-600 text-sm">Estimated Benefit (Per Year)</p>
                  <p className="text-4xl font-bold text-green-600">₹1,50,000+</p>
                  <p className="text-xs text-gray-600">40 students improve exam scores<br/>(Increased admissions, reputation, better rankings)</p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700 font-bold">ROI: <span className="text-3xl text-green-600">650%+</span></p>
                  <p className="text-xs text-gray-600 mt-1">(₹1,50,000 benefit ÷ ₹20,000 cost)<br/>Plus: happier parents, better board exam scores, school reputation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing for Schools */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Transparent School Pricing</h2>
            <p className="text-xl text-gray-600">Bulk discounts available for larger implementations</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-300 p-8 md:p-12 text-center">
            <p className="text-sm text-yellow-700 font-semibold uppercase tracking-widest mb-4">School Plan</p>
            <p className="text-6xl font-bold text-gray-900 mb-2">
              ₹200<span className="text-2xl text-gray-600">/student/year</span>
            </p>
            <p className="text-gray-600 mb-8">Minimum 100 students • Pricing negotiable for larger implementations</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">What's Included</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">✓</span>
                    <span>Unlimited reading & speaking sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">✓</span>
                    <span>Live teacher dashboard for all students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">✓</span>
                    <span>School-wide analytics & progress reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">✓</span>
                    <span>Admin controls & credential isolation</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Volume Pricing</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>100–250 students:</strong> ₹180/student/yr (10% discount)</li>
                  <li><strong>251–500 students:</strong> ₹160/student/yr (20% discount)</li>
                  <li><strong>500+ students:</strong> Custom pricing (30%+ discount)</li>
                  <li><strong>Multi-school districts:</strong> Contact sales for negotiated rates</li>
                </ul>
              </div>
            </div>

            <button className="px-10 py-4 text-lg font-bold text-gray-900 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
              Request Custom Quote
            </button>
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section id="demo" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">See WizLingo in Action</h2>
            <p className="text-xl text-gray-600">30-minute personalized demo with one of our education specialists</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {demoSubmitted ? (
              <div className="text-center py-8">
                <p className="text-2xl font-bold text-green-600 mb-2">✓ Demo request received!</p>
                <p className="text-gray-600">We'll contact you within 24 hours to schedule your demo.</p>
              </div>
            ) : (
              <form onSubmit={handleDemoRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Name *</label>
                  <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Principal/Admin Name *</label>
                    <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role *</label>
                    <select required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Principal</option>
                      <option>Academic Coordinator</option>
                      <option>English Department Head</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Students</label>
                  <input type="number" placeholder="e.g. 500" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">What's your main goal? *</label>
                  <textarea required rows={3} placeholder="e.g. Improve exam scores, increase student engagement, implement AI learning" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 text-lg font-bold text-gray-900 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300"
                >
                  Schedule Demo Now
                </button>

                <p className="text-xs text-gray-500 text-center">We'll contact you within 24 hours. No obligation, no pressure.</p>
              </form>
            )}
          </div>
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
              <p className="text-sm">AI-powered English learning for schools.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/" className="hover:text-white transition">For Students</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@edvanta.co.in" className="hover:text-white transition">support@edvanta.co.in</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2026 WizLingo for Schools. All rights reserved. Powered by Edvanta.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
