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
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          loading="lazy"
        />

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

        {/* Quick view icon on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-plum-dark flex items-center justify-center shadow-md">
            <Eye className="w-4 h-4 text-plum" />
          </div>
        </div>

        {/* Action slide-up panel on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2.5 bg-black/40 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-350 z-20">
          {product.inStock && product.sizes && product.sizes.length > 0 && (
            <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-7 h-7 text-[0.62rem] font-bold rounded-[2px] transition-all border border-solid cursor-pointer ${
                    selectedSize === s
                      ? 'bg-lavender text-white border-lavender'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
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

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[0.58rem] tracking-[0.2em] uppercase text-text-light mb-1.5 selection:bg-transparent">
            {product.category} · {product.subcategory}
          </div>
          <h4 className="font-serif text-[1rem] font-semibold text-plum-dark leading-snug group-hover:text-lavender transition-colors">
            {product.name}
          </h4>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-lavender whitespace-nowrap">
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
