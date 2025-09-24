const express = require("express");
const router = express.Router();
const logger = require("../../../utils/logger");

const { signupHandler, verifyOTPHandler, verifyLoginHandler, tempOTPHandler, resetPasswordHandler } = require("../handlers/auth.handler");

// Auth routes
router.post("/signup", signupHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/verify-login", verifyLoginHandler);
router.post("/temp-otp", tempOTPHandler);
router.post("/reset-password", resetPasswordHandler);

// 404 handler for auth routes
router.use((req, res) => {
  logger.warn(`Auth route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: 'error',
    message: 'Auth route not found',
    path: req.path,
    availableEndpoints: {
      auth: {
        register: 'POST /auth/signup',
        verifyOTP: 'POST /auth/verify-otp',
        login: 'POST /auth/verify-login',
        tempOTP: 'POST /auth/temp-otp',
        resetPassword: 'POST /auth/reset-password'
      }
    }
  });
});

module.exports = router;
