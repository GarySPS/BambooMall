//src>pages>ProductDetailPage.js

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  fetchProductById, 
  createOrder, 
  fetchWalletBalance
} from "../utils/api";
import OrderPreviewModal from "../components/OrderPreviewModal"; 
import ProductGallery from "../components/ProductGallery"; 
import SupplierInfoBlock from "../components/SupplierInfoBlock"; 
import { toast } from "react-toastify"; 
import { API_BASE_URL } from "../config"; 

import { 
  FaArrowLeft, FaFilePdf, 
  FaCheckCircle, FaLock, FaStar,
  FaStarHalfAlt, FaPalette,
  FaTrademark, FaBalanceScale, FaGlobeAmericas, FaShieldAlt,
  FaInfoCircle, FaChevronUp
} from "react-icons/fa";
import { useUser } from "../contexts/UserContext"; 

function cleanJson(data) {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
}

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

  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successData, setSuccessData] = useState(null); 
  const [calculatedMin, setCalculatedMin] = useState(1);
  
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);

  const isVerified = user && (user.verified || user.kyc_status === 'approved');

  // --- HELPER: Silent Wallet Refresh (SECURED) ---
  const refreshWallet = async () => {
    if (!user?.id) return;
    try {
      // SECURITY FIX: Use the authenticated helper instead of raw fetch
      const walletData = await fetchWalletBalance(user.id);
      if (walletData) {
         updateWallet(walletData); 
      }
    } catch (err) {
      console.error("Silent wallet sync failed", err);
    }
  };

  // --- EFFECT: Load Data ---
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    refreshWallet(); 

    fetchProductById(id)
      .then((data) => {
        const parsedSizes = cleanJson(data.size);
        const parsedColors = cleanJson(data.color);
        const parsedTiers = cleanJson(data.price_tiers || data.priceTiers);

        let derivedMin = 1;
        if (data.min_order) {
            derivedMin = parseInt(data.min_order);
        } else if (parsedTiers.length > 0) {
            const sorted = parsedTiers.sort((a, b) => a.min - b.min);
            derivedMin = sorted[0].min;
        }

        setCalculatedMin(derivedMin);
        setQuantity(derivedMin);

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
  }, [id]);

  // --- CALCULATIONS ---
  function getVipBonus(totalValue) {
    if (totalValue >= 20000) return 10; 
    if (totalValue >= 13000) return 8;  
    if (totalValue >= 8000)  return 6;  
    if (totalValue >= 4000)  return 5;  
    if (totalValue >= 2000)  return 4;  
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
    // Check balance before opening modal
    if (Number(wallet?.balance || 0) < settlementAmount) {
        refreshWallet().then(() => {
             // Re-check after refresh
             if (Number(wallet?.balance || 0) < settlementAmount) {
                 toast.error("INSUFFICIENT LIQUIDITY: Please fund your settlement account.");
             } else {
                 setShowModal(true);
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
            user_id: user.id, // Backend will also verify this against token
            product_id: product.id,
            quantity: Number(quantity),
            type: "liquidation_acquisition",
            details: { size: selectedSize } 
        });
        
        // Optimistic Update
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
    <div className="min-h-screen bg-slate-50 pb-44 md:pb-20 font-sans text-slate-800">
      
      {/* 1. TOP NAV */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-12 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-wide text-slate-500 overflow-hidden whitespace-nowrap">
              <Link to="/products" className="hover:text-emerald-700 flex items-center gap-1 transition-colors shrink-0">
                 <FaArrowLeft /> <span className="hidden md:inline">MASTER_INVENTORY</span> <span className="md:hidden">BACK</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="truncate">ID: {id ? id.substring(0,8).toUpperCase() : '...'}</span>
              <span className="text-slate-300 hidden md:inline">/</span>
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm hidden md:inline">STATUS: LIVE</span>
           </div>
           <div className="flex gap-2 shrink-0">
              <button className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded-sm transition">
                 <FaFilePdf /> <span className="hidden md:inline">Tech_Report.pdf</span><span className="md:hidden">PDF</span>
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        
        {/* 2. MAIN HEADER */}
        <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2 leading-tight">
               {product.title}
            </h1>
            
            <div className="flex overflow-x-auto no-scrollbar items-center gap-4 md:gap-6 text-xs text-slate-600 border-b border-slate-200 pb-4 md:pb-6 whitespace-nowrap">
                <div className="flex items-center gap-2 shrink-0">
                   <span className="font-mono font-bold text-slate-400 uppercase">Origin</span>
                   <span className="flex items-center gap-1 font-semibold text-slate-800"><FaGlobeAmericas size={10} /> {product.country || "Global"}</span>
                </div>
                <div className="h-4 w-px bg-slate-300 shrink-0"></div>
                <div className="flex items-center gap-2 shrink-0">
                   <span className="font-mono font-bold text-slate-400 uppercase">Condition</span>
                   <span className="font-semibold text-slate-800">Factory New (A-Grade)</span>
                </div>
                <div className="h-4 w-px bg-slate-300 shrink-0"></div>
                <div className="flex items-center gap-2 shrink-0">
                   <span className="font-mono font-bold text-slate-400 uppercase">Inspection</span>
                   <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100">
                      <FaShieldAlt size={10} />
                      <span className="font-bold">VERIFIED</span>
                   </div>
                </div>
                <div className="h-4 w-px bg-slate-300 shrink-0"></div>
                <div className="flex items-center gap-2 shrink-0">
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
           <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <ProductGallery gallery={product.gallery} title={product.title} />

              {/* COLORS */}
              {product.colors && product.colors.length > 0 && (
                 <div className="bg-white border border-slate-200 rounded-sm p-4 md:p-6 shadow-sm">
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

              {/* === MOBILE-ONLY: PRICING & FINANCE SECTION === */}
              {/* 1. Volume Pricing Tiers (Mobile) */}
              <div className="lg:hidden bg-white border border-slate-200 rounded-sm shadow-sm p-4">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Volume Pricing</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">LIVE MARKET DATA</span>
                 </div>
                 {sortedTiers.length > 0 ? (
                    <div className="border border-slate-200 rounded-sm overflow-hidden">
                       {sortedTiers.map((tier, idx) => {
                          const isActive = activeTier && activeTier.min === tier.min;
                          return (
                             <div key={idx} className={`flex justify-between items-center px-3 py-3 border-b border-slate-100 last:border-0 ${isActive ? 'bg-emerald-50' : 'bg-white'}`}>
                                <div className="flex items-center gap-2">
                                   {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                                   <span className={`text-xs font-mono ${isActive ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>≥ {tier.min} units</span>
                                </div>
                                <span className={`text-sm font-mono ${isActive ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                   ${Number(tier.price).toFixed(2)}
                                </span>
                             </div>
                          );
                       })}
                    </div>
                 ) : (
                    <div className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded">Standard market rate applies for all volumes.</div>
                 )}
              </div>

              {/* 2. Financial Breakdown (Mobile) */}
              <div className="lg:hidden bg-white border border-slate-200 rounded-sm shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold uppercase text-slate-500">Financial Breakdown</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">ESTIMATED</span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-500">
                          <span>Market Gross ({quantity}x)</span>
                          <span className="line-through font-mono">${marketTotal.toFixed(2)}</span>
                      </div>
                      
                      {volumeSavings > 0 && (
                          <div className="flex justify-between text-emerald-600">
                              <span>Volume Savings</span>
                              <span className="font-mono">-${volumeSavings.toFixed(2)}</span>
                          </div>
                      )}

                      {adminDiscount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                              <span>Batch Incentive ({adminDiscount}%)</span>
                              <span className="font-mono">-${adminDiscountAmount.toFixed(2)}</span>
                          </div>
                      )}

                      {vipBonus > 0 && (
                          <div className="flex justify-between text-blue-600">
                              <span>VIP Tier Bonus ({vipBonus}%)</span>
                              <span className="font-mono">-${vipBonusAmount.toFixed(2)}</span>
                          </div>
                      )}
                      
                      <div className="border-t border-slate-200 my-2"></div>
                      
                      <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700 uppercase">Net Settlement</span>
                          <span className="text-xl font-bold text-slate-900">${settlementAmount.toFixed(2)}</span>
                      </div>

                      <div className="bg-emerald-50 p-2 rounded text-center mt-2 border border-emerald-100">
                          <span className="text-emerald-800 font-bold block text-[10px] uppercase">Projected Profit Margin</span>
                          <span className="text-emerald-600 font-mono text-lg font-bold">+{margin}%</span>
                      </div>
                  </div>
              </div>

              {/* SPECS */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
                 <div className="bg-slate-100/50 px-4 md:px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">Technical Specifications</h3>
                    <span className="text-[10px] font-mono text-slate-400">REF: SPEC-Sheet-V2</span>
                 </div>
                 <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 md:gap-y-4">
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
                    <div className="mt-6 md:mt-8 pt-6 border-t border-slate-100">
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

           {/* RIGHT COLUMN: Desktop Only Action Card */}
           <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-24">
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
                    {/* TIER LIST */}
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
                       {/* Desktop Size Selector */}
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
                 </div>
              </div>
           </div>

        </div>

        {/* 4. MOBILE STICKY FOOTER (Custom Dropdown UPWARDS) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
           <div className="p-4 space-y-3">
              
              {/* Inputs Row */}
              <div className="flex gap-3">
                 <div className="flex-1">
                    <input 
                       type="number" 
                       value={quantity}
                       onChange={handleQuantityChange}
                       onBlur={handleQuantityBlur}
                       className="w-full border border-slate-300 px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none rounded-sm bg-white"
                    />
                 </div>
                 
                 {/* Custom Dropdown */}
                 {product.sizes && product.sizes.length > 0 && (
                    <div className="flex-1 relative">
                       {/* Trigger */}
                       <button 
                          onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
                          className="w-full border border-slate-300 px-3 py-2 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none rounded-sm bg-white flex justify-between items-center"
                       >
                          <span className="truncate">{selectedSize}</span>
                          <FaChevronUp size={10} className={`text-slate-400 transition-transform ${isSizeMenuOpen ? 'rotate-180' : ''}`} />
                       </button>

                       {/* Menu (Pops UP) */}
                       {isSizeMenuOpen && (
                          <>
                             <div className="fixed inset-0 z-30" onClick={() => setIsSizeMenuOpen(false)}></div>
                             <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-slate-300 shadow-xl rounded-sm z-40 max-h-48 overflow-y-auto">
                                {product.sizes.map((s, i) => (
                                   <button
                                      key={i}
                                      onClick={() => {
                                         setSelectedSize(s.name);
                                         setIsSizeMenuOpen(false);
                                      }}
                                      className={`w-full text-left px-3 py-3 text-xs font-mono border-b border-slate-100 last:border-0 hover:bg-slate-50 flex justify-between items-center ${
                                         selectedSize === s.name ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                                      }`}
                                   >
                                      {s.name}
                                      {selectedSize === s.name && <FaCheckCircle size={10} />}
                                   </button>
                                ))}
                             </div>
                          </>
                       )}
                    </div>
                 )}
              </div>

              {/* Action Button */}
              <div className="flex gap-3 items-center">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Total Due</span>
                      <span className="text-xl font-mono font-bold text-slate-900">${settlementAmount.toFixed(0)}</span>
                  </div>
                  
                  {isVerified ? (
                     <button 
                        onClick={handleOpenTicket}
                        disabled={executing || isInvalidQuantity}
                        className={`flex-1 font-bold py-3.5 rounded-sm shadow-md transition-all flex justify-center items-center gap-2 text-xs tracking-widest uppercase ${
                           isInvalidQuantity 
                           ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                           : "bg-emerald-600 active:bg-emerald-700 text-white"
                        }`}
                     >
                        {executing ? "PROCESSING..." : "Procure Now"}
                     </button>
                  ) : (
                     <Link to="/kyc-verification" className="flex-1 flex items-center justify-center bg-slate-800 text-white font-bold py-3.5 rounded-sm active:bg-slate-700 text-xs uppercase tracking-widest">
                        <FaLock className="mr-2" /> Unlock
                     </Link>
                  )}
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