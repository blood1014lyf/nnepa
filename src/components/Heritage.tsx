/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fabricDetailImg from '../assets/images/regenerated_image_1780428425083.jpeg';
import traditionalLoomImg from '../assets/images/regenerated_image_1780428426150.jpeg';
import embroiderySewingImg from '../assets/images/regenerated_image_1780428427004.jpeg';

export default function Heritage() {
  const steps = [
    {
      symbol: '✦',
      title: 'Ethically Sourced Fabric',
      desc: 'We partner directly with local weavers in Ghana, Nigeria, and Senegal for authentic Ankara, Kente, and Aso-oke materials.',
    },
    {
      symbol: '⬡',
      title: 'Made to Measure',
      desc: 'Each garment is custom-tailored to your exact measurements, ensuring a flawless fit every single time.',
    },
    {
      symbol: '◈',
      title: 'Heritage Embroidery',
      desc: 'Hand-embroidered details and beadwork inspired by centuries-old African royal traditions adorn every piece.',
    },
  ];

  return (
    <section id="heritage" className="py-20 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
      {/* Narrative Section: The Art of African Craft */}
      <div className="max-w-3xl mb-12">
        <div className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-mauve-deep flex items-center gap-3.5 mb-2.5 animate-eyebrow-tracking">
          <span className="w-6.5 h-[1px] bg-gradient-to-r from-lavender to-mauve" />
          Our Heritage
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark leading-tight mb-4">
          The Art of <em className="font-serif italic animate-italic-pulse">African Craft</em>
        </h2>
        <p className="text-sm sm:text-base font-light text-text-muted leading-relaxed max-w-[620px]">
          Every piece from Nnepa Foriwaa is a labour of love — sourced from the finest artisans across West Africa and tailored to perfection for modern African elegance.
        </p>
      </div>

      {/* Collage of Photos directly under The Art of African Craft */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 h-[440px] sm:h-[480px] lg:h-[540px] mb-12">
        <div className="sm:col-span-6 overflow-hidden relative group rounded-[2px] h-full">
          <img
            src={fabricDetailImg}
            alt="Handcrafted fabric detail close up"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="sm:col-span-3 overflow-hidden relative group rounded-[2px] h-full">
          <img
            src={traditionalLoomImg}
            alt="Traditional African Looming"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="sm:col-span-3 overflow-hidden relative group rounded-[2px] h-full">
          <img
            src={embroiderySewingImg}
            alt="Golden embroidery sewing"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      {/* Craft Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-mauve/15">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className="w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-br from-lavender/15 to-mauve/15 border border-solid border-lilac/25 flex items-center justify-center text-base text-lavender">
              {step.symbol}
            </div>
            <div>
              <h4 className="font-serif text-lg font-medium text-plum-dark mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
