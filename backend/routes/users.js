//routes>users.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // <--- 1. Import Security Guard

// --- 1. Get Profile (SECURED) ---
// We removed 'short_id' from the query. Now we trust the Token.
router.get('/profile', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id; // <--- 2. Get ID from Token (Safe)

  try {
    // 1. Fetch User
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId) // Only fetch the logged-in user
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // 2. Fetch Wallet
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    const wallet = {
      balance: walletData?.balance || 0,
      // THE ANALYST HOOK: Fake Credit Limit (server-side controlled)
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

// --- 2. Update Profile (SECURED) ---
router.put('/:user_id', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  const requestedId = req.params.user_id;
  const authenticatedId = req.user.id;

  // SECURITY: Prevent editing other people's profiles
  if (requestedId !== authenticatedId && !req.user.is_admin) {
     return res.status(403).json({ error: "Access Denied. You cannot modify this profile." });
  }
  
  // Prevent users from hacking their own "Verified" status
  const safeUpdateData = { ...req.body };
  delete safeUpdateData.verified;
  delete safeUpdateData.kyc_status;
  delete safeUpdateData.is_admin;
  delete safeUpdateData.short_id; 
  delete safeUpdateData.password; // Password must use the specific route

  const { data, error } = await supabase
    .from('users')
    .update(safeUpdateData)
    .eq('id', requestedId)
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data });
});

// --- 3. Change Password (SECURED) ---
router.post('/change-password', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  const { old_password, new_password } = req.body;
  const userId = req.user.id; // <--- Get ID from Token (Cannot be faked)

  // Verify old Access Key
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .eq('password', old_password) 
    .single();

  if (!user) return res.status(401).json({ error: 'Invalid Current Access Key' });

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: new_password })
    .eq('id', userId);

  if (updateError) return res.status(400).json({ error: updateError.message });
  res.json({ message: 'Access Key Updated Successfully' });
});

module.exports = router;