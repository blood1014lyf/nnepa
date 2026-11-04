/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import founderImage from '../assets/images/founder.png';

interface StoryBeatProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

function StoryBeat({ children, delayMs = 0, className = '' }: StoryBeatProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: '950ms',
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`transition-all ${
        isVisible
          ? 'opacity-100 translate-y-0 filter-none'
          : 'opacity-0 translate-y-8 filter blur-[2px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function AboutView() {
  return (
    <div className="pt-28 pb-32 bg-pearl min-h-screen text-plum-dark select-text" id="about-brand-view">
      {/* ═══ CHAPTER I: THE PROLOGUE & SLOGAN ═══ */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto mb-20 sm:mb-28">
        <StoryBeat delayMs={60}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-gradient-to-r from-lavender to-mauve" />
            <span className="text-[0.62rem] font-bold tracking-[0.42em] uppercase text-mauve-deep animate-eyebrow-tracking">
              ABOUT NNEPA FORIWAA
            </span>
          </div>
        </StoryBeat>

        <StoryBeat delayMs={140}>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-plum-dark font-light tracking-tight leading-[1.05] mb-6">
            Rooted. Refined. <em className="font-serif italic animate-italic-pulse">Regal.</em>
          </h1>
        </StoryBeat>

        <StoryBeat delayMs={220}>
          <div className="w-24 h-[2px] bg-gradient-to-r from-lavender via-mauve to-transparent mb-12" />
        </StoryBeat>
      </section>

      {/* ═══ CHAPTER II: GENESIS & VISION (STORY FLOW) ═══ */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto mb-24 sm:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Founder Portrait in Editorial Frame */}
          <div className="lg:col-span-5">
            <StoryBeat delayMs={180}>
              <figure className="m-0 sticky top-32">
                <div className="overflow-hidden rounded-[2px] bg-pearl-2 border border-lilac/30 shadow-[0_16px_50px_rgba(58,34,72,0.10)] relative group">
                  <img
                    src={founderImage}
                    alt="Founder of Nnepa Foriwaa"
                    fetchPriority="high"
                    className="w-full aspect-[3/4] object-cover object-top block transition-transform duration-700 ease-out group-hover:scale-103"
                  />
                  <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                </div>
                <figcaption className="mt-3.5 text-[0.64rem] font-bold tracking-[0.26em] uppercase text-mauve-deep flex items-center justify-between">
                  <span>Founder</span>
                  <span>Nnepa Foriwaa</span>
                </figcaption>
              </figure>
            </StoryBeat>
          </div>

          {/* Narrative Story Stream */}
          <div className="lg:col-span-7 space-y-10 sm:space-y-12">
            <StoryBeat delayMs={120}>
              <div className="relative pl-6 sm:pl-8 border-l-2 border-lavender/50">
                <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-2">
                  Chapter I &bull; Genesis
                </span>
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light text-plum-dark/95 leading-relaxed italic">
                  Born out of a love for fashion and the desire to explore the endless possibilities of style, Nnepa Foriwaa was established in 2015 and began its active fashion journey in 2023.
                </p>
              </div>
            </StoryBeat>

            <StoryBeat delayMs={180}>
              <div className="relative pl-6 sm:pl-8 border-l-2 border-lilac/30">
                <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-2">
                  Chapter II &bull; Vision
                </span>
                <p className="text-base sm:text-lg text-plum-dark/85 leading-relaxed font-light">
                  From the beginning, the vision has been to bring versatility, contemporary elegance and a touch of African heritage into fashion.
                </p>
              </div>
            </StoryBeat>

            <StoryBeat delayMs={240}>
              <div className="relative pl-6 sm:pl-8 border-l-2 border-lilac/30">
                <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-lavender block mb-2">
                  Chapter III &bull; Identity
                </span>
                <p className="text-base sm:text-lg text-plum-dark/85 leading-relaxed font-light">
                  We believe fashion should be expressive, versatile and deeply personal. It should allow individuals to explore different styles, silhouettes and expressions while remaining connected to the beauty and richness of African identity.
                </p>
              </div>
            </StoryBeat>
          </div>
        </div>
      </section>

      {/* ═══ CHAPTER III: THE THREE DEFINING PRINCIPLES ═══ */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto mb-24 sm:mb-32">
        <StoryBeat delayMs={100}>
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-[0.62rem] font-bold tracking-[0.35em] uppercase text-lavender block mb-3">
              Core Creative Direction
            </span>
            <p className="font-serif text-2xl sm:text-3xl text-plum-dark font-light leading-snug">
              Our approach is built on three defining principles: versatility, African influence and impeccable finishing.
            </p>
            <div className="w-12 h-[1.5px] bg-mauve/40 mx-auto mt-6" />
          </div>
        </StoryBeat>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {/* Principle 01: Versatility */}
          <StoryBeat delayMs={160} className="h-full">
            <div className="h-full p-8 bg-pearl-2 rounded-[2px] border border-lilac/30 shadow-[0_8px_30px_rgba(58,34,72,0.04)] hover:shadow-[0_12px_40px_rgba(58,34,72,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[0.65rem] font-bold tracking-[0.28em] text-lavender uppercase block mb-3">
                  01 &bull; Principle
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-plum-dark font-medium mb-4">
                  Versatility
                </h2>
                <p className="text-xs sm:text-sm text-plum-dark/80 leading-relaxed font-light">
                  Versatility inspires us to explore different styles, experiment with silhouettes and create pieces that allow individuals to express themselves beyond conventional fashion boundaries.
                </p>
              </div>
              <div className="w-8 h-[1px] bg-lilac/40 mt-6" />
            </div>
          </StoryBeat>

          {/* Principle 02: African Influence */}
          <StoryBeat delayMs={240} className="h-full">
            <div className="h-full p-8 bg-pearl-2 rounded-[2px] border border-lilac/30 shadow-[0_8px_30px_rgba(58,34,72,0.04)] hover:shadow-[0_12px_40px_rgba(58,34,72,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[0.65rem] font-bold tracking-[0.28em] text-lavender uppercase block mb-3">
                  02 &bull; Principle
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-plum-dark font-medium mb-4">
                  African Influence
                </h2>
                <p className="text-xs sm:text-sm text-plum-dark/80 leading-relaxed font-light">
                  African Influence remains at the heart of our creative direction. We draw inspiration from the richness of African culture, heritage and aesthetics, incorporating these elements into contemporary designs without being confined to traditional interpretations.
                </p>
              </div>
              <div className="w-8 h-[1px] bg-lilac/40 mt-6" />
            </div>
          </StoryBeat>

          {/* Principle 03: Impeccable Finishing */}
          <StoryBeat delayMs={320} className="h-full">
            <div className="h-full p-8 bg-pearl-2 rounded-[2px] border border-lilac/30 shadow-[0_8px_30px_rgba(58,34,72,0.04)] hover:shadow-[0_12px_40px_rgba(58,34,72,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[0.65rem] font-bold tracking-[0.28em] text-lavender uppercase block mb-3">
                  03 &bull; Principle
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-plum-dark font-medium mb-4">
                  Impeccable Finishing
                </h2>
                <p className="text-xs sm:text-sm text-plum-dark/80 leading-relaxed font-light">
                  Impeccable Finishing defines our commitment to quality. We believe that a beautiful design must be matched by exceptional craftsmanship. From fabric selection and construction to the smallest finishing details, we approach every garment with precision, care and intention.
                </p>
              </div>
              <div className="w-8 h-[1px] bg-lilac/40 mt-6" />
            </div>
          </StoryBeat>
        </div>
      </section>

      {/* ═══ CHAPTER IV: PHILOSOPHY & MOTTO (EPILOGUE) ═══ */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto">
        <div className="relative pl-6 sm:pl-10 border-l-2 border-lavender/50 space-y-8 sm:space-y-10">
          <StoryBeat delayMs={120}>
            <p className="text-base sm:text-lg md:text-xl text-plum-dark/90 leading-relaxed font-light">
              From everyday sophistication to distinctive statement pieces, we create fashion for individuals who appreciate creativity, quality and the freedom to express themselves through what they wear.
            </p>
          </StoryBeat>

          <StoryBeat delayMs={200}>
            <p className="text-base sm:text-lg md:text-xl text-plum-dark/90 leading-relaxed font-light">
              Nnepa Foriwaa is more than clothing. It is an exploration of style, culture and individuality, brought together through thoughtful design, versatility and refined craftsmanship.
            </p>
          </StoryBeat>

          <StoryBeat delayMs={280}>
            <div className="pt-6 border-t border-lilac/25">
              <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-plum-dark font-medium tracking-wide">
                Nnepa Foriwaa. Rooted. Refined. Regal.
              </p>
            </div>
          </StoryBeat>
        </div>
      </section>
    </div>
  );
}
