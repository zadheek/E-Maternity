// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { appointmentSchema } from '@/lib/validation/health.schema';
import type { ApiResponse, PaginationInfo } from '@/types';

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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { motherId };
    if (status) where.status = status;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          provider: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
              doctorProfile: true,
              midwifeProfile: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };

    return NextResponse.json<ApiResponse<typeof appointments>>({
      success: true,
      data: appointments,
      pagination,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch appointments' },
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
    const validatedData = appointmentSchema.parse(body);

    const appointment = await prisma.appointment.create({
      data: {
        motherId: session.user.id,
        providerId: validatedData.providerId,
        providerType: validatedData.providerType,
        type: validatedData.type,
        scheduledDate: new Date(validatedData.scheduledDate),
        duration: validatedData.duration,
        hospitalId: validatedData.hospitalId,
        address: validatedData.address,
        notes: validatedData.notes,
        status: 'SCHEDULED',
      },
      include: {
        provider: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<typeof appointment>>(
      {
        success: true,
        data: appointment,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create appointment error:', error);

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
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create appointment' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
