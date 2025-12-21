'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { MetricType } from '@/types/prisma.types';

interface HealthMetric {
  id: string;
  type: MetricType;
  value: number;
  unit: string;
  recordedAt: Date;
}

interface HealthTrendChartProps {
  metrics: HealthMetric[];
  metricType: MetricType;
  title: string;
}

export function HealthTrendChart({ metrics, metricType, title }: HealthTrendChartProps) {
  const filteredMetrics = metrics
    .filter(m => m.type === metricType)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .slice(-7); // Last 7 readings

  if (filteredMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icons.TrendingUp className="w-12 h-12 text-[#757575] mb-2" />
            <p className="text-sm text-[#757575]">No data available yet</p>
            <p className="text-xs text-[#757575] mt-1">Start recording to see trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...filteredMetrics.map(m => m.value));
  const minValue = Math.min(...filteredMetrics.map(m => m.value));
  const range = maxValue - minValue || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          Last 7 readings • Latest: {filteredMetrics[filteredMetrics.length - 1]?.value} {filteredMetrics[0]?.unit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Line Chart */}
          <div className="relative h-32 flex items-end gap-2">
            {filteredMetrics.map((metric, _index) => {
              const height = ((metric.value - minValue) / range) * 100;
              return (
                <div key={metric.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-[#2196F3] rounded-t transition-all hover:bg-[#1976D2]"
                      style={{ height: `${height}%` }}
                      title={`${metric.value} ${metric.unit}`}
                    />
                  </div>
                  <span className="text-xs text-[#757575]">
                    {new Date(metric.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-[#757575]">Average</p>
              <p className="text-sm font-semibold">
                {(filteredMetrics.reduce((sum, m) => sum + m.value, 0) / filteredMetrics.length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#757575]">Highest</p>
              <p className="text-sm font-semibold">{maxValue.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-[#757575]">Lowest</p>
              <p className="text-sm font-semibold">{minValue.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

