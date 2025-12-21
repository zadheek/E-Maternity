'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export default function HealthMetricsPage() {
  const { user } = useAuth('MOTHER');
  const router = useRouter();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'WEIGHT',
    value: '',
    notes: '',
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/health/metrics');
      setMetrics(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/health/metrics', {
        type: formData.type,
        value: parseFloat(formData.value),
        unit: getMetricUnit(formData.type),
        notes: formData.notes || undefined,
      });

      toast.success('Health metric recorded successfully!');
      setFormData({ type: 'WEIGHT', value: '', notes: '' });
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to record metric');
    } finally {
      setSubmitting(false);
    }
  };

  const getMetricUnit = (type: string) => {
    switch (type) {
      case 'WEIGHT': return 'kg';
      case 'BLOOD_PRESSURE_SYSTOLIC':
      case 'BLOOD_PRESSURE_DIASTOLIC': return 'mmHg';
      case 'BLOOD_GLUCOSE': return 'mg/dL';
      case 'HEMOGLOBIN': return 'g/dL';
      case 'FETAL_HEART_RATE': return 'bpm';
      case 'FUNDAL_HEIGHT': return 'cm';
      default: return '';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'WEIGHT': return Icons.Activity;
      case 'BLOOD_PRESSURE_SYSTOLIC':
      case 'BLOOD_PRESSURE_DIASTOLIC': return Icons.Heart;
      default: return Icons.Activity;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/mother')}>
            <Icons.ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#212121]">Health Metrics</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add New Metric Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Record New Metric</CardTitle>
              <CardDescription>Track your daily health measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Metric Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEIGHT">Weight</SelectItem>
                      <SelectItem value="BLOOD_PRESSURE_SYSTOLIC">Blood Pressure (Systolic)</SelectItem>
                      <SelectItem value="BLOOD_PRESSURE_DIASTOLIC">Blood Pressure (Diastolic)</SelectItem>
                      <SelectItem value="BLOOD_GLUCOSE">Blood Glucose</SelectItem>
                      <SelectItem value="HEMOGLOBIN">Hemoglobin</SelectItem>
                      <SelectItem value="FETAL_HEART_RATE">Fetal Heart Rate</SelectItem>
                      <SelectItem value="FUNDAL_HEIGHT">Fundal Height</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    Value ({getMetricUnit(formData.type)})
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    placeholder="Enter value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Icons.Activity className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle className="mr-2 h-4 w-4" />
                      Record Metric
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Metrics History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Measurements</CardTitle>
              <CardDescription>Your health tracking history</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Icons.Activity className="w-8 h-8 animate-spin mx-auto text-[#2196F3]" />
                </div>
              ) : metrics.length === 0 ? (
                <div className="text-center py-12 text-[#757575]">
                  <Icons.Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No health metrics recorded yet</p>
                  <p className="text-sm mt-2">Start tracking your health by adding your first metric</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.map((metric) => {
                    const IconComponent = getMetricIcon(metric.type);
                    return (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2196F3]/10 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-[#2196F3]" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {metric.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <p className="text-sm text-[#757575]">
                              {new Date(metric.recordedAt).toLocaleString()}
                            </p>
                            {metric.notes && (
                              <p className="text-sm text-[#757575] mt-1">{metric.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#2196F3]">
                            {metric.value}
                          </p>
                          <p className="text-sm text-[#757575]">{metric.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

