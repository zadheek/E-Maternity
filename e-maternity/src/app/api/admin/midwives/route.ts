import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized' } }, { status: 401 });
    }

    const midwives = await prisma.user.findMany({
      where: { role: 'MIDWIFE' },
      include: { midwifeProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: midwives.map((m: typeof midwives[number]) => ({
        id: m.id,
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
        phoneNumber: m.phoneNumber,
        isVerified: m.isVerified,
        profile: m.midwifeProfile ? { licenseNumber: m.midwifeProfile.licenseNumber, assignedRegion: m.midwifeProfile.assignedRegion } : null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch midwives' } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }

    const body = await req.json();
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already exists' } }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const midwife = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: 'MIDWIFE',
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        language: 'ENGLISH',
        isVerified: true,
        midwifeProfile: {
          create: {
            licenseNumber: body.licenseNumber,
            assignedRegion: body.assignedRegion,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: midwife });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
