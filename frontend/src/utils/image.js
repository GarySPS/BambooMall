const SUPABASE_BUCKET_URL = "https://phaktukzistesdrvqtwj.supabase.co/storage/v1/object/public/products/";
const SUPABASE_DEFAULT_IMAGE = SUPABASE_BUCKET_URL + "A.png";

export function getProductImage(product) {
  let filename = null;
  if (!product) return SUPABASE_DEFAULT_IMAGE;
  // Array format
  if (Array.isArray(product.images) && product.images.length > 0) {
    filename = product.images[0];
  }
  // JSON string or plain string
  else if (typeof product.images === "string") {
    let trimmed = product.images.trim();
    if (trimmed.startsWith("[")) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr) && arr.length > 0) filename = arr[0];
      } catch {}
    } else if (trimmed.length > 0) {
      filename = trimmed;
    }
  }
  if (!filename) return SUPABASE_DEFAULT_IMAGE;
  if (filename.startsWith("http")) return filename;
  return SUPABASE_BUCKET_URL + filename;
}
