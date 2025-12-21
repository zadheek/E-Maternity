'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PregnancyProfile {
  pregnancyWeek: number;
  expectedDeliveryDate: string;
  currentTrimester: number;
}

interface FetalGrowthRecord {
  id: string;
  week: number;
  weight: number;
  length: number;
  headCircumference: number;
  abdominalCircumference: number;
  notes: string;
  recordedAt: string;
}

interface UltrasoundRecord {
  id: string;
  week: number;
  type: string;
  findings: string;
  imageUrl?: string;
  performedBy: string;
  recordedAt: string;
}

export default function PregnancyTrackingPage() {
  const { user } = useAuth('MOTHER');
  const router = useRouter();
  const [profile, setProfile] = useState<PregnancyProfile | null>(null);
  const [fetalRecords, setFetalRecords] = useState<FetalGrowthRecord[]>([]);
  const [ultrasounds, setUltrasounds] = useState<UltrasoundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFetalDialog, setShowFetalDialog] = useState(false);
  const [showUltrasoundDialog, setShowUltrasoundDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newFetalRecord, setNewFetalRecord] = useState({
    week: 0,
    weight: 0,
    length: 0,
    headCircumference: 0,
    abdominalCircumference: 0,
    notes: '',
  });

  const [newUltrasound, setNewUltrasound] = useState({
    week: 0,
    type: '',
    findings: '',
    performedBy: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      console.log('Fetching profile...');
      const profileRes = await axios.get('/api/profile/mother/full');
      console.log('Profile fetched successfully');
      
      console.log('Fetching fetal growth records...');
      const fetalRes = await axios.get('/api/pregnancy/fetal-growth');
      console.log('Fetal records fetched successfully');
      
      console.log('Fetching ultrasound records...');
      const ultrasoundRes = await axios.get('/api/pregnancy/ultrasounds');
      console.log('Ultrasound records fetched successfully');

      setProfile({
        pregnancyWeek: profileRes.data.data.pregnancyWeek,
        expectedDeliveryDate: profileRes.data.data.expectedDeliveryDate,
        currentTrimester: getTrimester(profileRes.data.data.pregnancyWeek),
      });
      setFetalRecords(fetalRes.data.data || []);
      setUltrasounds(ultrasoundRes.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.error?.message || 'Failed to load pregnancy tracking data');
    } finally {
      setLoading(false);
    }
  };

  const saveFetalRecord = async () => {
    setSaving(true);
    try {
      await axios.post('/api/pregnancy/fetal-growth', newFetalRecord);
      toast.success('Fetal growth record added successfully');
      setShowFetalDialog(false);
      setNewFetalRecord({
        week: 0,
        weight: 0,
        length: 0,
        headCircumference: 0,
        abdominalCircumference: 0,
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to save record:', error);
      toast.error('Failed to save fetal growth record');
    } finally {
      setSaving(false);
    }
  };

  const saveUltrasound = async () => {
    setSaving(true);
    try {
      await axios.post('/api/pregnancy/ultrasounds', newUltrasound);
      toast.success('Ultrasound record added successfully');
      setShowUltrasoundDialog(false);
      setNewUltrasound({
        week: 0,
        type: '',
        findings: '',
        performedBy: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to save record:', error);
      toast.error('Failed to save ultrasound record');
    } finally {
      setSaving(false);
    }
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return 1;
    if (week <= 27) return 2;
    return 3;
  };

  const getTrimesterInfo = (trimester: number) => {
    switch (trimester) {
      case 1:
        return {
          name: 'First Trimester',
          weeks: '1-13',
          color: 'bg-blue-100 text-blue-800',
          description: 'Baby\'s major organs and systems are forming',
        };
      case 2:
        return {
          name: 'Second Trimester',
          weeks: '14-27',
          color: 'bg-green-100 text-green-800',
          description: 'Baby is growing rapidly, movement can be felt',
        };
      case 3:
        return {
          name: 'Third Trimester',
          weeks: '28-40',
          color: 'bg-purple-100 text-purple-800',
          description: 'Baby is gaining weight and preparing for birth',
        };
      default:
        return {
          name: 'Unknown',
          weeks: '',
          color: 'bg-gray-100 text-gray-800',
          description: '',
        };
    }
  };

  const getWeekMilestones = (week: number): string[] => {
    const milestones: { [key: number]: string[] } = {
      4: ['Heartbeat begins'],
      8: ['All major organs present', 'Baby is size of a raspberry'],
      12: ['Reflexes developing', 'Can make sucking motions'],
      16: ['Gender may be visible on ultrasound', 'Baby can hear sounds'],
      20: ['Halfway point!', 'Baby\'s movements felt regularly'],
      24: ['Baby practices breathing', 'Eyes begin to open'],
      28: ['Can recognize voices', 'Rapid brain development'],
      32: ['Baby gaining weight rapidly', 'Getting into head-down position'],
      36: ['Baby is full term', 'Preparing for delivery'],
      40: ['Due date - baby can arrive any time'],
    };
    return milestones[week] || [];
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

  const currentWeek = profile.pregnancyWeek;
  const currentTrimester = getTrimester(currentWeek);
  const trimesterInfo = getTrimesterInfo(currentTrimester);
  const pregnancyProgress = (currentWeek / 40) * 100;
  const daysUntilDelivery = Math.ceil(
    (new Date(profile.expectedDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

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
                <h1 className="text-2xl font-bold text-[#212121]">Pregnancy Tracking</h1>
                <p className="text-sm text-[#757575]">Monitor your pregnancy journey week by week</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                  <Icons.Baby className="w-6 h-6 text-[#2196F3]" />
                </div>
                <div>
                  <p className="text-sm text-[#757575]">Current Week</p>
                  <p className="text-2xl font-bold text-[#2196F3]">{currentWeek}</p>
                  <p className="text-xs text-[#757575]">of 40 weeks</p>
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
                  <p className="text-sm text-[#757575]">Days Until Delivery</p>
                  <p className="text-2xl font-bold text-[#00BCD4]">{daysUntilDelivery}</p>
                  <p className="text-xs text-[#757575]">
                    {new Date(profile.expectedDeliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#757575]">Current Trimester</p>
                  <Badge className={trimesterInfo.color}>{currentTrimester}</Badge>
                </div>
                <p className="font-semibold text-[#212121] mb-1">{trimesterInfo.name}</p>
                <p className="text-xs text-[#757575]">Weeks {trimesterInfo.weeks}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pregnancy Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pregnancy Timeline</CardTitle>
            <CardDescription>{trimesterInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#757575]">Week {currentWeek} of 40</span>
                  <span className="font-semibold text-[#2196F3]">{pregnancyProgress.toFixed(0)}% Complete</span>
                </div>
                <Progress value={pregnancyProgress} className="h-3" />
              </div>

              {/* Trimester Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[1, 2, 3].map((trimester) => {
                  const info = getTrimesterInfo(trimester);
                  const isPast = trimester < currentTrimester;
                  const isCurrent = trimester === currentTrimester;
                  
                  return (
                    <div
                      key={trimester}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrent
                          ? 'border-[#2196F3] bg-[#2196F3]/5'
                          : isPast
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isPast && <Icons.CheckCircle className="w-5 h-5 text-green-500" />}
                        {isCurrent && <Icons.Activity className="w-5 h-5 text-[#2196F3]" />}
                        {!isPast && !isCurrent && <Icons.Circle className="w-5 h-5 text-gray-400" />}
                        <span className="font-semibold">{info.name}</span>
                      </div>
                      <p className="text-sm text-[#757575]">Weeks {info.weeks}</p>
                    </div>
                  );
                })}
              </div>

              {/* Current Week Milestones */}
              {getWeekMilestones(currentWeek).length > 0 && (
                <div className="mt-6 p-4 bg-[#2196F3]/5 rounded-lg">
                  <h4 className="font-semibold text-[#2196F3] mb-2">Week {currentWeek} Milestones</h4>
                  <ul className="space-y-1">
                    {getWeekMilestones(currentWeek).map((milestone, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Icons.CheckCircle className="w-4 h-4 text-[#2196F3] mt-0.5 flex-shrink-0" />
                        <span>{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Records */}
        <Tabs defaultValue="fetal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fetal">Fetal Growth Records</TabsTrigger>
            <TabsTrigger value="ultrasound">Ultrasound & Scans</TabsTrigger>
          </TabsList>

          {/* Fetal Growth Records */}
          <TabsContent value="fetal">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fetal Growth Tracking</CardTitle>
                    <CardDescription>Monitor your baby's development measurements</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowFetalDialog(true)}
                    className="bg-[#2196F3] hover:bg-[#1976D2]"
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fetalRecords.length === 0 ? (
                  <div className="text-center py-12 text-[#757575]">
                    <Icons.Baby className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No fetal growth records yet</p>
                    <Button
                      onClick={() => setShowFetalDialog(true)}
                      variant="outline"
                    >
                      Add Your First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fetalRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[#212121]">Week {record.week}</h4>
                            <p className="text-sm text-[#757575]">
                              {new Date(record.recordedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge>Growth Record</Badge>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-[#757575]">Weight</p>
                            <p className="font-semibold">{record.weight}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#757575]">Length</p>
                            <p className="font-semibold">{record.length}cm</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#757575]">Head Circumference</p>
                            <p className="font-semibold">{record.headCircumference}cm</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#757575]">Abdominal Circumference</p>
                            <p className="font-semibold">{record.abdominalCircumference}cm</p>
                          </div>
                        </div>
                        {record.notes && (
                          <p className="mt-3 text-sm text-[#757575]">{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ultrasound Records */}
          <TabsContent value="ultrasound">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ultrasound & Scan Records</CardTitle>
                    <CardDescription>Keep track of all your ultrasound appointments</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowUltrasoundDialog(true)}
                    className="bg-[#00BCD4] hover:bg-[#0097A7]"
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ultrasounds.length === 0 ? (
                  <div className="text-center py-12 text-[#757575]">
                    <Icons.Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No ultrasound records yet</p>
                    <Button
                      onClick={() => setShowUltrasoundDialog(true)}
                      variant="outline"
                    >
                      Add Your First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ultrasounds.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[#212121]">{record.type}</h4>
                            <p className="text-sm text-[#757575]">
                              Week {record.week} • {new Date(record.recordedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-[#00BCD4] text-white">Ultrasound</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-[#757575]">Performed By</p>
                            <p className="text-sm font-medium">{record.performedBy}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#757575]">Findings</p>
                            <p className="text-sm">{record.findings}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Fetal Growth Dialog */}
      <Dialog open={showFetalDialog} onOpenChange={setShowFetalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Fetal Growth Record</DialogTitle>
            <DialogDescription>
              Record your baby's measurements from your latest checkup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fetal-week">Pregnancy Week</Label>
                <Input
                  id="fetal-week"
                  type="number"
                  min="1"
                  max="40"
                  value={newFetalRecord.week || ''}
                  onChange={(e) =>
                    setNewFetalRecord({ ...newFetalRecord, week: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fetal-weight">Weight (grams)</Label>
                <Input
                  id="fetal-weight"
                  type="number"
                  value={newFetalRecord.weight || ''}
                  onChange={(e) =>
                    setNewFetalRecord({ ...newFetalRecord, weight: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fetal-length">Length (cm)</Label>
                <Input
                  id="fetal-length"
                  type="number"
                  step="0.1"
                  value={newFetalRecord.length || ''}
                  onChange={(e) =>
                    setNewFetalRecord({ ...newFetalRecord, length: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="head-circumference">Head Circumference (cm)</Label>
                <Input
                  id="head-circumference"
                  type="number"
                  step="0.1"
                  value={newFetalRecord.headCircumference || ''}
                  onChange={(e) =>
                    setNewFetalRecord({
                      ...newFetalRecord,
                      headCircumference: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="abdominal-circumference">Abdominal Circumference (cm)</Label>
                <Input
                  id="abdominal-circumference"
                  type="number"
                  step="0.1"
                  value={newFetalRecord.abdominalCircumference || ''}
                  onChange={(e) =>
                    setNewFetalRecord({
                      ...newFetalRecord,
                      abdominalCircumference: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fetal-notes">Notes (Optional)</Label>
                <Textarea
                  id="fetal-notes"
                  rows={3}
                  value={newFetalRecord.notes}
                  onChange={(e) =>
                    setNewFetalRecord({ ...newFetalRecord, notes: e.target.value })
                  }
                  placeholder="Any additional observations or notes from the checkup"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFetalDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveFetalRecord}
              disabled={saving || !newFetalRecord.week}
              className="bg-[#2196F3] hover:bg-[#1976D2]"
            >
              {saving ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ultrasound Dialog */}
      <Dialog open={showUltrasoundDialog} onOpenChange={setShowUltrasoundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ultrasound Record</DialogTitle>
            <DialogDescription>
              Record details from your ultrasound or scan appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ultrasound-week">Pregnancy Week</Label>
              <Input
                id="ultrasound-week"
                type="number"
                min="1"
                max="40"
                value={newUltrasound.week || ''}
                onChange={(e) =>
                  setNewUltrasound({ ...newUltrasound, week: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ultrasound-type">Scan Type</Label>
              <Input
                id="ultrasound-type"
                placeholder="e.g., Dating Scan, Anomaly Scan, Growth Scan"
                value={newUltrasound.type}
                onChange={(e) => setNewUltrasound({ ...newUltrasound, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performed-by">Performed By</Label>
              <Input
                id="performed-by"
                placeholder="Doctor or technician name"
                value={newUltrasound.performedBy}
                onChange={(e) =>
                  setNewUltrasound({ ...newUltrasound, performedBy: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ultrasound-findings">Findings</Label>
              <Textarea
                id="ultrasound-findings"
                rows={4}
                value={newUltrasound.findings}
                onChange={(e) =>
                  setNewUltrasound({ ...newUltrasound, findings: e.target.value })
                }
                placeholder="Summary of findings from the ultrasound"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUltrasoundDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveUltrasound}
              disabled={saving || !newUltrasound.week || !newUltrasound.type}
              className="bg-[#00BCD4] hover:bg-[#0097A7]"
            >
              {saving ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

