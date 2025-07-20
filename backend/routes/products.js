const express = require('express');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  const supabase = req.supabase;
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  const supabase = req.supabase;
  const { id } = req.params;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
});

// Add product (admin-only in future, open now)
router.post('/', async (req, res) => {
  const supabase = req.supabase;
  const {
    title, description, price, min_order,
    color, size, brand, factory_url,
    images, rating, review_count, discount
  } = req.body;

  const { data, error } = await supabase
    .from('products')
    .insert([{
      title,
      description,
      price,
      min_order,
      color,
      size,
      brand,
      factory_url,
      images,
      rating,
      review_count,
      discount
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ product: data });
});

module.exports = router;
