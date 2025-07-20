// Robust: always get image from string or array (["/upload/A.png"]) or fallback
export function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  if (typeof product.images === "string") {
    if (product.images.trim().startsWith("[")) {
      try {
        const arr = JSON.parse(product.images);
        if (Array.isArray(arr) && arr.length > 0) return arr[0];
      } catch { /* ignore */ }
    }
    if (product.images.trim().length > 0) return product.images.trim();
  }
  return "/upload/A.png"; // fallback default
}
