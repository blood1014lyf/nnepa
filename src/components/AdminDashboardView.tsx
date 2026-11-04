/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  RefreshCw,
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Check,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  PackageOpen,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../types.ts';
import { LEGACY_MOCK_IDS } from '../App.tsx';
import { optimizeImageFile, formatFileSize } from '../utils/imageOptimizer.ts';

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface StoredOrder {
  orderNumber: number;
  publicId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface ImagePreviewState {
  url: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
}

interface AdminDashboardViewProps {
  adminToken: string;
  onLogout: () => void;
  showToast: (message: string) => void;
  onRefreshProducts?: () => void;
}

export default function AdminDashboardView({
  adminToken,
  onLogout,
  showToast,
  onRefreshProducts
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // ═══ ORDERS STATE ═══
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // ═══ PRODUCTS STATE ═══
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add Product Form State
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

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<ImagePreviewState | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const addGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const addCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Available Sizes Management State
  const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Bespoke'];
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [editCustomSizeInput, setEditCustomSizeInput] = useState('');

  const handleToggleNewSize = (sz: string) => {
    const current = newProduct.sizes || [];
    if (current.includes(sz)) {
      setNewProduct({ ...newProduct, sizes: current.filter((s) => s !== sz) });
    } else {
      setNewProduct({ ...newProduct, sizes: [...current, sz] });
    }
  };

  const handleAddNewCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    const current = newProduct.sizes || [];
    if (!current.includes(trimmed)) {
      setNewProduct({ ...newProduct, sizes: [...current, trimmed] });
    }
    setCustomSizeInput('');
  };

  const handleRemoveNewSize = (sz: string) => {
    const current = newProduct.sizes || [];
    setNewProduct({ ...newProduct, sizes: current.filter((s) => s !== sz) });
  };

  const handleToggleEditSize = (sz: string) => {
    if (!editingProduct) return;
    const current = editingProduct.sizes || [];
    if (current.includes(sz)) {
      setEditingProduct({ ...editingProduct, sizes: current.filter((s) => s !== sz) });
    } else {
      setEditingProduct({ ...editingProduct, sizes: [...current, sz] });
    }
  };

  const handleAddEditCustomSize = () => {
    if (!editingProduct) return;
    const trimmed = editCustomSizeInput.trim();
    if (!trimmed) return;
    const current = editingProduct.sizes || [];
    if (!current.includes(trimmed)) {
      setEditingProduct({ ...editingProduct, sizes: [...current, trimmed] });
    }
    setEditCustomSizeInput('');
  };

  const handleRemoveEditSize = (sz: string) => {
    if (!editingProduct) return;
    const current = editingProduct.sizes || [];
    setEditingProduct({ ...editingProduct, sizes: current.filter((s) => s !== sz) });
  };

  // Edit Product Upload State
  const [editUploadFile, setEditUploadFile] = useState<File | null>(null);
  const [editUploadPreview, setEditUploadPreview] = useState<ImagePreviewState | null>(null);
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const editGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const editCameraInputRef = useRef<HTMLInputElement | null>(null);

  const getEffectiveToken = () => {
    return adminToken || localStorage.getItem('nnepa_foriwaa_token') || '';
  };

  // ═══ FETCH ORDERS ═══
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = getEffectiveToken();
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } else {
        showToast('Could not load orders from server.');
      }
    } catch {
      showToast('Network error loading orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // ═══ FETCH PRODUCTS ═══
  const fetchProducts = async () => {
    setProductsLoading(true);
    let cachedList: Product[] = [];
    const isCleanProd = (p: Product) =>
      p && p.id && !LEGACY_MOCK_IDS.has(p.id) && (!p.imageUrl || !p.imageUrl.startsWith('/assets/images/lookbook_'));

    try {
      const cached = localStorage.getItem('nnepa_foriwaa_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          cachedList = parsed.filter(isCleanProd);
        }
      }
    } catch {}

    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const serverList: Product[] = (data.products || []).filter(isCleanProd);

        // Retain local custom pieces
        const missingOnServer = cachedList.filter(
          (c) => !serverList.some((s) => s.id === c.id)
        );

        const merged = [...missingOnServer, ...serverList].filter(isCleanProd);
        setProducts(merged);
        try {
          localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(merged));
        } catch {}
        onRefreshProducts?.();
      } else if (cachedList.length > 0) {
        setProducts(cachedList);
      } else {
        setProducts([]);
      }
    } catch {
      if (cachedList.length > 0) {
        setProducts(cachedList);
      } else {
        setProducts([]);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // ═══ ORDER STATUS CHANGE ═══
  const handleStatusChange = async (order: StoredOrder, newStatus: OrderStatus) => {
    setUpdatingOrderId(order.publicId);
    try {
      const token = getEffectiveToken();
      const res = await fetch(`/api/admin/orders/${order.publicId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.publicId === order.publicId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order #${order.orderNumber} status changed to ${newStatus}`);
      } else {
        showToast('Failed to update order status');
      }
    } catch {
      showToast('Network error updating status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ═══ IMAGE PROCESSING & PRIVACY SANDBOX ═══
  const processImageSelection = async (file: File): Promise<ImagePreviewState> => {
    try {
      const result = await optimizeImageFile(file, 1280, 0.82);
      return {
        url: result.dataUrl,
        name: file.name,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize
      };
    } catch (err: any) {
      showToast(err?.message || 'Error validating image file.');
      throw err;
    }
  };

  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadFile(file);
        const preview = await processImageSelection(file);
        setUploadPreview(preview);
        showToast('Photo secured and added from device');
      } catch (err: any) {
        setUploadFile(null);
        setUploadPreview(null);
      } finally {
        e.target.value = ''; // Reset input to allow re-selection
      }
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setEditUploadFile(file);
        const preview = await processImageSelection(file);
        setEditUploadPreview(preview);
        showToast('New photo secured and ready to save');
      } catch (err: any) {
        setEditUploadFile(null);
        setEditUploadPreview(null);
      } finally {
        e.target.value = ''; // Reset input to allow re-selection
      }
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
          Authorization: `Bearer ${effectiveToken}`
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
    } catch {}
    return payloadUrl;
  };

  // ═══ ADD PRODUCT ═══
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Product Name and Price are required.');
      return;
    }

    setProductsLoading(true);
    let finalImageUrl = newProduct.imageUrl || '';

    try {
      if (uploadFile) {
        setUploadingImage(true);
        showToast('Optimizing & uploading photo...');
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
        description:
          newProduct.description ||
          `${newProduct.name} - Handcrafted African luxury piece tailored with authentic textiles.`,
        sizes: newProduct.sizes && newProduct.sizes.length > 0 ? newProduct.sizes : ['S', 'M', 'L', 'XL']
      };

      const effectiveToken = getEffectiveToken();
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`
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
        console.warn('Server notice saving product:', saveErr);
      }

      const updatedList = [newProdItem, ...products.filter((p) => p.id !== newProdItem.id)];
      setProducts(updatedList);
      try {
        localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(updatedList));
      } catch {}

      onRefreshProducts?.();
      showToast(`Added "${newProduct.name}" to collection`);

      // Reset form
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
      setCustomSizeInput('');
      setIsAddingProduct(false);
    } catch (err: any) {
      showToast(`Error adding product: ${err.message || err}`);
    } finally {
      setProductsLoading(false);
      setUploadingImage(false);
    }
  };

  // ═══ EDIT SAVE PRODUCT ═══
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProductsLoading(true);
    let finalImageUrl = editingProduct.imageUrl;

    try {
      if (editUploadFile) {
        setEditUploadingImage(true);
        showToast('Optimizing & uploading photo...');
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
            Authorization: `Bearer ${effectiveToken}`
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
      showToast(`Saved changes for "${editingProduct.name}"`);

      setEditingProduct(null);
      setEditUploadFile(null);
      setEditUploadPreview(null);
    } catch (err: any) {
      showToast(`Error saving changes: ${err.message || err}`);
    } finally {
      setProductsLoading(false);
      setEditUploadingImage(false);
    }
  };

  // ═══ DELETE PRODUCT ═══
  const handleDeleteProduct = async (productId: string) => {
    const effectiveToken = getEffectiveToken();
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${effectiveToken}` }
      });
    } catch {}

    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    try {
      localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(updatedList));
    } catch {}

    setConfirmDeleteId(null);
    onRefreshProducts?.();
    showToast('Product removed from catalogue');
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  return (
    <div className="py-8 pb-20 bg-zinc-50 min-h-screen text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-zinc-200 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-plum-dark text-white flex items-center justify-center font-bold text-sm tracking-widest">
              NF
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 leading-tight">Nnepa Foriwaa Administration</h1>
              <p className="text-xs text-zinc-500">
                Products: <strong className="text-zinc-800">{products.length}</strong> · Orders:{' '}
                <strong className="text-zinc-800">{orders.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                fetchOrders();
                fetchProducts();
              }}
              disabled={ordersLoading || productsLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded border border-zinc-300 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading || productsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded border-none cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Products vs Orders) */}
        <div className="flex border-b border-zinc-200 mb-6 bg-white rounded-t-lg px-2 pt-2 gap-2 shadow-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-plum-dark text-plum-dark bg-zinc-50/50'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <PackageOpen className="w-4 h-4" />
            Products & Photo Management ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-plum-dark text-plum-dark bg-zinc-50/50'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Customer Orders ({orders.length})
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PRODUCTS & PHOTO MANAGEMENT                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Products Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Garments in Boutique</h2>
                <p className="text-xs text-zinc-500">
                  Upload photos directly from your phone camera roll or computer to update garments instantly.
                </p>
              </div>

              <button
                onClick={() => setIsAddingProduct(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-plum-dark hover:bg-plum text-white text-xs font-semibold tracking-wider uppercase rounded cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add New Garment
              </button>
            </div>

            {/* Products Grid */}
            {productsLoading && products.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-zinc-200">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
                <p className="text-xs text-zinc-500">Loading boutique collection...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-xs flex flex-col hover:shadow-md transition-shadow"
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden group">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {prod.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-plum-dark/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase rounded">
                          {prod.badge}
                        </span>
                      )}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          prod.inStock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {prod.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1">
                          {prod.category} · {prod.subcategory}
                        </div>
                        <h3 className="font-serif text-base font-semibold text-zinc-900 line-clamp-1">
                          {prod.name}
                        </h3>
                        <div className="text-sm font-bold text-plum-dark mt-1">
                          GH₵ {prod.price.toLocaleString()}
                          {prod.originalPrice && (
                            <span className="text-xs font-normal text-zinc-400 line-through ml-2">
                              GH₵ {prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {prod.sizes && prod.sizes.length > 0 && (
                          <div className="text-[11px] text-zinc-500 mt-1">
                            Sizes: {prod.sizes.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct({
                              ...prod,
                              sizes: prod.sizes && prod.sizes.length > 0 ? [...prod.sizes] : ['S', 'M', 'L', 'XL']
                            });
                            setEditCustomSizeInput('');
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit / Photo
                        </button>

                        {confirmDeleteId === prod.id ? (
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded cursor-pointer transition-colors"
                            title="Confirm deletion"
                          >
                            Delete?
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(prod.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CUSTOMER ORDERS LIST                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-medium text-zinc-500 mr-2 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filter Status:
              </span>
              {['all', 'new', 'confirmed', 'shipped', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded capitalize cursor-pointer border transition-colors ${
                    filterStatus === st
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {st} ({st === 'all' ? orders.length : orders.filter((o) => o.status === st).length})
                </button>
              ))}
            </div>

            {/* Orders Feed */}
            {ordersLoading && orders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-zinc-200">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
                <p className="text-xs text-zinc-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-zinc-200">
                <ShoppingBag className="w-10 h-10 mx-auto text-zinc-300 mb-3" />
                <h3 className="text-base font-semibold text-zinc-800">No orders found</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {filterStatus === 'all'
                    ? 'Orders placed by guests will appear here automatically.'
                    : `No orders currently marked as "${filterStatus}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.publicId}
                    className="bg-white rounded-lg border border-zinc-200 p-5 shadow-xs hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-plum-dark">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-4">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Status Switcher */}
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-zinc-600">Update Status:</label>
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.publicId}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          className="px-3 py-1.5 text-xs font-semibold rounded border border-zinc-300 bg-white text-zinc-800 outline-none focus:border-zinc-500 cursor-pointer"
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <a
                          href={`#/order/${order.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-plum-dark hover:underline font-semibold ml-2"
                        >
                          <span>Public Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Customer & Garments Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
                      <div>
                        <h4 className="font-bold text-zinc-700 uppercase tracking-wider text-[11px] mb-2">
                          Customer Information
                        </h4>
                        <div className="space-y-1.5 text-zinc-600">
                          <p>
                            <strong className="text-zinc-800">Name:</strong> {order.customer.name}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <strong className="text-zinc-800">Phone:</strong> {order.customer.phone}
                          </p>
                          <p className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-zinc-800">Address:</strong> {order.customer.address}
                            </span>
                          </p>
                          {order.customer.notes && (
                            <p className="bg-zinc-50 p-2 rounded border border-zinc-100 text-zinc-700 italic">
                              "{order.customer.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-700 uppercase tracking-wider text-[11px] mb-2">
                          Ordered Garments
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-zinc-50 px-3 py-2 rounded border border-zinc-100"
                            >
                              <span>
                                <strong className="text-zinc-800">{it.name}</strong>{' '}
                                <span className="text-zinc-500">
                                  ({it.size || 'M'}) × {it.quantity}
                                </span>
                              </span>
                              <span className="font-mono font-semibold text-zinc-900">
                                GH₵ {it.lineTotal.toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className="pt-2 flex justify-between items-baseline font-bold text-sm text-zinc-900 border-t border-zinc-100">
                            <span>Total (Authoritative)</span>
                            <span className="font-mono text-base text-plum-dark">
                              GH₵ {order.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ADD PRODUCT MODAL                                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-xl shadow-2xl border border-zinc-200 flex flex-col gap-5 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-plum-dark block">
                    Boutique Catalog
                  </span>
                  <h3 className="font-serif text-xl font-bold text-zinc-900">Add New Garment</h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddingProduct(false);
                    setUploadFile(null);
                    setUploadPreview(null);
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-100 border-none flex items-center justify-center text-zinc-500 cursor-pointer hover:bg-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="flex flex-col gap-4 text-xs">
                {/* Upload Section with Camera Roll & Camera Options */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Garment Photo *
                  </label>

                  {/* Dual hidden inputs: Gallery/Roll (no capture) vs Camera (capture="environment") */}
                  <input
                    type="file"
                    ref={addGalleryInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif, image/*"
                    onChange={handleAddFileChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={addCameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleAddFileChange}
                    className="hidden"
                  />

                  {uploadPreview ? (
                    <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={uploadPreview.url}
                        alt="Preview"
                        className="w-24 h-32 object-cover rounded shadow-xs shrink-0"
                      />
                      <div className="flex flex-col gap-2 w-full text-left">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Photo secured & ready ({formatFileSize(uploadPreview.optimizedSize)})</span>
                        </div>
                        <p className="text-zinc-500 text-[11px] leading-relaxed">
                          Original: {formatFileSize(uploadPreview.originalSize)} → Optimized for web. EXIF & GPS location tags stripped.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => addGalleryInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white border border-zinc-300 rounded font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-plum-dark" />
                            Choose from Camera Roll
                          </button>
                          <button
                            type="button"
                            onClick={() => addCameraInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white border border-zinc-300 rounded font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                          >
                            <Camera className="w-3.5 h-3.5 text-plum-dark" />
                            Retake with Camera
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-zinc-300 rounded-lg p-5 flex flex-col items-center justify-center gap-3 bg-zinc-50/70">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-plum-dark/10 text-plum-dark flex items-center justify-center">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-plum-dark/10 text-plum-dark flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-zinc-800 text-sm">
                          Add Garment Photo
                        </p>
                        <p className="text-[11px] text-zinc-500 max-w-sm mt-0.5">
                          Upload from your phone's camera roll/gallery or take a new picture directly.
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center gap-2.5 w-full pt-1">
                        <button
                          type="button"
                          onClick={() => addGalleryInputRef.current?.click()}
                          className="px-4 py-2 bg-plum-dark text-white rounded font-semibold hover:bg-plum flex items-center gap-2 transition-colors cursor-pointer shadow-xs text-xs"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Choose from Camera Roll / Gallery
                        </button>
                        <button
                          type="button"
                          onClick={() => addCameraInputRef.current?.click()}
                          className="px-4 py-2 bg-white border border-zinc-300 text-zinc-800 rounded font-semibold hover:bg-zinc-100 flex items-center gap-2 transition-colors cursor-pointer text-xs"
                        >
                          <Camera className="w-4 h-4 text-plum-dark" />
                          Take Photo with Camera
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Privacy & Sandbox Security Guarantee */}
                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-lg p-2.5 text-[11px] text-emerald-950 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-emerald-900">Protected Camera Roll Sandbox</span>
                      <span className="text-emerald-800/90 leading-relaxed block mt-0.5">
                        Your camera roll is sandboxed by your phone's OS. The website cannot access or see any other photos on your device. Only the single photo you select is loaded into memory, and all GPS location and EXIF metadata are automatically scrubbed before saving.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Garment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Garment Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Gold Boubou"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none focus:border-plum-dark"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value as 'women' | 'men' | 'bags'
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none cursor-pointer"
                    >
                      <option value="women">Women's Collection</option>
                      <option value="men">Men's Elegance</option>
                      <option value="bags">Bags & Accessories</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Subcategory</label>
                    <input
                      type="text"
                      placeholder="e.g. Dresses & Gowns, Kaftans"
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Price in Cedis (GH₵) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 1200"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none focus:border-plum-dark font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Original Price (for Sale tags)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Specialty Badge</label>
                    <select
                      value={newProduct.badge}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          badge: e.target.value as any
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="New">New</option>
                      <option value="Sale">Sale</option>
                      <option value="Exclusive">Exclusive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Stock Availability</label>
                    <select
                      value={newProduct.inStock ? 'true' : 'false'}
                      onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value === 'true' })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none cursor-pointer"
                    >
                      <option value="true">In Stock & Active</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>

                  {/* Available Sizes Picker & Adder */}
                  <div className="sm:col-span-2 flex flex-col gap-2 p-3 bg-zinc-50/70 border border-zinc-200 rounded">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 text-xs uppercase tracking-wider">
                        Available Sizes
                      </label>
                      <span className="text-[11px] text-zinc-400">
                        Select presets or add custom size
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SIZES.map((sz) => {
                        const isSelected = (newProduct.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleNewSize(sz)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-plum-dark text-white border-plum-dark shadow-xs'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Size Input */}
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Add size (e.g. UK 12, Free Size, 42R)..."
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCustomSize();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded outline-none focus:border-plum-dark"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCustomSize}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-white hover:bg-zinc-700 rounded cursor-pointer transition-colors"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Active Selected Sizes List */}
                    {newProduct.sizes && newProduct.sizes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-2 border-t border-zinc-200/60">
                        <span className="text-[11px] text-zinc-400 mr-1">Active:</span>
                        {newProduct.sizes.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-zinc-300 text-plum-dark rounded text-xs font-medium"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewSize(sz)}
                              className="text-zinc-400 hover:text-rose-600 cursor-pointer ml-0.5 text-xs font-bold leading-none border-none bg-transparent"
                              title={`Remove ${sz}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Garment Description</label>
                    <textarea
                      rows={2}
                      placeholder="Fabric details, occasion, bespoke tailoring details..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setUploadFile(null);
                      setUploadPreview(null);
                      setCustomSizeInput('');
                    }}
                    className="flex-1 py-2.5 text-zinc-600 border border-zinc-200 bg-white rounded cursor-pointer font-bold uppercase tracking-wider hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productsLoading || uploadingImage}
                    className="flex-1 py-2.5 bg-plum-dark hover:bg-plum text-white rounded cursor-pointer font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? 'Uploading Photo...' : productsLoading ? 'Publishing...' : 'Publish Garment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* EDIT PRODUCT MODAL                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {editingProduct && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-xl shadow-2xl border border-zinc-200 flex flex-col gap-5 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-plum-dark block">
                    Modify Garment
                  </span>
                  <h3 className="font-serif text-xl font-bold text-zinc-900">{editingProduct.name}</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setEditUploadFile(null);
                    setEditUploadPreview(null);
                  }}
                  className="w-8 h-8 rounded-full bg-zinc-100 border-none flex items-center justify-center text-zinc-500 cursor-pointer hover:bg-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="flex flex-col gap-4 text-xs">
                {/* Photo Update Section with Camera Roll & Camera Options */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Garment Photo
                  </label>
                  <input
                    type="file"
                    ref={editGalleryInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif, image/*"
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={editCameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
                    <img
                      src={editUploadPreview ? editUploadPreview.url : editingProduct.imageUrl}
                      alt={editingProduct.name}
                      className="w-20 h-28 object-cover rounded shadow-xs shrink-0"
                    />
                    <div className="flex-1 space-y-2 w-full text-left">
                      <p className="text-zinc-600 text-xs">
                        {editUploadPreview
                          ? `New photo ready (${formatFileSize(editUploadPreview.optimizedSize)}) • EXIF & GPS stripped`
                          : 'Currently using the active boutique image.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editGalleryInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-plum-dark text-white rounded font-semibold cursor-pointer hover:bg-plum transition-colors text-xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Choose from Camera Roll
                        </button>
                        <button
                          type="button"
                          onClick={() => editCameraInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded font-semibold cursor-pointer hover:bg-zinc-100 transition-colors text-xs"
                        >
                          <Camera className="w-3.5 h-3.5 text-plum-dark" />
                          Take New Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security Guarantee */}
                  <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2.5 text-[11px] text-emerald-950 flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-emerald-800/90 leading-tight">
                      Camera roll protected in OS sandbox. GPS coordinates and personal metadata automatically stripped.
                    </span>
                  </div>
                </div>

                {/* Editable Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Garment Name</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none focus:border-plum-dark"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value as 'women' | 'men' | 'bags'
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none cursor-pointer"
                    >
                      <option value="women">Women's Collection</option>
                      <option value="men">Men's Elegance</option>
                      <option value="bags">Bags & Accessories</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Subcategory</label>
                    <input
                      type="text"
                      value={editingProduct.subcategory}
                      onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Price in Cedis (GH₵)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value)
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none focus:border-plum-dark font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Original Price</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Specialty Badge</label>
                    <select
                      value={editingProduct.badge || 'None'}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          badge: e.target.value === 'None' ? undefined : (e.target.value as any)
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="New">New</option>
                      <option value="Sale">Sale</option>
                      <option value="Exclusive">Exclusive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Stock Availability</label>
                    <select
                      value={editingProduct.inStock ? 'true' : 'false'}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inStock: e.target.value === 'true'
                        })
                      }
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none cursor-pointer"
                    >
                      <option value="true">In Stock & Active</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>

                  {/* Available Sizes Picker & Adder for Edit Modal */}
                  <div className="sm:col-span-2 flex flex-col gap-2 p-3 bg-zinc-50/70 border border-zinc-200 rounded">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 text-xs uppercase tracking-wider">
                        Available Sizes
                      </label>
                      <span className="text-[11px] text-zinc-400">
                        Select presets or add custom size
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SIZES.map((sz) => {
                        const isSelected = (editingProduct.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleEditSize(sz)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-plum-dark text-white border-plum-dark shadow-xs'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Size Input */}
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Add size (e.g. UK 12, Free Size, 42R)..."
                        value={editCustomSizeInput}
                        onChange={(e) => setEditCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEditCustomSize();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded outline-none focus:border-plum-dark"
                      />
                      <button
                        type="button"
                        onClick={handleAddEditCustomSize}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-white hover:bg-zinc-700 rounded cursor-pointer transition-colors"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Active Selected Sizes List */}
                    {editingProduct.sizes && editingProduct.sizes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-2 border-t border-zinc-200/60">
                        <span className="text-[11px] text-zinc-400 mr-1">Active:</span>
                        {editingProduct.sizes.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-zinc-300 text-plum-dark rounded text-xs font-medium"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditSize(sz)}
                              className="text-zinc-400 hover:text-rose-600 cursor-pointer ml-0.5 text-xs font-bold leading-none border-none bg-transparent"
                              title={`Remove ${sz}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-zinc-700">Garment Description</label>
                    <textarea
                      rows={2}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setEditUploadFile(null);
                      setEditUploadPreview(null);
                    }}
                    className="flex-1 py-2.5 text-zinc-600 border border-zinc-200 bg-white rounded cursor-pointer font-bold uppercase tracking-wider hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productsLoading || editUploadingImage}
                    className="flex-1 py-2.5 bg-plum-dark hover:bg-plum text-white rounded cursor-pointer font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {editUploadingImage ? 'Uploading Photo...' : productsLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
