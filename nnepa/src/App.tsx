/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, Suspense } from 'react';
import Loader from './components/Loader.tsx';
import Navbar from './components/Navbar.tsx';
import MobileMenu from './components/MobileMenu.tsx';
import Hero from './components/Hero.tsx';
import Categories from './components/Categories.tsx';
import ProductCard from './components/ProductCard.tsx';
import FeaturedOutfit from './components/FeaturedOutfit.tsx';
import Heritage from './components/Heritage.tsx';
import Stats from './components/Stats.tsx';
import Testimonials from './components/Testimonials.tsx';
import Newsletter from './components/Newsletter.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import SearchModal from './components/SearchModal.tsx';
import Toast from './components/Toast.tsx';

// Code-split auxiliary multi-page views with React.lazy
const AboutView = React.lazy(() => import('./components/AboutView.tsx'));
const ContactView = React.lazy(() => import('./components/ContactView.tsx'));
const LegalView = React.lazy(() => import('./components/LegalView.tsx'));
const ProductDetailsView = React.lazy(() => import('./components/ProductDetailsView.tsx'));
const AdminLoginView = React.lazy(() => import('./components/AdminLoginView.tsx'));
const AdminDashboardView = React.lazy(() => import('./components/AdminDashboardView.tsx'));
const SizeChartView = React.lazy(() => import('./components/SizeChartView.tsx'));
const CheckoutView = React.lazy(() => import('./components/CheckoutView.tsx'));

import { PRODUCTS as DEFAULT_PRODUCTS } from './data.ts';
import { Product, CartItem, Order } from './types.ts';

const DEFAULT_TOP_OUTFIT: Product = {
  id: 'featured_top_outfit',
  name: 'Queen Mother Royal Kente Gown',
  category: 'women',
  subcategory: 'Couture Evening Wear',
  price: 2850,
  rating: 5,
  imageUrl: 'https://images.pexels.com/photos/34993753/pexels-photo-34993753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900',
  badge: 'Exclusive',
  inStock: true,
  description: 'Handcrafted luxury silhouette sculpted from authentic Ghanaian handwoven silk Kente and regal brocade. Designed for high occasions, weddings, and royal galas with signature precision darting.',
  sizes: ['S', 'M', 'L', 'XL', 'XXL']
};

