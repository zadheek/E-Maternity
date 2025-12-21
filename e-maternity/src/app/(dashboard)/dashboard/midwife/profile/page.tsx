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

interface MidwifeProfile {
  id: string;
  licenseNumber: string;
  assignedRegion: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
}

export default function MidwifeProfilePage() {
  const { user } = useAuth('MIDWIFE');
  const router = useRouter();
  const [profile, setProfile] = useState<MidwifeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    licenseNumber: '',
    assignedRegion: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/midwife/profile');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phoneNumber: data.user.phoneNumber,
        licenseNumber: data.licenseNumber,
        assignedRegion: data.assignedRegion,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('/api/midwife/profile', formData);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
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
        assignedRegion: profile.assignedRegion,
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
        <Button onClick={() => router.push('/dashboard/midwife')}>
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
            onClick={() => router.push('/dashboard/midwife')}
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
                  {profile.user.firstName} {profile.user.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge className="bg-[#00BCD4] text-white">
                    Midwife
                  </Badge>
                  <span className="text-sm text-gray-600">
                    License: {profile.licenseNumber}
                  </span>
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
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.user.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    required
                  />
                </div>

                {/* Assigned Region */}
                <div className="space-y-2">
                  <Label htmlFor="assignedRegion">Assigned Region</Label>
                  <Input
                    id="assignedRegion"
                    value={formData.assignedRegion}
                    onChange={(e) => setFormData({ ...formData, assignedRegion: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
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
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.user.firstName} {profile.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.user.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                  Professional Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.licenseNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assigned Region</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.assignedRegion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <Badge className="bg-[#00BCD4] text-white">
                      Midwife
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push('/dashboard/midwife/change-password')}>
            <Icons.Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

