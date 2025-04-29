require('dotenv').config();
const env = process.env.NODE_ENV;
const prisma = require('./config/prisma');
const logger = require('./utils/logger');

module.exports.dbCheck = async (req, res) => {
  let dbStatus = "Not Connected";
  const startTime = Date.now();

  try {
    // Test database connection with timeout
    const connectionTest = prisma.$connect();
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );

    await Promise.race([connectionTest, timeout]);
    dbStatus = "Connected";
    logger.info('Database connection successful');
  } catch (error) {
    logger.error('Database connection failed:', error);
    dbStatus = "Not Connected";
  }

  const responseTime = Date.now() - startTime;

  res.status(200).json({
    message: `Hello, the current time is ${new Date().toTimeString()}.`,
    env,
    db_status: dbStatus,
    response_time: `${responseTime}ms`
  });
};

module.exports.time = async (req, res) => {
  res.status(200).json({
    message: `Hello, the current time is ${new Date().toTimeString()}.`,
    env
  });
}; 