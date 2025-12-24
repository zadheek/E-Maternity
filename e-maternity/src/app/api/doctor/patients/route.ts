import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'DOCTOR') {
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

    // Get doctor profile
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Doctor profile not found',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    // Build filter - Allow all doctors to view all patients (hospital shift-based workflow)
    const whereClause: Prisma.MotherProfileWhereInput = {};

    if (riskFilter) {
      whereClause.riskLevel = riskFilter as any;
    }

    // Get all patients with their user details (not just assigned patients)
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

    // Transform data for frontend
    const patientSummaries = await Promise.all(
      patients.map(async (patient: typeof patients[number]) => {
        // Calculate age
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

        // Get last appointment
        const lastAppointment = await prisma.appointment.findFirst({
          where: {
            motherId: patient.userId,
            status: 'COMPLETED',
          },
          orderBy: {
            scheduledDate: 'desc',
          },
        });

        // Get next appointment
        const nextAppointment = await prisma.appointment.findFirst({
          where: {
            motherId: patient.userId,
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
            scheduledDate: { gte: new Date() },
          },
          orderBy: {
            scheduledDate: 'asc',
          },
        });

        // Get recent health metrics
        const recentBP = await prisma.healthMetric.findFirst({
          where: {
            motherId: patient.userId,
            type: 'BLOOD_PRESSURE_SYSTOLIC',
          },
          orderBy: {
            recordedAt: 'desc',
          },
        });

        const recentBPDiastolic = await prisma.healthMetric.findFirst({
          where: {
            motherId: patient.userId,
            type: 'BLOOD_PRESSURE_DIASTOLIC',
          },
          orderBy: {
            recordedAt: 'desc',
          },
        });

        const recentWeight = await prisma.healthMetric.findFirst({
          where: {
            motherId: patient.userId,
            type: 'WEIGHT',
          },
          orderBy: {
            recordedAt: 'desc',
          },
        });

        return {
          id: patient.userId,
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          age,
          pregnancyWeek: patient.pregnancyWeek,
          riskLevel: patient.riskLevel,
          lastVisit: lastAppointment?.scheduledDate.toISOString(),
          nextAppointment: nextAppointment?.scheduledDate.toISOString(),
          recentMetrics: {
            bloodPressure:
              recentBP && recentBPDiastolic
                ? `${recentBP.value}/${recentBPDiastolic.value}`
                : undefined,
            weight: recentWeight?.value,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: patientSummaries,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch doctor patients error:', error);
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
