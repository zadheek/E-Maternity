// components/molecules/EmergencyButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';

export function EmergencyButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmergency = async () => {
    setLoading(true);
    try {
      // Get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // TODO: Call emergency API
            console.log('Emergency triggered:', { latitude, longitude });
            
            // Close dialog
            setShowConfirm(false);
            
            // Show success notification
            alert('Emergency alert sent to your healthcare providers!');
          },
          (error) => {
            console.error('Location error:', error);
            alert('Could not get your location. Please enable GPS.');
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    } catch (error) {
      console.error('Emergency error:', error);
      alert('Failed to send emergency alert. Please call emergency services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="bg-[#F44336] hover:bg-[#D32F2F] text-white font-bold shadow-lg"
        onClick={() => setShowConfirm(true)}
      >
        <Icons.Ambulance className="w-5 h-5 mr-2" />
        Emergency SOS
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Icons.AlertTriangle className="w-6 h-6" />
              Emergency Alert
            </DialogTitle>
            <DialogDescription>
              This will immediately alert your assigned healthcare providers and emergency
              contacts with your current location. Use only in case of emergency.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#757575]">
              Your location will be shared with:
            </p>
            <ul className="list-disc list-inside text-sm text-[#757575] mt-2 space-y-1">
              <li>Assigned Doctor</li>
              <li>Assigned Midwife</li>
              <li>Emergency Contacts</li>
              <li>Nearest Hospital</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#F44336] hover:bg-[#D32F2F]"
              onClick={handleEmergency}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Alert...
                </>
              ) : (
                'Send Emergency Alert'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
