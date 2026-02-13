// routes/wallet.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer'); // <--- ADD THIS

// --- EMAIL SETUP (Place this here, outside the routes) ---
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS 
  }
});

// --- HELPER: Safely extract User ID from Token ---
function getAuthUserId(req) {
  if (!req.user) return null;
  
  // 1. Check your specific nested structure (req.user.user.id)
  if (req.user.user && req.user.user.id) {
    return req.user.user.id;
  }

  // 2. Check standard flat structures (fallbacks)
  return req.user.id || req.user.sub || req.user.uid;
}

// -------- Get Wallet & Net Worth (SECURED) --------
router.get('/:user_id', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  let requestedId = req.params.user_id;
  
  // 1. ROBUST ID CHECK
  const authenticatedId = getAuthUserId(req);
  
  if (!authenticatedId) {
    console.error("CRITICAL: Token verified but User ID is missing.", req.user);
    return res.status(500).json({ error: "Authentication failed: Invalid token structure." });
  }

  // 2. Handle 'me' alias
  if (requestedId === 'me') {
    requestedId = authenticatedId;
  }

  // 3. SECURITY CHECK: Prevent spying
  if (requestedId !== authenticatedId && !req.user.is_admin) {
     return res.status(403).json({ error: "Access denied. You can only view your own wallet." });
  }

  // 4. Get Liquid Wallet (Cash)
  let { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', requestedId)
    .single();

  // If wallet doesn't exist, create it with balance 0 (Safe Init)
  if (!wallet) {
    if (error && error.code !== 'PGRST116') {
         return res.status(400).json({ error: error.message });
    }

    const { data, error: createError } = await supabase
      .from('wallets')
      .insert([{ user_id: requestedId, balance: 0 }])
      .select()
      .single();
    
    if (createError) {
        console.error("Wallet Init Failed:", createError);
        return res.status(400).json({ error: "Failed to initialize wallet." });
    }
    wallet = data;
  }

  // 5. Calculate Stock Value
  const { data: stockData } = await supabase
    .from('orders')
    .select('amount')
    .eq('user_id', requestedId)
    .eq('status', 'selling'); 

  let stockValue = 0;
  if (stockData && stockData.length > 0) {
    stockValue = stockData.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  }

  // 6. Combine for Frontend
  const liquidBalance = Number(wallet.balance || 0);
  const totalNetWorth = liquidBalance + stockValue;

  res.json({ 
    wallet: {
      ...wallet,
      stock_value: stockValue,     
      net_worth: totalNetWorth,
      credit_limit: 50000.00      
    }
  });
});

