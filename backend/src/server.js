require('dotenv').config();

// Validate required env vars in production
if (process.env.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  // .then(() => console.log("Prisma connected!"))
  // .catch(err => console.log("Prisma connection error:", err));

const app = require('./app');
const { initScheduler } = require('./services/schedulerService');

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs
initScheduler();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
