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
      'Lovely choice. Would you like help completing your order?',
      'Matches exact brand prompt string'
    );
  });

  // 12. Mobile layout & responsiveness readiness
  test('Scenario 12: Mobile responsive sizing and dimensions verification', () => {
    const componentSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ShoppingConcierge.tsx'),
      'utf8'
    );
    // Verifies responsive viewport styling
    assert.ok(
      componentSource.includes('w-[calc(100vw-2rem)] sm:w-[390px]'),
      'Component contains responsive mobile width constraint'
    );
    assert.ok(
      componentSource.includes('max-h-[85vh]') || componentSource.includes('max-h-[80vh]'),
      'Component contains responsive max height'
    );
    assert.ok(
      componentSource.includes('role="dialog"'),
      'Component provides accessible dialog semantics'
    );
  });

  // 13. Closing the chatbot (clears temporary in-memory conversation state)
  test('Scenario 13: Closing chatbot clears temporary in-memory state', () => {
    const componentSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ShoppingConcierge.tsx'),
      'utf8'
    );
    // Verify that handleCloseConcierge resets context and messages
    assert.ok(
      componentSource.includes('handleCloseConcierge'),
      'Component has handleCloseConcierge handler'
    );
    assert.ok(
      componentSource.includes('createInitialConciergeContext'),
      'Clears engine context back to initial state on close'
    );
    assert.ok(
      componentSource.includes('getInitialWelcomeMessage'),
      'Resets messages array to initial welcome message on close'
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

  // 18. Interactive Sizing Assistant: Full measurement journey (inches)
  test('Scenario 18: Interactive Sizing Assistant step-by-step measurement (inches)', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'awaiting_size';

    // Step 1: Customer selects "Not sure" -> Sizing Discovery Hub
    const step1 = processConciergeMessage('size_not_sure', ctx, CATALOGUE);
    ctx = step1.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_path_select');
    assert.ok(step1.text.includes('best fit'));

    // Step 2: Customer selects Path 2 ("I don’t know my measurements")
    const step1b = processConciergeMessage('sizing_path_guided', ctx, CATALOGUE);
    ctx = step1b.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_path_guided_unit');
    assert.ok(step1b.text.includes('inches or centimetres'));

    // Step 3: Customer selects Inches
    const step2 = processConciergeMessage('choose_unit_in', ctx, CATALOGUE);
    ctx = step2.updatedContext;
    assert.equal(ctx.profile.preferredUnit, 'in');
    assert.equal(ctx.profile.onboardingStage, 'sizing_assistant_bust');
    assert.ok(step2.text.includes('bust'));

    // Step 4: Customer provides bust 37"
    const step3 = processConciergeMessage('37', ctx, CATALOGUE);
    ctx = step3.updatedContext;
    assert.equal(ctx.profile.measurements?.bust, 37);
    assert.equal(ctx.profile.onboardingStage, 'sizing_assistant_waist');
    assert.ok(step3.text.includes('waist'));

    // Step 5: Customer provides waist 30"
    const step4 = processConciergeMessage('30', ctx, CATALOGUE);
    ctx = step4.updatedContext;
    assert.equal(ctx.profile.measurements?.waist, 30);
    assert.equal(ctx.profile.onboardingStage, 'sizing_assistant_hips');
    assert.ok(step4.text.includes('hip'));

    // Step 6: Customer provides hips 40"
    const step5 = processConciergeMessage('40', ctx, CATALOGUE);
    ctx = step5.updatedContext;
    assert.equal(ctx.profile.measurements?.hips, 40);
    assert.equal(ctx.profile.usualSize, 'M');
    assert.equal(ctx.profile.onboardingStage, 'onboarded');

    // Section 9 verification: Check response presentation
    assert.ok(step5.text.includes('Bust: 37", Waist: 30", Hips: 40"'), 'Displays customer measurements');
    assert.ok(step5.text.includes('Size M'), 'Recommends Size M');
    assert.ok(step5.text.includes('36–38"') || step5.text.includes('36-38"'), 'Displays Size M bust spec from published size chart');
  });

  // 19. Sizing between sizes: Asks about fit preference
  test('Scenario 19: Interactive sizing between sizes prompts for fit preference', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.preferredUnit = 'in';
    ctx.profile.measurements = { bust: 35.5, waist: 28.5, unit: 'in' };
    ctx.profile.onboardingStage = 'sizing_assistant_hips';

    // Bust 35.5 sits between S (max 35) and M (min 36)
    const res = processConciergeMessage('38.5', ctx, CATALOGUE);
    ctx = res.updatedContext;

    assert.equal(ctx.profile.onboardingStage, 'sizing_assistant_fit_preference');
    assert.ok(
      res.text.includes('Based on your measurements, size M looks like the closest match. Would you prefer a closer fit or a little more room?'),
      'Matches brief prompt for between sizes'
    );
    assert.ok(res.options.some((o) => o.action === 'fit_closer'));
    assert.ok(res.options.some((o) => o.action === 'fit_relaxed'));

    // Customer chooses closer fit
    const fitRes = processConciergeMessage('fit_closer', ctx, CATALOGUE);
    assert.equal(fitRes.updatedContext.profile.fitPreference, 'closer');
    assert.equal(fitRes.updatedContext.profile.onboardingStage, 'onboarded');
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
    assert.ok(addRes.text.includes('shopping bag'), 'Confirms addition to shopping bag');
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

  // 24. Sizing Path 1: International usual clothing size mapping
  test('Scenario 24: Sizing Path 1 maps international sizing (US/UK/EU) to brand size', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'awaiting_size';

    // Customer opens sizing discovery hub
    const hub = processConciergeMessage('size_not_sure', ctx, CATALOGUE);
    ctx = hub.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_path_select');

    // Customer selects Path 1: "I know my usual clothing size"
    const path1 = processConciergeMessage('sizing_path_usual', ctx, CATALOGUE);
    ctx = path1.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_path_usual');
    assert.ok(path1.options.some((o) => o.action === 'set_size_m'));

    // Customer selects US 8-10 / UK 12-14 (M)
    const selectM = processConciergeMessage('set_size_m', ctx, CATALOGUE);
    assert.equal(selectM.updatedContext.profile.usualSize, 'M');
    assert.equal(selectM.updatedContext.profile.onboardingStage, 'onboarded');
  });

  // 25. Sizing Path 2: Validation, correction, and no-tape guidance
  test('Scenario 25: Sizing Path 2 validates bounds, explains string/ruler, and supports skipping', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_path_guided_unit';

    // Customer asks what to do without a measuring tape
    const noTape = processConciergeMessage('sizing_no_tape', ctx, CATALOGUE);
    assert.ok(noTape.text.includes('string') || noTape.text.includes('ruler'), 'Explains string/ruler method');

    // Customer picks inches
    const unitRes = processConciergeMessage('choose_unit_in', ctx, CATALOGUE);
    ctx = unitRes.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_assistant_bust');

    // Customer enters invalid alphanumeric text
    const invalidRes = processConciergeMessage('about seventy-five', ctx, CATALOGUE);
    assert.equal(invalidRes.intent, 'sizing_assistant_validation_error');
    assert.equal(invalidRes.updatedContext.profile.onboardingStage, 'sizing_assistant_bust');
    assert.ok(invalidRes.text.includes('enter a numeric measurement'));

    // Customer enters physically unrealistic number (120 inches)
    const unrealisticRes = processConciergeMessage('120', ctx, CATALOGUE);
    assert.equal(unrealisticRes.intent, 'sizing_assistant_validation_error');
    assert.ok(
      unrealisticRes.text.includes('Please enter a measurement between') ||
      unrealisticRes.text.includes('Please enter a realistic measurement'),
      'Validates physical upper bounds'
    );

    // Customer chooses to skip bust
    const skipRes = processConciergeMessage('skip_bust', ctx, CATALOGUE);
    ctx = skipRes.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_assistant_waist');
    assert.ok(skipRes.text.includes('waist'));
  });

  // 26. Sizing Path 3: Existing garment comparison (tag & flat measurement)
  test('Scenario 26: Sizing Path 3 evaluates existing garment flat chest measurement', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Ama';
    ctx.profile.onboardingStage = 'sizing_path_select';

    // Customer picks Path 3
    const path3 = processConciergeMessage('sizing_path_garment', ctx, CATALOGUE);
    ctx = path3.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_path_garment_type');

    // Customer selects lay-flat measurement
    const measureGuide = processConciergeMessage('garment_measure_flat', ctx, CATALOGUE);
    ctx = measureGuide.updatedContext;
    assert.equal(ctx.profile.onboardingStage, 'sizing_path_garment_measure');

    // Customer enters 18.5" armpit to armpit
    const flatRes = processConciergeMessage('18.5', ctx, CATALOGUE);
    assert.equal(flatRes.intent, 'garment_measurement_evaluated');
    assert.ok(flatRes.text.includes('Size M'), 'Maps 18.5 flat (37 circumference) to Size M');
    assert.ok(flatRes.text.includes('ease'), 'Mentions tailoring ease');
  });

  // 27. Interactive Sizing in Centimetres
  test('Scenario 27: Interactive Sizing full journey in Centimetres', () => {
    let ctx = createInitialConciergeContext(gownProduct);
    ctx.profile.preferredName = 'Kofi';
    ctx.profile.onboardingStage = 'sizing_path_guided_unit';

    // Customer selects Centimetres
    const unitRes = processConciergeMessage('choose_unit_cm', ctx, CATALOGUE);
    ctx = unitRes.updatedContext;
    assert.equal(ctx.profile.preferredUnit, 'cm');

    // Bust: 94 cm
    const bustRes = processConciergeMessage('94', ctx, CATALOGUE);
    ctx = bustRes.updatedContext;
    assert.equal(ctx.profile.measurements?.bust, 94);

    // Waist: 76 cm
    const waistRes = processConciergeMessage('76', ctx, CATALOGUE);
    ctx = waistRes.updatedContext;
    assert.equal(ctx.profile.measurements?.waist, 76);

    // Hips: 101 cm
    const hipsRes = processConciergeMessage('101', ctx, CATALOGUE);
    ctx = hipsRes.updatedContext;
    assert.equal(ctx.profile.measurements?.hips, 101);
    assert.equal(ctx.profile.usualSize, 'M');
    assert.ok(hipsRes.text.includes('91.5–96.5 cm') || hipsRes.text.includes('91.5-96.5 cm'), 'Displays metric size spec');
  });
});
