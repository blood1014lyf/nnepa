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
    norm.includes('place order')
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
        { label: '✨ View Suitable Garments', action: 'filter_all' },
        { label: '👗 Check Garment Fit', action: 'check_garment_fit' },
        { label: '📏 Size & Length Guide', action: 'size_guide' }
      ],
      intent: 'size_profile_completed',
      updatedContext
    };
  }

  // 2. Customer selects or triggers "Not sure" / Sizing Discovery Hub
  if (
    userInput === 'size_not_sure' ||
    userInput === 'sizing_path_select' ||
    norm === 'not sure' ||
    norm === 'i m not sure' ||
    norm === 'im not sure' ||
    norm === 'help me with my size'
  ) {
    profile.onboardingStage = 'sizing_path_select';

    const text =
      `No worries${customerName}! Let’s find your best fit. How would you prefer to do that?`;

    return {
      text,
      options: [
        { label: '1. I know my usual clothing size', action: 'sizing_path_usual' },
        { label: '2. I don’t know my measurements', action: 'sizing_path_guided' },
        { label: '3. Help me choose using clothes I already own', action: 'sizing_path_garment' }
      ],
      intent: 'sizing_discovery_hub',
      updatedContext
    };
  }

  // Path 1: Usual clothing size
  if (userInput === 'sizing_path_usual' || norm === 'usual size' || norm === 'i know my usual clothing size') {
    profile.onboardingStage = 'sizing_path_usual';

    const text =
      `What size do you usually wear in international clothing (US, UK, or EU)?`;

    return {
      text,
      options: [
        { label: 'US 0–2 · UK 4–6 (XS)', action: 'set_size_xs' },
        { label: 'US 4–6 · UK 8–10 (S)', action: 'set_size_s' },
        { label: 'US 8–10 · UK 12–14 (M)', action: 'set_size_m' },
        { label: 'US 12–14 · UK 16–18 (L)', action: 'set_size_l' },
        { label: 'US 16–18 · UK 20–22 (XL)', action: 'set_size_xl' },
        { label: 'US 20–22 · UK 24–26 (XXL)', action: 'set_size_xxl' },
        { label: '↩️ Choose another sizing method', action: 'sizing_path_select' }
      ],
      intent: 'sizing_path_usual_prompt',
      updatedContext
    };
  }

  // Path 2: Guided measurement flow
  if (
    userInput === 'sizing_path_guided' ||
    norm === 'i don t know my measurements' ||
    norm === 'guided measurement' ||
    norm === 'help me measure'
  ) {
    profile.onboardingStage = 'sizing_path_guided_unit';

    const text =
      `Would you prefer to enter your measurements in inches or centimetres?`;

    return {
      text,
      options: [
        { label: 'Inches', action: 'choose_unit_in' },
        { label: 'Centimetres', action: 'choose_unit_cm' },
        { label: "I don't have a measuring tape", action: 'sizing_no_tape' },
        { label: '↩️ Choose another sizing method', action: 'sizing_path_select' }
      ],
      intent: 'sizing_path_guided_unit_prompt',
      updatedContext
    };
  }

  // String / Ruler guidance for customers without measuring tape
  if (userInput === 'sizing_no_tape' || norm.includes('no measuring tape') || norm.includes('no tape')) {
    const text =
      `No measuring tape? You can easily use a household item like a phone charging cable, string, or ribbon:\n\n` +
      `• Wrap it gently around the area, pinch the mark with your fingers, and lay it flat against a standard 12-inch ruler or a phone measurement app.\n\n` +
      `Would you prefer to enter your measurements in inches or centimetres?`;

    return {
      text,
      options: [
        { label: 'Inches', action: 'choose_unit_in' },
        { label: 'Centimetres', action: 'choose_unit_cm' },
        { label: '↩️ Choose another sizing method', action: 'sizing_path_select' }
      ],
      intent: 'sizing_no_tape_guidance',
      updatedContext
    };
  }

  // Unit selection: Inches or Centimetres
  const isUnitIn =
    userInput === 'choose_unit_in' ||
    norm === 'inches' ||
    norm === 'inch' ||
    norm === 'in' ||
    norm === 'choose unit in';

  const isUnitCm =
    userInput === 'choose_unit_cm' ||
    norm === 'centimetres' ||
    norm === 'centimeters' ||
    norm === 'cm' ||
    norm === 'choose unit cm';

  if (isUnitIn || isUnitCm) {
    const unit = isUnitCm ? 'cm' : 'in';
    profile.preferredUnit = unit;
    profile.onboardingStage = 'sizing_assistant_bust';

    const isMen = updatedContext.activeCategory === 'men';
    const measurementName = isMen ? 'chest' : 'bust';
    const unitLabel = unit === 'in' ? 'inches' : 'cm';

    const text =
      `Understood, we’ll use ${unit === 'in' ? 'inches' : 'centimetres'}.\n\n` +
      `Step 1 of 3 — **${measurementName}** measurement:\n` +
      `Wrap your tape horizontally around the fullest part of your ${isMen ? 'chest' : 'bust'}, keeping the tape level across your shoulder blades.\n\n` +
      `What measurement did you get in ${unitLabel}?`;

    return {
      text,
      options: [
        { label: 'Skip this measurement', action: 'skip_bust' },
        { label: '↩️ Change unit', action: 'sizing_path_guided' }
      ],
      intent: 'sizing_assistant_bust_prompt',
      updatedContext
    };
  }

  // Measurement navigation: Skip bust
  if (userInput === 'skip_bust' || (profile.onboardingStage === 'sizing_assistant_bust' && norm === 'skip')) {
    profile.onboardingStage = 'sizing_assistant_waist';
    const unitLabel = profile.preferredUnit === 'in' ? 'inches' : 'cm';

    const text =
      `No problem, we can skip that.\n\n` +
      `Step 2 of 3 — Natural **waist** measurement:\n` +
      `Measure at the narrowest point of your torso, typically an inch above your navel, while breathing out naturally.\n\n` +
      `What is your waist measurement in ${unitLabel}?`;

    return {
      text,
      options: [
        { label: 'Skip this measurement', action: 'skip_waist' },
        { label: '✏️ Enter bust measurement', action: 'sizing_assistant_bust' }
      ],
      intent: 'sizing_assistant_waist_prompt',
      updatedContext
    };
  }

  // Measurement navigation: Skip waist
  if (userInput === 'skip_waist' || (profile.onboardingStage === 'sizing_assistant_waist' && norm === 'skip')) {
    profile.onboardingStage = 'sizing_assistant_hips';
    const unitLabel = profile.preferredUnit === 'in' ? 'inches' : 'cm';

    const text =
      `Step 3 of 3 — **Hip** measurement:\n` +
      `Stand with your feet together and measure around the fullest curve of your hips and bottom.\n\n` +
      `What is your hip measurement in ${unitLabel}?`;

    return {
      text,
      options: [
        { label: 'Skip this measurement', action: 'skip_hips' },
        { label: '✏️ Enter waist measurement', action: 'sizing_assistant_waist' }
      ],
      intent: 'sizing_assistant_hips_prompt',
      updatedContext
    };
  }

  // Measurement navigation: Corrections
  if (userInput === 'correct_to_bust' || userInput === 'sizing_assistant_bust') {
    profile.onboardingStage = 'sizing_assistant_bust';
    const isMen = updatedContext.activeCategory === 'men';
    const unitLabel = profile.preferredUnit === 'in' ? 'inches' : 'cm';

    return {
      text: `Let’s correct your **${isMen ? 'chest' : 'bust'}** measurement. What is your measurement in ${unitLabel}?`,
      options: [{ label: 'Skip this measurement', action: 'skip_bust' }],
      intent: 'sizing_assistant_bust_prompt',
      updatedContext
    };
  }

  if (userInput === 'correct_to_waist' || userInput === 'sizing_assistant_waist') {
    profile.onboardingStage = 'sizing_assistant_waist';
    const unitLabel = profile.preferredUnit === 'in' ? 'inches' : 'cm';

    return {
      text: `Let’s correct your natural **waist** measurement. What is your measurement in ${unitLabel}?`,
      options: [{ label: 'Skip this measurement', action: 'skip_waist' }],
      intent: 'sizing_assistant_waist_prompt',
      updatedContext
    };
  }

  // Path 3: Measure an existing garment
  if (
    userInput === 'sizing_path_garment' ||
    norm.includes('clothes i already own') ||
    norm.includes('existing garment') ||
    norm.includes('compare clothing')
  ) {
    profile.onboardingStage = 'sizing_path_garment_type';

    const text =
      `Using a favourite piece of clothing from your wardrobe is a wonderful way to find your fit!\n\n` +
      `Which type of garment would you like to compare?`;

    return {
      text,
      options: [
        { label: 'Dress or Gown', action: 'garment_type_dress' },
        { label: 'Top or Kaftan', action: 'garment_type_top' },
        { label: 'Pants or Trousers', action: 'garment_type_pants' },
        { label: '↩️ Choose another sizing method', action: 'sizing_path_select' }
      ],
      intent: 'sizing_path_garment_type_prompt',
      updatedContext
    };
  }

  if (userInput.startsWith('garment_type_') || userInput === 'garment_measure_flat') {
    const type = userInput.startsWith('garment_type_')
      ? (userInput.replace('garment_type_', '') as 'dress' | 'top' | 'pants')
      : 'dress';
    profile.garmentType = type;
    profile.onboardingStage = 'sizing_path_garment_measure';

    const text =
      `1. **Check the Tag**: Look at the label inside your garment. If you see an international size (e.g. US 8, UK 12, or EU 40), you can simply enter that size.\n` +
      `2. **Or Lay-Flat Measurement**: Lay the garment flat, buttoned or zipped. Measure across the chest from armpit to armpit and double the number for total chest circumference (e.g. 19 inches flat = 38 inches bust).\n\n` +
      `What tag size or flat measurement did you find?`;

    return {
      text,
      options: [
        { label: '↩️ Back to garment types', action: 'sizing_path_garment' },
        { label: '↩️ Choose another sizing method', action: 'sizing_path_select' }
      ],
      intent: 'sizing_path_garment_measure_prompt',
      updatedContext
    };
  }

  // Handle fit preference selection
  if (userInput === 'fit_closer' || userInput === 'fit_relaxed') {
    profile.fitPreference = userInput === 'fit_closer' ? 'closer' : 'relaxed';
    profile.onboardingStage = 'onboarded';

    const fitLabel = profile.fitPreference === 'closer' ? 'closer tailored fit' : 'relaxed, comfortable drape';
    const text =
      `Understood${customerName}. I have saved your preference for a **${fitLabel}** in Size ${profile.usualSize} to your session profile.\n\n` +
      `Where would you like to explore next?`;

    return {
      text,
      options: [
        { label: '✨ View Suitable Garments', action: 'filter_all' },
        { label: '👗 Find a Garment', action: 'find_product' },
        { label: '🛍️ Return to Collection', action: 'explore_collections' }
      ],
      intent: 'fit_preference_saved',
      updatedContext
    };
  }

  // Order confirmation
  if (userInput === 'confirm_add_to_cart') {
    if (activeProd) {
      profile.orderStage = 'added';
      const orderSize = profile.selectedSize || profile.usualSize || 'M';
      const orderColor = profile.selectedColor || prodKnowledge?.primaryColor || 'Signature Colourway';
      const orderQty = profile.selectedQuantity || 1;

      const text =
        `I’ve added the **${activeProd.name} (Size ${orderSize})** to your shopping bag!\n\n` +
        `• **Size**: ${orderSize}\n` +
        `• **Colour**: ${orderColor}\n` +
        `• **Quantity**: ${orderQty}\n` +
        `• **Total**: GH₵ ${(activeProd.price * orderQty).toLocaleString()}\n\n` +
        `You can proceed to checkout now to finalize your delivery coordinates. Our Accra atelier connects with you to confirm your measurements before cutting begins.`;

      return {
        text,
        options: [
          { label: '💳 Proceed to Checkout', action: 'go_to_checkout' },
          { label: '🛍️ View Shopping Bag', action: 'open_bag' },
          { label: '✨ Continue Shopping', action: 'explore_collections' }
        ],
        intent: 'order_added_to_cart',
        updatedContext
      };
    }
  }

  if (userInput === 'skip_onboarding') {
    profile.onboardingStage = 'onboarded';
    return {
      text: `Welcome${customerNameSalutation} to Nnepa Foriwaa. How may I guide your boutique experience today?`,
      options: [
        { label: '✨ Explore Collections', action: 'explore_collections' },
        { label: '👗 Find a Garment', action: 'find_product' },
        { label: '📏 Size & Length Guide', action: 'size_guide' }
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
    if (norm.includes('not sure') || norm.includes('help')) {
      profile.onboardingStage = 'sizing_path_select';

      const text = `No worries${customerName}! Let’s find your best fit. How would you prefer to do that?`;
      return {
        text,
        options: [
          { label: '1. I know my usual clothing size', action: 'sizing_path_usual' },
          { label: '2. I don’t know my measurements', action: 'sizing_path_guided' },
          { label: '3. Help me choose using clothes I already own', action: 'sizing_path_garment' }
        ],
        intent: 'sizing_discovery_hub',
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
          { label: '✨ View Suitable Garments', action: 'filter_all' },
          { label: '👗 Check Garment Fit', action: 'check_garment_fit' },
          { label: '📏 Size & Length Guide', action: 'size_guide' }
        ],
        intent: 'size_profile_completed',
        updatedContext
      };
    }
  }

  // 3. Stage: sizing_assistant_bust
  if (profile.onboardingStage === 'sizing_assistant_bust') {
    const isMen = updatedContext.activeCategory === 'men';
    const validation = validateMeasurementInput(userInput, isMen ? 'chest' : 'bust', profile.preferredUnit);

    if (!validation.isValid) {
      return {
        text: `${validation.errorMessage}\n\nWhat is your ${isMen ? 'chest' : 'bust'} measurement?`,
        options: [
          { label: 'Skip this measurement', action: 'skip_bust' },
          { label: '↩️ Change unit', action: 'sizing_path_guided' }
        ],
        intent: 'sizing_assistant_validation_error',
        updatedContext
      };
    }

    profile.preferredUnit = validation.unit;
    profile.measurements = {
      ...profile.measurements,
      bust: validation.value,
      chest: validation.value,
      unit: validation.unit
    };
    profile.onboardingStage = 'sizing_assistant_waist';
    const unitLabel = validation.unit === 'in' ? 'inches' : 'cm';

    const text =
      `Thank you${customerName}.\n\n` +
      `Step 2 of 3 — Natural **waist** measurement:\n` +
      `Measure at the narrowest point of your torso, typically an inch above your navel, while breathing out naturally.\n\n` +
      `What is your waist measurement in ${unitLabel}?`;

    return {
      text,
      options: [
        { label: 'Skip this measurement', action: 'skip_waist' },
        { label: '✏️ Correct bust measurement', action: 'correct_to_bust' }
      ],
      intent: 'sizing_assistant_waist_prompt',
      updatedContext
    };
  }

  // 4. Stage: sizing_assistant_waist
  if (profile.onboardingStage === 'sizing_assistant_waist') {
    const validation = validateMeasurementInput(userInput, 'waist', profile.preferredUnit);

    if (!validation.isValid) {
      return {
        text: `${validation.errorMessage}\n\nWhat is your natural waist measurement?`,
        options: [
          { label: 'Skip this measurement', action: 'skip_waist' },
          { label: '✏️ Correct bust measurement', action: 'correct_to_bust' }
        ],
        intent: 'sizing_assistant_validation_error',
        updatedContext
      };
    }

    profile.preferredUnit = validation.unit;
    if (profile.measurements) {
      profile.measurements.waist = validation.value;
    } else {
      profile.measurements = { waist: validation.value, unit: validation.unit };
    }
    profile.onboardingStage = 'sizing_assistant_hips';
    const unitLabel = validation.unit === 'in' ? 'inches' : 'cm';

    const isMen = updatedContext.activeCategory === 'men';
    if (isMen) {
      // For menswear, chest + waist completes the evaluation
      profile.onboardingStage = 'onboarded';
      const evalResult = evaluateSizing(profile.measurements, 'men');
      profile.usualSize = evalResult.recommendedSize;

      let text =
        `Here is your personalized sizing recommendation${customerName}:\n\n` +
        `• **Your Measurements**: ${evalResult.customerMeasurementsSummary}\n` +
        `• **Brand Size Chart**: Size ${evalResult.recommendedSize} (${evalResult.brandMeasurementsSummary})\n` +
        `• **Recommended Size**: Size ${evalResult.recommendedSize}\n\n` +
        `${evalResult.fitExplanation}\n\n`;

      if (evalResult.isBetweenSizes && evalResult.inquiryForFitPreference) {
        profile.onboardingStage = 'sizing_assistant_fit_preference';
        text += evalResult.inquiryForFitPreference;
        return {
          text,
          options: [
            { label: 'Closer fit', action: 'fit_closer' },
            { label: 'A little more room', action: 'fit_relaxed' },
            { label: '✏️ Correct a measurement', action: 'correct_to_bust' }
          ],
          intent: 'sizing_recommendation_between_sizes',
          updatedContext
        };
      }

      text += `I’ve saved Size ${evalResult.recommendedSize} to your session profile so we can check the fit of any garment as you browse.`;
      return {
        text,
        options: [
          { label: '✨ View Suitable Garments', action: 'filter_all' },
          { label: '👔 Menswear Pieces', action: 'filter_men' },
          { label: '📏 Check Another Size', action: 'sizing_path_select' }
        ],
        intent: 'sizing_recommendation_ready',
        updatedContext
      };
    }

    const text =
      `Thank you.\n\n` +
      `Step 3 of 3 — **Hip** measurement:\n` +
      `Stand with your feet together and measure around the fullest curve of your hips and bottom.\n\n` +
      `What is your hip measurement in ${unitLabel}?`;

    return {
      text,
      options: [
        { label: 'Skip this measurement', action: 'skip_hips' },
        { label: '✏️ Correct waist measurement', action: 'correct_to_waist' }
      ],
      intent: 'sizing_assistant_hips_prompt',
      updatedContext
    };
  }

  // 5. Stage: sizing_assistant_hips
  if (profile.onboardingStage === 'sizing_assistant_hips') {
    const isSkip = userInput === 'skip_hips' || norm === 'skip';
    let val: number | undefined = undefined;

    if (!isSkip) {
      const validation = validateMeasurementInput(userInput, 'hips', profile.preferredUnit);
      if (!validation.isValid) {
        return {
          text: `${validation.errorMessage}\n\nWhat is your hip measurement?`,
          options: [
            { label: 'Skip this measurement', action: 'skip_hips' },
            { label: '✏️ Correct waist measurement', action: 'correct_to_waist' }
          ],
          intent: 'sizing_assistant_validation_error',
          updatedContext
        };
      }
      val = validation.value;
      if (profile.measurements) {
        profile.measurements.hips = val;
      }
    }

    profile.onboardingStage = 'onboarded';
    const evalResult = evaluateSizing(profile.measurements || { hips: val, unit: profile.preferredUnit }, 'women');
    profile.usualSize = evalResult.recommendedSize;

    let text =
      `Here is your personalized sizing recommendation${customerName}:\n\n` +
      `• **Your Measurements**: ${evalResult.customerMeasurementsSummary}\n` +
      `• **Brand Size Chart**: Size ${evalResult.recommendedSize} (${evalResult.brandMeasurementsSummary})\n` +
      `• **Recommended Size**: Size ${evalResult.recommendedSize}\n\n` +
      `${evalResult.fitExplanation}\n\n`;

    if (evalResult.isBetweenSizes && evalResult.inquiryForFitPreference) {
      profile.onboardingStage = 'sizing_assistant_fit_preference';
      text += evalResult.inquiryForFitPreference;
      return {
        text,
        options: [
          { label: 'Closer fit', action: 'fit_closer' },
          { label: 'A little more room', action: 'fit_relaxed' },
          { label: '✏️ Correct a measurement', action: 'correct_to_bust' }
        ],
        intent: 'sizing_recommendation_between_sizes',
        updatedContext
      };
    }

    text += `I’ve saved Size ${evalResult.recommendedSize} to your session profile so we can check the fit of any garment as you browse.`;
    return {
      text,
      options: [
        { label: '✨ View Suitable Garments', action: 'filter_all' },
        { label: '👗 Find a Product', action: 'find_product' },
        { label: '📏 Check Another Size', action: 'sizing_path_select' },
        { label: '🛍️ Return to Collection', action: 'explore_collections' }
      ],
      intent: 'sizing_recommendation_ready',
      updatedContext
    };
  }

  // 6. Stage: sizing_path_garment_measure
  if (profile.onboardingStage === 'sizing_path_garment_measure') {
    // Check if tag size was mentioned (e.g. US 8, UK 12, size M)
    const tagSize = parseRequestedSizeFromText(userInput, updatedContext.activeCategory ?? 'women');
    if (tagSize) {
      profile.usualSize = tagSize.alpha;
      profile.onboardingStage = 'onboarded';

      const spec = getSizeSpecificationSummary(tagSize.alpha, updatedContext.activeCategory ?? 'women');
      const text =
        `That tag corresponds directly with our **Size ${tagSize.alpha}**!\n\n` +
        (spec ? `• ${spec}\n\n` : '') +
        `Our garments are tailored true to international proportions with comfortable ease. I’ve saved Size ${tagSize.alpha} to your session profile so you can check the fit of any garment as you browse.`;

      return {
        text,
        options: [
          { label: '✨ View Suitable Garments', action: 'filter_all' },
          { label: '👗 Check Garment Fit', action: 'check_garment_fit' },
          { label: '🛍️ Return to Collection', action: 'explore_collections' }
        ],
        intent: 'garment_size_matched',
        updatedContext
      };
    }

    // Check if flat measurement was entered
    const numMatch = userInput.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (numMatch) {
      let val = parseFloat(numMatch[1]);
      if (norm.includes('flat') || norm.includes('across') || val < 28) {
        val = val * 2; // double flat measure to circumference
      }

      const evalResult = evaluateSizing({ bust: val, chest: val, unit: profile.preferredUnit }, 'women');
      profile.usualSize = evalResult.recommendedSize;
      profile.onboardingStage = 'onboarded';

      const text =
        `A ${Math.round(val)}" garment chest corresponds to our **Size ${evalResult.recommendedSize}** (${evalResult.brandMeasurementsSummary}).\n\n` +
        `Since our boubous and gowns include tailored ease for effortless drape, Size ${evalResult.recommendedSize} will match the comfort of your existing piece.\n\n` +
        `I’ve saved Size ${evalResult.recommendedSize} to your session profile.`;

      return {
        text,
        options: [
          { label: '✨ View Suitable Garments', action: 'filter_all' },
          { label: '👗 Check Garment Fit', action: 'check_garment_fit' },
          { label: '🛍️ Return to Collection', action: 'explore_collections' }
        ],
        intent: 'garment_measurement_evaluated',
        updatedContext
      };
    }
  }

  // ─── INTENT: SIZING HELP / NOT SURE ──────────────────────────────────────
  if (classifiedIntent === 'sizing_help') {
    profile.onboardingStage = 'sizing_path_select';
    const text = `No worries${customerName}! Let’s find your best fit. How would you prefer to do that?`;

    return {
      text,
      options: [
        { label: '1. I know my usual clothing size', action: 'sizing_path_usual' },
        { label: '2. I don’t know my measurements', action: 'sizing_path_guided' },
        { label: '3. Help me choose using clothes I already own', action: 'sizing_path_garment' }
      ],
      intent: 'sizing_discovery_hub',
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
          : 'a tailored, sculpted silhouette structured to flatter your natural form';

        const text =
          `Yes${customerName}. Based on your profile (**Size ${size}**), the **${prodKnowledge.name}** in size ${size} is tailored with:\n\n` +
          (spec ? `• ${spec}\n\n` : '') +
          `This piece features ${silhouette}. Every garment is individually hand-tailored in our Accra atelier, and we provide complimentary alterations within 7 days of delivery should you desire minor adjustments.\n\n` +
          `Would you like me to help you complete your order for this piece?`;

        return {
          text,
          options: [
            { label: `🛍️ Help Me Order in Size ${size}`, action: 'order_assistance' },
            { label: '📏 Open Full Size Chart', action: 'open_size_chart' },
            { label: '✨ Explore Other Pieces', action: 'explore_collections' }
          ],
          products: [prodKnowledge.product],
          intent: 'garment_fit_profile_evaluated',
          updatedContext
        };
      } else {
        const text =
          `I would be delighted to check the fit for the **${prodKnowledge.name}**${customerName}. How would you like to determine your size?`;

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
          { label: '👗 Browse Womenswear', action: 'filter_women' },
          { label: '👔 Browse Menswear', action: 'filter_men' }
        ],
        products: catalogue.slice(0, 3),
        intent: 'garment_fit_choose_product',
        updatedContext
      };
    }
  }

  // ─── INTENT: ORDER ASSISTANCE FLOW ───────────────────────────────────────
  if (classifiedIntent === 'order_assistance') {
    if (prodKnowledge) {
      profile.selectedProduct = prodKnowledge.product;
      profile.selectedSize = profile.usualSize || 'M';
      profile.selectedColor = prodKnowledge.primaryColor || 'Signature Colourway';
      profile.selectedQuantity = 1;
      profile.orderStage = 'summary_ready';

      const price = prodKnowledge.product.price;
      const text =
        `Wonderful${customerName}. Would you like me to help you complete your order for the **${prodKnowledge.name}**?\n\n` +
        `Here are the confirmed details for your piece:\n` +
        `• **Garment**: ${prodKnowledge.name}\n` +
        `• **Colour**: ${profile.selectedColor}\n` +
        `• **Size**: Size ${profile.selectedSize} (pre-selected from your profile)\n` +
        `• **Quantity**: 1 piece\n` +
        `• **Total Price**: GH₵ ${price.toLocaleString()}\n\n` +
        `All garments are tailored in Accra in 3–7 working days with complimentary alterations.\n\n` +
        `Would you like me to add this directly to your shopping bag?`;

      return {
        text,
        options: [
          { label: '🛍️ Add to Bag & Proceed', action: 'confirm_add_to_cart' },
          { label: '📏 Change Size', action: 'size_guide' },
          { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' }
        ],
        products: [prodKnowledge.product],
        intent: 'order_assistance_summary',
        updatedContext
      };
    } else {
      return {
        text: `Which piece from our boutique would you like to order today${customerName}?`,
        options: [
          { label: '👗 Browse Collections', action: 'filter_all' },
          { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' }
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
          { label: '📏 Size Guide', action: 'size_guide' }
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
        `This price reflects authentic West African handwoven craftsmanship and tailored construction in our Accra atelier.`;

      return {
        text,
        options: [
          { label: `🛍️ Order ${prodKnowledge.name}`, action: 'order_assistance' },
          { label: '📏 Size & Fit', action: 'size_guide' },
          { label: '📦 Delivery Rates', action: 'delivery_info' }
        ],
        products: [prodKnowledge.product],
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: `Which garment would you like the price for${customerName}? Please share the name or select from our curated pieces below:`,
        options: [
          { label: '👗 Browse Women’s Pieces', action: 'filter_women' },
          { label: '👔 Browse Men’s Pieces', action: 'filter_men' }
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
              { label: `🛍️ Order in Size ${requestedSize.alpha}`, action: 'order_assistance' },
              { label: '📏 Open Size Chart', action: 'open_size_chart' },
              { label: '✨ Explore Other Pieces', action: 'explore_collections' }
            ],
            products: [prodKnowledge.product],
            intent: classifiedIntent,
            updatedContext
          };
        } else {
          const text =
            `The **${prodKnowledge.name}** is currently offered in sizes: **${prodKnowledge.availableSizes.join(', ')}**.\n\n` +
            `Size ${requestedSize.alpha} is not listed in standard ready-to-wear for this piece, but our Accra atelier can tailor bespoke dimensions to your exact measurements.`;

          return {
            text,
            options: [
              { label: '📏 View Full Size Chart', action: 'open_size_chart' },
              { label: '✨ Explore Available Pieces', action: 'explore_collections' }
            ],
            products: [prodKnowledge.product],
            intent: classifiedIntent,
            updatedContext
          };
        }
      } else {
        const text =
          `The **${prodKnowledge.name}** is available in sizes: **${prodKnowledge.availableSizes.join(', ')}**.\n\n` +
          `Our garments are calibrated to international sizing standards (US, UK, and EU). Would you like to check specific body measurements on our Size Chart?`;

        return {
          text,
          options: [
            { label: '📏 Open Size Chart', action: 'open_size_chart' },
            { label: `🛍️ Order ${prodKnowledge.name}`, action: 'order_assistance' },
            { label: '✨ Explore Collection', action: 'explore_collections' }
          ],
          products: [prodKnowledge.product],
          intent: classifiedIntent,
          updatedContext
        };
      }
    } else {
      const generalSizeNote = requestedSize
        ? `Most Nnepa Foriwaa garments are tailored across standard sizes S through XXL, including Size ${requestedSize.alpha}.`
        : 'Our ready-to-wear collections are tailored in sizes S through XXL, alongside One Size handcrafted bags.';

      return {
        text: `${generalSizeNote} Which piece would you like me to check availability for${customerName}?`,
        options: [
          { label: '👗 View Women’s Garments', action: 'filter_women' },
          { label: '👔 View Men’s Garments', action: 'filter_men' },
          { label: '📏 View Full Size Chart', action: 'open_size_chart' }
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
      const primary = prodKnowledge.primaryColor ? `shown in **${prodKnowledge.primaryColor}**` : 'shown online';
      const count = prodKnowledge.publishedColorCount;
      const countNote = count && count > 1
        ? `This piece is cut in **${count} colourways**.`
        : 'This piece is featured in its primary signature colourway.';

      const text =
        `The **${prodKnowledge.name}** is ${primary}. ${countNote}\n\n` +
        `Our handwoven textiles and wax-prints are crafted in limited artisan runs. Custom colourways and bespoke textile swatches can be requested directly via our atelier team on WhatsApp (+233 53 879 5669).`;

      return {
        text,
        options: [
          { label: `🛍️ Order ${prodKnowledge.name}`, action: 'order_assistance' },
          { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' },
          { label: '✨ Explore Other Pieces', action: 'explore_collections' },
          { label: '📏 Size & Fit Advice', action: 'check_garment_fit' }
        ],
        products: [prodKnowledge.product],
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: `Many of our signature boubous, kaftans, and gowns are produced in limited palette variations. Which piece would you like to explore alternative colours for${customerName}?`,
        options: [
          { label: '👗 Browse Collection', action: 'filter_all' },
          { label: '✨ Explore New Arrivals', action: 'explore_collections' }
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
          { label: `🛍️ Order ${prodKnowledge.name}`, action: 'order_assistance' },
          { label: '📏 Size & Length Guide', action: 'size_guide' },
          { label: '✨ Explore Other Pieces', action: 'explore_collections' }
        ],
        products: [prodKnowledge.product],
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: 'We craft using authentic West African heritage textiles: handwoven Asante silk Kente, fine Northern Fugu strip-woven cotton, hand-loomed Nigerian Aso-Oke, damask brocade, washed linen, and breathable silk-cotton blends. Which garment would you like material details on?',
        options: [
          { label: '👗 Explore Womenswear', action: 'filter_women' },
          { label: '👔 Explore Menswear', action: 'filter_men' }
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
          { label: '✨ Main Menu', action: 'main_menu' }
        ],
        intent: classifiedIntent,
        updatedContext
      };
    }
    const pieceName = prodKnowledge ? ` for the **${prodKnowledge.name}**` : '';
    const text =
      `Because our garments incorporate delicate handwoven Kente, metallic brocade, and hand-dyed West African textiles, specialist dry cleaning is strongly recommended${pieceName} to preserve its structure and lustre.`;

    return {
      text,
      options: [
        { label: '📏 Size Guide', action: 'size_guide' },
        { label: '✨ Main Menu', action: 'main_menu' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: SIMILAR PRODUCTS ────────────────────────────────────────────
  if (classifiedIntent === 'similar_products') {
    if (activeProd) {
      const similar = getSimilarProducts(activeProd, catalogue, 3);
      const text = `Here are curated pieces with similar craftsmanship and aesthetic to the **${activeProd.name}**:`;

      return {
        text,
        options: [
          { label: '👗 View Complete Catalog', action: 'filter_all' },
          { label: '📏 Size Guide', action: 'size_guide' }
        ],
        products: similar,
        intent: classifiedIntent,
        updatedContext
      };
    } else {
      return {
        text: `I’d be delighted to recommend pieces${customerName}. Are you looking for womenswear, menswear, or handcrafted accessories?`,
        options: [
          { label: '👗 Womenswear', action: 'filter_women' },
          { label: '👔 Menswear', action: 'filter_men' },
          { label: '👜 Bags & Accessories', action: 'filter_bags' }
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
        { label: '📐 Open Full Size Chart', action: 'open_size_chart' },
        { label: '📏 Find My Best Fit', action: 'sizing_path_select' },
        { label: '🛍️ Return to Shopping', action: 'filter_all' }
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
      `3. **Add to Bag**: Click "Add to Bag" (or use "Place order via WhatsApp" on the product page for instant concierge service).\n` +
      `4. **Checkout**: Proceed to checkout (#/checkout) and enter your contact and delivery coordinates.\n` +
      `5. **Order Confirmation**: Placing your order registers your garment specifications with our Accra boutique. No credit card is charged immediately online; our team connects with you on WhatsApp with your Order Number to confirm measurements and finalize delivery scheduling.\n\n` +
      `Would you like me to guide your order for a specific piece?`;

    return {
      text,
      options: [
        { label: '🛍️ Open Shopping Bag', action: 'open_bag' },
        { label: '👗 Browse Collections', action: 'filter_all' },
        { label: '📏 Size & Fit Guide', action: 'size_guide' }
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
        { label: '🛍️ How to Order', action: 'how_to_order' },
        { label: '📦 Delivery Rates', action: 'delivery_info' },
        { label: '✨ Explore Collection', action: 'explore_collections' }
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
        { label: '🛍️ How to Place an Order', action: 'how_to_order' },
        { label: '👗 Browse Collections', action: 'filter_all' },
        { label: '📏 Size & Fit Guide', action: 'size_guide' }
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
        { label: '📏 Size Chart & Lengths', action: 'size_guide' },
        { label: '📏 Find My Best Fit', action: 'sizing_path_select' },
        { label: '🛍️ Browse Collections', action: 'filter_all' }
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
        { label: '📏 View Size Chart', action: 'open_size_chart' },
        { label: '📏 Find My Best Fit', action: 'sizing_path_select' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: ALTERATIONS ─────────────────────────────────────────────────
  if (classifiedIntent === 'alterations_info') {
    const text =
      `**Bespoke Alterations Service:**\n\n` +
      `We provide a **complimentary fitting alteration service** at our Accra atelier within **7 days** of garment receipt.\n\n` +
      `If you need hem calibration, waist adjustments, or bespoke sizing, our master tailors will gladly make the adjustments. You can also specify custom measurements or hem lengths in your order notes at checkout.`;

    return {
      text,
      options: [
        { label: '📏 View Length Guide', action: 'size_guide' },
        { label: '📏 Find My Best Fit', action: 'sizing_path_select' }
      ],
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: CONTACT BOUTIQUE ────────────────────────────────────────────
  if (classifiedIntent === 'contact_boutique') {
    const text =
      `**Connect with Nnepa Foriwaa Concierge:**\n\n` +
      `• **WhatsApp / Phone**: +233 53 879 5669\n` +
      `• **Email**: sales@nnepaforiwaa.com\n` +
      `• **Boutique Hours**: Monday – Saturday, 9:00 AM – 6:00 PM GMT\n` +
      `• **Private Studio Fittings**: Bookings available on our Contact page (#/contact) in Accra, Ghana.`;

    return {
      text,
      options: [
        { label: '💬 Open WhatsApp', action: 'contact_whatsapp' },
        { label: '📅 Book a Fitting', action: 'book_fitting' },
        { label: '✨ Return to Main Menu', action: 'main_menu' }
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
        { label: '👗 View All Womenswear', action: 'filter_women' },
        { label: '📏 Sizing & Length Guide', action: 'size_guide' }
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
        { label: '👔 View All Menswear', action: 'filter_men' },
        { label: '📏 Men’s Size Guide', action: 'size_guide' }
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
        { label: '👜 View All Bags & Accessories', action: 'filter_bags' },
        { label: '✨ Explore Other Collections', action: 'explore_collections' }
      ],
      products: bagProds,
      intent: classifiedIntent,
      updatedContext
    };
  }

  // ─── INTENT: GREETING ────────────────────────────────────────────────────
  if (classifiedIntent === 'greeting') {
    const greetingText = profile.preferredName
      ? `Warm greetings, ${profile.preferredName}. It’s lovely to have you here at Nnepa Foriwaa. How may I guide your boutique experience today?`
      : 'Hello! I’m NNEPA, your personal shopping assistant. It’s lovely to have you here. What would you like me to call you?';

    const greetingOptions = profile.preferredName
      ? [
          { label: '✨ Explore Collections', action: 'explore_collections' },
          { label: '👗 Find a Garment', action: 'find_product' },
          { label: '📏 Size & Length Guide', action: 'size_guide' }
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
    options.push({ label: '✨ Main Menu', action: 'main_menu' });

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
        { label: '👗 View Complete Catalog', action: 'filter_all' },
        { label: '📏 Size Guide', action: 'size_guide' }
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
      { label: '💬 WhatsApp Boutique (+233 53 879 5669)', action: 'contact_whatsapp' },
      { label: '📅 Book a Fitting', action: 'book_fitting' },
      { label: '✨ Return to Main Menu', action: 'main_menu' }
    ],
    intent: 'unconfirmed_fallback',
    updatedContext
  };
}
