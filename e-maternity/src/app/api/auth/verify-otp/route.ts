import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and OTP are required',
          },
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // For now, accept any 6-digit OTP (in production, implement proper OTP verification)
    // You would typically check against a stored OTP in the database with expiration
    if (otp.length === 6) {
      // Update user verification status
      await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: 'Invalid OTP code',
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during verification',
        },
      },
      { status: 500 }
    );
  }
}
