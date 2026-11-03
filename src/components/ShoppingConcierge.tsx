/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA — Personal Shopping Concierge
 * Sleek, in-browser, privacy-first shopping assistant for Nnepa Foriwaa.
 *
 * PRIVACY GUARANTEE:
 * • 100% client-side execution in the visitor's browser.
 * • Zero external LLM API calls (no OpenAI, Gemini, Claude, or third-party bots).
 * • Zero analytics, tracking, or telemetry.
 * • Zero persistent browser storage (no localStorage, sessionStorage, IndexedDB, or cookies for chat).
 * • Temporary in-memory conversation state is strictly cleared when the chatbot closes or the page reloads.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  MessageSquare,
  Ruler,
  ShoppingBag,
  Lock,
  ChevronRight,
  RotateCcw,
  Send,
  Truck,
  HeartHandshake
} from 'lucide-react';
import type { Product } from '../types.ts';
import {
  processConciergeMessage,
  createInitialConciergeContext,
  type ConversationContext,
  type ConciergeActionOption
} from '../concierge/engine/conciergeEngine.ts';
import ConciergeMessageRenderer from '../concierge/components/ConciergeMessageRenderer.tsx';
import { PROACTIVE_PROMPTS, NNEPA_IDENTITY } from '../concierge/knowledge/index.ts';

export interface ShoppingConciergeProps {
  currentPage: string;
  activeProduct?: Product | null;
  products: Product[];
  cartItemsCount: number;
  isCartOpen?: boolean;
  onNavigate: (page: string, category?: 'all' | 'women' | 'men' | 'bags', product?: Product) => void;
  onOpenCart: () => void;
  onOpenSizeChart: () => void;
  onAddToCart?: (product: Product, size?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  timestamp: string;
  options?: ConciergeActionOption[];
  products?: Product[];
}

export default function ShoppingConcierge({
  currentPage,
  activeProduct,
  products,
  cartItemsCount,
  isCartOpen = false,
  onNavigate,
  onOpenCart,
  onOpenSizeChart,
  onAddToCart
}: ShoppingConciergeProps) {
  // ═══ CHAT STATE (STRICTLY IN-MEMORY • ZERO PERSISTENCE) ═══
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const isAddingToCartRef = useRef(false);
  
  // Conversation engine context (in-memory)
  const contextRef = useRef<ConversationContext>(createInitialConciergeContext(activeProduct ?? null));

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitialWelcomeMessage = (): ChatMessage => ({
    id: 'welcome_init',
    sender: 'concierge',
    text: `Hello! I’m NNEPA, your personal shopping assistant. It’s lovely to have you here. What would you like me to call you?`,
    timestamp: getTimeString(),
    options: [
      { label: 'Browse Collections Directly', action: 'skip_onboarding' }
    ]
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialWelcomeMessage()]);

  // Keep engine context updated with storefront product navigation
  useEffect(() => {
    if (activeProduct) {
      contextRef.current.focusedProduct = activeProduct;
      contextRef.current.activeCategory = activeProduct.category;
    }
  }, [activeProduct]);

  // Proactive notification state
  const [proactivePrompt, setProactivePrompt] = useState<{
    id: string;
    text: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // In-memory set of dismissed proactive prompt IDs (resets on page reload)
  const dismissedPromptsRef = useRef<Set<string>>(new Set());
  
  // Previous cart items count to detect additions
  const prevCartCountRef = useRef(cartItemsCount);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Timers ref for clean teardown
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  const addTimer = (timer: NodeJS.Timeout) => {
    activeTimersRef.current.push(timer);
  };

  const clearAllTimers = () => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
  };

  // Scroll to bottom of chat smoothly when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // ═══ PRIVACY: CLEAR TEMPORARY CONVERSATION STATE ON CLOSE ═══
  const handleCloseConcierge = () => {
    setIsOpen(false);
    // As per privacy requirement: "When the chatbot closes or the page reloads, clear its temporary conversation state."
    contextRef.current = createInitialConciergeContext(activeProduct ?? null);
    setMessages([getInitialWelcomeMessage()]);
    setInputValue('');
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseConcierge();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeProduct]);

