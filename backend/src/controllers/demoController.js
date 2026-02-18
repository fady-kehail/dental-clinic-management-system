const demoService = require('../services/demoService');

exports.resetDemoData = async (req, res, next) => {
  try {
    if (process.env.DEMO_MODE !== 'true') {
      return res.status(403).json({ message: 'Demo mode is disabled' });
    }

    // Optional: Extra security check (Admin only)
    // The route definition will handle Auth middleware, but we can double check here
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only Admins can reset demo data' });
    }

    await demoService.resetDemoData();
    res.status(200).json({ message: 'Demo system reset successfully. All data has been restored to default.' });
  } catch (error) {
    next(error);
  }
};
