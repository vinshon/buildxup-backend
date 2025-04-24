const prisma = require('../../db/prisma');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../../utils/jwt');
const { sendOTP } = require('../../utils/twilio');

async function signup({ name, phone, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await prisma.user.create({ data: { name, phone, password: hashedPassword, verify_otp: otp } });
  await sendOTP(user.phone, otp);
  return { message: 'OTP sent to your phone' };
}

async function verifyOTP({ phone, otp }) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || user.verify_otp !== otp) throw new Error('Invalid OTP');
  await prisma.user.update({ where: { id: user.id }, data: { verify_otp: null, is_active: true } });
  return { message: 'Phone number verified successfully' };
}

async function verifyLogin({ phone, password }) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid credentials');
  const token = generateToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });
  await prisma.user.update({ where: { id: user.id }, data: { token, refresh_token: refreshToken } });
  return { token, refreshToken };
}

async function forgotPassword({ phone }) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error('User not found');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({ where: { id: user.id }, data: { verify_otp: otp } });
  await sendOTP(user.phone, otp);
  return { message: 'OTP sent to your phone' };
}

module.exports = { signup, verifyOTP, verifyLogin, forgotPassword };