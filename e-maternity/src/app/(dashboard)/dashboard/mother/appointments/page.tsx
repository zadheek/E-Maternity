'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  type: string;
  scheduledDate: string;
  duration: number;
  status: string;
  provider: {
    firstName: string;
    lastName: string;
    role: string;
  };
  address?: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth('MOTHER');
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return;
    
    setActionLoading(true);
    try {
      const scheduledDate = new Date(`${rescheduleDate}T${rescheduleTime}`);
      await axios.patch(`/api/appointments/${selectedAppointment.id}`, {
        scheduledDate: scheduledDate.toISOString(),
      });
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      toast.error('Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    
    setActionLoading(true);
    try {
      await axios.patch(`/api/appointments/${selectedAppointment.id}`, {
        status: 'CANCELLED',
      });
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAppointment) return;
    
    setActionLoading(true);
    try {
      await axios.patch(`/api/appointments/${selectedAppointment.id}`, {
        notes: editNotes,
        address: editAddress,
      });
      toast.success('Appointment updated successfully');
      setShowEditDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const date = new Date(appointment.scheduledDate);
    setRescheduleDate(date.toISOString().split('T')[0]);
    setRescheduleTime(date.toTimeString().slice(0, 5));
    setShowRescheduleDialog(true);
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditNotes(appointment.notes || '');
    setEditAddress(appointment.address || '');
    setShowEditDialog(true);
  };

  const openCancelDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'MISSED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ULTRASOUND': return Icons.Activity;
      case 'BLOOD_TEST': return Icons.Heart;
      case 'CONSULTATION': return Icons.Phone;
      case 'EMERGENCY': return Icons.Ambulance;
      default: return Icons.Calendar;
    }
  };

  const upcomingAppointments = appointments.filter(
    a => new Date(a.scheduledDate) >= new Date() && a.status !== 'CANCELLED'
  );
  
  const pastAppointments = appointments.filter(
    a => new Date(a.scheduledDate) < new Date() || a.status === 'CANCELLED'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/mother')}>
              <Icons.ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#212121]">Appointments</h1>
              <p className="text-sm text-[#757575]">Manage your healthcare visits</p>
            </div>
          </div>
          <Button 
            className="bg-[#00BCD4] hover:bg-[#0097A7]"
            onClick={() => router.push('/dashboard/mother/appointments/schedule')}
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Schedule New
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Icons.Activity className="w-8 h-8 animate-spin mx-auto text-[#00BCD4]" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-xl font-bold text-[#212121] mb-4">
                Upcoming Appointments ({upcomingAppointments.length})
              </h2>
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Icons.Calendar className="w-12 h-12 mx-auto mb-4 text-[#757575] opacity-50" />
                    <p className="text-[#757575] mb-4">No upcoming appointments scheduled</p>
                    <Button 
                      className="bg-[#00BCD4] hover:bg-[#0097A7]"
                      onClick={() => router.push('/dashboard/mother/appointments/schedule')}
                    >
                      Schedule Your First Appointment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingAppointments.map((appointment) => {
                    const IconComponent = getTypeIcon(appointment.type);
                    return (
                      <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-6 h-6 text-[#00BCD4]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">
                                    {appointment.type.replace(/_/g, ' ')}
                                  </h3>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-[#757575]">
                                  <div className="flex items-center gap-2">
                                    <Icons.Calendar className="w-4 h-4" />
                                    <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                                    <Icons.Clock className="w-4 h-4 ml-2" />
                                    <span>{new Date(appointment.scheduledDate).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icons.User className="w-4 h-4" />
                                    <span>
                                      {appointment.provider.firstName} {appointment.provider.lastName}
                                      {' '} ({appointment.provider.role})
                                    </span>
                                  </div>
                                  {appointment.address && (
                                    <div className="flex items-center gap-2">
                                      <Icons.MapPin className="w-4 h-4" />
                                      <span>{appointment.address}</span>
                                    </div>
                                  )}
                                  {appointment.notes && (
                                    <p className="mt-2 text-[#212121]">{appointment.notes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Icons.MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openEditDialog(appointment)}>
                                  <Icons.Edit className="w-4 h-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openRescheduleDialog(appointment)}>
                                  <Icons.Calendar className="w-4 h-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => openCancelDialog(appointment)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Icons.X className="w-4 h-4 mr-2" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#212121] mb-4">
                  Past Appointments ({pastAppointments.length})
                </h2>
                <div className="grid gap-4">
                  {pastAppointments.map((appointment) => {
                    const IconComponent = getTypeIcon(appointment.type);
                    return (
                      <Card key={appointment.id} className="opacity-75">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {appointment.type.replace(/_/g, ' ')}
                                </h3>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-[#757575]">
                                {new Date(appointment.scheduledDate).toLocaleDateString()} with{' '}
                                {appointment.provider.firstName} {appointment.provider.lastName}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your appointment with{' '}
              {selectedAppointment?.provider.firstName} {selectedAppointment?.provider.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">Time</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRescheduleDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={actionLoading || !rescheduleDate || !rescheduleTime}
              className="bg-[#00BCD4] hover:bg-[#0097A7]"
            >
              {actionLoading ? (
                <><Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rescheduling...</>
              ) : (
                'Confirm Reschedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment Details</DialogTitle>
            <DialogDescription>
              Update the address or notes for your appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-address">Location/Address</Label>
              <Input
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Enter appointment location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add any notes or special instructions"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={actionLoading}
              className="bg-[#2196F3] hover:bg-[#1976D2]"
            >
              {actionLoading ? (
                <><Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment with{' '}
              {selectedAppointment?.provider.firstName} {selectedAppointment?.provider.lastName}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <div className="flex items-center gap-2 text-sm">
                <Icons.Calendar className="w-4 h-4 text-[#757575]" />
                <span className="font-medium">
                  {new Date(selectedAppointment.scheduledDate).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-[#757575] mt-1">
                {selectedAppointment.type.replace(/_/g, ' ')}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={actionLoading}
            >
              Keep Appointment
            </Button>
            <Button
              onClick={handleCancel}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? (
                <><Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...</>
              ) : (
                'Yes, Cancel Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

