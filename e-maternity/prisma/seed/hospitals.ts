import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedHospitals() {
  console.log('🏥 Seeding hospitals...');

  const hospitals = [
    // Colombo District
    {
      name: 'Castle Street Hospital for Women',
      type: 'government',
      latitude: 6.9271,
      longitude: 79.8612,
      address: 'No. 96, Castle Street, Colombo 08',
      city: 'Colombo',
      district: 'Colombo',
      contactNumber: '+94112695911',
      emergencyNumber: '+94112695911',
      hasMaternityWard: true,
      availableBeds: 250,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'C-Section', 'Ultrasound'],
    },
    {
      name: 'De Soysa Hospital for Women',
      type: 'government',
      latitude: 6.9195,
      longitude: 79.8596,
      address: 'De Soysa Maternity Hospital, Colombo 08',
      city: 'Colombo',
      district: 'Colombo',
      contactNumber: '+94112691911',
      emergencyNumber: '+94112691911',
      hasMaternityWard: true,
      availableBeds: 300,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'High-Risk Pregnancy Unit', 'Ultrasound'],
    },
    {
      name: 'Durdans Hospital',
      type: 'private',
      latitude: 6.8919,
      longitude: 79.8585,
      address: 'No. 3, Alfred Place, Colombo 03',
      city: 'Colombo',
      district: 'Colombo',
      contactNumber: '+94115140000',
      emergencyNumber: '+94115140000',
      hasMaternityWard: true,
      availableBeds: 50,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'Private Rooms', 'C-Section', 'Ultrasound'],
    },
    {
      name: 'Lanka Hospitals',
      type: 'private',
      latitude: 6.8939,
      longitude: 79.8589,
      address: '578, Elvitigala Mawatha, Colombo 05',
      city: 'Colombo',
      district: 'Colombo',
      contactNumber: '+94115430000',
      emergencyNumber: '+94115430000',
      hasMaternityWard: true,
      availableBeds: 80,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'Private Rooms', 'C-Section', 'Ultrasound', 'Genetic Counseling'],
    },
    // Gampaha District
    {
      name: 'Gampaha District General Hospital',
      type: 'government',
      latitude: 7.0907,
      longitude: 79.9951,
      address: 'Yakkala Road, Gampaha',
      city: 'Gampaha',
      district: 'Gampaha',
      contactNumber: '+94332222261',
      emergencyNumber: '+94332222261',
      hasMaternityWard: true,
      availableBeds: 200,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'C-Section', 'Ultrasound'],
    },
    {
      name: 'Ragama Teaching Hospital',
      type: 'government',
      latitude: 7.0254,
      longitude: 79.9171,
      address: 'Regent Street, Ragama',
      city: 'Ragama',
      district: 'Gampaha',
      contactNumber: '+94112958337',
      emergencyNumber: '+94112958337',
      hasMaternityWard: true,
      availableBeds: 180,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'Teaching Hospital', 'Ultrasound'],
    },
    // Kandy District
    {
      name: 'Teaching Hospital Peradeniya',
      type: 'government',
      latitude: 7.2653,
      longitude: 80.5955,
      address: 'Peradeniya, Kandy',
      city: 'Peradeniya',
      district: 'Kandy',
      contactNumber: '+94812388888',
      emergencyNumber: '+94812388888',
      hasMaternityWard: true,
      availableBeds: 220,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'High-Risk Unit', 'Teaching Hospital', 'Ultrasound'],
    },
    {
      name: 'Kandy General Hospital',
      type: 'government',
      latitude: 7.2906,
      longitude: 80.6337,
      address: 'William Gopallawa Mawatha, Kandy',
      city: 'Kandy',
      district: 'Kandy',
      contactNumber: '+94812234466',
      emergencyNumber: '+94812234466',
      hasMaternityWard: true,
      availableBeds: 250,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'C-Section', 'Ultrasound'],
    },
    // Galle District
    {
      name: 'Karapitiya Teaching Hospital',
      type: 'government',
      latitude: 6.0535,
      longitude: 80.2210,
      address: 'Karapitiya, Galle',
      city: 'Galle',
      district: 'Galle',
      contactNumber: '+94912232560',
      emergencyNumber: '+94912232560',
      hasMaternityWard: true,
      availableBeds: 200,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'Teaching Hospital', 'Ultrasound'],
    },
    // Kurunegala District
    {
      name: 'Kurunegala Teaching Hospital',
      type: 'government',
      latitude: 7.4863,
      longitude: 80.3647,
      address: 'Hospital Road, Kurunegala',
      city: 'Kurunegala',
      district: 'Kurunegala',
      contactNumber: '+94372222261',
      emergencyNumber: '+94372222261',
      hasMaternityWard: true,
      availableBeds: 190,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'C-Section', 'Ultrasound'],
    },
    // Anuradhapura District
    {
      name: 'Anuradhapura Teaching Hospital',
      type: 'government',
      latitude: 8.3114,
      longitude: 80.4037,
      address: 'Hospital Road, Anuradhapura',
      city: 'Anuradhapura',
      district: 'Anuradhapura',
      contactNumber: '+94252222261',
      emergencyNumber: '+94252222261',
      hasMaternityWard: true,
      availableBeds: 180,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'C-Section', 'Ultrasound'],
    },
    // Jaffna District
    {
      name: 'Jaffna Teaching Hospital',
      type: 'government',
      latitude: 9.6615,
      longitude: 80.0255,
      address: 'Hospital Road, Jaffna',
      city: 'Jaffna',
      district: 'Jaffna',
      contactNumber: '+94212222261',
      emergencyNumber: '+94212222261',
      hasMaternityWard: true,
      availableBeds: 170,
      facilities: ['24/7 Emergency', 'NICU', 'Labor Ward', 'C-Section', 'Ultrasound'],
    },
  ];

  let created = 0;
  for (const hospital of hospitals) {
    try {
      await prisma.hospital.create({
        data: hospital,
      });
      created++;
      console.log(`✅ Created hospital: ${hospital.name}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏩ Hospital already exists: ${hospital.name}`);
      } else {
        console.error(`❌ Error creating hospital ${hospital.name}:`, error.message);
      }
    }
  }

  console.log(`\n🏥 Hospital seeding completed: ${created} new hospitals added`);
}

async function main() {
  try {
    await seedHospitals();
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
