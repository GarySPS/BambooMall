//src>pages>ProfilePage.js

import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { fetchProducts } from "../utils/api";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
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
  FaCheckCircle,
  FaTimesCircle
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

// ---- KYC Form ----
function KYCForm({ user, kycSelfie, setKycSelfie, kycId, setKycId, refreshUser }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function uploadKycFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/kyc", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  }

  async function handleKycSubmit(e) {
    e.preventDefault();
    if (!kycSelfie || !kycId) return;
    setSubmitting(true);
    try {
      const selfieUrl = await uploadKycFile(kycSelfie);
      const idUrl = await uploadKycFile(kycId);
      // Submit Selfie
      await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_id: user.short_id, name: "Selfie", doc_type: "selfie", doc_url: selfieUrl }),
      });
      // Submit ID
      await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_id: user.short_id, name: "ID Card", doc_type: "id_card", doc_url: idUrl }),
      });
      setDone(true);
      if (refreshUser) refreshUser();
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (user.kyc_status !== "approved" && !done) {
    return (
      <form className="flex flex-col gap-3 pt-2 items-center w-full max-w-sm" onSubmit={handleKycSubmit}>
        <div className="w-full space-y-3">
          <div className="space-y-1">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Upload Selfie</span>
             <CustomFileInput
              id="kyc-selfie-upload"
              onChange={e => setKycSelfie(e.target.files[0])}
              accept="image/*"
              disabled={submitting}
              label={kycSelfie ? kycSelfie.name : "Select Selfie"}
            />
          </div>
          <div className="space-y-1">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Upload ID Card</span>
             <CustomFileInput
              id="kyc-id-upload"
              onChange={e => setKycId(e.target.files[0])}
              accept="image/*"
              disabled={submitting}
              label={kycId ? kycId.name : "Select ID Card"}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!kycSelfie || !kycId || submitting}
          className={`mt-4 rounded-xl px-6 py-3 w-full text-white font-bold bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all ${
            (!kycSelfie || !kycId || submitting) ? "opacity-50 cursor-not-allowed grayscale" : ""
          }`}
        >
          {submitting ? "Processing..." : "Submit Verification"}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xs animate-pulse">
      {user.kyc_status === "pending" || done ? (
        <div className="flex items-center gap-2 text-xs text-amber-600 mt-2 text-center font-bold uppercase tracking-wider bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"/> Verification In Review
        </div>
      ) : null}
    </div>
  );
}

// ---- MAIN PROFILE PAGE ----
export default function ProfilePage() {
  const { user, wallet, refreshUser, logout } = useUser();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Toggles
  const [showKYC, setShowKYC] = useState(true);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Edit Profile
  const [profileAvatar, setProfileAvatar] = useState(null);

  // Change Password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  // Balance logic
  const totalBalance = (wallet?.usdt || 0) + (wallet?.alipay || 0) + (wallet?.wechat || 0);
  const currentVipTier = getVipTier(totalBalance);

  useEffect(() => {
    if (!user?.user_id) return setLoadingProducts(false);
    setLoadingProducts(true);
    fetchProducts(user.user_id)
      .then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, [user]);

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
              ${totalBalance.toLocaleString() || "0.00"}
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
              <div className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">
                  +12.5%
              </div>
           </div>
           <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { date: '01', balance: 14100 }, { date: '02', balance: 14250 },
                    { date: '03', balance: 14800 }, { date: '04', balance: 14650 },
                    { date: '05', balance: 15000 }, { date: '06', balance: 15120 },
                    { date: '07', balance: 15500 }, { date: '08', balance: 16000 },
                    { date: '09', balance: 15800 }, { date: '10', balance: 16200 },
                    { date: '11', balance: 16600 }, { date: '12', balance: 17000 },
                    { date: '13', balance: 19250 }, { date: '14', balance: 19537 }
                  ]}
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

        {/* KYC Verification Card - UPDATED */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
             <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-4 text-3xl shadow-sm">
                <FaShieldAlt />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Verification</h3>
             <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
               Complete your verification to unlock higher withdrawal limits and VIP benefits.
             </p>
             
             {/* Navigation Button */}
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

        {/* ---- REPLACEMENT START ---- */}
        
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
        
        {/* ---- REPLACEMENT END ---- */}

      </div>
    </div>
  );
}