/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — D. Ordering Knowledge
 * Covers the complete, actual purchasing process on nnepaforiwaa.com.
 * Grounded in the real storefront flows from ProductDetailsView, CartDrawer, and CheckoutView.
 */

export interface OrderingStep {
  stepNumber: number;
  title: string;
  instruction: string;
  actionHint?: string;
  pageHash?: string;
}

export interface OrderingKnowledge {
  summary: string;
  steps: OrderingStep[];
  paymentExplanation: {
    onlinePaymentRequired: boolean;
    explanation: string;
    howPaymentWorks: string;
    acceptedChannels: string[];
  };
  customOrderOption: {
    available: boolean;
    description: string;
    whatsappDirect: string;
  };
  promoCodePolicy: {
    supported: boolean;
    instruction: string;
  };
}

export const ORDERING_KNOWLEDGE: OrderingKnowledge = {
  summary:
    'Placing an order at Nnepa Foriwaa is straightforward and personal. Customers select their standard size or bespoke specifications, add to bag, and complete our 3-step checkout. Registering an order connects you directly with our Accra boutique via WhatsApp to confirm measurements and finalize delivery.',
  steps: [
    {
      stepNumber: 1,
      title: 'Browse Collections',
      instruction:
        'Explore our ready-to-wear and couture collections across Womenswear, Menswear, and Handcrafted Bags on the Shop page (#/shop).',
      pageHash: '#/shop',
      actionHint: 'Explore Shop'
    },
    {
      stepNumber: 2,
      title: 'Select Your Garment',
      instruction:
        'Tap any piece to view its cut, artisan fabric sourcing, high-resolution imagery, and pricing on its product page (#/product/:id).',
      actionHint: 'View Garment'
    },
    {
      stepNumber: 3,
      title: 'Choose Size & Specifications',
      instruction:
        'Select your preferred size (S, M, L, XL, XXL, or One Size). Consult our International Size Chart (#/size-chart) for exact bust, waist, hips, and standard length guide coordinates.',
      pageHash: '#/size-chart',
      actionHint: 'Check Size Chart'
    },
    {
      stepNumber: 4,
      title: 'Add to Shopping Bag',
      instruction:
        'Click "Add to Bag". Alternatively, you can click "Place order via WhatsApp" directly on the garment page for direct WhatsApp ordering.',
      actionHint: 'Add to Bag'
    },
    {
      stepNumber: 5,
      title: 'Review Shopping Bag',
      instruction:
        'Open your Shopping Bag drawer at any time from the top navigation to review selections, adjust quantities, or verify item subtotals.',
      actionHint: 'Open Shopping Bag'
    },
    {
      stepNumber: 6,
      title: 'Proceed to Checkout',
      instruction:
        'Click "Proceed to Checkout" from the shopping bag to enter our secure 3-step checkout (#/checkout).',
      pageHash: '#/checkout',
      actionHint: 'Proceed to Checkout'
    },
    {
      stepNumber: 7,
      title: 'Enter Contact & Delivery Information',
      instruction:
        'Provide your name, email, and Ghana phone number, followed by your delivery address, region, Ghana Post GPS digital address, and any custom tailoring or length notes.',
      actionHint: 'Enter Details'
    },
    {
      stepNumber: 8,
      title: 'Confirm & Place Order',
      instruction:
        'Click "Confirm & Place Order". You will immediately receive a private Order Number (#...), and your order will open in WhatsApp so our team can confirm your tailoring schedule and coordinate delivery.',
      actionHint: 'Confirm Order'
    }
  ],
  paymentExplanation: {
    onlinePaymentRequired: false,
    explanation:
      'No immediate payment is charged at the moment you click "Confirm & Place Order" on the website.',
    howPaymentWorks:
      'Placing an order registers your garment specifications directly with our Accra boutique. Your itemized summary and private Order Number are sent to our team, who then coordinate directly with you via WhatsApp to confirm fitting measurements and provide Mobile Money (MoMo) or boutique payment details prior to cutting and dispatch.',
    acceptedChannels: [
      'MTN Mobile Money (MoMo) / Ghana Mobile Money',
      'Direct Bank Transfer / Boutique Arrangement upon fitting confirmation'
    ]
  },
  customOrderOption: {
    available: true,
    description:
      'For bridal, royal gala commissions, or made-to-measure tailoring with specific body measurements, you can schedule a private fitting at our Accra studio (#/contact) or order directly via WhatsApp (+233 53 879 5669).',
    whatsappDirect: 'https://wa.me/233538795669'
  },
  promoCodePolicy: {
    supported: true,
    instruction:
      'If you have an official boutique promotional voucher or loyalty code, you can enter it in the "Promo Code" field during Step 2 of Checkout.'
  }
};
