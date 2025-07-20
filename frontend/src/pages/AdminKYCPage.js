import React, { useEffect, useState } from "react";
import { FaShieldAlt, FaCheck, FaTimes } from "react-icons/fa";

const API_URL = "http://localhost:4000/api/admin";
const KYC_API_URL = "http://localhost:4000/api/kyc";

export default function AdminKYCPage() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKYC() {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      let usersData = await res.json();
      if (!Array.isArray(usersData)) usersData = [];
      const usersWithKYC = await Promise.all(
        usersData.map(async (u) => {
          let kycDocs = [];
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
            } catch (e) {}
          }
          return { ...u, kycDocs };
        })
      );
      setUsers(usersWithKYC);
      setLoading(false);
    }
    fetchKYC();
  }, []);

  const handleApproveKYC = async (userId, kycId, approve) => {
    await fetch(`${API_URL}/kyc-approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kyc_id: kycId, approve }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, kycStatus: approve ? "approved" : "rejected" }
          : u
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] font-inter">
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#ffd700]/20 p-2 shadow">
            <FaShieldAlt className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            KYC Approvals
          </h2>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/70 backdrop-blur border border-white/60">
          <table className="min-w-full text-sm divide-y divide-[#e3e9ef]">
            <thead>
              <tr className="bg-[#17604e]/90 text-white">
                <th className="py-3 px-3 text-left font-bold rounded-tl-2xl">User</th>
                <th className="py-3 px-3 text-left font-bold">Status</th>
                <th className="py-3 px-3 text-left font-bold">KYC Images</th>
                <th className="py-3 px-3 text-left font-bold rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-green-700 font-semibold">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 inline-block mr-3"></span>
                    Loading KYC requests…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    No KYC to review
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-[#f5f6fa] transition">
                    <td className="font-bold px-3 py-3">{u.username}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-2xl text-xs font-bold shadow 
                        ${
                          u.kycStatus === "approved"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : u.kycStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : u.kycStatus === "rejected"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-gray-200 text-gray-700 border border-gray-300"
                        }`
                      }>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {u.kycDocs?.map(doc => (
                        <img
                          key={doc.id}
                          src={doc.doc_url}
                          alt={doc.doc_type}
                          className="w-12 h-12 inline mx-1 rounded-lg border shadow-sm cursor-pointer object-cover transition hover:scale-110"
                          onClick={() => setModal({ img: doc.doc_url, label: doc.doc_type })}
                        />
                      ))}
                    </td>
                    <td className="px-3 py-3">
                      {u.kycStatus === "pending" && u.kycDocs?.length > 0 && (
                        <>
                          <button
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded-lg font-semibold text-xs mr-2 shadow active:scale-95 transition"
                            onClick={() => handleApproveKYC(u.id, u.kycDocs[0].id, true)}
                          >
                            <FaCheck />
                            Approve
                          </button>
                          <button
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-semibold text-xs shadow active:scale-95 transition"
                            onClick={() => handleApproveKYC(u.id, u.kycDocs[0].id, false)}
                          >
                            <FaTimes />
                            Deny
                          </button>
                        </>
                      )}
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
              <div className="mb-2 font-semibold text-green-800">{modal.label}</div>
              <img src={modal.img} alt={modal.label} className="max-w-xs max-h-[70vh] rounded-xl border shadow" />
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
