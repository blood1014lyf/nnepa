/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, Suspense } from 'react';
import Loader from './components/Loader.tsx';
import Navbar from './components/Navbar.tsx';
import MobileMenu from './components/MobileMenu.tsx';
import Hero from './components/Hero.tsx';
import FeaturedOutfit from './components/FeaturedOutfit.tsx';
import Heritage from './components/Heritage.tsx';
import Testimonials from './components/Testimonials.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import SearchModal from './components/SearchModal.tsx';
import Toast from './components/Toast.tsx';
import CookieBanner from './components/CookieBanner.tsx';
import CollectionShopView from './components/CollectionShopView.tsx';
import ShoppingConcierge from './components/ShoppingConcierge.tsx';

// Code-split auxiliary multi-page views with React.lazy
const AboutView = React.lazy(() => import('./components/AboutView.tsx'));
const ContactView = React.lazy(() => import('./components/ContactView.tsx'));
const LegalView = React.lazy(() => import('./components/LegalView.tsx'));
const ProductDetailsView = React.lazy(() => import('./components/ProductDetailsView.tsx'));
const AdminLoginView = React.lazy(() => import('./components/AdminLoginView.tsx'));
const AdminDashboardView = React.lazy(() => import('./components/AdminDashboardView.tsx'));
const SizeChartView = React.lazy(() => import('./components/SizeChartView.tsx'));
const CheckoutView = React.lazy(() => import('./components/CheckoutView.tsx'));
const OrderStatusView = React.lazy(() => import('./components/OrderStatusView.tsx'));

import { PRODUCTS as DEFAULT_PRODUCTS } from './data.ts';
import { Product, CartItem, Order } from './types.ts';

function enrichCatalogWithDefaults(source: Product[]): Product[] {
  if (!source || source.length === 0) return DEFAULT_PRODUCTS;
  const defaultsById = new Map(DEFAULT_PRODUCTS.map((d) => [d.id, d]));

  const enriched = source.map((item) => {
    const def = defaultsById.get(item.id);
    if (!def) return item;
    const isPexels = typeof item.imageUrl === 'string' && item.imageUrl.includes('pexels.com');
    const isHoverPexels = typeof item.hoverImageUrl === 'string' && item.hoverImageUrl.includes('pexels.com');
    return {
      ...def,
      ...item,
      imageUrl: isPexels ? def.imageUrl : (item.imageUrl || def.imageUrl),
      hoverImageUrl: isHoverPexels ? def.hoverImageUrl : (item.hoverImageUrl || def.hoverImageUrl),
      subcategory: def.subcategory || item.subcategory,
      color: item.color || def.color,
      colorCount: item.colorCount ?? def.colorCount,
    };
  });

  const missingDefaults = DEFAULT_PRODUCTS.filter(
    (def) => !enriched.some((existing) => existing.id === def.id)
  );

  return [...enriched, ...missingDefaults];
}

const DEFAULT_TOP_OUTFIT: Product = {
  id: 'prod_1789572165351',
  name: 'Queen Mother Royal Kente Gown',
  category: 'women',
  subcategory: 'Dresses & Gowns',
  price: 2850,
  rating: 5,
  imageUrl: DEFAULT_PRODUCTS[1]?.imageUrl || '/assets/images/lookbook_02_plum_emerald_gown.jpg',
  badge: 'Bestseller',
  inStock: true,
  description: 'Full-length evening gown cut from handwoven Ghanaian silk Kente and weighty brocade, tailored for weddings and formal celebrations.',
  sizes: ['S', 'M', 'L', 'XL', 'XXL']
};

