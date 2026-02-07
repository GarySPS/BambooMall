// routes/users.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// --- HELPER: Safely extract User ID from Token ---
function getAuthUserId(req) {
  if (!req.user) return null;
  // Check nested structure (fix for your errors)
  if (req.user.user && req.user.user.id) return req.user.user.id;
  // Check standard structures
  return req.user.id || req.user.sub || req.user.uid;
}

// --- 1. Get Profile (SECURED) ---
router.get('/profile', authMiddleware, async (req, res) => {
  const supabase = req.supabase;
  
  // 1. FIX: Use the safe ID helper
  const userId = getAuthUserId(req);

  if (!userId) {
     return res.status(500).json({ error: "Authentication Error: User ID missing." });
  }

  try {
    // 2. Fetch User
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId) 
      .single();

    if (userError || !user) {
      // This was the cause of your 404!
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // 3. Fetch Wallet
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    const wallet = {
      balance: walletData?.balance || 0,
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
  let requestedId = req.params.user_id;
  
  // FIX: Use safe ID helper
  const authenticatedId = getAuthUserId(req);

  // Handle 'me'
  if (requestedId === 'me') {
    requestedId = authenticatedId;
  }

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
  delete safeUpdateData.password; 

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
  
  // FIX: Use safe ID helper
  const userId = getAuthUserId(req);

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