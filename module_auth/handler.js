const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRouter = require('./src/routes/auth.route');
const errorHandler = require('../middleware/error.middleware');
const serverless = require('serverless-http');
const trimBody = require('../middleware/trimBody');

const app = express();
console.log("process.env.DATABASE_URL from module_auth/handler.js", process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use(trimBody)

// Error handling middleware
app.use(errorHandler);

// Export the app for AWS Lambda
module.exports.app = serverless(app);
