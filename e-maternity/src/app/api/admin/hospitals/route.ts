import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const district = searchParams.get('district');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (district) {
      where.district = district;
    }

    if (type) {
      where.type = type;
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: hospitals,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to fetch hospitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hospitals' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      type,
      latitude,
      longitude,
      address,
      city,
      district,
      contactNumber,
      emergencyNumber,
      hasMaternityWard,
      availableBeds,
      facilities,
    } = body;

    const hospital = await prisma.hospital.create({
      data: {
        name,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        city,
        district,
        contactNumber,
        emergencyNumber,
        hasMaternityWard: hasMaternityWard || false,
        availableBeds: parseInt(availableBeds) || 0,
        facilities: facilities || [],
      },
    });

    return NextResponse.json({
      success: true,
      data: hospital,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create hospital:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hospital' },
      { status: 500 }
    );
  }
}
