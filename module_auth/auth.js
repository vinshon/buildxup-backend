const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRouter = require('./src/routes/auth.route');
const errorHandler = require('../middleware/error.middleware');
const { corsMiddleware, corsOptions } = require('../middleware/cors.middleware');
const serverless = require('serverless-http');
const trimBody = require('../middleware/trimBody');

const app = express();
console.log("process.env.DATABASE_URL from module_auth/handler.js", process.env.DATABASE_URL);

// Apply CORS middleware first (handles OPTIONS requests)
app.use(corsMiddleware);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use(trimBody)

// Error handling middleware
app.use(errorHandler);

// Create the Lambda handler
const handler = serverless(app);

// Export the handler for AWS Lambda
module.exports.handler = handler;