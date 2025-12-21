import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status } = body;

    const emergency = await prisma.emergencyAlert.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
      include: {
        mother: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: emergency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update emergency error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update emergency alert',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.emergencyAlert.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Emergency alert deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Delete emergency error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete emergency alert',
      },
      { status: 500 }
    );
  }
}
