import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { trackFunnelStep } from '@/lib/conversion-funnel';

interface ReferralRedirectPageProps {
  params: {
    code: string;
  };
}

async function ReferralContent({ code }: { code: string }) {
  try {
    const referral = await prisma.referral.findUnique({
      where: { referralCode: code },
      include: {
        referrer: {
          include: { class: true },
        },
      },
    });

    if (!referral || referral.status === 'expired') {
      redirect('/');
    }

    // Track the landing view
    await trackFunnelStep('landing_view', {
      studentId: referral.referrerId,
      source: 'referral',
      referralCode: code,
      schoolId: referral.referrer.class?.schoolId,
    });

    // Redirect to school-specific landing page
    const schoolId = referral.referrer.class?.schoolId;
    if (schoolId) {
      redirect(
        `/landing/${schoolId}?ref=${code}&school=${schoolId}`
      );
    } else {
      redirect(`/login?ref=${code}`);
    }
  } catch (error) {
    console.error('Error processing referral:', error);
    redirect('/');
  }
}

export default function ReferralRedirectPage({ params }: ReferralRedirectPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting you...</p>
          </div>
        </div>
      }
    >
      <ReferralContent code={params.code} />
    </Suspense>
  );
}
