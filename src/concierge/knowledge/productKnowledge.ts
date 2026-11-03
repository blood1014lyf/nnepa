/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — B. Product Catalogue Knowledge
 * Dynamically derives structured product intelligence from the live storefront catalogue (`Product[]`).
 * Any new products or edits made in the Admin Dashboard are automatically understood by NNEPA.
 *
 * Optional supplemental fields (such as confirmed care instructions or named secondary colourways)
 * can be added in `PRODUCT_SUPPLEMENTAL_NOTES` below when published by the boutique.
 */

import type { Product } from '../../types.ts';

export interface ProductSupplementalInfo {
  /** Confirmed alternate colourway names, if published by the boutique */
  additionalColorNames?: string[] | null;
  /** Confirmed garment care instructions, if published by the boutique */
  careInstructions?: string | null;
  /** Additional fit note beyond the published product description */
  fitNote?: string | null;
}

/**
 * Editable map keyed by `product.id` for optional future boutique additions.
 * Leave fields omitted or `null` when not officially confirmed so NNEPA never guesses.
 */
export const PRODUCT_SUPPLEMENTAL_NOTES: Record<string, ProductSupplementalInfo> = {
  // Example for future updates:
  // 'prod_1789572165350': {
  //   additionalColorNames: ['Ivory & Gold'],
  //   careInstructions: 'Specialist dry clean only.'
  // }
};

export interface ProductKnowledgeEntry {
  product: Product;
  id: string;
  name: string;
  description: string | null;
  category: 'women' | 'men' | 'bags';
  categoryLabel: string;
  subcategory: string;
  price: number;
  formattedPrice: string;
  originalPrice: number | null;
  formattedOriginalPrice: string | null;
  availableSizes: string[];
  primaryColor: string | null;
  publishedColorCount: number | null;
  additionalColorNames: string[] | null;
  extractedMaterials: string[];
  fitSummary: string | null;
  imageUrl: string;
  productUrl: string;
  inStock: boolean;
  availabilitySummary: string;
  badge: string | null;
  careInstructions: string | null;
}

const KNOWN_MATERIAL_TERMS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bsilk-cotton\b|\bcotton-silk\b/i, label: 'silk-cotton blend' },
  { pattern: /\bsilk-organza\b/i, label: 'silk-organza' },
  { pattern: /\bsilk kente\b/i, label: 'handwoven silk Kente' },
  { pattern: /\basante kente\b|\bkente\b/i, label: 'handwoven Kente' },
  { pattern: /\bdamask brocade\b/i, label: 'damask brocade' },
  { pattern: /\bbrocade\b/i, label: 'brocade' },
  { pattern: /\bwax-print\b|\bankara\b/i, label: 'cotton wax-print (Ankara)' },
  { pattern: /\bwashed-linen\b|\blinen\b/i, label: 'washed linen' },
  { pattern: /\bstrip-woven cotton\b|\bfugu\b/i, label: 'Northern Ghanaian strip-woven cotton (Fugu)' },
  { pattern: /\bcotton-jacquard\b|\bmatelass[eé]\b/i, label: 'textured cotton-jacquard (matelassé)' },
  { pattern: /\bwool-cotton suiting\b/i, label: 'superfine wool-cotton suiting' },
  { pattern: /\baso-oke\b/i, label: 'hand-loomed Aso-Oke cloth' },
  { pattern: /\bcotton voile\b/i, label: 'cotton voile lining' },
  { pattern: /\bsilk threads\b|\bsilk\b/i, label: 'fine silk' },
  { pattern: /\belephant grass\b/i, label: 'hand-plaited Bolgatanga elephant grass' },
  { pattern: /\bvegetable-tanned ghanaian leather\b|\bleather\b/i, label: 'vegetable-tanned Ghanaian leather' },
  { pattern: /\bvelvet\b/i, label: 'plush velvet' },
  { pattern: /\bcast-brass adinkra\b|\bbrass\b/i, label: 'cast-brass Adinkra hardware' },
  { pattern: /\bsatin\b/i, label: 'satin interior' },
  { pattern: /\braffia\b/i, label: 'hand-crocheted natural raffia' },
  { pattern: /\bcalfskin\b/i, label: 'supple calfskin trim' }
];

export function extractPublishedMaterials(product: Product): string[] {
  const source = `${product.name} ${product.description || ''}`;
  const found: string[] = [];

  for (const item of KNOWN_MATERIAL_TERMS) {
    if (item.pattern.test(source)) {
      // Avoid adding generic 'fine silk' or 'handwoven Kente' if a more specific variant is already captured
      const isRedundant =
        (item.label === 'fine silk' &&
          found.some((f) => f.toLowerCase().includes('silk'))) ||
        (item.label === 'handwoven Kente' &&
          found.some((f) => f.toLowerCase().includes('kente'))) ||
        (item.label === 'brocade' &&
          found.some((f) => f.toLowerCase().includes('brocade')));

      if (!isRedundant && !found.includes(item.label)) {
        found.push(item.label);
      }
    }
  }

  return found;
}

