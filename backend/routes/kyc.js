//routes>kyc.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Apply Guard
router.use(authMiddleware);

// 1. Submit Full KYC Application (SECURED)
router.post('/submit-application', async (req, res) => {
  const supabase = req.supabase;
  
  // Robust ID check: handles standard JWTs and nested Supabase auth objects
  const userId = req.user.id || req.user.sub || (req.user.user && req.user.user.id);

  if (!userId) {
    return res.status(401).json({ error: "Invalid Authentication Token Structure" });
  }

  const { 
    full_name, 
    id_number, 
    phone, 
    address, 
    front_url, 
    back_url, 
    selfie_url 
  } = req.body;

  if (!front_url || !selfie_url) {
      return res.status(400).json({ error: "Missing required document photos" });
  }

  try {
    // 2. Fetch User by Token ID
    const { data: userCheck, error: checkError } = await supabase
      .from('users')
      .select('id, short_id, kyc_status')
      .eq('id', userId)
      .single();

    if (checkError || !userCheck) {
        return res.status(404).json({ error: "User identity not found in database." });
    }

    // 3. Prevent re-submission if approved
    if (userCheck.kyc_status === 'approved') {
        return res.status(400).json({ error: "Clearance already granted." });
    }

    const shortId = userCheck.short_id; 

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
      .eq('id', userId);

    if (userError) throw userError;

    // C. Insert Document Records
    const docs = [
      { short_id: shortId, name: 'ID Front', doc_type: 'id_front', doc_url: front_url, status: 'pending' },
      { short_id: shortId, name: 'Selfie', doc_type: 'selfie', doc_url: selfie_url, status: 'pending' }
    ];

    // Only add back ID if it exists
    if (back_url && back_url !== "NOT_PROVIDED") {
        docs.push({ short_id: shortId, name: 'ID Back', doc_type: 'id_back', doc_url: back_url, status: 'pending' });
    }

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
  const userId = req.user.id || req.user.sub || (req.user.user && req.user.user.id);

  const { data: user } = await supabase
    .from('users')
    .select('short_id, is_admin')
    .eq('id', userId)
    .single();

  if (!user) return res.status(404).json({ error: "User not found" });

  let query = supabase.from('kyc_documents').select('*');

  if (user.is_admin && req.query.short_id) {
      query = query.eq('short_id', req.query.short_id);
  } else {
      query = query.eq('short_id', user.short_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ kyc_docs: data || [] });
});

module.exports = router;