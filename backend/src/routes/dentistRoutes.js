
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getDentists, 
  createDentist, 
  deleteDentist, 
  getSchedules, 
  createSchedule,
  deleteSchedule 
} = require('../controllers/dentistController');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getDentists);
router.post('/', protect, authorize('ADMIN'), upload.single('image'), createDentist);
// router.post('/', protect, upload.single('image'), createDentist); // Temp debug: removed admin check
router.delete('/:id', protect, authorize('ADMIN'), deleteDentist);

router.get('/schedules', getSchedules);
router.post('/schedules', protect, authorize('ADMIN'), createSchedule);
router.delete('/schedules/:id', protect, authorize('ADMIN'), deleteSchedule);

module.exports = router;
