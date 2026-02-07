// src/utils/api.js

import { API_BASE_URL } from "../config"; 

// --- HELPER: Generic Fetch Wrapper ---
async function fetchJson(endpoint, options = {}) {
  // 1. SECURITY: Get the token (Ensure your Login saves it as "token")
  const token = localStorage.getItem("token");

  // Ensure we don't double-slash (e.g., base/ + /endpoint)
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // 2. SECURITY: Attach the token to every request
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API Error");
  return data;
}

export function createProduct(productData) {
  return fetchJson("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

// --- PRODUCTS ---
export function fetchProducts() {
  return fetchJson("/products");
}

export function fetchProductById(id) {
  return fetchJson(`/products/${id}`);
}

// --- ORDERS & CART (Active Allocations) ---
export async function fetchCartOrders(userId) {
  const data = await fetchJson(`/orders/user/${userId}`);
  return data.orders || [];
}

// --- HISTORY (Sold/Liquidated) ---
export async function fetchResaleHistory(userId) {
  const data = await fetchJson(`/orders/history/${userId}`);
  return data.orders || [];
}

export function createOrder(orderData) {
  return fetchJson("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

// --- WALLET & TREASURY ---

// 1. Get Balance & Financial Position
export async function fetchWalletBalance(userId) {
  try {
    // FIX: Send 'me' instead of the potentially broken userId
    const data = await fetchJson(`/wallet/me`);
    const realWallet = data.wallet || {};

    // Ensure numeric safety for the UI calculations
    const balance = Number(realWallet.balance || 0);
    const stock_value = Number(realWallet.stock_value || 0);
    
    // Net Worth = Liquid Cash + Inventory Value
    const net_worth = realWallet.net_worth 
      ? Number(realWallet.net_worth) 
      : (balance + stock_value);

    return {
      ...realWallet,
      balance,
      stock_value,
      net_worth,
      // SECURITY: Removed hardcoded credit_limit. 
      // It must come from the database (realWallet.credit_limit).
    };
  } catch (err) {
    console.error("Wallet Fetch Error", err);
    // Return safe defaults so the UI doesn't crash
    return { 
      balance: 0, 
      stock_value: 0, 
      net_worth: 0, 
      credit_limit: 0 
    };
  }
}

// 2. Transaction History
export async function fetchWalletHistory(userId) {
  // FIX: Send 'me' instead of the potentially broken userId
  const data = await fetchJson(`/wallet/history/me`);
  return data.transactions || [];
}

// 3. Deposit
export function submitDeposit(depositData) {
  return fetchJson("/wallet/deposit", {
    method: "POST",
    body: JSON.stringify(depositData),
  });
}

// 4. Withdraw
export function submitWithdraw(withdrawData) {
  return fetchJson("/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify(withdrawData),
  });
}

// --- AUTH ---
export function loginUser(email, password) {
  return fetchJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}