import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function generateId() {
  return randomBytes(12).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Try to check if manager already exists (safe to call multiple times)
    // Will return success if already initialized

    // Try to check if manager exists
    try {
      const existingManager = await prisma.manager.findUnique({
        where: { email: 'admin@wizlingo.com' }
      });

      if (existingManager) {
        return NextResponse.json({
          success: true,
          message: 'Manager account already exists',
          manager: {
            email: existingManager.email,
            role: existingManager.role,
            name: existingManager.name
          },
          loginUrl: '/manager/login'
        });
      }
    } catch (checkError: any) {
      // Table doesn't exist, create it with raw SQL
      if (checkError.message?.includes('does not exist')) {
        const managerId = generateId();
        const hashedPassword = await hash('WizLingo@123', 10);

        // Create table using raw SQL
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

        // Insert manager record
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Manager" (id, name, email, phone, "passwordHash", role, organization, "isActive", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, managerId, 'Platform Manager', 'admin@wizlingo.com', '+91-9999-999-999', hashedPassword, 'SUPER_ADMIN', 'Edvanta', true);

        return NextResponse.json({
          success: true,
          message: 'Manager table and account created successfully',
          manager: {
            id: managerId,
            name: 'Platform Manager',
            email: 'admin@wizlingo.com',
            role: 'SUPER_ADMIN',
            password: 'WizLingo@123 (default)',
            loginUrl: '/manager/login'
          }
        });
      }
      throw checkError;
    }

    // Create manager account
    const hashedPassword = await hash('WizLingo@123', 10);

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

    return NextResponse.json({
      success: true,
      message: 'Manager account created successfully',
      manager: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        password: 'WizLingo@123 (default)',
        loginUrl: '/manager/login'
      }
    });
  } catch (error: any) {
    console.error('Manager init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize manager: ' + error.message },
      { status: 500 }
    );
  }
}
