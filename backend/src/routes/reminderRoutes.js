const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const { processReminder } = require('../jobs/reminderJob'); 
// We import processReminder directly to trigger it manually if needed, 
// or we can just trigger the emailService directly for 'test'

const prisma = new PrismaClient();

// GET /api/reminders - List all scheduled reminders (Admin only)
// Middleware for admin auth should be added here ideally
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (status) where.status = status;

    const [reminders, total] = await Promise.all([
      prisma.emailReminder.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          appointment: {
            select: {
              id: true,
              date: true,
              user: { select: { name: true, email: true } },
              dentist: { select: { name: true } }
            }
          }
        },
        orderBy: { scheduledAt: 'asc' }
      }),
      prisma.emailReminder.count({ where })
    ]);

    res.json({
      success: true,
      data: reminders,
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
});

// DELETE /api/reminders/:id - Cancel a reminder
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.emailReminder.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    res.json({ success: true, message: 'Reminder cancelled' });
  } catch (error) {
    next(error);
  }
});

// POST /api/reminders/test - Send a test email (trigger immediately)
router.post('/test', async (req, res, next) => {
  try {
    const { email, type = 'TWENTY_FOUR_HOURS' } = req.body;
    
    // Mock appointment data for testing
    const mockAppointment = {
      id: 'test-id',
      date: new Date(Date.now() + 86400000), // Tomorrow
      user: { name: 'Test User', email: email || 'test@example.com' },
      dentist: { name: 'Dr. Test', specialty: 'General' }
    };

    const result = await emailService.sendEmail(
      mockAppointment.user.email,
      `TEST REMINDER: ${type}`,
      `<h1>This is a test reminder</h1><p>Type: ${type}</p>`
    );

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
