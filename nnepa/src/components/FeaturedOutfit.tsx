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
    <section
      id="featured-outfit"
      onClick={() => onViewDetails(outfit)}
      className="relative w-full min-h-[580px] lg:min-h-[720px] h-[75vh] overflow-hidden bg-plum-dark select-none group cursor-pointer"
    >
      <img
        src={outfit.imageUrl}
        alt={outfit.name}
        className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Subtle cinematic gradient overlay for clean contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

      {/* Full-width editorial details (without description) */}
      <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 md:p-16 z-10 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6 pointer-events-auto">
          <div>
            <span className="text-[0.62rem] font-bold tracking-[0.3em] uppercase text-white/75 block mb-2">
              Featured Outfit {outfit.subcategory ? `• ${outfit.subcategory}` : ''}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight">
              {outfit.name}
            </h2>
            <div className="font-serif text-xl sm:text-2xl text-white/90 mt-2">
              {formatPrice(outfit.price)}
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              id="btn-featured-view-details"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(outfit);
              }}
              className="px-8 py-3.5 sm:px-9 sm:py-4 bg-white/95 hover:bg-white text-plum-dark text-[0.68rem] sm:text-xs font-semibold tracking-[0.25em] uppercase rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer border-none hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
