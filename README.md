# E-Maternity - Maternal Health Management System

A digital health platform for prenatal and postnatal care management in Sri Lanka.

## Overview

E-Maternity connects expectant mothers with healthcare providers for continuous monitoring and care coordination.

**Status**: Production Ready  
**Build Time**: ~90 seconds  
**Database**: PostgreSQL with Prisma ORM

## Key Features

### For Mothers
- Health metrics tracking (blood pressure, weight, glucose, hemoglobin, fetal heart rate)
- Appointment scheduling with reminders
- Emergency SOS with GPS location
- NIC-based login (no email required)
- Vitamin and immunization tracking
- Automated risk assessment
- Multi-language support (English, Sinhala, Tamil)

### For Healthcare Providers
- Doctor: Universal patient access, prescriptions, vitamin management
- Midwife: Assigned patient care, immunization records
- Admin: User management, hospital database, analytics

## Technology Stack

- **Frontend**: Next.js 16.1.0, React 19.2.3, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM 7.2.0
- **Database**: PostgreSQL 16
- **Authentication**: NextAuth.js 4.24.13 (email + NIC login)
- **Real-time**: Socket.io
- **Deployment**: Docker & Docker Compose

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Login, registration, NIC login
│   ├── (dashboard)/            # Mother, doctor, midwife, admin dashboards
│   └── api/                    # API endpoints
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── health/                 # Health tracking components
│   ├── vitamins/               # Vitamin management
│   ├── immunizations/          # Immunization tracking
│   └── emergency/              # SOS system
│
├── lib/
│   ├── auth/                   # Authentication utilities
│   ├── db/                     # Database configuration
│   ├── validation/             # Zod schemas
│   └── risk-assessment/        # Risk calculation
│
└── types/                      # TypeScript definitions

prisma/
├── schema.prisma               # Database schema (18 models)
└── migrations/                 # Migration history
```

## Database Models

18 models covering:
- User System: User, MotherProfile, DoctorProfile, MidwifeProfile
- Health System: HealthMetric, Prescription, VitaminRecord, ImmunizationRecord, MedicalDocument
- Appointment System: Appointment, AppointmentSlot
- Emergency System: EmergencyAlert, Hospital
- Pregnancy Tracking: AbnormalBabyHistory, Complication

## API Routes

**Authentication**
- POST /api/auth/register
- POST /api/auth/nic-login
- POST /api/auth/[...nextauth]

**Health Metrics**
- GET/POST /api/health/metrics
- GET /api/health/metrics/trends

**Vitamins & Immunizations**
- GET/POST /api/vitamins
- GET/POST /api/immunizations

**Appointments**
- GET/POST /api/appointments
- GET /api/appointments/available

**Emergency**
- POST /api/emergency
- GET /api/emergency/nearby-hospitals

**Mother Management**
- GET /api/mothers
- GET /api/mothers/search
- POST /api/mothers/[id]/complications

**Doctor**
- GET /api/doctors/all-patients
- POST /api/doctors/prescriptions

**Admin**
- GET /api/admin/stats
- GET /api/admin/users
- GET /api/admin/hospitals

## Security Features

- **Encryption**: AES-256-GCM for PHI, TLS 1.2+ in transit
- **Authentication**: NextAuth with JWT, email + NIC-based login
- **Authorization**: Role-based access control (RBAC)
- **Audit Logging**: All PHI access tracked
- **Rate Limiting**: Brute force protection
- **Input Validation**: Zod schemas + DOMPurify sanitization

## Quick Start

### Prerequisites
- Node.js 20.18.3+
- PostgreSQL 16+
- Docker (optional)

### Installation

1. **Clone and Install**
```powershell
git clone <repository-url>
cd e-maternity
npm install
```

2. **Setup Environment**
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/e_maternity"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="another-secret-key-here"
ENCRYPTION_KEY="hex-encoded-32-byte-key"
```

3. **Initialize Database**
```powershell
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

4. **Start Development Server**
```powershell
npm run dev
```
Open http://localhost:3000

### Test Accounts

**Mother (NIC Login)**
- NIC: `199012345678`
- Password: `Mother@123`

**Doctor**
- Email: `doctor1@ematernity.lk`
- Password: `Doctor@123`

**Midwife**
- Email: `midwife1@ematernity.lk`
- Password: `Midwife@123`

**Admin**
- Email: `admin@ematernity.lk`
- Password: `Admin@123`

## Docker Deployment

**Development**
```powershell
docker compose -f docker-compose.dev.yml up
```

**Production**
```powershell
docker compose up -d
```

Build time: ~90 seconds

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Security Documentation](docs/SECURITY.md) - Security best practices
- [HIPAA Compliance](docs/HIPAA-COMPLIANCE.md) - Healthcare compliance
- [Production Readiness](docs/PRODUCTION-READINESS.md) - Pre-deployment checklist
- [December 2025 Updates](docs/DECEMBER-2025-ENHANCEMENTS.md) - New features

## HIPAA Compliance

Technical safeguards implemented (100%):
- Access control with unique user identification
- Audit controls with comprehensive logging
- Encryption at rest (AES-256-GCM) and in transit (TLS 1.2+)
- Automatic session timeout

Administrative safeguards in progress (60%):
- Risk analysis and management completed
- Security and privacy officers need assignment
- Workforce training materials needed
- Business associate agreements required

Overall compliance: 75%

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Run tests (`npm run test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open pull request

## License

MIT License - see LICENSE file for details.

## Support

- Issues: [GitHub Issues](https://github.com/your-username/e-maternity/issues)
- Email: support@ematernity.lk
- Emergency: emergency@ematernity.lk

---

Made for maternal health in Sri Lanka
