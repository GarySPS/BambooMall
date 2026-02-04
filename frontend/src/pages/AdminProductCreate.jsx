// src/pages/AdminProductCreate.jsx

import React, { useState } from 'react';
import { createProduct } from '../utils/api';
import { FaPlus, FaTrash, FaSave, FaImage, FaBoxOpen, FaListUl, FaDollarSign, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function AdminProductCreate() {
  const [loading, setLoading] = useState(false);
  
  // --- STATE: Basic Fields ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    // [REMOVED] min_order - We now rely on Price Tiers for this
    stock: 5000,
    discount: 0,
    brand: '',
    supplier: 'Direct Factory',
    country: 'China',
    factory_url: '',
    
    // [NEW] Added color_input
    size_input: '', 
    color_input: '', 
    
    rating: 4.8,
    review_count: 120 
  });

  // --- STATE: Complex Arrays ---
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState('');
  
  const [specs, setSpecs] = useState([]); 
  const [specInput, setSpecInput] = useState({ label: '', value: '' });

  const [tiers, setTiers] = useState([]); 
  const [tierInput, setTierInput] = useState({ min: '', price: '' });

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addImage = () => {
    if (!imageInput) return;
    setImages([...images, imageInput]);
    setImageInput('');
  };
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    if (!specInput.label || !specInput.value) return;
    setSpecs([...specs, specInput]);
    setSpecInput({ label: '', value: '' });
  };
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const addTier = () => {
    if (!tierInput.min || !tierInput.price) return;
    setTiers([...tiers, { min: parseInt(tierInput.min), price: parseFloat(tierInput.price) }]);
    setTierInput({ min: '', price: '' });
  };
  const removeTier = (index) => setTiers(tiers.filter((_, i) => i !== index));

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Transform Sizes
      let sizeJson = [];
      if (formData.size_input) {
        sizeJson = formData.size_input.split(',').map(s => ({ 
            name: s.trim(), 
            price_adjust: 0 
        }));
      } else {
        sizeJson = [{ name: "One Size", price_adjust: 0 }];
      }

      // 2. Transform Colors
      let colorJson = [];
      if (formData.color_input) {
        colorJson = formData.color_input.split(',').map(c => ({ 
            name: c.trim(), 
            // We link the color to the first image as a placeholder
            image: images[0] || "" 
        }));
      } else {
        colorJson = [{ name: "Standard", image: images[0] || "" }];
      }

      // 3. Transform Specs
      const attributesJson = specs.map(s => ({ [s.label]: s.value }));

      // 4. Prepare Payload
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        // [REMOVED] min_order: parseInt(formData.min_order),
        stock: parseInt(formData.stock),
        discount: parseFloat(formData.discount),
        brand: formData.brand || 'OEM',
        supplier: formData.supplier,
        country: formData.country, 
        factory_url: formData.factory_url,
        
        images: images,
        gallery: images, 
        size: sizeJson,
        color: colorJson, 
        key_attributes: attributesJson,
        price_tiers: tiers, // This is now the source of truth for Min Order
        
        rating: parseFloat(formData.rating),
        review_count: parseInt(formData.review_count),
        
        logo: null,
        reviews: null
      };

      await createProduct(payload);

      toast.success("Product Created Successfully!");
      
      // Reset Form
      setImages([]);
      setSpecs([]);
      setTiers([]);
      // Keep handy fields for next entry
      setFormData({ ...formData, title: '', price: '' });

    } catch (err) {
      console.error(err);
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FaBoxOpen className="text-[#17604e]" /> Create Master Product
           </h1>
           <p className="text-slate-500 text-sm">Add inventory directly to the global database.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-[#17604e] hover:bg-[#0f4638] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
        >
          {loading ? "Processing..." : <><FaSave /> PUBLISH TO MARKET</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- LEFT COLUMN --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2">Product Identity</h3>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Product Title</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="e.g. Men's Tactical Cargo Pants" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md" placeholder="Full product details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Brand</label>
                  <input name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="e.g. OEM" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Origin Country</label>
                  <input name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded-md" />
               </div>
            </div>
          </div>

          {/* Specs & Tiers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
              
              {/* Key Attributes */}
              <div>
                 <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2 mb-3 flex items-center gap-2">
                   <FaListUl /> Technical Specs (Key Attributes)
                 </h3>
                 <div className="flex gap-2 mb-3">
                    <input value={specInput.label} onChange={(e) => setSpecInput({...specInput, label: e.target.value})} className="flex-1 p-2 border rounded text-sm" placeholder="Name (e.g. Material)" />
                    <input value={specInput.value} onChange={(e) => setSpecInput({...specInput, value: e.target.value})} className="flex-1 p-2 border rounded text-sm" placeholder="Value (e.g. Cotton)" />
                    <button type="button" onClick={addSpec} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded"><FaPlus /></button>
                 </div>
                 <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                    {specs.map((s, i) => (
                       <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-slate-100">
                          <span className="font-bold text-slate-600">{s.label}: <span className="font-normal text-slate-800">{s.value}</span></span>
                          <button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600"><FaTrash size={12}/></button>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Pricing Tiers */}
              <div>
                 <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2 mb-3 flex items-center gap-2">
                   <FaDollarSign /> Bulk Pricing Tiers
                 </h3>
                 <p className="text-xs text-slate-500 mb-2">Note: The lowest tier quantity will automatically be set as the Minimum Order.</p>
                 <div className="flex gap-2 mb-3">
                    <input type="number" value={tierInput.min} onChange={(e) => setTierInput({...tierInput, min: e.target.value})} className="w-24 p-2 border rounded text-sm" placeholder="Min Qty" />
                    <input type="number" value={tierInput.price} onChange={(e) => setTierInput({...tierInput, price: e.target.value})} className="w-24 p-2 border rounded text-sm" placeholder="Price $" />
                    <button type="button" onClick={addTier} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded flex-1 text-xs font-bold">Add Tier</button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {tiers.map((t, i) => (
                       <div key={i} className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-100">
                          <strong>≥ {t.min} units:</strong> ${t.price}
                          <button type="button" onClick={() => removeTier(i)} className="text-emerald-400 hover:text-red-600 ml-1"><FaTimes size={10}/></button>
                       </div>
                    ))}
                 </div>
              </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="space-y-6">

          {/* Financials & Rating */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2">Financials</h3>
              
              {/* [REMOVED MOQ INPUT HERE] */}
              
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Base Price ($)</label>
                 <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-md font-mono" placeholder="0.00" />
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Total Stock</label>
                 <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded-md font-mono" />
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Discount Label (%)</label>
                 <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full p-2 border rounded-md font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Rating</label>
                   <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full p-2 border rounded-md font-mono" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Review Count</label>
                   <input type="number" name="review_count" value={formData.review_count} onChange={handleChange} className="w-full p-2 border rounded-md font-mono" />
                </div>
              </div>
          </div>

          {/* Sourcing */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2">Sourcing</h3>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Factory Link (Hidden)</label>
                 <input name="factory_url" value={formData.factory_url} onChange={handleChange} className="w-full p-2 border rounded-md text-xs text-slate-400" placeholder="https://alibaba.com/..." />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Supplier Name</label>
                 <input name="supplier" value={formData.supplier} onChange={handleChange} className="w-full p-2 border rounded-md" />
              </div>
              
              {/* Sizes */}
              <div className="pt-2">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Sizes (Comma Separated)</label>
                 <input name="size_input" value={formData.size_input} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="S, M, L, XL" />
              </div>

              {/* Colors Input */}
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Colors (Comma Separated)</label>
                 <input name="color_input" value={formData.color_input} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="Red, Blue, Matte Black" />
                 <p className="text-[10px] text-slate-400 mt-1">We will auto-format this.</p>
              </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2 flex items-center gap-2">
                <FaImage /> Image Gallery
              </h3>
              <div className="flex gap-2">
                <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 p-2 border rounded text-xs" placeholder="Paste Image URL" />
                <button type="button" onClick={addImage} className="bg-blue-50 text-blue-600 px-3 rounded font-bold text-xs">Add</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((url, i) => (
                  <div key={i} className="relative group aspect-square bg-slate-100 rounded overflow-hidden border">
                     <img src={url} alt="preview" className="w-full h-full object-cover" />
                     <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                  </div>
                ))}
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}