export function deriveFitSummary(product: Product): string | null {
  const supplemental = PRODUCT_SUPPLEMENTAL_NOTES[product.id];
  if (supplemental?.fitNote) return supplemental.fitNote;

  if (product.category === 'bags') {
    return 'Accessory crafted in One Size.';
  }

  const desc = (product.description || '').toLowerCase();
  const name = product.name.toLowerCase();

  if (name.includes('boubou') || desc.includes('generously draped')) {
    return 'Generously draped silhouette cut with relaxed, comfortable ease.';
  }
  if (name.includes('agbada') || desc.includes('three-piece')) {
    return 'Three-piece ceremonial cut with generous drape and matching trousers.';
  }
  if (name.includes('kaftan')) {
    return 'Relaxed tailored kaftan silhouette with comfortable movement and side-seam pockets.';
  }
  if (name.includes('senator')) {
    return 'Clean-lined tailored tunic paired with tapered trousers.';
  }
  if (name.includes('smock') || name.includes('fugu')) {
    return 'Traditional structured woven smock with a pleated hem.';
  }
  if (name.includes('peplum')) {
    return 'Structured peplum bodice paired with an ankle-grazing column skirt.';
  }
  if (name.includes('wrap')) {
    return 'Adjustable side-tie wrap bodice paired with a softly gathered A-line midi skirt.';
  }
  if (name.includes('tiered')) {
    return 'Voluminous three-tier full-length silhouette.';
  }
  if (name.includes('midi')) {
    return 'Softly gathered waist midi silhouette with sculpted sleeves and back ties.';
  }
  if (name.includes('jacket')) {
    return 'Cropped boxy jacket silhouette with tied ribbon closures.';
  }
  if (desc.includes('flared')) {
    return 'Fluid flared silhouette with soft micro-pleats.';
  }
  if (name.includes('gown')) {
    return 'Full-length tailored evening gown silhouette.';
  }

  return product.description ? 'Tailored in Accra; refer to our Size Chart for exact body and length measurements.' : null;
}

export function formatCurrencyGHS(amount: number): string {
  return `GH₵ ${amount.toLocaleString()}`;
}

export function getCategoryLabel(category: Product['category']): string {
  if (category === 'women') return 'Womenswear';
  if (category === 'men') return 'Menswear';
  return 'Bags & Accessories';
}

export function buildProductKnowledge(product: Product): ProductKnowledgeEntry {
  const supplemental = PRODUCT_SUPPLEMENTAL_NOTES[product.id];
  const inStock = product.inStock !== false;
  // Note: ProductDetailsView defaults sizes to ['S', 'M', 'L', 'XL', 'XXL'] only when product.sizes is undefined
  const sizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : product.category === 'bags'
      ? ['One Size']
      : ['S', 'M', 'L', 'XL', 'XXL'];

  const availabilitySummary = inStock
    ? 'Available to order (bespoke handcrafted tailoring takes 3–7 working days).'
    : 'Currently marked Out of Stock online (contact the boutique to inquire about made-to-order commission availability).';

  return {
    product,
    id: product.id,
    name: product.name,
    description: product.description?.trim() || null,
    category: product.category,
    categoryLabel: getCategoryLabel(product.category),
    subcategory: product.subcategory,
    price: product.price,
    formattedPrice: formatCurrencyGHS(product.price),
    originalPrice: product.originalPrice ?? null,
    formattedOriginalPrice: product.originalPrice ? formatCurrencyGHS(product.originalPrice) : null,
    availableSizes: sizes,
    primaryColor: product.color?.trim() || null,
    publishedColorCount: product.colorCount ?? null,
    additionalColorNames: supplemental?.additionalColorNames ?? null,
    extractedMaterials: extractPublishedMaterials(product),
    fitSummary: deriveFitSummary(product),
    imageUrl: product.imageUrl,
    productUrl: `#/product/${product.id}`,
    inStock,
    availabilitySummary,
    badge: product.badge ?? null,
    careInstructions: supplemental?.careInstructions ?? null
  };
}

/**
 * Finds a specific product mentioned in a customer query by matching full or distinctive partial names.
 */
