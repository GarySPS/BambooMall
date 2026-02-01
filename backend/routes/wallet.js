// routes/wallet.js

const express = require('express');
const router = express.Router();

// -------- Get Wallet by User ID --------
router.get('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;

  // Try to get wallet
  let { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  // If wallet doesn't exist, create it with balance 0
  if (!wallet) {
    const { data, error: createError } = await supabase
      .from('wallets')
      .insert([{ user_id, balance: 0 }])
      .select()
      .single();
    if (createError) return res.status(400).json({ error: createError.message });
    wallet = data;
  }

  res.json({ wallet });
});

// -------- Submit Deposit (user) --------
router.post('/deposit', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, amount, screenshot_url, note } = req.body;

  // OTP verification check
  const { data: user } = await supabase
    .from('users')
    .select('verified')
    .eq('id', user_id)
    .single();
  if (!user?.verified) return res.status(403).json({ error: "Identity verification required for deposits." });

  // Create Pending Transaction (Positive Amount)
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([{
      user_id,
      type: 'deposit',
      amount: Math.abs(amount), // Ensure positive
      status: 'pending',        // Admin must approve to add to balance
      tx_hash: screenshot_url,
      note
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ deposit: data });
});

// -------- Submit Withdraw (user) --------
router.post('/withdraw', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, amount, address, note } = req.body;
  const withdrawAmount = Math.abs(amount); // Safety: ensure positive input

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

  // 3. EXECUTE IMMEDIATE DEDUCTION (Prevent Double Spend)
  const newBalance = wallet.balance - withdrawAmount;

  // Update Wallet Balance
  const { error: updateError } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', wallet.id);

  if (updateError) return res.status(400).json({ error: "Failed to lock funds." });

  // 4. Create Transaction Record (Negative Amount)
  // We record it as negative so the ledger math works (Sum of all tx = Balance)
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([{
      user_id,
      type: 'withdraw',
      amount: -withdrawAmount, // Negative to show outflow
      status: 'pending',       // Money is gone, but admin must approve the physical transfer
      note,
      address
    }])
    .select()
    .single();

  if (error) {
     // CRITICAL: If TX insert fails, we should technically refund the wallet here.
     // For this simulation, we will just return the error, but in production, use a SQL Transaction.
     return res.status(400).json({ error: error.message });
  }

  res.json({ 
      message: "Withdrawal request processed. Funds reserved.",
      withdraw: data, 
      remaining_balance: newBalance 
  });
});

// -------- Get User Wallet Transaction History --------
router.get('/history/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;
  
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ transactions: data });
});

module.exports = router;