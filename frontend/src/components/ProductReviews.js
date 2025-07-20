// src/components/ProductReviews.js
import React from "react";

export default function ProductReviews({ reviews, today }) {
  return (
    <ul className="space-y-4">
      {reviews &&
        reviews.map((review, idx) => (
          <li
            key={idx}
            className="bg-white rounded-xl shadow flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4"
          >
            {/* Left: Avatar & country */}
            <div className="flex flex-col items-center min-w-[56px]">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-lg text-blue-700">
                {review.user?.[0]?.toUpperCase?.() || "U"}
              </div>
              <div className="mt-1 text-xs flex items-center gap-1 text-gray-400">
                <span>{review.countryFlag || "🌏"}</span>
                <span>{review.country || "Global"}</span>
              </div>
              <div className="text-xs text-gray-400">
                {review.date || today}
              </div>
            </div>
            {/* Right: Content */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{review.user}</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-semibold">
                  Verified purchase
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      viewBox="0 0 20 20"
                      fill={
                        i <= Math.round(review.rating)
                          ? "#FFD700"
                          : "#E5E7EB"
                      }
                      className="w-4 h-4"
                    >
                      <polygon points="10,2 13,7.5 19,8 14.5,12 15.5,18 10,15 4.5,18 5.5,12 1,8 7,7.5" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {Number(review.rating).toFixed(1)}
                </span>
              </div>
              <div className="mb-1 text-gray-800">{review.text}</div>
            </div>
          </li>
        ))}
    </ul>
  );
}
