// src/pages/ProductDetailPage.js

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductById, createOrder } from "../utils/api";
import OrderPreviewModal from "../components/OrderPreviewModal"; 
import ProductGallery from "../components/ProductGallery"; 
import SupplierInfoBlock from "../components/SupplierInfoBlock"; 
import { toast } from "react-toastify"; 
import { API_BASE_URL } from "../config"; // 1. Added Import

import { 
  FaArrowLeft, FaFilePdf, 
  FaCheckCircle, FaLock, FaStar,
  FaStarHalfAlt, FaPalette,
  FaTrademark, FaBalanceScale, FaGlobeAmericas, FaShieldAlt
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
    if (i < fullStars) stars.push(<FaStar key={i} className="text-emerald-500 text-[10px]" />);
    else if (i === fullStars && hasHalf) stars.push(<FaStarHalfAlt key={i} className="text-emerald-500 text-[10px]" />);
    else stars.push(<FaStar key={i} className="text-slate-200 text-[10px]" />);
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, wallet, updateWallet } = useUser();
  const navigate = useNavigate();

  // --- STATE DEFINITIONS (Must be at top level) ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successData, setSuccessData] = useState(null); 
  
  // State to hold the calculated minimum based on tiers
  const [calculatedMin, setCalculatedMin] = useState(1);

  const isVerified = user && (user.verified || user.kyc_status === 'approved');

  // --- HELPER: Silent Wallet Refresh ---
  const refreshWallet = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/wallet/${user.id}`);
      const data = await res.json();
      if (data.wallet) {
        // Only update if balance actually changed to avoid re-renders (optional optimization)
        if (JSON.stringify(data.wallet) !== JSON.stringify(wallet)) {
            updateWallet(data.wallet); 
        }
      }
    } catch (err) {
      console.error("Silent wallet sync failed", err);
    }
  };

  // --- EFFECT: Load Data & Refresh Wallet ---
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // 2. Call refreshWallet immediately on mount
    refreshWallet(); 

    fetchProductById(id)
      .then((data) => {
        const parsedSizes = cleanJson(data.size);
        const parsedColors = cleanJson(data.color);
        const parsedTiers = cleanJson(data.price_tiers || data.priceTiers);

        // [LOGIC] Prioritize DB 'min_order' as the strict quantity lock
        let derivedMin = 1;
        if (data.min_order) {
            derivedMin = parseInt(data.min_order);
        } else if (parsedTiers.length > 0) {
            // Fallback to lowest tier only if min_order is missing
            const sorted = parsedTiers.sort((a, b) => a.min - b.min);
            derivedMin = sorted[0].min;
        }

        setCalculatedMin(derivedMin);
        setQuantity(derivedMin); // Set default input value

        setProduct({
            ...data,
            gallery: cleanJson(data.gallery),
            keyAttributes: cleanJson(data.key_attributes || data.keyAttributes),
            priceTiers: parsedTiers,
            sizes: parsedSizes,
            colors: parsedColors
        });
        
        if (parsedSizes.length > 0) setSelectedSize(parsedSizes[0].name);
        setLoading(false);
      })
      .catch((err) => {
        setError("Manifest Retrieve Failed: " + err.message);
        setLoading(false);
      });
  }, [id]); // Removed 'user.id' from dependency to prevent infinite loop if user object changes slightly

  // --- CALCULATIONS ---

  function getVipBonus(totalValue) {
    if (totalValue >= 20000) return 10; // Tier 1
    if (totalValue >= 13000) return 8;  // Tier 2
    if (totalValue >= 8000)  return 6;  // Tier 3
    if (totalValue >= 4000)  return 5;  // Tier 4
    if (totalValue >= 2000)  return 4;  // Tier 5
    return 0;
  }

  const sortedTiers = (product?.priceTiers || []).sort((a, b) => a.min - b.min);
  const activeTier = sortedTiers.slice().reverse().find(t => quantity >= t.min);
  
  const marketUnitPrice = Number(product?.price || 0); 
  const marketTotal = marketUnitPrice * quantity; 

  const bulkUnitPrice = activeTier ? Number(activeTier.price) : marketUnitPrice; 
  const bulkTotal = bulkUnitPrice * quantity; 
  const volumeSavings = marketTotal - bulkTotal; 

  const adminDiscount = Number(product?.discount || 0);

  // Use Net Worth if available, otherwise fallback to balance
  const totalAssetValue = Number(wallet?.net_worth || wallet?.balance || 0);
  const vipBonus = getVipBonus(totalAssetValue);
  
  const adminDiscountAmount = bulkTotal * (adminDiscount / 100);
  const vipBonusAmount = bulkTotal * (vipBonus / 100);
  const totalDiscountAmount = adminDiscountAmount + vipBonusAmount;
  const settlementAmount = bulkTotal - totalDiscountAmount;
  
  const projectedProfit = marketTotal - settlementAmount;
  const margin = settlementAmount > 0 ? ((projectedProfit / settlementAmount) * 100).toFixed(2) : "0.00";

  // --- HANDLERS ---

  const handleQuantityChange = (e) => {
    let valStr = e.target.value.replace(/[^0-9]/g, '');
    if (valStr.length > 1 && valStr.startsWith('0')) valStr = valStr.replace(/^0+/, '');
    if (valStr === "") { setQuantity(""); return; }
    setQuantity(parseInt(valStr, 10));
  };

  const handleQuantityBlur = () => {
    if (!quantity || quantity < calculatedMin) {
        toast.info(`Volume auto-corrected to Tier Minimum: ${calculatedMin} Units`);
        setQuantity(calculatedMin);
    }
  };

  const handleOpenTicket = () => {
    if (!isVerified) return;
    
    if (quantity < calculatedMin) {
        toast.error(`Order Rejected: Minimum allocation is ${calculatedMin} units.`);
        setQuantity(calculatedMin);
        return;
    }

    // Check against Cash Balance (Liquidity)
    if (Number(wallet?.balance || 0) < settlementAmount) {
        // Try one last refresh before failing, just in case they just topped up in another tab
        refreshWallet().then(() => {
             if (Number(wallet?.balance || 0) < settlementAmount) {
                 toast.error("INSUFFICIENT LIQUIDITY: Please fund your settlement account.");
             } else {
                 setShowModal(true); // Logic saved them!
             }
        });
        return;
    }
    setShowModal(true); 
  };

  const handleConfirmOrder = async () => {
    setExecuting(true);
    if (quantity < calculatedMin) {
        toast.error(`Volume Error: Minimum is ${calculatedMin} units.`);
        setExecuting(false);
        return;
    }

    try {
        const response = await createOrder({
            user_id: user.id,
            product_id: product.id,
            quantity: Number(quantity),
            type: "liquidation_acquisition",
            details: { size: selectedSize } 
        });
        
        updateWallet({ 
            ...wallet, 
            balance: wallet.balance - settlementAmount 
        });
        
        setSuccessData(response.order); 
        setExecuting(false);
    } catch (err) {
        toast.error("EXECUTION FAILED: " + err.message);
        setExecuting(false);
    }
  };

  const handleCloseSuccess = () => {
      setShowModal(false);
      navigate("/cart", { state: { success: "Lot Acquisition Executed Successfully." } });
  };

  const isInvalidQuantity = !quantity || quantity < calculatedMin;

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-xs text-slate-500">LOADING MANIFEST DATA...</div>;
  if (error) return <div className="p-10 text-center text-red-600 font-mono font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">
      
      {/* 1. TOP NAV */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-12 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] md:text-xs font-mono uppercase tracking-wide text-slate-500">
              <Link to="/products" className="hover:text-emerald-700 flex items-center gap-1 transition-colors">
                 <FaArrowLeft /> MASTER_INVENTORY
              </Link>
              <span className="text-slate-300">/</span>
              <span>LOT_ID: {id ? id.substring(0,8).toUpperCase() : '...'}</span>
              <span className="text-slate-300">/</span>
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">STATUS: LIVE</span>
           </div>
           <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded-sm transition">
                 <FaFilePdf /> Tech_Report.pdf
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        
        {/* 2. MAIN HEADER */}
        <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
               {product.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-2">
                   <span className="font-mono font-bold text-slate-400 uppercase">Origin</span>
                   <span className="flex items-center gap-1 font-semibold text-slate-800"><FaGlobeAmericas size={10} /> {product.country || "Global"}</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-2">
                   <span className="font-mono font-bold text-slate-400 uppercase">Condition</span>
                   <span className="font-semibold text-slate-800">Factory New (A-Grade)</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-2">
                   <span className="font-mono font-bold text-slate-400 uppercase">Inspection</span>
                   <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100">
                      <FaShieldAlt size={10} />
                      <span className="font-bold">VERIFIED</span>
                   </div>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400 uppercase">Rating</span>
                    <div className="flex items-center gap-1">
                        {renderRating(product.rating || 0)}
                        <span className="font-mono font-bold text-slate-700 ml-1">{product.rating}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* LEFT COLUMN */}
           <div className="lg:col-span-8 space-y-8">
              <ProductGallery gallery={product.gallery} title={product.title} />

              {/* COLORS */}
              {product.colors && product.colors.length > 0 && (
                 <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
                    <div className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                       <FaPalette /> Factory Color Options
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {product.colors.map((col, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">
                             <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-300 shadow-inner"></div> 
                             <span className="text-xs font-bold text-slate-700 font-mono uppercase">{col.name}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {/* SPECS */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
                 <div className="bg-slate-100/50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">Technical Specifications</h3>
                    <span className="text-[10px] font-mono text-slate-400">REF: SPEC-Sheet-V2</span>
                 </div>
                 <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                       {product.brand && (
                          <div className="flex justify-between py-2 border-b border-slate-100">
                             <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2"><FaTrademark size={10} /> Manufacturer</span>
                             <span className="text-sm font-mono font-bold text-slate-900">{product.brand}</span>
                          </div>
                       )}
                       {Array.isArray(product.keyAttributes) && product.keyAttributes.map((attr, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                             <span className="text-xs font-semibold text-slate-500 uppercase">
                                {Object.keys(attr)[0].replace(/_/g, " ")}
                             </span>
                             <span className="text-sm font-mono text-slate-900">
                                {Object.values(attr)[0]}
                             </span>
                          </div>
                       ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                       <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase">Asset Description</h4>
                       <p className="text-sm leading-relaxed text-slate-600 font-normal">
                          {product.description || "No detailed description available for this asset."}
                       </p>
                    </div>
                 </div>
              </div>

              <SupplierInfoBlock 
                supplier={product.supplier} 
                minOrder={calculatedMin}
                factoryUrl={product.factory_url}
              />
           </div>

           {/* RIGHT COLUMN */}
           <div className="lg:col-span-4 space-y-4 sticky top-24">
              
              <div className="bg-white border-t-4 border-emerald-600 shadow-xl rounded-sm overflow-hidden">
                 <div className="bg-slate-900 px-5 py-4 flex justify-between items-start">
                    <div>
                       <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-1">Current Market Valuation</div>
                       <div className={`text-3xl font-mono font-bold text-white ${!isVerified ? 'blur-sm select-none' : ''}`}>
                          ${marketUnitPrice.toFixed(2)}
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1">Spread / Yield</div>
                       <div className="text-lg font-bold text-emerald-400">+{margin}%</div>
                    </div>
                 </div>

                 <div className="p-5 space-y-6">
                    {sortedTiers.length > 0 && (
                       <div>
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-bold uppercase text-slate-500">Volume Pricing Tiers</span>
                             <span className="text-[10px] text-emerald-600 font-bold">Live Data</span>
                          </div>
                          <div className="border border-slate-200 rounded-sm overflow-hidden">
                             {sortedTiers.map((tier, idx) => {
                                const isActive = activeTier && activeTier.min === tier.min;
                                return (
                                   <div key={idx} className={`flex justify-between items-center px-3 py-2 border-b border-slate-100 last:border-0 ${isActive ? 'bg-emerald-50' : 'bg-white'}`}>
                                      <div className="flex items-center gap-2">
                                         {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                                         <span className={`text-xs font-mono ${isActive ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>≥ {tier.min} units</span>
                                      </div>
                                      <span className={`text-xs font-mono ${isActive ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                         ${Number(tier.price).toFixed(2)}
                                      </span>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    )}

                    <div className="space-y-4 pt-2">
                       {product.sizes && product.sizes.length > 0 && (
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Configuration Variant</label>
                             <div className="flex flex-wrap gap-2">
                                {product.sizes.map((s, i) => (
                                   <button
                                      key={i}
                                      onClick={() => setSelectedSize(s.name)}
                                      className={`px-3 py-2 text-xs font-mono border rounded-sm transition-all ${
                                         selectedSize === s.name 
                                         ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                         : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                      }`}
                                   >
                                      {s.name}
                                   </button>
                                ))}
                             </div>
                          </div>
                       )}

                       <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Acquisition Volume</label>
                          <div className="flex">
                             <input 
                                type="text" 
                                value={quantity}
                                onChange={handleQuantityChange}
                                onBlur={handleQuantityBlur}
                                className="w-full border border-slate-300 px-4 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none rounded-l-sm"
                             />
                             <div className="bg-slate-100 border border-l-0 border-slate-300 px-4 py-2 text-slate-500 text-xs font-bold rounded-r-sm flex items-center justify-center">PCS</div>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                             <span>Min. Order: {calculatedMin} Units</span>
                             <span>Stock: {product.stock}</span>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
                       <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between text-slate-500">
                             <span>Market Gross</span>
                             <span className="line-through">${marketTotal.toFixed(2)}</span>
                          </div>
                          
                          {volumeSavings > 0 && (
                             <div className="flex justify-between text-emerald-600">
                                <span>Volume Adjustment</span>
                                <span>-${volumeSavings.toFixed(2)}</span>
                             </div>
                          )}

                          {adminDiscount > 0 && (
                             <div className="flex justify-between text-emerald-600">
                                <span>Incentive ({adminDiscount}%)</span>
                                <span>-${adminDiscountAmount.toFixed(2)}</span>
                             </div>
                          )}

                          {vipBonus > 0 && (
                            <div className="flex justify-between text-blue-600">
                               <span>Partner Tier Bonus ({vipBonus}%)</span>
                               <span>-${vipBonusAmount.toFixed(2)}</span>
                            </div>
                          )}
                          
                          <div className="border-t border-slate-300 my-2"></div>
                          
                          <div className="flex justify-between items-end">
                             <span className="font-bold text-slate-700 uppercase">Settlement Due</span>
                             <span className="text-xl font-bold text-slate-900">${settlementAmount.toFixed(2)}</span>
                          </div>
                          <div className="text-right text-[10px] text-slate-400 mt-1">
                             (Excl. Logistics & Duties)
                          </div>
                       </div>
                    </div>

                    {isVerified ? (
                       <button 
                          onClick={handleOpenTicket}
                          disabled={executing || isInvalidQuantity}
                          className={`w-full font-bold py-4 rounded-sm shadow-md transition-all flex justify-center items-center gap-2 text-xs tracking-widest uppercase ${
                             isInvalidQuantity 
                             ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                             : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg"
                          }`}
                       >
                          {executing ? "PROCESSING ORDER..." : <><FaBalanceScale size={14} /> Initiate Procurement</>}
                       </button>
                    ) : (
                       <Link to="/kyc-verification" className="flex items-center justify-center w-full bg-slate-800 text-white font-bold py-4 rounded-sm hover:bg-slate-700 text-xs uppercase tracking-widest transition">
                          <FaLock className="mr-2" /> Verify Account to Unlock
                       </Link>
                    )}

                    {isVerified && (
                        <div className="text-center">
                            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                <FaCheckCircle className="text-emerald-500"/> Escrow Secured via Smart Contract
                            </span>
                        </div>
                    )}
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
    </div>
  );
}