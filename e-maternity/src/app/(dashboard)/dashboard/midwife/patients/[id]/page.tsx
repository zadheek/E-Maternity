'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HealthTrendChart } from '@/components/health/HealthTrendChart';
import { MetricType } from '@/types/prisma.types';

interface PatientProfile {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  dateOfBirth: string;
  nic: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  pregnancyStartDate: string;
  expectedDeliveryDate: string;
  pregnancyWeek: number;
  bloodType: string;
  riskLevel: string;
  previousPregnancies: number;
  previousCesareans: number;
  previousMiscarriages: number;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phoneNumber: string;
    isPrimary: boolean;
  }>;
}

interface HomeVisit {
  id: string;
  visitDate: string;
  visitType: string;
  status: string;
  notes?: string;
  observations?: Record<string, unknown>;
  createdAt: string;
}

interface ProgressNote {
  id: string;
  note: string;
  category: string;
  createdAt: string;
  midwife: {
    firstName: string;
    lastName: string;
  };
}

interface Referral {
  id: string;
  reason: string;
  priority: string;
  status: string;
  notes?: string;
  createdAt: string;
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

export default function MidwifePatientDetailPage() {
  useAuth('MIDWIFE');
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<Array<{ id: string; type: MetricType; value: number; unit: string; recordedAt: Date }>>([]);
  const [homeVisits, setHomeVisits] = useState<HomeVisit[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Dialog states
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);

  // Form states
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'ROUTINE',
    notes: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    fetalHeartRate: '',
    fundalHeight: '',
  });

  const [noteForm, setNoteForm] = useState({
    note: '',
    category: 'GENERAL',
  });

  const [referralForm, setReferralForm] = useState({
    reason: '',
    priority: 'ROUTINE',
    notes: '',
    doctorId: '',
  });

  const [doctors, setDoctors] = useState<Array<{ id: string; firstName: string; lastName: string; specialization: string }>>([]);

  useEffect(() => {
    fetchPatientData();
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const [profileRes, metricsRes, visitsRes, notesRes, referralsRes] = await Promise.all([
        axios.get(`/api/midwife/patients/${patientId}`),
        axios.get(`/api/health/metrics?motherId=${patientId}&limit=50`),
        axios.get(`/api/midwife/home-visits?patientId=${patientId}`),
        axios.get(`/api/midwife/progress-notes?patientId=${patientId}`),
        axios.get(`/api/midwife/referrals?patientId=${patientId}`),
      ]);

      setPatient(profileRes.data.data);
      setHealthMetrics(metricsRes.data.data);
      setHomeVisits(visitsRes.data.data);
      setProgressNotes(notesRes.data.data);
      setReferrals(referralsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const handleScheduleVisit = async () => {
    try {
      await axios.post('/api/midwife/home-visits', {
        patientId,
        ...visitForm,
      });
      toast.success('Home visit scheduled successfully');
      setVisitDialogOpen(false);
      setVisitForm({
        visitDate: new Date().toISOString().split('T')[0],
        visitType: 'ROUTINE',
        notes: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        weight: '',
        fetalHeartRate: '',
        fundalHeight: '',
      });
      fetchPatientData();
    } catch {
      toast.error('Failed to schedule visit');
    }
  };

  const handleAddNote = async () => {
    try {
      await axios.post('/api/midwife/progress-notes', {
        patientId,
        ...noteForm,
      });
      toast.success('Progress note added successfully');
      setNoteDialogOpen(false);
      setNoteForm({ note: '', category: 'GENERAL' });
      fetchPatientData();
    } catch {
      toast.error('Failed to add progress note');
    }
  };

  const handleCreateReferral = async () => {
    try {
      await axios.post('/api/midwife/referrals', {
        patientId,
        ...referralForm,
      });
      toast.success('Referral created successfully');
      setReferralDialogOpen(false);
      setReferralForm({ reason: '', priority: 'ROUTINE', notes: '', doctorId: '' });
      fetchPatientData();
    } catch {
      toast.error('Failed to create referral');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Activity className="w-8 h-8 animate-spin text-[#E91E63]" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.AlertCircle className="w-16 h-16 text-[#757575] mb-4" />
        <h2 className="text-2xl font-bold text-[#212121]">Patient Not Found</h2>
        <Button onClick={() => router.back()} className="mt-4">
          <Icons.ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const weeksRemaining = 40 - patient.pregnancyWeek;
  const expectedDate = new Date(patient.expectedDeliveryDate).toLocaleDateString();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#212121]">
                  {patient.user.firstName} {patient.user.lastName}
                </h1>
                <p className="text-[#757575] mt-1">
                  Week {patient.pregnancyWeek} • {age} years old • {patient.bloodType}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#E91E63] hover:bg-[#C2185B]">
                    <Icons.Calendar className="w-4 h-4 mr-2" />
                    Schedule Visit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule Home Visit</DialogTitle>
                    <DialogDescription>
                      Plan and record a home visit for {patient.user.firstName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="visitDate">Visit Date</Label>
                        <Input
                          id="visitDate"
                          type="date"
                          value={visitForm.visitDate}
                          onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="visitType">Visit Type</Label>
                        <Select value={visitForm.visitType} onValueChange={(value) => setVisitForm({ ...visitForm, visitType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ROUTINE">Routine Checkup</SelectItem>
                            <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            <SelectItem value="EDUCATION">Health Education</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Blood Pressure (mmHg)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Systolic"
                            value={visitForm.bloodPressureSystolic}
                            onChange={(e) => setVisitForm({ ...visitForm, bloodPressureSystolic: e.target.value })}
                          />
                          <span className="self-center">/</span>
                          <Input
                            placeholder="Diastolic"
                            value={visitForm.bloodPressureDiastolic}
                            onChange={(e) => setVisitForm({ ...visitForm, bloodPressureDiastolic: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={visitForm.weight}
                          onChange={(e) => setVisitForm({ ...visitForm, weight: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fetalHeartRate">Fetal Heart Rate (bpm)</Label>
                        <Input
                          id="fetalHeartRate"
                          type="number"
                          value={visitForm.fetalHeartRate}
                          onChange={(e) => setVisitForm({ ...visitForm, fetalHeartRate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fundalHeight">Fundal Height (cm)</Label>
                        <Input
                          id="fundalHeight"
                          type="number"
                          step="0.1"
                          value={visitForm.fundalHeight}
                          onChange={(e) => setVisitForm({ ...visitForm, fundalHeight: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visitNotes">Visit Notes</Label>
                      <Textarea
                        id="visitNotes"
                        placeholder="Record observations, concerns, and recommendations..."
                        value={visitForm.notes}
                        onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setVisitDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleVisit} className="bg-[#E91E63] hover:bg-[#C2185B]">
                      Schedule Visit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Icons.UserPlus className="w-4 h-4 mr-2" />
                    Refer to Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Doctor Referral</DialogTitle>
                    <DialogDescription>
                      Refer {patient.user.firstName} to a doctor for specialized care
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Select Doctor</Label>
                      <Select value={referralForm.doctorId} onValueChange={(value) => setReferralForm({ ...referralForm, doctorId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                                Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={referralForm.priority} onValueChange={(value) => setReferralForm({ ...referralForm, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ROUTINE">Routine</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                          <SelectItem value="EMERGENCY">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Referral</Label>
                      <Textarea
                        id="reason"
                        placeholder="Describe the reason for referral..."
                        value={referralForm.reason}
                        onChange={(e) => setReferralForm({ ...referralForm, reason: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referralNotes">Additional Notes</Label>
                      <Textarea
                        id="referralNotes"
                        placeholder="Any additional information..."
                        value={referralForm.notes}
                        onChange={(e) => setReferralForm({ ...referralForm, notes: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReferralDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateReferral} className="bg-[#E91E63] hover:bg-[#C2185B]">
                      Create Referral
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E91E63]/10 flex items-center justify-center">
                  <Icons.Baby className="w-6 h-6 text-[#E91E63]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Pregnancy Week</p>
                  <p className="text-2xl font-bold text-[#212121]">{patient.pregnancyWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                  <Icons.Calendar className="w-6 h-6 text-[#00BCD4]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Weeks Remaining</p>
                  <p className="text-2xl font-bold text-[#212121]">{weeksRemaining}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
                    ? 'bg-red-100'
                    : 'bg-green-100'
                }`}>
                  <Icons.Heart className={`w-6 h-6 ${
                    patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Risk Level</p>
                  <Badge variant={
                    patient.riskLevel === 'CRITICAL' ? 'destructive' :
                    patient.riskLevel === 'HIGH' ? 'destructive' :
                    patient.riskLevel === 'MODERATE' ? 'secondary' : 'default'
                  }>
                    {patient.riskLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF9800]/10 flex items-center justify-center">
                  <Icons.Clock className="w-6 h-6 text-[#FF9800]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Expected Date</p>
                  <p className="text-sm font-bold text-[#212121]">{expectedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health Metrics</TabsTrigger>
            <TabsTrigger value="visits">Home Visits</TabsTrigger>
            <TabsTrigger value="notes">Progress Notes</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-[#757575]">Full Name</p>
                    <p className="font-medium">{patient.user.firstName} {patient.user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Age</p>
                    <p className="font-medium">{age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">NIC</p>
                    <p className="font-medium">{patient.nic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Blood Type</p>
                    <p className="font-medium">{patient.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Phone</p>
                    <p className="font-medium">{patient.user.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Address</p>
                    <p className="font-medium">
                      {patient.street}, {patient.city}<br />
                      {patient.district} - {patient.postalCode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pregnancy Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Pregnancy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-[#757575]">Current Week</p>
                    <p className="font-medium">Week {patient.pregnancyWeek} of 40</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Expected Delivery</p>
                    <p className="font-medium">{expectedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Previous Pregnancies</p>
                    <p className="font-medium">{patient.previousPregnancies}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Previous Cesareans</p>
                    <p className="font-medium">{patient.previousCesareans}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575]">Previous Miscarriages</p>
                    <p className="font-medium">{patient.previousMiscarriages}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-[#757575] mb-2">Chronic Conditions</p>
                    {patient.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.chronicConditions.map((condition, index) => (
                          <Badge key={index} variant="outline">{condition}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#757575]">None</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#757575] mb-2">Allergies</p>
                    {patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive">{allergy}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#757575]">None</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#757575] mb-2">Current Medications</p>
                    {patient.currentMedications.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.currentMedications.map((med, index) => (
                          <Badge key={index} variant="secondary">{med}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#757575]">None</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.emergencyContacts.map((contact, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{contact.name}</p>
                        {contact.isPrimary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#757575]">{contact.relationship}</p>
                      <p className="text-sm font-medium text-[#E91E63] mt-1">{contact.phoneNumber}</p>
                    </div>
                  ))}
                  {patient.emergencyContacts.length === 0 && (
                    <p className="text-sm text-[#757575]">No emergency contacts added</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Health Metrics Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
                <CardDescription>Track vital signs over time</CardDescription>
              </CardHeader>
              <CardContent>
                {healthMetrics.length > 0 ? (
                  <div className="space-y-8">
                    <HealthTrendChart
                      metrics={healthMetrics.filter(m => m.type === 'WEIGHT')}
                      metricType={MetricType.WEIGHT}
                      title="Weight Progress"
                    />
                    <HealthTrendChart
                      metrics={healthMetrics.filter(m => m.type === 'BLOOD_PRESSURE_SYSTOLIC')}
                      metricType={MetricType.BLOOD_PRESSURE_SYSTOLIC}
                      title="Blood Pressure Systolic"
                    />
                    <HealthTrendChart
                      metrics={healthMetrics.filter(m => m.type === 'FETAL_HEART_RATE')}
                      metricType={MetricType.FETAL_HEART_RATE}
                      title="Fetal Heart Rate"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icons.Activity className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                    <p className="text-[#757575]">No health metrics recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Home Visits Tab */}
          <TabsContent value="visits" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Home Visit History</h3>
                <p className="text-sm text-[#757575]">Record and track home visits</p>
              </div>
              <Button onClick={() => setNoteDialogOpen(true)} variant="outline">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>

            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Progress Note</DialogTitle>
                  <DialogDescription>
                    Document observations and recommendations
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={noteForm.category} onValueChange={(value) => setNoteForm({ ...noteForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="CONCERN">Concern</SelectItem>
                        <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                        <SelectItem value="EDUCATION">Health Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                      id="note"
                      placeholder="Enter your observations..."
                      value={noteForm.note}
                      onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote} className="bg-[#E91E63] hover:bg-[#C2185B]">
                    Add Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {homeVisits.length > 0 ? (
              <div className="space-y-4">
                {homeVisits.map((visit) => (
                  <Card key={visit.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                            <Icons.Home className="w-5 h-5 text-[#00BCD4]" />
                          </div>
                          <div>
                            <p className="font-semibold">{visit.visitType}</p>
                            <p className="text-sm text-[#757575]">
                              {new Date(visit.visitDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          visit.status === 'COMPLETED' ? 'default' :
                          visit.status === 'SCHEDULED' ? 'secondary' : 'outline'
                        }>
                          {visit.status}
                        </Badge>
                      </div>
                      {visit.notes && (
                        <p className="text-sm text-[#757575] mt-2">{visit.notes}</p>
                      )}
                      {visit.observations && typeof visit.observations === 'object' && (
                        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
                          {(() => {
                            const obs = visit.observations as Record<string, unknown>;
                            return (
                              <>
                                {'bloodPressure' in obs && obs.bloodPressure && (
                                  <div>
                                    <p className="text-sm text-[#757575]">Blood Pressure</p>
                                    <p className="font-medium">{String(obs.bloodPressure)}</p>
                                  </div>
                                )}
                                {'weight' in obs && obs.weight && (
                                  <div>
                                    <p className="text-sm text-[#757575]">Weight</p>
                                    <p className="font-medium">{String(obs.weight)} kg</p>
                                  </div>
                                )}
                                {'fetalHeartRate' in obs && obs.fetalHeartRate && (
                                  <div>
                                    <p className="text-sm text-[#757575]">Fetal Heart Rate</p>
                                    <p className="font-medium">{String(obs.fetalHeartRate)} bpm</p>
                                  </div>
                                )}
                                {'fundalHeight' in obs && obs.fundalHeight && (
                                  <div>
                                    <p className="text-sm text-[#757575]">Fundal Height</p>
                                    <p className="font-medium">{String(obs.fundalHeight)} cm</p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icons.Calendar className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                  <p className="text-[#757575]">No home visits recorded yet</p>
                  <Button
                    onClick={() => setVisitDialogOpen(true)}
                    className="mt-4 bg-[#E91E63] hover:bg-[#C2185B]"
                  >
                    Schedule First Visit
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {progressNotes.length > 0 ? (
              <div className="space-y-4">
                {progressNotes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{note.category}</Badge>
                        <p className="text-sm text-[#757575]">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm mt-2">{note.note}</p>
                      <p className="text-sm text-[#757575] mt-4">
                        — {note.midwife.firstName} {note.midwife.lastName}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icons.FileText className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                  <p className="text-[#757575]">No progress notes yet</p>
                  <Button
                    onClick={() => setNoteDialogOpen(true)}
                    className="mt-4 bg-[#E91E63] hover:bg-[#C2185B]"
                  >
                    Add First Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <Card key={referral.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              referral.priority === 'EMERGENCY' ? 'destructive' :
                              referral.priority === 'URGENT' ? 'secondary' : 'outline'
                            }>
                              {referral.priority}
                            </Badge>
                            <Badge variant="outline">{referral.status}</Badge>
                          </div>
                          {referral.doctor && (
                            <p className="font-semibold">
                              Dr. {referral.doctor.firstName} {referral.doctor.lastName}
                            </p>
                          )}
                          <p className="text-sm text-[#757575]">
                            {referral.doctor?.specialization}
                          </p>
                        </div>
                        <p className="text-sm text-[#757575]">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-[#757575]">Reason</p>
                          <p className="text-sm">{referral.reason}</p>
                        </div>
                        {referral.notes && (
                          <div>
                            <p className="text-sm font-medium text-[#757575]">Notes</p>
                            <p className="text-sm">{referral.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icons.UserPlus className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                  <p className="text-[#757575]">No referrals created yet</p>
                  <Button
                    onClick={() => setReferralDialogOpen(true)}
                    className="mt-4 bg-[#E91E63] hover:bg-[#C2185B]"
                  >
                    Create Referral
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
