require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { processReminder } = require('../src/jobs/reminderJob');
const { initScheduler } = require('../src/services/schedulerService');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Email Reminder System ---');

  // 1. Create a test user and dentist if not exist (or just use existing ones)
  // For simplicity, we assume the DB has some data. If not, seed it.
  let user = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
  let dentist = await prisma.dentist.findFirst();

  if (!user) {
    console.log('Creating test patient...');
    user = await prisma.user.create({
      data: {
        name: 'Test Patient',
        email: 'testval@example.com',
        password: 'hashedpassword',
        role: 'PATIENT'
      }
    });
  }

  if (!dentist) {
    console.log('Creating test dentist...');
    dentist = await prisma.dentist.create({
      data: {
        name: 'Dr. Verify',
        specialty: 'Orthodontist',
        experience: 5
      }
    });
  }

  console.log(`Using Patient: ${user.name} (${user.email})`);
  console.log(`Using Dentist: ${dentist.name}`);

  // 2. Create a test appointment for TOMORROW
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  console.log('Creating test appointment for:', tomorrow);

  const appointment = await prisma.appointment.create({
    data: {
      userId: user.id,
      dentistId: dentist.id,
      date: tomorrow,
      status: 'CONFIRMED',
    }
  });

  console.log('Appointment created:', appointment.id);

  // 3. Create a reminder that is "DUE" (scheduled for NOW - 1 minute)
  const scheduledAt = new Date();
  scheduledAt.setMinutes(scheduledAt.getMinutes() - 1); // 1 minute ago

  const reminder = await prisma.emailReminder.create({
    data: {
      appointmentId: appointment.id,
      reminderType: 'TWENTY_FOUR_HOURS',
      scheduledAt: scheduledAt,
      status: 'PENDING',
    }
  });

  console.log('Reminder created (simulated due):', reminder.id);

  // 4. Run the processor manually for this reminder
  console.log('Running processReminder manually...');
  await processReminder(reminder.id);

  // 5. Verify status
  const updatedReminder = await prisma.emailReminder.findUnique({
    where: { id: reminder.id }
  });

  console.log('Final Reminder Status:', updatedReminder.status);
  console.log('Sent At:', updatedReminder.sentAt);

  if (updatedReminder.status === 'SENT') {
    console.log('SUCCESS: Reminder processed and sent!');
  } else {
    console.error('FAILURE: Reminder not sent.');
  }

  // Cleanup
  console.log('Cleaning up...');
  await prisma.emailLog.deleteMany({ where: { appointmentId: appointment.id } });
  await prisma.emailReminder.deleteMany({ where: { appointmentId: appointment.id } });
  await prisma.appointment.delete({ where: { id: appointment.id } });
  console.log('Done.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
