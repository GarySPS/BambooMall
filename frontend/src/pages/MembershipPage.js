//src>pages>MembershipPage.js

import React, { useMemo } from "react";
import vipTiers from "../data/vipTiers";
import AnimatedVipBadge from "../components/AnimatedVipBadge";
import { useUser } from "../contexts/UserContext";
import { FaCrown, FaGem, FaBolt, FaHandshake, FaStar, FaCheckCircle, FaLock } from "react-icons/fa";

const FEATURES = [
  {
    icon: <FaStar className="text-yellow-400" />,
    title: "EXCLUSIVE",
    subtitle: "VIP CLUB",
    desc: "Unlock members-only deals and events. Your tier rises with your wallet balance.",
  },
  {
    icon: <FaGem className="text-emerald-400" />,
    title: "VALUABLE",
    subtitle: "CASHBACK",
    desc: "Extra discounts at every tier—auto applied, no extra work!",
  },
  {
    icon: <FaBolt className="text-amber-400" />,
    title: "LIMITLESS",
    subtitle: "EXPRESS WITHDRAWAL",
    desc: "Enjoy fast, admin-approved withdrawals at higher levels.",
  },
  {
    icon: <FaHandshake className="text-blue-400" />,
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
      Number(wallet.usdc || 0) + 
      Number(wallet.alipay || 0) +
      Number(wallet.wechat || 0)
    );
  }, [wallet]);

  // VIP Tiers sorted ascending (lowest min first)
  const sortedTiers = useMemo(() => {
     return vipTiers ? vipTiers.slice().sort((a, b) => a.min - b.min) : [];
  }, []);

  // Find current and next tier
  const currentTier = useMemo(() => {
    return sortedTiers.slice().reverse().find((t) => userBalance >= t.min) || sortedTiers[0] || { min: 0, id: 'MEMBER', name: 'Member', discount: 0 };
  }, [sortedTiers, userBalance]);

  const nextTier = useMemo(() => {
    return sortedTiers.find((t) => t.min > userBalance) || null;
  }, [sortedTiers, userBalance]);

  // Progress toward next tier
  const progress = useMemo(() => {
    if (!nextTier || !currentTier) return 1;
    if (nextTier.min <= currentTier.min) return 1;
    const p = (userBalance - currentTier.min) / (nextTier.min - currentTier.min);
    return Math.min(1, Math.max(0, p));
  }, [userBalance, currentTier, nextTier]);

  if (!currentTier) return null; // Safety

  return (
    <div className="min-h-screen w-full bg-[#151516] text-gray-100 font-sans relative overflow-x-hidden selection:bg-yellow-500/30">
      
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          background: `url('/membership.jpg') center top / cover no-repeat`
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-[#151516]/90 to-[#151516] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* --- Main VIP Club Card --- */}
        <div className="w-full max-w-3xl relative group">
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-yellow-500/30 rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center overflow-hidden">
                
                {/* Decorative background elements inside card */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 mb-6 transform transition-transform hover:scale-105 duration-500">
                    <AnimatedVipBadge level={currentTier.id} active size={100} />
                </div>

                <h1 className="relative z-10 text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-wider mb-2 drop-shadow-sm">
                    VIP CLUB
                </h1>
                <p className="relative z-10 text-zinc-400 text-sm md:text-base font-medium max-w-md mx-auto mb-8">
                    Unlock exclusive privileges, higher discounts, and priority support as your wealth grows.
                </p>

                {/* Progress Bar Section */}
                <div className="w-full max-w-lg bg-zinc-800/50 rounded-2xl p-6 border border-white/5 relative z-10">
                    <div className="flex justify-between items-end mb-2 text-sm font-bold">
                        <span className="text-yellow-500 flex items-center gap-2">
                            <FaCrown className="text-xs" /> {currentTier.name}
                        </span>
                        {nextTier ? (
                            <span className="text-zinc-500 text-xs uppercase tracking-wider">Next: {nextTier.name}</span>
                        ) : (
                            <span className="text-yellow-400 text-xs uppercase tracking-wider">Max Level Reached</span>
                        )}
                    </div>
                    
                    <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                        {/* Background Stripes */}
                         <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
                        
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress * 100}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-xs font-mono text-zinc-500">
                        <span>${userBalance.toLocaleString()}</span>
                        {nextTier ? (
                            <span>Target: <span className="text-zinc-300">${nextTier.min.toLocaleString()}</span></span>
                        ) : (
                            <span className="text-yellow-500">Unstoppable</span>
                        )}
                    </div>
                    
                    {nextTier && (
                        <div className="mt-2 text-center text-xs text-zinc-400">
                             Only <span className="text-yellow-400 font-bold">${(nextTier.min - userBalance).toLocaleString()}</span> more to unlock <span className="text-white">{nextTier.name}</span> benefits!
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-bold tracking-wide uppercase">
                    <FaCheckCircle /> Current Status: {currentTier.id}
                </div>
            </div>
        </div>

        {/* --- Features Grid --- */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            {FEATURES.map((f, i) => (
                <div key={i} className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/50 transition-colors group">
                    <div className="text-3xl mb-4 p-3 bg-zinc-950/50 rounded-xl w-fit border border-white/5 group-hover:scale-110 transition-transform">
                        {f.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{f.title}</h3>
                    <div className="text-yellow-500 text-xs font-bold tracking-wider uppercase mb-2">{f.subtitle}</div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
            ))}
        </div>

        {/* --- All Tiers Grid --- */}
        <div className="mt-20 w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-white mb-10 flex items-center justify-center gap-3">
                <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">Membership Tiers</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {sortedTiers.map((tier) => {
                    const isCurrent = currentTier.id === tier.id;
                    const isLocked = userBalance < tier.min;
                    
                    return (
                        <div 
                            key={tier.id}
                            className={`relative overflow-hidden rounded-3xl transition-all duration-300 group
                                ${isCurrent 
                                    ? "bg-gradient-to-b from-yellow-900/40 to-black border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)] scale-105 z-10" 
                                    : "bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-800/60"
                                }
                            `}
                        >
                            {/* Card Background Image */}
                            <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay group-hover:opacity-40 transition-opacity">
                                <img src="/vip.jpg" alt="" className="w-full h-full object-cover grayscale brightness-50" />
                            </div>
                            
                            <div className="relative z-10 p-6 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                     <div className={`p-3 rounded-2xl ${isCurrent ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {isCurrent ? <FaCrown className="text-xl" /> : isLocked ? <FaLock /> : <FaCheckCircle />}
                                     </div>
                                     <div className={`text-right ${isCurrent ? 'text-yellow-400' : 'text-zinc-500'}`}>
                                        <div className="text-xs uppercase font-bold tracking-wider">Entry Balance</div>
                                        <div className="font-mono font-bold text-lg">${tier.min.toLocaleString()}</div>
                                     </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className={`text-2xl font-bold font-serif ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>{tier.name}</h3>
                                    <div className={`text-sm ${isCurrent ? 'text-yellow-200' : 'text-zinc-500'}`}>{tier.id} Level</div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-4 min-h-[40px]">{tier.desc}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <FaCheckCircle className={`text-xs ${isCurrent ? 'text-yellow-500' : 'text-zinc-600'}`} />
                                            <span>
                                                <span className={`${isCurrent ? 'text-green-400 font-bold' : ''}`}>+{tier.discount}%</span> Fee Discount
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <FaCheckCircle className={`text-xs ${isCurrent ? 'text-yellow-500' : 'text-zinc-600'}`} />
                                            <span>Priority Support</span>
                                        </div>
                                    </div>
                                </div>

                                {isCurrent && (
                                    <div className="mt-6 w-full py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30 text-yellow-300 text-center text-xs font-bold uppercase tracking-wider animate-pulse">
                                        Active Plan
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="mt-16 text-center max-w-xl mx-auto px-4">
            <p className="text-zinc-500 text-sm">
                * VIP tiers and benefits are updated automatically based on your realtime wallet balance. 
                Discounts apply instantly to all eligible transactions.
            </p>
        </div>

      </div>
    </div>
  );
}