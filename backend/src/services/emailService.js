const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.trim(),
  },
});

const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .header { background-color: #007bff; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>BrightSmile Dental Clinic</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} BrightSmile Dental Clinic. All rights reserved.</p>
      <p>Contact us: support@brightsmile.com | +123 456 7890</p>
    </div>
  </div>
</body>
</html>
`;

const getConfirmationTemplate = (appointment) => {
  const date = new Date(appointment.date).toLocaleString();
  return getBaseTemplate(`
    <h3>Appointment Confirmed</h3>
    <p>Dear ${appointment.user.name},</p>
    <p>Your appointment has been successfully booked.</p>
    <ul>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Doctor:</strong> Dr. ${appointment.dentist.name} (${appointment.dentist.specialty})</li>
      <li><strong>Location:</strong> 123 Dental St, Smile City</li>
    </ul>
    <p>Please arrive 10 minutes early.</p>
    <a href="${process.env.FRONTEND_URL}/appointments/${appointment.id}" class="button">View Appointment</a>
  `);
};

const getUpdateTemplate = (appointment) => {
  const date = new Date(appointment.date).toLocaleString();
  return getBaseTemplate(`
    <h3>Appointment Updated</h3>
    <p>Dear ${appointment.user.name},</p>
    <p>Your appointment details have been updated.</p>
    <ul>
      <li><strong>New Date:</strong> ${date}</li>
      <li><strong>Doctor:</strong> Dr. ${appointment.dentist.name}</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}/appointments/${appointment.id}" class="button">View Changes</a>
  `);
};

const getCancellationTemplate = (appointment) => {
  const date = new Date(appointment.date).toLocaleString();
  return getBaseTemplate(`
    <h3>Appointment Cancelled</h3>
    <p>Dear ${appointment.user.name},</p>
    <p>Your appointment scheduled for <strong>${date}</strong> with Dr. ${appointment.dentist.name} has been cancelled.</p>
    <p>If this was a mistake, please book a new appointment.</p>
    <a href="${process.env.FRONTEND_URL}/book" class="button">Book New Appointment</a>
  `);
};

const getReminderTemplate = (appointment, type) => {
  const date = new Date(appointment.date).toLocaleString();
  const title = type === 'TWENTY_FOUR_HOURS' ? 'Appointment Reminder (Tomorrow)' : 'Appointment Reminder (Upcoming)';
  
  return getBaseTemplate(`
    <h3>${title}</h3>
    <p>Dear ${appointment.user.name},</p>
    <p>This is a reminder for your appointment with Dr. ${appointment.dentist.name}.</p>
    <ul>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Doctor:</strong> Dr. ${appointment.dentist.name} (${appointment.dentist.specialty})</li>
      <li><strong>Location:</strong> 123 Dental St, Smile City</li>
    </ul>
    <p>Please arrive 10 minutes early.</p>
    <div style="margin-top: 20px;">
      <a href="${process.env.FRONTEND_URL}/appointments/${appointment.id}" class="button">View Details</a>
    </div>
  `);
};

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BrightSmile Clinic" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const handleEmailTrigger = async (appointment, type) => {
  // Create Log Entry - PENDING
  const emailLog = await prisma.emailLog.create({
    data: {
      appointmentId: appointment.id,
      recipientEmail: appointment.user.email,
      emailType: type,
      status: 'PENDING',
    },
  });

  let subject, html;
  switch (type) {
    case 'CONFIRMATION':
      subject = 'Appointment Confirmation - BrightSmile';
      html = getConfirmationTemplate(appointment);
      break;
    case 'UPDATE':
      subject = 'Appointment Updated - BrightSmile';
      html = getUpdateTemplate(appointment);
      break;
    case 'CANCELLATION':
      subject = 'Appointment Cancelled - BrightSmile';
      html = getCancellationTemplate(appointment);
      break;
    default:
      console.error('Unknown email type:', type);
      return;
  }

  // Send Email (Async, do not await if calling from controller, but here we await to update log)
  // In controller: handleEmailTrigger(...).catch(console.error);
  
  const result = await sendEmail(appointment.user.email, subject, html);

  // Update Log and Appointment
  if (result.success) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });
  } else {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'FAILED',
        errorMessage: result.error,
      },
    });
  }
};

const sendReminderEmail = async (appointment, reminderType) => {
  const subject = reminderType === 'TWENTY_FOUR_HOURS' 
    ? 'Reminder: Appointment Tomorrow - BrightSmile' 
    : 'Reminder: Appointment in 2 Hours - BrightSmile';
    
  const html = getReminderTemplate(appointment, reminderType);
  
  // Log the attempt
  const emailLog = await prisma.emailLog.create({
    data: {
      appointmentId: appointment.id,
      recipientEmail: appointment.user.email,
      emailType: 'REMINDER',
      status: 'PENDING',
    },
  });

  const result = await sendEmail(appointment.user.email, subject, html);

  if (result.success) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'SENT', sentAt: new Date() },
    });
    return { success: true };
  } else {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'FAILED', errorMessage: result.error },
    });
    return { success: false, error: result.error };
  }
};

module.exports = {
  sendEmail,
  handleEmailTrigger,
  sendReminderEmail,
};
