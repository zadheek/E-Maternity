import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'doctor';

    let providers: any[] = [];

    if (type === 'doctor') {
      const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR' },
        include: { doctorProfile: true },
        take: 50,
      });

      providers = doctors.map(doc => ({
        id: doc.id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        role: doc.role,
        specialization: doc.doctorProfile?.specialization,
        hospital: doc.doctorProfile?.hospital,
      }));
    } else if (type === 'midwife') {
      const midwives = await prisma.user.findMany({
        where: { role: 'MIDWIFE' },
        include: { midwifeProfile: true },
        take: 50,
      });

      providers = midwives.map(mid => ({
        id: mid.id,
        firstName: mid.firstName,
        lastName: mid.lastName,
        role: mid.role,
        assignedRegion: mid.midwifeProfile?.assignedRegion,
      }));
    }

    return NextResponse.json({
      success: true,
      data: providers,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch providers error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch providers' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
