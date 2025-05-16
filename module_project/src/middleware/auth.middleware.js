const { verifyToken } = require('../../../utils/jwt');
const { responses } = require('../utils/response');

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: 'Invalid token',
      error: error.message
    });
  }
}; 