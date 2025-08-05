import React, { useEffect, useState } from "react";
import { FaExchangeAlt, FaCheck, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

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

  // Flatten withdraws for all statuses
  const flattenWithdraws = (status) =>
    users.flatMap(u =>
      (u.withdraws || [])
        .filter(w => w.status === status)
        .map(w => ({
          ...w,
          username: u.username,
          userId: u.id,
        }))
    );

  const pendingRows = flattenWithdraws("pending");
  const approvedRows = flattenWithdraws("completed");
  const rejectedRows = flattenWithdraws("rejected");

  // Table headers for history and pending
  const tableHeader = (
    <tr className="bg-[#17604e]/90 text-white">
      <th className="py-3 px-4 rounded-tl-2xl text-left font-bold">User</th>
      <th className="py-3 px-4 text-left font-bold">Amount</th>
      <th className="py-3 px-4 text-left font-bold">Address</th>
      <th className="py-3 px-4 text-left font-bold">Status</th>
      <th className="py-3 px-4 rounded-tr-2xl text-left font-bold">Action</th>
    </tr>
  );
  const historyHeader = (
    <tr className="bg-[#17604e]/90 text-white">
      <th className="py-3 px-4 rounded-tl-2xl text-left font-bold">User</th>
      <th className="py-3 px-4 text-left font-bold">Amount</th>
      <th className="py-3 px-4 text-left font-bold">Address</th>
      <th className="py-3 px-4 text-left font-bold">Status</th>
      <th className="py-3 px-4 rounded-tr-2xl text-left font-bold">Date</th>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] font-inter">
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#ffd700]/20 p-2 shadow">
            <FaExchangeAlt className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            Withdraw Approvals & History
          </h2>
        </div>

        {/* ---------- PENDING WITHDRAWS ---------- */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-[#17604e] mb-2">Pending Withdrawals</h3>
          <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/70 backdrop-blur border border-white/60">
            <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
              <thead>{tableHeader}</thead>
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
                      No pending withdrawals
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

        {/* ---------- APPROVED HISTORY ---------- */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-green-700 mb-2">Completed Withdrawals</h3>
          <div className="overflow-x-auto rounded-2xl shadow bg-white/70 backdrop-blur border border-white/60">
            <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
              <thead>{historyHeader}</thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-green-700 font-semibold">
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 inline-block mr-3"></span>
                      Loading...
                    </td>
                  </tr>
                ) : approvedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No completed withdrawals
                    </td>
                  </tr>
                ) : (
                  approvedRows.map(w => (
                    <tr key={w.tx_id} className="border-b last:border-0 hover:bg-[#f7fff7] transition">
                      <td className="py-3 px-4 font-bold">{w.username}</td>
                      <td className="py-3 px-4 font-mono">${w.amount}</td>
                      <td className="py-3 px-4 font-mono text-xs">{w.address}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-2xl bg-green-100 text-green-800 border border-green-300 font-semibold text-xs shadow">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        {w.updated_at ? new Date(w.updated_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- REJECTED HISTORY ---------- */}
        <div>
          <h3 className="text-lg font-bold text-red-700 mb-2">Rejected Withdrawals</h3>
          <div className="overflow-x-auto rounded-2xl shadow bg-white/60 backdrop-blur border border-white/60">
            <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="py-3 px-4 rounded-tl-2xl text-left font-bold">User</th>
                  <th className="py-3 px-4 text-left font-bold">Amount</th>
                  <th className="py-3 px-4 text-left font-bold">Address</th>
                  <th className="py-3 px-4 text-left font-bold">Status</th>
                  <th className="py-3 px-4 rounded-tr-2xl text-left font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-red-600 font-semibold">
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 inline-block mr-3"></span>
                      Loading...
                    </td>
                  </tr>
                ) : rejectedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No rejected withdrawals
                    </td>
                  </tr>
                ) : (
                  rejectedRows.map(w => (
                    <tr key={w.tx_id} className="border-b last:border-0 hover:bg-[#fff7f7] transition">
                      <td className="py-3 px-4 font-bold">{w.username}</td>
                      <td className="py-3 px-4 font-mono">${w.amount}</td>
                      <td className="py-3 px-4 font-mono text-xs">{w.address}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-2xl bg-red-100 text-red-700 border border-red-300 font-semibold text-xs shadow">
                          Rejected
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        {w.updated_at ? new Date(w.updated_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
