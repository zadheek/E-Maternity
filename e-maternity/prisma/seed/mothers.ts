import 'dotenv/config';
import { prisma } from '../../src/lib/db/prisma';
import { UserRole, Language, RiskLevel, BloodType } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function seedMothers() {
  console.log('Starting to seed mother data...');

  // Get the midwife and doctor profiles for assignment
  const midwifeProfile = await prisma.midwifeProfile.findFirst({
    where: {
      user: {
        email: 'nirmala.midwife@ematernity.lk'
      }
    }
  });

  const doctorProfile = await prisma.doctorProfile.findFirst({
    where: {
      user: {
        email: 'dr.perera@ematernity.lk'
      }
    }
  });

  if (!midwifeProfile || !doctorProfile) {
    console.error('Midwife or Doctor profile not found. Please run new-providers.ts seed first.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Mother2025@Safe!', 10);

  // Mother 1: Low Risk, First Pregnancy
  const mother1 = await prisma.user.upsert({
    where: { email: 'amaya.fernando@gmail.com' },
    update: {},
    create: {
      email: 'amaya.fernando@gmail.com',
      password: hashedPassword,
      role: UserRole.MOTHER,
      firstName: 'Amaya',
      lastName: 'Fernando',
      phoneNumber: '+94771234567',
      language: Language.SINHALA,
      isVerified: true,
    },
  });

  await prisma.motherProfile.upsert({
    where: { userId: mother1.id },
    update: {},
    create: {
      userId: mother1.id,
      dateOfBirth: new Date('1995-03-15'),
      nic: '199507812345',
      street: '45/2, Galle Road',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '00300',
      expectedDeliveryDate: new Date('2025-04-15'),
      pregnancyWeek: 24,
      bloodType: BloodType.O_POSITIVE,
      riskLevel: RiskLevel.LOW,
      previousPregnancies: 0,
      previousCesareans: 0,
      previousMiscarriages: 0,
      chronicConditions: [],
      allergies: ['Penicillin'],
      currentMedications: ['Folic Acid', 'Iron Supplements'],
      familyHistory: [],
      assignedMidwifeId: midwifeProfile.id,
      assignedDoctorId: doctorProfile.id,
      emergencyContacts: {
        create: [
          {
            name: 'Roshan Fernando',
            relationship: 'Husband',
            phoneNumber: '+94771234568',
            isPrimary: true,
          },
          {
            name: 'Nalini Fernando',
            relationship: 'Mother',
            phoneNumber: '+94771234569',
            isPrimary: false,
          },
        ],
      },
    },
  });

  console.log('Created mother: Amaya Fernando (Low Risk, First Pregnancy)');

  // Mother 2: Moderate Risk, Second Pregnancy
  const mother2 = await prisma.user.upsert({
    where: { email: 'kaveesha.silva@gmail.com' },
    update: {},
    create: {
      email: 'kaveesha.silva@gmail.com',
      password: hashedPassword,
      role: UserRole.MOTHER,
      firstName: 'Kaveesha',
      lastName: 'Silva',
      phoneNumber: '+94772345678',
      language: Language.SINHALA,
      isVerified: true,
    },
  });

  await prisma.motherProfile.upsert({
    where: { userId: mother2.id },
    update: {},
    create: {
      userId: mother2.id,
      dateOfBirth: new Date('1990-07-22'),
      nic: '199020312346',
      street: '123, Kandy Road',
      city: 'Kandy',
      district: 'Kandy',
      postalCode: '20000',
      expectedDeliveryDate: new Date('2025-03-20'),
      pregnancyWeek: 28,
      bloodType: BloodType.A_POSITIVE,
      riskLevel: RiskLevel.MODERATE,
      previousPregnancies: 1,
      previousCesareans: 0,
      previousMiscarriages: 0,
      chronicConditions: ['Gestational Diabetes (previous pregnancy)'],
      allergies: [],
      currentMedications: ['Prenatal Vitamins', 'Calcium Supplements'],
      familyHistory: ['Diabetes (maternal grandmother)'],
      assignedMidwifeId: midwifeProfile.id,
      assignedDoctorId: doctorProfile.id,
      emergencyContacts: {
        create: [
          {
            name: 'Dinesh Silva',
            relationship: 'Husband',
            phoneNumber: '+94772345679',
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log('Created mother: Kaveesha Silva (Moderate Risk, Second Pregnancy)');

  // Mother 3: High Risk, Multiple Conditions
  const mother3 = await prisma.user.upsert({
    where: { email: 'thilini.perera@gmail.com' },
    update: {},
    create: {
      email: 'thilini.perera@gmail.com',
      password: hashedPassword,
      role: UserRole.MOTHER,
      firstName: 'Thilini',
      lastName: 'Perera',
      phoneNumber: '+94773456789',
      language: Language.ENGLISH,
      isVerified: true,
    },
  });

  await prisma.motherProfile.upsert({
    where: { userId: mother3.id },
    update: {},
    create: {
      userId: mother3.id,
      dateOfBirth: new Date('1988-11-30'),
      nic: '198833412347',
      street: '67, Hospital Road',
      city: 'Galle',
      district: 'Galle',
      postalCode: '80000',
      expectedDeliveryDate: new Date('2025-02-28'),
      pregnancyWeek: 32,
      bloodType: BloodType.B_NEGATIVE,
      riskLevel: RiskLevel.HIGH,
      previousPregnancies: 2,
      previousCesareans: 1,
      previousMiscarriages: 1,
      chronicConditions: ['Hypertension', 'Gestational Diabetes'],
      allergies: ['Sulfa drugs'],
      currentMedications: ['Insulin', 'Blood Pressure Medication', 'Prenatal Vitamins'],
      familyHistory: ['Hypertension (mother)', 'Diabetes (father)', 'Preeclampsia (sister)'],
      assignedMidwifeId: midwifeProfile.id,
      assignedDoctorId: doctorProfile.id,
      emergencyContacts: {
        create: [
          {
            name: 'Kasun Perera',
            relationship: 'Husband',
            phoneNumber: '+94773456790',
            isPrimary: true,
          },
          {
            name: 'Dr. Ramani Perera',
            relationship: 'Sister (Doctor)',
            phoneNumber: '+94773456791',
            isPrimary: false,
          },
        ],
      },
    },
  });

  console.log('Created mother: Thilini Perera (High Risk, Multiple Conditions)');

  // Mother 4: Low Risk, Tamil Speaker
  const mother4 = await prisma.user.upsert({
    where: { email: 'priya.kumar@gmail.com' },
    update: {},
    create: {
      email: 'priya.kumar@gmail.com',
      password: hashedPassword,
      role: UserRole.MOTHER,
      firstName: 'Priya',
      lastName: 'Kumar',
      phoneNumber: '+94774567890',
      language: Language.TAMIL,
      isVerified: true,
    },
  });

  await prisma.motherProfile.upsert({
    where: { userId: mother4.id },
    update: {},
    create: {
      userId: mother4.id,
      dateOfBirth: new Date('1993-05-18'),
      nic: '199314012348',
      street: '89, Main Street',
      city: 'Jaffna',
      district: 'Jaffna',
      postalCode: '40000',
      expectedDeliveryDate: new Date('2025-05-10'),
      pregnancyWeek: 20,
      bloodType: BloodType.AB_POSITIVE,
      riskLevel: RiskLevel.LOW,
      previousPregnancies: 0,
      previousCesareans: 0,
      previousMiscarriages: 0,
      chronicConditions: [],
      allergies: [],
      currentMedications: ['Folic Acid', 'Iron Supplements', 'Vitamin D'],
      familyHistory: [],
      assignedMidwifeId: midwifeProfile.id,
      assignedDoctorId: doctorProfile.id,
      emergencyContacts: {
        create: [
          {
            name: 'Rajan Kumar',
            relationship: 'Husband',
            phoneNumber: '+94774567891',
            isPrimary: true,
          },
          {
            name: 'Lakshmi Kumar',
            relationship: 'Mother-in-law',
            phoneNumber: '+94774567892',
            isPrimary: false,
          },
        ],
      },
    },
  });

  console.log('Created mother: Priya Kumar (Low Risk, Tamil Speaker)');

  // Mother 5: Moderate Risk, Late Pregnancy
  const mother5 = await prisma.user.upsert({
    where: { email: 'sanduni.jayawardena@gmail.com' },
    update: {},
    create: {
      email: 'sanduni.jayawardena@gmail.com',
      password: hashedPassword,
      role: UserRole.MOTHER,
      firstName: 'Sanduni',
      lastName: 'Jayawardena',
      phoneNumber: '+94775678901',
      language: Language.SINHALA,
      isVerified: true,
    },
  });

  await prisma.motherProfile.upsert({
    where: { userId: mother5.id },
    update: {},
    create: {
      userId: mother5.id,
      dateOfBirth: new Date('1992-09-08'),
      nic: '199225012349',
      street: '234, Temple Road',
      city: 'Kurunegala',
      district: 'Kurunegala',
      postalCode: '60000',
      expectedDeliveryDate: new Date('2025-01-30'),
      pregnancyWeek: 36,
      bloodType: BloodType.O_NEGATIVE,
      riskLevel: RiskLevel.MODERATE,
      previousPregnancies: 1,
      previousCesareans: 0,
      previousMiscarriages: 0,
      chronicConditions: ['Anemia'],
      allergies: ['Latex'],
      currentMedications: ['Iron Supplements (High Dose)', 'Folic Acid', 'Prenatal Vitamins'],
      familyHistory: ['Anemia (mother)'],
      assignedMidwifeId: midwifeProfile.id,
      assignedDoctorId: doctorProfile.id,
      emergencyContacts: {
        create: [
          {
            name: 'Chaminda Jayawardena',
            relationship: 'Husband',
            phoneNumber: '+94775678902',
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log('Created mother: Sanduni Jayawardena (Moderate Risk, Late Pregnancy)');

  // Add some health metrics for the mothers
  console.log('\nAdding health metrics...');

  const mothers = await prisma.motherProfile.findMany({
    include: { user: true },
  });

  for (const mother of mothers) {
    // Add weight measurements
    await prisma.healthMetric.createMany({
      data: [
        {
          motherId: mother.userId,
          type: 'WEIGHT',
          value: 62 + Math.random() * 10,
          unit: 'kg',
          recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          recordedBy: midwifeProfile.userId,
        },
        {
          motherId: mother.userId,
          type: 'WEIGHT',
          value: 63 + Math.random() * 10,
          unit: 'kg',
          recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          recordedBy: midwifeProfile.userId,
        },
        {
          motherId: mother.userId,
          type: 'WEIGHT',
          value: 64 + Math.random() * 10,
          unit: 'kg',
          recordedAt: new Date(),
          recordedBy: midwifeProfile.userId,
        },
      ],
    });

    // Add blood pressure measurements
    await prisma.healthMetric.createMany({
      data: [
        {
          motherId: mother.userId,
          type: 'BLOOD_PRESSURE_SYSTOLIC',
          value: 110 + Math.random() * 20,
          unit: 'mmHg',
          recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          recordedBy: midwifeProfile.userId,
        },
        {
          motherId: mother.userId,
          type: 'BLOOD_PRESSURE_DIASTOLIC',
          value: 70 + Math.random() * 15,
          unit: 'mmHg',
          recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          recordedBy: midwifeProfile.userId,
        },
        {
          motherId: mother.userId,
          type: 'BLOOD_PRESSURE_SYSTOLIC',
          value: 115 + Math.random() * 15,
          unit: 'mmHg',
          recordedAt: new Date(),
          recordedBy: midwifeProfile.userId,
        },
        {
          motherId: mother.userId,
          type: 'BLOOD_PRESSURE_DIASTOLIC',
          value: 72 + Math.random() * 13,
          unit: 'mmHg',
          recordedAt: new Date(),
          recordedBy: midwifeProfile.userId,
        },
      ],
    });

    // Add fetal heart rate
    await prisma.healthMetric.create({
      data: {
        motherId: mother.userId,
        type: 'FETAL_HEART_RATE',
        value: 135 + Math.random() * 20,
        unit: 'bpm',
        recordedAt: new Date(),
        recordedBy: midwifeProfile.userId,
      },
    });
  }

  console.log('Added health metrics for all mothers');

  console.log('\n✅ Mother data seeding completed successfully!');
  console.log('\nDemo Mother Accounts:');
  console.log('1. Email: amaya.fernando@gmail.com | Password: Mother2025@Safe! (Low Risk)');
  console.log('2. Email: kaveesha.silva@gmail.com | Password: Mother2025@Safe! (Moderate Risk)');
  console.log('3. Email: thilini.perera@gmail.com | Password: Mother2025@Safe! (High Risk)');
  console.log('4. Email: priya.kumar@gmail.com | Password: Mother2025@Safe! (Low Risk, Tamil)');
  console.log('5. Email: sanduni.jayawardena@gmail.com | Password: Mother2025@Safe! (Moderate Risk)');
  console.log('\nAll mothers are assigned to:');
  console.log('- Midwife: Nirmala Jayasinghe');
  console.log('- Doctor: Dr. Anjali Perera');
}

seedMothers()
  .catch((e) => {
    console.error('Error seeding mother data:', e);
    process.exit(1);
  });
