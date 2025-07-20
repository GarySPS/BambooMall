// components/AnimatedVipBadge.js
import React from "react";

const tierColors = {
  MEMBER: {
    bg: "linear-gradient(135deg, #f0f0f0 70%, #e0e7ef 100%)",
    ring: "#cbd5e1",
    text: "#64748b",
  },
  VIP0: {
    bg: "linear-gradient(135deg, #bcf0d4 0%, #a7f3d0 100%)",
    ring: "#4ade80",
    text: "#047857",
  },
  VIP1: {
    bg: "linear-gradient(135deg, #c7d2fe 0%, #60a5fa 100%)",
    ring: "#60a5fa",
    text: "#1e40af",
  },
  VIP2: {
    bg: "linear-gradient(135deg, #f5d0fe 0%, #a21caf 100%)",
    ring: "#a21caf",
    text: "#7c3aed",
  },
  VIP3: {
    bg: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
    ring: "#eab308",
    text: "#b45309",
  },
  VIPX: {
    bg: "linear-gradient(90deg, #fbbf24 0%, #f472b6 80%, #818cf8 100%)",
    ring: "#fbbf24",
    text: "#fff",
    superGlow: true,
  },
  VIVIP: {
    bg: "linear-gradient(90deg, #fbbf24 0%, #ec4899 60%, #a78bfa 100%)",
    ring: "#fbbf24",
    text: "#fff",
    superGlow: true,
  },
};

export default function AnimatedVipBadge({ level, active = true, size = 64 }) {
  const { bg, ring, text, superGlow } = tierColors[level] || tierColors.MEMBER;

  // Show "M" for MEMBER, otherwise use full tier code
  const label = level === "MEMBER" ? "M" : level;

  return (
    <div
      className={`relative premium-vip-badge ${active ? "active" : ""} ${superGlow ? "super-glow" : ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        boxShadow: `0 0 0 3px ${ring}99, 0 0 16px 3px ${ring}66`,
        border: `3.5px solid ${ring}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: text,
        fontWeight: 900,
        fontSize: level === "MEMBER" ? size * 0.43 : size * 0.32, // Make "M" a bit bigger
        letterSpacing: 1.2,
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow .23s cubic-bezier(.4,2,.45,1)",
        userSelect: "none",
      }}
    >
      <span className="vip-shine" />
      {superGlow && <span className="vip-badge-sparkle" />}
      <span style={{ zIndex: 2, fontWeight: 900, textShadow: "0 0 10px #fff8" }}>
        {label}
      </span>
    </div>
  );
}
