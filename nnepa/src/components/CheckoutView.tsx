/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  MessageSquare,
  Sparkles,
  Lock,
  Tag
} from 'lucide-react';
import { CartItem, Order, OrderCustomerInfo, PaymentMethod } from '../types.ts';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBackToShop: () => void;
  onOrderCompleted: (order: Order) => void;
  showToast: (msg: string) => void;
}

const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_FEE = 45;

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [momoNetwork, setMomoNetwork] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [momoNumber, setMomoNumber] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'ROYAL10' || clean === 'NNEPA10') {
      setDiscountPercent(10);
      showToast('🎉 10% Royal Heritage discount applied!');
    } else if (clean === 'FIRST20') {
      setDiscountPercent(20);
      showToast('🎉 20% First Atelier Order discount applied!');
    } else {
      showToast('Invalid promo code. Try "ROYAL10"');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast('Please fill in your name, delivery address, and phone number.');
      return;
    }

    setIsSubmitting(true);

    const orderId = `NF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: [...cartItems],
      subtotal,
      deliveryFee,
      total,
      customer: { ...formData },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      deliveryStatus: 'order_received',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setCompletedOrder(newOrder);
      onOrderCompleted(newOrder);
      showToast(`✨ Order ${orderId} received! We have initiated bespoke tailoring.`);
    }, 900);
  };

  // Pre-filled WhatsApp notification message
  const createWhatsAppUrl = (order: Order) => {
    const lines = [
      `👑 *NNEPA FORIWAA LUXURY ORDER RECEIPT*`,
      `*Order ID:* ${order.id}`,
      `*Client:* ${order.customer.fullName} (${order.customer.phone})`,
      `*Delivery Address:* ${order.customer.address}, ${order.customer.city}, ${order.customer.region}`,
      order.customer.deliveryNotes ? `*Notes:* ${order.customer.deliveryNotes}` : '',
      `*Payment Method:* ${order.paymentMethod.toUpperCase()}`,
      ``,
      `*Garments Ordered:*`,
      ...order.items.map(
        (it) => `• ${it.product.name} (Size: ${it.size || 'M'}) x${it.quantity} — GH₵ ${(it.product.price * it.quantity).toLocaleString()}`
      ),
      ``,
      `*Subtotal:* GH₵ ${order.subtotal.toLocaleString()}`,
      order.deliveryFee === 0 ? `*Delivery:* Complimentary (Accra)` : `*Delivery:* GH₵ ${order.deliveryFee}`,
      discountAmount > 0 ? `*Discount:* -GH₵ ${discountAmount.toLocaleString()}` : '',
      `*Total Due:* GH₵ ${order.total.toLocaleString()}`,
      ``,
      `Please confirm tailoring measurements and dispatch timeline. Thank you!`
    ].filter(Boolean);

    return `https://wa.me/233538795669?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // ORDER CONFIRMATION VIEW
  if (completedOrder) {
    return (
      <div className="pt-28 pb-24 bg-pearl min-h-[85vh] animate-fade-in">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-xl border border-lilac/25 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-lavender to-mauve-deep text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce-once">
              <CheckCircle className="w-9 h-9" />
            </div>

            <span className="text-[0.62rem] font-bold tracking-[0.3em] uppercase text-mauve-deep">
              Order Confirmed & Logged
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-plum-dark mt-2 font-light">
              Medasi! Your Royal Commission is Placed
            </h1>
            <p className="text-sm text-text-muted mt-3 max-w-md mx-auto leading-relaxed">
              Order <strong className="text-plum-dark font-mono font-semibold">{completedOrder.id}</strong> has been assigned to our master ateliers in Accra.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-pearl/80 border border-lilac/20 rounded-md p-6 text-left my-8">
              <div className="flex justify-between items-center border-b border-lilac/15 pb-4 mb-4">
                <div>
                  <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light">Client Delivery</div>
                  <div className="text-sm font-semibold text-plum-dark mt-0.5">{completedOrder.customer.fullName}</div>
                  <div className="text-xs text-text-muted">{completedOrder.customer.address}, {completedOrder.customer.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-text-light">Grand Total</div>
                  <div className="text-xl font-serif font-bold text-lavender">GH₵ {completedOrder.total.toLocaleString()}</div>
                  <div className="text-[0.6rem] text-emerald-600 font-semibold uppercase">{completedOrder.paymentMethod}</div>
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

            {/* Quick WhatsApp Concierge Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={createWhatsAppUrl(completedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                Notify Atelier via WhatsApp
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

  // EMPTY CART CHECKOUT GUARD
  if (cartItems.length === 0) {
    return (
      <div className="pt-28 pb-20 bg-pearl min-h-[80vh] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <ShoppingBag className="w-16 h-16 text-lilac mx-auto mb-4 stroke-1" />
          <h2 className="font-serif text-2xl text-plum-dark">Your Bag is Empty</h2>
          <p className="text-xs text-text-muted mt-2 mb-6 leading-relaxed">
            Please add bespoke handcrafted African pieces to your bag before checking out.
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
          {/* ═══ LEFT FORM: CUSTOMER & PAYMENT (7 cols) ═══ */}
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
                      placeholder="Nana Yaa Asantewaa"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="client@luxury.gh"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-text-muted block mb-1.5">
                      Phone / WhatsApp *
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
                      placeholder="e.g. Please hem gown 2 inches shorter, or gate code #492"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-pearl/60 border border-lilac/30 rounded-[3px] text-sm text-plum-dark outline-none focus:border-lavender focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-lilac/25 shadow-sm">
                <div className="flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep mb-2">
                  <span className="w-5 h-5 rounded-full bg-lavender text-white flex items-center justify-center text-[0.6rem]">3</span>
                  Payment Guarantee
                </div>
                <h3 className="font-serif text-2xl font-light text-plum-dark mb-5">
                  Select Payment Channel
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                  {/* MoMo Option */}
                  <label
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'momo'
                        ? 'border-lavender bg-lavender/10 shadow-xs'
                        : 'border-lilac/25 hover:border-lilac/50 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-plum-dark flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-lavender" />
                        Mobile Money (Ghana)
                      </div>
                      <div className="text-[0.65rem] text-text-muted mt-0.5">
                        MTN MoMo, Telecel Cash, AirtelTigo
                      </div>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'card'
                        ? 'border-lavender bg-lavender/10 shadow-xs'
                        : 'border-lilac/25 hover:border-lilac/50 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-plum-dark flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-lavender" />
                        Credit / Debit Card
                      </div>
                      <div className="text-[0.65rem] text-text-muted mt-0.5">
                        Visa, MasterCard, GhLink
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery / Fitting */}
                  <label
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'cod'
                        ? 'border-lavender bg-lavender/10 shadow-xs'
                        : 'border-lilac/25 hover:border-lilac/50 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-plum-dark flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-lavender" />
                        Pay on Fitting / Delivery
                      </div>
                      <div className="text-[0.65rem] text-text-muted mt-0.5">
                        Available across Greater Accra
                      </div>
                    </div>
                  </label>

                  {/* WhatsApp Direct Concierge */}
                  <label
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'whatsapp'
                        ? 'border-lavender bg-lavender/10 shadow-xs'
                        : 'border-lilac/25 hover:border-lilac/50 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="whatsapp"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold text-plum-dark flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Direct Atelier Concierge
                      </div>
                      <div className="text-[0.65rem] text-text-muted mt-0.5">
                        Manual bank wire or custom order review
                      </div>
                    </div>
                  </label>
                </div>

                {/* Network Picker if MoMo */}
                {paymentMethod === 'momo' && (
                  <div className="p-4 bg-pearl/80 rounded-md border border-lilac/20 space-y-3">
                    <div className="text-[0.62rem] font-bold tracking-[0.16em] uppercase text-text-muted">
                      Select MoMo Network
                    </div>
                    <div className="flex gap-3">
                      {(['mtn', 'telecel', 'at'] as const).map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setMomoNetwork(net)}
                          className={`px-4 py-2 text-xs font-bold uppercase rounded-[3px] border cursor-pointer transition-all ${
                            momoNetwork === net
                              ? 'bg-plum-dark text-white border-plum-dark'
                              : 'bg-white text-text-muted border-lilac/30 hover:border-lavender'
                          }`}
                        >
                          {net === 'mtn' ? 'MTN MoMo' : net === 'telecel' ? 'Telecel Cash' : 'AirtelTigo'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter Ghana MoMo Phone Number"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-lilac/30 rounded-[3px] text-xs text-plum-dark outline-none focus:border-lavender"
                    />
                    <p className="text-[0.62rem] text-text-muted">
                      A prompt will be initiated directly to your phone upon order submission.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-pearl/80 rounded-md border border-lilac/20 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-plum-dark">
                      <Lock className="w-3.5 h-3.5 text-lavender" />
                      256-Bit SSL Encrypted Card Processing
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Card Number (4000 1234 5678 9010)"
                        maxLength={19}
                        className="w-full px-4 py-2.5 bg-white border border-lilac/30 rounded-[3px] text-xs text-plum-dark outline-none focus:border-lavender"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          className="px-4 py-2.5 bg-white border border-lilac/30 rounded-[3px] text-xs text-plum-dark outline-none focus:border-lavender"
                        />
                        <input
                          type="text"
                          placeholder="CVC / CVV"
                          maxLength={4}
                          className="px-4 py-2.5 bg-white border border-lilac/30 rounded-[3px] text-xs text-plum-dark outline-none focus:border-lavender"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 bg-gradient-to-br from-lavender via-mauve to-mauve-deep text-white text-xs font-bold tracking-[0.22em] uppercase rounded-[3px] shadow-[0_8px_24px_rgba(155,132,204,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Initiating Royal Order...'
                  ) : (
                    <>
                      Confirm & Place Order · GH₵ {total.toLocaleString()}
                    </>
                  )}
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

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon / Promo (e.g. ROYAL10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-pearl/60 border border-lilac/30 rounded-[3px] text-xs text-plum-dark outline-none focus:border-lavender uppercase tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-plum-dark text-white text-[0.62rem] font-bold tracking-[0.16em] uppercase rounded-[3px] hover:bg-plum transition-all cursor-pointer border-none"
                >
                  Apply
                </button>
              </form>

              {/* Cost Calculations */}
              <div className="space-y-2.5 border-t border-lilac/15 pt-4 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-plum-dark">GH₵ {subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Royal Voucher ({discountPercent}%)</span>
                    <span>-GH₵ {discountAmount.toLocaleString()}</span>
                  </div>
                )}

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
                <span>Complimentary alterations at Accra atelier on all orders.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-lavender shrink-0" />
                <span>Orders over GH₵ 1,000 enjoy free door-to-door delivery in Accra.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-mauve-deep shrink-0" />
                <span>Bank-grade 256-bit encrypted checkout and certified merchant processing.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
