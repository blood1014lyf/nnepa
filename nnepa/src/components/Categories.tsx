/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import womenCollectionImage from '../assets/images/regenerated_image_1780427248975.jpeg';
import menEleganceImage from '../assets/images/men_elegance_category_1781702880164.jpg';
import kidsRoyalsImage from '../assets/images/kids_royals_category_1781702897100.jpg';

interface CategoriesProps {
  onCategorySelect: (category: 'all' | 'women' | 'men' | 'kids') => void;
}

export default function Categories({ onCategorySelect }: CategoriesProps) {
  const categories = [
    {
      id: 'women',
      title: "Women's Collection",
      label: "Women's",
      count: '24 exclusive pieces',
      imageUrl: womenCollectionImage,
    },
    {
      id: 'men',
      title: "Men's Elegance",
      label: "Men's",
      count: '18 pieces',
      imageUrl: menEleganceImage,
    },
    {
      id: 'kids',
      title: 'Little Royals',
      label: 'Little Royals',
      count: '12 adorable pieces',
      imageUrl: kidsRoyalsImage,
    },
  ];

  return (
    <section id="categories" className="py-24 px-6 md:px-12 bg-pearl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <div className="text-[0.6rem] font-bold tracking-[0.4em] uppercase text-mauve-deep flex items-center gap-3 mb-2.5">
            <span className="w-[26px] h-[1px] bg-gradient-to-r from-lavender to-mauve" />
            Our Collections
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-plum-dark leading-tight">
            Shop By <em className="font-serif italic text-lavender">Category</em>
          </h2>
        </div>
        <p className="text-sm font-light text-text-muted leading-relaxed max-w-[480px]">
          From regal agbadas to vibrant ankara gowns and adorable children's pieces — every garment tells a story of African heritage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onCategorySelect(cat.id as 'women' | 'men' | 'kids')}
            className="group relative rounded-lg overflow-hidden aspect-[3/4] cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl"
            id={`category-card-${cat.id}`}
          >
            <img
              src={cat.imageUrl}
              alt={cat.title}
              className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-110"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* Dark glass backdrop cover */}
            <div className="absolute inset-0 bg-gradient-to-b from-plum/10 to-[#3a2248]/85 transition-opacity" />

            {/* Custom rounded pill overlay top left */}
            <div className="absolute top-5 left-5 px-3.5 py-1.5 bg-plum-dark/65 backdrop-blur-md border border-solid border-lilac/25 text-[0.55rem] font-bold tracking-[0.25em] uppercase text-lilac rounded-full">
              {cat.label}
            </div>

            {/* Category content text bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="text-[0.55rem] font-semibold tracking-[0.3em] uppercase text-lilac mb-1.5 selection:bg-transparent">
                The Collection
              </div>
              <h3 className="font-serif text-3xl font-light text-white leading-tight">
                {cat.title}
              </h3>
              <div className="text-[0.68rem] text-pearl-2/55 mt-1.5 font-light">
                {cat.count}
              </div>

              {/* Reveal button on hover */}
              <div className="inline-flex items-center gap-2 mt-5 px-4.5 py-2.5 rounded-full bg-plum-dark/50 backdrop-blur-md border border-solid border-lilac/35 text-[0.58rem] font-bold tracking-[0.2em] uppercase text-lilac opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-350">
                Browse →
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
