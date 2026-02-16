
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getAllAppointments, 
  bookAppointment, 
  updateAppointment,
  updateAppointmentStatus,
  resendConfirmation
} = require('../controllers/appointmentController');
const { validateBooking, validateStatusUpdate, validateReschedule } = require('../validations/appointmentValidation');

router.get('/', protect, getAllAppointments);
router.post('/', protect, authorize('PATIENT'), validateBooking, bookAppointment);
router.patch('/:id', protect, validateReschedule, updateAppointment);
router.patch('/:id/status', protect, validateStatusUpdate, updateAppointmentStatus);
router.post('/:id/resend', protect, resendConfirmation);

module.exports = router;
