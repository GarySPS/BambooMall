// ---- Google Fonts (add to your public/index.html <head>):
// <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">

import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { fetchProducts } from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

// ---- VIP Tier Calculation (sync with Membership/Balance) ----
function getVipTier(balance) {
  if (balance >= 40000) return "VIVIP";
  if (balance >= 20000) return "VIPX";    // Adjust if you use VIP3 etc.
  if (balance >= 15000) return "VIP2";
  if (balance >= 10000) return "VIP1";
  if (balance >= 5000)  return "VIP0";
  return "Member";
}

// ---- Animated VIP Badge BELOW avatar ----
function AnimatedVIPBadge({ tier = "Member" }) {
  const styleMap = {
    Member: "from-green-300 to-green-500 text-green-800",
    VIP0: "from-green-200 to-green-400 text-green-700",
    VIP1: "from-blue-200 to-blue-400 text-blue-700",
    VIP2: "from-purple-200 to-purple-400 text-purple-700",
    VIPX: "from-yellow-200 to-yellow-400 text-yellow-800",
    VIVIP: "from-pink-300 to-pink-500 text-pink-900",
  };
  const style = styleMap[tier] || styleMap.Member;
  return (
    <div className="relative flex justify-center" style={{marginTop: 8}}>
      <div className={`
        animate-vip-bounce
        bg-gradient-to-r ${style} 
        font-bold px-5 py-1 rounded-full shadow-xl border-2 border-white text-xs tracking-wide select-none font-mono
      `}
        style={{
          minWidth: 80,
          letterSpacing: 1.5,
          boxShadow: "0 6px 22px 0 rgba(0,0,0,0.07)"
        }}>
        {tier}
      </div>
      <style>{`
        @keyframes vip-bounce {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-5px);}
        }
        .animate-vip-bounce { animation: vip-bounce 1.1s infinite; }
      `}</style>
    </div>
  );
}

// ---- Blue Verified KYC Badge ----
function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center ml-2"
      title="Verified"
      style={{ verticalAlign: 'middle' }}
    >
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="11" fill="#2563eb" />
        <path d="M7.5 11.5l2.2 2L15 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

// ---- Custom File Input Button ----
function CustomFileInput({ id, onChange, accept, disabled }) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onChange}
        className="opacity-0 absolute left-0 top-0 w-full h-full cursor-pointer z-10"
        style={{ width: "100%", height: 46 }}
      />
      <label
        htmlFor={id}
        className={`flex items-center justify-center border-2 border-green-300 rounded-xl bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold py-3 px-4 cursor-pointer w-full transition hover:from-green-100 hover:to-green-200 shadow
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
        style={{
          height: 46,
          minWidth: 140,
        }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="mr-2"><path d="M6.5 13.5L9 16l4.5-4.5m0-3.5A5.5 5.5 0 1111 3.5a5.5 5.5 0 013.5 9.5z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {disabled ? "Uploading..." : "Choose File"}
      </label>
    </div>
  );
}

// ---- KYC Upload Helper ----
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

      await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          short_id: user.short_id,
          name: "Selfie",
          doc_type: "selfie",
          doc_url: selfieUrl,
        }),
      });
      await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          short_id: user.short_id,
          name: "ID Card",
          doc_type: "id_card",
          doc_url: idUrl,
        }),
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
      <form className="flex flex-col gap-3 pt-2 items-center w-full max-w-xs" onSubmit={handleKycSubmit}>
        <label className="flex flex-col gap-2 w-full">
          <span className="text-sm font-medium text-gray-700">Upload Selfie</span>
          <CustomFileInput
            id="kyc-selfie-upload"
            onChange={e => setKycSelfie(e.target.files[0])}
            accept="image/*"
            disabled={submitting}
          />
        </label>
        <label className="flex flex-col gap-2 w-full">
          <span className="text-sm font-medium text-gray-700">Upload ID Card</span>
          <CustomFileInput
            id="kyc-id-upload"
            onChange={e => setKycId(e.target.files[0])}
            accept="image/*"
            disabled={submitting}
          />
        </label>
        <button
          type="submit"
          disabled={!kycSelfie || !kycId || submitting}
          className={`mt-2 rounded-xl px-5 py-2 w-full text-white font-bold bg-gradient-to-r from-green-500 to-green-700 shadow hover:scale-105 transition ${
            (!kycSelfie || !kycId || submitting) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Verification Processing..." : "Submit"}
        </button>
      </form>
    );
  }

  // ---- Only Verification Processing... for pending/just submitted
  return (
    <div className="flex flex-col items-center w-full max-w-xs">
      {user.kyc_status === "pending" || done ? (
        <div className="text-xs text-yellow-500 mt-2 text-center font-semibold">
          Verification Processing...
        </div>
      ) : null}
    </div>
  );
}

