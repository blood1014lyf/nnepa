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
    <section id="featured-outfit" className="w-full bg-pearl pt-12 pb-6 sm:pt-16 sm:pb-8 select-none">
      {/* "View Our Bestseller" section header fading in under the hero on the page */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-6 sm:mb-8 text-center sm:text-left animate-fade-in">
        <span className="text-[0.62rem] font-bold tracking-[0.35em] uppercase text-mauve-deep block mb-1.5">
          Curated Atelier Highlight
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark leading-tight">
          View Our Bestseller
        </h2>
      </div>

      {/* Video Container — Only View Details button, zero text overlay */}
      <div
        onClick={() => onViewDetails(outfit)}
        className="relative w-full min-h-[580px] lg:min-h-[720px] h-[75vh] overflow-hidden bg-plum-dark select-none group cursor-pointer"
      >
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

        {/* Subtle cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* ONLY View Details button on the video, no text */}
        <div className="absolute inset-x-0 bottom-8 sm:bottom-12 md:bottom-16 px-8 sm:px-12 md:px-16 z-10 flex justify-center sm:justify-end pointer-events-auto">
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
    </section>
  );
}
