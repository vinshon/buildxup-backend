const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');
const { dbCheck, time } = require('./ping');
const errorHandler = require('./module_auth/src/middleware/error.middleware');
const serverless = require('serverless-http');
const trimBody = require('./middleware/trimBody')
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
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoints
app.get('/server/ping', time);
app.get('/server/ping-db', dbCheck);

// Auth routes
const authRouter = require('./module_auth/src/routes/auth.route');
app.use('/auth', authRouter);

// Project routes
const projectRouter = require('./module_project/src/routes/project.route');
app.use('/projects', projectRouter);

// Task routes
const taskRouter = require('./module_task/src/routes/task.route');
app.use('/tasks', taskRouter);

// Employee routes
const employeeRouter = require('./module_employee/src/routes/employee.route');
app.use('/employees', employeeRouter);

app.use(trimBody)

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
      projects: {
        create: 'POST /projects',
        getAll: 'GET /projects',
        getById: 'GET /projects/:projectId',
        update: 'PUT /projects/:projectId',
        delete: 'DELETE /projects/:projectId',
      },
      employees: {
        create: 'POST /employees',
        getAll: 'GET /employees',
        getById: 'GET /employees/:employeeId',
        update: 'PUT /employees/:employeeId',
        delete: 'DELETE /employees/:employeeId',
      },
      tasks: {
        create: 'POST /tasks',
        getAll: 'GET /tasks',
        getById: 'GET /tasks/:taskId',
        update: 'PUT /tasks/:taskId',
        delete: 'DELETE /tasks/:taskId',
        attendance: {
          create: 'POST /tasks/:taskId/attendance',
          createBulk: 'POST /tasks/:taskId/attendance/bulk',
          getAll: 'GET /tasks/:taskId/attendance',
          getById: 'GET /tasks/:taskId/attendance/:attendanceId',
          update: 'PUT /tasks/:taskId/attendance/:attendanceId',
          delete: 'DELETE /tasks/:taskId/attendance/:attendanceId'
        }
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

