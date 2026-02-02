// src/pages/ProductsPage.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaSpinner, 
  FaFilePdf, 
  FaBox, 
  FaGlobeAsia
} from "react-icons/fa";
import { fetchProducts } from "../utils/api";
import { getProductImage } from "../utils/image";
// REMOVED: import { useUser } ... (RestrictedContent handles the user check now)
import RestrictedContent from "../components/RestrictedContent"; // <--- ADD THIS

export default function ProductsPage() {
  // REMOVED: const { user } = useUser(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // REMOVED: const isVerified = ... (Logic moved to RestrictedContent)

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

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <FaSpinner className="animate-spin text-2xl mb-3 text-blue-900" />
        <span className="font-mono text-xs uppercase tracking-widest">Retrieving Warehouse Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HEADER: The "Control Bar" (Visible to everyone) */}
      <div className="bg-white p-4 rounded shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaBox className="text-blue-900" /> 
              Master Inventory Manifest
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              REGION: CN-SOUTH-1 // TOTAL LOTS: {products.length}
            </p>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xs" />
              <input
                type="text"
                placeholder="Search Batch ID or SKU..."
                className="w-full bg-slate-50 text-slate-800 text-sm rounded border border-slate-200 py-2 pl-9 pr-4 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all font-mono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors">
               <FaFilter size={14} />
            </button>
         </div>
      </div>

      {/* 2. DATA TABLE: WRAPPED IN RESTRICTED CONTENT */}
      {/* If unverified, this entire block is blurred with a lock card on top */}
      <RestrictedContent>
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden relative min-h-[500px]">
        
          {/* REMOVED: Old Locked Overlay Div */}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 w-16">Img</th>
                  <th className="px-6 py-3">Batch ID / Description</th>
                  <th className="px-6 py-3">Origin</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Stock (Units)</th>
                  <th className="px-6 py-3 text-right">Unit Cost (FOB)</th>
                  <th className="px-6 py-3 text-center">Docs</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              
              {/* REMOVED: className `blur-sm` logic */}
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* Image */}
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                         <img 
                           src={getProductImage(product)} 
                           alt="thumb" 
                           className="w-full h-full object-cover mix-blend-multiply"
                         />
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-3">
                       <div className="font-mono text-xs text-blue-600 font-bold">
                          {`BATCH-CN-${202600 + index}`}
                       </div>
                       <Link to={`/products/${product.id}`} className="font-bold text-slate-700 hover:underline hover:text-blue-800 block truncate max-w-[200px]">
                          {product.title}
                       </Link>
                    </td>

                    {/* Origin */}
                    <td className="px-6 py-3 text-slate-500 text-xs">
                       <div className="flex items-center gap-1">
                          <FaGlobeAsia className="text-slate-400" />
                          Shenzhen, CN
                       </div>
                    </td>

                    {/* Grade */}
                    <td className="px-6 py-3">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                         index % 3 === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                         index % 3 === 1 ? "bg-blue-50 text-blue-700 border-blue-100" :
                         "bg-amber-50 text-amber-700 border-amber-100"
                       }`}>
                          {index % 3 === 0 ? "GRADE A" : index % 3 === 1 ? "OVERSTOCK" : "GRADE B"}
                       </span>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-3 font-mono text-slate-600">
                       {product.stock || 500}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">
                       ${Number(product.price).toFixed(2)}
                    </td>

                    {/* Docs */}
                    <td className="px-6 py-3 text-center">
                       <button className="text-slate-400 hover:text-red-500 transition-colors">
                          <FaFilePdf />
                       </button>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-3 text-right">
                       <Link 
                         to={`/products/${product.id}`}
                         className="text-xs font-bold text-blue-900 hover:underline"
                       >
                         View Lot Details
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
             <span>Showing {filteredProducts.length} entries</span>
             <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">Next</button>
             </div>
          </div>

        </div>
      </RestrictedContent>

    </div>
  );
}