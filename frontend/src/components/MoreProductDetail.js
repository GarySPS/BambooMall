// src/components/MoreProductDetail.js
import React from "react";

export default function MoreProductDetail({ keyAttributes = [] }) {
  if (!keyAttributes.length) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="font-bold mb-3 flex items-center justify-between">
        More product detail
        <span className="text-sm font-semibold text-blue-700 flex items-center gap-1">
          <span className="font-bold text-black">Key attributes</span>
          <span className="text-lg">{">"}</span>
        </span>
      </div>
      <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
        <tbody>
          {keyAttributes.map((attr, idx) => (
            <tr
              key={idx}
              className={`${
                idx % 2 === 1 ? "bg-gray-50" : "bg-white"
              } border-b last:border-0`}
            >
              <td className="py-2 px-3 font-medium text-gray-700 w-1/2">
                {attr.label}:
              </td>
              <td className="py-2 px-3 text-gray-900 w-1/2">
                {attr.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
