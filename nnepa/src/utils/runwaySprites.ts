/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Product } from '../types.ts';

export const MODELS_SHEET =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261102_042056_1a704ff7-b0e5-4a9f-bbda-62392b819fb6.png&w=3840&q=85';

export const PIECES_SHEET =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261102_042057_080e85b0-b4aa-4072-8eb9-2304c7baf42b.png&w=2400&q=85';

// Each model's box on the 960 x 540 sheet: [x0, x1]
export const RUNWAY_LOOKS: [number, number][] = [
  [12, 176],
  [178, 330],
  [331, 470],
  [476, 633],
  [634, 767],
  [767, 956],
];

export const MODEL_Y0 = 48;
export const MODEL_Y1 = 496;
export const FIRST_LOOK_NUMBER = 15;

export interface RunwayPieceSpec {
  id: string;
  lookNumber: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  name: string;
  price: number;
  category: 'women' | 'men' | 'bags';
  subcategory: string;
  badge?: 'Bestseller' | 'New' | 'Sale' | 'Exclusive';
  description: string;
  sizes: string[];
}

// Each piece's box on the 960 x 720 sheet: x0, x1, y0, y1, name, price (GH₵)
export const RUNWAY_ITEMS: RunwayPieceSpec[] = [
  {
    id: 'runway_15_1',
    lookNumber: 15,
    x0: 26,
    x1: 224,
    y0: 28,
    y1: 214,
    name: 'Feather Jacket',
    price: 2900,
    category: 'women',
    subcategory: 'Runway Look 15 · Outerwear',
    badge: 'Exclusive',
    description:
      'Hand-finished blush feather jacket from Look 15 of our Runway Collection. Soft volume paired with clean interior satin lining, tailored to order in Accra.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_15_2',
    lookNumber: 15,
    x0: 304,
    x1: 412,
    y0: 22,
    y1: 236,
    name: 'Satin Wide Leg Trousers',
    price: 1450,
    category: 'women',
    subcategory: 'Runway Look 15 · Trousers',
    badge: 'New',
    description:
      'Fluid high-waisted wide leg trousers cut from heavy matte-lustre satin with deep front pleats and concealed side zip.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_16_1',
    lookNumber: 16,
    x0: 530,
    x1: 666,
    y0: 12,
    y1: 242,
    name: 'Pleated Dress',
    price: 2200,
    category: 'women',
    subcategory: 'Runway Look 16 · Evening Gown',
    badge: 'Bestseller',
    description:
      'Full-length sage knife-pleated gown from Look 16, sculpted to catch light and movement with effortless drape.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'runway_16_2',
    lookNumber: 16,
    x0: 752,
    x1: 922,
    y0: 100,
    y1: 146,
    name: 'Gold Waist Belt',
    price: 420,
    category: 'bags',
    subcategory: 'Runway Look 16 · Accessories',
    badge: 'New',
    description:
      'Warm brushed-gold waist cinch belt crafted to define fluid gowns and structured outerwear.',
    sizes: ['S/M', 'L/XL'],
  },
  {
    id: 'runway_17_1',
    lookNumber: 17,
    x0: 70,
    x1: 176,
    y0: 246,
    y1: 466,
    name: 'Satin Trench Dress',
    price: 2350,
    category: 'women',
    subcategory: 'Runway Look 17 · Tailored Coat Dress',
    badge: 'Exclusive',
    description:
      'Champagne double-breasted satin trench dress from Look 17 with storm-flap Lapels and self-tie waist sash.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_17_2',
    lookNumber: 17,
    x0: 294,
    x1: 422,
    y0: 294,
    y1: 432,
    name: 'Top Handle Bag',
    price: 980,
    category: 'bags',
    subcategory: 'Runway Look 17 · Leather Goods',
    badge: 'Bestseller',
    description:
      'Structured calfskin top-handle bag with soft gussets, suede interior lining, and discreet magnetic clasp.',
    sizes: ['One Size'],
  },
  {
    id: 'runway_18_1',
    lookNumber: 18,
    x0: 508,
    x1: 688,
    y0: 240,
    y1: 452,
    name: 'Billow Sleeve Blouse',
    price: 860,
    category: 'women',
    subcategory: 'Runway Look 18 · Silk Separates',
    badge: 'New',
    description:
      'Airy blush organza-silk blouse with gathered bishop sleeves and elongated buttoned cuffs.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_18_2',
    lookNumber: 18,
    x0: 780,
    x1: 890,
    y0: 252,
    y1: 466,
    name: 'Tie Waist Trousers',
    price: 740,
    category: 'women',
    subcategory: 'Runway Look 18 · Trousers',
    description:
      'Relaxed tailored trousers with integrated waist-tie ribbon and clean straight leg line.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_19_1',
    lookNumber: 19,
    x0: 64,
    x1: 178,
    y0: 484,
    y1: 698,
    name: 'Powder Long Coat',
    price: 1980,
    category: 'women',
    subcategory: 'Runway Look 19 · Outerwear',
    badge: 'Exclusive',
    description:
      'Longline powder-blue tailored coat with clean peak lapels, single vent back, and lightweight silk-blend lining.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_19_2',
    lookNumber: 19,
    x0: 316,
    x1: 396,
    y0: 482,
    y1: 698,
    name: 'Ivory Straight Trousers',
    price: 690,
    category: 'women',
    subcategory: 'Runway Look 19 · Trousers',
    description:
      'Crisp ivory straight-cut trousers pressed with center-front creases for clean vertical lines.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_20_1',
    lookNumber: 20,
    x0: 530,
    x1: 672,
    y0: 508,
    y1: 682,
    name: 'Sculpted Ruffle Top',
    price: 1120,
    category: 'women',
    subcategory: 'Runway Look 20 · Couture Separates',
    badge: 'Exclusive',
    description:
      'Ivory sculpted ruffle bodice crafted from layered silk-cotton faille that holds gentle architectural curve.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'runway_20_2',
    lookNumber: 20,
    x0: 754,
    x1: 916,
    y0: 484,
    y1: 700,
    name: 'Pleated Maxi Skirt',
    price: 1340,
    category: 'women',
    subcategory: 'Runway Look 20 · Evening Skirt',
    badge: 'New',
    description:
      'Sweeping ivory sunray-pleated maxi skirt finished with a satin waistband and graceful floor-grazing hem.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

// Fallback minimal pearl placeholder data URI before offscreen canvas slices complete
const PEARL_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='600'><rect width='100%25' height='100%25' fill='%23F7F3FA'/></svg>";

export const RUNWAY_PRODUCTS: Product[] = RUNWAY_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  subcategory: item.subcategory,
  price: item.price,
  rating: 5,
  imageUrl: PEARL_PLACEHOLDER,
  badge: item.badge,
  inStock: true,
  description: item.description,
  sizes: item.sizes,
}));

