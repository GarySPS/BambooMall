//routes>wallet.js

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
  if (!user?.verified) return res.status(403).json({ error: "OTP verification required." });

  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([{
      user_id,
      type: 'deposit',
      amount,
      status: 'pending',
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

  // OTP verification check
  const { data: user } = await supabase
    .from('users')
    .select('verified')
    .eq('id', user_id)
    .single();
  if (!user?.verified) return res.status(403).json({ error: "OTP verification required." });

  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([{
      user_id,
      type: 'withdraw',
      amount,
      status: 'pending',
      note,
      address
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ withdraw: data });
});

// -------- Get User Wallet Transaction History --------
router.get('/transactions/:user_id', async (req, res) => {
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
