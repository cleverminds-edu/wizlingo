const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../app/generated/prisma'));
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupManager() {
  try {
    // Check if manager already exists
    const existingManager = await prisma.manager.findUnique({
      where: { email: 'admin@wizlingo.com' }
    });

    if (existingManager) {
      console.log('✅ Manager account already exists!');
      console.log(`📧 Email: ${existingManager.email}`);
      console.log(`🎯 Role: ${existingManager.role}`);
      await prisma.$disconnect();
      return;
    }

    // Create default manager account
    const hashedPassword = await bcrypt.hash('WizLingo@123', 10);

    const manager = await prisma.manager.create({
      data: {
        name: 'Platform Manager',
        email: 'admin@wizlingo.com',
        phone: '+91-9999-999-999',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        organization: 'Edvanta',
        isActive: true
      }
    });

    console.log('\n✅ Manager account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${manager.email}`);
    console.log(`🔐 Password: WizLingo@123`);
    console.log(`🎯 Role: ${manager.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n🔗 Login URL: http://localhost:3000/manager/login`);
    console.log(`\n⚠️  IMPORTANT: Change the default password immediately after first login!\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error setting up manager:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupManager();
