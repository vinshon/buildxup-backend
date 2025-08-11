const cors = require('cors');

// Custom CORS middleware that handles OPTIONS requests properly
const corsMiddleware = (req, res, next) => {
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).json({
      message: 'OK'
    });
    return;
  }
  next();
};

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
  credentials: false
};

module.exports = {
  corsMiddleware,
  corsOptions
}; 