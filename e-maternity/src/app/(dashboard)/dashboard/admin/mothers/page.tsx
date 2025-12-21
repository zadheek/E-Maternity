'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface Mother {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  pregnancyWeek: number;
  riskLevel: string;
  district: string;
  expectedDeliveryDate: string;
}

export default function AdminMothersPage() {
  const { user: _user } = useAuth('ADMIN');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMothers();
  }, []);

  const fetchMothers = async () => {
    try {
      const response = await axios.get('/api/admin/mothers');
      setMothers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch mothers:', error);
      toast.error('Failed to load mothers');
    } finally {
      setLoading(false);
    }
  };

  const filteredMothers = mothers.filter((mother) =>
    `${mother.firstName} ${mother.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mother.email.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-3xl font-bold text-[#212121]">Mother Management</h1>
              <p className="text-[#757575] mt-1">View and monitor registered mothers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Mothers ({mothers.length})</CardTitle>
                <CardDescription>View mother profiles and health status</CardDescription>
              </div>
              <Input
                placeholder="Search mothers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredMothers.length === 0 ? (
              <div className="text-center py-12">
                <Icons.User className="w-12 h-12 text-[#757575] mx-auto mb-4" />
                <p className="text-[#757575]">No mothers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMothers.map((mother) => (
                  <div
                    key={mother.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                        <Icons.User className="w-6 h-6 text-[#2196F3]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#212121]">
                          {mother.firstName} {mother.lastName}
                        </h3>
                        <p className="text-sm text-[#757575]">{mother.email} • {mother.phoneNumber}</p>
                        <p className="text-sm text-[#757575]">
                          Week {mother.pregnancyWeek} • {mother.district} • Due: {new Date(mother.expectedDeliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          mother.riskLevel === 'HIGH' || mother.riskLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : mother.riskLevel === 'MODERATE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {mother.riskLevel}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/admin/mothers/${mother.id}`)}
                      >
                        <Icons.Eye className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

