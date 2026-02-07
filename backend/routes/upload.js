//routes>upload.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Helper to generate safe filenames
const getSafeFilename = (originalName) => {
  const ext = path.extname(originalName);
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
};

// APPLY SECURITY GUARD
// All uploads require a valid token now.
router.use(authMiddleware);

// Helper function to handle Supabase upload
const handleUpload = async (req, res, bucket) => {
    const supabase = req.supabase;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const filename = getSafeFilename(file.originalname);

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) return res.status(400).json({ error: error.message });

    const { data: publicUrl } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(filename);

    res.json({ url: (publicUrl?.publicUrl || '') });
};

// ---- Routes ----

router.post('/product-image', upload.single('file'), async (req, res) => {
    // Optional: Add admin check here if only admins should upload products
    if (!req.user.is_admin) return res.status(403).json({ error: "Admin only" });
    await handleUpload(req, res, 'products');
});

router.post('/avatar', upload.single('file'), async (req, res) => {
    await handleUpload(req, res, 'avatars');
});

router.post('/kyc', upload.single('file'), async (req, res) => {
    await handleUpload(req, res, 'kyc');
});

router.post('/deposit', upload.single('file'), async (req, res) => {
    await handleUpload(req, res, 'deposit');
});

module.exports = router;