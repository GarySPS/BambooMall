// src/routes/upload.js

const express = require('express');
const multer = require('multer');
const path = require('path'); // Import path
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Helper to generate safe filenames
const getSafeFilename = (originalName) => {
  const ext = path.extname(originalName);
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
};

// ---- Product Image Upload ----
router.post('/product-image', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = getSafeFilename(file.originalname);

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

  res.json({ url: (publicUrl?.publicUrl || '') });
});

// ---- Avatar Upload ----
router.post('/avatar', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = getSafeFilename(file.originalname);

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

  res.json({ url: (publicUrl?.publicUrl || '') });
});

// ---- KYC Document Upload ----
router.post('/kyc', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = getSafeFilename(file.originalname);

  const { error } = await supabase.storage
    .from('kyc') // <--- Make sure this bucket exists!
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) return res.status(400).json({ error: error.message });

  const { data: publicUrl } = supabase
    .storage
    .from('kyc')
    .getPublicUrl(filename);

  res.json({ url: (publicUrl?.publicUrl || '') });
});

// ---- Deposit Screenshot Upload ----
router.post('/deposit', upload.single('file'), async (req, res) => {
  const supabase = req.supabase;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = getSafeFilename(file.originalname);

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

  res.json({ url: (publicUrl?.publicUrl || '') });
});

module.exports = router;