/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import founderImage from '../assets/images/founder.png';

export default function AboutView() {
  return (
    <div className="pt-28 pb-20 bg-pearl min-h-screen" id="about-brand-view">
      {/* Founder & Brand Story */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto">
        {/* Slogan & Title */}
        <div className="mb-8">
          <span className="text-[0.62rem] font-bold tracking-[0.4em] uppercase text-mauve-deep mb-3.5 inline-block">
            About Nnepa Foriwaa
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-plum-dark font-light mb-4 leading-[1.08]">
            Rooted. Refined. <em className="font-serif italic">Regal.</em>
          </h1>
          <div className="w-16 h-[2px] bg-gradient-to-r from-lavender to-mauve mb-6" />
        </div>

        {/* Founder Portrait — directly under the Rooted Refined slogan */}
        <figure className="m-0 mb-10 max-w-md">
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

        {/* Concise Brand Story */}
        <div className="space-y-6 text-base sm:text-lg text-plum-dark/90 leading-relaxed font-light">
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
        </div>
      </section>
    </div>
  );
}
