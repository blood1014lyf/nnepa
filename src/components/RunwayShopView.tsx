/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import type { Product } from '../types.ts';
import {
  MODELS_SHEET,
  PIECES_SHEET,
  RUNWAY_LOOKS,
  MODEL_Y0,
  MODEL_Y1,
  FIRST_LOOK_NUMBER,
  RUNWAY_ITEMS,
  areRunwaySheetsDecoded,
  getRunwayProductsWithThumbnails,
  preloadRunwaySheets,
} from '../utils/runwaySprites.ts';

// Depth stops from d = -1 (leaving past the rail) to d = 5 (arriving out of the haze)
const KX = [1.2, 0.744, 0.496, 0.346, 0.235, 0.15, 0.085];
const KF = [1.14, 0.89, 0.777, 0.704, 0.651, 0.616, 0.59];
const KH = [1.18, 0.832, 0.574, 0.436, 0.334, 0.258, 0.19];
const KB = [0, 0, 1.5, 4, 8, 12, 17];
const KO = [1, 1, 1, 1, 0.86, 0.5, 0];

const N = RUNWAY_LOOKS.length;
const wrap = (x: number, n: number) => ((x % n) + n) % n;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

interface SpriteCropProps {
  href: string;
  x0: number;
  y0: number;
  w: number;
  h: number;
  sheetW: number;
  sheetH: number;
}

function SpriteCrop({ href, x0, y0, w, h, sheetW, sheetH }: SpriteCropProps) {
  const vb = `${x0} ${y0} ${w} ${h}`;
  return (
    <svg viewBox={vb} aria-hidden="true">
      <svg x={x0} y={y0} width={w} height={h} viewBox={vb}>
        <image href={href} width={sheetW} height={sheetH} />
      </svg>
    </svg>
  );
}

interface RunwayShopViewProps {
  wishlist: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onShopTheLook: (pieces: Product[], lookNumber: number) => void;
  onViewDetails: (product: Product) => void;
  onOpenArchiveGrid: (category?: 'all' | 'women' | 'men' | 'bags', savedOnly?: boolean) => void;
  onOpenSizeGuide: () => void;
  onThumbnailsReady?: (thumbs: Record<string, string>) => void;
}

