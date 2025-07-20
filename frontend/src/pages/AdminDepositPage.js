import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/admin";

export default function AdminDepositPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchDeposits() {
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
    }
    fetchDeposits();
  }, []);

  const handleApproveDeposit = async (userId, txId, approve) => {
    await fetch(`${API_URL}/tx-approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx_id: txId, approve }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, deposit: { ...u.deposit, status: approve ? "approved" : "rejected" } }
          : u
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F2E5C0]">
      <div className="max-w-3xl mx-auto py-10">
        <h2 className="text-3xl font-bold text-green-900 mb-8">Deposit Approvals</h2>
        <div className="overflow-x-auto rounded-xl shadow-xl bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-50 text-green-900">
                <th className="py-3 px-4">User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Screenshot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.deposit && u.deposit.status === "pending").map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-3 px-4 font-bold">{u.username}</td>
                  <td>${u.deposit.amount}</td>
                  <td>{u.deposit.method}</td>
                  <td>
                    <span className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 font-semibold text-xs">Pending</span>
                  </td>
                  <td>
                    {u.deposit.screenshot_url &&
                      <img src={u.deposit.screenshot_url} className="w-12 h-12 rounded-xl border shadow-sm object-cover" alt="Deposit" />}
                  </td>
                  <td>
                    <button className="bg-green-600 text-white px-3 py-1 rounded-lg font-semibold text-xs mr-2"
                      onClick={() => handleApproveDeposit(u.id, u.deposit.tx_id, true)}>Approve</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold text-xs"
                      onClick={() => handleApproveDeposit(u.id, u.deposit.tx_id, false)}>Deny</button>
                  </td>
                </tr>
              ))}
              {users.filter(u => u.deposit && u.deposit.status === "pending").length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No pending deposits</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
