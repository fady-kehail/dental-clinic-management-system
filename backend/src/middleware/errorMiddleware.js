
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 2MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err.message === 'Images only!') {
    return res.status(400).json({ success: false, message: err.message });
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal server error';

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found.';
  }
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference. Related record does not exist.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Validation errors (Joi, etc.)
  if (err.isJoi) {
    statusCode = 400;
    message = err.details?.map(d => d.message).join(', ') || message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
