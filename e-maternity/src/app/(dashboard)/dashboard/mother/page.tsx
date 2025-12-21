// app/(dashboard)/dashboard/mother/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { signOut } from 'next-auth/react';

export default function MotherDashboard() {
  const { user, loading } = useAuth('MOTHER');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[#E91E63]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icons.Baby className="w-8 h-8 text-[#E91E63]" />
            <h1 className="text-2xl font-bold text-[#212121]">E-Maternity</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#757575]">
              Welcome, {(user as any)?.firstName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <Icons.LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#212121] mb-2">
            My Health Dashboard
          </h2>
          <p className="text-[#757575]">
            Track your pregnancy journey and stay connected with your healthcare providers
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <Icons.Activity className="w-10 h-10 text-[#E91E63] mb-2" />
              <CardTitle>Health Metrics</CardTitle>
              <CardDescription>
                Record your daily health measurements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <Icons.Calendar className="w-10 h-10 text-[#00BCD4] mb-2" />
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                View and schedule appointments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-red-50 border-red-200">
            <CardHeader>
              <Icons.Ambulance className="w-10 h-10 text-[#F44336] mb-2" />
              <CardTitle>Emergency SOS</CardTitle>
              <CardDescription>
                Quick access to emergency services
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <Icons.Video className="w-10 h-10 text-[#4CAF50] mb-2" />
              <CardTitle>Telemedicine</CardTitle>
              <CardDescription>
                Connect with your doctor online
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Health Metrics</CardTitle>
              <CardDescription>Your latest health measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-[#757575]">
                <Icons.Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No health metrics recorded yet</p>
                <Button className="mt-4 bg-[#E91E63] hover:bg-[#C2185B]">
                  Add First Metric
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-[#757575]">
                <Icons.Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <Button className="mt-4 bg-[#00BCD4] hover:bg-[#0097A7]">
                  Schedule Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pregnancy Progress */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pregnancy Progress</CardTitle>
            <CardDescription>Track your journey week by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Icons.Baby className="w-16 h-16 mx-auto mb-4 text-[#E91E63]" />
              <h3 className="text-2xl font-bold mb-2">Week 20</h3>
              <p className="text-[#757575] mb-4">Halfway through your pregnancy!</p>
              <div className="max-w-md mx-auto bg-gray-200 rounded-full h-4">
                <div
                  className="bg-[#E91E63] h-4 rounded-full"
                  style={{ width: '50%' }}
                />
              </div>
              <p className="text-sm text-[#757575] mt-2">20 weeks remaining</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
