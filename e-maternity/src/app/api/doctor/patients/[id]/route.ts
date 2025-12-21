import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get doctor's profile
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    // Get patient data
    const patient = await prisma.user.findUnique({
      where: { 
        id,
        role: 'MOTHER',
      },
      include: {
        motherProfile: {
          include: {
            emergencyContacts: true,
          },
        },
        healthMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 100,
        },
        appointments: {
          where: {
            providerId: session.user.id,
          },
          orderBy: { scheduledDate: 'desc' },
        },
        patientPrescriptions: {
          where: {
            prescribedById: session.user.id,
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
        },
      },
    });

    if (!patient || !patient.motherProfile) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if patient is assigned to this doctor
    if (patient.motherProfile.assignedDoctorId !== doctorProfile.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Patient not assigned to you' },
        { status: 403 }
      );
    }

    // Calculate age
    const age = Math.floor(
      (Date.now() - new Date(patient.motherProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const patientData = {
      id: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phoneNumber: patient.phoneNumber,
      motherProfile: {
        ...patient.motherProfile,
        age,
      },
      healthMetrics: patient.healthMetrics,
      appointments: patient.appointments,
      prescriptions: patient.patientPrescriptions,
      emergencyContacts: patient.motherProfile.emergencyContacts,
    };

    return NextResponse.json({
      success: true,
      data: patientData,
    });
  } catch (error) {
    console.error('Failed to fetch patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}
