# Quick Start Guide - New Features

## 🚀 For Developers

### Testing NIC Login Locally

1. **Start the development server**:
```bash
cd e-maternity
npm run dev
```

2. **Navigate to NIC login**:
```
http://localhost:3000/nic-login
```

3. **Test credentials** (if you have seeded data):
```
NIC: [Mother's NIC from database]
Password: [Mother's password]
```

4. **Should redirect to**:
```
http://localhost:3000/dashboard/mother
```

---

## 👩‍⚕️ For Doctors Testing Features

### 1. Access Doctor Dashboard
```
Login: doctor@example.com
Go to: /dashboard/doctor
```

### 2. Search for Patient by NIC
- Look at header search bar
- Select "NIC Number" from dropdown
- Enter patient NIC
- Press Enter
- Click on result to view patient

### 3. Prescribe Vitamins
- Go to patient details page
- Find "Vitamins & Supplements" section
- Click "Prescribe Vitamin" button
- Fill form:
  - Type: Folic Acid
  - Dosage: 400mg
  - Frequency: Once daily
  - Start Date: Today
- Click "Prescribe Vitamin"

### 4. Record Immunization
- Go to patient details page
- Find "Immunization Record" section
- Click "Record Immunization" button
- Fill form:
  - Type: Tetanus
  - Dose Number: 1
  - Administered Date: Today
  - Injection Site: Left Upper Arm
- Click "Record Immunization"

### 5. Add Abnormal Pregnancy History
- Go to patient details page
- Find "Pregnancy History" section
- Click "Add Abnormal Pregnancy History" button
- Click "Add New Record" section
- Fill form:
  - Year: 2020
  - Condition: e.g., "Congenital heart defect"
  - Description: Details about the condition
  - Outcome: Select from dropdown
- Click "Add Record"
- Click "Save History"

---

## 👶 For Mothers Testing Features

### 1. Login with NIC
```
URL: /nic-login
NIC: Your NIC number
Password: Your password
```

### 2. View Vitamins
- Go to dashboard
- Scroll to "My Vitamins & Supplements"
- See list of active vitamins

### 3. View Immunizations
- Go to dashboard
- Scroll to "My Immunizations"
- See vaccination history

### 4. Record Weight (Test Auto Risk Assessment)
- Go to "Health Metrics" page
- Click "Add Metric"
- Select type: Weight
- Enter value: 42 kg (low weight to test high-risk)
- Submit
- Dashboard risk badge should update automatically

---

## 🧪 API Testing with Postman/Thunder Client

### 1. NIC Login (NextAuth)
```http
POST http://localhost:3000/api/auth/signin/nic-login
Content-Type: application/json

{
  "nic": "199512345678",
  "password": "password123"
}
```

### 2. Get Vitamins
```http
GET http://localhost:3000/api/vitamins?motherProfileId={id}&isActive=true
Authorization: Bearer {token}
```

### 3. Prescribe Vitamin
```http
POST http://localhost:3000/api/vitamins
Content-Type: application/json
Authorization: Bearer {token}

{
  "motherProfileId": "uuid-here",
  "vitaminType": "FOLIC_ACID",
  "vitaminName": "Folic Acid",
  "dosage": "400mg",
  "frequency": "Once daily",
  "startDate": "2025-12-24T00:00:00Z"
}
```

### 4. Get Immunizations
```http
GET http://localhost:3000/api/immunizations?motherProfileId={id}
Authorization: Bearer {token}
```

### 5. Record Immunization
```http
POST http://localhost:3000/api/immunizations
Content-Type: application/json
Authorization: Bearer {token}

{
  "motherProfileId": "uuid-here",
  "immunizationType": "TETANUS",
  "vaccineName": "Td Vaccine",
  "doseNumber": 1,
  "administeredDate": "2025-12-24T00:00:00Z",
  "site": "Left Upper Arm"
}
```

### 6. Update Abnormal History
```http
PUT http://localhost:3000/api/mothers/{id}/abnormal-history
Content-Type: application/json
Authorization: Bearer {token}

{
  "hadAbnormalBabies": true,
  "abnormalBabyDetails": [
    {
      "id": "1",
      "year": 2020,
      "condition": "Congenital heart defect",
      "description": "Ventricular septal defect detected at birth",
      "outcome": "survived_with_condition"
    }
  ]
}
```

### 7. Record Weight (Test Risk Assessment)
```http
POST http://localhost:3000/api/health/metrics
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "WEIGHT",
  "value": 42,
  "unit": "kg"
}

// Response will include the metric
// Risk assessment happens automatically in background
// Check mother profile to see updated risk level
```

### 8. Get All Patients (Doctor)
```http
GET http://localhost:3000/api/doctor/patients
Authorization: Bearer {doctor-token}
```

### 9. Search Patients by NIC
```http
GET http://localhost:3000/api/doctor/search?q=199512345678&type=nic
Authorization: Bearer {doctor-token}
```

---

## 🐛 Debugging Tips

### NIC Login Issues
```typescript
// Check in browser console:
console.log('Session:', session);
console.log('User role:', session?.user?.role);

// Verify NIC exists:
// Open Prisma Studio: npx prisma studio
// Check MotherProfile table for NIC
```

