# E-Maternity - Smart Maternal Health Management System

## 🎯 Project Overview

The **E-Maternity Smart Maternal Health Management System** is a comprehensive digital health platform designed for Sri Lanka's maternal healthcare ecosystem. It addresses critical gaps in prenatal and postnatal care by providing continuous health monitoring, emergency response coordination, and data-driven insights for expectant mothers, healthcare providers, and public health officials.

## ✨ Key Features

### For Mothers
- 📊 **Health Tracking Dashboard** - Monitor weight, blood pressure, glucose, and fetal health metrics
- 📅 **Appointment Management** - Schedule and manage appointments with automated reminders
- 💊 **Medication Reminders** - Never miss your medications
- 🆘 **Emergency SOS** - Instant emergency alerts with GPS location to providers
- 🎥 **Telemedicine** - Video consultations with doctors and midwives
- 📚 **Educational Resources** - Trimester-specific content in Sinhala, Tamil, and English

### For Healthcare Providers
- 👥 **Patient Management** - Comprehensive patient profiles
- 💊 **Prescription System** - Digital prescriptions
- ⚠️ **High-Risk Alerts** - Automatic notifications
- 🎥 **Telemedicine Tools** - Video consultations

### For Public Health Officials
- 📈 **Real-time Statistics** - Maternal health trends
- 🗺️ **Geographic Insights** - Regional analysis
- 📊 **Resource Planning** - Data-driven insights

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL 16 with Prisma ORM
- **Real-time**: Socket.io
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16 (or Docker)
- npm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

3. **Start PostgreSQL** (using Docker)
   ```bash
   npm run docker:up
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Seed the database** (hospitals and providers)
   ```bash
   npx tsx prisma/seed/hospitals.ts
   npx tsx prisma/seed/providers.ts
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio

npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
```

## 🔐 User Roles

1. **Mother** - Own health data, appointments, emergency features
2. **Midwife** - Manage assigned patients
3. **Doctor** - Full patient access, prescriptions
4. **PHI** - Statistics and reports
5. **Admin** - Full system access

## 📊 Database Schema

Main models:
- User (with role-based profiles)
- MotherProfile
- DoctorProfile, MidwifeProfile, PHIProfile
- HealthMetric
- Appointment
- EmergencyAlert
- Prescription
- Hospital
- MedicalDocument

## 🎨 Design System

**Colors:**
- Primary: #E91E63 (Pink)
- Secondary: #00BCD4 (Cyan)
- Accent: #FF9800 (Orange)
- Success: #4CAF50
- Error: #F44336

**Font:** Inter (Google Fonts)

## 🌍 Multi-Language Support

- 🇬🇧 English
- 🇱🇰 සිංහල (Sinhala)
- 🇱🇰 தமிழ் (Tamil)

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Health
- `GET /api/health/metrics` - Get health metrics
- `POST /api/health/metrics` - Create health metric

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment

### Emergency
- `POST /api/emergency` - Create emergency alert
- `GET /api/emergency` - Get emergency alerts

## 🚧 Development Status

### ✅ Completed Features
- ✅ Project setup and configuration (Next.js 16.1.0, TypeScript, Prisma 7.2.0)
- ✅ Database schema with 14 models (PostgreSQL 16)
- ✅ Authentication system (NextAuth.js with JWT)
- ✅ User registration (3-step form with validation)
- ✅ Login with role-based access control
- ✅ Core UI components (shadcn/ui + Lucide icons)
- ✅ **Mother Dashboard** - Real pregnancy data with progress tracking
- ✅ **Health Metrics System** - Record and view 7 types of health measurements
- ✅ **Appointments System** - View and schedule appointments with doctors/midwives
- ✅ **Emergency SOS System** - GPS-enabled alerts with nearby hospital locator
- ✅ Hospital database seeded (12 hospitals across Sri Lanka)
- ✅ Healthcare providers seeded (5 doctors + 5 midwives)

### 🚧 In Progress
- Telemedicine video consultation
- Multi-language i18n (Sinhala, Tamil, English)

### 📋 Planned Features
- Doctor/Midwife/PHI/Admin dashboards
- SMS/Email notifications (Twilio, Resend)
- Health metrics data visualization (charts)
- Analytics & reporting dashboards
- Medication reminders
- Educational content system
- PWA configuration
- Testing suite (Jest, React Testing Library, Playwright)

## 🔒 Security

- NextAuth.js with JWT
- Role-based access control
- bcrypt password hashing
- Input validation with Zod
- Prisma ORM (SQL injection prevention)
- Route protection middleware

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Ministry of Health, Sri Lanka
- Healthcare providers and maternal health experts
- Open source community

---

Made with ❤️ for maternal health in Sri Lanka
