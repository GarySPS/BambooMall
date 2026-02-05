// routes/wallet.js

const express = require('express');
const router = express.Router();

// -------- Get Wallet & Net Worth (TIER CALCULATION UPDATE) --------
router.get('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;

  // 1. Get Liquid Wallet (Cash)
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

  // 2. [NEW] Calculate Stock Value (Capital locked in 'selling' items)
  // We sum the 'amount' (cost) of all items currently owned by the user
  const { data: stockData, error: stockError } = await supabase
    .from('orders')
    .select('amount')
    .eq('user_id', user_id)
    .eq('status', 'selling'); // Only count active stock

  let stockValue = 0;
  if (stockData && stockData.length > 0) {
    // Sum up the amounts
    stockValue = stockData.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  }

  // 3. Combine for Frontend
  const liquidBalance = Number(wallet.balance || 0);
  const totalNetWorth = liquidBalance + stockValue;

  // Send everything back so the frontend can show the breakdown
  res.json({ 
    wallet: {
      ...wallet,
      stock_value: stockValue,      // Active Inventory Value
      net_worth: totalNetWorth      // The NEW number used for Tiers
    }
  });
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