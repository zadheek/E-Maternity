import 'dotenv/config';
import { prisma } from '../../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function seedHealthcareProviders() {
  try {
    console.log('Starting healthcare providers seeding...');

    // Create Doctor
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = await prisma.user.create({
      data: {
        email: 'doctor@ematernity.lk',
        password: doctorPassword,
        role: 'DOCTOR',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phoneNumber: '+94771234567',
        language: 'ENGLISH',
        isVerified: true,
      },
    });

    await prisma.doctorProfile.create({
      data: {
        userId: doctor.id,
        licenseNumber: 'MD-12345',
        specialization: 'Obstetrics and Gynecology',
        hospital: 'Colombo National Hospital',
        experienceYears: 15,
        consultationFee: 2500,
      },
    });

    console.log('✅ Doctor created: doctor@ematernity.lk / doctor123');

    // Create Midwife
    const midwifePassword = await bcrypt.hash('midwife123', 10);
    const midwife = await prisma.user.create({
      data: {
        email: 'midwife@ematernity.lk',
        password: midwifePassword,
        role: 'MIDWIFE',
        firstName: 'Priya',
        lastName: 'Fernando',
        phoneNumber: '+94772345678',
        language: 'ENGLISH',
        isVerified: true,
      },
    });

    await prisma.midwifeProfile.create({
      data: {
        userId: midwife.id,
        licenseNumber: 'MW-67890',
        assignedRegion: 'Colombo District',
      },
    });

    console.log('✅ Midwife created: midwife@ematernity.lk / midwife123');

    // Assign existing mother to both doctor and midwife
    const motherProfile = await prisma.motherProfile.findFirst({
      include: { user: true },
    });

    if (motherProfile) {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: doctor.id },
      });

      const midwifeProfile = await prisma.midwifeProfile.findUnique({
        where: { userId: midwife.id },
      });

      await prisma.motherProfile.update({
        where: { id: motherProfile.id },
        data: {
          assignedDoctorId: doctorProfile?.id,
          assignedMidwifeId: midwifeProfile?.id,
        },
      });

      console.log(
        `✅ Assigned ${motherProfile.user.firstName} to Dr. Johnson and Midwife Fernando`
      );
    }

    console.log('\n✅ Healthcare providers seeding completed!');
    console.log('\nLogin Credentials:');
    console.log('Doctor: doctor@ematernity.lk / doctor123');
    console.log('Midwife: midwife@ematernity.lk / midwife123');
  } catch (error) {
    console.error('Error seeding healthcare providers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedHealthcareProviders();
