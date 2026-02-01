// src/routes/auth.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// --- 1. ENTERPRISE EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// THE "BANKER" EMAIL TEMPLATE
// Visual Style: Courier New font, Slate Grays, "Confidential" footer.
async function sendOtpMail(email, code) {
  try {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    await transporter.sendMail({
      from: `"BambooMall SCM Security" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: `ACTION REQUIRED: Secure Access Token [REF: ${code.substring(0,3)}]`,
      html: `
        <div style="background-color: #f1f5f9; padding: 40px; font-family: 'Courier New', Courier, monospace; color: #334155;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #0f172a; color: #e2e8f0; padding: 15px 20px; font-size: 12px; letter-spacing: 1px;">
              <strong>BAMBOOMALL SCM</strong> // SECURITY DIVISION
            </div>

            <div style="padding: 30px;">
              <p style="font-size: 14px; margin-bottom: 20px;"><strong>ATTN: PROCUREMENT AGENT</strong></p>
              
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
                A secure session request was initiated for your corporate account ID associated with: <span style="color: #0f172a;">${email}</span>.
              </p>

              <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 15px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 10px; color: #64748b; uppercase;">SESSION AUTHORIZATION TOKEN</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: 4px;">${code}</p>
              </div>

              <p style="font-size: 12px; color: #64748b;">
                Token Validity: 300 Seconds.<br/>
                Request Timestamp: ${timestamp} UTC
              </p>
            </div>

            <div style="background-color: #e2e8f0; padding: 15px 20px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1;">
              CONFIDENTIAL: This transmission is intended only for the authorized recipient.<br/>
              Monitoring Systems Active. IP Address Logged.
            </div>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error("Secure Dispatch Error:", err);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateUniqueShortId(supabase) {
  let shortId, exists, attempts = 0;
  do {
    shortId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const { data } = await supabase.from('users').select('short_id').eq('short_id', shortId).single();
    exists = !!data;
    attempts++;
    if (attempts > 10) throw new Error('Unable to generate unique corporate ID');
  } while (exists);
  return shortId;
}

// --- 2. AUTH ROUTES ---

// -------- Vendor Application (Register) --------
router.post('/register', async (req, res) => {
  const supabase = req.supabase;
  // NOTE: We accept 'license' now, though we might not force-save it yet if DB schema is strict.
  // We map 'username' to 'company_name' logically.
  const { email, password, username, license } = req.body; 

  // Check if agent exists
  const { data: exist } = await supabase.from('users').select('*').eq('email', email).single();

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // If user exists...
  if (exist) {
    if (exist.verified) {
      return res.status(409).json({ error: 'Corporate ID already active. Please login.' });
    } else {
      // If exists but NOT verified, resend OTP
      await supabase
        .from('users')
        .update({ password, username, otp_code, otp_expires_at, kyc_status: 'pending_review' })
        .eq('email', email);

      await sendOtpMail(email, otp_code);
      return res.json({ message: 'Application pending. Verification token re-dispatched.' });
    }
  }

  // Generate Corporate Short ID
  let short_id;
  try {
    short_id = await generateUniqueShortId(supabase);
  } catch (err) {
    return res.status(500).json({ error: 'System Error: ID Allocation Failed.' });
  }

  // Insert New Vendor
  // We default kyc_status to 'pending' to match the persona, but verifying OTP will flip it to 'active'.
  const { data: newUser, error } = await supabase
    .from('users')
    .insert([{
      short_id,
      email,
      password,
      username,
      trade_license: license,
      kyc_status: 'pending_review',
      otp_code,
      otp_expires_at,
      verified: false,
      is_admin: false
    }])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: "Database Error: " + error.message });

  // Create Settlement Wallet
  const { error: walletError } = await supabase
    .from('wallets')
    .insert([{ user_id: newUser.id, balance: 0 }]);

  if (walletError) console.error("Settlement Wallet Init Failed:", walletError);

  await sendOtpMail(email, otp_code);
  res.json({ user: newUser, message: 'Application received. Token dispatched.' });
});

// -------- Verify Token (OTP) --------
router.post('/verify-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code } = req.body;

  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error || !user) return res.status(404).json({ error: 'Agent ID not found.' });
  if (user.verified) return res.status(400).json({ error: 'Session already active.' });

  const now = new Date();
  const expires = new Date(user.otp_expires_at);

  if (String(user.otp_code).trim() !== String(otp_code).trim() || !user.otp_expires_at || expires < now) {
    return res.status(401).json({ error: 'Security Token Invalid or Expired.' });
  }

  // Auto-approve KYC upon OTP verification for the simulation
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ verified: true, kyc_status: 'verified', otp_code: null, otp_expires_at: null })
    .eq('id', user.id)
    .select('*')
    .single();

  if (updateError) return res.status(500).json({ error: 'System Error: Verification Write Failed' });

  res.json({ message: 'Identity Verified. Terminal Access Granted.', user: updatedUser });
});

