//src>pages>AdminKYCPage.js

import React, { useEffect, useState } from "react";
import { FaShieldAlt, FaCheck, FaTimes, FaMapMarkerAlt, FaPhone, FaIdCard, FaUser } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;
const KYC_API_URL = `${API_BASE_URL}/kyc`;

export default function AdminKYCPage() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKYC() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users`);
        let usersData = await res.json();
        if (!Array.isArray(usersData)) usersData = [];

        const usersWithKYC = await Promise.all(
          usersData.map(async (u) => {
            let kycDocs = [];
            // We fetch docs if status is pending OR approved so admin can review/audit
            if (u.kycStatus === "pending" || u.kycStatus === "approved") {
              try {
                const r = await fetch(`${KYC_API_URL}?short_id=${u.short_id}`);
                const d = await r.json();
                kycDocs = Array.isArray(d.kyc_docs)
                  ? d.kyc_docs.map(doc => ({
                      ...doc,
                      doc_url: typeof doc.doc_url === "string"
                        ? doc.doc_url.replace(/[\r\n\s]+/g, "")
                        : ""
                    }))
                  : [];
              } catch (e) { console.error("Error fetching docs", e); }
            }
            return { ...u, kycDocs };
          })
        );
        // Sort: Pending first, then by date
        usersWithKYC.sort((a, b) => (a.kycStatus === "pending" ? -1 : 1));
        setUsers(usersWithKYC);
      } catch (err) {
        console.error("Admin Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchKYC();
  }, []);

  const handleApproveKYC = async (userId, approve) => {
    try {
        await fetch(`${API_URL}/kyc-approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Pass the userId (database ID) to update the user record directly
            body: JSON.stringify({ user_id: userId, approve }), 
        });
    
        setUsers((prev) =>
            prev.map((u) =>
            u.id === userId
                ? { ...u, kycStatus: approve ? "approved" : "rejected" }
                : u
            )
        );
    } catch (error) {
        alert("Action failed. Check console.");
        console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] font-inter">
      <div className="max-w-6xl mx-auto py-10 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#ffd700]/20 p-2 shadow">
            <FaShieldAlt className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            KYC Approvals
          </h2>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl shadow-xl bg-white/70 backdrop-blur border border-white/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
<thead>
  <tr className="bg-[#17604e]/90 text-white">
    <th className="py-4 px-4 text-left font-bold w-48">User Account</th>
    <th className="py-4 px-4 text-left font-bold w-64">Identity Info</th>
    <th className="py-4 px-4 text-left font-bold">Status</th>
    <th className="py-4 px-4 text-left font-bold">Documents</th>
    <th className="py-4 px-4 text-left font-bold text-center">Action</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-green-700 font-semibold">
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 inline-block mr-3"></span>
                      Loading KYC requests...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No KYC requests found.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-[#f5f6fa] transition duration-150">
                      
                      {/* 1. User Account */}
                      <td className="px-4 py-4 align-top">
                        <div className="font-bold text-gray-900 text-base">{u.username}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {u.short_id}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>
                      </td>

                      {/* 2. Identity Info (NEW) */}
                      <td className="px-4 py-4 align-top">
                        {u.full_name ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <FaUser className="text-gray-400 text-xs" /> 
                                    {u.full_name}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-xs">
                                    <FaIdCard className="text-blue-400" /> 
                                    {u.id_number || "No ID Number"}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-xs">
                                    <FaPhone className="text-green-400" /> 
                                    {u.phone || "No Phone"}
                                </div>
                                <div className="flex items-start gap-2 text-gray-500 text-xs italic mt-1 bg-gray-50 p-1.5 rounded border border-gray-100">
                                    <FaMapMarkerAlt className="text-red-400 shrink-0 mt-0.5" /> 
                                    {u.address || "No Address Provided"}
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-400 text-xs italic">No profile data submitted</span>
                        )}
                      </td>

                      {/* 3. Status */}
                      <td className="px-4 py-4 align-top">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
                          ${
                            u.kycStatus === "approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : u.kycStatus === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`
                        }>
                          {u.kycStatus || "Unverified"}
                        </span>
                      </td>

                      {/* 4. Images */}
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {u.kycDocs?.length > 0 ? (
                            u.kycDocs.map((doc, idx) => (
                              <div key={idx} className="group relative">
                                <img
                                  src={doc.doc_url}
                                  alt={doc.doc_type}
                                  className="w-16 h-16 rounded-lg border-2 border-white shadow-md object-cover cursor-zoom-in hover:scale-110 transition-transform duration-200"
                                  onClick={() => setModal({ img: doc.doc_url, label: doc.name || doc.doc_type })}
                                />
                                <div className="hidden group-hover:block absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                                    {doc.name || doc.doc_type}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-300 text-xs">No images</span>
                          )}
                        </div>
                      </td>

                      {/* 5. Action */}
                      <td className="px-4 py-4 align-middle text-center">
                        {u.kycStatus === "pending" && (
                          <div className="flex flex-col gap-2">
                            <button
                              className="flex items-center justify-center gap-2 bg-[#17604e] hover:bg-[#0f4235] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all w-full"
                              onClick={() => handleApproveKYC(u.id, true)}
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all w-full"
                              onClick={() => handleApproveKYC(u.id, false)}
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        )}
                        {u.kycStatus === "approved" && (
                             <div className="text-xs text-green-600 font-bold flex items-center justify-center gap-1">
                                <FaCheck size={10} /> Done
                             </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Image Modal */}
        {modal && (
          <div 
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setModal(null)}
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <button 
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition"
                onClick={() => setModal(null)}
              >
                <FaTimes size={24} />
              </button>
              
              <div className="bg-white/10 px-4 py-1 rounded-full text-white font-mono text-sm mb-4 border border-white/20">
                {modal.label}
              </div>
              
              <img 
                src={modal.img} 
                alt="Full View" 
                className="max-h-[80vh] w-auto rounded-lg shadow-2xl border-4 border-white/10" 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}