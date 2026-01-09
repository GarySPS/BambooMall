//routes>admin.js

const express = require('express');
const router = express.Router();

// 1. Admin: Approve/Reject deposit or withdraw
router.post('/tx-approve', async (req, res) => {
  const supabase = req.supabase;
  const { tx_id, approve } = req.body; 

  const { data: tx, error: txError } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('id', tx_id)
    .single();

  if (txError || !tx) return res.status(404).json({ error: 'Transaction not found' });
  if (tx.status !== 'pending') return res.status(400).json({ error: 'Already handled' });

  let status = approve ? 'completed' : 'rejected';

  // 1. Update transaction status
  const { error: updateError } = await supabase
    .from('wallet_transactions')
    .update({ status })
    .eq('id', tx_id);

  if (updateError) return res.status(400).json({ error: updateError.message });

  // 2. If approved, update wallet balance
  if (approve && tx.type === 'deposit') {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', tx.user_id)
      .single();

    const current = wallet?.balance || 0;
    const updated = Number(current) + Number(tx.amount);

    await supabase
      .from('wallets')
      .update({ balance: updated })
      .eq('user_id', tx.user_id);
  }
  if (approve && tx.type === 'withdraw') {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', tx.user_id)
      .single();

    const current = wallet?.balance || 0;
    const updated = Number(current) - Number(tx.amount);

    await supabase
      .from('wallets')
      .update({ balance: updated })
      .eq('user_id', tx.user_id);
  }

  res.json({ message: `Transaction ${status}` });
});

// 2. Admin: Approve/Reject KYC
router.post('/kyc-approve', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, approve } = req.body; // Expecting user_id now for bulk update

  // If we receive a kyc_id instead (legacy support), fetch the user first
  let targetUserId = user_id;
  
  if (!targetUserId && req.body.kyc_id) {
      const { data: kyc } = await supabase.from('kyc_documents').select('short_id').eq('id', req.body.kyc_id).single();
      if(kyc) {
          const { data: u } = await supabase.from('users').select('id').eq('short_id', kyc.short_id).single();
          targetUserId = u?.id;
      }
  }

  if (!targetUserId) return res.status(400).json({ error: "User ID required" });

  let status = approve ? 'approved' : 'rejected';

  try {
      // 1. Update the User's main status
      await supabase.from('users').update({ kyc_status: status }).eq('id', targetUserId);

      // 2. Get the user's short_id to update docs
      const { data: user } = await supabase.from('users').select('short_id').eq('id', targetUserId).single();
      
      if (user?.short_id) {
          // 3. Update all pending docs for this user to match the decision
          await supabase
            .from('kyc_documents')
            .update({ status: status })
            .eq('short_id', user.short_id)
            .eq('status', 'pending');
      }

      res.json({ message: `KYC ${status}` });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// 3. Admin: Approve/Reject order refund
router.post('/orders/refund-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, approve } = req.body;

  const { data: order, error: getError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (getError || !order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'refund_pending')
    return res.status(400).json({ error: 'Order is not pending refund' });

  if (!approve) {
    await supabase.from('orders').update({ status: 'selling' }).eq('id', order_id);
    return res.json({ message: 'Refund denied' });
  }

  const refund_fee = Math.round(order.amount * 0.01 * 100) / 100;
  const refund_amount = order.amount - refund_fee;

  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', order.user_id)
    .single();

  if (walletError || !wallet) return res.status(404).json({ error: 'Wallet not found' });

  const newBalance = Number(wallet.balance || 0) + Number(refund_amount);
  await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', order.user_id);

  await supabase
    .from('orders')
    .update({
      status: 'refunded',
      refund_fee,
    })
    .eq('id', order_id);

  res.json({ message: 'Refund completed', refund_amount, refund_fee });
});

// 3b. Admin: Approve/Reject order resale ("Sold")
router.post('/orders/resale-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, approve, sell_quantity } = req.body; // <--- 1. Get sell_quantity

  // Get Order
  const { data: order, error: getError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (getError || !order) return res.status(404).json({ error: 'Order not found' });
  
  // Basic validation
  if (order.status !== 'selling' && order.status !== 'pending')
    return res.status(400).json({ error: 'Order is not pending resale' });

  // --- DENY LOGIC ---
  if (!approve) {
    await supabase.from('orders').update({ status: 'selling' }).eq('id', order_id);
    return res.json({ message: 'Mark as selling (denied)' });
  }

  // --- APPROVE LOGIC ---
  
  // 2. Determine exact quantity to sell
  // If sell_quantity is provided, use it. Otherwise use full order quantity.
  const qtyToSell = sell_quantity ? Number(sell_quantity) : Number(order.quantity);
  
  // 3. Get Product Price
  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', order.product_id)
    .single();

  // 4. Calculate Financials
  // Revenue = Market Price * Qty Sold
  const resale_amount = product ? Number(product.price) * qtyToSell : 0;
  
  // Cost Ratio (in case of partial sell, we only calculate cost for the sold part)
  const ratio = qtyToSell / Number(order.quantity);
  const costOfSoldItems = Number(order.amount) * ratio;

  // Profit = Revenue - Cost
  const profit = resale_amount - costOfSoldItems;

  // 5. Update Order
  // We mark it 'sold'. Note: If you sell partial (e.g. 5/10), this closes the order.
  // If you want to keep the remainder, you'd need logic to split the order, 
  // but for now we treat this action as "Closing the order with this quantity".
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ 
        status: 'sold', 
        resale_status: 'sold', // Ensure this matches your frontend check
        sold_at: new Date().toISOString(), 
        earn: profit, 
        resale_amount,
        // Optional: Update quantity to what was actually sold if different?
        // quantity: qtyToSell 
    })
    .eq('id', order_id)
    .select()
    .single();

  if (updateError) return res.status(400).json({ error: updateError.message });

  // 6. Update Wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', order.user_id)
    .single();

  if (walletError || !wallet) {
    return res.status(400).json({ message: "Wallet not found" });
  }

  // Add the Total Revenue (Principal + Profit) to wallet
  const { error: walletUpdateError } = await supabase
    .from('wallets')
    .update({ balance: Number(wallet.balance) + Number(resale_amount) })
    .eq('id', wallet.id);

  if (walletUpdateError) {
    return res.status(400).json({ message: "Wallet update failed", error: walletUpdateError.message });
  }

  res.json({ message: 'Order marked as sold. Profit added.', profit, resale_amount, qty_sold: qtyToSell });
});

