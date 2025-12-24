// app/api/health/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { healthMetricSchema } from '@/lib/validation/health.schema';
import type { ApiResponse, PaginationInfo } from '@/types';
import { calculateRiskLevel, isUnderweight } from '@/lib/risk-assessment/calculator';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const motherId = searchParams.get('motherId') || session.user.id;
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { motherId };
    if (type) where.type = type;

    const [metrics, total] = await Promise.all([
      prisma.healthMetric.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.healthMetric.count({ where }),
    ]);

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };

    return NextResponse.json<ApiResponse<typeof metrics>>({
      success: true,
      data: metrics,
      pagination,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch health metrics' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = healthMetricSchema.parse(body);

    const metric = await prisma.healthMetric.create({
      data: {
        motherId: session.user.id,
        type: validatedData.type,
        value: validatedData.value,
        unit: validatedData.unit,
        notes: validatedData.notes,
        recordedAt: validatedData.recordedAt
          ? new Date(validatedData.recordedAt)
          : new Date(),
        recordedBy: session.user.id,
      },
    });

    // Auto-trigger risk assessment if weight metric is recorded
    if (validatedData.type === 'WEIGHT') {
      try {
        // Get mother profile
        const motherProfile = await prisma.motherProfile.findFirst({
          where: { userId: session.user.id },
        });

        if (motherProfile) {
          // Update current weight
          const updateData: any = {
            currentWeight: validatedData.value,
          };

          // Check if weight is low (< 45kg = underweight concern)
          if (validatedData.value < 45) {
            updateData.isUnderweight = true;
          } else {
            updateData.isUnderweight = false;
          }

          // Calculate BMI if height is available
          if (motherProfile.height) {
            const heightInMeters = motherProfile.height / 100;
            const bmi = validatedData.value / (heightInMeters * heightInMeters);
            updateData.bmi = bmi;
            updateData.isUnderweight = bmi < 18.5;
          }

          await prisma.motherProfile.update({
            where: { id: motherProfile.id },
            data: updateData,
          });

          // Recalculate full risk assessment
          const age = new Date().getFullYear() - new Date(motherProfile.dateOfBirth).getFullYear();

          // Get latest health metrics for comprehensive risk assessment
          const [latestBPSystolic, latestBPDiastolic, latestHemoglobin, latestGlucose] = await Promise.all([
            prisma.healthMetric.findFirst({
              where: { motherId: session.user.id, type: 'BLOOD_PRESSURE_SYSTOLIC' },
              orderBy: { recordedAt: 'desc' },
            }),
            prisma.healthMetric.findFirst({
              where: { motherId: session.user.id, type: 'BLOOD_PRESSURE_DIASTOLIC' },
              orderBy: { recordedAt: 'desc' },
            }),
            prisma.healthMetric.findFirst({
              where: { motherId: session.user.id, type: 'HEMOGLOBIN' },
              orderBy: { recordedAt: 'desc' },
            }),
            prisma.healthMetric.findFirst({
              where: { motherId: session.user.id, type: 'BLOOD_GLUCOSE' },
              orderBy: { recordedAt: 'desc' },
            }),
          ]);

          const riskFactors = {
            isUnderweight: updateData.isUnderweight,
            hasChronicConditions: motherProfile.chronicConditions.length > 0,
            hadAbnormalBabies: motherProfile.hadAbnormalBabies,
            age,
            previousCesareans: motherProfile.previousCesareans,
            previousMiscarriages: motherProfile.previousMiscarriages,
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
            where: { id: motherProfile.id },
            data: { riskLevel: newRiskLevel },
          });
        }
      } catch (riskError) {
        console.error('Risk assessment error:', riskError);
        // Don't fail the request if risk assessment fails
      }
    }

    return NextResponse.json<ApiResponse<typeof metric>>(
      {
        success: true,
        data: metric,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create metric error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create health metric' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
