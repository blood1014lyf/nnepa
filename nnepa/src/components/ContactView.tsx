/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Fitting Inquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: 'Fitting Inquiry', message: '' });
    }, 4500);
  };

  const contactOptions = [
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      title: 'WhatsApp Concierge',
      value: '+233 24 681 1210',
      actionText: 'Instant Response Chat →',
      link: 'https://wa.me/233246811210?text=Hello%20Nnepa%20Foriwaa!%20I%20would%20like%20to%20inquire%20about%20a%20custom%20order%20commission.'
    }
  ];

  return (
    <div className="pt-28 pb-20 bg-pearl" id="contact-view">
      {/* Intro Header */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto text-center mb-16">
        <span className="text-[0.62rem] font-bold tracking-[0.4em] uppercase text-mauve-deep mb-3.5 inline-block">
          Order Desk & Workshop
        </span>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-plum-dark font-light mb-6">
          Schedule a <em className="font-serif italic text-lavender">Royal fitting</em>
        </h2>
        <div className="w-16 h-[2px] bg-gradient-to-r from-lavender to-mauve mx-auto mb-6" />
        <p className="text-sm md:text-base text-text-light max-w-2xl mx-auto leading-relaxed">
          Skip complex gateway terminals. Our boutique handles fittings and orders directly with personal design consultations. Reach out to our design desk via WhatsApp or submit custom parameters below.
        </p>
      </section>

      {/* Main Grid: Form + Contacts Cards */}
      <div className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
        
        {/* Left Column: Direct WhatsApp & Location Details (Count = 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-8 rounded-md border border-emerald-500/15 relative overflow-hidden shadow-sm">
            <span className="absolute top-4 right-4 animate-ping w-2 h-2 bg-emerald-500 rounded-full" />
            <h3 className="font-serif text-2xl text-emerald-950 font-bold mb-3 flex items-center gap-3">
              Direct WhatsApp Checkout
            </h3>
            <p className="text-xs md:text-sm text-emerald-900/85 leading-relaxed mb-6">
              Our preferred ordering channel. Tap the fast order button to submit item photos, fabric choices, and measurement parameters to our Accra Tailoring workshop directly.
            </p>
            <a
              href="https://wa.me/233246811210?text=Hello%20Nnepa%20Foriwaa!%20I%20would%20like%20to%20order%20an%20ensemble.%20Let's%20discuss%20fabric%20and%20measurements."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-[0.18em] uppercase rounded-[2px] transition-all cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              Chat with Designer Now
            </a>
          </div>

          {/* Quick Contact Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactOptions.map((opt, i) => (
              <a
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                key={i}
                className="bg-white p-5 rounded-md border border-lilac/10 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-lavender/5 transition-colors">
                    {opt.icon}
                  </div>
                  <h4 className="font-serif text-sm font-bold text-plum-dark mb-1">{opt.title}</h4>
                  <p className="text-[0.686rem] text-text-light font-mono select-all leading-normal">{opt.value}</p>
                </div>
                <div className="text-[0.55rem] font-bold tracking-[0.16em] uppercase text-lavender group-hover:text-mauve-deep transition-colors mt-4 shrink-0">
                  {opt.actionText}
                </div>
              </a>
            ))}
          </div>

          {/* Business Hours */}
          <div className="bg-white p-6 rounded-md border border-lilac/10 flex gap-4 items-start shadow-inner">
            <Clock className="w-5 h-5 text-lavender shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-plum-dark mb-1">Tailory Fitting Hours</h4>
              <p className="text-[0.686rem] text-text-light leading-relaxed">
                Monday — Saturday: 08:30 GMT - 18:00 GMT<br />
                Sunday: Private VIP Custom Fittings Only (Accra Showroom)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiries Form (Count = 7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-md border border-lilac/15 shadow-[0_12px_44px_rgba(92,61,110,0.04)]">
          <h3 className="font-serif text-2xl text-plum-dark font-medium mb-1.5Packed font-semibold md:text-3xl">
            Workshop Booking Desk
          </h3>
          <p className="text-xs text-text-light mb-8 uppercase tracking-wide">
            Fill in your configuration details for pre-evaluation call
          </p>

          {isSubmitted ? (
            <div className="py-16 text-center animate-fade-in">
              <div className="w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-6 h-6 text-lavender" />
              </div>
              <h4 className="font-serif text-xl font-bold text-plum-dark mb-2">Commission Script Logged!</h4>
              <p className="text-xs text-text-light max-w-md mx-auto leading-relaxed">
                Your measurement inquiry has been received by our head designer. A representative will contact you shortly on WhatsApp or Email within 4 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Amara Osei"
                    className="px-4 py-3 border border-zinc-200 outline-none focus:border-lavender text-xs transition-colors rounded-[2px] bg-zinc-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="amara@domain.gh"
                    className="px-4 py-3 border border-zinc-200 outline-none focus:border-lavender text-xs transition-colors rounded-[2px] bg-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+233 24 681 1210"
                    className="px-4 py-3 border border-zinc-200 outline-none focus:border-lavender text-xs transition-colors rounded-[2px] bg-zinc-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Fitting Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="px-4 py-3 border border-zinc-200 outline-none focus:border-lavender text-xs transition-colors rounded-[2px] bg-zinc-50"
                  >
                    <option>Bridal Fitting</option>
                    <option>Royal Agbada Styling</option>
                    <option>Family Custom Order</option>
                    <option>Size Assessment / Custom Material</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Details & Specific Guidelines</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your event, your styling preferences, and any specific size benchmarks (Chest, Waist, Shoulders, Tallness) if known."
                  className="px-4 py-3 border border-zinc-200 outline-none focus:border-lavender text-xs transition-colors rounded-[2px] bg-zinc-50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="py-4 bg-gradient-to-br from-lavender via-mauve to-mauve-deep hover:opacity-95 text-white border-none text-[0.62rem] font-bold tracking-[0.22em] uppercase transition-all rounded-[2px] cursor-pointer shadow-md text-center inline-flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                Submit fitting requirements
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
