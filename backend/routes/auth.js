// src/routes/auth.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// --- 1. EMAIL CONFIGURATION ---
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
  try {
    await transporter.sendMail({
      from: `"BambooMall Security" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Reset Your Password</h2>
          <p>Use the code below to reset your BambooMall password:</p>
          <h1 style="color: #d97706; background: #fffbeb; padding: 10px; display: inline-block; border-radius: 8px;">${code}</h1>
          <p>This code expires in 5 minutes.</p>
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
  } catch (err) {
    console.error("Email error:", err);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- 2. PASSWORD RESET ROUTES ---

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
  // FIX: Use .toISOString() for proper database storage
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

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

  // FIX: Standard Date comparison
  const now = new Date();
  const expires = new Date(user.otp_expires_at);

  if (
    String(user.otp_code).trim() !== String(otp_code).trim() ||
    !user.otp_expires_at ||
    expires < now
  ) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  // OTP is correct
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

  // Double Check OTP (Security Best Practice)
  const now = new Date();
  const expires = new Date(user.otp_expires_at);

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