/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import Loader from './components/Loader.tsx';
import Navbar from './components/Navbar.tsx';
import MobileMenu from './components/MobileMenu.tsx';
import Hero from './components/Hero.tsx';
import Categories from './components/Categories.tsx';
import ProductCard from './components/ProductCard.tsx';
import Heritage from './components/Heritage.tsx';
import Lookbook from './components/Lookbook.tsx';
import Stats from './components/Stats.tsx';
import Testimonials from './components/Testimonials.tsx';
import Newsletter from './components/Newsletter.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import SearchModal from './components/SearchModal.tsx';
import Toast from './components/Toast.tsx';

// Dynamic Multi-Page Sub views
import AboutView from './components/AboutView.tsx';
import ContactView from './components/ContactView.tsx';
import ProductDetailsView from './components/ProductDetailsView.tsx';
import AdminLoginView from './components/AdminLoginView.tsx';
import AdminDashboardView from './components/AdminDashboardView.tsx';

import { PRODUCTS as DEFAULT_PRODUCTS } from './data.ts';
import { Product, CartItem } from './types.ts';

export default function App() {
  // Virtual State-Based Routing
  const [page, setPage] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'women' | 'men' | 'kids'>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Pull products dynamically on startup
  useEffect(() => {
    fetchActiveProducts();
  }, []);

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
          localCustomProducts = parsed.filter(p => p && p.id && p.id.startsWith('prod_'));
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

      if (missingOnServer.length > 0) {
        // If we are logged in as admin, we can sync/rehydrate them back to the server database
        const token = localStorage.getItem('nnepa_foriwaa_token') || adminToken;
        if (token) {
          try {
            const syncRes = await fetch('/api/products/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ products: missingOnServer })
            });
            if (syncRes.ok) {
              // Successfully rehydrated! Refetch the newly merged list
              const mergedRes = await fetch('/api/products');
              if (mergedRes.ok) {
                const mergedData = await mergedRes.json();
                if (mergedData.products && Array.isArray(mergedData.products)) {
                  serverProducts = mergedData.products;
                }
              }
            }
          } catch (syncErr) {
            console.error('Error synchronizing custom products to server:', syncErr);
          }
        } else {
          // If not logged in as admin, gracefully append them locally in the state to prevent them from disappearing
          serverProducts = [...serverProducts, ...missingOnServer];
        }
      }

      setProducts(serverProducts);
      try {
        localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(serverProducts));
      } catch {}
      return;
    }

    // Server was unreached, fall back to offline local storage
    if (localCustomProducts.length > 0 || (localStorage.getItem('nnepa_foriwaa_products') && localStorage.getItem('nnepa_foriwaa_products') !== '[]')) {
      try {
        const cached = localStorage.getItem('nnepa_foriwaa_products');
        if (cached) {
          setProducts(JSON.parse(cached));
          return;
        }
      } catch {}
    }

    // High fidelity default mock fallback if absolutely nothing exists
    const localDefaults: Product[] = DEFAULT_PRODUCTS.map((p) => ({
      ...p,
      price: Math.round(p.price * 10),
      originalPrice: p.originalPrice ? Math.round(p.originalPrice * 10) : undefined,
      inStock: p.id !== 'w3',
      description: p.description || `${p.name} - Hand tailored custom West African garment crafted from pristine ${p.subcategory || 'Ankara'} weave.`,
      sizes: p.sizes || ['S', 'M', 'L', 'XL', 'XXL']
    }));
    setProducts(localDefaults);
    try {
      localStorage.setItem('nnepa_foriwaa_products', JSON.stringify(localDefaults));
    } catch {}
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
    // Elegant transition to customized order guidelines
    showToast('🎉 Direct order received! Opening fitting desk...');
    setCartItems([]);
    setIsCartOpen(false);
    setPage('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (email: string) => {
    showToast(`🎉 Thank you! 10% coupon has been sent to ${email}`);
  };

  const handleScrollToSection = (sectionId: string) => {
    setPage('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  const handleViewDetails = (product: Product) => {
    setActiveProduct(product);
    setPage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter dynamic catalogue list
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

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
          if (p === 'admin-dashboard' && !adminToken) {
            setPage('admin-login');
          } else {
            setPage(p);
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
          if (p === 'admin-dashboard' && !adminToken) {
            setPage('admin-login');
          } else {
            setPage(p);
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
            onExplore={() => {
              setPage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewLookbook={() => handleScrollToSection('lookbook')}
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
                    Men · Women · Children <span className="w-1.5 h-1.5 bg-white/45 rotate-45 inline-block" />
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

          {/* ═══ CURATED HERO SNEAK PICKS SECTION ═══ */}
          <section id="products" className="py-20 md:py-24 px-6 md:px-12 bg-gradient-to-b from-pearl-2 to-pearl border-t border-solid border-lilac/10">
            <div className="text-center mb-12 md:mb-16">
              <div className="text-[0.65rem] sm:text-xs font-bold tracking-[0.4em] uppercase text-mauve-deep flex items-center justify-center gap-3.5 animate-fade-in">
                <span className="w-[26px] h-[1px] bg-gradient-to-r from-lavender to-mauve" />
                Featured Picks
                <span className="w-[26px] h-[1px] bg-gradient-to-l from-lavender to-mauve" />
              </div>
            </div>

            {/* Curated Grid Displaying 2 Top items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto" id="products-catalog-grid">
              {products.slice(0, 2).map((p) => (
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

            {/* Navigation hook trigger */}
            <div className="text-center mt-14">
              <button
                onClick={() => {
                  setPage('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 bg-transparent border border-solid border-lavender/40 text-lavender hover:bg-lavender/10 text-[0.686rem] font-bold tracking-[0.18em] uppercase rounded-[2px] transition-all cursor-pointer"
              >
                Display Entire Showroom Room →
              </button>
            </div>
          </section>

          {/* ═══ BRAND ETHOS & CRAFT STORIES ═══ */}
          <Heritage />
          <Lookbook />
          <Stats />
          <Testimonials />
        </div>
      )}

      {/* ═══ SHOPPING GALLERY VIEW ═══ */}
      {page === 'shop' && (
        <div className="pt-28 pb-20 bg-pearl min-h-[85vh] animate-fade-in">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-mauve-deep flex items-center gap-2.5 mb-2">
                  <span className="w-4 h-[1px] bg-lavender animate-pulse" /> Categories
                </span>
              </div>

              {/* Filtering matrix row */}
              <div className="flex border border-solid border-lilac/25 rounded-[3px] overflow-hidden w-fit bg-white/50 backdrop-blur-md">
                {(['all', 'women', 'men', 'kids'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 text-[0.62rem] font-bold tracking-[0.16em] uppercase border-none cursor-pointer border-r border-solid border-lilac/25 last:border-r-0 transition-all ${
                      activeCategory === cat
                        ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white shadow-inner'
                        : 'bg-transparent text-text-muted hover:text-lavender'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Dynamic Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          </div>
        </div>
      )}

      {/* ═══ DETAIL SPLIT VIEW ═══ */}
      {page === 'details' && activeProduct && (
        <ProductDetailsView
          product={activeProduct}
          onBack={() => setPage('shop')}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWished={wishlist.includes(activeProduct.id)}
        />
      )}

      {/* ═══ ABOUT OUTLINE VIEW ═══ */}
      {page === 'about' && <AboutView />}

      {/* ═══ CONTACT COORDINATES VIEW ═══ */}
      {page === 'contact' && <ContactView />}

      {/* ═══ ADMIN LOGIN SHIELD VIEW ═══ */}
      {page === 'admin-login' && (
        <AdminLoginView
          onLoginSuccess={(token) => {
            try {
              localStorage.setItem('nnepa_foriwaa_token', token);
            } catch {}
            setAdminToken(token);
            setPage('admin-dashboard');
            showToast('🛡 Administrative session established successfully');
          }}
        />
      )}

      {/* ═══ ADMIN INVENTORY DASHBOARD VIEW ═══ */}
      {page === 'admin-dashboard' && (
        <AdminDashboardView
          adminToken={adminToken || ''}
          onLogout={() => {
            try {
              localStorage.removeItem('nnepa_foriwaa_token');
            } catch {}
            setAdminToken(null);
            setPage('home');
            showToast('Successfully exited administrative panel');
          }}
          showToast={showToast}
          onRefreshProducts={fetchActiveProducts}
        />
      )}

      {/* ═══ NEWSLETTER INK (Hiding inside admin screens) ═══ */}
      {page !== 'admin-dashboard' && page !== 'admin-login' && (
        <Newsletter onSubscribe={handleSubscribe} />
      )}
      </main>

      {/* ═══ COMPREHENSIVE FOOTER BAR ═══ */}
      <Footer onScrollToSection={handleScrollToSection} />

      {/* ═══ UTILITY CART SHOPPING BAG DRAWER ═══ */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
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
