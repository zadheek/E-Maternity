import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'MOTHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, description, latitude, longitude, address } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, description' },
        { status: 400 }
      );
    }

    // Get mother's profile with emergency contacts and assigned providers
    const motherProfile = await prisma.motherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        emergencyContacts: true,
        assignedDoctor: {
          include: {
            user: true,
          },
        },
        assignedMidwife: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!motherProfile) {
      return NextResponse.json(
        { error: 'Mother profile not found' },
        { status: 404 }
      );
    }

    // Create emergency alert
    const alert = await prisma.emergencyAlert.create({
      data: {
        motherId: session.user.id,
        type,
        description,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        address: address || 'Location not available',
        responders: [],
        status: 'ACTIVE',
      },
    });

    // TODO: Send notifications to:
    // - Emergency contacts (SMS/Call)
    // - Assigned doctor (push notification + SMS)
    // - Assigned midwife (push notification + SMS)
    // - Nearby hospitals

    const responderIds: string[] = [];
    
    if (motherProfile.assignedDoctorId) {
      responderIds.push(motherProfile.assignedDoctor?.user.id || '');
    }
    
    if (motherProfile.assignedMidwifeId) {
      responderIds.push(motherProfile.assignedMidwife?.user.id || '');
    }

    // Update alert with responders
    await prisma.emergencyAlert.update({
      where: { id: alert.id },
      data: {
        responders: responderIds.filter(Boolean),
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Emergency alert sent successfully',
    });
  } catch (error) {
    console.error('Failed to create emergency alert:', error);
    return NextResponse.json(
      { error: 'Failed to create emergency alert' },
      { status: 500 }
    );
  }
}

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let alerts;

    if (session.user.role === 'MOTHER') {
      // Get mother's own alerts
      alerts = await prisma.emergencyAlert.findMany({
        where: {
          motherId: session.user.id,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (session.user.role === 'DOCTOR' || session.user.role === 'MIDWIFE') {
      // Get alerts where they are responders
      alerts = await prisma.emergencyAlert.findMany({
        where: {
          responders: {
            has: session.user.id,
          },
          status: 'ACTIVE',
        },
        include: {
          mother: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admin/PHI can see all alerts
      alerts = await prisma.emergencyAlert.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          mother: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Failed to fetch emergency alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency alerts' },
      { status: 500 }
    );
  }
}
