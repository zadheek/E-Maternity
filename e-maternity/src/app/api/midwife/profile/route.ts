import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

// GET /api/midwife/profile - Get midwife profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MIDWIFE') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get midwife profile with user details
    const midwifeProfile = await prisma.midwifeProfile.findUnique({
      where: { userId },
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

    if (!midwifeProfile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Midwife profile not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: midwifeProfile,
    });
  } catch (error) {
    console.error('Error fetching midwife profile:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' } },
      { status: 500 }
    );
  }
}

// PUT /api/midwife/profile - Update midwife profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MIDWIFE') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { firstName, lastName, phoneNumber, licenseNumber, assignedRegion } = body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !licenseNumber || !assignedRegion) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'All fields are required' } },
        { status: 400 }
      );
    }

    // Update user information
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
    });

    // Update midwife profile
    const updatedProfile = await prisma.midwifeProfile.update({
      where: { userId },
      data: {
        licenseNumber,
        assignedRegion,
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

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating midwife profile:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    );
  }
}
