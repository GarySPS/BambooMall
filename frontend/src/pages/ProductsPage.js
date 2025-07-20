import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { fetchProducts } from "../utils/api";
import { getProductImage } from "../utils/image"; // Use universal image helper

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-green-700 text-xl font-bold">
        Loading products…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-60 text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-2">
      <h2 className="text-2xl font-extrabold text-green-700 mb-3">All Products</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative bg-white rounded-xl shadow group flex flex-col items-stretch pb-3"
          >
            {/* Discount Badge */}
            {Number(product.discount) > 0 && (
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded z-10 shadow">
                -{product.discount}%
              </span>
            )}

            {/* Product Image & Link */}
            <Link to={`/products/${product.id}`} className="flex-1 flex items-center justify-center px-1 pt-3">
              <img
                src={getProductImage(product)}
                alt={product.title || "Product"}
                className="object-contain w-24 h-24 transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Price and Add Button */}
            <div className="flex flex-row items-center justify-between px-2 mt-2 mb-0.5">
              <span className="font-extrabold text-green-700 text-lg">
                ${Number(product.price).toFixed(2)}
              </span>
              <button
                className="bg-green-100 hover:bg-green-600 hover:text-white text-green-700 rounded-full w-8 h-8 flex items-center justify-center shadow transition"
                // onClick={} // TODO: Add to cart action
              >
                <FaPlus size={16} />
              </button>
            </div>

            {/* Title */}
            <Link to={`/products/${product.id}`} className="block px-2 text-xs text-gray-800 font-semibold line-clamp-2 leading-tight mt-1 hover:underline">
              {product.title}
            </Link>
            {/* Sub-info (optional) */}
            {product.size && (
              <div className="px-2 text-[10px] text-gray-400">{product.size}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
