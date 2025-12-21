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
        motherProfile: true,
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
        pregnancyWeek: user.motherProfile.pregnancyWeek,
        expectedDeliveryDate: user.motherProfile.expectedDeliveryDate,
        riskLevel: user.motherProfile.riskLevel,
        district: user.motherProfile.district,
        bloodType: user.motherProfile.bloodType,
        dateOfBirth: user.motherProfile.dateOfBirth,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
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

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const userId = session.user.id;

    // Update user basic info
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
      },
    });

    // Update mother profile
    const motherProfile = await prisma.motherProfile.findUnique({
      where: { userId },
    });

    if (!motherProfile) {
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

    await prisma.motherProfile.update({
      where: { userId },
      data: {
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        pregnancyStartDate: body.pregnancyStartDate ? new Date(body.pregnancyStartDate) : undefined,
        expectedDeliveryDate: body.expectedDeliveryDate ? new Date(body.expectedDeliveryDate) : undefined,
        pregnancyWeek: body.pregnancyWeek,
        bloodType: body.bloodType,
        street: body.street,
        city: body.city,
        district: body.district,
        postalCode: body.postalCode,
        previousPregnancies: body.previousPregnancies,
        previousCesareans: body.previousCesareans,
        previousMiscarriages: body.previousMiscarriages,
        previousSurgeries: body.previousSurgeries,
        chronicConditions: body.chronicConditions,
        allergies: body.allergies,
        currentMedications: body.currentMedications,
        familyHistory: body.familyHistory,
      },
    });

    // Update emergency contacts
    if (body.emergencyContacts) {
      // Delete existing contacts
      await prisma.emergencyContact.deleteMany({
        where: { motherProfileId: motherProfile.id },
      });

      // Create new contacts
      const contactsToCreate = body.emergencyContacts
        .filter((c: any) => c.name && c.phoneNumber)
        .map((contact: any) => ({
          motherProfileId: motherProfile.id,
          name: contact.name,
          relationship: contact.relationship,
          phoneNumber: contact.phoneNumber,
          isPrimary: contact.isPrimary,
        }));

      if (contactsToCreate.length > 0) {
        await prisma.emergencyContact.createMany({
          data: contactsToCreate,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update profile',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
