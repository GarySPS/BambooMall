//src>pages>CartPage.js

import React from "react";
import { fetchCartOrders } from "../utils/api";
import { useUser } from "../contexts/UserContext";
import { requestRefund } from "../utils/api";
import { useLocation } from "react-router-dom";
import { getProductImage } from "../utils/image";
import { toast } from "react-toastify";
import { FaStore, FaBoxOpen, FaReceipt, FaSpinner } from "react-icons/fa";

const MARKETPLACES = [
  "Alibaba",
  "Temu",
  "Amazon",
  "Lazada",
  "Shopee",
  "AliExpress",
  "eBay",
  "Walmart",
  "JD.com",
  "Rakuten",
];

// Assign a consistent marketplace for each order (uses order.id)
function getMarketplaceForOrder(orderId) {
  if (!orderId) return MARKETPLACES[0];
  // Convert orderId to integer sum of char codes for consistent assignment
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash += orderId.charCodeAt(i);
  }
  return MARKETPLACES[hash % MARKETPLACES.length];
}

export default function CartPage() {
  const { user } = useUser();
  const userId = user?.id || "1";
  const location = useLocation();
  const notice = location.state?.notice || "";

  const [cartOrders, setCartOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleRefund = async (orderId) => {
    try {
      await requestRefund(orderId);
      toast.success("Refund request submitted!");
      setLoading(true);
      fetchCartOrders(userId)
        .then((data) => {
          setCartOrders(data);
          setLoading(false);
        });
    } catch (err) {
      toast.error(err.message || "Refund request failed");
    }
  };

  React.useEffect(() => {
    setLoading(true);
    fetchCartOrders(userId)
      .then((data) => {
        setCartOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "API error");
        setLoading(false);
      });
  }, [userId]);

  // --- Only show orders with status "selling" or "refund_pending"
  const activeOrders = cartOrders.filter(
    (order) => order.status === "selling" || order.status === "refund_pending"
  );

  // ... (keep existing activeOrders logic) ...

  // --- POLISHED LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-green-800 bg-gradient-to-b from-green-50 to-[#F2E5C0]">
        <FaSpinner className="animate-spin text-4xl mb-4 text-green-600" />
        <p className="font-semibold animate-pulse">Syncing Resale Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-[#F2E5C0]">
        {error}
      </div>
    );
  }

  // --- POLISHED MAIN UI ---
  return (
    <div
      className="min-h-screen px-4 py-8 flex flex-col items-center"
      style={{
        backgroundImage: "url('/profilebg.jpg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-green-900 drop-shadow-sm flex items-center justify-center gap-2">
            <FaReceipt className="text-green-700" /> My Resale Store
          </h2>
          <p className="text-green-800/70 text-sm font-medium mt-1">
            Live tracking of your active listings
          </p>
        </div>

        {notice && (
          <div className="mb-6 text-center bg-blue-50/90 backdrop-blur border border-blue-200 text-blue-800 font-bold rounded-xl px-4 py-3 shadow-sm animate-fade-in">
            {notice}
          </div>
        )}

        {activeOrders.length === 0 ? (
          // --- POLISHED EMPTY STATE ---
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10 text-center flex flex-col items-center border border-white/50">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <FaBoxOpen className="text-4xl text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">No Active Resales</h3>
            <p className="text-gray-600 mb-6">You haven't listed any products for resale yet.</p>
          </div>
        ) : (
          // --- POLISHED CARD LIST ---
          <div className="space-y-5 pb-20">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                {/* Status Badge (Top Right) */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm z-10 uppercase tracking-wider">
                  {order.status === "refund_pending" ? "Refund Pending" : "Active Selling"}
                </div>

                {/* Top Section: Image & Title */}
                <div className="flex flex-row gap-4 mb-4">
                  <img
                    src={getProductImage(order.product)}
                    alt={order.title}
                    className="w-24 h-24 rounded-xl object-cover border border-gray-100 shadow-md flex-shrink-0 bg-white"
                  />
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h3 className="font-bold text-green-950 text-sm leading-snug line-clamp-2 mb-2">
                        {order.title}
                      </h3>
                      {/* Marketplace Tag */}
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
                        <FaStore /> {getMarketplaceForOrder(order.id)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Financial Grid (Ticket Style) */}
                <div className="grid grid-cols-3 gap-2 bg-green-50/50 rounded-xl p-3 border border-green-100/50 mb-4">
                  <div className="flex flex-col items-center border-r border-green-200/50">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Cost</span>
                    <span className="text-sm font-semibold text-gray-700">${Number(order.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-center border-r border-green-200/50">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Sold For</span>
                    <span className="text-sm font-semibold text-gray-700">
                      ${(Number(order.unit_price || 0) * Number(order.qty || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-green-600 uppercase font-bold tracking-wide">Profit</span>
                    <span className="text-base font-extrabold text-green-600 bg-white px-2 rounded shadow-sm">
                      +${Number(order.earn).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Footer & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {order.id.slice(0, 8)}...
                  </span>

                  {order.status === "selling" ? (
                    <button
                      onClick={() => handleRefund(order.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Request Refund
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 italic px-3 py-1.5">
                      {order.status === "refund_pending" ? "Processing..." : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
