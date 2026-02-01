//src>routes>users.js

const express = require('express');
const router = express.Router();

// --- 1. Get Profile (Used by Context) ---
router.get('/profile', async (req, res) => {
  const supabase = req.supabase;
  const { short_id } = req.query;

  if (!short_id) return res.status(400).json({ error: 'Missing Identity Parameter' });

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('short_id', short_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // Fetch Wallet & Credit Line
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const wallet = {
      balance: walletData?.balance || 0,
      // THE ANALYST HOOK: Fake Credit Limit makes them feel "Verified"
      credit_limit: 50000.00, 
      currency: "USDC",
      tier: "Wholesale (Level 2)"
    };

    res.json({ user, wallet });

  } catch (error) {
    console.error("System Error:", error);
    res.status(500).json({ error: "Internal Service Error" });
  }
});

// --- 2. Update Profile ---
router.put('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const { user_id } = req.params;
  
  // Prevent users from hacking their own "Verified" status
  const safeUpdateData = { ...req.body };
  delete safeUpdateData.verified;
  delete safeUpdateData.kyc_status;
  delete safeUpdateData.is_admin;

  const { data, error } = await supabase
    .from('users')
    .update(safeUpdateData)
    .eq('id', user_id)
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data });
});

// --- 3. Change Password ---
router.post('/change-password', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, old_password, new_password } = req.body;

  // Verify old Access Key
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', user_id)
    .eq('password', old_password) // In real prod, use bcrypt.compare
    .single();

  if (!user) return res.status(401).json({ error: 'Invalid Current Access Key' });

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: new_password })
    .eq('id', user_id);

  if (updateError) return res.status(400).json({ error: updateError.message });
  res.json({ message: 'Access Key Updated Successfully' });
});

module.exports = router;