import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import AnimatedVipBadge from "../components/AnimatedVipBadge";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { fetchResaleHistory } from "../utils/api";

// --- VIP Logic ---
function getVipLevel(balance) {
  if (balance >= 40000) return "VIVIP";
  if (balance >= 20000) return "VIPX";
  if (balance >= 15000) return "VIP2";
  if (balance >= 10000) return "VIP1";
  if (balance >= 5000)  return "VIP0";
  return "MEMBER";
}

// --- Payment Data ---
const USDC_INFO = { qr: "/usdt.jpg", address: "TQsmC1Zow2wLAK5nrJXMqAnWAdhy1G8RiJ", network: "Tether TRC20" };
const ALIPAY_INFO = { qr: "/images/qr-alipay-demo.png", address: "188-118-2490-1180" };
const WECHAT_INFO = { qr: "/images/qr-wechat-demo.png", address: "uxwd_48uxi" };
// --- NEW: WISE DEMO INFO ---
const WISE_INFO = { qr: "/usdt.jpg", address: "wise.bamboomall@pay.com", note: "Name: BambooMall LLC" };
const TOP_UP_AMOUNT = 1000;

// --- Copyable Address Component ---
function DepositAddress({ address }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="text-base font-mono text-gray-800 bg-gray-50 rounded px-3 py-2 select-all shadow-sm w-full overflow-x-auto">
        {address}
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="ml-1 px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 font-bold text-xs transition"
        title="Copy Address"
        type="button"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// --- API helpers ---
async function fetchWalletFromBackend(user_id) {
  const res = await fetch(`${API_BASE_URL}/wallet/${user_id}`);
  if (!res.ok) throw new Error("Failed to fetch wallet");
  const data = await res.json();
  return data.wallet;
}
async function uploadDepositScreenshot(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload/deposit`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}
async function submitDepositToBackend({ user_id, amount, screenshot_url, note }) {
  const res = await fetch(`${API_BASE_URL}/wallet/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, amount, screenshot_url, note }),
  });
  if (!res.ok) throw new Error("Deposit API failed");
  return await res.json();
}
async function submitWithdrawToBackend({ user_id, amount, address, note }) {
  const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, amount, address, note }),
  });
  if (!res.ok) throw new Error("Withdraw API failed");
  return await res.json();
}

