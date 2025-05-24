const { verifyToken } = require('../../../utils/jwt');

exports.authMiddleware = (req, res, next) => {
  try {
    // Get token from headers (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: 'Access denied. No token provided.',
        error: 'No token provided'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: 'Invalid token format. Must be Bearer token.',
        error: 'Invalid token format'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: 'Invalid token format.',
        error: 'Invalid token format'
      });
    }

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.user_id,
      company_id: decoded.company_id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: 'Unauthorized access',
      error: error.message || 'Invalid or missing authentication token'
    });
  }
};