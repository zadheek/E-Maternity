# Smart Maternal Health Management System - GitHub Copilot Instructions

## Project Overview
The Smart Maternal Health Management System is a comprehensive digital health platform designed for Sri Lanka's maternal healthcare ecosystem. It addresses critical gaps in prenatal and postnatal care by providing continuous health monitoring, emergency response coordination, and data-driven insights for expectant mothers, healthcare providers, and public health officials.

## Technology Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: RESTful API with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: Socket.io for live health monitoring
- **Containerization**: Docker & Docker Compose
- **Authentication**: NextAuth.js with multi-role support
- **File Storage**: local file system with PostgreSQL metadata
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React (https://lucide.dev/)
- **Form Handling**: React Hook Form with Zod validation
- **API Client**: Axios
- **Type Safety**: TypeScript with strict mode
- **State Management**: React Context API with custom hooks
- **Charts & Analytics**: Recharts or Chart.js
- **Date/Time**: date-fns
- **SMS**: Twilio
- **Email**: Resend or EmailJS
- **Maps**: Google Maps API for hospital locator

## Project Colors

Primary: #E91E63 (Pink)
Secondary: #00BCD4 (Cyan)
Accent: #FF9800 (Orange)
Success: #4CAF50
Warning: #FFC107
Error: #F44336
Background: #FAFAFA
Text Primary: #212121
Text Secondary: #757575

**Font**: Inter or Poppins  
**Icons**: Lucide React exclusively

## Architecture Principles

### Component-Based Architecture
- **Atomic Design Pattern**: atoms → molecules → organisms → templates → pages
- **Reusability First**: Every UI element must be reusable
- **Single Responsibility**: One clear purpose per component
- **Props-Driven**: Configure via TypeScript interfaces
- **Composition Over Inheritance**: Build complex from simple components

### Code Organization

```
src/
├── app/                          # Next.js app router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-otp/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── mother/               # Mother-specific features
│   │   ├── doctor/               # Doctor portal
│   │   ├── nurse/                # Nurse portal
│   │   ├── public-health/        # PHI dashboard
│   │   └── admin/                # Admin panel
│   ├── health/                   # Health tracking features
│   │   ├── metrics/
│   │   ├── appointments/
│   │   └── medications/
│   ├── emergency/                # Emergency response system
│   ├── telemedicine/             # Video consultation
│   ├── education/                # Educational resources
│   ├── analytics/                # Analytics and reports
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── health/
│   │   ├── appointments/
│   │   ├── emergency/
│   │   ├── telemedicine/
│   │   └── analytics/
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
│
├── components/                   # Reusable UI components (Atomic Design)
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── ...                   # Other shadcn/ui components
│   ├── icons/                    # Lucide React icon wrappers
│   │   └── index.tsx             # Centralized icon exports
│   ├── atoms/                    # Smallest UI components
│   │   ├── Logo.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── IconButton.tsx
│   ├── molecules/                # Simple component combinations
│   │   ├── SearchBar.tsx
│   │   ├── MetricCard.tsx
│   │   ├── NotificationItem.tsx
│   │   ├── AppointmentCard.tsx
│   │   └── EmergencyButton.tsx
│   ├── organisms/                # Complex component groups
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── HealthDashboard.tsx
│   │   ├── AppointmentScheduler.tsx
│   │   ├── VideoConsultation.tsx
│   │   └── EmergencyPanel.tsx
│   ├── templates/                # Page-level layouts
│   │   ├── DashboardTemplate.tsx
│   │   ├── AuthTemplate.tsx
│   │   └── PublicTemplate.tsx
│   ├── health/                   # Health-specific components
│   │   ├── HealthMetricInput.tsx
│   │   ├── HealthTrendChart.tsx
│   │   ├── RiskScoreCard.tsx
│   │   └── MedicationTracker.tsx
│   ├── emergency/                # Emergency-specific components
│   │   ├── SOSButton.tsx
│   │   ├── HospitalLocator.tsx
│   │   └── EmergencyContactList.tsx
│   ├── telemedicine/             # Telemedicine components
│   │   ├── VideoRoom.tsx
│   │   ├── ChatInterface.tsx
│   │   └── PrescriptionForm.tsx
│   ├── analytics/                # Analytics components
│   │   ├── DashboardWidget.tsx
│   │   ├── ChartWrapper.tsx
│   │   └── ReportGenerator.tsx
│   └── layout/                   # Layout components
│       ├── MainLayout.tsx
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication utilities
│   │   ├── next-auth.config.ts
│   │   ├── session.ts
│   │   └── permissions.ts
│   ├── db/                       # Database configuration
│   │   ├── prisma.ts             # Prisma client instance
│   │   └── seed.ts               # Database seeding script
│   ├── validation/               # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── health.schema.ts
│   │   └── appointment.schema.ts
│   ├── api/                      # API client utilities
│   │   ├── axios.config.ts
│   │   └── endpoints.ts
│   ├── file-upload/              # File handling
│   │   ├── file-storage.ts       # Local file system storage
│   │   └── virus-scan.ts
│   ├── notifications/            # Notification services
│   │   ├── sms.service.ts
│   │   ├── email.service.ts
│   │   └── push.service.ts
│   ├── analytics/                # Analytics utilities
│   │   ├── risk-calculator.ts
│   │   └── health-trends.ts
│   ├── emergency/                # Emergency services
│   │   ├── gps.service.ts
│   │   └── hospital-locator.ts
│   └── utils/                    # Helper functions
│       ├── date-formatter.ts
│       ├── validators.ts
│       └── constants.ts
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Database schema definition
│   ├── migrations/               # Database migration files
│   └── seed/                     # Seed data scripts
│       ├── users.ts
│       ├── hospitals.ts
│       └── index.ts
│
├── types/                        # TypeScript type definitions
│   ├── user.types.ts
│   ├── health.types.ts
│   ├── appointment.types.ts
│   ├── emergency.types.ts
│   └── api.types.ts
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useHealthMetrics.ts
│   ├── useAppointments.ts
│   ├── useNotifications.ts
│   ├── useEmergency.ts
│   └── useAnalytics.ts
│
├── contexts/                     # React contexts
│   ├── AuthContext.tsx
│   ├── HealthContext.tsx
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
│
├── middleware.ts                 # Next.js middleware for auth
├── next.config.js                # Next.js configuration
└── .env                          # Environment variables (DATABASE_URL, etc.)
```

## User Roles & Permissions

### Role Hierarchy
1. **Admin** (Highest) - Full system access
2. **PHI** - Regional health statistics, no patient identifiable data
3. **Doctor** - Prescribe, mark high-risk, full patient access
4. **Nurse** - View/update assigned patients, no prescription rights
5. **Mother** (Base) - Own health data only

### Key Permissions
- **Mother**: View/update own metrics, schedule appointments, emergency SOS
- **Nurse**: All Mother + manage assigned patients, add health metrics
- **Doctor**: All Nurse + prescribe medications, telemedicine, mark high-risk
- **PHI**: Aggregated statistics, anonymized data, regional reports
- **Admin**: User management, system config, audit logs, all data access

## ## Prisma Schema Design

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  MOTHER
  MIDWIFE
  DOCTOR
  PHI
  ADMIN
}

