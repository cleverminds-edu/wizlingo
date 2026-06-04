import { NextRequest, NextResponse } from 'next/server';
import { getSchoolMetrics, getAllSchoolsMetrics, getSchoolComparison } from '@/lib/school-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/school-metrics?schoolId=xyz&type=metrics|all|comparison
 *
 * Returns school metrics data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');
    const type = searchParams.get('type') || 'metrics';

    if (!schoolId) {
      return NextResponse.json(
        { error: 'schoolId required' },
        { status: 400 }
      );
    }

    if (type === 'metrics') {
      const metrics = await getSchoolMetrics(schoolId);
      return NextResponse.json(metrics);
    } else if (type === 'all') {
      const allMetrics = await getAllSchoolsMetrics();
      return NextResponse.json({ schools: allMetrics });
    } else if (type === 'comparison') {
      const comparison = await getSchoolComparison(schoolId);
      return NextResponse.json(comparison);
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[School Metrics API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch school metrics' },
      { status: 500 }
    );
  }
}
