const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();

// Nodemailer setup (top only)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true', // true for 465, false for others
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

// Helper: Generate 6-digit OTP code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---- Helper to generate unique 6-digit short_id ----
async function generateUniqueShortId(supabase) {
  let shortId, exists, attempts = 0;
  do {
    shortId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const { data } = await supabase
      .from('users')
      .select('short_id')
      .eq('short_id', shortId)
      .single();
    exists = !!data;
    attempts++;
    if (attempts > 10) throw new Error('Unable to generate unique short_id');
  } while (exists);
  return shortId;
}

// -------- Register New User --------
router.post('/register', async (req, res) => {
  const supabase = req.supabase;
  const { email, password, username } = req.body;

  // Check if email exists
  const { data: exist } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  if (exist && exist.verified) {
    // If verified, block registration
    return res.status(400).json({ error: 'Email already registered' });
  } else if (exist && !exist.verified) {
    // If exists and NOT verified, allow reset OTP, password, username
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        password,
        username,
        otp_code,
        otp_expires_at,
        kyc_status: 'pending',
        verified: false
      })
      .eq('email', email)
      .select()
      .single();
    if (updateError) return res.status(400).json({ error: updateError.message });
    await sendOtpMail(email, otp_code);
    return res.json({ user: updated, message: 'OTP resent to email.' });
  }

  // ---- UNIQUE SHORT ID GENERATION ----
  let short_id;
  try {
    short_id = await generateUniqueShortId(supabase);
  } catch (err) {
    return res.status(500).json({ error: 'Could not generate user ID, please try again.' });
  }

  // New user, insert as normal
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        short_id, // Custom 6-digit ID
        email,
        password,
        username,
        kyc_status: 'pending',
        otp_code,
        otp_expires_at,
        verified: false
      }
    ])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  await sendOtpMail(email, otp_code);

  res.json({ user: data, message: 'OTP sent to email.' });
});

// -------- Verify OTP --------
router.post('/verify-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code } = req.body;

  // Get user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });
  if (user.verified) return res.status(400).json({ error: 'Already verified.' });

  // ---- FIX HERE ----
  const expires = new Date(user.otp_expires_at + "Z").getTime();
  const now = Date.now();

  if (
    String(user.otp_code).trim() !== String(otp_code).trim() ||
    !user.otp_expires_at ||
    expires < now
  ) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }
  // ---- END FIX ----

  // Mark verified
  await supabase
    .from('users')
    .update({ verified: true, otp_code: null, otp_expires_at: null })
    .eq('id', user.id);

  res.json({ message: 'OTP verified. You may now login.' });
});

// -------- Resend OTP --------
router.post('/resend-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email } = req.body;

  // Fetch user first!
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });
  if (user.verified) return res.status(400).json({ error: 'Already verified.' });

  // Prevent spam: must wait 60s between resends
  const now = new Date();
  if (user.otp_expires_at && new Date(user.otp_expires_at) > now) {
    const seconds = Math.round((new Date(user.otp_expires_at) - now) / 1000);
    if (seconds > 240)
      return res.status(429).json({ error: `Please wait ${seconds - 240}s to resend OTP.` });
  }

  // Generate new OTP
  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  await supabase
    .from('users')
    .update({ otp_code, otp_expires_at })
    .eq('id', user.id);

  // Send OTP to email
  await sendOtpMail(email, otp_code);

  res.json({ message: 'OTP resent. Please check your email.' });
});

// -------- User Login --------
router.post('/login', async (req, res) => {
  const supabase = req.supabase;
  const { email, password } = req.body;

  // Accept login by username OR email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${email},username.eq.${email}`)
    .eq('password', password)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.verified) return res.status(401).json({ error: 'Please verify your email via OTP.' });

  res.json({ user });
});

// -------- Get User Profile By USER_ID --------
router.get('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id) // <-- was .eq('user_id', user_id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'User not found' });

  res.json({ user: data });
});

// -------- Update User Profile By USER_ID --------
router.put('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const { user_id } = req.params;
  const updateData = req.body;
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user_id) // <-- was .eq('user_id', user_id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data });
});

// Change user password (by user_id)
router.post('/change-password', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, old_password, new_password } = req.body;

  // Validate old password
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id) // <-- was .eq('user_id', user_id)
    .eq('password', old_password)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Old password incorrect' });

  // Update password
  const { error: updateError } = await supabase
    .from('users')
    .update({ password: new_password })
    .eq('id', user_id); // <-- was .eq('user_id', user_id)

  if (updateError) return res.status(400).json({ error: updateError.message });
  res.json({ message: 'Password changed' });
});


module.exports = router;
