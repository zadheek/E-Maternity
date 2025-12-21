'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

// Import section components
import AllPatientsSection from '@/components/doctor/AllPatientsSection';
import AppointmentsSection from '@/components/doctor/AppointmentsSection';
import PrescriptionsSection from '@/components/doctor/PrescriptionsSection';
import AnalyticsSection from '@/components/doctor/AnalyticsSection';

type ViewSection = 'overview' | 'patients' | 'appointments' | 'prescriptions' | 'analytics';

interface PatientSummary {
  id: string;
  name: string;
  age: number;
  pregnancyWeek: number;
  riskLevel: string;
}

interface DashboardStats {
  totalPatients: number;
  highRiskPatients: number;
  appointmentsToday: number;
  pendingReviews: number;
}

export default function DoctorDashboardPage() {
  const { user } = useAuth('DOCTOR');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewSection>('overview');
  const [patientFilter, setPatientFilter] = useState<string>('ALL');
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    highRiskPatients: 0,
    appointmentsToday: 0,
    pendingReviews: 0,
  });
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, patientsResponse] = await Promise.all([
        axios.get('/api/doctor/stats'),
        axios.get('/api/doctor/patients'),
      ]);

      setStats(statsResponse.data.data);
      setPatients(patientsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
              <p className="text-white/90 text-sm">
                Welcome back, Dr. {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/dashboard/doctor/profile')}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                <Icons.User className="w-5 h-5" />
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setPatientFilter('ALL');
              setActiveView('patients');
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#757575]">Total Patients</p>
                  <p className="text-3xl font-bold text-[#212121] mt-1">
                    {stats.totalPatients}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                  <Icons.User className="w-6 h-6 text-[#2196F3]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setPatientFilter('HIGH_RISK');
              setActiveView('patients');
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#757575]">High Risk</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {stats.highRiskPatients}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Icons.AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView('appointments')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#757575]">Today&apos;s Appointments</p>
                  <p className="text-3xl font-bold text-[#00BCD4] mt-1">
                    {stats.appointmentsToday}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                  <Icons.Calendar className="w-6 h-6 text-[#00BCD4]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveView('analytics')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#757575]">Pending Reviews</p>
                  <p className="text-3xl font-bold text-[#0288D1] mt-1">
                    {stats.pendingReviews}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0288D1]/10 flex items-center justify-center">
                  <Icons.Clock className="w-6 h-6 text-[#0288D1]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => {
              setPatientFilter('ALL');
              setActiveView('patients');
            }}
            className={`h-auto py-4 ${activeView === 'patients' ? 'bg-[#1976D2] ring-2 ring-[#2196F3]' : 'bg-[#2196F3] hover:bg-[#1976D2]'}`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.User className="w-6 h-6" />
              <span>All Patients</span>
            </div>
          </Button>
          <Button
            onClick={() => setActiveView('appointments')}
            className={`h-auto py-4 ${activeView === 'appointments' ? 'bg-[#0097A7] ring-2 ring-[#00BCD4]' : 'bg-[#00BCD4] hover:bg-[#0097A7]'}`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.Calendar className="w-6 h-6" />
              <span>Appointments</span>
            </div>
          </Button>
          <Button
            onClick={() => setActiveView('prescriptions')}
            className={`h-auto py-4 ${activeView === 'prescriptions' ? 'bg-[#388E3C] ring-2 ring-[#4CAF50]' : 'bg-[#4CAF50] hover:bg-[#388E3C]'}`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.Activity className="w-6 h-6" />
              <span>Prescriptions</span>
            </div>
          </Button>
          <Button
            onClick={() => setActiveView('analytics')}
            className={`h-auto py-4 ${activeView === 'analytics' ? 'bg-[#0277BD] ring-2 ring-[#0288D1]' : 'bg-[#0288D1] hover:bg-[#0277BD]'}`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.TrendingUp className="w-6 h-6" />
              <span>Analytics</span>
            </div>
          </Button>
        </div>

        {/* Dynamic Content Section */}
        <div className="animate-fadeIn">
          {activeView === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div className="space-y-4">
                  {filteredPatients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/doctor/patients/${patient.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2196F3] to-[#0288D1] flex items-center justify-center text-white font-bold">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold">{patient.name}</h4>
                          <p className="text-sm text-gray-500">Week {patient.pregnancyWeek}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
                            ? 'destructive'
                            : patient.riskLevel === 'MODERATE'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {patient.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
                {filteredPatients.length > 5 && (
                  <Button
                    onClick={() => {
                      setPatientFilter('ALL');
                      setActiveView('patients');
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    View All Patients
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === 'patients' && <AllPatientsSection initialFilter={patientFilter} />}
          {activeView === 'appointments' && <AppointmentsSection />}
          {activeView === 'prescriptions' && <PrescriptionsSection />}
          {activeView === 'analytics' && <AnalyticsSection />}
        </div>
      </main>
    </div>
  );
}
