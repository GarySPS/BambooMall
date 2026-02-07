// src/routes/admin.js

const express = require('express');
const router = express.Router();

// --- SECURITY GUARDS ---
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// APPLY GUARDS: All routes below this line require (Token + Admin Status)
router.use(authMiddleware, adminMiddleware); 
// -----------------------

// 1. Admin: Approve/Reject deposit or withdraw
router.post('/tx-approve', async (req, res) => {
  const supabase = req.supabase;
  const { tx_id, approve } = req.body; 

  // 1. Fetch the transaction
  const { data: tx, error: txError } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('id', tx_id)
    .single();

  if (txError || !tx) return res.status(404).json({ error: 'Transaction not found' });
  if (tx.status !== 'pending') return res.status(400).json({ error: 'Already handled' });

  // 2. Determine New Status
  let status = approve ? 'completed' : 'rejected';
  if (tx.type === 'deposit' && approve) status = 'approved'; 

  // 3. Update Transaction Status First
  const { error: updateError } = await supabase
    .from('wallet_transactions')
    .update({ status })
    .eq('id', tx_id);

  if (updateError) return res.status(400).json({ error: updateError.message });

  // 4. HANDLE BALANCE UPDATES
  let { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', tx.user_id)
    .single();

  // If wallet doesn't exist yet, create it immediately
  if (!wallet) {
    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert([{ user_id: tx.user_id, balance: 0 }])
      .select()
      .single();
    
    if (!createError) {
       wallet = newWallet;
    } else {
       console.error("Critical: Failed to create wallet during approval", createError);
       return res.status(500).json({ error: "System failed to initialize user wallet." });
    }
  }

  // Now we are guaranteed to have a wallet
  const currentBalance = Number(wallet.balance) || 0;
  const txAmount = Math.abs(Number(tx.amount)); 
  let newBalance = currentBalance;
  let balanceChanged = false;

  // --- LOGIC MATRIX ---
  if (tx.type === 'deposit' && approve) {
      newBalance = currentBalance + txAmount;
      balanceChanged = true;
  } 
  else if (tx.type === 'withdraw' && !approve) {
      // REJECTING A WITHDRAWAL: Refund the locked funds
      newBalance = currentBalance + txAmount;
      balanceChanged = true;
  }

  // 5. Apply Balance Update
  if (balanceChanged) {
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', tx.user_id);

    if (balanceError) {
       console.error("Balance Update Failed:", balanceError);
       return res.status(500).json({ error: "Transaction approved but balance update failed." });
    }
  }

  res.json({ message: `Transaction ${status}, Balance updated.` });
});

// 2. Admin: Approve/Reject KYC
router.post('/kyc-approve', async (req, res) => {
  const supabase = req.supabase;
  const { user_id, approve } = req.body; 

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
      await supabase.from('users').update({ kyc_status: status }).eq('id', targetUserId);

      const { data: user } = await supabase.from('users').select('short_id').eq('id', targetUserId).single();
      
      if (user?.short_id) {
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

// 3b. Admin: Approve/Reject order resale
router.post('/orders/resale-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, approve, sell_quantity } = req.body;

  if (approve === false) {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'selling' }) 
      .eq('id', order_id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "Mark as selling (denied)", order });
  }

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (fetchError || !order) return res.status(404).json({ message: "Order not found" });
  
  if (order.status !== 'selling' && order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending resale' });
  }

  const currentQty = parseInt(order.quantity, 10);
  const inputQty = parseInt(sell_quantity, 10);
  const qtyToSell = (!isNaN(inputQty) && inputQty > 0) ? inputQty : currentQty;

  if (qtyToSell > currentQty) {
    return res.status(400).json({ message: "Cannot sell more than you have!" });
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('price')
    .eq('id', order.product_id)
    .single();

  if (productError || !product) return res.status(404).json({ message: "Product not found" });

  const originalCost = parseFloat(order.amount);
  const marketPrice = parseFloat(product.price);

  let soldCost = (originalCost / currentQty) * qtyToSell;
  soldCost = Math.round(soldCost * 100) / 100; 

  let resaleRevenue = marketPrice * qtyToSell;
  resaleRevenue = Math.round(resaleRevenue * 100) / 100; 

  let profit = resaleRevenue - soldCost;
  profit = Math.round(profit * 100) / 100; 

  if (qtyToSell === currentQty) {
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
    const remainingQty = currentQty - qtyToSell;
    let remainingCost = originalCost - soldCost;
    remainingCost = Math.round(remainingCost * 100) / 100; 

    const { error: updateOldError } = await supabase
      .from('orders')
      .update({ 
        quantity: remainingQty, 
        amount: remainingCost,
        status: 'selling' 
      })
      .eq('id', order_id);

    if (updateOldError) return res.status(400).json({ message: "Failed to update remaining stock", error: updateOldError.message });

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

    if (insertNewError) return res.status(400).json({ message: "Failed to create sold order record", error: insertNewError.message });
  }

  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', order.user_id).single();
  if (wallet) {
    const currentBalance = parseFloat(wallet.balance || 0);
    const newBalance = Math.round((currentBalance + resaleRevenue) * 100) / 100;
    
    await supabase
      .from('wallets')
      .update({ balance: newBalance }) 
      .eq('id', wallet.id);
  }

  return res.json({ message: "Success", profit, resale_amount: resaleRevenue, qty_sold: qtyToSell });
});

// 4. Admin: List all users
router.get('/users', async (req, res) => {
  const supabase = req.supabase;
  
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id, short_id, username, created_at, kyc_status, email,
      full_name, phone, id_number, address
    `);

  if (error) return res.status(400).json({ error: error.message });

  const userIds = users.map(u => u.id);
  const userShortIds = users.map(u => u.short_id);

  const { data: wallets } = await supabase.from('wallets').select('user_id, balance').in('user_id', userIds);
  const { data: kycAll } = await supabase.from('kyc_documents').select('*').in('short_id', userShortIds);
  const { data: txs } = await supabase.from('wallet_transactions').select('*').in('user_id', userIds).order('created_at', { ascending: false });
  const { data: allOrders } = await supabase.from('orders').select('*').in('user_id', userIds);

  const mapped = users.map(u => {
    const kycDocs = (kycAll || []).filter(k => k.short_id === u.short_id);
    const userWallet = (wallets || []).find(w => w.user_id === u.id);
    const userTxs = (txs || []).filter(tx => tx.user_id === u.id);
    const deposits = userTxs.filter(tx => tx.type === "deposit");
    const latestDeposit = deposits.length ? deposits[0] : null;
    const withdraws = userTxs.filter(tx => tx.type === "withdraw");
    const orders = (allOrders || []).filter(o => o.user_id === u.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      id: u.id,
      short_id: u.short_id,
      username: u.username,
      email: u.email,
      created_at: u.created_at,
      kyc_status: u.kyc_status,
      full_name: u.full_name,
      phone: u.phone,
      id_number: u.id_number,
      address: u.address,
      balance: userWallet ? userWallet.balance : 0,
      kycDocs: Array.isArray(kycDocs) ? kycDocs : [],
      wallet_transactions: userTxs.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        address: tx.address,
        method: tx.note || tx.address, 
        screenshot_url: tx.tx_hash,
        note: tx.note
      })),
      deposit: latestDeposit ? {
           tx_id: latestDeposit.id,
           amount: latestDeposit.amount,
           status: latestDeposit.status,
           method: latestDeposit.note,
           screenshot_url: latestDeposit.tx_hash,
           updated_at: latestDeposit.updated_at
         } : { status: "none" },
      withdraws: withdraws.map(w => ({
          tx_id: w.id,
          amount: w.amount,
          status: w.status,
          address: w.address,
          note: w.note,
          updated_at: w.updated_at
      })),
      orders: orders.map(o => {
        let resale_status = "";
        let refund_status = "";
        if (o.status === "sold") resale_status = "sold";
        else if (o.status === "selling" || o.status === "pending") resale_status = "pending";
        if (o.status === "refunded") refund_status = "refunded";
        else if (o.status === "refund_pending") refund_status = "pending";
        return {
          id: o.id,
          product_title: o.product_title || "",
          quantity: o.quantity || 0,
          total: o.amount || 0,
          status: o.status,
          resale_status,
          refund_status,
        };
      }),
    };
  });
  res.json(mapped);
});

// DELETE
router.delete('/users/:id', async (req, res) => {
  const supabase = req.supabase;
  const id = req.params.id; 
  const { data: user } = await supabase.from('users').select('short_id').eq('id', id).single();
  if (!user) return res.status(404).json({ error: 'User not found' });
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