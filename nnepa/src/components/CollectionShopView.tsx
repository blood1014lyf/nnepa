/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Product } from '../types.ts';

export type QuickFilterKey =
  | 'all'
  | 'women'
  | 'men'
  | 'Dresses & Gowns'
  | 'Tops & Sets'
  | 'Kaftans & Agbada'
  | 'Outerwear & Smocks'
  | 'Bags & Accessories'
  | 'saved';

type SortOption = 'featured' | 'best-selling' | 'price-asc' | 'price-desc' | 'rating';

interface CollectionShopViewProps {
  products: Product[];
  initialCategory?: 'all' | 'women' | 'men' | 'bags';
  initialShowWishlistOnly?: boolean;
  wishlist: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onViewDetails: (product: Product) => void;
  onOpenSizeGuide: () => void;
  onRequestCustomFitting: () => void;
  onOpenAdminUpload: () => void;
}

const QUICK_FILTERS: { key: QuickFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Womenswear' },
  { key: 'men', label: 'Menswear' },
  { key: 'Dresses & Gowns', label: 'Dresses & Gowns' },
  { key: 'Tops & Sets', label: 'Tops & Sets' },
  { key: 'Kaftans & Agbada', label: 'Kaftans & Agbada' },
  { key: 'Outerwear & Smocks', label: 'Outerwear & Smocks' },
  { key: 'Bags & Accessories', label: 'Bags & Accessories' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'rating', label: 'Highest rated' },
];

const DRAWER_CATEGORIES = [
  'Dresses & Gowns',
  'Tops & Sets',
  'Kaftans & Agbada',
  'Outerwear & Smocks',
  'Bags & Accessories',
];

const DRAWER_DEPARTMENTS: { value: 'women' | 'men' | 'bags'; label: string }[] = [
  { value: 'women', label: 'Womenswear' },
  { value: 'men', label: 'Menswear' },
  { value: 'bags', label: 'Artisanal Bags' },
];

const DRAWER_COLORS = [
  'Plum & Violet',
  'Gold & Ochre',
  'Crimson & Blush',
  'Emerald & Sage',
  'Ivory & Pearl',
  'Indigo & Navy',
  'Ebony & Charcoal',
];

const DRAWER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const PAGE_STEP = 12;

const COLLECTION_HEADINGS: Record<QuickFilterKey, string> = {
  all: 'All',
  women: 'Womenswear',
  men: 'Menswear',
  'Dresses & Gowns': 'Dresses & Gowns',
  'Tops & Sets': 'Tops & Sets',
  'Kaftans & Agbada': 'Kaftans & Agbada',
  'Outerwear & Smocks': 'Outerwear & Smocks',
  'Bags & Accessories': 'Bags & Accessories',
  saved: 'Saved',
};

function mapInitialToQuickFilter(
  initialCategory?: 'all' | 'women' | 'men' | 'bags',
  initialShowWishlistOnly?: boolean
): QuickFilterKey {
  if (initialShowWishlistOnly) return 'saved';
  if (initialCategory === 'women') return 'women';
  if (initialCategory === 'men') return 'men';
  if (initialCategory === 'bags') return 'Bags & Accessories';
  return 'all';
}

