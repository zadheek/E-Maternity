'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  hospital?: string;
}

export default function ScheduleAppointmentPage() {
  const { user } = useAuth('MOTHER');
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    providerId: '',
    providerType: 'doctor',
    type: 'ROUTINE_CHECKUP',
    scheduledDate: '',
    scheduledTime: '',
    duration: '30',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchProviders();
  }, [formData.providerType]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`/api/providers?type=${formData.providerType}`);
      setProviders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      toast.error('Failed to load healthcare providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}`;
      
      await axios.post('/api/appointments', {
        providerId: formData.providerId,
        providerType: formData.providerType,
        type: formData.type,
        scheduledDate: scheduledDateTime,
        duration: parseInt(formData.duration),
        address: formData.address || undefined,
        notes: formData.notes || undefined,
      });

      toast.success('Appointment scheduled successfully!');
      router.push('/dashboard/mother/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/mother/appointments')}>
            <Icons.ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">Schedule Appointment</h1>
            <p className="text-sm text-[#757575]">Book a visit with your healthcare provider</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>New Appointment</CardTitle>
            <CardDescription>Fill in the details to schedule your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Type */}
              <div className="space-y-2">
                <Label htmlFor="providerType">Provider Type</Label>
                <Select
                  value={formData.providerType}
                  onValueChange={(value) => setFormData({ ...formData, providerType: value, providerId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="midwife">Midwife</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="providerId">Healthcare Provider</Label>
                {loading ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <Icons.Activity className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-[#757575]">Loading providers...</span>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="p-4 border rounded-md bg-orange-50 text-orange-800">
                    <p className="text-sm">No {formData.providerType}s available at the moment.</p>
                    <p className="text-xs mt-1">Please contact support or try again later.</p>
                  </div>
                ) : (
                  <Select
                    value={formData.providerId}
                    onValueChange={(value) => setFormData({ ...formData, providerId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.firstName} {provider.lastName}
                          {provider.specialization && ` - ${provider.specialization}`}
                          {provider.hospital && ` (${provider.hospital})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Appointment Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROUTINE_CHECKUP">Routine Checkup</SelectItem>
                    <SelectItem value="ULTRASOUND">Ultrasound</SelectItem>
                    <SelectItem value="BLOOD_TEST">Blood Test</SelectItem>
                    <SelectItem value="CONSULTATION">Consultation</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    min={today}
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Location/Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Hospital or clinic address"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requirements or concerns"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/dashboard/mother/appointments')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#00BCD4] hover:bg-[#0097A7]"
                  disabled={submitting || providers.length === 0}
                >
                  {submitting ? (
                    <>
                      <Icons.Activity className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
