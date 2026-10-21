/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Heart, Award, Shield } from 'lucide-react';

export default function AboutView() {
  const brandPillars = [
    {
      icon: <Award className="w-5 h-5 text-lavender" />,
      title: 'Craftsmanship',
      desc: 'Each garment is individually hand-cut and tailored to your precise measurements by our master couturiers in Accra and Lagos.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-lavender" />,
      title: 'Heritage Fabrics',
      desc: 'We use all types of locally sourced fabrics.'
    },
    {
      icon: <Shield className="w-5 h-5 text-lavender" />,
      title: 'Fair Trade Sourcing',
      desc: 'By cutting out middlemen, we ensure 100% of our premium material procurement funds directly support artisan fair-wage livelihoods.'
    },
    {
      icon: <Heart className="w-5 h-5 text-lavender" />,
      title: 'Uncompromised Longevity',
      desc: 'Every piece is crafted with reinforced French seams and generous seam allowances to ensure your royal ensemble lasts generations.'
    }
  ];

  return (
    <div className="pt-28 pb-20 bg-pearl" id="about-brand-view">
      {/* Editorial Header */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto text-center mb-16">
        <span className="text-[0.62rem] font-bold tracking-[0.4em] uppercase text-mauve-deep mb-3.5 inline-block">
          Our Heritage & Ethos
        </span>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-plum-dark font-light mb-6">
          Woven Tradition, <br />
          <em className="font-serif italic text-lavender animate-pulse">Tailored Luxe</em>
        </h2>
        <div className="w-16 h-[2px] bg-gradient-to-r from-lavender to-mauve mx-auto mb-8" />
        <p className="text-sm md:text-base text-text-light leading-relaxed max-w-3xl mx-auto">
          Nnepa Foriwaa is a luxury African fashion brand dedicated to celebrating the majesty of African heritage through modern sartorial paradigms. Our garments are not merely clothes; they are physical expressions of history, pride, and premium craftsmanship.
        </p>
      </section>

      {/* Pillars of Excellence Grid */}
      <section className="bg-lavender/5 border-y border-lilac/10 py-20 px-6 md:px-12 mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="font-serif text-3xl text-plum-dark font-light">Our Pillars of Excellence</h3>
            <p className="text-xs text-text-light tracking-wide uppercase mt-2">Guarantees with every royal commission</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {brandPillars.map((pillar, i) => (
              <div key={i} className="flex gap-5 bg-white p-6 rounded-md shadow-[0_4px_24px_rgba(92,61,110,0.03)] border border-lilac/10">
                <div className="w-11 h-11 rounded-full bg-lavender/10 flex items-center justify-center shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-plum-dark mb-2">{pillar.title}</h4>
                  <p className="text-xs md:text-sm text-text-light leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
