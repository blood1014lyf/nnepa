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
    <section id="featured-outfit" className="w-full bg-pearl pt-14 pb-14 sm:pt-20 sm:pb-20 select-none">
      {/* "View Our Bestseller" section header fading in under the hero on the page */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-8 sm:mb-10 text-center animate-fade-in">
        <span className="text-[0.62rem] font-bold tracking-[0.35em] uppercase text-mauve-deep block mb-2 animate-eyebrow-tracking">
          Curated Atelier Highlight
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark leading-tight animate-text-reveal">
          View Our Bestseller
        </h2>
      </div>

      {/* Video Container — Zero overlay, completely uncropped natural portrait aspect ratio */}
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-0">
        <div
          onClick={() => onViewDetails(outfit)}
          className="relative w-full overflow-hidden bg-black rounded-[2px] shadow-[0_16px_50px_rgba(58,34,72,0.14)] cursor-pointer group"
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
            className="w-full h-auto max-h-[82vh] object-contain mx-auto block transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </div>

        {/* ONLY View Details button situated outside/under the video — video remains 100% unobstructed with zero overlay */}
        <div className="mt-7 sm:mt-9 flex justify-center items-center">
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