### Risk Assessment Not Updating
```typescript
// Check mother profile:
GET /api/mothers/{id}

// Response should include:
{
  "currentWeight": 42,
  "isUnderweight": true,
  "riskLevel": "HIGH",
  "bmi": 16.5
}

// Check health metrics were saved:
GET /api/health/metrics?motherId={id}&type=WEIGHT
```

### Vitamin/Immunization Not Showing
```typescript
// Check if data exists:
GET /api/vitamins?motherProfileId={id}

// Check mother profile ID:
GET /api/profile/mother

// Ensure you're using motherProfile.id, not user.id
```

### Doctor Can't See Patients
```typescript
// Verify role:
console.log('User role:', session?.user?.role); // Should be 'DOCTOR'

// Check API response:
GET /api/doctor/patients
// Should return all patients, not filtered by assignment
```

---

## 📊 Database Queries for Testing

### Check Mother's Current State
```sql
-- Get mother with all relations
SELECT 
  mp.*,
  u.firstName,
  u.lastName,
  u.email,
  u.role
FROM "MotherProfile" mp
JOIN "User" u ON mp."userId" = u.id
WHERE mp.nic = '199512345678';
```

### Check Vitamins
```sql
SELECT * FROM "VitaminRecord" 
WHERE "motherProfileId" = 'uuid-here'
ORDER BY "startDate" DESC;
```

### Check Immunizations
```sql
SELECT * FROM "ImmunizationRecord" 
WHERE "motherProfileId" = 'uuid-here'
ORDER BY "administeredDate" DESC;
```

### Check Health Metrics
```sql
SELECT * FROM "HealthMetric" 
WHERE "motherId" = 'uuid-here' 
AND type = 'WEIGHT'
ORDER BY "recordedAt" DESC 
LIMIT 5;
```

---

## 🔧 Common Fixes

### Fix: "Unauthorized" errors
```typescript
// Ensure you're logged in:
await signIn('credentials', { email, password });
// or
await signIn('nic-login', { nic, password });

// Check session:
const session = await getServerSession(authOptions);
console.log('Session:', session);
```

### Fix: Forms not submitting
```typescript
// Check required fields are filled
// Check API endpoint is correct
// Check authorization headers

// Enable detailed logs:
axios.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});
```

### Fix: Risk level not visible
```typescript
// Refresh dashboard:
window.location.reload();

// Or refetch profile:
const response = await axios.get('/api/profile/mother');
setProfile(response.data.data);
```

---

## 🎨 UI Component Testing

### Test VitaminCard
```tsx
import { VitaminCard } from '@/components/vitamins/VitaminCard';

<VitaminCard vitamin={{
  id: '1',
  vitaminName: 'Folic Acid',
  vitaminType: 'FOLIC_ACID',
  dosage: '400mg',
  frequency: 'Once daily',
  startDate: new Date().toISOString(),
  isActive: true
}} />
```

### Test ImmunizationCard
```tsx
import { ImmunizationCard } from '@/components/immunizations/ImmunizationCard';

<ImmunizationCard immunization={{
  id: '1',
  vaccineName: 'Tetanus',
  immunizationType: 'TETANUS',
  doseNumber: 1,
  administeredDate: new Date().toISOString(),
  site: 'Left Upper Arm'
}} />
```

---

## 📝 Testing Checklist

- [ ] NIC login redirects to mother dashboard
- [ ] Session persists after page refresh
- [ ] Doctor can see all patients (not just assigned)
- [ ] Doctor search finds patients by NIC
- [ ] Vitamin form opens and submits successfully
- [ ] Immunization form opens and submits successfully
- [ ] Abnormal history form saves correctly
- [ ] Recording weight updates risk level automatically
- [ ] Mother dashboard shows vitamins/immunizations
- [ ] Risk badge updates when risk changes
- [ ] Forms show validation errors
- [ ] Toast notifications appear on success/error
- [ ] Loading states work (spinners)
- [ ] Empty states display correctly

---

## 🚀 Ready to Deploy?

Run these commands before deployment:

```bash
# 1. Run type checking
npm run type-check

# 2. Run build
npm run build

# 3. Test production build locally
npm run start

# 4. Run any tests
npm run test

# 5. Check for errors
npm run lint
```

---

## 📚 Additional Resources

- **Full Documentation**: `docs/DECEMBER-2025-ENHANCEMENTS.md`
- **Integration Guide**: `docs/DOCTOR-COMPONENT-INTEGRATION.md`
- **Summary**: `docs/README-SUMMARY.md`
- **Project README**: `README.md`
- **API Schemas**: `src/lib/validation/*.schema.ts`
- **Prisma Schema**: `prisma/schema.prisma`

---

## 💡 Tips

1. **Use TypeScript types**: Import from `/types/index.ts`
2. **Follow component structure**: atoms → molecules → organisms
3. **Use existing UI components**: from `/components/ui/`
4. **Check API responses**: Always check `success` field
5. **Handle errors gracefully**: Use try-catch and toast notifications
6. **Test with real data**: Create seed scripts if needed
7. **Check permissions**: Ensure user has correct role
8. **Use browser DevTools**: Check Network tab for API calls
9. **Enable React DevTools**: Inspect component state
10. **Read console logs**: Many helpful debug messages

Happy coding! 🎉
