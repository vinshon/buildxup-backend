require('dotenv').config();
const env = process.env.NODE_ENV;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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

// Simple ping handler
exports.handler = async (event) => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Server is running',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};

// Database ping handler
exports.pingDb = async (event) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Database connection error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    await prisma.$disconnect();
  }
}; 