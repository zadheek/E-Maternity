// app/api/emergency/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { emergencyAlertSchema } from '@/lib/validation/health.schema';
import type { ApiResponse } from '@/types';

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
    const validatedData = emergencyAlertSchema.parse(body);

    // Get mother's profile with assigned providers
    const motherProfile = await prisma.motherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        assignedDoctor: { include: { user: true } },
        assignedMidwife: { include: { user: true } },
        emergencyContacts: true,
      },
    });

    if (!motherProfile) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Mother profile not found' },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    // Create emergency alert
    const responders: string[] = [];
    if (motherProfile.assignedDoctor) {
      responders.push(motherProfile.assignedDoctor.userId);
    }
    if (motherProfile.assignedMidwife) {
      responders.push(motherProfile.assignedMidwife.userId);
    }

    const alert = await prisma.emergencyAlert.create({
      data: {
        motherId: session.user.id,
        type: validatedData.type,
        description: validatedData.description,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        address: validatedData.address,
        responders,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json<ApiResponse<typeof alert>>(
      {
        success: true,
        data: alert,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create emergency alert error:', error);

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
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create emergency alert' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

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

    const alerts = await prisma.emergencyAlert.findMany({
      where: {
        motherId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json<ApiResponse<typeof alerts>>({
      success: true,
      data: alerts,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get emergency alerts error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emergency alerts' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
