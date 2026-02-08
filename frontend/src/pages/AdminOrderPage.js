//src>pages>AdminOrderPage.js

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaBoxOpen 
} from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminOrderPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending_resale, refund_req, sold
  
  // Track input quantity for each order: { orderId: quantity }
  const [sellQuantities, setSellQuantities] = useState({});

  // --- DATA FETCHING ---
  const fetchOrders = useCallback(async () => {
    try {
      // FIX: Get Token
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // FIX: Attach Token
      const res = await fetch(`${API_URL}/users`, {
          headers: { "Authorization": `Bearer ${token}` }
      });

      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- HANDLERS ---
  const handleQuantityChange = (orderId, val) => {
    setSellQuantities((prev) => ({
      ...prev,
      [orderId]: val,
    }));
  };

  const handleApproveResale = async (userId, orderId, approve, maxQty) => {
    const qtyInput = sellQuantities[orderId];
    // Default to maxQty if empty, otherwise use input
    const qtyToSell = qtyInput && qtyInput !== "" ? parseInt(qtyInput) : maxQty;

    // Validation only if approving
    if (approve && (isNaN(qtyToSell) || qtyToSell <= 0 || qtyToSell > maxQty)) {
      alert(`Invalid quantity. Please enter a number between 1 and ${maxQty}`);
      return;
    }

    try {
      const token = localStorage.getItem("token"); // FIX: Get Token

      await fetch(`${API_URL}/orders/resale-approve`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // FIX: Attach Header
        },
        body: JSON.stringify({
          order_id: orderId,
          approve,
          sell_quantity: qtyToSell,
        }),
      });

      // Clear input
      setSellQuantities((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });

      // Refresh data
      await fetchOrders();
    } catch (err) {
      console.error("Failed to approve resale:", err);
      alert("Action failed. Please check console.");
    }
  };

  const handleApproveRefund = async (userId, orderId, approve) => {
    try {
      const token = localStorage.getItem("token"); // FIX: Get Token

      await fetch(`${API_URL}/orders/refund-approve`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // FIX: Attach Header
        },
        body: JSON.stringify({ order_id: orderId, approve }),
      });
      await fetchOrders();
    } catch (err) {
      console.error("Failed to approve refund:", err);
    }
  };

  // --- FILTERING LOGIC ---
  // 1. Flatten the structure: Users -> Orders becomes just a list of Orders with user info attached
  const allOrders = useMemo(() => {
    return users.flatMap((user) =>
      (user.orders || []).map((order) => ({
        ...order,
        userId: user.id,
        username: user.username,
      }))
    );
  }, [users]);

  // 2. Apply filters
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Search Filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.username.toLowerCase().includes(searchLower) ||
        order.product_title.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower);

      if (!matchesSearch) return false;

      // Status Tab Filter
      if (statusFilter === "pending_resale") {
        return order.resale_status === "pending" && order.status !== "refund_pending";
      }
      if (statusFilter === "refund_req") {
        return order.status === "refund_pending";
      }
      if (statusFilter === "sold") {
        return order.resale_status === "sold";
      }

      return true;
    });
  }, [allOrders, searchTerm, statusFilter]);

  // --- RENDER HELPERS ---
  const StatusBadge = ({ status }) => {
    const styles = {
      sold: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      refund_pending: "bg-rose-100 text-rose-700 border-rose-200 animate-pulse",
      refunded: "bg-slate-100 text-slate-500 border-slate-200 line-through",
      active: "bg-blue-50 text-blue-600 border-blue-100",
      none: "bg-gray-50 text-gray-400 border-gray-100",
    };

    let label = status;
    let styleKey = status || "none";

    // Customize labels/keys for specific cases
    if (status === "refund_pending") {
      label = "Refund Req";
      styleKey = "refund_pending";
    } else if (status === "active") {
      label = "Active";
      styleKey = "active";
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[styleKey] || styles.none} inline-flex items-center gap-1`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen font-inter bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Order Management</h2>
            <p className="text-sm text-slate-500 mt-1">Review resale requests and handle refunds</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-3">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm">
                <span className="text-slate-500">Total Orders:</span> <span className="font-bold text-slate-800">{allOrders.length}</span>
             </div>
          </div>
        </div>

        {/* TOOLBAR: Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Orders" },
              { id: "pending_resale", label: "Pending Resale" },
              { id: "sold", label: "Sold" },
              { id: "refund_req", label: "Refund Requests" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-white text-[#17604e] shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17604e]/20 focus:border-[#17604e] transition"
            />
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#17604e]"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resale Status</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FaBoxOpen size={48} className="mb-3 opacity-20" />
                          <p className="text-lg font-medium text-slate-600">No orders found</p>
                          <p className="text-sm">Try adjusting your search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={`${order.userId}-${order.id}`} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">{order.username}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 max-w-[200px] truncate" title={order.product_title}>
                          {order.product_title}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 text-right font-mono">{order.quantity}</td>
                        <td className="py-3 px-4 text-sm text-slate-800 font-bold text-right font-mono">${order.total}</td>
                        
                        {/* Status Columns */}
                        <td className="py-3 px-4">
                           <StatusBadge status={order.resale_status} />
                        </td>
                        <td className="py-3 px-4">
                           <StatusBadge status={order.status} />
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {/* REFUND ACTIONS */}
                            {order.status === "refund_pending" && (
                              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Refund</span>
                                <button
                                  onClick={() => handleApproveRefund(order.userId, order.id, true)}
                                  className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100 transition"
                                  title="Approve Refund"
                                >
                                  <FaCheck size={12} />
                                </button>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <button
                                  onClick={() => handleApproveRefund(order.userId, order.id, false)}
                                  className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                                  title="Deny Refund"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </div>
                            )}

                            {/* RESALE ACTIONS */}
                            {order.resale_status === "pending" && order.status !== "refund_pending" && (
                              <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                <input
                                  type="number"
                                  min="1"
                                  max={order.quantity}
                                  placeholder={order.quantity}
                                  value={sellQuantities[order.id] || ""}
                                  onChange={(e) => handleQuantityChange(order.id, e.target.value)}
                                  className="w-12 px-2 py-1.5 text-sm text-center focus:outline-none rounded-l-lg border-r border-slate-100"
                                />
                                <div className="flex p-1 gap-1">
                                  <button
                                    onClick={() => handleApproveResale(order.userId, order.id, true, order.quantity)}
                                    className="p-1.5 rounded bg-[#17604e] text-white hover:bg-[#124d3e] transition shadow-sm"
                                    title="Approve Resale"
                                  >
                                    <FaCheck size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleApproveResale(order.userId, order.id, false, order.quantity)}
                                    className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                                    title="Deny Resale"
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}