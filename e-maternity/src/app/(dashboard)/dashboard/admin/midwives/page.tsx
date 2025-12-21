// Re-export the doctors page pattern for midwives
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface Midwife {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isVerified: boolean;
  profile?: {
    licenseNumber: string;
    assignedRegion: string;
  };
}

export default function AdminMidwivesPage() {
  const { user: _user } = useAuth('ADMIN');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [midwives, setMidwives] = useState<Midwife[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMidwife, setSelectedMidwife] = useState<Midwife | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    licenseNumber: '',
    assignedRegion: '',
  });

  useEffect(() => {
    fetchMidwives();
  }, []);

  const fetchMidwives = async () => {
    try {
      const response = await axios.get('/api/admin/midwives');
      setMidwives(response.data.data);
    } catch (error) {
      console.error('Failed to fetch midwives:', error);
      toast.error('Failed to load midwives');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/api/admin/midwives', formData);
      toast.success('Midwife created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchMidwives();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create midwife');
    }
  };

  const handleEdit = async () => {
    if (!selectedMidwife) return;

    try {
      await axios.patch(`/api/admin/midwives/${selectedMidwife.id}`, formData);
      toast.success('Midwife updated successfully');
      setIsEditDialogOpen(false);
      setSelectedMidwife(null);
      resetForm();
      fetchMidwives();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update midwife');
    }
  };

  const handleDelete = async (midwifeId: string) => {
    if (!confirm('Are you sure you want to delete this midwife?')) return;

    try {
      await axios.delete(`/api/admin/midwives/${midwifeId}`);
      toast.success('Midwife deleted successfully');
      fetchMidwives();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete midwife');
    }
  };

  const openEditDialog = (midwife: Midwife) => {
    setSelectedMidwife(midwife);
    setFormData({
      email: midwife.email,
      password: '',
      firstName: midwife.firstName,
      lastName: midwife.lastName,
      phoneNumber: midwife.phoneNumber,
      licenseNumber: midwife.profile?.licenseNumber || '',
      assignedRegion: midwife.profile?.assignedRegion || '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      licenseNumber: '',
      assignedRegion: '',
    });
  };

  const filteredMidwives = midwives.filter((midwife) =>
    `${midwife.firstName} ${midwife.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    midwife.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Activity className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <Icons.Activity className="w-4 h-4 mr-2 rotate-180" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-[#212121]">Midwife Management</h1>
              <p className="text-[#757575] mt-1">Manage midwife accounts and regions</p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#4CAF50] hover:bg-[#388E3C]"
            >
              <Icons.Heart className="w-4 h-4 mr-2" />
              Add Midwife
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Midwives ({midwives.length})</CardTitle>
                <CardDescription>View and manage midwife accounts</CardDescription>
              </div>
              <Input
                placeholder="Search midwives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredMidwives.length === 0 ? (
              <div className="text-center py-12">
                <Icons.User className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                <p className="text-[#757575]">No midwives found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMidwives.map((midwife) => (
                  <div
                    key={midwife.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                        <Icons.Heart className="w-6 h-6 text-[#4CAF50]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#212121]">
                          {midwife.firstName} {midwife.lastName}
                        </h3>
                        <p className="text-sm text-[#757575]">{midwife.email}</p>
                        {midwife.profile && (
                          <p className="text-sm text-[#757575]">
                            Region: {midwife.profile.assignedRegion}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(midwife)}
                      >
                        <Icons.Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(midwife.id)}
                      >
                        <Icons.Activity className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Midwife</DialogTitle>
            <DialogDescription>Add a new midwife account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Assigned Region</Label>
              <Input value={formData.assignedRegion} onChange={(e) => setFormData({ ...formData, assignedRegion: e.target.value })} placeholder="e.g., Colombo District" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-[#4CAF50] hover:bg-[#388E3C]">Create Midwife</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Midwife</DialogTitle>
            <DialogDescription>Update midwife information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>New Password (optional)</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Assigned Region</Label>
              <Input value={formData.assignedRegion} onChange={(e) => setFormData({ ...formData, assignedRegion: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} className="bg-[#4CAF50] hover:bg-[#388E3C]">Update Midwife</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

