// src/pages/ProductsPage.js

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaSpinner, 
  FaFilePdf, 
  FaLayerGroup,
  FaChevronRight,
  FaGlobeAsia
} from "react-icons/fa";
import { fetchProducts } from "../utils/api";
import { getProductImage } from "../utils/image";
import RestrictedContent from "../components/RestrictedContent";

// --- HELPER UTILS ---

const formatCurrency = (val) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatNumber = (val) => 
  new Intl.NumberFormat('en-US').format(val);

const getGradeStyles = (grade) => {
  const normalized = (grade || "").toLowerCase();
  
  if (normalized === "a" || normalized.includes("grade a")) {
    return { 
      label: "GRADE A", 
      style: "bg-emerald-100 text-emerald-800 border-emerald-200", // Darker text for readability
      dot: "bg-emerald-600" 
    };
  }
  if (normalized === "overstock" || normalized === "liquidation") {
    return { 
      label: "LIQUIDATION", 
      style: "bg-amber-100 text-amber-800 border-amber-200", 
      dot: "bg-amber-600" 
    };
  }
  return { 
    label: "REFURB / B", 
    style: "bg-slate-100 text-slate-700 border-slate-300", 
    dot: "bg-slate-500" 
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Manifest Load Error", err);
        setLoading(false);
      });
  }, []);

  // 1. Process data: Just add the Batch ID. 
  const processedProducts = useMemo(() => {
    return products.map((p, i) => ({
      ...p,
      batchId: `BATCH-CN-${202600 + i}` 
    }));
  }, [products]);

  // 2. Filter using the NEW processed list
  const filteredProducts = useMemo(() => {
    return processedProducts.filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id && p.id.toString().includes(searchTerm)) ||
      p.batchId.toLowerCase().includes(searchTerm.toLowerCase()) // Now searchable
    );
  }, [processedProducts, searchTerm]);

  // Total Volume for Header
  const totalVolume = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <FaSpinner className="animate-spin text-4xl mb-4 text-blue-900" />
        <span className="font-mono text-sm uppercase tracking-widest font-bold">Loading Inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto">
      
      {/* 1. DASHBOARD HEADER (Larger & clearer) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 px-1">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
              <span className="bg-slate-900 text-white p-3 rounded-xl shadow-md">
                <FaLayerGroup size={24} />
              </span>
              Master Manifest
            </h2>
            <div className="flex items-center gap-4 mt-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                LIVE FEED
              </span>
              <span className="text-slate-300">|</span>
              <span>REGION: CN-SOUTH-1</span>
            </div>
         </div>

         {/* Metrics (Big & Bold) */}
         <div className="flex gap-4 w-full md:w-auto">
            {/* Total Lots removed */}
            
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm w-full md:min-w-[200px]">
               <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Active Vol</div>
               {/* Fixed: text-xl on mobile to prevent overflow, text-3xl on desktop */}
               <div className="text-xl md:text-3xl font-mono font-bold text-slate-800 truncate">
                 {formatNumber(totalVolume)}
               </div>
            </div>
         </div>
      </div>

      {/* 2. CONTROL BAR (Taller inputs) */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3">
         <div className="relative flex-1">
           <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
           <input
             type="text"
             placeholder="Search by SKU, Batch ID, or Asset Name..."
             className="w-full h-14 pl-14 pr-6 bg-transparent text-lg font-medium focus:outline-none text-slate-700 placeholder:text-slate-400"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         <button className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold rounded-lg transition-colors flex items-center justify-center gap-3 shadow-md">
            <FaFilter />
            <span>Filter Results</span>
         </button>
      </div>

      {/* 3. DATA DISPLAY (Responsive Switch) */}
      <RestrictedContent>
        
        {/* === A. MOBILE CARD VIEW (Visible on < md screens) === */}
        <div className="md:hidden grid gap-4">
          {filteredProducts.map((product, index) => {
            const gradeInfo = getGradeStyles(product.grade);
            
            return (
              <div key={product.id || index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
                
                {/* Card Header: Batch & Location */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <span className="font-mono text-xs text-slate-400 font-semibold tracking-wide bg-slate-50 px-2 py-1 rounded">
                    {product.batchId}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <FaGlobeAsia /> Shenzhen, CN
                  </div>
                </div>

                {/* Main Content: Image & Title */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 p-1 flex-shrink-0">
                    <img 
                      src={getProductImage(product)} 
                      alt="thumb" 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to={`/products/${product.id}`} className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">
                      {product.title}
                    </Link>
                    {/* Grade Pill */}
                    <span className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${gradeInfo.style}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${gradeInfo.dot}`}></span>
                      {gradeInfo.label}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Ask Price</div>
                    <div className="font-mono text-lg font-bold text-slate-900">{formatCurrency(product.price)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Volume</div>
                    <div className="font-mono text-sm font-medium text-slate-600">{formatNumber(product.stock || 500)} Units</div>
                  </div>
                </div>

                {/* Action Button */}
                <Link 
                  to={`/products/${product.id}`}
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Manifest Details <FaChevronRight size={12} />
                </Link>

              </div>
            );
          })}

          {/* Mobile Pagination Placeholder */}
          <div className="text-center py-4 text-xs text-slate-400 font-mono uppercase">
             Showing {filteredProducts.length} Records
          </div>
        </div>

        {/* === B. DESKTOP TABLE VIEW (Hidden on Mobile) === */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 font-bold">Asset Preview</th>
                  <th className="px-8 py-5 font-bold">Description / Batch</th>
                  <th className="px-8 py-5 font-bold">Grade</th>
                  <th className="px-8 py-5 font-bold text-right">Volume</th>
                  <th className="px-8 py-5 font-bold text-right">Ask Price (FOB)</th>
                  <th className="px-8 py-5 font-bold text-center">Discount</th>
                  <th className="px-8 py-5 font-bold text-right">Action</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product, index) => {
                  const gradeInfo = getGradeStyles(product.grade);

                  return (
                    <tr key={product.id || index} className="hover:bg-blue-50/50 transition-colors group">
                      
                      {/* Image */}
                      <td className="px-8 py-6 align-middle w-[120px]">
                        <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                           <img 
                             src={getProductImage(product)} 
                             alt="thumb" 
                             className="w-full h-full object-contain mix-blend-multiply"
                           />
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-8 py-6 align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs text-slate-400 font-semibold tracking-wide">
                              {product.batchId}
                            </span>
                            <Link to={`/products/${product.id}`} className="text-lg font-bold text-slate-800 hover:text-blue-700 transition-colors">
                              {product.title}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                               <FaGlobeAsia className="text-slate-400" />
                               Shenzhen, CN
                            </div>
                          </div>
                      </td>

                      {/* Grade */}
                      <td className="px-8 py-6 align-middle">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${gradeInfo.style}`}>
                            <span className={`w-2 h-2 rounded-full ${gradeInfo.dot}`}></span>
                            {gradeInfo.label}
                          </span>
                      </td>

                      {/* Stock */}
                      <td className="px-8 py-6 align-middle text-right">
                          <div className="font-mono text-base text-slate-600 font-medium">
                            {formatNumber(product.stock || 500)}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Units</div>
                      </td>

                      {/* Price */}
                      <td className="px-8 py-6 align-middle text-right">
                          <div className="font-mono text-xl font-bold text-slate-900">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Per Unit</div>
                      </td>

                      {/* Discount */}
                      <td className="px-8 py-6 align-middle text-center">
                          {product.discount ? (
                            <span className="inline-block bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                               {product.discount}% OFF
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-xs">-</span>
                          )}
                      </td>

                      {/* Action */}
                      <td className="px-8 py-6 align-middle text-right">
                          <Link 
                            to={`/products/${product.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-700 text-slate-700 text-sm font-bold rounded-lg transition-all"
                          >
                            Details <FaChevronRight size={12} />
                          </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500 font-mono">
              <span className="font-medium">DISPLAYING {filteredProducts.length} RECORDS</span>
              <div className="flex gap-3">
                 <button disabled className="px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-400 font-bold text-xs uppercase cursor-not-allowed">Previous</button>
                 <button className="px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-100 hover:border-slate-400 text-slate-700 font-bold text-xs uppercase shadow-sm">Next Page</button>
              </div>
          </div>
        </div>
      </RestrictedContent>

    </div>
  );
}