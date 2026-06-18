import { prisma } from '@/lib/prisma';

async function createClasses() {
  try {
    // First create a default school
    const school = await prisma.school.upsert({
      where: { code: 'TEST-SCHOOL' },
      update: {},
      create: {
        code: 'TEST-SCHOOL',
        name: 'Test School',
      },
    });

    const classes = await prisma.class.createMany({
      data: [
        { name: 'Class I', schoolId: school.id },
        { name: 'Class II', schoolId: school.id },
        { name: 'Class III', schoolId: school.id },
        { name: 'Class IV', schoolId: school.id },
        { name: 'Class V', schoolId: school.id },
        { name: 'Class VI', schoolId: school.id },
        { name: 'Class VII', schoolId: school.id },
        { name: 'Class VIII', schoolId: school.id },
        { name: 'Class IX', schoolId: school.id },
        { name: 'Class X', schoolId: school.id },
      ],
      skipDuplicates: true,
    });
    
    console.log('✅ School created:', school.id);
    console.log('✅ Classes created:', classes.count);
    
    // Fetch and display all classes
    const allClasses = await prisma.class.findMany({
      select: { id: true, name: true },
    });
    console.log('📚 All classes:', allClasses);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createClasses();
