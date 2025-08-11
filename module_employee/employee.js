const express = require('express');
const cors = require('cors');
require('dotenv').config();
const employeeRouter = require('./src/routes/employee.route');
const errorHandler = require('../middleware/error.middleware');
const { corsMiddleware, corsOptions } = require('../middleware/cors.middleware');
const serverless = require('serverless-http');
const trimBody = require('../middleware/trimBody');

const app = express();

// Apply CORS middleware first (handles OPTIONS requests)
app.use(corsMiddleware);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/employees', employeeRouter);
app.use(trimBody)

// Error handling middleware
app.use(errorHandler);

// Create the Lambda handler
const handler = serverless(app);

// Export the handler for AWS Lambda
module.exports.handler = handler;