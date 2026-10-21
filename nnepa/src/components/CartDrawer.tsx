/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CartItem } from '../types.ts';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, size: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, size: string | undefined) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const isCartEmpty = cartItems.length === 0;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Cart Backdrop screen shade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[900] bg-[#3a2248]/45 backdrop-blur-[4px] cursor-pointer"
          />

          {/* Cart Drawer sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-[901] bg-pearl-2/97 backdrop-blur-[24px] border-l border-solid border-lilac/25 flex flex-col shadow-2xl"
            id="cart-drawer-container"
          >
            {/* Header section */}
            <div className="p-8 border-b border-solid border-lilac/20 flex justify-between items-center bg-white/70">
              <h3 className="font-serif text-2xl font-medium text-plum-dark">
                Your Cart
              </h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-solid border-lilac/30 bg-transparent cursor-pointer text-text-muted hover:text-plum hover:bg-pearl duration-250 flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Scrollable list items section */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              {isCartEmpty ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-text-light text-center select-none">
                  <ShoppingBag className="w-16 h-16 stroke-1 text-lilac" />
                  <div className="text-[0.9rem] font-medium tracking-wide">
                    Your cart is beautifully empty
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 py-3 px-6 bg-gradient-to-br from-lavender to-mauve-deep text-white text-[0.62rem] font-semibold tracking-[0.22em] uppercase border-none cursor-pointer rounded-[4px] shadow-md active:scale-95 duration-200"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size || 'default'}`}
                      className="py-4 border-b border-solid border-lilac/15 flex gap-4"
                    >
                      <img
                        className="w-[78px] h-[98px] object-cover rounded-sm flex-shrink-0"
                        src={item.product.imageUrl}
                        alt={item.product.name}
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-plum-dark leading-tight">
                            {item.product.name}
                          </h4>
                          <span className="text-[0.58rem] tracking-[0.15em] uppercase text-text-light font-medium block mt-1">
                            Tailoring {item.size ? `· Size ${item.size}` : ''}
                          </span>
                        </div>

                        {/* Interactive Quantity modifiers */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdateQty(item.product.id, item.size, -1)}
                              className="w-6.5 h-6.5 bg-pearl border border-solid border-lilac/30 hover:border-lavender hover:bg-lavender hover:text-white duration-200 rounded-full flex items-center justify-center cursor-pointer text-xs"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-semibold px-2 min-w-[20px] text-center text-plum-dark">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.product.id, item.size, 1)}
                              className="w-6.5 h-6.5 bg-pearl border border-solid border-lilac/30 hover:border-lavender hover:bg-lavender hover:text-white duration-200 rounded-full flex items-center justify-center cursor-pointer text-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-lavender">
                            GH₵ {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.size)}
                        className="p-1 border-none bg-transparent cursor-pointer text-text-light hover:text-mauve-deep duration-200 self-start"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtotal & Checkout button footer */}
            {!isCartEmpty && (
              <div className="p-8 border-t border-solid border-lilac/25 bg-white/70">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-text-muted">
                    Subtotal
                  </span>
                  <span className="font-serif text-2xl font-semibold text-plum-dark">
                    GH₵ {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={onCheckout}
                    className="w-full py-4 bg-gradient-to-br from-lavender to-mauve-deep text-white text-[0.65rem] font-semibold tracking-[0.22em] uppercase border-none cursor-pointer rounded-[4px] shadow-[0_8px_28px_rgba(155,132,204,0.35)] active:translate-y-[1px] hover:opacity-95 duration-200"
                    id="btn-drawer-checkout"
                  >
                    Proceed to Checkout →
                  </button>
                  <a
                    href={`https://wa.me/233246811210?text=${encodeURIComponent(
                      `Hello Nnepa Foriwaa! I would like to place an order for the following cart items:\n\n${cartItems
                        .map(
                          (item) =>
                            `• ${item.product.name} ${item.size ? `(Size: ${item.size})` : ''} x${item.quantity} - GH₵ ${(
                              item.product.price * item.quantity
                            ).toLocaleString()}`
                        )
                        .join('\n')}\n\nTotal: GH₵ ${subtotal.toLocaleString()}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[0.62rem] font-bold tracking-[0.18em] uppercase rounded-[4px] duration-200 flex items-center justify-center gap-2 no-underline"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    Order via WhatsApp
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
