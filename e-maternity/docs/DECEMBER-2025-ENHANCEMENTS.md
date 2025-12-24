# E-Maternity System Enhancements - December 2025

## Overview
Major system enhancements implemented to improve maternal health tracking, enable NIC-based authentication, automate risk assessment, and support shift-based hospital workflows where any doctor can access any patient's information.

---

## 1. NIC-Based Authentication

### Feature Description
Mothers can now log in using their National Identity Card (NIC) number instead of email, addressing the need for mothers who don't have email addresses.

### Implementation Details

**Authentication Provider**
- Added `nic-login` credentials provider to NextAuth configuration
- Location: `src/lib/auth/auth.config.ts`
- Searches for mother profile by NIC, then validates password
- Integrated with existing JWT session management
- 30-day session expiry (same as email login)

**Login Page**
- Location: `src/app/(auth)/nic-login/page.tsx`
- Uses NextAuth `signIn()` function with 'nic-login' provider
- User-friendly UI with NIC validation
- Links to email login and provider login alternatives

**Security Features**
- Role verification (only MOTHER role can use NIC login)
- Account verification check (isVerified)
- Bcrypt password hashing
- Same security standards as email authentication

### Usage
```typescript
// Mother login with NIC
await signIn('nic-login', {
  nic: '199512345678',
  password: 'securePassword',
  redirect: false,
});
```

### API Endpoint
- **Removed**: Old `/api/auth/login/nic` endpoint (now handled by NextAuth)
- **Migration**: System now uses unified NextAuth session management

---

## 2. Vitamin & Immunization Tracking

### Feature Description
Comprehensive vitamin supplementation and immunization tracking system integrated into mother and doctor dashboards.

### Mother Dashboard Integration

**Location**: `src/app/(dashboard)/dashboard/mother/page.tsx`

**Features**:
- Displays current active vitamins with dosage and frequency
- Shows immunization history with next due dates
- Uses existing `VitaminCard` and `ImmunizationCard` components
- Real-time data fetching from API
- Empty states with helpful messages

**UI Components**:
```tsx
import { VitaminCard } from '@/components/vitamins/VitaminCard';
import { ImmunizationCard } from '@/components/immunizations/ImmunizationCard';
```

### Doctor Management Tools

#### Vitamin Management Form
**Location**: `src/components/doctor/VitaminManagementForm.tsx`

**Features**:
- Dialog-based form for prescribing vitamins
- Vitamin types: Folic Acid, Iron, Calcium, Vitamin D, B12, DHA/Omega-3, Multivitamin
- Fields: dosage, frequency, start/end dates, notes
- Form validation
- Success/error toast notifications

**Usage**:
```tsx
<VitaminManagementForm 
  motherProfileId={profile.id}
  onSuccess={() => refetchData()}
/>
```

#### Immunization Record Form
**Location**: `src/components/doctor/ImmunizationRecordForm.tsx`

**Features**:
- Dialog-based form for recording immunizations
- Immunization types: Tetanus, Rubella, Hepatitis B, Influenza, COVID-19
- Fields: dose number, administered date, batch number, injection site, side effects
- Next due date calculation
- Comprehensive tracking

**Usage**:
```tsx
<ImmunizationRecordForm 
  motherProfileId={profile.id}
  onSuccess={() => refetchData()}
/>
```

### Database Schema

**VitaminRecord** (Already exists in Prisma schema)
```prisma
model VitaminRecord {
  id                String         @id @default(uuid())
  motherProfileId   String
  vitaminName       String
  vitaminType       VitaminType
  dosage            String
  frequency         String
  startDate         DateTime
  endDate           DateTime?
  prescribedById    String
  administeredDates Json?
  nextDueDate       DateTime?
  notes             String?
  isActive          Boolean        @default(true)
}
```

**ImmunizationRecord** (Already exists in Prisma schema)
```prisma
model ImmunizationRecord {
  id                String              @id @default(uuid())
  motherProfileId   String
  vaccineName       String
  immunizationType  ImmunizationType
  doseNumber        Int
  administeredDate  DateTime
  administeredById  String
  nextDueDate       DateTime?
  batchNumber       String?
  site              String?
  sideEffects       String?
  notes             String?
}
```

