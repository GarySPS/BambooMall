const express = require('express');
const router = express.Router();

// 1. Admin: Approve/Reject deposit or withdraw
router.post('/tx-approve', async (req, res) => {
  const supabase = req.supabase;
  const { tx_id, approve } = req.body; // tx_id = wallet_transactions.id

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
  const { kyc_id, approve } = req.body;

  const { data: kyc, error: kycError } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('id', kyc_id)
    .single();

  if (kycError || !kyc) return res.status(404).json({ error: 'KYC doc not found' });
  if (kyc.status !== 'pending') return res.status(400).json({ error: 'Already handled' });

  let status = approve ? 'approved' : 'rejected';

  // Update kyc_documents
  await supabase.from('kyc_documents').update({ status }).eq('id', kyc_id);

  // Update users table if approved/rejected
  await supabase.from('users').update({ kyc_status: status }).eq('short_id', kyc.short_id);

  res.json({ message: `KYC ${status}` });
});

// 3. Admin: Approve/Reject order refund
router.post('/orders/refund-approve', async (req, res) => {
  const supabase = req.supabase;
  const { order_id, approve } = req.body;

  // Get order
  const { data: order, error: getError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (getError || !order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'refund_pending')
    return res.status(400).json({ error: 'Order is not pending refund' });

  if (!approve) {
    // Deny refund
    await supabase.from('orders').update({ status: 'selling' }).eq('id', order_id);
    return res.json({ message: 'Refund denied' });
  }

  // Refund fee is 1% of order amount
  const refund_fee = Math.round(order.amount * 0.01 * 100) / 100;
  const refund_amount = order.amount - refund_fee;

  // 1. Read current balance
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', order.user_id)
    .single();

  if (walletError || !wallet) return res.status(404).json({ error: 'Wallet not found' });

  // 2. Update with new balance
  const newBalance = Number(wallet.balance || 0) + Number(refund_amount);
  await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', order.user_id);

  // Update order status
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
  const { order_id, approve } = req.body;

  // 1. Get order
  const { data: order, error: getError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single();

  if (getError || !order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'selling' && order.status !== 'pending')
    return res.status(400).json({ error: 'Order is not pending resale' });

  if (!approve) {
    await supabase.from('orders').update({ status: 'selling' }).eq('id', order_id);
    return res.json({ message: 'Mark as selling (denied)' });
  }

  // Always re-fetch real product price for resale calculation
  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', order.product_id)
    .single();

  const resale_amount = product ? Number(product.price) * Number(order.quantity) : 0;
  const profit = resale_amount - Number(order.amount);

  // 4. Update order status and calculated profit/resale_amount (debug log included)
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status: 'sold', sold_at: new Date().toISOString(), earn: profit, resale_amount })
    .eq('id', order_id)
    .select()
    .single();

  console.log('UPDATE RESULT:', updated, updateError);

  // 5. Update user's wallet: add resale_amount
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
    .update({ balance: Number(wallet.balance) + Number(resale_amount) })
    .eq('id', wallet.id);

  if (walletUpdateError) {
    return res.status(400).json({ message: "Wallet update failed", error: walletUpdateError.message });
  }

  res.json({ message: 'Order marked as sold. Profit added.', profit, resale_amount });
});

// 4. Admin: List all users (with KYC, deposit, withdraw, orders)
router.get('/users', async (req, res) => {
  const supabase = req.supabase;
  const { data: users, error } = await supabase
    .from('users')
    .select(`id, short_id, username, created_at, kyc_status`);
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

  // Fetch all orders for all users
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

    // Withdraws: all for this user, most recent first
    const withdraws = (txs || []).filter(tx => tx.user_id === u.id && tx.type === "withdraw")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Orders: all for this user, most recent first
    const orders = (allOrders || []).filter(o => o.user_id === u.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      id: u.id,
      short_id: u.short_id,
      username: u.username,
      createdAt: u.created_at,
      kycStatus: u.kyc_status,
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
            address: w.address
          }))
        : [],
      orders: orders.map(o => ({
        id: o.id,
        product_title: o.product_title || "",
        quantity: o.quantity || 0,
        total: o.amount || 0,  
        resale_status: o.status === "sold" ? "sold" : "pending",
        refund_status: o.status === "refunded"
          ? "refunded"
          : (o.status === "refund_pending" ? "pending" : "")
      })),
    };
  });
  res.json(mapped);
});

// DELETE user and related data (NO DUPLICATE)
router.delete('/users/:id', async (req, res) => {
  const supabase = req.supabase;
  const id = req.params.id; // uuid

  // Fetch short_id first
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
