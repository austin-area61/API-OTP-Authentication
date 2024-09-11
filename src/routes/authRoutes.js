const express = require('express');
const { registerUser, requestOTP, verifyOTP } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
