import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const emergencies = await prisma.emergencyAlert.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
      },
      include: {
        mother: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            motherProfile: {
              select: {
                district: true,
                pregnancyWeek: true,
                riskLevel: true,
                emergencyContacts: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: emergencies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Emergency alerts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch emergency alerts',
      },
      { status: 500 }
    );
  }
}
