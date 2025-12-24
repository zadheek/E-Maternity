// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { registerMotherSchema } from '@/lib/validation/auth.schema';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = registerMotherSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists',
          },
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }
    
    // Check if NIC already exists
    const existingNIC = await prisma.motherProfile.findUnique({
      where: { nic: validatedData.nic },
    });
    
    if (existingNIC) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'NIC_EXISTS',
            message: 'A user with this NIC already exists',
          },
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Calculate pregnancy week
    const today = new Date();
    const edd = new Date(validatedData.expectedDeliveryDate);
    const weeksUntilDelivery = Math.ceil(
      (edd.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const pregnancyWeek = Math.max(1, Math.min(42, 40 - weeksUntilDelivery));
    
    // Create user and mother profile
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        role: 'MOTHER',
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        language: validatedData.language,
        isVerified: true, // Auto-verify for now (OTP feature disabled)
        motherProfile: {
          create: {
            dateOfBirth: new Date(validatedData.dateOfBirth),
            nic: validatedData.nic,
            street: validatedData.street,
            city: validatedData.city,
            district: validatedData.district,
            postalCode: validatedData.postalCode,
            expectedDeliveryDate: new Date(validatedData.expectedDeliveryDate),
            pregnancyWeek,
            bloodType: validatedData.bloodType,
            previousPregnancies: validatedData.previousPregnancies,
            previousCesareans: validatedData.previousCesareans,
            previousMiscarriages: validatedData.previousMiscarriages,
            chronicConditions: validatedData.chronicConditions || [],
            allergies: validatedData.allergies || [],
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    return NextResponse.json<ApiResponse<typeof user>>(
      {
        success: true,
        data: user,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
