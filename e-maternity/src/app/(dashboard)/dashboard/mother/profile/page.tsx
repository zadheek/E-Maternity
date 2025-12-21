'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface MotherProfileData {
  // User details
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  
  // Personal info
  dateOfBirth: string;
  nic: string;
  
  // Address
  street: string;
  city: string;
  district: string;
  postalCode: string;
  
  // Pregnancy info
  pregnancyStartDate?: string;
  expectedDeliveryDate: string;
  pregnancyWeek: number;
  bloodType: string;
  riskLevel: string;
  
  // Medical history
  previousPregnancies: number;
  previousCesareans: number;
  previousMiscarriages: number;
  previousSurgeries: string[];
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  familyHistory: string[];
  
  // Emergency contacts
  emergencyContacts: Array<{
    id: string;
    name: string;
    relationship: string;
    phoneNumber: string;
    isPrimary: boolean;
  }>;
}

export default function ProfilePage() {
  const { user } = useAuth('MOTHER');
  const router = useRouter();
  const [profile, setProfile] = useState<MotherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile/mother/full');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await axios.patch('/api/profile/mother', profile);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: keyof MotherProfileData, value: string) => {
    if (!profile) return;
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    setProfile({ ...profile, [field]: values });
  };

  const addEmergencyContact = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      emergencyContacts: [
        ...profile.emergencyContacts,
        {
          id: `temp-${Date.now()}`,
          name: '',
          relationship: '',
          phoneNumber: '',
          isPrimary: false
        }
      ]
    });
  };

  const removeEmergencyContact = (index: number) => {
    if (!profile) return;
    const updated = [...profile.emergencyContacts];
    updated.splice(index, 1);
    setProfile({ ...profile, emergencyContacts: updated });
  };

  const updateEmergencyContact = (index: number, field: string, value: any) => {
    if (!profile) return;
    const updated = [...profile.emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, emergencyContacts: updated });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[#2196F3]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/mother')}
              >
                <Icons.ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#212121]">My Profile</h1>
                <p className="text-sm text-[#757575]">Manage your personal information</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
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
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#2196F3] hover:bg-[#1976D2]"
                  >
                    <Icons.Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    variant="outline"
                  >
                    <Icons.LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#2196F3]/10 flex items-center justify-center mx-auto mb-4">
                    <Icons.User className="w-12 h-12 text-[#2196F3]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#212121]">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-sm text-[#757575]">{profile.email}</p>
                  <p className="text-sm text-[#757575] mt-1">
                    Age: {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} years
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Pregnancy Week</p>
                    <p className="text-lg font-bold text-[#2196F3]">{profile.pregnancyWeek} weeks</p>
                  </div>
                  {profile.pregnancyStartDate && (
                    <div>
                      <p className="text-xs text-[#757575] mb-1">Pregnancy Started</p>
                      <p className="font-medium">
                        {new Date(profile.pregnancyStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Expected Delivery</p>
                    <p className="font-medium">
                      {new Date(profile.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Risk Level</p>
                    <Badge className={
                      profile.riskLevel === 'HIGH' || profile.riskLevel === 'CRITICAL' 
                        ? 'bg-red-100 text-red-800'
                        : profile.riskLevel === 'MODERATE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }>
                      {profile.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Blood Type</p>
                    <p className="font-medium">{profile.bloodType.replace('_', '')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth?.split('T')[0]}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nic">NIC Number</Label>
                    <Input
                      id="nic"
                      value={profile.nic}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pregnancy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pregnancy Information</CardTitle>
                <CardDescription>Details about your current pregnancy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pregnancyStartDate">Pregnancy Start Date</Label>
                    <Input
                      id="pregnancyStartDate"
                      type="date"
                      value={profile.pregnancyStartDate?.split('T')[0] || ''}
                      onChange={(e) => setProfile({ ...profile, pregnancyStartDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                    <Input
                      id="expectedDeliveryDate"
                      type="date"
                      value={profile.expectedDeliveryDate?.split('T')[0]}
                      onChange={(e) => setProfile({ ...profile, expectedDeliveryDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pregnancyWeek">Current Week</Label>
                    <Input
                      id="pregnancyWeek"
                      type="number"
                      value={profile.pregnancyWeek}
                      onChange={(e) => setProfile({ ...profile, pregnancyWeek: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={profile.bloodType}
                      onValueChange={(value) => setProfile({ ...profile, bloodType: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A_POSITIVE">A+</SelectItem>
                        <SelectItem value="A_NEGATIVE">A-</SelectItem>
                        <SelectItem value="B_POSITIVE">B+</SelectItem>
                        <SelectItem value="B_NEGATIVE">B-</SelectItem>
                        <SelectItem value="O_POSITIVE">O+</SelectItem>
                        <SelectItem value="O_NEGATIVE">O-</SelectItem>
                        <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                        <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
                <CardDescription>Your residential address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profile.street}
                    onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={profile.district}
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profile.postalCode}
                      onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
                <CardDescription>Previous pregnancies and health conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="previousPregnancies">Previous Pregnancies</Label>
                    <Input
                      id="previousPregnancies"
                      type="number"
                      value={profile.previousPregnancies}
                      onChange={(e) => setProfile({ ...profile, previousPregnancies: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousCesareans">Previous Cesareans</Label>
                    <Input
                      id="previousCesareans"
                      type="number"
                      value={profile.previousCesareans}
                      onChange={(e) => setProfile({ ...profile, previousCesareans: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousMiscarriages">Previous Miscarriages</Label>
                    <Input
                      id="previousMiscarriages"
                      type="number"
                      value={profile.previousMiscarriages}
                      onChange={(e) => setProfile({ ...profile, previousMiscarriages: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="previousSurgeries">Previous Surgeries (comma separated)</Label>
                  <Textarea
                    id="previousSurgeries"
                    value={profile.previousSurgeries?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('previousSurgeries', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                    placeholder="e.g., Appendectomy (2015), C-section (2020)"
                  />
                </div>
                <div>
                  <Label htmlFor="chronicConditions">Chronic Conditions (comma separated)</Label>
                  <Textarea
                    id="chronicConditions"
                    value={profile.chronicConditions.join(', ')}
                    onChange={(e) => handleArrayChange('chronicConditions', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Textarea
                    id="allergies"
                    value={profile.allergies.join(', ')}
                    onChange={(e) => handleArrayChange('allergies', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="currentMedications">Current Medications (comma separated)</Label>
                  <Textarea
                    id="currentMedications"
                    value={profile.currentMedications.join(', ')}
                    onChange={(e) => handleArrayChange('currentMedications', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="familyHistory">Family History (comma separated)</Label>
                  <Textarea
                    id="familyHistory"
                    value={profile.familyHistory.join(', ')}
                    onChange={(e) => handleArrayChange('familyHistory', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Emergency Contacts</CardTitle>
                    <CardDescription>People to contact in case of emergency</CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={addEmergencyContact}
                      className="bg-[#00BCD4] hover:bg-[#0097A7]"
                    >
                      <Icons.Plus className="w-4 h-4 mr-1" />
                      Add Contact
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.emergencyContacts.map((contact, index) => (
                  <div key={contact.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icons.Phone className="w-4 h-4 text-[#757575]" />
                        <span className="font-medium">Contact {index + 1}</span>
                        {contact.isPrimary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeEmergencyContact(index)}
                        >
                          <Icons.Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={contact.phoneNumber}
                          onChange={(e) => updateEmergencyContact(index, 'phoneNumber', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={contact.isPrimary}
                            onChange={(e) => updateEmergencyContact(index, 'isPrimary', e.target.checked)}
                            disabled={!isEditing}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Primary Contact</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                {profile.emergencyContacts.length === 0 && (
                  <p className="text-center text-[#757575] py-8">No emergency contacts added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

