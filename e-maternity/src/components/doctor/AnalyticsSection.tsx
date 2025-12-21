'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
}

export default function AnalyticsSection() {
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
      <div className="flex items-center justify-center py-12">
        <Icons.Activity className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="text-gray-600">Overview of your practice statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
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
                <Icons.Pill className="w-6 h-6 text-[#4CAF50]" />
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-red-600"></div>
                  <span className="text-sm font-medium">Critical</span>
                </div>
                <span className="font-bold text-red-600 text-lg">{analytics.riskDistribution.CRITICAL}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm font-medium">High Risk</span>
                </div>
                <span className="font-bold text-red-500 text-lg">{analytics.riskDistribution.HIGH}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm font-medium">Moderate</span>
                </div>
                <span className="font-bold text-yellow-600 text-lg">{analytics.riskDistribution.MODERATE}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm font-medium">Low Risk</span>
                </div>
                <span className="font-bold text-green-600 text-lg">{analytics.riskDistribution.LOW}</span>
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
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Icons.CheckCircle className="w-5 h-5 text-[#4CAF50]" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="font-bold text-[#4CAF50] text-lg">{analytics.appointmentStats.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Icons.Clock className="w-5 h-5 text-[#2196F3]" />
                  <span className="text-sm font-medium">Upcoming</span>
                </div>
                <span className="font-bold text-[#2196F3] text-lg">{analytics.appointmentStats.upcoming}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Icons.XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Cancelled</span>
                </div>
                <span className="font-bold text-red-600 text-lg">{analytics.appointmentStats.cancelled}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between p-3 bg-[#E3F2FD] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icons.Calendar className="w-5 h-5 text-[#2196F3]" />
                    <span className="text-sm font-semibold">Total</span>
                  </div>
                  <span className="font-bold text-[#2196F3] text-xl">{analytics.appointmentStats.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#E3F2FD] to-white rounded-lg p-4 border border-[#2196F3]/20">
              <p className="text-sm text-gray-600 mb-1">Total Prescriptions</p>
              <p className="text-3xl font-bold text-[#2196F3]">{analytics.prescriptionStats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-green-600">{analytics.prescriptionStats.thisMonth}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.prescriptionStats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* District Distribution */}
      {analytics.districtDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Patients by District</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {analytics.districtDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-[#E3F2FD] to-white rounded-lg p-4 border border-[#2196F3]/20 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Icons.MapPin className="w-5 h-5 text-[#2196F3]" />
                    <span className="text-sm font-medium">{item.district}</span>
                  </div>
                  <span className="font-bold text-[#2196F3] text-xl">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
