'use client';

import { useState } from 'react';
import { BadgeType } from '@/app/generated/prisma/client';

interface CertificateDownloadButtonProps {
  studentId: string;
  badgeType: BadgeType;
  verifyCode: string;
}

declare global {
  interface Window {
    html2pdf?: any;
  }
}

export default function CertificateDownloadButton({
  studentId,
  badgeType,
  verifyCode,
}: CertificateDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build the download URL
      const url = new URL('/api/certificates/download', window.location.origin);
      url.searchParams.set('studentId', studentId);
      url.searchParams.set('badgeType', badgeType);
      url.searchParams.set('verifyCode', verifyCode);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download certificate');
      }

      // Get the HTML content
      const htmlContent = await response.text();

      // Load html2pdf library if not already loaded
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Create temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1000px';
      document.body.appendChild(tempContainer);

      // Generate PDF
      const element = tempContainer.querySelector('.certificate') as HTMLElement;
      if (!element) {
        throw new Error('Certificate element not found');
      }

      const options = {
        margin: [0, 0, 0, 0],
        filename: `WizLingo_Certificate_${badgeType}_${studentId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { format: 'a4', orientation: 'portrait' },
      };

      window.html2pdf().set(options).from(element).save();

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download certificate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Preparing...
          </>
        ) : (
          <>
            📥 Download PDF
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-full mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </>
  );
}