// --- Main Page ---
export default function BalancePage() {
  const { wallet, updateWallet, user } = useUser();
  const [resaleHistory, setResaleHistory] = useState([]);
  const [modalType, setModalType] = useState(null); // 'deposit' | 'withdraw' | null
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState(""); // For withdraw method
  const [depositAmount, setDepositAmount] = useState(TOP_UP_AMOUNT);
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [submitState, setSubmitState] = useState("idle"); 
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchWalletFromBackend(user.id)
        .then(wallet => updateWallet({ usdt: wallet.balance }))
        .catch(() => updateWallet({ usdt: 0 }));

      fetchResaleHistory(user.id)
        .then(data => setResaleHistory(Array.isArray(data.orders) ? data.orders : []))
        .catch(() => setResaleHistory([]));
    }
  }, [user?.id]);

  // Auto-close deposit modal after success
  useEffect(() => {
    if (submitState === "success" && modalType === "deposit") {
      const timer = setTimeout(() => {
        setModalType(null);
        setSelectedMethod(null);
        setSubmitState("idle");
        setDepositScreenshot(null);
        if (user?.id) {
          fetchWalletFromBackend(user.id)
            .then(wallet => updateWallet({ usdt: wallet.balance }))
            .catch(() => updateWallet({ usdt: 0 }));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [submitState, modalType, user, updateWallet]);

  // Modal handlers
  const handleDeposit = () => {
    setModalType("deposit");
    setSelectedMethod(null);
    setDepositAmount(TOP_UP_AMOUNT);
    setDepositScreenshot(null);
    setSubmitState("idle");
  };
  const handleWithdraw = () => {
    setModalType("withdraw");
    setWithdrawAmount("");
    setWithdrawAddress("");
    setSelectedWithdrawMethod("");
    setSubmitState("idle");
  };

  // Submit handlers
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("submitting");
    try {
      const screenshotUrl = await uploadDepositScreenshot(depositScreenshot);
      await submitDepositToBackend({
        user_id: user.id,
        amount: depositAmount,
        screenshot_url: screenshotUrl,
        note: selectedMethod,
      });
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
    }
  };
const handleWithdrawSubmit = async (e) => {
  e.preventDefault();
  setSubmitState("submitting");
  try {
    await submitWithdrawToBackend({
      user_id: user.id,
      amount: withdrawAmount,
      address: withdrawAddress,
      note: selectedWithdrawMethod,  // <--- use this for admin to know payment method
    });
    setSubmitState("success");
  } catch (err) {
    setSubmitState("error");
  }
};

  // --- Payment UI logic
  const balance = (wallet.usdt || 0) + (wallet.alipay || 0) + (wallet.wechat || 0);
  const vipLevel = getVipLevel(balance);

  // Select payment info
const PAYMENT_MAP = {
  "USDT(TRC)": USDC_INFO,
  "AliPay": ALIPAY_INFO,
  "WeChat": WECHAT_INFO,
  "Bank Transfer": WISE_INFO, // This is right!
};

const methodInfo = selectedMethod ? PAYMENT_MAP[selectedMethod] : null;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-x-hidden"
      style={{
        background: `url('/balance.png') center center / cover no-repeat, #151516`
      }}
    >
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 w-full max-w-lg px-4">
        {/* Balance Card */}
        <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-green-100 shadow-2xl rounded-3xl p-8 mt-10 mb-8 flex flex-col items-center transition-all">
          <div className="my-2 flex items-center justify-center">
            <AnimatedVipBadge level={vipLevel} active={true} size={54} />
          </div>
          <div className="font-medium text-gray-500 text-lg mb-1">Wallet</div>
          <div className="text-5xl font-extrabold text-green-600 tracking-tight drop-shadow mb-4">
            ${balance.toLocaleString()}
          </div>
          <div className="flex w-full gap-4 mt-3 mb-1">
            <button
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg font-extrabold shadow-lg hover:from-green-500 hover:to-emerald-600 transition-all focus:ring-4 focus:ring-green-200"
              onClick={handleDeposit}
            >
              Deposit
            </button>
            <button
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 text-lg font-extrabold shadow-lg hover:from-yellow-400 hover:to-yellow-600 transition-all focus:ring-4 focus:ring-yellow-100"
              onClick={handleWithdraw}
            >
              Withdraw
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-block px-2 py-1 rounded-xl bg-white/50 shadow text-emerald-800 font-bold">
              Membership
            </span>
            <span className="text-xs text-gray-500">VIP and discount upgrade instantly when balance changes.</span>
          </div>
        </div>

        {/* Resale History */}
        <div className="bg-white/80 backdrop-blur-2xl border border-emerald-100 shadow-xl rounded-3xl p-6">
          <h3 className="text-2xl font-bold text-green-800 mb-5 tracking-tight">Resale History</h3>
          {resaleHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-lg">
              No resale orders yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {resaleHistory.map((order) => (
                <li
                  key={order.id}
                  className="bg-gradient-to-br from-white to-emerald-50/80 rounded-2xl border border-gray-100 shadow flex flex-col sm:flex-row items-center gap-4 px-5 py-4 transition-all hover:shadow-lg"
                >
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                    {order.image ? (
                      <img src={order.image} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-4xl text-emerald-400 font-bold">🛒</span>
                    )}
                  </div>
                  <div className="flex-1 w-full flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg text-green-800">{order.title}</span>
                      {order.status === "sold" && (
                        <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold ml-2 animate-pulse">SOLD</span>
                      )}
                      {order.status === "refund_pending" && (
                        <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold ml-2">REFUND PENDING</span>
                      )}
                      {order.status === "selling" && (
                        <span className="px-2 py-0.5 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-semibold ml-2">IN PROGRESS</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : ""}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-base">
                      <span className="font-medium text-gray-800">
                        Amount: <span className="text-green-700">${order.amount}</span>
                      </span>
                      <span className="font-medium text-gray-600">
                        {order.status === "sold" ? (
                          <>Profit: <span className="text-emerald-600">+${order.earn ?? order.profit ?? 0}</span></>
                        ) : (
                          order.status === "refund_pending" ? (
                            <span className="text-red-500">Refund Pending</span>
                          ) : (
                            <span className="text-gray-400">Selling…</span>
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {modalType === "deposit" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-green-100 p-8 w-full max-w-md animate-fade-in">
            {!selectedMethod ? (
              <>
                <h3 className="text-xl font-extrabold text-green-800 mb-5 text-center tracking-tight">
                  Choose Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <button
                    onClick={() => setSelectedMethod("AliPay")}
                    className="flex flex-col items-center justify-center bg-white/70 rounded-2xl border border-green-200 shadow px-8 py-7 transition-all hover:shadow-xl hover:border-green-400 focus:outline-none active:scale-95"
                  >
                    <img src="/images/alipay.png" alt="AliPay" className="w-16 h-16 mb-3" />
                    <span className="font-extrabold text-green-800 text-lg tracking-wide">AliPay</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod("WeChat")}
                    className="flex flex-col items-center justify-center bg-white/70 rounded-2xl border border-green-200 shadow px-8 py-7 transition-all hover:shadow-xl hover:border-green-400 focus:outline-none active:scale-95"
                  >
                    <img src="/images/wechatpay.png" alt="WeChat Pay" className="w-16 h-16 mb-3" />
                    <span className="font-extrabold text-green-800 text-lg tracking-wide">WeChat Pay</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod("USDT(TRC)")}
                    className="flex flex-col items-center justify-center bg-white/70 rounded-2xl border border-blue-200 shadow px-8 py-7 transition-all hover:shadow-xl hover:border-blue-400 focus:outline-none active:scale-95"
                  >
                    <img src="/usdc.jpg" alt="USDT" className="w-16 h-16 mb-3" />
                    <span className="font-extrabold text-blue-800 text-lg tracking-wide">USDT (Crypto)</span>
                    <span className="text-sm text-blue-500 font-bold mt-1">+4% Bonus!</span>
                  </button>
                  {/* WISE */}
<button
  onClick={() => setSelectedMethod("Bank Transfer")}
  className="flex flex-col items-center justify-center bg-white/70 rounded-2xl border border-green-200 shadow px-8 py-7 transition-all hover:shadow-xl hover:border-green-400 focus:outline-none active:scale-95"
>
  <img src="/wise-logo.png" alt="Bank Transfer" className="w-16 h-16 mb-3" />
  <span className="font-extrabold text-green-800 text-lg tracking-wide">Bank Transfer</span>
  <span className="text-xs mt-1 text-emerald-700 font-semibold">Global (WISE)</span>
</button>

                </div>
                <button
                  className="w-full mt-7 bg-gray-100 text-gray-600 rounded-xl py-3 font-semibold hover:bg-gray-200 transition mt-5"
                  onClick={() => setModalType(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4 mt-2">
                <h3 className="text-xl font-bold text-green-800 mb-2 text-center">
                  {selectedMethod} Deposit
                </h3>
                <div className="flex flex-col items-center mb-2">
                  <img
                    src={methodInfo.qr}
                    alt={`${selectedMethod} QR`}
                    className="w-36 h-36 rounded-2xl border border-gray-200 shadow-sm mb-3"
                  />
                  {selectedMethod === "USDT(TRC)" && (
                    <div className="text-xs text-gray-500 mb-1">
                      Network: <span className="font-bold text-blue-700">{USDC_INFO.network}</span>
                    </div>
                  )}
                  {/* WISE account note */}
{selectedMethod === "Bank Transfer" && (
  <div className="mb-1 text-xs text-gray-700">
    <span className="font-semibold">Account Name:</span> BambooMall LLC
  </div>
)}

                  <DepositAddress address={methodInfo.address} />
                </div>
                <input
                  type="number"
                  min={1}
                  required
                  className="border-2 border-green-100 focus:border-green-400 outline-none rounded-xl p-3 w-full text-center text-lg font-bold mb-1 transition"
                  placeholder="Deposit Amount (USD)"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  disabled={submitState === "submitting" || submitState === "success"}
                />
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="w-full border border-gray-200 rounded-xl p-2 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700"
                  onChange={e => setDepositScreenshot(e.target.files[0])}
                  disabled={submitState === "submitting" || submitState === "success"}
                />
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-emerald-600 hover:to-green-800 text-white rounded-xl py-3 font-bold text-lg shadow transition disabled:opacity-50"
                    disabled={!depositScreenshot || !depositAmount || submitState === "submitting" || submitState === "success"}
                  >
                    {submitState === "submitting"
                      ? "Submitting..."
                      : submitState === "success"
                      ? "Submitted!"
                      : "Submit"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-bold hover:bg-gray-200 transition"
                    onClick={() => {
                      setSelectedMethod(null);
                      setDepositScreenshot(null);
                      setSubmitState("idle");
                    }}
                    disabled={submitState === "submitting" || submitState === "success"}
                  >
                    Back
                  </button>
                </div>
                {submitState === "success" && (
                  <div className="mt-2 text-green-600 font-bold text-center">
                    Deposit submitted!
                  </div>
                )}
                {submitState === "error" && (
                  <div className="mt-2 text-red-600 font-bold text-center">
                    Error. Please try again.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
{modalType === "withdraw" && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-yellow-100 p-8 w-full max-w-md animate-fade-in">
      <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-yellow-700 mb-2 text-center">
          Withdraw Request
        </h3>
        {/* Payment Method Dropdown */}
        <select
          className="border-2 border-yellow-100 focus:border-yellow-300 outline-none rounded-xl p-3 w-full text-lg font-bold mb-1 transition bg-white"
          required
          value={selectedWithdrawMethod}
          onChange={e => setSelectedWithdrawMethod(e.target.value)}
          disabled={submitState === "submitting" || submitState === "success"}
        >
          <option value="">Select Payment Method</option>
          <option value="USDT(TRC)">USDT (TRC20)</option>
          <option value="AliPay">AliPay</option>
          <option value="WeChat">WeChat</option>
          <option value="Bank Transfer">Bank Transfer (WISE)</option>
        </select>

        <input
          type="number"
          min={1}
          max={balance}
          required
          className="border-2 border-yellow-100 focus:border-yellow-300 outline-none rounded-xl p-3 w-full text-center text-lg font-bold mb-1 transition"
          placeholder="Withdraw Amount (USD)"
          value={withdrawAmount}
          onChange={e => setWithdrawAmount(e.target.value)}
          disabled={submitState === "submitting" || submitState === "success"}
        />

        <input
          type="text"
          required
          className="border-2 border-yellow-100 focus:border-yellow-300 outline-none rounded-xl p-3 w-full font-mono text-lg transition"
          placeholder={
            selectedWithdrawMethod === "USDT(TRC)" ? "Your USDT (TRC20) Wallet Address"
            : selectedWithdrawMethod === "AliPay" ? "Your AliPay Account/Number"
            : selectedWithdrawMethod === "WeChat" ? "Your WeChat ID"
            : selectedWithdrawMethod === "Bank Transfer" ? "Your Wise/Bank Details"
            : "Your Wallet/Recipient Address"
          }
          value={withdrawAddress}
          onChange={e => setWithdrawAddress(e.target.value)}
          disabled={submitState === "submitting" || submitState === "success"}
        />

        <div className="text-xs text-gray-500 mb-2">
          * Please double-check your address!
        </div>
        <div className="flex gap-3 mt-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white rounded-xl py-3 font-bold text-lg shadow transition disabled:opacity-50"
            disabled={
              !withdrawAmount ||
              !withdrawAddress ||
              !selectedWithdrawMethod ||
              submitState === "submitting" ||
              submitState === "success"
            }
          >
            {submitState === "submitting"
              ? "Submitting..."
              : submitState === "success"
              ? "Requested!"
              : "Submit"}
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-bold hover:bg-gray-200 transition"
            onClick={() => setModalType(null)}
            disabled={submitState === "submitting"}
          >
            Cancel
          </button>
        </div>
        {submitState === "success" && (
          <div className="mt-2 text-yellow-700 font-bold text-center">
            Withdraw request submitted!
          </div>
        )}
        {submitState === "error" && (
          <div className="mt-2 text-red-600 font-bold text-center">
            Error. Please try again.
          </div>
        )}
      </form>
    </div>
  </div>
)}

    </div>
  );
}
