/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';

interface FeaturedOutfitProps {
  outfit: Product;
  onViewDetails: (product: Product) => void;
}

export default function FeaturedOutfit({ outfit, onViewDetails }: FeaturedOutfitProps) {
  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
  };

  return (
    <section id="featured-outfit" className="py-16 md:py-24 px-6 md:px-12 bg-gradient-to-b from-pearl-2 to-pearl border-t border-lilac/10">
      <div className="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="text-[0.65rem] sm:text-xs font-bold tracking-[0.4em] uppercase text-mauve-deep flex items-center justify-center gap-3.5 animate-fade-in">
            <span className="w-6 h-[1px] bg-gradient-to-r from-lavender to-mauve" />
            Featured Outfit
            <span className="w-6 h-[1px] bg-gradient-to-l from-lavender to-mauve" />
          </div>
        </div>

        {/* Minimalist High-Fashion Showcase Card */}
        <div 
          onClick={() => onViewDetails(outfit)}
          className="group cursor-pointer bg-white rounded-md overflow-hidden border border-lilac/20 shadow-[0_4px_30px_rgba(92,61,110,0.06)] hover:shadow-[0_16px_50px_rgba(92,61,110,0.12)] transition-all duration-500 grid grid-cols-1 md:grid-cols-12"
        >
          {/* Visual Imagery (7 cols on desktop) */}
          <div className="md:col-span-7 relative overflow-hidden bg-plum-dark/5 min-h-[300px] xs:min-h-[360px] sm:min-h-[480px]">
            <img
              src={outfit.imageUrl}
              alt={outfit.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Clean Editorial Details & Single View Details Action (5 cols on desktop) */}
          <div className="md:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-white">
            <div>
              <span className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-mauve-deep block mb-3">
                {outfit.category === 'men' ? "Men's Collection" : "Women's Collection"}
                {outfit.subcategory && ` • ${outfit.subcategory}`}
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl text-plum-dark font-light leading-snug mb-3 group-hover:text-mauve transition-colors">
                {outfit.name}
              </h3>

              <div className="font-serif text-xl sm:text-2xl text-mauve-deep mb-5">
                {formatPrice(outfit.price)}
              </div>

              {outfit.description && (
                <p className="text-xs sm:text-sm text-text-light font-light leading-relaxed mb-6">
                  {outfit.description}
                </p>
              )}
            </div>

            {/* View Details Action Button */}
            <div className="pt-4 border-t border-lilac/10">
              <button
                type="button"
                id="btn-featured-view-details"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(outfit);
                }}
                className="w-full py-4 bg-plum-dark hover:bg-plum text-white text-xs font-bold tracking-[0.22em] uppercase rounded-[2px] transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
