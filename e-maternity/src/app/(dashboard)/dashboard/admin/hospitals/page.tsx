'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Hospital {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  contactNumber: string;
  emergencyNumber: string;
  hasMaternityWard: boolean;
  availableBeds: number;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminHospitalsPage() {
  const { user: _user } = useAuth('ADMIN');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'government',
    latitude: '',
    longitude: '',
    address: '',
    city: '',
    district: '',
    contactNumber: '',
    emergencyNumber: '',
    hasMaternityWard: true,
    availableBeds: '0',
    facilities: [] as string[],
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('/api/admin/hospitals');
      setHospitals(response.data.data);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedHospital) {
        await axios.patch(`/api/admin/hospitals/${selectedHospital.id}`, formData);
        toast.success('Hospital updated successfully');
      } else {
        await axios.post('/api/admin/hospitals', formData);
        toast.success('Hospital created successfully');
      }
      setShowDialog(false);
      fetchHospitals();
      resetForm();
    } catch (error) {
      toast.error('Failed to save hospital');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;
    try {
      await axios.delete(`/api/admin/hospitals/${id}`);
      toast.success('Hospital deleted successfully');
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to delete hospital');
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      type: hospital.type,
      latitude: hospital.latitude.toString(),
      longitude: hospital.longitude.toString(),
      address: hospital.address,
      city: hospital.city,
      district: hospital.district,
      contactNumber: hospital.contactNumber,
      emergencyNumber: hospital.emergencyNumber,
      hasMaternityWard: hospital.hasMaternityWard,
      availableBeds: hospital.availableBeds.toString(),
      facilities: hospital.facilities,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setSelectedHospital(null);
    setFormData({
      name: '',
      type: 'government',
      latitude: '',
      longitude: '',
      address: '',
      city: '',
      district: '',
      contactNumber: '',
      emergencyNumber: '',
      hasMaternityWard: true,
      availableBeds: '0',
      facilities: [],
    });
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || hospital.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
                onClick={() => router.back()}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">Hospital Management</h1>
                <p className="text-white/90 text-sm">Manage healthcare facilities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search hospitals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  resetForm();
                  setShowDialog(true);
                }}
                className="bg-[#2196F3] hover:bg-[#1976D2]"
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hospitals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Icons.Hospital className="w-5 h-5 text-[#2196F3]" />
                      {hospital.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        hospital.type === 'government' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {hospital.type === 'government' ? 'Government' : 'Private'}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Icons.MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{hospital.address}, {hospital.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icons.Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{hospital.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icons.Ambulance className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">{hospital.emergencyNumber}</span>
                </div>
                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="text-sm">
                    {hospital.hasMaternityWard && (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Icons.CheckCircle className="w-4 h-4" />
                        Maternity Ward
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {hospital.availableBeds} beds
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(hospital)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Icons.Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(hospital.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icons.Hospital className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hospitals found</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHospital ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle>
            <DialogDescription>
              Fill in the hospital information below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyNumber">Emergency Number *</Label>
                <Input
                  id="emergencyNumber"
                  value={formData.emergencyNumber}
                  onChange={(e) => setFormData({ ...formData, emergencyNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableBeds">Available Beds</Label>
                <Input
                  id="availableBeds"
                  type="number"
                  value={formData.availableBeds}
                  onChange={(e) => setFormData({ ...formData, availableBeds: e.target.value })}
                />
              </div>
              <div className="space-y-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasMaternityWard"
                  checked={formData.hasMaternityWard}
                  onChange={(e) => setFormData({ ...formData, hasMaternityWard: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="hasMaternityWard" className="cursor-pointer">Has Maternity Ward</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#2196F3] hover:bg-[#1976D2]">
                {selectedHospital ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
