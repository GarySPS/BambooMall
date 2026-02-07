//routes>kyc.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Apply Guard
router.use(authMiddleware);

// 1. Submit Full KYC Application (SECURED)
router.post('/submit-application', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id; // <--- Identify by Token
  
  const { 
    full_name, 
    id_number, 
    phone, 
    address, 
    front_url, 
    back_url, 
    selfie_url 
  } = req.body;

  if (!front_url || !back_url || !selfie_url) {
      return res.status(400).json({ error: "Missing required document photos" });
  }

  try {
    // 2. Fetch User by Token ID to get their short_id safely
    const { data: userCheck, error: checkError } = await supabase
      .from('users')
      .select('id, short_id, kyc_status')
      .eq('id', userId)
      .single();

    if (checkError || !userCheck) {
        return res.status(404).json({ error: "User identity not found." });
    }

    // 3. Prevent re-submission if approved
    if (userCheck.kyc_status === 'approved') {
        return res.status(400).json({ error: "Clearance already granted." });
    }

    const shortId = userCheck.short_id; // <--- Use the TRUSTED short_id from DB

    // A. CLEANUP: Delete previous docs
    await supabase.from('kyc_documents').delete().eq('short_id', shortId);

    // B. Update User Profile
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        full_name, 
        phone, 
        address, 
        id_number, 
        kyc_status: 'pending' 
      })
      .eq('id', userId); // Update by ID

    if (userError) throw userError;

    // C. Insert Document Records
    const docs = [
      { short_id: shortId, name: 'ID Front', doc_type: 'id_front', doc_url: front_url, status: 'pending' },
      { short_id: shortId, name: 'ID Back', doc_type: 'id_back', doc_url: back_url, status: 'pending' },
      { short_id: shortId, name: 'Selfie', doc_type: 'selfie', doc_url: selfie_url, status: 'pending' }
    ];

    const { data: docData, error: docError } = await supabase
      .from('kyc_documents')
      .insert(docs)
      .select();

    if (docError) throw docError;

    res.json({ success: true, message: "KYC Application Submitted", docs: docData });

  } catch (error) {
    console.error("KYC Submit Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get all KYC docs (SECURED)
router.get('/', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;

  // 1. Get the user's short_id first
  const { data: user } = await supabase
    .from('users')
    .select('short_id, is_admin')
    .eq('id', userId)
    .single();

  if (!user) return res.status(404).json({ error: "User not found" });

  let query = supabase.from('kyc_documents').select('*');

  // 2. Access Control
  if (user.is_admin) {
      // Admins can filter by specific short_id if provided
      if (req.query.short_id) {
          query = query.eq('short_id', req.query.short_id);
      }
  } else {
      // Regular users can ONLY see their own docs
      query = query.eq('short_id', user.short_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ kyc_docs: data || [] });
});

module.exports = router;