//src>pages>AdminOrdrPage.js

import React, { useEffect, useState, useCallback } from "react";
import { FaCheck, FaTimes, FaClipboardList } from "react-icons/fa";
import { API_BASE_URL } from "../config";
const API_URL = `${API_BASE_URL}/admin`;

export default function AdminOrderPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track input quantity for each order: { orderId: quantity }
  const [sellQuantities, setSellQuantities] = useState({});

  // Define fetchOrders as a reusable function
  const fetchOrders = useCallback(async () => {
    try {
      // Don't set loading to true here to avoid flickering on every update
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleQuantityChange = (orderId, val) => {
    setSellQuantities(prev => ({
      ...prev,
      [orderId]: val
    }));
  };

  const handleApproveResale = async (userId, orderId, approve, maxQty) => {
    // If we are DENYING, we don't care about quantity validation
    if (!approve) {
        // You can choose to skip validation here if you want
    }

    // Determine quantity to sell
    const qtyInput = sellQuantities[orderId];
    
    // If input is empty/undefined, default to maxQty (Full Sell).
    // If input has number, use that number.
    const qtyToSell = (qtyInput && qtyInput !== "") ? parseInt(qtyInput) : maxQty;

    // Safety check for APPROVAL
    if (approve && (isNaN(qtyToSell) || qtyToSell <= 0 || qtyToSell > maxQty)) {
      alert(`Invalid quantity. Please enter a number between 1 and ${maxQty}`);
      return;
    }

    try {
      await fetch(`${API_URL}/orders/resale-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: orderId, 
          approve, 
          sell_quantity: qtyToSell 
        }),
      });
      
      // Clear the input for this order
      setSellQuantities(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });

      // RE-FETCH DATA
      await fetchOrders();

    } catch (err) {
      console.error("Failed to approve resale:", err);
      alert("Action failed. Please check console.");
    }
  }; // <--- THIS WAS MISSING IN YOUR SNIPPET

  const handleApprove = async (userId, orderId, approve) => {
    try {
      await fetch(`${API_URL}/orders/-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, approve }),
      });
      // Simple status update can be done locally or via refetch. 
      // Refetch is consistent.
      await fetchOrders();
    } catch (err) {
      console.error("Failed to approve :", err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] min-h-screen font-inter">
      <div className="max-w-7xl mx-auto"> {/* Increased width slightly for extra inputs */}
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#ffd700]/20 p-2 shadow">
            <FaClipboardList className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            Order Management
          </h2>
        </div>

        {loading ? (
          <div className="w-full flex justify-center py-14">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-4 text-green-900 font-semibold tracking-wide">Loading orders…</span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/70 backdrop-blur rounded-2xl shadow-xl border border-white/60">
            <table className="min-w-full divide-y divide-[#e3e9ef] text-sm">
              <thead>
                <tr className="bg-[#17604e]/90 text-white">
                  <th className="py-3 px-3 text-left font-bold rounded-tl-2xl">User</th>
                  <th className="py-3 px-3 text-left font-bold">Product</th>
                  <th className="py-3 px-3 text-left font-bold">Qty</th>
                  <th className="py-3 px-3 text-left font-bold">Total</th>
                  <th className="py-3 px-3 text-left font-bold">Resale Status</th>
                  <th className="py-3 px-3 text-left font-bold"> Status</th>
                  <th className="py-3 px-3 text-left font-bold rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 || users.every(u => (u.orders || []).length === 0) ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-12 font-semibold">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  users.flatMap(u =>
                    (u.orders || []).map((o, i) => (
                      <tr key={o.id} className={`${i % 2 === 0 ? "bg-white/80" : "bg-[#f7f7f7]/80"} transition`}>
                        <td className="px-3 py-3">{u.username}</td>
                        <td className="px-3 py-3 max-w-[150px] truncate" title={o.product_title}>{o.product_title}</td>
                        <td className="px-3 py-3 font-semibold">{o.quantity}</td>
                        <td className="px-3 py-3 font-mono text-gray-600">${o.total}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-2xl text-xs font-bold shadow 
                            ${o.resale_status === "sold"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : o.resale_status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-gray-200 text-gray-700 border border-gray-300"}
                          `}>
                            {o.resale_status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-2xl text-xs font-bold shadow
                            ${o._status === "ed"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : o._status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-gray-200 text-gray-700 border border-gray-300"}
                          `}>
                            {o._status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {/* Only show resale actions if NO  in progress or completed */}
                          {o.resale_status === "pending" && o._status !== "pending" && o._status !== "ed" && (
                            <div className="flex items-center gap-2">
                              {/* Quantity Input for Partial Sell */}
                              <input 
                                type="number" 
                                min="1" 
                                max={o.quantity}
                                placeholder={o.quantity}
                                value={sellQuantities[o.id] || ""}
                                onChange={(e) => handleQuantityChange(o.id, e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-green-500"
                              />
                              
                              <button
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApproveResale(u.id, o.id, true, o.quantity)}
                                title="Approve Sold"
                              >
                                <FaCheck />
                              </button>
                              
                              <button
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApproveResale(u.id, o.id, false, o.quantity)}
                                title="Deny Resale"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}

                          {/* Only show  actions if NOT already sold */}
                          {o._status === "pending" && o.resale_status !== "sold" && (
                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApprove(u.id, o.id, true)}
                              >
                                <FaCheck /> Approve 
                              </button>
                              <button
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApprove(u.id, o.id, false)}
                              >
                                <FaTimes /> Deny
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}