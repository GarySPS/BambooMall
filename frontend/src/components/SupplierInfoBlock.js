// src/components/SupplierInfoBlock.js
import React from "react";

export default function SupplierInfoBlock({ supplier, minOrder, factoryWebsite, factoryUrl }) {
  return (
    <div
      className="rounded-xl shadow-lg p-4 mb-4"
      style={{
        background: "linear-gradient(135deg, rgba(59,130,246,0.11) 60%, rgba(206,232,255,0.32) 100%)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        border: "1px solid rgba(59,130,246,0.11)"
      }}
    >
      <div className="text-lg font-bold text-black mb-1">
        Supplier: <span className="font-semibold">{supplier}</span>
      </div>
      <div className="flex flex-wrap gap-4 text-base text-black/80 mb-1">
        <span>
          <span className="font-semibold">Min. Order:</span>{" "}
          {minOrder || 1} pcs
        </span>
        <span>
          <span className="font-semibold">Country:</span>
          <span className="inline-block align-middle ml-1 mr-1">
            <img
              src="/flags/cn.svg"
              alt="China Flag"
              className="w-5 h-5 inline"
            />
          </span>
          <span className="font-bold text-black">Made in China</span>
        </span>
      </div>
      <div className="mb-1">
        <span className="font-semibold text-black/80">Factory:</span>
        <a
          href={factoryWebsite || factoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline ml-1 hover:text-blue-900 transition"
        >
          {(factoryWebsite || factoryUrl || "").replace(/^https?:\/\//, "")}
        </a>
      </div>
    </div>
  );
}
