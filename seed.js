const { PrismaClient } = require('./app/generated/prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test data...')

  for (let i = 1; i <= 5; i++) {
    await prisma.student.create({
      data: {
        email: `student${i}@test.com`,
        name: `Test Student ${i}`,
        passwordHash: '$2b$10$test',
        currentLevel: 2,
        totalXP: Math.floor(Math.random() * 1000),
        streakDays: Math.floor(Math.random() * 30),
        progress: { create: {} }
      }
    })
    console.log(`✅ Created: Test Student ${i}`)
  }

  console.log('✅ All students seeded!')
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
