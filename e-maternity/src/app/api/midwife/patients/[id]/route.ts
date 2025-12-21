import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'MIDWIFE') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const patientUserId = params.id;

    // Get midwife profile
    const midwifeProfile = await prisma.midwifeProfile.findUnique({
      where: { userId },
    });

    if (!midwifeProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Midwife profile not found',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    // Get patient profile and verify assignment
    const patient = await prisma.motherProfile.findFirst({
      where: {
        userId: patientUserId,
        assignedMidwifeId: midwifeProfile.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        emergencyContacts: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Patient not found or not assigned to you',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch patient',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