export default function App() {
  // Virtual State-Based Routing
  const [page, setPage] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'women' | 'men' | 'bags'>('all');
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const cached = localStorage.getItem('nnepa_foriwaa_cart');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const defaultsById = new Map(DEFAULT_PRODUCTS.map((d) => [d.id, d]));
          return parsed
            .map((item: any) => {
              const pId = item.productId || (item.product && item.product.id);
              const foundProduct = defaultsById.get(pId) || item.product;
              if (!foundProduct) return null;
              return {
                product: foundProduct,
                quantity: Math.max(1, Number(item.quantity) || 1),
                size: item.size
              };
            })
            .filter(Boolean) as CartItem[];
        }
      }
    } catch {}
    return [];
  });
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

  // Sync cart (only productId, size, quantity — never client prices) and wishlist to localStorage
  useEffect(() => {
    try {
      const storageSafeCart = cartItems.map((item) => ({
        productId: item.product.id,
        size: item.size,
        quantity: item.quantity
      }));
      localStorage.setItem('nnepa_foriwaa_cart', JSON.stringify(storageSafeCart));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('nnepa_foriwaa_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      try {
        if (e.key === 'nnepa_foriwaa_cart' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const defaultsById = new Map(DEFAULT_PRODUCTS.map((d) => [d.id, d]));
            const restored = parsed
              .map((item: any) => {
                const pId = item.productId || (item.product && item.product.id);
                const foundProduct = defaultsById.get(pId) || item.product;
                if (!foundProduct) return null;
                return {
                  product: foundProduct,
                  quantity: Math.max(1, Number(item.quantity) || 1),
                  size: item.size
                };
              })
              .filter(Boolean) as CartItem[];
            setCartItems(restored);
          }
        } else if (e.key === 'nnepa_foriwaa_wishlist' && e.newValue) {
          setWishlist(JSON.parse(e.newValue));
        }
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
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

  const [activeOrderPublicId, setActiveOrderPublicId] = useState<string>('');
  const topOutfit = products.find((p) => p.id === 'prod_1789572165351') || products[0] || DEFAULT_TOP_OUTFIT;

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

  // Synchronize route with window.location.hash for deep linking & multi-tab shop navigation
  useEffect(() => {
    const syncRouteFromHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      const [hashPath, rawQuery = ''] = rawHash.split('?');

      if (!hashPath || hashPath === 'home') {
        setPage('home');
        return;
      }

      if (hashPath.startsWith('product/')) {
        const prodId = decodeURIComponent(hashPath.replace('product/', ''));
        const combined = enrichCatalogWithDefaults(products);
        const found = combined.find((p) => p.id === prodId);
        if (found) {
          setActiveProduct(found);
          setPage('details');
        } else {
          setPage('shop');
        }
        return;
      }

      if (hashPath === 'shop') {
        const params = new URLSearchParams(rawQuery);
        const cat = params.get('category');
        if (cat === 'women' || cat === 'men' || cat === 'bags' || cat === 'all') {
          setActiveCategory(cat);
        } else {
          setActiveCategory('all');
        }
        setShowWishlistOnly(params.get('saved') === '1');
        setPage('shop');
        return;
      }

      if (hashPath.startsWith('order/')) {
        const ordId = decodeURIComponent(hashPath.replace('order/', '')).trim();
        setActiveOrderPublicId(ordId);
        setPage('order-status');
        return;
      }

      if (hashPath === 'admin' || hashPath === 'admin-dashboard') {
        const savedToken = localStorage.getItem('nnepa_foriwaa_token') || adminToken;
        if (!savedToken) {
          setPage('admin-login');
        } else {
          setPage('admin-dashboard');
        }
        return;
      }

      if (['about', 'contact', 'terms', 'privacy', 'size-chart', 'checkout', 'admin-login', 'admin-dashboard'].includes(hashPath)) {
        setPage(hashPath);
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
      showToast('Out of stock, redirecting to custom order form');
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
    showToast(`Added "${product.name}" ${size ? `(${size})` : ''} to cart`);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Added "${product.name}" to wishlist`);
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

  const allCatalogProducts: Product[] = enrichCatalogWithDefaults(products);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-pearl font-serif text-plum-dark overflow-x-hidden antialiased select-none scroll-smooth">
      {/* ═══ LOADER ═══ */}
      <Loader />

      {/* ═══ ADMIN DEDICATED HEADER (Dedicated Standalone Layout) ═══ */}
      {(page === 'admin-login' || page === 'admin-dashboard') ? (
        <header className="bg-plum-dark text-white px-6 py-4 flex items-center justify-between border-b border-plum/30 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-wider font-light">Nnepa Foriwaa</span>
            <span className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-lavender bg-white/10 px-2.5 py-0.5 rounded">
              Atelier Studio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#/home"
              onClick={() => setPageWithHash('home')}
              className="text-xs text-pearl-2/80 hover:text-white transition-colors flex items-center gap-1.5 no-underline cursor-pointer"
            >
              <span>← Back to Storefront</span>
            </a>
          </div>
        </header>
      ) : (
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
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              if (p === 'shop') {
                setActiveCategory('all');
                setShowWishlistOnly(false);
              }
              if (p === 'admin-dashboard' && !adminToken) {
                setPageWithHash('admin-login');
              } else {
                setPageWithHash(p);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          adminToken={adminToken}
        />
      )}

      {/* ═══ MOBILE MENU ═══ */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPage={page}
        onPageChange={(p) => {
          if (p === 'wishlist') {
            setShowWishlistOnly(true);
            setPageWithHash('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            if (p === 'shop') {
              setActiveCategory('all');
              setShowWishlistOnly(false);
            }
            if (p === 'admin-dashboard' && !adminToken) {
              setPageWithHash('admin-login');
            } else {
              setPageWithHash(p);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        adminToken={adminToken}
      />

      {/* ═══ MAIN CONTENT WRAPPER ═══ */}
      <main className="flex-1 flex flex-col w-full min-h-0">
        {/* ═══ ROUTED VIEWS SWITCH ═══ */}
      {page === 'home' && (
        <div className="animate-fade-in">
          {/* ═══ HERO PRESENTATION SLIDESHOW ═══ */}
          <Hero />

          {/* ═══ FEATURED TOP OUTFIT SHOWCASE ═══ */}
          <FeaturedOutfit
            outfit={topOutfit}
            onViewDetails={handleViewDetails}
          />

          {/* ═══ BRAND ETHOS & CRAFT STORIES ═══ */}
          <Heritage />
          <Testimonials />
        </div>
      )}

      {/* ═══ CECILIE BAHNSEN GALLERY SHOP VIEW ═══ */}
      {page === 'shop' && (
        <CollectionShopView
          products={allCatalogProducts}
          initialCategory={activeCategory}
          initialShowWishlistOnly={showWishlistOnly}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onOpenSizeGuide={() => {
            setPageWithHash('size-chart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onRequestCustomFitting={() => {
            setPageWithHash('contact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAdminUpload={() => {
            window.open(adminToken ? '#/admin-dashboard' : '#/admin-login', '_blank');
          }}
        />
      )}

      {/* ═══ CODE-SPLIT VIEWS WRAPPED IN SUSPENSE ═══ */}
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex flex-col items-center justify-center bg-pearl text-center px-4">
            <div className="w-10 h-10 border-2 border-lavender border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep">
              Loading...
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
              showToast('Administrative session established successfully');
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

        {/* ═══ PUBLIC CUSTOMER ORDER STATUS VIEW ═══ */}
        {page === 'order-status' && (
          <OrderStatusView
            publicId={activeOrderPublicId}
            onBackToShop={() => {
              setPageWithHash('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </Suspense>
      </main>

      {/* ═══ COMPREHENSIVE COMPACT FOOTER BAR (Hidden on standalone admin portal) ═══ */}
      {page !== 'admin-login' && page !== 'admin-dashboard' && (
        <Footer
          currentPage={page}
          onNavigate={(targetPage, category) => {
            if (category) {
              setActiveCategory(category);
            } else if (targetPage === 'shop') {
              setActiveCategory('all');
            }
            if (targetPage === 'shop') {
              setShowWishlistOnly(false);
            }
            if (targetPage === 'admin-dashboard' && !adminToken) {
              setPageWithHash('admin-login');
            } else {
              setPageWithHash(targetPage);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onScrollToSection={handleScrollToSection}
          adminToken={adminToken}
          onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
        />
      )}

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
          setActiveCategory('all');
          setShowWishlistOnly(false);
          setPageWithHash('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ═══ INTERACTIVE SEARCH OVERLAY MODAL ═══ */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allCatalogProducts}
        onSelectProduct={(p) => handleViewDetails(p)}
        onAddToCart={handleAddToCart}
      />

      {/* ═══ BESPOKE COOKIE & PRIVACY CONSENT BANNER ═══ */}
      <CookieBanner
        isOpenExternally={isCookieSettingsOpen}
        onCloseExternal={() => setIsCookieSettingsOpen(false)}
        onOpenPrivacyPolicy={() => {
          setPageWithHash('privacy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* ═══ TOAST FEEDBACK PANE ═══ */}
      <Toast message={toastMessage} />

      {/* ═══ PROACTIVE PRIVACY-FIRST SHOPPING CONCIERGE ═══ */}
      <ShoppingConcierge
        currentPage={page}
        activeProduct={activeProduct}
        products={allCatalogProducts}
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        isCartOpen={isCartOpen}
        onNavigate={(targetPage, targetCategory, targetProduct) => {
          setIsCartOpen(false);
          if (targetCategory) {
            setActiveCategory(targetCategory);
          }
          if (targetProduct) {
            handleViewDetails(targetProduct);
          } else {
            setPageWithHash(targetPage);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSizeChart={() => {
          setPageWithHash('size-chart');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
