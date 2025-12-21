import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
      },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Doctor profile not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doctorProfile,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('GET /api/doctor/profile error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      phoneNumber,
      licenseNumber,
      specialization,
      hospital,
      experienceYears,
      consultationFee,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !licenseNumber || !specialization || !hospital) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'All fields are required' } },
        { status: 400 }
      );
    }

    // Update user and doctor profile in a transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update user details
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          firstName,
          lastName,
          phoneNumber,
        },
      });

      // Update doctor profile
      const profile = await tx.doctorProfile.update({
        where: { userId: session.user.id },
        data: {
          licenseNumber,
          specialization,
          hospital,
          experienceYears: parseInt(experienceYears),
          consultationFee: parseFloat(consultationFee),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      });

      return profile;
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('PUT /api/doctor/profile error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    );
  }
}
