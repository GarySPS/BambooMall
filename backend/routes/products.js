//routes>products.js

const express = require('express');
const router = express.Router();

// --- SECURITY GUARDS ---
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// HELPER: Convert Data to String for Database TEXT columns
// Your database columns are 'text', so we must JSON.stringify objects before saving.
const safeStringify = (val) => {
    if (!val) return '[]'; // Default to empty array string if null
    if (typeof val === 'string') return val; // If already string, return it
    return JSON.stringify(val); // Convert Object/Array to String
};

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
    // FIX: Use substring of the UUID instead of adding numbers to text
    batchId: `BATCH-CN-${(item.id || '').substring(0, 8).toUpperCase()}`
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
    batchId: `BATCH-CN-${(data.id || '').substring(0, 8).toUpperCase()}`
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

  const { data, error } = await supabase
    .from('products')
    .insert([{
      title,
      description,
      price,
      min_order: parseInt(min_order || 1),
      stock: parseInt(stock || 5000),
      brand,
      factory_url,
      rating,
      review_count,
      discount,
      supplier: supplier || "Direct Factory",
      country: country || "China",

      // --- CRITICAL FIX: Stringify JSON for TEXT columns ---
      // We use safeStringify because your DB columns are type 'text'
      color: safeStringify(color),
      size: safeStringify(size),
      images: safeStringify(images),
      gallery: safeStringify(gallery),
      key_attributes: safeStringify(key_attributes),
      price_tiers: safeStringify(price_tiers) 
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