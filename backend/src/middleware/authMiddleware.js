const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

const isDentist = (req, res, next) => {
  if (req.user && req.user.role === 'DENTIST') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a dentist' });
  }
};

const canAccessAppointment = async (req, res, next) => {
  // This middleware assumes the appointment ID is in req.params.id
  // and requires independent database access, so maybe better in controller or requires importing prisma here.
  // For now, I'll skip implementing complex logic here and do it in the controller as per my plan to "filter" in controller.
  next(); 
};

module.exports = { protect, authorize };
