import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
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

    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, string> = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
    };

    // Only update password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update doctor profile
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: id },
    });

    if (doctorProfile) {
      await prisma.doctorProfile.update({
        where: { userId: id },
        data: {
          licenseNumber: body.licenseNumber,
          specialization: body.specialization,
          hospital: body.hospital,
          experienceYears: body.experienceYears,
          consultationFee: body.consultationFee,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor updated successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update doctor',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
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

    const { id } = await params;

    // Delete user (cascade will delete profile)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete doctor',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
