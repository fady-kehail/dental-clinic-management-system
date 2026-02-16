
const prisma = require('../config/prisma');
const emailService = require('../services/emailService');

// Transform Prisma appointment to frontend format (dentistName, patientName, dateTime)
// Map CANCELED -> CANCELLED for frontend compatibility
function mapAppointmentForResponse(apt) {
  const status = apt.status === 'CANCELED' ? 'CANCELLED' : apt.status;
  const base = { 
    id: apt.id, 
    dentistId: apt.dentistId, 
    dateTime: apt.date?.toISOString?.() || apt.date, 
    status,
    emailSent: apt.emailSent,
    emailSentAt: apt.emailSentAt
  };
  if (apt.dentist) base.dentistName = apt.dentist.name;
  if (apt.user) base.patientName = apt.user.name;
  return base;
}

// Get all appointments with pagination
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    
    // Role-based filtering
    if (req.user.role === 'PATIENT') {
      where.userId = req.user.id;
    } else if (req.user.role === 'DENTIST') {
      where.dentistUserId = req.user.id;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          dentist: {
            select: { id: true, name: true, specialty: true }
          },
          dentistUser: { // Include linked Dentist User
            select: { id: true, name: true, specialty: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.appointment.count({ where })
    ]);

    // Enhanced mapper to handle both legacy Dentist and new User-Dentist
    const mappedData = appointments.map(apt => {
        const base = mapAppointmentForResponse(apt);
        // If dentistUser exists, prefer its name
        if (apt.dentistUser) {
            base.dentistName = apt.dentistUser.name;
        }
        return base;
    });

    res.status(200).json({
      success: true,
      data: mappedData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new appointment
// Create new appointment
exports.bookAppointment = async (req, res, next) => {
  try {
    const { dentistId, dateTime, notes } = req.body;
    const userId = req.user.id;
    const appointmentDate = new Date(dateTime);

    // 1. Check if dentist exists (User ID preference)
    let dentistUserId = null;
    let legacyDentistId = null;

    // Check if ID belongs to a User with role DENTIST
    const dentistUser = await prisma.user.findUnique({ 
        where: { id: dentistId },
    });

    if (dentistUser && dentistUser.role === 'DENTIST') {
        dentistUserId = dentistId;
    } else {
        // Fallback: Check legacy Dentist table
        const legacyDentist = await prisma.dentist.findUnique({ where: { id: dentistId } });
        if (legacyDentist) {
            legacyDentistId = dentistId;
        } else {
            return res.status(404).json({ message: 'Dentist not found' });
        }
    }

    // 2. Check for conflicting appointments
    // We check against both ID types to be safe
    const conflictWhere = {
        date: appointmentDate,
        status: { not: 'CANCELED' }
    };
    if (dentistUserId) conflictWhere.dentistUserId = dentistUserId;
    if (legacyDentistId) conflictWhere.dentistId = legacyDentistId;

    const conflict = await prisma.appointment.findFirst({ where: conflictWhere });

    if (conflict) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    const createData = { 
        userId, 
        date: appointmentDate, 
        status: 'PENDING',
        dentistUserId, // Can be null
        dentistId: legacyDentistId // Can be null
    };
    if (notes != null && notes !== '') createData.notes = notes;

    const appointment = await prisma.appointment.create({
      data: createData,
      include: {
        dentist: true,
        dentistUser: true,
        user: true
      }
    });

    // Schedule Reminders
    const reminder24h = new Date(appointmentDate);
    reminder24h.setHours(reminder24h.getHours() - 24);

    const reminder2h = new Date(appointmentDate);
    reminder2h.setHours(reminder2h.getHours() - 2);

    await prisma.emailReminder.createMany({
      data: [
        {
          appointmentId: appointment.id,
          reminderType: 'TWENTY_FOUR_HOURS',
          scheduledAt: reminder24h,
          status: 'PENDING'
        },
        {
          appointmentId: appointment.id,
          reminderType: 'TWO_HOURS',
          scheduledAt: reminder2h,
          status: 'PENDING'
        }
      ]
    });

    // Send confirmation email (Async - fire and forget)
    emailService.handleEmailTrigger(appointment, 'CONFIRMATION').catch(console.error);
    
    // Map response
    const responseData = mapAppointmentForResponse(appointment);
    if (appointment.dentistUser) responseData.dentistName = appointment.dentistUser.name;

    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
};

// Update appointment (reschedule - date/time)
// Update appointment (reschedule - date/time) OR update status if Dentist
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dateTime, status, notes } = req.body;
    
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isPatient = req.user.role === 'PATIENT';
    const isDentist = req.user.role === 'DENTIST';
    const isAdmin = req.user.role === 'ADMIN';

    // Access Control
    if (isPatient && appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    if (isDentist && appointment.dentistUserId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = {};

    // Patient/Admin: Update Date
    if (dateTime && (isPatient || isAdmin)) {
         updateData.date = new Date(dateTime);
    }
    
    // Dentist/Admin: Update Status or Notes
    if (isDentist || isAdmin) {
        if (status) {
             const dbStatus = status === 'CANCELLED' ? 'CANCELED' : status;
             updateData.status = dbStatus;
        }
        if (notes !== undefined) updateData.notes = notes;
    }

    // Role restrictions checks meant to prevent unauthorized field updates logic could go here, 
    // but the above `if` blocks naturally restrict what gets added to `updateData`.
    // E.g., if a Patient tries to send `status`, it is ignored.

    if (Object.keys(updateData).length === 0) {
         return res.status(400).json({ message: 'No valid fields to update or unauthorized field update attempt.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { dentist: true, dentistUser: true, user: true }
    });

    // Handle side effects (Reminders update if date changed)
    if (updateData.date) {
        const appointmentDate = updateData.date;
        const reminder24h = new Date(appointmentDate);
        reminder24h.setHours(reminder24h.getHours() - 24);

        const reminder2h = new Date(appointmentDate);
        reminder2h.setHours(reminder2h.getHours() - 2);

        await prisma.emailReminder.updateMany({
            where: { appointmentId: id, reminderType: 'TWENTY_FOUR_HOURS', status: 'PENDING' },
            data: { scheduledAt: reminder24h }
        });
        await prisma.emailReminder.updateMany({
            where: { appointmentId: id, reminderType: 'TWO_HOURS', status: 'PENDING' },
            data: { scheduledAt: reminder2h }
        });
        emailService.handleEmailTrigger(updated, 'UPDATE').catch(console.error);
    }

    // Handle side effects (Cancellation)
    if (updateData.status === 'CANCELED') {
         emailService.handleEmailTrigger(updated, 'CANCELLATION').catch(console.error);
         await prisma.emailReminder.updateMany({
            where: { appointmentId: id, status: 'PENDING' },
            data: { status: 'CANCELLED' }
          });
    }

    const responseData = mapAppointmentForResponse(updated);
    if (updated.dentistUser) responseData.dentistName = updated.dentistUser.name;

    res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
};

// Update status (Admin only or Patient cancellation)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Map CANCELLED from frontend to CANCELED (Prisma enum)
    const dbStatus = status === 'CANCELLED' ? 'CANCELED' : status;

    // Authorization: Patients can only CANCEL their own appointments
    if (req.user.role === 'PATIENT') {
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to modify this appointment' });
      }
      if (dbStatus !== 'CANCELED') {
        return res.status(400).json({ message: 'Patients can only cancel appointments' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: dbStatus },
      include: { dentist: true, user: true }
    });

    // Send cancellation email if status is CANCELED (Async)
    // Send cancellation email if status is CANCELED (Async)
    if (dbStatus === 'CANCELED') {
      emailService.handleEmailTrigger(updated, 'CANCELLATION').catch(console.error);
      
      // Cancel pending reminders
      await prisma.emailReminder.updateMany({
        where: { appointmentId: id, status: 'PENDING' },
        data: { status: 'CANCELLED' }
      });
    }

    res.json({ success: true, data: mapAppointmentForResponse(updated) });
  } catch (error) {
    next(error);
  }
};

// Manual trigger to resend email
exports.resendConfirmation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { user: true, dentist: true }
    });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Determine type based on status (default to CONFIRMATION if PENDING/CONFIRMED)
    let type = 'CONFIRMATION';
    if (appointment.status === 'CANCELED') type = 'CANCELLATION';

    // Async trigger
    emailService.handleEmailTrigger(appointment, type).catch(console.error);

    res.json({ success: true, message: 'Email sending triggered successfully' });
  } catch (error) {
    next(error);
  }
};
