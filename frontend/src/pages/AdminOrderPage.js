import React, { useEffect, useState } from "react";
const API_URL = "http://localhost:4000/api/admin";

export default function AdminOrderPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
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
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>
      <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
          <tr>
            <th>User</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Resale Status</th>
            <th>Refund Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            u.orders.map(o => (
              <tr key={o.id}>
                <td>{u.username}</td>
                <td>{o.product_title}</td>
                <td>{o.quantity}</td>
                <td>${o.total}</td>
                <td>{o.resale_status}</td>
                <td>{o.refund_status}</td>
                <td>
                  {o.resale_status === "pending" && (
                    <>
                      <button className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleApproveResale(u.id, o.id, true)}>
                        Approve Sold
                      </button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleApproveResale(u.id, o.id, false)}>
                        Deny
                      </button>
                    </>
                  )}
                  {o.refund_status === "pending" && (
                    <>
                      <button className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleApproveRefund(u.id, o.id, true)}>Approve Refund</button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleApproveRefund(u.id, o.id, false)}>Deny</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}