// 4. Admin: List all users (UPDATED TO FETCH PROFILE DATA)
router.get('/users', async (req, res) => {
  const supabase = req.supabase;
  
  // --- FIX: Add the missing columns to this list ---
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id, 
      short_id, 
      username, 
      created_at, 
      kyc_status, 
      email,
      full_name, 
      phone, 
      id_number, 
      address
    `);

    // ================= DEBUG START =================
  if (users) {
    const targetUser = users.find(u => u.username === 'xiaozhe');
    console.log("------------------------------------------------");
    console.log("DEBUG: Checking user 'xiaozhe' data from Database:");
    if (targetUser) {
      console.log("Found User:", targetUser.username);
      console.log("Phone:", targetUser.phone);
      console.log("ID Number:", targetUser.id_number);
      console.log("Address:", targetUser.address);
      console.log("Full Name:", targetUser.full_name);
    } else {
      console.log("User 'xiaozhe' not found in the list.");
    }
    console.log("------------------------------------------------");
  }
  // ================= DEBUG END =================

  if (error) return res.status(400).json({ error: error.message });

  const userShortIds = users.map(u => u.short_id);
  const { data: kycAll } = await supabase
    .from('kyc_documents')
    .select('*')
    .in('short_id', userShortIds);

  const userIds = users.map(u => u.id);
  const { data: txs } = await supabase
    .from('wallet_transactions')
    .select('*')
    .in('user_id', userIds);

  const { data: allOrders } = await supabase
    .from('orders')
    .select('*')
    .in('user_id', userIds);

  const mapped = users.map(u => {
    const kycDocs = (kycAll || []).filter(k => k.short_id === u.short_id);

    const deposits = (txs || []).filter(tx => tx.user_id === u.id && tx.type === "deposit");
    const latestDeposit = deposits.length
      ? deposits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      : null;

    const withdraws = (txs || []).filter(tx => tx.user_id === u.id && tx.type === "withdraw")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const orders = (allOrders || []).filter(o => o.user_id === u.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      // Basic Info
      id: u.id,
      short_id: u.short_id,
      username: u.username,
      email: u.email,
      createdAt: u.created_at,
      kycStatus: u.kyc_status,
      
      // --- FIX: Pass the new data to the frontend ---
      full_name: u.full_name,
      phone: u.phone,
      id_number: u.id_number,
      address: u.address,

      kycDocs: Array.isArray(kycDocs) ? kycDocs : [],
      
      deposit: latestDeposit
        ? {
            tx_id: latestDeposit.id,
            amount: latestDeposit.amount,
            status: latestDeposit.status,
            method: latestDeposit.note,
            screenshot_url: latestDeposit.tx_hash
          }
        : { status: "none" },
      withdraws: withdraws.length
        ? withdraws.map(w => ({
            tx_id: w.id,
            amount: w.amount,
            status: w.status,
            address: w.address,
            note: w.note
          }))
        : [],
      orders: orders.map(o => {
        let resale_status = "";
        let refund_status = "";

        if (o.status === "sold") resale_status = "sold";
        else if (o.status === "selling" || o.status === "pending") resale_status = "pending";

        if (o.status === "refunded") refund_status = "refunded";
        else if (o.status === "refund_pending") refund_status = "pending";

        if (o.status === "refunded" || o.status === "refund_pending") resale_status = "";
        if (o.status === "sold") refund_status = "";

        return {
          id: o.id,
          product_title: o.product_title || "",
          quantity: o.quantity || 0,
          total: o.amount || 0,
          resale_status,
          refund_status,
        };
      }),
    };
  });
  res.json(mapped);
});

// DELETE user and related data
router.delete('/users/:id', async (req, res) => {
  const supabase = req.supabase;
  const id = req.params.id; 

  const { data: user, error: getUserError } = await supabase
    .from('users')
    .select('short_id')
    .eq('id', id)
    .single();

  if (getUserError || !user) return res.status(404).json({ error: 'User not found' });
  const short_id = user.short_id;

  await supabase.from('kyc_documents').delete().eq('short_id', short_id); 
  await supabase.from('wallet_transactions').delete().eq('user_id', id);
  await supabase.from('orders').delete().eq('user_id', id);
  await supabase.from('wallets').delete().eq('user_id', id);
  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "User and all related data deleted." });
});

module.exports = router;