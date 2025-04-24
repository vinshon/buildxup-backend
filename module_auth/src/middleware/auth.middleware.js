const { verifyToken } = require('../utils/jwt');
exports.authMiddleware = async (event) => {
  const token = event.headers.Authorization || event.headers.authorization;
  if (!token) throw new Error('Access denied. No token provided.');
  return verifyToken(token.replace('Bearer ', ''));
};