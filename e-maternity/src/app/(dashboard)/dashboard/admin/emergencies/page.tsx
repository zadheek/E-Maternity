'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Activity,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyAlert {
  id: string;
  type: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  responders: string[];
  createdAt: string;
  resolvedAt: string | null;
  mother: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    motherProfile: {
      district: string;
      pregnancyWeek: number;
      riskLevel: string;
      emergencyContacts: Array<{
        name: string;
        phoneNumber: string;
        relationship: string;
        isPrimary: boolean;
      }>;
    };
  };
}

export default function EmergenciesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyAlert | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchEmergencies();
    }
  }, [user, statusFilter, typeFilter]);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await axios.get(`/api/admin/emergencies?${params}`);
      if (response.data.success) {
        setEmergencies(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch emergencies:', error);
      toast.error('Failed to load emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await axios.patch(`/api/admin/emergencies/${id}`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success('Emergency status updated');
        fetchEmergencies();
        setShowDetailsDialog(false);
      }
    } catch (error) {
      console.error('Failed to update emergency:', error);
      toast.error('Failed to update emergency status');
    }
  };

  const handleViewDetails = (emergency: EmergencyAlert) => {
    setSelectedEmergency(emergency);
    setShowDetailsDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-500';
      case 'RESPONDED':
        return 'bg-yellow-500';
      case 'RESOLVED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SEVERE_BLEEDING':
        return 'text-red-600';
      case 'SEVERE_ABDOMINAL_PAIN':
        return 'text-orange-600';
      case 'HIGH_BLOOD_PRESSURE':
        return 'text-purple-600';
      case 'PREMATURE_LABOR':
        return 'text-pink-600';
      case 'REDUCED_FETAL_MOVEMENT':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeCount = emergencies.filter((e) => e.status === 'ACTIVE').length;
  const respondedCount = emergencies.filter((e) => e.status === 'RESPONDED').length;
  const resolvedCount = emergencies.filter((e) => e.status === 'RESOLVED').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emergency Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time emergency alert management</p>
          </div>
        </div>
        <Button onClick={fetchEmergencies} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeCount}</div>
            <p className="text-xs text-gray-600 mt-1">Requiring immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{respondedCount}</div>
            <p className="text-xs text-gray-600 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
            <p className="text-xs text-gray-600 mt-1">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="RESPONDED">Responded</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="SEVERE_BLEEDING">Severe Bleeding</SelectItem>
            <SelectItem value="SEVERE_ABDOMINAL_PAIN">Severe Abdominal Pain</SelectItem>
            <SelectItem value="HIGH_BLOOD_PRESSURE">High Blood Pressure</SelectItem>
            <SelectItem value="PREMATURE_LABOR">Premature Labor</SelectItem>
            <SelectItem value="REDUCED_FETAL_MOVEMENT">Reduced Fetal Movement</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Emergency List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : emergencies.length > 0 ? (
        <div className="space-y-4">
          {emergencies.map((emergency) => (
            <Card
              key={emergency.id}
              className={`${
                emergency.status === 'ACTIVE' ? 'border-red-300 bg-red-50' : ''
              } cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => handleViewDetails(emergency)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(emergency.status)}>
                        {emergency.status}
                      </Badge>
                      <span className={`font-semibold ${getTypeColor(emergency.type)}`}>
                        {emergency.type.replace(/_/g, ' ')}
                      </span>
                      <Badge className={getRiskColor(emergency.mother.motherProfile.riskLevel)}>
                        {emergency.mother.motherProfile.riskLevel} RISK
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {emergency.mother.firstName} {emergency.mother.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{emergency.mother.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{emergency.mother.motherProfile.district}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-2">{emergency.description}</p>

                    {emergency.address && (
                      <p className="text-sm text-gray-600">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {emergency.address}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(emergency.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {emergency.resolvedAt && (
                      <p className="text-xs text-green-600">
                        Resolved: {new Date(emergency.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-gray-600 text-lg font-medium">No Emergency Alerts</p>
            <p className="text-gray-500 text-sm mt-1">All clear at the moment</p>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Alert Details</DialogTitle>
            <DialogDescription>
              Complete information about this emergency situation
            </DialogDescription>
          </DialogHeader>

          {selectedEmergency && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={`${getStatusColor(selectedEmergency.status)} mt-1`}>
                    {selectedEmergency.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="font-medium mt-1">
                    {selectedEmergency.type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="mt-1">{selectedEmergency.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mother</p>
                  <p className="font-medium mt-1">
                    {selectedEmergency.mother.firstName} {selectedEmergency.mother.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedEmergency.mother.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pregnancy Details</p>
                  <p className="mt-1">Week {selectedEmergency.mother.motherProfile.pregnancyWeek}</p>
                  <Badge className={getRiskColor(selectedEmergency.mother.motherProfile.riskLevel)}>
                    {selectedEmergency.mother.motherProfile.riskLevel} RISK
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="mt-1">{selectedEmergency.mother.motherProfile.district}</p>
                {selectedEmergency.address && (
                  <p className="text-sm text-gray-600">{selectedEmergency.address}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  GPS: {selectedEmergency.latitude.toFixed(6)}, {selectedEmergency.longitude.toFixed(6)}
                </p>
              </div>

              {selectedEmergency.mother.motherProfile.emergencyContacts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Emergency Contacts</p>
                  <div className="space-y-2">
                    {selectedEmergency.mother.motherProfile.emergencyContacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.relationship}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{contact.phoneNumber}</p>
                          {contact.isPrimary && (
                            <Badge variant="outline" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created At</p>
                  <p className="font-medium">{new Date(selectedEmergency.createdAt).toLocaleString()}</p>
                </div>
                {selectedEmergency.resolvedAt && (
                  <div>
                    <p className="text-gray-600">Resolved At</p>
                    <p className="font-medium">{new Date(selectedEmergency.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedEmergency?.status === 'ACTIVE' && (
              <Button
                onClick={() => handleUpdateStatus(selectedEmergency.id, 'RESPONDED')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Mark as Responded
              </Button>
            )}
            {selectedEmergency?.status === 'RESPONDED' && (
              <Button
                onClick={() => handleUpdateStatus(selectedEmergency.id, 'RESOLVED')}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark as Resolved
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
