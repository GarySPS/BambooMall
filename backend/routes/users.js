//routes>users.js

const express = require('express');
const router = express.Router();

// --- PROFILE ROUTES ---

// 1. Get Profile by Short ID (Used by UserContext)
router.get('/profile', async (req, res) => {
  const supabase = req.supabase;
  const { short_id } = req.query;

  if (!short_id) return res.status(400).json({ error: 'Missing short_id' });

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('short_id', short_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch Wallet
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const wallet = {
      balance: walletData?.balance || 0,
    };

    res.json({ user, wallet });

  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get User Profile By USER_ID (Generic)
router.get('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const { user_id } = req.params;
  
  // Safety check to ensure 'profile' requests didn't slip through
  if (user_id === 'profile') return res.status(404).json({error: "Invalid ID"});

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id) 
    .single();

  if (error || !data) return res.status(404).json({ error: 'User not found' });

  res.json({ user: data });
});

// 3. Update User Profile By USER_ID
router.put('/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const { user_id } = req.params;
  const updateData = req.body;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user_id)
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data });
});

// 4. Change Password (Authenticated Action)
router.post('/change-password', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, old_password, new_password } = req.body;

  // Verify old password first
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .eq('password', old_password)
    .single();

  if (!user) return res.status(401).json({ error: 'Old password incorrect' });

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: new_password })
    .eq('id', user_id);

  if (updateError) return res.status(400).json({ error: updateError.message });
  res.json({ message: 'Password changed successfully' });
});

module.exports = router;