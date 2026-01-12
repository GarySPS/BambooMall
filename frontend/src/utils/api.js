//src>utils>api.js

import { API_BASE_URL } from "../config";

// Fetch user profile by userId
export async function fetchUser(userId) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!res.ok) {
    // Optional: log error or response
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

// Fetch products (all or by userId)
export async function fetchProducts(userId) {
  let url = `${API_BASE_URL}/products`;
  if (userId) url += `?user=${userId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}
export async function fetchCartOrders(userId) {
  const res = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch cart orders");

  // Helper to parse first image from images array/string
  function getFirstProductImage(product) {
    let arr = [];
    if (product?.images) {
      if (Array.isArray(product.images)) arr = product.images;
      else if (typeof product.images === "string") {
        try { arr = JSON.parse(product.images); } catch { arr = []; }
      }
    }
    return arr && arr.length > 0 ? arr[0] : "/upload/A.png";
  }

  // Map order fields for CartPage
  return (data.orders || []).map(o => ({
    id: o.id,
    product: o.product, // Pass through the product for getProductImage
    image: getFirstProductImage(o.product),
    title: o.title || o.product?.title || "Product",
    
    // --- FIX IS HERE: Change key from 'qty' to 'quantity' ---
    quantity: o.qty !== undefined ? o.qty : o.quantity, 
    // --------------------------------------------------------

    unit_price: o.unit_price !== undefined ? o.unit_price : (o.product?.price || 0),
    admin_discount: o.admin_discount || 0,
    vip_bonus: o.vip_bonus || 0,
    total_discount: o.total_discount || ((o.admin_discount || 0) + (o.vip_bonus || 0)),
    amount: o.amount,
    earn: o.earn || 0,
    status: o.status,
    created_at: o.created_at,
  }));
}

export async function fetchWalletBalance(userId) {
  const res = await fetch(`${API_BASE_URL}/wallet/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch wallet");
  return res.json();
}

export async function fetchResaleHistory(userId) {
  const res = await fetch(`${API_BASE_URL}/orders/history/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return await res.json();
}


export async function topUpWallet(userId, amount, method) {
  const res = await fetch(`${API_BASE_URL}/wallet/topup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, amount, method })
  });
  if (!res.ok) throw new Error("Top up failed");
  return (await res.json()).balance;
}

export async function withdrawWallet(userId, amount) {
  const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, amount })
  });
  if (!res.ok) throw new Error("Withdraw failed");
  return (await res.json()).balance;
}

export async function requestRefund(orderId) {
  const res = await fetch(`/api/orders/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Refund request failed");
  return data;
}

export async function createOrder(order) {
  const res = await fetch(`${API_BASE_URL}/orders`, {  // FIXED
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create order");
  return data;
}
