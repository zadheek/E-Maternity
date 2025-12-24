import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

// GET /api/immunizations - Get immunization records for a mother
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

    if (!motherProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_PARAMS', message: 'motherProfileId is required' },
        },
        { status: 400 }
      );
    }

    const immunizations = await prisma.immunizationRecord.findMany({
      where: { motherProfileId },
      include: {
        motherProfile: {
          include: { user: true },
        },
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { administeredDate: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: immunizations,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching immunizations:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch immunization records' },
      },
      { status: 500 }
    );
  }
}

// POST /api/immunizations - Create a new immunization record
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

    // Only doctors, midwives, and admins can record immunizations
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
      vaccineName,
      immunizationType,
      doseNumber,
      administeredDate,
      batchNumber,
      site,
      sideEffects,
      notes,
    } = body;

    // Validate required fields
    if (!motherProfileId || !vaccineName || !immunizationType || !doseNumber || !administeredDate) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Required fields are missing' },
        },
        { status: 400 }
      );
    }

    // Calculate next due date based on immunization type and dose
    const nextDueDate = calculateNextImmunizationDate(immunizationType, doseNumber);

    const immunization = await prisma.immunizationRecord.create({
      data: {
        motherProfileId,
        vaccineName,
        immunizationType,
        doseNumber,
        administeredDate: new Date(administeredDate),
        administeredById: session.user.id,
        nextDueDate,
        batchNumber,
        site,
        sideEffects,
        notes,
      },
      include: {
        motherProfile: {
          include: { user: true },
        },
        administeredBy: {
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
        data: immunization,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating immunization record:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create immunization record' },
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate next immunization date
function calculateNextImmunizationDate(
  immunizationType: string,
  doseNumber: number
): Date | null {
  const now = new Date();
  
  switch (immunizationType) {
    case 'TETANUS':
      if (doseNumber === 1) {
        // Second dose after 4 weeks
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + 28);
        return nextDate;
      } else if (doseNumber === 2) {
        // Third dose after 6 months
        const nextDate = new Date(now);
        nextDate.setMonth(nextDate.getMonth() + 6);
        return nextDate;
      }
      return null;
    
    case 'HEPATITIS_B':
      if (doseNumber === 1) {
        // Second dose after 1 month
        const nextDate = new Date(now);
        nextDate.setMonth(nextDate.getMonth() + 1);
        return nextDate;
      } else if (doseNumber === 2) {
        // Third dose after 6 months from first dose
        const nextDate = new Date(now);
        nextDate.setMonth(nextDate.getMonth() + 5);
        return nextDate;
      }
      return null;
    
    case 'INFLUENZA':
      // Annual flu shot
      const nextDate = new Date(now);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      return nextDate;
    
    case 'COVID19':
      if (doseNumber < 2) {
        // Next dose after recommended interval (varies)
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + 21); // Default 3 weeks
        return nextDate;
      }
      return null;
    
    default:
      return null;
  }
}
