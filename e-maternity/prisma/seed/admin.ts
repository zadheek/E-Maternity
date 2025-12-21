import 'dotenv/config';
import { prisma } from '../../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    console.log('Creating admin account...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@ematernity.lk',
        password: adminPassword,
        role: 'ADMIN',
        firstName: 'System',
        lastName: 'Administrator',
        phoneNumber: '+94770000000',
        language: 'ENGLISH',
        isVerified: true,
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@ematernity.lk');
    console.log('Password: admin123');
    console.log('\nAccess admin dashboard at: http://localhost:3000/provider-login');
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
