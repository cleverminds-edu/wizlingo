import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST() {
  try {
    const managerId = randomBytes(12).toString('hex');
    const hashedPassword = await hash('WizLingo@123', 10);

    // Try to create manager table with raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Manager" (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        "passwordHash" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'MANAGER',
        organization TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Try to insert manager
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Manager" (id, name, email, phone, "passwordHash", role, organization, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, managerId, 'Platform Manager', 'admin@wizlingo.com', '+91-9999-999-999', hashedPassword, 'SUPER_ADMIN', 'Edvanta', true);
    } catch (insertError: any) {
      // Manager might already exist
      if (insertError.message?.includes('duplicate')) {
        const existing = await prisma.manager.findUnique({
          where: { email: 'admin@wizlingo.com' }
        });
        return NextResponse.json({
          success: true,
          message: 'Manager already exists',
          manager: { email: existing?.email, role: existing?.role }
        });
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Manager initialized successfully',
      manager: {
        email: 'admin@wizlingo.com',
        password: 'WizLingo@123',
        role: 'SUPER_ADMIN'
      }
    });
  } catch (error: any) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
