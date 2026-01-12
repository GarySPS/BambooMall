const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();

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
      from: `"BambooMall" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Your BambooMall OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #047857;">Your OTP Code</h2>
          <p style="font-size: 16px;">Here is your verification code:</p>
          <h1 style="background: #f0fdf4; color: #047857; padding: 10px; display: inline-block; border-radius: 8px;">${code}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}

// --- 2. HELPER FUNCTIONS ---
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

// --- 3. AUTH ROUTES ---

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
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins

  // If user exists...
  if (exist) {
    if (exist.verified) {
      return res.status(400).json({ error: 'Email already registered' });
    } else {
      // If exists but NOT verified, update and resend OTP
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          password,
          username,
          otp_code,
          otp_expires_at,
          kyc_status: 'unverified'
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) return res.status(400).json({ error: updateError.message });
      
      await sendOtpMail(email, otp_code);
      return res.json({ user: updated, message: 'Account exists but unverified. OTP resent.' });
    }
  }

  // Generate Unique Short ID
  let short_id;
  try {
    short_id = await generateUniqueShortId(supabase);
  } catch (err) {
    return res.status(500).json({ error: 'Could not generate user ID.' });
  }

  // Insert New User
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        short_id,
        email,
        password,
        username,
        kyc_status: 'unverified',
        otp_code,
        otp_expires_at,
        verified: false,
        is_admin: false,
        usdt_balance: 0,
        alipay_balance: 0,
        wechat_balance: 0
      }
    ])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });

  await sendOtpMail(email, otp_code);
  res.json({ user: data, message: 'Registration successful. OTP sent.' });
});

// -------- Verify OTP (Critical for Auto-Login) --------
router.post('/verify-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });
  if (user.verified) return res.status(400).json({ error: 'Already verified.' });

  const now = new Date();
  const expires = new Date(user.otp_expires_at);

  if (
    String(user.otp_code).trim() !== String(otp_code).trim() ||
    !user.otp_expires_at ||
    expires < now
  ) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  // Verify User & Return Data
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ 
      verified: true, 
      otp_code: null, 
      otp_expires_at: null 
    })
    .eq('id', user.id)
    .select('*') // CRITICAL: Returns the user object
    .single();

  if (updateError) return res.status(500).json({ error: 'Verification update failed' });

  // Return user object so frontend can login immediately
  res.json({ 
    message: 'Verification successful', 
    user: updatedUser 
  });
});

// -------- Resend OTP --------
router.post('/resend-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found.' });
  if (user.verified) return res.status(400).json({ error: 'Already verified.' });

  // Rate Limit: 60 seconds (Prevent spam)
  const now = new Date();
  if (user.otp_expires_at) {
      const expires = new Date(user.otp_expires_at);
      const timeDiff = expires.getTime() - now.getTime(); 
      // If > 4 mins remaining (out of 5), they just requested it.
      if (timeDiff > 240000) {
          return res.status(429).json({ error: 'Please wait a minute before resending.' });
      }
  }

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase
    .from('users')
    .update({ otp_code, otp_expires_at })
    .eq('id', user.id);

  await sendOtpMail(email, otp_code);
  res.json({ message: 'OTP resent.' });
});

// -------- Login --------
router.post('/login', async (req, res) => {
  const supabase = req.supabase;
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${email},username.eq.${email}`)
    .eq('password', password)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.verified) return res.status(401).json({ error: 'Account not verified. Please verify OTP.' });

  res.json({ user });
});

// --- 4. PROFILE ROUTES (Restored) ---

// -------- Get User Profile By USER_ID --------
router.get('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id) 
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
    .eq('id', user_id)
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data });
});

// -------- Change Password --------
router.post('/change-password', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, old_password, new_password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .eq('password', old_password)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Old password incorrect' });

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: new_password })
    .eq('id', user_id);

  if (updateError) return res.status(400).json({ error: updateError.message });
  res.json({ message: 'Password changed' });
});

// -------- Get Profile by Short ID (For Refresh) --------
router.get('/profile', async (req, res) => {
  const supabase = req.supabase;
  const { short_id } = req.query;

  if (!short_id) return res.status(400).json({ error: 'Missing short_id' });

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('short_id', short_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const wallet = {
      usdt: user.usdt_balance || 0,
      alipay: user.alipay_balance || 0,
      wechat: user.wechat_balance || 0
    };

    res.json({ user, wallet });

  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;