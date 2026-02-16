const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { processReminder } = require('../jobs/reminderJob');

const prisma = new PrismaClient();

// Run every 15 minutes to check for due reminders
const CRON_SCHEDULE = '*/15 * * * *'; 

const initScheduler = () => {
  console.log('Initializing Email Reminder Scheduler...');
  
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log('Running Email Reminder Cron Job...');
    
    try {
      const now = new Date();
      
      // Find pending reminders that are due (scheduledAt <= now) and haven't failed max times
      const dueReminders = await prisma.emailReminder.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: {
            lte: now,
          },
          retryCount: {
            lt: 3,
          }
        },
        take: 50, // Process in batches to avoid overwhelming
      });

      console.log(`Found ${dueReminders.length} due reminders.`);

      for (const reminder of dueReminders) {
        // Process each reminder independently
        // We use processReminder from the job file
        await processReminder(reminder.id);
      }

    } catch (error) {
      console.error('Error in Email Reminder Scheduler:', error);
    }
  });

  console.log(`Scheduler started with schedule: ${CRON_SCHEDULE}`);
};

module.exports = {
  initScheduler,
};