  // ═══ PROACTIVE TRIGGERS (IN-MEMORY CONTEXT ENGINE) ═══
  useEffect(() => {
    // Hide concierge on administrative views
    if (currentPage === 'admin-login' || currentPage === 'admin-dashboard') {
      setProactivePrompt(null);
      clearAllTimers();
      return;
    }

    clearAllTimers();

    // 1. Homepage Trigger
    if (currentPage === 'home' && !dismissedPromptsRef.current.has('home_welcome')) {
      const t = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has('home_welcome')) {
          setProactivePrompt({
            id: 'home_welcome',
            text: PROACTIVE_PROMPTS.home,
            actionLabel: 'Discover Pieces',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('explore_collections');
            }
          });
        }
      }, 7000);
      addTimer(t);
    }

    // 2. Collection Shop Page Trigger
    if (currentPage === 'shop' && !dismissedPromptsRef.current.has('shop_browse')) {
      const t = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has('shop_browse')) {
          setProactivePrompt({
            id: 'shop_browse',
            text: PROACTIVE_PROMPTS.shop,
            actionLabel: 'View Suggestions',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('find_product');
            }
          });
        }
      }, 9000);
      addTimer(t);
    }

    // 3. Product Details Page Trigger
    if (currentPage === 'details' && activeProduct && !dismissedPromptsRef.current.has(`details_${activeProduct.id}`)) {
      const t1 = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has(`details_${activeProduct.id}`)) {
          setProactivePrompt({
            id: `details_${activeProduct.id}`,
            text: PROACTIVE_PROMPTS.productDetails,
            actionLabel: 'Size & Fit Advice',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('size_guide');
            }
          });
        }
      }, 10000);
      addTimer(t1);

      // 4. Product browsing idle trigger (approximately 28 seconds without adding to cart)
      const t2 = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has(`idle_${activeProduct.id}`)) {
          setProactivePrompt({
            id: `idle_${activeProduct.id}`,
            text: PROACTIVE_PROMPTS.productIdle,
            actionLabel: 'Ask NNEPA',
            onAction: () => {
              setIsOpen(true);
              dispatchToEngine(`Tell me about the ${activeProduct.name}`);
            }
          });
        }
      }, 28000);
      addTimer(t2);
    }

    // 5. Checkout or Cart Trigger
    if ((currentPage === 'checkout' || isCartOpen) && !dismissedPromptsRef.current.has('checkout_guide')) {
      const t = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has('checkout_guide')) {
          setProactivePrompt({
            id: 'checkout_guide',
            text: PROACTIVE_PROMPTS.cartOrCheckout,
            actionLabel: 'Checkout Help',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('how_to_order');
            }
          });
        }
      }, 4000);
      addTimer(t);
    }

    return () => {
      clearAllTimers();
    };
  }, [currentPage, activeProduct, isOpen, isCartOpen]);

  // 6. Proactive Add-To-Cart Detection
  useEffect(() => {
    if (cartItemsCount > prevCartCountRef.current) {
      if (!dismissedPromptsRef.current.has('after_add_to_cart')) {
        setProactivePrompt({
          id: 'after_add_to_cart',
          text: PROACTIVE_PROMPTS.afterAddToCart,
          actionLabel: 'Review Bag & Order',
          onAction: () => {
            onOpenCart();
            dismissProactivePrompt();
          }
        });
      }
    }
    prevCartCountRef.current = cartItemsCount;
  }, [cartItemsCount]);

  const dismissProactivePrompt = () => {
    if (proactivePrompt) {
      dismissedPromptsRef.current.add(proactivePrompt.id);
      setProactivePrompt(null);
    }
  };

  // ═══ DISPATCH USER INQUIRY TO CONCIERGE ENGINE ═══
  const dispatchToEngine = (userText: string, displayLabel?: string) => {
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: displayLabel || userText,
      timestamp: getTimeString()
    };

    const engineResponse = processConciergeMessage(
      userText,
      contextRef.current,
      products
    );

    // Update in-memory context reference
    contextRef.current = engineResponse.updatedContext;

    const botMsg: ChatMessage = {
      id: 'bot_' + (Date.now() + 1),
      sender: 'concierge',
      text: engineResponse.text,
      timestamp: getTimeString(),
      options: engineResponse.options,
      products: engineResponse.products
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // ═══ INTERACTIVE ACTIONS & PREDEFINED OPTIONS ═══
  const handleOptionClick = (action: string, payload?: any, label?: string) => {
    switch (action) {
      case 'main_menu':
        dispatchToEngine('Show main menu');
        break;

      case 'explore_collections':
        setMessages((prev) => [
          ...prev,
          {
            id: 'usr_' + Date.now(),
            sender: 'user',
            text: 'Explore Collections',
            timestamp: getTimeString()
          },
          {
            id: 'bot_' + (Date.now() + 1),
            sender: 'concierge',
            text: 'Which collection would you like to view?',
            timestamp: getTimeString(),
            options: [
              { label: 'Womenswear', action: 'filter_women' },
              { label: 'Menswear', action: 'filter_men' },
              { label: 'Bags & Accessories', action: 'filter_bags' },
              { label: 'All Items', action: 'filter_all' }
            ]
          }
        ]);
        break;

      case 'filter_women':
        onNavigate('shop', 'women');
        dispatchToEngine('Explore womenswear');
        break;

      case 'filter_men':
        onNavigate('shop', 'men');
        dispatchToEngine('Explore menswear');
        break;

      case 'filter_bags':
        onNavigate('shop', 'bags');
        dispatchToEngine('Explore bags');
        break;

      case 'filter_all':
        onNavigate('shop', 'all');
        dispatchToEngine('Show all boutique garments');
        break;

      case 'find_product':
        dispatchToEngine('Help me find a garment');
        break;

      case 'size_guide':
        dispatchToEngine('Size and length guide');
        break;

      case 'open_size_chart':
        onOpenSizeChart();
        setMessages((prev) => [
          ...prev,
          {
            id: 'usr_' + Date.now(),
            sender: 'user',
            text: 'Open Size Chart',
            timestamp: getTimeString()
          },
          {
            id: 'bot_' + (Date.now() + 1),
            sender: 'concierge',
            text: 'I have opened the Size Chart and Length Guide for you. You can review measurements across US, UK, and EU standards.',
            timestamp: getTimeString(),
            options: [
              { label: 'Return to Shopping', action: 'filter_all' },
              { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
            ]
          }
        ]);
        break;

      case 'delivery_info':
        dispatchToEngine('Tell me about delivery and shipping');
        break;

      case 'how_to_order':
        dispatchToEngine('How to place an order');
        break;

      case 'open_bag':
        onOpenCart();
        setMessages((prev) => [
          ...prev,
          {
            id: 'usr_' + Date.now(),
            sender: 'user',
            text: 'Open Shopping Bag',
            timestamp: getTimeString()
          },
          {
            id: 'bot_' + (Date.now() + 1),
            sender: 'concierge',
            text: 'I have opened your shopping bag. You can review your selected pieces, verify quantities, and proceed to checkout.',
            timestamp: getTimeString(),
            options: [
              { label: 'Proceed to Checkout', action: 'go_to_checkout' },
              { label: 'Continue Shopping', action: 'explore_collections' },
              { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
            ]
          }
        ]);
        break;

      case 'track_order':
        dispatchToEngine('How do I track my order?');
        break;

      case 'book_fitting':
        onNavigate('contact');
        setMessages((prev) => [
          ...prev,
          {
            id: 'usr_' + Date.now(),
            sender: 'user',
            text: 'Book a Fitting',
            timestamp: getTimeString()
          },
          {
            id: 'bot_' + (Date.now() + 1),
            sender: 'concierge',
            text: 'I have navigated you to our Contact page. You can schedule a studio fitting in Accra or connect directly with our tailoring team.',
            timestamp: getTimeString(),
            options: [
              { label: 'Chat on WhatsApp', action: 'contact_whatsapp' },
              { label: 'Main Menu', action: 'main_menu' }
            ]
          }
        ]);
        break;

      case 'navigate_product':
        if (payload) {
          onNavigate('details', undefined, payload);
          contextRef.current.focusedProduct = payload;
          contextRef.current.activeCategory = payload.category;
          setMessages((prev) => [
            ...prev,
            {
              id: 'usr_' + Date.now(),
              sender: 'user',
              text: `View ${payload.name}`,
              timestamp: getTimeString()
            },
            {
              id: 'bot_' + (Date.now() + 1),
              sender: 'concierge',
              text: `Navigated to the **${payload.name}** (GH₵ ${payload.price.toLocaleString()}). What would you like to know about its cut, fabrics, or sizing?`,
              timestamp: getTimeString(),
              options: [
                { label: 'Add to Bag', action: 'order_assistance' },
                { label: 'Size Guide', action: 'size_guide' },
                { label: 'Delivery Details', action: 'delivery_info' },
                { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
              ]
            }
          ]);
        }
        break;

      case 'check_colors':
        dispatchToEngine('Do you have this in another colour?');
        break;

      case 'contact_whatsapp': {
        const prod = contextRef.current.focusedProduct;
        const currentContext = prod ? ` regarding the ${prod.name}` : '';
        const url = `https://wa.me/233538795669?text=${encodeURIComponent(
          `Hello Nnepa Foriwaa! I would like some assistance${currentContext}.`
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setMessages((prev) => [
          ...prev,
          {
            id: 'usr_' + Date.now(),
            sender: 'user',
            text: 'Connect on WhatsApp',
            timestamp: getTimeString()
          },
          {
            id: 'bot_' + (Date.now() + 1),
            sender: 'concierge',
            text: 'Connecting you with our team on WhatsApp (+233 53 879 5669). We are ready to assist with sizing, order inquiries, and styling.',
            timestamp: getTimeString(),
            options: [
              { label: 'Return to Main Menu', action: 'main_menu' },
              { label: 'Continue Browsing', action: 'filter_all' }
            ]
          }
        ]);
        break;
      }

      case 'select_size_for_order': {
        const selectedSize = payload?.size;
        if (selectedSize) {
          contextRef.current.profile.selectedSize = selectedSize;
          contextRef.current.profile.usualSize = contextRef.current.profile.usualSize || selectedSize;
        }
        dispatchToEngine(`select_size_for_order_${selectedSize || ''}`, label);
        break;
      }

      case 'prompt_choose_size': {
        dispatchToEngine('prompt_choose_size');
        break;
      }

      case 'confirm_add_to_cart': {
        if (isAddingToCartRef.current) break;
        isAddingToCartRef.current = true;
        setTimeout(() => {
          isAddingToCartRef.current = false;
        }, 600);

        const prod = payload?.product || contextRef.current.focusedProduct;
        if (!prod) {
          dispatchToEngine('Help me order');
          break;
        }

        if (prod.inStock === false) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'usr_' + Date.now(),
              sender: 'user',
              text: 'Add to bag',
              timestamp: getTimeString()
            },
            {
              id: 'bot_' + (Date.now() + 1),
              sender: 'concierge',
              text: `The **${prod.name}** is currently out of stock. You can contact our store on WhatsApp to check availability, or explore other pieces from the collection.`,
              timestamp: getTimeString(),
              options: [
                { label: 'Chat on WhatsApp', action: 'contact_whatsapp' },
                { label: 'Browse Collections', action: 'filter_all' }
              ]
            }
          ]);
          break;
        }

        const hasSizes = prod.sizes && prod.sizes.length > 0 && !prod.sizes.includes('One Size');
        const chosenSize = payload?.size || contextRef.current.profile.selectedSize || contextRef.current.profile.usualSize;

        if (hasSizes && (!chosenSize || !prod.sizes?.includes(chosenSize))) {
          dispatchToEngine('prompt_choose_size');
          break;
        }

        const finalSize = hasSizes ? chosenSize : 'One Size';

        if (onAddToCart) {
          onAddToCart(prod, finalSize);
        }

        dispatchToEngine('confirm_add_to_cart');
        break;
      }

      case 'go_to_checkout':
        onNavigate('checkout');
        break;

      case 'order_assistance':
        if (payload) {
          contextRef.current.focusedProduct = payload;
          contextRef.current.activeCategory = payload.category;
        }
        dispatchToEngine('Help me order this');
        break;

      case 'check_garment_fit':
        dispatchToEngine('Will this dress fit me?');
        break;

      default:
        dispatchToEngine(action, label);
        break;
    }
  };

  // Handle free-form customer questions
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    setInputValue('');
    dispatchToEngine(query);
  };

  // Hide on admin views
  if (currentPage === 'admin-login' || currentPage === 'admin-dashboard') {
    return null;
  }

  return (
    <>
      {/* ═══ PROACTIVE INVITATION BUBBLE ═══ */}
      {!isOpen && proactivePrompt && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-5 sm:right-6 z-[80] max-w-[320px] sm:max-w-[350px] bg-white rounded-2xl shadow-xl border border-zinc-200/90 p-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-plum-dark text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-lavender" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-plum-dark block uppercase tracking-wider">
                  {NNEPA_IDENTITY.name}
                </span>
                <span className="text-[9px] text-zinc-400 block font-light">
                  {NNEPA_IDENTITY.title}
                </span>
              </div>
            </div>
            <button
              onClick={dismissProactivePrompt}
              aria-label="Dismiss assistance"
              className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-zinc-700 mt-2.5 leading-relaxed font-normal">
            {proactivePrompt.text}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {proactivePrompt.actionLabel && proactivePrompt.onAction && (
              <button
                onClick={() => {
                  proactivePrompt.onAction?.();
                  dismissProactivePrompt();
                }}
                className="px-3.5 py-1.5 bg-plum-dark text-white text-[11px] font-semibold rounded-full hover:bg-plum transition-colors cursor-pointer border-none shadow-xs flex items-center gap-1.5"
              >
                <span>{proactivePrompt.actionLabel}</span>
                <ChevronRight className="w-3 h-3 text-lavender" />
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(true);
                dismissProactivePrompt();
              }}
              className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-[11px] font-medium rounded-full hover:bg-zinc-200 transition-colors cursor-pointer border-none"
            >
              Ask NNEPA
            </button>
          </div>
        </div>
      )}

      {/* ═══ FLOATING LAUNCHER BUTTON ═══ */}
      <div className="fixed bottom-6 right-5 sm:right-6 z-[80]">
        <button
          onClick={() => {
            if (isOpen) {
              handleCloseConcierge();
            } else {
              setIsOpen(true);
              if (proactivePrompt) dismissProactivePrompt();
            }
          }}
          aria-label={isOpen ? 'Close NNEPA shopping assistant' : 'Open NNEPA shopping assistant'}
          title={`${NNEPA_IDENTITY.name} — ${NNEPA_IDENTITY.title}`}
          className="relative w-14 h-14 rounded-full bg-plum-dark hover:bg-plum text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer border border-plum/30 group"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 text-white" />
              {/* Subtle pulse indicator when a proactive prompt is active */}
              {proactivePrompt && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse" />
              )}
            </>
          )}
        </button>
      </div>

      {/* ═══ CONCIERGE CHAT WINDOW ═══ */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={`${NNEPA_IDENTITY.name} — ${NNEPA_IDENTITY.title}`}
          className="fixed bottom-24 right-4 sm:right-6 z-[85] w-[calc(100vw-2rem)] sm:w-[390px] h-[calc(100dvh-7rem)] sm:h-[590px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 overscroll-contain"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-plum-dark via-plum to-plum-dark text-white p-4 flex items-center justify-between shrink-0 border-b border-plum/40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lavender border border-white/20">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide text-white leading-tight">
                  {NNEPA_IDENTITY.name}
                </h3>
                <span className="text-[10px] text-lavender/90 flex items-center gap-1 font-light">
                  <ShoppingBag className="w-2.5 h-2.5 text-lavender" />
                  <span>{NNEPA_IDENTITY.title}</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleCloseConcierge}
              aria-label="Close shopping assistant"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Conversation History */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-zinc-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                    msg.sender === 'user'
                      ? 'bg-plum-dark text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <ConciergeMessageRenderer text={msg.text} sender={msg.sender} />
                </div>

                <span className="text-[9px] text-zinc-400 px-1 mt-1 font-mono">
                  {msg.timestamp}
                </span>

                {/* Interactive Product Recommendation Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2.5 grid grid-cols-1 gap-2">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          handleOptionClick('navigate_product', prod);
                        }}
                        className="bg-white p-2 rounded-xl border border-zinc-200 hover:border-plum-dark flex items-center gap-3 cursor-pointer transition-all shadow-xs hover:shadow-sm"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-16 object-cover rounded-lg bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-semibold text-zinc-900 text-[11px] truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                            {prod.category}
                          </span>
                          <span className="text-[11px] font-bold text-plum-dark block mt-0.5">
                            GH₵ {prod.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionClick('order_assistance', prod);
                            }}
                            className="px-2.5 py-1 bg-plum-dark text-white hover:bg-plum rounded text-[10px] font-medium transition-colors cursor-pointer border-none"
                          >
                            Add to Bag
                          </button>
                          <div className="px-2 py-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded text-[10px] font-medium transition-colors">
                            View
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Predefined Action Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 w-full">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt.action, opt.payload, opt.label)}
                        className="px-3 py-1.5 bg-white border border-lilac/40 hover:border-plum-dark hover:bg-lavender/10 text-plum-dark rounded-full text-[10.5px] font-medium transition-all cursor-pointer shadow-xs text-left break-words max-w-full leading-snug"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[10px]">
            <button
              onClick={() => handleOptionClick('size_guide')}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full whitespace-nowrap border-none cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Ruler className="w-3 h-3 text-lavender" />
              <span>Size Guide</span>
            </button>
            <button
              onClick={() => handleOptionClick('delivery_info')}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full whitespace-nowrap border-none cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Truck className="w-3 h-3 text-lavender" />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => handleOptionClick('contact_whatsapp')}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full whitespace-nowrap border-none cursor-pointer flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3 text-lavender" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleOptionClick('main_menu')}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full whitespace-nowrap border-none cursor-pointer flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-lavender" />
              <span>Menu</span>
            </button>
          </div>

          {/* User Input Field */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                contextRef.current.profile.onboardingStage === 'awaiting_name'
                  ? 'What would you like me to call you? (e.g. Ama)'
                  : contextRef.current.profile.onboardingStage === 'sizing_label_inquiry'
                  ? 'Enter label size (e.g. M, UK 12, or US 8)...'
                  : 'Ask NNEPA about sizes, fabrics, delivery...'
              }
              className="flex-1 px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-full text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-plum-dark focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send question to NNEPA"
              className="w-8 h-8 rounded-full bg-plum-dark text-white flex items-center justify-center shrink-0 border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-plum transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
