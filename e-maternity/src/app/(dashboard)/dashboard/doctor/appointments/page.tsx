'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import axios from 'axios';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  scheduledDate: string;
  duration: number;
  status: string;
  type: string;
  address: string;
  notes?: string;
  mother: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    motherProfile: {
      pregnancyWeek: number;
      riskLevel: string;
    };
  };
}

export default function DoctorAppointmentsPage() {
  useAuth('DOCTOR');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/doctor/appointments');
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    if (filter === 'TODAY') {
      const today = new Date().toDateString();
      return new Date(apt.scheduledDate).toDateString() === today;
    }
    return apt.status === filter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      case 'SCHEDULED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/dashboard/doctor')}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Appointments</h1>
                <p className="text-white/90 text-sm">
                  Manage your appointment schedule
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Total Appointments</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setFilter('ALL')}
                variant={filter === 'ALL' ? 'default' : 'outline'}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('TODAY')}
                variant={filter === 'TODAY' ? 'default' : 'outline'}
                size="sm"
              >
                Today
              </Button>
              <Button
                onClick={() => setFilter('SCHEDULED')}
                variant={filter === 'SCHEDULED' ? 'default' : 'outline'}
                size="sm"
              >
                Scheduled
              </Button>
              <Button
                onClick={() => setFilter('CONFIRMED')}
                variant={filter === 'CONFIRMED' ? 'default' : 'outline'}
                size="sm"
              >
                Confirmed
              </Button>
              <Button
                onClick={() => setFilter('COMPLETED')}
                variant={filter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
              >
                Completed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Date/Time */}
                      <div className="flex flex-col items-center justify-center bg-[#2196F3]/10 rounded-lg px-4 py-3 min-w-[100px]">
                        <Icons.Calendar className="w-5 h-5 text-[#2196F3] mb-1" />
                        <p className="text-xs text-gray-600">{formatDate(appointment.scheduledDate)}</p>
                        <p className="text-sm font-bold text-[#2196F3]">{formatTime(appointment.scheduledDate)}</p>
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {appointment.mother.firstName} {appointment.mother.lastName}
                          </h3>
                          <Badge variant={appointment.mother.motherProfile.riskLevel === 'HIGH' || appointment.mother.motherProfile.riskLevel === 'CRITICAL' ? 'destructive' : 'secondary'}>
                            {appointment.mother.motherProfile.riskLevel}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Icons.Activity className="w-4 h-4" />
                            <span>Week {appointment.mother.motherProfile.pregnancyWeek}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icons.Phone className="w-4 h-4" />
                            <span>{appointment.mother.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icons.MapPin className="w-4 h-4" />
                            <span>{appointment.address}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="mt-2 text-sm text-gray-500 italic">
                            Note: {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {appointment.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {appointment.duration} min
                        </span>
                      </div>
                      <Button
                        onClick={() => router.push(`/dashboard/doctor/patients/${appointment.mother.id}`)}
                        size="sm"
                        variant="outline"
                      >
                        View Patient
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
