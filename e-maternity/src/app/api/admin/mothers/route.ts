import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const mothers = await prisma.user.findMany({
      where: { role: 'MOTHER' },
      include: { motherProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: mothers.map(m => ({
        id: m.id,
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
        phoneNumber: m.phoneNumber,
        pregnancyWeek: m.motherProfile?.pregnancyWeek || 0,
        riskLevel: m.motherProfile?.riskLevel || 'LOW',
        district: m.motherProfile?.district || '',
        expectedDeliveryDate: m.motherProfile?.expectedDeliveryDate || new Date(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
