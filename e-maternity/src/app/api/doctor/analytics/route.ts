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

    // Get doctor profile
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Doctor profile not found' } },
        { status: 404 }
      );
    }

    // Fetch all patients
    const patients = await prisma.motherProfile.findMany({
      where: { assignedDoctorId: doctorProfile.id },
      select: {
        riskLevel: true,
        district: true,
      },
    });

    // Risk distribution
    const riskDistribution = {
      LOW: patients.filter((p) => p.riskLevel === 'LOW').length,
      MODERATE: patients.filter((p) => p.riskLevel === 'MODERATE').length,
      HIGH: patients.filter((p) => p.riskLevel === 'HIGH').length,
      CRITICAL: patients.filter((p) => p.riskLevel === 'CRITICAL').length,
    };

    // Appointment stats
    const appointments = await prisma.appointment.findMany({
      where: { providerId: session.user.id },
      select: { status: true },
    });

    const appointmentStats = {
      total: appointments.length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      upcoming: appointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
    };

    // Prescription stats
    const prescriptions = await prisma.prescription.findMany({
      where: { prescribedById: session.user.id },
      select: {
        prescribedDate: true,
        validUntil: true,
      },
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activePrescriptions = prescriptions.filter(
      (p) => !p.validUntil || new Date(p.validUntil) > now
    );

    const prescriptionStats = {
      total: prescriptions.length,
      thisMonth: prescriptions.filter((p) => new Date(p.prescribedDate) >= thisMonthStart).length,
      active: activePrescriptions.length,
    };

    // District distribution
    const districtMap = new Map<string, number>();
    patients.forEach((p) => {
      const count = districtMap.get(p.district) || 0;
      districtMap.set(p.district, count + 1);
    });

    const districtDistribution = Array.from(districtMap.entries())
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    const analyticsData = {
      totalPatients: patients.length,
      riskDistribution,
      appointmentStats,
      prescriptionStats,
      districtDistribution,
      weeklyTrends: [], // Can be implemented later
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch analytics',
        },
      },
      { status: 500 }
    );
  }
}
