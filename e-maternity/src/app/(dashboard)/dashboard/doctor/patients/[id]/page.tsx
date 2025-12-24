'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { HealthTrendChart } from '@/components/health/HealthTrendChart';
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm';
import axios from 'axios';
import { MetricType } from '@/types/prisma.types';

interface PatientData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  motherProfile: {
    dateOfBirth: string;
    age: number;
    pregnancyWeek: number;
    expectedDeliveryDate: string;
    riskLevel: string;
    bloodType: string;
    district: string;
    street: string;
    city: string;
    chronicConditions: string[];
    allergies: string[];
    currentMedications: string[];
    previousPregnancies: number;
    previousCesareans: number;
    previousMiscarriages: number;
  };
  healthMetrics: {
    id: string;
    type: MetricType;
    value: number;
    unit: string;
    recordedAt: string;
  }[];
  appointments: {
    id: string;
    scheduledDate: string;
    type: string;
    status: string;
    notes?: string;
  }[];
  prescriptions: {
    id: string;
    prescribedDate: string;
    medications: unknown;
    instructions: string;
  }[];
  emergencyContacts: {
    id: string;
    name: string;
    relationship: string;
    phoneNumber: string;
    isPrimary: boolean;
  }[];
}

export default function PatientDetailPage() {
  useAuth('DOCTOR');
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/doctor/patients/${patientId}`);
      setPatient(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[#E91E63]" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
        <Button onClick={() => router.back()}>
          <Icons.ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <Icons.ArrowLeft className="mr-1 h-4 w-4" />
            Back to Patients
          </Button>
          <h1 className="text-3xl font-bold">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-[#757575]">Patient ID: {patient.id.substring(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPrescriptionForm(true)}>
            <Icons.Pill className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
          <Button variant="outline">
            <Icons.Video className="mr-2 h-4 w-4" />
            Start Consultation
          </Button>
        </div>
      </div>

      {/* Patient Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Icons.Baby className="w-8 h-8 text-[#E91E63]" />
              <div>
                <p className="text-sm text-[#757575]">Pregnancy Week</p>
                <p className="text-2xl font-bold">{patient.motherProfile.pregnancyWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Icons.Calendar className="w-8 h-8 text-[#00BCD4]" />
              <div>
                <p className="text-sm text-[#757575]">Due Date</p>
                <p className="text-sm font-semibold">
                  {new Date(patient.motherProfile.expectedDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Icons.AlertCircle className="w-8 h-8 text-[#FF9800]" />
              <div>
                <p className="text-sm text-[#757575]">Risk Level</p>
                <Badge className={getRiskColor(patient.motherProfile.riskLevel)}>
                  {patient.motherProfile.riskLevel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Icons.Heart className="w-8 h-8 text-[#F44336]" />
              <div>
                <p className="text-sm text-[#757575]">Blood Type</p>
                <p className="text-lg font-bold">{patient.motherProfile.bloodType.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Metrics</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icons.Phone className="w-4 h-4 text-[#757575]" />
                  <span className="text-sm">{patient.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Mail className="w-4 h-4 text-[#757575]" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.MapPin className="w-4 h-4 text-[#757575]" />
                  <span className="text-sm">
                    {patient.motherProfile.street}, {patient.motherProfile.city}, {patient.motherProfile.district}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.User className="w-4 h-4 text-[#757575]" />
                  <span className="text-sm">Age: {patient.motherProfile.age} years</span>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
                  <div className="space-y-3">
                    {patient.emergencyContacts.map((contact: any) => (
                      <div key={contact.id} className="p-3 bg-[#FAFAFA] rounded-lg">
                        <p className="font-semibold text-sm">{contact.name}</p>
                        <p className="text-xs text-[#757575]">{contact.relationship}</p>
                        <p className="text-sm">{contact.phoneNumber}</p>
                        {contact.isPrimary && (
                          <Badge className="mt-1" variant="secondary">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#757575]">No emergency contacts added</p>
                )}
              </CardContent>
            </Card>

            {/* Pregnancy History */}
            <Card>
              <CardHeader>
                <CardTitle>Pregnancy History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{patient.motherProfile.previousPregnancies}</p>
                    <p className="text-xs text-[#757575]">Previous Pregnancies</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patient.motherProfile.previousCesareans}</p>
                    <p className="text-xs text-[#757575]">C-Sections</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patient.motherProfile.previousMiscarriages}</p>
                    <p className="text-xs text-[#757575]">Miscarriages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.motherProfile.currentMedications && patient.motherProfile.currentMedications.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {patient.motherProfile.currentMedications.map((med, index) => (
                      <li key={index} className="text-sm">{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#757575]">No current medications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Metrics Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.WEIGHT} 
              title="Weight Trend"
            />
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.BLOOD_PRESSURE_SYSTOLIC} 
              title="Blood Pressure (Systolic)"
            />
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.BLOOD_PRESSURE_DIASTOLIC} 
              title="Blood Pressure (Diastolic)"
            />
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.BLOOD_GLUCOSE} 
              title="Blood Glucose"
            />
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.HEMOGLOBIN} 
              title="Hemoglobin"
            />
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.FETAL_HEART_RATE} 
              title="Fetal Heart Rate"
            />
            <HealthTrendChart 
              metrics={patient.healthMetrics || []} 
              metricType={MetricType.FUNDAL_HEIGHT} 
              title="Fundal Height"
            />
          </div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chronic Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.motherProfile.chronicConditions && patient.motherProfile.chronicConditions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {patient.motherProfile.chronicConditions.map((condition, index) => (
                      <li key={index} className="text-sm">{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#757575]">No chronic conditions reported</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allergies</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.motherProfile.allergies && patient.motherProfile.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.motherProfile.allergies.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#757575]">No known allergies</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prescription History</CardTitle>
                <Button onClick={() => setShowPrescriptionForm(true)}>
                  <Icons.Plus className="mr-2 h-4 w-4" />
                  New Prescription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {patient.prescriptions.map((prescription: any) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </p>
                          {prescription.validUntil && (
                            <p className="text-xs text-[#757575]">
                              Valid until: {new Date(prescription.validUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge>
                          {prescription.validUntil && new Date(prescription.validUntil) < new Date() 
                            ? 'Expired' 
                            : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#757575] mb-2">{prescription.instructions}</p>
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {Array.isArray(prescription.medications) && prescription.medications.map((med: any, index: number) => (
                          <div key={index} className="bg-[#FAFAFA] p-2 rounded text-sm">
                            <p className="font-medium">{med.name} - {med.dosage}</p>
                            <p className="text-xs text-[#757575]">{med.frequency} | {med.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#757575] py-8">No prescriptions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.appointments && patient.appointments.length > 0 ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {patient.appointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{apt.type}</p>
                        <p className="text-sm text-[#757575]">
                          {new Date(apt.scheduledDate).toLocaleDateString()} at{' '}
                          {new Date(apt.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {apt.notes && <p className="text-xs text-[#757575] mt-1">{apt.notes}</p>}
                      </div>
                      <Badge>{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#757575] py-8">No appointments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prescription Form Dialog */}
      <PrescriptionForm 
        open={showPrescriptionForm}
        onOpenChange={setShowPrescriptionForm}
        motherId={patient.id}
        onSuccess={fetchPatientData}
      />
    </div>
  );
}
