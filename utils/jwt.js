const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  console.log('Generating token with payload:', payload);
  const expiration = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
  const customPayload = {
    ...payload,
    exp: expiration,
  };
  return jwt.sign(customPayload, process.env.JWT_SECRET);
};

const generateRefreshToken = (payload) => {
  const expiresInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
  console.log('Generating refresh token with expiresIn (seconds):', expiresInSeconds);
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiresInSeconds });
};


const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, generateRefreshToken, verifyToken };