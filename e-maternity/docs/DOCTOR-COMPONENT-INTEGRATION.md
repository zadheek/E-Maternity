# Doctor Dashboard - Patient Management Integration Guide

This guide shows how to integrate the new vitamin, immunization, and abnormal history management components into individual patient views.

## Component Integration Example

### Patient Details Page
```tsx
// src/app/(dashboard)/dashboard/doctor/patients/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { VitaminCard } from '@/components/vitamins/VitaminCard';
import { ImmunizationCard } from '@/components/immunizations/ImmunizationCard';
import { VitaminManagementForm } from '@/components/doctor/VitaminManagementForm';
import { ImmunizationRecordForm } from '@/components/doctor/ImmunizationRecordForm';
import { AbnormalBabyHistoryForm } from '@/components/doctor/AbnormalBabyHistoryForm';

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<any>(null);
  const [vitamins, setVitamins] = useState<any[]>([]);
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const [patientRes, vitaminsRes, immunizationsRes] = await Promise.all([
        axios.get(`/api/mothers/${patientId}`),
        axios.get(`/api/vitamins?motherProfileId=${patientId}&isActive=true`),
        axios.get(`/api/immunizations?motherProfileId=${patientId}`),
      ]);

      setPatient(patientRes.data.data);
      setVitamins(vitaminsRes.data.data || []);
      setImmunizations(immunizationsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {patient?.user?.firstName} {patient?.user?.lastName}
          </CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>NIC: {patient?.nic}</span>
            <span>Week: {patient?.pregnancyWeek}</span>
            <span>Risk: {patient?.riskLevel}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Vitamins Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vitamins & Supplements</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Current supplementation plan
              </p>
            </div>
            <VitaminManagementForm
              motherProfileId={patient?.id}
              onSuccess={fetchPatientData}
            />
          </div>
        </CardHeader>
        <CardContent>
          {vitamins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icons.Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vitamins prescribed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vitamins.map((vitamin) => (
                <VitaminCard key={vitamin.id} vitamin={vitamin} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immunizations Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Immunization Record</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Vaccination history and schedule
              </p>
            </div>
            <ImmunizationRecordForm
              motherProfileId={patient?.id}
              onSuccess={fetchPatientData}
            />
          </div>
        </CardHeader>
        <CardContent>
          {immunizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icons.Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No immunizations recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {immunizations.map((immunization) => (
                <ImmunizationCard key={immunization.id} immunization={immunization} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pregnancy History Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pregnancy History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Previous pregnancies and complications
              </p>
            </div>
            <AbnormalBabyHistoryForm
              motherProfileId={patient?.id}
              initialData={patient?.abnormalBabyDetails || []}
              onUpdate={fetchPatientData}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Previous Pregnancies</p>
              <p className="text-2xl font-bold">{patient?.previousPregnancies || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cesareans</p>
              <p className="text-2xl font-bold">{patient?.previousCesareans || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Miscarriages</p>
              <p className="text-2xl font-bold">{patient?.previousMiscarriages || 0}</p>
            </div>
          </div>
          
          {patient?.hadAbnormalBabies && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Icons.AlertCircle className="w-4 h-4 text-yellow-600" />
                Abnormal Pregnancy History Recorded
              </p>
              <p className="text-xs text-muted-foreground">
                {patient.abnormalBabyDetails?.length || 0} previous complications documented.
                Click "View/Edit" to see details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Quick Integration Steps

### 1. Install Dependencies
All required components are already created. Just import them:

```tsx
import { VitaminManagementForm } from '@/components/doctor/VitaminManagementForm';
import { ImmunizationRecordForm } from '@/components/doctor/ImmunizationRecordForm';
import { AbnormalBabyHistoryForm } from '@/components/doctor/AbnormalBabyHistoryForm';
import { VitaminCard } from '@/components/vitamins/VitaminCard';
import { ImmunizationCard } from '@/components/immunizations/ImmunizationCard';
```

### 2. Fetch Data
```tsx
// Fetch vitamins
const vitaminsRes = await axios.get(`/api/vitamins?motherProfileId=${profileId}&isActive=true`);

// Fetch immunizations
const immunizationsRes = await axios.get(`/api/immunizations?motherProfileId=${profileId}`);

// Mother profile includes abnormalBabyDetails
const patientRes = await axios.get(`/api/mothers/${profileId}`);
```

### 3. Add Forms
```tsx
{/* In your JSX */}
<VitaminManagementForm 
  motherProfileId={profileId}
  onSuccess={() => refetchData()}
/>

<ImmunizationRecordForm 
  motherProfileId={profileId}
  onSuccess={() => refetchData()}
/>

<AbnormalBabyHistoryForm 
  motherProfileId={profileId}
  initialData={patient.abnormalBabyDetails}
  onUpdate={() => refetchData()}
/>
```

### 4. Display Data
```tsx
{/* Display vitamins */}
{vitamins.map(vitamin => (
  <VitaminCard key={vitamin.id} vitamin={vitamin} />
))}

{/* Display immunizations */}
{immunizations.map(immunization => (
  <ImmunizationCard key={immunization.id} immunization={immunization} />
))}
```

## Component Props Reference

### VitaminManagementForm
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| motherProfileId | string | Yes | UUID of mother's profile |
| onSuccess | () => void | No | Callback after successful prescription |

### ImmunizationRecordForm
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| motherProfileId | string | Yes | UUID of mother's profile |
| onSuccess | () => void | No | Callback after successful recording |

### AbnormalBabyHistoryForm
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| motherProfileId | string | Yes | UUID of mother's profile |
| initialData | AbnormalBabyRecord[] | No | Existing records (default: []) |
| onUpdate | () => void | No | Callback after successful update |

### VitaminCard
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| vitamin | VitaminRecord | Yes | Vitamin object from API |

### ImmunizationCard
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| immunization | ImmunizationRecord | Yes | Immunization object from API |

## API Endpoints Used

### Vitamins
```
GET  /api/vitamins?motherProfileId={id}&isActive=true
POST /api/vitamins
```

### Immunizations
```
GET  /api/immunizations?motherProfileId={id}
POST /api/immunizations
```

### Abnormal History
```
PUT  /api/mothers/{id}/abnormal-history
```

## Styling Notes

All components use:
- **shadcn/ui** components (Dialog, Card, Button, Input, Select, Textarea)
- **Lucide React** icons via Icons wrapper
- **Tailwind CSS** for styling
- Consistent color scheme with project palette

## Error Handling

All forms include:
- Toast notifications on success/error
- Loading states with spinner icons
- Form validation
- API error handling

## Permissions

- **Vitamin Prescription**: DOCTOR, MIDWIFE roles
- **Immunization Recording**: DOCTOR, MIDWIFE, ADMIN roles
- **Abnormal History Update**: DOCTOR, MIDWIFE, ADMIN roles

All permissions are enforced at the API level.

## Best Practices

1. **Always refetch data** after form submissions
2. **Show loading states** during API calls
3. **Handle empty states** gracefully
4. **Use TypeScript types** from `/types/index.ts`
5. **Include error boundaries** in production

## Testing Checklist

- [ ] Forms open and close correctly
- [ ] Data submits successfully
- [ ] Toast notifications appear
- [ ] Data refreshes after submission
- [ ] Empty states display properly
- [ ] Loading states work
- [ ] Error handling works
- [ ] Permissions are enforced
