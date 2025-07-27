const express = require('express');
const cors = require('cors');
require('dotenv').config();
const taskRouter = require('./src/routes/task.route');
const errorHandler = require('../middleware/error.middleware');
const serverless = require('serverless-http');
const trimBody = require('../middleware/trimBody');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/tasks', taskRouter);
app.use(trimBody)

// Error handling middleware
app.use(errorHandler);

// Export app for serverless
module.exports.app = serverless(app); 