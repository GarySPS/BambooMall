const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// ---- Product Image Upload ----
router.post('/product-image', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = Date.now() + '-' + file.originalname;

  const { error } = await supabase.storage
    .from('products')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) return res.status(400).json({ error: error.message });

  const { data: publicUrl } = supabase
    .storage
    .from('products')
    .getPublicUrl(filename);

  res.json({ url: (publicUrl?.publicUrl || '').replace(/[\r\n]+/g, '') });
});

// ---- Avatar Upload ----
router.post('/avatar', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = Date.now() + '-' + file.originalname;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) return res.status(400).json({ error: error.message });

  const { data: publicUrl } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filename);

  res.json({ url: (publicUrl?.publicUrl || '').replace(/[\r\n]+/g, '') });
});

// ---- KYC Document Upload ----
router.post('/kyc', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = Date.now() + '-' + file.originalname;

  const { error } = await supabase.storage
    .from('kyc')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) return res.status(400).json({ error: error.message });

  const { data: publicUrl } = supabase
    .storage
    .from('kyc')
    .getPublicUrl(filename);

  res.json({ url: (publicUrl?.publicUrl || '').replace(/[\r\n]+/g, '') });
});

// ---- Deposit Screenshot Upload ----
router.post('/deposit', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = Date.now() + '-' + file.originalname;

  const { error } = await supabase.storage
    .from('deposit')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) return res.status(400).json({ error: error.message });

  const { data: publicUrl } = supabase
    .storage
    .from('deposit')
    .getPublicUrl(filename);

  res.json({ url: (publicUrl?.publicUrl || '').replace(/[\r\n]+/g, '') });
});

module.exports = router;
