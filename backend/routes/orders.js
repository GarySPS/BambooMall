// routes/orders.js

const express = require('express');
const router = express.Router();

// ==========================================
// 0. HELPER FUNCTIONS
// ==========================================

// Calculate VIP Bonus based on wallet balance
function getVipBonus(balance) {
  if (balance >= 40000) return 10;
  if (balance >= 20000) return 8;
  if (balance >= 15000) return 6;
  if (balance >= 10000) return 5;
  if (balance >= 5000) return 4;
  return 0;
}

// Helper to parse JSON safely (Handles Database Text or JSON types)
function parseJson(data) {
  if (!data) return []; // Handle null/undefined
  if (typeof data === 'object') return data; // Already JSON
  try { return JSON.parse(data); } catch { return []; }
}

// Robust Product Fetcher
async function getProductData(supabase, product_id) {
  // console.log(`🔍 [DB] Fetching product: ${product_id}`); // Optional debug
  
  const { data, error } = await supabase
    .from('products')
    .select('id, price, discount, stock, title, price_tiers') 
    .eq('id', product_id)
    .single();

  if (error) {
    console.error("❌ [DB] Error fetching product:", error.message);
    return null;
  }
  return data;
}

// ==========================================
// 1. SPECIFIC GET ROUTES (MUST BE FIRST)
// ==========================================

// GET History (Sold/Refunded items)
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
    .in('status', ['sold', 'refunded', 'refund_pending']) 
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
    // Image Logic
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

// GET Active Orders for User (Selling/Pending)
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
    .in('status', ['selling', '_pending', 'refund_pending', 'sold']) 
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
    // Image Logic
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

// ==========================================
// 2. ADMIN ACTIONS
// ==========================================

// Approve Resale Order
router.post('/admin/orders/resale-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, sell_quantity, approve } = req.body;

  console.log("🔹 Admin Resale Request:", { order_id, sell_quantity, approve });

  // 1. If Admin DENIES the sale
  if (approve === false) {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'selling' }) 
      .eq('id', order_id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "Resale denied.", order });
  }

  // 2. Fetch order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (fetchError || !order) return res.status(404).json({ message: "Order not found" });

  // 3. Validation
  const currentQty = parseInt(order.quantity, 10);
  const inputQty = parseInt(sell_quantity, 10);
  const qtyToSell = (!isNaN(inputQty) && inputQty > 0) ? inputQty : currentQty;

  if (qtyToSell > currentQty) {
    return res.status(400).json({ message: `Cannot sell ${qtyToSell}. Only ${currentQty} available.` });
  }

  // 4. Fetch product price (Current Market Value)
  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', order.product_id)
    .single();

  if (!product) return res.status(404).json({ message: "Product not found" });

  // 5. Calculate Financials
  // Logic: We calculate profit based on the ORIGINAL cost vs NEW market price.
  const originalCostTotal = parseFloat(order.amount);
  const marketPrice = parseFloat(product.price);

  // Cost of the items being sold (Pro-rated)
  let soldCost = (originalCostTotal / currentQty) * qtyToSell;
  soldCost = Math.round(soldCost * 100) / 100; 

  // Revenue (Market Price * Qty)
  let resaleRevenue = marketPrice * qtyToSell;
  resaleRevenue = Math.round(resaleRevenue * 100) / 100; 

  // Profit
  let profit = resaleRevenue - soldCost;
  profit = Math.round(profit * 100) / 100; 

  console.log(`💰 Financials: Cost: ${soldCost}, Rev: ${resaleRevenue}, Profit: ${profit}`);

  // 6. Execute Split or Full Sell
  if (qtyToSell === currentQty) {
    // --- SCENARIO A: FULL SELL ---
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'sold', 
        earn: profit, 
        resale_amount: resaleRevenue, 
        sold_at: new Date().toISOString()
      })
      .eq('id', order_id);

    if (updateError) return res.status(400).json({ message: "Update failed", error: updateError.message });

  } else {
    // --- SCENARIO B: PARTIAL SELL (SPLIT) ---
    const remainingQty = currentQty - qtyToSell;
    let remainingCost = originalCostTotal - soldCost;
    remainingCost = Math.round(remainingCost * 100) / 100; 

    // Insert New "Sold" Record
    const { error: insertNewError } = await supabase
      .from('orders')
      .insert([{
        user_id: order.user_id,
        product_id: order.product_id,
        quantity: qtyToSell,
        amount: soldCost,
        status: 'sold',
        type: order.type,
        admin_discount: order.admin_discount,
        vip_bonus: order.vip_bonus,
        total_discount: order.total_discount,
        earn: profit,
        resale_amount: resaleRevenue,
        sold_at: new Date().toISOString()
      }]);

    if (insertNewError) return res.status(400).json({ message: "Failed to create sold record.", error: insertNewError.message });

    // Update Original Order (Remaining)
    const { error: updateOldError } = await supabase
      .from('orders')
      .update({ 
        quantity: remainingQty, 
        amount: remainingCost,
        status: 'selling' 
      })
      .eq('id', order_id);

    if (updateOldError) return res.status(400).json({ message: "Failed to update remaining stock", error: updateOldError.message });
  }

  // 7. Update User Wallet (Credit the Resale Revenue)
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', order.user_id).single();
  if (wallet) {
    const newBalance = parseFloat(wallet.balance || 0) + resaleRevenue;
    await supabase
      .from('wallets')
      .update({ balance: newBalance }) 
      .eq('id', wallet.id);
  }

  return res.json({ message: "Success", profit, resale_amount: resaleRevenue });
});

