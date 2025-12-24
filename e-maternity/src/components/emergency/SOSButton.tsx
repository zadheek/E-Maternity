'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { EmergencyType } from '@/types/prisma.types';

export function SOSButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emergencyType, setEmergencyType] = useState<string>('');
  const [description, setDescription] = useState('');

  const emergencyTypes = [
    { value: EmergencyType.SEVERE_BLEEDING, label: 'Severe Bleeding', color: 'text-red-600' },
    { value: EmergencyType.SEVERE_ABDOMINAL_PAIN, label: 'Severe Abdominal Pain', color: 'text-red-600' },
    { value: EmergencyType.HIGH_BLOOD_PRESSURE, label: 'High Blood Pressure', color: 'text-orange-600' },
    { value: EmergencyType.PREMATURE_LABOR, label: 'Premature Labor', color: 'text-red-600' },
    { value: EmergencyType.REDUCED_FETAL_MOVEMENT, label: 'Reduced Fetal Movement', color: 'text-orange-600' },
    { value: EmergencyType.OTHER, label: 'Other Emergency', color: 'text-red-600' },
  ];

  const handleEmergency = async () => {
    if (!emergencyType) {
      toast({
        title: 'Error',
        description: 'Please select emergency type',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's location
      let latitude = 0;
      let longitude = 0;
      let address = 'Location not available';

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 0,
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
        } catch (error) {
          console.error('Location error:', error);
        }
      }

      const response = await fetch('/api/emergency/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emergencyType,
          description: description || 'Emergency alert triggered',
          latitude,
          longitude,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      toast({
        title: 'Emergency Alert Sent',
        description: 'Help is on the way. Your emergency contacts have been notified.',
      });

      setOpen(false);
      setEmergencyType('');
      setDescription('');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send emergency alert. Please call emergency services.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg w-full"
        onClick={() => setOpen(true)}
      >
        <Icons.AlertCircle className="mr-2 h-5 w-5" />
        SOS Emergency
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Icons.Ambulance className="w-5 h-5" />
              Emergency Alert
            </DialogTitle>
            <DialogDescription>
              This will immediately notify your emergency contacts and healthcare providers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyType">Emergency Type *</Label>
              <Select value={emergencyType} onValueChange={setEmergencyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className={type.color}>{type.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's happening..."
                rows={3}
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Important:</strong> If this is life-threatening, call emergency services (119) immediately.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleEmergency} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Alert...
                </>
              ) : (
                <>
                  <Icons.AlertCircle className="mr-2 h-4 w-4" />
                  Send Emergency Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
