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
    <div className="bg-white rounded-xl shadow-md p-3 mb-4 w-full">
      {/* Color Selector */}
      <div className="font-bold text-base mb-1">
        Color ({colors.length})
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full">
        {colors.map((color) => {
          const colorName = typeof color === "string" ? color : color.name;
          const colorImg =
            typeof color === "object" && color.img ? color.img : undefined;
          return (
            <button
              key={colorName}
              onClick={() => setSelectedColor(colorName)}
              className={`border rounded-xl p-2 flex flex-col items-center transition w-full ${
                selectedColor === colorName
                  ? "border-green-600 shadow-md bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {colorImg && (
                <img
                  src={colorImg}
                  alt={colorName}
                  className="w-full max-w-[64px] h-auto object-contain mb-1"
                />
              )}
              <span className="text-xs">{colorName}</span>
            </button>
          );
        })}
      </div>
      {/* Size Selector */}
      <div className="mt-4 font-bold text-base mb-1">
        Size ({sizeList.length})
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
        {sizeList.map((size) => {
          const sizeLabel = typeof size === "string" ? size : size.name || size;
          return (
            <button
              key={sizeLabel}
              onClick={() => setSelectedSize(sizeLabel)}
              className={`w-full px-2 py-2 border rounded-lg transition text-base font-semibold ${
                selectedSize === sizeLabel
                  ? "border-green-600 bg-green-100 shadow"
                  : "border-gray-200 bg-white"
              }`}
            >
              {sizeLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