export default function RunwayShopView({
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onShopTheLook,
  onViewDetails,
  onOpenArchiveGrid,
  onOpenSizeGuide,
  onThumbnailsReady,
}: RunwayShopViewProps) {
  const [ready, setReady] = useState<boolean>(() => areRunwaySheetsDecoded());

  const stageRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rollRef = useRef<HTMLSpanElement | null>(null);
  const modelElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardElsRef = useRef<(HTMLElement | null)[]>([]);

  // Mutable animation state (zero React state updates per frame)
  const animRef = useRef({
    p: 0,
    target: 0,
    last: 0,
    W: 0,
    H: 0,
    base: 0,
    cardS: 0,
    side: false,
    dirty: true,
    mx: 0,
    my: 0,
    cx: 0,
    cy: 0,
    down: false,
    sx: 0,
    st: 0,
    moved: 0,
    modelCache: RUNWAY_LOOKS.map(([a, b]) => ({
      r: (b - a) / (MODEL_Y1 - MODEL_Y0),
      f: '',
      o: '',
    })),
  });

  useEffect(() => {
    let active = true;
    const stage = stageRef.current;
    const rail = railRef.current;
    const ring = ringRef.current;
    const roll = rollRef.current;
    if (!stage || !rail || !ring || !roll) return;

    const calmMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;
    let rafId = 0;

    const size = () => {
      const s = animRef.current;
      s.W = stage.clientWidth;
      s.H = stage.clientHeight;
      s.base = s.H * 1.2;
      s.side = window.innerWidth <= 820;

      modelElsRef.current.forEach((el, idx) => {
        if (!el) return;
        const m = s.modelCache[idx];
        el.style.width = `${s.base * m.r}px`;
        el.style.height = `${s.base}px`;
      });

      s.cardS = s.side ? 160 : rail.clientHeight / 3;
      cardElsRef.current.forEach((c) => {
        if (!c) return;
        c.style.height = s.side ? '100%' : `${s.cardS}px`;
        c.style.width = s.side ? '160px' : '100%';
      });

      s.dirty = true;
    };

    const paint = () => {
      const s = animRef.current;
      if (s.H <= 0 || s.W <= 0) return;

      modelElsRef.current.forEach((el, i) => {
        if (!el) return;
        const m = s.modelCache[i];
        let d = wrap(i - s.p, N);
        if (d > N - 1) d -= N;

        const k = clamp(d + 1, 0, 6);
        const a = Math.floor(k);
        const b = Math.min(6, a + 1);
        const t = k - a;
        const mix = (A: number[]) => A[a] + (A[b] - A[a]) * t;

        const h = mix(KH) * s.H;
        const sc = h / s.base;
        const w = h * m.r;
        const x = mix(KX) * s.W - w / 2;
        const y = mix(KF) * s.H - h;

        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${sc.toFixed(4)})`;

        const f = mix(KB) / sc;
        const fs = f < 0.2 ? 'none' : `blur(${f.toFixed(1)}px)`;
        const o = mix(KO).toFixed(3);

        if (fs !== m.f) {
          m.f = fs;
          el.style.filter = fs;
        }
        if (o !== m.o) {
          m.o = o;
          el.style.opacity = o;
        }
        el.style.zIndex = String(100 - Math.round(d * 10));
      });

      const all = s.cardS * RUNWAY_ITEMS.length;
      if (all > 0) {
        cardElsRef.current.forEach((c, i) => {
          if (!c) return;
          let y = wrap(i * s.cardS - s.p * 2 * s.cardS, all);
          if (y > all - s.cardS) y -= all;
          c.style.transform = s.side
            ? `translate3d(${y.toFixed(1)}px,0,0)`
            : `translate3d(0,${y.toFixed(1)}px,0)`;
        });
      }

      const firstNum = roll.firstElementChild as HTMLElement | null;
      const lineH = firstNum ? firstNum.offsetHeight : 38;
      roll.style.transform = `translate3d(0,${(-wrap(s.p, N) * lineH).toFixed(1)}px,0)`;
    };

    const frame = (now: number) => {
      const s = animRef.current;
      const dt = Math.min(50, now - s.last) || 16;
      s.last = now;
      const was = s.p;

      if (calmMedia.matches) {
        s.p = s.target;
      } else {
        s.p += (s.target - s.p) * (1 - Math.exp(-dt * 0.0072));
      }

      if (Math.abs(s.target - s.p) < 0.0004) {
        s.p = s.target;
      }

      if (s.p !== was || s.dirty) {
        s.dirty = false;
        paint();
      }

      s.cx += (s.mx - s.cx) * 0.32;
      s.cy += (s.my - s.cy) * 0.32;
      ring.style.transform = `translate3d(${s.cx.toFixed(1)}px,${s.cy.toFixed(1)}px,0)`;
    };

    const loop = (t: number) => {
      if (!active) return;
      frame(t);
      rafId = requestAnimationFrame(loop);
    };

    const pull = () => Math.max(150, animRef.current.W * 0.2);

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') ring.classList.add('show');
    };
    const onPointerLeave = () => {
      ring.classList.remove('show');
    };
    const onPointerMove = (e: PointerEvent) => {
      const s = animRef.current;
      const r = stage.getBoundingClientRect();
      s.mx = e.clientX - r.left;
      s.my = e.clientY - r.top;
      if (!s.down) return;
      const dx = e.clientX - s.sx;
      s.moved = Math.max(s.moved, Math.abs(dx));
      s.target = s.st + dx / pull();
    };
    const onPointerDown = (e: PointerEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (targetEl && targetEl.closest('button, a')) return;
      const s = animRef.current;
      s.down = true;
      s.sx = e.clientX;
      s.st = s.target;
      s.moved = 0;
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {}
      ring.classList.add('drag');
    };
    const release = (e: PointerEvent) => {
      const s = animRef.current;
      if (!s.down) return;
      s.down = false;
      ring.classList.remove('drag');
      if (s.moved < 6) {
        const hit = document
          .elementsFromPoint(e.clientX, e.clientY)
          .find((x) => x.classList && x.classList.contains('nf-m')) as HTMLElement | undefined;
        if (hit && hit.dataset.i !== undefined) {
          let d = wrap(Number(hit.dataset.i) - s.target, N);
          d = Math.round(d);
          if (d > 0 && d < N) {
            s.target = Math.round(s.target) + d;
          }
        }
      } else {
        s.target = Math.round(s.target);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = animRef.current;
      s.target += clamp(e.deltaY + e.deltaX, -120, 120) / 420;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        s.target = Math.round(s.target);
      }, 150);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        return;
      }
      const s = animRef.current;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        s.target = Math.round(s.target) + 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        s.target = Math.round(s.target) - 1;
      }
    };

    // Also allow smooth scrolling over the product rail itself
    const onRailWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = animRef.current;
      s.target += clamp(e.deltaY + e.deltaX, -120, 120) / 420;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        s.target = Math.round(s.target);
      }, 150);
    };

    window.addEventListener('resize', size);
    window.addEventListener('keydown', onKeyDown);
    stage.addEventListener('pointerenter', onPointerEnter);
    stage.addEventListener('pointerleave', onPointerLeave);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('wheel', onWheel, { passive: false });
    rail.addEventListener('wheel', onRailWheel, { passive: false });

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            size();
            paint();
          })
        : null;
    if (ro) {
      ro.observe(stage);
      ro.observe(rail);
    }

    size();
    paint();
    rafId = requestAnimationFrame(loop);

    preloadRunwaySheets().then((thumbs) => {
      if (!active) return;
      size();
      paint();
      setReady(true);
      if (onThumbnailsReady) onThumbnailsReady(thumbs);
    });

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      if (wheelTimer) clearTimeout(wheelTimer);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', size);
      window.removeEventListener('keydown', onKeyDown);
      stage.removeEventListener('pointerenter', onPointerEnter);
      stage.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointerup', release);
      stage.removeEventListener('pointercancel', release);
      stage.removeEventListener('wheel', onWheel);
      rail.removeEventListener('wheel', onRailWheel);
    };
  }, []);

  const handleShopCurrentLook = () => {
    const products = getRunwayProductsWithThumbnails();
    const lookIdx = wrap(Math.round(animRef.current.p), N);
    const pair = [products[lookIdx * 2], products[lookIdx * 2 + 1]].filter(Boolean);
    onShopTheLook(pair, FIRST_LOOK_NUMBER + lookIdx);
  };

  const getProductAt = (idx: number): Product => {
    const products = getRunwayProductsWithThumbnails();
    return products[idx];
  };

  return (
    <div className="nf-runway-root" id="runway-shop-view">
      {/* ═══ SEAMLESS NNEPA FORIWAA SUB-HEADER DEPARTMENT BAR ═══ */}
      <nav className="nf-r2-bar no-scrollbar" aria-label="Atelier Shop Collections">
        <div className="nf-r2-links">
          <button type="button" className="nf-r2-btn on" aria-current="page">
            Runway Lookbook
          </button>
          <button
            type="button"
            className="nf-r2-btn"
            onClick={() => onOpenArchiveGrid('all', false)}
          >
            Full Archive
          </button>
          <button
            type="button"
            className="nf-r2-btn"
            onClick={() => onOpenArchiveGrid('women', false)}
          >
            Womenswear
          </button>
          <button
            type="button"
            className="nf-r2-btn"
            onClick={() => onOpenArchiveGrid('men', false)}
          >
            Menswear
          </button>
          <button
            type="button"
            className="nf-r2-btn"
            onClick={() => onOpenArchiveGrid('bags', false)}
          >
            Bags &amp; Accessories
          </button>
          <button type="button" className="nf-r2-btn" onClick={onOpenSizeGuide}>
            Size Guide
          </button>
          {wishlist.length > 0 && (
            <button
              type="button"
              className="nf-r2-btn"
              onClick={() => onOpenArchiveGrid('all', true)}
            >
              Saved ({wishlist.length})
            </button>
          )}
        </div>

        <div className="nf-r2-meta">
          <span>Drag · Scroll · Arrow Keys</span>
        </div>
      </nav>

      {/* ═══ INTERACTIVE DEPTH STAGE + SYNCED LOOPING PRODUCT RAIL ═══ */}
      <div className="nf-main">
        <section
          className="nf-stage"
          ref={stageRef}
          aria-label="Nnepa Foriwaa Runway looks. Drag, scroll or use the arrow keys to change look."
          tabIndex={0}
        >
          {/* Six receding models cropped from single transparent sheet */}
          <div className="nf-line">
            {RUNWAY_LOOKS.map(([x0, x1], i) => (
              <div
                key={i}
                className="nf-m"
                data-i={i}
                ref={(el) => {
                  modelElsRef.current[i] = el;
                }}
              >
                <SpriteCrop
                  href={MODELS_SHEET}
                  x0={x0}
                  y0={MODEL_Y0}
                  w={x1 - x0}
                  h={MODEL_Y1 - MODEL_Y0}
                  sheetW={960}
                  sheetH={540}
                />
              </div>
            ))}
          </div>

          {/* Editorial Runway Header */}
          <div className="nf-intro">
            <div className="nf-eyebrow">
              <span className="nf-eyebrow-line" />
              Nnepa Foriwaa · Atelier Runway
            </div>
            <h2>Spring Summer 2027</h2>
            <p>
              A study in softness and strength. Six looks from the Nnepa Foriwaa studio blend
              delicate textures and modern silhouettes, tailored to order in Accra.
            </p>
          </div>

          {/* Rolling Look Number & Shop The Look Trigger */}
          <div className="nf-tag">
            <div className="nf-look" aria-live="polite">
              <span>Look</span>
              <span className="nf-win">
                <span className="nf-roll" ref={rollRef}>
                  {Array.from({ length: N + 1 }).map((_, idx) => (
                    <b key={idx}>{FIRST_LOOK_NUMBER + (idx % N)}</b>
                  ))}
                </span>
              </span>
            </div>
            <button type="button" className="nf-shop-btn" onClick={handleShopCurrentLook}>
              Shop the look
            </button>
          </div>

          {/* Morphing Follower Ring Cursor */}
          <div className="nf-ring" ref={ringRef} />
        </section>

        {/* Infinite Wrapping 12-Piece Product Rail */}
        <aside className="nf-rail" ref={railRef} aria-label="Pieces in this look">
          {RUNWAY_ITEMS.map((item, i) => {
            const isSaved = wishlist.includes(item.id);
            return (
              <article
                key={item.id}
                className={`nf-card${i % 2 ? ' alt' : ''}`}
                ref={(el) => {
                  cardElsRef.current[i] = el;
                }}
              >
                <button
                  type="button"
                  className="nf-fav"
                  aria-pressed={isSaved}
                  aria-label={`Save ${item.name} to wishlist`}
                  onClick={() => onToggleWishlist(getProductAt(i))}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9C20.5 15 12 20 12 20Z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="nf-shot"
                  aria-label={`View details for ${item.name}`}
                  onClick={() => onViewDetails(getProductAt(i))}
                >
                  <SpriteCrop
                    href={PIECES_SHEET}
                    x0={item.x0}
                    y0={item.y0}
                    w={item.x1 - item.x0}
                    h={item.y1 - item.y0}
                    sheetW={960}
                    sheetH={720}
                  />
                </button>

                <div className="nf-meta">
                  <button
                    type="button"
                    className="nf-meta-title"
                    onClick={() => onViewDetails(getProductAt(i))}
                  >
                    {item.name}
                  </button>
                  <span className="nf-meta-price">GH₵ {item.price.toLocaleString()}</span>
                  <button
                    type="button"
                    className="nf-add"
                    aria-label={`Add ${item.name} to cart`}
                    title={`Add ${item.name} to cart`}
                    onClick={() => onAddToCart(getProductAt(i), item.sizes[0] || 'M')}
                  />
                </div>
              </article>
            );
          })}
        </aside>
      </div>

      {/* Smooth Pearl Decode Veil */}
      <div className={`nf-wait${ready ? ' gone' : ''}`}>
        <div className="w-8 h-8 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
        <span className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase text-mauve-deep">
          Preparing Runway...
        </span>
      </div>
    </div>
  );
}
