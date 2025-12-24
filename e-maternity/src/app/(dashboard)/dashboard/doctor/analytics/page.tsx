'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import axios from 'axios';
import { toast } from 'sonner';

interface AnalyticsData {
  totalPatients: number;
  riskDistribution: {
    LOW: number;
    MODERATE: number;
    HIGH: number;
    CRITICAL: number;
  };
  appointmentStats: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
  };
  prescriptionStats: {
    total: number;
    thisMonth: number;
    active: number;
  };
  districtDistribution: {
    district: string;
    count: number;
  }[];
  weeklyTrends: {
    week: string;
    appointments: number;
  }[];
}

export default function DoctorAnalyticsPage() {
  useAuth('DOCTOR');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/doctor/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Activity className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2196F3] to-[#0288D1] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/dashboard/doctor')}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Analytics & Reports</h1>
                <p className="text-white/90 text-sm">
                  Overview of your practice statistics
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-3xl font-bold text-[#2196F3] mt-1">
                    {analytics.totalPatients}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                  <Icons.User className="w-6 h-6 text-[#2196F3]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Appointments</p>
                  <p className="text-3xl font-bold text-[#00BCD4] mt-1">
                    {analytics.appointmentStats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                  <Icons.Calendar className="w-6 h-6 text-[#00BCD4]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Prescriptions</p>
                  <p className="text-3xl font-bold text-[#4CAF50] mt-1">
                    {analytics.prescriptionStats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                  <Icons.Activity className="w-6 h-6 text-[#4CAF50]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">High Risk</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {analytics.riskDistribution.HIGH + analytics.riskDistribution.CRITICAL}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Icons.AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <span className="text-sm">Critical</span>
                  </div>
                  <span className="font-bold text-red-600">{analytics.riskDistribution.CRITICAL}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm">High Risk</span>
                  </div>
                  <span className="font-bold text-red-500">{analytics.riskDistribution.HIGH}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span className="text-sm">Moderate</span>
                  </div>
                  <span className="font-bold text-yellow-600">{analytics.riskDistribution.MODERATE}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm">Low Risk</span>
                  </div>
                  <span className="font-bold text-green-600">{analytics.riskDistribution.LOW}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-bold text-[#4CAF50]">{analytics.appointmentStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="font-bold text-[#2196F3]">{analytics.appointmentStats.upcoming}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="font-bold text-red-600">{analytics.appointmentStats.cancelled}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="font-bold text-[#2196F3]">{analytics.appointmentStats.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* District Distribution */}
        {analytics.districtDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Patients by District</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {analytics.districtDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Icons.MapPin className="w-4 h-4 text-[#2196F3]" />
                      <span className="text-sm font-medium">{item.district}</span>
                    </div>
                    <span className="font-bold text-[#2196F3]">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
