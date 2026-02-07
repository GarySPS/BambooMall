//routes>products.js

const express = require('express');
const router = express.Router();

// --- SECURITY GUARDS ---
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ==========================================
// 1. PUBLIC ROUTES (View Only)
// ==========================================

// Get all products (Manifest List)
router.get('/', async (req, res) => {
  const supabase = req.supabase;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(400).json({ error: error.message });

  // Inject Batch ID so it is available to the API consumers
  const enrichedData = data.map(item => ({
    ...item,
    // Using ID ensures this number is permanent and unique
    batchId: `BATCH-CN-${202600 + (item.id || 0)}`
  }));

  res.json(enrichedData);
});

// Get a single product (Manifest Detail)
router.get('/:id', async (req, res) => {
  const supabase = req.supabase;
  const { id } = req.params;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !data) return res.status(404).json({ error: 'Manifest not found' });

  // Inject Batch ID for the details page
  const enrichedProduct = {
    ...data,
    batchId: `BATCH-CN-${202600 + (data.id || 0)}`
  };

  res.json(enrichedProduct);
});

// ==========================================
// 2. ADMIN ROUTES (Protected)
// ==========================================

// Add product (Admin: Create Manifest)
// LOCKED: Only Admins can create products
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const supabase = req.supabase;
  const {
    title, description, price, min_order,
    color, size, brand, factory_url,
    images, rating, review_count, discount,
    // NEW FIELDS for "Analyst View"
    key_attributes, 
    gallery, 
    price_tiers,
    stock,
    supplier,
    country
  } = req.body;

  // Validate JSON fields to prevent DB errors
  const safeJson = (val) => {
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return []; }
  };

  const { data, error } = await supabase
    .from('products')
    .insert([{
      title,
      description,
      price,
      min_order: parseInt(min_order || 1),
      color: safeJson(color),
      size: safeJson(size),
      brand,
      factory_url,
      images: safeJson(images),
      rating,
      review_count,
      discount,
      key_attributes: safeJson(key_attributes),
      gallery: safeJson(gallery),
      price_tiers: safeJson(price_tiers),
      stock: stock || 5000,
      supplier: supplier || "Direct Factory",
      country: country || "China"
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ product: data });
});

// Optional: DELETE product (Admin Only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const supabase = req.supabase;
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Product deleted successfully" });
});

module.exports = router;