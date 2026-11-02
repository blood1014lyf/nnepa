/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import heroVideo from '../assets/videos/hero.mp4';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncPlayback = (prefersReducedMotion: boolean) => {
      if (prefersReducedMotion) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    syncPlayback(reducedMotionQuery.matches);
    const onChange = (event: MediaQueryListEvent) => syncPlayback(event.matches);
    reducedMotionQuery.addEventListener('change', onChange);
    return () => reducedMotionQuery.removeEventListener('change', onChange);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[640px] h-[100svh] overflow-hidden bg-black select-none"
    >
      <video
        ref={videoRef}
        src={heroVideo}
        width={1024}
        height={576}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Subtle top & bottom scrim for navbar legibility and button contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/30 pointer-events-none" />

      {/* Prettily styled luxury Shop Now button */}
      <div className="absolute inset-x-0 bottom-12 sm:bottom-16 z-20 flex justify-center items-center px-6 pointer-events-auto">
        <a
          href="#/shop"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-white/95 hover:bg-white text-plum-dark text-[0.68rem] sm:text-xs font-semibold tracking-[0.25em] uppercase rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline"
        >
          <span>Shop Now</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
