import React from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../utils/api";

// Helper: get product image from array or string or fallback
function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  if (typeof product.images === "string") {
    if (product.images.trim().startsWith("[")) {
      try {
        const arr = JSON.parse(product.images);
        if (Array.isArray(arr) && arr.length > 0) return arr[0];
      } catch {}
    }
    if (product.images.trim().length > 0) return product.images.trim();
  }
  return "/upload/A.png"; // fallback if nothing
}

function ProductGrid({ items }) {
  return (
    <div className="pt-2 pb-10 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-6">Bulk Product Packs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center border border-green-100 hover:shadow-2xl transition"
          >
            <div className="relative w-32 h-32 mb-2">
              <img
                src={getProductImage(product)}
                alt={product.title}
                className="object-contain w-full h-full rounded-xl"
              />
              {product.discount > 0 && (
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xl">{product.logo}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full">
                {product.country}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-1 text-center">{product.title}</h3>
            <div className="text-sm text-green-600 mb-1">{product.supplier}</div>
            <div className="text-xs text-green-500 mb-1">{product.type} • Min. {product.minQty} pcs</div>
            <div className="font-bold text-green-700 text-lg mb-3">${product.price}</div>
            <Link
              to={`/products/${product.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-green-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [popularItems, setPopularItems] = React.useState([]);
  React.useEffect(() => {
    fetchProducts().then(data => setPopularItems(data.slice(0, 6)));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Hero / Welcome Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 pt-6">
        <h1 className="text-5xl font-extrabold text-green-700 mb-4 drop-shadow">BambooMall</h1>
        <p className="max-w-xl text-xl text-green-700 mb-8 animate-pulse">
          Real Factory Goods. Exclusive Discounts. Profitable Resale.
        </p>
        <Link
          to="/products"
          className="bg-green-600 text-white rounded-full px-8 py-3 font-semibold text-lg shadow-xl hover:bg-green-700 transition"
        >
          Browse Products
        </Link>
      </main>

      {/* Product Grid Section */}
      <section id="products">
        <ProductGrid items={popularItems} />
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-green-700/60 text-sm">
        &copy; {new Date().getFullYear()} BambooMall. All rights reserved.
      </footer>
    </div>
  );
}