const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...');

  try {
    // Delete in order to respect Foreign Key constraints
    
    console.log('Deleting EmailReminders...');
    await prisma.emailReminder.deleteMany({});
    
    console.log('Deleting EmailLogs...');
    await prisma.emailLog.deleteMany({});
    
    console.log('Deleting Appointments...');
    await prisma.appointment.deleteMany({});
    
    console.log('Deleting Schedules...');
    await prisma.schedule.deleteMany({});
    
    console.log('Deleting Dentists...');
    await prisma.dentist.deleteMany({});
    
    console.log('Deleting Users...');
    await prisma.user.deleteMany({});

    console.log('✅ Database cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
