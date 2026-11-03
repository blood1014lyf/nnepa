/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — F. Frequently Asked Questions
 * Structured, editable FAQ library covering all core boutique inquiries.
 * Add or edit entries here to teach NNEPA new answers without touching UI code.
 */

export interface FAQEntry {
  id: string;
  category:
    | 'products'
    | 'sizes'
    | 'colours'
    | 'availability'
    | 'materials'
    | 'ordering'
    | 'payments'
    | 'delivery'
    | 'returns'
    | 'exchanges'
    | 'support';
  question: string;
  answer: string;
  keywords: string[];
  suggestedAction?: {
    label: string;
    action: string;
    payload?: any;
  };
}

export const FAQ_KNOWLEDGE_ENTRIES: FAQEntry[] = [
  // ─── PRODUCTS ────────────────────────────────────────────────────────
  {
    id: 'faq_prod_craft',
    category: 'products',
    question: 'Where are Nnepa Foriwaa garments made?',
    answer:
      'Every Nnepa Foriwaa piece is individually cut, tailored, and hand-finished in our atelier in Accra, Ghana, using textiles sourced directly from artisanal weavers across Ghana, Nigeria, and Senegal.',
    keywords: ['made', 'atelier', 'produced', 'country', 'origin', 'where', 'manufacture'],
    suggestedAction: { label: 'Explore Collections', action: 'explore_collections' }
  },
  {
    id: 'faq_prod_custom_commission',
    category: 'products',
    question: 'Can I commission a custom or bespoke outfit?',
    answer:
      'Yes. In addition to our ready-to-wear silhouettes, we offer bespoke made-to-measure tailoring for bridal parties, royal celebrations, and private clients. You can book a fitting at our Accra studio or send your measurements via WhatsApp (+233 53 879 5669).',
    keywords: ['bespoke', 'custom', 'commission', 'tailored', 'wedding', 'bridal', 'measurements'],
    suggestedAction: { label: 'Book a Fitting', action: 'book_fitting' }
  },

  // ─── SIZES ───────────────────────────────────────────────────────────
  {
    id: 'faq_size_system',
    category: 'sizes',
    question: 'What sizing system does Nnepa Foriwaa use?',
    answer:
      'Our garments are calibrated across international standards: US (2 to 14), UK (6 to 18), and EU (34 to 46), corresponding to alpha sizes XS through XXL. Handcrafted bags and clutches are One Size.',
    keywords: ['sizing', 'sizes', 'system', 'us', 'uk', 'eu', 'alpha', 'chart'],
    suggestedAction: { label: 'View Size Chart', action: 'open_size_chart' }
  },
  {
    id: 'faq_size_length_guide',
    category: 'sizes',
    question: 'How do dress and pants lengths work?',
    answer:
      'We publish a Standard Length Guide: mini dresses (34–36"), knee dresses (39–42"), midi dresses (45–49"), and floor gowns / boubous (55–60"). Pants feature 27–35" inseams. Complimentary hem adjustments can be requested in your checkout notes.',
    keywords: ['length', 'hem', 'tall', 'petite', 'inches', 'inseam', 'outseam', 'short'],
    suggestedAction: { label: 'Size & Length Guide', action: 'size_guide' }
  },

  // ─── COLOURS ─────────────────────────────────────────────────────────
  {
    id: 'faq_colours_alternate',
    category: 'colours',
    question: 'Do you offer garments in alternative colours?',
    answer:
      'Several of our signature pieces are cut in multiple palette variations indicated by the colour count on the piece. Because our handwoven textiles and wax-prints are sourced in limited artisan batches, please inquire with our boutique on WhatsApp (+233 53 879 5669) for the latest available textile swatches.',
    keywords: ['colour', 'color', 'shade', 'swatch', 'palette', 'other color', 'another colour'],
    suggestedAction: { label: 'WhatsApp Swatches', action: 'contact_whatsapp' }
  },

  // ─── AVAILABILITY ────────────────────────────────────────────────────
  {
    id: 'faq_avail_lead_time',
    category: 'availability',
    question: 'Are items in stock or made to order?',
    answer:
      'Garments marked Available are hand-tailored upon order confirmation, typically taking 3 to 7 working days before dispatch. Pieces marked "Made to order" or "Out of stock" can often be commissioned by contacting our atelier directly.',
    keywords: ['in stock', 'out of stock', 'item available', 'availability', 'lead time', 'ready to ship'],
    suggestedAction: { label: 'Inquire on WhatsApp', action: 'contact_whatsapp' }
  },

  // ─── MATERIALS ───────────────────────────────────────────────────────
  {
    id: 'faq_materials_sourcing',
    category: 'materials',
    question: 'What fabrics and materials do you use?',
    answer:
      'We specialize in authentic West African heritage textiles: handwoven Asante silk Kente, fine Northern Fugu woven cotton, hand-loomed Nigerian Aso-Oke, damask brocade, washed linen, breathable silk-cotton blends, and vegetable-tanned Ghanaian leather.',
    keywords: ['fabric', 'fabrics', 'materials', 'textile', 'kente', 'brocade', 'linen', 'aso oke'],
    suggestedAction: { label: 'Explore Collections', action: 'explore_collections' }
  },
  {
    id: 'faq_materials_care',
    category: 'materials',
    question: 'How should I care for and wash my garments?',
    answer:
      'Because our garments incorporate delicate handwoven Kente, metallic brocade, and hand-dyed textiles, specialist dry cleaning is strongly recommended to preserve structural darting and textile lustre. Please consult our atelier for piece-specific advice.',
    keywords: ['wash', 'dry clean', 'care', 'iron', 'laundry', 'clean'],
    suggestedAction: { label: 'Boutique Care Advice', action: 'contact_whatsapp' }
  },

  // ─── ORDERING ────────────────────────────────────────────────────────
  {
    id: 'faq_order_process',
    category: 'ordering',
    question: 'How do I place an order on the website?',
    answer:
      'Select your piece and preferred size, click "Add to Bag", and proceed to checkout. Enter your delivery coordinates and submit. Your order is registered immediately and opens in WhatsApp for our boutique team to confirm measurements and dispatch scheduling.',
    keywords: ['how to order', 'place order', 'buying', 'order process', 'purchase'],
    suggestedAction: { label: 'How to Order', action: 'how_to_order' }
  },

  // ─── PAYMENTS ────────────────────────────────────────────────────────
  {
    id: 'faq_payments_how',
    category: 'payments',
    question: 'Do I pay online with a credit card at checkout?',
    answer:
      'No immediate payment is charged at checkout. Submitting your order registers your garment specifications with our Accra boutique. Our team then contacts you via WhatsApp with your Order Number to finalize your Mobile Money (MoMo) or direct boutique payment.',
    keywords: ['pay', 'payment', 'credit card', 'momo', 'mobile money', 'charge', 'cost'],
    suggestedAction: { label: 'WhatsApp Concierge', action: 'contact_whatsapp' }
  },

  // ─── DELIVERY ────────────────────────────────────────────────────────
  {
    id: 'faq_delivery_costs_times',
    category: 'delivery',
    question: 'How much is delivery and how long does it take?',
    answer:
      'Within Accra, delivery is complimentary on orders of GH₵ 1,000+ (or GH₵ 45 for smaller orders), arriving 1–2 business days after tailoring. Regional Ghana takes 2–3 business days via domestic courier. International orders ship worldwide via DHL Express within 3–7 business days.',
    keywords: ['delivery', 'shipping', 'dhl', 'accra', 'courier', 'international', 'how long'],
    suggestedAction: { label: 'Delivery Details', action: 'delivery_info' }
  },
  {
    id: 'faq_delivery_tracking',
    category: 'delivery',
    question: 'How can I track my order?',
    answer:
      'Every order is assigned a private tracking URL (#/order/:publicId). You can also message our WhatsApp concierge (+233 53 879 5669) with your Order Number for real-time atelier and courier updates.',
    keywords: ['track', 'tracking', 'status', 'where is my order', 'courier number'],
    suggestedAction: { label: 'Track Order', action: 'track_order' }
  },

  // ─── RETURNS & REFUNDS ───────────────────────────────────────────────
  {
    id: 'faq_returns_policy',
    category: 'returns',
    question: 'What is your return and refund policy?',
    answer:
      'In accordance with our published boutique policy, all sales and bespoke commissions are final once placed and cut. We operate a strict No Refund policy. However, we provide a complimentary fitting alteration service at our Accra atelier within 7 days of delivery.',
    keywords: ['return', 'returns', 'refund', 'refunds', 'money back', 'cancel'],
    suggestedAction: { label: 'Alterations Policy', action: 'delivery_info' }
  },

  // ─── EXCHANGES ───────────────────────────────────────────────────────
  {
    id: 'faq_exchanges_policy',
    category: 'exchanges',
    question: 'Can I exchange an item for a different size or piece?',
    answer:
      'Because each piece is custom-cut or tailored in limited artisan batches, we operate a strict No Exchange policy. If your garment requires adjustment, our Accra master tailors provide complimentary alterations within 7 days of receipt.',
    keywords: ['exchange', 'exchanges', 'swap', 'replace', 'change size'],
    suggestedAction: { label: 'Alterations Service', action: 'delivery_info' }
  },

  // ─── CUSTOMER SUPPORT ────────────────────────────────────────────────
  {
    id: 'faq_support_contact',
    category: 'support',
    question: 'How can I contact customer care or book a fitting?',
    answer:
      'Our boutique concierge is available Monday to Saturday, 9:00 AM – 6:00 PM GMT. You can reach us via WhatsApp or phone at +233 53 879 5669, email sales@nnepaforiwaa.com, or book a fitting at our Accra studio on our Contact page (#/contact).',
    keywords: ['contact', 'support', 'customer service', 'phone', 'whatsapp', 'email', 'fitting', 'hours'],
    suggestedAction: { label: 'Contact Boutique', action: 'contact_whatsapp' }
  }
];

/**
 * Searches the FAQ knowledge entries for a match against customer query text.
 */
export function findMatchingFAQ(query: string): FAQEntry | null {
  const normalized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return null;

  // Filter out blatantly out-of-scope non-fashion queries (financial markets, politics, weather, etc.)
  const outOfScopePatterns = [
    /\b(stock market|ticker|nasdaq|dow jones|quarterly revenue|balance sheet|ipo|crypto|bitcoin)\b/,
    /\b(weather|forecast|temperature|politics|election)\b/
  ];
  if (outOfScopePatterns.some((p) => p.test(normalized))) {
    return null;
  }

  const queryWords = normalized.split(' ').filter((w) => w.length >= 3);
  let bestEntry: FAQEntry | null = null;
  let highestScore = 0;

  for (const entry of FAQ_KNOWLEDGE_ENTRIES) {
    let score = 0;
    const qLower = entry.question.toLowerCase();

    // Direct match on question phrase
    if (normalized.includes(qLower) || qLower.includes(normalized)) {
      score += 10;
    }

    // Match keywords
    for (const kw of entry.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 4;
      }
    }

    // Word intersection with question text
    for (const qw of queryWords) {
      if (qLower.includes(qw)) {
        score += 1;
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  return bestEntry;
}
