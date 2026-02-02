// src/routes/kyc.js

const express = require('express');
const router = express.Router();

// 1. Submit Full KYC Application
router.post('/submit-application', async (req, res) => {
  const supabase = req.supabase;
  const { 
    short_id, 
    full_name, 
    id_number, 
    phone, 
    address, 
    front_url, 
    back_url, 
    selfie_url 
  } = req.body;

  // 1. Input Validation
  if (!short_id) return res.status(400).json({ error: "User ID missing" });
  if (!front_url || !back_url || !selfie_url) {
      return res.status(400).json({ error: "Missing required document photos" });
  }

  try {
    // 2. Verify User Exists
    const { data: userCheck, error: checkError } = await supabase
      .from('users')
      .select('id, kyc_status')
      .eq('short_id', String(short_id)) // Ensure string comparison
      .single();

    if (checkError || !userCheck) {
        return res.status(404).json({ error: "User identity not found in registry." });
    }

    // 3. Prevent re-submission if already approved
    if (userCheck.kyc_status === 'approved') {
        return res.status(400).json({ error: "Clearance already granted. No further action required." });
    }

    // A. CLEANUP: Delete previous documents for this user (prevent stacking)
    await supabase.from('kyc_documents').delete().eq('short_id', short_id);

    // B. Update User Profile Data & Status
    // CRITICAL: We set kyc_status to 'pending'. 
    // This tells the frontend to stop showing the "Lock" and start showing "Audit in Progress".
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        full_name: full_name, 
        phone: phone, 
        address: address, 
        id_number: id_number, 
        kyc_status: 'pending' 
      })
      .eq('short_id', short_id);

    if (userError) throw userError;

    // C. Insert Document Records
    const docs = [
      { short_id, name: 'ID Front', doc_type: 'id_front', doc_url: front_url, status: 'pending' },
      { short_id, name: 'ID Back', doc_type: 'id_back', doc_url: back_url, status: 'pending' },
      { short_id, name: 'Selfie', doc_type: 'selfie', doc_url: selfie_url, status: 'pending' }
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

// 2. Get all KYC docs (Existing)
router.get('/', async (req, res) => {
  const supabase = req.supabase;
  const { short_id } = req.query;

  let query = supabase.from('kyc_documents').select('*');
  
  // FIX: Treat short_id strictly as a string to preserve leading zeros (e.g. "05211")
  if (short_id) {
    query = query.eq('short_id', String(short_id));
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ kyc_docs: data || [] });
});

module.exports = router;