// routes/wallet.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

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

// -------- Submit Deposit (SECURED) --------
router.post('/deposit', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  
  const user_id = getAuthUserId(req);
  if (!user_id) return res.status(500).json({ error: "User ID missing." });

  const { amount, screenshot_url, note } = req.body;

  // OTP verification check
  const { data: user } = await supabase
    .from('users')
    .select('verified')
    .eq('id', user_id)
    .single();
  
  if (!user?.verified) return res.status(403).json({ error: "Identity verification required for deposits." });

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
  res.json({ deposit: data });
});

// -------- Submit Withdraw (SECURED) --------
router.post('/withdraw', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  
  const user_id = getAuthUserId(req);
  if (!user_id) return res.status(500).json({ error: "User ID missing." });

  const { amount, address, note } = req.body;
  const withdrawAmount = Math.abs(amount); 

  // OTP verification check
  const { data: user } = await supabase
    .from('users')
    .select('verified')
    .eq('id', user_id)
    .single();
  if (!user?.verified) return res.status(403).json({ error: "Identity verification required for withdrawals." });

  // Fetch Wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!wallet || (wallet.balance || 0) < withdrawAmount) {
    return res.status(400).json({ error: "Insufficient liquidity." });
  }

  // EXECUTE IMMEDIATE DEDUCTION
  const newBalance = wallet.balance - withdrawAmount;

  const { error: updateError } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet.id);

  if (updateError) return res.status(400).json({ error: "Failed to lock funds." });

  // Create Transaction Record
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