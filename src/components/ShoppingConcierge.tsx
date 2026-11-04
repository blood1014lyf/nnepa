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
import FloatingWelcomeNotification from './FloatingWelcomeNotification.tsx';

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

/**
 * Real-time seasonal greeting.
 * Only returns a seasonal greeting when it is due in real time (e.g. holiday season Dec 15 through Jan 6).
 */
function getSeasonalGreeting(): string | null {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  const date = now.getDate();
  if ((month === 11 && date >= 15) || (month === 0 && date <= 6)) {
    return "Season's Greetings";
  }
  return null;
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
  
  const initContext = () => {
    const ctx = createInitialConciergeContext(activeProduct ?? null);
    ctx.profile.onboardingStage = 'onboarded';
    return ctx;
  };

  // Conversation engine context (in-memory)
  const contextRef = useRef<ConversationContext>(initContext());

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitialWelcomeMessage = (): ChatMessage => ({
    id: 'welcome_init',
    sender: 'concierge',
    text: "Akwaaba! I'm Foriwaa, your shopping assistant. How can I help today?",
    timestamp: getTimeString(),
    options: [
      { label: 'Browse Collections', action: 'explore_collections' },
      { label: 'Find My Size', action: 'sizing_path_select' },
      { label: 'Delivery & Shipping', action: 'delivery_info' },
      { label: 'Chat with Stylist', action: 'connect_human' }
    ]
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialWelcomeMessage()]);
  const [isThinking, setIsThinking] = useState(false);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  const seasonalGreeting = getSeasonalGreeting();

  const addTimer = (timer: NodeJS.Timeout) => {
    activeTimersRef.current.push(timer);
  };

  const clearAllTimers = () => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
  };

  // Scroll to bottom of chat smoothly when messages change without jumping background page
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isOpen, isThinking]);

  // Lock background body scrolling on mobile when chat is actively open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      if (window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // ═══ SESSION HANDLING: PRESERVE CONVERSATION ON CLOSE ═══
  // When closing, simply hide the window; keep conversation and context intact
  const handleCloseConcierge = () => {
    setIsOpen(false);
  };

  // Separate, intentional action to start a fresh new conversation
  const handleStartNewChat = () => {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setIsThinking(false);
    contextRef.current = initContext();
    setMessages([getInitialWelcomeMessage()]);
    setInputValue('');
  };

  // Close on Escape key without wiping conversation
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
      const isOos = activeProduct.inStock === false;
      const t1 = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has(`details_${activeProduct.id}`)) {
          setProactivePrompt({
            id: `details_${activeProduct.id}`,
            text: isOos ? PROACTIVE_PROMPTS.productOutOfStock : PROACTIVE_PROMPTS.productDetails,
            actionLabel: isOos ? 'Speak to Stylist' : 'Size & Fit Advice',
            onAction: () => {
              setIsOpen(true);
              if (isOos) {
                dispatchToEngine(`Is the ${activeProduct.name} in stock?`);
              } else {
                handleOptionClick('size_guide');
              }
            }
          });
        }
      }, isOos ? 3000 : 10000);
      addTimer(t1);

      // 4. Product browsing idle trigger (approximately 28 seconds without adding to cart)
      const t2 = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has(`idle_${activeProduct.id}`)) {
          setProactivePrompt({
            id: `idle_${activeProduct.id}`,
            text: PROACTIVE_PROMPTS.productIdle,
            actionLabel: 'Ask Foriwaa',
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
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: displayLabel || userText,
      timestamp: getTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // Natural 1.8-second thinking delay to simulate thoughtful personal shopping concierge
    thinkingTimerRef.current = setTimeout(() => {
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

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
      thinkingTimerRef.current = null;
    }, 1800);
  };

  const dispatchCustomBotResponse = (
    userLabel: string,
    botText: string,
    botOptions?: ConciergeActionOption[],
    sideEffect?: () => void
  ) => {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userLabel,
      timestamp: getTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    if (sideEffect) sideEffect();

    thinkingTimerRef.current = setTimeout(() => {
      const botMsg: ChatMessage = {
        id: 'bot_' + (Date.now() + 1),
        sender: 'concierge',
        text: botText,
        timestamp: getTimeString(),
        options: botOptions
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
      thinkingTimerRef.current = null;
    }, 1500);
  };

  // ═══ INTERACTIVE ACTIONS & PREDEFINED OPTIONS ═══
  const handleOptionClick = (action: string, payload?: any, label?: string) => {
    switch (action) {
      case 'main_menu':
        dispatchToEngine('Show main menu', 'Main Menu');
        break;

      case 'connect_human':
        dispatchToEngine('connect_human', label || 'Chat with Stylist');
        break;

      case 'start_size_assistance':
      case 'sizing_path_select':
        dispatchToEngine('sizing_path_select', label || 'Find My Size');
        break;

      case 'sizing_guided_start':
        dispatchToEngine('sizing_guided_start', label || 'Enter Measurements');
        break;

      case 'sizing_intl_start':
        dispatchToEngine('sizing_intl_start', label || 'UK / US / EU Conversion');
        break;

      case 'explore_collections':
        dispatchCustomBotResponse(
          'Explore Collections',
          'Which collection would you like to view?',
          [
            { label: 'Womenswear', action: 'filter_women' },
            { label: 'Menswear', action: 'filter_men' },
            { label: 'Bags & Accessories', action: 'filter_bags' },
            { label: 'All Items', action: 'filter_all' }
          ]
        );
        break;

      case 'filter_women':
        onNavigate('shop', 'women');
        dispatchToEngine('Explore womenswear', 'Womenswear');
        break;

      case 'filter_men':
        onNavigate('shop', 'men');
        dispatchToEngine('Explore menswear', 'Menswear');
        break;

      case 'filter_bags':
        onNavigate('shop', 'bags');
        dispatchToEngine('Explore bags', 'Bags & Accessories');
        break;

      case 'filter_all':
        onNavigate('shop', 'all');
        dispatchToEngine('Show all boutique garments', 'All Items');
        break;

      case 'find_product':
        dispatchToEngine('Help me find a garment', 'Find a Garment');
        break;

      case 'size_guide':
        dispatchToEngine('Size and length guide', 'Size Guide');
        break;

      case 'open_size_chart':
        dispatchCustomBotResponse(
          'Open Size Chart',
          'I have opened the Size Chart and Length Guide for you. You can review measurements across US, UK, and EU standards.',
          [
            { label: 'Return to Shopping', action: 'filter_all' },
            { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
          ],
          () => onOpenSizeChart()
        );
        break;

      case 'delivery_info':
        dispatchToEngine('Tell me about delivery and shipping', 'Delivery Info');
        break;

      case 'how_to_order':
        dispatchToEngine('How to place an order', 'How to Order');
        break;

      case 'open_bag':
        dispatchCustomBotResponse(
          'Open Shopping Bag',
          'I have opened your shopping bag. You can review your selected pieces, verify quantities, and proceed to checkout.',
          [
            { label: 'Proceed to Checkout', action: 'go_to_checkout' },
            { label: 'Continue Shopping', action: 'explore_collections' },
            { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
          ],
          () => onOpenCart()
        );
        break;

      case 'track_order':
        dispatchToEngine('How do I track my order?', 'Track Order');
        break;

      case 'book_fitting':
        dispatchCustomBotResponse(
          'Book a Fitting',
          'I have navigated you to our Contact page. You can schedule a studio fitting in Accra or connect directly with our tailoring team.',
          [
            { label: 'Chat on WhatsApp', action: 'contact_whatsapp' },
            { label: 'Main Menu', action: 'main_menu' }
          ],
          () => onNavigate('contact')
        );
        break;

      case 'navigate_product':
        if (payload) {
          onNavigate('details', undefined, payload);
          contextRef.current.focusedProduct = payload;
          contextRef.current.activeCategory = payload.category;
          dispatchCustomBotResponse(
            `View ${payload.name}`,
            `Navigated to the **${payload.name}** (GH₵ ${payload.price.toLocaleString()}). What would you like to know about its cut, fabrics, or sizing?`,
            [
              { label: 'Add to Bag', action: 'confirm_add_to_cart', payload: { product: payload } },
              { label: 'Size Guide', action: 'size_guide' },
              { label: 'Delivery Details', action: 'delivery_info' },
              { label: 'Chat on WhatsApp', action: 'contact_whatsapp' }
            ]
          );
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

        const prod = payload?.product || (payload?.id ? payload : undefined) || contextRef.current.focusedProduct;
        if (!prod) {
          dispatchToEngine('Help me order');
          break;
        }

        contextRef.current.focusedProduct = prod;
        contextRef.current.activeCategory = prod.category;
        contextRef.current.profile.selectedProduct = prod;

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
              text:
                `The **${prod.name}** is currently out of stock.\n\n` +
                `Please check back soon for restocks, or speak directly with our stylist on WhatsApp to commission a custom outfit tailored to your measurements.`,
              timestamp: getTimeString(),
              options: [
                { label: 'Speak to Stylist for Custom Outfit', action: 'contact_whatsapp' },
                { label: 'Browse Collections', action: 'filter_all' }
              ]
            }
          ]);
          break;
        }

        const hasSizes = prod.sizes && prod.sizes.length > 0 && !prod.sizes.includes('One Size');
        const chosenSize =
          payload?.size ||
          contextRef.current.profile.selectedSize ||
          contextRef.current.profile.usualSize ||
          (hasSizes ? (prod.sizes.includes('M') ? 'M' : prod.sizes[0]) : 'One Size');

        contextRef.current.profile.selectedSize = chosenSize;
        const finalSize = hasSizes ? chosenSize : 'One Size';

        if (onAddToCart) {
          onAddToCart(prod, finalSize);
        }

        dispatchToEngine('confirm_add_to_cart', label || 'Add to Bag');
        break;
      }

      case 'go_to_checkout':
        setIsOpen(false);
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
    if (!query || isThinking) return;

    setInputValue('');
    dispatchToEngine(query);
  };

  // Hide on admin views
  if (currentPage === 'admin-login' || currentPage === 'admin-dashboard') {
    return null;
  }

  return (
    <>
      {/* ═══ COMPACT FLOATING WELCOME NOTIFICATION WITH LIVE COUNTDOWN & ROTATING GREETINGS ═══ */}
      <FloatingWelcomeNotification
        isOpen={isOpen}
        onOpenChat={(payload) => {
          setIsOpen(true);
          if (payload && payload !== 'open_chat') {
            handleOptionClick(payload);
          }
        }}
      />

      {/* ═══ CONTEXTUAL ACTION PROMPT (e.g. After Add to Bag) ═══ */}
      {!isOpen && proactivePrompt && proactivePrompt.id === 'after_add_to_cart' && (
        <aside
          role="status"
          aria-live="polite"
          className="concierge-root fixed z-[83] bottom-20 right-3 sm:right-6 sm:bottom-22 w-[calc(100vw-1.5rem)] max-w-[310px] sm:w-[310px] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-lilac/30 p-3 sm:p-3.5 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 select-none"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-plum-dark text-white flex items-center justify-center shrink-0 font-serif font-bold text-[9px] shadow-2xs">
                NF
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-plum-dark/85 truncate">
                Shopping Bag
              </span>
            </div>
            <button
              onClick={dismissProactivePrompt}
              aria-label="Dismiss assistance"
              className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-[12px] text-zinc-800 mt-2 leading-relaxed font-medium">
            {proactivePrompt.text}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5">
            {proactivePrompt.actionLabel && proactivePrompt.onAction && (
              <button
                onClick={() => {
                  proactivePrompt.onAction?.();
                  dismissProactivePrompt();
                }}
                className="px-2.5 py-1 bg-plum-dark text-white text-[11px] font-semibold rounded-full hover:bg-plum transition-colors cursor-pointer border-none shadow-2xs flex items-center gap-1 shrink-0 active:scale-95"
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
              className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[11px] font-medium rounded-full hover:bg-zinc-200 transition-colors cursor-pointer border-none shrink-0 active:scale-95"
            >
              Ask Foriwaa
            </button>
          </div>
        </aside>
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
          aria-label={isOpen ? 'Close Foriwaa shopping assistant' : 'Open Foriwaa shopping assistant'}
          title={`${NNEPA_IDENTITY.name} — ${NNEPA_IDENTITY.title}`}
          className="relative w-14 h-14 rounded-full bg-plum-dark hover:bg-plum text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer border border-plum/30 group"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <MessageSquare className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* ═══ MOBILE BACKDROP OVERLAY ═══ */}
      {isOpen && (
        <div
          onClick={handleCloseConcierge}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[84] sm:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* ═══ CHAT WINDOW (Mobile: Bottom Sheet / Desktop: Floating Window) ═══ */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nnepa Foriwaa — Shopping Assistant"
          className="concierge-root fixed z-[85] bg-white rounded-2xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-4
            /* Mobile bottom sheet: keeps top website header clearly visible */
            inset-x-2 bottom-2 max-h-[76dvh] h-[72dvh]
            /* Desktop floating window */
            sm:inset-x-auto sm:left-auto sm:right-6 sm:bottom-20 sm:w-[380px] sm:h-[580px] sm:max-h-[82vh]
            overscroll-contain"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          {/* Header: Nnepa Foriwaa + Shopping Assistant (white / light lavender) + Start Over icon button */}
          <div className="bg-gradient-to-r from-plum-dark via-plum to-plum-dark text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-plum/40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 shrink-0 font-serif font-bold text-xs">
                NF
              </div>
              <div>
                <h3 className="concierge-brand-title font-serif text-base font-semibold tracking-wide text-white leading-tight">
                  Nnepa Foriwaa
                </h3>
                <span className="text-xs text-lavender-light/95 font-medium block leading-tight">
                  {isThinking ? 'Thinking...' : 'Shopping Assistant'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleStartNewChat}
                aria-label="Start over with a fresh conversation"
                title="Start over"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white flex items-center justify-center border border-white/20 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                type="button"
                onClick={handleCloseConcierge}
                aria-label="Close shopping assistant"
                title="Close"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Scrollable Conversation History */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-zinc-50/60 overscroll-contain">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[92%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.sender !== 'user' && (
                    <div className="w-6 h-6 rounded-full bg-plum-dark text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs text-[10px] font-serif font-bold border border-plum/30">
                      NF
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 leading-relaxed text-[16px] break-words ${
                      msg.sender === 'user'
                        ? 'bg-plum-dark text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-xs shadow-xs font-normal'
                    }`}
                  >
                    <ConciergeMessageRenderer text={msg.text} sender={msg.sender} />
                  </div>
                </div>

                <span className={`text-[12px] text-zinc-600 px-1 mt-1 font-mono ${msg.sender === 'user' ? 'text-right' : 'text-left pl-8'}`}>
                  {msg.timestamp}
                </span>

                {/* Interactive Product Recommendation Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2.5 grid grid-cols-1 gap-2.5">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          handleOptionClick('navigate_product', prod);
                        }}
                        className="bg-white p-3 rounded-xl border border-zinc-200 hover:border-plum-dark flex items-center gap-3.5 cursor-pointer transition-all shadow-xs hover:shadow-sm"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-14 h-18 object-cover rounded-lg bg-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-semibold text-zinc-900 text-sm truncate">
                            {prod.name}
                          </h4>
                          <span className="text-xs text-zinc-500 uppercase tracking-wider block">
                            {prod.category}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-plum-dark block mt-0.5">
                            GH₵ {prod.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionClick('confirm_add_to_cart', { product: prod }, 'Add to Bag');
                            }}
                            className="px-3 py-1.5 bg-plum-dark text-white hover:bg-plum rounded text-xs font-semibold transition-colors cursor-pointer border-none shadow-2xs"
                          >
                            Add to Bag
                          </button>
                          <div className="px-2.5 py-1.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded text-xs font-medium transition-colors">
                            View
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Predefined Action Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 w-full">
                    {msg.options.slice(0, 6).map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isThinking}
                        onClick={() => handleOptionClick(opt.action, opt.payload, opt.label)}
                        className="min-h-[44px] px-4 py-2.5 bg-white border border-lilac/40 hover:border-plum-dark hover:bg-lavender/10 text-plum-dark rounded-full text-xs sm:text-[13px] font-medium transition-colors cursor-pointer shadow-2xs text-left break-words max-w-full leading-snug flex items-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* ═══ NATURAL CONCIERGE TYPING INDICATOR ═══ */}
            {isThinking && (
              <div className="flex items-end gap-2 animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-full bg-plum-dark text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs text-[10px] font-serif font-bold border border-plum/30">
                  NF
                </div>
                <div className="bg-white text-zinc-700 border border-zinc-200/90 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="text-[13px] text-zinc-600 font-medium mr-1">typing</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-plum-dark animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-plum-dark animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-plum-dark animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Bar — only shown after first message, with at most 3 chips (>= 44px tall, no reset) */}
          {messages.length > 1 && (
            <div className="relative px-3 py-2 bg-white border-t border-zinc-100 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-6">
                <button
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleOptionClick('size_guide')}
                  className="h-11 min-h-[44px] px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 rounded-full whitespace-nowrap border border-zinc-200/80 cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 text-[13px] font-medium shrink-0 active:scale-95"
                >
                  <Ruler className="w-3.5 h-3.5 text-lavender" />
                  <span>Size Guide</span>
                </button>
                <button
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleOptionClick('delivery_info')}
                  className="h-11 min-h-[44px] px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 rounded-full whitespace-nowrap border border-zinc-200/80 cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 text-[13px] font-medium shrink-0 active:scale-95"
                >
                  <Truck className="w-3.5 h-3.5 text-lavender" />
                  <span>Delivery</span>
                </button>
                <button
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleOptionClick('contact_whatsapp')}
                  className="h-11 min-h-[44px] px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 rounded-full whitespace-nowrap border border-zinc-200/80 cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 text-[13px] font-medium shrink-0 active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-lavender" />
                  <span>WhatsApp</span>
                </button>
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
            </div>
          )}

          {/* User Input Field */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-3 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0"
            style={{
              paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))'
            }}
          >
            <input
              type="text"
              value={inputValue}
              disabled={isThinking}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isThinking ? 'Foriwaa is typing...' : 'Ask a question...'}
              className="flex-1 px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-full text-base text-zinc-900 placeholder-zinc-500 outline-none focus:border-plum-dark focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed font-normal"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              aria-label="Send question to Foriwaa"
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-none transition-all shadow-xs ${
                inputValue.trim() && !isThinking
                  ? 'bg-plum-dark hover:bg-plum text-white cursor-pointer active:scale-95'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
