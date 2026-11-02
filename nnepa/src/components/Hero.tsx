/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HERO_SLIDES } from '../data.ts';

export default function Hero() {
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

              {/* Subtle top/bottom vignette for navigation legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" />
            </div>
          );
        })}
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
