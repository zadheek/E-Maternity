import 'dotenv/config';
import { prisma } from '../../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function seedDoctorDemoData() {
  try {
    console.log('Starting doctor demo data seeding...');

    // Find or create doctor
    let doctor = await prisma.user.findUnique({
      where: { email: 'doctor@ematernity.lk' },
      include: { doctorProfile: true },
    });

    if (!doctor) {
      const doctorPassword = await bcrypt.hash('doctor123', 10);
      doctor = await prisma.user.create({
        data: {
          email: 'doctor@ematernity.lk',
          password: doctorPassword,
          role: 'DOCTOR',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phoneNumber: '+94771234567',
          language: 'ENGLISH',
          isVerified: true,
          doctorProfile: {
            create: {
              licenseNumber: 'MD-12345',
              specialization: 'Obstetrics and Gynecology',
              hospital: 'Colombo National Hospital',
              experienceYears: 15,
              consultationFee: 2500,
            },
          },
        },
        include: { doctorProfile: true },
      });
      console.log('✅ Doctor created: doctor@ematernity.lk / doctor123');
    }

    const doctorProfileId = doctor.doctorProfile?.id;
    if (!doctorProfileId) {
      throw new Error('Doctor profile not found');
    }

    // Create 5 mother patients with varying risk levels
    const mothers = [];
    const motherData = [
      {
        email: 'priya.silva@email.com',
        firstName: 'Priya',
        lastName: 'Silva',
        phone: '+94771112222',
        nic: '199012345678',
        district: 'Colombo',
        pregnancyWeek: 28,
        riskLevel: 'HIGH' as const,
        bloodType: 'O_POSITIVE' as const,
      },
      {
        email: 'ayesha.fernando@email.com',
        firstName: 'Ayesha',
        lastName: 'Fernando',
        phone: '+94772223333',
        nic: '199123456789',
        district: 'Gampaha',
        pregnancyWeek: 16,
        riskLevel: 'LOW' as const,
        bloodType: 'A_POSITIVE' as const,
      },
      {
        email: 'nisha.perera@email.com',
        firstName: 'Nisha',
        lastName: 'Perera',
        phone: '+94773334444',
        nic: '199234567890',
        district: 'Colombo',
        pregnancyWeek: 32,
        riskLevel: 'MODERATE' as const,
        bloodType: 'B_POSITIVE' as const,
      },
      {
        email: 'kavya.rajapakse@email.com',
        firstName: 'Kavya',
        lastName: 'Rajapakse',
        phone: '+94774445555',
        nic: '199345678901',
        district: 'Kandy',
        pregnancyWeek: 20,
        riskLevel: 'LOW' as const,
        bloodType: 'AB_POSITIVE' as const,
      },
      {
        email: 'dilani.wijesinghe@email.com',
        firstName: 'Dilani',
        lastName: 'Wijesinghe',
        phone: '+94775556666',
        nic: '199456789012',
        district: 'Colombo',
        pregnancyWeek: 36,
        riskLevel: 'CRITICAL' as const,
        bloodType: 'O_NEGATIVE' as const,
      },
    ];

    for (const motherInfo of motherData) {
      let user = await prisma.user.findUnique({
        where: { email: motherInfo.email },
      });

      if (!user) {
        const password = await bcrypt.hash('mother123', 10);
        user = await prisma.user.create({
          data: {
            email: motherInfo.email,
            password,
            role: 'MOTHER',
            firstName: motherInfo.firstName,
            lastName: motherInfo.lastName,
            phoneNumber: motherInfo.phone,
            language: 'ENGLISH',
            isVerified: true,
          },
        });
      }

      // Calculate expected delivery date based on pregnancy week
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + (40 - motherInfo.pregnancyWeek) * 7);

      let motherProfile = await prisma.motherProfile.findUnique({
        where: { userId: user.id },
      });

      if (!motherProfile) {
        motherProfile = await prisma.motherProfile.create({
          data: {
            userId: user.id,
            dateOfBirth: new Date('1990-05-15'),
            nic: motherInfo.nic,
            street: '123 Main Street',
            city: motherInfo.district,
            district: motherInfo.district,
            postalCode: '10100',
            expectedDeliveryDate,
            pregnancyWeek: motherInfo.pregnancyWeek,
            bloodType: motherInfo.bloodType,
            riskLevel: motherInfo.riskLevel,
            previousPregnancies: Math.floor(Math.random() * 3),
            previousCesareans: 0,
            previousMiscarriages: 0,
            chronicConditions: motherInfo.riskLevel === 'HIGH' || motherInfo.riskLevel === 'CRITICAL' 
              ? ['Gestational Diabetes', 'Hypertension'] 
              : [],
            allergies: [],
            currentMedications: motherInfo.riskLevel === 'HIGH' || motherInfo.riskLevel === 'CRITICAL'
              ? ['Prenatal Vitamins', 'Blood Pressure Medication']
              : ['Prenatal Vitamins'],
            familyHistory: [],
            assignedDoctorId: doctorProfileId,
          },
        });
      } else {
        motherProfile = await prisma.motherProfile.update({
          where: { id: motherProfile.id },
          data: {
            assignedDoctorId: doctorProfileId,
            riskLevel: motherInfo.riskLevel,
            pregnancyWeek: motherInfo.pregnancyWeek,
          },
        });
      }

      mothers.push({ user, profile: motherProfile });
      console.log(`✅ Created/updated mother: ${motherInfo.firstName} ${motherInfo.lastName} (${motherInfo.riskLevel})`);

      // Add health metrics for each mother
      const metricsDate = new Date();
      metricsDate.setDate(metricsDate.getDate() - 1); // Yesterday

      await prisma.healthMetric.createMany({
        data: [
          {
            motherId: user.id,
            type: 'WEIGHT',
            value: 65 + Math.random() * 15,
            unit: 'kg',
            recordedBy: doctor.id,
            recordedAt: metricsDate,
          },
          {
            motherId: user.id,
            type: 'BLOOD_PRESSURE_SYSTOLIC',
            value: motherInfo.riskLevel === 'HIGH' || motherInfo.riskLevel === 'CRITICAL' ? 140 + Math.random() * 20 : 110 + Math.random() * 20,
            unit: 'mmHg',
            recordedBy: doctor.id,
            recordedAt: metricsDate,
          },
          {
            motherId: user.id,
            type: 'BLOOD_PRESSURE_DIASTOLIC',
            value: motherInfo.riskLevel === 'HIGH' || motherInfo.riskLevel === 'CRITICAL' ? 85 + Math.random() * 15 : 70 + Math.random() * 15,
            unit: 'mmHg',
            recordedBy: doctor.id,
            recordedAt: metricsDate,
          },
          {
            motherId: user.id,
            type: 'BLOOD_GLUCOSE',
            value: motherInfo.riskLevel === 'HIGH' || motherInfo.riskLevel === 'CRITICAL' ? 120 + Math.random() * 40 : 80 + Math.random() * 30,
            unit: 'mg/dL',
            recordedBy: doctor.id,
            recordedAt: metricsDate,
          },
          {
            motherId: user.id,
            type: 'HEMOGLOBIN',
            value: 11 + Math.random() * 3,
            unit: 'g/dL',
            recordedBy: doctor.id,
            recordedAt: metricsDate,
          },
          {
            motherId: user.id,
            type: 'FETAL_HEART_RATE',
            value: 130 + Math.random() * 30,
            unit: 'bpm',
            recordedBy: doctor.id,
            recordedAt: metricsDate,
          },
        ],
      });
    }

    // Create appointments for today and upcoming days
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    // Today's appointments (3 appointments)
    for (let i = 0; i < 3; i++) {
      const appointmentTime = new Date(today);
      appointmentTime.setHours(9 + i * 2);

      await prisma.appointment.create({
        data: {
          motherId: mothers[i].user.id,
          providerId: doctor.id,
          providerType: 'doctor',
          type: i === 0 ? 'ROUTINE_CHECKUP' : i === 1 ? 'ULTRASOUND' : 'CONSULTATION',
          scheduledDate: appointmentTime,
          duration: 30,
          status: 'CONFIRMED',
          hospitalId: null,
          address: 'Colombo National Hospital',
          notes: 'Regular checkup',
        },
      });
    }

    console.log('✅ Created 3 appointments for today');

    // Upcoming appointments
    for (let i = 3; i < 5; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + (i - 2));
      futureDate.setHours(10, 0, 0, 0);

      await prisma.appointment.create({
        data: {
          motherId: mothers[i % mothers.length].user.id,
          providerId: doctor.id,
          providerType: 'doctor',
          type: 'ROUTINE_CHECKUP',
          scheduledDate: futureDate,
          duration: 30,
          status: 'SCHEDULED',
          address: 'Colombo National Hospital',
        },
      });
    }

    console.log('✅ Created 2 upcoming appointments');

    // Create prescriptions (2 recent prescriptions)
    for (let i = 0; i < 2; i++) {
      const prescriptionDate = new Date();
      prescriptionDate.setDate(prescriptionDate.getDate() - i * 7);

      await prisma.prescription.create({
        data: {
          motherId: mothers[i].user.id,
          prescribedById: doctor.id,
          medications: [
            {
              name: 'Prenatal Vitamins',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '30 days',
            },
            {
              name: 'Folic Acid',
              dosage: '5mg',
              frequency: 'Once daily',
              duration: '30 days',
            },
          ],
          instructions: 'Take with food. Continue throughout pregnancy.',
          prescribedDate: prescriptionDate,
          validUntil: new Date(prescriptionDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log('✅ Created 2 prescriptions');

    // Summary
    console.log('\n📊 Demo Data Summary:');
    console.log(`   Total Patients: ${mothers.length}`);
    console.log(`   High Risk Patients: ${mothers.filter(m => m.profile.riskLevel === 'HIGH' || m.profile.riskLevel === 'CRITICAL').length}`);
    console.log(`   Today's Appointments: 3`);
    console.log(`   Pending Reviews: 0`);
    console.log('\n✅ Doctor demo data seeding completed!');
  } catch (error) {
    console.error('Error seeding doctor demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDoctorDemoData();
