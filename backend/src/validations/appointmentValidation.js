
const Joi = require('joi');

const bookSchema = Joi.object({
  dentistId: Joi.string().required(),
  dateTime: Joi.string().isoDate().required(),
  notes: Joi.string().max(500).allow('', null),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'CANCELED', 'COMPLETED').required(),
});

const generalUpdateSchema = Joi.object({
  dateTime: Joi.string().isoDate(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'CANCELED', 'COMPLETED'),
  notes: Joi.string().max(500).allow('', null),
}).min(1);

const validateAppointmentUpdate = (req, res, next) => {
  const { error } = generalUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateBooking = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { error } = updateStatusSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

module.exports = { validateBooking, validateStatusUpdate, validateReschedule: validateAppointmentUpdate };
