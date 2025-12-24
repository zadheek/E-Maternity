import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createNewProviders() {
  console.log('🏥 Creating new provider accounts...');

  // Generate secure passwords
  const doctorPassword = 'DrMed2025@Secure!';
  const midwifePassword = 'MidCare2025@Safe!';

  const hashedDoctorPassword = await bcrypt.hash(doctorPassword, 10);
  const hashedMidwifePassword = await bcrypt.hash(midwifePassword, 10);

  try {
    // Create Doctor
    const doctor = await prisma.user.create({
      data: {
        email: 'dr.samantha@ematernity.lk',
        password: hashedDoctorPassword,
        role: 'DOCTOR',
        firstName: 'Samantha',
        lastName: 'Perera',
        phoneNumber: '+94771234501',
        language: 'ENGLISH',
        isVerified: true,
        doctorProfile: {
          create: {
            licenseNumber: 'SLMC-2025-001',
            specialization: 'Obstetrics and Gynecology',
            hospital: 'Castle Street Hospital for Women',
            experienceYears: 12,
            consultationFee: 3500,
          },
        },
      },
    });

    console.log('✅ Doctor account created:', doctor.email);

    // Create Midwife
    const midwife = await prisma.user.create({
      data: {
        email: 'nirmala.midwife@ematernity.lk',
        password: hashedMidwifePassword,
        role: 'MIDWIFE',
        firstName: 'Nirmala',
        lastName: 'Jayasinghe',
        phoneNumber: '+94771234502',
        language: 'SINHALA',
        isVerified: true,
        midwifeProfile: {
          create: {
            licenseNumber: 'SLNC-2025-002',
            assignedRegion: 'Colombo District',
          },
        },
      },
    });

    console.log('✅ Midwife account created:', midwife.email);

    console.log('\n🎉 New provider accounts created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👨‍⚕️ Doctor:');
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Password: ${doctorPassword}`);
    console.log('\n👩‍⚕️ Midwife:');
    console.log(`   Email: ${midwife.email}`);
    console.log(`   Password: ${midwifePassword}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2002') {
      console.log('⚠️  Accounts already exist. Skipping creation.');
    } else {
      console.error('❌ Error creating providers:', error);
      throw error;
    }
  }
}

async function main() {
  try {
    await createNewProviders();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
