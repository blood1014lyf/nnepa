/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HERO_SLIDES } from '../data.ts';

interface HeroProps {
  onExplore?: () => void;
  onContact?: () => void;
}

export default function Hero({ onExplore, onContact }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = HERO_SLIDES.length;
  const slideInterval = 5000; // ms

  const startSlideTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / slideInterval) * 100, 100);
      setProgress(pct);
    }, 30);

    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, slideInterval);
  };

  useEffect(() => {
    startSlideTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [current]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const currentFormatted = String(current + 1).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  return (
    <section
      id="home"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative min-h-[640px] h-[100svh] overflow-hidden bg-plum-dark select-none flex items-center"
    >
      {/* Slides Background Track */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Ken burns imagery */}
              <div
                className={`absolute inset-[-4%] bg-cover bg-center transition-all duration-1000 ${
                  isActive ? 'animate-kenburns' : ''
                }`}
                style={{ backgroundImage: `url('${slide.imageUrl}')` }}
              />

              {/* Clean Cinematic Gradient Overlay (Pure, non-muddy, natural contrast) */}
              <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/90 via-plum-dark/40 to-black/25 sm:bg-gradient-to-r sm:from-plum-dark/85 sm:via-plum-dark/40 sm:to-black/15" />
            </div>
          );
        })}
      </div>

      {/* Hero Typography & Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-16 pt-32 xs:pt-36 sm:pt-14 md:pt-16 pb-12 sm:pb-0">
        <div className="max-w-[720px] flex flex-col justify-center">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-3 text-[0.65rem] sm:text-xs font-semibold tracking-[0.32em] sm:tracking-[0.4em] uppercase text-lilac-light animate-fade-in">
            <span className="w-7 sm:w-9 h-[1.5px] bg-gradient-to-r from-lilac to-transparent" />
            New Collection 2026
          </div>

          {/* Headline */}
          <h1 className="mt-3 sm:mt-5 text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light text-white leading-[1.06] tracking-tight">
            Wear Your <br className="hidden sm:inline" />
            <em className="font-serif italic text-lilac-light font-normal">Heritage</em> <br />
            With Grace
          </h1>

          {/* Description Paragraph (Clean text, no translucent box or border) */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg font-light tracking-wide leading-relaxed text-pearl/90 max-w-[520px]">
            Ready-to-wear and custom luxury made-to-fit clothing, handcrafted with quality African fabrics for the Afrocentric.
          </p>

          {/* Action CTA */}
          <div className="flex flex-col gap-3 sm:gap-3.5 mt-8 xs:mt-10 sm:mt-8 md:mt-10 w-full sm:w-auto items-start">
            {onExplore && (
              <button
                onClick={onExplore}
                className="w-full sm:w-auto sm:min-w-[210px] justify-center px-7 sm:px-9 py-3.5 sm:py-4 bg-gradient-to-br from-lavender via-mauve to-mauve-deep text-white text-[0.7rem] sm:text-xs font-semibold tracking-[0.25em] uppercase border-none cursor-pointer rounded-[2px] shadow-[0_8px_32px_rgba(155,132,204,0.35)] hover:-translate-y-[2px] hover:shadow-[0_12px_36px_rgba(155,132,204,0.45)] transition-all flex items-center gap-2.5 active:scale-[0.98]"
              >
                Shop Now
                <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Desktop Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute top-1/2 left-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-solid border-white/20 bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
        aria-label="Previous Slide"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute top-1/2 right-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-solid border-white/20 bg-black/20 hover:bg-black/40 backdrop-blur-xs text-white items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
        aria-label="Next Slide"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Slide Bullet Indicators */}
      <div className="flex absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 gap-2 items-center">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`cursor-pointer transition-all duration-300 border-none p-0 ${
              idx === current ? 'bg-lilac w-6 sm:w-7 h-1.5 rounded-[3px]' : 'bg-white/40 hover:bg-white/70 w-1.5 h-1.5 rounded-full'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute right-6 sm:right-12 bottom-5 sm:bottom-10 z-30 font-serif text-[0.75rem] text-lilac/70 tracking-[0.2em] selection:bg-transparent">
        <strong className="text-white text-base sm:text-lg">{currentFormatted}</strong> / {totalFormatted}
      </div>

      {/* Slide Auto Timer Linear Accent Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-lavender to-lilac transition-all"
          style={{ width: `${progress}%`, transitionDuration: progress === 0 ? '0ms' : '30ms' }}
        />
      </div>
    </section>
  );
}
