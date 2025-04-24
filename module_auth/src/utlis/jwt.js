const jwt = require('jsonwebtoken');
const generateToken = (payload, expiresIn = process.env.TOKEN_EXPIRE) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
module.exports = { generateToken, generateRefreshToken, verifyToken };