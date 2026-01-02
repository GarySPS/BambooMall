//src>pages>ProductGallery.js

import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaImages } from "react-icons/fa";

export default function ProductGallery({ gallery = [], title = "" }) {
  const [current, setCurrent] = useState(0);

  // Clamp current index if gallery changes
  useEffect(() => {
    if (gallery && current >= gallery.length) setCurrent(0);
  }, [gallery, current]);

  // Empty State
  if (!gallery || gallery.length === 0) {
    return (
      <div className="w-full aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 mb-6">
        <FaImages className="text-4xl mb-2 opacity-50" />
        <span className="text-sm font-semibold">No Preview Available</span>
      </div>
    );
  }

  const nextSlide = () => setCurrent((current + 1) % gallery.length);
  const prevSlide = () => setCurrent((current - 1 + gallery.length) % gallery.length);

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-6">
      {/* Main Image Container */}
      <div className="relative w-full aspect-square bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
        <img
          src={gallery[current]}
          alt={`${title} - View ${current + 1}`}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Navigation Arrows (Only if multiple images) */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); prevSlide(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-green-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-10"
            >
              <FaChevronLeft size={14} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-green-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-10"
            >
              <FaChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails (Replaces Dots) */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2 px-1 max-w-full no-scrollbar">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all duration-200 ${
                current === i
                  ? "border-green-600 shadow-md scale-105 ring-2 ring-green-100"
                  : "border-transparent opacity-60 hover:opacity-100 bg-gray-100"
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}