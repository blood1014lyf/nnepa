/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import founderImage from '../assets/images/founder.png';

export default function AboutView() {
  return (
    <div className="pt-28 pb-24 bg-pearl min-h-screen" id="about-brand-view">
      <section className="px-6 md:px-12 max-w-4xl mx-auto">
        {/* Slogan & Title */}
        <div className="mb-8">
          <span className="text-[0.62rem] font-bold tracking-[0.4em] uppercase text-mauve-deep mb-3.5 inline-block animate-eyebrow-tracking">
            ABOUT NNEPA FORIWAA
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-plum-dark font-light mb-4 leading-[1.08]">
            Rooted. Refined. <em className="font-serif italic animate-italic-pulse">Regal.</em>
          </h1>
          <div className="w-16 h-[2px] bg-gradient-to-r from-lavender to-mauve mb-6" />
        </div>

        {/* Founder Portrait */}
        <figure className="m-0 mb-12 max-w-md">
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

        {/* Brand Narrative */}
        <div className="space-y-6 text-base sm:text-lg text-plum-dark/90 leading-relaxed font-light">
          <p className="border-l-2 border-lavender/40 pl-4 sm:pl-6 italic text-plum-dark/95">
            Born out of a love for fashion and the desire to explore the endless possibilities of style, Nnepa Foriwaa was established in 2015 and began its active fashion journey in 2023.
          </p>

          <p className="text-sm sm:text-base text-plum-dark/85 leading-relaxed pl-4 sm:pl-6">
            From the beginning, the vision has been to bring versatility, contemporary elegance and a touch of African heritage into fashion.
          </p>

          <p className="text-sm sm:text-base text-plum-dark/85 leading-relaxed pl-4 sm:pl-6">
            We believe fashion should be expressive, versatile and deeply personal. It should allow individuals to explore different styles, silhouettes and expressions while remaining connected to the beauty and richness of African identity.
          </p>
        </div>

        {/* 3 Defining Principles */}
        <div className="mt-12 pt-10 border-t border-lilac/20">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-mauve-deep mb-8">
            Our approach is built on three defining principles: versatility, African influence and impeccable finishing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-pearl-2 rounded-[2px] border border-lilac/25 shadow-sm">
              <span className="text-[0.65rem] font-bold tracking-[0.25em] text-lavender uppercase block mb-2">
                01 &bull; Principle
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-plum-dark font-medium mb-3">
                Versatility
              </h2>
              <p className="text-xs sm:text-sm text-plum-dark/80 leading-relaxed">
                Versatility inspires us to explore different styles, experiment with silhouettes and create pieces that allow individuals to express themselves beyond conventional fashion boundaries.
              </p>
            </div>

            <div className="p-6 bg-pearl-2 rounded-[2px] border border-lilac/25 shadow-sm">
              <span className="text-[0.65rem] font-bold tracking-[0.25em] text-lavender uppercase block mb-2">
                02 &bull; Principle
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-plum-dark font-medium mb-3">
                African Influence
              </h2>
              <p className="text-xs sm:text-sm text-plum-dark/80 leading-relaxed">
                African Influence remains at the heart of our creative direction. We draw inspiration from the richness of African culture, heritage and aesthetics, incorporating these elements into contemporary designs without being confined to traditional interpretations.
              </p>
            </div>

            <div className="p-6 bg-pearl-2 rounded-[2px] border border-lilac/25 shadow-sm">
              <span className="text-[0.65rem] font-bold tracking-[0.25em] text-lavender uppercase block mb-2">
                03 &bull; Principle
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-plum-dark font-medium mb-3">
                Impeccable Finishing
              </h2>
              <p className="text-xs sm:text-sm text-plum-dark/80 leading-relaxed">
                Impeccable Finishing defines our commitment to quality. We believe that a beautiful design must be matched by exceptional craftsmanship. From fabric selection and construction to the smallest finishing details, we approach every garment with precision, care and intention.
              </p>
            </div>
          </div>
        </div>

        {/* Concluding Philosophy & Motto */}
        <div className="mt-12 space-y-6 text-sm sm:text-base text-plum-dark/85 leading-relaxed font-light pl-4 sm:pl-6 border-l-2 border-lavender/40">
          <p>
            From everyday sophistication to distinctive statement pieces, we create fashion for individuals who appreciate creativity, quality and the freedom to express themselves through what they wear.
          </p>

          <p>
            Nnepa Foriwaa is more than clothing. It is an exploration of style, culture and individuality, brought together through thoughtful design, versatility and refined craftsmanship.
          </p>

          <div className="pt-4">
            <p className="font-serif text-xl sm:text-2xl text-plum-dark font-medium tracking-wide">
              Nnepa Foriwaa. Rooted. Refined. Regal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
