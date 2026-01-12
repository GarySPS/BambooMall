//routes>kyc.js

const express = require('express');
const router = express.Router();

// 1. Submit Full KYC Application (Updated)
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

  if (!short_id) return res.status(400).json({ error: "User ID missing" });

  try {
    // A. CLEANUP: Delete ALL previous documents for this user before adding new ones
    // This prevents "stacking" images if they got rejected and are trying again.
    const { error: deleteError } = await supabase
      .from('kyc_documents')
      .delete()
      .eq('short_id', short_id);

    if (deleteError) throw deleteError;

    // B. Update User Profile Data
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

    // C. Insert Document Records (3 rows)
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
  let short_id = req.query.short_id;

  if (short_id && !isNaN(short_id)) {
    short_id = parseInt(short_id, 10);
  } else {
    short_id = null;
  }

  let query = supabase.from('kyc_documents').select('*');
  if (short_id) query = query.eq('short_id', short_id);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ kyc_docs: data || [] });
});

module.exports = router;