### API Endpoints

**Vitamins API** (`/api/vitamins`)
- **GET**: Fetch vitamins (filter by motherProfileId, isActive)
- **POST**: Prescribe new vitamin (doctors/midwives only)

**Immunizations API** (`/api/immunizations`)
- **GET**: Fetch immunizations (filter by motherProfileId)
- **POST**: Record new immunization (doctors/midwives/admins only)

---

## 3. Automated Risk Assessment

### Feature Description
Automatic risk level recalculation when health metrics (especially weight) are recorded.

### Implementation Details

**Location**: `src/app/api/health/metrics/route.ts`

**Trigger**: Weight metric POST request

**Automated Actions**:
1. **Weight Update**: Updates `currentWeight` in MotherProfile
2. **BMI Calculation**: If height exists, calculates and stores BMI
3. **Underweight Check**: 
   - Weight < 45kg → `isUnderweight = true`
   - BMI < 18.5 → `isUnderweight = true`
4. **Comprehensive Risk Recalculation**:
   - Fetches latest health metrics (BP, hemoglobin, glucose)
   - Calculates risk score based on all factors
   - Updates `riskLevel` (LOW/MODERATE/HIGH/CRITICAL)

### Risk Assessment Factors

**From**: `src/lib/risk-assessment/calculator.ts`

**Scoring System**:
- **Underweight BMI**: +3 points
- **Age < 18**: +3 points
- **Age > 35**: +2 points
- **Abnormal baby history**: +4 points
- **Previous miscarriages**: +1 to +4 points
- **Previous cesareans**: +1 to +3 points
- **Chronic conditions**: +3 points
- **High blood pressure**: +1 to +5 points
- **Low hemoglobin**: +2 to +5 points
- **High blood glucose**: +1 to +5 points

**Risk Levels**:
- **CRITICAL**: Score ≥ 15
- **HIGH**: Score ≥ 10
- **MODERATE**: Score ≥ 5
- **LOW**: Score < 5

### Example Flow
```typescript
// 1. Mother records weight of 42kg
POST /api/health/metrics
{
  type: 'WEIGHT',
  value: 42,
  unit: 'kg'
}

// 2. System automatically:
// - Updates motherProfile.currentWeight = 42
// - Sets motherProfile.isUnderweight = true
// - Recalculates BMI if height exists
// - Fetches latest BP, hemoglobin, glucose
// - Calculates new risk score
// - Updates motherProfile.riskLevel = 'HIGH'

// 3. Response includes created metric
// 4. Dashboard automatically shows updated risk level
```

---

## 4. Shift-Based Doctor Access

### Feature Description
Removed patient assignment restrictions so ANY doctor can view ANY patient, supporting hospital shift-based workflows.

### Implementation Changes

#### Doctor Patients API
**Location**: `src/app/api/doctor/patients/route.ts`

**Before**:
```typescript
const whereClause = {
  assignedDoctorId: doctorProfile.id, // Only assigned patients
};
```

**After**:
```typescript
const whereClause = {}; // All patients regardless of assignment
```

**Impact**:
- Doctors see all patients in the hospital
- Supports rotating shifts
- Enables emergency coverage
- Maintains role-based access control (only DOCTOR role can access)

#### Doctor Search API
**Location**: `src/app/api/doctor/search/route.ts`

**Features**:
- Search all patients by NIC, name, or phone
- No assignment filtering
- Returns full patient details with risk levels
- Limit: 20 results per search

**Search Types**:
- `all`: Searches NIC, name, and phone
- `nic`: Searches NIC number only
- `name`: Searches first and last name
- `phone`: Searches phone number

### Doctor Dashboard Enhancements

**Location**: `src/app/(dashboard)/dashboard/doctor/page.tsx`

**Changes**:
- PatientSearchBar moved to header (prominent position)
- 400px width search bar in header
- Quick access to patient search from any dashboard view
- Real-time search with immediate results

