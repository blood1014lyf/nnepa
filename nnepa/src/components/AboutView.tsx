/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Sparkles, Scissors, Gem, Instagram, Facebook } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon.tsx';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

export default function AboutView() {
  const brandPillars = [
    {
      icon: <Gem className="w-5 h-5 text-lavender" />,
      title: 'Rooted in Heritage',
      desc: 'Merging ancestral textile traditions and authentic African heritage with modern silhouettes for the contemporary Afrocentric wardrobe.'
    },
    {
      icon: <Scissors className="w-5 h-5 text-lavender" />,
      title: 'Refined Detail',
      desc: 'Quality and precision guide every single stitch, ensuring durable finishes, perfect cuts, and custom comfort across all garments.'
    },
    {
      icon: <Crown className="w-5 h-5 text-lavender" />,
      title: 'Regal Elegance',
      desc: 'Classy, distinctive pieces designed to exude quiet majesty and timeless poise for women and men alike.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-lavender" />,
      title: 'Active Since 2015',
      desc: 'A decade of dedication to premium African fashion, offering both exquisite ready-to-wear collections and custom made-to-fit creations.'
    }
  ];

  return (
    <div className="pt-28 pb-20 bg-pearl min-h-screen" id="about-brand-view">
      {/* Editorial Header */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto text-center mb-16">
        <span className="text-[0.62rem] font-bold tracking-[0.4em] uppercase text-mauve-deep mb-3.5 inline-block">
          About Nnepa Foriwaa
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-plum-dark font-light mb-4">
          Rooted. Refined. <em className="font-serif italic text-lavender">Regal.</em>
        </h1>
        <div className="w-16 h-[2px] bg-gradient-to-r from-lavender to-mauve mx-auto mb-8" />
        
        {/* Brand Story Prose */}
        <div className="space-y-6 text-base sm:text-lg text-plum-dark/90 leading-relaxed max-w-2xl mx-auto font-light">
          <p className="border-l-2 border-lavender/40 pl-4 sm:pl-6 text-left italic text-plum-dark/95">
            Founded in 2015 and actively in business since, <strong className="font-medium text-plum-dark">Nnepa Foriwaa</strong> is a premium African fashion brand crafting clothing for women and men.
          </p>

          <p className="text-left text-sm sm:text-base text-text-light leading-relaxed pl-4 sm:pl-6">
            Each piece merges modern silhouettes with the richness of African heritage, resulting in classy, distinctive designs made for the modern Afrocentric individual. Quality, refined detail, and timeless elegance guide every stitch.
          </p>

          <div className="pt-4 text-center">
            <span className="inline-block px-5 py-2.5 bg-lavender/10 border border-lavender/25 rounded-[2px] text-xs sm:text-sm font-serif tracking-[0.2em] text-mauve-deep uppercase font-medium">
              Nnepa Foriwaa — Rooted. Refined. Regal.
            </span>
          </div>
        </div>
      </section>

      {/* Pillars of Excellence Grid */}
      <section className="bg-lavender/5 border-y border-lilac/10 py-16 px-6 md:px-12 mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.58rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-1.5">
              Brand Ethos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-plum-dark font-light">
              Crafted With Purpose
            </h2>
            <div className="w-10 h-[1px] bg-gradient-to-r from-lavender to-mauve mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {brandPillars.map((pillar, i) => (
              <div
                key={i}
                className="flex gap-4 sm:gap-5 bg-white p-6 sm:p-7 rounded-md shadow-[0_4px_24px_rgba(92,61,110,0.03)] border border-lilac/15 hover:border-lavender/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-lavender/10 flex items-center justify-center shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-plum-dark mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-light leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Presence */}
          <div className="mt-12 text-center pt-8 border-t border-lilac/15">
            <span className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-lavender block mb-2">
              Follow Our Journey
            </span>
            <h3 className="font-serif text-2xl text-plum-dark font-light mb-5">
              Experience Nnepa Foriwaa Online
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/nnepaforiwaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-lilac/20 hover:border-lavender text-plum-dark hover:text-lavender text-xs transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4 text-lavender" />
                <span>Instagram: <strong className="font-semibold">@nnepaforiwaa</strong></span>
              </a>
              <a
                href="https://www.tiktok.com/@nnepa.foriwaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-lilac/20 hover:border-lavender text-plum-dark hover:text-lavender text-xs transition-all shadow-sm"
              >
                <TikTokIcon className="w-4 h-4 fill-current" />
                <span>TikTok: <strong className="font-semibold">@nnepa.foriwaa</strong></span>
              </a>
              <a
                href="https://www.facebook.com/nnepaforiwaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-lilac/20 hover:border-lavender text-plum-dark hover:text-lavender text-xs transition-all shadow-sm"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook: <strong className="font-semibold">nnepa foriwaa</strong></span>
              </a>
              <a
                href="https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-emerald-200 hover:border-emerald-400 text-emerald-800 text-xs transition-all shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
                <span>WhatsApp: <strong className="font-semibold">+233 53 879 5669</strong></span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
