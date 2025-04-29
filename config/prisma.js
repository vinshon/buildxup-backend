require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    'query',
    'info',
    'warn',
    'error'
  ],
  errorFormat: 'pretty'
});

// Test database connection
prisma.testConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

// Close database connection
prisma.closeConnection = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.closeConnection();
  process.exit(0);
});

module.exports = prisma; 