**Search Bar Features**:
- Dropdown filter: All Fields / NIC / Name / Phone
- Enter key support for quick search
- Results display with risk badges
- Click-through to patient details
- Responsive design

---

## 5. Abnormal Pregnancy History Tracking

### Feature Description
Doctors can record and manage mother's history of abnormal pregnancies or baby complications.

### Implementation Details

#### Form Component
**Location**: `src/components/doctor/AbnormalBabyHistoryForm.tsx`

**Features**:
- Add/edit/remove abnormal pregnancy records
- Fields per record:
  - Year of occurrence
  - Condition/complication name
  - Detailed description
  - Outcome: Survived with Condition / Neonatal Death / Stillbirth
- Visual record cards with color-coded outcomes
- Validation before saving

**Usage**:
```tsx
<AbnormalBabyHistoryForm 
  motherProfileId={profile.id}
  initialData={profile.abnormalBabyDetails}
  onUpdate={() => refetchProfile()}
/>
```

#### API Endpoint
**Location**: `src/app/api/mothers/[id]/abnormal-history/route.ts`

**Method**: PUT

**Request Body**:
```typescript
{
  hadAbnormalBabies: boolean,
  abnormalBabyDetails: Array<{
    id: string,
    year: number,
    condition: string,
    description: string,
    outcome: 'stillbirth' | 'neonatal_death' | 'survived_with_condition'
  }>
}
```

**Features**:
- Validates record structure
- Updates MotherProfile
- **Automatically triggers risk recalculation** (abnormal baby history adds +4 to risk score)
- Permission check (doctors, midwives, admins only)

### Database Fields

**MotherProfile Schema**:
```prisma
model MotherProfile {
  // ... existing fields
  hadAbnormalBabies     Boolean   @default(false)
  abnormalBabyDetails   Json?     // Array of abnormal baby records
}
```

### Risk Assessment Integration
When abnormal baby history is added:
1. Sets `hadAbnormalBabies = true`
2. Stores detailed records in `abnormalBabyDetails` JSON
3. Recalculates risk assessment (+4 points if true)
4. Updates `riskLevel` based on total score

---

## Testing Checklist

### NIC Login
- [ ] Mother can log in with valid NIC and password
- [ ] Invalid NIC shows error
- [ ] Invalid password shows error
- [ ] Only MOTHER role can use NIC login
- [ ] Session persists for 30 days
- [ ] Redirects to mother dashboard after login

### Vitamin/Immunization Tracking
- [ ] Mother dashboard displays active vitamins
- [ ] Mother dashboard displays immunization history
- [ ] Doctor can prescribe vitamins via form
- [ ] Doctor can record immunizations via form
- [ ] Data persists and refreshes on success
- [ ] Form validation works correctly

### Automated Risk Assessment
- [ ] Recording weight < 45kg marks as underweight
- [ ] Risk level automatically updates
- [ ] BMI calculates correctly when height exists
- [ ] Risk level considers all factors
- [ ] Dashboard shows updated risk immediately

### Doctor Access
- [ ] Doctors can view all patients (not just assigned)
- [ ] Doctor search finds any patient by NIC
- [ ] Search bar is visible in header
- [ ] Search results show risk levels
- [ ] Click-through to patient details works

### Abnormal History
- [ ] Doctor can add abnormal pregnancy records
- [ ] Records display with correct outcomes
- [ ] Can edit existing records
- [ ] Can delete records
- [ ] Risk level updates when history added
- [ ] Form validation prevents invalid data

---

## Security Considerations

### Authentication
- ✅ NIC login uses same security as email login
- ✅ Bcrypt password hashing
- ✅ JWT session tokens with 30-day expiry
- ✅ Account verification required

### Authorization
- ✅ Role-based access control maintained
- ✅ Only healthcare providers can prescribe vitamins
- ✅ Only doctors/midwives can update pregnancy history
- ✅ Mothers can only view their own data
- ✅ Doctors can view all patients (by design for hospital workflows)

### Data Privacy
- ✅ Patient data accessed only by authenticated healthcare providers
- ✅ Audit trail via `recordedBy` and `prescribedBy` fields
- ✅ Sensitive medical history stored in encrypted JSON fields

