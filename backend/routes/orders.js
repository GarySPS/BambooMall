const express = require('express');
const router = express.Router();

// -------- Helper functions -------- //
function getVipBonus(balance) {
  // Must match frontend exactly
  if (balance >= 40000) return 10;
  if (balance >= 20000) return 8;
  if (balance >= 15000) return 6;
  if (balance >= 10000) return 5;
  if (balance >= 5000) return 4;
  return 0;
}

// (Optionally, if you support price tiers: add tier selection here)
async function getProductDiscount(supabase, product_id) {
  const { data: product } = await supabase
    .from('products')
    .select('price,discount')
    .eq('id', product_id)
    .single();
  return product || {};
}

// -------- Order Routes -------- //

// Place a buy/resell order (deducts balance, creates order)
router.post('/', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, product_id, quantity, type } = req.body;

  // 1. Get product info
  const { data: product } = await supabase
    .from('products')
    .select('price, discount')
    .eq('id', product_id)
    .single();

  if (!product) return res.status(404).json({ error: "Product not found" });

  // 2. Get user wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  // 3. Calculate discounts & totals (MUST MATCH FRONTEND)
  const unit_price = product.price;
  const full_price = unit_price * quantity;
  const admin_discount = product.discount || 0;
  const vip_bonus = getVipBonus(wallet.balance || 0);
  const total_discount = admin_discount + vip_bonus;

  // Pay amount, rounded to 2 decimals for precision
  const pay_amount = Math.round(full_price * (1 - total_discount / 100) * 100) / 100;

  // Profit = resale - pay_amount (resale = unit_price * quantity)
  const resale_price = unit_price * quantity;
  const profit = resale_price - pay_amount;

  // 4. Check balance
  if (wallet.balance < pay_amount) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  // 5. Deduct balance
  await supabase
    .from('wallets')
    .update({ balance: wallet.balance - pay_amount })
    .eq('id', wallet.id);

  // 6. Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert([{
      user_id,
      product_id,
      quantity,
      amount: pay_amount,
      status: 'selling',
      type: type || 'buy',
      admin_discount,
      vip_bonus,
      total_discount,
      earn: profit
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "Order placed",
    order,
    pay_amount,
    full_price,
    total_discount,
    profit
  });
});

// Order preview (shows all calculated discounts/bonus)
router.post('/preview', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, product_id, quantity } = req.body;
  // 1. Get user wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user_id)
    .single();
  // 2. Get product price & discount
  const { price = 0, discount = 0 } = await getProductDiscount(supabase, product_id);
  // 3. Get VIP bonus
  const vipBonus = getVipBonus(wallet?.balance || 0);
  // 4. Calculate totals
  const totalDiscount = discount + vipBonus;
  const fullPrice = price * quantity;
  const payAmount = Math.round(fullPrice * (1 - totalDiscount / 100) * 100) / 100;
  const resalePrice = price * quantity;
  const profit = resalePrice - payAmount;
  // 5. Response for preview
  res.json({
    product_id, quantity,
    unit_price: price,
    full_price: fullPrice,
    admin_discount: discount,
    vip_bonus: vipBonus,
    total_discount: totalDiscount,
    pay_amount: payAmount,
    resale_price: resalePrice,
    profit: profit
  });
});

// Get all orders for a user WITH product info (normalized for frontend)
router.get('/user/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      product:products (
        title,
        images,
        gallery,
        price
      )
    `)
    .eq('user_id', user_id)
.in('status', ['selling', 'refund_pending', 'sold'])
.order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

    const mappedOrders = (data || []).map(order => ({
  id: order.id,
  product: order.product || {}, // Pass full product object
  title: order.product?.title || "Product",
  qty: order.quantity || 0,
  unit_price: order.product?.price || 0,
  admin_discount: order.admin_discount || 0,
  vip_bonus: order.vip_bonus || 0,
  total_discount: order.total_discount || ((order.admin_discount || 0) + (order.vip_bonus || 0)),
  amount: order.amount || 0,
  earn: order.earn || order.profit || 0,
  status: order.status || "",
  created_at: order.created_at,
  image: (() => {
    const images = order.product?.images;
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === "string") {
      try {
        const arr = JSON.parse(images);
        if (Array.isArray(arr) && arr.length > 0) return arr[0];
        if (images.length > 0 && !images.startsWith("[")) return images;
      } catch {
        if (images.length > 0) return images;
      }
    }
    return null;
  })(),
}));
    res.json({ orders: mappedOrders });
});

// Get a single order by ID (optionally add for order detail)
router.get('/:id', async (req, res) => {
  const supabase = req.supabase;
  const { id } = req.params;
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: data });
});

// User requests refund (sets status to refund_pending)
router.post('/refund', async (req, res) => {
  const supabase = req.supabase;
  const { order_id } = req.body;
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'refund_pending' })
    .eq('id', order_id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Refund requested', order: data });
});

router.get('/history/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      product:products (
        title,
        images,
        gallery,
        price
      )
    `)
    .eq('user_id', user_id)
    .in('status', ['sold', 'refunded'])
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  const mappedOrders = (data || []).map(order => ({
    id: order.id,
    product: order.product || {},
    title: order.product?.title || "Product",
    qty: order.quantity || 0,
    unit_price: order.product?.price || 0,
    admin_discount: order.admin_discount || 0,
    vip_bonus: order.vip_bonus || 0,
    total_discount: order.total_discount || ((order.admin_discount || 0) + (order.vip_bonus || 0)),
    amount: order.amount || 0,
    earn: order.earn || order.profit || 0,
    status: order.status || "",
    created_at: order.created_at,
    image: (() => {
      const images = order.product?.images;
      if (Array.isArray(images) && images.length > 0) return images[0];
      if (typeof images === "string") {
        try {
          const arr = JSON.parse(images);
          if (Array.isArray(arr) && arr.length > 0) return arr[0];
          if (images.length > 0 && !images.startsWith("[")) return images;
        } catch {
          if (images.length > 0) return images;
        }
      }
      return null;
    })(),
  }));
  res.json({ orders: mappedOrders });
});

// -------- Approve Resale Order (ADMIN, AUTO CALC) -------- //
router.post('/admin/orders/resale-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, approve } = req.body;

  // 1. Fetch order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (fetchError || !order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // 2. Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('price')
    .eq('id', order.product_id)
    .single();

  if (productError || !product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // 3. Calculate resale_amount and profit using real data
  const resale_amount = parseFloat(product.price) * parseFloat(order.quantity);
  const profit = resale_amount - parseFloat(order.amount);

  // 4. Update order to sold
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'sold', earn: profit, resale_amount })
    .eq('id', order_id);

  if (updateError) {
    return res.status(400).json({ message: "Order update failed", error: updateError.message });
  }

  // 5. Update user's wallet: add resale_amount
  // Fetch wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', order.user_id)
    .single();

  if (walletError || !wallet) {
    return res.status(400).json({ message: "Wallet not found" });
  }

  // Add resale_amount to wallet
  const { error: walletUpdateError } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance + resale_amount })
    .eq('id', wallet.id);

  if (walletUpdateError) {
    return res.status(400).json({ message: "Wallet update failed", error: walletUpdateError.message });
  }

  return res.json({ message: "Order marked as sold. Profit added.", profit, resale_amount });
});

module.exports = router;
