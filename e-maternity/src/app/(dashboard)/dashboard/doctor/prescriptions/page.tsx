'use client';

import { useAuth } from '@/hooks/useAuth';
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

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth('DOCTOR');
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
                <h1 className="text-3xl font-bold">Prescriptions</h1>
                <p className="text-white/90 text-sm">
                  View and manage patient prescriptions
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Total Prescriptions</p>
              <p className="text-2xl font-bold">{prescriptions.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Prescriptions List */}
        {prescriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No prescriptions found</p>
              <p className="text-sm text-gray-500 mt-2">
                Prescriptions you create will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {prescription.mother.firstName} {prescription.mother.lastName}
                        </CardTitle>
                        <Badge variant={prescription.mother.motherProfile.riskLevel === 'HIGH' || prescription.mother.motherProfile.riskLevel === 'CRITICAL' ? 'destructive' : 'secondary'}>
                          {prescription.mother.motherProfile.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Icons.Calendar className="w-4 h-4" />
                          <span>Prescribed: {formatDate(prescription.prescribedDate)}</span>
                        </div>
                        {prescription.validUntil && (
                          <div className="flex items-center gap-1">
                            <Icons.Clock className="w-4 h-4" />
                            <span className={isExpired(prescription.validUntil) ? 'text-red-600' : ''}>
                              Valid until: {formatDate(prescription.validUntil)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {prescription.validUntil && isExpired(prescription.validUntil) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Medications */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Icons.Activity className="w-4 h-4 text-[#2196F3]" />
                      Medications
                    </h4>
                    <div className="space-y-3">
                      {prescription.medications.map((med, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-[#2196F3]">{med.name}</h5>
                            <Badge variant="outline">{med.duration}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Dosage:</span> {med.dosage}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span> {med.frequency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icons.AlertCircle className="w-4 h-4 text-[#2196F3]" />
                      Instructions
                    </h4>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
                      {prescription.instructions}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => router.push(`/dashboard/doctor/patients/${prescription.mother.id}`)}
                      size="sm"
                      variant="outline"
                    >
                      <Icons.User className="w-4 h-4 mr-2" />
                      View Patient
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      size="sm"
                      variant="outline"
                    >
                      <Icons.Download className="w-4 h-4 mr-2" />
                      Print
                    </Button>
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
