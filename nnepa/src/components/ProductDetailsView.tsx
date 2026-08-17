/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Heart, ArrowLeft, Star, MessageSquare, Shield, Scissors, Compass, Ruler, X, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '../types.ts';

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
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Multi-dimensional fitting values corresponding to premium custom size matrices
  const measurementMatrix: Record<string, { chest: string; waist: string; shoulders: string; length: string }> = {
    S: { chest: '36"', waist: '30"', shoulders: '16.5"', length: '42"' },
    M: { chest: '38"', waist: '32"', shoulders: '17.5"', length: '43"' },
    L: { chest: '40"', waist: '34"', shoulders: '18.5"', length: '44"' },
    XL: { chest: '42"', waist: '36"', shoulders: '19.5"', length: '45"' },
    XXL: { chest: '44"', waist: '38"', shoulders: '20.5"', length: '46"' }
  };

  const activeMeasurements = measurementMatrix[selectedSize] || measurementMatrix['M'];

  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
  };

  // Pre-filled WhatsApp direct ordering API setup
  const messageText = `Hello Nnepa Foriwaa! I am interested in ordering your exquisite tailored piece:
• Product Name: ${product.name}
• Style Category: ${product.subcategory}
• Selected Fitting Size: ${selectedSize}
• Catalog Price: ${formatPrice(product.price)}
• Availability Status: ${product.inStock ? 'In Stock Ready' : 'Out of Stock (Commission Required)'}

Please advise on custom measurements configuration and delivery times.`;

  const encodedMessage = encodeURIComponent(messageText);

  // Direct order line link
  const whatsappUrl = `https://wa.me/233246811210?text=${encodedMessage}`;

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
          
          {/* Left Block: Image Showcase (Count = 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-[4px] overflow-hidden shadow-[0_4px_30px_rgba(92,61,110,0.04)] border border-lilac/10 relative group aspect-[3/4]">
              <img
                src={product.imageUrl}
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

            {/* Custom fit stamp */}
            <div className="bg-lavender/5 p-4 rounded-md border border-lilac/5 text-center flex items-center justify-center gap-3.5 select-none">
              <Compass className="w-4 h-4 text-lavender" />
              <span className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-mauve-deep">
                Accra Master Tailor Certified Piece
              </span>
            </div>
          </div>

          {/* Right Block: Configuration Control Hub (Count = 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="text-[0.58rem] font-bold tracking-[0.3em] uppercase text-text-light inline-block mb-2">
                Curated Collection · {product.category} · {product.subcategory}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-plum-dark font-light leading-snug">
                {product.name}
              </h1>

              {/* Star Rating Info */}
              <div className="flex gap-4 items-center mt-3">
                <div className="flex gap-[1.5px] text-mauve">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-mauve' : 'text-zinc-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-light font-medium">(24 reviews from Accra workshop)</span>
              </div>
            </div>

            {/* Price Line In Ghana Cedis */}
            <div className="py-4 border-y border-solid border-lilac/10 flex items-center justify-between">
              <div>
                <span className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-text-light block">Ghana Cedi Direct Price</span>
                <span className="text-2xl md:text-3xl font-serif text-lavender font-bold mt-1 inline-block">
                  {product.originalPrice && (
                    <del className="text-text-light font-serif font-normal text-base mr-3.5 line-through">
                      {formatPrice(product.originalPrice)}
                    </del>
                  )}
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Stock Tag */}
              <div className="text-right">
                <span className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-text-light block mb-1">Tailory Stock</span>
                <span
                  className={`px-3 py-1 rounded-full text-[0.55rem] font-extrabold tracking-[0.16em] uppercase border ${
                    product.inStock
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-400/20'
                      : 'bg-rose-50 text-rose-600 border-rose-400/20'
                  }`}
                >
                  {product.inStock ? 'In Stock Ready' : 'Out of Stock (Commission)'}
                </span>
              </div>
            </div>

            {/* Custom Narrative */}
            <div>
              <h3 className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark mb-2.5">Designer Narrative</h3>
              <p className="text-xs md:text-sm text-text-light leading-relaxed">
                {product.description || `${product.name} represents the absolute zenith of luxury West African tailoring. Sourced using fair-trade cotton grids directly in Ghanaian markets, this premium ${product.subcategory || 'boubou'} is detailed with micro-weave embroidery patterns. Form-fit structure ensures an elegant drape with excellent breathability.`}
              </p>
            </div>

            {/* Sizing Picker Option */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Select Gown/Suit Size</h3>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="flex items-center gap-1.5 text-[0.62rem] font-bold tracking-[0.15em] uppercase text-lavender hover:text-mauve-deep transition-colors cursor-pointer bg-lavender/10 hover:bg-lavender/20 px-2.5 py-1 rounded-[2px]"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide
                </button>
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

            {/* Custom Interactive Sizing Matrix */}
            <div className="bg-zinc-50 p-5 rounded-md border border-lilac/5 text-plum-dark">
              <h4 className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark mb-3 flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                <Scissors className="w-3.5 h-3.5 text-lavender" />
                Actual Tailored Dimensions (Size {selectedSize})
              </h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">Chest</span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">{activeMeasurements.chest}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">Waist</span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">{activeMeasurements.waist}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">Shoulder</span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">{activeMeasurements.shoulders}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">Length</span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">{activeMeasurements.length}</span>
                </div>
              </div>
              <p className="text-[0.55rem] text-text-light leading-normal select-none italic text-center mt-3.5">
                * Note: If standard coordinates do not fit, we make custom to-measure suits. WhatsApp custom sizes below.
              </p>
            </div>

            {/* Signature Actions Drawer */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              
              {/* WhatsApp Checkout Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2px] font-bold text-[0.62rem] tracking-[0.2em] uppercase border-none cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-md text-center max-w-full"
                id="btn-whatsapp-order"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600 border-none" />
                Place order via WhatsApp
              </a>

              {/* Add to Bag (Classic UI persistence) */}
              <button
                disabled={!product.inStock}
                onClick={() => onAddToCart(product, selectedSize)}
                className={`px-7 py-4 text-[0.62rem] font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all border-none ${
                  product.inStock
                    ? 'bg-zinc-900 text-white hover:bg-black cursor-pointer active:scale-95 shadow-md'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Local Cart Bag
                </span>
              </button>

              {/* Wishlist Link Toggle */}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`w-14 h-14 bg-white border border-solid rounded-[2px] cursor-pointer flex items-center justify-center transition-all ${
                  isWished ? 'border-mauve text-mauve bg-mauve/5' : 'border-zinc-200 text-plum hover:border-lavender hover:text-lavender'
                }`}
                title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-mauve' : ''}`} />
              </button>
            </div>

            {/* Authenticity guarantee guidelines footer block */}
            <div className="grid grid-cols-2 gap-4 border-t border-solid border-lilac/10 pt-6 text-plum-dark">
              <div className="flex gap-2.5 items-start">
                <Shield className="w-5 h-5 text-lavender shrink-0" />
                <div>
                  <h5 className="text-[0.6rem] font-bold tracking-[0.16em] uppercase">Ghana Fitting Guard</h5>
                  <p className="text-[0.620rem] text-text-light leading-normal mt-0.5">Complimentary alterations inside our Accra boutiques.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <Scissors className="w-5 h-5 text-lavender shrink-0" />
                <div>
                  <h5 className="text-[0.6rem] font-bold tracking-[0.16em] uppercase">Option standard</h5>
                  <p className="text-[0.620rem] text-text-light leading-normal mt-0.5">Custom fabric matching with no additional base pricing.</p>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </div>

      {/* ═══ SIZE GUIDE MODAL ═══ */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
              className="fixed inset-0 bg-plum-dark/75 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-pearl rounded-md shadow-2xl border border-lilac/20 p-6 sm:p-8 z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 p-2 text-text-light hover:text-plum-dark rounded-full hover:bg-black/5 transition-all cursor-pointer border-none"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2.5 mb-2">
                <Ruler className="w-5 h-5 text-lavender" />
                <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-mauve-deep">
                  Bespoke Sizing Protocol
                </span>
              </div>
              <h3 className="font-serif text-2xl text-plum-dark font-light mb-2">
                Garment Measurement Guide
              </h3>
              <p className="text-xs text-text-light leading-relaxed mb-6">
                Our luxury African garments are crafted according to precision tailored proportions. Compare your measurements against our standard metric guide below.
              </p>

              {/* Measurement Table */}
              <div className="overflow-x-auto mb-6 border border-solid border-lilac/15 rounded-[4px] bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-lavender/10 text-plum-dark border-b border-lilac/15 font-bold tracking-wider text-[0.65rem] uppercase">
                      <th className="p-3">Size</th>
                      <th className="p-3">Chest / Bust</th>
                      <th className="p-3">Waist</th>
                      <th className="p-3">Shoulders</th>
                      <th className="p-3">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lilac/10 font-mono text-[0.72rem] text-plum-dark">
                    {Object.entries(measurementMatrix).map(([sizeKey, m]) => (
                      <tr
                        key={sizeKey}
                        className={selectedSize === sizeKey ? 'bg-lavender/10 font-bold text-lavender' : 'hover:bg-zinc-50/50'}
                      >
                        <td className="p-3 font-sans font-bold">{sizeKey}</td>
                        <td className="p-3">{m.chest}</td>
                        <td className="p-3">{m.waist}</td>
                        <td className="p-3">{m.shoulders}</td>
                        <td className="p-3">{m.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Measuring tips card */}
              <div className="bg-lavender/5 p-4 rounded border border-lilac/10 flex gap-3 items-start">
                <Info className="w-4 h-4 text-lavender shrink-0 mt-0.5" />
                <div className="text-[0.68rem] text-text-light leading-relaxed">
                  <strong className="text-plum-dark block font-semibold mb-0.5">Custom Tailoring Available</strong>
                  Need precise custom measurements? Send us your chest, waist, and length measurements via WhatsApp for a tailored commission at no additional cost.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
