const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDentist() {
  try {
    const email = 'dentist@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Dentist user already exists:', email);
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: 'Dr. John Doe',
        email,
        password: hashedPassword,
        role: 'DENTIST',
        specialty: 'Orthodontics',
        phoneNumber: '555-0123'
      }
    });

    console.log('Dentist user created successfully:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`ID: ${user.id}`);

  } catch (error) {
    console.error('Error creating dentist:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDentist();
