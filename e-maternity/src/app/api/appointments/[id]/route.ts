// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const { id: appointmentId } = await params;
    const body = await req.json();

    // Verify the appointment belongs to the user
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existingAppointment) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found' },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    if (existingAppointment.motherId !== (session.user as any).id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to update this appointment' },
          timestamp: new Date(),
        },
        { status: 403 }
      );
    }

    // Update appointment
    const updateData: any = {};
    if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate);
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.duration) updateData.duration = body.duration;

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        provider: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse<typeof appointment>>({
      success: true,
      data: appointment,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update appointment' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const { id: appointmentId } = await params;

    // Verify the appointment belongs to the user
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existingAppointment) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found' },
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    if (existingAppointment.motherId !== (session.user as any).id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to delete this appointment' },
          timestamp: new Date(),
        },
        { status: 403 }
      );
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete appointment' },
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
