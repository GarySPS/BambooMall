//routes>auth.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Setup transporter, sendOtpMail, and generateOTP same as in your users.js (copy the same code here or require it if you modularize later)

// --- COPY this from your users.js top section ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendOtpMail(email, code) {
  await transporter.sendMail({
    from: `"BambooMall" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: 'Your BambooMall OTP Code',
    html: `<div>
      <h2>Your OTP Code</h2>
      <p><b>${code}</b></p>
      <p>This code will expire in 5 minutes.</p>
    </div>`
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- END COPY ---

// Step 1: Send OTP for password reset
router.post('/forgot-password/send-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email } = req.body;

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });

  // Generate OTP and expiry
  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP to user
  await supabase
    .from('users')
    .update({ otp_code, otp_expires_at })
    .eq('id', user.id);

  await sendOtpMail(email, otp_code);

  res.json({ message: 'OTP sent to email.' });
});

// Step 2: Verify OTP for password reset
router.post('/forgot-password/verify-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code } = req.body;

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });

  const expires = new Date(user.otp_expires_at + "Z").getTime();
  const now = Date.now();

  if (
    String(user.otp_code).trim() !== String(otp_code).trim() ||
    !user.otp_expires_at ||
    expires < now
  ) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  // OTP is correct, allow next step
  res.json({ message: 'OTP verified. You may set new password now.' });
});

// Step 3: Reset password after OTP verified
router.post('/forgot-password/reset', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code, new_password } = req.body;

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });

  const expires = new Date(user.otp_expires_at + "Z").getTime();
  const now = Date.now();

  if (
    String(user.otp_code).trim() !== String(otp_code).trim() ||
    !user.otp_expires_at ||
    expires < now
  ) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  // Set new password, clear OTP
  await supabase
    .from('users')
    .update({
      password: new_password,
      otp_code: null,
      otp_expires_at: null
    })
    .eq('id', user.id);

  res.json({ message: 'Password reset successful. Please login.' });
});

module.exports = router;
