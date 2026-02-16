const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function checkLogs() {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('--- RECENT EMAIL LOGS ---');
    if (logs.length === 0) {
      console.log('No logs found.');
    } else {
      logs.forEach(log => {
        console.log(`[${log.createdAt.toISOString()}] Type: ${log.emailType} | Status: ${log.status}`);
        if (log.status === 'FAILED') {
          console.log(`ERROR: ${log.errorMessage}`);
        }
        console.log('-------------------------');
      });
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogs();
