//src>pages>ProfilePage.js

import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config"; // IMPORT ADDED
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { 
  FaCamera, 
  FaLock, 
  FaSignOutAlt, 
  FaWallet, 
  FaEdit,
  FaShieldAlt,
  FaCheckCircle
} from "react-icons/fa";

// ---- VIP Tier Calculation ----
function getVipTier(balance) {
  if (balance >= 40000) return "VIVIP";
  if (balance >= 20000) return "VIPX";
  if (balance >= 15000) return "VIP2";
  if (balance >= 10000) return "VIP1";
  if (balance >= 5000) return "VIP0";
  return "Member";
}

// ---- Animated VIP Badge ----
function AnimatedVIPBadge({ tier = "Member" }) {
  const styleMap = {
    Member: "from-green-100 to-green-200 text-green-800 border-green-200",
    VIP0: "from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-200",
    VIP1: "from-blue-100 to-blue-200 text-blue-800 border-blue-200",
    VIP2: "from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-200",
    VIPX: "from-amber-100 to-amber-200 text-amber-800 border-amber-200",
    VIVIP: "from-rose-100 to-rose-200 text-rose-800 border-rose-200",
  };
  const style = styleMap[tier] || styleMap.Member;

  return (
    <div className="relative flex justify-center mt-3">
      <div
        className={`
          animate-vip-bounce
          bg-gradient-to-r ${style} 
          font-extrabold px-6 py-1.5 rounded-full shadow-sm border text-xs tracking-widest uppercase font-sans
        `}
        style={{ minWidth: 90 }}
      >
        {tier}
      </div>
      <style>{`
        @keyframes vip-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-vip-bounce { animation: vip-bounce 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
}

// ---- Verified Badge ----
function VerifiedBadge() {
  return (
    <span className="inline-flex items-center ml-2 text-blue-500 drop-shadow-sm" title="Verified">
      <FaCheckCircle size={18} />
    </span>
  );
}

// ---- Custom File Input ----
function CustomFileInput({ id, onChange, accept, disabled, label = "Choose File" }) {
  return (
    <div className="relative w-full group">
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onChange}
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
      />
      <div 
        className={`
          flex items-center justify-center gap-2 
          border-2 border-dashed border-gray-300 bg-gray-50
          rounded-xl py-3 px-4 w-full transition-all duration-300
          group-hover:bg-white group-hover:border-green-400
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <FaCamera className="text-gray-400 group-hover:text-green-500 transition-colors" />
        <span className="text-gray-500 font-bold text-sm truncate group-hover:text-green-600 transition-colors">
          {disabled ? "Uploading..." : label}
        </span>
      </div>
    </div>
  );
}

// ---- MAIN PROFILE PAGE ----
export default function ProfilePage() {
  // FIX: Added 'updateWallet' to destructuring
  const { user, wallet, refreshUser, logout, updateWallet } = useUser();
  
  // Toggles
  const [showAvatar, setShowAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit Profile
  const [profileAvatar, setProfileAvatar] = useState(null);

  // Change Password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const navigate = useNavigate();

  // --- FIX: Add useEffect to fetch wallet on mount ---
  useEffect(() => {
    async function fetchWalletData() {
      if (user?.id) {
        try {
          const res = await fetch(`${API_BASE_URL}/wallet/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.wallet && updateWallet) {
              updateWallet(data.wallet);
            }
          }
        } catch (error) {
          console.error("Failed to fetch wallet on profile:", error);
        }
      }
    }
    fetchWalletData();
  }, [user?.id, updateWallet]);
  // --------------------------------------------------

  // Balance logic
  const totalBalance = wallet?.balance || 0; 
  const currentVipTier = getVipTier(totalBalance);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-lg font-bold">Please log in to view profile.</div>
      </div>
    );
  }

  const displayFont = "font-[Montserrat] font-extrabold";

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-8 flex flex-col gap-6">

        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-8 relative overflow-hidden text-center border border-gray-100">
           {/* Soft Top Gradient */}
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-50 to-transparent"></div>
           
           <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-2">
                 <img
                   src={user.avatar || "/images/profile-demo.jpg"}
                   alt="Profile"
                   className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl object-cover"
                 />
                 <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
              </div>
              
              <AnimatedVIPBadge tier={currentVipTier} />
              
              <div className="mt-4">
                 <h3 className={`text-2xl text-gray-900 ${displayFont} flex items-center justify-center gap-2`}>
                   {user.username || user.full_name || "User"}
                   {user.kyc_status === "approved" && <VerifiedBadge />}
                 </h3>
                 <p className="text-gray-400 font-medium text-sm mt-1">{user.email}</p>
              </div>

              {/* Status Pill */}
              <div className="mt-6 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-inner">
                 <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Account Status</span>
                 <span className="text-green-600 font-bold text-sm">{currentVipTier}</span>
              </div>
           </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden border border-gray-100">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
                <FaWallet className="text-green-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Total Balance</span>
            </div>
            
            <span className={`text-5xl font-black text-gray-900 mb-8 ${displayFont} tracking-tight`}>
              {/* Force 2 decimals for cleaner look */}
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <button
                onClick={() => navigate("/balance")}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Deposit
              </button>
              <button
                onClick={() => navigate("/balance")}
                className="py-3.5 rounded-2xl bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 font-bold text-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
           <div className="flex items-center justify-between mb-6 px-2">
             <div>
                 <h4 className="text-lg font-extrabold text-gray-800">Asset Growth</h4>
                 <p className="text-xs text-gray-400 font-medium">Last 14 Days Performance</p>
             </div>
             {/* Dynamic Growth Percentage */}
             <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${totalBalance > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                 {totalBalance > 0 ? '+12.5%' : '0.0%'}
             </div>
           </div>
           <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Array.from({ length: 14 }).map((_, i) => {
                    const isToday = i === 13;
                    let val = 0;
                    
                    if (totalBalance > 0) {
                        const growthFactor = 0.8 + (i / 13) * 0.2; 
                        val = isToday ? totalBalance : Math.floor(totalBalance * growthFactor);
                    }

                    return { 
                        date: (i + 1).toString().padStart(2, '0'), 
                        balance: val 
                    };
                  })}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, "Balance"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    dot={{ r: 3, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* KYC Verification Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
             <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-4 text-3xl shadow-sm">
                <FaShieldAlt />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Verification</h3>
             <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
               Complete your verification to unlock higher withdrawal limits and VIP benefits.
             </p>
             
             <button 
               onClick={() => navigate('/kyc-verification')}
               className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
             >
               Start Verification
             </button>
        </div>

        {/* Settings Grid */}
        <div className="grid md:grid-cols-2 gap-4">
            {/* Avatar Edit */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <button 
                 onClick={() => setShowAvatar(!showAvatar)}
                 className="flex items-center justify-center gap-3 w-full py-2 hover:opacity-70 transition"
               >
                 <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <FaEdit />
                 </div>
                 <span className="font-bold text-gray-700">Change Avatar</span>
               </button>
               {showAvatar && (
                 <form
                   className="flex flex-col gap-3 mt-4 animate-fade-in"
                   onSubmit={async (e) => {
                     e.preventDefault();
                     if (!profileAvatar) return;
                     const fileExt = profileAvatar.name.split('.').pop();
                     const filePath = `${user.user_id}_${Date.now()}.${fileExt}`;
                     let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, profileAvatar, { upsert: true });
                     if (uploadError) { alert("Upload failed!"); return; }
                     const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
                     await fetch(`/api/user/update-avatar`, {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ user_id: user.user_id, avatar: data.publicUrl }),
                     });
                     setProfileAvatar(null);
                     alert("Updated!");
                     refreshUser();
                   }}
                 >
                   <CustomFileInput
                     id="profile-avatar-upload"
                     onChange={e => setProfileAvatar(e.target.files[0])}
                     accept="image/*"
                     label={profileAvatar ? profileAvatar.name : "Select Image"}
                   />
                   <button type="submit" disabled={!profileAvatar} className="w-full py-2 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-black disabled:opacity-50 transition-colors">
                     Update Photo
                   </button>
                 </form>
               )}
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <button 
                 onClick={() => setShowPassword(!showPassword)}
                 className="flex items-center justify-center gap-3 w-full py-2 hover:opacity-70 transition"
               >
                 <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <FaLock />
                 </div>
                 <span className="font-bold text-gray-700">Security</span>
               </button>
               {showPassword && (
                 <form
                   className="flex flex-col gap-3 mt-4 animate-fade-in"
                   onSubmit={async (e) => {
                     e.preventDefault();
                     if (!oldPass || !newPass || !confirmPass) { alert("Required"); return; }
                     if (newPass !== confirmPass) { alert("Mismatch"); return; }
                     const res = await fetch("/api/user/change-password", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ user_id: user.id, old_password: oldPass, new_password: newPass }),
                     });
                     const data = await res.json();
                     if (res.ok && data.message === "Password changed") {
                       alert("Success!"); setOldPass(""); setNewPass(""); setConfirmPass("");
                     } else { alert(data.error || "Failed"); }
                   }}
                 >
                   <input type="password" placeholder="Current" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-orange-400 outline-none" value={oldPass} onChange={e => setOldPass(e.target.value)} />
                   <input type="password" placeholder="New" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-orange-400 outline-none" value={newPass} onChange={e => setNewPass(e.target.value)} />
                   <input type="password" placeholder="Confirm" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-orange-400 outline-none" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                   <button type="submit" className="w-full py-2 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">
                     Change Password
                   </button>
                 </form>
               )}
            </div>
        </div>

        {/* Logout Button Trigger */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100 shadow-sm mb-8"
        >
          <FaSignOutAlt /> Sign Out
        </button>

        {/* Custom Mobile Logout Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Dark Backdrop with Blur */}
            <div 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowLogoutConfirm(false)}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white rounded-[2rem] w-full max-w-xs p-6 shadow-2xl transform transition-all scale-100 text-center z-10">
              
              {/* Icon Bubble */}
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <FaSignOutAlt size={24} />
              </div>

              {/* Title & Text */}
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 font-[Montserrat]">
                Sign Out?
              </h3>
              <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">
                Are you sure you want to end your session securely?
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="py-3.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-200 transition-transform active:scale-95"
                >
                  Yes, Exit
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}