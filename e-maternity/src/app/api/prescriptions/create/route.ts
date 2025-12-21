import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized - Only doctors can create prescriptions' }, { status: 401 });
    }

    const body = await req.json();
    const { motherId, medications, instructions, validUntil } = body;

    if (!motherId || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: motherId, medications' },
        { status: 400 }
      );
    }

    // Verify mother exists
    const mother = await prisma.user.findUnique({
      where: { id: motherId, role: 'MOTHER' },
    });

    if (!mother) {
      return NextResponse.json(
        { error: 'Mother not found' },
        { status: 404 }
      );
    }

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        motherId,
        prescribedById: session.user.id,
        medications: medications,
        instructions: instructions || '',
        validUntil: validUntil ? new Date(validUntil) : null,
      },
      include: {
        mother: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        prescribedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Send notification to mother (email/SMS/push)

    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription created successfully',
    });
  } catch (error) {
    console.error('Failed to create prescription:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
