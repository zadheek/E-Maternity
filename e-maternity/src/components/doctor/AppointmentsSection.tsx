'use client';

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

export default function AppointmentsSection() {
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


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.Activity className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-600">Manage your appointment schedule</p>
        </div>
        <Button className="bg-[#2196F3] hover:bg-[#1976D2]">
          <Icons.Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setFilter('ALL')}
              className={filter === 'ALL' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'TODAY' ? 'default' : 'outline'}
              onClick={() => setFilter('TODAY')}
              className={filter === 'TODAY' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : ''}
            >
              Today
            </Button>
            <Button
              variant={filter === 'SCHEDULED' ? 'default' : 'outline'}
              onClick={() => setFilter('SCHEDULED')}
              className={filter === 'SCHEDULED' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : ''}
            >
              Scheduled
            </Button>
            <Button
              variant={filter === 'CONFIRMED' ? 'default' : 'outline'}
              onClick={() => setFilter('CONFIRMED')}
              className={filter === 'CONFIRMED' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : ''}
            >
              Confirmed
            </Button>
            <Button
              variant={filter === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => setFilter('COMPLETED')}
              className={filter === 'COMPLETED' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : ''}
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {/* Date & Time */}
                    <div className="bg-[#E3F2FD] rounded-lg p-3 text-center min-w-[80px]">
                      <p className="text-sm font-medium text-[#2196F3]">
                        {new Date(appointment.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date(appointment.scheduledDate).getDate()}
                      </p>
                      <p className="text-sm text-gray-600">{formatTime(appointment.scheduledDate)}</p>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.mother.firstName} {appointment.mother.lastName}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Icons.MapPin className="w-4 h-4" />
                          <span>{appointment.address || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Icons.Clock className="w-4 h-4" />
                          <span>{appointment.duration} minutes</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{appointment.type.toLowerCase().replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Icons.Activity className="w-4 h-4" />
                          <span>Week {appointment.mother.motherProfile.pregnancyWeek}</span>
                          <span className="mx-2">•</span>
                          <Badge variant="outline" className="text-xs">
                            {appointment.mother.motherProfile.riskLevel}
                          </Badge>
                        </div>
                        {appointment.notes && (
                          <div className="flex items-start gap-2 text-gray-600 mt-2 pt-2 border-t">
                            <Icons.FileText className="w-4 h-4 mt-0.5" />
                            <span className="text-sm">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="bg-[#2196F3] hover:bg-[#1976D2]"
                      onClick={() => router.push(`/dashboard/doctor/patients/${appointment.mother.id}`)}
                    >
                      View Patient
                    </Button>
                    {appointment.status !== 'COMPLETED' && (
                      <>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icons.Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
