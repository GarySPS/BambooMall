// routes/wallet.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import the guard

// -------- Get Wallet & Net Worth (SECURED) --------
// We keep :user_id in the URL to match Frontend, but we VALIDATE it matches the token
router.get('/:user_id', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  const requestedId = req.params.user_id;
  const authenticatedId = req.user.id; // From Token

  // SECURITY CHECK: Prevent users from spying on others
  // (Assuming admins can see everyone, but regular users can only see themselves)
  if (requestedId !== authenticatedId && !req.user.is_admin) {
     return res.status(403).json({ error: "Access denied. You can only view your own wallet." });
  }

  // 1. Get Liquid Wallet (Cash)
  let { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', requestedId) // Use the ID we just validated
    .single();

  // If wallet doesn't exist, create it with balance 0
  if (!wallet) {
    const { data, error: createError } = await supabase
      .from('wallets')
      .insert([{ user_id: requestedId, balance: 0 }])
      .select()
      .single();
    if (createError) return res.status(400).json({ error: createError.message });
    wallet = data;
  }

  // 2. Calculate Stock Value
  const { data: stockData } = await supabase
    .from('orders')
    .select('amount')
    .eq('user_id', requestedId)
    .eq('status', 'selling'); 

  let stockValue = 0;
  if (stockData && stockData.length > 0) {
    stockValue = stockData.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  }

  // 3. Combine for Frontend
  const liquidBalance = Number(wallet.balance || 0);
  const totalNetWorth = liquidBalance + stockValue;

  res.json({ 
    wallet: {
      ...wallet,
      stock_value: stockValue,     
      net_worth: totalNetWorth,
      // SECURITY: Backend controls the credit limit now
      credit_limit: 50000.00      
    }
  });
});

// -------- Submit Deposit (SECURED) --------
router.post('/deposit', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  // SECURITY: Ignore user_id from body. Use the token's ID.
  const user_id = req.user.id; 
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
      user_id, // Guaranteed to be the logged-in user
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
  // SECURITY: Ignore user_id from body. Use the token's ID.
  const user_id = req.user.id;
  const { amount, address, note } = req.body;
  const withdrawAmount = Math.abs(amount); 

  // 1. OTP verification check
  const { data: user } = await supabase
    .from('users')
    .select('verified')
    .eq('id', user_id)
    .single();
  if (!user?.verified) return res.status(403).json({ error: "Identity verification required for withdrawals." });

  // 2. Fetch Wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!wallet || (wallet.balance || 0) < withdrawAmount) {
    return res.status(400).json({ error: "Insufficient liquidity." });
  }

  // 3. EXECUTE IMMEDIATE DEDUCTION
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

  res.json({ 
      message: "Withdrawal request processed. Funds reserved.",
      withdraw: data, 
      remaining_balance: newBalance 
  });
});

// -------- Get User Wallet Transaction History (SECURED) --------
router.get('/history/:user_id', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  const requestedId = req.params.user_id;
  const authenticatedId = req.user.id;

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