let preloadPromise: Promise<Record<string, string>> | null = null;
const slicedThumbnailMap: Record<string, string> = {};
let sheetsReadySync = false;

export function areRunwaySheetsDecoded(): boolean {
  return sheetsReadySync;
}

export function getRunwayProductsWithThumbnails(): Product[] {
  return RUNWAY_PRODUCTS.map((p) => ({
    ...p,
    imageUrl: slicedThumbnailMap[p.id] || p.imageUrl,
  }));
}

export function preloadRunwaySheets(): Promise<Record<string, string>> {
  if (preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    const loadImg = (url: string, anonymous = false) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        if (anonymous) img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(() => resolve(img)).catch(() => resolve(img));
          } else {
            resolve(img);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });

    const [, piecesImg] = await Promise.all([
      loadImg(MODELS_SHEET, false),
      loadImg(PIECES_SHEET, true),
      typeof document !== 'undefined' && document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
    ]);

    if (piecesImg && typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const cw = 480;
        const ch = 600;
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        if (ctx && piecesImg.naturalWidth > 0 && piecesImg.naturalHeight > 0) {
          const sx = piecesImg.naturalWidth / 960;
          const sy = piecesImg.naturalHeight / 720;

          for (let idx = 0; idx < RUNWAY_ITEMS.length; idx++) {
            const spec = RUNWAY_ITEMS[idx];
            ctx.fillStyle = '#F7F3FA';
            ctx.fillRect(0, 0, cw, ch);

            const srcX = spec.x0 * sx;
            const srcY = spec.y0 * sy;
            const srcW = (spec.x1 - spec.x0) * sx;
            const srcH = (spec.y1 - spec.y0) * sy;

            const padX = 48;
            const padY = 56;
            const fit = Math.min((cw - padX * 2) / srcW, (ch - padY * 2) / srcH);
            const dstW = srcW * fit;
            const dstH = srcH * fit;
            const dstX = (cw - dstW) / 2;
            const dstY = (ch - dstH) / 2;

            ctx.drawImage(piecesImg, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
            const dataUrl = canvas.toDataURL('image/webp', 0.86);
            slicedThumbnailMap[spec.id] = dataUrl;
            RUNWAY_PRODUCTS[idx].imageUrl = dataUrl;
          }
        }
      } catch {
        // Fallback smoothly if canvas tainted in restrictive browser settings
      }
    }

    sheetsReadySync = true;
    return slicedThumbnailMap;
  })();

  return preloadPromise;
}
