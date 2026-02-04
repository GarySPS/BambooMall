// src/pages/ProductDetailPage.js

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductById, createOrder } from "../utils/api";
import { getProductImage } from "../utils/image";
import OrderPreviewModal from "../components/OrderPreviewModal"; 
import { 
  FaArrowLeft, 
  FaFilePdf, 
  FaBoxOpen, 
  FaWarehouse,
  FaCheckCircle,
  FaLock,
  FaFileContract,
  FaStar,
  FaStarHalfAlt,
  FaInfoCircle,
  FaTag,
  FaPalette,
  FaTrademark
} from "react-icons/fa";
import { useUser } from "../contexts/UserContext"; 

// --- HELPER: Parse JSON safely ---
function cleanJson(data) {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
}

// --- HELPER: Render Stars ---
function renderRating(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaStar key={i} className="text-slate-300" />);
    }
  }
  return <div className="flex gap-1 text-sm">{stars}</div>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, wallet, updateWallet } = useUser();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Size Selection State
  const [selectedSize, setSelectedSize] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successData, setSuccessData] = useState(null); 
  
  const isVerified = user && (user.verified || user.kyc_status === 'approved');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetchProductById(id)
      .then((data) => {
        const parsedSizes = cleanJson(data.size);
        const parsedColors = cleanJson(data.color); // [NEW] Parse Colors

        setProduct({
            ...data,
            gallery: cleanJson(data.gallery),
            keyAttributes: cleanJson(data.key_attributes || data.keyAttributes),
            priceTiers: cleanJson(data.price_tiers || data.priceTiers),
            sizes: parsedSizes,
            colors: parsedColors // [NEW] Save colors
        });
        
        // Auto-select the first size if available
        if (parsedSizes.length > 0) {
            setSelectedSize(parsedSizes[0].name);
        }
        
        setQuantity(data.min_order || 10); 
        setLoading(false);
      })
      .catch((err) => {
        setError("Manifest Retrieve Failed: " + err.message);
        setLoading(false);
      });
  }, [id]);

  // --- HELPER: Backend VIP Logic ---
  function getVipBonus(balance) {
    if (balance >= 40000) return 10;
    if (balance >= 20000) return 8;
    if (balance >= 15000) return 6;
    if (balance >= 10000) return 5;
    if (balance >= 5000) return 4;
    return 0;
  }

  // =========================================================
  //  CALCULATION ENGINE (Waterfall Method)
  // =========================================================
  
  // 1. Tiers
  const sortedTiers = (product?.priceTiers || []).sort((a, b) => a.min - b.min);
  const activeTier = sortedTiers.slice().reverse().find(t => quantity >= t.min);
  
  // 2. Prices
  const marketUnitPrice = Number(product?.price || 0); 
  const marketTotal = marketUnitPrice * quantity; 

  const bulkUnitPrice = activeTier ? Number(activeTier.price) : marketUnitPrice; 
  const bulkTotal = bulkUnitPrice * quantity; 
  
  const volumeSavings = marketTotal - bulkTotal; 

  // 3. Discounts
  const adminDiscount = Number(product?.discount || 0);
  const userBalance = Number(wallet?.balance || 0);
  const vipBonus = getVipBonus(userBalance);
  
  const adminDiscountAmount = bulkTotal * (adminDiscount / 100);
  const vipBonusAmount = bulkTotal * (vipBonus / 100);
  const totalDiscountAmount = adminDiscountAmount + vipBonusAmount;
  
  // 4. Final Settlement
  const settlementAmount = bulkTotal - totalDiscountAmount;
  
  // 5. Profit
  const projectedProfit = marketTotal - settlementAmount;
  const margin = settlementAmount > 0 ? ((projectedProfit / settlementAmount) * 100).toFixed(2) : "0.00";

  // Action Handlers
  const handleOpenTicket = () => {
    if (!isVerified) return;
    if (wallet.balance < settlementAmount) {
        alert("INSUFFICIENT LIQUIDITY: Please fund your settlement account.");
        return;
    }
    setShowModal(true); 
  };

  const handleConfirmOrder = async () => {
    setExecuting(true);
    try {
        const response = await createOrder({
            user_id: user.id,
            product_id: product.id,
            quantity: Number(quantity),
            type: "liquidation_acquisition",
            details: { size: selectedSize } 
        });
        updateWallet({ ...wallet, balance: wallet.balance - settlementAmount });
        setSuccessData(response.order); 
        setExecuting(false);
    } catch (err) {
        alert("EXECUTION FAILED: " + err.message);
        setExecuting(false);
    }
  };

  const handleCloseSuccess = () => {
      setShowModal(false);
      navigate("/cart", { state: { success: "Lot Acquisition Executed Successfully." } });
  };

  if (loading) return <div className="p-10 text-center font-mono text-xs">LOADING MANIFEST DATA...</div>;
  if (error) return <div className="p-10 text-center text-red-600 font-mono font-bold">{error}</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-4">
         <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
               <Link to="/products" className="hover:text-blue-600 hover:underline flex items-center gap-1">
                  <FaArrowLeft /> MASTER INVENTORY
               </Link>
               <span>/</span>
               <span>LOT #{id.substring(0,8).toUpperCase()}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{product.title}</h1>
            
            <div className="flex items-center gap-3 mt-2">
               {renderRating(product.rating || 0)}
               <span className="text-xs text-slate-500 font-bold">
                  {product.rating || "0.0"} / 5.0
               </span>
               <span className="text-xs text-slate-400 border-l border-slate-300 pl-3">
                  {product.review_count || 0} Verified Inspections
               </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs">
               <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                  BATCH: CN-{new Date().getFullYear()}-X99
               </span>
               <span className="flex items-center gap-1 text-slate-600">
                  <FaWarehouse /> Origin: {product.country || "China"}
               </span>
               <span className="flex items-center gap-1 text-slate-600">
                  <FaBoxOpen /> Stock: {product.stock || 0} Units
               </span>
            </div>
         </div>
         
         <div className="mt-4 md:mt-0 flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition">
               <FaFilePdf /> Inspection Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition">
               <FaFileContract /> Export Docs
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 2. LEFT COLUMN */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 flex gap-4 overflow-x-auto">
               {(product.gallery || [getProductImage(product)]).map((img, i) => (
                  <div key={i} className="w-32 h-32 bg-white border border-slate-300 rounded flex-shrink-0 flex items-center justify-center p-2">
                     <img src={img} alt={`spec-${i}`} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
               ))}
            </div>

            {/* [NEW] COLOR SHOWCASE (Read Only) */}
            {product.colors && product.colors.length > 0 && (
               <div className="bg-white border border-slate-200 rounded p-4">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                     <FaPalette /> Factory Color Options
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {product.colors.map((col, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                           {/* Small color dot approximation */}
                           <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400"></div> 
                           <span className="text-xs font-bold text-slate-600">{col.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Technical Specs */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
               <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
                  Technical Specifications
               </div>
               <table className="w-full text-sm text-left">
                  <tbody>
                     {/* [NEW] Brand Row */}
                     {product.brand && (
                        <tr className="border-b border-slate-100">
                           <td className="px-4 py-3 bg-slate-50 w-1/3 font-medium text-slate-600 capitalize flex items-center gap-2">
                              <FaTrademark size={10}/> Brand
                           </td>
                           <td className="px-4 py-3 font-mono text-slate-700 font-bold">
                              {product.brand}
                           </td>
                        </tr>
                     )}

                     {Array.isArray(product.keyAttributes) && product.keyAttributes.length > 0 ? (
                        product.keyAttributes.map((attr, index) => (
                           <tr key={index} className="border-b border-slate-100 last:border-0">
                              <td className="px-4 py-3 bg-slate-50 w-1/3 font-medium text-slate-600 capitalize">
                                 {Object.keys(attr)[0].replace(/_/g, " ")}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-700">
                                 {Object.values(attr)[0]}
                              </td>
                           </tr>
                        ))
                     ) : (
                        !product.brand && <tr><td colSpan="2" className="px-4 py-3 text-slate-400 italic text-center">No specific attributes.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="prose prose-sm max-w-none text-slate-600">
               <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">Lot Description</h3>
               <p>{product.description || "No description available."}</p>
            </div>
         </div>

         {/* 3. RIGHT COLUMN: Trade Execution */}
         <div className="space-y-4">
            
            <div className="bg-white border border-blue-200 shadow-lg rounded overflow-hidden">
               <div className="bg-blue-900 px-4 py-3 text-white flex justify-between items-center">
                  <span className="font-bold text-sm uppercase">Acquisition Ticket</span>
                  <FaLock size={12} className="text-blue-300" />
               </div>
               
               <div className="p-6 space-y-6">
                  
                  {/* PRICE HEADER */}
                  <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                     <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Market Value (FOB)</div>
                        <div className={`text-3xl font-mono font-bold ${!isVerified ? 'blur-sm select-none' : 'text-slate-900'}`}>
                           ${marketUnitPrice.toFixed(2)}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Net Yield</div>
                        <div className="text-lg font-bold text-emerald-600">+{margin}%</div>
                     </div>
                  </div>

                  {/* PRICE TIERS */}
                  {sortedTiers.length > 0 && (
                     <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded border text-center transition-colors ${
                           !activeTier ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 opacity-50'
                        }`}>
                           <div className="text-xs text-slate-500">Min. {product.min_order || 1} Pcs</div>
                           <div className="font-bold text-slate-800">${Number(product.price).toFixed(2)}</div>
                        </div>
                        {sortedTiers.map((tier, idx) => {
                           const isActive = activeTier && activeTier.min === tier.min;
                           return (
                              <div key={idx} className={`p-2 rounded border text-center transition-colors ${
                                 isActive ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200'
                              }`}>
                                 <div className={`text-xs ${isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                                    ≥ {tier.min} Pcs
                                 </div>
                                 <div className={`font-bold ${isActive ? 'text-emerald-800' : 'text-slate-800'}`}>
                                    ${Number(tier.price).toFixed(2)}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}

                  {/* SIZE SELECTOR */}
                  {product.sizes && product.sizes.length > 0 && (
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Configuration / Size</label>
                        <div className="flex flex-wrap gap-2">
                           {product.sizes.map((s, i) => (
                              <button
                                 key={i}
                                 onClick={() => setSelectedSize(s.name)}
                                 className={`px-3 py-1.5 text-xs font-bold rounded border transition-all ${
                                    selectedSize === s.name 
                                    ? 'bg-slate-800 text-white border-slate-800' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                 }`}
                              >
                                 {s.name}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* INPUT */}
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Allocation Volume (Units)</label>
                     <div className="flex items-center">
                        <input 
                           type="number" 
                           min={product.min_order || 1}
                           value={quantity}
                           onChange={(e) => setQuantity(Number(e.target.value))}
                           className="w-full border border-slate-300 rounded-l px-3 py-2 text-slate-800 font-mono focus:ring-1 focus:ring-blue-900 outline-none"
                        />
                        <div className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 text-slate-500 text-xs font-bold rounded-r">PCS</div>
                     </div>
                  </div>

                  {/* FINANCIAL BREAKDOWN */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2 text-xs font-mono">
                     <div className="flex justify-between">
                        <span className="text-slate-500">Market Value</span>
                        <span className="font-bold text-slate-900">${marketTotal.toFixed(2)}</span>
                     </div>
                     
                     {volumeSavings > 0 && (
                        <div className="flex justify-between text-blue-600">
                           <span className="flex items-center gap-1"><FaTag size={10}/> Volume Tier Applied</span>
                           <span>-${volumeSavings.toFixed(2)}</span>
                        </div>
                     )}

                     {adminDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                           <span>Less: Batch Incentive ({adminDiscount}%)</span>
                           <span>-${adminDiscountAmount.toFixed(2)}</span>
                        </div>
                     )}
                     
                     {vipBonus > 0 && (
                        <div className="flex justify-between text-emerald-600">
                           <span>Less: VIP Liquidity ({vipBonus}%)</span>
                           <span>-${vipBonusAmount.toFixed(2)}</span>
                        </div>
                     )}

                     <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                        <span className="font-bold text-slate-700">Settlement Due</span>
                        <span className="font-bold text-blue-900">${settlementAmount.toFixed(2)}</span>
                     </div>
                  </div>

                  {/* Action Button */}
                  {isVerified ? (
                     <button 
                        onClick={handleOpenTicket}
                        disabled={executing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded shadow transition flex justify-center items-center gap-2"
                     >
                        {executing ? "PROCESSING..." : <><FaCheckCircle /> GENERATE PROFORMA</>}
                     </button>
                  ) : (
                     <Link to="/kyc-verification" className="block w-full bg-slate-800 text-white font-bold py-3 rounded text-center hover:bg-slate-700 text-xs uppercase tracking-wide">
                        Verify ID to Unlock Pricing
                     </Link>
                  )}
                  
                  {isVerified && (
                     <div className="flex items-start gap-2 bg-blue-50 p-2 rounded text-[10px] text-blue-800">
                        <FaInfoCircle className="mt-0.5 shrink-0" />
                        <span>Funds held in escrow via Smart Contract (USDC/XRP).</span>
                     </div>
                  )}

               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
               <div className="text-xs font-bold uppercase text-slate-400 mb-2">Source Origin</div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                     <FaWarehouse />
                  </div>
                  <div>
                     <div className="font-bold text-slate-700">{product.supplier || "Shenzhen Logistics Hub"}</div>
                     <div className="text-xs text-slate-500">Verified Vendor • Lic #99203</div>
                  </div>
               </div>
            </div>

         </div>
      </div>

      {showModal && (
        <OrderPreviewModal
          product={product}
          quantity={quantity}
          priceTiers={product.priceTiers}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmOrder}
          isProcessing={executing}
          successData={successData} 
          onFinish={handleCloseSuccess} 
          selectedSize={selectedSize} 
        />
      )}

    </div>
  );
}