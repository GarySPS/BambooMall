import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductById, createOrder } from "../utils/api";
import { FaArrowLeft } from "react-icons/fa";
import { useUser } from "../contexts/UserContext"; 
import ProductGallery from "../components/ProductGallery";
import ProductVariantSelector from "../components/ProductVariantSelector";
import MoreProductDetail from "../components/MoreProductDetail";
import SupplierInfoBlock from "../components/SupplierInfoBlock";
import PriceTiersCard from "../components/PriceTiersCard";

// --- Get VIP Discount from wallet balance (mock) ---
function getVipDiscount(wallet) {
  const balance = (wallet?.usdt || 0) + (wallet?.alipay || 0) + (wallet?.wechat || 0);
  if (balance >= 40000) return 10;
  if (balance >= 20000) return 8;
  if (balance >= 15000) return 6;
  if (balance >= 10000) return 5;
  if (balance >= 5000) return 4;
  return 0;
}

function cleanJsonStr(str) {
  if (typeof str !== "string") return str;
  return str.replace(/(\r\n|\n|\r)/gm, "").trim();
}

function fillSimulatedFields(product) {
  let priceTiers = [];
  if (Array.isArray(product.priceTiers)) priceTiers = product.priceTiers;
  else if (typeof product.priceTiers === "string") {
    try { priceTiers = JSON.parse(cleanJsonStr(product.priceTiers)); } catch { priceTiers = []; }
  } else if (typeof product.price_tiers === "string") {
    try { priceTiers = JSON.parse(cleanJsonStr(product.price_tiers)); } catch { priceTiers = []; }
  }

  let galleryArr = [];
  if (Array.isArray(product.gallery)) galleryArr = product.gallery;
  else if (typeof product.gallery === "string") {
    try { 
      const arr = JSON.parse(cleanJsonStr(product.gallery));
      if (Array.isArray(arr)) galleryArr = arr;
    } catch {
      if (product.gallery?.trim?.().length > 0) galleryArr = [product.gallery.trim()];
    }
  }
  galleryArr = (galleryArr || []).map(x =>
    typeof x === "string"
      ? x.replace(/[\[\]\"]/g, "").trim()
      : x
  ).filter(url =>
    typeof url === "string" &&
    (url.startsWith("http://") || url.startsWith("https://")) &&
    url.endsWith(".png")
  );

  let sizeArr = [];
  if (Array.isArray(product.size)) sizeArr = product.size;
  else if (typeof product.size === "string") {
    try { sizeArr = JSON.parse(cleanJsonStr(product.size)); } catch { sizeArr = []; }
  }

  let colorsArr = [];
if (Array.isArray(product.colors)) colorsArr = product.colors;
else if (typeof product.colors === "string") {
  try { colorsArr = JSON.parse(cleanJsonStr(product.colors)); } catch { colorsArr = []; }
}
if ((!colorsArr || !colorsArr.length) && typeof product.color === "string") {
  try { colorsArr = JSON.parse(cleanJsonStr(product.color)); } catch { colorsArr = []; }
}


  let keyAttributesArr = [];
  if (Array.isArray(product.keyAttributes)) keyAttributesArr = product.keyAttributes;
  else if (typeof product.keyAttributes === "string") {
    try { keyAttributesArr = JSON.parse(cleanJsonStr(product.keyAttributes)); } catch { keyAttributesArr = []; }
  } else if (typeof product.key_attributes === "string") {
    try { keyAttributesArr = JSON.parse(cleanJsonStr(product.key_attributes)); } catch { keyAttributesArr = []; }
  }

  return {
    ...product,
    priceTiers,
    discount: product.discount,
    colors: colorsArr,
    size: sizeArr,
    gallery: galleryArr,
    keyAttributes: keyAttributesArr,
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedColor, setSelectedColor] = React.useState("");
  const [selectedSize, setSelectedSize] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const { user, wallet, updateWallet } = useUser();
  const navigate = useNavigate();
  const [showNotice, setShowNotice] = React.useState("");
  const [buying, setBuying] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);


  const vipDiscount = getVipDiscount(wallet);

  function getResaleCalc(product, quantity) {
  const tiers =
    Array.isArray(product.priceTiers) ? product.priceTiers :
    typeof product.priceTiers === "string" ? JSON.parse(cleanJsonStr(product.priceTiers)) :
    typeof product.price_tiers === "string" ? JSON.parse(cleanJsonStr(product.price_tiers)) :
    Array.isArray(product.price_tiers) ? product.price_tiers :
    [];

  // If tiers empty, fallback to product.price
  let tier = tiers.slice().reverse().find((t) => quantity >= t.min);
  if (!tier && typeof product.price === "number") {
    tier = { min: 1, price: product.price };
  }
  if (!tier) tier = { min: 1, price: 1 }; // fallback

  const baseDiscount = product.discount || 0;
  const vip = getVipDiscount(wallet) || 0;
  const totalDiscount = baseDiscount + vip;
  const total = tier.price * quantity;
  const discounted = total * (1 - totalDiscount / 100);
  const resale = (typeof product.price === "number" ? product.price : tier.price) * quantity;
  const profit = resale - discounted;
  return { tier, total, discounted, resale, profit, totalDiscount };
}


  const orderPreview = product ? getResaleCalc(product, Number(quantity)) : null;

  async function handleResale() {
    if (!user) {
      setShowNotice("Please login to make a purchase.");
      setTimeout(() => setShowNotice(""), 2000);
      return;
    }
    if (!product) return;
    const minOrder = product.min_order || product.minQty || 1;
    if (Number(quantity) < minOrder) {
      setShowNotice(`Minimum order is ${minOrder} pieces.`);
      setTimeout(() => setShowNotice(""), 2000);
      return;
    }
    const { discounted, profit, totalDiscount } = getResaleCalc(product, quantity);

    let deducted = false;
    let newWallet = { ...wallet };
    ["usdt", "alipay", "wechat"].forEach((key) => {
      if (!deducted && (wallet[key] || 0) >= discounted) {
        newWallet[key] = wallet[key] - discounted;
        deducted = true;
      }
    });
    if (!deducted) {
      const totalBalance =
        (wallet.usdt || 0) + (wallet.alipay || 0) + (wallet.wechat || 0);
      if (totalBalance < discounted) {
        setShowNotice("Insufficient wallet balance!");
        setTimeout(() => setShowNotice(""), 2000);
        return;
      } else {
        let remaining = discounted;
        let keys = ["usdt", "alipay", "wechat"];
        let update = { ...wallet };
        for (let key of keys) {
          const canTake = Math.min(update[key] || 0, remaining);
          update[key] = (update[key] || 0) - canTake;
          remaining -= canTake;
          if (remaining <= 0) break;
        }
        newWallet = update;
      }
    }

    setBuying(true);
    try {
      await createOrder({
  user_id: user?.id,
  product_id: product.id,
  quantity: Number(quantity),
  type: "resale"
});

      setBuying(false);
      navigate("/cart", { state: { notice: "Your order is submitted!" } });
    } catch (err) {
      setBuying(false);
      setShowNotice("Order failed. Try again.");
      setTimeout(() => setShowNotice(""), 2400);
    }
  }

  React.useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then((data) => {
        const simulated = fillSimulatedFields(data);
        setProduct(simulated);
        setSelectedColor(simulated.colors[0]?.name || "");
        setSelectedSize(simulated.size[0] || "");
        setQuantity(simulated.minQty || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Product not found");
        setLoading(false);
      });
  }, [id]);

  const avgRating = product?.rating ? Number(product.rating).toFixed(1) : "—";
  const reviewCount = product?.review_count ? Number(product.review_count) : 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-green-700 text-xl font-bold">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-green-700 underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-2 pb-8"
      style={{
        backgroundImage: "url('/profilebg.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        minHeight: "100vh"
      }}
    >
      <div className="w-full max-w-xl mx-auto py-4 px-1 sm:px-2">
        {/* Back button */}
        <div className="mb-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow border border-gray-200 text-green-700 font-semibold hover:bg-green-50 hover:border-green-300 transition"
          >
            <FaArrowLeft className="text-lg" />
            Back to Products
          </Link>
        </div>
        <ProductGallery gallery={product.gallery} title={product.title} />
        <div className="flex items-center gap-3 mb-2 mt-2">
          <span className="rounded-lg px-2 py-1 text-xs bg-green-100 text-green-800 font-semibold">
            {product.brand || "Factory Brand"}
          </span>
          <span className="rounded px-2 py-1 text-xs bg-yellow-100 text-yellow-800">
            Factory: {product.supplier}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
          {product.title}
        </h2>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow p-2 mb-3 w-fit">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                fill={i <= Math.round(avgRating) ? "#FFD700" : "#E5E7EB"}
                className="w-5 h-5"
              >
                <polygon points="10,2 13,7.5 19,8 14.5,12 15.5,18 10,15 4.5,18 5.5,12 1,8 7,7.5" />
              </svg>
            ))}
          </div>
          <span className="font-extrabold text-2xl text-gray-900">{avgRating}</span>
          <span className="font-bold text-xl text-gray-700">/ 5</span>
          <span className="ml-2 text-base text-gray-500 font-medium">
            ({reviewCount} reviews)
          </span>
        </div>
        <PriceTiersCard priceTiers={product.priceTiers} />
        <ProductVariantSelector
          colors={product.colors || []}
          sizeList={
            Array.isArray(product.size)
              ? product.size
              : typeof product.size === "string" && product.size.trim().startsWith("[")
              ? JSON.parse(product.size)
              : []
          }
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
        />
        <MoreProductDetail keyAttributes={product.keyAttributes} />
        <div className="mb-2 text-gray-700">{product.description}</div>
        <SupplierInfoBlock
          supplier={product.supplier}
          minOrder={product.min_order || product.minQty || 1}
          factoryWebsite={product.factoryWebsite}
          factoryUrl={product.factory_url}
        />
        {/* --- Order Preview --- */}
        {orderPreview && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 my-4 text-sm font-bold text-blue-700">
            <div className="mb-1 text-base text-gray-800 font-semibold">Cost Estimating</div>
            <table className="w-full text-blue-900 mb-1">
              <tbody>
                <tr>
                  <td>Price</td>
                  <td className="text-right">${orderPreview.tier?.price?.toFixed(2) || "—"}</td>
                </tr>
                <tr>
                  <td>Units</td>
                  <td className="text-right">{quantity}</td>
                </tr>
                <tr>
                  <td>Total cost</td>
                  <td className="text-right">${orderPreview.total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Discount</td>
                  <td className="text-right">{product.discount || 0}%</td>
                </tr>
                <tr>
                  <td>Membership</td>
                  <td className="text-right">{vipDiscount || 0}%</td>
                </tr>
                <tr>
                  <td>Pay</td>
                  <td className="text-right text-green-700">${orderPreview.discounted.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Sell on global markets</td>
                  <td className="text-right">${orderPreview.resale.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-bold">Estimated profit after sale</td>
                  <td className="text-right font-bold text-blue-800">
                    ${orderPreview.profit.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* --- Buy Card --- */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          {showNotice && (
            <div className="mb-3 text-center bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl px-4 py-2 transition">
              {showNotice}
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
              {product.discount || 0}% OFF
            </span>
            <span className="font-semibold text-gray-600">
              Limited time discount!
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold">Select quantity:</span>
            <input
              type="number"
              min={product.min_order || product.minQty || 1}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val)) setQuantity(val);
              }}
              onBlur={() => {
                const min = product.min_order || product.minQty || 1;
                const num = parseInt(quantity, 10);
                if (!num || num < min) setQuantity(min);
                else setQuantity(num);
              }}
              className="border rounded-lg px-3 py-1 w-24 text-base"
            />
            <span className="text-xs text-gray-500">
              (Min. {product.min_order || product.minQty || 1})
            </span>
          </div>
          {!showConfirm ? (
            <button
              className={`mt-3 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 font-bold text-lg shadow transition ${
                buying ? "opacity-60 cursor-wait" : ""
              }`}
              onClick={() => setShowConfirm(true)}
              disabled={buying}
            >
              {buying ? "Processing..." : "Buy & Resale"}
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-3">
              <div className="text-center font-semibold text-blue-900 mb-2">
                Are you sure you want to buy and resale this product?
              </div>
              <div className="flex gap-3">
                <button
                  className="w-1/2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 font-bold shadow transition"
                  onClick={async () => {
                    await handleResale();
                    setShowConfirm(false);
                  }}
                  disabled={buying}
                >
                  Confirm
                </button>
                <button
                  className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-xl py-2 font-bold shadow transition"
                  onClick={() => setShowConfirm(false)}
                  disabled={buying}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

