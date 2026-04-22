import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: 'admin@hdmuscle.in',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@hdmuscle.in');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Login URL: https://your-project.vercel.app/login');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Admin user already exists.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    admin@hdmuscle.in');
      console.log('Password: admin123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.error('Error creating admin:', error);
    }
  }

  await prisma.$disconnect();
}

main();
