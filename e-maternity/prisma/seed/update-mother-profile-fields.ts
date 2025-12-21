import 'dotenv/config';
import { prisma } from '../../src/lib/db/prisma';

async function updateMotherProfileFields() {
  try {
    console.log('Updating mother profiles with new fields...');

    // Find all mother profiles
    const mothers = await prisma.motherProfile.findMany({
      include: { user: true },
    });

    if (mothers.length === 0) {
      console.log('No mother profiles found.');
      return;
    }

    for (const mother of mothers) {
      console.log(`Updating profile for ${mother.user.firstName} ${mother.user.lastName}...`);

      // Calculate pregnancy start date (subtract pregnancyWeek from current date)
      const pregnancyStartDate = new Date();
      pregnancyStartDate.setDate(pregnancyStartDate.getDate() - (mother.pregnancyWeek * 7));

      await prisma.motherProfile.update({
        where: { id: mother.id },
        data: {
          pregnancyStartDate,
          previousSurgeries: [], // Empty array initially, can be updated via profile page
        },
      });

      console.log(`  - Added pregnancy start date: ${pregnancyStartDate.toLocaleDateString()}`);
    }

    console.log('✅ Mother profiles updated successfully!');
  } catch (error) {
    console.error('Error updating mother profiles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateMotherProfileFields();
