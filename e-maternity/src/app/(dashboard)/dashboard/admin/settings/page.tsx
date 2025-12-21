'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Bell,
  Database,
  Shield,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState('24');

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxFileSize, setMaxFileSize] = useState('10');

  // Risk Thresholds
  const [systolicThreshold, setSystolicThreshold] = useState('140');
  const [diastolicThreshold, setDiastolicThreshold] = useState('90');
  const [glucoseThreshold, setGlucoseThreshold] = useState('140');
  const [hemoglobinThreshold, setHemoglobinThreshold] = useState('11');

  // Backup Settings
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupRetention, setBackupRetention] = useState('30');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSaveNotifications = () => {
    setSaving(true);
    // Simulate saving
    setTimeout(() => {
      setSaving(false);
      toast.success('Notification settings saved successfully');
    }, 1000);
  };

  const handleSaveSystem = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System settings saved successfully');
    }, 1000);
  };

  const handleSaveRiskThresholds = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Risk thresholds saved successfully');
    }, 1000);
  };

  const handleSaveBackup = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Backup settings saved successfully');
    }, 1000);
  };

  const handleManualBackup = () => {
    toast.info('Starting manual backup...');
    setTimeout(() => {
      toast.success('Backup completed successfully');
    }, 2000);
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/dashboard/admin')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences and options</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how the system sends notifications to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Send notifications via SMS</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Send browser push notifications</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emergency Alerts</Label>
                  <p className="text-sm text-gray-600">
                    Enable immediate alerts for emergencies
                  </p>
                </div>
                <Switch checked={emergencyAlerts} onCheckedChange={setEmergencyAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-gray-600">
                    Send reminders for upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={appointmentReminders}
                  onCheckedChange={setAppointmentReminders}
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder Time (hours before appointment)</Label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>General system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">
                    Disable access for non-admin users
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Registration</Label>
                  <p className="text-sm text-gray-600">
                    Enable new user registration
                  </p>
                </div>
                <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-gray-600">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label>Max File Upload Size (MB)</Label>
                <Input
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSystem} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Risk Thresholds</CardTitle>
              <CardDescription>
                Configure health metric thresholds for risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Systolic BP Threshold (mmHg)</Label>
                  <Input
                    type="number"
                    value={systolicThreshold}
                    onChange={(e) => setSystolicThreshold(e.target.value)}
                    placeholder="140"
                  />
                  <p className="text-xs text-gray-600">Above this triggers high-risk alert</p>
                </div>

                <div className="space-y-2">
                  <Label>Diastolic BP Threshold (mmHg)</Label>
                  <Input
                    type="number"
                    value={diastolicThreshold}
                    onChange={(e) => setDiastolicThreshold(e.target.value)}
                    placeholder="90"
                  />
                  <p className="text-xs text-gray-600">Above this triggers high-risk alert</p>
                </div>

                <div className="space-y-2">
                  <Label>Blood Glucose Threshold (mg/dL)</Label>
                  <Input
                    type="number"
                    value={glucoseThreshold}
                    onChange={(e) => setGlucoseThreshold(e.target.value)}
                    placeholder="140"
                  />
                  <p className="text-xs text-gray-600">Above this triggers high-risk alert</p>
                </div>

                <div className="space-y-2">
                  <Label>Hemoglobin Threshold (g/dL)</Label>
                  <Input
                    type="number"
                    value={hemoglobinThreshold}
                    onChange={(e) => setHemoglobinThreshold(e.target.value)}
                    placeholder="11"
                  />
                  <p className="text-xs text-gray-600">Below this triggers high-risk alert</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveRiskThresholds} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Data Management</CardTitle>
              <CardDescription>
                Configure automatic backups and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-gray-600">Enable scheduled automatic backups</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Backup Retention (days)</Label>
                <Input
                  type="number"
                  value={backupRetention}
                  onChange={(e) => setBackupRetention(e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-gray-600">Number of days to keep old backups</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1">Manual Backup</h3>
                    <p className="text-sm text-gray-600">
                      Create an immediate backup of the database
                    </p>
                  </div>
                  <Button onClick={handleManualBackup} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBackup} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