// ---- MAIN PROFILE PAGE ----
export default function ProfilePage() {
  const { user, wallet, refreshUser } = useUser();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Toggles
  const [showKYC, setShowKYC] = useState(true);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  // KYC Uploads
  const [kycSelfie, setKycSelfie] = useState(null);
  const [kycId, setKycId] = useState(null);

  // Edit Profile
  const [profileAvatar, setProfileAvatar] = useState(null);

  // Change Password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const navigate = useNavigate();

  // Calculate **total** wallet balance for real VIP logic
  const totalBalance =
    (wallet?.usdt || 0) +
    (wallet?.alipay || 0) +
    (wallet?.wechat || 0);

  // This is the true, real-time VIP tier
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
      <div className="min-h-screen flex items-center justify-center bg-[#F2E5C0]">
        <div className="text-red-500 text-lg font-bold">Not logged in.</div>
      </div>
    );
  }

  // Font classes
  const displayFont = "font-[Montserrat] font-extrabold";
  const mainFont = "font-[Inter]";

  return (
      <div className="min-h-screen px-4 pt-3 pb-8 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-10">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl px-9 pt-10 pb-7 flex flex-col items-center relative">
          <div className="flex flex-col items-center">
            <img
              src={user.avatar || "/images/profile-demo.jpg"}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-green-200 object-cover shadow-xl"
              style={{ marginBottom: 12 }}
            />
            <AnimatedVIPBadge tier={currentVipTier} />
          </div>
          <div className="flex flex-row items-center justify-center mt-4 mb-1">
            <h3 className={`text-2xl text-green-900 ${displayFont} text-center tracking-wide`}>
              {user.username || user.full_name || user.email}
            </h3>
            {user.kyc_status === "approved" && <VerifiedBadge />}
          </div>
          <div className="mb-2 text-center flex flex-col gap-2">
            <span className="text-gray-500 text-sm">{user.email}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-medium text-gray-600 text-base">VIP Tier:</span>
            <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm">
              {currentVipTier}
            </span>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-white rounded-3xl shadow-xl p-7 w-full flex flex-col items-center mb-2">
          <span className="text-lg font-medium text-gray-400 mb-1 uppercase tracking-wider">Wallet Balance</span>
          <span className={`text-4xl font-extrabold text-black mb-6 ${displayFont}`}>
            ${totalBalance.toLocaleString() || "0.00"}
          </span>
          <div className="flex gap-5 w-full max-w-xs justify-center">
            <button
              onClick={() => navigate("/balance")}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-900 text-white font-extrabold text-lg rounded-2xl py-3 shadow transition-all duration-150"
              style={{ minWidth: 120 }}
            >
              Deposit
            </button>
            <button
              onClick={() => navigate("/balance")}
              className="flex-1 bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-700 text-black font-extrabold text-lg rounded-2xl py-3 shadow transition-all duration-150"
              style={{ minWidth: 120 }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Overview Chart Card */}
<div className="bg-white rounded-2xl shadow-lg px-8 py-6 w-full flex flex-col items-center mb-6">
  <div className="w-full flex flex-row items-center justify-between mb-3">
    <span className="text-lg font-bold text-gray-700 tracking-wide">Balance Overview</span>
    <span className="text-xs text-gray-400">Last 14 days</span>
  </div>
  <div className="w-full flex items-center justify-center" style={{ minHeight: 180 }}>
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={[
          { date: '07-01', balance: 14100 },
          { date: '07-02', balance: 14250 },
          { date: '07-03', balance: 14800 },
          { date: '07-04', balance: 14650 },
          { date: '07-05', balance: 15000 },
          { date: '07-06', balance: 15120 },
          { date: '07-07', balance: 15500 },
          { date: '07-08', balance: 16000 },
          { date: '07-09', balance: 15800 },
          { date: '07-10', balance: 16200 },
          { date: '07-11', balance: 16600 },
          { date: '07-12', balance: 17000 },
          { date: '07-13', balance: 19250 },
          { date: '07-14', balance: 19537.4 }
        ]}
        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor="#34d399" stopOpacity={0.8}/>
            <stop offset="90%" stopColor="#f3f4f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          contentStyle={{ borderRadius: 12, background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 2px 10px #0002" }}
          labelStyle={{ fontWeight: "bold", color: "#34d399" }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorBalance)"
          strokeWidth={3}
          dot={{ r: 2, stroke: "#22c55e", strokeWidth: 2, fill: "#fff" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

        {/* KYC Card */}
        <div className="bg-white rounded-2xl shadow-lg flex justify-center items-center p-0 w-full min-h-[260px]">
          <div className="flex flex-col items-center py-7 w-full">
            {/* SVG Shield Icon */}
            <svg width="46" height="46" fill="none" viewBox="0 0 44 44" className="mb-2">
              <defs>
                <linearGradient id="KYCblue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#46b6ff"/>
                  <stop offset="100%" stopColor="#3776f6"/>
                </linearGradient>
              </defs>
              <path d="M22 4C29 6 36 7 36 16c0 10-8.5 19-14 22C14.5 35 8 26 8 16c0-9 7-10 14-12z" fill="url(#KYCblue)" stroke="#2563eb" strokeWidth="2"/>
              <path d="M18 19l4 4 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-2xl font-extrabold text-gray-800 font-[Montserrat] mb-1 tracking-wide text-center">
              KYC Verification
            </div>
            {/* Status Badge */}
            <div className="flex flex-col items-center gap-2 mt-2">
              {user.kyc_status === "pending" ? (
                <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-xl text-xs font-bold flex items-center gap-1 animate-pulse">
                  <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#fbbf24" /><path d="M10 6v4l2 2" stroke="#fff" strokeWidth="2"/></svg>
                  Pending Review
                </div>
              ) : user.kyc_status === "approved" ? (
                <>
                  <div className="bg-green-100 text-green-700 px-4 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#22c55e" /><path d="M6 11l3 3 5-5" stroke="#fff" strokeWidth="2"/></svg>
                    KYC Approved
                  </div>
                  <div className="text-green-600 text-sm font-semibold mt-1 mb-1">You are fully verified.</div>
                </>
              ) : (
                <div className="bg-gray-100 text-gray-700 px-4 py-1 rounded-xl text-xs font-bold">
                  Not Verified
                </div>
              )}
            </div>
            {/* KYC Form */}
            {showKYC && (
              <div className="w-full flex justify-center mt-3">
                <KYCForm
                  user={user}
                  kycSelfie={kycSelfie}
                  setKycSelfie={setKycSelfie}
                  kycId={kycId}
                  setKycId={setKycId}
                  refreshUser={refreshUser}
                />
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer select-none justify-center"
            onClick={() => setShowAvatar((s) => !s)}
          >
            <span className="text-green-400 text-2xl">🖼️</span>
            <span className="text-lg font-bold text-gray-800 text-center">Edit Profile</span>
          </div>
          {showAvatar && (
            <form className="flex flex-col gap-3 pt-2 items-center">
              <label className="flex flex-col gap-2 w-full max-w-xs">
                <span className="text-sm font-medium text-gray-700">Upload Profile Photo</span>
                <CustomFileInput
                  id="profile-avatar-upload"
                  onChange={e => setProfileAvatar(e.target.files[0])}
                  accept="image/*"
                  disabled={false}
                />
              </label>
              <button
                type="submit"
                className="mt-2 rounded-xl px-5 py-2 w-full max-w-xs text-white font-bold bg-gradient-to-r from-green-400 to-green-700 shadow hover:scale-105 transition"
              >
                Submit
              </button>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer select-none justify-center"
            onClick={() => setShowPassword((s) => !s)}
          >
            <span className="text-orange-400 text-2xl">🔒</span>
            <span className="text-lg font-bold text-gray-800 text-center">Change Password</span>
          </div>
          {showPassword && (
            <form className="flex flex-col gap-3 pt-2 items-center">
              <input
                type="password"
                placeholder="Current Password"
                className="border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 w-full max-w-xs"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                className="border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 w-full max-w-xs"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 w-full max-w-xs"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
              />
              <button
                type="submit"
                className="mt-2 rounded-xl px-5 py-2 w-full max-w-xs text-white font-bold bg-gradient-to-r from-orange-400 to-orange-600 shadow hover:scale-105 transition"
              >
                Submit
              </button>
            </form>
          )}
        </div>

{/* Login Card */}
<div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full gap-4">
  <div className="flex items-center gap-2 justify-center select-none">
    <span className="text-green-600 text-2xl">🔑</span>
    <span className="text-lg font-bold text-gray-800 text-center">Login to your account</span>
  </div>
  <button
    className="w-full max-w-xs bg-green-600 text-white font-bold rounded-xl py-3 hover:bg-green-700 shadow transition mx-auto mt-3"
    onClick={() => navigate("/login")}
  >
    Login
  </button>
</div>


     </div>
    </div>
  );
}
