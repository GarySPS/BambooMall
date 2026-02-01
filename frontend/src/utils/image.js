// src/utils/image.js

const SUPABASE_BUCKET_URL = "https://phaktukzistesdrvqtwj.supabase.co/storage/v1/object/public/products/";
const DEFAULT_IMAGE = "/upload/A.png"; // Local fallback if all else fails

export function getProductImage(product) {
  if (!product) return DEFAULT_IMAGE;

  let filename = null;

  // 1. Check if 'images' is an Array (Supabase standard)
  if (Array.isArray(product.images) && product.images.length > 0) {
    filename = product.images[0];
  }
  
  // 2. Check if 'images' is a String (JSON or direct path)
  else if (typeof product.images === "string") {
    const raw = product.images.trim();
    
    // Is it a JSON array string? e.g. '["file.png"]'
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) filename = parsed[0];
      } catch (e) {
        // Parse failed, maybe it's just a filename?
      }
    } 
    
    // If not JSON, assume it is the filename
    if (!filename && raw.length > 0) {
      filename = raw;
    }
  }

  // 3. Check for 'gallery' array (Our new Analyst format)
  if (!filename && Array.isArray(product.gallery) && product.gallery.length > 0) {
    filename = product.gallery[0];
  }

  // 4. Return Final URL
  if (!filename) return DEFAULT_IMAGE;
  
  // If it's already a full link (e.g., from Alibaba), return it
  if (filename.startsWith("http")) return filename;
  
  // Otherwise, append your bucket URL
  return SUPABASE_BUCKET_URL + filename;
}
