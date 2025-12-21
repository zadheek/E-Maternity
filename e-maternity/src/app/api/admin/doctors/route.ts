import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: {
        doctorProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const doctorsData = doctors.map((doctor: typeof doctors[number]) => ({
      id: doctor.id,
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      phoneNumber: doctor.phoneNumber,
      isVerified: doctor.isVerified,
      profile: doctor.doctorProfile
        ? {
            licenseNumber: doctor.doctorProfile.licenseNumber,
            specialization: doctor.doctorProfile.specialization,
            hospital: doctor.doctorProfile.hospital,
            experienceYears: doctor.doctorProfile.experienceYears,
            consultationFee: doctor.doctorProfile.consultationFee,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: doctorsData,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch doctors',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized',
          },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already exists',
          },
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user and profile
    const doctor = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: 'DOCTOR',
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        language: 'ENGLISH',
        isVerified: true,
        doctorProfile: {
          create: {
            licenseNumber: body.licenseNumber,
            specialization: body.specialization,
            hospital: body.hospital,
            experienceYears: body.experienceYears,
            consultationFee: body.consultationFee,
          },
        },
      },
      include: {
        doctorProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: doctor,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create doctor',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
