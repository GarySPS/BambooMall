// routes/products.js

const express = require('express');
const router = express.Router();

// Get all products (Manifest List)
router.get('/', async (req, res) => {
  const supabase = req.supabase;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
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
  res.json(data);
});

// Add product (Admin: Create Manifest)
router.post('/', async (req, res) => {
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
    supplier
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
      min_order,
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
      supplier: supplier || "Direct Factory"
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ product: data });
});

module.exports = router;