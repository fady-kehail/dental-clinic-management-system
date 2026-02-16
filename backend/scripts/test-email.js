require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const emailService = require('../src/services/emailService');

const prisma = new PrismaClient();

async function testEmailFlow() {
  console.log('Starting Email Service Test...');

  try {
    // 1. Create Dummy User and Dentist
    const user = await prisma.user.create({
      data: {
        name: 'Test Patient',
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'PATIENT',
      },
    });
    console.log('Created User:', user.id);

    const dentist = await prisma.dentist.create({
      data: {
        name: 'Dr. Test',
        specialty: 'Orthodontics',
        experience: 10,
      },
    });
    console.log('Created Dentist:', dentist.id);

    // 2. Create Appointment (Trigger CONFIRMATION)
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        dentistId: dentist.id,
        date: new Date(),
        status: 'PENDING',
      },
      include: { user: true, dentist: true },
    });
    console.log('Created Appointment:', appointment.id);

    await emailService.handleEmailTrigger(appointment, 'CONFIRMATION');
    console.log('Triggered CONFIRMATION email');

    // 3. Update Appointment (Trigger UPDATE)
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { date: new Date(Date.now() + 86400000) }, // +1 day
      include: { user: true, dentist: true },
    });
    
    await emailService.handleEmailTrigger(updatedAppointment, 'UPDATE');
    console.log('Triggered UPDATE email');

    // 4. Cancel Appointment (Trigger CANCELLATION)
    const cancelledAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELED' },
      include: { user: true, dentist: true },
    });

    await emailService.handleEmailTrigger(cancelledAppointment, 'CANCELLATION');
    console.log('Triggered CANCELLATION email');

    // 5. Verify Logs
    const logs = await prisma.emailLog.findMany({
      where: { appointmentId: appointment.id },
    });

    console.log('\nEmail Logs:');
    logs.forEach(log => {
      console.log(`- Type: ${log.emailType}, Status: ${log.status}, Error: ${log.errorMessage || 'None'}`);
    });

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmailFlow();
