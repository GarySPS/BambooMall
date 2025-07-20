import React, { useEffect, useState } from "react";
const API_URL = "http://localhost:4000/api/admin";

export default function AdminWithdrawPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchWithdraws() {
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
    }
    fetchWithdraws();
  }, []);

  const handleApproveWithdraw = async (userId, txId, approve) => {
    await fetch(`${API_URL}/tx-approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_id: txId, approve }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              withdraws: u.withdraws.map(w =>
                w.tx_id === txId
                  ? { ...w, status: approve ? "completed" : "rejected" }
                  : w
              ),
            }
          : u
      )
    );
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Withdraw Approvals</h2>
      <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
          <tr>
            <th>User</th>
            <th>Amount</th>
            <th>Address</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            u.withdraws.map(w => w.status === "pending" && (
              <tr key={w.tx_id}>
                <td>{u.username}</td>
                <td>${w.amount}</td>
                <td className="font-mono text-xs">{w.address}</td>
                <td>{w.status}</td>
                <td>
                  <button className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleApproveWithdraw(u.id, w.tx_id, true)}>Approve</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleApproveWithdraw(u.id, w.tx_id, false)}>Deny</button>
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}
