const express = require('express');
const cors = require('cors');
require('dotenv').config();
const projectRouter = require('./src/routes/project.route');
const errorHandler = require('../middleware/error.middleware');
const serverless = require('serverless-http');
const logger = require('../utils/logger');
const trimBody = require('../middleware/trimBody');

const app = express();

// Handle OPTIONS requests for all paths
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.status(200).json({
      message: 'OK'
    });
    return;
  }
  next();
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(trimBody);

// Routes
app.use('/projects', projectRouter);

// Error handling middleware
app.use(errorHandler);

// Create the Lambda handler
const handler = serverless(app);

// Export the handler for AWS Lambda
module.exports.handler = handler;