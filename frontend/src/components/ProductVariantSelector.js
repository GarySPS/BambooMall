// src/components/ProductVariantSelector.js
import React from "react";

export default function ProductVariantSelector({
  colors = [],
  sizeList = [],
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
}) {
  return (
    <div className="mb-6 space-y-4">
      
      {/* "Batch Variant" (Color) */}
      {colors.length > 0 && (
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Select Batch Variant / SKU
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {colors.map((color) => {
              const name = typeof color === "string" ? color : color.name;
              const isSelected = selectedColor === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedColor(name)}
                  className={`px-3 py-2 text-left text-xs font-mono border rounded transition-all flex items-center gap-2 ${
                    isSelected 
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600" 
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-600" : "bg-slate-300"}`} />
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* "Unit Specification" (Size) */}
      {sizeList.length > 0 && (
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Unit Specification
          </label>
          <div className="flex flex-wrap gap-2">
            {sizeList.map((size) => {
              const label = typeof size === "string" ? size : size.name;
              const isSelected = selectedSize === label;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedSize(label)}
                  className={`min-w-[40px] px-3 py-2 text-center text-xs font-bold border rounded transition-all ${
                    isSelected
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}