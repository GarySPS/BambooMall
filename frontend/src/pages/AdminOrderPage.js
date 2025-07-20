import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaClipboardList } from "react-icons/fa";
const API_URL = "http://localhost:4000/api/admin";

export default function AdminOrderPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const handleApproveResale = async (userId, orderId, approve) => {
    await fetch(`${API_URL}/orders/resale-approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, approve }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              orders: u.orders.map(o =>
                o.id === orderId
                  ? { ...o, resale_status: approve ? "sold" : "pending" }
                  : o
              ),
            }
          : u
      )
    );
  };

  const handleApproveRefund = async (userId, orderId, approve) => {
    await fetch(`${API_URL}/orders/refund-approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, approve }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              orders: u.orders.map(o =>
                o.id === orderId
                  ? { ...o, refund_status: approve ? "refunded" : "pending" }
                  : o
              ),
            }
          : u
      )
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] min-h-screen font-inter">
      <div className="max-w-6xl mx-auto">
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
                  <th className="py-3 px-3 text-left font-bold">Refund Status</th>
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
                        <td className="px-3 py-3">{o.product_title}</td>
                        <td className="px-3 py-3">{o.quantity}</td>
                        <td className="px-3 py-3 font-mono">${o.total}</td>
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
                            ${o.refund_status === "refunded"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : o.refund_status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-gray-200 text-gray-700 border border-gray-300"}
                          `}>
                            {o.refund_status}
                          </span>
                        </td>
                        <td className="px-3 py-3 flex flex-wrap gap-2">
                          {o.resale_status === "pending" && (
                            <>
                              <button
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApproveResale(u.id, o.id, true)}
                              >
                                <FaCheck />
                                Approve Sold
                              </button>
                              <button
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApproveResale(u.id, o.id, false)}
                              >
                                <FaTimes />
                                Deny
                              </button>
                            </>
                          )}
                          {o.refund_status === "pending" && (
                            <>
                              <button
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApproveRefund(u.id, o.id, true)}
                              >
                                <FaCheck />
                                Approve Refund
                              </button>
                              <button
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                                onClick={() => handleApproveRefund(u.id, o.id, false)}
                              >
                                <FaTimes />
                                Deny
                              </button>
                            </>
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
