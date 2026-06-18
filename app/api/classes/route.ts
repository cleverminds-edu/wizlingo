import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        classes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
