/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, Scissors, Lock, FileText, ArrowRight } from 'lucide-react';

interface LegalViewProps {
  initialTab?: 'terms' | 'privacy';
  onNavigateToContact: () => void;
}

export default function LegalView({ initialTab = 'terms', onNavigateToContact }: LegalViewProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div className="pt-28 pb-20 bg-pearl min-h-screen text-plum-dark" id="legal-policy-view">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-2">
            Nnepa Foriwaa • Official Policies
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark">
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </h1>
          <div className="w-12 h-[1px] bg-gradient-to-r from-lavender to-mauve mx-auto mt-4 mb-6" />
          
          {/* Tab Switcher */}
          <div className="inline-flex p-1 bg-white border border-lilac/25 rounded-[3px] shadow-xs">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-5 py-2 text-xs font-bold tracking-wider uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                activeTab === 'terms'
                  ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white shadow-xs'
                  : 'bg-transparent text-text-muted hover:text-plum-dark'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-5 py-2 text-xs font-bold tracking-wider uppercase rounded-[2px] transition-all cursor-pointer border-none ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white shadow-xs'
                  : 'bg-transparent text-text-muted hover:text-plum-dark'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white p-6 sm:p-10 rounded-md border border-lilac/15 shadow-xs">
          {activeTab === 'terms' ? (
            <div className="space-y-8 animate-fade-in text-sm text-text-light leading-relaxed">
              
              {/* Essential Notice Box */}
              <div className="bg-plum/5 border-l-4 border-mauve-deep p-5 rounded-r-md">
                <div className="flex items-center gap-2.5 text-plum-dark font-serif font-bold text-base mb-1.5">
                  <AlertCircle className="w-5 h-5 text-mauve-deep shrink-0" />
                  Key Purchasing Notice: No Refunds & No Exchanges
                </div>
                <p className="text-xs sm:text-sm text-plum-dark/85 font-medium leading-normal">
                  All garment purchases, custom commissions, and ready-to-wear items are final. We strictly operate a <span className="underline font-bold">No Refund</span> and <span className="underline font-bold">No Exchange</span> policy once an order is placed or fabric is cut.
                </p>
              </div>

              {/* Policy Clause 1: No Refund Policy */}
              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    1. No Refund Policy
                  </h2>
                </div>
                <p>
                  Every creation by Nnepa Foriwaa is meticulously produced with authentic, premium African textiles and individual artisan labor. Due to the exclusive and made-to-fit nature of our collections, payments are strictly non-refundable. We do not provide cash or credit card refunds under any circumstances once payment is confirmed.
                </p>
              </div>

              {/* Policy Clause 2: No Exchange Policy */}
              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    2. No Exchange Policy
                  </h2>
                </div>
                <p>
                  We do not accept product exchanges for different styles, sizes, colors, or fabrics after an item has been purchased or handed over. Clients are encouraged to review our detailed size charts or schedule an in-person measurement session prior to finalizing orders.
                </p>
              </div>

              {/* Policy Clause 3: Alterations & Revisions at Price */}
              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    3. Alterations and Revisions at a Price
                  </h2>
                </div>
                <p className="mb-2">
                  We take pride in delivering garments of royal elegance. However, any subsequent fitting adjustments, resizing, design modifications, or post-delivery revisions are <strong>charged separately at an agreed service fee</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-text-light">
                  <li>Alteration and revision charges depend on the complexity, fabric handling, and artisan hours required.</li>
                  <li>A quote for any alteration or revision will be provided before work commences.</li>
                  <li>Clients must submit revision requests within 5 business days of garment receipt.</li>
                </ul>
              </div>

              {/* Policy Clause 4: Custom Fitting & Client Measurements */}
              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    4. Custom Measurement & Fitting Accuracy
                  </h2>
                </div>
                <p>
                  For custom tailoring, it is the client's responsibility to provide accurate body measurements or attend a studio fitting session. In the event of weight fluctuations or inaccurate self-measurements, necessary modifications will be treated under our standard paid alteration policy.
                </p>
              </div>

              {/* Policy Clause 5: Garment Care */}
              <div>
                <h2 className="font-serif text-xl text-plum-dark font-medium mb-2">
                  5. Luxury Fabric Care
                </h2>
                <p>
                  Authentic African textiles (Kente, Ankara, Aso-oke, Brocade) require delicate handling. We strongly recommend professional dry cleaning or mild hand-washing in cold water. We are not liable for color bleeds or shrinkage caused by aggressive machine washing.
                </p>
              </div>

            </div>
          ) : (
            <div className="space-y-8 animate-fade-in text-sm text-text-light leading-relaxed">
              
              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    1. Information We Collect
                  </h2>
                </div>
                <p>
                  Nnepa Foriwaa collects client information provided voluntarily when you request a fitting, place an order, or contact us:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-xs sm:text-sm">
                  <li>Full name, telephone / WhatsApp number, and email address.</li>
                  <li>Physical delivery address and location coordinates.</li>
                  <li>Personal tailoring measurements and style preferences.</li>
                </ul>
              </div>

              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    2. How Your Information Is Used
                  </h2>
                </div>
                <p>
                  Your information is utilized solely to:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-xs sm:text-sm">
                  <li>Schedule, confirm, and execute personal fitting sessions.</li>
                  <li>Craft custom garments according to your exact silhouette.</li>
                  <li>Process direct delivery and provide delivery updates via WhatsApp or phone.</li>
                  <li>Provide customer support regarding your orders or alteration quotes.</li>
                </ul>
              </div>

              <div className="border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif text-xl text-plum-dark font-medium">
                    3. Strict Confidentiality (No Third-Party Selling)
                  </h2>
                </div>
                <p>
                  We treat all client measurements and personal details with utmost discretion. Nnepa Foriwaa never sells, trades, or rents your personal data to advertisers or third-party marketers.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl text-plum-dark font-medium mb-2">
                  4. Data Security & Storage
                </h2>
                <p>
                  Client measurements and order histories are stored securely. You may request to review, update, or remove your contact coordinates from our active client roster at any time by contacting us directly.
                </p>
              </div>

            </div>
          )}

          {/* Action Consultation Box */}
          <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-serif text-lg font-bold text-plum-dark">
                Have a question about our policies?
              </div>
              <p className="text-xs text-text-light">
                Our tailoring team is available to assist you with sizing, fittings, or custom quotes.
              </p>
            </div>
            <button
              onClick={onNavigateToContact}
              className="px-6 py-3 bg-gradient-to-br from-lavender via-mauve to-mauve-deep text-white text-xs font-bold tracking-wider uppercase rounded-[2px] border-none cursor-pointer hover:opacity-95 transition-opacity flex items-center gap-2 shrink-0"
            >
              Schedule a Fitting
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
