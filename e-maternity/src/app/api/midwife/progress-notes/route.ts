import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MIDWIFE') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    // Get midwife profile
    const midwifeProfile = await prisma.midwifeProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!midwifeProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Midwife profile not found',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    // Verify patient assignment if patientId provided
    if (patientId) {
      const patient = await prisma.motherProfile.findFirst({
        where: {
          userId: patientId,
          assignedMidwifeId: midwifeProfile.id,
        },
      });

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Patient not assigned to you',
            },
            timestamp: new Date(),
          },
          { status: 403 }
        );
      }
    }

    const notes = await prisma.progressNote.findMany({
      where: patientId ? {
        motherProfileId: patientId,
        midwifeProfileId: midwifeProfile.id,
      } : {
        midwifeProfileId: midwifeProfile.id,
      },
      include: {
        midwife: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the response to flatten the midwife user data
    const transformedNotes = notes.map(note => ({
      ...note,
      midwife: {
        firstName: note.midwife.user.firstName,
        lastName: note.midwife.user.lastName,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedNotes,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get progress notes error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch progress notes',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MIDWIFE') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { patientId, note, category } = body;

    // Get midwife profile
    const midwifeProfile = await prisma.midwifeProfile.findUnique({
      where: { userId },
    });

    if (!midwifeProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Midwife profile not found',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    // Verify patient assignment
    const patient = await prisma.motherProfile.findFirst({
      where: {
        userId: patientId,
        assignedMidwifeId: midwifeProfile.id,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Patient not assigned to you',
          },
          timestamp: new Date(),
        },
        { status: 403 }
      );
    }

    // Create progress note
    const progressNote = await prisma.progressNote.create({
      data: {
        motherProfileId: patient.id,
        midwifeProfileId: midwifeProfile.id,
        note,
        category,
      },
      include: {
        midwife: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...progressNote,
        midwife: {
          firstName: progressNote.midwife.user.firstName,
          lastName: progressNote.midwife.user.lastName,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Create progress note error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create progress note',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
