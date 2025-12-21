'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import axios from 'axios';
import { toast } from 'sonner';

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  pregnancyWeek: number;
  riskLevel: string;
  bloodType: string;
  expectedDeliveryDate: string;
  district: string;
  chronicConditions: string[];
  lastVisit?: string;
  nextAppointment?: string;
}

export default function DoctorPatientsPage() {
  const { user } = useAuth('DOCTOR');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/doctor/patients');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || patient.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return 'destructive';
      case 'MODERATE':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'outline';
    }
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
                <h1 className="text-3xl font-bold">All Patients</h1>
                <p className="text-white/90 text-sm">
                  Manage your assigned patients
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Total Patients</p>
              <p className="text-2xl font-bold">{patients.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilterRisk('ALL')}
                  variant={filterRisk === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  onClick={() => setFilterRisk('CRITICAL')}
                  variant={filterRisk === 'CRITICAL' ? 'default' : 'outline'}
                  size="sm"
                  className={filterRisk === 'CRITICAL' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Critical
                </Button>
                <Button
                  onClick={() => setFilterRisk('HIGH')}
                  variant={filterRisk === 'HIGH' ? 'default' : 'outline'}
                  size="sm"
                  className={filterRisk === 'HIGH' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  High Risk
                </Button>
                <Button
                  onClick={() => setFilterRisk('MODERATE')}
                  variant={filterRisk === 'MODERATE' ? 'default' : 'outline'}
                  size="sm"
                >
                  Moderate
                </Button>
                <Button
                  onClick={() => setFilterRisk('LOW')}
                  variant={filterRisk === 'LOW' ? 'default' : 'outline'}
                  size="sm"
                >
                  Low
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No patients found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2196F3] to-[#0288D1] flex items-center justify-center text-white font-bold">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                    <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                      {patient.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Age</p>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Blood Type</p>
                      <p className="font-medium">{patient.bloodType?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pregnancy</p>
                      <p className="font-medium">Week {patient.pregnancyWeek}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">District</p>
                      <p className="font-medium">{patient.district}</p>
                    </div>
                  </div>

                  {(patient.chronicConditions?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.chronicConditions?.map((condition, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Icons.Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{patient.phoneNumber}</span>
                  </div>

                  <Button
                    onClick={() => router.push(`/dashboard/doctor/patients/${patient.id}`)}
                    className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
                  >
                    <Icons.Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