enum Language {
  SINHALA
  TAMIL
  ENGLISH
}

enum RiskLevel {
  LOW
  MODERATE
  HIGH
  CRITICAL
}

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
}

enum MetricType {
  WEIGHT
  BLOOD_PRESSURE_SYSTOLIC
  BLOOD_PRESSURE_DIASTOLIC
  BLOOD_GLUCOSE
  HEMOGLOBIN
  FETAL_HEART_RATE
  FUNDAL_HEIGHT
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  MISSED
}

enum AppointmentType {
  ROUTINE_CHECKUP
  ULTRASOUND
  BLOOD_TEST
  CONSULTATION
  EMERGENCY
}

enum EmergencyType {
  SEVERE_BLEEDING
  SEVERE_ABDOMINAL_PAIN
  HIGH_BLOOD_PRESSURE
  PREMATURE_LABOR
  REDUCED_FETAL_MOVEMENT
  OTHER
}

enum EmergencyStatus {
  ACTIVE
  RESPONDED
  RESOLVED
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String
  role            UserRole
  firstName       String
  lastName        String
  phoneNumber     String
  language        Language  @default(ENGLISH)
  profileImage    String?
  isVerified      Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Role-specific profiles
  motherProfile   MotherProfile?
  doctorProfile   DoctorProfile?
  midwifeProfile  MidwifeProfile?
  phiProfile      PHIProfile?

