/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — E. Delivery & Returns Knowledge
 * Sourced strictly from verified policies published in LegalView.tsx,
 * CheckoutView.tsx, and OrderStatusView.tsx.
 */

export interface DeliveryReturnsKnowledge {
  tailoringTimeline: {
    days: string;
    description: string;
  };
  shippingRates: {
    freeThresholdAccraGHS: number;
    standardAccraFeeGHS: number;
    summary: string;
  };
  deliveryRegions: Array<{
    region: string;
    carrier: string;
    estimatedTransit: string;
    notes: string;
  }>;
  returnPolicy: {
    allowsReturns: boolean;
    allowsRefunds: boolean;
    allowsExchanges: boolean;
    statement: string;
    alterationGuarantee: {
      offered: boolean;
      windowDays: number;
      location: string;
      description: string;
    };
  };
  tracking: {
    onlineTrackingAvailable: boolean;
    urlPattern: string;
    whatsappInquiry: string;
    supportedStatuses: string[];
  };
}

export const DELIVERY_RETURNS_KNOWLEDGE: DeliveryReturnsKnowledge = {
  tailoringTimeline: {
    days: '3–7 working days',
    description:
      'Each bespoke garment is cut and tailored to order by master artisans in our Accra studio, typically taking 3 to 7 working days before dispatch.'
  },
  shippingRates: {
    freeThresholdAccraGHS: 1000,
    standardAccraFeeGHS: 45,
    summary:
      'Complimentary door-to-door delivery within Accra on all orders of GH₵ 1,000 or more. For orders under GH₵ 1,000, standard Accra delivery is GH₵ 45.'
  },
  deliveryRegions: [
    {
      region: 'Accra & Greater Accra',
      carrier: 'Private Boutique Courier / Hand Delivery',
      estimatedTransit: '1–2 business days upon garment completion',
      notes: 'Complimentary for orders GH₵ 1,000+. Standard fee GH₵ 45 for smaller orders.'
    },
    {
      region: 'Regional Ghana (Kumasi, Takoradi, Cape Coast, Tamale, Sunyani, etc.)',
      carrier: 'Trusted Domestic Courier Services',
      estimatedTransit: '2–3 business days upon dispatch',
      notes: 'Direct tracking and station/door-to-door coordination via WhatsApp.'
    },
    {
      region: 'International (US, UK, Canada, Europe, Nigeria, Worldwide)',
      carrier: 'DHL Express Worldwide',
      estimatedTransit: '3–7 business days upon dispatch',
      notes:
        'Official DHL Express tracking number shared via WhatsApp and email as soon as the package leaves Accra.'
    }
  ],
  returnPolicy: {
    allowsReturns: false,
    allowsRefunds: false,
    allowsExchanges: false,
    statement:
      'In accordance with our published boutique policy, all sales and bespoke commissions are final once an order is placed and fabric is cut. We operate a strict No Refund and No Exchange policy.',
    alterationGuarantee: {
      offered: true,
      windowDays: 7,
      location: 'Accra Studio',
      description:
        'To ensure an impeccable fit, we offer a complimentary fitting alteration service at our Accra studio within 7 days of garment delivery for any bespoke commission needing minor adjustments.'
    }
  },
  tracking: {
    onlineTrackingAvailable: true,
    urlPattern: '#/order/:orderId',
    whatsappInquiry: 'https://wa.me/233538795669',
    supportedStatuses: ['New (Registered)', 'Confirmed', 'Shipped', 'Cancelled']
  }
};
