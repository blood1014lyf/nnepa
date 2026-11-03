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

import { PRODUCTS as CATALOGUE } from '../../data.ts';
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
    assert.ok(res.text.includes('Accra'), 'Mentions handcrafted tailoring in Accra atelier');
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
  test('Scenario 26: Customer accepts fitting booking -> provides Accra atelier and WhatsApp handoff', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_fitting_offer';

    const res = processConciergeMessage('book_fitting_yes', ctx, CATALOGUE);
    assert.equal(res.intent, 'book_fitting_accepted');
    assert.equal(res.updatedContext.profile.onboardingStage, 'onboarded');
    assert.ok(res.text.includes('+233 53 879 5669'), 'Provides official WhatsApp number');
    assert.ok(res.text.includes('Accra atelier'), 'Mentions Accra atelier fitting');
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
});
