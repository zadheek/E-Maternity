import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
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

    // Get total patients assigned to this doctor
    const totalPatients = await prisma.motherProfile.count({
      where: { assignedDoctorId: doctorProfile.id },
    });

    // Get high-risk patients
    const highRiskPatients = await prisma.motherProfile.count({
      where: {
        assignedDoctorId: doctorProfile.id,
        riskLevel: { in: ['HIGH', 'CRITICAL'] },
      },
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await prisma.appointment.count({
      where: {
        providerId: userId,
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    });

    // Get pending reviews (appointments marked as completed but no notes)
    const pendingReviews = await prisma.appointment.count({
      where: {
        providerId: userId,
        status: 'COMPLETED',
        notes: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalPatients,
        highRiskPatients,
        appointmentsToday,
        pendingReviews,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch doctor stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch statistics',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
