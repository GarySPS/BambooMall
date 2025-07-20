import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/admin";
const KYC_API_URL = "http://localhost:4000/api/kyc";

export default function AdminKYCPage() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    async function fetchKYC() {
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
    <div className="min-h-screen bg-[#F2E5C0]">
      <div className="max-w-4xl mx-auto py-10">
        <h2 className="text-3xl font-bold text-green-900 mb-8">KYC Approvals</h2>
        <div className="overflow-x-auto rounded-xl shadow-xl bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-50 text-green-900">
                <th>User</th>
                <th>Status</th>
                <th>KYC Images</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="font-bold">{u.username}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      u.kycStatus === "approved"
                        ? "bg-green-200 text-green-800"
                        : u.kycStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : u.kycStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {u.kycStatus}
                    </span>
                  </td>
                  <td>
                    {u.kycDocs?.map(doc => (
                      <img
                        key={doc.id}
                        src={doc.doc_url}
                        alt={doc.doc_type}
                        className="w-12 h-12 inline mx-1 rounded-lg border cursor-pointer object-cover"
                        onClick={() => setModal({ img: doc.doc_url, label: doc.doc_type })}
                      />
                    ))}
                  </td>
                  <td>
                    {u.kycStatus === "pending" && u.kycDocs?.length > 0 && (
                      <>
                        <button className="bg-green-600 text-white px-3 py-1 rounded-lg font-semibold text-xs mr-2"
                          onClick={() => handleApproveKYC(u.id, u.kycDocs[0].id, true)}>
                          Approve
                        </button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold text-xs"
                          onClick={() => handleApproveKYC(u.id, u.kycDocs[0].id, false)}>
                          Deny
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No KYC to review</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setModal(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
              <div className="mb-2 font-semibold text-green-800">{modal.label}</div>
              <img src={modal.img} alt={modal.label} className="max-w-xs max-h-[70vh] rounded-xl border" />
              <button className="mt-3 px-6 py-2 bg-green-700 hover:bg-green-900 text-white rounded-xl font-semibold"
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
