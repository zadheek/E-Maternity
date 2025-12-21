import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
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

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'Email is already verified',
          },
        },
        { status: 400 }
      );
    }

    // Generate new OTP (6-digit random number)
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Store OTP in database with expiration time
    // TODO: Send OTP via email using your email service (Resend, EmailJS, etc.)
    
    // For now, just log it (in production, send via email)
    console.log(`New OTP for ${email}: ${newOtp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP has been resent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while resending OTP',
        },
      },
      { status: 500 }
    );
  }
}
