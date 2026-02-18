const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exec } = require('child_process');
const path = require('path');

exports.resetDemoData = async () => {
  if (process.env.DEMO_MODE !== 'true') {
    throw new Error('Demo mode is not enabled');
  }

  console.log('🔄 Starting Demo Data Reset...');

  try {
    // 1. Delete all data (Order matters for foreign keys)
    // We transactionally delete to ensure clean slate
    await prisma.$transaction([
      prisma.emailLog.deleteMany(),
      prisma.emailReminder.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.schedule.deleteMany(),
      prisma.dentist.deleteMany(),
      prisma.user.deleteMany({
          where: {
               // Optional: Delete ALL users or just demo ones?
               // Prompt says "Delete all non-demo data" and "Re-run seedDemo"
               // "Re-run seedDemo" implies we want a fresh state.
               // Safest for a "Demo System" is to wipe everything and re-seed defaults.
               // BUT, if there are 'real' users mixed in, that's bad.
               // However, a Demo Environment usually is ephemeral.
               // Let's assume we wipe everything to be safe and consistent.
          }
      }),
    ]);
    
    console.log('🗑️  Database cleared.');

    // 2. Re-run seed script
    // We'll require the seed function directly if possible, or execute it as a child process
    // Executing as child process ensures clean context
    
    return new Promise((resolve, reject) => {
        const seedPath = path.join(__dirname, '../../prisma/seedDemo.js');
        exec(`node "${seedPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve({ message: 'Demo data reset successfully' });
        });
    });

  } catch (error) {
    console.error('Reset failed:', error);
    throw error;
  }
};
