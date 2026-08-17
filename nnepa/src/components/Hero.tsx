/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HERO_SLIDES } from '../data.ts';

interface HeroProps {
  onExplore: () => void;
  onViewLookbook: () => void;
}

export default function Hero({ onExplore, onViewLookbook }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = HERO_SLIDES.length;
  const slideInterval = 4800; // ms

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
      className="relative h-svh min-h-[600px] overflow-hidden bg-plum-dark select-none"
    >
      {/* Slides Track */}
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
              {/* Ken burns animated background */}
              <div
                className={`absolute inset-[-6%] bg-cover bg-center transition-all duration-1000 ${
                  isActive ? 'animate-kenburns' : ''
                }`}
                style={{ backgroundImage: `url('${slide.imageUrl}')` }}
              />
              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-plum/72 via-plum-dark/48 to-lavender/18" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a30]/60 via-transparent to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Hero Overlain Content */}
      <div className="relative z-20 h-full flex flex-col justify-center pt-24 sm:pt-28 md:pt-0 pb-12 md:pb-0 px-6 sm:px-12 md:px-16 max-w-[860px]">
        <div className="flex items-center gap-3 sm:gap-4 text-[0.6rem] md:text-xs font-semibold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-lilac animate-fade-in mt-2 sm:mt-0">
          <span className="w-7 sm:w-9 h-[1px] bg-gradient-to-r from-lilac to-transparent" />
          New Collection 2025
        </div>

        <h1 className="mt-3 sm:mt-5 text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light text-pearl leading-[1.08] sm:leading-[1.06] tracking-tight">
          Wear Your <br className="hidden sm:inline" />
          <em className="font-serif italic text-lilac">Heritage</em> <br />
          With Grace
        </h1>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base font-light tracking-[0.05em] sm:tracking-[0.06em] leading-relaxed text-pearl-2/70 max-w-[430px]">
          Ready-to-wear & custom-made luxury African fashion for men, women & children — handcrafted with ancestral artistry and contemporary elegance.
        </p>

        <div className="flex flex-wrap gap-4 mt-8 md:mt-11">
          <button
            onClick={onExplore}
            className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-br from-lavender to-mauve-deep text-white text-[0.68rem] font-semibold tracking-[0.25em] uppercase border-none cursor-pointer rounded-[2px] shadow-[0_8px_32px_rgba(155,132,204,0.35)] hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(155,132,204,0.45)] transition-all flex items-center gap-2"
          >
            Explore Collection
            <ArrowRight className="w-[14px] h-[14px]" />
          </button>
          <button
            onClick={onViewLookbook}
            className="px-8 sm:px-9 py-3.5 sm:py-4 bg-transparent text-pearl text-[0.68rem] font-semibold tracking-[0.25em] uppercase border border-solid border-lilac/45 hover:border-lilac hover:bg-lilac/10 hover:-translate-y-[3px] cursor-pointer rounded-[2px] transition-all"
          >
            View Lookbook
          </button>
        </div>
      </div>

      {/* Desktop Side Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute top-1/2 left-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-solid border-lilac/35 bg-white/7 backdrop-blur-md text-lilac items-center justify-center cursor-pointer hover:bg-lilac/20 hover:border-lilac active:scale-95 transition-all"
        aria-label="Previous Slide"
      >
        <ArrowLeft className="w-[18px] h-[18px]" />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute top-1/2 right-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-solid border-lilac/35 bg-white/7 backdrop-blur-md text-lilac items-center justify-center cursor-pointer hover:bg-lilac/20 hover:border-lilac active:scale-95 transition-all"
        aria-label="Next Slide"
      >
        <ArrowRight className="w-[18px] h-[18px]" />
      </button>



      {/* Desktop Bullet Dots */}
      <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-30 gap-2 items-center">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`cursor-pointer transition-all duration-350 border-none ${
              idx === current ? 'bg-lilac w-7 h-1.5 rounded-[3px]' : 'bg-lilac/40 w-1.5 h-1.5 rounded-full'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop Slide Index Meter Counter */}
      <div className="hidden md:block absolute right-12 bottom-10 z-30 font-serif text-[0.75rem] text-lilac/55 tracking-[0.22em] selection:bg-transparent">
        <strong className="text-lilac text-lg">{currentFormatted}</strong> / {totalFormatted}
      </div>

      {/* Slide Auto Timer Linear Accent Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-lilac/15">
        <div
          className="h-full bg-gradient-to-r from-lavender to-lilac transition-all"
          style={{ width: `${progress}%`, transitionDuration: progress === 0 ? '0ms' : '30ms' }}
        />
      </div>
    </section>
  );
}