// Approve Refund (With 1% Cancellation Fee)
router.post('/admin/orders/refund-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, approve } = req.body;

  // 1. Fetch the Order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (fetchError || !order) return res.status(404).json({ error: "Order not found" });

  // 2. If Admin REJECTS refund
  if (approve === false) {
    await supabase.from('orders').update({ status: 'selling' }).eq('id', order_id);
    return res.json({ message: "Refund rejected. Order returned to selling status." });
  }

  // 3. Calculate Refund Amount
  const cost = parseFloat(order.amount);
  const penaltyRate = 0.01; // 1% Fee
  const fee = cost * penaltyRate;
  const refundAmount = cost - fee; 

  // 4. Update User Wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', order.user_id)
    .single();

  if (wallet) {
    const newBalance = (parseFloat(wallet.balance) + refundAmount);
    await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
  }

  // 5. Update Order Status
  await supabase
    .from('orders')
    .update({ 
        status: 'refunded', 
        resale_amount: 0, 
        earn: -fee 
    })
    .eq('id', order_id);

  return res.json({ 
      message: "Refund processed", 
      refunded: refundAmount.toFixed(2), 
      fee: fee.toFixed(2) 
  });
});

// ==========================================
// 3. USER ACTIONS (POST) - FIXED PROFIT LOGIC
// ==========================================

// Order Preview (Calculations only)
router.post('/preview', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, product_id, quantity } = req.body;
  
  const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user_id).single();
  const product = await getProductData(supabase, product_id);
  
  if (!product) return res.status(404).json({ error: "Product not found" });

  // A. Determine Base Price (Check Tiers)
  const tiers = parseJson(product.price_tiers);
  const activeTier = Array.isArray(tiers) 
    ? tiers.sort((a,b) => b.min - a.min).find(t => quantity >= t.min) 
    : null;
    
  // This is the user's special buy price
  const unitPrice = activeTier ? Number(activeTier.price) : Number(product.price);
  
  // This is the market value (What they will sell it for later)
  // FIXED: Always use original price for resale value calculation
  const marketPrice = Number(product.price); 

  // B. Discounts
  const vipBonus = getVipBonus(wallet?.balance || 0);
  const adminDiscount = Number(product.discount || 0);
  const totalDiscount = adminDiscount + vipBonus;

  // C. Totals
  const fullPrice = unitPrice * quantity; // Base cost before discount
  const payAmount = Math.round(fullPrice * (1 - totalDiscount / 100) * 100) / 100;
  
  // D. Profit Logic
  const resalePrice = marketPrice * quantity; // Real market value
  const profit = resalePrice - payAmount;
  
  res.json({
    product_id, quantity,
    unit_price: unitPrice,
    market_price: marketPrice,
    full_price: fullPrice,
    admin_discount: adminDiscount,
    vip_bonus: vipBonus,
    total_discount: totalDiscount,
    pay_amount: payAmount,
    resale_price: resalePrice, // Return the fixed market value
    profit: profit
  });
});

