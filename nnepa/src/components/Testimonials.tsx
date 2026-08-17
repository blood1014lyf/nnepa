/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../data.ts';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 md:px-12 bg-pearl">
      <div className="text-center mb-14">
        <div className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-mauve-deep flex justify-center items-center gap-3 mb-2.5">
          <span className="w-5 h-[1px] bg-gradient-to-r from-lavender to-mauve" />
          Client Stories
          <span className="w-5 h-[1px] bg-gradient-to-l from-lavender to-mauve" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark">
          What Our <em className="font-serif italic text-lavender">Clients</em> Say
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-white/80 backdrop-blur-md border border-solid border-lilac/30 rounded-lg p-7 relative overflow-hidden shadow-sm hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Quote overlay background */}
            <div className="absolute top-[-16px] left-[20px] font-serif text-[7rem] line-none leading-none text-lavender/10 select-none pointer-events-none">
              “
            </div>

            <div>
              {/* Tag & Rating row */}
              <div className="flex items-center justify-between gap-2 mb-4">
                {t.tag && (
                  <span className="text-[0.58rem] font-bold tracking-[0.18em] uppercase px-2.5 py-1 bg-lavender/10 text-plum-dark rounded-[2px] border border-lilac/20">
                    {t.tag}
                  </span>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < t.rating ? 'text-mauve fill-mauve' : 'text-dusty'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-plum-dark font-normal leading-relaxed mb-6">
                "{t.text}"
              </p>
            </div>

            {/* Author details without photo - first name only */}
            <div className="pt-4 border-t border-lilac/15 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-plum-dark block">
                  {t.name}
                </span>
                {t.location && (
                  <span className="text-[0.63rem] text-text-light font-medium block mt-0.5">
                    {t.location}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lavender/20 to-mauve/20 flex items-center justify-center text-plum-dark font-serif font-bold text-xs">
                {t.name.charAt(0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
