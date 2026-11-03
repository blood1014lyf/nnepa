/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — G. Response Guidelines & Synonym Dictionaries
 * Defines NNEPA's voice, tone rules, exact fallback strings, proactive copy,
 * and comprehensive synonym maps for natural-language intent classification.
 */

export const NNEPA_IDENTITY = {
  name: 'NNEPA',
  title: 'Shopping Assistant',
  shortBrandName: 'Nnepa Foriwaa',
  tone: {
    traits: ['Warm', 'Confident', 'Helpful', 'Concise', 'Natural'],
    forbiddenPatterns: [
      'robotic jargon ("As an AI assistant")',
      'excessive punctuation (!!!)',
      'pushy sales tactics ("Buy now before it\'s gone")',
      'generic bot filler ("I hope this message finds you well")',
      'inventing unconfirmed information',
      'luxury clichés ("bespoke", "curated", "elevated", "timeless luxury", "concierge")'
    ]
  }
};

/**
 * Polite fallback required whenever an inquiry cannot be answered from verified brand facts.
 */
export const UNCONFIRMED_FALLBACK_TEXT =
  "I don’t have that information right now. Please contact the store directly.";

/**
 * Exact proactive prompts.
 */
export const PROACTIVE_PROMPTS = {
  home: 'Hello! What can I help you find?',
  shop: 'Looking for a particular style or size?',
  productDetails: 'I can help with sizes, fabrics or ordering this piece.',
  productIdle: 'Would you like some help with this item?',
  afterAddToCart: 'Added to your bag. Would you like help checking out?',
  cartOrCheckout: 'Can I help you complete your order?'
};

/**
 * Comprehensive synonym dictionaries grouping varied customer phrasing into core shopping intents.
 */
export const SYNONYM_DICTIONARIES = {
  price: [
    'how much',
    'price',
    'cost',
    'pricing',
    'rate',
    'how expensive',
    'how much is',
    'what does it cost',
    'what is the price',
    'how much does this cost',
    'how much for this',
    'tell me the price',
    'amount'
  ],
  sizeAvailable: [
    'what size',
    'sizes',
    'available sizes',
    'is this available in',
    'do you have this in',
    'can i get this in size',
    'is a medium available',
    'is small available',
    'do you have a large',
    'size m',
    'size s',
    'size l',
    'size xl',
    'size xxl',
    'size xs',
    'which sizes',
    'what sizes do you have'
  ],
  sizeChart: [
    'size chart',
    'measurement',
    'measurements',
    'fit guide',
    'length guide',
    'standard length',
    'how does this fit',
    'bust size',
    'waist size',
    'hips size',
    'inseam',
    'dress length',
    'pants length',
    'tall',
    'petite',
    'true to size'
  ],
  color: [
    'another colour',
    'another color',
    'other colours',
    'other colors',
    'different color',
    'different colour',
    'what colors',
    'what colours',
    'in another shade',
    'more colors',
    'swatches',
    'color options',
    'colour options'
  ],
  material: [
    'what material',
    'what fabric',
    'materials',
    'textile',
    'what is this made from',
    'what is it made of',
    'fabric details',
    'is this silk',
    'is this kente',
    'is this brocade',
    'is this cotton',
    'is this linen',
    'composition'
  ],
  care: [
    'care instructions',
    'how to wash',
    'can i wash',
    'dry clean',
    'how to clean',
    'ironing',
    'laundry instructions'
  ],
  similar: [
    'similar pieces',
    'similar',
    'like this',
    'more like this',
    'something similar',
    'other options',
    'what else do you recommend',
    'similar dresses',
    'similar kaftans',
    'similar styles'
  ],
  compare: [
    'compare',
    'versus',
    'vs',
    'difference between',
    'compare this with',
    'how does this compare',
    'which one is better',
    'side by side'
  ],
  order: [
    'how to order',
    'how to place an order',
    'how do i order',
    'how do i place an order',
    'place an order',
    'how to buy',
    'how do i buy',
    'ordering process',
    'steps to order',
    'purchasing',
    'how can i purchase'
  ],
  payment: [
    'how to pay',
    'payment method',
    'mobile money',
    'momo',
    'credit card',
    'do i pay now',
    'when do i pay',
    'bank transfer',
    'pay online'
  ],
  delivery: [
    'delivery',
    'shipping',
    'dhl',
    'how long does delivery take',
    'delivery fee',
    'shipping cost',
    'free delivery',
    'deliver to accra',
    'deliver to kumasi',
    'international delivery',
    'ship to us',
    'ship to uk',
    'dispatch'
  ],
  returns: [
    'return',
    'returns',
    'refund',
    'refunds',
    'can i return',
    'return policy',
    'money back'
  ],
  exchanges: [
    'exchange',
    'exchanges',
    'can i exchange',
    'swap size',
    'change size after delivery'
  ],
  alterations: [
    'alteration',
    'alterations',
    'adjustments',
    'fitting adjustment',
    'shorten hem',
    'take in'
  ],
  contact: [
    'contact',
    'speak to human',
    'whatsapp',
    'phone number',
    'customer service',
    'call you',
    'talk to someone',
    'fitting appointment',
    'book fitting',
    'studio address'
  ],
  greeting: [
    'hello',
    'hi',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'greetings'
  ]
};
