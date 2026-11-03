/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  MessageSquare,
  Ruler,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Send,
  HelpCircle,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { Product } from '../types.ts';

export interface ShoppingConciergeProps {
  currentPage: string;
  activeProduct?: Product | null;
  products: Product[];
  cartItemsCount: number;
  onNavigate: (page: string, category?: 'all' | 'women' | 'men' | 'bags', product?: Product) => void;
  onOpenCart: () => void;
  onOpenSizeChart: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  timestamp: string;
  options?: Array<{ label: string; action: string; payload?: any }>;
  products?: Product[];
}

export default function ShoppingConcierge({
  currentPage,
  activeProduct,
  products,
  cartItemsCount,
  onNavigate,
  onOpenCart,
  onOpenSizeChart
}: ShoppingConciergeProps) {
  // ═══ CHAT STATE (STRICTLY IN-MEMORY • ZERO PERSISTENCE) ═══
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
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

  // Timers ref for proper cleanup
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  const addTimer = (timer: NodeJS.Timeout) => {
    activeTimersRef.current.push(timer);
  };

  const clearAllTimers = () => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
  };

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Scroll to bottom of chat smoothly when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initial welcome message inside chat window
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_init',
          sender: 'concierge',
          text: 'Welcome to Nnepa Foriwaa. I am your personal shopping concierge. How may I assist you with our bespoke African luxury collection today?',
          timestamp: getTimeString(),
          options: [
            { label: '✨ Explore Collections', action: 'explore_collections' },
            { label: '👗 Find a Garment', action: 'find_product' },
            { label: '📏 Size & Length Guide', action: 'size_guide' },
            { label: '📦 Delivery & Ordering', action: 'delivery_info' },
            { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' }
          ]
        }
      ]);
    }
  }, []);

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
            text: 'Welcome. Looking for something special? I’m here to help.',
            actionLabel: 'Discover Pieces',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('explore_collections');
            }
          });
        }
      }, 7000); // 7s delay
      addTimer(t);
    }

    // 2. Collection Shop Page Trigger
    if (currentPage === 'shop' && !dismissedPromptsRef.current.has('shop_browse')) {
      const t = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has('shop_browse')) {
          setProactivePrompt({
            id: 'shop_browse',
            text: 'Would you like help discovering something from this collection?',
            actionLabel: 'View Suggestions',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('find_product');
            }
          });
        }
      }, 10000); // 10s delay
      addTimer(t);
    }

    // 3. Product Details Page Trigger
    if (currentPage === 'details' && activeProduct && !dismissedPromptsRef.current.has(`details_${activeProduct.id}`)) {
      const t1 = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has(`details_${activeProduct.id}`)) {
          setProactivePrompt({
            id: `details_${activeProduct.id}`,
            text: `Interested in the ${activeProduct.name}? I can help with sizing, fit and ordering.`,
            actionLabel: 'Size & Fit Advice',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('size_guide');
            }
          });
        }
      }, 12000); // 12s delay
      addTimer(t1);

      // 4. Product browsing idle trigger (25-30s without adding to cart)
      const t2 = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has(`idle_${activeProduct.id}`)) {
          setProactivePrompt({
            id: `idle_${activeProduct.id}`,
            text: 'Would you like a little help deciding?',
            actionLabel: 'Ask Concierge',
            onAction: () => {
              setIsOpen(true);
              appendUserAndBotReply(
                'I would like help deciding on this piece.',
                `The **${activeProduct.name}** (GH₵ ${activeProduct.price.toLocaleString()}) is cut with authentic Ghanaian craftsmanship. We offer free bespoke adjustments for custom length and proportions. Would you like to check the Size Chart or speak directly with our atelier?`,
                [
                  { label: '📏 View Size Chart', action: 'open_size_chart' },
                  { label: '💬 WhatsApp Atelier', action: 'contact_whatsapp' }
                ]
              );
            }
          });
        }
      }, 28000); // 28s delay
      addTimer(t2);
    }

    // 5. Cart / Checkout Page Trigger
    if (currentPage === 'checkout' && !dismissedPromptsRef.current.has('checkout_guide')) {
      const t = setTimeout(() => {
        if (!isOpen && !dismissedPromptsRef.current.has('checkout_guide')) {
          setProactivePrompt({
            id: 'checkout_guide',
            text: 'Ready to complete your order? I can guide you through checkout.',
            actionLabel: 'Checkout Help',
            onAction: () => {
              setIsOpen(true);
              handleOptionClick('how_to_order');
            }
          });
        }
      }, 5000);
      addTimer(t);
    }

    return () => {
      clearAllTimers();
    };
  }, [currentPage, activeProduct, isOpen]);

  // 6. Proactive Add-To-Cart Detection
  useEffect(() => {
    if (cartItemsCount > prevCartCountRef.current) {
      // Cart items increased
      if (!dismissedPromptsRef.current.has('after_add_to_cart')) {
        setProactivePrompt({
          id: 'after_add_to_cart',
          text: 'Your selection has been added to your bag. Would you like help completing your order?',
          actionLabel: 'View Bag & Checkout',
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

  // ═══ DECISION TREE LOGIC & RESPONSES ═══
  const appendUserAndBotReply = (
    userText: string,
    botText: string,
    options?: Array<{ label: string; action: string; payload?: any }>,
    recommendedProducts?: Product[]
  ) => {
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: getTimeString()
    };

    const botMsg: ChatMessage = {
      id: 'bot_' + (Date.now() + 1),
      sender: 'concierge',
      text: botText,
      timestamp: getTimeString(),
      options: options || [
        { label: '✨ Main Menu', action: 'main_menu' },
        { label: '💬 WhatsApp Atelier', action: 'contact_whatsapp' }
      ],
      products: recommendedProducts
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleOptionClick = (action: string, payload?: any) => {
    switch (action) {
      case 'main_menu':
        appendUserAndBotReply(
          'Main Menu',
          'How can I guide your experience today? Please select an option:',
          [
            { label: '✨ Explore Collections', action: 'explore_collections' },
            { label: '👗 Find a Garment', action: 'find_product' },
            { label: '📏 Size & Length Guide', action: 'size_guide' },
            { label: '📦 Delivery & Ordering', action: 'delivery_info' },
            { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' }
          ]
        );
        break;

      case 'explore_collections':
        appendUserAndBotReply(
          'Explore Collections',
          'Nnepa Foriwaa offers three distinguished luxury directions. Which world would you like to explore?',
          [
            { label: "Women's Haute Couture", action: 'filter_women' },
            { label: "Men's Luxury Kaftans & Agbadas", action: 'filter_men' },
            { label: "All Boutique Garments", action: 'filter_all' }
          ]
        );
        break;

      case 'filter_women':
        onNavigate('shop', 'women');
        appendUserAndBotReply(
          "Women's Haute Couture",
          "I've navigated you to our Women's Haute Couture collection featuring hand-tailored boubous, structured peplum suits, and organza gowns. Would you like assistance choosing a size?",
          [
            { label: '📏 Sizing & Length Guide', action: 'size_guide' },
            { label: '✨ Explore More Collections', action: 'explore_collections' }
          ]
        );
        break;

      case 'filter_men':
        onNavigate('shop', 'men');
        appendUserAndBotReply(
          "Men's Luxury Kaftans & Agbadas",
          "Navigated to our Men's Collection featuring regal Agbadas, tailored Kaftans, and Sokoto trousers. Every piece is cut with majestic, comfortable ease.",
          [
            { label: '📏 Men\'s Size & Length Guide', action: 'size_guide' },
            { label: '📦 Ordering Details', action: 'how_to_order' }
          ]
        );
        break;

      case 'filter_all':
        onNavigate('shop', 'all');
        appendUserAndBotReply(
          "All Boutique Garments",
          "Displaying the complete Nnepa Foriwaa boutique catalog. Tap on any garment to view detailed cut, fabrics, and size specifications.",
          [
            { label: '👗 Highlight Bestsellers', action: 'find_product' },
            { label: '📏 Size Guide', action: 'size_guide' }
          ]
        );
        break;

      case 'find_product': {
        const curated = products.slice(0, 4);
        appendUserAndBotReply(
          'Find a Garment',
          'Here are selected signature pieces from our Accra atelier. Tap any item to inspect its cut and details:',
          [
            { label: '👗 View Complete Catalog', action: 'filter_all' },
            { label: '📏 Sizing Assistance', action: 'size_guide' }
          ],
          curated
        );
        break;
      }

      case 'size_guide':
        appendUserAndBotReply(
          'Size & Length Guide',
          'All Nnepa Foriwaa garments are tailored to verified international proportions (US, UK, EU) and include our **Standard Length Guide** for pants and dresses:\n\n• **Dresses**: Mini (34–36"), Knee (39–42"), Midi (45–49"), and Floor Gown/Boubou (55–60").\n• **Pants & Trousers**: Inseam (27–35") and Outseam (37–45") calibrated for clean breaks.\n• **Bespoke Fit**: Complimentary custom hem adjustments are available.',
          [
            { label: '📐 Open Full Size Chart', action: 'open_size_chart' },
            { label: '💬 Send Measurements on WhatsApp', action: 'contact_whatsapp' }
          ]
        );
        break;

      case 'open_size_chart':
        onOpenSizeChart();
        appendUserAndBotReply(
          'Open Size Chart',
          'I have opened the International Size Chart and Standard Length Guide for you. You can filter by US, UK, or EU sizing, or toggle between Inches and Centimeters.',
          [
            { label: '🛍️ Back to Shopping', action: 'filter_all' },
            { label: '💬 Ask a Question', action: 'main_menu' }
          ]
        );
        break;

      case 'delivery_info':
        appendUserAndBotReply(
          'Delivery & Returns',
          '**Shipping & Delivery:**\n• **Accra & Greater Accra**: 1–2 business days via private courier.\n• **Worldwide Express (DHL)**: 3–7 business days to US, UK, Canada, Europe, and across Africa.\n\n**Bespoke Policy:**\n• Each luxury garment is crafted to order. While we do not offer refunds on bespoke tailored pieces, complimentary fit adjustments and alterations are happily provided by our master tailors.',
          [
            { label: '🛍️ How to Place an Order', action: 'how_to_order' },
            { label: '💬 WhatsApp Concierge', action: 'contact_whatsapp' }
          ]
        );
        break;

      case 'how_to_order':
        appendUserAndBotReply(
          'How to Place an Order',
          'Ordering is seamless:\n1. Select your garment and standard size (or note bespoke measurements).\n2. Tap **Add to Shopping Bag**.\n3. Proceed to checkout — our atelier immediately receives your order and connects directly with you on WhatsApp with your private Order Number.',
          [
            { label: '🛍️ Open Shopping Bag', action: 'open_bag' },
            { label: '👗 Browse Collection', action: 'filter_all' }
          ]
        );
        break;

      case 'open_bag':
        onOpenCart();
        appendUserAndBotReply(
          'View Shopping Bag',
          'I have opened your shopping bag. You can review items, adjust quantities, and proceed directly to order confirmation.',
          [
            { label: '✨ Main Menu', action: 'main_menu' }
          ]
        );
        break;

      case 'contact_whatsapp': {
        const currentContext = activeProduct ? ` regarding the ${activeProduct.name}` : '';
        const url = `https://wa.me/233538795669?text=${encodeURIComponent(
          `Hello Nnepa Foriwaa! I would like personal concierge assistance${currentContext}.`
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        appendUserAndBotReply(
          'Connect on WhatsApp',
          'Connecting you directly with our atelier team on WhatsApp (+233 53 879 5669). We are ready to assist with custom fittings, order inquiries, and styling.',
          [
            { label: '✨ Return to Main Menu', action: 'main_menu' },
            { label: '👗 Continue Browsing', action: 'filter_all' }
          ]
        );
        break;
      }

      default:
        appendUserAndBotReply(
          'Concierge Inquiry',
          'I am here to assist you with every detail of your boutique experience. Please select from our concierge services:',
          [
            { label: '✨ Explore Collections', action: 'explore_collections' },
            { label: '📏 Size & Length Guide', action: 'size_guide' },
            { label: '💬 WhatsApp Atelier', action: 'contact_whatsapp' }
          ]
        );
    }
  };

  // Handle free-form customer question using local privacy-first keyword parser
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim().toLowerCase();
    if (!query) return;

    setInputValue('');

    if (query.includes('size') || query.includes('fit') || query.includes('measure') || query.includes('chart') || query.includes('length')) {
      handleOptionClick('size_guide');
    } else if (query.includes('delivery') || query.includes('ship') || query.includes('dhl') || query.includes('return') || query.includes('refund')) {
      handleOptionClick('delivery_info');
    } else if (query.includes('order') || query.includes('buy') || query.includes('checkout') || query.includes('pay')) {
      handleOptionClick('how_to_order');
    } else if (query.includes('women') || query.includes('dress') || query.includes('boubou') || query.includes('gown')) {
      handleOptionClick('filter_women');
    } else if (query.includes('men') || query.includes('kaftan') || query.includes('agbada') || query.includes('suit')) {
      handleOptionClick('filter_men');
    } else if (query.includes('contact') || query.includes('phone') || query.includes('whatsapp') || query.includes('call') || query.includes('human')) {
      handleOptionClick('contact_whatsapp');
    } else {
      // Find matching products by name or category
      const matched = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );

      if (matched.length > 0) {
        appendUserAndBotReply(
          inputValue,
          `I found ${matched.length} garment${matched.length > 1 ? 's' : ''} in our boutique matching "${inputValue}":`,
          [
            { label: '👗 View All Garments', action: 'filter_all' },
            { label: '📏 Sizing Assistance', action: 'size_guide' }
          ],
          matched.slice(0, 3)
        );
      } else {
        appendUserAndBotReply(
          inputValue,
          `Thank you for inquiring about "${inputValue}". Every piece at Nnepa Foriwaa is handcrafted with authentic Ghanaian luxury. Would you like to explore our collections or speak directly with our master tailors?`,
          [
            { label: '✨ Explore Collections', action: 'explore_collections' },
            { label: '📏 Size & Length Guide', action: 'size_guide' },
            { label: '💬 Chat on WhatsApp', action: 'contact_whatsapp' }
          ]
        );
      }
    }
  };

  // Hide on admin view
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
                  Nnepa Concierge
                </span>
                <span className="text-[9px] text-zinc-400 block font-light">
                  Personal Shopping Assistant
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
              Ask a question
            </button>
          </div>
        </div>
      )}

      {/* ═══ FLOATING LAUNCHER BUTTON ═══ */}
      <div className="fixed bottom-6 right-5 sm:right-6 z-[80]">
        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (proactivePrompt) dismissProactivePrompt();
          }}
          aria-label={isOpen ? 'Close shopping assistant' : 'Open shopping concierge assistant'}
          title="Nnepa Shopping Concierge"
          className="relative w-14 h-14 rounded-full bg-plum-dark hover:bg-plum text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer border border-plum/30 group"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 text-white" />
              {/* Subtle luxury pulse indicator if proactive prompt is present */}
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
          aria-label="Shopping Concierge Assistant"
          className="fixed bottom-24 right-4 sm:right-6 z-[85] w-[calc(100vw-2rem)] sm:w-[390px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Concierge Header */}
          <div className="bg-gradient-to-r from-plum-dark via-plum to-plum-dark text-white p-4 flex items-center justify-between shrink-0 border-b border-plum/40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lavender border border-white/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide text-white leading-tight">
                  Nnepa Concierge
                </h3>
                <span className="text-[10px] text-lavender/80 flex items-center gap-1 font-light">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Privacy-First • In-Browser Assistant</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close concierge"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Guarantee Micro-Banner */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-3 py-1.5 text-[9.5px] text-emerald-900 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% private in your browser. Zero tracking, zero external APIs, zero data stored.</span>
          </div>

          {/* Scrollable Conversation History */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-zinc-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                    msg.sender === 'user'
                      ? 'bg-plum-dark text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
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
                          onNavigate('details', undefined, prod);
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
                        <div className="px-2.5 py-1 bg-zinc-100 text-zinc-700 group-hover:bg-plum-dark group-hover:text-white rounded text-[10px] font-semibold shrink-0">
                          View
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Predefined Action Buttons */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 w-full">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt.action, opt.payload)}
                        className="px-3 py-1.5 bg-white border border-lilac/40 hover:border-plum-dark hover:bg-lavender/10 text-plum-dark rounded-full text-[10.5px] font-medium transition-all cursor-pointer shadow-xs text-left"
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
              placeholder="Ask about sizes, fabrics, delivery..."
              className="flex-1 px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-full text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-plum-dark focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send question"
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
