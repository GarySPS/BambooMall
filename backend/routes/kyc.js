const express = require('express');
const router = express.Router();

// Submit KYC (user uploads document)
router.post('/submit', async (req, res) => {
  console.log("KYC SUBMIT BODY:", req.body);

  const supabase = req.supabase;
  const { short_id, name, doc_type, doc_url } = req.body; // <--- changed
  const { data, error } = await supabase
    .from('kyc_documents')
    .insert([
      {
        short_id, // <--- changed
        name,
        doc_type,
        doc_url,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Update user's kyc_status to 'pending'
  await supabase.from('users').update({ kyc_status: 'pending' }).eq('short_id', short_id); // <--- changed

  res.json({ kyc: data });
});

// Get all KYC docs for admin or for a user (admin view or user KYC history)
router.get('/', async (req, res) => {
  const supabase = req.supabase;
  let short_id = req.query.short_id;

  // Defensive: Convert short_id to integer, or skip if not present
  if (short_id && !isNaN(short_id)) {
    short_id = parseInt(short_id, 10);
  } else {
    short_id = null;
  }

  let query = supabase.from('kyc_documents').select('*');
  if (short_id) query = query.eq('short_id', short_id);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    // Log for debug
    console.error('KYC GET ERROR:', error);
    return res.status(400).json({ error: error.message });
  }
  res.json({ kyc_docs: data || [] });
});

// Get single KYC doc by ID (unchanged)
router.get('/:id', async (req, res) => {
  const supabase = req.supabase;
  const { id } = req.params;
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'KYC doc not found' });
  res.json({ kyc_doc: data });
});

module.exports = router;
