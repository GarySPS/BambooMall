// src/pages/SignupPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
// REMOVED FaArrowRight (Unused)
import { FaBuilding, FaGlobe, FaFileContract, FaLock, FaEnvelope } from "react-icons/fa";

export default function SignupPage() {
  const [username, setUsername] = useState(""); // Maps to Business Name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [license, setLicense] = useState(""); // New Fake Field for realism
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Access Keys do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We still send standard fields to backend, but UI looks B2B
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Application failed");
      
      // UX: Instead of direct login, we go to OTP to simulate "Verification"
      navigate("/otp", { state: { email } });
      
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
         <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-blue-900 text-white mb-4">
             <FaFileContract size={20} />
         </div>
         <h2 className="text-2xl font-bold text-slate-900">Vendor Whitelist Application</h2>
         <p className="mt-2 text-sm text-slate-500">
           Due to export regulations, all new accounts require trade license verification.
         </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 rounded sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Registered Business Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="text-slate-400 sm:text-sm" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="focus:ring-blue-900 focus:border-blue-900 block w-full pl-10 sm:text-sm border-slate-300 rounded py-2"
                  placeholder="e.g. Acme Imports LLC"
                />
              </div>
            </div>

            {/* FAKE FIELD: Trade License (Crucial for the 'Banker' Persona) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Import/Export License No. (Optional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGlobe className="text-slate-400 sm:text-sm" />
                </div>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="focus:ring-blue-900 focus:border-blue-900 block w-full pl-10 sm:text-sm border-slate-300 rounded py-2"
                  placeholder="e.g. US-IMP-9920X"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Procurement Agent Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400 sm:text-sm" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-900 focus:border-blue-900 block w-full pl-10 sm:text-sm border-slate-300 rounded py-2"
                  placeholder="agent@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Create Access Key
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400 sm:text-sm" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-900 focus:border-blue-900 block w-full pl-10 sm:text-sm border-slate-300 rounded py-2 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Confirm Access Key
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400 sm:text-sm" />
                </div>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="focus:ring-blue-900 focus:border-blue-900 block w-full pl-10 sm:text-sm border-slate-300 rounded py-2 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              >
                {loading ? "Submitting Application..." : "Submit for Verification"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Already verified?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate("/login")}
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                Return to Login Terminal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}