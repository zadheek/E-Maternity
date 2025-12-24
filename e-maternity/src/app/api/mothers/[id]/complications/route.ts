import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

// PUT /api/mothers/[id]/complications - Update abnormal baby history
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      );
    }

    // Only doctors, midwives, and admins can update this
    if (!['DOCTOR', 'MIDWIFE', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { hadAbnormalBabies, abnormalBabyDetails } = body;

    // Validate
    if (hadAbnormalBabies === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'hadAbnormalBabies is required' },
        },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.motherProfile.update({
      where: { id },
      data: {
        hadAbnormalBabies,
        abnormalBabyDetails: abnormalBabyDetails || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedProfile,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating complications:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update complications' },
      },
      { status: 500 }
    );
  }
}
