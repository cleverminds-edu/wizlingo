'use client';

import React, { useState, useEffect } from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';
import Image from 'next/image';

interface BadgeShareModalProps {
  studentId: string;
  badgeType: BadgeType;
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeShareModal({
  studentId,
  badgeType,
  studentName,
  isOpen,
  onClose,
}: BadgeShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const badgeConfig = getBadgeConfig(badgeType);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/badges/${studentId}/${badgeType}/share`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to generate share');

      const data = await res.json();
      setShareData(data);
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (shareData?.shareUrls?.whatsapp) {
      window.open(shareData.shareUrls.whatsapp, '_blank');
      trackShare('whatsapp');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && shareData?.nativeShare) {
      try {
        await navigator.share(shareData.nativeShare);
        trackShare('native');
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    if (shareData?.shareUrls?.verifyUrl) {
      await navigator.clipboard.writeText(shareData.shareUrls.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('link');
    }
  };

  const trackShare = async (method: string) => {
    await fetch('/api/analytics/badge-share', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        badgeType,
        method,
        platform: 'web',
      }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <img
              src={badgeConfig.badgeImage}
              alt={badgeConfig.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            You Earned {badgeConfig.name}!
          </h2>
          <p className="text-gray-600 mt-2">Share your achievement with friends & family</p>
        </div>

        {/* Badge Preview */}
        {shareData?.shareUrls?.badgeUrl && (
          <div className="mb-6 flex justify-center">
            <div className="relative w-64 h-64">
              <Image
                src={shareData.shareUrls.badgeUrl}
                alt={badgeConfig.name}
                fill
                className="rounded-xl object-cover"
              />
            </div>
          </div>
        )}

        {/* Share Buttons */}
        {!shareData ? (
          <button
            onClick={handleGenerateShare}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Generating...' : 'Generate Share Link'}
          </button>
        ) : (
          <div className="space-y-3">
            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share to WhatsApp
            </button>

            {/* Native Share (if supported) */}
            {canShare && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Share on Instagram Story
              </button>
            )}

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3 rounded-lg bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition"
            >
              {copied ? '✓ Link Copied!' : 'Copy Verification Link'}
            </button>
          </div>
        )}

        {/* Share Text Preview */}
        {shareData?.shareText && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Your share message:</p>
            <p className="text-sm text-gray-600 italic">{shareData.shareText}</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
