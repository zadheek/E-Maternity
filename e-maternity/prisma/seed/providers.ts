import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedProviders() {
  console.log('👨‍⚕️ Seeding healthcare providers...');

  // For seeding purposes only - using a pre-hashed password for "Provider123!"
  // Generated with: bcrypt.hash('Provider123!', 10)
  const hashedPassword = '$2a$10$rNc5eXzQJQkQ7YkG5zK5ZuP5JiCJDr5.5eYvF6yFjLXaJ3QeJ5LYK';

  // Doctors
  const doctors = [
    {
      email: 'dr.perera@ematernity.lk',
      firstName: 'Samantha',
      lastName: 'Perera',
      phoneNumber: '+94771234567',
      specialization: 'Obstetrics and Gynecology',
      hospital: 'Castle Street Hospital for Women',
      licenseNumber: 'SLMC12345',
      experienceYears: 15,
      consultationFee: 3000,
    },
    {
      email: 'dr.fernando@ematernity.lk',
      firstName: 'Rohan',
      lastName: 'Fernando',
      phoneNumber: '+94771234568',
      specialization: 'Maternal-Fetal Medicine',
      hospital: 'De Soysa Hospital for Women',
      licenseNumber: 'SLMC12346',
      experienceYears: 20,
      consultationFee: 5000,
    },
    {
      email: 'dr.silva@ematernity.lk',
      firstName: 'Priya',
      lastName: 'Silva',
      phoneNumber: '+94771234569',
      specialization: 'Obstetrics and Gynecology',
      hospital: 'Durdans Hospital',
      licenseNumber: 'SLMC12347',
      experienceYears: 12,
      consultationFee: 4500,
    },
    {
      email: 'dr.jayawardena@ematernity.lk',
      firstName: 'Nimal',
      lastName: 'Jayawardena',
      phoneNumber: '+94771234570',
      specialization: 'High-Risk Pregnancy',
      hospital: 'Lanka Hospitals',
      licenseNumber: 'SLMC12348',
      experienceYears: 18,
      consultationFee: 6000,
    },
    {
      email: 'dr.wijesinghe@ematernity.lk',
      firstName: 'Amali',
      lastName: 'Wijesinghe',
      phoneNumber: '+94771234571',
      specialization: 'Obstetrics and Gynecology',
      hospital: 'Teaching Hospital Peradeniya',
      licenseNumber: 'SLMC12349',
      experienceYears: 10,
      consultationFee: 2500,
    },
  ];

  // Midwives
  const midwives = [
    {
      email: 'midwife.rathnayake@ematernity.lk',
      firstName: 'Kumari',
      lastName: 'Rathnayake',
      phoneNumber: '+94771234572',
      licenseNumber: 'MW12345',
      assignedRegion: 'Colombo 08',
    },
    {
      email: 'midwife.de-silva@ematernity.lk',
      firstName: 'Nadeeka',
      lastName: 'De Silva',
      phoneNumber: '+94771234573',
      licenseNumber: 'MW12346',
      assignedRegion: 'Dehiwala',
    },
    {
      email: 'midwife.gunasekara@ematernity.lk',
      firstName: 'Sujatha',
      lastName: 'Gunasekara',
      phoneNumber: '+94771234574',
      licenseNumber: 'MW12347',
      assignedRegion: 'Moratuwa',
    },
    {
      email: 'midwife.wickramasinghe@ematernity.lk',
      firstName: 'Champa',
      lastName: 'Wickramasinghe',
      phoneNumber: '+94771234575',
      licenseNumber: 'MW12348',
      assignedRegion: 'Gampaha',
    },
    {
      email: 'midwife.bandara@ematernity.lk',
      firstName: 'Manel',
      lastName: 'Bandara',
      phoneNumber: '+94771234576',
      licenseNumber: 'MW12349',
      assignedRegion: 'Negombo',
    },
  ];

  let created = 0;

  // Create doctors
  for (const doctor of doctors) {
    try {
      await prisma.user.create({
        data: {
          email: doctor.email,
          password: hashedPassword,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          phoneNumber: doctor.phoneNumber,
          role: 'DOCTOR',
          language: 'ENGLISH',
          isVerified: true,
          doctorProfile: {
            create: {
              licenseNumber: doctor.licenseNumber,
              specialization: doctor.specialization,
              hospital: doctor.hospital,
              experienceYears: doctor.experienceYears,
              consultationFee: doctor.consultationFee,
            },
          },
        },
      });
      created++;
      console.log(`✅ Created doctor: Dr. ${doctor.firstName} ${doctor.lastName}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏩ Doctor already exists: Dr. ${doctor.firstName} ${doctor.lastName}`);
      } else {
        console.error(`❌ Error creating doctor ${doctor.firstName} ${doctor.lastName}:`, error.message);
      }
    }
  }

  // Create midwives
  for (const midwife of midwives) {
    try {
      await prisma.user.create({
        data: {
          email: midwife.email,
          password: hashedPassword,
          firstName: midwife.firstName,
          lastName: midwife.lastName,
          phoneNumber: midwife.phoneNumber,
          role: 'MIDWIFE',
          language: 'ENGLISH',
          isVerified: true,
          midwifeProfile: {
            create: {
              licenseNumber: midwife.licenseNumber,
              assignedRegion: midwife.assignedRegion,
            },
          },
        },
      });
      created++;
      console.log(`✅ Created midwife: ${midwife.firstName} ${midwife.lastName}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏩ Midwife already exists: ${midwife.firstName} ${midwife.lastName}`);
      } else {
        console.error(`❌ Error creating midwife ${midwife.firstName} ${midwife.lastName}:`, error.message);
      }
    }
  }

  console.log(`\n👨‍⚕️ Provider seeding completed: ${created} new providers added`);
}

async function main() {
  try {
    await seedProviders();
  } catch (error) {
    console.error('Error seeding providers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