// -------- Submit Deposit (SECURED + EMAIL) --------
router.post('/deposit', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  
  const user_id = getAuthUserId(req);
  if (!user_id) return res.status(500).json({ error: "User ID missing." });

  const { amount, screenshot_url, note } = req.body;

  // 1. Get User Details (Added 'username' to the selection)
  const { data: user } = await supabase
    .from('users')
    .select('username, verified') 
    .eq('id', user_id)
    .single();
  
  if (!user?.verified) return res.status(403).json({ error: "Identity verification required." });

  // 2. Insert into Database
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([{
      user_id, 
      type: 'deposit',
      amount: Math.abs(amount),
      status: 'pending',       
      tx_hash: screenshot_url,
      note
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // 3. SEND EMAIL (This is the part you were missing)
  try {
    const mailOptions = {
      from: `"BambooMall System" <${process.env.MAIL_USER}>`,
      to: 'xiaozhe212121@gmail.com', // <--- Admin Email
      subject: `💰 Deposit Request: $${amount} - ${user.username || 'User'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2c3e50;">New Deposit Request</h2>
          <p><strong>User:</strong> ${user.username || 'Unknown'} (ID: ${user_id})</p>
          <p><strong>Amount:</strong> <span style="font-size: 1.2em; color: #27ae60; font-weight: bold;">$${amount}</span></p>
          <p><strong>Method/Note:</strong> ${note || 'N/A'}</p>
          <p><strong>Screenshot:</strong> <a href="${screenshot_url}" style="color: #3498db;">View Receipt</a></p>
          <hr style="border: 1px solid #eee;">
          <p style="font-size: 0.9em; color: #7f8c8d;">Check Supabase Admin Panel to approve.</p>
        </div>
      `
    };

    // Send without waiting (fire and forget) so the user doesn't wait
    transporter.sendMail(mailOptions).catch(err => console.error("Email failed:", err));

  } catch (emailErr) {
    console.error("Email setup error:", emailErr);
  }

  // 4. Respond to Frontend
  res.json({ deposit: data });
});

// -------- Submit Withdraw (SECURED + EMAIL) --------
router.post('/withdraw', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  
  const user_id = getAuthUserId(req);
  if (!user_id) return res.status(500).json({ error: "User ID missing." });

  const { amount, address, note } = req.body;
  const withdrawAmount = Math.abs(amount); 

  // 1. Get User Details (Fetch username for the email)
  const { data: user } = await supabase
    .from('users')
    .select('username, verified')
    .eq('id', user_id)
    .single();

  if (!user?.verified) return res.status(403).json({ error: "Identity verification required." });

  // 2. Fetch Wallet & Check Balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!wallet || (wallet.balance || 0) < withdrawAmount) {
    return res.status(400).json({ error: "Insufficient liquidity." });
  }

  // 3. EXECUTE IMMEDIATE DEDUCTION (Lock funds)
  const newBalance = wallet.balance - withdrawAmount;

  const { error: updateError } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet.id);

  if (updateError) return res.status(400).json({ error: "Failed to lock funds." });

  // 4. Create Transaction Record
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([{
      user_id,
      type: 'withdraw',
      amount: -withdrawAmount, 
      status: 'pending',      
      note,
      address
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // 5. SEND EMAIL TO ADMIN
  try {
    const mailOptions = {
      from: `"BambooMall System" <${process.env.MAIL_USER}>`,
      to: 'xiaozhe212121@gmail.com', // <--- Admin Email
      subject: `💸 Withdrawal Request: $${withdrawAmount} - ${user.username}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #c0392b;">New Withdrawal Request</h2>
          <p><strong>User:</strong> ${user.username || 'Unknown'} (ID: ${user_id})</p>
          <p><strong>Amount:</strong> <span style="font-size: 1.2em; color: #c0392b; font-weight: bold;">$${withdrawAmount}</span></p>
          <p><strong>Destination Address:</strong><br>
          <code style="background: #eee; padding: 5px; border-radius: 4px;">${address}</code></p>
          <p><strong>Method/Note:</strong> ${note}</p>
          <hr style="border: 1px solid #eee;">
          <p style="font-size: 0.9em; color: #7f8c8d;">
            Funds have been <strong>deducted</strong> from the user's balance.<br>
            Please process the payment manually to the address above.
          </p>
        </div>
      `
    };

    transporter.sendMail(mailOptions).catch(err => console.error("Withdraw Email failed:", err));
    console.log(`Withdraw email sent for user ${user_id}`);

  } catch (emailErr) {
    console.error("Email setup error:", emailErr);
  }

  // 6. Respond to Frontend
  res.json({ 
      message: "Withdrawal request processed. Funds reserved.",
      withdraw: data, 
      remaining_balance: newBalance 
  });
});

// -------- Get User Wallet Transaction History (SECURED) --------
router.get('/history/:user_id', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  let requestedId = req.params.user_id;

  const authenticatedId = getAuthUserId(req);
  if (!authenticatedId) return res.status(500).json({ error: "User ID missing." });

  if (requestedId === 'me') {
    requestedId = authenticatedId;
  }

  // SECURITY CHECK
  if (requestedId !== authenticatedId && !req.user.is_admin) {
    return res.status(403).json({ error: "Access denied." });
  }
  
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', requestedId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ transactions: data });
});

module.exports = router;