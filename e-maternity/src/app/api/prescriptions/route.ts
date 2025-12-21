import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'MOTHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        motherId: session.user.id,
      },
      include: {
        prescribedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { prescribedDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}
