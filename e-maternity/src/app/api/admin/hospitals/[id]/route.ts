import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: params.id },
    });

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hospital,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to fetch hospital:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hospital' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const hospital = await prisma.hospital.update({
      where: { id: params.id },
      data: {
        ...body,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        availableBeds: body.availableBeds ? parseInt(body.availableBeds) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: hospital,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to update hospital:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hospital' },
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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.hospital.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to delete hospital:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hospital' },
      { status: 500 }
    );
  }
}