  // Relations
  healthMetrics   HealthMetric[]
  appointments    Appointment[]    @relation("PatientAppointments")
  providerAppointments Appointment[] @relation("ProviderAppointments")
  emergencyAlerts EmergencyAlert[]
  prescriptions   Prescription[]   @relation("PrescribedBy")
  patientPrescriptions Prescription[] @relation("PatientPrescriptions")

  @@index([email])
  @@index([role])
}

model MotherProfile {
  id                    String    @id @default(uuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  dateOfBirth           DateTime
  nic                   String    @unique
  
  // Address
  street                String
  city                  String
  district              String
  postalCode            String
  
  expectedDeliveryDate  DateTime
  pregnancyWeek         Int
  bloodType             BloodType
  riskLevel             RiskLevel @default(LOW)
  
  // Medical History
  previousPregnancies   Int       @default(0)
  previousCesareans     Int       @default(0)
  previousMiscarriages  Int       @default(0)
  chronicConditions     String[]
  allergies             String[]
  currentMedications    String[]
  familyHistory         String[]
  
  // Assignments
  assignedMidwifeId     String?
  assignedMidwife       MidwifeProfile? @relation(fields: [assignedMidwifeId], references: [id])
  assignedDoctorId      String?
  assignedDoctor        DoctorProfile?  @relation(fields: [assignedDoctorId], references: [id])
  
  emergencyContacts     EmergencyContact[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([nic])
  @@index([district])
  @@index([riskLevel])
  @@index([assignedMidwifeId])
  @@index([assignedDoctorId])
}

model EmergencyContact {
  id              String         @id @default(uuid())
  motherProfileId String
  motherProfile   MotherProfile  @relation(fields: [motherProfileId], references: [id], onDelete: Cascade)
  
  name            String
  relationship    String
  phoneNumber     String
  isPrimary       Boolean        @default(false)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model DoctorProfile {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  licenseNumber     String    @unique
  specialization    String
  hospital          String
  experienceYears   Int
  consultationFee   Float
  
  assignedPatients  MotherProfile[]
  availableSlots    AppointmentSlot[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([licenseNumber])
}

model MidwifeProfile {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  licenseNumber     String    @unique
  assignedRegion    String
  
  assignedPatients  MotherProfile[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([licenseNumber])
  @@index([assignedRegion])
}

model PHIProfile {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  employeeId        String    @unique
  assignedDistrict  String
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([employeeId])
  @@index([assignedDistrict])
}

model AppointmentSlot {
  id              String         @id @default(uuid())
  doctorProfileId String
  doctorProfile   DoctorProfile  @relation(fields: [doctorProfileId], references: [id], onDelete: Cascade)
  
  dayOfWeek       Int            // 0-6 (Sunday-Saturday)
  startTime       String         // HH:mm format
  endTime         String
  maxBookings     Int
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model HealthMetric {
  id          String      @id @default(uuid())
  motherId    String
  mother      User        @relation(fields: [motherId], references: [id], onDelete: Cascade)
  
  type        MetricType
  value       Float
  unit        String
  notes       String?
  
  recordedAt  DateTime    @default(now())
  recordedBy  String      // User ID who recorded
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([motherId, type, recordedAt])
  @@index([recordedAt])
}

model Appointment {
  id              String            @id @default(uuid())
  motherId        String
  mother          User              @relation("PatientAppointments", fields: [motherId], references: [id], onDelete: Cascade)
  
  providerId      String
  provider        User              @relation("ProviderAppointments", fields: [providerId], references: [id])
  providerType    String            // 'doctor' or 'midwife'
  
  type            AppointmentType
  scheduledDate   DateTime
  duration        Int               // in minutes
  status          AppointmentStatus @default(SCHEDULED)
  
  // Location
  hospitalId      String?
  clinicId        String?
  address         String?
  
  notes           String?
  reminderSent    Boolean           @default(false)
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([motherId, scheduledDate])
  @@index([providerId, scheduledDate])
  @@index([status])
}

model Prescription {
  id              String    @id @default(uuid())
  motherId        String
  mother          User      @relation("PatientPrescriptions", fields: [motherId], references: [id], onDelete: Cascade)
  
  prescribedById  String
  prescribedBy    User      @relation("PrescribedBy", fields: [prescribedById], references: [id])
  
  medications     Json      // Array of medication objects
  instructions    String
  
  prescribedDate  DateTime  @default(now())
  validUntil      DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([motherId, prescribedDate])
}

model EmergencyAlert {
  id              String          @id @default(uuid())
  motherId        String
  mother          User            @relation(fields: [motherId], references: [id], onDelete: Cascade)
  
  type            EmergencyType
  description     String
  status          EmergencyStatus @default(ACTIVE)
  
  // Location
  latitude        Float
  longitude       Float
  address         String?
  
  responders      String[]        // Array of User IDs notified
  
  resolvedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([motherId, status])
  @@index([createdAt])
}

model Hospital {
  id                String    @id @default(uuid())
  name              String
  type              String    // 'government' or 'private'
  
  // Location
  latitude          Float
  longitude         Float
  address           String
  city              String
  district          String
  
  contactNumber     String
  emergencyNumber   String
  
  hasMaternityWard  Boolean   @default(false)
  availableBeds     Int       @default(0)
  facilities        String[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([district])
  @@index([latitude, longitude])
}

model MedicalDocument {
  id              String    @id @default(uuid())
  motherId        String
  
  fileName        String
  fileUrl         String
  fileSize        Int
  mimeType        String
  
  documentType    String    // 'lab_report', 'prescription', 'ultrasound', etc.
  description     String?
  
  uploadedAt      DateTime  @default(now())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([motherId, documentType])
}
```

## Core Type Definitions

```typescript
// types/index.ts
export enum UserRole {
  MOTHER = 'MOTHER',
  MIDWIFE = 'MIDWIFE',
  DOCTOR = 'DOCTOR',
  PHI = 'PHI',
  ADMIN = 'ADMIN'
}

export enum Language {
  SINHALA = 'SINHALA',
  TAMIL = 'TAMIL',
  ENGLISH = 'ENGLISH'
}

export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum MetricType {
  WEIGHT = 'WEIGHT',
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  HEMOGLOBIN = 'HEMOGLOBIN',
  FETAL_HEART_RATE = 'FETAL_HEART_RATE',
  FUNDAL_HEIGHT = 'FUNDAL_HEIGHT'
}

// Import Prisma types
import { User, MotherProfile, HealthMetric, Appointment, EmergencyAlert } from '@prisma/client';

// Extended types with relations
export type MotherWithRelations = MotherProfile & {
  user: User;
  assignedMidwife?: MidwifeProfile & { user: User };
  assignedDoctor?: DoctorProfile & { user: User };
  emergencyContacts: EmergencyContact[];
};

export type AppointmentWithRelations = Appointment & {
  mother: User;
  provider: User;
};
```

## System Functionalities

### For Mothers
- Health tracking dashboard (weight, BP, glucose, fetal movement)
- Appointment scheduling and reminders
- Medication reminders
- Educational content (trimester-specific, multi-language)
- Emergency SOS with GPS
- Nutrition and exercise guidance
- Symptom checker
- Contraction timer

### For Healthcare Providers
- Patient management with comprehensive profiles
- Health record management
- Appointment scheduling with availability
- Prescription management
- Telemedicine video consultations
- Referral system
- Alert management for high-risk patients
- Report generation

### For Public Health Officials
- Real-time maternal health statistics
- Geographic heat maps
- Resource planning insights
- Outbreak monitoring
- Program evaluation
- Data export for policy-making
- Quality metrics tracking

### For Administrators
- User management (CRUD)
- Role assignment
- System configuration
- Audit logs
- Hospital/clinic registry
- Integration management
- Performance monitoring

## Security Guidelines

### Authentication & Authorization
- NextAuth.js with JWT tokens and refresh tokens
- Role-based access control (RBAC)
- Email/SMS OTP verification
- Session timeout and re-authentication
- Middleware for route protection
- Principle of least privilege

### Data Protection
- End-to-end encryption for health data
- HTTPS only in production
- Environment variables for secrets
- Bcrypt password hashing
- HIPAA-compliant data handling
- GDPR compliance
- Data anonymization for analytics

### API Security
- Rate limiting on all endpoints
- CSRF protection
- Input sanitization (XSS prevention)
- Parameterized queries (NoSQL injection prevention)
- File upload validation and virus scanning
- API versioning
- Request/response logging

## Database Guidelines

### PostgreSQL Best Practices
- Use Prisma ORM for type-safe database queries
- Implement proper indexing on frequently queried fields
- Use database transactions for data consistency
- Implement row-level security for sensitive health data
- Use PostgreSQL's JSON type for flexible medical data storage
- Implement soft deletes with deletedAt timestamp (add to schema if needed)
- Use PostgreSQL full-text search for medical records

### Key Indexes (Already in Schema)
```typescript
// User table
@@index([email])
@@index([role])

// MotherProfile table
@@index([nic])
@@index([district])
@@index([riskLevel])
@@index([assignedMidwifeId])
@@index([assignedDoctorId])

// HealthMetric table
@@index([motherId, type, recordedAt])

// Appointment table
@@index([motherId, scheduledDate])
@@index([providerId, scheduledDate])

// Hospital table - for geospatial queries
@@index([latitude, longitude])
```

## UI/UX Component Guidelines

### shadcn/ui Components
- Button: Actions, CTAs, form submissions
- Card: Content containers, metric displays
- Dialog: Modals, confirmations
- Form: All data input with React Hook Form
- Input: Text fields with validation
- Select: Dropdowns
- Table: Data listings
- Toast: Notifications
- Badge: Status indicators, risk levels
- Avatar: User profiles
- Sheet: Slide-out panels

### Lucide Icons Setup
```typescript
// components/icons/index.tsx
import {
  Heart,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Video,
  Bell,
  TrendingUp,
  TrendingDown,
  Ambulance,
  Hospital,
  Baby
} from 'lucide-react';

export const Icons = {
  Heart,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Video,
  Bell,
  TrendingUp,
  TrendingDown,
  Ambulance,
  Hospital,
  Baby
};
```

### Component Example
```typescript
// components/molecules/HealthMetricCard.tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { MetricType, RiskLevel } from '@/types/health.types';

interface HealthMetricCardProps {
  type: MetricType;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  riskLevel?: RiskLevel;
  lastUpdated: Date;
}

export function HealthMetricCard({
  type,
  value,
  unit,
  trend,
  riskLevel,
  lastUpdated
}: HealthMetricCardProps) {
  const getIcon = () => {
    switch (type) {
      case MetricType.WEIGHT:
        return <Icons.Activity className="w-5 h-5" />;
      case MetricType.BLOOD_PRESSURE_SYSTOLIC:
        return <Icons.Heart className="w-5 h-5" />;
      default:
        return <Icons.Activity className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="text-sm font-medium">{type}</h3>
        </div>
        {riskLevel && (
          <Badge variant={riskLevel === RiskLevel.HIGH ? 'destructive' : 'default'}>
            {riskLevel}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{unit}</p>
          </div>
          {trend === 'up' && <Icons.TrendingUp className="w-4 h-4 text-green-500" />}
          {trend === 'down' && <Icons.TrendingDown className="w-4 h-4 text-red-500" />}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date(lastUpdated).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
```

## API Design Standards
```typescript
// types/api.types.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  timestamp: Date;
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Example API usage with Prisma
// app/api/health/metrics/route.ts
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const motherId = searchParams.get('motherId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const metrics = await prisma.healthMetric.findMany({
    where: { motherId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { recordedAt: 'desc' },
  });

  const total = await prisma.healthMetric.count({ where: { motherId } });

  return NextResponse.json({
    success: true,
    data: metrics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    },
  });
}
```

## Multi-Language Support

### Implementation
- Use next-intl or react-i18next
- Support Sinhala (si), Tamil (ta), English (en)
- Store preference in user profile
- Language switcher in header
- Complete translations for all UI text
- Medical terminology reviewed by professionals
- Fallback to English for missing translations

```typescript
// lib/i18n/config.ts
export const languages = ['en', 'si', 'ta'] as const;
export type Language = typeof languages[number];

export const languageNames: Record<Language, string> = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்'
};
```

## Notification System

### Multi-Channel Notifications

```typescript
// lib/notifications/notification.service.ts
interface NotificationService {
  sendSMS(to: string, message: string): Promise<void>;
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendPush(userId: string, title: string, body: string): Promise<void>;
}

// Notification Types
enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  MEDICATION_REMINDER = 'medication_reminder',
  LAB_RESULT = 'lab_result',
  EMERGENCY_ALERT = 'emergency_alert',
  PREGNANCY_MILESTONE = 'pregnancy_milestone',
  HIGH_RISK_ALERT = 'high_risk_alert'
}
```

### Notification Triggers
- Appointment reminders (24h and 1h before)
- Medication reminders (user-configured)
- Lab result availability
- Emergency alerts to contacts
- Weekly pregnancy milestones
- High-risk alerts to providers

## Performance Guidelines

### Frontend Optimization
- React.memo for expensive renders
- Pagination (20 items per page)
- Next.js Image component
- Code splitting per route
- Service workers for PWA
- Skeleton loaders

### Backend Optimization
- Prisma query optimization with select and include
- Database connection pooling
- Proper indexing
- Query result caching

### Performance Targets
- Page load: < 2 seconds
- API response: < 500ms
- Support 10,000+ concurrent users

## Testing Strategy

### Unit Tests (Jest)
- Utility functions
- React components (React Testing Library)
- API endpoints
- Prisma queries
- All of  code coverage

### Integration Tests
- Authentication flows
- Health metric submission
- Appointment booking
- Emergency alert system

### E2E Tests (Playwright)
- User registration and login
- Health tracking workflow
- Emergency SOS
- Telemedicine consultation

## Expected Deliverables
1. **Full Web Application** - Next.js with TypeScript, responsive, PWA, multi-language
2. **Component Library** - Reusable shadcn/ui components with Lucide icons
3. **Backend API** - RESTful with Prisma ORM, NextAuth.js, Socket.io
4. **Database** - PostgreSQL with Prisma migrations and seed scripts
5. **Docker Setup** - Multi-container with PostgreSQL
6. **Documentation** - README, API docs, Prisma schema docs, README-Development, Component, all of them in the /docs folder
7. **Testing Suite** - Unit, integration, E2E tests
8. **Admin Dashboard** - User management, analytics, system config
9. **Analytics & Reporting** - Real-time dashboards with Recharts
10. **Security** - NextAuth.js, JWT, HTTPS, rate limiting, encryption

## Quality Standards
- TypeScript strict mode
- ESLint + Prettier
- Lighthouse score > 90
- WCAG 2.1 Level AA
- Mobile-first design
- Cross-browser compatible

## Success Metrics
- < 2s page load
- < 500ms API response
- Zero critical vulnerabilities
- 10,000+ concurrent users support
- < 3s emergency response time