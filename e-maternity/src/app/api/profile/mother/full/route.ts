import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        motherProfile: {
          include: {
            emergencyContacts: true,
          },
        },
      },
    });

    if (!user?.motherProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Mother profile not found',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        // User details
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        
        // Personal info
        dateOfBirth: user.motherProfile.dateOfBirth,
        nic: user.motherProfile.nic,
        
        // Address
        street: user.motherProfile.street,
        city: user.motherProfile.city,
        district: user.motherProfile.district,
        postalCode: user.motherProfile.postalCode,
        
        // Pregnancy info
        pregnancyStartDate: user.motherProfile.pregnancyStartDate,
        expectedDeliveryDate: user.motherProfile.expectedDeliveryDate,
        pregnancyWeek: user.motherProfile.pregnancyWeek,
        bloodType: user.motherProfile.bloodType,
        riskLevel: user.motherProfile.riskLevel,
        
        // Medical history
        previousPregnancies: user.motherProfile.previousPregnancies,
        previousCesareans: user.motherProfile.previousCesareans,
        previousMiscarriages: user.motherProfile.previousMiscarriages,
        previousSurgeries: user.motherProfile.previousSurgeries,
        chronicConditions: user.motherProfile.chronicConditions,
        allergies: user.motherProfile.allergies,
        currentMedications: user.motherProfile.currentMedications,
        familyHistory: user.motherProfile.familyHistory,
        
        // Emergency contacts
        emergencyContacts: user.motherProfile.emergencyContacts,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch full profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch profile',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
