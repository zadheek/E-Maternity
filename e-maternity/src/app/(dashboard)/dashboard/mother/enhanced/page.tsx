'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HealthMetricInput } from '@/components/health/HealthMetricInput';
import { HealthTrendChart } from '@/components/health/HealthTrendChart';
import { MedicationTracker } from '@/components/medications/MedicationTracker';
import { ContractionTimer } from '@/components/tools/ContractionTimer';
import { SOSButton } from '@/components/emergency/SOSButton';
import axios from 'axios';
import { MetricType } from '@/types/prisma.types';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface MotherProfile {
  pregnancyWeek: number;
  expectedDeliveryDate: string;
  riskLevel: string;
  district: string;
}

interface HealthMetric {
  id: string;
  type: MetricType;
  value: number;
  unit: string;
  recordedAt: Date;
}

interface Appointment {
  id: string;
  type: string;
  scheduledDate: string;
  status: string;
  provider: {
    firstName: string;
    lastName: string;
  };
  providerType: string;
}

interface Prescription {
  id: string;
  medications: any;
  instructions: string;
  prescribedDate: Date;
  validUntil?: Date;
  prescribedBy: {
    firstName: string;
    lastName: string;
  };
}

export default function MotherDashboardNew() {
  const { user, loading } = useAuth('MOTHER');
  const [profile, setProfile] = useState<MotherProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [profileRes, metricsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        axios.get('/api/profile/mother'),
        axios.get('/api/health/metrics?limit=50'),
        axios.get('/api/appointments'),
        axios.get('/api/prescriptions'),
      ]);

      setProfile(profileRes.data.data);
      setHealthMetrics(metricsRes.data.data || []);
      setAppointments(appointmentsRes.data.data || []);
      setPrescriptions(prescriptionsRes.data.data || []);
    } catch (error) {
      
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.scheduledDate) >= new Date() && apt.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);

  const activePrescriptions = prescriptions.filter(p => 
    !p.validUntil || new Date(p.validUntil) >= new Date()
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#212121] mb-2">
            Welcome back, {user?.firstName || 'Mother'}! 👋
          </h1>
          <p className="text-[#757575]">
            Track your pregnancy journey and stay healthy
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Profile Summary Card */}
      {profile && (
        <Card className="mb-6 border-2 border-[#2196F3]/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#2196F3]/10 rounded-full">
                  <Icons.Baby className="w-6 h-6 text-[#2196F3]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Pregnancy Week</p>
                  <p className="text-2xl font-bold">{profile.pregnancyWeek}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#00BCD4]/10 rounded-full">
                  <Icons.Calendar className="w-6 h-6 text-[#00BCD4]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Due Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(profile.expectedDeliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0288D1]/10 rounded-full">
                  <Icons.AlertCircle className="w-6 h-6 text-[#0288D1]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Risk Level</p>
                  <Badge className={getRiskBadgeColor(profile.riskLevel)}>
                    {profile.riskLevel}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#4CAF50]/10 rounded-full">
                  <Icons.MapPin className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">District</p>
                  <p className="text-sm font-semibold">{profile.district}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency SOS Button */}
      <div className="mb-6">
        <SOSButton />
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Tracking</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="tools">Pregnancy Tools</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Calendar className="w-5 h-5 text-[#2196F3]" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-[#757575]">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">{apt.type}</p>
                          <p className="text-xs text-[#757575]">
                            {new Date(apt.scheduledDate).toLocaleDateString()} at{' '}
                            {new Date(apt.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-[#757575]">
                            with {apt.provider.firstName} {apt.provider.lastName}
                          </p>
                        </div>
                        <Badge>{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Button className="w-full mt-4" onClick={() => window.location.href = '/dashboard/mother/appointments'}>
                  <Icons.Calendar className="mr-2 h-4 w-4" />
                  View All Appointments
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Activity className="w-5 h-5 text-[#2196F3]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/mother/health-metrics'}>
                  <Icons.Activity className="mr-2 h-4 w-4" />
                  Add Health Data
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/mother/appointments'}>
                  <Icons.Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/mother/pregnancy-tracking'}>
                  <Icons.Baby className="mr-2 h-4 w-4" />
                  Pregnancy Tracking
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/mother/profile'}>
                  <Icons.User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.WEIGHT} 
              title="Weight Trend"
            />
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.BLOOD_PRESSURE_SYSTOLIC} 
              title="Blood Pressure (Systolic)"
            />
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.BLOOD_GLUCOSE} 
              title="Blood Glucose"
            />
          </div>
        </TabsContent>

        {/* Health Tracking Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthMetricInput onSuccess={fetchAllData} />
            <div className="space-y-6">
              <HealthTrendChart 
                metrics={healthMetrics} 
                metricType={MetricType.FETAL_HEART_RATE} 
                title="Fetal Heart Rate"
              />
              <HealthTrendChart 
                metrics={healthMetrics} 
                metricType={MetricType.FUNDAL_HEIGHT} 
                title="Fundal Height"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.WEIGHT} 
              title="Weight Trend"
            />
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.BLOOD_PRESSURE_SYSTOLIC} 
              title="Blood Pressure (Systolic)"
            />
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.BLOOD_PRESSURE_DIASTOLIC} 
              title="Blood Pressure (Diastolic)"
            />
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.BLOOD_GLUCOSE} 
              title="Blood Glucose"
            />
            <HealthTrendChart 
              metrics={healthMetrics} 
              metricType={MetricType.HEMOGLOBIN} 
              title="Hemoglobin"
            />
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <MedicationTracker prescriptions={activePrescriptions as any} />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContractionTimer />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.FileText className="w-5 h-5 text-[#2196F3]" />
                  Educational Resources
                </CardTitle>
                <CardDescription>Week-by-week pregnancy guide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Icons.Baby className="mr-2 h-4 w-4" />
                    Week {profile?.pregnancyWeek || 0} Development
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icons.Activity className="mr-2 h-4 w-4" />
                    Nutrition Guidelines
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icons.Heart className="mr-2 h-4 w-4" />
                    Exercise During Pregnancy
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Icons.AlertCircle className="mr-2 h-4 w-4" />
                    Warning Signs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Calendar className="w-5 h-5 text-[#2196F3]" />
                All Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-sm text-[#757575] text-center py-8">No appointments scheduled</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{apt.type}</p>
                        <p className="text-sm text-[#757575]">
                          {new Date(apt.scheduledDate).toLocaleDateString()} at{' '}
                          {new Date(apt.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-[#757575]">
                          with {apt.provider.firstName} {apt.provider.lastName} ({apt.providerType})
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge>{apt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4">
                <Icons.Plus className="mr-2 h-4 w-4" />
                Book New Appointment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

