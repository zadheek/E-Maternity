import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updateData: any = { email: body.email, firstName: body.firstName, lastName: body.lastName, phoneNumber: body.phoneNumber };
    if (body.password) updateData.password = await bcrypt.hash(body.password, 10);

    await prisma.user.update({ where: { id }, data: updateData });
    await prisma.midwifeProfile.update({ where: { userId: id }, data: { licenseNumber: body.licenseNumber, assignedRegion: body.assignedRegion } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
