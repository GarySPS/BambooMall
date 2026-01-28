// src/pages/AdminWithdrawPage.js

import React, { useEffect, useState, useMemo } from "react";
import { 
  FaExchangeAlt, 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaBoxOpen 
} from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminWithdrawPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // pending, completed, rejected

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchWithdraws() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users`);
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWithdraws();
  }, []);

  // --- HANDLERS ---
  const handleApproveWithdraw = async (userId, txId, approve) => {
    try {
      await fetch(`${API_URL}/tx-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_id: txId, approve }),
      });

      // Optimistic Update
      setUsers((prev) =>
        prev.map((u) => {
          if (u.wallet_transactions) {
            return {
              ...u,
              wallet_transactions: u.wallet_transactions.map((tx) =>
                tx.id === txId
                  ? { ...tx, status: approve ? "completed" : "rejected" }
                  : tx
              ),
            };
          }
          // Fallback if structure uses 'withdraws' array instead of wallet_transactions
          if (u.withdraws) {
            return {
              ...u,
              withdraws: u.withdraws.map((w) =>
                w.tx_id === txId
                  ? { ...w, status: approve ? "completed" : "rejected" }
                  : w
              ),
            };
          }
          return u;
        })
      );
    } catch (err) {
      console.error("Transaction update failed:", err);
      alert("Failed to update transaction.");
    }
  };

  // --- DATA PROCESSING ---
  // 1. Flatten all users' withdrawals into a single list
  const allWithdrawals = useMemo(() => {
    return users.flatMap((user) => {
      // Support both 'wallet_transactions' (new DB) and legacy 'withdraws' array
      const txs = user.wallet_transactions || user.withdraws || [];
      
      return txs.map((tx) => ({
        ...tx,
        // Normalize fields if legacy 'withdraws' array is used
        id: tx.id || tx.tx_id, 
        userId: user.id,
        username: user.username,
      }));
    });
  }, [users]);

  // 2. Filter Logic
  const filteredWithdrawals = useMemo(() => {
    return allWithdrawals.filter((tx) => {
      // If using wallet_transactions, ensure we only get 'withdraw' type
      if (tx.type && tx.type !== "withdraw") return false;

      // Filter by Status Tab
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;

      // Filter by Search
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.username.toLowerCase().includes(searchLower) ||
        (tx.id && tx.id.toString().toLowerCase().includes(searchLower))
      );
    });
  }, [allWithdrawals, statusFilter, searchTerm]);

  // --- RENDER HELPERS ---
  const StatusBadge = ({ status }) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200", // "approved" usually maps to completed for withdraws
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      rejected: "bg-rose-100 text-rose-700 border-rose-200",
    };
    const style = styles[status] || "bg-gray-100 text-gray-500 border-gray-200";
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen font-inter bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
               <FaExchangeAlt size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Withdrawal Management</h2>
              <p className="text-sm text-slate-500">Process payouts and view history</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg w-full lg:w-auto">
            {["pending", "completed", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-6 py-1.5 rounded-md text-sm font-semibold transition-all capitalize ${
                  statusFilter === tab
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading withdrawals...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Info / Method</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FaBoxOpen size={48} className="mb-3 opacity-20" />
                          <p className="text-lg font-medium text-slate-600">No {statusFilter} withdrawals found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">{tx.username}</td>
                        <td className="py-3 px-4 text-sm font-mono font-bold text-slate-800">${tx.amount}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                            {tx.note || tx.method || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500 max-w-[200px] truncate" title={tx.address}>
                            {tx.address || "-"}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {tx.created_at || tx.updated_at ? new Date(tx.created_at || tx.updated_at).toLocaleString() : "-"}
                        </td>
                        <td className="py-3 px-4">
                           <StatusBadge status={tx.status} />
                        </td>
                        <td className="py-3 px-4">
                          {tx.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveWithdraw(tx.userId, tx.id, true)}
                                className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                                title="Approve"
                              >
                                <FaCheck size={12} />
                              </button>
                              <button
                                onClick={() => handleApproveWithdraw(tx.userId, tx.id, false)}
                                className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                                title="Reject"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                                {tx.status === "completed" ? "Paid" : "Closed"}
                            </span>
                          )}
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