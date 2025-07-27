const express = require('express');
const cors = require('cors');
require('dotenv').config();
const projectRouter = require('./src/routes/project.route');
const errorHandler = require('../middleware/error.middleware');
const serverless = require('serverless-http');
const logger = require('../utils/logger');
const trimBody = require('../middleware/trimBody');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(trimBody);

// Routes
app.use('/projects', projectRouter);

// Error handling middleware
app.use(errorHandler);

// Export app for serverless
module.exports.app = serverless(app); 