/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

export default function Lookbook() {
  return (
    <section id="lookbook" className="bg-gradient-to-br from-plum-dark to-[#2a1440] py-20 md:py-28 select-none relative overflow-hidden">
      {/* Subtle background ambient light */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-lavender/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-mauve/10 rounded-full blur-3xl pointer-events-none" />

      <div className="px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-lilac/20 text-lilac text-[0.65rem] font-semibold tracking-[0.3em] uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5 text-lavender" />
          2025 / 2026 Campaign
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-pearl mb-6">
          The <em className="font-serif italic text-lilac">Lookbook</em>
        </h2>

        <div className="mt-8 bg-white/5 backdrop-blur-md border border-solid border-lilac/20 rounded-xl p-8 sm:p-12 max-w-2xl mx-auto shadow-2xl relative">
          <div className="w-14 h-14 rounded-full bg-lavender/10 border border-lilac/30 flex items-center justify-center mx-auto mb-6 text-lilac">
            <Clock className="w-6 h-6 text-lavender" />
          </div>

          <span className="text-[0.625rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-3">
            Coming Soon
          </span>

          <h3 className="font-serif text-2xl sm:text-3xl text-pearl font-normal mb-4">
            New Lookbook Edition Loading
          </h3>

          <p className="text-sm text-pearl-2/70 leading-relaxed font-light max-w-lg mx-auto">
            We are currently curating our upcoming ready-to-wear and custom-made editorial showcase. Stay tuned for exclusive campaign visuals and runway concepts.
          </p>
        </div>
      </div>
    </section>
  );
}

