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

    const referrals = await prisma.referral.findMany({
      where: patientId ? {
        motherProfileId: patientId,
        midwifeProfileId: midwifeProfile.id,
      } : {
        midwifeProfileId: midwifeProfile.id,
      },
      include: {
        doctor: {
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

    // Transform the response
    const transformedReferrals = referrals.map(referral => ({
      ...referral,
      doctor: referral.doctor ? {
        firstName: referral.doctor.user.firstName,
        lastName: referral.doctor.user.lastName,
        specialization: referral.doctor.specialization,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: transformedReferrals,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch referrals',
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
    const { patientId, doctorId, reason, priority, notes } = body;

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

    // Get doctor profile
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Doctor not found',
          },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        motherProfileId: patient.id,
        midwifeProfileId: midwifeProfile.id,
        doctorProfileId: doctorProfile.id,
        reason,
        priority,
        notes,
        status: 'PENDING',
      },
      include: {
        doctor: {
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

    // TODO: Send notification to doctor

    return NextResponse.json({
      success: true,
      data: {
        ...referral,
        doctor: {
          firstName: referral.doctor.user.firstName,
          lastName: referral.doctor.user.lastName,
          specialization: referral.doctor.specialization,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Create referral error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create referral',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
