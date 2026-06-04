'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const FEEDBACK_ISSUES = {
  reading: [
    { value: 'too_easy', label: 'Passages too easy' },
    { value: 'too_hard', label: 'Passages too hard' },
    { value: 'speech_failed', label: 'Speech recognition failed' },
    { value: 'feedback_unclear', label: 'AI feedback unclear' },
    { value: 'app_crashed', label: 'App crashed' },
    { value: 'confusing_ui', label: 'UI confusing' },
    { value: 'other', label: 'Other' },
  ],
  speaking: [
    { value: 'too_easy', label: 'Topics too easy' },
    { value: 'too_hard', label: 'Topics too hard' },
    { value: 'character_slow', label: 'Character too slow' },
    { value: 'feedback_unclear', label: 'Feedback unclear' },
    { value: 'app_crashed', label: 'App crashed' },
    { value: 'confusing_ui', label: 'UI confusing' },
    { value: 'other', label: 'Other' },
  ],
};

interface FeedbackModalProps {
  studentId: string;
  sessionType: 'reading' | 'speaking';
  onClose: () => void;
}

export default function FeedbackModal({
  studentId,
  sessionType,
  onClose,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const issues = FEEDBACK_ISSUES[sessionType];

  const handleIssueToggle = (value: string) => {
    setSelectedIssues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!rating) {
      alert('Please rate this session');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionType,
          rating,
          selectedIssues,
          comment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-6 text-center shadow-2xl">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-600">
            Your feedback helps us improve WizLingo for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Help us improve 👇
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Great job! Your feedback helps us make WizLingo better.
        </p>

        {/* Rating */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            How was this session?
          </label>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-4xl transition transform hover:scale-110 ${
                  rating === star ? 'scale-125' : 'opacity-50'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What could be better?
          </label>
          <div className="space-y-2">
            {issues.map((issue) => (
              <label
                key={issue.value}
                className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition"
              >
                <input
                  type="checkbox"
                  checked={selectedIssues.includes(issue.value)}
                  onChange={() => handleIssueToggle(issue.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{issue.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Any additional comments? (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none h-24"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
