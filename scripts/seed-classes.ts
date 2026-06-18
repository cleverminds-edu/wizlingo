import { prisma } from '@/lib/prisma';

async function seedClasses() {
  try {
    // Create a test school
    const school = await prisma.school.create({
      data: {
        code: 'TEST-001',
        name: 'Test School',
      },
    });
    console.log('✅ School created:', school.id);

    // Create classes
    const classData = [];
    for (let i = 1; i <= 10; i++) {
      classData.push({
        name: `Class ${i}`,
        schoolId: school.id,
      });
    }

    const classes = await prisma.class.createMany({
      data: classData,
    });

    console.log('✅ Classes created:', classes.count);

    // Fetch and display
    const allClasses = await prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    console.log('📚 Classes:', allClasses);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClasses();
