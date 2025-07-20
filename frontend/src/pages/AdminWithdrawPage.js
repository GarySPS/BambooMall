import React, { useEffect, useState } from "react";
import { FaExchangeAlt, FaCheck, FaTimes } from "react-icons/fa";

const API_URL = "http://localhost:4000/api/admin";

export default function AdminWithdrawPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWithdraws() {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
      setLoading(false);
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

  // Flatten pending withdraws for display
  const pendingRows = users.flatMap(u =>
    (u.withdraws || [])
      .filter(w => w.status === "pending")
      .map(w => ({
        ...w,
        username: u.username,
        userId: u.id,
      }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] font-inter">
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#ffd700]/20 p-2 shadow">
            <FaExchangeAlt className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            Withdraw Approvals
          </h2>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/70 backdrop-blur border border-white/60">
          <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
            <thead>
              <tr className="bg-[#17604e]/90 text-white">
                <th className="py-3 px-4 rounded-tl-2xl text-left font-bold">User</th>
                <th className="py-3 px-4 text-left font-bold">Amount</th>
                <th className="py-3 px-4 text-left font-bold">Address</th>
                <th className="py-3 px-4 text-left font-bold">Status</th>
                <th className="py-3 px-4 rounded-tr-2xl text-left font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-green-700 font-semibold">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 inline-block mr-3"></span>
                    Loading withdraws…
                  </td>
                </tr>
              ) : pendingRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No pending withdraws
                  </td>
                </tr>
              ) : (
                pendingRows.map(w => (
                  <tr key={w.tx_id} className="border-b last:border-0 hover:bg-[#f5f6fa] transition">
                    <td className="py-3 px-4 font-bold">{w.username}</td>
                    <td className="py-3 px-4 font-mono">${w.amount}</td>
                    <td className="py-3 px-4 font-mono text-xs">{w.address}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-2xl bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold text-xs shadow">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded-lg font-semibold text-xs mr-2 shadow active:scale-95 transition"
                        onClick={() => handleApproveWithdraw(w.userId, w.tx_id, true)}
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold text-xs shadow active:scale-95 transition"
                        onClick={() => handleApproveWithdraw(w.userId, w.tx_id, false)}
                      >
                        <FaTimes /> Deny
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
