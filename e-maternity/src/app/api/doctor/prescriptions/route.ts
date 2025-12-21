import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Fetch all prescriptions created by this doctor
    const prescriptions = await prisma.prescription.findMany({
      where: {
        prescribedById: session.user.id,
      },
      include: {
        mother: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            motherProfile: {
              select: {
                pregnancyWeek: true,
                riskLevel: true,
              },
            },
          },
        },
      },
      orderBy: {
        prescribedDate: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: prescriptions,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch prescriptions',
        },
      },
      { status: 500 }
    );
  }
}
