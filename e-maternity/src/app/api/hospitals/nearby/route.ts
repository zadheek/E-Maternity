import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// GET - Find nearby hospitals with maternity wards
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '50'); // Default 50km radius

    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Latitude and longitude are required',
          },
        },
        { status: 400 }
      );
    }

    // Fetch all hospitals with maternity wards
    const hospitals = await prisma.hospital.findMany({
      where: {
        hasMaternityWard: true,
      },
    });

    // Calculate distance and filter by radius
    const hospitalsWithDistance = hospitals
      .map((hospital) => {
        const distance = calculateDistance(lat, lng, hospital.latitude, hospital.longitude);
        return {
          ...hospital,
          distance,
        };
      })
      .filter((hospital) => hospital.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Return top 10 nearest hospitals

    return NextResponse.json({
      success: true,
      data: hospitalsWithDistance,
    });
  } catch (error: any) {
    console.error('GET /api/hospitals/nearby error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch nearby hospitals',
        },
      },
      { status: 500 }
      );
  }
}
