import React from "react";
import { fetchCartOrders } from "../utils/api";
import { useUser } from "../contexts/UserContext";
import { requestRefund } from "../utils/api";
import { useLocation } from "react-router-dom";
import { getProductImage } from "../utils/image";
import { toast } from "react-toastify"; // Only import toast (not ToastContainer)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-700 text-xl font-bold bg-[#F2E5C0]">
        Loading your resale orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg bg-[#F2E5C0]">
        {error}
      </div>
    );
  }

  return (
    <div
  className="min-h-screen px-4 py-8 flex flex-col items-center"
  style={{
    backgroundImage: "url('/profilebg.jpg')",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundAttachment: "fixed", // Optional for a fixed effect
    minHeight: "100vh"
  }}
>

      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-800 mb-8">Your Resale Orders</h2>
        {notice && (
          <div className="mb-5 text-center bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl px-4 py-2 transition">
            {notice}
          </div>
        )}

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
            No active resale orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative"
              >
                <img
                  src={getProductImage(order.product)}
                  alt={order.title}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-green-200 shadow mb-2"
                />
                <div className="flex-1 w-full flex flex-col items-center text-center">
                  <div className="font-semibold text-base text-green-900 mb-1 line-clamp-2">
                    {order.title}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs mb-1">
                    <span className="text-gray-500">
                      Qty: <span className="font-bold text-green-700">{order.qty}</span>
                    </span>
                    <span className="text-gray-500">
                      Price: <span className="font-bold">${Number(order.unit_price).toFixed(2)}</span>
                    </span>
                    <span className="text-gray-500">
                      Discount:
                      <span className="font-bold ml-1">
                        {order.admin_discount || 0}% + {order.vip_bonus || 0}% = {order.total_discount || (order.admin_discount || 0) + (order.vip_bonus || 0)}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-medium text-gray-800">Earn After Resale:</span>
                    <span className="font-bold text-orange-600">
                      ${Number(order.earn).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-xs mb-1">
                    <span>
                      Cost: <b>${Number(order.amount).toFixed(2)}</b>
                      {"  |  "}
                      Sell total: <b>${(Number(order.unit_price || 0) * Number(order.qty || 0)).toFixed(2)}</b>
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 mt-1 mb-2">
                    <span className="text-xs text-gray-400">{order.created_at ? new Date(order.created_at).toLocaleString() : ""}</span>
                    <span className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-lg text-xs flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Selling on {order.status || "processing"}
                    </span>
                  </div>
                  {order.status === "selling" ? (
  <button
    className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg text-xs shadow transition"
    onClick={() => handleRefund(order.id)}
  >
    Refund Request
  </button>
) : order.status === "refund_pending" ? (
  <button
    className="bg-gray-300 text-gray-500 font-semibold px-4 py-2 rounded-lg text-xs shadow transition cursor-not-allowed"
    disabled
  >
    Refund Pending...
  </button>
) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
