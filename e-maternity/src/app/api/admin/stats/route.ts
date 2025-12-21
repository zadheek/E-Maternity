import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
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

    // Get counts for all user types
    const [totalMothers, totalDoctors, totalMidwives] = await Promise.all([
      prisma.user.count({ where: { role: 'MOTHER' } }),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.user.count({ where: { role: 'MIDWIFE' } }),
    ]);

    // Get high-risk mothers count
    const highRiskMothers = await prisma.motherProfile.count({
      where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } },
    });

    // Get active emergencies count
    const activeEmergencies = await prisma.emergencyAlert.count({
      where: { status: 'ACTIVE' },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalMothers,
        totalDoctors,
        totalMidwives,
        highRiskMothers,
        activeEmergencies,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
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
