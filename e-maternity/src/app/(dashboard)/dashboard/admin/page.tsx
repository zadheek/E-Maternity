'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface DashboardStats {
  totalMothers: number;
  totalDoctors: number;
  totalMidwives: number;
  highRiskMothers: number;
  activeEmergencies: number;
}

export default function AdminDashboardPage() {
  const { user: _user } = useAuth('ADMIN');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMothers: 0,
    totalDoctors: 0,
    totalMidwives: 0,
    highRiskMothers: 0,
    activeEmergencies: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard data');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2196F3] to-[#0288D1] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-white/90 text-sm">
                System Administration & Management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/dashboard/admin/profile')}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                <Icons.User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Button>
              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                <Icons.LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center mb-3">
                  <Icons.User className="w-6 h-6 text-[#2196F3]" />
                </div>
                <p className="text-2xl font-bold text-[#212121]">{stats.totalMothers}</p>
                <p className="text-sm text-[#757575]">Mothers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center mb-3">
                  <Icons.Activity className="w-6 h-6 text-[#00BCD4]" />
                </div>
                <p className="text-2xl font-bold text-[#212121]">{stats.totalDoctors}</p>
                <p className="text-sm text-[#757575]">Doctors</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mb-3">
                  <Icons.Heart className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <p className="text-2xl font-bold text-[#212121]">{stats.totalMidwives}</p>
                <p className="text-sm text-[#757575]">Midwives</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <Icons.AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskMothers}</p>
                <p className="text-sm text-[#757575]">High Risk</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <Icons.Ambulance className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.activeEmergencies}</p>
                <p className="text-sm text-[#757575]">Emergencies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#212121] mb-6">User Management</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/admin/doctors')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Activity className="w-5 h-5 text-[#00BCD4]" />
                  Doctors
                </CardTitle>
                <CardDescription>Manage doctor accounts and profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[#212121]">{stats.totalDoctors}</p>
                    <p className="text-sm text-[#757575]">Active doctors</p>
                  </div>
                  <Button className="bg-[#00BCD4] hover:bg-[#0097A7]">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/admin/midwives')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Heart className="w-5 h-5 text-[#4CAF50]" />
                  Midwives
                </CardTitle>
                <CardDescription>Manage midwife accounts and regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[#212121]">{stats.totalMidwives}</p>
                    <p className="text-sm text-[#757575]">Active midwives</p>
                  </div>
                  <Button className="bg-[#4CAF50] hover:bg-[#388E3C]">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/admin/mothers')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.User className="w-5 h-5 text-[#2196F3]" />
                  Mothers
                </CardTitle>
                <CardDescription>View and manage mother profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-[#212121]">{stats.totalMothers}</p>
                    <p className="text-sm text-[#757575]">Registered mothers</p>
                  </div>
                  <Button className="bg-[#2196F3] hover:bg-[#1976D2]">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Management */}
        <div>
          <h2 className="text-2xl font-bold text-[#212121] mb-6">System Management</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dashboard/admin/hospitals')}
              className="h-auto py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Icons.Hospital className="w-8 h-8 text-[#00BCD4]" />
                <span className="font-semibold">Hospitals</span>
                <span className="text-xs text-[#757575]">Manage facilities</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admin/analytics')}
              className="h-auto py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Icons.TrendingUp className="w-8 h-8 text-[#0288D1]" />
                <span className="font-semibold">Analytics</span>
                <span className="text-xs text-[#757575]">System reports</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admin/emergencies')}
              className="h-auto py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Icons.Ambulance className="w-8 h-8 text-red-600" />
                <span className="font-semibold">Emergencies</span>
                <span className="text-xs text-[#757575]">Active alerts</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admin/settings')}
              className="h-auto py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Icons.Activity className="w-8 h-8 text-[#757575]" />
                <span className="font-semibold">Settings</span>
                <span className="text-xs text-[#757575]">System config</span>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