export default function CollectionShopView({
  products,
  initialCategory = 'all',
  initialShowWishlistOnly = false,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
  onOpenSizeGuide,
  onRequestCustomFitting,
  onOpenAdminUpload,
}: CollectionShopViewProps) {
  const drawerId = useId();

  // Grid mode ('even' = 4-col gallery, 'uneven' = Cecilie Bahnsen 2-wide + 4-up asymmetric gallery)
  const [gridType, setGridType] = useState<'even' | 'uneven'>(() => {
    try {
      return localStorage.getItem('nnepa-collection-grid-type') === 'uneven' ? 'uneven' : 'even';
    } catch {
      return 'even';
    }
  });

  // Active quick filter bar state
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey>(() =>
    mapInitialToQuickFilter(initialCategory, initialShowWishlistOnly)
  );

  // Sync when parent navigation updates category or wishlist mode
  useEffect(() => {
    setQuickFilter(mapInitialToQuickFilter(initialCategory, initialShowWishlistOnly));
    setVisibleCount(PAGE_STEP);
  }, [initialCategory, initialShowWishlistOnly]);

  // Applied Filter & Sort states
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Staged states inside the Filter & Sort drawer before clicking "Show selection"
  const [draftSortBy, setDraftSortBy] = useState<SortOption>('featured');
  const [draftDepartments, setDraftDepartments] = useState<string[]>([]);
  const [draftSubcategories, setDraftSubcategories] = useState<string[]>([]);
  const [draftColors, setDraftColors] = useState<string[]>([]);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [draftInStockOnly, setDraftInStockOnly] = useState<boolean>(false);

  // Pagination & back-to-top state
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_STEP);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Scroll-snap drawer states & refs
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [drawerExpanded, setDrawerExpanded] = useState<boolean>(false);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const hasEnteredSheetRef = useRef<boolean>(false);

  // Toggle grid mode and persist to localStorage
  const handleToggleGrid = () => {
    const next = gridType === 'even' ? 'uneven' : 'even';
    setGridType(next);
    try {
      localStorage.setItem('nnepa-collection-grid-type', next);
    } catch {}
  };

  // Back-to-top visibility listener
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-driven backdrop fallback + IntersectionObserver state tracking for the Filter Drawer
  useEffect(() => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    if (!drawer || !scroller || !sheet) return;

    const supportsScrollTimeline =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline: scroll()');

    const onScrollerScroll = () => {
      if (!supportsScrollTimeline && sheet.offsetWidth > 0) {
        const ratio = Math.min(1, Math.max(0, scroller.scrollLeft / sheet.offsetWidth));
        drawer.style.setProperty('--drawer-backdrop', String(ratio));
      }
    };

    if (!supportsScrollTimeline) {
      scroller.addEventListener('scroll', onScrollerScroll, { passive: true });
    }

    const visibleThreshold = Math.min(0.05, 2 / Math.max(320, window.innerWidth));
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        if (entry.intersectionRatio >= 0.95) {
          hasEnteredSheetRef.current = true;
          setDrawerExpanded(true);
          if (contentWrapperRef.current) {
            contentWrapperRef.current.inert = true;
          }
          sheet.focus({ preventScroll: true });
        } else if (hasEnteredSheetRef.current && entry.intersectionRatio <= visibleThreshold) {
          hasEnteredSheetRef.current = false;
          setDrawerExpanded(false);
          setDrawerVisible(false);
          if (contentWrapperRef.current) {
            contentWrapperRef.current.inert = false;
          }
          document.body.style.overflow = '';
          openBtnRef.current?.focus({ preventScroll: true });
        }
      },
      { root: drawer, threshold: [0, visibleThreshold, 0.95, 1] }
    );

    observer.observe(sheet);

    return () => {
      observer.disconnect();
      if (!supportsScrollTimeline) {
        scroller.removeEventListener('scroll', onScrollerScroll);
      }
      if (contentWrapperRef.current) {
        contentWrapperRef.current.inert = false;
      }
      document.body.style.overflow = '';
    };
  }, []);

  // Open drawer with staged values synced to currently applied values
  const openDrawer = async () => {
    setDraftSortBy(sortBy);
    setDraftDepartments(selectedDepartments);
    setDraftSubcategories(selectedSubcategories);
    setDraftColors(selectedColors);
    setDraftSizes(selectedSizes);
    setDraftInStockOnly(inStockOnly);

    const scroller = scrollerRef.current;
    const drawer = drawerRef.current;
    if (!scroller || !drawer) return;

    hasEnteredSheetRef.current = false;
    setDrawerVisible(true);
    document.body.style.overflow = 'hidden';

    // Ensure scroller starts at closed stop (left = 0) and commits before smooth-scrolling right to the sheet
    scroller.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    scroller.scrollTo({ left: scroller.scrollWidth, behavior: 'auto' });
  };

  const closeDrawer = () => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      setDrawerExpanded(false);
      setDrawerVisible(false);
      document.body.style.overflow = '';
      return;
    }
    if (!hasEnteredSheetRef.current) {
      setDrawerExpanded(false);
      setDrawerVisible(false);
      if (contentWrapperRef.current) {
        contentWrapperRef.current.inert = false;
      }
      document.body.style.overflow = '';
      return;
    }
    scroller.scrollTo({ left: 0, behavior: 'auto' });
  };

  // Escape key closes drawer
  useEffect(() => {
    if (!drawerVisible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerVisible]);

  // Helper function to filter & sort given a set of filter parameters
  const computeFilteredProducts = (params: {
    qf: QuickFilterKey;
    sort: SortOption;
    depts: string[];
    subcats: string[];
    colors: string[];
    sizes: string[];
    stockOnly: boolean;
  }) => {
    const list = products.filter((p) => {
      // Quick-filter bar check
      if (params.qf === 'saved' && !wishlist.includes(p.id)) return false;
      if (params.qf === 'women' && p.category !== 'women') return false;
      if (params.qf === 'men' && p.category !== 'men') return false;
      if (
        params.qf !== 'all' &&
        params.qf !== 'women' &&
        params.qf !== 'men' &&
        params.qf !== 'saved'
      ) {
        if (params.qf === 'Bags & Accessories') {
          if (p.category !== 'bags' && p.subcategory !== 'Bags & Accessories') return false;
        } else if (p.subcategory !== params.qf) {
          return false;
        }
      }

      // Drawer facets
      if (params.depts.length > 0 && !params.depts.includes(p.category)) return false;
      if (params.subcats.length > 0 && !params.subcats.includes(p.subcategory)) return false;
      if (params.colors.length > 0 && (!p.color || !params.colors.includes(p.color))) return false;
      if (
        params.sizes.length > 0 &&
        (!p.sizes || !p.sizes.some((sz) => params.sizes.includes(sz)))
      ) {
        return false;
      }
      if (params.stockOnly && p.inStock === false) return false;

      return true;
    });

    return [...list].sort((a, b) => {
      if (params.sort === 'price-asc') return a.price - b.price;
      if (params.sort === 'price-desc') return b.price - a.price;
      if (params.sort === 'rating') return b.rating - a.rating;
      if (params.sort === 'best-selling') {
        const aScore = a.badge === 'Bestseller' ? 2 : a.badge === 'Exclusive' ? 1 : 0;
        const bScore = b.badge === 'Bestseller' ? 2 : b.badge === 'Exclusive' ? 1 : 0;
        return bScore - aScore;
      }
      return 0;
    });
  };

  const filteredProducts = useMemo(
    () =>
      computeFilteredProducts({
        qf: quickFilter,
        sort: sortBy,
        depts: selectedDepartments,
        subcats: selectedSubcategories,
        colors: selectedColors,
        sizes: selectedSizes,
        stockOnly: inStockOnly,
      }),
    [
      products,
      wishlist,
      quickFilter,
      sortBy,
      selectedDepartments,
      selectedSubcategories,
      selectedColors,
      selectedSizes,
      inStockOnly,
    ]
  );

  const draftMatchingProducts = useMemo(
    () =>
      computeFilteredProducts({
        qf: quickFilter,
        sort: draftSortBy,
        depts: draftDepartments,
        subcats: draftSubcategories,
        colors: draftColors,
        sizes: draftSizes,
        stockOnly: draftInStockOnly,
      }),
    [
      products,
      wishlist,
      quickFilter,
      draftSortBy,
      draftDepartments,
      draftSubcategories,
      draftColors,
      draftSizes,
      draftInStockOnly,
    ]
  );

  // Active drawer labels for Selected filters bar
  const draftSelectedLabels = useMemo(() => {
    const labels: string[] = [];
    draftDepartments.forEach((d) => {
      const found = DRAWER_DEPARTMENTS.find((x) => x.value === d);
      if (found) labels.push(found.label);
    });
    draftSubcategories.forEach((s) => labels.push(s));
    draftColors.forEach((c) => labels.push(c));
    draftSizes.forEach((sz) => labels.push(`Size ${sz}`));
    if (draftInStockOnly) labels.push('In stock');
    return labels;
  }, [draftDepartments, draftSubcategories, draftColors, draftSizes, draftInStockOnly]);

  const appliedFilterCount =
    selectedDepartments.length +
    selectedSubcategories.length +
    selectedColors.length +
    selectedSizes.length +
    (inStockOnly ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  const hasDraftSelection =
    draftSelectedLabels.length > 0 ||
    draftSortBy !== sortBy ||
    appliedFilterCount > 0;

  const toggleArrayValue = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleClearDraft = () => {
    setDraftSortBy('featured');
    setDraftDepartments([]);
    setDraftSubcategories([]);
    setDraftColors([]);
    setDraftSizes([]);
    setDraftInStockOnly(false);
  };

  const handleClearAllApplied = () => {
    setSortBy('featured');
    setSelectedDepartments([]);
    setSelectedSubcategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setInStockOnly(false);
    setQuickFilter('all');
    setVisibleCount(PAGE_STEP);
  };

  const handleApplyDraft = () => {
    setSortBy(draftSortBy);
    setSelectedDepartments(draftDepartments);
    setSelectedSubcategories(draftSubcategories);
    setSelectedColors(draftColors);
    setSelectedSizes(draftSizes);
    setInStockOnly(draftInStockOnly);
    setVisibleCount(PAGE_STEP);
    closeDrawer();
  };

  const handleQuickFilterSelect = (key: QuickFilterKey, scrollToGrid = false) => {
    setQuickFilter(key);
    setVisibleCount(PAGE_STEP);
    if (scrollToGrid && gridTopRef.current) {
      const y = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const activeHeading = COLLECTION_HEADINGS[quickFilter] || COLLECTION_HEADINGS.all;
  const shownProducts = filteredProducts.slice(0, visibleCount);
  const progressPct =
    filteredProducts.length > 0
      ? Math.min(100, Math.round((shownProducts.length / filteredProducts.length) * 100))
      : 100;

  return (
    <div className="bg-pearl text-plum-dark pt-[78px] min-h-screen">
      {/* Main collection surface (marked inert while Filter & Sort drawer is expanded) */}
      <div ref={contentWrapperRef}>
        {/* ═══ 1. COLLECTION H1 HEADER ═══ */}
        <div
          ref={gridTopRef}
          className="pb-0 pt-6 px-5 md:py-6 md:px-10"
        >
          <h1 className="font-serif text-[2.1rem] md:text-[2.75rem] font-light tracking-[-0.01em] text-plum-dark leading-[1.08] animate-text-reveal">
            {activeHeading}
          </h1>
        </div>

        {/* ═══ 2. HORIZONTAL QUICK-FILTERS STRIP ═══ */}
        <nav
          aria-label="Collection categories"
          className="border-b border-plum-dark/12 px-5 md:px-10 py-4 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center justify-between gap-8 min-w-max">
            <ul className="flex flex-row items-center gap-x-5 md:gap-x-6 list-none m-0 p-0">
              {QUICK_FILTERS.map((item) => {
                const isActive = quickFilter === item.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => handleQuickFilterSelect(item.key)}
                      className={`cb-text-body w-max cursor-pointer bg-transparent border-none p-0 transition-colors ${
                        isActive
                          ? 'underline underline-offset-4 decoration-plum-dark text-plum-dark font-medium'
                          : 'text-plum-dark/72 hover:text-plum-dark'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}

              {(wishlist.length > 0 || quickFilter === 'saved') && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleQuickFilterSelect('saved')}
                    className={`cb-text-body w-max cursor-pointer bg-transparent border-none p-0 transition-colors ${
                      quickFilter === 'saved'
                        ? 'underline underline-offset-4 decoration-plum-dark text-plum-dark font-medium'
                        : 'text-plum-dark/72 hover:text-plum-dark'
                    }`}
                  >
                    Saved ({wishlist.length})
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* ═══ 3. STICKY COLLECTION TOOLBAR (+ Filter & Sort | Change grid / Default grid) ═══ */}
        <div className="sticky top-[78px] z-20 flex items-center justify-between gap-8 bg-pearl/95 backdrop-blur-md px-5 py-4 md:justify-start md:gap-10 md:px-10">
          <button
            ref={openBtnRef}
            type="button"
            aria-expanded={drawerExpanded}
            aria-controls={drawerId}
            onClick={openDrawer}
            className="flex cursor-pointer items-center gap-2 bg-transparent border-none p-0 text-plum-dark hover:text-lavender transition-colors"
          >
            {drawerExpanded ? (
              <svg
                width="7"
                height="7"
                viewBox="0 0 7 7"
                fill="none"
                aria-hidden="true"
                className="w-[7px] h-[7px] shrink-0"
              >
                <rect y="3" width="7" height="1" fill="currentColor" />
              </svg>
            ) : (
              <svg
                width="7"
                height="7"
                viewBox="0 0 7 7"
                fill="none"
                aria-hidden="true"
                className="w-[7px] h-[7px] shrink-0"
              >
                <rect y="3" width="7" height="1" fill="currentColor" />
                <rect x="3" y="0" width="1" height="7" fill="currentColor" />
              </svg>
            )}
            <span className="cb-text-body">
              Filter &amp; Sort{appliedFilterCount > 0 ? ` (${appliedFilterCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleGrid}
            className="flex cursor-pointer items-center gap-2 bg-transparent border-none p-0 text-plum-dark hover:text-lavender transition-colors"
          >
            {gridType === 'even' ? (
              <svg
                width="7"
                height="7"
                viewBox="0 0 7 7"
                fill="none"
                aria-hidden="true"
                className="w-[7px] h-[7px] shrink-0"
              >
                <path d="M1 0H0V1H1V0Z" fill="currentColor" />
                <path d="M1 6H0V7H1V6Z" fill="currentColor" />
                <path d="M4 3H3V4H4V3Z" fill="currentColor" />
                <path d="M7 0H6V1H7V0Z" fill="currentColor" />
                <path d="M7 6H6V7H7V6Z" fill="currentColor" />
              </svg>
            ) : (
              <svg
                width="7"
                height="7"
                viewBox="0 0 7 7"
                fill="none"
                aria-hidden="true"
                className="w-[7px] h-[7px] shrink-0"
              >
                <rect width="1" height="1" fill="currentColor" />
                <rect x="3" width="1" height="1" fill="currentColor" />
                <rect x="6" width="1" height="1" fill="currentColor" />
                <rect y="3" width="1" height="1" fill="currentColor" />
                <rect x="3" y="3" width="1" height="1" fill="currentColor" />
                <rect x="6" y="3" width="1" height="1" fill="currentColor" />
                <rect y="6" width="1" height="1" fill="currentColor" />
                <rect x="3" y="6" width="1" height="1" fill="currentColor" />
                <rect x="6" y="6" width="1" height="1" fill="currentColor" />
              </svg>
            )}
            <span className="cb-text-body">
              {gridType === 'even' ? 'Change grid' : 'Default grid'}
            </span>
          </button>

          {appliedFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllApplied}
              className="hidden md:inline-block ml-auto cb-text-body text-plum-dark/70 hover:text-plum-dark underline underline-offset-4 bg-transparent border-none p-0 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ═══ 4. DUAL-MODE PRODUCT GALLERY GRID ('even' 4-col / 'uneven' 2-wide + 4-up) ═══ */}
        {filteredProducts.length === 0 ? (
          <div className="px-5 md:px-10 py-24 text-center max-w-lg mx-auto">
            <p className="text-xs tracking-[0.25em] uppercase text-plum/60 mb-3">Atelier Collection</p>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-plum-dark mb-4">
              {products.length === 0 ? 'Collection in Craft' : 'No matching pieces'}
            </h2>
            <p className="text-sm text-plum/70 mb-8 max-w-md mx-auto leading-relaxed">
              {products.length === 0
                ? 'Our artisans in Accra are tailoring bespoke pieces for the season. Inquire directly with our atelier concierge for custom commissions.'
                : 'Try adjusting your filters or category selection to explore our bespoke garments.'}
            </p>
            {products.length === 0 ? (
              <button
                type="button"
                onClick={onRequestCustomFitting}
                className="h-11 px-8 bg-plum-dark hover:bg-plum text-white text-xs tracking-[0.15em] uppercase cursor-pointer border-none transition-colors"
              >
                Inquire With Atelier
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearAllApplied}
                className="h-10 px-6 bg-plum-dark hover:bg-plum text-white cb-text-body cursor-pointer border-none transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              data-product-grid
              data-grid-type={gridType}
              className="grid grid-cols-2 gap-x-1.5 gap-y-10 px-5 pt-1 md:grid-cols-4 md:gap-x-2 md:gap-y-[148px] lg:gap-y-[184px] md:px-10 md:pt-8 transition-opacity duration-300"
            >
              {shownProducts.map((product, idx) => {
                const isWished = wishlist.includes(product.id);
                const isAboveFold = idx < 8;
                const isPriorityLcp = idx < 2;
                // Subtle organic motion on selected catalog looks
                const hasSubtleMotion = idx % 2 === 0;
                const motionClass = hasSubtleMotion
                  ? idx % 4 === 0
                    ? 'animate-subtle-drift'
                    : 'animate-subtle-drift-alt'
                  : '';

                return (
                  <article
                    key={product.id}
                    data-product-card
                    className={`relative flex flex-col gap-2.5 group ${
                      isAboveFold ? '' : 'cb-card-deferred'
                    }`}
                  >
                    {/* Portrait 2:3 Frame + Secondary Hover Crossfade */}
                    <div
                      data-product-card-image
                      className="group/image relative w-full overflow-hidden bg-pearl-2/75"
                    >
                      <a
                        href={`#/product/${encodeURIComponent(product.id)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onViewDetails(product);
                        }}
                        aria-label={product.name}
                        className="block relative w-full aspect-[2/3] no-underline overflow-hidden bg-pearl-2 border border-lilac/15"
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading={isPriorityLcp ? undefined : 'lazy'}
                            fetchPriority={isPriorityLcp ? 'high' : undefined}
                            referrerPolicy="no-referrer"
                            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.025] ${motionClass}`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-pearl-2 transition-colors group-hover/image:bg-pearl">
                            <div className="w-12 h-12 rounded-full border border-lilac/30 flex items-center justify-center mb-3 text-lavender font-serif italic text-base">
                              NF
                            </div>
                            <span className="font-serif text-sm text-plum-dark font-medium tracking-wide">
                              Nnepa Foriwaa
                            </span>
                            <span className="text-[0.58rem] font-bold tracking-[0.22em] uppercase text-mauve-deep mt-1">
                              Atelier Collection
                            </span>
                            <span className="text-[0.52rem] tracking-wider text-text-muted mt-2">
                              Accra, Ghana
                            </span>
                          </div>
                        )}

                        {product.hoverImageUrl && product.imageUrl && (
                          <img
                            src={product.hoverImageUrl}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            fetchPriority="low"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                          />
                        )}

                        {product.inStock === false && (
                          <span className="absolute left-3 top-3 bg-pearl/92 px-2.5 py-1 text-[11px] tracking-[0.06em] text-plum-dark">
                            Made to order
                          </span>
                        )}
                      </a>
                    </div>

                    {/* Product Info Row (Title, Price, Wishlist Icon) */}
                    <div data-product-info className="flex flex-col">
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="cb-text-body flex min-w-0 flex-1 flex-col gap-0.5">
                          <a
                            href={`#/product/${encodeURIComponent(product.id)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onViewDetails(product);
                            }}
                            className="line-clamp-2 no-underline hover:underline text-plum-dark capitalize"
                          >
                            {product.name}
                          </a>

                          <a
                            href={`#/product/${encodeURIComponent(product.id)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onViewDetails(product);
                            }}
                            className="flex flex-row items-baseline gap-2 no-underline text-plum-dark"
                          >
                            <span>GH₵ {product.price.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="line-through text-plum-dark/45 text-[12px]">
                                GH₵ {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </a>
                        </div>

                        {/* Cecilie Bahnsen Signature Blossom Wishlist Toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(product)}
                          aria-pressed={isWished}
                          aria-label={
                            isWished
                              ? `Remove ${product.name} from wishlist`
                              : `Save ${product.name} to wishlist`
                          }
                          className={`shrink-0 flex cursor-pointer items-center px-1.5 py-0.5 bg-transparent border-none text-plum-dark hover:text-lavender transition-opacity duration-200 ${
                            isWished
                              ? 'opacity-100'
                              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100'
                          }`}
                        >
                          {isWished ? (
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                              className="w-5 h-5 md:w-[22px] md:h-[22px]"
                            >
                              <path
                                d="M20.6699 10.0495C19.7899 7.40953 17.2299 7.18953 16.2199 7.19953C16.1599 6.59953 15.9399 5.46953 15.0699 4.55953C14.2599 3.71953 13.1099 3.27953 11.6199 3.26953C8.72991 3.45953 8.04991 6.00953 7.89991 6.98953C6.44991 6.95953 4.02991 7.46953 3.35991 9.73953C2.67991 12.0095 4.37991 13.6195 5.60991 14.3095C5.19991 15.2495 4.31991 17.9095 6.21991 19.7595C8.15991 21.6495 10.7499 20.3995 12.0699 19.3195C12.6099 19.7795 13.8999 20.7395 15.4199 20.7395C16.0999 20.7395 16.8299 20.5495 17.5499 20.0295C19.6499 18.5395 19.1299 15.9995 18.4499 14.5895C19.6399 13.9195 21.2799 12.3295 20.6699 10.0595V10.0495ZM11.9999 13.9395C10.9299 13.9395 10.0599 13.0695 10.0599 11.9995C10.0599 10.9295 10.9299 10.0595 11.9999 10.0595C13.0699 10.0595 13.9399 10.9295 13.9399 11.9995C13.9399 13.0695 13.0699 13.9395 11.9999 13.9395Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12.0001 13.1896C12.6573 13.1896 13.1901 12.6568 13.1901 11.9996C13.1901 11.3424 12.6573 10.8096 12.0001 10.8096C11.3428 10.8096 10.8101 11.3424 10.8101 11.9996C10.8101 12.6568 11.3428 13.1896 12.0001 13.1896Z"
                                fill="currentColor"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                              className="w-5 h-5 md:w-[22px] md:h-[22px]"
                            >
                              <path
                                d="M12.0001 13.9396C10.9301 13.9396 10.0601 13.0696 10.0601 11.9996C10.0601 10.9296 10.9301 10.0596 12.0001 10.0596C13.0701 10.0596 13.9401 10.9296 13.9401 11.9996C13.9401 13.0696 13.0701 13.9396 12.0001 13.9396ZM12.0001 10.8096C11.3401 10.8096 10.8101 11.3396 10.8101 11.9996C10.8101 12.6596 11.3401 13.1896 12.0001 13.1896C12.6601 13.1896 13.1901 12.6596 13.1901 11.9996C13.1901 11.3396 12.6601 10.8096 12.0001 10.8096Z"
                                fill="currentColor"
                              />
                              <path
                                d="M15.4199 20.7298C13.8999 20.7298 12.5999 19.7698 12.0699 19.3098C10.7499 20.3898 8.15991 21.6398 6.21991 19.7498C4.30991 17.8898 5.19991 15.2398 5.60991 14.2998C4.37991 13.6198 2.67991 11.9998 3.35991 9.72976C4.03991 7.45976 6.43991 6.94977 7.89991 6.97977C8.05991 5.99977 8.72991 3.44977 11.6199 3.25977C13.1099 3.27977 14.2699 3.70977 15.0699 4.54977C15.9399 5.45977 16.1699 6.58977 16.2199 7.18977C17.2099 7.18977 19.7899 7.39977 20.6699 10.0398C21.2699 12.3198 19.6399 13.8998 18.4499 14.5698C19.1299 15.9798 19.6499 18.5298 17.5499 20.0098C16.8199 20.5198 16.0999 20.7198 15.4199 20.7198V20.7298ZM7.76991 7.73977C6.83991 7.73977 4.65991 7.95977 4.06991 9.94977C3.32991 12.4298 6.12991 13.7398 6.24991 13.7898L6.61991 13.9598L6.42991 14.3098C6.35991 14.4298 4.80991 17.3298 6.73991 19.2098C8.81991 21.2398 11.6999 18.6398 11.8199 18.5298L12.0899 18.2798L12.3399 18.5398C12.4399 18.6398 14.7999 21.0398 17.1199 19.3998C19.4199 17.7698 17.6899 14.7198 17.6199 14.5998L17.4099 14.2398L17.7899 14.0698C17.9099 14.0198 20.6199 12.7498 19.9599 10.2598C19.0599 7.57977 16.0499 7.93977 15.9199 7.95977L15.4899 8.01977V7.57977C15.4899 7.57977 15.5299 6.09977 14.5299 5.06977C13.8699 4.37977 12.8999 4.02977 11.6499 4.00977C8.78991 4.19977 8.61991 7.26977 8.60991 7.39977L8.58991 7.78977L8.19991 7.74977C8.19991 7.74977 8.01991 7.72977 7.77991 7.72977L7.76991 7.73977Z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ═══ 5. SHOWING PROGRESS BAR & LOAD MORE ═══ */}
            <div className="flex flex-col items-center py-14 md:pb-[84px] md:pt-[100px]">
              <div className="flex w-full max-w-[267px] flex-col items-center gap-7 px-5 md:max-w-[353px] md:px-0">
                <div className="flex w-full flex-col items-center gap-3">
                  <p className="cb-text-body text-center text-plum-dark">
                    Showing <span className="font-normal">{shownProducts.length}</span> of{' '}
                    {filteredProducts.length} products
                  </p>
                  <div className="relative h-[2px] w-[215px] overflow-hidden bg-plum-dark/14">
                    <div
                      className="absolute left-0 top-0 h-full bg-plum-dark transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {shownProducts.length < filteredProducts.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_STEP)}
                    className="h-10 w-full flex items-center justify-center bg-plum-dark hover:bg-plum text-white cb-text-body cursor-pointer border-none transition-colors"
                  >
                    Load more
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ 7. FLOATING BACK-TO-TOP BUTTON ═══ */}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-24 right-6 md:bottom-16 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-plum-dark border border-plum-dark/10 shadow-md transition-opacity duration-300 ${
          showBackToTop ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="w-5 h-5"
        >
          <path d="M4.5 12.5L10 7L15.5 12.5" stroke="currentColor" strokeWidth="0.85" />
        </svg>
      </button>

      {/* ═══ 8. RIGHT-SIDE SCROLL-SNAP FILTER & SORT DRAWER ═══ */}
      <div
        id={drawerId}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort collection"
        aria-hidden={!drawerVisible}
        onClick={(e) => {
          if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
            closeDrawer();
          }
        }}
        className={`cb-filter-drawer ${drawerVisible ? 'is-open' : ''}`}
      >
        <div className="cb-filter-backdrop" aria-hidden="true" />

        <div ref={scrollerRef} className="cb-filter-scroller">
          <div
            ref={sheetRef}
            tabIndex={-1}
            className="cb-filter-sheet relative outline-none"
          >
            {/* Sticky Drawer Top Action Bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-plum-dark/10 bg-[#fdfbfe] px-5 py-5 md:px-10 md:py-8">
              <div className="hidden md:flex items-center gap-8 flex-1 pr-8">
                <button
                  type="button"
                  disabled={draftMatchingProducts.length === 0}
                  onClick={handleApplyDraft}
                  className={`cb-text-body flex h-10 flex-1 max-w-[340px] cursor-pointer items-center justify-center text-white border-none transition-colors disabled:pointer-events-none ${
                    hasDraftSelection && draftMatchingProducts.length > 0
                      ? 'bg-plum-dark hover:bg-plum'
                      : 'bg-mauve/70'
                  }`}
                >
                  Show selection ({draftMatchingProducts.length})
                </button>

                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="cb-text-body cursor-pointer underline underline-offset-4 text-plum-dark hover:text-lavender bg-transparent border-none p-0 shrink-0"
                >
                  Clear all
                </button>
              </div>

              <div className="flex md:hidden items-center">
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="cb-text-body cursor-pointer underline underline-offset-4 text-plum-dark bg-transparent border-none p-0"
                >
                  Clear all
                </button>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close Filter and Sort drawer"
                className="cursor-pointer p-2 -mr-2 bg-transparent border-none text-plum-dark hover:text-lavender transition-colors"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  aria-hidden="true"
                  className="w-4 h-4"
                >
                  <path
                    d="M1.06067 13.0605L13.0607 1.06055M1.06067 1.06055L13.0607 13.0605"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="square"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Facets Form */}
            <div className="overflow-y-auto">
              {/* Sort By */}
              <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-9">
                <p className="cb-text-body text-plum-dark font-medium">Sort by:</p>
                <ul className="m-0 max-w-[420px] list-none columns-1 md:columns-2 gap-12 p-0">
                  {SORT_OPTIONS.map((opt) => {
                    const checked = draftSortBy === opt.value;
                    return (
                      <li key={opt.value} className="mb-3.5 break-inside-avoid">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="radio"
                            name="cb_sort_by"
                            value={opt.value}
                            checked={checked}
                            onChange={() => setDraftSortBy(opt.value)}
                            className="sr-only"
                          />
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-plum-dark/30">
                            <span
                              className={`h-5 w-5 rounded-full bg-plum-dark transition-transform duration-150 ${
                                checked ? 'scale-100' : 'scale-0'
                              }`}
                            />
                          </span>
                          <span className="cb-text-body text-plum-dark">{opt.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-plum-dark/10" />

              {/* Department */}
              <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-9">
                <p className="cb-text-body text-plum-dark font-medium">Department:</p>
                <ul className="m-0 max-w-[420px] list-none columns-1 md:columns-2 gap-12 p-0">
                  {DRAWER_DEPARTMENTS.map((dept) => {
                    const checked = draftDepartments.includes(dept.value);
                    return (
                      <li key={dept.value} className="mb-3.5 break-inside-avoid">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleArrayValue(draftDepartments, dept.value, setDraftDepartments)
                            }
                            className="sr-only"
                          />
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-plum-dark/30">
                            <span
                              className={`h-5 w-5 rounded-full bg-plum-dark transition-transform duration-150 ${
                                checked ? 'scale-100' : 'scale-0'
                              }`}
                            />
                          </span>
                          <span className="cb-text-body text-plum-dark">{dept.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-plum-dark/10" />

              {/* Category */}
              <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-9">
                <p className="cb-text-body text-plum-dark font-medium">Category:</p>
                <ul className="m-0 max-w-[420px] list-none columns-1 md:columns-2 gap-12 p-0">
                  {DRAWER_CATEGORIES.map((cat) => {
                    const checked = draftSubcategories.includes(cat);
                    return (
                      <li key={cat} className="mb-3.5 break-inside-avoid">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleArrayValue(draftSubcategories, cat, setDraftSubcategories)
                            }
                            className="sr-only"
                          />
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-plum-dark/30">
                            <span
                              className={`h-5 w-5 rounded-full bg-plum-dark transition-transform duration-150 ${
                                checked ? 'scale-100' : 'scale-0'
                              }`}
                            />
                          </span>
                          <span className="cb-text-body text-plum-dark">{cat}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-plum-dark/10" />

              {/* Color */}
              <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-9">
                <p className="cb-text-body text-plum-dark font-medium">Colour:</p>
                <ul className="m-0 max-w-[420px] list-none columns-1 md:columns-2 gap-12 p-0">
                  {DRAWER_COLORS.map((col) => {
                    const checked = draftColors.includes(col);
                    return (
                      <li key={col} className="mb-3.5 break-inside-avoid">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleArrayValue(draftColors, col, setDraftColors)}
                            className="sr-only"
                          />
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-plum-dark/30">
                            <span
                              className={`h-5 w-5 rounded-full bg-plum-dark transition-transform duration-150 ${
                                checked ? 'scale-100' : 'scale-0'
                              }`}
                            />
                          </span>
                          <span className="cb-text-body text-plum-dark">{col}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-plum-dark/10" />

              {/* Size */}
              <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-9">
                <p className="cb-text-body text-plum-dark font-medium">Size:</p>
                <ul className="m-0 max-w-[420px] list-none columns-2 gap-12 p-0">
                  {DRAWER_SIZES.map((sz) => {
                    const checked = draftSizes.includes(sz);
                    return (
                      <li key={sz} className="mb-3.5 break-inside-avoid">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleArrayValue(draftSizes, sz, setDraftSizes)}
                            className="sr-only"
                          />
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-plum-dark/30">
                            <span
                              className={`h-5 w-5 rounded-full bg-plum-dark transition-transform duration-150 ${
                                checked ? 'scale-100' : 'scale-0'
                              }`}
                            />
                          </span>
                          <span className="cb-text-body text-plum-dark">{sz}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-plum-dark/10" />

              {/* Availability */}
              <div className="flex flex-col gap-6 px-5 py-8 md:px-10 md:py-9">
                <p className="cb-text-body text-plum-dark font-medium">Availability:</p>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={draftInStockOnly}
                    onChange={() => setDraftInStockOnly((v) => !v)}
                    className="sr-only"
                  />
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-plum-dark/30">
                    <span
                      className={`h-5 w-5 rounded-full bg-plum-dark transition-transform duration-150 ${
                        draftInStockOnly ? 'scale-100' : 'scale-0'
                      }`}
                    />
                  </span>
                  <span className="cb-text-body text-plum-dark">Ready to ship only</span>
                </label>
              </div>
            </div>

            {/* Sticky Bottom Selected Filters Summary & Mobile Apply Button */}
            <div className="border-t border-plum-dark/10 bg-[#fdfbfe]">
              {draftSelectedLabels.length > 0 && (
                <div className="px-5 py-4 md:px-10 border-b md:border-b-0 border-plum-dark/10">
                  <p className="cb-text-body text-plum-dark/80">
                    Selected filters: {draftSelectedLabels.join(', ')}
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={draftMatchingProducts.length === 0}
                onClick={handleApplyDraft}
                className={`md:hidden cb-text-body flex h-11 w-full cursor-pointer items-center justify-center text-white border-none transition-colors disabled:pointer-events-none ${
                  hasDraftSelection && draftMatchingProducts.length > 0
                    ? 'bg-plum-dark'
                    : 'bg-mauve/75'
                }`}
              >
                Show selection ({draftMatchingProducts.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
