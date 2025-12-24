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
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
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
      // Error handled silently
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

      toast.success(t('healthMetricsPage.metricAdded'));
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
            {t('common.back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#212121]">{t('healthMetricsPage.title')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add New Metric Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('healthMetricsPage.addMetric')}</CardTitle>
              <CardDescription>{t('healthMetricsPage.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t('healthMetricsPage.metricType')}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEIGHT">{t('healthMetrics.types.WEIGHT')}</SelectItem>
                      <SelectItem value="BLOOD_PRESSURE_SYSTOLIC">{t('healthMetrics.types.BLOOD_PRESSURE_SYSTOLIC')}</SelectItem>
                      <SelectItem value="BLOOD_PRESSURE_DIASTOLIC">{t('healthMetrics.types.BLOOD_PRESSURE_DIASTOLIC')}</SelectItem>
                      <SelectItem value="BLOOD_GLUCOSE">{t('healthMetrics.types.BLOOD_GLUCOSE')}</SelectItem>
                      <SelectItem value="HEMOGLOBIN">{t('healthMetrics.types.HEMOGLOBIN')}</SelectItem>
                      <SelectItem value="FETAL_HEART_RATE">{t('healthMetrics.types.FETAL_HEART_RATE')}</SelectItem>
                      <SelectItem value="FUNDAL_HEIGHT">{t('healthMetrics.types.FUNDAL_HEIGHT')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    {t('healthMetricsPage.value')} ({getMetricUnit(formData.type)})
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
                  <Label htmlFor="notes">{t('healthMetricsPage.notes')}</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('healthMetricsPage.notes')}
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
                      {t('healthMetricsPage.addingMetric')}
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle className="mr-2 h-4 w-4" />
                      {t('healthMetricsPage.addMetricBtn')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Metrics History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('healthMetricsPage.recentMetrics')}</CardTitle>
              <CardDescription>{t('healthMetricsPage.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Icons.Activity className="w-8 h-8 animate-spin mx-auto text-[#2196F3]" />
                </div>
              ) : metrics.length === 0 ? (
                <div className="text-center py-12 text-[#757575]">
                  <Icons.Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('healthMetrics.noMetrics')}</p>
                  <p className="text-sm mt-2">{t('healthMetricsPage.subtitle')}</p>
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

