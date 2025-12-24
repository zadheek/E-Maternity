import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

// GET /api/doctor/search - Search for mothers
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      );
    }

    // Only doctors, midwives, and admins can search
    if (!['DOCTOR', 'MIDWIFE', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const searchType = searchParams.get('type') || 'all'; // 'nic', 'name', 'phone', or 'all'

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_PARAMS', message: 'Search query is required' },
        },
        { status: 400 }
      );
    }

    // Build search conditions based on search type
    const searchConditions: any[] = [];

    if (searchType === 'nic' || searchType === 'all') {
      searchConditions.push({
        nic: {
          contains: query,
          mode: 'insensitive',
        },
      });
    }

    if (searchType === 'phone' || searchType === 'all') {
      searchConditions.push({
        user: {
          phoneNumber: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
    }

    if (searchType === 'name' || searchType === 'all') {
      searchConditions.push(
        {
          user: {
            firstName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            lastName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        }
      );
    }

    const mothers = await prisma.motherProfile.findMany({
      where: {
        OR: searchConditions,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        assignedMidwife: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignedDoctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 20, // Limit results
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response with key health indicators
    const formattedResults = mothers.map((mother) => ({
      id: mother.id,
      userId: mother.userId,
      nic: mother.nic,
      firstName: mother.user.firstName,
      lastName: mother.user.lastName,
      phoneNumber: mother.user.phoneNumber,
      email: mother.user.email,
      profileImage: mother.user.profileImage,
      expectedDeliveryDate: mother.expectedDeliveryDate,
      pregnancyWeek: mother.pregnancyWeek,
      riskLevel: mother.riskLevel,
      bloodType: mother.bloodType,
      assignedMidwife: mother.assignedMidwife
        ? {
            id: mother.assignedMidwife.id,
            name: `${mother.assignedMidwife.user.firstName} ${mother.assignedMidwife.user.lastName}`,
          }
        : null,
      assignedDoctor: mother.assignedDoctor
        ? {
            id: mother.assignedDoctor.id,
            name: `${mother.assignedDoctor.user.firstName} ${mother.assignedDoctor.user.lastName}`,
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedResults,
        count: formattedResults.length,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching mothers:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to search mothers' },
      },
      { status: 500 }
    );
  }
}
