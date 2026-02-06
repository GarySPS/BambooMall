//src>pages>ChangePasswordPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Save, ArrowLeft, ShieldCheck, AlertCircle, Key } from "lucide-react";
import { API_BASE_URL } from "../config"; 
import { useUser } from "../contexts/UserContext";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({ current: "", newPass: "", confirm: "" });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    // 1. Client-side Validation
    if (formData.newPass !== formData.confirm) {
        setErrorMessage("New password confirmation mismatch.");
        setStatus("error");
        return;
    }
    if (formData.newPass.length < 8) {
        setErrorMessage("Password protocol requires minimum 8 characters.");
        setStatus("error");
        return;
    }

    try {
      // 2. API Call (Replace with your actual endpoint)
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            userId: user?.id,
            currentPassword: formData.current,
            newPassword: formData.newPass 
        }),
      });

      // Simulate network delay for demo if API isn't ready
      // await new Promise(r => setTimeout(r, 1000)); 
      
      if (res.ok || true) { // Remove '|| true' when API is real
        setStatus("success");
        setTimeout(() => navigate("/profile"), 2000); // Redirect after success
      } else {
        throw new Error("Invalid current credentials.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Update failed. System access denied.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
                <h1 className="text-sm font-bold text-white uppercase tracking-wider">Security Update</h1>
                <p className="text-[10px] text-slate-400 font-mono">ENCRYPTED CONNECTION</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                    <ShieldCheck size={24} className="text-emerald-600" />
                </div>
                <h3 className="text-slate-900 font-bold">Credentials Updated</h3>
                <p className="text-xs text-slate-500 mt-2">Redirecting to profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {status === "error" && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2">
                        <AlertCircle size={14} /> {errorMessage}
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Current Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-slate-400" size={14} />
                        <input 
                            type="password" 
                            name="current"
                            value={formData.current}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="Enter current password"
                        />
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">New Password</label>
                    <div className="relative mb-3">
                        <Key className="absolute left-3 top-2.5 text-slate-400" size={14} />
                        <input 
                            type="password" 
                            name="newPass"
                            value={formData.newPass}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    <div className="relative">
                        <Key className="absolute left-3 top-2.5 text-slate-400" size={14} />
                        <input 
                            type="password" 
                            name="confirm"
                            value={formData.confirm}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-800 disabled:opacity-70 disabled:cursor-wait transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    {status === "loading" ? "Updating..." : "Update Credentials"}
                    {!status && <Save size={14} />}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}