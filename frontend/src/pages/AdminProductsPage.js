//src>pages>AdminProductsPage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaExclamationTriangle,
  FaLock
} from "react-icons/fa";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. Load Inventory with Token ---
  const loadInventory = async () => {
    setLoading(true);
    try {
      // We use the public endpoint, but you can add headers if your backend filters hidden items
      const res = await fetch(`${API_BASE_URL}/products`);
      let data = await res.json();
      
      // Safety check if API returns object instead of array
      if (data.products) data = data.products; 
      if (!Array.isArray(data)) data = [];
      
      setProducts(data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // --- 2. Handle Delete (New Logic) ---
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication missing");

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: { 
            "Authorization": `Bearer ${token}` // <--- Token Required to Delete
        }
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Remove from list locally
      setProducts(prev => prev.filter(p => p.id !== id));

    } catch (error) {
      alert("Error deleting product: " + error.message);
    }
  };

  // --- 3. Filter Logic ---
  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.includes(searchTerm)
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 text-slate-800 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold flex items-center gap-2">
             <FaBox className="text-blue-900" /> Master Inventory Control
           </h1>
           <p className="text-xs text-slate-500 font-mono mt-1">
             TOTAL SKUs: {products.length} // VALUATION: ${products.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0).toLocaleString()}
           </p>
        </div>
        <Link 
          to="/admin/products/create" 
          className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded text-sm font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg"
        >
          <FaPlus /> Ingest New Lot
        </Link>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-sm mb-6 flex gap-4">
        <div className="relative flex-1">
           <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search Manifest (SKU, Name)..." 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500"
           />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase border-b border-slate-200">
             <tr>
               <th className="px-6 py-3 w-16">Img</th>
               <th className="px-6 py-3">Lot Details</th>
               <th className="px-6 py-3">Unit Price</th>
               <th className="px-6 py-3 text-center">Min Order</th>
               <th className="px-6 py-3 text-center">Stock Level</th>
               <th className="px-6 py-3">Supplier</th>
               <th className="px-6 py-3 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {loading ? (
               <tr><td colSpan="7" className="p-10 text-center text-slate-400">Loading Manifest...</td></tr>
             ) : filteredProducts.map(product => (
               <tr key={product.id} className="hover:bg-slate-50 group transition-colors">
                 {/* Image */}
                 <td className="px-6 py-3">
                    <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                       <img 
                         src={product.images && product.images[0] ? product.images[0] : "https://via.placeholder.com/50"} 
                         className="w-full h-full object-cover mix-blend-multiply" 
                         alt="" 
                       />
                    </div>
                 </td>
                 
                 {/* Title & ID */}
                 <td className="px-6 py-3">
                    <div className="font-bold text-slate-700 truncate max-w-md">{product.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                       ID: {product.id ? product.id.substring(0,8).toUpperCase() : '...'}
                    </div>
                 </td>

                 {/* Price */}
                 <td className="px-6 py-3 font-mono">
                    ${Number(product.price).toFixed(2)}
                 </td>

                 {/* Min Order */}
                 <td className="px-6 py-3 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-bold text-slate-600">
                        <FaLock size={10} className="text-slate-400" />
                        {product.min_order || 1}
                    </div>
                 </td>

                 {/* Stock Status */}
                 <td className="px-6 py-3 text-center">
                    {product.stock < 10 ? (
                       <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                          <FaExclamationTriangle /> Low: {product.stock}
                       </span>
                    ) : (
                       <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold font-mono border border-emerald-100">
                          {product.stock} Units
                       </span>
                    )}
                 </td>

                 {/* Supplier */}
                 <td className="px-6 py-3 text-slate-500 text-xs">
                    {product.supplier || "N/A"}
                 </td>

                 {/* Actions */}
                 <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Link 
                         to={`/admin/products/edit/${product.id}`}
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                         title="Edit Manifest"
                       >
                          <FaEdit />
                       </Link>
                       <button 
                         onClick={() => handleDelete(product.id)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded" 
                         title="Delete Product"
                       >
                          <FaTrash />
                       </button>
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

    </div>
  );
}