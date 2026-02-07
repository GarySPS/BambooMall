const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // <--- 1. Import Guard

// ==========================================
// 0. HELPER FUNCTIONS
// ==========================================

function getVipBonus(totalValue) {
  if (totalValue >= 20000) return 10; 
  if (totalValue >= 13000) return 8;  
  if (totalValue >= 8000)  return 6;  
  if (totalValue >= 4000)  return 5;  
  if (totalValue >= 2000)  return 4;  
  return 0;
}

async function getNetWorth(supabase, user_id, liquidBalance) {
  const { data: stockData } = await supabase
    .from('orders')
    .select('amount')
    .eq('user_id', user_id)
    .eq('status', 'selling');

  let stockValue = 0;
  if (stockData && stockData.length > 0) {
    stockValue = stockData.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  }
  return Number(liquidBalance) + stockValue;
}

function parseJson(data) {
  if (!data) return []; 
  if (typeof data === 'object') return data; 
  try { return JSON.parse(data); } catch { return []; }
}

async function getProductData(supabase, product_id) {
  const { data, error } = await supabase
    .from('products')
    .select('id, price, discount, stock, title, price_tiers, min_order') 
    .eq('id', product_id)
    .single();

  if (error) {
    console.error("❌ [DB] Error fetching product:", error.message);
    return null;
  }
  return data;
}

// ==========================================
// 1. APPLY SECURITY GUARD (Lock the whole file)
// ==========================================
router.use(authMiddleware);

// ==========================================
// 2. USER ROUTES (SECURED)
// ==========================================

// GET History (Sold/Refunded items)
router.get('/history/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;

  // SECURITY CHECK: You can only see your own history
  if (user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: "Access Denied" });
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select(`*, product:products (title, images, gallery, price)`)
    .eq('user_id', user_id)
    .in('status', ['sold', 'refunded', 'refund_pending']) 
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  const mappedOrders = (data || []).map(order => mapOrderData(order));
  res.json({ orders: mappedOrders });
});

// GET Active Orders for User (Selling/Pending)
router.get('/user/:user_id', async (req, res) => {
  const supabase = req.supabase;
  const user_id = req.params.user_id;

  // SECURITY CHECK
  if (user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: "Access Denied" });
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`*, product:products (title, images, gallery, price)`)
    .eq('user_id', user_id)
    .in('status', ['selling', '_pending', 'refund_pending', 'sold']) 
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  const mappedOrders = (data || []).map(order => mapOrderData(order));
  res.json({ orders: mappedOrders });
});

// Helper for mapping order data
function mapOrderData(order) {
    return {
        id: order.id,
        product: order.product || {}, 
        title: order.product?.title || "Product",
        qty: order.quantity || 0,
        unit_price: order.product?.price || 0,
        admin_discount: order.admin_discount || 0,
        vip_bonus: order.vip_bonus || 0,
        total_discount: order.total_discount || 0,
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
                } catch { if (images.length > 0) return images; }
            }
            return null;
        })(),
    };
}

// Order Preview (Calculations only)
router.post('/preview', async (req, res) => {
  const supabase = req.supabase;
  // SECURITY: Ignore user_id from body, use token
  const user_id = req.user.id; 
  const { product_id, quantity } = req.body;
  
  const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user_id).single();
  const product = await getProductData(supabase, product_id);
  
  if (!product) return res.status(404).json({ error: "Product not found" });

  const minOrder = parseInt(product.min_order || 1);
  if (quantity < minOrder) {
      return res.status(400).json({ error: `Minimum order quantity is ${minOrder} units.` });
  }

  // Logic Matrix
  const tiers = parseJson(product.price_tiers);
  const activeTier = Array.isArray(tiers) ? tiers.sort((a,b) => b.min - a.min).find(t => quantity >= t.min) : null;
  const unitPrice = activeTier ? Number(activeTier.price) : Number(product.price);
  const marketPrice = Number(product.price); 

  const liquidBalance = Number(wallet?.balance || 0);
  const netWorth = await getNetWorth(supabase, user_id, liquidBalance);
  const vipBonus = getVipBonus(netWorth);
  
  const adminDiscount = Number(product.discount || 0);
  const totalDiscount = adminDiscount + vipBonus;

  const fullPrice = unitPrice * quantity;
  const payAmount = Math.round(fullPrice * (1 - totalDiscount / 100) * 100) / 100;
  const resalePrice = marketPrice * quantity; 
  const profit = resalePrice - payAmount;
  
  res.json({
    product_id, quantity, unit_price: unitPrice, market_price: marketPrice,
    full_price: fullPrice, admin_discount: adminDiscount, vip_bonus: vipBonus,
    total_discount: totalDiscount, pay_amount: payAmount, resale_price: resalePrice, profit: profit
  });
});

