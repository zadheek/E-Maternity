'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DoctorProfile {
  id: string;
  licenseNumber: string;
  specialization: string;
  hospital: string;
  experienceYears: number;
  consultationFee: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
}

export default function DoctorProfilePage() {
  const { user } = useAuth('DOCTOR');
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    licenseNumber: '',
    specialization: '',
    hospital: '',
    experienceYears: 0,
    consultationFee: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/doctor/profile');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phoneNumber: data.user.phoneNumber,
        licenseNumber: data.licenseNumber,
        specialization: data.specialization,
        hospital: data.hospital,
        experienceYears: data.experienceYears,
        consultationFee: data.consultationFee,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('/api/doctor/profile', formData);
      toast.success('Profile updated successfully');
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        phoneNumber: profile.user.phoneNumber,
        licenseNumber: profile.licenseNumber,
        specialization: profile.specialization,
        hospital: profile.hospital,
        experienceYears: profile.experienceYears,
        consultationFee: profile.consultationFee,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <Button onClick={() => router.push('/dashboard/doctor')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/doctor')}
          >
            <Icons.ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <Icons.LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2196F3] to-[#0288D1] flex items-center justify-center text-white text-2xl font-bold">
                {profile.user.firstName[0]}{profile.user.lastName[0]}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Dr. {profile.user.firstName} {profile.user.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Doctor</Badge>
                  <span>{profile.specialization}</span>
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Icons.Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.user.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input
                    id="hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Years of Experience</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                    disabled={!isEditing}
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (LKR)</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) })}
                    disabled={!isEditing}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#2196F3] hover:bg-[#1976D2]"
                >
                  {saving ? (
                    <>
                      <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push('/dashboard/doctor/change-password')}>
            <Icons.Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
