/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, LogOut, PackageOpen, Camera, Image as ImageIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Product } from '../types.ts';
import { optimizeImageFile, formatFileSize } from '../utils/imageOptimizer.ts';

interface AdminDashboardViewProps {
  adminToken: string;
  onLogout: () => void;
  showToast: (message: string) => void;
  onRefreshProducts?: () => void;
}

interface ImagePreviewState {
  url: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
}

export default function AdminDashboardView({ adminToken, onLogout, showToast, onRefreshProducts }: AdminDashboardViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'women' as 'women' | 'men' | 'bags',
    subcategory: '',
    price: '',
    originalPrice: '',
    badge: 'None' as 'None' | 'Bestseller' | 'New' | 'Sale' | 'Exclusive',
    inStock: true,
    description: '',
    sizes: ['S', 'M', 'L', 'XL'] as string[],
    imageUrl: ''
  });

  // Base64 image payload properties (Add Modal)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<ImagePreviewState | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  // Editing image uploader properties (Edit Modal)
  const [editUploadFile, setEditUploadFile] = useState<File | null>(null);
  const [editUploadPreview, setEditUploadPreview] = useState<ImagePreviewState | null>(null);
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getEffectiveToken = () => {
    return adminToken || localStorage.getItem('nnepa_foriwaa_token') || '';
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    let cachedList: Product[] = [];
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          cachedList = parsed;
        }
      }
    } catch {}

    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const serverList: Product[] = data.products || [];
        
        // Find any local items missing from the server
        const missingOnServer = cachedList.filter(
          (c) => !serverList.some((s) => s.id === c.id)
        );

        const merged = [...missingOnServer, ...serverList];
        setProducts(merged);
        try {
          localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(merged));
        } catch {}
        onRefreshProducts?.();
      } else {
        if (cachedList.length > 0) {
          setProducts(cachedList);
        }
      }
    } catch {
      if (cachedList.length > 0) {
        setProducts(cachedList);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          onRefreshProducts?.();
          return;
        }
      }
    } catch {}
  };

  // Helper to handle image selection with automatic client-side optimization
  const processImageSelection = async (file: File): Promise<ImagePreviewState> => {
    try {
      const result = await optimizeImageFile(file, 1280, 0.82);
      return {
        url: result.dataUrl,
        name: file.name,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize
      };
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            name: file.name,
            originalSize: file.size,
            optimizedSize: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      const preview = await processImageSelection(file);
      setUploadPreview(preview);
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditUploadFile(file);
      const preview = await processImageSelection(file);
      setEditUploadPreview(preview);
    }
  };

  const uploadImageToServerOrDataUrl = async (fileToUpload: File, fallbackDataUrl?: string): Promise<string> => {
    const payloadUrl = fallbackDataUrl || (await processImageSelection(fileToUpload)).url;
    const effectiveToken = getEffectiveToken();
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: JSON.stringify({
          filename: fileToUpload.name,
          base64Data: payloadUrl
        })
      });
      if (res.ok) {
        const uploadResult = await res.json();
        if (uploadResult.imageUrl) {
          return uploadResult.imageUrl;
        }
      }
    } catch {
      // Offline / static hosting fallback
    }
    return payloadUrl;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('⚠️ Name and Price are required.');
      return;
    }

    setLoading(true);
    let finalImageUrl = newProduct.imageUrl || 'https://images.pexels.com/photos/20799228/pexels-photo-20799228.jpeg';

    try {
      if (uploadFile) {
        setUploadingImage(true);
        showToast('📤 Optimizing & uploading photo...');
        finalImageUrl = await uploadImageToServerOrDataUrl(uploadFile, uploadPreview?.url);
        setUploadingImage(false);
      }

      const newProdItem: Product = {
        id: 'prod_' + Date.now(),
        name: newProduct.name,
        category: newProduct.category,
        subcategory: newProduct.subcategory || 'Ready-to-Wear',
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
        rating: 5,
        imageUrl: finalImageUrl,
        badge: newProduct.badge === 'None' ? undefined : newProduct.badge,
        inStock: newProduct.inStock,
        description: newProduct.description || `${newProduct.name} - Hand tailored custom West African garment crafted for royal elegance.`,
        sizes: newProduct.sizes && newProduct.sizes.length > 0 ? newProduct.sizes : ['S', 'M', 'L', 'XL']
      };

      // Server sync using effective token
      const effectiveToken = getEffectiveToken();
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveToken}`
          },
          body: JSON.stringify(newProdItem)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.product && data.product.id) {
            newProdItem.id = data.product.id;
          }
        }
      } catch (saveErr) {
        console.warn('Network notice saving product to server:', saveErr);
      }

      // Resilient local update: ensure new garment is in state and localStorage
      const updatedList = [newProdItem, ...products.filter((p) => p.id !== newProdItem.id)];
      setProducts(updatedList);
      try {
        localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(updatedList));
      } catch {}
      onRefreshProducts?.();

      showToast('🌟 Successfully listed luxury product');
      setIsAdding(false);
      setNewProduct({
        name: '',
        category: 'women',
        subcategory: '',
        price: '',
        originalPrice: '',
        badge: 'None',
        inStock: true,
        description: '',
        sizes: ['S', 'M', 'L', 'XL'],
        imageUrl: ''
      });
      setUploadFile(null);
      setUploadPreview(null);
    } catch (err: any) {
      showToast(`⚠️ Error adding product: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updatedStock = !product.inStock;
    const effectiveToken = getEffectiveToken();
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: JSON.stringify({ inStock: updatedStock })
      });
    } catch {}

    const updatedList = products.map((p) => (p.id === product.id ? { ...p, inStock: updatedStock } : p));
    setProducts(updatedList);
    try {
      localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(updatedList));
    } catch {}
    onRefreshProducts?.();
    showToast(`✏️ Updated "${product.name}" stock: ${updatedStock ? 'In Stock' : 'Out of Stock'}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    const effectiveToken = getEffectiveToken();
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${effectiveToken}`
        }
      });
    } catch {}

    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    try {
      localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(updatedList));
    } catch {}
    setConfirmDeleteId(null);
    onRefreshProducts?.();
    showToast('🗑 Product removed from catalogue');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    let finalImageUrl = editingProduct.imageUrl;

    try {
      if (editUploadFile) {
        setEditUploadingImage(true);
        showToast('📤 Optimizing & uploading photo...');
        finalImageUrl = await uploadImageToServerOrDataUrl(editUploadFile, editUploadPreview?.url);
        setEditUploadingImage(false);
      }

      const updatedProd: Product = {
        ...editingProduct,
        imageUrl: finalImageUrl,
        price: Number(editingProduct.price),
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
        badge: editingProduct.badge === 'None' ? undefined : editingProduct.badge
      };

      const effectiveToken = getEffectiveToken();
      try {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveToken}`
          },
          body: JSON.stringify(updatedProd)
        });
      } catch {}

      const updatedList = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      setProducts(updatedList);
      try {
        localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(updatedList));
      } catch {}
      onRefreshProducts?.();

      showToast(`✏️ Saved changes for ${editingProduct.name}`);
      setEditingProduct(null);
      setEditUploadFile(null);
      setEditUploadPreview(null);
    } catch (err: any) {
      showToast(`⚠️ Error saving changes: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-pearl font-sans text-plum-dark min-h-screen" id="admin-dashboard-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Dashboard Header Banner */}
        <div className="bg-gradient-to-r from-plum-dark via-mauve-deep to-plum-dark p-6 sm:p-8 md:p-10 rounded-md text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md mb-8">
          <div>
            <span className="text-[0.58rem] font-bold tracking-[0.3em] uppercase text-lilac block mb-1">
              Store Management Console
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light">
              Brand Control <em className="font-serif italic text-lilac">Dashboard</em>
            </h1>
            <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Upload photos from mobile camera or PC, update prices in Cedis (GH₵), adjust stock status, or manage custom garments.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchProducts}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-[2px] transition-all cursor-pointer"
              title="Refresh catalogue from database"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-rose-500/20 border border-rose-400/30 hover:bg-rose-500/30 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-[2px] transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              Logout
            </button>
          </div>
        </div>

        {/* Catalog Control Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-serif text-2xl text-plum-dark font-light">
                Catalogue Inventory ({products.length} Garments)
              </h2>
              <p className="text-xs text-text-light mt-0.5">
                All changes sync automatically across desktop and mobile storefront views.
              </p>
            </div>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-br from-lavender to-mauve-deep text-white border-none cursor-pointer text-xs font-bold tracking-[0.18em] uppercase rounded-[2px] transition-all flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
              >
                <Plus className="w-4 h-4" /> Add New Tailored Design
              </button>
            )}
          </div>

          {/* ═══ ADD PRODUCT PANEL ═══ */}
          {isAdding && (
            <div className="bg-white p-5 sm:p-8 rounded-md border border-lilac/20 shadow-lg animate-fade-in">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-6">
                <div>
                  <span className="text-[0.55rem] font-bold tracking-[0.25em] uppercase text-mauve-deep block">
                    Custom Inventory Entry
                  </span>
                  <h3 className="font-serif text-xl font-bold text-plum-dark">
                    Create New Garment Design
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setUploadFile(null);
                    setUploadPreview(null);
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-text-light hover:bg-zinc-200 hover:text-black border-none cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Royal Boulevard Agbada"
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Category *
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                    >
                      <option value="women">Women Collection</option>
                      <option value="men">Men Collection</option>
                      <option value="bags">Bags & Accessories</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Subcategory / Silhouette
                    </label>
                    <input
                      type="text"
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                      placeholder="e.g. Kaftan, Gown, 3-Piece Suite"
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Price (GH₵) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="3500"
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs font-mono rounded-[2px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Original Price (Strikethrough GH₵)
                    </label>
                    <input
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      placeholder="4200"
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs font-mono rounded-[2px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Accent Boutique Badge
                    </label>
                    <select
                      value={newProduct.badge}
                      onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value as any })}
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                    >
                      <option value="None">None</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="New">New Arrival</option>
                      <option value="Sale">Special Sale</option>
                      <option value="Exclusive">Exclusive Collection</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.16em] uppercase text-plum-dark">
                      Initial Tailoring Status
                    </label>
                    <select
                      value={newProduct.inStock ? 'true' : 'false'}
                      onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value === 'true' })}
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                    >
                      <option value="true">In Stock & Active</option>
                      <option value="false">Out of Stock (Private order only)</option>
                    </select>
                  </div>
                </div>

                {/* ═══ MOBILE & PC PHOTO UPLOAD BLOCK ═══ */}
                <div className="bg-zinc-50 p-4 sm:p-6 rounded-md border border-zinc-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-plum-dark flex items-center gap-2">
                      <Camera className="w-4 h-4 text-lavender" />
                      Garment Photo Upload (Mobile Camera or PC)
                    </span>
                    {uploadPreview && (
                      <span className="text-[0.55rem] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Optimized: {formatFileSize(uploadPreview.originalSize)} ➔ {formatFileSize(uploadPreview.optimizedSize)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* File Picker / Camera Area */}
                    <div className="relative">
                      <input
                        ref={addFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAddFileChange}
                        className="hidden"
                        id="add-product-file-input"
                      />
                      
                      <label
                        htmlFor="add-product-file-input"
                        className="border-2 border-dashed border-zinc-300 hover:border-lavender rounded-md p-5 text-center cursor-pointer bg-white hover:bg-zinc-50 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px] shadow-xs"
                      >
                        <div className="w-10 h-10 rounded-full bg-lavender/10 flex items-center justify-center text-lavender">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-plum-dark block">
                            {uploadFile ? 'Tap to change photo' : 'Take photo or choose from library / PC'}
                          </span>
                          <span className="text-[0.62rem] text-text-light block mt-0.5">
                            Supports Mobile Camera, iOS Photo Library, Android Gallery, & PC uploads
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Preview Thumbnail Box */}
                    {uploadPreview ? (
                      <div className="flex items-center gap-4 bg-white p-3.5 rounded-md border border-zinc-200 shadow-xs">
                        <div className="w-20 h-24 rounded overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          <img
                            src={uploadPreview.url}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-plum-dark truncate">{uploadPreview.name}</p>
                          <p className="text-[0.62rem] font-mono text-text-light mt-0.5">
                            Ready for instant publishing
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadFile(null);
                              setUploadPreview(null);
                              if (addFileInputRef.current) addFileInputRef.current.value = '';
                            }}
                            className="mt-2 text-[0.62rem] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer bg-transparent border-none p-0"
                          >
                            Remove photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 justify-center">
                        <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-text-light">
                          Or Paste Online Image URL
                        </label>
                        <input
                          type="url"
                          value={newProduct.imageUrl}
                          onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                          placeholder="https://images.pexels.com/..."
                          className="px-4 py-3 bg-white border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                    Couturier Description
                  </label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Luxury piece tailored custom with genuine organic fabrics..."
                    className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="py-4 bg-gradient-to-br from-lavender via-mauve to-mauve-deep text-white border-none text-[0.65rem] font-bold tracking-[0.2em] uppercase rounded-[2px] cursor-pointer transition-all shadow-md text-center inline-flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-white" />
                  {uploadingImage ? 'Processing Photo...' : loading ? 'Publishing Design...' : 'Commit New Garment To Catalogue'}
                </button>
              </form>
            </div>
          )}

          {/* ═══ EDIT PRODUCT MODAL ═══ */}
          {editingProduct && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
              <div className="bg-white p-5 sm:p-8 rounded-md w-full max-w-xl shadow-2xl border border-lilac/30 flex flex-col gap-5 my-8">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <div>
                    <span className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-mauve-deep block">
                      Edit Design Info
                    </span>
                    <h3 className="font-serif text-lg font-bold text-plum-dark">
                      {editingProduct.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setEditUploadFile(null);
                      setEditUploadPreview(null);
                    }}
                    className="w-8 h-8 rounded-full bg-zinc-100 border-none flex items-center justify-center text-text-light cursor-pointer hover:bg-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Product Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none text-xs rounded-[2px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                        Price (Cedis GH₵)
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none text-xs rounded-[2px] font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                        Original Price (GH₵)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                        className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none text-xs rounded-[2px] font-mono"
                      />
                    </div>
                  </div>

                  {/* Photo Edit Block */}
                  <div className="bg-zinc-50 p-4 rounded-md border border-zinc-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-lavender" />
                        Update Garment Photo
                      </label>
                      {editUploadPreview && (
                        <span className="text-[0.52rem] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {formatFileSize(editUploadPreview.originalSize)} ➔ {formatFileSize(editUploadPreview.optimizedSize)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-16 h-20 rounded overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        <img
                          src={editUploadPreview ? editUploadPreview.url : editingProduct.imageUrl}
                          alt={editingProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 w-full flex flex-col gap-2">
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileChange}
                          className="hidden"
                          id="edit-product-file-input"
                        />
                        <label
                          htmlFor="edit-product-file-input"
                          className="border border-dashed border-zinc-300 hover:border-lavender rounded p-3 text-center cursor-pointer bg-white hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4 text-lavender" />
                          <span className="text-[0.62rem] font-bold text-plum-dark">
                            {editUploadFile ? `Selected: ${editUploadFile.name}` : 'Upload new photo from mobile/PC'}
                          </span>
                        </label>

                        {!editUploadFile && (
                          <input
                            type="url"
                            value={editingProduct.imageUrl}
                            onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                            placeholder="Or image URL..."
                            className="px-3 py-2 bg-white border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                        Specialty Badge
                      </label>
                      <select
                        value={editingProduct.badge || 'None'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value === 'None' ? undefined : e.target.value as any })}
                        className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none text-xs rounded-[2px]"
                      >
                        <option value="None">None</option>
                        <option value="Bestseller">Bestseller</option>
                        <option value="New">New</option>
                        <option value="Sale">Sale</option>
                        <option value="Exclusive">Exclusive</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                        Stock Status
                      </label>
                      <select
                        value={editingProduct.inStock ? 'true' : 'false'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'true' })}
                        className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none text-xs rounded-[2px]"
                      >
                        <option value="true">In Stock & Active</option>
                        <option value="false">Out of Stock (Halted)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none text-xs rounded-[2px] resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setEditUploadFile(null);
                        setEditUploadPreview(null);
                      }}
                      className="flex-1 py-3 text-text-light border border-zinc-200 bg-white rounded cursor-pointer text-xs font-bold tracking-widest uppercase hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || editUploadingImage}
                      className="flex-1 py-3 bg-gradient-to-br from-lavender to-mauve-deep text-white border-none rounded cursor-pointer text-xs font-bold tracking-widest uppercase shadow hover:opacity-95 disabled:opacity-50"
                    >
                      {editUploadingImage ? 'Uploading Photo...' : loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ═══ LIST TABLE OF ITEMS ═══ */}
          {loading ? (
            <div className="text-center py-20 p-6">
              <p className="text-xs text-text-light uppercase tracking-widest animate-pulse font-mono font-bold">
                Synchronizing catalogue database...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-md border border-zinc-200 p-8 flex flex-col items-center justify-center">
              <PackageOpen className="w-12 h-12 text-zinc-300 mb-4" />
              <h3 className="font-serif text-lg text-plum-dark">Catalogue is Empty</h3>
              <p className="text-xs text-text-light mt-1">Begin by adding your first hand-tailored luxury garment.</p>
            </div>
          ) : (
            <div className="bg-white rounded-md border border-neutral-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 select-none text-[0.55rem] font-bold tracking-[0.22em] uppercase text-text-light">
                      <th className="p-4 sm:p-5 pl-5 sm:pl-7">Garment</th>
                      <th className="p-4 sm:p-5">Category & Silhouette</th>
                      <th className="p-4 sm:p-5">Price</th>
                      <th className="p-4 sm:p-5 text-center">In-Stock</th>
                      <th className="p-4 sm:p-5">Badge</th>
                      <th className="p-4 sm:p-5 pr-5 sm:pr-7 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-sans">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 sm:p-5 pl-5 sm:pl-7 flex items-center gap-3 sm:gap-4">
                          <div className="w-11 h-14 rounded overflow-hidden shadow-sm shrink-0 bg-zinc-100 border border-zinc-200">
                            <img referrerPolicy="no-referrer" src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif text-xs font-bold text-plum-dark leading-tight truncate">{p.name}</h4>
                            <span className="text-[0.6rem] font-mono text-text-light mt-0.5 inline-block">{p.id}</span>
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 text-text-light text-xs uppercase tracking-wide">
                          <span className="font-medium text-plum-dark">{p.category}</span> · {p.subcategory}
                        </td>
                        <td className="p-4 sm:p-5 font-mono text-xs font-bold text-lavender whitespace-nowrap">
                          {p.originalPrice && (
                            <del className="text-[0.62rem] text-text-light mr-1.5 font-normal line-through">
                              GH₵{p.originalPrice.toLocaleString()}
                            </del>
                          )}
                          GH₵{p.price.toLocaleString()}
                        </td>
                        <td className="p-4 sm:p-5 text-center">
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`px-3 py-1.5 rounded-full text-[0.52rem] font-extrabold tracking-widest uppercase border cursor-pointer transition-all inline-block ${
                              p.inStock
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-400/20 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-400/20 hover:bg-rose-100'
                            }`}
                            title="Tap to toggle stock availability status"
                          >
                            {p.inStock ? '● In Stock' : '○ Out of stock'}
                          </button>
                        </td>
                        <td className="p-4 sm:p-5">
                          {p.badge ? (
                            <span className="px-2.5 py-1 text-[0.52rem] rounded-full bg-lavender/15 text-lavender font-extrabold uppercase font-mono tracking-wider">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-zinc-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4 sm:p-5 pr-5 sm:pr-7 text-right">
                          <div className="flex justify-end gap-1.5 items-center">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="w-8 h-8 rounded bg-zinc-100 hover:bg-lavender/15 text-text-light hover:text-lavender border-none cursor-pointer flex items-center justify-center transition-all"
                              title="Edit Product Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {confirmDeleteId === p.id ? (
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="px-2.5 py-1 text-[0.62rem] rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold border-none cursor-pointer flex items-center gap-1 transition-all"
                                title="Click to permanently confirm deletion"
                              >
                                <span>Delete?</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="w-8 h-8 rounded bg-zinc-100 hover:bg-rose-50 text-text-light hover:text-rose-600 border-none cursor-pointer flex items-center justify-center transition-all"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
