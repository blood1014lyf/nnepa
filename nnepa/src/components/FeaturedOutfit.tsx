/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';
import featuredVideo from '../assets/videos/featured-outfit.mp4';

interface FeaturedOutfitProps {
  outfit: Product;
  onViewDetails: (product: Product) => void;
}

export default function FeaturedOutfit({ outfit, onViewDetails }: FeaturedOutfitProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !reducedMotionQuery.matches) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="featured-outfit" className="w-full bg-pearl pt-12 pb-14 sm:pt-16 sm:pb-20 select-none">
      {/* Section header on the page */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-6 sm:mb-8 text-center animate-fade-in">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark leading-tight">
          Our Bestseller
        </h2>
      </div>

      {/* Full width bestseller video — fills all devices full width uncropped with zero borders just like hero */}
      <div className="w-full">
        <div
          onClick={() => onViewDetails(outfit)}
          className="relative w-full overflow-hidden cursor-pointer group"
        >
          <video
            ref={videoRef}
            src={featuredVideo}
            width={576}
            height={1024}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="w-full h-auto block"
          />
        </div>

        {/* View Details button under the full-width video */}
        <div className="mt-8 flex justify-center items-center px-4">
          <button
            type="button"
            id="btn-featured-view-details"
            onClick={() => onViewDetails(outfit)}
            className="group inline-flex items-center gap-3 px-9 py-3.5 sm:px-10 sm:py-4 bg-plum-dark hover:bg-plum text-white text-[0.68rem] sm:text-xs font-semibold tracking-[0.25em] uppercase rounded-full shadow-[0_10px_35px_rgba(58,34,72,0.2)] hover:shadow-[0_14px_45px_rgba(58,34,72,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
