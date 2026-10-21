/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon.tsx';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fittingType: 'Custom Fitting',
    preferredDate: '',
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        fittingType: 'Custom Fitting',
        preferredDate: '',
        notes: ''
      });
    }, 6000);
  };

  return (
    <div className="pt-28 pb-20 bg-pearl min-h-screen font-sans text-plum-dark" id="contact-view">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Title Header */}
        <div className="text-center mb-10">
          <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-2">
            Appointments & Consultations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark">
            Schedule a <em className="font-serif italic text-lavender">Fitting</em>
          </h1>
          <div className="w-12 h-[1px] bg-gradient-to-r from-lavender to-mauve mx-auto mt-4 mb-3" />
          <p className="text-xs sm:text-sm text-text-light max-w-lg mx-auto leading-relaxed">
            Please fill out the form below to book a personal fitting session or inquire about custom tailoring.
          </p>
        </div>

        {/* Main Card Form */}
        <div className="bg-white p-6 sm:p-10 rounded-md border border-neutral-200 shadow-sm mb-10">
          {isSubmitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center animate-fade-in">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-plum-dark mb-2">
                Fitting Request Received
              </h3>
              <p className="text-xs sm:text-sm text-text-light max-w-md leading-relaxed">
                Thank you, <span className="font-semibold text-plum-dark">{formData.name || 'valued client'}</span>. We have received your fitting details and will reach out via WhatsApp or email to confirm your appointment time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Abena Mensah"
                    className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. abena@example.com"
                    className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+233 53 879 5669"
                    className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                    Fitting Type
                  </label>
                  <select
                    value={formData.fittingType}
                    onChange={(e) => setFormData({ ...formData, fittingType: e.target.value })}
                    className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                  >
                    <option value="Custom Fitting">Custom Fitting</option>
                    <option value="Bridal / Wedding">Bridal & Wedding Collection</option>
                    <option value="Royal Agbada / Suit">Royal Agbada / Men's Suit</option>
                    <option value="Measurements & Alterations">Measurements & Alterations</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                  Preferred Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                  Notes & Measurements (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Share any style preferences, fabric choices, or sizing notes..."
                  className="px-4 py-3 bg-zinc-50 border border-zinc-200 outline-none focus:border-lavender text-xs rounded-[2px] resize-none"
                />
              </div>

              <button
                type="submit"
                className="py-4 bg-gradient-to-br from-lavender via-mauve to-mauve-deep hover:opacity-95 text-white border-none text-[0.65rem] font-bold tracking-[0.2em] uppercase rounded-[2px] cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4 text-white" />
                Submit Fitting Request
              </button>
            </form>
          )}
        </div>

        {/* Simple Direct Contact Details Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <a
            href="https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!%20I%20would%20like%20to%20schedule%20a%20fitting."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-5 rounded-md border border-neutral-200/80 hover:border-lavender/40 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-plum-dark">WhatsApp / MoMo / Call</span>
            <span className="text-[0.68rem] text-text-light font-mono">+233 53 879 5669</span>
          </a>

          <a
            href="mailto:sales@nnepaforiwaa.com"
            className="bg-white p-5 rounded-md border border-neutral-200/80 hover:border-lavender/40 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-full bg-lavender/10 text-lavender flex items-center justify-center">
              <span className="text-xs font-bold">@</span>
            </div>
            <span className="text-xs font-bold text-plum-dark">Direct Email</span>
            <span className="text-[0.65rem] text-text-light font-mono">sales@nnepaforiwaa.com</span>
          </a>

          <div className="bg-white p-5 rounded-md border border-neutral-200/80 flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-zinc-50 text-lavender flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-plum-dark">Studio Location</span>
            <span className="text-[0.68rem] text-text-light">Accra, Ghana</span>
          </div>

          <div className="bg-white p-5 rounded-md border border-neutral-200/80 flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-zinc-50 text-lavender flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-plum-dark">Opening Hours</span>
            <span className="text-[0.68rem] text-text-light">Mon – Sat: 9am – 6pm</span>
          </div>
        </div>

        {/* Official Social Media Channels */}
        <div className="mt-8 p-6 bg-white rounded-md border border-lilac/15 shadow-sm text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-lavender font-semibold mb-1">Stay Connected</p>
          <h3 className="font-serif text-lg text-plum-dark font-medium mb-4">Official Social Channels</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://www.instagram.com/nnepaforiwaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 hover:border-lavender text-plum-dark hover:text-lavender text-xs font-medium transition-all bg-zinc-50/60 hover:bg-lavender/5"
            >
              <Instagram className="w-4 h-4 text-lavender" />
              <span>Instagram: <strong className="font-semibold">@nnepaforiwaa</strong></span>
            </a>
            <a
              href="https://www.tiktok.com/@nnepa.foriwaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 hover:border-lavender text-plum-dark hover:text-lavender text-xs font-medium transition-all bg-zinc-50/60 hover:bg-lavender/5"
            >
              <TikTokIcon className="w-4 h-4 fill-current text-plum-dark" />
              <span>TikTok: <strong className="font-semibold">@nnepa.foriwaa</strong></span>
            </a>
            <a
              href="https://www.facebook.com/nnepaforiwaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 hover:border-lavender text-plum-dark hover:text-lavender text-xs font-medium transition-all bg-zinc-50/60 hover:bg-lavender/5"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>Facebook: <strong className="font-semibold">nnepa foriwaa</strong></span>
            </a>
            <a
              href="https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-emerald-200 hover:border-emerald-400 text-emerald-800 text-xs font-medium transition-all bg-emerald-50/40 hover:bg-emerald-50"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
              <span>WhatsApp: <strong className="font-semibold">+233 53 879 5669</strong></span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
