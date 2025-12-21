import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get mother profile to find motherProfileId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { motherProfile: true },
    });

    if (!user?.motherProfile) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Mother profile not found' },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    const records = await prisma.fetalGrowthRecord.findMany({
      where: { motherProfileId: user.motherProfile.id },
      orderBy: { week: 'desc' },
    }).catch(() => []);

    return NextResponse.json<ApiResponse<typeof records>>({
      success: true,
      data: records,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get fetal growth records error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch fetal growth records' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Get mother profile to find motherProfileId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { motherProfile: true },
    });

    if (!user?.motherProfile) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Mother profile not found' },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    const record = await prisma.fetalGrowthRecord.create({
      data: {
        motherProfileId: user.motherProfile.id,
        week: body.week,
        weight: body.weight,
        length: body.length,
        headCircumference: body.headCircumference,
        abdominalCircumference: body.abdominalCircumference,
        notes: body.notes || '',
        recordedBy: userId,
      },
    });

    return NextResponse.json<ApiResponse<typeof record>>({
      success: true,
      data: record,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Create fetal growth record error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create fetal growth record' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
