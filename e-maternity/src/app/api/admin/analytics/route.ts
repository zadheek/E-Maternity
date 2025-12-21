import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const district = searchParams.get('district');

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Risk distribution
    const riskDistribution = await prisma.motherProfile.groupBy({
      by: ['riskLevel'],
      _count: {
        id: true,
      },
      ...(district && {
        where: {
          district,
        },
      }),
    });

    // District-wise statistics
    const districtStats = await prisma.motherProfile.groupBy({
      by: ['district'],
      _count: {
        id: true,
      },
      _avg: {
        pregnancyWeek: true,
      },
    });

    // Appointments by status
    const appointmentStats = await prisma.appointment.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: {
        scheduledDate: {
          gte: daysAgo,
        },
      },
    });

    // Appointments by type
    const appointmentTypes = await prisma.appointment.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
      where: {
        scheduledDate: {
          gte: daysAgo,
        },
      },
    });

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        scheduledDate: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        scheduledDate: true,
        status: true,
      },
    });

    // Group by month
    const monthlyData = monthlyAppointments.reduce((acc: any, apt) => {
      const month = new Date(apt.scheduledDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      if (!acc[month]) {
        acc[month] = { total: 0, completed: 0, cancelled: 0, missed: 0 };
      }
      acc[month].total++;
      if (apt.status === 'COMPLETED') acc[month].completed++;
      if (apt.status === 'CANCELLED') acc[month].cancelled++;
      if (apt.status === 'MISSED') acc[month].missed++;
      return acc;
    }, {});

    // Emergency alerts trends
    const emergencyTrends = await prisma.emergencyAlert.groupBy({
      by: ['type', 'status'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: daysAgo,
        },
      },
    });

    // Health metrics summary (recent averages)
    const recentMetrics = await prisma.healthMetric.findMany({
      where: {
        recordedAt: {
          gte: daysAgo,
        },
      },
      select: {
        type: true,
        value: true,
      },
    });

    const metricAverages = recentMetrics.reduce((acc: any, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = { sum: 0, count: 0 };
      }
      acc[metric.type].sum += metric.value;
      acc[metric.type].count++;
      return acc;
    }, {});

    const averages = Object.entries(metricAverages).map(([type, data]: [string, any]) => ({
      type,
      average: parseFloat((data.sum / data.count).toFixed(2)),
      count: data.count,
    }));

    // Overall summary
    const totalMothers = await prisma.user.count({
      where: { role: 'MOTHER' },
    });

    const totalDoctors = await prisma.user.count({
      where: { role: 'DOCTOR' },
    });

    const totalMidwives = await prisma.user.count({
      where: { role: 'MIDWIFE' },
    });

    const totalAppointments = await prisma.appointment.count({
      where: {
        scheduledDate: {
          gte: daysAgo,
        },
      },
    });

    const activeEmergencies = await prisma.emergencyAlert.count({
      where: {
        status: 'ACTIVE',
      },
    });

    const highRiskMothers = await prisma.motherProfile.count({
      where: {
        riskLevel: {
          in: ['HIGH', 'CRITICAL'],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalMothers,
          totalDoctors,
          totalMidwives,
          totalAppointments,
          activeEmergencies,
          highRiskMothers,
        },
        riskDistribution: riskDistribution.map((item) => ({
          level: item.riskLevel,
          count: item._count.id,
        })),
        districtStats: districtStats.map((item) => ({
          district: item.district,
          count: item._count.id,
          avgPregnancyWeek: item._avg.pregnancyWeek
            ? parseFloat(item._avg.pregnancyWeek.toFixed(1))
            : 0,
        })),
        appointmentStats: appointmentStats.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        appointmentTypes: appointmentTypes.map((item) => ({
          type: item.type,
          count: item._count.id,
        })),
        monthlyTrends: Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
          month,
          ...data,
        })),
        emergencyTrends: emergencyTrends.map((item) => ({
          type: item.type,
          status: item.status,
          count: item._count.id,
        })),
        healthMetrics: averages,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
      },
      { status: 500 }
    );
  }
}