// Place Order (CREATE)
router.post('/', async (req, res) => {
  const supabase = req.supabase;
  // SECURITY: Use token ID
  const user_id = req.user.id;
  const { product_id, quantity, type, details } = req.body;

  const product = await getProductData(supabase, product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const minOrder = parseInt(product.min_order || 1);
  if (quantity < minOrder) return res.status(400).json({ error: `Order Rejected: Minimum quantity is ${minOrder} units.` });

  const currentStock = parseInt(product.stock || 0);
  if (currentStock < quantity) return res.status(400).json({ error: `Insufficient stock. Only ${currentStock} available.` });

  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user_id).single();
  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  // Calculation (Must match preview)
  const tiers = parseJson(product.price_tiers);
  const activeTier = Array.isArray(tiers) ? tiers.sort((a,b) => b.min - a.min).find(t => quantity >= t.min) : null;
  const unit_price = activeTier ? Number(activeTier.price) : Number(product.price);
  const market_unit_price = Number(product.price); 

  const admin_discount = Number(product.discount || 0);
  const liquidBalance = Number(wallet.balance || 0);
  const netWorth = await getNetWorth(supabase, user_id, liquidBalance);
  const vip_bonus = getVipBonus(netWorth);
  
  const total_discount = admin_discount + vip_bonus;
  const full_price = unit_price * quantity;
  const pay_amount = Math.round(full_price * (1 - total_discount / 100) * 100) / 100;
  const resale_price = market_unit_price * quantity; 
  const profit = resale_price - pay_amount;

  if (liquidBalance < pay_amount) return res.status(400).json({ error: "Insufficient wallet balance" });

  // EXECUTION
  const { error: walletError } = await supabase
    .from('wallets')
    .update({ balance: liquidBalance - pay_amount })
    .eq('id', wallet.id);

  if (walletError) return res.status(500).json({ error: "Wallet update failed" });

  await supabase.from('wallet_transactions').insert([{
       user_id,
       type: 'purchase',
       amount: -pay_amount, 
       status: 'completed',
       note: `Acquisition: ${product.title} (Qty: ${quantity})`
  }]);

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
      earn: profit, 
      resale_amount: resale_price,
      details: details || {} 
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const newStock = currentStock - quantity;
  await supabase.from('products').update({ stock: newStock }).eq('id', product_id);

  res.json({ message: "Order placed", order, pay_amount, unit_price, profit });
});

// USER REFUND REQUEST (SECURED)
router.post('/refund', async (req, res) => {
  const supabase = req.supabase;
  const { order_id } = req.body;
  const user_id = req.user.id;

  if (!order_id) return res.status(400).json({ error: "Missing Order ID" });

  // 1. Verify Order Exists & Belongs to User
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .eq('user_id', user_id) // <--- CRITICAL SECURITY CHECK
    .single();

  if (fetchError || !order) return res.status(404).json({ error: "Order not found or access denied" });

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'refund_pending' })
    .eq('id', order_id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Refund requested successfully', order: data });
});

// Get a single order by ID (SECURED)
router.get('/:id', async (req, res) => {
  const supabase = req.supabase;
  const { id } = req.params;
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id) // <--- CRITICAL SECURITY CHECK
    .single();

  if (error || !data) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: data });
});

module.exports = router;