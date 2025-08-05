import React, { useMemo } from "react";
import vipTiers from "../data/vipTiers";
import AnimatedVipBadge from "../components/AnimatedVipBadge";
import { useUser } from "../contexts/UserContext";

const FEATURES = [
  {
    icon: "🌟",
    title: "EXCLUSIVE",
    subtitle: "VIP CLUB",
    desc: "Unlock members-only deals and events. Your tier rises with your wallet balance.",
  },
  {
    icon: "💸",
    title: "VALUABLE",
    subtitle: "CASHBACK",
    desc: "Extra discounts at every tier—auto applied, no extra work!",
  },
  {
    icon: "⚡",
    title: "LIMITLESS",
    subtitle: "EXPRESS WITHDRAWAL",
    desc: "Enjoy fast, admin-approved withdrawals at higher levels.",
  },
  {
    icon: "🤝",
    title: "COMMUNITY",
    subtitle: "VIP SUPPORT",
    desc: "Get early access, new launches, and special support.",
  }
];

export default function MembershipPage() {
  const { wallet } = useUser();

  const userBalance = useMemo(() => {
    if (!wallet) return 0;
    return (
      Number(wallet.usdt || 0) +
      Number(wallet.alipay || 0) +
      Number(wallet.wechat || 0)
    );
  }, [wallet]);

  // VIP Tiers sorted ascending (lowest min first)
  const sortedTiers = vipTiers.slice().sort((a, b) => a.min - b.min);

  // Find current and next tier
  const currentTier =
    sortedTiers.slice().reverse().find((t) => userBalance >= t.min) || sortedTiers[0];
  const nextTier =
    sortedTiers.find((t) => t.min > userBalance) || null;

  // Progress toward next tier
  const progress =
    nextTier && nextTier.min > currentTier.min
      ? Math.min(1, (userBalance - currentTier.min) / (nextTier.min - currentTier.min))
      : 1;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-x-hidden"
      style={{
        background: `url('/membership.jpg') center center / cover no-repeat, #19191d`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70 z-0" />

      {/* VIP Club Card */}
      <div className="relative z-10 w-full max-w-2xl mx-auto rounded-3xl shadow-2xl bg-black/80 p-8 pb-6 flex flex-col items-center border border-yellow-900"
        style={{
          boxShadow: "0 4px 48px 0 #fbbf2440, 0 2px 6px 0 #d4af3740"
        }}
      >
        {/* Crown or Badge */}
        <div className="flex justify-center mb-3">
          <AnimatedVipBadge level={currentTier.id} active size={92} />
        </div>

        {/* Headline */}
        <div className="text-3xl font-black font-serif text-yellow-200 text-center tracking-wide mb-2">
          BambooMall <span className="text-yellow-400">VIP Club</span>
        </div>
        <div className="text-gray-300 text-center mb-6 text-sm font-light">
          Unlock higher discounts and exclusive benefits as your wallet grows.
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-2 mt-2">
          <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
            <span>${currentTier.min.toLocaleString()}</span>
            {nextTier ? (
              <span>
                ${userBalance.toLocaleString()} / ${nextTier.min.toLocaleString()} &nbsp;
                <span className="text-yellow-300">{`$${(nextTier.min - userBalance).toLocaleString()} left`}</span>
              </span>
            ) : (
              <span className="text-yellow-400 font-bold">MAX VIP</span>
            )}
          </div>
          <div className="bg-gray-700 rounded-full h-4 shadow-inner relative">
            <div
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-4 rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 font-bold text-sm">
            <span className="text-zinc-400 italic flex items-center gap-2">
              LVL {currentTier.id}
            </span>
            <span className="text-yellow-200 italic flex items-center gap-2">
              {nextTier ? `LVL ${nextTier.id}` : "TOP VIP"}
            </span>
          </div>
        </div>

        {/* Tier Info */}
        <div className="mt-5 flex flex-col items-center">
          <div className="text-yellow-300 text-xl font-bold mb-1">
            {currentTier.name}
          </div>
          <div className="text-gray-300 text-base mb-1">
            <span className="font-semibold">+{currentTier.discount}%</span> Extra Discount
          </div>
          <div className="text-gray-400 text-xs text-center max-w-sm mb-3">
            {currentTier.desc}
          </div>
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-100 text-yellow-900 text-sm font-bold shadow border-2 border-yellow-200 drop-shadow-lg">
            Your Current Level
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 mt-8 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl bg-gradient-to-br from-yellow-300/80 via-yellow-100 to-yellow-400/60 p-5 shadow-lg border border-yellow-200 flex flex-col items-start"
          >
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="uppercase text-xs font-extrabold text-yellow-900 tracking-wider mb-1">{f.title}</div>
            <div className="text-lg font-bold text-yellow-800 mb-1">{f.subtitle}</div>
            <div className="text-zinc-700 text-xs">{f.desc}</div>
          </div>
        ))}
      </div>

{/* Membership Levels Card Grid */}
<div className="relative z-10 mt-12 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
  {sortedTiers.map((tier) => (
    <div
      key={tier.id}
      className={`flex flex-col items-center justify-center p-6 rounded-3xl border-4 shadow-xl transition-transform duration-300 relative overflow-hidden
        ${currentTier.id === tier.id
          ? "border-yellow-400 scale-105 shadow-yellow-400/70 ring-2 ring-yellow-300"
          : "border-gray-600"
        }`}
      style={{
        background: `url('/vip.jpg') center center / cover no-repeat`,
        minHeight: 320,
      }}
    >
      {/* Premium Glass Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Logo Badge */}
      <div className="relative z-10 flex justify-center mb-3">
        <img
          src="/vip1.png"
          alt="VIP Logo"
          className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white"
          style={{ boxShadow: `0 0 16px ${currentTier.id === tier.id ? '#facc15' : '#ffffff88'}` }}
        />
      </div>

      {/* Tier Name */}
      <div className={`relative z-10 text-2xl font-serif font-bold tracking-wide mb-2 
        ${currentTier.id === tier.id ? "text-yellow-300" : "text-gray-100"}`}>
        {tier.name}
      </div>

      {/* Description */}
      <div className="relative z-10 text-gray-300 text-center text-sm mb-4">
        {tier.desc}
      </div>

      {/* Balance & Discount */}
      <div className="relative z-10 flex flex-col items-center text-base font-semibold space-y-1">
        <div>
          <span className="text-gray-400">Balance: </span>
          <span className="text-green-300 font-bold">${tier.min.toLocaleString()}+</span>
        </div>
        <div className="text-yellow-200 font-bold">
          +{tier.discount}% Extra Discount
        </div>
      </div>

      {/* Current Tier Badge */}
      {currentTier.id === tier.id && (
        <div className="relative z-10 mt-3 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 font-bold text-xs shadow-lg animate-pulse">
          ⭐ Your Level
        </div>
      )}
    </div>
  ))}
</div>

      <div className="relative z-10 text-sm text-gray-400 text-center max-w-lg mt-10">
        <span className="text-yellow-400 font-semibold">Enjoy exclusive BambooMall privileges!</span>
        <br />
        Your VIP badge and discount update automatically as your wallet balance changes.
      </div>
    </div>
  );
}
