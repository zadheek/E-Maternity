// components/molecules/MetricCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { IconName } from '@/components/icons';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: IconName;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'danger';
  lastUpdated?: Date;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  status = 'normal',
  lastUpdated,
}: MetricCardProps) {
  const Icon = Icons[icon];

  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  const trendIcons = {
    up: Icons.TrendingUp,
    down: Icons.TrendingDown,
    stable: Icons.Activity,
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#2196F3]" />
          <h3 className="text-sm font-medium text-[#757575]">{title}</h3>
        </div>
        {status !== 'normal' && (
          <Badge className={statusColors[status]} variant="secondary">
            {status}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-bold text-[#212121]">{value}</p>
            {unit && (
              <p className="text-sm text-[#757575] mt-1">{unit}</p>
            )}
          </div>
          {TrendIcon && (
            <TrendIcon
              className={`w-5 h-5 ${
                trend === 'up'
                  ? 'text-green-500'
                  : trend === 'down'
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            />
          )}
        </div>
        {lastUpdated && (
          <p className="text-xs text-[#757575] mt-3">
            Updated {lastUpdated.toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

