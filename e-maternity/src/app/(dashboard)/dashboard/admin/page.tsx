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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface DashboardStats {
  totalMothers: number;
  totalDoctors: number;
  totalMidwives: number;
  highRiskMothers: number;
  activeEmergencies: number;
}

export default function AdminDashboardPage() {
  useAuth('ADMIN');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <header className="bg-gradient-to-r from-[#2196F3] to-[#0288D1] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-white/90 text-xs sm:text-sm hidden sm:block">
                System Administration & Management
              </p>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                <Icons.LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10"
                >
                  <Icons.Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {/* Quick Stats */}
                  <div className="space-y-2 pb-4 border-b">
                    <h3 className="text-sm font-semibold text-[#757575]">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icons.User className="w-4 h-4 text-[#2196F3]" />
                        <span>{stats.totalMothers} Mothers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.Activity className="w-4 h-4 text-[#00BCD4]" />
                        <span>{stats.totalDoctors} Doctors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.Heart className="w-4 h-4 text-[#4CAF50]" />
                        <span>{stats.totalMidwives} Midwives</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icons.AlertCircle className="w-4 h-4 text-red-600" />
                        <span>{stats.highRiskMothers} High Risk</span>
                      </div>
                    </div>
                  </div>

                  {/* User Management */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#757575]">User Management</h3>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/doctors');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.Activity className="w-4 h-4 mr-2 text-[#00BCD4]" />
                      Manage Doctors
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/midwives');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.Heart className="w-4 h-4 mr-2 text-[#4CAF50]" />
                      Manage Midwives
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/mothers');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.User className="w-4 h-4 mr-2 text-[#2196F3]" />
                      Manage Mothers
                    </Button>
                  </div>

                  {/* System Management */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#757575]">System</h3>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/hospitals');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.Hospital className="w-4 h-4 mr-2 text-[#00BCD4]" />
                      Hospitals
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/analytics');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.TrendingUp className="w-4 h-4 mr-2 text-[#0288D1]" />
                      Analytics
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/emergencies');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.Ambulance className="w-4 h-4 mr-2 text-red-600" />
                      Emergencies
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/dashboard/admin/settings');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icons.Activity className="w-4 h-4 mr-2 text-[#757575]" />
                      Settings
                    </Button>
                  </div>

                  {/* Logout */}
                  <div className="pt-4 border-t mt-auto">
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() => signOut({ callbackUrl: '/login' })}
                    >
                      <Icons.LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Icons.User className="w-5 h-5 sm:w-6 sm:h-6 text-[#2196F3]" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#212121]">{stats.totalMothers}</p>
                <p className="text-xs sm:text-sm text-[#757575]">Mothers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Icons.Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#00BCD4]" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#212121]">{stats.totalDoctors}</p>
                <p className="text-xs sm:text-sm text-[#757575]">Doctors</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Icons.Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#4CAF50]" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#212121]">{stats.totalMidwives}</p>
                <p className="text-xs sm:text-sm text-[#757575]">Midwives</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center mb-2 sm:mb-3">
                  <Icons.AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.highRiskMothers}</p>
                <p className="text-xs sm:text-sm text-[#757575]">High Risk</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center mb-2 sm:mb-3">
                  <Icons.Ambulance className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.activeEmergencies}</p>
                <p className="text-xs sm:text-sm text-[#757575]">Emergencies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-4 sm:mb-6">User Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/admin/doctors')}>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Icons.Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BCD4]" />
                  Doctors
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage doctor accounts and profiles</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#212121]">{stats.totalDoctors}</p>
                    <p className="text-xs sm:text-sm text-[#757575]">Active doctors</p>
                  </div>
                  <Button size="sm" className="bg-[#00BCD4] hover:bg-[#0097A7] w-full sm:w-auto text-xs sm:text-sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/admin/midwives')}>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Icons.Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#4CAF50]" />
                  Midwives
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage midwife accounts and regions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#212121]">{stats.totalMidwives}</p>
                    <p className="text-xs sm:text-sm text-[#757575]">Active midwives</p>
                  </div>
                  <Button size="sm" className="bg-[#4CAF50] hover:bg-[#388E3C] w-full sm:w-auto text-xs sm:text-sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/admin/mothers')}>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Icons.User className="w-4 h-4 sm:w-5 sm:h-5 text-[#2196F3]" />
                  Mothers
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">View and manage mother profiles</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#212121]">{stats.totalMothers}</p>
                    <p className="text-xs sm:text-sm text-[#757575]">Registered mothers</p>
                  </div>
                  <Button size="sm" className="bg-[#2196F3] hover:bg-[#1976D2] w-full sm:w-auto text-xs sm:text-sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Management */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-4 sm:mb-6">System Management</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button
              onClick={() => router.push('/dashboard/admin/hospitals')}
              className="h-auto py-4 sm:py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <Icons.Hospital className="w-6 h-6 sm:w-8 sm:h-8 text-[#00BCD4]" />
                <span className="font-semibold text-xs sm:text-sm">Hospitals</span>
                <span className="text-[10px] sm:text-xs text-[#757575] hidden sm:block">Manage facilities</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admin/analytics')}
              className="h-auto py-4 sm:py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <Icons.TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#0288D1]" />
                <span className="font-semibold text-xs sm:text-sm">Analytics</span>
                <span className="text-[10px] sm:text-xs text-[#757575] hidden sm:block">System reports</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admin/emergencies')}
              className="h-auto py-4 sm:py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <Icons.Ambulance className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                <span className="font-semibold text-xs sm:text-sm">Emergencies</span>
                <span className="text-[10px] sm:text-xs text-[#757575] hidden sm:block">Active alerts</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/admin/settings')}
              className="h-auto py-4 sm:py-6 bg-white text-[#212121] border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <Icons.Settings className="w-6 h-6 sm:w-8 sm:h-8 text-[#757575]" />
                <span className="font-semibold text-xs sm:text-sm">Settings</span>
                <span className="text-[10px] sm:text-xs text-[#757575] hidden sm:block">System config</span>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

