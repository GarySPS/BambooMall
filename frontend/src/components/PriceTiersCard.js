// src/components/PriceTiersCard.js
import React from "react";

export default function PriceTiersCard({ priceTiers = [] }) {
  if (!Array.isArray(priceTiers) || priceTiers.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-2 mb-3 shadow text-center text-gray-400">
        No price tiers available
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-xl flex flex-row justify-between items-center p-2 mb-3 shadow">
      {priceTiers.map((tier, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col items-center border-r last:border-none border-gray-200 px-2"
        >
          <div className="text-lg font-extrabold text-gray-900">
            ${tier.price.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{tier.label}</div>
        </div>
      ))}
    </div>
  );
}
