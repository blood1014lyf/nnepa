# NNEPA Knowledge Management & Concierge Training Guide

Welcome to the **NNEPA** Knowledge Training and Maintenance Guide. NNEPA is the personal shopping concierge for **Nnepa Foriwaa** (`nnepaforiwaa.com`).

This guide details how NNEPA's knowledge is structured, how live catalogue updates work automatically, and how developers or brand curators can easily update FAQs, policies, intents, and boutique responses without complex infrastructure.

---

## 1. Architecture Overview & Knowledge Storage

NNEPA operates **100% locally in the visitor's browser**. All knowledge modules are stored as clean, typed TypeScript files located in:
```
src/concierge/knowledge/
├── brandKnowledge.ts            # Module A: Brand story, atelier hours, official channels
├── productKnowledge.ts          # Module B: Dynamic live catalogue adapter & supplemental notes
├── sizingKnowledge.ts           # Module C: Size chart, international conversions, length guides
├── orderingKnowledge.ts         # Module D: 3-step checkout explanation & payment facts
├── deliveryReturnsKnowledge.ts  # Module E: Tailoring turnaround, courier rates, return/alteration policy
├── faqKnowledge.ts              # Module F: Structured, editable FAQ library
├── responseGuidelines.ts        # Module G: Persona, tone, proactive copy, synonym dictionaries
└── index.ts                     # Barrel export for all knowledge modules
```

The conversational intelligence engine that interprets inquiries and resolves multi-turn context is located in:
```
src/concierge/engine/conciergeEngine.ts
```

---

## 2. How Product Information is Updated

NNEPA is designed to **automatically reflect available catalogue information** rather than relying on duplicated product lists.

### A. Automatic Catalogue Ingestion
When products are created, edited, or re-priced in `src/data.ts` or through the Admin Inventory Dashboard (`#/admin-dashboard`), NNEPA ingests them dynamically via `buildProductKnowledge(product)`. NNEPA automatically understands:
- Garment Name & Price (including sale markdowns)
- Category & Subcategory
- Primary colour and total published colourway count
- Available sizes (`S`, `M`, `L`, `XL`, `XXL`, `One Size`)
- Extracted artisan textiles (e.g. *handwoven silk Kente*, *damask brocade*, *washed linen*, *Northern Fugu cotton*, *Aso-Oke*)
- Derived silhouette description based on garment cut
- Stock status and high-resolution lookbook imagery

### B. Adding Supplemental Details (Care Instructions & Alternate Colourways)
To provide confirmed garment care or specific named alternate colourways for a product, open:
`src/concierge/knowledge/productKnowledge.ts`

Locate the `PRODUCT_SUPPLEMENTAL_NOTES` dictionary and add an entry using the product's `id`:
```typescript
export const PRODUCT_SUPPLEMENTAL_NOTES: Record<string, ProductSupplementalInfo> = {
  'prod_1789572165350': {
    additionalColorNames: ['Ivory & Gold', 'Emerald & Gold'],
    careInstructions: 'Specialist dry clean only. Steam gently on reverse; do not iron directly on metallic brocade threads.',
    fitNote: 'Tailored with relaxed ease across the chest; tapered trousers include an elasticated back waistband.'
  }
};
```
If a field is omitted or `null`, NNEPA will never guess or hallucinate—it will politely direct the customer to the boutique team for confirmation.

---

## 3. How to Add or Edit FAQs

All general boutique questions are stored in:
`src/concierge/knowledge/faqKnowledge.ts`

To add a new FAQ:
1. Append a new object to `FAQ_KNOWLEDGE_ENTRIES`:
```typescript
{
  id: 'faq_bridal_appointments',
  category: 'support',
  question: 'How far in advance should I book for bridal commissions?',
  answer: 'We recommend scheduling your bridal fitting 6 to 8 weeks prior to your celebration to allow for bespoke fabric sourcing, muslin mock-ups, and hand-embroidery.',
  keywords: ['bridal', 'wedding', 'bride', 'timeline', 'advance', 'how early'],
  suggestedAction: { label: 'Book a Fitting', action: 'book_fitting' }
}
```
2. The search function `findMatchingFAQ(query)` automatically indexes the question text and `keywords`.

---

## 4. How Policies Are Updated

### A. Delivery Rates & Tailoring Turnaround
Open `src/concierge/knowledge/deliveryReturnsKnowledge.ts` to adjust:
- **`tailoringTimeline.days`**: Currently `'3–7 working days'`.
- **`shippingRates.freeThresholdAccraGHS`**: Currently `1000` (Complimentary delivery in Accra on orders GH₵ 1,000+).
- **`shippingRates.standardAccraFeeGHS`**: Currently `45` (GH₵ 45 delivery fee for orders under GH₵ 1,000).
- **`deliveryRegions`**: Estimated transit times and carriers (e.g. Accra courier, Regional domestic couriers, DHL Express worldwide).

### B. Returns & Alterations Policy
In `src/concierge/knowledge/deliveryReturnsKnowledge.ts`:
- **Strict No Refund / No Exchange**: Sourced directly from `LegalView.tsx`.
- **Alteration Guarantee**: The complimentary **7-day** fitting alteration service at the Accra studio.

---

## 5. How New Conversation Intents & Synonyms Are Added

All intent phrases and synonyms are defined in:
`src/concierge/knowledge/responseGuidelines.ts`

To teach NNEPA new ways customers might phrase an existing intent, add keywords or colloquial phrases to `SYNONYM_DICTIONARIES`:
```typescript
export const SYNONYM_DICTIONARIES = {
  price: [
    'how much',
    'price',
    'cost',
    'how much for this',
    'rate in ghana cedis',
    'how many cedis'  // <-- New phrasing added
  ],
  ...
};
```

To add an entirely new intent:
1. Add a new dictionary array in `SYNONYM_DICTIONARIES`.
2. Add the classification branch in `classifyCustomerIntent()` inside `src/concierge/engine/conciergeEngine.ts`.
3. Add the corresponding response block inside `processConciergeMessage()`.

---

## 6. How NNEPA's Tone & Fallbacks Are Refined

### A. Persona Guidelines
NNEPA adheres to the following voice:
- **Tone**: Elegant, warm, confident, courteous, fashion-conscious, helpful, concise, and natural.
- **Strictly Avoids**: Robot filler ("As an AI model..."), excessive emojis/punctuation, pushing urgency, or claiming unverified facts.

### B. Fallback Behavior (Zero Hallucination)
Whenever an inquiry cannot be answered from verified website data, NNEPA emits the exact required polite fallback:
> *“I’d love to help, but I don’t have confirmed information on that just yet. Please contact our boutique for assistance.”*

Followed by official boutique contact buttons (`+233 53 879 5669` on WhatsApp and the Contact page).

---

## 7. Privacy & Storage Verification

- **In-Browser Processing**: NNEPA executes entirely client-side. No external requests are made to third-party AI APIs.
- **Zero Persistent Storage**: Neither `localStorage` nor `sessionStorage` nor `IndexedDB` nor cookies are used for conversation history.
- **Session Cleanup**: Closing the concierge (via X, floating launcher, or `Escape`) resets the conversation history and context back to initial in-memory state.
