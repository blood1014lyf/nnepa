/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Check, MessageSquare } from 'lucide-react';
import { Product } from '../types.ts';
import featuredVideo from '../assets/videos/featured-outfit.mp4';

interface FeaturedOutfitProps {
  outfit?: Product | null;
  onViewDetails: (product?: Product) => void;
}

export default function FeaturedOutfit({ outfit, onViewDetails }: FeaturedOutfitProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleActionClick = () => {
    onViewDetails(outfit || undefined);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const playVideo = () => {
      video.play().catch(() => {});
    };

    playVideo();

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !reducedMotionQuery.matches) {
            playVideo();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(video);

    const handleUserInteraction = () => {
      playVideo();
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  const garmentName = outfit?.name || 'The Signature Emerald & Plum Ensemble';
  const garmentPrice = outfit?.price ? `$${outfit.price} USD` : '$420 USD';

  return (
    <section id="featured-outfit" className="w-full bg-pearl-2/30 pt-14 pb-16 sm:pt-20 sm:pb-24 border-y border-lilac/15 select-none">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-14">
        {/* Desktop Editorial Split Showcase (lg+) / Mobile Focused Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
          
          {/* Video Column: Native 9:16 aspect ratio in sharp luxury frame — never stretched or blurry */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center">
            <div
              onClick={handleActionClick}
              className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_22px_60px_rgba(58,34,72,0.18)] border border-lilac/30 bg-plum-dark/5 cursor-pointer group transition-transform duration-500 hover:scale-[1.01]"
              title="Click to view garment details"
            >
              <video
                ref={videoRef}
                src={featuredVideo}
                width={1080}
                height={1920}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover block"
              />

              {/* Subtle luxury ambient sheen */}
              <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

              {/* Floating Bestseller Tag on Video */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-lilac/30 shadow-md flex items-center gap-1.5 pointer-events-none">
                <Sparkles className="w-3 h-3 text-lavender" />
                <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-plum-dark">
                  Bestseller in Motion
                </span>
              </div>
            </div>
          </div>

          {/* Editorial Content Column */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center text-center lg:text-left space-y-6">
            <div>
              <span className="text-xs font-bold tracking-[0.28em] uppercase text-lavender block mb-2">
                Signature Bespoke Creation • Made in Accra
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-plum-dark leading-tight">
                {garmentName}
              </h2>
              <div className="mt-3 flex items-center justify-center lg:justify-start gap-3">
                <span className="font-serif text-2xl sm:text-3xl font-medium text-mauve-deep">
                  {garmentPrice}
                </span>
                <span className="text-xs text-text-light font-mono px-2.5 py-1 bg-white border border-lilac/25 rounded-full">
                  Complimentary Worldwide DHL Delivery
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-text-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Handcrafted in our Accra studio using authentic Ghanaian textiles, tailored drape, and refined finishing. Captured in motion to reveal the effortless fluidity of the silhouette and the rich depth of our palette.
            </p>

            {/* Editorial Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 pb-1 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="p-3 bg-white rounded-lg border border-lilac/25 shadow-xs flex items-start gap-2.5">
                <Check className="w-4 h-4 text-lavender shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-plum-dark">Tailored Fit</h4>
                  <p className="text-[0.7rem] text-text-light mt-0.5 leading-snug">Calibrated high-waist-to-feet sizing</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-lilac/25 shadow-xs flex items-start gap-2.5">
                <Check className="w-4 h-4 text-lavender shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-plum-dark">Authentic</h4>
                  <p className="text-[0.7rem] text-text-light mt-0.5 leading-snug">Ghanaian heritage craftsmanship</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-lilac/25 shadow-xs flex items-start gap-2.5">
                <Check className="w-4 h-4 text-lavender shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-plum-dark">DHL Express</h4>
                  <p className="text-[0.7rem] text-text-light mt-0.5 leading-snug">Door-to-door insured transit</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                id="btn-featured-view-details"
                onClick={handleActionClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-9 sm:py-4 bg-plum-dark hover:bg-plum text-white text-xs font-semibold tracking-[0.22em] uppercase rounded-full shadow-[0_10px_35px_rgba(58,34,72,0.2)] hover:shadow-[0_14px_45px_rgba(58,34,72,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
              >
                <span>{outfit ? 'View Garment Details' : 'Explore Collection'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <a
                href={`https://wa.me/233538795669?text=${encodeURIComponent(
                  `Hello Nnepa Foriwaa! I am inquiring about your bestseller piece "${garmentName}". Could you share details regarding availability and bespoke sizing?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 bg-white hover:bg-zinc-50 text-plum-dark border border-lilac/40 text-xs font-semibold tracking-[0.18em] uppercase rounded-full shadow-xs transition-all duration-300 hover:border-lavender no-underline"
              >
                <MessageSquare className="w-3.5 h-3.5 text-lavender" />
                <span>Speak with Stylist</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
