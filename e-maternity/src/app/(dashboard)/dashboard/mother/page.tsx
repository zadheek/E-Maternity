// app/(dashboard)/dashboard/mother/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { VitaminCard } from '@/components/vitamins/VitaminCard';
import { ImmunizationCard } from '@/components/immunizations/ImmunizationCard';

interface MotherProfile {
  id: string;
  pregnancyWeek: number;
  expectedDeliveryDate: string;
  riskLevel: string;
  district: string;
}

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  recordedAt: string;
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
}

export default function MotherDashboard() {
  const { user, loading } = useAuth('MOTHER');
  const router = useRouter();
  const [profile, setProfile] = useState<MotherProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [recentMetrics, setRecentMetrics] = useState<HealthMetric[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [vitamins, setVitamins] = useState<any[]>([]);
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.id) {
      fetchRecentData();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile/mother');
      setProfile(response.data.data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchRecentData = async () => {
    try {
      // Fetch recent health metrics (last 5)
      const metricsResponse = await axios.get('/api/health/metrics?limit=5');
      setRecentMetrics(metricsResponse.data.data || []);

      // Fetch upcoming appointments (next 5)
      const appointmentsResponse = await axios.get('/api/appointments?limit=5');
      const allAppointments = appointmentsResponse.data.data || [];
      const upcoming = allAppointments.filter((apt: Appointment) => 
        new Date(apt.scheduledDate) >= new Date() && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
      );
      setUpcomingAppointments(upcoming.slice(0, 5));

      // Fetch vitamins and immunizations
      if (profile?.id) {
        const vitaminsResponse = await axios.get(`/api/vitamins?motherProfileId=${profile.id}&isActive=true`);
        setVitamins(vitaminsResponse.data.data || []);

        const immunizationsResponse = await axios.get(`/api/immunizations?motherProfileId=${profile.id}`);
        setImmunizations(immunizationsResponse.data.data || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.Activity className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  const calculateDaysUntilDelivery = () => {
    if (!profile?.expectedDeliveryDate) return 0;
    const today = new Date();
    const edd = new Date(profile.expectedDeliveryDate);
    const diffTime = edd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const pregnancyWeek = profile?.pregnancyWeek || 0;
  const pregnancyProgress = Math.min(100, (pregnancyWeek / 40) * 100);
  const daysUntilDelivery = calculateDaysUntilDelivery();
  const riskLevel = profile?.riskLevel || 'LOW';

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      case 'MODERATE':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icons.Baby className="w-8 h-8 text-[#2196F3]" />
            <h1 className="text-2xl font-bold text-[#212121]">E-Maternity</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#757575]">
              {t('common.welcome')}, {(user as any)?.firstName}
            </span>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/mother/profile')}
            >
              <Icons.User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <Icons.LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#212121] mb-2">
            {t('dashboard.title')}
          </h2>
          <p className="text-[#757575]">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/mother/health-metrics')}
          >
            <CardHeader>
              <Icons.Activity className="w-10 h-10 text-[#2196F3] mb-2" />
              <CardTitle>{t('quickActions.healthMetrics')}</CardTitle>
              <CardDescription>
                {t('quickActions.healthMetricsDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/mother/pregnancy-tracking')}
          >
            <CardHeader>
              <Icons.Baby className="w-10 h-10 text-[#9C27B0] mb-2" />
              <CardTitle>Pregnancy Tracking</CardTitle>
              <CardDescription>
                Week-by-week progress & milestones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/mother/appointments')}
          >
            <CardHeader>
              <Icons.Calendar className="w-10 h-10 text-[#00BCD4] mb-2" />
              <CardTitle>{t('quickActions.appointments')}</CardTitle>
              <CardDescription>
                {t('quickActions.appointmentsDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow bg-red-50 border-red-200"
            onClick={() => router.push('/dashboard/mother/emergency')}
          >
            <CardHeader>
              <Icons.Ambulance className="w-10 h-10 text-[#F44336] mb-2" />
              <CardTitle>{t('quickActions.emergency')}</CardTitle>
              <CardDescription>
                {t('quickActions.emergencyDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => toast.info('Coming Soon! Telemedicine feature will be available in the next update.')}
          >
            <CardHeader>
              <Icons.Video className="w-10 h-10 text-[#4CAF50] mb-2" />
              <CardTitle>{t('quickActions.telemedicine')}</CardTitle>
              <CardDescription>
                {t('quickActions.telemedicineDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/mother/profile')}
          >
            <CardHeader>
              <Icons.User className="w-10 h-10 text-[#FF9800] mb-2" />
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                View and update your information
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity.healthMetricsTitle')}</CardTitle>
              <CardDescription>{t('recentActivity.healthMetricsSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center py-8">
                  <Icons.Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-[#2196F3]" />
                </div>
              ) : recentMetrics.length === 0 ? (
                <div className="text-center py-8 text-[#757575]">
                  <Icons.Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('healthMetrics.noMetrics')}</p>
                  <Button 
                    className="mt-4 bg-[#2196F3] hover:bg-[#1976D2]"
                    onClick={() => router.push('/dashboard/mother/health-metrics')}
                  >
                    {t('healthMetrics.addFirstMetric')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Icons.Activity className="w-5 h-5 text-[#2196F3]" />
                        <div>
                          <p className="font-medium text-sm">
                            {t(`healthMetrics.types.${metric.type}`) || metric.type}
                          </p>
                          <p className="text-xs text-[#757575]">
                            {new Date(metric.recordedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2196F3]">{metric.value}</p>
                        <p className="text-xs text-[#757575]">{metric.unit}</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/mother/health-metrics')}
                  >
                    {t('common.viewAll')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity.appointmentsTitle')}</CardTitle>
              <CardDescription>{t('recentActivity.appointmentsSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center py-8">
                  <Icons.Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-[#00BCD4]" />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-[#757575]">
                  <Icons.Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('appointments.noUpcoming')}</p>
                  <Button 
                    className="mt-4 bg-[#00BCD4] hover:bg-[#0097A7]"
                    onClick={() => router.push('/dashboard/mother/appointments/schedule')}
                  >
                    {t('appointments.scheduleFirst')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Icons.Calendar className="w-5 h-5 text-[#00BCD4] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {t(`appointments.types.${appointment.type}`) || appointment.type}
                        </p>
                        <p className="text-xs text-[#757575]">
                          Dr. {appointment.provider.firstName} {appointment.provider.lastName}
                        </p>
                        <p className="text-xs text-[#757575] mt-1">
                          {new Date(appointment.scheduledDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/mother/appointments')}
                  >
                    {t('common.viewAll')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vitamins & Immunizations Section */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Vitamins & Supplements</CardTitle>
                  <CardDescription>Current vitamin supplementation plan</CardDescription>
                </div>
                <Icons.Pill className="w-6 h-6 text-[#9C27B0]" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center py-8">
                  <Icons.Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-[#9C27B0]" />
                </div>
              ) : vitamins.length === 0 ? (
                <div className="text-center py-8 text-[#757575]">
                  <Icons.Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No vitamins prescribed yet</p>
                  <p className="text-xs mt-2">Your healthcare provider will prescribe vitamins during your visits</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vitamins.slice(0, 3).map((vitamin) => (
                    <VitaminCard key={vitamin.id} vitamin={vitamin} />
                  ))}
                  {vitamins.length > 3 && (
                    <p className="text-xs text-center text-[#757575] mt-2">
                      +{vitamins.length - 3} more vitamins
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Immunizations</CardTitle>
                  <CardDescription>Vaccination record & schedule</CardDescription>
                </div>
                <Icons.Shield className="w-6 h-6 text-[#4CAF50]" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center py-8">
                  <Icons.Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-[#4CAF50]" />
                </div>
              ) : immunizations.length === 0 ? (
                <div className="text-center py-8 text-[#757575]">
                  <Icons.Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No immunizations recorded yet</p>
                  <p className="text-xs mt-2">Ensure you receive tetanus and other recommended vaccines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {immunizations.slice(0, 3).map((immunization) => (
                    <ImmunizationCard key={immunization.id} immunization={immunization} />
                  ))}
                  {immunizations.length > 3 && (
                    <p className="text-xs text-center text-[#757575] mt-2">
                      +{immunizations.length - 3} more immunizations
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pregnancy Progress */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{t('dashboard.pregnancyProgress')}</CardTitle>
                <CardDescription>Track your journey week by week</CardDescription>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(riskLevel)}`}>
                {t('dashboard.riskLevel', { level: riskLevel })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Icons.Baby className="w-16 h-16 mx-auto mb-4 text-[#2196F3]" />
              <h3 className="text-3xl font-bold mb-2">{t('dashboard.week')} {pregnancyWeek}</h3>
              <p className="text-[#757575] mb-2">
                {daysUntilDelivery > 0 
                  ? t('dashboard.daysUntilDelivery', { days: daysUntilDelivery })
                  : t('dashboard.dueDateArrived')}
              </p>
              {profile?.expectedDeliveryDate && (
                <p className="text-sm text-[#757575] mb-4">
                  {t('dashboard.expectedDelivery')}: {new Date(profile.expectedDeliveryDate).toLocaleDateString()}
                </p>
              )}
              <div className="max-w-md mx-auto bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-[#2196F3] h-4 rounded-full transition-all duration-500"
                  style={{ width: `${pregnancyProgress}%` }}
                />
              </div>
              <p className="text-sm text-[#757575]">{pregnancyProgress.toFixed(0)}% {t('dashboard.complete')}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

