import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MIDWIFE') {
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

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const riskFilter = searchParams.get('riskLevel');

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

    // Build filter
    const whereClause: Prisma.MotherProfileWhereInput = {
      assignedMidwifeId: midwifeProfile.id,
    };

    if (riskFilter) {
      whereClause.riskLevel = riskFilter as any;
    }

    // Get assigned patients
    const patients = await prisma.motherProfile.findMany({
      where: whereClause,
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
      },
      orderBy: {
        riskLevel: 'desc',
      },
    });

    // Transform data
    const patientSummaries = await Promise.all(
      patients.map(async (patient: typeof patients[number]) => {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

        const lastVisit = await prisma.appointment.findFirst({
          where: {
            motherId: patient.userId,
            status: 'COMPLETED',
          },
          orderBy: {
            scheduledDate: 'desc',
          },
        });

        const nextCheckup = await prisma.appointment.findFirst({
          where: {
            motherId: patient.userId,
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
            scheduledDate: { gte: new Date() },
          },
          orderBy: {
            scheduledDate: 'asc',
          },
        });

        return {
          id: patient.userId,
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          age,
          pregnancyWeek: patient.pregnancyWeek,
          riskLevel: patient.riskLevel,
          district: patient.district,
          lastVisit: lastVisit?.scheduledDate.toISOString(),
          nextCheckup: nextCheckup?.scheduledDate.toISOString(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: patientSummaries,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch midwife patients error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch patients',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
