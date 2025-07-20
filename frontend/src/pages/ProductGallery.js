import React, { useState } from "react";

export default function ProductGallery({ gallery = [], title = "" }) {
  const [current, setCurrent] = useState(0);

  if (!gallery || gallery.length === 0) {
    return (
      <div className="w-full flex items-center justify-center min-h-[280px] bg-white rounded-xl shadow mb-6">
        <span className="text-gray-400 text-lg font-bold">No product images</span>
      </div>
    );
  }

  // Clamp current index if gallery changes (rare edge case)
  React.useEffect(() => {
    if (current >= gallery.length) setCurrent(0);
  }, [gallery, current]);

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-xl shadow mb-6 min-h-[280px]">
      <div className="relative w-full flex items-center justify-center py-3">
        <img
          src={gallery[current]}
          alt={title}
          className="object-contain w-[280px] h-[280px] rounded-xl border shadow"
        />
        {gallery.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-green-100 rounded-full w-8 h-8 flex items-center justify-center shadow"
              onClick={() => setCurrent((current - 1 + gallery.length) % gallery.length)}
              tabIndex={-1}
            >
              <span className="text-lg">&#8592;</span>
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-green-100 rounded-full w-8 h-8 flex items-center justify-center shadow"
              onClick={() => setCurrent((current + 1) % gallery.length)}
              tabIndex={-1}
            >
              <span className="text-lg">&#8594;</span>
            </button>
          </>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 py-2">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-4 h-4 rounded-full border-2 ${
                current === i ? "bg-green-500 border-green-700" : "bg-gray-200 border-gray-300"
              }`}
              tabIndex={-1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
