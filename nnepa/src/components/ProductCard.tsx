/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Heart, ZoomIn, Eye } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onAddToCart: (product: Product, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWished: boolean;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWished,
  onViewDetails,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const getBadgeClass = (badge: Product['badge']) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-gradient-to-r from-lavender to-mauve text-white';
      case 'New':
        return 'bg-pearl text-plum border border-solid border-dusty';
      case 'Sale':
        return 'bg-gradient-to-r from-[#a06080] to-[#7a4060] text-white';
      case 'Exclusive':
        return 'bg-white/95 text-plum-dark shadow-sm';
      default:
        return '';
    }
  };

  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
  };

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(product)}
      className="group bg-white rounded-md overflow-hidden relative cursor-pointer transition-all duration-300 shadow-[0_2px_18px_rgba(92,61,110,0.07)] hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(92,61,110,0.16)] flex flex-col justify-between"
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-pearl-2">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-pearl-2">
            <div className="w-10 h-10 rounded-full border border-lilac/30 flex items-center justify-center mb-2 text-lavender font-serif italic text-sm">
              NF
            </div>
            <span className="font-serif text-xs text-plum-dark font-medium">Nnepa Foriwaa</span>
            <span className="text-[0.52rem] font-bold tracking-[0.18em] uppercase text-mauve-deep mt-0.5">Handcrafted</span>
          </div>
        )}

        {/* Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span
              className={`px-2.5 py-[3px] rounded-full text-[0.52rem] font-bold tracking-[0.16em] uppercase text-center ${getBadgeClass(
                product.badge
              )}`}
            >
              {product.badge}
            </span>
          )}

          {/* In Stock / Out of Stock tag */}
          <span
            className={`px-2 py-[2.5px] rounded-full text-[0.52rem] font-bold tracking-[0.16em] uppercase text-center backdrop-blur-md ${
              product.inStock
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/20'
                : 'bg-rose-500/10 text-rose-600 border border-rose-400/20'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Wishlist Button: directly accessible on mobile touch screens and on desktop hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full border border-solid transition-all flex items-center justify-center cursor-pointer shadow-sm ${
            isWished
              ? 'bg-mauve-deep text-white border-mauve-deep opacity-100'
              : 'bg-white/85 hover:bg-white text-plum-dark border-lilac/20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-white text-white' : 'text-plum-dark'}`} />
        </button>

        {/* Action slide-up panel on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2.5 bg-black/40 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-350 z-20">
          <div className="flex gap-2.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.inStock) {
                  // If sizes are available, require selecting one first. Otherwise default to selected or no size.
                  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                    // Optional: maybe show visual feedback or select first one
                    // Let's just default to first size if none selected, or show a subtle alert
                    onAddToCart(product, product.sizes[0]);
                  } else {
                    onAddToCart(product, selectedSize || undefined);
                  }
                  setSelectedSize(null);
                } else if (onViewDetails) {
                  onViewDetails(product);
                }
              }}
              className={`flex-1 py-3 text-[0.62rem] font-bold tracking-[0.18em] uppercase rounded-[2px] cursor-pointer transition-all border-none ${
                product.inStock
                  ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white hover:opacity-95 active:scale-[0.98]'
                  : 'bg-zinc-600 text-zinc-300 cursor-not-allowed hover:bg-zinc-700'
              }`}
              id={`btn-add-cart-${product.id}`}
            >
              {product.inStock ? (selectedSize ? `Add Size ${selectedSize}` : 'Add to Cart') : 'Inquire'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
            className={`w-10 flex items-center justify-center border border-solid border-white/20 rounded-[2px] cursor-pointer transition-all ${
              isWished ? 'bg-mauve-deep text-white' : 'bg-white/90 text-mauve-deep hover:bg-lilac hover:text-white'
            }`}
            title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
            id={`btn-wish-${product.id}`}
          >
            <Heart className={`w-4.5 h-4.5 ${isWished ? 'fill-white' : ''}`} />
          </button>
          </div>
        </div>
      </div>

      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-mauve-deep/80 mb-1.5 selection:bg-transparent">
            {product.category} · {product.subcategory}
          </div>
          <h4 className="font-serif text-base sm:text-lg font-medium text-plum-dark leading-snug group-hover:text-lavender transition-colors line-clamp-2">
            {product.name}
          </h4>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-base sm:text-lg font-semibold text-lavender whitespace-nowrap">
            {product.originalPrice && (
              <del className="text-text-light font-normal text-xs mr-2 line-through">
                {formatPrice(product.originalPrice)}
              </del>
            )}
            {formatPrice(product.price)}
          </div>

          <div className="flex gap-[1.5px] text-mauve">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < product.rating ? 'fill-mauve' : 'text-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
