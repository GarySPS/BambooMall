//src>components>ProductGallery.js

import React, { useState } from "react";
// [REMOVED] FaSearchPlus import since we are removing the button

export default function ProductGallery({ gallery, title }) {
  const [active, setActive] = useState(0);
  // Ensure we always have an array
  const images = Array.isArray(gallery) && gallery.length > 0 ? gallery : ["/placeholder.png"];

  return (
    <div className="mb-8">
      {/* MAIN VIEWPORT */}
      <div className="relative group w-full bg-white border border-slate-200 rounded-lg overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
        
        {/* The Image Container - Fixed height for consistency */}
        <div className="h-[400px] md:h-[500px] w-full flex items-center justify-center p-6 bg-white">
           <img 
             src={images[active]} 
             alt={`Asset View ${active + 1}`} 
             className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500" 
           />
        </div>

        {/* Overlay Info (Top Right) - Kept this, it's useful */}
        <div className="absolute top-3 right-3 flex gap-2">
           <div className="bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-mono font-bold tracking-widest border border-white/10">
              IMG {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
           </div>
        </div>

        {/* [REMOVED] The "INSPECT" Hover Overlay is gone */}
      </div>

      {/* THUMBNAIL STRIP */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {images.map((img, i) => (
            <button 
               key={i} 
               onClick={() => setActive(i)}
               className={`relative w-20 h-20 flex-shrink-0 bg-white border rounded-md overflow-hidden transition-all duration-200 ${
                  active === i 
                  ? "border-blue-600 ring-2 ring-blue-600 ring-offset-1 opacity-100 grayscale-0" 
                  : "border-slate-200 hover:border-slate-400 opacity-60 hover:opacity-100 grayscale"
               }`}
            >
               <img src={img} alt="thumb" className="w-full h-full object-contain p-1" />
               {active === i && (
                  <div className="absolute inset-0 border-[3px] border-blue-600 rounded-md pointer-events-none" />
               )}
            </button>
         ))}
      </div>
    </div>
  );
}