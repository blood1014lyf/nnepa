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

  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
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
    const syncPlayback = (prefersReducedMotion: boolean) => {
      if (prefersReducedMotion) {
        video.pause();
      } else {
        playVideo();
      }
    };

    syncPlayback(reducedMotionQuery.matches);
    const onChange = (event: MediaQueryListEvent) => syncPlayback(event.matches);
    reducedMotionQuery.addEventListener('change', onChange);

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

    return () => {
      reducedMotionQuery.removeEventListener('change', onChange);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="featured-outfit"
      onClick={() => onViewDetails(outfit)}
      className="relative w-full min-h-[580px] lg:min-h-[720px] h-[75vh] overflow-hidden bg-plum-dark select-none group cursor-pointer"
    >
      {/* Top Bestseller Badge on top of the video */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-12 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-semibold tracking-[0.2em] uppercase text-black shadow-md border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          Our Bestseller
        </span>
      </div>

      <video
        ref={videoRef}
        src={featuredVideo}
        width={576}
        height={1024}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
      />

      {/* Subtle cinematic gradient overlay for clean contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

      {/* Full-width editorial details (without description) */}
      <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 md:p-16 z-10 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6 pointer-events-auto">
          <div>
            <span className="text-[0.62rem] font-bold tracking-[0.3em] uppercase text-white/75 block mb-2">
              Our Bestseller {outfit.subcategory ? `• ${outfit.subcategory}` : ''}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight">
              {outfit.name}
            </h2>
            <div className="font-serif text-xl sm:text-2xl text-white/90 mt-2">
              {formatPrice(outfit.price)}
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              id="btn-featured-view-details"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(outfit);
              }}
              className="px-8 py-3.5 sm:px-9 sm:py-4 bg-white/95 hover:bg-white text-plum-dark text-[0.68rem] sm:text-xs font-semibold tracking-[0.25em] uppercase rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
