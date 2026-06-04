'use client';

import React, { useState } from 'react';
import { Gift, Share2, Copy, Check } from 'lucide-react';

interface ReferralRewardPromptProps {
  studentName: string;
  referralLink: string;
  onShare: () => void;
}

export function ReferralRewardPrompt({
  studentName,
  referralLink,
  onShare,
}: ReferralRewardPromptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rewardMilestones = [
    { friends: 1, reward: 'Gold Badge Variant', icon: '🥇' },
    { friends: 2, reward: 'Silver Badge Variant', icon: '🥈' },
    { friends: 3, reward: 'Rainbow Badge Variant', icon: '🌈' },
    { friends: 5, reward: 'Glow Effect', icon: '✨' },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-8 h-8 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-900">
          Share & Earn Bonuses
        </h3>
      </div>

      <p className="text-gray-700 mb-6 text-lg">
        Share your achievement with friends and family. When they join using your link, you unlock exclusive badge variants and bonuses!
      </p>

      {/* Reward milestones */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
        <h4 className="font-bold text-gray-900 mb-4">Unlock Rewards:</h4>
        <div className="grid grid-cols-2 gap-4">
          {rewardMilestones.map((milestone) => (
            <div
              key={milestone.friends}
              className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-3 text-center"
            >
              <div className="text-2xl mb-2">{milestone.icon}</div>
              <div className="text-sm font-bold text-gray-900">
                {milestone.friends} friend{milestone.friends > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {milestone.reward}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share link */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Personal Referral Link:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-700"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition"
        >
          <Share2 className="w-5 h-5" />
          Share Link
        </button>
        <button
          onClick={() => {
            const text = `Join WizLingo! 🧙‍♂️ I'm learning English and earning badges. Join my school: ${referralLink}`;
            if (navigator.share) {
              navigator.share({
                title: 'Join WizLingo',
                text,
                url: referralLink,
              });
            } else {
              handleCopy();
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:shadow-lg transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
      </div>

      {/* Bottom note */}
      <p className="text-sm text-gray-600 text-center mt-6">
        When your friends sign up using your link, you'll both get rewards!
      </p>
    </div>
  );
}
