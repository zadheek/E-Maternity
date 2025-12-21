'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedDate: Date;
  validUntil?: Date;
  prescribedBy: {
    firstName: string;
    lastName: string;
  };
}

interface MedicationTrackerProps {
  prescriptions: Medication[];
}

export function MedicationTracker({ prescriptions }: MedicationTrackerProps) {
  const { toast } = useToast();
  const [takenMedications, setTakenMedications] = useState<Set<string>>(new Set());

  const markAsTaken = (medicationId: string) => {
    setTakenMedications(prev => new Set(prev).add(medicationId));
    toast({
      title: 'Medication Recorded',
      description: 'Medication marked as taken',
    });
  };

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Pill className="w-5 h-5 text-[#2196F3]" />
            Current Medications
          </CardTitle>
          <CardDescription>No active prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icons.Pill className="w-12 h-12 text-[#757575] mb-2" />
            <p className="text-sm text-[#757575]">You have no active prescriptions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Pill className="w-5 h-5 text-[#2196F3]" />
          Current Medications
        </CardTitle>
        <CardDescription>Track your prescribed medications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            const medications = Array.isArray(prescription) 
              ? prescription 
              : (prescription as any).medications || [];
            
            return (
              <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      Prescribed by Dr. {prescription.prescribedBy.firstName} {prescription.prescribedBy.lastName}
                    </h4>
                    <p className="text-xs text-[#757575]">
                      Date: {new Date(prescription.prescribedDate).toLocaleDateString()}
                    </p>
                    {prescription.validUntil && (
                      <p className="text-xs text-[#757575]">
                        Valid until: {new Date(prescription.validUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={prescription.validUntil && new Date(prescription.validUntil) < new Date() ? 'secondary' : 'default'}>
                    {prescription.validUntil && new Date(prescription.validUntil) < new Date() ? 'Expired' : 'Active'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {Array.isArray(medications) && medications.map((med: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-[#FAFAFA] p-3 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{med.name}</p>
                        <p className="text-xs text-[#757575]">{med.dosage} • {med.frequency}</p>
                        {med.instructions && (
                          <p className="text-xs text-[#757575] mt-1">{med.instructions}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={takenMedications.has(`${prescription.id}-${index}`) ? 'secondary' : 'default'}
                        onClick={() => markAsTaken(`${prescription.id}-${index}`)}
                        disabled={takenMedications.has(`${prescription.id}-${index}`)}
                      >
                        {takenMedications.has(`${prescription.id}-${index}`) ? (
                          <>
                            <Icons.CheckCircle className="mr-1 h-3 w-3" />
                            Taken
                          </>
                        ) : (
                          'Mark as Taken'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-[#757575] italic">{prescription.instructions}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

