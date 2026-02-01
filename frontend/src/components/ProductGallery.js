//src>components>ProductGallery.js

import React, { useState } from "react";

export default function ProductGallery({ gallery, title }) {
  const [active, setActive] = useState(0);
  const images = Array.isArray(gallery) && gallery.length > 0 ? gallery : ["/placeholder.png"];

  return (
    <div className="mb-6">
      {/* Main Viewport */}
      <div className="w-full aspect-[4/3] bg-white border border-slate-200 rounded-lg flex items-center justify-center p-4 overflow-hidden mb-2 relative">
         <img 
            src={images[active]} 
            alt="Asset View" 
            className="w-full h-full object-contain mix-blend-multiply" 
         />
         <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-mono">
            IMG {active + 1}/{images.length}
         </div>
      </div>

      {/* Thumbnails (Filmstrip) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         {images.map((img, i) => (
            <button 
               key={i} 
               onClick={() => setActive(i)}
               className={`w-16 h-16 border rounded flex-shrink-0 bg-white p-1 transition-all ${
                  active === i ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-400"
               }`}
            >
               <img src={img} alt="thumb" className="w-full h-full object-contain" />
            </button>
         ))}
      </div>
    </div>
  );
}