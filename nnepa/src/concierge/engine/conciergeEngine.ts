/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Conversational Intelligence Engine
 * 100% in-browser, privacy-first conversational reasoning engine.
 * Zero external LLMs, zero tracking, zero persistent storage.
 */

import type { Product } from '../../types.ts';
import {
  BRAND_KNOWLEDGE,
  buildProductKnowledge,
  findProductMentionedInText,
  findProductsForComparison,
  searchCatalogueProducts,
  getSimilarProducts,
  parseRequestedSizeFromText,
  getSizeSpecificationSummary,
  SIZING_KNOWLEDGE,
  ORDERING_KNOWLEDGE,
  DELIVERY_RETURNS_KNOWLEDGE,
  findMatchingFAQ,
  NNEPA_IDENTITY,
  UNCONFIRMED_FALLBACK_TEXT,
  SYNONYM_DICTIONARIES
} from '../knowledge/index.ts';
import { WOMEN_SIZE_CHART, MEN_SIZE_CHART } from '../../sizeChartData.ts';

export interface ConciergeActionOption {
  label: string;
  action: string;
  payload?: any;
}

export interface ConciergeTurnResponse {
  text: string;
  options: ConciergeActionOption[];
  products?: Product[];
  intent: string;
  updatedContext: ConversationContext;
}

export interface CustomerMeasurements {
  bust?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  unit: 'in' | 'cm';
}

export type OnboardingStage =
  | 'unstarted'
  | 'awaiting_name'
  | 'awaiting_size'
  | 'sizing_garment_inquiry'
  | 'sizing_label_inquiry'
  | 'sizing_fitting_offer'
  | 'sizing_path_select'
  | 'sizing_path_usual'
  | 'sizing_path_guided_unit'
  | 'sizing_assistant_bust'
  | 'sizing_assistant_waist'
  | 'sizing_assistant_hips'
  | 'sizing_assistant_fit_preference'
  | 'sizing_path_garment_type'
  | 'sizing_path_garment_measure'
  | 'onboarded';

export type OrderAssistanceStage =
  | 'idle'
  | 'confirm_product'
  | 'confirm_color'
  | 'confirm_size'
  | 'confirm_quantity'
  | 'summary_ready'
  | 'added';

export interface CustomerShoppingProfile {
  preferredName?: string;
  usualSize?: string;
  measurements?: CustomerMeasurements;
  preferredUnit: 'in' | 'cm';
  fitPreference?: 'closer' | 'relaxed' | 'standard';
  onboardingStage: OnboardingStage;
  orderStage: OrderAssistanceStage;
  selectedProduct?: Product | null;
  selectedSize?: string;
  selectedColor?: string;
  selectedQuantity?: number;
  garmentType?: 'dress' | 'top' | 'pants';
}

export interface ConversationContext {
  focusedProduct: Product | null;
  comparedProducts: Product[];
  lastIntent: string | null;
  activeCategory: 'women' | 'men' | 'bags' | 'all' | null;
  turnCount: number;
  profile: CustomerShoppingProfile;
}

export function createInitialConciergeContext(initialProduct: Product | null = null): ConversationContext {
  return {
    focusedProduct: initialProduct,
    comparedProducts: [],
    lastIntent: null,
    activeCategory: initialProduct?.category ?? null,
    turnCount: 0,
    profile: {
      preferredUnit: 'in',
      onboardingStage: 'awaiting_name',
      orderStage: 'idle'
    }
  };
}

/**
 * Normalizes query string for robust token matching.
 */
function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if normalized text contains any phrase from the given dictionary.
 */
