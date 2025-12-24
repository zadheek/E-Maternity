'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { ImmunizationType } from '@/types';
import type { ImmunizationRecord } from '@/types';
import { format } from 'date-fns';

interface ImmunizationCardProps {
  immunization: ImmunizationRecord & {
    administeredBy: {
      firstName: string;
      lastName: string;
      role: string;
    };
  };
}

const immunizationColors: Record<ImmunizationType, string> = {
  [ImmunizationType.TETANUS]: 'bg-red-100 text-red-800 border-red-200',
  [ImmunizationType.RUBELLA]: 'bg-pink-100 text-pink-800 border-pink-200',
  [ImmunizationType.HEPATITIS_B]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ImmunizationType.INFLUENZA]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ImmunizationType.COVID19]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [ImmunizationType.OTHER]: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ImmunizationCard({ immunization }: ImmunizationCardProps) {
  const colorClass = immunizationColors[immunization.immunizationType as ImmunizationType];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{immunization.vaccineName}</CardTitle>
          </div>
          <Badge className={colorClass}>Dose {immunization.doseNumber}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Administered Date</p>
            <p className="font-medium">
              {format(new Date(immunization.administeredDate), 'PPP')}
            </p>
          </div>
          {immunization.nextDueDate && (
            <div>
              <p className="text-muted-foreground">Next Due</p>
              <p className="font-medium flex items-center gap-1">
                <Icons.Calendar className="h-3 w-3" />
                {format(new Date(immunization.nextDueDate), 'PPP')}
              </p>
            </div>
          )}
        </div>

        {immunization.site && (
          <div className="text-sm">
            <p className="text-muted-foreground">Injection Site</p>
            <p className="font-medium">{immunization.site}</p>
          </div>
        )}

        {immunization.batchNumber && (
          <div className="text-sm">
            <p className="text-muted-foreground">Batch Number</p>
            <p className="font-medium font-mono text-xs">{immunization.batchNumber}</p>
          </div>
        )}

        {immunization.sideEffects && (
          <div className="text-sm">
            <p className="text-muted-foreground">Side Effects</p>
            <p className="text-sm">{immunization.sideEffects}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>
            Administered by: {immunization.administeredBy.firstName}{' '}
            {immunization.administeredBy.lastName}
          </p>
        </div>

        {immunization.notes && (
          <div className="text-sm">
            <p className="text-muted-foreground">Notes</p>
            <p className="text-sm">{immunization.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
