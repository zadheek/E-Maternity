'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import axios from 'axios';
import { toast } from 'sonner';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  prescribedDate: string;
  validUntil: string | null;
  instructions: string;
  medications: Medication[];
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

export default function PrescriptionsSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('/api/doctor/prescriptions');
      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
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
          <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
          <p className="text-gray-600">Manage patient prescriptions</p>
        </div>
        <Button className="bg-[#2196F3] hover:bg-[#1976D2]">
          <Icons.Plus className="w-4 h-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No prescriptions found</p>
            </CardContent>
          </Card>
        ) : (
          prescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {prescription.mother.firstName} {prescription.mother.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Prescribed on {formatDate(prescription.prescribedDate)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {prescription.validUntil && (
                      <Badge variant={isExpired(prescription.validUntil) ? 'destructive' : 'outline'}>
                        {isExpired(prescription.validUntil) ? 'Expired' : `Valid until ${formatDate(prescription.validUntil)}`}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Week {prescription.mother.motherProfile.pregnancyWeek}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Medications */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Medications</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {prescription.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="bg-[#E3F2FD] rounded-lg p-3 border border-[#2196F3]/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-[#1976D2]">{med.name}</h5>
                          <Icons.Pill className="w-4 h-4 text-[#2196F3]" />
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Icons.Thermometer className="w-3 h-3" />
                            <span className="font-medium">Dosage:</span>
                            <span>{med.dosage}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Icons.Clock className="w-3 h-3" />
                            <span className="font-medium">Frequency:</span>
                            <span>{med.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Icons.Calendar className="w-3 h-3" />
                            <span className="font-medium">Duration:</span>
                            <span>{med.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Icons.Info className="w-5 h-5 text-[#2196F3] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">Instructions</h4>
                      <p className="text-sm text-gray-700">{prescription.instructions}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/doctor/patients/${prescription.mother.id}`)}
                  >
                    <Icons.User className="w-4 h-4 mr-2" />
                    View Patient
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.print()}
                  >
                    <Icons.Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#2196F3] hover:bg-[#1976D2]"
                  >
                    <Icons.Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
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
              Total prescriptions: {prescriptions.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
