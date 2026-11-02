/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../data.ts';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = TESTIMONIALS.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [handleNext, isPaused]);

  // Touch gesture support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="testimonials"
      className="py-24 px-6 md:px-12 bg-pearl select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with Kinetic Typography */}
        <div className="text-center mb-14">
          <div className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-mauve-deep flex justify-center items-center gap-3 mb-2.5 animate-eyebrow-tracking">
            <span className="w-5 h-[1px] bg-gradient-to-r from-lavender to-mauve" />
            Client Stories
            <span className="w-5 h-[1px] bg-gradient-to-l from-lavender to-mauve" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark">
            What Our <em className="font-serif italic animate-italic-pulse">Clients</em> Say
          </h2>
        </div>

        {/* Carousel Container */}
        <div
          className="relative max-w-3xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Carousel Window */}
          <div className="overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-solid border-lilac/30 shadow-[0_16px_50px_rgba(58,34,72,0.08)]">
            <div
              className="flex transition-transform duration-600 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="w-full shrink-0 p-8 sm:p-12 md:p-14 relative flex flex-col justify-between min-h-[300px]"
                >
                  {/* Decorative background quote mark */}
                  <div className="absolute top-2 left-6 sm:left-10 font-serif text-[8rem] sm:text-[9rem] leading-none text-lavender/10 select-none pointer-events-none">
                    “
                  </div>

                  <div className="relative z-10">
                    {/* Tag & Rating row */}
                    <div className="flex items-center justify-between gap-2 mb-6">
                      {t.tag && (
                        <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase px-3 py-1 bg-lavender/10 text-plum-dark rounded-[2px] border border-lilac/25">
                          {t.tag}
                        </span>
                      )}
                      <div className="flex gap-1.5" aria-label={`${t.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < t.rating ? 'text-mauve fill-mauve' : 'text-dusty'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="font-serif text-lg sm:text-2xl text-plum-dark font-light leading-relaxed mb-8 sm:mb-10 italic">
                      "{t.text}"
                    </p>
                  </div>

                  {/* Author Details Footer */}
                  <div className="relative z-10 pt-5 border-t border-lilac/15 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold tracking-wider uppercase text-plum-dark block">
                        {t.name}
                      </span>
                      {t.location && (
                        <span className="text-xs text-text-light font-normal block mt-0.5">
                          {t.location}
                        </span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender/25 to-mauve/25 border border-lilac/20 flex items-center justify-center text-plum-dark font-serif font-bold text-sm shadow-xs">
                      {t.name.charAt(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls: Prev & Next Buttons */}
          <div className="flex items-center justify-between mt-8 px-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="w-10 h-10 rounded-full bg-white border border-lilac/25 text-plum-dark hover:text-lavender hover:border-lavender flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Indicator Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full border-none cursor-pointer p-0 ${
                    idx === currentIndex
                      ? 'w-7 h-2 bg-gradient-to-r from-lavender to-mauve'
                      : 'w-2 h-2 bg-dusty hover:bg-lavender/50'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="w-10 h-10 rounded-full bg-white border border-lilac/25 text-plum-dark hover:text-lavender hover:border-lavender flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
