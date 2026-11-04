/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
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

  return (
    <section id="featured-outfit" className="w-full bg-pearl pt-12 pb-14 sm:pt-16 sm:pb-20 select-none">
      {/* Header exactly as in the previous version */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 mb-6 sm:mb-8 text-center animate-fade-in">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark leading-tight">
          Our Bestseller
        </h2>
      </div>

      {/* Video display: sharp and centered on desktop, no extra text */}
      <div className="w-full px-0 sm:px-6">
        <div
          onClick={handleActionClick}
          className="relative w-full max-w-lg lg:max-w-xl mx-auto overflow-hidden cursor-pointer group"
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
            className="w-full h-auto block mx-auto"
          />
        </div>

        {/* View Details button under the video */}
        <div className="mt-8 flex justify-center items-center px-4">
          <button
            type="button"
            id="btn-featured-view-details"
            onClick={handleActionClick}
            className="group inline-flex items-center gap-3 px-9 py-3.5 sm:px-10 sm:py-4 bg-plum-dark hover:bg-plum text-white text-[0.68rem] sm:text-xs font-semibold tracking-[0.25em] uppercase rounded-full shadow-[0_10px_35px_rgba(58,34,72,0.2)] hover:shadow-[0_14px_45px_rgba(58,34,72,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
          >
            <span>{outfit ? 'View Details' : 'Explore Collection'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
