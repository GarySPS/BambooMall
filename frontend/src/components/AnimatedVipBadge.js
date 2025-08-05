import React from "react";

const tierColors = {
  MEMBER: { ring: "#9ca3af", glow: "#9ca3af" },
  VIP0: { ring: "#34d399", glow: "#10b981" },
  VIP1: { ring: "#3b82f6", glow: "#2563eb" },
  VIP2: { ring: "#a855f7", glow: "#9333ea" },
  VIP3: { ring: "#facc15", glow: "#eab308" },
  VIPX: { ring: "#f472b6", glow: "#ec4899" },
  VIVIP: { ring: "#fbbf24", glow: "#f59e0b" },
};

export default function AnimatedVipBadge({ level, active = true, size = 80 }) {
  const { ring, glow } = tierColors[level] || tierColors.MEMBER;

  return (
    <div
      className="relative vip-badge-animation"
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className="rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          width: size,
          height: size,
          border: `4px solid ${ring}`,
          boxShadow: `0 0 16px ${glow}, 0 0 32px ${glow}99`,
          animation: active ? "pulseGlow 2s infinite, rotateBadge 10s linear infinite" : "none",
          background: `radial-gradient(circle at center, ${ring}40, transparent 70%)`,
        }}
      >
        <img
          src="/logo192.png"  // Use your uploaded PNG
          alt="VIP"
          style={{
            width: '75%',
            height: '75%',
            objectFit: 'cover',
            borderRadius: "50%",
            boxShadow: '0 0 14px #fff8',
            zIndex: 10,
            background: "#fff", // fallback for transparent PNGs
          }}
        />
        {/* Sparkle */}
        {active && <div className="sparkle-effect" />}
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 16px ${glow}, 0 0 32px ${glow}99; }
          50% { box-shadow: 0 0 28px ${glow}, 0 0 56px ${glow}99; }
        }
        @keyframes rotateBadge {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sparkle-effect::before, .sparkle-effect::after {
          content: "";
          position: absolute;
          width: ${size / 8}px;
          height: ${size / 8}px;
          background: #fff;
          border-radius: 50%;
          top: 15%;
          left: 15%;
          animation: sparkle 3s infinite ease-in-out alternate;
        }
        .sparkle-effect::after {
          top: 75%;
          left: 75%;
          animation-delay: 1.5s;
        }
        @keyframes sparkle {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
