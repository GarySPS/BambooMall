import React from "react";

export default function OrderPreviewModal({
  product,
  quantity,
  priceTiers,
  membershipDiscount,
  onClose,
  onConfirm,
  notice,
}) {
  // Calculate correct tier price based on quantity
  const tier =
    Array.isArray(priceTiers) && priceTiers.length > 0
      ? priceTiers
          .slice()
          .reverse()
          .find((t) => quantity >= t.min) || priceTiers[0]
      : { price: product.price || 1, min: product.min_order || 1, label: "" };

  const unitPrice = Number(tier.price || product.price || 1);
  const unitDiscount = product.discount || 0; // Admin-set product discount (%)
  const memberDiscount = membershipDiscount || 0; // Membership VIP discount (%)
  const totalDiscountPercent = unitDiscount + memberDiscount; // Both discounts additive

  const totalUnit = Number(quantity) || 1;
  const totalPrice = unitPrice * totalUnit;
  const totalPriceToBuy = totalPrice * (1 - totalDiscountPercent / 100);
  const resaleTotalPrice = totalPrice; // as you wanted: total resale = total price
  const earnAfterSale = resaleTotalPrice - totalPriceToBuy;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 2147483647,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.30)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "2rem",
          boxShadow:
            "0 12px 48px 0 rgba(33,70,53,0.15), 0 2px 6px 0 rgba(0,0,0,0.04)",
          width: "100%",
          maxWidth: "410px",
          padding: "2rem 2.2rem",
          position: "relative",
          zIndex: 2147483647,
          border: "3px solid #10b981",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "1.55rem",
            fontWeight: 800,
            textAlign: "center",
            color: "#047857",
            marginBottom: "1.5rem",
            letterSpacing: "0.01em",
          }}
        >
          Confirm Your Order
        </h2>
        {/* COST ESTIMATING TABLE */}
        <div style={{ fontSize: "1.11rem", fontWeight: 500, color: "#1e293b", marginBottom: "1.1rem" }}>
          <div className="mb-2 text-base text-gray-800 font-bold">Cost Estimating</div>
          <table className="w-full text-blue-900 mb-1" style={{ fontWeight: 600 }}>
            <tbody>
              <tr>
                <td>Price</td>
                <td className="text-right">${unitPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Units</td>
                <td className="text-right">{totalUnit}</td>
              </tr>
              <tr>
                <td>Total cost</td>
                <td className="text-right">${totalPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td className="text-right">{unitDiscount}%</td>
              </tr>
              <tr>
                <td>Membership</td>
                <td className="text-right">{memberDiscount}%</td>
              </tr>
              <tr>
                <td>Pay</td>
                <td className="text-right text-green-700">${totalPriceToBuy.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Sell on global markets</td>
                <td className="text-right">${resaleTotalPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="font-bold">Estimated profit after sale</td>
                <td className="text-right font-bold text-blue-800">
                  ${earnAfterSale.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ACTION BUTTONS */}
        {notice ? (
          <div className="mb-3 text-center bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl px-4 py-2 transition">
            {notice}
            <div className="mt-4">
              <button
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold rounded-xl transition"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 mt-4">
            <button
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition"
              onClick={onConfirm}
            >
              Confirm & Resale
            </button>
            <button
              className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold rounded-xl transition"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
