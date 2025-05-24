const jwt = require('jsonwebtoken');

const validateJWTSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not configured');
  }
};

const generateToken = (payload) => {
  validateJWTSecret();
  const expiration = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
  const customPayload = {
    ...payload,
    exp: expiration,
  };
  return jwt.sign(customPayload, process.env.JWT_SECRET);
};

const generateRefreshToken = (payload) => {
  validateJWTSecret();
  const expiresInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiresInSeconds });
};

const verifyToken = (token) => {
  validateJWTSecret();
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyToken };