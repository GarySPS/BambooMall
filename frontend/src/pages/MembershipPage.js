import React, { useMemo } from "react";
import vipTiers from "../data/vipTiers";
import AnimatedVipBadge from "../components/AnimatedVipBadge";
import { useUser } from "../contexts/UserContext";

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

  const currentTier =
    vipTiers.slice().reverse().find((t) => userBalance >= t.min) || vipTiers[0];

  return (
    <div className="min-h-screen flex flex-col items-center px-2 py-10">
      {/* Premium Headline */}
      <div className="mb-10 text-center">
        <div className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-200 shadow-md border-2 border-yellow-200">
          <span className="font-serif font-extrabold text-2xl sm:text-3xl text-yellow-800 tracking-wide flex items-center gap-2">
            <svg className="w-8 h-8 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            BambooMall VIP Membership
          </span>
        </div>
        <div className="mt-5 text-gray-600 text-base font-light">
          Unlock higher discounts and status instantly as your wallet balance increases.
        </div>
      </div>

      {/* VIP Tiers Grid - Fixed card height and stretch! */}
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl backdrop-blur-lg p-4 sm:p-10 mb-10 border border-yellow-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
          {vipTiers.map((tier) => (
<div
  key={tier.id}
  className={`relative rounded-2xl flex flex-col items-center px-8 py-8 border-4
    ${currentTier.id === tier.id
      ? "border-yellow-400 scale-105 shadow-yellow-200/70 ring-2 ring-yellow-300"
      : "border-zinc-200"
    }
    shadow-lg transition-transform duration-300 flex-1`}
  style={{
    height: 380,
    margin: "0 auto",
    width: "100%",
    backgroundImage: "url('/vip.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: currentTier.id === tier.id
      ? "0 8px 38px 0 #fbbf2440, 0 2px 6px 0 #d4af3740"
      : "0 6px 24px 0 #cbd5e133, 0 1.5px 3px 0 #e2e8f033"
  }}
>
              <div className="mb-2">
                <AnimatedVipBadge
                  level={tier.id}
                  active={currentTier.id === tier.id}
                  size={74}
                />
              </div>
              <div className={`text-2xl sm:text-3xl font-bold font-serif tracking-wider mb-1 ${currentTier.id === tier.id ? "text-yellow-700" : "text-zinc-700"}`}>
                {tier.name}
              </div>
              <div className="text-center text-gray-500 text-[15px] mb-4 max-w-xs">
                {tier.desc}
              </div>
              <div className="flex flex-col gap-2 items-center mb-2">
                <span className="font-mono text-base text-gray-600">
                  Balance: <span className="font-bold text-green-700">${tier.min.toLocaleString()}</span>+
                </span>
                <span className="text-green-800 font-semibold text-md flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-7.414 7.414a1 1 0 01-1.414 0l-3.414-3.414a1 1 0 111.414-1.414L8 11.586l6.707-6.707a1 1 0 011.414 0z"/></svg>
                  +{tier.discount}% Extra Discount
                </span>
              </div>
              {currentTier.id === tier.id && (
                <div className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-100 text-yellow-900 text-base font-bold shadow animate-bounce border-2 border-yellow-300 drop-shadow-lg">
                  Your Current Level
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-400 text-center max-w-lg mt-2">
        Your VIP badge and discount will upgrade automatically as your wallet balance changes.<br />
        <span className="text-yellow-700 font-semibold">Enjoy exclusive BambooMall privileges!</span>
      </div>
    </div>
  );
}
