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

export interface ConversationContext {
  focusedProduct: Product | null;
  comparedProducts: Product[];
  lastIntent: string | null;
  activeCategory: 'women' | 'men' | 'bags' | 'all' | null;
  turnCount: number;
}

export function createInitialConciergeContext(initialProduct: Product | null = null): ConversationContext {
  return {
    focusedProduct: initialProduct,
    comparedProducts: [],
    lastIntent: null,
    activeCategory: initialProduct?.category ?? null,
    turnCount: 0
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
    // Check if phrase occurs as a substring or bounded match
    if (normalized.includes(pNorm)) {
      return true;
    }
  }
  return false;
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

  // 7. Specific size availability inquiry (e.g. "Do you have this in medium?")
  if (matchesAny(norm, SYNONYM_DICTIONARIES.sizeAvailable)) {
    return 'size_availability';
  }

  // 8. Size chart / measurements inquiry
  if (matchesAny(norm, SYNONYM_DICTIONARIES.sizeChart)) {
    return 'size_chart_info';
  }

  // 9. Alterations
  if (matchesAny(norm, SYNONYM_DICTIONARIES.alterations)) {
    return 'alterations_info';
  }

  // 10. Ordering
  if (matchesAny(norm, SYNONYM_DICTIONARIES.order)) {
    return 'how_to_order';
  }

  // 11. Payment
  if (matchesAny(norm, SYNONYM_DICTIONARIES.payment)) {
    return 'payment_info';
  }

  // 12. Delivery
  if (matchesAny(norm, SYNONYM_DICTIONARIES.delivery)) {
    return 'delivery_info';
  }

  // 13. Returns / Refunds
  if (matchesAny(norm, SYNONYM_DICTIONARIES.returns)) {
    return 'returns_info';
  }

  // 14. Exchanges
  if (matchesAny(norm, SYNONYM_DICTIONARIES.exchanges)) {
    return 'exchanges_info';
  }

  // 15. Contact / Boutique support
  if (matchesAny(norm, SYNONYM_DICTIONARIES.contact)) {
    return 'contact_boutique';
  }

  // 16. Greeting
  if (matchesAny(norm, SYNONYM_DICTIONARIES.greeting) && norm.split(' ').length <= 3) {
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
 * Main engine processing function: takes user query, current context, and live catalogue.
 * Returns structured conversational response, navigation/action options, and updated context.
 */
export function processConciergeMessage(
  userInput: string,
  context: ConversationContext,
  catalogue: Product[]
): ConciergeTurnResponse {
  const norm = normalizeQuery(userInput);
  const updatedContext: ConversationContext = {
    ...context,
    turnCount: context.turnCount + 1
  };

  // ─── CONTEXT RESOLUTION ──────────────────────────────────────────────────
  // Check if a specific product in the catalogue was mentioned in the user message
  const mentionedProduct = findProductMentionedInText(userInput, catalogue);
  if (mentionedProduct) {
    updatedContext.focusedProduct = mentionedProduct;
    updatedContext.activeCategory = mentionedProduct.category;
  }

  // Fallback to currently focused product from previous turn if no new product was mentioned
  const activeProd = updatedContext.focusedProduct;
  const prodKnowledge = activeProd ? buildProductKnowledge(activeProd) : null;

  // ─── INTENT CLASSIFICATION ───────────────────────────────────────────────
  const intent = classifyCustomerIntent(userInput, updatedContext);
  updatedContext.lastIntent = intent;

  // Default actions present across many turns
  const defaultActions: ConciergeActionOption[] = [
    { label: '✨ Explore Collections', action: 'explore_collections' },
    { label: '📏 Size & Length Guide', action: 'size_guide' },
    { label: '💬 WhatsApp Concierge', action: 'contact_whatsapp' }
  ];

  // ─── INTENT HANDLERS ─────────────────────────────────────────────────────

  // 1. COMPARISON
  if (intent === 'compare_products') {
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
        intent,
        updatedContext
      };
    }
  }

  // 2. PRODUCT PRICE INQUIRY
  if (intent === 'product_price') {
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
          { label: `🛍️ Order ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
          { label: '📏 Size & Fit', action: 'size_guide' },
          { label: '📦 Delivery Rates', action: 'delivery_info' }
        ],
        products: [prodKnowledge.product],
        intent,
        updatedContext
      };
    } else {
      // Prompt user to select or name a garment
      return {
        text: 'Which garment would you like the price for? Please share the name or select from our curated pieces below:',
        options: [
          { label: '👗 Browse Women’s Pieces', action: 'filter_women' },
          { label: '👔 Browse Men’s Pieces', action: 'filter_men' }
        ],
        products: catalogue.slice(0, 3),
        intent,
        updatedContext
      };
    }
  }

  // 3. SIZE AVAILABILITY (e.g. "Do you have this in medium?", "Is a medium available?", "Can I get this in size M?")
  if (intent === 'size_availability') {
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
              { label: `View ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
              { label: '📏 Open Size Chart', action: 'open_size_chart' },
              { label: '💬 Send Measurements on WhatsApp', action: 'contact_whatsapp' }
            ],
            products: [prodKnowledge.product],
            intent,
            updatedContext
          };
        } else {
          const text =
            `The **${prodKnowledge.name}** is currently offered in sizes: **${prodKnowledge.availableSizes.join(', ')}**.\n\n` +
            `Size ${requestedSize.alpha} is not listed in standard ready-to-wear for this piece, but our Accra atelier can tailor bespoke dimensions to your exact measurements.`;

          return {
            text,
            options: [
              { label: '💬 Inquire on WhatsApp', action: 'contact_whatsapp' },
              { label: '📏 View Full Size Chart', action: 'open_size_chart' }
            ],
            products: [prodKnowledge.product],
            intent,
            updatedContext
          };
        }
      } else {
        // Did not specify a single size, list all available
        const text =
          `The **${prodKnowledge.name}** is available in sizes: **${prodKnowledge.availableSizes.join(', ')}**.\n\n` +
          `Our garments are calibrated to international sizing standards (US, UK, and EU). Would you like to check specific body measurements on our Size Chart?`;

        return {
          text,
          options: [
            { label: '📏 Open Size Chart', action: 'open_size_chart' },
            { label: `View ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
            { label: '💬 WhatsApp Atelier', action: 'contact_whatsapp' }
          ],
          products: [prodKnowledge.product],
          intent,
          updatedContext
        };
      }
    } else {
      // No active product
      const generalSizeNote = requestedSize
        ? `Most Nnepa Foriwaa garments are tailored across standard sizes S through XXL, including Size ${requestedSize.alpha}.`
        : 'Our ready-to-wear collections are tailored in sizes S through XXL, alongside One Size handcrafted bags.';

      return {
        text: `${generalSizeNote} Which piece would you like me to check availability for?`,
        options: [
          { label: '👗 View Women’s Garments', action: 'filter_women' },
          { label: '👔 View Men’s Garments', action: 'filter_men' },
          { label: '📏 View Full Size Chart', action: 'open_size_chart' }
        ],
        products: catalogue.slice(0, 3),
        intent,
        updatedContext
      };
    }
  }

  // 4. ANOTHER COLOUR INQUIRY
  if (intent === 'product_color') {
    if (prodKnowledge) {
      const primary = prodKnowledge.primaryColor ? `shown in **${prodKnowledge.primaryColor}**` : 'shown online';
      const count = prodKnowledge.publishedColorCount;
      const countNote = count && count > 1
        ? `This piece is cut in **${count} colourways**.`
        : 'This piece is featured in its primary signature colourway.';

      const text =
        `The **${prodKnowledge.name}** is ${primary}. ${countNote}\n\n` +
        `Because our handwoven textiles and wax-prints are crafted in limited artisan runs, please reach out to our boutique on WhatsApp (+233 53 879 5669) to view current textile swatches and alternate shade availability.`;

      return {
        text,
        options: [
          { label: '💬 WhatsApp Colour Swatches', action: 'contact_whatsapp' },
          { label: `View ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
          { label: '✨ Explore Other Pieces', action: 'explore_collections' }
        ],
        products: [prodKnowledge.product],
        intent,
        updatedContext
      };
    } else {
      return {
        text:
          'Many of our signature boubous, kaftans, and gowns are produced in limited palette variations. Which piece would you like to explore alternative colours for?',
        options: [
          { label: '👗 Browse Collection', action: 'filter_all' },
          { label: '💬 Ask Atelier on WhatsApp', action: 'contact_whatsapp' }
        ],
        products: catalogue.slice(0, 3),
        intent,
        updatedContext
      };
    }
  }

  // 5. PRODUCT MATERIAL INQUIRY
  if (intent === 'product_material') {
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
          { label: `View ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
          { label: '📏 Size & Length Guide', action: 'size_guide' },
          { label: '💬 Inquire with Atelier', action: 'contact_whatsapp' }
        ],
        products: [prodKnowledge.product],
        intent,
        updatedContext
      };
    } else {
      return {
        text:
          'We craft using authentic West African heritage textiles: handwoven Asante silk Kente, fine Northern Fugu strip-woven cotton, hand-loomed Nigerian Aso-Oke, damask brocade, washed linen, and breathable silk-cotton blends. Which garment would you like material details on?',
        options: [
          { label: '👗 Explore Womenswear', action: 'filter_women' },
          { label: '👔 Explore Menswear', action: 'filter_men' }
        ],
        products: catalogue.slice(0, 3),
        intent,
        updatedContext
      };
    }
  }

  // 6. CARE INSTRUCTIONS
  if (intent === 'product_care') {
    if (prodKnowledge?.careInstructions) {
      return {
        text: `**Care Instructions for ${prodKnowledge.name}:**\n${prodKnowledge.careInstructions}`,
        options: [
          { label: `View ${prodKnowledge.name}`, action: 'navigate_product', payload: prodKnowledge.product },
          { label: '💬 WhatsApp Concierge', action: 'contact_whatsapp' }
        ],
        intent,
        updatedContext
      };
    }
    // Honest published advice: delicate handwoven textiles need specialist dry clean
    const pieceName = prodKnowledge ? ` for the **${prodKnowledge.name}**` : '';
    const text =
      `Because our garments incorporate delicate handwoven Kente, metallic brocade, and hand-dyed West African textiles, specialist dry cleaning is strongly recommended${pieceName} to preserve its structure and lustre.\n\n` +
      `For specific garment care confirmation, please feel free to ask our atelier team directly.`;

    return {
      text,
      options: [
        { label: '💬 WhatsApp Atelier', action: 'contact_whatsapp' },
        { label: '✨ Main Menu', action: 'main_menu' }
      ],
      intent,
      updatedContext
    };
  }

  // 7. SIMILAR PIECES INQUIRY
  if (intent === 'similar_products') {
    if (activeProd) {
      const similar = getSimilarProducts(activeProd, catalogue, 3);
      const text =
        `Here are curated pieces with similar craftsmanship and aesthetic to the **${activeProd.name}**:`;

      return {
        text,
        options: [
          { label: '👗 View Complete Catalog', action: 'filter_all' },
          { label: '📏 Size Guide', action: 'size_guide' }
        ],
        products: similar,
        intent,
        updatedContext
      };
    } else {
      return {
        text: 'I’d be delighted to recommend pieces. Are you looking for womenswear, menswear, or handcrafted accessories?',
        options: [
          { label: '👗 Womenswear', action: 'filter_women' },
          { label: '👔 Menswear', action: 'filter_men' },
          { label: '👜 Bags & Accessories', action: 'filter_bags' }
        ],
        products: catalogue.slice(0, 3),
        intent,
        updatedContext
      };
    }
  }

  // 8. SIZE CHART & LENGTH GUIDE
  if (intent === 'size_chart_info') {
    const text =
      `All Nnepa Foriwaa garments are tailored to verified international proportions (US, UK, and EU):\n\n` +
      `• **Dresses & Gowns**: Mini (34–36"), Knee (39–42"), Midi (45–49"), and Floor Gown/Boubou (55–60").\n` +
      `• **Pants & Trousers**: Inseam (27–35") and Outseam (37–45") calibrated for clean breaks.\n` +
      `• **Custom Calibrations**: Complimentary hem adjustments (Petite under 5'3" or Tall 5'8"+) can be requested in your checkout notes.\n\n` +
      `Would you like to open the interactive Size Chart?`;

    return {
      text,
      options: [
        { label: '📐 Open Full Size Chart', action: 'open_size_chart' },
        { label: '💬 Send Measurements on WhatsApp', action: 'contact_whatsapp' },
        { label: '🛍️ Return to Shopping', action: 'filter_all' }
      ],
      intent,
      updatedContext
    };
  }

  // 9. HOW TO ORDER
  if (intent === 'how_to_order') {
    const text =
      `**How to Place an Order at Nnepa Foriwaa:**\n\n` +
      `1. **Select Your Piece**: Choose your garment from our collections.\n` +
      `2. **Choose Your Size**: Select your standard size (S–XXL) or reference our Size Chart.\n` +
      `3. **Add to Bag**: Click "Add to Bag" (or use "Place order via WhatsApp" on the product page for instant concierge service).\n` +
      `4. **Checkout**: Proceed to checkout (#/checkout) and enter your contact and delivery coordinates.\n` +
      `5. **Order Confirmation**: Placing your order registers your garment specifications with our Accra boutique. No credit card is charged immediately online; our team connects with you on WhatsApp with your Order Number to confirm measurements and finalize delivery scheduling.`;

    return {
      text,
      options: [
        { label: '🛍️ Open Shopping Bag', action: 'open_bag' },
        { label: '👗 Browse Collections', action: 'filter_all' },
        { label: '💬 Order via WhatsApp', action: 'contact_whatsapp' }
      ],
      intent,
      updatedContext
    };
  }

  // 10. PAYMENT INQUIRY
  if (intent === 'payment_info') {
    const text =
      `**Payment Information:**\n\n` +
      `• **Online Checkout**: No immediate payment is charged at checkout on our website. Submitting your order registers your garment specifications with our Accra boutique.\n` +
      `• **Confirmation & Payment**: Our team connects directly with you via WhatsApp with your private Order Number to confirm measurements and provide payment details (such as Ghana Mobile Money / MoMo or boutique arrangement) before cutting begins.\n` +
      `• **Currency**: All website prices are listed in Ghanaian Cedis (GH₵).`;

    return {
      text,
      options: [
        { label: '🛍️ How to Order', action: 'how_to_order' },
        { label: '💬 WhatsApp Concierge', action: 'contact_whatsapp' }
      ],
      intent,
      updatedContext
    };
  }

  // 11. DELIVERY INQUIRY
  if (intent === 'delivery_info') {
    const text =
      `**Delivery & Shipping Overview:**\n\n` +
      `• **Tailoring Turnaround**: Handcrafted tailoring takes **3 to 7 working days** in our Accra atelier before dispatch.\n` +
      `• **Accra & Greater Accra**: Complimentary delivery on orders of **GH₵ 1,000+**; standard fee of **GH₵ 45** for smaller orders (1–2 business days transit).\n` +
      `• **Regional Ghana**: Trusted domestic couriers to Kumasi, Takoradi, Cape Coast, Tamale, and other regions (2–3 business days transit).\n` +
      `• **International**: Worldwide door-to-door delivery via **DHL Express** (3–7 business days transit with full tracking).`;

    return {
      text,
      options: [
        { label: '📦 How to Track Order', action: 'track_order' },
        { label: '🛍️ How to Place an Order', action: 'how_to_order' },
        { label: '💬 Inquire with Atelier', action: 'contact_whatsapp' }
      ],
      intent,
      updatedContext
    };
  }

  // 12. RETURNS & REFUNDS INQUIRY
  if (intent === 'returns_info') {
    const text =
      `**Returns & Refund Policy:**\n\n` +
      `In accordance with our published boutique policy, all sales and bespoke commissions are final once an order is placed and fabric is cut. We operate a strict **No Refund** policy.\n\n` +
      `**Complimentary Alterations Guarantee:**\n` +
      `Because we are dedicated to an exquisite fit, we offer a **complimentary fitting alteration service** at our Accra studio within **7 days** of garment delivery for any bespoke commission needing minor adjustments.`;

    return {
      text,
      options: [
        { label: '📏 Size Chart & Lengths', action: 'size_guide' },
        { label: '💬 Contact Boutique for Alterations', action: 'contact_whatsapp' }
      ],
      intent,
      updatedContext
    };
  }

  // 13. EXCHANGES INQUIRY
  if (intent === 'exchanges_info') {
    const text =
      `**Exchange Policy:**\n\n` +
      `Because each piece is custom-cut or tailored in limited artisan runs, we operate a strict **No Exchange** policy once an order has been confirmed.\n\n` +
      `If a garment does not fit as desired, our Accra atelier provides **complimentary fitting alterations within 7 days** of delivery.`;

    return {
      text,
      options: [
        { label: '📏 View Size Chart', action: 'open_size_chart' },
        { label: '💬 WhatsApp Atelier', action: 'contact_whatsapp' }
      ],
      intent,
      updatedContext
    };
  }

  // 14. ALTERATIONS INQUIRY
  if (intent === 'alterations_info') {
    const text =
      `**Bespoke Alterations Service:**\n\n` +
      `We provide a **complimentary fitting alteration service** at our Accra atelier within **7 days** of garment receipt.\n\n` +
      `If you need hem calibration, waist adjustments, or bespoke sizing, our master tailors will gladly make the adjustments. You can also specify custom measurements or hem lengths in your order notes at checkout.`;

    return {
      text,
      options: [
        { label: '💬 Contact Atelier for Alterations', action: 'contact_whatsapp' },
        { label: '📏 View Length Guide', action: 'size_guide' }
      ],
      intent,
      updatedContext
    };
  }

  // 15. CONTACT BOUTIQUE
  if (intent === 'contact_boutique') {
    const contextNote = activeProd ? ` regarding the ${activeProd.name}` : '';
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
      intent,
      updatedContext
    };
  }

  // 16. CATEGORY EXPLORATIONS
  if (intent === 'explore_women') {
    const womenProds = catalogue.filter((p) => p.category === 'women').slice(0, 3);
    const text =
      `Navigating you to our **Womenswear** collection, featuring silk-cotton boubous, handwoven Kente gowns, and structured peplum silhouettes.`;

    return {
      text,
      options: [
        { label: '👗 View All Womenswear', action: 'filter_women' },
        { label: '📏 Sizing & Length Guide', action: 'size_guide' }
      ],
      products: womenProds,
      intent,
      updatedContext
    };
  }

  if (intent === 'explore_men') {
    const menProds = catalogue.filter((p) => p.category === 'men').slice(0, 3);
    const text =
      `Navigating you to our **Menswear** collection, featuring three-piece brocade Agbadas, Kente-yoke linen kaftans, and Northern Fugu smocks.`;

    return {
      text,
      options: [
        { label: '👔 View All Menswear', action: 'filter_men' },
        { label: '📏 Men’s Size Guide', action: 'size_guide' }
      ],
      products: menProds,
      intent,
      updatedContext
    };
  }

  if (intent === 'explore_bags') {
    const bagProds = catalogue.filter((p) => p.category === 'bags').slice(0, 3);
    const text =
      `Navigating you to our **Bags & Accessories** collection, featuring hand-plaited Bolgatanga leather totes, brass Adinkra velvet clutches, and raffia shoulder pieces.`;

    return {
      text,
      options: [
        { label: '👜 View All Bags & Accessories', action: 'filter_bags' },
        { label: '✨ Explore Other Collections', action: 'explore_collections' }
      ],
      products: bagProds,
      intent,
      updatedContext
    };
  }

  // 17. GREETING
  if (intent === 'greeting') {
    return {
      text:
        'Warm greetings. I am NNEPA, your personal shopping concierge at Nnepa Foriwaa. How may I guide your boutique experience today?',
      options: [
        { label: '✨ Explore Collections', action: 'explore_collections' },
        { label: '👗 Find a Garment', action: 'find_product' },
        { label: '📏 Size & Length Guide', action: 'size_guide' },
        { label: '📦 Delivery & Ordering', action: 'delivery_info' },
        { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' }
      ],
      intent,
      updatedContext
    };
  }

  // 18. CHECK STRUCTURED FAQ ENTRIES FOR MATCH
  const matchingFaq = findMatchingFAQ(userInput);
  if (matchingFaq) {
    const options: ConciergeActionOption[] = [];
    if (matchingFaq.suggestedAction) {
      options.push(matchingFaq.suggestedAction);
    }
    options.push({ label: '✨ Main Menu', action: 'main_menu' });
    options.push({ label: '💬 WhatsApp Concierge', action: 'contact_whatsapp' });

    return {
      text: matchingFaq.answer,
      options,
      intent: `faq_${matchingFaq.category}`,
      updatedContext
    };
  }

  // 19. SEARCH CATALOGUE BY KEYWORDS
  const searchResults = searchCatalogueProducts(userInput, catalogue, 3);
  if (searchResults.length > 0) {
    return {
      text: `I discovered ${searchResults.length} piece${searchResults.length > 1 ? 's' : ''} in our boutique corresponding to your inquiry:`,
      options: [
        { label: '👗 View Complete Catalog', action: 'filter_all' },
        { label: '📏 Size Guide', action: 'size_guide' },
        { label: '💬 WhatsApp Concierge', action: 'contact_whatsapp' }
      ],
      products: searchResults,
      intent: 'catalogue_search',
      updatedContext
    };
  }

  // 20. STRICT POLITE FALLBACK (EXACT WORDING REQUIRED BY BRAND BRIEF)
  // “I’d love to help, but I don’t have confirmed information on that just yet. Please contact our boutique for assistance.”
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
