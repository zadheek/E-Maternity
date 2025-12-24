'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface PatientSummary {
  id: string;
  name: string;
  age: number;
  pregnancyWeek: number;
  riskLevel: string;
  lastVisit?: string;
  nextCheckup?: string;
  district: string;
}

interface DashboardStats {
  totalPatients: number;
  highRiskPatients: number;
  visitsToday: number;
  pendingFollowups: number;
}

export default function MidwifeDashboardPage() {
  const { user } = useAuth('MIDWIFE');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    highRiskPatients: 0,
    visitsToday: 0,
    pendingFollowups: 0,
  });
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-risk' | 'today-visits' | 'followups'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, patientsResponse] = await Promise.all([
        axios.get('/api/midwife/stats'),
        axios.get('/api/midwife/patients'),
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

  const filteredPatients = patients.filter((patient) => {
    // First apply search filter
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Then apply active filter
    switch (activeFilter) {
      case 'high-risk':
        return patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL';
      case 'today-visits':
        return true;
      case 'followups':
        return true;
      case 'all':
      default:
        return true;
    }
  });

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
              <h1 className="text-3xl font-bold">Midwife Dashboard</h1>
              <p className="text-white/90 text-sm">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/dashboard/midwife/profile')}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                <Icons.User className="w-5 h-5" />
                <span className="font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
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
      <main className="container mx-auto px-4 py-8 animate-fadeIn"
>
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'all' ? 'ring-2 ring-[#2196F3]' : ''
            }`}
            onClick={() => setActiveFilter('all')}
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
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'high-risk' ? 'ring-2 ring-red-600' : ''
            }`}
            onClick={() => setActiveFilter('high-risk')}
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
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'today-visits' ? 'ring-2 ring-[#00BCD4]' : ''
            }`}
            onClick={() => setActiveFilter('today-visits')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#757575]">Today&apos;s Visits</p>
                  <p className="text-3xl font-bold text-[#00BCD4] mt-1">
                    {stats.visitsToday}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                  <Icons.Calendar className="w-6 h-6 text-[#00BCD4]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'followups' ? 'ring-2 ring-[#0288D1]' : ''
            }`}
            onClick={() => setActiveFilter('followups')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#757575]">Pending Followups</p>
                  <p className="text-3xl font-bold text-[#0288D1] mt-1">
                    {stats.pendingFollowups}
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
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="bg-[#2196F3] hover:bg-[#1976D2] h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.User className="w-6 h-6" />
              <span>All Patients</span>
            </div>
          </Button>
          <Button
            onClick={() => setActiveFilter('today-visits')}
            className="bg-[#00BCD4] hover:bg-[#0097A7] h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.Calendar className="w-6 h-6" />
              <span>Today&apos;s Visits</span>
            </div>
          </Button>
          <Button
            onClick={() => setActiveFilter('high-risk')}
            className="bg-[#4CAF50] hover:bg-[#388E3C] h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.AlertCircle className="w-6 h-6" />
              <span>High Risk Patients</span>
            </div>
          </Button>
          <Button
            onClick={() => setActiveFilter('followups')}
            className="bg-[#0288D1] hover:bg-[#0277BD] h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.Clock className="w-6 h-6" />
              <span>Pending Followups</span>
            </div>
          </Button>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {activeFilter === 'all' && 'All Patients'}
                  {activeFilter === 'high-risk' && 'High Risk Patients'}
                  {activeFilter === 'today-visits' && "Today's Visits"}
                  {activeFilter === 'followups' && 'Pending Followups'}
                </CardTitle>
                <CardDescription>
                  {activeFilter === 'all' && 'Manage and monitor your assigned patients'}
                  {activeFilter === 'high-risk' && 'Patients requiring special attention'}
                  {activeFilter === 'today-visits' && 'Scheduled visits for today'}
                  {activeFilter === 'followups' && 'Patients requiring followup visits'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                {activeFilter !== 'all' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Icons.User className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                <p className="text-[#757575]">No patients found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                        <Icons.User className="w-6 h-6 text-[#2196F3]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#212121]">{patient.name}</h3>
                        <p className="text-sm text-[#757575]">
                          {patient.age} years • Week {patient.pregnancyWeek} • {patient.district}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : patient.riskLevel === 'MODERATE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {patient.riskLevel}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/midwife/patients/${patient.id}`)}
                        className="bg-[#2196F3] hover:bg-[#1976D2]"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

