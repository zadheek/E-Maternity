'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { MetricType } from '@/types/prisma.types';

interface HealthMetricInputProps {
  onSuccess?: () => void;
}

export function HealthMetricInput({ onSuccess }: HealthMetricInputProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [metricType, setMetricType] = useState<string>('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const metricOptions = [
    { value: MetricType.WEIGHT, label: 'Weight (kg)', icon: <Icons.Activity className="w-4 h-4" /> },
    { value: MetricType.BLOOD_PRESSURE_SYSTOLIC, label: 'Blood Pressure Systolic (mmHg)', icon: <Icons.Heart className="w-4 h-4" /> },
    { value: MetricType.BLOOD_PRESSURE_DIASTOLIC, label: 'Blood Pressure Diastolic (mmHg)', icon: <Icons.Heart className="w-4 h-4" /> },
    { value: MetricType.BLOOD_GLUCOSE, label: 'Blood Glucose (mg/dL)', icon: <Icons.Activity className="w-4 h-4" /> },
    { value: MetricType.HEMOGLOBIN, label: 'Hemoglobin (g/dL)', icon: <Icons.Activity className="w-4 h-4" /> },
    { value: MetricType.FETAL_HEART_RATE, label: 'Fetal Heart Rate (bpm)', icon: <Icons.Baby className="w-4 h-4" /> },
    { value: MetricType.FUNDAL_HEIGHT, label: 'Fundal Height (cm)', icon: <Icons.Activity className="w-4 h-4" /> },
  ];

  const getUnit = (type: string) => {
    const units: Record<string, string> = {
      [MetricType.WEIGHT]: 'kg',
      [MetricType.BLOOD_PRESSURE_SYSTOLIC]: 'mmHg',
      [MetricType.BLOOD_PRESSURE_DIASTOLIC]: 'mmHg',
      [MetricType.BLOOD_GLUCOSE]: 'mg/dL',
      [MetricType.HEMOGLOBIN]: 'g/dL',
      [MetricType.FETAL_HEART_RATE]: 'bpm',
      [MetricType.FUNDAL_HEIGHT]: 'cm',
    };
    return units[type] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metricType || !value) {
      toast({
        title: 'Error',
        description: 'Please select metric type and enter value',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/health/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: metricType,
          value: parseFloat(value),
          unit: getUnit(metricType),
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save metric');
      }

      toast({
        title: 'Success',
        description: 'Health metric recorded successfully',
      });

      // Reset form
      setMetricType('');
      setValue('');
      setNotes('');
      
      if (onSuccess) onSuccess();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save health metric',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Activity className="w-5 h-5 text-[#2196F3]" />
          Record Health Metric
        </CardTitle>
        <CardDescription>
          Track your vital health measurements during pregnancy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricType">Metric Type</Label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter measurement value"
              required
            />
            {metricType && (
              <p className="text-sm text-[#757575]">Unit: {getUnit(metricType)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this measurement"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icons.Save className="mr-2 h-4 w-4" />
                Save Metric
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

