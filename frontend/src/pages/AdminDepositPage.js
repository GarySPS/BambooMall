//src>pages>AdminDepositPage.js

import React, { useEffect, useState, useMemo } from "react";
import { 
  FaMoneyCheckAlt, 
  FaCheck, 
  FaTimes, 
  FaRegEye, 
  FaSearch, 
  FaBoxOpen 
} from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminDepositPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [modal, setModal] = useState(null); // For screenshot viewing
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // pending, approved, rejected

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // FIX: Get Token
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // FIX: Attach Token to Request
        const res = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleApproveTransaction = async (userId, txId, approve) => {
    // Optimistic Update: Update the local state immediately for snappy UX
    const originalUsers = [...users]; // Keep backup in case of error

    setUsers((prev) =>
      prev.map((u) => {
        if (u.wallet_transactions) {
          return {
            ...u,
            wallet_transactions: u.wallet_transactions.map((tx) =>
              tx.id === txId
                ? { ...tx, status: approve ? "approved" : "rejected" }
                : tx
            ),
          };
        }
        return u;
      })
    );

    try {
      // FIX: Get Token
      const token = localStorage.getItem("token");
      
      // FIX: Attach Token to Request
      const res = await fetch(`${API_URL}/tx-approve`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tx_id: txId, approve }),
      });

      if (!res.ok) throw new Error("API Error");

    } catch (err) {
      console.error("Transaction update failed:", err);
      alert("Failed to update transaction. Reverting changes.");
      setUsers(originalUsers); // Revert on failure
    }
  };

  // --- DATA PROCESSING ---
  // 1. Flatten all users' transactions into a single list
  const allTransactions = useMemo(() => {
    return users.flatMap((user) => {
      const txs = user.wallet_transactions || []; 
      return txs.map((tx) => ({
        ...tx,
        userId: user.id,
        username: user.username,
      }));
    });
  }, [users]);

  // 2. Filter Logic
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Filter by Type: Only show DEPOSITS on this page
      if (tx.type !== "deposit") return false;

      // Filter by Status Tab
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;

      // Filter by Search
      const searchLower = searchTerm.toLowerCase();
      return (
        (tx.username || "").toLowerCase().includes(searchLower) ||
        (tx.id && tx.id.toString().toLowerCase().includes(searchLower))
      );
    });
  }, [allTransactions, statusFilter, searchTerm]);

  // --- RENDER HELPERS ---
  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200", // Backend might send 'completed'
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      rejected: "bg-rose-100 text-rose-700 border-rose-200",
    };
    const style = styles[status] || "bg-gray-100 text-gray-500 border-gray-200";
    
    // Normalize display text
    const label = status === 'completed' ? 'Approved' : status;

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style} capitalize`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen font-inter bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
               <FaMoneyCheckAlt size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Deposit Management</h2>
              <p className="text-sm text-slate-500">Audit inbound liquidity requests</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg w-full lg:w-auto">
            {["pending", "approved", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-6 py-1.5 rounded-md text-sm font-semibold transition-all capitalize ${
                  statusFilter === tab
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
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
              placeholder="Search username or TX ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading ledger...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rail / Method</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proof</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FaBoxOpen size={48} className="mb-3 opacity-20" />
                          <p className="text-lg font-medium text-slate-600">No {statusFilter} deposits found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">{tx.username}</td>
                        <td className="py-3 px-4 text-sm font-mono font-bold text-emerald-700">+${Number(tx.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                           {tx.note ? tx.note : (tx.address ? "Crypto" : "Manual")}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"}
                        </td>
                        <td className="py-3 px-4">
                           <StatusBadge status={tx.status} />
                        </td>
                        <td className="py-3 px-4">
                          {tx.screenshot_url ? (
                            <button
                              onClick={() => setModal({ img: tx.screenshot_url, username: tx.username })}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-medium"
                            >
                              <FaRegEye /> View
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tx.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveTransaction(tx.userId, tx.id, true)}
                                className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                                title="Approve"
                              >
                                <FaCheck size={12} />
                              </button>
                              <button
                                onClick={() => handleApproveTransaction(tx.userId, tx.id, false)}
                                className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                                title="Reject"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">AUDITED</span>
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

        {/* IMAGE MODAL */}
        {modal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={() => setModal(null)}
          >
            <div 
              className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between w-full mb-4 border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-700">{modal.username}'s Proof</span>
                <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                  <FaTimes />
                </button>
              </div>
              <div className="bg-slate-100 rounded-lg p-2 w-full flex justify-center mb-4">
                  <img src={modal.img} alt="Proof" className="max-h-[60vh] object-contain rounded-md" />
              </div>
              <div className="flex gap-2 w-full">
                <button 
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition"
                  onClick={() => setModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}