// Place Order (CREATE)
router.post('/', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, product_id, quantity, type } = req.body;

  // 1. Fetch Product
  const product = await getProductData(supabase, product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  // 2. Stock Check
  const currentStock = parseInt(product.stock || 0);
  if (currentStock < quantity) {
     return res.status(400).json({ error: `Insufficient stock. Only ${currentStock} available.` });
  }

  // 3. Wallet Check
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user_id).single();
  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  // ============================================================
  // MATH ENGINE FIX (Bulk Profit)
  // ============================================================
  const tiers = parseJson(product.price_tiers);
  const activeTier = Array.isArray(tiers) 
    ? tiers.sort((a,b) => b.min - a.min).find(t => quantity >= t.min) 
    : null;

  // A. Your Buy Price (Lower if bulk)
  const unit_price = activeTier ? Number(activeTier.price) : Number(product.price);

  // B. Market Resale Price (ALWAYS the original price)
  const market_unit_price = Number(product.price); 

  // C. Discounts
  const admin_discount = Number(product.discount || 0);
  const vip_bonus = getVipBonus(wallet.balance || 0);
  const total_discount = admin_discount + vip_bonus;

  // D. Totals
  const full_price = unit_price * quantity;
  const pay_amount = Math.round(full_price * (1 - total_discount / 100) * 100) / 100;
  
  // E. Profit Calculation
  // Profit = (Market Price * Qty) - What You Paid
  const resale_price = market_unit_price * quantity; 
  const profit = resale_price - pay_amount;

  console.log(`💰 [FINANCE] Buy Rate: $${unit_price} | Market Rate: $${market_unit_price}`);
  console.log(`   Pay: $${pay_amount} | Resale: $${resale_price} | Profit: $${profit}`);

  if (wallet.balance < pay_amount) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  // ============================================================
  // EXECUTION
  // ============================================================

  // A. Deduct Money
  const { error: walletError } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance - pay_amount })
    .eq('id', wallet.id);

  if (walletError) {
      console.error("❌ [WALLET] Update failed:", walletError);
      return res.status(500).json({ error: "Wallet update failed" });
  }

  // B. Log Transaction
  await supabase
    .from('wallet_transactions')
    .insert([{
       user_id,
       type: 'purchase',
       amount: -pay_amount, 
       status: 'completed',
       note: `Acquisition: ${product.title} (Qty: ${quantity})`
    }]);

  // C. Create Order
  // IMPORTANT: We store 'resale_amount' here so we know how much to pay back later!
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
      resale_amount: resale_price // <--- This fixes the resale logic later
    }])
    .select()
    .single();

  if (error) {
      console.error("❌ [ORDER] Creation failed:", error);
      return res.status(400).json({ error: error.message });
  }

  // D. Deduct Stock
  const newStock = currentStock - quantity;
  await supabase.from('products').update({ stock: newStock }).eq('id', product_id);

  console.log("✅ [ORDER] Success:", order.id);
  res.json({ message: "Order placed", order, pay_amount, unit_price, profit });
});

// ==========================================
// 4. USER REFUND REQUEST (Insert Here!)
// ==========================================
router.post('/refund', async (req, res) => {
  const supabase = req.supabase;
  const { order_id } = req.body;

  console.log("🔹 Refund Request for Order:", order_id);

  if (!order_id) return res.status(400).json({ error: "Missing Order ID" });

  // 1. Verify Order Exists & Belongs to User
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (fetchError || !order) return res.status(404).json({ error: "Order not found" });

  // 2. Update Status to 'refund_pending'
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'refund_pending' })
    .eq('id', order_id)
    .select()
    .single();

  if (error) {
    console.error("Refund Update Error:", error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Refund requested successfully', order: data });
});

// ==========================================
// 5. GENERIC/WILDCARD ROUTES (Keep Last)
// ==========================================

// Get a single order by ID
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

module.exports = router;