/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { CartItem, Order, OrderCustomerInfo } from '../types.ts';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBackToShop: () => void;
  onOrderCompleted: (order: Order) => void;
  showToast: (msg: string) => void;
}

const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_FEE = 45;
const BOUTIQUE_WHATSAPP_NUMBER = '233538795669';

export default function CheckoutView({
  cartItems,
  onBackToShop,
  onOrderCompleted,
  showToast,
}: CheckoutViewProps) {
  const [formData, setFormData] = useState<OrderCustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
    deliveryNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal + deliveryFee);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Construct complete WhatsApp message with all contact details, destination, and garments
  const buildWhatsAppOrderUrl = (orderRef?: string) => {
    const fullAddress = [
      formData.address.trim(),
      formData.city?.trim(),
      formData.region?.trim()
    ].filter(Boolean).join(', ');

    const lines = [
      `*NNEPA FORIWAA BESPOKE ORDER${orderRef ? ` (${orderRef})` : ''}*`,
      ``,
      `*Customer Information:*`,
      `• Name: ${formData.fullName.trim()}`,
      `• Phone: ${formData.phone.trim()}`,
      formData.email.trim() ? `• Email: ${formData.email.trim()}` : '',
      `• Delivery Address: ${fullAddress}`,
      formData.deliveryNotes?.trim() ? `• Fitting / Tailoring Notes: ${formData.deliveryNotes.trim()}` : '',
      ``,
      `*Garments Selected:*`,
      ...cartItems.map(
        (it) =>
          `• ${it.product.name} (Size: ${it.size || 'M'}) x${it.quantity} — GH₵ ${(
            it.product.price * it.quantity
          ).toLocaleString()}`
      ),
      ``,
      `• Subtotal: GH₵ ${subtotal.toLocaleString()}`,
      `• Delivery: ${isFreeShipping ? 'Complimentary (Accra)' : `GH₵ ${deliveryFee}`}`,
      `*Total Payable:* GH₵ ${total.toLocaleString()}`,
      ``,
      `Please confirm my tailoring measurements and dispatch timeline. Medasi!`
    ].filter(Boolean);

    return `https://wa.me/${BOUTIQUE_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Please enter your phone number.');
      return;
    }
    if (!formData.address.trim()) {
      showToast('Please enter your delivery address / landmark.');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your bag is empty.');
      return;
    }

    setIsSubmitting(true);

    const tempOrderNumber = `#NNEPA-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAddress = [
      formData.address.trim(),
      formData.city?.trim(),
      formData.region?.trim()
    ].filter(Boolean).join(', ');

    const whatsappUrl = buildWhatsAppOrderUrl(tempOrderNumber);

    const newOrder: Order = {
      id: tempOrderNumber,
      createdAt: new Date().toISOString(),
      items: [...cartItems],
      subtotal,
      deliveryFee,
      total,
      customer: { ...formData },
      paymentMethod: 'whatsapp',
      paymentStatus: 'pending',
      deliveryStatus: 'order_received'
    };

    setCompletedOrder(newOrder);
    onOrderCompleted(newOrder);

    // Persist order asynchronously in database for store records & admin panel
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          customer: {
            name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: fullAddress,
            notes: formData.deliveryNotes?.trim() || ''
          },
          items: cartItems.map((it) => ({
            productId: it.product.id,
            size: it.size,
            quantity: it.quantity
          }))
        })
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data?.orderNumber) {
              setCompletedOrder((prev) => (prev ? { ...prev, id: `#${data.orderNumber}` } : prev));
            }
          }
        })
        .catch(() => {});
    } catch {}

    showToast('Directing you to WhatsApp to complete your order...');

    // Redirect directly to WhatsApp without popup blockers
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 300);
  };

  // ═══ ORDER CONFIRMATION VIEW ═══
  if (completedOrder) {
    const finalWhatsAppUrl = buildWhatsAppOrderUrl(completedOrder.id);
    return (
      <div className="pt-28 pb-24 bg-pearl min-h-[85vh] animate-fade-in">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-xl border border-lilac/25 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce-once">
              <CheckCircle className="w-9 h-9" />
            </div>

            <span className="text-[0.62rem] font-bold tracking-[0.3em] uppercase text-mauve-deep">
              Order Registered · Complete on WhatsApp
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-plum-dark mt-2 font-light">
              Medasi — Your Order is Prepared
            </h1>
            <p className="text-sm text-text-muted mt-3 max-w-md mx-auto leading-relaxed">
              Order <strong className="text-plum-dark font-mono font-semibold">{completedOrder.id}</strong> has been prepared for our Accra atelier.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-pearl/80 border border-lilac/20 rounded-md p-6 text-left my-8">
              <div className="flex justify-between items-center border-b border-lilac/15 pb-4 mb-4">
                <div>
                  <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light">Client Delivery</div>
                  <div className="text-sm font-semibold text-plum-dark mt-0.5">{completedOrder.customer.fullName}</div>
                  <div className="text-xs text-text-muted">{completedOrder.customer.address}, {completedOrder.customer.city}</div>
                  <div className="text-xs text-text-muted mt-0.5">{completedOrder.customer.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light">Grand Total</div>
                  <div className="text-xl font-serif font-bold text-lavender">GH₵ {completedOrder.total.toLocaleString()}</div>
                  <div className="text-[0.6rem] text-emerald-600 font-semibold uppercase flex items-center justify-end gap-1 mt-0.5">
                    <WhatsAppIcon className="w-3 h-3 fill-emerald-600" />
                    Via WhatsApp
                  </div>
                </div>
              </div>

              <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light mb-3">Itemized Garments</div>
              <div className="space-y-3">
                {completedOrder.items.map((it) => (
                  <div key={`${it.product.id}-${it.size}`} className="flex justify-between items-center text-xs">
                    <span className="text-plum-dark">
                      {it.product.name} <span className="text-text-muted">({it.size || 'M'})</span> × {it.quantity}
                    </span>
                    <span className="font-semibold text-plum-dark">
                      GH₵ {(it.product.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Confirmation Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={finalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] text-xs font-bold tracking-[0.2em] uppercase transition-all cursor-pointer no-underline shadow-md"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Open in WhatsApp (+233 53 879 5669)</span>
              </a>

              <button
                type="button"
                onClick={onBackToShop}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-plum-dark hover:bg-plum text-white rounded-[3px] text-xs font-bold tracking-[0.2em] uppercase transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ EMPTY CART CHECKOUT GUARD ═══
  if (cartItems.length === 0) {
    return (
      <div className="pt-28 pb-20 bg-pearl min-h-[80vh] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <ShoppingBag className="w-16 h-16 text-lilac mx-auto mb-4 stroke-1" />
          <h2 className="font-serif text-2xl text-plum-dark">Your Bag is Empty</h2>
          <p className="text-xs text-text-muted mt-2 mb-6 leading-relaxed">
            Your shopping bag is currently empty. Explore our collections to add pieces.
          </p>
          <button
            type="button"
            onClick={onBackToShop}
            className="px-8 py-3.5 bg-gradient-to-br from-lavender to-mauve-deep text-white text-xs font-bold tracking-[0.2em] uppercase rounded-[3px] cursor-pointer"
          >
            Explore Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-pearl min-h-[90vh]" id="checkout-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Back navigation button */}
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-mauve-deep hover:text-lavender mb-8 cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ═══ LEFT FORM: CUSTOMER & WHATSAPP CHECKOUT (7 cols) ═══ */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <form onSubmit={handleSubmitOrder} className="flex flex-col gap-8">
              
              {/* Step 1: Customer Contact */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-lilac/25 shadow-sm">
                <div className="flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep mb-2">
                  <span className="w-5 h-5 rounded-full bg-lavender text-white flex items-center justify-center text-[0.6rem]">1</span>
                  Customer Information
                </div>
                <h3 className="font-serif text-2xl font-light text-plum-dark mb-5">
                  Contact & Communication
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Nana Yaa Asantewaa"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+233 50 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. name@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Destination */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-lilac/25 shadow-sm">
                <div className="flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep mb-2">
                  <span className="w-5 h-5 rounded-full bg-lavender text-white flex items-center justify-center text-[0.6rem]">2</span>
                  Delivery Destination
                </div>
                <h3 className="font-serif text-2xl font-light text-plum-dark mb-5">
                  Shipping & Fitting Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Street / Digital Address / Landmark *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="GA-183-9201, 14 Cantonments Road"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Accra">Accra</option>
                      <option value="Tema">Tema</option>
                      <option value="Kumasi">Kumasi</option>
                      <option value="Takoradi">Takoradi</option>
                      <option value="Cape Coast">Cape Coast</option>
                      <option value="Sunyani">Sunyani</option>
                      <option value="Tamale">Tamale</option>
                      <option value="International">International Dispatch</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Region *
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti Region</option>
                      <option value="Central">Central Region</option>
                      <option value="Western">Western Region</option>
                      <option value="Eastern">Eastern Region</option>
                      <option value="Volta">Volta Region</option>
                      <option value="Northern">Northern Region</option>
                      <option value="Diaspora / Global">Diaspora / Overseas</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Fitting or Tailoring Notes (Optional)
                    </label>
                    <textarea
                      name="deliveryNotes"
                      rows={2}
                      placeholder="e.g. Please hem gown 2 inches shorter, or leave at front gate"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Checkout via WhatsApp */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-lilac/25 shadow-sm">
                <div className="flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[0.6rem]">3</span>
                  Checkout via WhatsApp
                </div>
                <h3 className="font-serif text-2xl font-light text-plum-dark mb-3">
                  Place Order via WhatsApp
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mb-6">
                  All Nnepa Foriwaa orders are completed bespoke through WhatsApp. Submitting this form sends your delivery destination, tailoring notes, and chosen garments directly to our boutique concierge (+233 53 879 5669) to confirm measurements and finalize delivery.
                </p>

                {/* Submission CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold tracking-[0.22em] uppercase rounded-[3px] shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-all cursor-pointer border-none flex items-center justify-center gap-2.5"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                  <span>
                    {isSubmitting ? (
                      'Opening WhatsApp...'
                    ) : (
                      `Place Order via WhatsApp · GH₵ ${total.toLocaleString()}`
                    )}
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* ═══ RIGHT COLUMN: ORDER SUMMARY (5 cols) ═══ */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-lilac/25 shadow-sm">
              <div className="flex justify-between items-center border-b border-lilac/15 pb-4 mb-4">
                <h3 className="font-serif text-xl font-light text-plum-dark">
                  Order Summary
                </h3>
                <span className="text-xs font-semibold text-text-muted">
                  {cartItems.reduce((acc, it) => acc + it.quantity, 0)} items
                </span>
              </div>

              {/* Item list */}
              <div className="max-h-64 overflow-y-auto space-y-4 pr-1 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3.5 items-center">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-18 object-cover rounded-sm border border-lilac/15 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif text-sm font-semibold text-plum-dark line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="text-[0.62rem] text-text-light uppercase tracking-wider mt-0.5">
                        Size: <span className="font-bold text-plum-dark">{item.size || 'M'}</span> · Qty: {item.quantity}
                      </div>
                      <div className="text-xs font-semibold text-lavender mt-1">
                        GH₵ {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2.5 border-t border-lilac/15 pt-4 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-plum-dark">GH₵ {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-text-muted">
                  <span>Delivery</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-bold uppercase tracking-wider">Complimentary</span>
                    ) : (
                      `GH₵ ${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="border-t border-lilac/15 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold tracking-wider uppercase text-plum-dark">Total</span>
                  <span className="font-serif text-2xl font-bold text-lavender">
                    GH₵ {total.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Trust and Guarantee Badges */}
            <div className="bg-white/80 p-5 rounded-lg border border-lilac/20 space-y-3 text-[0.68rem] text-text-muted">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complimentary alterations in Accra on all orders.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-lavender shrink-0" />
                <span>Orders over GH₵ 1,000 enjoy free door-to-door delivery in Accra.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
