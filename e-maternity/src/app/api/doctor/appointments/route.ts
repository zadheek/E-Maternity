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

    // Fetch all appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: session.user.id,
        providerType: 'doctor',
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
        scheduledDate: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: appointments,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch appointments',
        },
      },
      { status: 500 }
    );
  }
}
