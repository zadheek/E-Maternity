// app/api/health/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { healthMetricSchema } from '@/lib/validation/health.schema';
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
    const motherId = searchParams.get('motherId') || (session.user as any).id;
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
        motherId: (session.user as any).id,
        type: validatedData.type,
        value: validatedData.value,
        unit: validatedData.unit,
        notes: validatedData.notes,
        recordedAt: validatedData.recordedAt
          ? new Date(validatedData.recordedAt)
          : new Date(),
        recordedBy: (session.user as any).id,
      },
    });

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
