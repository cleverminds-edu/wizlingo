import { Suspense } from 'react';
import { classInclude, primaryClass } from '@/lib/student-class';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { trackFunnelStep } from '@/lib/conversion-funnel';

// Next 16: dynamic route params are a Promise and must be awaited.
interface ReferralRedirectPageProps {
  params: Promise<{
    code: string;
  }>;
}

async function ReferralContent({ code }: { code: string }) {
  // redirect() works by throwing, so it must be called outside try/catch
  // (inside, the catch swallowed every redirect and sent everyone to "/").
  let target = '/';
  try {
    const referral = await prisma.referral.findUnique({
      where: { referralCode: code },
      include: {
        referrer: {
          include: classInclude,
        },
      },
    });

    if (referral && referral.status !== 'expired') {
      const schoolId = primaryClass(referral.referrer)?.schoolId ?? undefined;

      // Track the landing view
      await trackFunnelStep('landing_view', {
        studentId: referral.referrerId,
        source: 'referral',
        referralCode: code,
        schoolId,
      });

      // School referrer → school landing page; B2C referrer → login with the referral code
      target = schoolId
        ? `/landing/${schoolId}?ref=${code}&school=${schoolId}`
        : `/login?ref=${code}`;
    }
  } catch (error) {
    console.error('Error processing referral:', error);
  }
  redirect(target);
}

export default async function ReferralRedirectPage({ params }: ReferralRedirectPageProps) {
  const { code } = await params;
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
      <ReferralContent code={code} />
    </Suspense>
  );
}
