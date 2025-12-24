import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { calculateRiskLevel } from '@/lib/risk-assessment/calculator';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      );
    }

    // Only doctors and midwives can update pregnancy history
    if (!['DOCTOR', 'MIDWIFE', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { hadAbnormalBabies, abnormalBabyDetails } = await req.json();

    // Validate abnormalBabyDetails structure
    if (abnormalBabyDetails && !Array.isArray(abnormalBabyDetails)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'abnormalBabyDetails must be an array',
          },
        },
        { status: 400 }
      );
    }

    // Validate each record
    if (abnormalBabyDetails) {
      for (const record of abnormalBabyDetails) {
        if (!record.id || !record.year || !record.condition || !record.description || !record.outcome) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Each abnormal baby record must have id, year, condition, description, and outcome',
              },
            },
            { status: 400 }
          );
        }

        if (!['stillbirth', 'neonatal_death', 'survived_with_condition'].includes(record.outcome)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid outcome value',
              },
            },
            { status: 400 }
          );
        }
      }
    }

    // Get mother profile
    const motherProfile = await prisma.motherProfile.findUnique({
      where: { id },
    });

    if (!motherProfile) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Mother profile not found' },
        },
        { status: 404 }
      );
    }

    // Update abnormal baby history
    const updatedProfile = await prisma.motherProfile.update({
      where: { id },
      data: {
        hadAbnormalBabies:
          hadAbnormalBabies !== undefined
            ? hadAbnormalBabies
            : (abnormalBabyDetails?.length || 0) > 0,
        abnormalBabyDetails: abnormalBabyDetails || [],
      },
    });

    // Recalculate risk assessment
    try {
      const age =
        new Date().getFullYear() - new Date(updatedProfile.dateOfBirth).getFullYear();

      // Get latest health metrics
      const [latestWeight, latestBPSystolic, latestBPDiastolic, latestHemoglobin, latestGlucose] =
        await Promise.all([
          prisma.healthMetric.findFirst({
            where: { motherId: updatedProfile.userId, type: 'WEIGHT' },
            orderBy: { recordedAt: 'desc' },
          }),
          prisma.healthMetric.findFirst({
            where: { motherId: updatedProfile.userId, type: 'BLOOD_PRESSURE_SYSTOLIC' },
            orderBy: { recordedAt: 'desc' },
          }),
          prisma.healthMetric.findFirst({
            where: { motherId: updatedProfile.userId, type: 'BLOOD_PRESSURE_DIASTOLIC' },
            orderBy: { recordedAt: 'desc' },
          }),
          prisma.healthMetric.findFirst({
            where: { motherId: updatedProfile.userId, type: 'HEMOGLOBIN' },
            orderBy: { recordedAt: 'desc' },
          }),
          prisma.healthMetric.findFirst({
            where: { motherId: updatedProfile.userId, type: 'BLOOD_GLUCOSE' },
            orderBy: { recordedAt: 'desc' },
          }),
        ]);

      const riskFactors = {
        isUnderweight: latestWeight ? latestWeight.value < 45 : false,
        hasChronicConditions: updatedProfile.chronicConditions.length > 0,
        hadAbnormalBabies: updatedProfile.hadAbnormalBabies,
        age,
        previousCesareans: updatedProfile.previousCesareans,
        previousMiscarriages: updatedProfile.previousMiscarriages,
        bloodPressure:
          latestBPSystolic && latestBPDiastolic
            ? {
                systolic: latestBPSystolic.value,
                diastolic: latestBPDiastolic.value,
              }
            : undefined,
        hemoglobin: latestHemoglobin?.value,
        bloodGlucose: latestGlucose?.value,
      };

      const newRiskLevel = calculateRiskLevel(riskFactors);

      await prisma.motherProfile.update({
        where: { id },
        data: { riskLevel: newRiskLevel },
      });

      updatedProfile.riskLevel = newRiskLevel;
    } catch (riskError) {
      console.error('Risk assessment error:', riskError);
      // Continue even if risk assessment fails
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedProfile,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update abnormal history error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update abnormal pregnancy history',
        },
      },
      { status: 500 }
    );
  }
}