function matchesAny(normalized: string, phrases: string[]): boolean {
  for (const phrase of phrases) {
    const pNorm = phrase.toLowerCase();
    if (normalized.includes(pNorm)) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts a customer's preferred name naturally from input text.
 * Handles "Ama", "Call me Ama", "My name is Ama Mensah", "I'm Kofi", etc.
 */
export function extractCustomerName(rawInput: string): string {
  let cleaned = rawInput.trim();
  cleaned = cleaned.replace(/[.!?]+$/, '').trim();

  if (/^(how|what|where|who|when|why|can|is|do|does|will|tell|show|explore|browse)\b/i.test(cleaned)) {
    return '';
  }

  const regex = /^(?:hello|hi|hey|good\s+(?:morning|afternoon|evening))?[,\s]*(?:please\s+)?(?:call\s+me|you\s+can\s+call\s+me|my\s+name\s+is|i\s*['’]m|i\s+am|it\s*['’]s)?\s*(.+)$/i;
  const match = cleaned.match(regex);
  let name = match && match[1] ? match[1].trim() : cleaned;

  name = name.replace(/^(?:hello|hi|hey|greetings|warm greetings|my name is|i am|i'm)\s+/i, '').trim();

  if (!name || name.length > 40) return '';
  if (/^(how|what|where|who|when|why|can|is|do|does|will|tell|show|explore|browse)\b/i.test(name)) {
    return '';
  }

  const words = name.split(/\s+/).slice(0, 3);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export interface InputValidationResult {
  isValid: boolean;
  value?: number;
  unit: 'in' | 'cm';
  errorMessage?: string;
}

/**
 * Validates numeric measurement entries within realistic anatomical bounds.
 * Prevents typos, negatives, and unrealistic inputs while allowing corrections.
 */
export function validateMeasurementInput(
  rawInput: string,
  type: 'bust' | 'waist' | 'hips' | 'chest',
  defaultUnit: 'in' | 'cm' = 'in'
): InputValidationResult {
  const norm = rawInput.toLowerCase().trim();
  const numMatch = norm.match(/([0-9]+(?:\.[0-9]+)?)/);

  if (!numMatch) {
    return {
      isValid: false,
      unit: defaultUnit,
      errorMessage: 'Please enter a numeric measurement (e.g. 36 or 91 cm), or choose "Skip this measurement".'
    };
  }

  const rawVal = parseFloat(numMatch[1]);
  const detectedUnit: 'in' | 'cm' = norm.includes('cm') ? 'cm' : defaultUnit;
  const valInches = detectedUnit === 'cm' ? rawVal / 2.54 : rawVal;

  let minIn = 20;
  let maxIn = 65;

  if (type === 'waist') {
    minIn = 18;
    maxIn = 60;
  } else if (type === 'hips') {
    minIn = 25;
    maxIn = 70;
  }

  if (valInches < minIn || valInches > maxIn) {
    const minVal = detectedUnit === 'cm' ? Math.round(minIn * 2.54) : minIn;
    const maxVal = detectedUnit === 'cm' ? Math.round(maxIn * 2.54) : maxIn;
    const unitLabel = detectedUnit === 'cm' ? 'cm' : 'inches';

    return {
      isValid: false,
      unit: detectedUnit,
      errorMessage: `Please enter a measurement between ${minVal} and ${maxVal} ${unitLabel}, or choose "Skip this measurement".`
    };
  }

  return {
    isValid: true,
    value: rawVal,
    unit: detectedUnit
  };
}

export interface ResolvedLabelSizeResult {
  targetSize: string;
  matchedLabel: string;
  isCertain: boolean;
}

/**
 * Resolves a customer's label size from an existing garment.
 * Maps international sizes (US, UK, EU), alpha sizes, and numeric dress/pant tags.
 * Signals uncertainty when information is ambiguous, faded, or absent.
 */
export function resolveLabelSize(
  input: string,
  category: 'women' | 'men' | 'bags' = 'women'
): ResolvedLabelSizeResult | null {
  const norm = input.toLowerCase().trim();

  // If input indicates uncertainty, missing label, or doubt
  if (
    norm.includes('not sure') ||
    norm.includes("don't know") ||
    norm.includes('dont know') ||
    norm.includes("can't find") ||
    norm.includes('cannot find') ||
    norm.includes('faded') ||
    norm.includes('unsure') ||
    norm.includes('no tag') ||
    norm.includes('no label') ||
    norm.includes('lost') ||
    norm.includes('torn') ||
    norm.includes('rubbed off') ||
    norm.includes('unclear')
  ) {
    return null;
  }

  // Handle explicit action identifiers
  if (norm === 'label_size_xs' || norm === 'set_size_xs') return { targetSize: 'XS', matchedLabel: 'XS', isCertain: true };
  if (norm === 'label_size_s' || norm === 'set_size_s') return { targetSize: 'S', matchedLabel: 'S', isCertain: true };
  if (norm === 'label_size_m' || norm === 'set_size_m') return { targetSize: 'M', matchedLabel: 'M', isCertain: true };
  if (norm === 'label_size_l' || norm === 'set_size_l') return { targetSize: 'L', matchedLabel: 'L', isCertain: true };
  if (norm === 'label_size_xl' || norm === 'set_size_xl') return { targetSize: 'XL', matchedLabel: 'XL', isCertain: true };
  if (norm === 'label_size_xxl' || norm === 'set_size_xxl') return { targetSize: 'XXL', matchedLabel: 'XXL', isCertain: true };

  // Parse using existing regional and alpha parser
  const parsed = parseRequestedSizeFromText(input, category);
  if (parsed) {
    return {
      targetSize: parsed.alpha,
      matchedLabel: parsed.matchedFromRegional || parsed.alpha,
      isCertain: true
    };
  }

  // Single standalone letter or token checks: "s", "m", "l", "xl", "xs", "xxl"
  if (/^xs$/i.test(norm)) return { targetSize: 'XS', matchedLabel: 'XS', isCertain: true };
  if (/^s$/i.test(norm)) return { targetSize: 'S', matchedLabel: 'S', isCertain: true };
  if (/^m$/i.test(norm)) return { targetSize: 'M', matchedLabel: 'M', isCertain: true };
  if (/^l$/i.test(norm)) return { targetSize: 'L', matchedLabel: 'L', isCertain: true };
  if (/^xl$/i.test(norm)) return { targetSize: 'XL', matchedLabel: 'XL', isCertain: true };
  if (/^xxl$/i.test(norm) || /^2xl$/i.test(norm)) return { targetSize: 'XXL', matchedLabel: 'XXL', isCertain: true };

  // Standalone numbers from standard clothing labels (e.g. 10, 12, 14, 8)
  const numMatch = norm.match(/\b(\d{1,2})\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num === 4 || num === 6) return { targetSize: 'XS', matchedLabel: `Size ${num}`, isCertain: true };
    if (num === 8 || num === 10) return { targetSize: 'S', matchedLabel: `Size ${num}`, isCertain: true };
    if (num === 12 || num === 14) return { targetSize: 'M', matchedLabel: `Size ${num}`, isCertain: true };
    if (num === 16 || num === 18) return { targetSize: 'L', matchedLabel: `Size ${num}`, isCertain: true };
    if (num === 20 || num === 22) return { targetSize: 'XL', matchedLabel: `Size ${num}`, isCertain: true };
    if (num === 24 || num === 26) return { targetSize: 'XXL', matchedLabel: `Size ${num}`, isCertain: true };
  }

  return null;
}

/**
 * Returns formatted brand size chart specifications calibrated for the specific garment type.
 */
export function getGarmentSpec(
  targetSize: string,
  garmentType: 'dress' | 'top' | 'pants' = 'dress',
  category: 'women' | 'men' = 'women'
): string {
  if (category === 'men') {
    const row = MEN_SIZE_CHART.find((r) => r.alphaSize === targetSize);
    if (!row) return 'standard menswear tailoring proportions';
    if (garmentType === 'pants') {
      return `a waist of ${row.waistIn} (${row.waistCm}) and a ${row.trousersInseamIn} trousers inseam`;
    }
    return `a chest of ${row.chestIn} (${row.chestCm}) and waist of ${row.waistIn} (${row.waistCm})`;
  }

  const row = WOMEN_SIZE_CHART.find((r) => r.alphaSize === targetSize);
  if (!row) return 'standard boutique tailoring proportions';
  if (garmentType === 'pants') {
    return `a waist of ${row.waistIn} (${row.waistCm}) and hips of ${row.hipsIn} (${row.hipsCm}) with a ${row.pantsInseamIn} pants inseam`;
  }
  if (garmentType === 'top') {
    return `a bust of ${row.bustIn} (${row.bustCm}) and waist of ${row.waistIn} (${row.waistCm})`;
  }
  return `a bust of ${row.bustIn} (${row.bustCm}), waist of ${row.waistIn} (${row.waistCm}), and hips of ${row.hipsIn} (${row.hipsCm})`;
}

export interface SizingEvaluationResult {
  recommendedSize: string;
  isBetweenSizes: boolean;
  alternativeSize?: string;
  customerMeasurementsSummary: string;
  brandMeasurementsSummary: string;
  fitExplanation: string;
  inquiryForFitPreference?: string;
}

/**
 * Real Sizing Engine:
 * Compares customer measurements against the brand's authentic published size chart.
 * Normalizes units, handles missing values, detects between-size fits, and returns clear explanations.
 */
export function evaluateSizing(
  measurements: CustomerMeasurements,
  category: 'women' | 'men' = 'women'
): SizingEvaluationResult {
  const isCm = measurements.unit === 'cm';
  const toInches = (val?: number) => (val !== undefined ? (isCm ? val / 2.54 : val) : undefined);

  const bustIn = toInches(measurements.bust);
  const chestIn = toInches(measurements.chest);
  const waistIn = toInches(measurements.waist);
  const hipsIn = toInches(measurements.hips);

  if (category === 'men') {
    const chestVal = chestIn ?? bustIn;
    const waistVal = waistIn;

    const ranges = [
      { alpha: 'XS', chest: [34, 35], waist: [28, 29], chestSpec: isCm ? '86–89 cm' : '34–35"', waistSpec: isCm ? '71–74 cm' : '28–29"' },
      { alpha: 'S', chest: [36, 37], waist: [30, 31], chestSpec: isCm ? '91–94 cm' : '36–37"', waistSpec: isCm ? '76–79 cm' : '30–31"' },
      { alpha: 'M', chest: [38, 40], waist: [32, 34], chestSpec: isCm ? '96.5–101.5 cm' : '38–40"', waistSpec: isCm ? '81–86.5 cm' : '32–34"' },
      { alpha: 'L', chest: [42, 44], waist: [36, 38], chestSpec: isCm ? '106.5–112 cm' : '42–44"', waistSpec: isCm ? '91.5–96.5 cm' : '36–38"' },
      { alpha: 'XL', chest: [46, 48], waist: [40, 42], chestSpec: isCm ? '117–122 cm' : '46–48"', waistSpec: isCm ? '101.5–106.5 cm' : '40–42"' },
      { alpha: 'XXL', chest: [50, 52], waist: [44, 46], chestSpec: isCm ? '127–132 cm' : '50–52"', waistSpec: isCm ? '112–117 cm' : '44–46"' }
    ];

    let best = ranges[2];
    let minDistance = Infinity;

    for (const r of ranges) {
      let dist = 0;
      let count = 0;
      if (chestVal !== undefined) {
        const chestMid = (r.chest[0] + r.chest[1]) / 2;
        dist += Math.abs(chestVal - chestMid) * 1.5;
        count++;
      }
      if (waistVal !== undefined) {
        const waistMid = (r.waist[0] + r.waist[1]) / 2;
        dist += Math.abs(waistVal - waistMid);
        count++;
      }
      if (count > 0 && dist < minDistance) {
        minDistance = dist;
        best = r;
      }
    }

    const idx = ranges.indexOf(best);
    let isBetween = false;
    let altSize: string | undefined = undefined;

    const primaryVal = chestVal ?? waistVal ?? 38;
    const primaryRange = chestVal !== undefined ? best.chest : best.waist;

    if (idx > 0 && primaryVal < primaryRange[0]) {
      isBetween = true;
      altSize = ranges[idx - 1].alpha;
    } else if (idx < ranges.length - 1 && primaryVal > primaryRange[1]) {
      isBetween = true;
      altSize = ranges[idx + 1].alpha;
    }

    let primarySize = best.alpha;
    let secondarySize = altSize;
    if (isBetween && altSize && ranges.findIndex((r) => r.alpha === altSize) > idx) {
      primarySize = altSize;
      secondarySize = best.alpha;
    }

    const targetRange = ranges.find((r) => r.alpha === primarySize) || best;
    const unitStr = isCm ? 'cm' : '"';
    const customerParts: string[] = [];
    if (measurements.chest || measurements.bust) customerParts.push(`Chest: ${measurements.chest ?? measurements.bust}${unitStr}`);
    if (measurements.waist) customerParts.push(`Waist: ${measurements.waist}${unitStr}`);

    const customerSummary = customerParts.join(', ') || 'Standard Proportions';
    const brandSummary = `Chest ${targetRange.chestSpec}, Waist ${targetRange.waistSpec}`;

    return {
      recommendedSize: primarySize,
      isBetweenSizes: isBetween,
      alternativeSize: secondarySize,
      customerMeasurementsSummary: customerSummary,
      brandMeasurementsSummary: brandSummary,
      fitExplanation: isBetween
        ? `Your measurements sit between Size ${secondarySize} and Size ${primarySize}. Size ${primarySize} provides comfortable, traditional ease through the chest, while Size ${secondarySize} offers a closer tailored line.`
        : `Your measurements align naturally with our Size ${primarySize} tailoring proportions for a dignified, well-structured drape.`,
      inquiryForFitPreference: isBetween
        ? `Based on your measurements, size ${primarySize} looks like the closest match. Would you prefer a closer fit or a little more room?`
        : undefined
    };
  }

  // Womenswear sizing
  const bustVal = bustIn;
  const waistVal = waistIn;
  const hipsVal = hipsIn;

  const ranges = [
    { alpha: 'XS', bust: [31, 32.5], waist: [23, 25], hips: [33, 35], bustSpec: isCm ? '78–82 cm' : '31–32.5"', waistSpec: isCm ? '58–63.5 cm' : '23–25"', hipsSpec: isCm ? '84–89 cm' : '33–35"' },
    { alpha: 'S', bust: [33.5, 35], waist: [26, 28], hips: [36, 38], bustSpec: isCm ? '85–89 cm' : '33.5–35"', waistSpec: isCm ? '66–71 cm' : '26–28"', hipsSpec: isCm ? '91.5–96.5 cm' : '36–38"' },
    { alpha: 'M', bust: [36, 38], waist: [29, 31], hips: [39, 41], bustSpec: isCm ? '91.5–96.5 cm' : '36–38"', waistSpec: isCm ? '73.5–79 cm' : '29–31"', hipsSpec: isCm ? '99–104 cm' : '39–41"' },
    { alpha: 'L', bust: [39, 41], waist: [32, 34.5], hips: [42, 44.5], bustSpec: isCm ? '99–104 cm' : '39–41"', waistSpec: isCm ? '81–87.5 cm' : '32–34.5"', hipsSpec: isCm ? '106.5–113 cm' : '42–44.5"' },
    { alpha: 'XL', bust: [42, 45], waist: [35, 38], hips: [45, 48], bustSpec: isCm ? '106.5–114 cm' : '42–45"', waistSpec: isCm ? '89–96.5 cm' : '35–38"', hipsSpec: isCm ? '114–122 cm' : '45–48"' },
    { alpha: 'XXL', bust: [46, 49], waist: [39, 42], hips: [49, 52], bustSpec: isCm ? '117–124.5 cm' : '46–49"', waistSpec: isCm ? '99–106.5 cm' : '39–42"', hipsSpec: isCm ? '124.5–132 cm' : '49–52"' }
  ];

  let best = ranges[2];
  let minDistance = Infinity;

  for (const r of ranges) {
    let dist = 0;
    let count = 0;
    if (bustVal !== undefined) {
      const bustMid = (r.bust[0] + r.bust[1]) / 2;
      dist += Math.abs(bustVal - bustMid) * 1.3;
      count++;
    }
    if (waistVal !== undefined) {
      const waistMid = (r.waist[0] + r.waist[1]) / 2;
      dist += Math.abs(waistVal - waistMid) * 1.2;
      count++;
    }
    if (hipsVal !== undefined) {
      const hipsMid = (r.hips[0] + r.hips[1]) / 2;
      dist += Math.abs(hipsVal - hipsMid);
      count++;
    }
    if (count > 0 && dist < minDistance) {
      minDistance = dist;
      best = r;
    }
  }

  const idx = ranges.indexOf(best);
  let isBetween = false;
  let altSize: string | undefined = undefined;

  const primaryVal = bustVal ?? waistVal ?? hipsVal ?? 36;
  const primaryRange = bustVal !== undefined ? best.bust : (waistVal !== undefined ? best.waist : best.hips);

  if (idx > 0 && primaryVal < primaryRange[0]) {
    isBetween = true;
    altSize = ranges[idx - 1].alpha;
  } else if (idx < ranges.length - 1 && primaryVal > primaryRange[1]) {
    isBetween = true;
    altSize = ranges[idx + 1].alpha;
  }

  let primarySize = best.alpha;
  let secondarySize = altSize;
  if (isBetween && altSize && ranges.findIndex((r) => r.alpha === altSize) > idx) {
    primarySize = altSize;
    secondarySize = best.alpha;
  }

  const targetRange = ranges.find((r) => r.alpha === primarySize) || best;
  const unitStr = isCm ? 'cm' : '"';
  const customerParts: string[] = [];
  if (measurements.bust) customerParts.push(`Bust: ${measurements.bust}${unitStr}`);
  if (measurements.waist) customerParts.push(`Waist: ${measurements.waist}${unitStr}`);
  if (measurements.hips) customerParts.push(`Hips: ${measurements.hips}${unitStr}`);

  const customerSummary = customerParts.join(', ') || 'Custom Proportions';
  const brandSummary = `Bust ${targetRange.bustSpec}, Waist ${targetRange.waistSpec}, Hips ${targetRange.hipsSpec}`;

  return {
    recommendedSize: primarySize,
    isBetweenSizes: isBetween,
    alternativeSize: secondarySize,
    customerMeasurementsSummary: customerSummary,
    brandMeasurementsSummary: brandSummary,
    fitExplanation: isBetween
      ? `Your measurements sit between Size ${secondarySize} and Size ${primarySize}. Size ${primarySize} provides a relaxed, graceful drape, whereas Size ${secondarySize} will provide a closer, more tailored fit.`
      : `Your measurements align naturally with our Size ${primarySize} tailoring proportions for a balanced silhouette and comfortable movement.`,
    inquiryForFitPreference: isBetween
      ? `Based on your measurements, size ${primarySize} looks like the closest match. Would you prefer a closer fit or a little more room?`
      : undefined
  };
}

/**
 * Classifies customer intent using local dictionaries and context.
 */
export function classifyCustomerIntent(
  query: string,
  context: ConversationContext
): string {
  const norm = normalizeQuery(query);
  if (!norm) return 'empty';

  // 1. Comparison Intent
  if (matchesAny(norm, SYNONYM_DICTIONARIES.compare)) {
    return 'compare_products';
  }

  // 2. Similar pieces intent
  if (matchesAny(norm, SYNONYM_DICTIONARIES.similar)) {
    return 'similar_products';
  }

  // 3. Price inquiry
  if (matchesAny(norm, SYNONYM_DICTIONARIES.price)) {
    return 'product_price';
  }

  // 4. Color inquiry
  if (matchesAny(norm, SYNONYM_DICTIONARIES.color)) {
    return 'product_color';
  }

  // 5. Material / Fabric inquiry
  if (matchesAny(norm, SYNONYM_DICTIONARIES.material)) {
    return 'product_material';
  }

  // 6. Care / Washing instructions
  if (matchesAny(norm, SYNONYM_DICTIONARIES.care)) {
    return 'product_care';
  }

  // 7. Garment fit inquiry (e.g. "Will this dress fit me?", "Will this fit me?", "How does this fit?")
  if (
    norm.includes('fit me') ||
    norm.includes('will this fit') ||
    norm.includes('will this dress fit') ||
    norm.includes('how does this fit') ||
    norm.includes('true to size') ||
    norm.includes('run small') ||
    norm.includes('run large')
  ) {
    return 'check_garment_fit';
  }

  // 8. Order assistance
  if (
    norm.includes('help me order') ||
    norm.includes('help me buy') ||
    norm.includes('order this') ||
    norm.includes('buy this') ||
    norm.includes('purchase this') ||
    norm.includes('complete my order') ||
    norm.includes('complete order') ||
    norm.includes('place order') ||
    norm.includes('add to bag') ||
    norm.includes('add to cart') ||
    norm.includes('buy now') ||
    norm.startsWith('select size for order') ||
    norm.startsWith('select_size_for_order') ||
    norm.startsWith('prompt choose size') ||
    norm.startsWith('prompt_choose_size') ||
    norm.startsWith('confirm add to cart') ||
    norm.startsWith('confirm_add_to_cart')
  ) {
    return 'order_assistance';
  }

  // 9. Specific size availability inquiry (e.g. "Do you have this in medium?")
  if (matchesAny(norm, SYNONYM_DICTIONARIES.sizeAvailable)) {
    return 'size_availability';
  }

  // 10. Sizing help / not sure
  if (
    norm.includes('not sure') ||
    norm.includes('help with my size') ||
    norm.includes('help me with my size') ||
    norm.includes('help with sizing') ||
    norm.includes('find my size') ||
    norm.includes('calculate size') ||
    norm.includes('measure me') ||
    norm.includes('best fit') ||
    norm.includes('find my fit')
  ) {
    return 'sizing_help';
  }

  // 11. Size chart / measurements inquiry
  if (matchesAny(norm, SYNONYM_DICTIONARIES.sizeChart)) {
    return 'size_chart_info';
  }

  // 12. Alterations
  if (matchesAny(norm, SYNONYM_DICTIONARIES.alterations)) {
    return 'alterations_info';
  }

  // 13. Ordering general
  if (matchesAny(norm, SYNONYM_DICTIONARIES.order)) {
    return 'how_to_order';
  }

  // 14. Payment
  if (matchesAny(norm, SYNONYM_DICTIONARIES.payment)) {
    return 'payment_info';
  }

  // 15. Delivery
  if (matchesAny(norm, SYNONYM_DICTIONARIES.delivery)) {
    return 'delivery_info';
  }

  // 16. Returns / Refunds
  if (matchesAny(norm, SYNONYM_DICTIONARIES.returns)) {
    return 'returns_info';
  }

  // 17. Exchanges
  if (matchesAny(norm, SYNONYM_DICTIONARIES.exchanges)) {
    return 'exchanges_info';
  }

  // 18. Contact / Boutique support
  if (matchesAny(norm, SYNONYM_DICTIONARIES.contact)) {
    return 'contact_boutique';
  }

  // 19. Greeting
  if (matchesAny(norm, SYNONYM_DICTIONARIES.greeting) && norm.split(' ').length <= 4) {
    return 'greeting';
  }

  // Check category explorations
  if (norm.includes('women') || norm.includes('gown') || norm.includes('boubou') || norm.includes('dress')) {
    return 'explore_women';
  }
  if (norm.includes('men') || norm.includes('kaftan') || norm.includes('agbada') || norm.includes('smock')) {
    return 'explore_men';
  }
  if (norm.includes('bag') || norm.includes('clutch') || norm.includes('tote')) {
    return 'explore_bags';
  }

  return 'unknown';
}

/**
 * Main engine processing function.
 * Manages conversational reasoning, customer onboarding, 3-path size discovery,
 * real sizing calculations, and order assistance in 100% private in-browser memory.
 */
export function processConciergeMessage(
  userInput: string,
  context: ConversationContext,
  catalogue: Product[]
): ConciergeTurnResponse {
  const norm = normalizeQuery(userInput);
  const updatedContext: ConversationContext = {
    ...context,
    turnCount: context.turnCount + 1,
    profile: { ...context.profile }
  };

  const profile = updatedContext.profile;
  const customerName = profile.preferredName ? `, ${profile.preferredName}` : '';
  const customerNameSalutation = profile.preferredName ? ` ${profile.preferredName}` : '';

  // ─── CONTEXT RESOLUTION ──────────────────────────────────────────────────
  const mentionedProduct = findProductMentionedInText(userInput, catalogue);
  if (mentionedProduct) {
    updatedContext.focusedProduct = mentionedProduct;
    updatedContext.activeCategory = mentionedProduct.category;
  }

  const activeProd = updatedContext.focusedProduct;
  const prodKnowledge = activeProd ? buildProductKnowledge(activeProd) : null;

  // ─── DIRECT ACTION PAYLOAD & SIZING PATH DISPATCH ─────────────────────────

  // 1. Direct size selection (e.g. set_size_m or user selects specific size)
  if (userInput.startsWith('set_size_')) {
    const chosenSize = userInput.replace('set_size_', '').toUpperCase();
    profile.usualSize = chosenSize;
    profile.onboardingStage = 'onboarded';

    const text =
      `Thank you${customerName}. I’ve noted that you usually wear size ${chosenSize}.\n\n` +
      `Our ready-to-wear is tailored true to international proportions. Would you like to explore our latest pieces or check the fit of a specific garment?`;

    return {
      text,
      options: [
        { label: 'View Suitable Garments', action: 'filter_all' },
        { label: 'Check Garment Fit', action: 'check_garment_fit' },
        { label: 'Size & Length Guide', action: 'size_guide' }
      ],
      intent: 'size_profile_completed',
      updatedContext
    };
  }

  // ─── STEP 1: ASK ABOUT AN EXISTING GARMENT ─────────────────────────────────
  const isSizingStart =
    userInput === 'size_not_sure' ||
    userInput === 'start_size_assistance' ||
    userInput === 'sizing_path_select' ||
    userInput === 'sizing_help' ||
    norm === 'not sure' ||
    norm === 'i m not sure' ||
    norm === 'im not sure' ||
    norm === 'help me with my size' ||
    norm === 'help with size' ||
    norm === 'size help' ||
    norm === 'sizing help';

  if (isSizingStart) {
    profile.onboardingStage = 'sizing_garment_inquiry';

    const text = `No worries! Do you have a dress, shirt or pair of trousers that fits you comfortably?`;

    return {
      text,
      options: [
        { label: 'Dress', action: 'garment_dress' },
        { label: 'Shirt / Top', action: 'garment_top' },
        { label: 'Trousers', action: 'garment_trousers' },
        { label: 'I don’t have one', action: 'label_size_unknown' }
      ],
      intent: 'sizing_garment_inquiry',
      updatedContext
    };
  }

  // ─── STEP 2: ASK FOR THE LABEL SIZE ───────────────────────────────────────
  const isGarmentSelected =
    userInput === 'garment_dress' ||
    userInput === 'garment_top' ||
    userInput === 'garment_trousers' ||
    (profile.onboardingStage === 'sizing_garment_inquiry' &&
      (norm.includes('dress') || norm.includes('shirt') || norm.includes('top') || norm.includes('trouser') || norm.includes('pant')));

  if (isGarmentSelected) {
    const garmentType: 'dress' | 'top' | 'pants' =
      userInput === 'garment_trousers' || norm.includes('trouser') || norm.includes('pant')
        ? 'pants'
        : userInput === 'garment_top' || norm.includes('shirt') || norm.includes('top')
        ? 'top'
        : 'dress';

    profile.garmentType = garmentType;
    profile.onboardingStage = 'sizing_label_inquiry';

    const text = `Lovely! What size is written on its label?`;

    return {
      text,
      options: [
        { label: 'S', action: 'label_size_s' },
        { label: 'M', action: 'label_size_m' },
        { label: 'L', action: 'label_size_l' },
        { label: 'XL', action: 'label_size_xl' },
        { label: 'I can’t find the label', action: 'label_size_unknown' },
        { label: 'I’m not sure', action: 'label_size_unknown' }
      ],
      intent: 'sizing_label_inquiry',
      updatedContext
    };
  }

  // ─── STEP 4: IF CUSTOMER CANNOT FIND LABEL / DOES NOT KNOW / UNSURE ────────
  const isUnknownOrNoGarment =
    userInput === 'label_size_unknown' ||
    userInput === 'sizing_fitting_offer' ||
    (profile.onboardingStage === 'sizing_garment_inquiry' &&
      (norm.includes("don't have") || norm.includes('dont have') || norm === 'no' || norm.includes('none') || norm.includes('neither'))) ||
    (profile.onboardingStage === 'sizing_label_inquiry' &&
      (norm.includes("can't find") ||
        norm.includes('cannot find') ||
        norm.includes("don't know") ||
        norm.includes('dont know') ||
        norm.includes('not sure') ||
        norm.includes('no label') ||
        norm.includes('no tag') ||
        norm.includes('faded') ||
        norm.includes('unsure') ||
        norm.includes('lost') ||
        norm.includes('torn') ||
        norm === 'no'));

  if (isUnknownOrNoGarment) {
    profile.onboardingStage = 'sizing_fitting_offer';

    const text = `That’s alright! We can arrange a fitting to help you find the right size. Would you like to book one?`;

    return {
      text,
      options: [
        { label: 'Book a Fitting', action: 'book_fitting_yes' },
        { label: 'No thank you, continue shopping', action: 'book_fitting_no' }
      ],
      intent: 'sizing_fitting_offer',
      updatedContext
    };
  }

  // ─── FITTING BOOKING HANDOFF: ACCEPT OR DECLINE ───────────────────────────
  if (
    userInput === 'book_fitting_no' ||
    (profile.onboardingStage === 'sizing_fitting_offer' &&
      (norm === 'no' || norm.includes('no thanks') || norm.includes('no thank you') || norm.includes('browse') || norm.includes('continue shopping') || norm.includes('decline')))
  ) {
    profile.onboardingStage = 'onboarded';

    const text = `No problem at all! Feel free to take your time exploring our collections. If you need any assistance with styling or details along the way, I’m right here.`;

    return {
      text,
      options: [
        { label: 'Browse Collections', action: 'filter_all' },
        { label: 'Main Menu', action: 'main_menu' }
      ],
      intent: 'book_fitting_declined',
      updatedContext
    };
  }

  if (
    userInput === 'book_fitting_yes' ||
    (profile.onboardingStage === 'sizing_fitting_offer' &&
      (norm === 'yes' || norm.includes('yes please') || norm === 'book' || norm.includes('book fitting') || norm.includes('sure') || norm.includes('schedule')))
  ) {
    profile.onboardingStage = 'onboarded';

    const text =
      `We can host you for a private fitting at our Accra atelier, or assist you directly through WhatsApp (+233 53 879 5669). Our team will ensure every line and hem is tailored to you.\n\n` +
      `How would you like to proceed?`;

    return {
      text,
      options: [
        { label: 'Chat on WhatsApp', action: 'contact_whatsapp' },
        { label: 'View Atelier Contact Details', action: 'book_fitting' },
        { label: 'Return to Shopping', action: 'filter_all' }
      ],
      intent: 'book_fitting_accepted',
      updatedContext
    };
  }

  // ─── STEP 3: IF THE CUSTOMER KNOWS THEIR LABEL SIZE ───────────────────────
  const isLabelSizeAction = userInput.startsWith('label_size_') && userInput !== 'label_size_unknown';
  const isLabelInquiryStage = profile.onboardingStage === 'sizing_label_inquiry';

  if (isLabelSizeAction || isLabelInquiryStage) {
    const rawSize = isLabelSizeAction ? userInput.replace('label_size_', '').toUpperCase() : userInput;
    const resolved = resolveLabelSize(rawSize, updatedContext.activeCategory ?? 'women');

    if (resolved && resolved.isCertain) {
      const targetSize = resolved.targetSize;
      profile.usualSize = targetSize;
      profile.onboardingStage = 'onboarded';

      const garmentWord =
        profile.garmentType === 'pants'
          ? 'trousers'
          : profile.garmentType === 'top'
          ? 'shirt'
          : 'dress';

      const spec = getGarmentSpec(targetSize, profile.garmentType || 'dress', updatedContext.activeCategory ?? 'women');
      const productNote = activeProd
        ? ` For the **${activeProd.name}**, Size ${targetSize} offers a graceful, balanced silhouette.`
        : '';

      const text =
        `Using your ${garmentWord} (${resolved.matchedLabel}) as a reference, our ready-to-wear **Size ${targetSize}** is the closest match.\n\n` +
        `Our Size ${targetSize} is tailored for ${spec}.${productNote} Because cuts vary between different brands, this gives us a helpful starting guide.\n\n` +
        `Would you like to explore pieces in Size ${targetSize}, or would you prefer to arrange a fitting to be completely sure?`;

      return {
        text,
        options: [
          { label: `View Size ${targetSize} Pieces`, action: 'filter_all' },
          { label: 'Book a Fitting', action: 'book_fitting_yes' },
          { label: 'View Full Size Chart', action: 'open_size_chart' },
          { label: 'Continue Browsing', action: 'filter_all' }
        ],
        intent: 'sizing_reference_matched',
        updatedContext
      };
    } else {
      // Information is uncertain, ambiguous, or cannot be reliably matched -> Move directly to Step 4 fitting offer!
      profile.onboardingStage = 'sizing_fitting_offer';

      const text = `That’s alright! We can arrange a fitting to help you find the right size. Would you like to book one?`;

      return {
        text,
        options: [
          { label: 'Book a Fitting', action: 'book_fitting_yes' },
          { label: 'No thank you, continue shopping', action: 'book_fitting_no' }
        ],
        intent: 'sizing_fitting_offer',
        updatedContext
      };
    }
  }

  // Handle fit preference selection
  if (userInput === 'fit_closer' || userInput === 'fit_relaxed') {
    profile.fitPreference = userInput === 'fit_closer' ? 'closer' : 'relaxed';
    profile.onboardingStage = 'onboarded';

    const fitLabel = profile.fitPreference === 'closer' ? 'closer tailored fit' : 'relaxed drape';
    const text =
      `Understood${customerName}. I have saved your preference for a **${fitLabel}** in Size ${profile.usualSize} to your session profile.\n\n` +
      `Where would you like to explore next?`;

    return {
      text,
      options: [
        { label: 'View Suitable Garments', action: 'filter_all' },
        { label: 'Find a Garment', action: 'find_product' },
        { label: 'Return to Collection', action: 'explore_collections' }
      ],
      intent: 'fit_preference_saved',
      updatedContext
    };
  }

  // Order confirmation
  if (userInput === 'confirm_add_to_cart') {
    if (activeProd) {
      profile.orderStage = 'added';

      return {
        text: 'Added to your bag.',
        options: [
          { label: 'View Bag', action: 'open_bag' },
          { label: 'Proceed to Checkout', action: 'go_to_checkout' },
          { label: 'Continue Shopping', action: 'explore_collections' }
        ],
        intent: 'order_added_to_cart',
        updatedContext
      };
    }
  }

  if (userInput === 'skip_onboarding') {
    profile.onboardingStage = 'onboarded';
    return {
      text: `Welcome${customerNameSalutation} to Nnepa Foriwaa. How can I help you today?`,
      options: [
        { label: 'Explore Collections', action: 'explore_collections' },
        { label: 'Find a Garment', action: 'find_product' },
        { label: 'Size & Length Guide', action: 'size_guide' }
      ],
      intent: 'onboarding_skipped',
      updatedContext
    };
  }

  // ─── INTENT CLASSIFICATION ───────────────────────────────────────────────
  const classifiedIntent = classifyCustomerIntent(userInput, updatedContext);

  // ─── ACTIVE MEASUREMENT STAGE MACHINE ─────────────────────────────────────

  // 1. Stage: awaiting_name
  if (profile.onboardingStage === 'awaiting_name') {
    const isDirectQuestion = [
      'product_price',
      'size_availability',
      'product_color',
      'product_material',
      'product_care',
      'compare_products',
      'similar_products',
      'delivery_info',
      'returns_info',
      'exchanges_info',
      'alterations_info',
      'payment_info',
      'how_to_order',
      'order_assistance',
      'contact_boutique',
      'explore_women',
      'explore_men',
      'explore_bags'
    ].includes(classifiedIntent);

    if (!isDirectQuestion) {
      const extractedName = extractCustomerName(userInput);
      if (extractedName && classifiedIntent !== 'greeting') {
        profile.preferredName = extractedName;
        profile.onboardingStage = 'awaiting_size';

        const text =
          `Lovely to meet you, ${extractedName}. Let’s find something you’ll love.\n\n` +
          `Before we explore the collection, may I ask what clothing size you usually wear?`;

        return {
          text,
          options: [
            { label: 'XS', action: 'set_size_xs' },
            { label: 'S', action: 'set_size_s' },
            { label: 'M', action: 'set_size_m' },
            { label: 'L', action: 'set_size_l' },
            { label: 'XL', action: 'set_size_xl' },
            { label: 'XXL', action: 'set_size_xxl' },
            { label: 'Not sure', action: 'size_not_sure' }
          ],
          intent: 'onboarding_name_captured',
          updatedContext
        };
      }
    }
  }

  // 2. Stage: awaiting_size
  if (profile.onboardingStage === 'awaiting_size') {
    if (norm.includes('not sure') || norm.includes('help') || norm.includes("don't know") || norm.includes('dont know')) {
      profile.onboardingStage = 'sizing_garment_inquiry';

      const text = `No worries! Do you have a dress, shirt or pair of trousers that fits you comfortably?`;
      return {
        text,
        options: [
          { label: 'Dress', action: 'garment_dress' },
          { label: 'Shirt / Top', action: 'garment_top' },
          { label: 'Trousers', action: 'garment_trousers' },
          { label: 'I don’t have one', action: 'label_size_unknown' }
        ],
        intent: 'sizing_garment_inquiry',
        updatedContext
      };
    }

    const requestedSize = parseRequestedSizeFromText(userInput, updatedContext.activeCategory ?? 'women');
    if (requestedSize) {
      profile.usualSize = requestedSize.alpha;
      profile.onboardingStage = 'onboarded';

      const text =
        `Thank you${customerName}. I’ve noted that you usually wear size ${requestedSize.alpha}.\n\n` +
        `Would you like to explore our latest pieces, check the fit of a specific garment, or find something for an upcoming occasion?`;

      return {
        text,
        options: [
          { label: 'View Suitable Garments', action: 'filter_all' },
          { label: 'Check Garment Fit', action: 'check_garment_fit' },
          { label: 'Size & Length Guide', action: 'size_guide' }
        ],
        intent: 'size_profile_completed',
        updatedContext
      };
    }
  }

  // ─── INTENT: SIZING HELP / NOT SURE ──────────────────────────────────────
  if (classifiedIntent === 'sizing_help') {
    profile.onboardingStage = 'sizing_garment_inquiry';
    const text = `No worries! Do you have a dress, shirt or pair of trousers that fits you comfortably?`;

    return {
      text,
      options: [
        { label: 'Dress', action: 'garment_dress' },
        { label: 'Shirt / Top', action: 'garment_top' },
        { label: 'Trousers', action: 'garment_trousers' },
        { label: 'I don’t have one', action: 'label_size_unknown' }
      ],
      intent: 'sizing_garment_inquiry',
      updatedContext
    };
  }

  // ─── INTENT: CONTEXTUAL GARMENT FIT ("Will this dress fit me?") ──────────
  if (classifiedIntent === 'check_garment_fit') {
    if (prodKnowledge) {
      if (profile.usualSize) {
        const size = profile.usualSize;
        const spec = getSizeSpecificationSummary(size, prodKnowledge.category);
        const isBoubou = /boubou|kaftan|wrap|cape/i.test(prodKnowledge.name);
        const silhouette = isBoubou
          ? 'a flowing, relaxed silhouette designed for breathable ease and elegance'
          : 'a tailored silhouette structured to flatter your natural form';

        const text =
          `Yes${customerName}. Based on your profile (**Size ${size}**), the **${prodKnowledge.name}** in size ${size} is tailored with:\n\n` +
          (spec ? `• ${spec}\n\n` : '') +
          `This piece features ${silhouette}. Every garment is individually tailored in our Accra atelier, and we provide complimentary alterations within 7 days of delivery should you desire minor adjustments.\n\n` +
          `Would you like me to help you complete your order for this piece?`;

        return {
          text,
          options: [
            { label: `Help Me Order in Size ${size}`, action: 'order_assistance' },
            { label: 'Open Full Size Chart', action: 'open_size_chart' },
            { label: 'Explore Other Pieces', action: 'explore_collections' }
          ],
          products: [prodKnowledge.product],
          intent: 'garment_fit_profile_evaluated',
          updatedContext
        };
      } else {
        const text =
          `I would be happy to check the fit for the **${prodKnowledge.name}**${customerName}. How would you like to determine your size?`;

        return {
          text,
          options: [
            { label: '1. I know my usual clothing size', action: 'sizing_path_usual' },
            { label: '2. I don’t know my measurements', action: 'sizing_path_guided' },
            { label: '3. Help me choose using clothes I already own', action: 'sizing_path_garment' }
          ],
          products: [prodKnowledge.product],
          intent: 'garment_fit_needs_profile',
          updatedContext
        };
      }
    } else {
      const text = `Which garment from our collections would you like me to evaluate the fit for${customerName}?`;
      return {
        text,
        options: [
          { label: 'Browse Womenswear', action: 'filter_women' },
          { label: 'Browse Menswear', action: 'filter_men' }
        ],
        products: catalogue.slice(0, 3),
        intent: 'garment_fit_choose_product',
        updatedContext
      };
    }
  }

  // ─── INTENT: ORDER ASSISTANCE FLOW ───────────────────────────────────────
  if (
    classifiedIntent === 'order_assistance' ||
    userInput === 'order_assistance' ||
    userInput.startsWith('select_size_for_order_') ||
    userInput === 'prompt_choose_size'
  ) {
    if (prodKnowledge) {
      profile.onboardingStage = 'onboarded';
      // 1. Stock validation
      if (prodKnowledge.product.inStock === false) {
        return {
          text: `The **${prodKnowledge.name}** is currently out of stock. You can contact our store on WhatsApp to check availability, or explore other pieces from the collection.`,
          options: [
            { label: 'Chat on WhatsApp', action: 'contact_whatsapp' },
            { label: 'Browse Collections', action: 'filter_all' }
          ],
          products: catalogue.slice(0, 3),
          intent: 'product_out_of_stock',
          updatedContext
        };
      }

      // Check if user just selected a size via select_size_for_order_X or query
      if (userInput.startsWith('select_size_for_order_')) {
        const picked = userInput.replace('select_size_for_order_', '').trim().toUpperCase();
        if (picked) {
          profile.selectedSize = picked;
          profile.usualSize = profile.usualSize || picked;
        }
      }

      const availableSizes = prodKnowledge.availableSizes || [];
      const hasSpecificSizes = availableSizes.length > 0 && !availableSizes.includes('One Size');

      // 2. Check if size is already determined and valid for this garment
      const currentChosenSize = profile.selectedSize || profile.usualSize;
      const isSizeKnownAndAvailable = currentChosenSize && availableSizes.includes(currentChosenSize);

      if (userInput === 'prompt_choose_size' || (hasSpecificSizes && !isSizeKnownAndAvailable)) {
        profile.selectedProduct = prodKnowledge.product;
        profile.orderStage = 'confirm_size';

        const sizeOptions: ConciergeActionOption[] = availableSizes.map((s) => ({
          label: `Size ${s}`,
          action: 'select_size_for_order',
          payload: { size: s, product: prodKnowledge.product }
        }));
        sizeOptions.push({ label: 'Size Guide', action: 'size_guide' });
        sizeOptions.push({ label: 'Browse Collections', action: 'filter_all' });

        return {
          text: `What size would you like for the **${prodKnowledge.name}**?`,
          options: sizeOptions,
          products: [prodKnowledge.product],
          intent: 'order_select_size',
          updatedContext
        };
      }

      // Size is known or item does not require sizes (One Size / bags)
      const confirmedSize = hasSpecificSizes ? (currentChosenSize as string) : 'One Size';
      profile.selectedProduct = prodKnowledge.product;
      profile.selectedSize = confirmedSize;
      profile.selectedQuantity = 1;
      profile.orderStage = 'summary_ready';

      const price = prodKnowledge.product.price;
      const sizeNote = hasSpecificSizes ? ` in Size ${confirmedSize}` : '';
      const text =
        `Would you like to add the **${prodKnowledge.name}**${sizeNote} (GH₵ ${price.toLocaleString()}) to your bag?`;

      const options: ConciergeActionOption[] = [
        {
          label: hasSpecificSizes ? `Add to Bag (Size ${confirmedSize})` : 'Add to Bag',
          action: 'confirm_add_to_cart',
          payload: { size: confirmedSize, product: prodKnowledge.product }
        }
      ];

      if (hasSpecificSizes) {
        options.push({
          label: 'Change Size',
          action: 'prompt_choose_size',
          payload: { product: prodKnowledge.product }
        });
      }

      options.push({ label: 'Size Guide', action: 'size_guide' });
      options.push({ label: 'Continue Browsing', action: 'filter_all' });

      return {
        text,
        options,
        products: [prodKnowledge.product],
        intent: 'order_assistance_summary',
        updatedContext
      };
    } else {
      return {
        text: `Which piece from our boutique would you like to order today${customerName}?`,
        options: [
          { label: 'Browse Collections', action: 'filter_all' },
          { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
        ],
        products: catalogue.slice(0, 3),
        intent: 'order_assistance_select_product',
        updatedContext
      };
    }
  }

  // ─── INTENT: COMPARISON ──────────────────────────────────────────────────
  if (classifiedIntent === 'compare_products') {
    const compared = findProductsForComparison(userInput, catalogue);
    if (compared.length >= 2) {
      updatedContext.comparedProducts = compared;
      const [p1, p2] = compared;
      const k1 = buildProductKnowledge(p1);
      const k2 = buildProductKnowledge(p2);

      const text =
        `Here is a side-by-side comparison between **${k1.name}** and **${k2.name}**:\n\n` +
        `• **${k1.name}** (${k1.formattedPrice}): Cut from ${k1.extractedMaterials.join(', ') || 'artisanal African textiles'}. Silhouette: ${k1.fitSummary || 'Tailored fit'}. Sizes: ${k1.availableSizes.join(', ')}.\n\n` +
        `• **${k2.name}** (${k2.formattedPrice}): Cut from ${k2.extractedMaterials.join(', ') || 'artisanal African textiles'}. Silhouette: ${k2.fitSummary || 'Tailored fit'}. Sizes: ${k2.availableSizes.join(', ')}.\n\n` +
        `Both garments are tailored in Accra in 3–7 working days with complimentary alterations available within 7 days of delivery.`;

      return {
        text,
        options: [
          { label: `View ${p1.name}`, action: 'navigate_product', payload: p1 },
          { label: `View ${p2.name}`, action: 'navigate_product', payload: p2 },
          { label: 'Size Guide', action: 'size_guide' }
        ],
        products: [p1, p2],
        intent: classifiedIntent,
        updatedContext
      };
    }
  }

  // ─── INTENT: PRODUCT PRICE INQUIRY ───────────────────────────────────────
  if (classifiedIntent === 'product_price') {
    if (prodKnowledge) {
      const saleNote = prodKnowledge.formattedOriginalPrice
        ? ` (marked down from ${prodKnowledge.formattedOriginalPrice})`
        : '';
      const text =
        `The **${prodKnowledge.name}** is **${prodKnowledge.formattedPrice}**${saleNote}.\n\n` +
        `This price includes tailored construction in our Accra atelier.`;

      return {
        text,
        options: [
          { label: `Order ${prodKnowledge.name}`, action: 'order_assistance' },
          { label: 'Size & Fit', action: 'size_guide' },
          { label: 'Delivery Rates', action: 'delivery_info' }
        ],
        products: [prodKnowledge.product],
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: `Which garment would you like the price for${customerName}? Please share the name or select from the pieces below:`,
        options: [
          { label: 'Browse Women’s Pieces', action: 'filter_women' },
          { label: 'Browse Men’s Pieces', action: 'filter_men' }
        ],
        products: catalogue.slice(0, 3),
        intent: classifiedIntent,
        updatedContext
      };
    }
  }

  // ─── INTENT: SIZE AVAILABILITY ───────────────────────────────────────────
  if (classifiedIntent === 'size_availability') {
    const requestedSize = parseRequestedSizeFromText(userInput, activeProd?.category ?? 'women');

    if (prodKnowledge) {
      if (requestedSize) {
        const isAvailable = prodKnowledge.availableSizes.some(
          (s) => s.toLowerCase() === requestedSize.alpha.toLowerCase()
        );

        if (isAvailable) {
          const spec = getSizeSpecificationSummary(requestedSize.alpha, prodKnowledge.category);
          const text =
            `Yes, the **${prodKnowledge.name}** is available in **Size ${requestedSize.alpha}**.\n\n` +
            (spec ? `${spec}\n\n` : '') +
            `Every piece is tailored to order in Accra (3–7 working days). You can also include custom length or hem notes at checkout.`;

          return {
            text,
            options: [
              { label: `Order in Size ${requestedSize.alpha}`, action: 'order_assistance' },
              { label: 'Open Size Chart', action: 'open_size_chart' },
              { label: 'Explore Other Pieces', action: 'explore_collections' }
            ],
            products: [prodKnowledge.product],
            intent: classifiedIntent,
            updatedContext
          };
        } else {
          const text =
            `The **${prodKnowledge.name}** is currently offered in sizes: **${prodKnowledge.availableSizes.join(', ')}**.\n\n` +
            `Size ${requestedSize.alpha} is not listed in standard sizes for this piece, but our Accra atelier can tailor to your measurements upon request.`;

          return {
            text,
            options: [
              { label: 'View Full Size Chart', action: 'open_size_chart' },
              { label: 'Explore Available Pieces', action: 'explore_collections' }
            ],
            products: [prodKnowledge.product],
            intent: classifiedIntent,
            updatedContext
          };
        }
      } else {
        const text =
          `The **${prodKnowledge.name}** is available in sizes: **${prodKnowledge.availableSizes.join(', ')}**.\n\n` +
          `Our garments follow international sizing standards (US, UK, and EU). Would you like to check specific body measurements on our Size Chart?`;

        return {
          text,
          options: [
            { label: 'Open Size Chart', action: 'open_size_chart' },
            { label: `Order ${prodKnowledge.name}`, action: 'order_assistance' },
            { label: 'Explore Collection', action: 'explore_collections' }
          ],
          products: [prodKnowledge.product],
          intent: classifiedIntent,
          updatedContext
        };
      }
    } else {
      const generalSizeNote = requestedSize
        ? `Most Nnepa Foriwaa garments are tailored across standard sizes S through XXL, including Size ${requestedSize.alpha}.`
        : 'Our collections are tailored across standard sizes S through XXL.';

      return {
        text: `${generalSizeNote} Which specific garment would you like to check size availability for${customerName}?`,
        options: [
          { label: 'View Women’s Garments', action: 'filter_women' },
          { label: 'View Men’s Garments', action: 'filter_men' },
          { label: 'View Full Size Chart', action: 'open_size_chart' }
        ],
        products: catalogue.slice(0, 3),
        intent: classifiedIntent,
        updatedContext
      };
    }
  }

  // ─── INTENT: PRODUCT COLOR INQUIRY ───────────────────────────────────────
  if (classifiedIntent === 'product_color') {
    if (prodKnowledge) {
      const primary = prodKnowledge.primaryColor ? `available in **${prodKnowledge.primaryColor}**` : 'available as shown';
      const count = prodKnowledge.publishedColorCount;
      const countNote = count && count > 1
        ? `This piece is available in **${count} colors**.`
        : 'This piece is available in one color.';

      const text =
        `The **${prodKnowledge.name}** is ${primary}. ${countNote}\n\n` +
        `For custom colors or fabric options, you can contact our store directly on WhatsApp (+233 53 879 5669).`;

      return {
        text,
        options: [
          { label: `Order ${prodKnowledge.name}`, action: 'order_assistance' },
          { label: 'Chat on WhatsApp', action: 'contact_whatsapp' },
          { label: 'Explore Other Pieces', action: 'explore_collections' },
          { label: 'Size & Fit Advice', action: 'check_garment_fit' }
        ],
        products: [prodKnowledge.product],
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: `Several of our pieces are produced in multiple colors. Which piece would you like to check colors for${customerName}?`,
        options: [
          { label: 'Browse Collection', action: 'filter_all' },
          { label: 'Explore New Arrivals', action: 'explore_collections' }
        ],
        products: catalogue.slice(0, 3),
        intent: classifiedIntent,
        updatedContext
      };
    }
  }

  // ─── INTENT: PRODUCT MATERIAL INQUIRY ────────────────────────────────────
  if (classifiedIntent === 'product_material') {
    if (prodKnowledge) {
      const materials = prodKnowledge.extractedMaterials;
      const materialText = materials.length > 0
        ? `The **${prodKnowledge.name}** is crafted from **${materials.join(', ')}**.`
        : `The **${prodKnowledge.name}** is crafted from authentic West African luxury textiles.`;

      const text =
        `${materialText}\n\n` +
        `All textiles are sourced directly from artisan weavers in Ghana, Nigeria, and Senegal, and hand-finished in our Accra atelier.`;

      return {
        text,
        options: [
          { label: `Order ${prodKnowledge.name}`, action: 'order_assistance' },
          { label: 'Size & Length Guide', action: 'size_guide' },
          { label: 'Explore Other Pieces', action: 'explore_collections' }
        ],
        products: [prodKnowledge.product],
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: 'We craft using authentic West African textiles: handwoven Asante silk Kente, fine Northern Fugu strip-woven cotton, hand-loomed Nigerian Aso-Oke, damask brocade, washed linen, and breathable silk-cotton blends. Which garment would you like material details on?',
        options: [
          { label: 'Explore Womenswear', action: 'filter_women' },
          { label: 'Explore Menswear', action: 'filter_men' }
        ],
        products: catalogue.slice(0, 3),
        intent: classifiedIntent,
        updatedContext
      };
    }
  }

  // ─── INTENT: PRODUCT CARE ────────────────────────────────────────────────
  if (classifiedIntent === 'product_care') {
    if (prodKnowledge?.careInstructions) {
      return {
        text: `**Care Instructions for ${prodKnowledge.name}:**\n${prodKnowledge.careInstructions}`,
        options: [
          { label: `View ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
          { label: 'Main Menu', action: 'main_menu' }
        ],
        intent: classifiedIntent,
        updatedContext
      };
    }
    const pieceName = prodKnowledge ? ` for the **${prodKnowledge.name}**` : '';
    const text =
      `Because our garments incorporate delicate handwoven Kente, metallic brocade, and hand-dyed West African textiles, specialist dry cleaning is strongly recommended${pieceName} to preserve its structure and color.`;

    return {
      text,
      options: [
        { label: 'Size Guide', action: 'size_guide' },
        { label: 'Main Menu', action: 'main_menu' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: SIMILAR PRODUCTS ────────────────────────────────────────────
  if (classifiedIntent === 'similar_products') {
    if (activeProd) {
      const similar = getSimilarProducts(activeProd, catalogue, 3);
      const text = `Here are pieces similar to the **${activeProd.name}**:`;

      return {
        text,
        options: [
          { label: 'View Complete Catalog', action: 'filter_all' },
          { label: 'Size Guide', action: 'size_guide' }
        ],
        products: similar,
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: `I can recommend pieces${customerName}. Are you looking for womenswear, menswear, or handcrafted accessories?`,
        options: [
          { label: 'Womenswear', action: 'filter_women' },
          { label: 'Menswear', action: 'filter_men' },
          { label: 'Bags & Accessories', action: 'filter_bags' }
        ],
        products: catalogue.slice(0, 3),
        intent: classifiedIntent,
        updatedContext
      };
    }
  }

  // ─── INTENT: SIZE CHART & LENGTH GUIDE ───────────────────────────────────
  if (classifiedIntent === 'size_chart_info') {
    const text =
      `All Nnepa Foriwaa garments are tailored to international proportions (US, UK, and EU):\n\n` +
      `• **Dresses & Gowns**: Mini (34–36"), Knee (39–42"), Midi (45–49"), and Floor Gown/Boubou (55–60").\n` +
      `• **Pants & Trousers**: Inseam (27–35") and Outseam (37–45") calibrated for clean breaks.\n` +
      `• **Custom Calibrations**: Complimentary hem adjustments (Petite under 5'3" or Tall 5'8"+) can be requested in your checkout notes.\n\n` +
      `Would you like to open our interactive Size Chart or find your personal size?`;

    return {
      text,
      options: [
        { label: 'Open Full Size Chart', action: 'open_size_chart' },
        { label: 'Find My Best Fit', action: 'sizing_path_select' },
        { label: 'Return to Shopping', action: 'filter_all' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: HOW TO ORDER ────────────────────────────────────────────────
  if (classifiedIntent === 'how_to_order') {
    const text =
      `**How to Place an Order at Nnepa Foriwaa:**\n\n` +
      `1. **Select Your Piece**: Choose your garment from our collections.\n` +
      `2. **Choose Your Size**: Select your standard size (S–XXL) or reference our Size Chart.\n` +
      `3. **Add to Bag**: Click "Add to Bag" on the garment page or in chat.\n` +
      `4. **Checkout**: Proceed to checkout (#/checkout) and enter your contact and delivery coordinates.\n` +
      `5. **Order Confirmation**: Placing your order registers your garment specifications with our Accra boutique. No credit card is charged immediately online; our team connects with you on WhatsApp with your Order Number to confirm measurements and finalize delivery scheduling.\n\n` +
      `Would you like me to guide your order for a specific piece?`;

    return {
      text,
      options: [
        { label: 'Open Shopping Bag', action: 'open_bag' },
        { label: 'Browse Collections', action: 'filter_all' },
        { label: 'Size & Fit Guide', action: 'size_guide' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: PAYMENT INQUIRY ─────────────────────────────────────────────
  if (classifiedIntent === 'payment_info') {
    const text =
      `**Payment Information:**\n\n` +
      `• **Online Checkout**: No immediate payment is charged at checkout on our website. Submitting your order registers your garment specifications with our Accra boutique.\n` +
      `• **Confirmation & Payment**: Our team connects directly with you via WhatsApp with your private Order Number to confirm measurements and provide payment details (such as Ghana Mobile Money / MoMo or boutique arrangement) before cutting begins.\n` +
      `• **Currency**: All website prices are listed in Ghanaian Cedis (GH₵).\n\n` +
      `Would you like to explore ordering or delivery details?`;

    return {
      text,
      options: [
        { label: 'How to Order', action: 'how_to_order' },
        { label: 'Delivery Rates', action: 'delivery_info' },
        { label: 'Explore Collection', action: 'explore_collections' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: DELIVERY INQUIRY ────────────────────────────────────────────
  if (classifiedIntent === 'delivery_info') {
    const text =
      `**Delivery & Shipping Overview:**\n\n` +
      `• **Tailoring Turnaround**: Handcrafted tailoring takes **3 to 7 working days** in our Accra atelier before dispatch.\n` +
      `• **Accra & Greater Accra**: Complimentary delivery on orders of **GH₵ 1,000+**; standard fee of **GH₵ 45** for smaller orders (1–2 business days transit).\n` +
      `• **Regional Ghana**: Trusted domestic couriers to Kumasi, Takoradi, Cape Coast, Tamale, and other regions (2–3 business days transit).\n` +
      `• **International**: Worldwide door-to-door delivery via **DHL Express** (3–7 business days transit with full tracking).\n\n` +
      `Would you like help calculating transit times for your destination?`;

    return {
      text,
      options: [
        { label: 'How to Place an Order', action: 'how_to_order' },
        { label: 'Browse Collections', action: 'filter_all' },
        { label: 'Size & Fit Guide', action: 'size_guide' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: RETURNS & REFUNDS ───────────────────────────────────────────
  if (classifiedIntent === 'returns_info') {
    const text =
      `**Returns & Refund Policy:**\n\n` +
      `In accordance with our published boutique policy, all sales and bespoke commissions are final once an order is placed and fabric is cut. We operate a strict **No Refund** policy.\n\n` +
      `**Complimentary Alterations Guarantee:**\n` +
      `Because we are dedicated to an exquisite fit, we offer a **complimentary fitting alteration service** at our Accra studio within **7 days** of garment delivery for any bespoke commission needing minor adjustments.\n\n` +
      `May I assist with sizing or measurement advice before you place an order?`;

    return {
      text,
      options: [
        { label: 'Size Chart & Lengths', action: 'size_guide' },
        { label: 'Find My Best Fit', action: 'sizing_path_select' },
        { label: 'Browse Collections', action: 'filter_all' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: EXCHANGES ───────────────────────────────────────────────────
  if (classifiedIntent === 'exchanges_info') {
    const text =
      `**Exchange Policy:**\n\n` +
      `Because each piece is custom-cut or tailored in limited artisan runs, we operate a strict **No Exchange** policy once an order has been confirmed.\n\n` +
      `If a garment does not fit as desired, our Accra atelier provides **complimentary fitting alterations within 7 days** of delivery.`;

    return {
      text,
      options: [
        { label: 'View Size Chart', action: 'open_size_chart' },
        { label: 'Find My Best Fit', action: 'sizing_path_select' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: ALTERATIONS ─────────────────────────────────────────────────
  if (classifiedIntent === 'alterations_info') {
    const text =
      `**Alterations Service:**\n\n` +
      `We provide a **complimentary fitting alteration service** at our Accra atelier within **7 days** of garment receipt.\n\n` +
      `If you need hem calibration, waist adjustments, or bespoke sizing, our master tailors will gladly make the adjustments. You can also specify custom measurements or hem lengths in your order notes at checkout.`;

    return {
      text,
      options: [
        { label: 'View Length Guide', action: 'size_guide' },
        { label: 'Find My Best Fit', action: 'sizing_path_select' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: CONTACT BOUTIQUE ────────────────────────────────────────────
  if (classifiedIntent === 'contact_boutique') {
    const text =
      `**Contact Nnepa Foriwaa:**\n\n` +
      `• **WhatsApp / Phone**: +233 53 879 5669\n` +
      `• **Email**: sales@nnepaforiwaa.com\n` +
      `• **Boutique Hours**: Monday – Saturday, 9:00 AM – 6:00 PM GMT\n` +
      `• **Private Studio Fittings**: Bookings available on our Contact page (#/contact) in Accra, Ghana.`;

    return {
      text,
      options: [
        { label: 'Open WhatsApp', action: 'contact_whatsapp' },
        { label: 'Book a Fitting', action: 'book_fitting' },
        { label: 'Return to Main Menu', action: 'main_menu' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: CATEGORY EXPLORATIONS ───────────────────────────────────────
  if (classifiedIntent === 'explore_women') {
    const womenProds = catalogue.filter((p) => p.category === 'women').slice(0, 3);
    const text = `Navigating you to our **Womenswear** collection, featuring silk-cotton boubous, handwoven Kente gowns, and structured peplum silhouettes.`;

    return {
      text,
      options: [
        { label: 'View All Womenswear', action: 'filter_women' },
        { label: 'Sizing & Length Guide', action: 'size_guide' }
      ],
      products: womenProds,
      intent: classifiedIntent,
      updatedContext
    };
  }

  if (classifiedIntent === 'explore_men') {
    const menProds = catalogue.filter((p) => p.category === 'men').slice(0, 3);
    const text = `Navigating you to our **Menswear** collection, featuring three-piece brocade Agbadas, Kente-yoke linen kaftans, and Northern Fugu smocks.`;

    return {
      text,
      options: [
        { label: 'View All Menswear', action: 'filter_men' },
        { label: 'Men’s Size Guide', action: 'size_guide' }
      ],
      products: menProds,
      intent: classifiedIntent,
      updatedContext
    };
  }

  if (classifiedIntent === 'explore_bags') {
    const bagProds = catalogue.filter((p) => p.category === 'bags').slice(0, 3);
    const text = `Navigating you to our **Bags & Accessories** collection, featuring hand-plaited Bolgatanga leather totes, brass Adinkra velvet clutches, and raffia shoulder pieces.`;

    return {
      text,
      options: [
        { label: 'View All Bags & Accessories', action: 'filter_bags' },
        { label: 'Explore Other Collections', action: 'explore_collections' }
      ],
      products: bagProds,
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: GREETING ────────────────────────────────────────────────────
  if (classifiedIntent === 'greeting') {
    const greetingText = profile.preferredName
      ? `Hello, ${profile.preferredName}! What can I help you find today?`
      : 'Hello! I’m NNEPA, your personal shopping assistant. It’s lovely to have you here. What would you like me to call you?';

    const greetingOptions = profile.preferredName
      ? [
          { label: 'Explore Collections', action: 'explore_collections' },
          { label: 'Find a Garment', action: 'find_product' },
          { label: 'Size & Length Guide', action: 'size_guide' }
        ]
      : [];

    return {
      text: greetingText,
      options: greetingOptions,
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: FAQ LOOKUP ──────────────────────────────────────────────────
  const matchingFaq = findMatchingFAQ(userInput);
  if (matchingFaq) {
    const options: ConciergeActionOption[] = [];
    if (matchingFaq.suggestedAction) {
      options.push(matchingFaq.suggestedAction);
    }
    options.push({ label: 'Main Menu', action: 'main_menu' });

    return {
      text: matchingFaq.answer,
      options,
      intent: `faq_${matchingFaq.category}`,
      updatedContext
    };
  }

  // ─── INTENT: CATALOGUE SEARCH ────────────────────────────────────────────
  const searchResults = searchCatalogueProducts(userInput, catalogue, 3);
  if (searchResults.length > 0) {
    return {
      text: `I discovered ${searchResults.length} piece${searchResults.length > 1 ? 's' : ''} in our boutique corresponding to your inquiry:`,
      options: [
        { label: 'View Complete Catalog', action: 'filter_all' },
        { label: 'Size Guide', action: 'size_guide' }
      ],
      products: searchResults,
      intent: 'catalogue_search',
      updatedContext
    };
  }

  // ─── STRICT POLITE FALLBACK ──────────────────────────────────────────────
  return {
    text: `${UNCONFIRMED_FALLBACK_TEXT}\n\nOur Accra atelier team is ready to assist you directly Monday through Saturday, 9:00 AM – 6:00 PM GMT.`,
    options: [
      { label: 'WhatsApp Boutique (+233 53 879 5669)', action: 'contact_whatsapp' },
      { label: 'Book a Fitting', action: 'book_fitting' },
      { label: 'Return to Main Menu', action: 'main_menu' }
    ],
    intent: 'unconfirmed_fallback',
    updatedContext
  };
}
