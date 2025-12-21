'use client';

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

interface AllPatientsSectionProps {
  initialFilter?: string;
}

export default function AllPatientsSection({ initialFilter = 'ALL' }: AllPatientsSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>(initialFilter);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    setFilterRisk(initialFilter);
  }, [initialFilter]);

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
    let matchesRisk = false;
    if (filterRisk === 'ALL') {
      matchesRisk = true;
    } else if (filterRisk === 'HIGH_RISK') {
      matchesRisk = patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL';
    } else {
      matchesRisk = patient.riskLevel === filterRisk;
    }
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
          <h2 className="text-2xl font-bold text-gray-900">All Patients</h2>
          <p className="text-gray-600">Manage and monitor your patients</p>
        </div>
        <Button className="bg-[#2196F3] hover:bg-[#1976D2]">
          <Icons.Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {filterRisk !== 'HIGH_RISK' && (
              <div className="flex gap-2">
                <Button
                  variant={filterRisk === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('ALL')}
                  className={filterRisk === 'ALL' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : ''}
                >
                  All
                </Button>
                <Button
                  variant={filterRisk === 'CRITICAL' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('CRITICAL')}
                  className={filterRisk === 'CRITICAL' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Critical
                </Button>
                <Button
                  variant={filterRisk === 'HIGH' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('HIGH')}
                  className={filterRisk === 'HIGH' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  High
                </Button>
                <Button
                  variant={filterRisk === 'MODERATE' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('MODERATE')}
                  className={filterRisk === 'MODERATE' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                  Moderate
                </Button>
                <Button
                  variant={filterRisk === 'LOW' ? 'default' : 'outline'}
                  onClick={() => setFilterRisk('LOW')}
                  className={filterRisk === 'LOW' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Low
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Icons.Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No patients found</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                      <Icons.User className="w-6 h-6 text-[#2196F3]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <p className="text-sm text-gray-600">{patient.age} years</p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                    {patient.riskLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Blood Type</p>
                    <p className="font-medium">{patient.bloodType?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Week</p>
                    <p className="font-medium">{patient.pregnancyWeek}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">District</p>
                    <p className="font-medium">{patient.district}</p>
                  </div>
                </div>

                {(patient.chronicConditions?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.chronicConditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#2196F3] hover:bg-[#1976D2]"
                    onClick={() => router.push(`/dashboard/doctor/patients/${patient.id}`)}
                  >
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Icons.MessageSquare className="w-4 h-4 mr-1" />
                    Chat
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
              Showing {filteredPatients.length} of {patients.length} patients
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
