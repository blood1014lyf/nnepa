/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { TikTokIcon } from './TikTokIcon.tsx';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';
import founderImage from '../assets/images/founder.png';

export default function AboutView() {
  return (
    <div className="pt-28 pb-20 bg-pearl min-h-screen" id="about-brand-view">
      {/* Founder & Brand Story */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Founder Portrait */}
          <div className="lg:col-span-5">
            <figure className="m-0">
              <div className="overflow-hidden rounded-[2px] bg-pearl-2 border border-lilac/20 shadow-[0_12px_40px_rgba(58,34,72,0.08)]">
                <img
                  src={founderImage}
                  alt="Founder of Nnepa Foriwaa"
                  fetchPriority="high"
                  className="w-full aspect-[3/4] object-cover object-top block"
                />
              </div>
              <figcaption className="mt-3 text-[0.65rem] font-semibold tracking-[0.24em] uppercase text-mauve-deep">
                Founder — Nnepa Foriwaa
              </figcaption>
            </figure>
          </div>

          {/* Concise Brand Story */}
          <div className="lg:col-span-7">
            <span className="text-[0.62rem] font-bold tracking-[0.4em] uppercase text-mauve-deep mb-3.5 inline-block">
              About Nnepa Foriwaa
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-plum-dark font-light mb-5 leading-[1.08]">
              Rooted. Refined. <em className="font-serif italic">Regal.</em>
            </h1>
            <div className="w-16 h-[2px] bg-gradient-to-r from-lavender to-mauve mb-8" />

            <div className="space-y-6 text-base sm:text-lg text-plum-dark/90 leading-relaxed max-w-xl font-light">
              <p className="border-l-2 border-lavender/40 pl-4 sm:pl-6 italic text-plum-dark/95">
                Founded in 2015 and actively in business since,{' '}
                <strong className="font-medium text-plum-dark">Nnepa Foriwaa</strong> is a premium
                African fashion brand crafting clothing for women and men.
              </p>

              <p className="text-sm sm:text-base text-text-light leading-relaxed pl-4 sm:pl-6">
                Each piece merges modern silhouettes with the richness of African heritage,
                resulting in classy, distinctive designs made for the modern Afrocentric
                individual. Quality, refined detail, and timeless elegance guide every stitch.
              </p>

              <div className="pt-2 pl-4 sm:pl-6">
                <span className="inline-block px-5 py-2.5 bg-lavender/10 border border-lavender/25 rounded-[2px] text-xs sm:text-sm font-serif tracking-[0.2em] text-mauve-deep uppercase font-medium">
                  Nnepa Foriwaa — Rooted. Refined. Regal.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Presence */}
        <div className="mt-16 pt-10 border-t border-lilac/20 text-center">
          <span className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-lavender block mb-2">
            Follow Our Journey
          </span>
          <h2 className="font-serif text-2xl text-plum-dark font-light mb-5">
            Experience Nnepa Foriwaa Online
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/nnepaforiwaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-lilac/20 hover:border-lavender text-plum-dark hover:text-lavender text-xs transition-all shadow-sm no-underline"
            >
              <Instagram className="w-4 h-4 text-lavender" />
              <span>
                Instagram: <strong className="font-semibold">@nnepaforiwaa</strong>
              </span>
            </a>
            <a
              href="https://www.tiktok.com/@nnepa.foriwaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-lilac/20 hover:border-lavender text-plum-dark hover:text-lavender text-xs transition-all shadow-sm no-underline"
            >
              <TikTokIcon className="w-4 h-4 fill-current" />
              <span>
                TikTok: <strong className="font-semibold">@nnepa.foriwaa</strong>
              </span>
            </a>
            <a
              href="https://www.facebook.com/nnepaforiwaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-lilac/20 hover:border-lavender text-plum-dark hover:text-lavender text-xs transition-all shadow-sm no-underline"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>
                Facebook: <strong className="font-semibold">nnepa foriwaa</strong>
              </span>
            </a>
            <a
              href="https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-emerald-200 hover:border-emerald-400 text-emerald-800 text-xs transition-all shadow-sm no-underline"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
              <span>
                WhatsApp: <strong className="font-semibold">+233 53 879 5669</strong>
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
