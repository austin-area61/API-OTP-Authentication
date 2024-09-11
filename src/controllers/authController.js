const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const nodemailer = require('nodemailer');

//configure smtp
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

//generate otp 
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

//send otp via email
const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  });
};

//register user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// request OTP
exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); //otp valid for 10 minutes
    await user.save();

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'OTP verified', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};