export default function App() {
  // Virtual State-Based Routing
  const [page, setPage] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'women' | 'men' | 'bags'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_orders');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_wishlist');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync wishlist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('nnepa_foriwaa_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Full-Stack Product and Admin Token States
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_products');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return [];
  });
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nnepa_foriwaa_token');
    } catch {
      return null;
    }
  });

  const topOutfit = products.length > 0 ? products[0] : DEFAULT_TOP_OUTFIT;

  // Pull products dynamically on startup and verify admin session
  useEffect(() => {
    fetchActiveProducts();

    try {
      const savedToken = localStorage.getItem('nnepa_foriwaa_token');
      if (savedToken) {
        fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${savedToken}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.authenticated) {
              setAdminToken(savedToken);
            } else if (!savedToken.startsWith('admin_session_')) {
              localStorage.removeItem('nnepa_foriwaa_token');
              setAdminToken(null);
            }
          })
          .catch(() => {
            // Keep token in offline mode
          });
      }
    } catch {}
  }, []);

  // Synchronize route with window.location.hash for deep linking & history navigation
  useEffect(() => {
    const syncRouteFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!hash || hash === 'home') {
        setPage('home');
        return;
      }

      if (hash.startsWith('product/')) {
        const prodId = hash.replace('product/', '');
        const list = products.length > 0 ? products : DEFAULT_PRODUCTS;
        const found = list.find((p) => p.id === prodId);
        if (found) {
          setActiveProduct(found);
          setPage('details');
        } else {
          setPage('shop');
        }
        return;
      }

      if (['shop', 'about', 'contact', 'terms', 'privacy', 'size-chart', 'checkout', 'admin-login', 'admin-dashboard'].includes(hash)) {
        setPage(hash);
      }
    };

    syncRouteFromHash();
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, [products]);

  const setPageWithHash = (targetPage: string, targetProduct?: Product) => {
    if (targetPage === 'details' && targetProduct) {
      setActiveProduct(targetProduct);
      window.location.hash = `#/product/${targetProduct.id}`;
      setPage('details');
    } else if (targetPage === 'home') {
      window.location.hash = '';
      setPage('home');
    } else {
      window.location.hash = `#/${targetPage}`;
      setPage(targetPage);
    }
  };

  const fetchActiveProducts = async () => {
    let serverProducts: Product[] = [];
    let fetchSuccess = false;

    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          serverProducts = data.products;
          fetchSuccess = true;
        }
      }
    } catch (err) {
      console.warn('[Nnepa Foriwaa] Backend unreached on startup. Falling back...', err);
    }

    // Retrieve cached products from localStorage to see if there are custom ones
    let localCustomProducts: Product[] = [];
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_products');
      if (cached) {
        const parsed: Product[] = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          localCustomProducts = parsed.filter(p => p && p.id && (p.id.startsWith('prod_') || p.id.startsWith('product_')));
        }
      }
    } catch (cachedErr) {
      console.warn('Failed parsing cached products', cachedErr);
    }

    if (fetchSuccess) {
      // Find local custom products that are missing from the server
      const missingOnServer = localCustomProducts.filter(
        (localProd) => !serverProducts.some((servProd) => servProd.id === localProd.id)
      );

      // ALWAYS merge missing local products so uploaded clothes NEVER disappear on refresh
      let resolvedProducts = [...serverProducts];
      if (missingOnServer.length > 0) {
        resolvedProducts = [...missingOnServer, ...serverProducts];

        // Background synchronization to server if token is available
        const token = localStorage.getItem('nnepa_foriwaa_token') || adminToken;
        if (token) {
          fetch('/api/products/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ products: missingOnServer })
          })
            .then((res) => {
              if (res.ok) {
                // If synced successfully, refresh from server to ensure database has it
                fetch('/api/products')
                  .then((r) => r.json())
                  .then((data) => {
                    if (data.products && Array.isArray(data.products)) {
                      setProducts(data.products);
                      try {
                        localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(data.products));
                      } catch {}
                    }
                  })
                  .catch(() => {});
              }
            })
            .catch(() => {});
        }
      }

      setProducts(resolvedProducts);
      try {
        localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(resolvedProducts));
      } catch {}
      return;
    }

    // Server was unreached, fall back to offline local storage
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          return;
        }
      }
    } catch {}

    setProducts([]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    const id = setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3000);
    return () => clearTimeout(id);
  };

  const handleAddToCart = (product: Product, size?: string) => {
    if (!product.inStock) {
      showToast('⚠️ Out of stock, redirecting to custom order form');
      handleViewDetails(product);
      return;
    }

    setCartItems((prev) => {
      const match = prev.find((item) => item.product.id === product.id && item.size === size);
      if (match) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
    showToast(`✨ Added "${product.name}" ${size ? `(${size})` : ''} to cart`);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`♡ Added "${product.name}" to wishlist`);
        return [...prev, product.id];
      }
    });
  };

  const handleUpdateQty = (productId: string, size: string | undefined, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (productId: string, size: string | undefined) => {
    setCartItems((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
    showToast(`Removed item from cart`);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setPageWithHash('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    try {
      const prevSaved = localStorage.getItem('nnepa_foriwaa_orders');
      const parsed = prevSaved ? JSON.parse(prevSaved) : [];
      localStorage.setItem('nnepa_foriwaa_orders', JSON.stringify([order, ...parsed]));
    } catch {}
    setCartItems([]);
  };

  const handleSubscribe = (email: string) => {
    showToast(`🎉 Thank you! 10% coupon has been sent to ${email}`);
  };

  const handleScrollToSection = (sectionId: string) => {
    setPageWithHash('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  const handleViewDetails = (product: Product) => {
    setPageWithHash('details', product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter dynamic catalogue list
  let filteredProducts = products.filter((p) => {
    if (showWishlistOnly && !wishlist.includes(p.id)) return false;
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return 0; // featured
  });

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-pearl font-sans text-plum-dark overflow-x-hidden antialiased select-none scroll-smooth">
      {/* ═══ LOADER ═══ */}
      <Loader />

      {/* ═══ NAVIGATION BAR ═══ */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onScrollToSection={handleScrollToSection}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentPage={page}
        onPageChange={(p) => {
          if (p === 'wishlist') {
            setShowWishlistOnly(true);
            setPageWithHash('shop');
          } else {
            if (p === 'shop') setShowWishlistOnly(false);
            if (p === 'admin-dashboard' && !adminToken) {
              setPageWithHash('admin-login');
            } else {
              setPageWithHash(p);
            }
          }
        }}
        adminToken={adminToken}
      />

      {/* ═══ MOBILE MENU ═══ */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPage={page}
        onPageChange={(p) => {
          if (p === 'wishlist') {
            setShowWishlistOnly(true);
            setPageWithHash('shop');
          } else {
            if (p === 'shop') setShowWishlistOnly(false);
            if (p === 'admin-dashboard' && !adminToken) {
              setPageWithHash('admin-login');
            } else {
              setPageWithHash(p);
            }
          }
        }}
        adminToken={adminToken}
      />

      {/* ═══ MAIN CONTENT WRAPPER ═══ */}
      <main className="flex-1 flex flex-col w-full">
        {/* ═══ ROUTED VIEWS SWITCH ═══ */}
      {page === 'home' && (
        <div className="animate-fade-in">
          {/* ═══ HERO PRESENTATION SLIDESHOW ═══ */}
          <Hero
            onExplore={() => handleScrollToSection('categories')}
          />

          {/* ═══ ROLLING INFOBAND ACCENT TAPE ═══ */}
          <div className="overflow-hidden bg-gradient-to-r from-plum via-lavender to-mauve-deep py-4 select-none relative z-10 shadow-sm">
            <div className="flex w-max gap-14 animate-marquee">
              {Array.from({ length: 4 }).map((_, rIdx) => (
                <div key={rIdx} className="flex gap-14 items-center">
                  <span className="flex items-center gap-6 text-[0.62rem] font-medium tracking-[0.3em] uppercase text-white/90 whitespace-nowrap">
                    Handcrafted Luxury <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
                  </span>
                  <span className="flex items-center gap-6 text-[0.62rem] font-medium tracking-[0.3em] uppercase text-white/90 whitespace-nowrap">
                    Authentic African Fabrics <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
                  </span>
                  <span className="flex items-center gap-6 text-[0.62rem] font-medium tracking-[0.3em] uppercase text-white/90 whitespace-nowrap">
                    Custom Tailoring <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
                  </span>
                  <span className="flex items-center gap-6 text-[0.62rem] font-medium tracking-[0.3em] uppercase text-white/90 whitespace-nowrap">
                    Men & Women <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
                  </span>
                  <span className="flex items-center gap-6 text-[0.62rem] font-medium tracking-[0.3em] uppercase text-white/90 whitespace-nowrap">
                    Ghana Showrooms <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
                  </span>
                  <span className="flex items-center gap-6 text-[0.62rem] font-medium tracking-[0.3em] uppercase text-white/90 whitespace-nowrap">
                    Made to Measure <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ CATEGORIES MODULE ═══ */}
          <Categories
            onCategorySelect={(cat) => {
              setActiveCategory(cat);
              setPage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* ═══ FEATURED TOP OUTFIT SHOWCASE ═══ */}
          <FeaturedOutfit
            outfit={topOutfit}
            onViewDetails={handleViewDetails}
          />

          {/* ═══ BRAND ETHOS & CRAFT STORIES ═══ */}
          <Heritage />
          <Stats />
          <Testimonials />
        </div>
      )}

      {/* ═══ SHOPPING GALLERY VIEW ═══ */}
      {page === 'shop' && (
        <div className="pt-28 pb-20 bg-pearl min-h-[85vh] animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            {/* Filter and Sorting Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-lilac/15">
              {/* Category Pills & Wishlist Tab */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex border border-solid border-lilac/25 rounded-[3px] overflow-hidden w-fit bg-white/60 shadow-xs">
                  {(['all', 'women', 'men', 'bags'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setShowWishlistOnly(false);
                      }}
                      className={`px-4 sm:px-5 py-2 text-[0.62rem] font-bold tracking-[0.16em] uppercase border-none cursor-pointer border-r border-solid border-lilac/25 last:border-r-0 transition-all ${
                        !showWishlistOnly && activeCategory === cat
                          ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white shadow-inner'
                          : 'bg-transparent text-text-muted hover:text-lavender'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Wishlist Pill */}
                {wishlist.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                    className={`px-3.5 py-2 text-[0.62rem] font-bold tracking-[0.16em] uppercase rounded-[3px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                      showWishlistOnly
                        ? 'bg-mauve-deep text-white border-mauve-deep shadow-xs'
                        : 'bg-white/70 hover:bg-white text-plum-dark border-lilac/25'
                    }`}
                  >
                    <span>❤️</span>
                    Saved ({wishlist.length})
                  </button>
                )}

                {/* In Stock Toggle */}
                <button
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`px-3.5 py-2 text-[0.62rem] font-bold tracking-[0.16em] uppercase rounded-[3px] border transition-all cursor-pointer ${
                    inStockOnly
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white/70 hover:bg-white text-plum-dark border-lilac/25'
                  }`}
                >
                  {inStockOnly ? '✓ In Stock' : 'In Stock Only'}
                </button>
              </div>

              {/* Sorting and Size Guide */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/70 border border-lilac/25 rounded-[3px] px-3 py-1.5">
                  <span className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-text-muted">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-xs font-semibold text-plum-dark outline-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPage('size-chart');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hidden sm:inline-block px-3.5 py-2 bg-white/70 hover:bg-white text-plum-dark text-[0.62rem] font-bold tracking-[0.16em] uppercase rounded-[3px] border border-lilac/25 transition-all cursor-pointer shadow-2xs"
                >
                  Size Guide
                </button>
              </div>
            </div>

            {/* Main Dynamic Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white/60 rounded-md border border-lilac/20 p-8 flex flex-col items-center justify-center max-w-lg mx-auto">
                <p className="font-serif text-xl text-plum-dark mb-2">New Season Creations</p>
                <p className="text-xs text-text-light leading-relaxed mb-6">
                  {activeCategory === 'all'
                    ? 'Our ateliers are tailoring custom pieces. Upload outfits via the Admin Portal or request a bespoke custom order.'
                    : `No items currently listed in the ${activeCategory} collection.`}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPage('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-plum-dark hover:bg-plum text-white text-xs font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all cursor-pointer"
                  >
                    Custom Bespoke Fitting
                  </button>
                  <button
                    onClick={() => {
                      setPage(adminToken ? 'admin-dashboard' : 'admin-login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-transparent border border-lilac/40 text-mauve-deep hover:bg-lilac/10 text-xs font-bold tracking-[0.18em] uppercase rounded-[2px] transition-all cursor-pointer"
                  >
                    + Upload Outfit
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWished={wishlist.includes(p.id)}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ CODE-SPLIT VIEWS WRAPPED IN SUSPENSE ═══ */}
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex flex-col items-center justify-center bg-pearl text-center px-4">
            <div className="w-10 h-10 border-2 border-lavender border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep">
              Loading Atelier Experience...
            </span>
          </div>
        }
      >
        {/* ═══ CHECKOUT VIEW ═══ */}
        {page === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            onBackToShop={() => setPageWithHash('shop')}
            onOrderCompleted={handleOrderCompleted}
            showToast={showToast}
          />
        )}

        {/* ═══ DETAIL SPLIT VIEW ═══ */}
        {page === 'details' && activeProduct && (
          <ProductDetailsView
            product={activeProduct}
            onBack={() => setPageWithHash('shop')}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWished={wishlist.includes(activeProduct.id)}
          />
        )}

        {/* ═══ ABOUT OUTLINE VIEW ═══ */}
        {page === 'about' && <AboutView />}

        {/* ═══ CONTACT COORDINATES VIEW ═══ */}
        {page === 'contact' && <ContactView />}

        {/* ═══ POLICIES VIEW (Terms of Service / Privacy Policy) ═══ */}
        {(page === 'terms' || page === 'privacy') && (
          <LegalView
            initialTab={page === 'privacy' ? 'privacy' : 'terms'}
            onNavigateToContact={() => setPageWithHash('contact')}
          />
        )}

        {/* ═══ SIZE CHART VIEW ═══ */}
        {page === 'size-chart' && (
          <SizeChartView
            onBackToShop={() => setPageWithHash('shop')}
            initialCategory={activeCategory === 'men' ? 'men' : 'women'}
          />
        )}

        {/* ═══ ADMIN LOGIN VIEW ═══ */}
        {page === 'admin-login' && (
          <AdminLoginView
            onLoginSuccess={(token) => {
              try {
                localStorage.setItem('nnepa_foriwaa_token', token);
              } catch {}
              setAdminToken(token);
              setPageWithHash('admin-dashboard');
              showToast('🛡 Administrative session established successfully');
            }}
          />
        )}

        {/* ═══ ADMIN INVENTORY DASHBOARD VIEW ═══ */}
        {page === 'admin-dashboard' && (
          <AdminDashboardView
            adminToken={adminToken || ''}
            onLogout={async () => {
              if (adminToken) {
                try {
                  await fetch('/api/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${adminToken}` }
                  });
                } catch {}
              }
              try {
                localStorage.removeItem('nnepa_foriwaa_token');
              } catch {}
              setAdminToken(null);
              setPageWithHash('home');
              showToast('Successfully exited administrative panel');
            }}
            showToast={showToast}
            onRefreshProducts={fetchActiveProducts}
          />
        )}
      </Suspense>

      {/* ═══ NEWSLETTER INK (Hiding inside admin screens) ═══ */}
      {page !== 'admin-dashboard' && page !== 'admin-login' && (
        <Newsletter onSubscribe={handleSubscribe} />
      )}
      </main>

      {/* ═══ COMPREHENSIVE COMPACT FOOTER BAR ═══ */}
      <Footer
        currentPage={page}
        onNavigate={(targetPage, category) => {
          if (category) setActiveCategory(category);
          if (targetPage === 'admin-dashboard' && !adminToken) {
            setPageWithHash('admin-login');
          } else {
            setPageWithHash(targetPage);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onScrollToSection={handleScrollToSection}
        adminToken={adminToken}
      />

      {/* ═══ UTILITY CART SHOPPING BAG DRAWER ═══ */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        onStartShopping={() => {
          setIsCartOpen(false);
          handleScrollToSection('categories');
        }}
      />

      {/* ═══ INTERACTIVE SEARCH OVERLAY MODAL ═══ */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => handleViewDetails(p)}
        onAddToCart={handleAddToCart}
      />

      {/* ═══ TOAST FEEDBACK PANE ═══ */}
      <Toast message={toastMessage} />
    </div>
  );
}
