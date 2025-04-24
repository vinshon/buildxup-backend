const express = require("express");

const router = express.Router();

const { signupHandler, verifyOTPHandler, loginHandler, forgotPasswordHandler } = require("../handlers/auth.handler");

router.post("/signup", signupHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/login", loginHandler);
router.post("/forgot-password", forgotPasswordHandler);

module.exports = router;