// -------- Resend Token --------
router.post('/resend-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email } = req.body;

  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error || !user) return res.status(404).json({ error: 'Agent ID not found.' });
  if (user.verified) return res.status(400).json({ error: 'Agent already verified.' });

  // Rate Limit Check
  const now = new Date();
  if (user.otp_expires_at) {
      const expires = new Date(user.otp_expires_at);
      if ((expires.getTime() - now.getTime()) > 240000) {
          return res.status(429).json({ error: 'Cooldown Active. Please wait before regenerating token.' });
      }
  }

  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from('users').update({ otp_code, otp_expires_at }).eq('id', user.id);
  await sendOtpMail(email, otp_code);
  res.json({ message: 'Token regenerated and dispatched.' });
});

// -------- Login Terminal --------
router.post('/login', async (req, res) => {
  console.log(">> SYSTEM: Login Attempt Initiated"); 
  const supabase = req.supabase;
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${email},username.eq.${email}`)
    .eq('password', password)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Authentication Failed: Invalid Credentials.' });
  if (!user.verified) return res.status(403).json({ error: 'Access Denied: Account Pending Verification.' });

  console.log(`>> SYSTEM: Access Granted for [${user.username}]`);
  res.json({ user });
});


// 3. SECURITY RECOVERY PROTOCOLS (Forgot Password)

// [A] Dispatch Recovery Token
router.post('/forgot-password/send-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email } = req.body;

  // 1. Check if agent exists
  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  
  // SECURITY THEATER: Even if email doesn't exist, we say "Token Sent" 
  // to prevent hackers from scanning for valid emails.
  if (!user) {
     // Delay to simulate processing
     await new Promise(resolve => setTimeout(resolve, 1500)); 
     return res.json({ message: 'If this ID exists, a token has been dispatched.' });
  }

  // 2. Generate Token
  const otp_code = generateOTP();
  const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // 3. Update DB
  await supabase
    .from('users')
    .update({ otp_code, otp_expires_at })
    .eq('id', user.id);

  // 4. Send Email
  await sendOtpMail(email, otp_code);
  
  res.json({ message: 'Security Token dispatched.' });
});

// [B] Verify Recovery Token
router.post('/forgot-password/verify-otp', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code } = req.body;

  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  
  if (!user) return res.status(404).json({ error: 'Identity not found.' });

  const now = new Date();
  const expires = new Date(user.otp_expires_at);

  if (String(user.otp_code).trim() !== String(otp_code).trim() || expires < now) {
     return res.status(401).json({ error: 'Token Invalid or Expired.' });
  }

  res.json({ message: 'Token Verified. Proceed to Key Rotation.' });
});

// [C] Execute Key Rotation (Reset Password)
router.post('/forgot-password/reset', async (req, res) => {
  const supabase = req.supabase;
  const { email, otp_code, new_password } = req.body;

  // 1. Verify Token AGAIN (Double Security)
  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  if (!user) return res.status(404).json({ error: 'Identity not found.' });

  const now = new Date();
  const expires = new Date(user.otp_expires_at);

  if (String(user.otp_code).trim() !== String(otp_code).trim() || expires < now) {
     return res.status(401).json({ error: 'Session Expired. Restart Recovery.' });
  }

  // 2. Update Password & Clear Token
  const { error } = await supabase
    .from('users')
    .update({ 
       password: new_password, // In prod, hash this!
       otp_code: null, 
       otp_expires_at: null 
    })
    .eq('id', user.id);

  if (error) return res.status(500).json({ error: 'Write Failure: ' + error.message });

  res.json({ message: 'Access Key Rotated Successfully.' });
});

module.exports = router;