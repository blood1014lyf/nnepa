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
    <section id="heritage" className="p-0 grid grid-cols-1 lg:grid-cols-2">
      {/* Mosaic Images */}
      <div className="grid grid-cols-2 grid-rows-2 gap-[4px] min-h-[380px] sm:min-h-[500px] lg:min-h-[680px]">
        <div className="row-span-2 overflow-hidden relative group">
          <img
            src={fabricDetailImg}
            alt="Handcrafted fabric detail close up"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="overflow-hidden relative group">
          <img
            src={traditionalLoomImg}
            alt="Traditional African Looming"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="overflow-hidden relative group">
          <img
            src={embroiderySewingImg}
            alt="Golden embroidery sewing"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      {/* Narrative Section */}
      <div className="bg-gradient-to-br from-pearl-2 to-pearl px-6 py-14 sm:px-12 sm:py-16 lg:p-20 flex flex-col justify-center">
        <div className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-mauve-deep flex items-center gap-3.5 mb-2.5">
          <span className="w-6.5 h-[1px] bg-gradient-to-r from-lavender to-mauve" />
          Our Heritage
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-plum-dark leading-tight mb-4">
          The Art of <em className="font-serif italic text-lavender">African Craft</em>
        </h2>
        <p className="text-sm font-light text-text-muted leading-relaxed max-w-[480px]">
          Every piece from Nnepa Foriwaa is a labour of love — sourced from the finest artisans across West Africa and tailored to perfection for modern African elegance.
        </p>

        <div className="mt-12 flex flex-col gap-7.5">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 items-start pb-7.5 border-b border-solid border-mauve/10 last:pb-0 last:border-b-0">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-lavender/15 to-mauve/15 border border-solid border-lilac/25 flex items-center justify-center text-lg text-lavender">
                {step.symbol}
              </div>
              <div>
                <h4 className="font-serif text-xl font-medium text-plum-dark mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
