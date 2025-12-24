import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

// GET /api/vitamins - Get vitamin records for a mother
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const motherProfileId = searchParams.get('motherProfileId');
    const isActive = searchParams.get('isActive');

    if (!motherProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_PARAMS', message: 'motherProfileId is required' },
        },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { motherProfileId };
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const vitamins = await prisma.vitaminRecord.findMany({
      where,
      include: {
        motherProfile: {
          include: { user: true },
        },
        prescribedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: vitamins,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vitamins:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch vitamin records' },
      },
      { status: 500 }
    );
  }
}

// POST /api/vitamins - Create a new vitamin record
export async function POST(req: NextRequest) {
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

    // Only doctors and midwives can prescribe vitamins
    if (!['DOCTOR', 'MIDWIFE', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      motherProfileId,
      vitaminName,
      vitaminType,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
    } = body;

    // Validate required fields
    if (!motherProfileId || !vitaminName || !vitaminType || !dosage || !frequency || !startDate) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Required fields are missing' },
        },
        { status: 400 }
      );
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(startDate, frequency);

    const vitamin = await prisma.vitaminRecord.create({
      data: {
        motherProfileId,
        vitaminName,
        vitaminType,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        prescribedById: session.user.id,
        nextDueDate,
        notes,
        isActive: true,
      },
      include: {
        motherProfile: {
          include: { user: true },
        },
        prescribedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: vitamin,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vitamin record:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create vitamin record' },
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(startDate: string, frequency: string): Date {
  const start = new Date(startDate);
  const freqLower = frequency.toLowerCase();

  if (freqLower.includes('daily')) {
    start.setDate(start.getDate() + 1);
  } else if (freqLower.includes('weekly')) {
    start.setDate(start.getDate() + 7);
  } else if (freqLower.includes('monthly')) {
    start.setMonth(start.getMonth() + 1);
  } else {
    // Default to daily
    start.setDate(start.getDate() + 1);
  }

  return start;
}
