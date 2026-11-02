/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Heart, ArrowLeft, MessageSquare } from 'lucide-react';
import { Product } from '../types.ts';
import { WOMEN_SIZE_CHART, MEN_SIZE_CHART } from '../sizeChartData.ts';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWished: boolean;
}

export default function ProductDetailsView({
  product,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWished
}: ProductDetailsViewProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');

  const isMen = product.category === 'men';
  const activeWomenRow = WOMEN_SIZE_CHART.find((r) => r.alphaSize === selectedSize) || WOMEN_SIZE_CHART[2];
  const activeMenRow = MEN_SIZE_CHART.find((r) => r.alphaSize === selectedSize) || MEN_SIZE_CHART[2];

  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
  };

  // Pre-filled WhatsApp direct ordering link
  const messageText = `Hello Nnepa Foriwaa! I am interested in ordering:
• Garment: ${product.name}
• Size: ${selectedSize}
• Price: ${formatPrice(product.price)}
Please confirm tailoring and delivery details.`;

  const whatsappUrl = `https://wa.me/233538795669?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="pt-28 pb-20 bg-pearl" id="product-details-container">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Back Link Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 bg-white/50 border border-lilac/10 hover:bg-white text-xs font-bold tracking-[0.2em] uppercase text-mauve-deep mb-10 cursor-pointer rounded-[2px] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-lavender" />
          Back to gallery
        </button>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Block: Image Showcase */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-[4px] overflow-hidden shadow-[0_4px_30px_rgba(92,61,110,0.04)] border border-lilac/10 relative group aspect-[3/4]">
              <img
                src={product.imageUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/lookbook_01_gold_boubou.jpg';
                }}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-lavender to-mauve text-white rounded-full text-[0.52rem] font-bold tracking-[0.18em] uppercase shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right Block: Simplified Configuration Hub */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="text-[0.58rem] font-bold tracking-[0.3em] uppercase text-text-light inline-block mb-2">
                {product.category} · {product.subcategory}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-plum-dark font-light leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price Line In Ghana Cedis */}
            <div className="py-4 border-y border-solid border-lilac/10 flex items-center justify-between">
              <div>
                <span className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-text-light block">Price</span>
                <span className="text-2xl md:text-3xl font-serif text-lavender font-bold mt-1 inline-block">
                  {product.originalPrice && (
                    <del className="text-text-light font-serif font-normal text-base mr-3.5 line-through">
                      {formatPrice(product.originalPrice)}
                    </del>
                  )}
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark mb-2.5">Product Details</h3>
              <p className="text-xs md:text-sm text-text-light leading-relaxed">
                {product.description || `${product.name} is handcrafted in Accra using authentic fabrics and tailored with precise stitching. Designed for celebrations and daily elegance.`}
              </p>
            </div>

            {/* Sizing Picker Option */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Select Gown Size</h3>
              </div>
              <div className="flex gap-2.5">
                {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-11 h-11 border text-xs font-bold tracking-widest rounded-[2px] transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white border-transparent shadow-md'
                        : 'bg-white text-plum-dark border-zinc-200 hover:border-lavender hover:text-lavender'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Regional Conversion Pill */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded border border-lilac/15 text-xs">
              <span className="text-[0.58rem] font-bold tracking-wider uppercase text-text-light">
                Standard Conversion:
              </span>
              <span className="font-mono text-xs font-bold text-mauve-deep">
                {isMen
                  ? `${activeMenRow.usSize} · ${activeMenRow.ukSize} · ${activeMenRow.euSize}`
                  : `${activeWomenRow.usSize} · ${activeWomenRow.ukSize} · ${activeWomenRow.euSize}`}
              </span>
            </div>

            {/* Pre-order Delivery Notice / Disclaimer */}
            <div className="text-[0.62rem] text-mauve-deep bg-lavender/10 px-3.5 py-2.5 rounded border border-lavender/20 font-medium flex items-center gap-2">
              <span>⏱️ Pre-order takes 3–7 working days for handcrafted bespoke tailoring.</span>
            </div>

            {/* Signature Actions */}
            <div className="flex flex-col gap-3 mt-2">
              {/* Place Order WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2px] font-bold text-[0.65rem] tracking-[0.2em] uppercase border-none cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-md text-center active:scale-[0.99]"
                id="btn-whatsapp-order"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600 border-none" />
                Place order via WhatsApp
              </a>

              <div className="flex gap-3 w-full">
                {/* Add to Bag */}
                <button
                  disabled={!product.inStock}
                  onClick={() => onAddToCart(product, selectedSize)}
                  className={`flex-1 py-4 text-[0.62rem] font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all border-none ${
                    product.inStock
                      ? 'bg-zinc-900 text-white hover:bg-black cursor-pointer active:scale-95 shadow-md'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                  </span>
                </button>

                {/* Wishlist Link Toggle */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`w-14 h-14 bg-white border border-solid rounded-[2px] cursor-pointer flex items-center justify-center transition-all shrink-0 ${
                    isWished ? 'border-mauve text-mauve bg-mauve/5' : 'border-zinc-200 text-plum hover:border-lavender hover:text-lavender'
                  }`}
                  title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWished ? 'fill-mauve' : ''}`} />
                </button>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
