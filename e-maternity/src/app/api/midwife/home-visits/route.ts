import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

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
    const patientId = searchParams.get('patientId');

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

    // Verify patient assignment
    if (patientId) {
      const patient = await prisma.motherProfile.findFirst({
        where: {
          userId: patientId,
          assignedMidwifeId: midwifeProfile.id,
        },
      });

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Patient not assigned to you',
            },
            timestamp: new Date(),
          },
          { status: 403 }
        );
      }
    }

    const visits = await prisma.homeVisit.findMany({
      where: patientId ? {
        motherProfileId: patientId,
        midwifeProfileId: midwifeProfile.id,
      } : {
        midwifeProfileId: midwifeProfile.id,
      },
      orderBy: {
        visitDate: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: visits,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get home visits error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch home visits',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const body = await req.json();
    const {
      patientId,
      visitDate,
      visitType,
      notes,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      weight,
      fetalHeartRate,
      fundalHeight,
    } = body;

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

    // Verify patient assignment
    const patient = await prisma.motherProfile.findFirst({
      where: {
        userId: patientId,
        assignedMidwifeId: midwifeProfile.id,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Patient not assigned to you',
          },
          timestamp: new Date(),
        },
        { status: 403 }
      );
    }

    // Create observations object
    const observations: any = {};
    if (bloodPressureSystolic && bloodPressureDiastolic) {
      observations.bloodPressure = `${bloodPressureSystolic}/${bloodPressureDiastolic}`;
    }
    if (weight) observations.weight = parseFloat(weight);
    if (fetalHeartRate) observations.fetalHeartRate = parseInt(fetalHeartRate);
    if (fundalHeight) observations.fundalHeight = parseFloat(fundalHeight);

    // Create home visit
    const homeVisit = await prisma.homeVisit.create({
      data: {
        motherProfileId: patient.id,
        midwifeProfileId: midwifeProfile.id,
        visitDate: new Date(visitDate),
        visitType,
        status: 'SCHEDULED',
        notes,
        observations,
      },
    });

    // If visit has vital signs, also record them as health metrics
    if (bloodPressureSystolic) {
      await prisma.healthMetric.create({
        data: {
          motherId: patientId,
          type: 'BLOOD_PRESSURE_SYSTOLIC',
          value: parseFloat(bloodPressureSystolic),
          unit: 'mmHg',
          recordedAt: new Date(visitDate),
          recordedBy: userId,
        },
      });
    }

    if (bloodPressureDiastolic) {
      await prisma.healthMetric.create({
        data: {
          motherId: patientId,
          type: 'BLOOD_PRESSURE_DIASTOLIC',
          value: parseFloat(bloodPressureDiastolic),
          unit: 'mmHg',
          recordedAt: new Date(visitDate),
          recordedBy: userId,
        },
      });
    }

    if (weight) {
      await prisma.healthMetric.create({
        data: {
          motherId: patientId,
          type: 'WEIGHT',
          value: parseFloat(weight),
          unit: 'kg',
          recordedAt: new Date(visitDate),
          recordedBy: userId,
        },
      });
    }

    if (fetalHeartRate) {
      await prisma.healthMetric.create({
        data: {
          motherId: patientId,
          type: 'FETAL_HEART_RATE',
          value: parseInt(fetalHeartRate),
          unit: 'bpm',
          recordedAt: new Date(visitDate),
          recordedBy: userId,
        },
      });
    }

    if (fundalHeight) {
      await prisma.healthMetric.create({
        data: {
          motherId: patientId,
          type: 'FUNDAL_HEIGHT',
          value: parseFloat(fundalHeight),
          unit: 'cm',
          recordedAt: new Date(visitDate),
          recordedBy: userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: homeVisit,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Create home visit error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create home visit',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
