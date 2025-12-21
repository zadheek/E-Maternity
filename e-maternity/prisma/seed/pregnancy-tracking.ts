import 'dotenv/config';
import { prisma } from '../../src/lib/db/prisma';

async function seedPregnancyData() {
  try {
    console.log('Starting pregnancy tracking data seeding...');

    // Find all mother profiles
    const mothers = await prisma.motherProfile.findMany({
      include: { user: true },
    });

    if (mothers.length === 0) {
      console.log('No mother profiles found. Please register a mother account first.');
      return;
    }

    for (const mother of mothers) {
      console.log(`Adding pregnancy tracking data for ${mother.user.firstName} ${mother.user.lastName}...`);

      // Add fetal growth records for different weeks
      const fetalGrowthData = [
        {
          week: 12,
          weight: 14,
          length: 5.4,
          headCircumference: 2.4,
          abdominalCircumference: 2.0,
          notes: 'First trimester scan - all measurements normal',
        },
        {
          week: 16,
          weight: 100,
          length: 11.6,
          headCircumference: 3.8,
          abdominalCircumference: 3.2,
          notes: 'Baby is growing well, movement detected',
        },
        {
          week: 20,
          weight: 300,
          length: 16.4,
          headCircumference: 5.2,
          abdominalCircumference: 4.8,
          notes: 'Anatomy scan - all organs developing normally',
        },
        {
          week: 24,
          weight: 600,
          length: 21.3,
          headCircumference: 6.8,
          abdominalCircumference: 6.2,
          notes: 'Baby is very active, strong heartbeat',
        },
        {
          week: 28,
          weight: 1000,
          length: 25.4,
          headCircumference: 8.4,
          abdominalCircumference: 7.8,
          notes: 'Third trimester begins, rapid growth period',
        },
      ];

      for (const record of fetalGrowthData) {
        await prisma.fetalGrowthRecord.create({
          data: {
            motherProfileId: mother.id,
            ...record,
            recordedBy: mother.userId,
          },
        });
      }

      console.log(`  - Added ${fetalGrowthData.length} fetal growth records`);

      // Add ultrasound records
      const ultrasoundData = [
        {
          week: 8,
          type: 'Dating Scan',
          findings: 'Single viable pregnancy confirmed. Fetal heartbeat detected at 145 bpm. Estimated due date confirmed.',
          performedBy: 'Dr. Sarah Johnson',
        },
        {
          week: 12,
          type: 'NT Scan (Nuchal Translucency)',
          findings: 'Nuchal translucency measurement within normal range (1.2mm). No structural abnormalities detected. All early markers normal.',
          performedBy: 'Dr. Michael Chen',
        },
        {
          week: 20,
          type: 'Anomaly Scan',
          findings: 'Detailed anatomy scan completed. All organs appear normal. Four-chamber heart visible. Brain, spine, and limbs developing well. Placenta anterior, not low-lying.',
          performedBy: 'Dr. Sarah Johnson',
        },
        {
          week: 28,
          type: 'Growth Scan',
          findings: 'Baby measuring on track for gestational age. Amniotic fluid levels normal. Placenta functioning well. Baby in head-down position.',
          performedBy: 'Dr. Emily Rodriguez',
        },
        {
          week: 32,
          type: 'Growth Scan',
          findings: 'Continued appropriate growth. Estimated fetal weight 1.8kg. All parameters within expected ranges. Good fetal movement observed.',
          performedBy: 'Dr. Sarah Johnson',
        },
      ];

      for (const record of ultrasoundData) {
        await prisma.ultrasoundRecord.create({
          data: {
            motherProfileId: mother.id,
            ...record,
          },
        });
      }

      console.log(`  - Added ${ultrasoundData.length} ultrasound records`);
    }

    console.log('✅ Pregnancy tracking data seeding completed!');
  } catch (error) {
    console.error('Error seeding pregnancy tracking data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPregnancyData();
