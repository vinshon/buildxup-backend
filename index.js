const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');
const { dbCheck, time } = require('./ping');
const authRouter = require('./module_auth/src/routes/auth.route');
const errorHandler = require('./module_auth/src/middleware/error.middleware');
const serverless = require('serverless-http');

const app = express();
console.log("process.env.DATABASE_URL from index.js", process.env.DATABASE_URL);
// For local development
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);

    // Test database connection on startup
    prisma.testConnection()
      .then(() => logger.info('Database connection successful'))
      .catch(err => { logger.error('Database connection failed:', err) });
  });
}
// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/server/ping', time);
app.get('/server/ping-db', dbCheck);

// Auth routes
app.use('/auth', authRouter);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    availableEndpoints: {
      auth: {
        register: 'POST /auth/signup',
        verifyOTP: 'POST /auth/verify-otp',
        login: 'POST /auth/verify-login',
        tempOTP: 'POST /auth/temp-otp'
      },
      health: {
        ping: 'GET /server/ping',
        pingDb: 'GET /server/ping-db'
      }
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Create the Lambda handler
const handler = serverless(app);

// Export the handler for AWS Lambda
exports.handler = handler;

