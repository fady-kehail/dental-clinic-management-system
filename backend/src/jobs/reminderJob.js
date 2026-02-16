const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const processReminder = async (reminderId) => {
  console.log(`Processing reminder: ${reminderId}`);
  
  const reminder = await prisma.emailReminder.findUnique({
    where: { id: reminderId },
    include: {
      appointment: {
        include: {
          user: true,
          dentist: true,
        }
      }
    }
  });

  if (!reminder) {
    console.error(`Reminder ${reminderId} not found`);
    return;
  }

  if (reminder.status !== 'PENDING') {
    console.log(`Reminder ${reminderId} already processed (Status: ${reminder.status})`);
    return;
  }

  try {
    // Send the email
    const result = await emailService.sendReminderEmail(reminder.appointment, reminder.reminderType);

    if (result.success) {
      await prisma.emailReminder.update({
        where: { id: reminderId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        }
      });
      console.log(`Reminder ${reminderId} sent successfully`);
    } else {
      throw new Error(result.error || 'Failed to send email');
    }

  } catch (error) {
    console.error(`Failed to send reminder ${reminderId}:`, error);
    
    const retryCount = reminder.retryCount + 1;
    const status = retryCount >= 3 ? 'FAILED' : 'PENDING'; // Mark as FAILED after 3 tries, otherwise keep PENDING to retry
    
    await prisma.emailReminder.update({
      where: { id: reminderId },
      data: {
        status: status,
        retryCount: retryCount,
        errorMessage: error.message,
        // If retrying, maybe bump scheduledAt by 5 mins? For now, we'll just let the next cron pick it up if it's still "due"
      }
    });
  }
};

module.exports = {
  processReminder,
};
