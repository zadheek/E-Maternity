'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { VitaminType } from '@/types';
import type { VitaminRecord } from '@/types';
import { format } from 'date-fns';

interface VitaminCardProps {
  vitamin: VitaminRecord & {
    prescribedBy: {
      firstName: string;
      lastName: string;
      role: string;
    };
  };
}

const vitaminIcons: Record<VitaminType, React.ReactElement> = {
  [VitaminType.FOLIC_ACID]: <Icons.Heart className="h-5 w-5 text-pink-500" />,
  [VitaminType.IRON]: <Icons.Activity className="h-5 w-5 text-red-500" />,
  [VitaminType.CALCIUM]: <Icons.Activity className="h-5 w-5 text-blue-500" />,
  [VitaminType.VITAMIN_D]: <Icons.Activity className="h-5 w-5 text-yellow-500" />,
  [VitaminType.MULTIVITAMIN]: <Icons.Activity className="h-5 w-5 text-purple-500" />,
  [VitaminType.VITAMIN_B12]: <Icons.Activity className="h-5 w-5 text-orange-500" />,
  [VitaminType.DHA_OMEGA3]: <Icons.Activity className="h-5 w-5 text-cyan-500" />,
  [VitaminType.OTHER]: <Icons.Activity className="h-5 w-5 text-gray-500" />,
};

export function VitaminCard({ vitamin }: VitaminCardProps) {
  const icon = vitaminIcons[vitamin.vitaminType as VitaminType];
  const administeredDates = vitamin.administeredDates as string[] | null;

  return (
    <Card className={!vitamin.isActive ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{vitamin.vitaminName}</CardTitle>
          </div>
          <Badge variant={vitamin.isActive ? 'default' : 'secondary'}>
            {vitamin.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Dosage</p>
            <p className="font-medium">{vitamin.dosage}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Frequency</p>
            <p className="font-medium">{vitamin.frequency}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground">Start Date</p>
          <p className="font-medium">{format(new Date(vitamin.startDate), 'PPP')}</p>
        </div>

        {vitamin.endDate && (
          <div className="text-sm">
            <p className="text-muted-foreground">End Date</p>
            <p className="font-medium">{format(new Date(vitamin.endDate), 'PPP')}</p>
          </div>
        )}

        {vitamin.nextDueDate && vitamin.isActive && (
          <div className="text-sm">
            <p className="text-muted-foreground">Next Due</p>
            <p className="font-medium flex items-center gap-1">
              <Icons.Calendar className="h-3 w-3" />
              {format(new Date(vitamin.nextDueDate), 'PPP')}
            </p>
          </div>
        )}

        {administeredDates && administeredDates.length > 0 && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Administered ({administeredDates.length} times)</p>
            <div className="flex flex-wrap gap-1">
              {administeredDates.slice(0, 5).map((date, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {format(new Date(date), 'MMM d')}
                </Badge>
              ))}
              {administeredDates.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{administeredDates.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>
            Prescribed by: {vitamin.prescribedBy.firstName} {vitamin.prescribedBy.lastName}
          </p>
        </div>

        {vitamin.notes && (
          <div className="text-sm">
            <p className="text-muted-foreground">Notes</p>
            <p className="text-sm">{vitamin.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
