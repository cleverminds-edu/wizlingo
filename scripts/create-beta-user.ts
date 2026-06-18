import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function generatePassword(): Promise<string> {
  const length = 8;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createBetaUser() {
  try {
    console.log('\n🎉 WizLingo Beta User Generator\n');

    const phone = await question('Enter phone number (10 digits): ');

    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
      console.log('❌ Invalid phone number. Must be 10 digits.\n');
      rl.close();
      return;
    }

    // Check if user exists
    const existing = await prisma.student.findUnique({
      where: { phone },
    });

    if (existing) {
      console.log(`❌ Phone number ${phone} already exists!\n`);
      rl.close();
      return;
    }

    // Generate password
    const password = await generatePassword();
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.student.create({
      data: {
        phone,
        passwordHash: hashedPassword,
      },
    });

    console.log('\n✅ Beta user created successfully!\n');
    console.log('📱 Phone:    ' + phone);
    console.log('🔐 Password: ' + password);
    console.log('\n💬 Share these credentials via DM');
    console.log('🌐 Login at: https://wizlingo-production.up.railway.app/auth/login-password\n');

    rl.close();
  } catch (error) {
    console.error('❌ Error creating user:', error);
    rl.close();
    process.exit(1);
  }
}

createBetaUser();
