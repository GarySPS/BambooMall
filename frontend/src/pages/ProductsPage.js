//src>pages>ProductsPage.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter, FaBolt, FaSpinner } from "react-icons/fa";
import { fetchProducts } from "../utils/api";
import { getProductImage } from "../utils/image";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "API error");
        setLoading(false);
      });
  }, []);

  // Client-side filtering
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-green-800 bg-gray-50">
        <FaSpinner className="animate-spin text-3xl mb-3" />
        <span className="font-semibold animate-pulse">Loading Catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold bg-gray-50">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-24 bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "url(/productimage.jpg)" }}
    >
      {/* Sticky Header & Search */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-green-900 mb-4 flex items-center gap-2">
            <FaBolt className="text-yellow-400" /> Factory Deals
          </h2>
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-100 text-gray-800 rounded-2xl py-3 pl-12 pr-12 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-inner border border-transparent focus:border-green-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm text-gray-500 hover:text-green-700 transition-colors">
               <FaFilter size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-2xl mx-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No products found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Image Area */}
<Link to={`/products/${product.id}`} className="relative aspect-square p-4 bg-gray-50/50 overflow-hidden">
                  {Number(product.discount) > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10">
                      -{product.discount}%
                    </span>
                  )}
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>

                {/* Content Area */}
                <div className="p-3 flex flex-col flex-1">
                  <Link 
                    to={`/products/${product.id}`} 
                    className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-3 hover:text-green-700 transition-colors"
                  >
                    {product.title}
                  </Link>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                       {Number(product.discount) > 0 && (
                         <div className="text-[10px] text-gray-400 line-through font-medium">
                            ${(Number(product.price) * (1 + product.discount/100)).toFixed(2)}
                         </div>
                       )}
                       <div className="text-lg font-extrabold text-green-700 leading-none">
                          ${Number(product.price).toFixed(2)}
                       </div>
                    </div>
                    <button className="bg-green-50 text-green-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95">
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}