---

## Future Enhancements

### Potential Improvements
1. **Automatic Notifications**:
   - SMS/email alerts when risk level changes to HIGH/CRITICAL
   - Vitamin reminder notifications before doses
   - Immunization due date reminders

2. **Advanced Analytics**:
   - Doctor dashboard showing high-risk patient summary
   - Vitamin adherence tracking
   - Immunization completion rates

3. **Mobile App**:
   - NIC-based mobile login
   - Push notifications for vitamin reminders
   - Quick weight entry from home

4. **Audit Logs**:
   - Track who accessed which patient records
   - Log all prescription and immunization entries
   - Export audit trail for compliance

---

## Migration Notes

### From Old System
If upgrading from previous version:

1. **Database Migration**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Existing NIC Login Users**:
   - Old `/api/auth/login/nic` endpoint deprecated
   - Users automatically use new NextAuth flow
   - No data migration needed (NIC already in database)

3. **Doctor Assignments**:
   - Existing `assignedDoctorId` field still present
   - Used for reference but not for access control
   - Can be used for "primary doctor" designation

---

## Support & Troubleshooting

### Common Issues

**NIC Login Not Working**
- Verify NIC exists in MotherProfile table
- Check account `isVerified = true`
- Ensure user role is 'MOTHER'

**Risk Assessment Not Updating**
- Check if weight metric is being saved
- Verify MotherProfile has valid `dateOfBirth`
- Check console logs for risk calculation errors

**Doctor Can't See All Patients**
- Verify user role is 'DOCTOR'
- Check session authentication
- Ensure `/api/doctor/patients` is not cached

**Vitamin Forms Not Saving**
- Check user has DOCTOR or MIDWIFE role
- Verify `motherProfileId` is valid UUID
- Check required fields are filled

---

## API Reference Summary

### Authentication
- `POST /api/auth/signin` - NextAuth endpoint (supports 'credentials' and 'nic-login')

### Health Metrics
- `GET /api/health/metrics` - Fetch metrics
- `POST /api/health/metrics` - Record metric (auto-triggers risk assessment for weight)

### Vitamins
- `GET /api/vitamins?motherProfileId=xxx&isActive=true` - Fetch vitamins
- `POST /api/vitamins` - Prescribe vitamin

### Immunizations
- `GET /api/immunizations?motherProfileId=xxx` - Fetch immunizations
- `POST /api/immunizations` - Record immunization

### Doctor Patient Management
- `GET /api/doctor/patients?riskLevel=HIGH` - Get all patients
- `GET /api/doctor/search?q=NIC&type=nic` - Search patients
- `PUT /api/mothers/[id]/abnormal-history` - Update pregnancy history

---

## Component Reference

### Doctor Forms
```tsx
// Vitamin prescription
<VitaminManagementForm motherProfileId={id} onSuccess={refetch} />

// Immunization recording
<ImmunizationRecordForm motherProfileId={id} onSuccess={refetch} />

// Abnormal history
<AbnormalBabyHistoryForm 
  motherProfileId={id} 
  initialData={history}
  onUpdate={refetch} 
/>
```

### Mother Dashboard
```tsx
// Display vitamins
{vitamins.map(v => <VitaminCard key={v.id} vitamin={v} />)}

// Display immunizations
{immunizations.map(i => <ImmunizationCard key={i.id} immunization={i} />)}
```

### Doctor Dashboard
```tsx
// Search bar (in header)
<PatientSearchBar />
```

---

## Conclusion

These enhancements significantly improve the E-Maternity system's usability and clinical value:

✅ **NIC Login** - Accessibility for mothers without email  
✅ **Vitamin/Immunization Tracking** - Complete maternal supplementation management  
✅ **Automated Risk Assessment** - Real-time risk level updates based on health metrics  
✅ **Shift-Based Access** - Hospital-friendly workflow where any doctor can help any patient  
✅ **Abnormal History Tracking** - Comprehensive pregnancy complication records  

The system is now better equipped to handle real-world maternal healthcare scenarios in Sri Lankan hospitals and clinics.
