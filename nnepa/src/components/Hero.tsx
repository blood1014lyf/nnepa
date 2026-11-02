/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import heroVideo from '../assets/videos/hero.mp4';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handlePlayState = () => {
      setIsVideoPlaying(true);
    };

    video.addEventListener('play', handlePlayState);
    video.addEventListener('playing', handlePlayState);

    // If video is already playing or ready
    if (!video.paused && video.currentTime > 0) {
      setIsVideoPlaying(true);
    }

    const playVideo = () => {
      video.play().then(() => setIsVideoPlaying(true)).catch(() => {
        // Fallback: show button anyway after 800ms if autoplay blocked
        setTimeout(() => setIsVideoPlaying(true), 800);
      });
    };

    playVideo();

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
    return () => {
      video.removeEventListener('play', handlePlayState);
      video.removeEventListener('playing', handlePlayState);
      reducedMotionQuery.removeEventListener('change', onChange);
    };
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
        onPlay={() => setIsVideoPlaying(true)}
        onPlaying={() => setIsVideoPlaying(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Zero overlay over the video to preserve pure fidelity */}

      {/* Prettily styled luxury Shop Now button that animates and fades in when hero video plays */}
      <div
        className={`absolute inset-x-0 bottom-12 sm:bottom-16 z-20 flex justify-center items-center px-6 transition-all duration-1000 ease-out ${
          isVideoPlaying
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <a
          href="#/shop"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            try {
              localStorage.setItem('nnepa_loader_shown', 'true');
              sessionStorage.setItem('nnepa_loader_shown', 'true');
            } catch {}
          }}
          className="group inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 bg-white/95 hover:bg-white text-plum-dark text-[0.68rem] sm:text-xs font-semibold tracking-[0.25em] uppercase rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] no-underline"
        >
          <span>Shop Now</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
