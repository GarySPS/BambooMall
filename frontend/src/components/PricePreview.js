import React from "react";

export default function PricePreview({ product, quantity, priceTiers, membershipDiscount = 0 }) {
  const tiers = Array.isArray(priceTiers) ? priceTiers : [];
  if (!tiers.length)
    return <div className="text-red-600">No price tiers available</div>;

  // 1. Find price tier based on quantity
  const tier = tiers.slice().reverse().find((t) => quantity >= t.min) || tiers[0];

  // 2. Calculate combined discount (product + membership)
  const productDiscount = product.discount || 0;
  const totalDiscount = productDiscount + membershipDiscount;

  // 3. Calculation
  const unitPrice = Number(tier.price);
  const total = unitPrice * quantity;
  const discounted = Math.round(total * (1 - totalDiscount / 100));

  // 4. Resale price: use the highest-tier price or product.price as dealer price
  // (If you want to always use the "Min.Order" price as resale, update here)
  const resaleUnit = (typeof product.price === "number" && product.price > 1)
    ? product.price
    : tiers[0].price; // fallback to min-order price
  const resale = Number(resaleUnit) * quantity;

  const profit = resale - discounted;

  return (
    <div className="text-sm text-gray-800 my-2">
      <div>
        Unit price:{" "}
        <span className="font-bold text-green-700">
          ${unitPrice.toFixed(2)}
        </span>
      </div>
      <div>Total before discount: ${total.toLocaleString()}</div>
      <div>
        Total after {totalDiscount}% discount:{" "}
        <span className="font-bold text-green-700">
          ${discounted.toLocaleString()}
        </span>
      </div>
      <div>
        Expected resale: <span className="font-bold">${resale.toLocaleString()}</span>
      </div>
      <div className="font-bold text-blue-700">
        Estimated profit: ${profit.toLocaleString()}
      </div>
    </div>
  );
}
