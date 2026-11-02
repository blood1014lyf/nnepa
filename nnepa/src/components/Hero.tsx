/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
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

      {/* Subtle top scrim for navbar legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/15 pointer-events-none" />
    </section>
  );
}
