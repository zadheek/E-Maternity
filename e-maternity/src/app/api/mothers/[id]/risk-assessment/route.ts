import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { calculateRiskLevel, calculateBMI, isUnderweight } from '@/lib/risk-assessment/calculator';
import type { RiskAssessmentFactors } from '@/types';

// PUT /api/mothers/[id]/risk-assessment - Update and recalculate risk level
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      );
    }

    // Get current mother profile
    const motherProfile = await prisma.motherProfile.findUnique({
      where: { id },
      include: { user: true },
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

    // Get latest health metrics
    const latestMetrics = await prisma.healthMetric.findMany({
      where: { motherId: motherProfile.userId },
      orderBy: { recordedAt: 'desc' },
      take: 10,
    });

    // Extract latest values
    const latestWeight = latestMetrics.find((m) => m.type === 'WEIGHT')?.value;
    const latestBPSystolic = latestMetrics.find(
      (m) => m.type === 'BLOOD_PRESSURE_SYSTOLIC'
    )?.value;
    const latestBPDiastolic = latestMetrics.find(
      (m) => m.type === 'BLOOD_PRESSURE_DIASTOLIC'
    )?.value;
    const latestHemoglobin = latestMetrics.find((m) => m.type === 'HEMOGLOBIN')?.value;
    const latestGlucose = latestMetrics.find((m) => m.type === 'BLOOD_GLUCOSE')?.value;

    // Calculate age
    const age = new Date().getFullYear() - motherProfile.dateOfBirth.getFullYear();

    // Calculate BMI if weight and height are available
    let bmi = motherProfile.bmi;
    let currentWeight = motherProfile.currentWeight;
    
    if (latestWeight && motherProfile.height) {
      currentWeight = latestWeight;
      bmi = calculateBMI(latestWeight, motherProfile.height);
    }

    // Build risk assessment factors
    const riskFactors: RiskAssessmentFactors = {
      isUnderweight: bmi ? isUnderweight(bmi) : false,
      hasChronicConditions: motherProfile.chronicConditions.length > 0,
      hadAbnormalBabies: motherProfile.hadAbnormalBabies,
      age,
      previousCesareans: motherProfile.previousCesareans,
      previousMiscarriages: motherProfile.previousMiscarriages,
      bloodPressure:
        latestBPSystolic && latestBPDiastolic
          ? { systolic: latestBPSystolic, diastolic: latestBPDiastolic }
          : undefined,
      hemoglobin: latestHemoglobin,
      bloodGlucose: latestGlucose,
    };

    // Calculate new risk level
    const newRiskLevel = calculateRiskLevel(riskFactors);

    // Update mother profile
    const updatedProfile = await prisma.motherProfile.update({
      where: { id },
      data: {
        riskLevel: newRiskLevel,
        currentWeight,
        bmi,
      },
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
        assignedMidwife: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignedDoctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          profile: updatedProfile,
          riskFactors,
          previousRiskLevel: motherProfile.riskLevel,
          newRiskLevel,
        },
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating risk assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk assessment' },
      },
      { status: 500 }
    );
  }
}
