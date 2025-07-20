import React, { useEffect, useState } from "react";
import { FaMoneyCheckAlt, FaCheck, FaTimes, FaRegEye } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminDepositPage() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeposits() {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
      setLoading(false);
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

  const pendingUsers = users.filter(u => u.deposit && u.deposit.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] font-inter">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#ffd700]/20 p-2 shadow">
            <FaMoneyCheckAlt className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            Deposit Approvals
          </h2>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/70 backdrop-blur border border-white/60">
          <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
            <thead>
              <tr className="bg-[#17604e]/90 text-white">
                <th className="py-3 px-4 rounded-tl-2xl text-left font-bold">User</th>
                <th className="py-3 px-4 text-left font-bold">Amount</th>
                <th className="py-3 px-4 text-left font-bold">Method</th>
                <th className="py-3 px-4 text-left font-bold">Status</th>
                <th className="py-3 px-4 text-left font-bold">Screenshot</th>
                <th className="py-3 px-4 rounded-tr-2xl text-left font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-green-700 font-semibold">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 inline-block mr-3"></span>
                    Loading deposits…
                  </td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No pending deposits
                  </td>
                </tr>
              ) : (
                pendingUsers.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-[#f5f6fa] transition">
                    <td className="py-3 px-4 font-bold">{u.username}</td>
                    <td className="py-3 px-4 font-mono">${u.deposit.amount}</td>
                    <td className="py-3 px-4">{u.deposit.method}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-2xl bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold text-xs shadow">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.deposit.screenshot_url && (
                        <button
                          className="flex items-center gap-1 bg-[#e8f5ef] hover:bg-[#d1f7ec] px-2 py-1 rounded-lg shadow transition"
                          onClick={() => setModal({ img: u.deposit.screenshot_url, username: u.username })}
                        >
                          <FaRegEye className="text-[#17604e]" />
                          <span className="text-xs font-semibold text-[#17604e]">View</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded-lg font-semibold text-xs mr-2 shadow active:scale-95 transition"
                        onClick={() => handleApproveDeposit(u.id, u.deposit.tx_id, true)}
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold text-xs shadow active:scale-95 transition"
                        onClick={() => handleApproveDeposit(u.id, u.deposit.tx_id, false)}
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
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition"
            onClick={() => setModal(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center"
              onClick={e => e.stopPropagation()}>
              <div className="mb-2 font-semibold text-green-800">{modal.username}'s Deposit Screenshot</div>
              <img src={modal.img} alt="Deposit Screenshot" className="max-w-xs max-h-[70vh] rounded-xl border shadow" />
              <button className="mt-3 px-6 py-2 bg-green-700 hover:bg-green-900 text-white rounded-xl font-semibold shadow active:scale-95"
                onClick={() => setModal(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
