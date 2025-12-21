'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  Calendar,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  summary: {
    totalMothers: number;
    totalDoctors: number;
    totalMidwives: number;
    totalAppointments: number;
    activeEmergencies: number;
    highRiskMothers: number;
  };
  riskDistribution: Array<{ level: string; count: number }>;
  districtStats: Array<{
    district: string;
    count: number;
    avgPregnancyWeek: number;
  }>;
  appointmentStats: Array<{ status: string; count: number }>;
  appointmentTypes: Array<{ type: string; count: number }>;
  monthlyTrends: Array<{
    month: string;
    total: number;
    completed: number;
    cancelled: number;
    missed: number;
  }>;
  emergencyTrends: Array<{ type: string; status: string; count: number }>;
  healthMetrics: Array<{ type: string; average: number; count: number }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [user, timeRange, selectedDistrict]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        ...(selectedDistrict !== 'ALL' && { district: selectedDistrict }),
      });

      const response = await axios.get(`/api/admin/analytics?${params}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-500';
      case 'MODERATE':
        return 'bg-yellow-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'CRITICAL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'SCHEDULED':
        return 'bg-blue-500';
      case 'CONFIRMED':
        return 'bg-cyan-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      case 'MISSED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const districts = data
    ? ['ALL', ...new Set(data.districtStats.map((d) => d.district))]
    : ['ALL'];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">System-wide statistics and insights</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="180">Last 6 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district === 'ALL' ? 'All Districts' : district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Mothers</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalMothers}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {data.summary.highRiskMothers} high-risk patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Healthcare Providers</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalDoctors + data.summary.totalMidwives}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {data.summary.totalDoctors} doctors, {data.summary.totalMidwives} midwives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalAppointments}</div>
                <p className="text-xs text-gray-600 mt-1">In selected time range</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data.summary.activeEmergencies}
                </div>
                <p className="text-xs text-gray-600 mt-1">Requiring immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.summary.highRiskMothers}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {((data.summary.highRiskMothers / data.summary.totalMothers) * 100).toFixed(1)}%
                  of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Districts Covered</CardTitle>
                <MapPin className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.districtStats.length}</div>
                <p className="text-xs text-gray-600 mt-1">Active service areas</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.riskDistribution.map((item) => {
                  const total = data.riskDistribution.reduce((sum, i) => sum + i.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={item.level}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.level}</span>
                        <span className="text-sm text-gray-600">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${getRiskColor(item.level)} h-2.5 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Appointment Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.appointmentStats.map((item) => {
                    const total = data.appointmentStats.reduce((sum, i) => sum + i.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <div key={item.status}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.status}</span>
                          <span className="text-sm text-gray-600">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`${getStatusColor(item.status)} h-2.5 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.appointmentTypes.map((item) => {
                    const total = data.appointmentTypes.reduce((sum, i) => sum + i.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <div key={item.type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {item.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* District Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>District-wise Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">District</th>
                      <th className="text-right py-3 px-4">Mothers</th>
                      <th className="text-right py-3 px-4">Avg Pregnancy Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.districtStats
                      .sort((a, b) => b.count - a.count)
                      .map((item) => (
                        <tr key={item.district} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{item.district}</td>
                          <td className="text-right py-3 px-4">{item.count}</td>
                          <td className="text-right py-3 px-4">
                            {item.avgPregnancyWeek} weeks
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Trends */}
          {data.emergencyTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.emergencyTrends.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.status === 'ACTIVE' ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        <span className="text-sm font-medium">
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-600">({item.status})</span>
                      </div>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Metrics Averages */}
          {data.healthMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.healthMetrics.map((item) => (
                    <div key={item.type} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {item.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">{item.average}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.count} records</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      )}
    </div>
  );
}
