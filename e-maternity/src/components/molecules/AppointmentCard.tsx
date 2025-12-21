// components/molecules/AppointmentCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';

interface AppointmentCardProps {
  id: string;
  type: string;
  provider: {
    name: string;
    role: string;
    hospital?: string;
  };
  scheduledDate: Date;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  onCancel?: () => void;
  onReschedule?: () => void;
}

export function AppointmentCard({
  type,
  provider,
  scheduledDate,
  duration,
  status,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    MISSED: 'bg-orange-100 text-orange-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{type}</CardTitle>
            <p className="text-sm text-[#757575] mt-1">
              with {provider.name}, {provider.role}
            </p>
            {provider.hospital && (
              <p className="text-xs text-[#757575] mt-1 flex items-center gap-1">
                <Icons.Hospital className="w-3 h-3" />
                {provider.hospital}
              </p>
            )}
          </div>
          <Badge className={statusColors[status]} variant="secondary">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Icons.Calendar className="w-4 h-4 text-[#757575]" />
            <span>{format(scheduledDate, 'MMMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icons.Clock className="w-4 h-4 text-[#757575]" />
            <span>
              {format(scheduledDate, 'hh:mm a')} ({duration} minutes)
            </span>
          </div>
          {status === 'SCHEDULED' && (
            <div className="flex gap-2 mt-4">
              {onReschedule && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onReschedule}
                >
                  <Icons.Calendar className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={onCancel}
                >
                  <Icons.X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