export function findProductMentionedInText(query: string, products: Product[]): Product | null {
  const normalized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return null;

  // 1. Exact full name substring match
  for (const p of products) {
    if (normalized.includes(p.name.toLowerCase())) {
      return p;
    }
  }

  // 2. Distinctive token scoring (ignoring generic garment words alone unless paired with distinctive words)
  const genericWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'piece', 'item', 'outfit',
    'dress', 'gown', 'suit', 'bag', 'set', 'two', 'men', 'women', 'size',
    'small', 'medium', 'large', 'price', 'cost', 'much', 'color', 'colour',
    'material', 'fabric', 'made', 'from', 'have', 'available', 'stock',
    'show', 'tell', 'about', 'compare', 'versus', 'vs'
  ]);

  let bestProduct: Product | null = null;
  let bestScore = 0;

  const queryWords = normalized.split(' ').filter((w) => w.length >= 3);

  for (const p of products) {
    const prodWords = p.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    let score = 0;
    let hasDistinctiveMatch = false;

    for (const pw of prodWords) {
      if (queryWords.includes(pw)) {
        if (genericWords.has(pw)) {
          score += 1;
        } else {
          score += 3;
          hasDistinctiveMatch = true;
        }
      }
    }

    if (hasDistinctiveMatch && score > bestScore) {
      bestScore = score;
      bestProduct = p;
    }
  }

  return bestScore >= 3 ? bestProduct : null;
}

/**
 * Finds up to two distinct products in a comparison query (e.g. "Compare Royal Gold Boubou and Patriarch Agbada").
 */
export function findProductsForComparison(query: string, products: Product[]): Product[] {
  const normalized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const genericWords = new Set([
    'the', 'and', 'with', 'this', 'that', 'compare', 'between', 'difference',
    'versus', 'vs', 'or', 'dress', 'gown', 'bag', 'set', 'two-piece', 'piece'
  ]);

  const queryWords = normalized.split(' ').filter((w) => w.length >= 3);

  const scored = products
    .map((p) => {
      const prodWords = p.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3);
      let score = 0;
      for (const pw of prodWords) {
        if (queryWords.includes(pw) && !genericWords.has(pw)) {
          score += 3;
        }
      }
      return { product: p, score };
    })
    .filter((entry) => entry.score >= 3)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 2).map((s) => s.product);
}

/**
 * Searches the catalogue by category, material, style, color, or occasion keywords.
 */
export function searchCatalogueProducts(query: string, products: Product[], limit = 4): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products.slice(0, limit);

  const stopWords = new Set([
    'can', 'you', 'show', 'me', 'find', 'looking', 'for', 'some', 'any', 'do', 'have',
    'what', 'which', 'are', 'the', 'in', 'a', 'an', 'of', 'to', 'with', 'please', 'help',
    'discover', 'see', 'browse', 'explore', 'pieces', 'items', 'outfits', 'garments',
    'is', 'it', 'its', 'your', 'my', 'our', 'and', 'or', 'as', 'at', 'by', 'from', 'on',
    'about', 'this', 'that', 'these', 'those', 'who', 'how', 'where', 'when', 'why'
  ]);

  const terms = q
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  if (terms.length === 0) return products.slice(0, limit);

  const scored = products
    .map((p) => {
      let score = 0;
      const nameL = p.name.toLowerCase();
      const subL = p.subcategory.toLowerCase();
      const descL = (p.description || '').toLowerCase();
      const colorL = (p.color || '').toLowerCase();
      const badgeL = (p.badge || '').toLowerCase();

      for (const term of terms) {
        if ((term === 'women' || term === 'womens' || term === 'womenswear' || term === 'ladies') && p.category === 'women') score += 6;
        else if ((term === 'men' || term === 'mens' || term === 'menswear' || term === 'gentlemen') && p.category === 'men') score += 6;
        else if ((term === 'bag' || term === 'bags' || term === 'clutch' || term === 'tote' || term === 'accessories') && p.category === 'bags') score += 6;

        if (nameL.includes(term)) score += 5;
        if (subL.includes(term)) score += 4;
        if (colorL.includes(term)) score += 4;
        if (badgeL.includes(term)) score += 3;
        if (descL.includes(term)) score += 2;
      }

      return { product: p, score };
    })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.product);
}

/**
 * Finds genuinely similar pieces from the live catalogue based on category & subcategory.
 */
export function getSimilarProducts(target: Product, products: Product[], limit = 3): Product[] {
  const others = products.filter((p) => p.id !== target.id);
  const sameSubcategory = others.filter(
    (p) => p.category === target.category && p.subcategory === target.subcategory
  );
  const sameCategory = others.filter(
    (p) => p.category === target.category && p.subcategory !== target.subcategory
  );

  return [...sameSubcategory, ...sameCategory].slice(0, limit);
}
