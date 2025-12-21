import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
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

    // Get total patients
    const totalPatients = await prisma.motherProfile.count({
      where: { assignedMidwifeId: midwifeProfile.id },
    });

    // Get high-risk patients
    const highRiskPatients = await prisma.motherProfile.count({
      where: {
        assignedMidwifeId: midwifeProfile.id,
        riskLevel: { in: ['HIGH', 'CRITICAL'] },
      },
    });

    // Get today's visits/appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitsToday = await prisma.appointment.count({
      where: {
        providerId: userId,
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    });

    // Get pending followups (high-risk patients not seen in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const highRiskPatientsIds = await prisma.motherProfile.findMany({
      where: {
        assignedMidwifeId: midwifeProfile.id,
        riskLevel: { in: ['HIGH', 'CRITICAL'] },
      },
      select: { userId: true },
    });

    let pendingFollowups = 0;
    for (const patient of highRiskPatientsIds) {
      const recentVisit = await prisma.appointment.findFirst({
        where: {
          motherId: patient.userId,
          providerId: userId,
          status: 'COMPLETED',
          scheduledDate: { gte: sevenDaysAgo },
        },
      });

      if (!recentVisit) {
        pendingFollowups++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPatients,
        highRiskPatients,
        visitsToday,
        pendingFollowups,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch midwife stats error:', error);
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
