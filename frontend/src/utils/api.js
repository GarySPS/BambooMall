// src/utils/api.js

//Import from the config file we created earlier so the port is always the same
import { API_BASE_URL } from "../config"; 

// --- HELPER: Generic Fetch Wrapper ---
async function fetchJson(endpoint, options = {}) {
  // Ensure we don't double-slash (e.g., base/ + /endpoint)
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

// 1. Get Balance (Banker Illusion)
export async function fetchWalletBalance(userId) {
  try {
    const data = await fetchJson(`/wallet/${userId}`);
    const realWallet = data.wallet || { balance: 0 };

    return {
      ...realWallet,
      credit_limit: 50000.00, // The fake $50k credit line
      tier: "Wholesale (Level 2)",
    };
  } catch (err) {
    console.error("Wallet Fetch Error", err);
    return { balance: 0, credit_limit: 0 };
  }
}

// 2. Transaction History
export async function fetchWalletHistory(userId) {
  const data = await fetchJson(`/wallet/history/${userId}`);
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