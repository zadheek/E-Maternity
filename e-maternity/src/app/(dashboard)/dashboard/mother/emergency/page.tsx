'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface EmergencyAlert {
  id: string;
  type: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
}

interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  contactNumber: string;
  emergencyNumber: string;
  distance?: number;
}

export default function EmergencyPage() {
  const { user } = useAuth('MOTHER');
  const router = useRouter();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'success' | 'error'>('idle');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [emergencyForm, setEmergencyForm] = useState({
    type: 'SEVERE_BLEEDING',
    description: '',
  });

  useEffect(() => {
    fetchAlerts();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationStatus('getting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setLocationStatus('success');
          fetchNearbyHospitals(location.lat, location.lng);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationStatus('error');
          toast.error('Could not get your location. Please enable location services.');
        }
      );
    } else {
      setLocationStatus('error');
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/emergency');
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(`/api/hospitals/nearby?lat=${lat}&lng=${lng}`);
      setNearbyHospitals(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    }
  };

  const handleSendSOS = async () => {
    if (!currentLocation) {
      toast.error('Location not available. Please try again.');
      getCurrentLocation();
      return;
    }

    if (!emergencyForm.description || emergencyForm.description.length < 10) {
      toast.error('Please provide more details about the emergency (at least 10 characters)');
      return;
    }

    setSendingAlert(true);

    try {
      await axios.post('/api/emergency', {
        type: emergencyForm.type,
        description: emergencyForm.description,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      });

      toast.success('Emergency alert sent! Help is on the way.', {
        description: 'Your emergency contacts and assigned healthcare providers have been notified.',
        duration: 5000,
      });

      setEmergencyForm({ type: 'SEVERE_BLEEDING', description: '' });
      fetchAlerts();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to send emergency alert');
    } finally {
      setSendingAlert(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-red-100 text-red-800';
      case 'RESPONDED': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/mother')}
              className="text-white hover:bg-red-700"
            >
              <Icons.ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Icons.Ambulance className="w-6 h-6" />
                Emergency SOS
              </h1>
              <p className="text-sm opacity-90">Quick access to emergency services</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {locationStatus === 'success' && (
              <Badge className="bg-green-500">
                <Icons.MapPin className="w-3 h-3 mr-1" />
                Location Active
              </Badge>
            )}
            {locationStatus === 'getting' && (
              <Badge className="bg-yellow-500">
                <Icons.Activity className="w-3 h-3 mr-1 animate-spin" />
                Getting Location...
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Emergency Alert Form */}
          <Card className="lg:col-span-2 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Icons.AlertCircle className="w-5 h-5" />
                Send Emergency Alert
              </CardTitle>
              <CardDescription>
                Use this only for urgent medical emergencies. Your location and details will be shared with emergency contacts and healthcare providers.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Emergency Type</Label>
                  <Select
                    value={emergencyForm.type}
                    onValueChange={(value) => setEmergencyForm({ ...emergencyForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEVERE_BLEEDING">Severe Bleeding</SelectItem>
                      <SelectItem value="SEVERE_ABDOMINAL_PAIN">Severe Abdominal Pain</SelectItem>
                      <SelectItem value="HIGH_BLOOD_PRESSURE">High Blood Pressure</SelectItem>
                      <SelectItem value="PREMATURE_LABOR">Premature Labor</SelectItem>
                      <SelectItem value="REDUCED_FETAL_MOVEMENT">Reduced Fetal Movement</SelectItem>
                      <SelectItem value="OTHER">Other Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={emergencyForm.description}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, description: e.target.value })}
                    placeholder="Describe your symptoms and situation in detail (minimum 10 characters)"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-[#757575]">
                    {emergencyForm.description.length}/10 characters minimum
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Icons.AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> For life-threatening emergencies, call 1990 (ambulance) immediately.
                  </p>
                </div>

                <Button
                  onClick={handleSendSOS}
                  disabled={sendingAlert || locationStatus !== 'success'}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                  size="lg"
                >
                  {sendingAlert ? (
                    <>
                      <Icons.Activity className="mr-2 h-5 w-5 animate-spin" />
                      Sending Emergency Alert...
                    </>
                  ) : (
                    <>
                      <Icons.Ambulance className="mr-2 h-5 w-5" />
                      Send SOS Alert
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts & Nearby Hospitals */}
          <div className="space-y-6">
            {/* Quick Call Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Hotlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = 'tel:1990'}
                >
                  <Icons.Phone className="mr-2 h-4 w-4 text-red-600" />
                  <div className="text-left flex-1">
                    <p className="font-semibold">Ambulance</p>
                    <p className="text-xs text-[#757575]">1990</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = 'tel:119'}
                >
                  <Icons.Phone className="mr-2 h-4 w-4 text-red-600" />
                  <div className="text-left flex-1">
                    <p className="font-semibold">Police Emergency</p>
                    <p className="text-xs text-[#757575]">119</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Nearby Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nearby Hospitals</CardTitle>
                <CardDescription className="text-xs">
                  Hospitals with maternity wards near you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nearbyHospitals.length === 0 ? (
                  <div className="text-center py-4 text-sm text-[#757575]">
                    <Icons.MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Enable location to see nearby hospitals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nearbyHospitals.slice(0, 3).map((hospital) => (
                      <div key={hospital.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm">{hospital.name}</h4>
                          {hospital.distance && (
                            <span className="text-xs text-[#757575]">{hospital.distance.toFixed(1)} km</span>
                          )}
                        </div>
                        <p className="text-xs text-[#757575] mb-2">{hospital.address}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.location.href = `tel:${hospital.emergencyNumber}`}
                        >
                          <Icons.Phone className="mr-1 h-3 w-3" />
                          Call: {hospital.emergencyNumber}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert History */}
        {alerts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Emergency Alerts</CardTitle>
              <CardDescription>Your emergency alert history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Icons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {alert.type.replace(/_/g, ' ')}
                        </h4>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#757575] mb-1">{alert.description}</p>
                      <p className="text-xs text-[#757575]">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
