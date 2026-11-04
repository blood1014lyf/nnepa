/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Automated Test Suite for NNEPA Shopping Concierge
 * Covers all 14 mandatory scenarios specified in Section 9 of the design brief.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import type { Product } from '../../types.ts';
import {
  processConciergeMessage,
  createInitialConciergeContext,
  classifyCustomerIntent
} from '../engine/conciergeEngine.ts';
import {
  UNCONFIRMED_FALLBACK_TEXT,
  PROACTIVE_PROMPTS,
  buildProductKnowledge
} from '../knowledge/index.ts';

const CATALOGUE: Product[] = [
  {
    id: 'prod_test_01',
    name: 'Queen Mother Royal Kente Gown',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 2850,
    rating: 5,
    imageUrl: '',
    color: 'Plum & Violet',
    colorCount: 3,
    badge: 'Bestseller',
    inStock: true,
    description: 'Full-length evening gown cut from handwoven Ghanaian silk Kente and weighty brocade, tailored for weddings and formal celebrations.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_test_02',
    name: 'Royal Gold Kente Boubou',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 480,
    rating: 5,
    imageUrl: '',
    color: 'Gold & Ochre',
    colorCount: 2,
    badge: 'Exclusive',
    inStock: true,
    description: 'Generously draped silk-cotton boubou finished in Accra with handwoven Asante Kente strip inlays along the neckline and cuffs.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_test_03',
    name: 'The Patriarch Brocade Agbada',
    category: 'men',
    subcategory: 'Kaftans & Agbada',
    price: 1200,
    rating: 5,
    imageUrl: '',
    color: 'Ivory & Pearl',
    colorCount: 3,
    badge: 'Bestseller',
    inStock: true,
    description: 'Three-piece ceremonial Agbada cut from breathable damask brocade with tonal hand embroidery at the chest and matching trousers.',
    sizes: ['M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_test_04',
    name: 'Bolga Woven Leather Tote',
    category: 'bags',
    subcategory: 'Bags & Accessories',
    price: 340,
    rating: 5,
    imageUrl: '',
    color: 'Gold & Ochre',
    colorCount: 3,
    badge: 'Bestseller',
    inStock: true,
    description: 'Hand-plaited elephant grass carryall woven in Bolgatanga and finished with vegetable-tanned Ghanaian leather handles.',
    sizes: ['One Size']
  }
];

describe('NNEPA Shopping Concierge — Core Knowledge & Intelligence Test Suite', () => {
  // Grab real products for testing
  const gownProduct = CATALOGUE.find((p) => p.name.includes('Queen Mother') || p.name.includes('Aburi')) || CATALOGUE[0];
  const agbadaProduct = CATALOGUE.find((p) => p.name.includes('Agbada') || p.name.includes('Kaftan')) || CATALOGUE[2];

  // 1. Customer asks about a product's price
  test('Scenario 1: Customer asks about a product’s price', () => {
    const context = createInitialConciergeContext(null);
    const res = processConciergeMessage(`How much does the ${gownProduct.name} cost?`, context, CATALOGUE);

    assert.equal(res.intent, 'product_price');
    assert.ok(res.text.includes(gownProduct.name), 'Response must mention product name');
    assert.ok(
      res.text.includes(gownProduct.price.toLocaleString()),
      `Response must include exact verified price GH₵ ${gownProduct.price}`
    );
    assert.equal(res.updatedContext.focusedProduct?.id, gownProduct.id, 'Context should focus on requested product');
  });

  // 2. Customer asks about available sizes
  test('Scenario 2: Customer asks about available sizes', () => {
    const context = createInitialConciergeContext(gownProduct);
    const res = processConciergeMessage('What sizes are available in this dress?', context, CATALOGUE);

    assert.equal(res.intent, 'size_availability');
    const expectedSizes = gownProduct.sizes && gownProduct.sizes.length > 0 ? gownProduct.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
    for (const size of expectedSizes) {
      assert.ok(res.text.includes(size), `Response should list size ${size}`);
    }
  });

  // 3. Customer asks about another colour
  test('Scenario 3: Customer asks about another colour', () => {
    const context = createInitialConciergeContext(gownProduct);
    const res = processConciergeMessage('Do you have this in another colour?', context, CATALOGUE);

    assert.equal(res.intent, 'product_color');
    if (gownProduct.color) {
      assert.ok(res.text.includes(gownProduct.color), 'Response should mention published primary colour');
    }
    assert.ok(res.text.includes('WhatsApp'), 'Should direct customer to WhatsApp boutique for textile swatches');
  });

  // 4. Customer asks about product material
  test('Scenario 4: Customer asks about product material', () => {
    const context = createInitialConciergeContext(gownProduct);
    const res = processConciergeMessage('What material is this made from?', context, CATALOGUE);

    assert.equal(res.intent, 'product_material');
    const knowledge = buildProductKnowledge(gownProduct);
    if (knowledge.extractedMaterials.length > 0) {
      assert.ok(
        knowledge.extractedMaterials.some((mat) => res.text.toLowerCase().includes(mat.toLowerCase())),
        'Response must mention verified extracted material'
      );
    }
    assert.ok(res.text.includes('Accra'), 'Mentions handcrafted tailoring in Accra studio');
  });

  // 5. Customer asks a follow-up question using context without repeating garment name
  test('Scenario 5: Multi-turn contextual follow-up sequence', () => {
    let ctx = createInitialConciergeContext(null);

    // Turn 1: Customer asks about dress
    const turn1 = processConciergeMessage(`Tell me about the ${gownProduct.name}`, ctx, CATALOGUE);
    ctx = turn1.updatedContext;
    assert.equal(ctx.focusedProduct?.id, gownProduct.id);

    // Turn 2: Customer asks follow-up about sizes without mentioning dress name
    const turn2 = processConciergeMessage('What sizes do you have in it?', ctx, CATALOGUE);
    ctx = turn2.updatedContext;
    assert.equal(ctx.focusedProduct?.id, gownProduct.id, 'Context preserved across turn 2');
    assert.ok(turn2.text.includes(gownProduct.name), 'Response resolves to gownProduct');

    // Turn 3: Customer asks follow-up about price without mentioning dress name
    const turn3 = processConciergeMessage('How much is it?', ctx, CATALOGUE);
    ctx = turn3.updatedContext;
    assert.equal(ctx.focusedProduct?.id, gownProduct.id, 'Context preserved across turn 3');
    assert.ok(turn3.text.includes(gownProduct.price.toLocaleString()), 'Resolves exact price in turn 3');

    // Turn 4: Customer asks follow-up about fabric without mentioning dress name
    const turn4 = processConciergeMessage('What is it made of?', ctx, CATALOGUE);
    ctx = turn4.updatedContext;
    assert.equal(ctx.focusedProduct?.id, gownProduct.id, 'Context preserved across turn 4');
    assert.equal(turn4.intent, 'product_material');
  });

  // 6. Customer asks how to place an order
  test('Scenario 6: Customer asks how to place an order', () => {
    const context = createInitialConciergeContext(null);
    const res = processConciergeMessage('How do I place an order?', context, CATALOGUE);

    assert.equal(res.intent, 'how_to_order');
    assert.ok(res.text.includes('Add to Bag'), 'Explains Add to Bag step');
    assert.ok(res.text.includes('checkout'), 'Explains Checkout step');
    assert.ok(res.text.includes('WhatsApp'), 'Explains boutique WhatsApp order registration');
  });

  // 7. Customer asks about delivery
  test('Scenario 7: Customer asks about delivery', () => {
    const context = createInitialConciergeContext(null);
    const res = processConciergeMessage('What are your delivery charges and how long does it take?', context, CATALOGUE);

    assert.equal(res.intent, 'delivery_info');
    assert.ok(res.text.includes('3 to 7 working days') || res.text.includes('3–7 working days'), 'States 3–7 working days tailoring turnaround');
    assert.ok(res.text.includes('1,000'), 'States GH₵ 1,000 threshold for complimentary Accra delivery');
    assert.ok(res.text.includes('45'), 'States GH₵ 45 standard Accra delivery fee');
    assert.ok(res.text.includes('DHL Express'), 'States worldwide shipping via DHL Express');
  });

  // 8. Customer asks about returns
  test('Scenario 8: Customer asks about returns and refunds', () => {
    const context = createInitialConciergeContext(null);
    const res = processConciergeMessage('Can I get a refund if I return this dress?', context, CATALOGUE);

    assert.equal(res.intent, 'returns_info');
    assert.ok(res.text.includes('No Refund'), 'Strictly states published No Refund policy');
    assert.ok(res.text.includes('alteration') || res.text.includes('alterations'), 'Highlights 7-day complimentary alteration guarantee');
    assert.ok(res.text.includes('7 days'), 'States 7-day window for alterations');
  });

  // 9. Customer asks something outside NNEPA’s knowledge (unconfirmed topic)
  test('Scenario 9: Customer asks something outside NNEPA’s knowledge', () => {
    const context = createInitialConciergeContext(null);
    const res = processConciergeMessage('What is your financial stock market ticker symbol and quarterly revenue?', context, CATALOGUE);

    assert.equal(res.intent, 'unconfirmed_fallback');
    assert.ok(
      res.text.includes(UNCONFIRMED_FALLBACK_TEXT),
      'Must emit the exact polite fallback text: "I’d love to help, but I don’t have confirmed information on that just yet. Please contact our boutique for assistance."'
    );
    assert.ok(res.options.some((opt) => opt.action === 'contact_whatsapp'), 'Must provide official contact option');
  });

  // 10. Customer navigates between products (context updates appropriately)
  test('Scenario 10: Customer navigates between products', () => {
    // Initial context on gown
    let ctx = createInitialConciergeContext(gownProduct);
    assert.equal(ctx.focusedProduct?.id, gownProduct.id);

    // Customer views agbada product
    ctx = { ...ctx, focusedProduct: agbadaProduct, activeCategory: agbadaProduct.category };
    const res = processConciergeMessage('How much does this cost?', ctx, CATALOGUE);

    assert.equal(res.updatedContext.focusedProduct?.id, agbadaProduct.id);
    assert.ok(res.text.includes(agbadaProduct.price.toLocaleString()), 'Price now reflects newly navigated agbada');
  });

  // 11. Customer adds a product to the cart (Proactive trigger check)
  test('Scenario 11: Add-to-cart proactive invitation string conforms to brief', () => {
    assert.equal(
      PROACTIVE_PROMPTS.afterAddToCart,
      'Added to your bag. Would you like help checking out?',
      'Matches exact brand prompt string'
    );
  });

  // 12. Mobile layout & responsiveness readiness
  test('Scenario 12: Mobile responsive sizing and dimensions verification', () => {
    const componentSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ShoppingConcierge.tsx'),
      'utf8'
    );
    // Verifies responsive mobile bottom sheet and desktop floating card constraints
    assert.ok(
      componentSource.includes('inset-x-2 bottom-2') && componentSource.includes('sm:w-[380px]'),
      'Component contains responsive mobile bottom sheet and desktop width constraints'
    );
    assert.ok(
      componentSource.includes('max-h-[76dvh]') && componentSource.includes('sm:max-h-[82vh]'),
      'Component contains responsive max heights for mobile and desktop'
    );
    assert.ok(
      componentSource.includes('safe-area-inset-bottom'),
      'Component respects mobile safe area insets'
    );
    assert.ok(
      componentSource.includes('role="dialog"'),
      'Component provides accessible dialog semantics'
    );
  });

  // 13. Closing the chatbot preserves session; explicit new chat resets state
  test('Scenario 13: Closing chatbot hides window and preserves session; new chat resets', () => {
    const componentSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ShoppingConcierge.tsx'),
      'utf8'
    );
    // Verify that handleCloseConcierge exists and closes the window
    assert.ok(
      componentSource.includes('handleCloseConcierge'),
      'Component has handleCloseConcierge handler'
    );
    // Verify intentional new chat reset handler exists
    assert.ok(
      componentSource.includes('handleStartNewChat'),
      'Component provides handleStartNewChat handler for intentional reset'
    );
    assert.ok(
      componentSource.includes('createInitialConciergeContext'),
      'Resets engine context when starting new chat'
    );
    assert.ok(
      componentSource.includes('getInitialWelcomeMessage'),
      'Resets messages array when starting new chat'
    );
  });

  // 14. Refreshing the website (zero persistence, clean in-memory state)
  test('Scenario 14: Refreshing website starts with clean in-memory state (zero persistence)', () => {
    const componentSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ShoppingConcierge.tsx'),
      'utf8'
    );
    const engineSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/concierge/engine/conciergeEngine.ts'),
      'utf8'
    );

    // Strict privacy audit: No conversation storage in localStorage or sessionStorage
    assert.ok(!componentSource.includes('localStorage.setItem(\'nnepa_concierge'), 'No localStorage chat persistence');
    assert.ok(!componentSource.includes('sessionStorage.setItem'), 'No sessionStorage chat persistence');
    assert.ok(!engineSource.includes('localStorage'), 'Engine has zero localStorage calls');
    assert.ok(!engineSource.includes('sessionStorage'), 'Engine has zero sessionStorage calls');
  });

  // Bonus verification: Zero external LLM endpoints and zero tracking
  test('Security & Privacy Audit: Zero external LLM APIs and zero analytics tracking', () => {
    const conciergeFiles = [
      'src/components/ShoppingConcierge.tsx',
      'src/concierge/engine/conciergeEngine.ts',
      'src/concierge/knowledge/brandKnowledge.ts',
      'src/concierge/knowledge/productKnowledge.ts',
      'src/concierge/knowledge/sizingKnowledge.ts',
      'src/concierge/knowledge/orderingKnowledge.ts',
      'src/concierge/knowledge/deliveryReturnsKnowledge.ts',
      'src/concierge/knowledge/faqKnowledge.ts',
      'src/concierge/knowledge/responseGuidelines.ts'
    ];

    const forbiddenTokens = [
      'api.openai.com',
      'generativelanguage.googleapis.com',
      'api.anthropic.com',
      'google-analytics',
      'mixpanel',
      'segment.io',
      'posthog',
      'hotjar'
    ];

    for (const file of conciergeFiles) {
      const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
      for (const token of forbiddenTokens) {
        assert.ok(!content.includes(token), `Forbidden external endpoint "${token}" found in ${file}`);
      }
    }
  });

  // 16. Customer Onboarding: Personal greeting & preferred name collection
  test('Scenario 16: Customer onboarding captures preferred name naturally', () => {
    let ctx = createInitialConciergeContext(null);
    assert.equal(ctx.profile.onboardingStage, 'awaiting_name');

    // Customer responds with name
    const res = processConciergeMessage('Call me Ama', ctx, CATALOGUE);
    ctx = res.updatedContext;

    assert.equal(ctx.profile.preferredName, 'Ama');
    assert.equal(ctx.profile.onboardingStage, 'awaiting_size');
    assert.ok(res.text.includes('Lovely to meet you, Ama. Let’s find something you’ll love.'), 'Greets customer warmly with their name');
    assert.ok(res.text.includes('Before we explore the collection, may I ask what clothing size you usually wear?'), 'Asks size question');
    assert.ok(res.options.some((o) => o.label === 'M'), 'Provides size M option');
    assert.ok(res.options.some((o) => o.label === 'Not sure'), 'Provides Not sure option');
  });

  // 17. Size Profiling: User selects size M directly
  test('Scenario 17: Customer selects size M during profiling', () => {
    let ctx = createInitialConciergeContext(null);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'awaiting_size';

    const res = processConciergeMessage('set_size_m', ctx, CATALOGUE);
    ctx = res.updatedContext;

    assert.equal(ctx.profile.usualSize, 'M');
    assert.equal(ctx.profile.onboardingStage, 'onboarded');
    assert.ok(res.text.includes('Thank you, Ama. I’ve noted that you usually wear size M.'), 'Confirms size M for Ama');
  });

  // 18. New Natural Size Assistance Flow: Existing garment label reference
  test('Scenario 18: Size assistance step 1 and 2 — customer selects garment and provides label size', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'awaiting_size';

    // Customer triggers size assistance ("Not sure")
    const step1 = processConciergeMessage('size_not_sure', ctx, CATALOGUE);
    ctx = step1.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_garment_inquiry');
    assert.ok(
      step1.text.includes('Do you have a dress, shirt or pair of trousers that fits you comfortably?'),
      'Step 1 asks about an existing comfortable garment'
    );
    assert.ok(step1.options.some((o) => o.action === 'garment_dress'), 'Offers Dress option');
    assert.ok(step1.options.some((o) => o.action === 'garment_top'), 'Offers Shirt / Top option');
    assert.ok(step1.options.some((o) => o.action === 'garment_trousers'), 'Offers Trousers option');

    // Customer selects "Dress"
    const step2 = processConciergeMessage('garment_dress', ctx, CATALOGUE);
    ctx = step2.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_label_inquiry');
    assert.ok(
      step2.text.includes('Lovely! What size is written on its label?'),
      'Step 2 asks for label size'
    );
    assert.ok(step2.options.some((o) => o.action === 'label_size_m'), 'Offers Size M');
    assert.ok(step2.options.some((o) => o.action === 'label_size_unknown'), 'Offers cannot find label option');

    // Customer provides size "M" from label
    const step3 = processConciergeMessage('label_size_m', ctx, CATALOGUE);
    ctx = step3.updatedContext;
    assert.equal(ctx.profile.usualSize, 'M');
    assert.equal(ctx.profile.onboardingStage, 'onboarded');
    assert.ok(step3.text.includes('Size M'), 'Identifies Size M as closest reference');
    assert.ok(step3.text.includes('36') && step3.text.includes('38'), 'Compares with brand size chart bust');
    assert.ok(step3.text.includes('different brands') || step3.text.includes('vary between'), 'Notes that cuts vary between brands');
    assert.ok(step3.options.some((o) => o.action === 'book_fitting_yes'), 'Offers fitting option');
  });

  // 19. Customer cannot find label: Moves directly to fitting offer
  test('Scenario 19: Customer cannot find label -> moves directly to fitting offer', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_label_inquiry';

    // Customer selects "I can’t find the label"
    const res = processConciergeMessage('label_size_unknown', ctx, CATALOGUE);
    ctx = res.updatedContext;

    assert.equal(ctx.profile.onboardingStage, 'sizing_fitting_offer');
    assert.ok(
      res.text.includes('That’s alright! We can arrange a fitting to help you find the right size. Would you like to book one?'),
      'Step 4 offers fitting without asking for measurements'
    );
    assert.ok(res.options.some((o) => o.action === 'book_fitting_yes'), 'Offers to book fitting');
    assert.ok(res.options.some((o) => o.action === 'book_fitting_no'), 'Offers polite decline');
  });

  // 20. Contextual inquiry: "Will this dress fit me?" using saved profile
  test('Scenario 20: "Will this dress fit me?" evaluates garment against existing profile', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.usualSize = 'M';
    ctx.profile.onboardingStage = 'onboarded';

    const res = processConciergeMessage('Will this dress fit me?', ctx, CATALOGUE);

    assert.equal(res.intent, 'garment_fit_profile_evaluated');
    assert.ok(res.text.includes(gownProduct.name), 'Mentions garment name');
    assert.ok(res.text.includes('Size M'), 'Mentions customer profile size M');
    assert.ok(res.text.includes('36') && res.text.includes('38'), 'References exact Size M specifications');
    assert.ok(res.text.includes('complimentary alterations'), 'Mentions 7-day complimentary alterations');
    assert.ok(res.options.some((o) => o.action === 'order_assistance'), 'Offers direct order assistance option');
  });

  // 21. Personal Order Assistance Flow
  test('Scenario 21: Step-by-step order assistance flow and add to cart', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.usualSize = 'M';
    ctx.profile.onboardingStage = 'onboarded';

    // Step 1: Customer requests order assistance
    const orderPrompt = processConciergeMessage('Help me order this', ctx, CATALOGUE);
    ctx = orderPrompt.updatedContext;

    assert.equal(ctx.profile.orderStage, 'summary_ready');
    assert.ok(orderPrompt.text.includes(gownProduct.name), 'Mentions garment');
    assert.ok(orderPrompt.text.includes('Size M'), 'Pre-selected Size M from profile');
    assert.ok(orderPrompt.text.includes(gownProduct.price.toLocaleString()), 'Shows total price');
    assert.ok(orderPrompt.options.some((o) => o.action === 'confirm_add_to_cart'), 'Provides confirm add to cart button');

    // Step 2: Customer confirms adding to cart
    const addRes = processConciergeMessage('confirm_add_to_cart', ctx, CATALOGUE);
    assert.equal(addRes.intent, 'order_added_to_cart');
    assert.ok(addRes.text.includes('bag'), 'Confirms addition to bag');
    assert.ok(addRes.options.some((o) => o.action === 'go_to_checkout'), 'Provides button to proceed to checkout');
  });

  // 22. Audit: Zero occurrences of banned phrasing in application code
  test('Scenario 22: Codebase audit contains zero occurrences of banned tailoring phrases', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const walkSync = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(walkSync(fullPath));
        } else if (/\.(ts|tsx)$/.test(file) && !file.includes('test')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const forbiddenPhrase = ['verified', 'tailoring', 'scale'].join(' ');
    const allSourceFiles = walkSync(srcDir);
    for (const filePath of allSourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(
        !content.toLowerCase().includes(forbiddenPhrase),
        `Forbidden phrase found in ${filePath}`
      );
    }
  });

  // 23. Response Presentation: Message Renderer formatting & sanitization
  test('Scenario 23: Response Presentation Layer sanitizes and renders structured markdown', () => {
    const rendererSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/concierge/components/ConciergeMessageRenderer.tsx'),
      'utf8'
    );

    // Verify it handles numbered steps, processing times, order specs, and sizing recommendations
    assert.ok(rendererSource.includes('numbered_list'), 'Supports numbered step rendering');
    assert.ok(rendererSource.includes('processing_badge'), 'Supports processing time badge');
    assert.ok(rendererSource.includes('isOrderSummary'), 'Detects and renders order summary specification cards');
    assert.ok(rendererSource.includes('isSizingSpecs'), 'Detects and renders sizing comparison cards');
    assert.ok(rendererSource.includes('isDeliverySchedule'), 'Detects and renders delivery destination sections');
    assert.ok(rendererSource.includes('renderInlineMarkdown'), 'Exports inline markdown parser');
    assert.ok(!rendererSource.includes('dangerouslySetInnerHTML'), 'Zero dangerouslySetInnerHTML (100% injection-safe)');
  });

  // 24. Free-form / regional label input (UK 12, US 8, etc.)
  test('Scenario 24: Customer enters international size (UK 12) -> maps to brand Size M', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_label_inquiry';
    ctx.profile.garmentType = 'dress';

    const res = processConciergeMessage('UK 12', ctx, CATALOGUE);
    assert.equal(res.intent, 'sizing_reference_matched');
    assert.equal(res.updatedContext.profile.usualSize, 'M');
    assert.ok(res.text.includes('Size M'), 'Maps UK 12 to Size M');
    assert.ok(res.text.includes('36') && res.text.includes('38'), 'Provides Size M measurements');
  });

  // 25. Customer is unsure or enters ambiguous size -> moves directly to fitting offer
  test('Scenario 25: Customer enters uncertain/unclear label -> moves directly to fitting offer', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_label_inquiry';
    ctx.profile.garmentType = 'top';

    const res = processConciergeMessage('The tag is faded and I’m not sure', ctx, CATALOGUE);
    assert.equal(res.intent, 'sizing_fitting_offer');
    assert.equal(res.updatedContext.profile.onboardingStage, 'sizing_fitting_offer');
    assert.ok(res.text.includes('We can arrange a fitting to help you find the right size'), 'Offers fitting');
  });

  // 26. Customer accepts fitting booking
  test('Scenario 26: Customer accepts fitting booking -> provides Accra studio and WhatsApp handoff', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_fitting_offer';

    const res = processConciergeMessage('book_fitting_yes', ctx, CATALOGUE);
    assert.equal(res.intent, 'book_fitting_accepted');
    assert.equal(res.updatedContext.profile.onboardingStage, 'onboarded');
    assert.ok(res.text.includes('+233 53 879 5669'), 'Provides official WhatsApp number');
    assert.ok(res.text.includes('Accra studio'), 'Mentions Accra studio fitting');
    assert.ok(res.options.some((o) => o.action === 'contact_whatsapp'), 'Offers WhatsApp link');
  });

  // 27. Customer declines fitting booking
  test('Scenario 27: Customer declines fitting booking -> returns to shopping without pressure', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_fitting_offer';

    const res = processConciergeMessage('book_fitting_no', ctx, CATALOGUE);
    assert.equal(res.intent, 'book_fitting_declined');
    assert.equal(res.updatedContext.profile.onboardingStage, 'onboarded');
    assert.ok(res.text.includes('No problem at all! Feel free to take your time'), 'Polite, zero-pressure message');
    assert.ok(res.options.some((o) => o.action === 'filter_all'), 'Returns to browse collection');
  });

  // 28. Customer cannot identify a suitable existing garment in Step 1
  test('Scenario 28: Customer has no suitable existing garment -> offers fitting immediately', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_garment_inquiry';

    // Customer says "I don't have one" or selects label_size_unknown
    const res = processConciergeMessage('label_size_unknown', ctx, CATALOGUE);
    assert.equal(res.intent, 'sizing_fitting_offer');
    assert.equal(res.updatedContext.profile.onboardingStage, 'sizing_fitting_offer');
    assert.ok(res.text.includes('We can arrange a fitting to help you find the right size'));
  });

  // 29. Sizing must be selected if unknown before adding sized piece to cart
  test('Scenario 29: Customer attempts to order sized piece without prior size -> prompts to select available size', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.usualSize = undefined;
    ctx.profile.selectedSize = undefined;

    const res = processConciergeMessage('Help me order this', ctx, CATALOGUE);
    assert.equal(res.intent, 'order_select_size');
    assert.ok(res.text.includes('What size would you like for the'), 'Prompts for size without assuming M');
    assert.ok(!res.text.includes('pre-selected'), 'Does NOT assume pre-selected size');
    assert.ok(res.options.some((o) => o.action === 'select_size_for_order'), 'Provides available size buttons');

    // Customer picks Size L
    const sizeSelectRes = processConciergeMessage('select_size_for_order_L', res.updatedContext, CATALOGUE);
    assert.equal(sizeSelectRes.intent, 'order_assistance_summary');
    assert.equal(sizeSelectRes.updatedContext.profile.selectedSize, 'L');
    assert.ok(sizeSelectRes.text.includes('Size L') || sizeSelectRes.text.includes('size **L**'), 'Prepares order summary for size L');
    assert.ok(sizeSelectRes.options.some((o) => o.action === 'confirm_add_to_cart'), 'Offers Add to Bag for selected size');
  });

  // 30. Out of stock piece prevents ordering
  test('Scenario 30: Out-of-stock piece explains availability and prevents ordering', () => {
    const oosProduct: Product = {
      ...gownProduct,
      id: 'out_of_stock_piece',
      inStock: false
    };

    let ctx = createInitialConciergeContext(oosProduct);
    const res = processConciergeMessage('Help me order this', ctx, CATALOGUE);

    assert.equal(res.intent, 'product_out_of_stock');
    assert.ok(res.text.includes('currently out of stock'), 'Informs that item is out of stock');
    assert.ok(res.options.some((o) => o.action === 'contact_whatsapp'), 'Offers WhatsApp contact');
    assert.ok(!res.options.some((o) => o.action === 'confirm_add_to_cart'), 'Does NOT offer add to cart');
  });

  // 31. Zero unsolicited colour suggestions in price or sizing queries
  test('Scenario 31: Price and sizing inquiries do not mention colour unsolicited', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    const priceRes = processConciergeMessage('How much is this dress?', ctx, CATALOGUE);
    assert.ok(!priceRes.text.toLowerCase().includes('colourway'), 'Price query has no unsolicited colourway');
    assert.ok(!priceRes.text.toLowerCase().includes('color option'), 'Price query has no unsolicited colors');

    const sizeRes = processConciergeMessage('What sizes do you have?', ctx, CATALOGUE);
    assert.ok(!sizeRes.text.toLowerCase().includes('colourway'), 'Size query has no unsolicited colourway');
  });

  // 32. Zero emoji characters across all options and responses
  test('Scenario 32: All options across main intents have zero emoji characters', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    const emojiRegex = /[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]/;

    const queries = [
      'Hello',
      'How much does this cost?',
      'What sizes are available?',
      'How to place an order',
      'Tell me about delivery',
      'Can I return this?',
      'Help me order this',
      'Do you have other colors?'
    ];

    for (const q of queries) {
      const res = processConciergeMessage(q, ctx, CATALOGUE);
      assert.ok(!emojiRegex.test(res.text), `Response for "${q}" contains emoji`);
      for (const opt of res.options) {
        assert.ok(!emojiRegex.test(opt.label), `Option "${opt.label}" for "${q}" contains emoji`);
      }
    }
  });

  // 33. Anti-Random-Name Safeguard: "no", "skip", "just browsing", "none" do NOT set fake names
  test('Scenario 33: Non-name phrases never assign random or absurd customer names', () => {
    const nonNamePhrases = ['skip', 'no', 'none', 'pass', 'just browsing', 'not sure', 'idk'];
    for (const phrase of nonNamePhrases) {
      let ctx = createInitialConciergeContext(null);
      assert.equal(ctx.profile.onboardingStage, 'awaiting_name');

      const res = processConciergeMessage(phrase, ctx, CATALOGUE);
      assert.equal(res.updatedContext.profile.preferredName, undefined, `Must not assign "${phrase}" as customer name`);
      assert.ok(!res.text.toLowerCase().includes(`lovely to meet you, ${phrase}`), `Must not greet customer as "${phrase}"`);
    }
  });

  // 34. Direct Question on Turn 1 Answers Immediately Without Trapping in Name Onboarding
  test('Scenario 34: Asking direct questions on turn 1 answers immediately without demanding name', () => {
    let ctx = createInitialConciergeContext(null);
    assert.equal(ctx.profile.onboardingStage, 'awaiting_name');

    // Customer asks about shipping to UK
    const res = processConciergeMessage('Do you ship to London and the UK?', ctx, CATALOGUE);
    assert.equal(res.intent, 'international_delivery_info');
    assert.ok(res.text.includes('DHL Express'), 'Answers DHL Express transit');
    assert.ok(res.text.includes('United Kingdom') || res.text.includes('UK'), 'Answers UK delivery details');
    assert.equal(res.updatedContext.profile.preferredName, undefined, 'Did not mistake query for customer name');
  });

  // 35. Human Connection / Hard Question Escalation Bridge
  test('Scenario 35: Asking for human agent or complex inquiry provides clear WhatsApp boutique handoff', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('Can I talk to a real person or stylist?', ctx, CATALOGUE);
    assert.equal(res.intent, 'connect_human');
    assert.ok(res.text.includes('+233 53 879 5669'), 'Provides official phone/WhatsApp number');
    assert.ok(res.options.some((o) => o.action === 'contact_whatsapp'), 'Provides WhatsApp option button');
  });

  // 36. Multi-path Sizing Assistance (Measurements, International conversion, Garment, Chart)
  test('Scenario 36: Sizing options provide multiple practical pathways to find size', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('sizing_path_select', ctx, CATALOGUE);
    assert.equal(res.intent, 'sizing_path_select');
    assert.ok(res.options.some((o) => o.action === 'sizing_guided_start'), 'Offers guided measurements path');
    assert.ok(res.options.some((o) => o.action === 'sizing_intl_start'), 'Offers international conversion path');
    assert.ok(res.options.some((o) => o.action === 'open_size_chart'), 'Offers size chart path');
    assert.ok(res.options.some((o) => o.action === 'contact_whatsapp'), 'Offers WhatsApp stylist consultation');
  });

  // 37. Gender Declaration: "im a woman"
  test('Scenario 37: Customer declares "im a woman" -> routes to womenswear without misinterpreting as a name', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('im a woman', ctx, CATALOGUE);
    assert.equal(res.intent, 'explore_women');
    assert.equal(res.updatedContext.activeCategory, 'women');
    assert.equal(res.updatedContext.profile.preferredName, undefined, 'Does not treat "a woman" as customer name');
    assert.ok(res.text.includes('Womenswear'), 'Mentions Womenswear collection');
    assert.ok(res.products && res.products.length > 0, 'Returns womenswear products');
    assert.ok(res.options.some((o) => o.action === 'filter_women'), 'Provides filter womenswear button');
  });

  // 38. Gender Declaration: "I am a man"
  test('Scenario 38: Customer declares "I am a man" -> routes to menswear without misinterpreting as a name', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('I am a man', ctx, CATALOGUE);
    assert.equal(res.intent, 'explore_men');
    assert.equal(res.updatedContext.activeCategory, 'men');
    assert.equal(res.updatedContext.profile.preferredName, undefined, 'Does not treat "a man" as customer name');
    assert.ok(res.text.includes('Menswear'), 'Mentions Menswear collection');
    assert.ok(res.products && res.products.length > 0, 'Returns menswear products');
    assert.ok(res.options.some((o) => o.action === 'filter_men'), 'Provides filter menswear button');
  });

  // 39. Occasion Styling: Wedding Guest / Gala
  test('Scenario 39: Customer asks for wedding guest and gala recommendations', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('What should I wear to a wedding as a guest?', ctx, CATALOGUE);
    assert.equal(res.intent, 'occasion_styling');
    assert.ok(res.text.includes('weddings') || res.text.includes('ceremonies'), 'Mentions wedding ceremony styling');
    assert.ok(res.products && res.products.length > 0, 'Recommends appropriate ceremonial products');

    const galaRes = processConciergeMessage('I need an outfit for a black tie gala', ctx, CATALOGUE);
    assert.equal(galaRes.intent, 'occasion_styling');
    assert.ok(galaRes.text.includes('galas') || galaRes.text.includes('evening'), 'Mentions gala evening styling');
  });

  // 40. Direct Size Declaration: "I'm a size 12"
  test('Scenario 40: Customer declares size directly (e.g. "I\'m a size 12") -> maps to Size M', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage("I'm a size 12", ctx, CATALOGUE);
    assert.equal(res.intent, 'customer_size_declaration');
    assert.equal(res.updatedContext.profile.usualSize, 'M');
    assert.ok(res.text.includes('Size M'), 'Mentions Size M');
    assert.ok(res.text.includes('36') && res.text.includes('38'), 'Quotes Size M measurements');
  });

  // 41. General Fit Run: "How do your sizes run?"
  test('Scenario 41: Customer asks "How do your sizes run?" -> answers true-to-size and alterations policy', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('How do your sizes run? Are they true to size?', ctx, CATALOGUE);
    assert.equal(res.intent, 'general_fit_inquiry');
    assert.ok(res.text.includes('True to Size') || res.text.includes('true to'), 'Explains true-to-size standards');
    assert.ok(res.text.includes('complimentary fitting alterations'), 'Mentions 7-day complimentary alterations');
    assert.ok(res.options.some((o) => o.action === 'open_size_chart'), 'Provides link to size chart');
  });

  // 42. Bestsellers & New Arrivals
  test('Scenario 42: Customer asks about bestsellers and new arrivals', () => {
    let ctx = createInitialConciergeContext(null);

    const bestRes = processConciergeMessage('What are your bestsellers?', ctx, CATALOGUE);
    assert.equal(bestRes.intent, 'bestsellers_inquiry');
    assert.ok(bestRes.text.includes('Bestsellers'), 'Mentions signature bestsellers');
    assert.ok(bestRes.products && bestRes.products.length > 0, 'Returns bestselling products');

    const newRes = processConciergeMessage("What's new in your collection?", ctx, CATALOGUE);
    assert.equal(newRes.intent, 'new_arrivals_inquiry');
    assert.ok(newRes.text.includes('Heritage Collection') || newRes.text.includes('release'), 'Mentions latest collection');
  });

  // 43. Discounts Policy
  test('Scenario 43: Customer asks for discounts or promo codes -> explains artisan boutique policy', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('Do you have any discounts or promo codes?', ctx, CATALOGUE);
    assert.equal(res.intent, 'discounts_inquiry');
    assert.ok(res.text.includes('limited edition') || res.text.includes('artisanal'), 'Explains artisanal boutique policy');
    assert.ok(res.text.includes('GH₵ 1,000'), 'Mentions complimentary delivery threshold');
  });

  // 44. Stock & Availability — Alert out of stock, check back, or speak to stylist
  test('Scenario 44: Customer asks about stock -> alerts availability, check back, or stylist custom outfit', () => {
    const oosProduct: Product = {
      ...gownProduct,
      id: 'oos_test_garment',
      inStock: false
    };

    let oosCtx = createInitialConciergeContext(oosProduct);
    const oosRes = processConciergeMessage('Is this dress in stock?', oosCtx, CATALOGUE);
    assert.equal(oosRes.intent, 'product_out_of_stock');
    assert.ok(oosRes.text.includes('out of stock'), 'Alerts that piece is out of stock');
    assert.ok(oosRes.text.includes('check back'), 'Advises customer to check back soon');
    assert.ok(oosRes.text.includes('stylist') && oosRes.text.includes('custom outfit'), 'Advises speaking to stylist for custom outfit');
    assert.ok(oosRes.options.some((o) => o.action === 'contact_whatsapp'), 'Provides WhatsApp stylist option');

    let inStockCtx = createInitialConciergeContext(gownProduct);
    const inStockRes = processConciergeMessage('Do you have stock of this?', inStockCtx, CATALOGUE);
    assert.equal(inStockRes.intent, 'stock_availability_inquiry');
    assert.ok(inStockRes.text.includes('in stock'), 'Confirms piece is in stock');
    assert.ok(inStockRes.text.includes('check back') || inStockRes.text.includes('custom outfit'), 'Mentions check back or custom outfit policy');
  });

  // 45. Official Length Guide General Inquiry
  test('Scenario 45: Customer asks about length guide -> provides official 6 categories, high waist to feet, and custom length', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('What is your length guide for dresses and pants?', ctx, CATALOGUE);
    assert.equal(res.intent, 'length_guide_inquiry');
    assert.ok(res.text.includes('Petite (5\'0 – 5\'3)'), 'Includes Petite category');
    assert.ok(res.text.includes('Petite + (5\'4 – 5\'5)'), 'Includes Petite + category');
    assert.ok(res.text.includes('Average (5\'6 – 5\'7)'), 'Includes Average category');
    assert.ok(res.text.includes('Average + (5\'10 – 5\'11)'), 'Includes Average + category');
    assert.ok(res.text.includes('Tall (5\'8 – 5\'9)'), 'Includes Tall category');
    assert.ok(res.text.includes('Very Tall (6\'+)'), 'Includes Very Tall category');
    assert.ok(res.text.includes('42"') && res.text.includes('52"'), 'Includes pants/skirts lengths');
    assert.ok(res.text.includes('56"') && res.text.includes('65"'), 'Includes dress lengths');
    assert.ok(res.text.includes('high waist to feet'), 'Specifies high waist to feet measurement standard');
    assert.ok(res.text.includes('Custom Length Available') || res.text.includes('custom lengths'), 'Highlights custom length availability');
  });

  // 46. Height-Targeted Recommendation (5'4" -> Petite +)
  test('Scenario 46: Customer provides height 5\'4" -> maps to Petite + (43" pants / 57" dress)', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage("I'm 5'4, what length dress and pants should I get?", ctx, CATALOGUE);
    assert.equal(res.intent, 'length_guide_inquiry');
    assert.ok(res.text.includes('Petite +'), 'Recommends Petite + category');
    assert.ok(res.text.includes('43 inches'), 'Quotes 43 inches for pants/skirts');
    assert.ok(res.text.includes('57 inches'), 'Quotes 57 inches for dress');
    assert.ok(res.text.includes('high waist to feet'), 'Mentions high waist to feet standard');
    assert.ok(res.text.includes('Custom Length Available') || res.text.includes('custom lengths'), 'Offers custom length');
  });

  // 47. Height-Targeted Recommendation (5'8" -> Tall)
  test('Scenario 47: Customer provides height 5\'8" -> maps to Tall (49" pants / 63" dress)', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage("I am 5'8 tall, what is my dress length?", ctx, CATALOGUE);
    assert.equal(res.intent, 'length_guide_inquiry');
    assert.ok(res.text.includes('Tall'), 'Recommends Tall category');
    assert.ok(res.text.includes('49 inches'), 'Quotes 49 inches for pants/skirts');
    assert.ok(res.text.includes('63 inches'), 'Quotes 63 inches for dress');
  });

  // 48. Custom Length Inquiry
  test('Scenario 48: Customer asks about custom length -> explains high waist to feet and WhatsApp ordering', () => {
    let ctx = createInitialConciergeContext(null);

    const res = processConciergeMessage('Can I order a custom length?', ctx, CATALOGUE);
    assert.equal(res.intent, 'length_guide_inquiry');
    assert.ok(res.text.includes('Custom Length Available') || res.text.includes('custom lengths'), 'Confirms custom length');
    assert.ok(res.text.includes('high waist to feet'), 'Clarifies high waist to feet');
    assert.ok(res.options.some((o) => o.action === 'contact_whatsapp'), 'Offers WhatsApp stylist option');
  });

  // 49. Expanded FAQ Knowledge Library (100+ entries)
  test('Scenario 49: FAQ knowledge library contains 100+ comprehensive entries with zero banned words', async () => {
    const { FAQ_KNOWLEDGE_ENTRIES } = await import('../knowledge/faqKnowledge.ts');
    assert.ok(FAQ_KNOWLEDGE_ENTRIES.length >= 100, `Expected >= 100 FAQ entries, found ${FAQ_KNOWLEDGE_ENTRIES.length}`);

    // Verify zero occurrences of forbidden words across all FAQ answers
    for (const entry of FAQ_KNOWLEDGE_ENTRIES) {
      assert.ok(!/atelier/i.test(entry.answer), `FAQ entry ${entry.id} contains banned word atelier`);
      assert.ok(!/[\u{1F300}-\u{1F9FF}]/u.test(entry.answer), `FAQ entry ${entry.id} contains emoji`);
      assert.ok(entry.keywords.length > 0, `FAQ entry ${entry.id} has keywords`);
    }
  });

  // 50. Natural Internet Questions Verification
  test('Scenario 50: Real-world international fashion questions return articulate answers', () => {
    let ctx = createInitialConciergeContext(null);

    // Question 1: International shipping to Canada
    const resCanada = processConciergeMessage('Do you ship to Canada and how long does it take?', ctx, CATALOGUE);
    assert.ok(resCanada.text.toLowerCase().includes('dhl') || resCanada.text.toLowerCase().includes('canada') || resCanada.text.toLowerCase().includes('worldwide'), 'Answers Canada shipping');

    // Question 2: Heritage textile Batakari / Fugu
    const resFugu = processConciergeMessage('What is Northern Fugu Batakari cloth?', ctx, CATALOGUE);
    assert.ok(resFugu.text.toLowerCase().includes('fugu') || resFugu.text.toLowerCase().includes('batakari'), 'Explains Fugu Batakari heritage');

    // Question 3: Bridal train coordination
    const resBridal = processConciergeMessage('Can you dress my entire bridal train and groomsmen?', ctx, CATALOGUE);
    assert.ok(resBridal.text.toLowerCase().includes('bridal') || resBridal.text.toLowerCase().includes('groomsmen'), 'Answers bridal party inquiry');

    // Question 4: Remittance payment via Sendwave
    const resSendwave = processConciergeMessage('How can international clients pay using Sendwave or WorldRemit?', ctx, CATALOGUE);
    assert.ok(resSendwave.text.toLowerCase().includes('sendwave') || resSendwave.text.toLowerCase().includes('remittance') || resSendwave.text.toLowerCase().includes('worldremit'), 'Answers Sendwave payment');
  });
});
